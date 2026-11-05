import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { NavigationTab } from './types/music';
import { TabBar } from './components/TabBar';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { QualityModal } from './components/QualityModal';
import { AmDlModal } from './components/AmDlModal';
import { ListenNowView } from './views/ListenNowView';
import { BrowseView } from './views/BrowseView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('listen-now');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col font-sans select-none">
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

      {/* Apple Music Downloader (am-dl) Integration Modal */}
      <AmDlModal />
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
