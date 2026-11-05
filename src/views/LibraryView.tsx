import React, { useState, useEffect } from 'react';
import { Download, Heart, Play, Trash2, Music2, FolderCheck, ChevronRight, Disc, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';
import { getOfflineTracks, getFavoriteTracks } from '../services/storageService';
import { FEATURED_TRACKS } from '../services/appleMusicApi';

export const LibraryView: React.FC = () => {
  const { playTrack, currentTrack, favoriteTrackIds, deleteDownloadedTrack, downloadTrack, downloadedTrackIds } = usePlayer();
  const [activeSection, setActiveSection] = useState<'all' | 'downloaded' | 'favorites'>('all');
  const [offlineTracks, setOfflineTracks] = useState<Track[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);

  useEffect(() => {
    getOfflineTracks().then((tracks) => setOfflineTracks(tracks));
    getFavoriteTracks().then((tracks) => {
      if (tracks.length > 0) {
        setFavoriteTracks(tracks);
      } else {
        // Fallback to featured tracks matching favorite ids if any
        setFavoriteTracks(FEATURED_TRACKS.filter((t) => favoriteTrackIds.includes(t.id)));
      }
    });
  }, [activeSection, favoriteTrackIds]);

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">
        Library
      </h1>

      {/* Navigation Menu */}
      <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl overflow-hidden mb-6 divide-y divide-white/5 shadow-lg">
        <button
          onClick={() => setActiveSection(activeSection === 'downloaded' ? 'all' : 'downloaded')}
          className={`w-full flex items-center justify-between p-4 transition ${
            activeSection === 'downloaded' ? 'bg-[#FA233B]/10' : 'hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-base font-semibold text-white block">Downloaded</span>
              <span className="text-xs text-neutral-400">{offlineTracks.length} tracks stored offline</span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${activeSection === 'downloaded' ? 'rotate-90 text-[#FA233B]' : ''}`} />
        </button>

        <button
          onClick={() => setActiveSection(activeSection === 'favorites' ? 'all' : 'favorites')}
          className={`w-full flex items-center justify-between p-4 transition ${
            activeSection === 'favorites' ? 'bg-[#FA233B]/10' : 'hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#FA233B]/20 text-[#FA233B] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <span className="text-base font-semibold text-white block">Favorite Songs</span>
              <span className="text-xs text-neutral-400">{favoriteTrackIds.length} loved tracks</span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${activeSection === 'favorites' ? 'rotate-90 text-[#FA233B]' : ''}`} />
        </button>
      </div>

      {/* Downloaded Section Detail */}
      {activeSection === 'downloaded' && (
        <div className="animate-fade-in mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-emerald-400" />
              <span>Offline Songs</span>
            </h2>
            {offlineTracks.length > 0 && (
              <button
                onClick={() => playTrack(offlineTracks[0], offlineTracks)}
                className="px-3 py-1.5 rounded-full bg-[#FA233B] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {offlineTracks.length === 0 ? (
            <div className="p-8 bg-[#1C1C1E] border border-white/5 rounded-3xl text-center">
              <Download className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">No downloaded songs yet</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Save your favorite tracks for 100% offline playback with zero mobile data usage.
              </p>
            </div>
          ) : (
            <div className="space-y-2 bg-[#1C1C1E] border border-white/5 rounded-3xl p-3">
              {offlineTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, offlineTracks)}
                  className="flex items-center space-x-3 p-2.5 rounded-2xl hover:bg-white/5 transition cursor-pointer"
                >
                  <img src={track.artwork} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                    <span className="text-[10px] text-emerald-400 font-bold">Offline Ready</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDownloadedTrack(track.id);
                      setOfflineTracks((prev) => prev.filter((t) => t.id !== track.id));
                    }}
                    className="p-2 text-neutral-500 hover:text-rose-400 active:scale-90 transition"
                    title="Remove from offline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites Section Detail */}
      {activeSection === 'favorites' && (
        <div className="animate-fade-in mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FA233B] fill-current" />
              <span>Loved Songs</span>
            </h2>
            {favoriteTracks.length > 0 && (
              <button
                onClick={() => playTrack(favoriteTracks[0], favoriteTracks)}
                className="px-3 py-1.5 rounded-full bg-[#FA233B] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {favoriteTracks.length === 0 ? (
            <div className="p-8 bg-[#1C1C1E] border border-white/5 rounded-3xl text-center">
              <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">No loved songs yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Tap the heart button on any track to add it to your favorite collection.
              </p>
            </div>
          ) : (
            <div className="space-y-2 bg-[#1C1C1E] border border-white/5 rounded-3xl p-3">
              {favoriteTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, favoriteTracks)}
                  className="flex items-center space-x-3 p-2.5 rounded-2xl hover:bg-white/5 transition cursor-pointer"
                >
                  <img src={track.artwork} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTrack(track);
                    }}
                    className={`p-2 active:scale-90 transition ${
                      downloadedTrackIds.has(track.id) ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                    }`}
                    title={downloadedTrackIds.has(track.id) ? 'Downloaded In-App' : 'Download to Library'}
                  >
                    {downloadedTrackIds.has(track.id) ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Added Section */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-3 px-1">
          Recently Added
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURED_TRACKS.slice(0, 4).map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, FEATURED_TRACKS)}
              className="group p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 shadow-sm cursor-pointer active:scale-95 transition"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md">
                <img src={track.artwork} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
