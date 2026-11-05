export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export type AudioQualityType = 
  | 'Hi-Res Lossless' 
  | 'Lossless' 
  | 'Apple Digital Master' 
  | 'Spatial Audio';

export interface AudioQualityDetails {
  type: AudioQualityType;
  badge: string;
  bitDepth: string; // e.g. '24-bit'
  sampleRate: string; // e.g. '192 kHz' or '96 kHz' or '48 kHz'
  codec: string; // 'ALAC (Apple Lossless Audio Codec)'
  channels: string; // 'Stereo'
  description: string;
}

export interface Track {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  artwork: string; // high-resolution url
  duration: number; // seconds
  streamUrl: string; // audio playback url
  appleMusicUrl: string; // authentic music.apple.com link
  releaseDate?: string;
  genre?: string;
  isExplicit?: boolean;
  quality: AudioQualityDetails;
  lyrics?: LyricLine[];
  isDownloaded?: boolean;
  downloadDate?: number;
}

export interface Playlist {
  id: string;
  title: string;
  curator: string;
  description: string;
  artwork: string;
  trackCount: number;
  tracks: Track[];
}

export type NavigationTab = 'listen-now' | 'browse' | 'search' | 'library';
