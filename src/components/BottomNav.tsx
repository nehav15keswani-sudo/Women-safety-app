import React from 'react';
import { AlertCircle, Scale, PlayCircle, Video, Compass, LifeBuoy } from 'lucide-react';
import { AppTab } from './TopBar';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentLanguage: SupportedLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, currentLanguage }) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const tabs: Array<{ id: AppTab; label: string; icon: typeof AlertCircle }> = [
    { id: 'sos', label: t.sosTab, icon: AlertCircle },
    { id: 'map', label: currentLanguage === 'hi' ? 'मैप' : 'Map', icon: Compass },
    { id: 'rights', label: currentLanguage === 'hi' ? 'कानून' : 'Rights', icon: Scale },
    { id: 'video', label: currentLanguage === 'hi' ? 'वीडियो' : 'Video', icon: Video },
    { id: 'defense', label: currentLanguage === 'hi' ? 'रक्षा' : 'Defense', icon: PlayCircle },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-rose-50 dark:bg-rose-950/40' : ''}`}>
                <Icon className={`w-5 h-5 ${tab.id === 'sos' && !isActive ? 'text-rose-500' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
