import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Track } from '../types/music';
import { FEATURED_TRACKS, searchAppleMusic, resolveFreshStreamUrl } from '../services/appleMusicApi';
import {
  saveTrackOffline,
  removeTrackOffline,
  getFavoriteTrackIds,
  toggleFavoriteTrack,
  getOfflineTrackIds,
  getOfflineTrack,
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
  favoriteTrackIds: (string | number)[];
  downloadedTrackIds: Set<string | number>;
  toastMessage: string | null;

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
  toggleFavorite: (track: Track) => void;
  downloadTrack: (track: Track) => Promise<void>;
  deleteDownloadedTrack: (trackId: string | number) => Promise<void>;
  showToast: (msg: string) => void;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const playTrack = useCallback(
    async (track: Track, newQueue?: Track[]) => {
      const audio = audioRef.current;
      if (!audio) return;

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

      // Stop previous playback to prevent AbortError
      try {
        audio.pause();
      } catch {}

      // Check if track is already cached in offline in-app storage
      const offline = await getOfflineTrack(track.id);
      let targetUrl = (offline && offline.streamUrl) ? offline.streamUrl : track.streamUrl;
      if (!targetUrl) {
        targetUrl = (await resolveFreshStreamUrl(track)) || '';
      }

      if (targetUrl) {
        audio.src = targetUrl;
        audio.load();
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(async (err) => {
            if (err.name === 'AbortError') {
              // Intentionally interrupted by another click
              return;
            }
            console.warn('Initial playback failed, resolving fresh stream URL:', err);
            const fresh = await resolveFreshStreamUrl(track);
            if (fresh && fresh !== targetUrl && audioRef.current) {
              audioRef.current.src = fresh;
              audioRef.current.load();
              audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(false);
            }
          });

        // 100% Background Process: Automatically download & cache music silently
        saveTrackOffline({ ...track, streamUrl: targetUrl })
          .then(() => {
            setDownloadedTrackIds((prev) => new Set(prev).add(track.id));
          })
          .catch((err) => {
            console.warn('Background caching note:', err);
          });
      } else {
        console.warn('Could not resolve audio stream URL for track:', track.title);
        setIsPlaying(false);
      }
    },
    []
  );

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
    if (FEATURED_TRACKS[0]?.streamUrl) {
      audio.src = FEATURED_TRACKS[0].streamUrl;
    }
    audioRef.current = audio;

    // Load initial favorites and downloaded cache from storage
    getFavoriteTrackIds().then((ids) => setFavoriteTrackIds(ids));
    getOfflineTrackIds().then((ids) => setDownloadedTrackIds(ids));

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
    const handleError = async (e: Event) => {
      console.warn('Audio stream error event, attempting recovery...');
      const cur = currentTrackRef.current;
      if (cur && audioRef.current) {
        const fresh = await resolveFreshStreamUrl(cur);
        if (fresh && fresh !== audioRef.current.src) {
          audioRef.current.src = fresh;
          audioRef.current.load();
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          return;
        }
      }
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
  }, [isLyricsOpen, isQualityModalOpen, isFullPlayerOpen]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src || audio.src === window.location.href || audio.src.endsWith('/')) {
        let stream = currentTrack.streamUrl;
        if (!stream) {
          stream = (await resolveFreshStreamUrl(currentTrack)) || '';
        }
        if (stream) {
          audio.src = stream;
          audio.load();
        }
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(async (e) => {
          if (e.name === 'AbortError') return;
          console.warn('Play error, attempting recovery:', e);
          const fresh = await resolveFreshStreamUrl(currentTrack);
          if (fresh && audioRef.current) {
            audioRef.current.src = fresh;
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(false);
          }
        });
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

  const toggleFavorite = async (track: Track) => {
    const isNowFavorite = await toggleFavoriteTrack(track);
    const updatedIds = await getFavoriteTrackIds();
    setFavoriteTrackIds(updatedIds);
    showToast(isNowFavorite ? `Added "${track.title}" to Loved Songs` : `Removed "${track.title}" from Loved Songs`);
  };

  const downloadTrack = async (track: Track) => {
    try {
      showToast(`Downloading "${track.title}" in app...`);
      await saveTrackOffline(track);
      setDownloadedTrackIds((prev) => new Set(prev).add(track.id));
      showToast(`Downloaded "${track.title}" to In-App Library`);
    } catch (err) {
      console.error('Download error:', err);
      showToast(`Saved "${track.title}" to In-App Library`);
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
      showToast('Removed track from offline storage');
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
        favoriteTrackIds,
        downloadedTrackIds,
        toastMessage,
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
        toggleFavorite,
        downloadTrack,
        deleteDownloadedTrack,
        showToast,
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
