import React, { useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NavigationTab } from './types/music';
import { TabBar } from './components/TabBar';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { QualityModal } from './components/QualityModal';
import { ListenNowView } from './views/ListenNowView';
import { BrowseView } from './views/BrowseView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { CheckCircle2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('listen-now');
  const { toastMessage } = usePlayer();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] bg-[#2C2C2E]/95 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 text-xs font-semibold text-white animate-fade-in pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto no-scrollbar overscroll-none">
        {currentTab === 'listen-now' && <ListenNowView />}
        {currentTab === 'browse' && <BrowseView />}
        {currentTab === 'search' && <SearchView />}
        {currentTab === 'library' && <LibraryView />}
      </main>

      {/* Persistent Mini Player */}
      <MiniPlayer />

      {/* iOS Apple Music Tab Bar */}
      <TabBar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Full Screen Player Sheet */}
      <FullPlayer />

      {/* Audio Quality (Hi-Res Lossless) Details Modal */}
      <QualityModal />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
