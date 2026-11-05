import React from 'react';
import { PlayCircle, Compass, Search, Library } from 'lucide-react';
import { NavigationTab } from '../types/music';

interface TabBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'listen-now', label: 'Listen Now', icon: PlayCircle },
    { id: 'browse', label: 'Browse', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 apple-blur border-t border-white/10 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-[#FA233B]' : 'text-[#8E8E93] hover:text-[#C7C7CC]'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
