import { Capacitor, CapacitorHttp } from '@capacitor/core';
import CryptoJS from 'crypto-js';

export interface ResolvedAudio {
  streamUrl: string;
  duration: number;
  artwork?: string;
  quality: string;
}

const RESOLVER_CACHE = new Map<string, ResolvedAudio>();

function getCacheKey(title: string, artist: string): string {
  return `${title.toLowerCase().trim()}:::${artist.toLowerCase().trim()}`;
}

function cleanString(str: string): string {
  return (str || '')
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/\s*\[[^\]]*\]/g, ' ')
    .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decryptJioSaavnUrl(encryptedUrl: string): string {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      {
        ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
      } as any,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.warn('CryptoJS DES decryption failed:', e);
    return '';
  }
}

/**
 * Native Capacitor direct JioSaavn lookup (runs on Android without browser CORS)
 */
async function resolveViaCapacitorHttp(query: string): Promise<ResolvedAudio | null> {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(
      query
    )}`;

    const res = await CapacitorHttp.get({
      url: searchUrl,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
      },
    });

    if (res.status !== 200 || !res.data) return null;
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    const songs = data.songs?.data;
    if (!songs || songs.length === 0) return null;

    const topSong = songs[0];
    const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${topSong.id}`;

    const detailRes = await CapacitorHttp.get({
      url: detailUrl,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
      },
    });

    if (detailRes.status !== 200 || !detailRes.data) return null;
    const detailData =
      typeof detailRes.data === 'string' ? JSON.parse(detailRes.data) : detailRes.data;
    const info = detailData[topSong.id];
    if (!info || !info.encrypted_media_url) return null;

    const rawUrl = decryptJioSaavnUrl(info.encrypted_media_url);
    if (!rawUrl) return null;

    const streamUrl = rawUrl.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');
    const duration = parseInt(info.duration || '0', 10) || 180;

    return {
      streamUrl,
      duration,
      artwork: (info.image || topSong.image || '').replace('150x150', '500x500'),
      quality: '320kbps AAC Full Track',
    };
  } catch (err) {
    console.warn('CapacitorHttp resolve error:', err);
    return null;
  }
}

/**
 * Universal Audio Stream Resolver:
 * Resolves full-length 320kbps audio files for any track, completely bypassing 30s preview restrictions.
 */
export async function resolveFullAudio(track: {
  title: string;
  artist: string;
  duration?: number;
}): Promise<ResolvedAudio | null> {
  const { title, artist } = track;
  if (!title) return null;

  const cacheKey = getCacheKey(title, artist);
  if (RESOLVER_CACHE.has(cacheKey)) {
    return RESOLVER_CACHE.get(cacheKey)!;
  }

  const query = `${cleanString(title)} ${cleanString(artist)}`.trim();
  const searchEndpoints = [
    // 1. Relative endpoint (works on localhost dev/preview & Vercel deployment)
    `/api/resolve?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
    // 2. Direct production Vercel endpoint (works on native Android APK or external clients)
    `https://exotic-music.vercel.app/api/resolve?title=${encodeURIComponent(
      title
    )}&artist=${encodeURIComponent(artist)}`,
    // 3. Fallback query with q
    `https://exotic-music.vercel.app/api/resolve?q=${encodeURIComponent(query)}`,
  ];

  // If running natively on Android, attempt CapacitorHttp first for blazing direct resolution
  if (Capacitor.isNativePlatform()) {
    const nativeResult = await resolveViaCapacitorHttp(query);
    if (nativeResult) {
      RESOLVER_CACHE.set(cacheKey, nativeResult);
      return nativeResult;
    }
  }

  // Next, try API endpoints
  for (const endpoint of searchEndpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streamUrl) {
          const resolved: ResolvedAudio = {
            streamUrl: data.streamUrl,
            duration: data.duration || track.duration || 180,
            artwork: data.artwork,
            quality: data.quality || '320kbps AAC Full Track',
          };
          RESOLVER_CACHE.set(cacheKey, resolved);
          return resolved;
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  return null;
}
