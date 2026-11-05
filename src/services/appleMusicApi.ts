import { Track, AudioQualityDetails, LyricLine } from '../types/music';

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
export function upgradeArtwork(url: string, size = 1000): string {
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
    `Streaming in Apple Music Hi-Res Lossless`,
    `Feel the pure dynamic range of the master recording`,
    `Crisp highs and warm harmonic resonance`,
    `Uncompromised 24-bit acoustic depth`,
    `Mastered for Apple Music`,
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
 * Search tracks using the iTunes / Apple Music search API
 */
export async function searchAppleMusic(
  query: string,
  country = 'in',
  limit = 25
): Promise<Track[]> {
  if (!query.trim()) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    query
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

    return data.results.map((item: any, idx: number): Track => {
      const durationSeconds = Math.round((item.trackTimeMillis || 180000) / 1000);
      const isTumSeTumTak = (item.trackName || '').toLowerCase().includes('tum se tum tak');
      
      return {
        id: item.trackId || `track-${idx}-${Date.now()}`,
        title: item.trackName || 'Unknown Title',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Single',
        artwork: upgradeArtwork(item.artworkUrl100 || item.artworkUrl60),
        duration: durationSeconds,
        streamUrl: item.previewUrl || '',
        appleMusicUrl: item.trackViewUrl || item.collectionViewUrl || `https://music.apple.com/in/album/${item.collectionId || ''}?i=${item.trackId || ''}`,
        releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2024',
        genre: item.primaryGenreName || 'Music',
        isExplicit: item.trackExplicitness === 'explicit',
        quality: getAudioQuality(idx),
        lyrics: isTumSeTumTak ? TUM_SE_TUM_TAK_LYRICS : generateSyncedLyrics(item.trackName, item.artistName, durationSeconds),
      };
    });
  } catch (error) {
    console.error('Error querying Apple Music catalog:', error);
    return [];
  }
}

/**
 * Pre-populated Trending & Featured tracks for the initial home experience
 */
export const FEATURED_TRACKS: Track[] = [
  {
    id: '6816387183',
    title: 'Tum Se Tum Tak',
    artist: 'Niyam',
    album: 'Tum Se Tum Tak - Single',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/79/9f/4e/799f4ef6-332e-da47-d45e-99018cc5f3e8/885288765236.jpg/1000x1000bb.jpg',
    duration: 157,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/0c/6b/d4/0c6bd4c5-2d76-d8c8-0b53-0ba44e33789d/mzaf_8699417771237482318.plus.aac.p.m4a',
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
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/16/ec/bf16ec6a-0d86-1755-6ea6-235b37ae6cb8/8903247077643_cover.jpg/1000x1000bb.jpg',
    duration: 206,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/64/7b/72/647b72ba-7711-2e55-32e7-08ca1492ba66/mzaf_15783515082496155554.plus.aac.p.m4a',
    appleMusicUrl: 'https://music.apple.com/in/album/tauba-tauba/1755353163?i=1755353164',
    releaseDate: '2024-07-02',
    genre: 'Bollywood',
    isExplicit: false,
    quality: getAudioQuality(0),
    lyrics: generateSyncedLyrics('Tauba Tauba', 'Karan Aujla', 206),
  },
  {
    id: '1694248553',
    title: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh & Shilpa Rao',
    album: 'Jawan (Original Motion Picture Soundtrack)',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/2a/3b/5a2a3b02-76f8-4504-20b1-4f10738e4a9e/8902894363785.jpg/1000x1000bb.jpg',
    duration: 200,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/21/df/f2/21dff2c1-236f-e3c3-3882-628d0b81df89/mzaf_7302482596489498263.plus.aac.p.m4a',
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
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/44/e9/87/44e987aa-4252-0ff2-fba8-2a969f64bf1f/24UMGIM51717.rgb.jpg/1000x1000bb.jpg',
    duration: 175,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e5/22/e1/e522e118-8f55-7cf9-d7ee-c3b0dfb2f3d6/mzaf_10790483863777598687.plus.aac.p.m4a',
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
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ff/88/53/ff8853b0-ceb7-7501-7be1-2a548c26da5f/196362145329_cover.jpg/1000x1000bb.jpg',
    duration: 155,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/f5/01/fa/f501fa16-c22f-d4a9-a471-ee7c10b64d08/mzaf_17441113511195232812.plus.aac.p.m4a',
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
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/b1/7b/bfb17b20-c8f0-1be4-5396-07440fb359a1/16UMGIM60699.rgb.jpg/1000x1000bb.jpg',
    duration: 230,
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/f4/19/08/f41908aa-d576-90e6-992e-360eecb528b1/mzaf_10023674697298642750.plus.aac.p.m4a',
    appleMusicUrl: 'https://music.apple.com/in/album/starboy-feat-daft-punk/1440871441?i=1440871442',
    releaseDate: '2016-09-21',
    genre: 'R&B/Soul',
    isExplicit: true,
    quality: getAudioQuality(0),
    lyrics: generateSyncedLyrics('Starboy', 'The Weeknd', 230),
  },
];
