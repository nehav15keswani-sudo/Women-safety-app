import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Flashlight,
  VolumeX,
  Volume2,
  Lock,
  Radio,
  Flame,
  CheckCircle2,
  Phone,
  Sun,
  Eye,
  Check,
  Smartphone
} from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren, isSirenPlaying } from '../utils/audioAlert';
import { getCurrentLocation, formatSosText, dispatchSms } from '../utils/location';
import { EmergencyContact, LocationCoordinates } from '../types';

interface EmergencyLockScreenProps {
  isOpen: boolean;
  onExit: () => void;
  contacts: EmergencyContact[];
  userName: string;
  userLocation: LocationCoordinates | null;
  onTriggerSosMain?: () => void;
}

export const EmergencyLockScreen: React.FC<EmergencyLockScreenProps> = ({
  isOpen,
  onExit,
  contacts,
  userName,
  userLocation,
  onTriggerSosMain,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isSilentSirenActive, setIsSilentSirenActive] = useState(false);
  const [isAudibleSirenActive, setIsAudibleSirenActive] = useState(false);
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const [exitTapCount, setExitTapCount] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [autoLaunchOnStart, setAutoLaunchOnStart] = useState<boolean>(() => {
    return localStorage.getItem('aegis_auto_lockscreen') === 'true';
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  // Digital clock & date update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Screen Wake Lock API - Keeps phone screen awake in Lock Screen mode
  useEffect(() => {
    if (!isOpen) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
      return;
    }

    // Request wake lock
    if ('wakeLock' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).wakeLock
        .request('screen')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((lock: any) => {
          wakeLockRef.current = lock;
          setWakeLockActive(true);
          lock.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        })
        .catch(() => {
          setWakeLockActive(false);
        });
    }

    // Attempt browser full screen for genuine lockscreen simulation
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
    };
  }, [isOpen]);

  // Motion Detection: Shake while on Lock Screen triggers instant SOS
  useEffect(() => {
    if (!isOpen) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const now = Date.now();
      if (now - lastTime > 150) {
        const diffTime = now - lastTime;
        lastTime = now;

        const x = current.x || 0;
        const y = current.y || 0;
        const z = current.z || 0;

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        // If violently shaken (speed > 2800)
        if (speed > 2800 && !isSosTriggered) {
          handleTriggerOneTouchSos();
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, true);
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
    };
  }, [isOpen, isSosTriggered]);

  // Flashlight / Camera Torch integration
  useEffect(() => {
    let track: MediaStreamTrack | null = null;

    if (isFlashlightOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          mediaStreamRef.current = stream;
          track = stream.getVideoTracks()[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
          if (capabilities.torch) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (track as any).applyConstraints({ advanced: [{ torch: true }] });
          }
        })
        .catch(() => {});
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isFlashlightOn]);

  if (!isOpen) return null;

  // 1-TOUCH INSTANT SOS EXECUTION
  const handleTriggerOneTouchSos = () => {
    setIsSosTriggered(true);

    // Immediate haptic pulse
    if (navigator.vibrate) {
      navigator.vibrate([400, 100, 400, 100, 800]);
    }

    // Audible alarm unless silent mode selected
    if (!isSilentSirenActive && !isSirenPlaying()) {
      startEmergencySiren();
      setIsAudibleSirenActive(true);
    }

    // Direct offline SMS intent dispatch
    const text = formatSosText(
      userName,
      userLocation,
      isSilentSirenActive
        ? '[ONE-TOUCH SILENT SOS]: Emergency triggered silently on lock screen. Track my location immediately!'
        : '[ONE-TOUCH LOCKSCREEN SOS]: Immediate emergency assistance required! Satellite coordinates attached.'
    );

    if (primaryContact) {
      dispatchSms(primaryContact.phone, text);
    }

    if (onTriggerSosMain) {
      onTriggerSosMain();
    }
  };

  const handleToggleFlashlight = () => {
    setIsFlashlightOn((prev) => !prev);
    if (navigator.vibrate) {
      navigator.vibrate(60);
    }
  };

  const handleToggleSilentSiren = () => {
    const nextState = !isSilentSirenActive;
    setIsSilentSirenActive(nextState);

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    if (nextState && isSirenPlaying()) {
      stopEmergencySiren();
      setIsAudibleSirenActive(false);
    }
  };

  const handleToggleAutoLaunch = () => {
    const next = !autoLaunchOnStart;
    setAutoLaunchOnStart(next);
    localStorage.setItem('aegis_auto_lockscreen', String(next));
  };

  const handleExitTap = () => {
    const newCount = exitTapCount + 1;
    setExitTapCount(newCount);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }

    if (newCount >= 2) {
      setExitTapCount(0);
      if (isSirenPlaying()) {
        stopEmergencySiren();
      }
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // ignore
      }
      onExit();
    } else {
      exitTimerRef.current = window.setTimeout(() => {
        setExitTapCount(0);
      }, 1500);
    }
  };

  return (
    <div
      role="region"
      aria-label="Emergency Lock Screen One-Touch"
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center p-4 sm:p-6 select-none transition-colors duration-200 overflow-hidden ${
        isFlashlightOn ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      {/* 1. TOP STATUS & CLOCK: Digital Time, Wake-Lock Indicator, Discreet Exit */}
      <div className="w-full max-w-md flex items-start justify-between pt-2">
        <div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">{currentTime}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">{currentDate}</div>
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span>1-TOUCH LOCKSCREEN SOS READY</span>
          </div>
          {wakeLockActive && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono inline-block mt-1">
              ⚡ Screen Stay-Awake Active
            </span>
          )}
        </div>

        {/* Double-tap exit safeguard button */}
        <button
          onClick={handleExitTap}
          className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
            isFlashlightOn
              ? 'border-black/30 text-black hover:bg-black/10'
              : 'border-white/30 text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{exitTapCount === 1 ? 'Tap again to exit' : 'Exit'}</span>
        </button>
      </div>

      {/* 2. CENTER: ULTRA-LARGE ONE-TOUCH SOS BUTTON */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-sm">
        <div className="relative">
          {/* Animated emergency halo rings */}
          <div className="absolute -inset-6 rounded-full bg-rose-600/30 animate-ping pointer-events-none"></div>
          <div className="absolute -inset-12 rounded-full bg-rose-600/15 pointer-events-none"></div>

          {/* ONE TOUCH INSTANT SOS BUTTON */}
          <button
            onClick={handleTriggerOneTouchSos}
            className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-transform active:scale-90 cursor-pointer ${
              isSosTriggered
                ? 'bg-rose-700 ring-8 ring-rose-400 shadow-rose-600/60'
                : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-700 hover:scale-102 ring-4 ring-rose-500/40 shadow-rose-600/40'
            }`}
          >
            <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-md animate-pulse" />
            <span className="text-5xl sm:text-6xl font-black tracking-widest drop-shadow-lg">
              SOS
            </span>
            <span className="text-xs font-extrabold tracking-widest uppercase opacity-95 mt-2 bg-black/30 px-3 py-1 rounded-full">
              {isSosTriggered ? 'DISPATCHED!' : '1-TOUCH TO ALERT'}
            </span>
          </button>
        </div>

        <p className={`text-xs text-center mt-5 font-semibold ${isFlashlightOn ? 'text-black/80' : 'text-slate-300'}`}>
          {isSilentSirenActive
            ? 'Silent SOS Armed: 1-Touch dispatches rescue SMS & GPS without sound.'
            : 'Single tap sounds 120dB alarm, preps rescue SMS & flashes strobe.'}
        </p>

        {/* 1-Touch Shake to Trigger Hint */}
        <p className="text-[10px] text-center text-slate-500 mt-1">
          💡 Or violently shake phone to trigger SOS without touching screen
        </p>
      </div>

      {/* 3. ONE-TOUCH EMERGENCY CALL DIALERS (112 Police & Primary Guardian) */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 mb-3">
        {/* 1-Touch 112 India Police */}
        <a
          href="tel:112"
          className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-2xl flex items-center justify-between text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-xs">
              112
            </div>
            <div>
              <span className="text-[11px] font-bold block text-amber-300 leading-tight">Call Police</span>
              <span className="text-[9px] text-slate-400">1-Touch 24/7</span>
            </div>
          </div>
          <Phone className="w-4 h-4 text-amber-400" />
        </a>

        {/* 1-Touch Call Guardian */}
        {primaryContact && (
          <a
            href={`tel:${primaryContact.phone}`}
            className="p-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-2xl flex items-center justify-between text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold block text-rose-300 leading-tight truncate">
                  {primaryContact.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400">Guardian Call</span>
              </div>
            </div>
            <Phone className="w-4 h-4 text-rose-400 shrink-0" />
          </a>
        )}
      </div>

      {/* 4. BOTTOM CONTROLS: FLASHLIGHT TOGGLE & SILENT SIREN BUTTON */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3 pb-2">
        {/* Flashlight Toggle */}
        <button
          onClick={handleToggleFlashlight}
          className={`py-3.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isFlashlightOn
              ? 'bg-black text-white border-black shadow-lg ring-4 ring-black/20'
              : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
          }`}
        >
          <Flashlight className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isFlashlightOn ? 'Torch OFF' : 'Torch ON'}
          </span>
        </button>

        {/* Silent Siren Activation Button */}
        <button
          onClick={handleToggleSilentSiren}
          className={`py-3.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isSilentSirenActive
              ? 'bg-amber-500 text-black border-amber-400 shadow-lg ring-4 ring-amber-400/30'
              : isFlashlightOn
              ? 'bg-black/10 hover:bg-black/15 text-black border-black/20'
              : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
          }`}
        >
          {isSilentSirenActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isSilentSirenActive ? 'Silent ON' : 'Silent Siren'}
          </span>
        </button>
      </div>

      {/* 5. Auto-launch on start toggle footer */}
      <div className="w-full max-w-md flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoLaunchOnStart}
            onChange={handleToggleAutoLaunch}
            className="w-3.5 h-3.5 text-rose-600 rounded bg-black border-slate-700"
          />
          <span className="text-slate-400">Auto-open Lock Screen on app start</span>
        </label>
        <span className="text-[10px] text-slate-600">Aegis 1-Touch Standby</span>
      </div>
    </div>
  );
};
