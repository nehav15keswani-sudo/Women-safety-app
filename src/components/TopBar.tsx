import React, { useState } from 'react';
import {
  Shield,
  EyeOff,
  BellRing,
  Languages,
  Video,
  Scale,
  PlayCircle,
  Compass,
  Lock,
  User,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { SupportedLanguage, LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfile } from '../utils/authStorage';

export type AppTab =
  | 'sos'
  | 'map'
  | 'walk'
  | 'fakecall'
  | 'helplines'
  | 'contacts'
  | 'guides'
  | 'rights'
  | 'defense'
  | 'video';

interface TopBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isSirenActive: boolean;
  onToggleSiren: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenLockScreen?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  isSirenActive,
  onToggleSiren,
  currentLanguage,
  onSelectLanguage,
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenLockScreen,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <span
              onClick={() => setActiveTab('sos')}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              Safe Guard
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('sos')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sos' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              {t.sosTab}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'map' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-500" />
              <span>{t.offlineMapTab || 'Offline Map'}</span>
            </button>
            <button
              onClick={() => setActiveTab('rights')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'rights' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.legalRightsTab}</span>
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'defense' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.defenseVideosTab}</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'video' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-500" />
              <span>Record &amp; Share</span>
            </button>
            <button
              onClick={() => setActiveTab('walk')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'walk' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              {t.walkTab}
            </button>
            <button
              onClick={() => setActiveTab('fakecall')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'fakecall' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              {t.fakeCallTab}
            </button>
            <button
              onClick={() => setActiveTab('helplines')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'helplines' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              {t.helplinesTab}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'contacts' ? 'text-rose-600 dark:text-rose-400 font-semibold border-b-2 border-rose-600 pb-0.5' : ''
              }`}
            >
              {t.circleTab}
            </button>
          </nav>

          {/* Zone 3: PWA Install + Language Selector + Discreet Cloak Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Languages className="w-3.5 h-3.5 text-slate-400 mr-1.5 pointer-events-none hidden sm:block" />
              <select
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {isSirenActive && (
              <button
                onClick={onToggleSiren}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg animate-pulse whitespace-nowrap shrink-0 flex items-center gap-1.5"
                title="Silence Active Siren"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Silence</span>
              </button>
            )}

            {/* Emergency Lock Screen Focus Mode */}
            {onOpenLockScreen && (
              <button
                onClick={onOpenLockScreen}
                className="px-2.5 py-1.5 text-xs font-bold text-white bg-black hover:bg-slate-900 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
                title="Launch Distraction-Free Emergency Lock Screen"
              >
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden xl:inline">Lock Screen</span>
              </button>
            )}


            {/* User Profile / Sign In Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.phone}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold inline-block mt-1">
                        Encrypted Device Vault
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 mt-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign Up</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 mt-0.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
