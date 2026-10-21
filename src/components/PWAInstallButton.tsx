import React, { useState } from 'react';
import { DownloadCloud, Smartphone, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Installed PWA (Offline Ready)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition shrink-0 cursor-pointer"
        title="Install Aegis for offline emergency access"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-rose-400 dark:text-white" />
        <span>Install Offline App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-500" />
          <span>Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  <span>Install for 100% Offline Access</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  To save Aegis to your home screen so it works even without Wi-Fi or cellular data:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 font-medium pl-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <li>
                    Tap the <strong className="text-rose-600">Share</strong> button in Safari's bottom toolbar.
                  </li>
                  <li>
                    Scroll down and tap <strong className="text-rose-600">Add to Home Screen</strong>.
                  </li>
                  <li>Open Aegis from your home screen anytime without internet!</li>
                </ol>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback indicator
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shrink-0">
      <DownloadCloud className="w-3.5 h-3.5 text-rose-500" />
      <span>Offline Ready</span>
    </div>
  );
};
