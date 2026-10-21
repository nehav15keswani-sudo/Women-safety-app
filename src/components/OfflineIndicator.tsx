import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, Shield } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-50 max-w-md animate-fade-in">
      <div className="flex items-center justify-between gap-3 bg-slate-900/95 dark:bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">Offline Mode Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              100% of Aegis (SOS, Siren, Animated Videos, Maps, Fake Call) works offline.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 transition shrink-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
