import { Track } from '../types/music';

const DB_NAME = 'ExoticMusicDB';
const DB_VERSION = 2;
const STORE_TRACKS = 'downloaded_tracks';
const STORE_FAVORITES = 'favorite_tracks';
const RECENT_SEARCHES_KEY = 'exotic_recent_searches';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a track with raw audio Blob to offline IndexedDB storage
 */
export async function saveTrackOffline(track: Track): Promise<void> {
  try {
    let audioBlob: Blob | undefined = track.audioBlob;

    // Fetch and store actual binary audio blob for true offline playback
    if (!audioBlob && track.streamUrl && track.streamUrl.startsWith('http')) {
      try {
        const response = await fetch(track.streamUrl);
        if (response.ok) {
          audioBlob = await response.blob();
        }
      } catch (err) {
        console.warn('Could not cache full audio blob locally, saving track reference:', err);
      }
    }

    const savedTrack: Track = {
      ...track,
      isDownloaded: true,
      downloadDate: Date.now(),
      audioBlob,
    };

    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readwrite');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.put(savedTrack);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to save track offline:', error);
    throw error;
  }
}

/**
 * Remove a track from offline storage
 */
export async function removeTrackOffline(trackId: string | number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TRACKS], 'readwrite');
    const store = transaction.objectStore(STORE_TRACKS);
    const req = store.delete(trackId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all downloaded offline tracks with freshly initialized Blob URLs
 */
export async function getOfflineTracks(): Promise<Track[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.getAll();

      req.onsuccess = () => {
        const tracks: Track[] = (req.result || []).map((t: Track) => {
          if (t.audioBlob) {
            return {
              ...t,
              streamUrl: URL.createObjectURL(t.audioBlob),
            };
          }
          return t;
        });
        resolve(tracks);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not open offline DB, returning empty:', err);
    return [];
  }
}

/**
 * Get all downloaded offline track IDs
 */
export async function getOfflineTrackIds(): Promise<Set<string | number>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.getAllKeys();

      req.onsuccess = () => {
        resolve(new Set((req.result || []) as (string | number)[]));
      };
      req.onerror = () => resolve(new Set());
    });
  } catch {
    return new Set();
  }
}

/**
 * Check if a track is downloaded
 */
export async function isTrackDownloaded(trackId: string | number): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.get(trackId);

      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Get a specific offline track from internal storage
 */
export async function getOfflineTrack(trackId: string | number): Promise<Track | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.get(trackId);

      req.onsuccess = () => {
        const t = req.result as Track | undefined;
        if (t && t.audioBlob) {
          resolve({
            ...t,
            streamUrl: URL.createObjectURL(t.audioBlob),
          });
        } else {
          resolve(t || null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Favorite Tracks Persistence
 */
export async function getFavoriteTracks(): Promise<Track[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_FAVORITES], 'readonly');
      const store = transaction.objectStore(STORE_FAVORITES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function toggleFavoriteTrack(track: Track): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_FAVORITES], 'readwrite');
      const store = transaction.objectStore(STORE_FAVORITES);
      const checkReq = store.get(track.id);

      checkReq.onsuccess = () => {
        if (checkReq.result) {
          store.delete(track.id);
          resolve(false);
        } else {
          store.put(track);
          resolve(true);
        }
      };
      checkReq.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getFavoriteTrackIds(): Promise<(string | number)[]> {
  try {
    const tracks = await getFavoriteTracks();
    return tracks.map((t) => t.id);
  } catch {
    return [];
  }
}

/**
 * Recent searches
 */
export function getRecentSearches(): string[] {
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : ['Niyam Tum Se Tum Tak', 'Karan Aujla', 'Arijit Singh', 'Sabrina Carpenter'];
  } catch {
    return ['Niyam Tum Se Tum Tak', 'Karan Aujla'];
  }
}

export function addRecentSearch(query: string): void {
  if (!query.trim()) return;
  const recents = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
  recents.unshift(query.trim());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents.slice(0, 10)));
  } catch {}
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}
