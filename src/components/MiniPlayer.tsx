import React from 'react';
import { Play, Pause, SkipForward, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, openFullPlayer, openQualityModal } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-20 px-3 pb-2 max-w-lg mx-auto">
      <div 
        onClick={openFullPlayer}
        className="apple-mini-blur border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-2xl active:scale-[0.99] transition-transform duration-150 cursor-pointer"
      >
        {/* Track Thumbnail */}
        <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-2">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#FA233B] animate-ping" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[14px] font-semibold text-white truncate tracking-tight">
                {currentTrack.title}
              </span>
              {currentTrack.quality.badge.includes('Lossless') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openQualityModal();
                  }}
                  className="px-1 py-0.2 text-[8px] font-bold tracking-wider bg-white/10 text-neutral-300 rounded uppercase flex-shrink-0"
                  title="Hi-Res Lossless"
                >
                  ALAC
                </button>
              )}
            </div>
            <span className="text-[12px] text-[#8E8E93] truncate font-medium">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
