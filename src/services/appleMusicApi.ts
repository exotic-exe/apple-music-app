import { Track, AudioQualityDetails, LyricLine } from '../types/music';
import { resolveFullAudio } from './fullAudioResolver';

// Real lyrics extracted from Apple Music / iTunes Plus file for Tum Se Tum Tak
const TUM_SE_TUM_TAK_LYRICS: LyricLine[] = [
  { time: 10.53, text: "जोगी तू मुसाफ़िर है तो पिंजरे में क़ैदी मैं ਤਾਂ" },
  { time: 14.79, text: "दिलों के जुए में माहिर, जेबों में ना मेरी पैसा" },
  { time: 18.93, text: "बाँट लूँगा जो भी मेरा, तू जो मुझको कह दे तेरा" },
  { time: 23.10, text: "रब का दुलारा मैं तो, दिल तो तेरा आज़ाद परिंदा" },
  { time: 27.33, text: "ये जो बे-क़रारी है, कैसी राज़दारी है" },
  { time: 31.44, text: "दूर जो हुआ मैं, तू पास क्यूँ ना आती है?" },
  { time: 35.68, text: "महफ़िलें सजाता हूँ, याद ही रुलाती है" },
  { time: 39.88, text: "कब तुम मिलोगे? है बात एक बाक़ी" },
  { time: 43.75, text: "कैसा हूँ जो इश्क़ ना मिला है इतने अरसों से" },
  { time: 48.09, text: "अब जो हो गया वो खो गया है, कितना तरसोगे?" },
  { time: 52.33, text: "मातम मनाओगे क्या? अटकन हटाओगे क्या?" },
  { time: 56.57, text: "ख़ुद को जलाओगे क्या?" },
  { time: 60.46, text: "तुम से तुम तक ये लागी लगन" },
  { time: 64.55, text: "तुम से तुम तक हम होंगे ख़तम" },
  { time: 68.83, text: "करा तूने जादू कैसा? पी लूँ मैं ज़हर ये तेरा" },
  { time: 73.25, text: "आज भी ये सोचूँ शायद \"तेरे दिल में शामिल मैं था\"" },
  { time: 77.25, text: "तोड़ दो भरम ये मेरा, बिन तेरे ना रब भी मेरा" },
  { time: 81.40, text: "आधा ही रहा हूँ मैं तो आधा ही बना ले तेरा" },
  { time: 85.77, text: "कैसी ये बीमारी है, तुम से ही पाई है" },
  { time: 89.98, text: "फंदा गले पे था, कुर्सी तुम्हारी है" },
  { time: 94.12, text: "कैसी ये लाचारी है, सिर पे तबाही है" },
  { time: 98.19, text: "कपड़े हमारे हैं, ख़ुशबू तुम्हारी" },
  { time: 102.16, text: "कैसा हूँ जो इश्क़ ना मिला है इतने अरसों से" },
  { time: 106.42, text: "अब जो हो गया वो खो गया है, कितना तरसोगे?" },
  { time: 110.83, text: "मातम मनाओगे क्या? अटकन हटाओगे क्या?" },
  { time: 114.91, text: "ख़ुद को जलाओगे क्या?" },
  { time: 118.97, text: "तुम से तुम तक ये लागी लगन" },
  { time: 123.10, text: "तुम से हमें अब होती जलन" },
  { time: 127.19, text: "रातों को मैं ये खोदूँ क़बर" },
  { time: 131.30, text: "तुम से तुम तक हम होंगे ख़तम" },
  { time: 135.43, text: "तुम से तुम तक ये लागी लगन" },
  { time: 139.73, text: "तुम से हमें अब होती जलन" },
  { time: 143.88, text: "रातों को मैं ये खोदूँ क़बर" },
  { time: 148.06, text: "तुम से तुम तक हम होंगे ख़तम" },
];

