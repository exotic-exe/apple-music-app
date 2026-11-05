import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, AudioQualityDetails } from '../types/music';
import { FEATURED_TRACKS } from '../services/appleMusicApi';
import {
  saveTrackOffline,
  removeTrackOffline,
  isTrackDownloaded,
  getFavoriteTrackIds,
  toggleFavoriteTrack,
} from '../services/storageService';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isFullPlayerOpen: boolean;
  isLyricsOpen: boolean;
  isQualityModalOpen: boolean;
  isAmDlModalOpen: boolean;
  targetAmDlTrack: Track | null;
  favoriteTrackIds: (string | number)[];
  downloadedTrackIds: Set<string | number>;
  
  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleLyrics: () => void;
  openQualityModal: () => void;
  closeQualityModal: () => void;
  openAmDlModal: (track?: Track) => void;
  closeAmDlModal: () => void;
  toggleFavorite: (trackId: string | number) => void;
  downloadTrack: (track: Track) => Promise<void>;
  deleteDownloadedTrack: (trackId: string | number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(FEATURED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(FEATURED_TRACKS[0]?.duration || 180);
  const [volume, setVolumeState] = useState<number>(1);
  const [queue, setQueue] = useState<Track[]>(FEATURED_TRACKS);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  
  // UI Sheets & Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState<boolean>(false);
  const [isAmDlModalOpen, setIsAmDlModalOpen] = useState<boolean>(false);
  const [targetAmDlTrack, setTargetAmDlTrack] = useState<Track | null>(null);

  // Persistence State
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<(string | number)[]>([]);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string | number>>(new Set());

  // Hidden Audio Element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    // Load favorites from local storage
    setFavoriteTrackIds(getFavoriteTrackIds());

    const updateTime = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [repeatMode]);

  // Update MediaSession API for Native Android Lock Screen & Notification Controls
  useEffect(() => {
    if (!currentTrack || typeof window === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: currentTrack.artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession setup warning:', e);
    }
  }, [currentTrack]);

  // Handle Play Track
  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [track, ...prev]);
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 180);

    if (track.streamUrl) {
      audioRef.current.src = track.streamUrl;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Autoplay prevented or stream error:', err);
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src && currentTrack.streamUrl) {
        audioRef.current.src = currentTrack.streamUrl;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Play error:', e));
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playTrack(queue[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (currentTime > 4 && audioRef.current) {
      // If played more than 4 seconds, restart current track
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, val));
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const openFullPlayer = () => setIsFullPlayerOpen(true);
  const closeFullPlayer = () => setIsFullPlayerOpen(false);
  const toggleLyrics = () => setIsLyricsOpen((prev) => !prev);
  const openQualityModal = () => setIsQualityModalOpen(true);
  const closeQualityModal = () => setIsQualityModalOpen(false);

  const openAmDlModal = (track?: Track) => {
    setTargetAmDlTrack(track || currentTrack);
    setIsAmDlModalOpen(true);
  };
  const closeAmDlModal = () => {
    setIsAmDlModalOpen(false);
    setTargetAmDlTrack(null);
  };

  const toggleFavorite = (trackId: string | number) => {
    toggleFavoriteTrack(trackId);
    setFavoriteTrackIds(getFavoriteTrackIds());
  };

  const downloadTrack = async (track: Track) => {
    try {
      await saveTrackOffline(track);
      setDownloadedTrackIds((prev) => new Set(prev).add(track.id));
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const deleteDownloadedTrack = async (trackId: string | number) => {
    try {
      await removeTrackOffline(trackId);
      setDownloadedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
    } catch (err) {
      console.error('Delete offline track error:', err);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        isShuffle,
        repeatMode,
        isFullPlayerOpen,
        isLyricsOpen,
        isQualityModalOpen,
        isAmDlModalOpen,
        targetAmDlTrack,
        favoriteTrackIds,
        downloadedTrackIds,
        playTrack,
        togglePlayPause,
        seek,
        nextTrack,
        prevTrack,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        openFullPlayer,
        closeFullPlayer,
        toggleLyrics,
        openQualityModal,
        closeQualityModal,
        openAmDlModal,
        closeAmDlModal,
        toggleFavorite,
        downloadTrack,
        deleteDownloadedTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
