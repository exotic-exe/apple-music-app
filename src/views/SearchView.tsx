import React, { useState, useEffect } from 'react';
import { Search, X, Download, Sparkles, Loader2, Play, Music, Check } from 'lucide-react';
import { searchAppleMusic, FEATURED_TRACKS } from '../services/appleMusicApi';
import { Track } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../services/storageService';

const GENRES = [
  { name: 'Bollywood Hits', gradient: 'from-orange-500 to-amber-600', query: 'Bollywood Hits' },
  { name: 'Punjabi Pop', gradient: 'from-purple-600 to-indigo-700', query: 'Punjabi' },
  { name: 'Indie India', gradient: 'from-pink-500 to-rose-600', query: 'Indie India' },
  { name: 'Hip-Hop / Rap', gradient: 'from-yellow-600 to-amber-800', query: 'Hip-Hop' },
  { name: 'Pure Pop', gradient: 'from-blue-500 to-cyan-600', query: 'Pop Hits' },
  { name: 'Acoustic & Chill', gradient: 'from-emerald-500 to-teal-700', query: 'Acoustic Chill' },
  { name: 'Dance & EDM', gradient: 'from-fuchsia-600 to-pink-700', query: 'EDM Dance' },
  { name: 'Apple Music Classical', gradient: 'from-stone-600 to-neutral-800', query: 'Classical' },
];

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [storefront, setStorefront] = useState<'in' | 'us'>('in');

  const { playTrack, currentTrack, isPlaying, downloadTrack, downloadedTrackIds } = usePlayer();

  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const tracks = await searchAppleMusic(query, storefront, 25);
        setResults(tracks);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query, storefront]);

  const handleSelectQuery = (q: string) => {
    setQuery(q);
    addRecentSearch(q);
    setRecents(getRecentSearches());
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleTrackClick = (track: Track) => {
    addRecentSearch(track.title);
    setRecents(getRecentSearches());
    playTrack(track, results.length > 0 ? results : FEATURED_TRACKS);
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-4">
        Search
      </h1>

      {/* Apple-styled Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center bg-[#1C1C1E] border border-white/10 rounded-2xl px-3.5 py-3 shadow-inner focus-within:border-white/30 transition">
          <Search className="w-5 h-5 text-neutral-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artists, Songs, Lyrics, and more"
            className="w-full bg-transparent text-white text-base placeholder-neutral-500 focus:outline-none"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full bg-white/20 text-neutral-300 hover:text-white active:scale-90 transition ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Storefront / Region Switcher */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="text-xs font-semibold text-neutral-400">Storefront:</span>
        <div className="flex bg-[#1C1C1E] rounded-xl p-0.5 border border-white/5">
          <button
            onClick={() => setStorefront('in')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              storefront === 'in' ? 'bg-[#FA233B] text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            India 🇮🇳
          </button>
          <button
            onClick={() => setStorefront('us')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              storefront === 'us' ? 'bg-[#FA233B] text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Global 🌐
          </button>
        </div>
      </div>

      {/* Search State: Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA233B] mb-3" />
          <p className="text-sm font-semibold">Searching Apple Music catalog...</p>
        </div>
      )}

      {/* Search State: Results List */}
      {!loading && query.trim() !== '' && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-1">
            Top Results ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-base font-semibold text-white">No results found for "{query}"</p>
              <p className="text-xs text-neutral-400 mt-1">Check spelling or try a different artist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackClick(track)}
                    className={`flex items-center space-x-3 p-2.5 rounded-2xl transition cursor-pointer active:scale-[0.99] border ${
                      isCurrent
                        ? 'bg-white/10 border-white/20'
                        : 'bg-[#1C1C1E]/70 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="relative w-13 h-13 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FA233B] animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className={`text-sm font-bold truncate ${isCurrent ? 'text-[#FA233B]' : 'text-white'}`}>
                          {track.title}
                        </h3>
                        {track.isExplicit && (
                          <span className="px-1 text-[9px] font-bold bg-neutral-700 text-neutral-300 rounded">
                            E
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate font-medium mt-0.5">
                        {track.artist}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold tracking-wider uppercase bg-white/10 text-neutral-300">
                          {track.quality.badge}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(track);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition flex-shrink-0 ${
                        downloadedTrackIds.has(track.id)
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white'
                      }`}
                      title={downloadedTrackIds.has(track.id) ? 'Downloaded In-App' : 'Download to Library'}
                    >
                      {downloadedTrackIds.has(track.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search State: Empty Query (Recents & Categories) */}
      {!loading && query.trim() === '' && (
        <div>
          {/* Recent Searches */}
          {recents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Recent Searches
                </span>
                <button
                  onClick={() => {
                    clearRecentSearches();
                    setRecents([]);
                  }}
                  className="text-xs font-semibold text-[#FA233B] hover:opacity-80"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recents.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuery(item)}
                    className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] border border-white/5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-white/20 active:scale-95 transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-1">
              Browse Categories
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((g, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectQuery(g.query)}
                  className={`relative p-4 rounded-2xl bg-gradient-to-br ${g.gradient} aspect-[16/10] overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform duration-200 flex items-end`}
                >
                  <span className="text-base font-extrabold text-white leading-tight drop-shadow-md">
                    {g.name}
                  </span>
                  <div className="absolute top-2 right-2 text-white/30">
                    <Music className="w-6 h-6 stroke-[1.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