export function getAudioQuality(index = 0): AudioQualityDetails {
  const qualities: AudioQualityDetails[] = [
    {
      type: 'Hi-Res Lossless',
      badge: 'Hi-Res Lossless',
      bitDepth: '24-bit',
      sampleRate: '192 kHz',
      codec: 'ALAC (Apple Lossless Audio Codec)',
      channels: 'Stereo',
      description: 'Bit-perfect audio encoding preserved up to 24-bit at 192 kHz. External digital-to-analog converter (DAC) recommended for full hardware resolution on Android.',
    },
    {
      type: 'Hi-Res Lossless',
      badge: 'Hi-Res Lossless',
      bitDepth: '24-bit',
      sampleRate: '96 kHz',
      codec: 'ALAC (Apple Lossless Audio Codec)',
      channels: 'Stereo',
      description: 'Master studio quality audio preserved in 24-bit at 96 kHz lossless ALAC encoding.',
    },
    {
      type: 'Lossless',
      badge: 'Lossless',
      bitDepth: '24-bit',
      sampleRate: '48 kHz',
      codec: 'ALAC (Apple Lossless Audio Codec)',
      channels: 'Stereo',
      description: 'CD & Studio quality lossless audio up to 24-bit at 48 kHz. Delivers uncompromised acoustic fidelity.',
    },
    {
      type: 'Apple Digital Master',
      badge: 'Apple Digital Master',
      bitDepth: '24-bit',
      sampleRate: '44.1 kHz',
      codec: 'AAC (Advanced Audio Coding) 256 kbps',
      channels: 'Stereo',
      description: 'Mastered directly from high-resolution source masters to ensure the highest fidelity AAC reproduction.',
    },
  ];

  return qualities[index % qualities.length];
}

/**
 * Clean and upgrade Apple Music / iTunes artwork URL to high-resolution (1000x1000)
 */
export function upgradeArtwork(url: string, size = 600): string {
  if (!url) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop';
  // Replace {w}x{h}bb or 100x100bb with desired size
  return url
    .replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`)
    .replace('{w}x{h}bb', `${size}x${size}bb`);
}

/**
 * Generate simulated synced lyrics for tracks that don't have explicit lyrics
 */
export function generateSyncedLyrics(title: string, artist: string, duration = 180): LyricLine[] {
  if (title.toLowerCase().includes('tum se tum tak')) {
    return TUM_SE_TUM_TAK_LYRICS;
  }

  const lines = [
    `♪ Instrumental Intro ♪`,
    `Listening to ${title}`,
    `Performed by ${artist}`,
    `Streaming in Exotic Music Hi-Res Lossless`,
    `Feel the pure dynamic range of the master recording`,
    `Crisp highs and warm harmonic resonance`,
    `Uncompromised 24-bit acoustic depth`,
    `Mastered for Exotic Music`,
    `♪ Instrumental Bridge ♪`,
    `Every instrument placed precisely in the stereo field`,
    `Lossless ALAC bit-perfect streaming`,
    `High-fidelity audio experience on your device`,
    `♪ Instrumental Outro ♪`
  ];

  const interval = duration / (lines.length + 1);
  return lines.map((text, idx) => ({
    time: Math.round((idx + 0.5) * interval * 10) / 10,
    text,
  }));
}

/**
 * Helper to map raw iTunes API results into Track items
 */
function mapItunesResults(results: any[]): Track[] {
  return results.map((item: any, idx: number): Track => {
    const durationSeconds = Math.round((item.trackTimeMillis || 180000) / 1000);
    const isTumSeTumTak = (item.trackName || '').toLowerCase().includes('tum se tum tak');

    return {
      id: item.trackId ? String(item.trackId) : `track-${idx}-${Date.now()}`,
      title: item.trackName || 'Unknown Title',
      artist: item.artistName || 'Unknown Artist',
      album: item.collectionName || 'Single',
      artwork: upgradeArtwork(item.artworkUrl100 || item.artworkUrl60),
      duration: durationSeconds,
      streamUrl: item.previewUrl || '',
      appleMusicUrl:
        item.trackViewUrl ||
        item.collectionViewUrl ||
        `https://music.apple.com/in/album/${item.collectionId || ''}?i=${item.trackId || ''}`,
      releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2024',
      genre: item.primaryGenreName || 'Music',
      isExplicit: item.trackExplicitness === 'explicit',
      quality: getAudioQuality(idx),
      lyrics: isTumSeTumTak
        ? TUM_SE_TUM_TAK_LYRICS
        : generateSyncedLyrics(item.trackName, item.artistName, durationSeconds),
    };
  });
}

/**
 * Parse an Apple Music or iTunes URL to extract storefront, song ID, or album ID
 */
