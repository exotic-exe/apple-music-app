import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Track } from '../types/music';
import { FEATURED_TRACKS } from '../services/appleMusicApi';
import {
  saveTrackOffline,
  removeTrackOffline,
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
  toggleFavorite: (track: Track) => void;
  downloadTrack: (track: Track) => Promise<void>;
  deleteDownloadedTrack: (trackId: string | number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(FEATURED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(FEATURED_TRACKS[0]?.duration || 157);
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

  // Audio Element & Stable State Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>(repeatMode);
  const queueRef = useRef<Track[]>(queue);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Keep refs synchronized
  repeatModeRef.current = repeatMode;
  queueRef.current = queue;
  currentTrackRef.current = currentTrack;
  isShuffleRef.current = isShuffle;
  isPlayingRef.current = isPlaying;

  // Forward declarations for player actions
  const nextTrackRef = useRef<() => void>(() => {});
  const prevTrackRef = useRef<() => void>(() => {});

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    } else if (!queueRef.current.some((t) => t.id === track.id)) {
      setQueue((prev) => [track, ...prev]);
    }

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setCurrentTime(0);
    setDuration(track.duration || 180);

    if (track.streamUrl) {
      audioRef.current.src = track.streamUrl;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback interrupted or requires interaction:', err);
          setIsPlaying(false);
        });
    } else {
      // If no preview stream, open am-dl sheet directly
      setIsPlaying(false);
      setTargetAmDlTrack(track);
      setIsAmDlModalOpen(true);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const q = queueRef.current;
    const cur = currentTrackRef.current;
    if (q.length === 0 || !cur) return;

    if (isShuffleRef.current) {
      const randomIndex = Math.floor(Math.random() * q.length);
      playTrack(q[randomIndex]);
      return;
    }

    const currentIndex = q.findIndex((t) => t.id === cur.id);
    if (currentIndex >= 0 && currentIndex < q.length - 1) {
      playTrack(q[currentIndex + 1]);
    } else if (repeatModeRef.current === 'all') {
      playTrack(q[0]);
    } else {
      setIsPlaying(false);
    }
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    const q = queueRef.current;
    const cur = currentTrackRef.current;
    if (!cur || q.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 4) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = q.findIndex((t) => t.id === cur.id);
    if (currentIndex > 0) {
      playTrack(q[currentIndex - 1]);
    } else {
      playTrack(q[q.length - 1]);
    }
  }, [playTrack]);

  nextTrackRef.current = nextTrack;
  prevTrackRef.current = prevTrack;

  // Initialize Audio ONCE on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    // Load initial favorites from storage
    getFavoriteTrackIds().then((ids) => setFavoriteTrackIds(ids));

    const updateTime = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrackRef.current();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.warn('Audio stream error event:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

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
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrackRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrackRef.current();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession setup warning:', e);
    }
  }, [currentTrack]);

  // Keep MediaSession Playback & Position State in Sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      if ('setPositionState' in navigator.mediaSession && duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 1),
          playbackRate: audioRef.current?.playbackRate || 1,
          position: Math.min(Math.max(currentTime, 0), duration),
        });
      }
    } catch {}
  }, [isPlaying, currentTime, duration]);

  // Android Native Hardware Back Button Handling
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (isLyricsOpen) {
        setIsLyricsOpen(false);
      } else if (isQualityModalOpen) {
        setIsQualityModalOpen(false);
      } else if (isAmDlModalOpen) {
        setIsAmDlModalOpen(false);
      } else if (isFullPlayerOpen) {
        setIsFullPlayerOpen(false);
      } else if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      backListener.then((sub) => sub.remove()).catch(() => {});
    };
  }, [isLyricsOpen, isQualityModalOpen, isAmDlModalOpen, isFullPlayerOpen]);

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
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

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
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

  const toggleFavorite = async (track: Track) => {
    await toggleFavoriteTrack(track);
    const updatedIds = await getFavoriteTrackIds();
    setFavoriteTrackIds(updatedIds);
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
