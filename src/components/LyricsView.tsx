import React, { useEffect, useRef } from 'react';
import { LyricLine } from '../types/music';

interface LyricsViewProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ lyrics, currentTime, onSeek }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Find currently active lyric line
  const activeIndex = lyrics.findLastIndex((line) => currentTime >= line.time);

  // Smoothly scroll active line to center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-xl font-semibold text-white/80">Lyrics not available for this track</p>
        <p className="text-sm text-neutral-400 mt-2">Enjoying bit-perfect high-resolution audio</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-12 space-y-7 no-scrollbar scroll-smooth"
    >
      <div className="h-16" /> {/* Top spacing */}
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <div
            key={`${line.time}-${idx}`}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.time)}
            className={`transition-all duration-300 cursor-pointer select-none group ${
              isActive
                ? 'text-white text-2xl md:text-3xl font-extrabold scale-102 filter drop-shadow-md'
                : isPast
                ? 'text-white/40 text-xl md:text-2xl font-bold hover:text-white/70'
                : 'text-white/30 text-xl md:text-2xl font-bold hover:text-white/60 blur-[0.4px]'
            }`}
          >
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              {line.text}
            </span>
          </div>
        );
      })}
      <div className="h-32" /> {/* Bottom spacing */}
    </div>
  );
};