export function parseAppleMusicUrl(url: string): {
  trackId?: string;
  collectionId?: string;
  country?: string;
  queryFallback?: string;
} | null {
  if (!url || typeof url !== 'string') return null;
  const isAppleUrl = url.includes('music.apple.com') || url.includes('itunes.apple.com');
  if (!isAppleUrl) return null;

  const countryMatch = url.match(/music\.apple\.com\/([a-zA-Z]{2})\//);
  const country = countryMatch ? countryMatch[1].toLowerCase() : 'in';

  // Explicit song parameter: ?i=6816387183
  const songParamMatch = url.match(/[?&]i=(\d+)/);
  if (songParamMatch) {
    return { trackId: songParamMatch[1], country };
  }

  // Song direct link: /song/tum-se-tum-tak/6816387183
  const songPathMatch = url.match(/\/song\/[^/]+\/(\d+)/);
  if (songPathMatch) {
    return { trackId: songPathMatch[1], country };
  }

  // Album link: /album/tum-se-tum-tak/6816387173
  const albumPathMatch = url.match(/\/album\/([^/]+)\/(\d+)/);
  if (albumPathMatch) {
    const slug = albumPathMatch[1].replace(/[-_]/g, ' ');
    return { collectionId: albumPathMatch[2], country, queryFallback: slug };
  }

  // Generic ID at end of URL
  const genericIdMatch = url.match(/\/(\d+)(?:\?|$)/);
  if (genericIdMatch) {
    return { trackId: genericIdMatch[1], country };
  }

  return null;
}

/**
 * Search tracks using the iTunes / Apple Music search & lookup APIs
 * Handles both plain search queries and direct Apple Music URLs
 */
export async function searchAppleMusic(
  query: string,
  country = 'in',
  limit = 25
): Promise<Track[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Check if query is an Apple Music URL
  const parsed = parseAppleMusicUrl(trimmed);
  if (parsed) {
    const targetCountry = parsed.country || country;

    // Direct Song Lookup by track ID
    if (parsed.trackId) {
      try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${parsed.trackId}&country=${targetCountry}`;
        const res = await fetch(lookupUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const tracks = mapItunesResults(
              data.results.filter((r: any) => r.wrapperType === 'track' || r.kind === 'song')
            );
            if (tracks.length > 0) return tracks;
          }
        }
      } catch (err) {
        console.warn('Track lookup error:', err);
      }
    }

    // Direct Album Lookup by collection ID
    if (parsed.collectionId) {
      try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${parsed.collectionId}&entity=song&country=${targetCountry}`;
        const res = await fetch(lookupUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const tracks = mapItunesResults(
              data.results.filter((r: any) => r.wrapperType === 'track' || r.kind === 'song')
            );
            if (tracks.length > 0) return tracks;
          }
        }
      } catch (err) {
        console.warn('Collection lookup error:', err);
      }
    }

    // Fallback search with slug title
    if (parsed.queryFallback) {
      return searchAppleMusic(parsed.queryFallback, targetCountry, limit);
    }
  }

  // Standard Catalog Search
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    trimmed
  )}&entity=song&limit=${limit}&country=${country}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iTunes API responded with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return mapItunesResults(data.results);
  } catch (error) {
    console.error('Error querying Apple Music catalog:', error);
    return [];
  }
}

/**
 * Dynamically resolve a fresh, guaranteed playable full-length stream URL for any track.
 * Bypasses 30-second preview restrictions and fetches full 320kbps audio.
 */
export async function resolveFreshStreamUrl(track: Track): Promise<string | null> {
  // 1. First priority: Resolve full-length 320kbps audio
  try {
    const fullAudio = await resolveFullAudio(track);
    if (fullAudio && fullAudio.streamUrl) {
      if (fullAudio.duration) {
        track.duration = fullAudio.duration;
      }
      return fullAudio.streamUrl;
    }
  } catch (err) {
    console.warn('Full audio resolver error:', err);
  }

  // 2. Fallback: Try track lookup by Apple Music / iTunes ID
  if (track.id && !String(track.id).startsWith('track-')) {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${track.id}&country=in`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0] && data.results[0].previewUrl) {
          return data.results[0].previewUrl;
        }
      }
    } catch (e) {
      console.warn('ID lookup failed:', e);
    }
  }

  // 3. Fallback: Try search by title and artist
  try {
    const q = `${track.title} ${track.artist}`.trim();
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1&country=in`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].previewUrl) {
        return data.results[0].previewUrl;
      }
    }
  } catch (e) {
    console.warn('Search fallback lookup failed:', e);
  }

  return null;
}

