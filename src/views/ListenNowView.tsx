import React from 'react';
import { Play, Sparkles, Download, MoreHorizontal, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { FEATURED_TRACKS } from '../services/appleMusicApi';
import { Track } from '../types/music';

export const ListenNowView: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, openAmDlModal, toggleFavorite, favoriteTrackIds } = usePlayer();

  const heroTrack = FEATURED_TRACKS[0]; // Tum Se Tum Tak

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Today
        </span>
        <div className="w-8 h-8 rounded-full bg-[#FA233B]/20 text-[#FA233B] flex items-center justify-center font-bold text-xs border border-[#FA233B]/30">
          <User className="w-4 h-4" />
        </div>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">
        Listen Now
      </h1>

      {/* Hero Featured Card (Tum Se Tum Tak) */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FA233B] block mb-1">
          Featured Release
        </span>
        <div 
          onClick={() => playTrack(heroTrack, FEATURED_TRACKS)}
          className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-neutral-900 border border-white/10 shadow-2xl cursor-pointer active:scale-[0.98] transition-transform duration-200"
        >
          <img
            src={heroTrack.artwork}
            alt={heroTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#FA233B] text-[10px] font-bold uppercase text-white mb-1.5 shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Hi-Res Lossless</span>
              </span>
              <h2 className="text-xl font-bold text-white truncate drop-shadow-md">
                {heroTrack.title}
              </h2>
              <p className="text-sm font-semibold text-neutral-300 truncate">
                {heroTrack.artist} • {heroTrack.album}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(heroTrack, FEATURED_TRACKS);
              }}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Picks / Lossless Spotlight */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Hi-Res Lossless Spotlight
          </h2>
          <span className="text-xs text-[#FA233B] font-semibold">See All</span>
        </div>

        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {FEATURED_TRACKS.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, FEATURED_TRACKS)}
              className="w-40 flex-shrink-0 group cursor-pointer active:scale-95 transition"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 shadow-lg bg-neutral-900 border border-white/5">
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase">
                    ALAC
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
              <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top 100 Chart Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-3">
          Top Charts
        </h2>
        <div className="space-y-2 bg-[#1C1C1E]/60 border border-white/5 rounded-3xl p-3">
          {FEATURED_TRACKS.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, FEATURED_TRACKS)}
                className={`flex items-center space-x-3 p-2 rounded-2xl transition cursor-pointer active:bg-white/10 ${
                  isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className={`w-5 text-center text-sm font-black ${idx === 0 ? 'text-[#FA233B]' : 'text-neutral-500'}`}>
                  {idx + 1}
                </span>
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#FA233B]' : 'text-white'}`}>
                    {track.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAmDlModal(track);
                  }}
                  className="p-2 text-neutral-400 hover:text-white active:scale-90 transition"
                  title="Download with am-dl"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
