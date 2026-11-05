import React, { useState } from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  ListMusic,
  Cast,
  Download,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { LyricsView } from './LyricsView';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const FullPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    isFullPlayerOpen,
    isLyricsOpen,
    queue,
    favoriteTrackIds,
    closeFullPlayer,
    togglePlayPause,
    seek,
    nextTrack,
    prevTrack,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleLyrics,
    openQualityModal,
    downloadTrack,
    downloadedTrackIds,
    toggleFavorite,
    playTrack,
  } = usePlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const isFavorite = favoriteTrackIds.includes(currentTrack.id);
  const isDownloaded = downloadedTrackIds.has(currentTrack.id);
  const effectiveCurrentTime = isScrubbing ? scrubValue : currentTime;
  const remainingTime = Math.max(0, duration - effectiveCurrentTime);

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubValue(currentTime);
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubValue(parseFloat(e.target.value));
  };

  const handleScrubEnd = () => {
    seek(scrubValue);
    setIsScrubbing(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTrack.title,
        text: `Listen to ${currentTrack.title} by ${currentTrack.artist} on Exotic Music`,
        url: currentTrack.appleMusicUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(currentTrack.appleMusicUrl);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black text-white flex flex-col justify-between overflow-hidden animate-slide-up select-none safe-top safe-bottom">
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[30%] -left-[30%] w-[160%] h-[160%] opacity-40 blur-[90px] filter transition-all duration-1000 scale-105"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, #FA233B 0%, transparent 50%), radial-gradient(circle at 70% 70%, #4A154B 0%, transparent 60%), radial-gradient(circle at 50% 50%, #1A1A24 0%, #000000 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-3 pb-2">
        <button
          onClick={closeFullPlayer}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white/80 active:scale-90 transition hover:bg-white/10"
          aria-label="Collapse Player"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Playing From
          </span>
          <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
            {currentTrack.album}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-white/80 active:scale-90 transition hover:bg-white/10"
            aria-label="More Options"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>

          {/* Context Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#2C2C2E] border border-white/10 rounded-2xl shadow-2xl p-1 z-50 animate-scale-up">
              <button
                onClick={() => {
                  downloadTrack(currentTrack);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left text-sm font-medium transition"
              >
                <Download className="w-4 h-4 text-[#FA233B]" />
                <span>{isDownloaded ? 'Downloaded In-App' : 'Download to Library'}</span>
              </button>
              <button
                onClick={() => {
                  toggleFavorite(currentTrack);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left text-sm font-medium transition"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#FA233B] fill-current' : ''}`} />
                <span>{isFavorite ? 'Undo Love' : 'Love Song'}</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left text-sm font-medium transition"
              >
                <Share2 className="w-4 h-4 text-neutral-300" />
                <span>Share Song</span>
              </button>
              <a
                href={currentTrack.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left text-sm font-medium transition text-neutral-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>View Song Source</span>
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Center Area: Artwork vs. Synced Lyrics vs. Queue */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 overflow-hidden">
        {isLyricsOpen ? (
          <LyricsView
            lyrics={currentTrack.lyrics || []}
            currentTime={currentTime}
            onSeek={seek}
          />
        ) : isQueueOpen ? (
          <div className="h-full overflow-y-auto py-4 space-y-2 no-scrollbar">
            <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-3">Playing Next</h4>
            {queue.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                onClick={() => playTrack(track)}
                className={`flex items-center space-x-3 p-2.5 rounded-xl transition cursor-pointer ${
                  track.id === currentTrack.id ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-neutral-300'
                }`}
              >
                <img src={track.artwork} alt={track.title} className="w-11 h-11 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-white">{track.title}</p>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-neutral-400">{formatTime(track.duration)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center my-auto">
            {/* Square Album Cover with Spring Scaling */}
            <div 
              className={`relative w-[78vw] max-w-[340px] aspect-square rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out ${
                isPlaying ? 'scale-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]' : 'scale-[0.88] shadow-lg opacity-85'
              }`}
            >
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Control Section */}
      <footer className="relative z-10 px-7 pb-6 pt-1 max-w-lg mx-auto w-full">
        {/* Track Title, Artist & Quality Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <h1 className="text-2xl font-bold tracking-tight text-white truncate">
              {currentTrack.title}
            </h1>
            <p className="text-lg font-semibold text-neutral-400 truncate">
              {currentTrack.artist}
            </p>

            {/* Audio Quality & Offline Status Badge Pills */}
            <div className="flex items-center space-x-2 mt-1.5">
              <button
                onClick={openQualityModal}
                className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-300 rounded-md transition flex items-center space-x-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#FA233B]" />
                <span>{currentTrack.quality.badge}</span>
              </button>

              <button
                onClick={() => downloadTrack(currentTrack)}
                className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md transition flex items-center space-x-1 ${
                  isDownloaded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-300 active:scale-95'
                }`}
                title="Download to In-App Library"
              >
                {isDownloaded ? <Check className="w-2.5 h-2.5" /> : <Download className="w-2.5 h-2.5" />}
                <span>{isDownloaded ? 'Downloaded' : 'Download'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => toggleFavorite(currentTrack)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 active:scale-80 transition hover:bg-white/10 flex-shrink-0"
            aria-label="Favorite"
          >
            <Heart
              className={`w-7 h-7 transition-colors duration-200 ${
                isFavorite ? 'text-[#FA233B] fill-current stroke-[#FA233B]' : 'text-neutral-400'
              }`}
            />
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={effectiveCurrentTime}
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            onChange={handleScrubChange}
            onMouseUp={handleScrubEnd}
            onTouchEnd={handleScrubEnd}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[11px] font-medium text-neutral-400 mt-1.5">
            <span>{formatTime(effectiveCurrentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between px-2 mb-6">
          <button
            onClick={toggleShuffle}
            className={`w-10 h-10 flex items-center justify-center active:scale-85 transition ${
              isShuffle ? 'text-[#FA233B]' : 'text-neutral-400'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="w-12 h-12 flex items-center justify-center text-white active:scale-85 transition"
            aria-label="Previous Track"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-18 h-18 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform duration-150"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-9 h-9 fill-current" />
            ) : (
              <Play className="w-9 h-9 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="w-12 h-12 flex items-center justify-center text-white active:scale-85 transition"
            aria-label="Next Track"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`w-10 h-10 flex items-center justify-center active:scale-85 transition ${
              repeatMode !== 'off' ? 'text-[#FA233B]' : 'text-neutral-400'
            }`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-3 px-3 mb-5">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="text-neutral-400 active:scale-90 transition"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume1 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <Volume2 className="w-4 h-4 text-neutral-400" />
        </div>

        {/* Bottom Toolbar: Lyrics / AirPlay / Queue */}
        <div className="flex items-center justify-between px-6 pt-1 border-t border-white/5">
          <button
            onClick={() => {
              toggleLyrics();
              setIsQueueOpen(false);
            }}
            className={`p-2.5 rounded-full active:scale-90 transition ${
              isLyricsOpen ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Lyrics"
            title="Lyrics"
          >
            <Mic2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => downloadTrack(currentTrack)}
            className={`p-2.5 rounded-full active:scale-90 transition flex items-center space-x-1 ${
              isDownloaded ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={isDownloaded ? 'Downloaded In-App' : 'Download to Library'}
          >
            {isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setIsQueueOpen((prev) => !prev);
              if (isLyricsOpen) toggleLyrics();
            }}
            className={`p-2.5 rounded-full active:scale-90 transition ${
              isQueueOpen ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Queue"
            title="Playing Next Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
