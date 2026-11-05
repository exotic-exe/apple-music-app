import React from 'react';
import { Radio, Sparkles, Flame, Play, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { FEATURED_TRACKS } from '../services/appleMusicApi';

const CURATED_PLAYLISTS = [
  {
    title: 'A-List Bollywood',
    subtitle: 'The definitive sound of modern Hindi cinema.',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    gradient: 'from-orange-600 to-rose-700',
  },
  {
    title: 'Punjabi Wave',
    subtitle: 'Bhangra, trap beats, and pure high-energy tracks.',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
    gradient: 'from-purple-700 to-indigo-800',
  },
  {
    title: 'Today\'s Hits',
    subtitle: 'The songs everyone is streaming right now.',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    gradient: 'from-pink-600 to-red-700',
  },
  {
    title: 'Pure Spatial Audio',
    subtitle: 'Immersive sound with extreme acoustic separation.',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop',
    gradient: 'from-cyan-600 to-blue-800',
  },
];

export const BrowseView: React.FC = () => {
  const { playTrack } = usePlayer();

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">
        Browse
      </h1>

      {/* Featured Editorial Playlists */}
      <div className="space-y-6 mb-8">
        {CURATED_PLAYLISTS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => playTrack(FEATURED_TRACKS[idx % FEATURED_TRACKS.length])}
            className="group relative rounded-3xl overflow-hidden aspect-[16/9] shadow-xl border border-white/10 cursor-pointer active:scale-[0.98] transition"
          >
            <img
              src={item.artwork}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-70 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300">
                  Apple Music Playlist
                </span>
                <h3 className="text-xl font-bold text-white drop-shadow">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition flex-shrink-0">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apple Music Radio Stations */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-3">
          Live Apple Music Radio
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => playTrack(FEATURED_TRACKS[0])}
            className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 shadow-md flex flex-col justify-between aspect-square cursor-pointer active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FC3C44] to-[#FA233B] flex items-center justify-center text-white">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FA233B] tracking-wider">
                Live Now
              </span>
              <h4 className="text-base font-bold text-white">Apple Music 1</h4>
              <p className="text-xs text-neutral-400">The new music that matters</p>
            </div>
          </div>

          <div 
            onClick={() => playTrack(FEATURED_TRACKS[1])}
            className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 shadow-md flex flex-col justify-between aspect-square cursor-pointer active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Live Now
              </span>
              <h4 className="text-base font-bold text-white">Apple Music Hits</h4>
              <p className="text-xs text-neutral-400">Favorite songs you know and love</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
