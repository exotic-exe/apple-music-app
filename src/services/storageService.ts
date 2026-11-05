import { Track } from '../types/music';

const DB_NAME = 'AppleMusicDB';
const DB_VERSION = 1;
const STORE_TRACKS = 'downloaded_tracks';
const FAVORITES_KEY = 'apple_music_favorites';
const RECENT_SEARCHES_KEY = 'apple_music_recent_searches';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a track to offline storage
 */
export async function saveTrackOffline(track: Track): Promise<void> {
  try {
    let localStreamUrl = track.streamUrl;

    // If streamUrl is accessible, fetch and cache the blob
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
      try {
        const response = await fetch(track.streamUrl);
        if (response.ok) {
          const blob = await response.blob();
          localStreamUrl = URL.createObjectURL(blob);
        }
      } catch (err) {
        console.warn('Could not cache full audio blob locally, saving track reference:', err);
      }
    }

    const savedTrack: Track = {
      ...track,
      isDownloaded: true,
      downloadDate: Date.now(),
      streamUrl: localStreamUrl,
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
 * Get all downloaded offline tracks
 */
export async function getOfflineTracks(): Promise<Track[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not open offline DB, returning empty:', err);
    return [];
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
 * Local Storage Favorites
 */
export function getFavoriteTrackIds(): (string | number)[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteTrack(trackId: string | number): boolean {
  const favorites = getFavoriteTrackIds();
  const exists = favorites.includes(trackId);
  const updated = exists ? favorites.filter((id) => id !== trackId) : [...favorites, trackId];

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error updating favorites:', err);
  }

  return !exists;
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