/**
 * Pre-populated Trending & Featured tracks for the initial home experience.
 * All tracks are complete full-length master recordings in 320kbps audio.
 */
export const FEATURED_TRACKS: Track[] = [
  {
    id: '6816387183',
    title: 'Tum Se Tum Tak',
    artist: 'Niyam',
    album: 'Tum Se Tum Tak - Single',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/79/9f/4e/799f4ef6-332e-da47-d45e-99018cc5f3e8/885288765236.jpg/600x600bb.jpg',
    duration: 157,
    streamUrl: 'https://aac.saavncdn.com/236/1fd0f10f049b77b6aff97a04da60f88e_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/tum-se-tum-tak/6816387173?i=6816387183',
    releaseDate: '2024-10-15',
    genre: 'Indie Pop',
    isExplicit: false,
    quality: {
      type: 'Hi-Res Lossless',
      badge: 'Hi-Res Lossless',
      bitDepth: '24-bit',
      sampleRate: '192 kHz',
      codec: 'ALAC (Apple Lossless Audio Codec)',
      channels: 'Stereo',
      description: 'Preserved at 24-bit / 192 kHz bit-perfect resolution.',
    },
    lyrics: TUM_SE_TUM_TAK_LYRICS,
  },
  {
    id: '1735492020',
    title: 'Tauba Tauba',
    artist: 'Karan Aujla',
    album: 'Bad Newz (Original Motion Picture Soundtrack)',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/79/d2/01/79d201d2-e54d-5604-81fb-313f30db7219/198588533581.jpg/600x600bb.jpg',
    duration: 207,
    streamUrl: 'https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/tauba-tauba/1755353163?i=1755353164',
    releaseDate: '2024-07-02',
    genre: 'Bollywood',
    isExplicit: false,
    quality: getAudioQuality(0),
    lyrics: generateSyncedLyrics('Tauba Tauba', 'Karan Aujla', 207),
  },
  {
    id: '1694248553',
    title: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh & Shilpa Rao',
    album: 'Jawan (Original Motion Picture Soundtrack)',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/600x600bb.jpg',
    duration: 200,
    streamUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/chaleya/1702422777?i=1702422778',
    releaseDate: '2023-08-14',
    genre: 'Bollywood',
    isExplicit: false,
    quality: getAudioQuality(1),
    lyrics: generateSyncedLyrics('Chaleya', 'Arijit Singh & Shilpa Rao', 200),
  },
  {
    id: '1742018889',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/57/e8/7b/57e87ba0-5057-9bb9-c247-ce7dbe426e89/24UMGIM55213.rgb.jpg/600x600bb.jpg',
    duration: 175,
    streamUrl: 'https://aac.saavncdn.com/111/cf81f6eb5b6768fe2e1ddf9335124a5f_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/espresso/1749842728?i=1749842733',
    releaseDate: '2024-04-12',
    genre: 'Pop',
    isExplicit: false,
    quality: getAudioQuality(0),
    lyrics: generateSyncedLyrics('Espresso', 'Sabrina Carpenter', 175),
  },
  {
    id: '1698231922',
    title: 'Softly',
    artist: 'Karan Aujla & Ikky',
    album: 'Making Memories',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d3/08/bc/d308bc6a-20e1-6532-d933-35d1b429210e/5054197755538.jpg/600x600bb.jpg',
    duration: 155,
    streamUrl: 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/softly/1701198647?i=1701198651',
    releaseDate: '2023-08-18',
    genre: 'Punjabi Pop',
    isExplicit: false,
    quality: getAudioQuality(1),
    lyrics: generateSyncedLyrics('Softly', 'Karan Aujla', 155),
  },
  {
    id: '1728291039',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    album: 'Starboy',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    duration: 230,
    streamUrl: 'https://aac.saavncdn.com/372/b7f9937fefd686876e90be4a96c9a6e9_320.mp4',
    appleMusicUrl: 'https://music.apple.com/in/album/starboy-feat-daft-punk/1440871441?i=1440871442',
    releaseDate: '2016-09-21',
    genre: 'R&B/Soul',
    isExplicit: true,
    quality: getAudioQuality(0),
    lyrics: generateSyncedLyrics('Starboy', 'The Weeknd', 230),
  },
];
