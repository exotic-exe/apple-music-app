import type { IncomingMessage, ServerResponse } from 'http';
import CryptoJS from 'crypto-js';

function decryptMediaUrl(encryptedUrl: string): string {
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
  } catch (err) {
    console.error('CryptoJS decryption error:', err);
    return '';
  }
}

function cleanQuery(str: string): string {
  return str
    .replace(/\s*\([^)]*\)/g, ' ') // remove (feat. ...), (From "Movie"), etc.
    .replace(/\s*\[[^\]]*\]/g, ' ') // remove [Explicit], [Remix], etc.
    .replace(/[^\w\s\u0900-\u097F]/gi, ' ') // preserve English and Devanagari characters
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJioSaavn(searchTerm: string) {
  const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(
    searchTerm
  )}`;

  const res = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const songs = data.songs?.data;
  if (!songs || songs.length === 0) return null;

  const topSong = songs[0];
  const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${topSong.id}`;

  const detailRes = await fetch(detailUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!detailRes.ok) return null;
  const detailData = await detailRes.json();
  const info = detailData[topSong.id];
  if (!info || !info.encrypted_media_url) return null;

  const rawUrl = decryptMediaUrl(info.encrypted_media_url);
  const streamUrl = rawUrl.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');

  return {
    success: true,
    title: info.song || topSong.title,
    artist: info.primary_artists || topSong.description,
    duration: parseInt(info.duration || '0', 10) || 180,
    streamUrl,
    artwork: (info.image || topSong.image || '').replace('150x150', '500x500'),
    quality: '320kbps AAC',
  };
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
    const qParam = url.searchParams.get('q') || '';
    const titleParam = url.searchParams.get('title') || '';
    const artistParam = url.searchParams.get('artist') || '';

    let query = qParam || `${titleParam} ${artistParam}`.trim();
    if (!query) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Query parameter q or title is required' }));
      return;
    }

    // 1. Try exact query
    let result = await fetchJioSaavn(query);

    // 2. If no result, try cleaned query
    if (!result) {
      const cleaned = cleanQuery(query);
      if (cleaned !== query) {
        result = await fetchJioSaavn(cleaned);
      }
    }

    // 3. If still no result and titleParam exists, try title only
    if (!result && titleParam) {
      result = await fetchJioSaavn(cleanQuery(titleParam));
    }

    if (result) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.end(JSON.stringify(result));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Track not found' }));
    }
  } catch (error: any) {
    console.error('API Resolve Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: error.message || 'Internal error' }));
  }
}
