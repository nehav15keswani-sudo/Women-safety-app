import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  MapPin,
  Volume2,
  VolumeX,
  Share2,
  Phone,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Mic,
  Square,
  CheckCircle2,
  ExternalLink,
  Flame,
  Check,
  Copy,
  WifiOff,
  Radio,
  Smartphone,
  Lock,
  Send,
  X,
} from 'lucide-react';
import { EmergencyContact, LocationCoordinates } from '../types';
import { getCurrentLocation, buildGoogleMapsUrl, formatSosText, dispatchWhatsApp, dispatchSms } from '../utils/location';
import { startEmergencySiren, stopEmergencySiren, isSirenPlaying } from '../utils/audioAlert';
import { AutoSosSettingsCard } from './AutoSosSettingsCard';
import { MotionDetectorConfig, MotionTelemetry } from '../utils/motionDetector';
import { AutoSosSubscription } from '../utils/paymentStorage';

interface SosBeaconProps {
  contacts: EmergencyContact[];
  userName: string;
  onStartAudioRecording: () => void;
  isAudioRecording: boolean;
  onOpenFakeCall: () => void;
  autoSosConfig: MotionDetectorConfig;
  onUpdateAutoSosConfig: (newConfig: Partial<MotionDetectorConfig>) => void;
  isAutoSosEnabled: boolean;
  onToggleAutoSosEnabled: (enabled: boolean) => void;
  telemetry: MotionTelemetry | null;
  onSimulateFall: () => void;
  onSimulateShake: () => void;
  onResetPeak: () => void;
  onRequestPermission: () => Promise<boolean>;
  externalActiveSos?: boolean;
  initialCustomNote?: string;
  onOpenLockScreen?: () => void;
  onOpenPayment?: () => void;
  subscription?: AutoSosSubscription;
}

export const SosBeacon: React.FC<SosBeaconProps> = ({
  contacts,
  userName,
  onStartAudioRecording,
  isAudioRecording,
  onOpenFakeCall,
  autoSosConfig,
  onUpdateAutoSosConfig,
  isAutoSosEnabled,
  onToggleAutoSosEnabled,
  telemetry,
  onSimulateFall,
  onSimulateShake,
  onResetPeak,
  onRequestPermission,
  externalActiveSos,
  initialCustomNote,
  onOpenLockScreen,
  onOpenPayment,
  subscription,
}) => {
  const [isSosActive, setIsSosActive] = useState(false);
  const [holdingProgress, setHoldingProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Network loss detection & offline fallback prompt
  const [isNetworkLost, setIsNetworkLost] = useState<boolean>(!navigator.onLine);
  const [showOfflineSmsPrompt, setShowOfflineSmsPrompt] = useState<boolean>(false);
  const [simulatedNetworkLoss, setSimulatedNetworkLoss] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsNetworkLost(true);
      setShowOfflineSmsPrompt(true);
    };
    const handleOnline = () => {
      setIsNetworkLost(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Sync external SOS trigger from Auto-SOS fall/shake
  useEffect(() => {
    if (externalActiveSos) {
      setIsSosActive(true);
      if (initialCustomNote) {
        setCustomNote(initialCustomNote);
      }
    }
  }, [externalActiveSos, initialCustomNote]);

  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const countdownIntervalRef = useRef<number | null>(null);

  // Fetch initial location passively on mount so it's ready in 0.1s during emergencies
  useEffect(() => {
    getCurrentLocation()
      .then((coords) => setLocation(coords))
      .catch((err) => console.log('Location prefetch note:', err.message));
  }, []);

  // Update siren state
  useEffect(() => {
    setIsSirenOn(isSirenPlaying());
  }, []);

  const triggerSosNow = async () => {
    setIsHolding(false);
    setHoldingProgress(0);
    setCountdown(null);
    setIsSosActive(true);

    // If network is lost, immediately surface hard-coded offline SMS intent
    if (!navigator.onLine || isNetworkLost || simulatedNetworkLoss) {
      setShowOfflineSmsPrompt(true);
    }

    // Refresh high precision location
    setLocationLoading(true);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (e) {
      console.warn('Could not refresh location:', e);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleHoldStart = () => {
    if (isSosActive) return;
    setIsHolding(true);
    holdStartRef.current = Date.now();
    const duration = 1200; // 1.2s hold duration

    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldingProgress(progress);

      if (progress >= 100) {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        startCountdown();
      }
    }, 30);
  };

  const handleHoldEnd = () => {
    if (countdown !== null) return; // in countdown phase
    setIsHolding(false);
    setHoldingProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const startCountdown = () => {
    let timeLeft = 3;
    setCountdown(timeLeft);

    countdownIntervalRef.current = window.setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        triggerSosNow();
      } else {
        setCountdown(timeLeft);
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setIsHolding(false);
    setHoldingProgress(0);
  };

  const cancelSos = () => {
    setIsSosActive(false);
    if (isSirenPlaying()) {
      stopEmergencySiren();
      setIsSirenOn(false);
    }
    setIsStrobeOn(false);
  };

  const toggleSiren = () => {
    if (isSirenOn) {
      stopEmergencySiren();
      setIsSirenOn(false);
    } else {
      startEmergencySiren();
      setIsSirenOn(true);
    }
  };

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const sosMessageText = formatSosText(userName, location, customNote);

  const handleWhatsAppBroadcast = () => {
    const notifyPhones = contacts.filter((c) => c.notifyOnSos).map((c) => c.phone);
    const targetPhone = notifyPhones[0] || (primaryContact ? primaryContact.phone : '');
    dispatchWhatsApp(targetPhone, sosMessageText);
  };

  const handleSmsBroadcast = () => {
    if (primaryContact) {
      dispatchSms(primaryContact.phone, sosMessageText);
    } else {
      dispatchSms('', sosMessageText);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EMERGENCY ALERT: ${userName}`,
          text: sosMessageText,
          url: location ? buildGoogleMapsUrl(location.lat, location.lng) : undefined,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(sosMessageText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyLocation = () => {
    if (location) {
      const url = buildGoogleMapsUrl(location.lat, location.lng);
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const quickNotes = [
    'Suspicious person following me',
    'Cab deviated from route',
    'Unsafe public transit / dark street',
    'Being harassed, need urgent call',
  ];

  return (
    <div className="w-full">
      {/* Fullscreen Strobe Light Overlay if enabled */}
      {isStrobeOn && (
        <div
          onClick={() => setIsStrobeOn(false)}
          className="fixed inset-0 z-50 animate-ping opacity-90 pointer-events-auto bg-white flex items-center justify-center cursor-pointer"
          style={{ animationDuration: '180ms' }}
        >
          <div className="bg-black text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl">
            TAP ANYWHERE TO TURN OFF STROBE
          </div>
        </div>
      )}

      {/* Countdown Modal if activated */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center font-black text-4xl mb-4 animate-bounce">
              {countdown}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Triggering Emergency SOS
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Dispatching live location and alerting your trusted circle in {countdown} seconds.
            </p>
            <div className="space-y-3">
              <button
                onClick={triggerSosNow}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Trigger Immediately
              </button>
              <button
                onClick={cancelCountdown}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel (False Alarm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Beacon Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big SOS Trigger and Immediate Defense Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TOTAL NETWORK LOSS FALLBACK MECHANISM BANNER */}
          {(isNetworkLost || simulatedNetworkLoss || showOfflineSmsPrompt) && (
            <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white p-5 rounded-3xl shadow-xl border border-amber-400/40 animate-fade-in relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                    <WifiOff className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        CRITICAL FALLBACK
                      </span>
                      <span className="text-[10px] text-amber-200 font-bold">GSM Intent Active</span>
                    </div>
                    <h3 className="text-base font-extrabold mt-0.5">
                      Total Network Loss Detected
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowOfflineSmsPrompt(false);
                    setSimulatedNetworkLoss(false);
                  }}
                  className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-rose-100 mt-2.5 leading-relaxed">
                Cellular data &amp; internet connection are offline. WhatsApp and cloud alerts cannot be delivered.
                Trigger the hard-coded system intent below to transmit your <strong>last known GPS coordinates</strong> to primary emergency contacts via native SMS.
              </p>

              {/* Last Known Coordinates Badge */}
              <div className="mt-3 p-3 bg-black/30 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                  <div>
                    <span className="text-[10px] text-amber-200 uppercase font-bold block">
                      Last Known Location:
                    </span>
                    <span className="text-white text-xs">
                      {location
                        ? `${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E (±${Math.round(location.accuracy ?? 10)}m)`
                        : 'Pre-cached offline GPS lock'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyLocation}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-sans font-bold"
                >
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Hard-Coded System Intent Trigger */}
              <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
                    const targetPhone = primary ? primary.phone : '';
                    const offlineSmsText = formatSosText(
                      userName,
                      location,
                      '[TOTAL NETWORK LOSS]: Emergency triggered during cellular blackout. Last known GPS location attached.'
                    );
                    dispatchSms(targetPhone, offlineSmsText);
                  }}
                  className="flex-1 py-3 px-4 bg-white hover:bg-amber-50 text-rose-700 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4 text-rose-600" />
                  <span>TRIGGER HARD-CODED OFFLINE SMS INTENT</span>
                </button>

                <button
                  onClick={() => setSimulatedNetworkLoss(!simulatedNetworkLoss)}
                  className="px-3 py-2 bg-black/25 hover:bg-black/35 text-white/90 rounded-xl text-[11px] font-bold"
                >
                  {simulatedNetworkLoss ? 'Reset Test' : 'Simulate Blackout'}
                </button>
              </div>
            </div>
          )}

          {/* Active State Banner */}
          {isSosActive ? (
            <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-lg shadow-rose-600/20">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="font-bold text-lg tracking-wide">
                    EMERGENCY SOS BEACON ACTIVE
                  </span>
                </div>
                <button
                  onClick={cancelSos}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white text-rose-700 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
                >
                  I Am Safe (Deactivate)
                </button>
              </div>
              <p className="text-sm text-rose-100 mb-4">
                Your emergency beacon is broadcasting. Dispatch alerts to WhatsApp or SMS below, or sound the siren to attract immediate bystander help.
              </p>

              {/* Instant Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={handleWhatsAppBroadcast}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <MessageSquare className="w-5 h-5 mb-1.5 text-emerald-300" />
                  <span className="text-xs font-semibold block">WhatsApp SOS</span>
                  <span className="text-[10px] text-rose-100 truncate">1-Tap Message</span>
                </button>

                <button
                  onClick={handleSmsBroadcast}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <Phone className="w-5 h-5 mb-1.5 text-amber-300" />
                  <span className="text-xs font-semibold block">SMS Beacon</span>
                  <span className="text-[10px] text-rose-100 truncate">Send to Guardian</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <Share2 className="w-5 h-5 mb-1.5 text-sky-300" />
                  <span className="text-xs font-semibold block">Broadcast Share</span>
                  <span className="text-[10px] text-rose-100 truncate">All Apps</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle Trigger Box */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
              <div className="max-w-md mx-auto">
                <span className="text-xs font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
                  Rapid Emergency Trigger
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
                  One-Touch Safety Beacon
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
                  Press and hold the button for 1.2 seconds or tap the instant trigger to broadcast your GPS and alert your circle.
                </p>

                {/* Big Tactile SOS Button */}
                <div className="relative inline-flex items-center justify-center my-2">
                  {/* Outer pulsating glow */}
                  <div
                    className={`absolute -inset-3 rounded-full transition-all duration-300 ${
                      isHolding
                        ? 'bg-rose-500/40 animate-ping'
                        : 'bg-rose-500/10'
                    }`}
                  />

                  {/* SVG progress ring around button */}
                  <svg className="w-52 h-52 -rotate-90 pointer-events-none absolute">
                    <circle
                      cx="104"
                      cy="104"
                      r="98"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="104"
                      cy="104"
                      r="98"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={615.7}
                      strokeDashoffset={615.7 - (615.7 * holdingProgress) / 100}
                      className="text-rose-600 transition-all duration-75"
                    />
                  </svg>

                  {/* The actual button */}
                  <button
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-extrabold shadow-xl select-none transition-transform active:scale-95 cursor-pointer ${
                      isHolding
                        ? 'bg-rose-700 shadow-rose-600/50 scale-95'
                        : 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-rose-600/30 hover:shadow-rose-600/40'
                    }`}
                  >
                    <ShieldAlert className="w-10 h-10 mb-1" />
                    <span className="text-3xl tracking-wider">SOS</span>
                    <span className="text-[11px] font-medium opacity-90 mt-0.5">
                      {isHolding ? 'HOLDING...' : 'HOLD TO ALERT'}
                    </span>
                  </button>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={triggerSosNow}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-3 py-1.5"
                  >
                    Instant Emergency Tap (Skip Hold)
                  </button>

                  {onOpenLockScreen && (
                    <button
                      onClick={onOpenLockScreen}
                      className="px-4 py-2 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm border border-slate-800 transition-all active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                      <span>Launch 1-Touch Lock Screen Mode</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Hardware & Defense Tools Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Siren Alarm */}
            <button
              onClick={toggleSiren}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isSirenOn
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {isSirenOn ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Audio</span>
              </div>
              <div>
                <p className="text-sm font-bold">{isSirenOn ? 'Stop Siren' : 'Police Siren'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-decibel</p>
              </div>
            </button>

            {/* Strobe Light */}
            <button
              onClick={() => setIsStrobeOn(!isStrobeOn)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isStrobeOn
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Visual</span>
              </div>
              <div>
                <p className="text-sm font-bold">Strobe Light</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disorient</p>
              </div>
            </button>

            {/* Ambient Audio Evidence */}
            <button
              onClick={onStartAudioRecording}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isAudioRecording
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {isAudioRecording ? (
                  <Square className="w-5 h-5 text-rose-600 fill-current" />
                ) : (
                  <Mic className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mic</span>
              </div>
              <div>
                <p className="text-sm font-bold">
                  {isAudioRecording ? 'Recording...' : 'Record Audio'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evidence</p>
              </div>
            </button>

            {/* Fake Call Trigger */}
            <button
              onClick={onOpenFakeCall}
              className="p-3.5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">De-escalate</span>
              </div>
              <div>
                <p className="text-sm font-bold">Fake Call</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Exit excuse</p>
              </div>
            </button>

            {/* Emergency Lock Screen */}
            <button
              onClick={onOpenLockScreen}
              className="p-3.5 rounded-2xl border bg-black text-white border-slate-800 hover:border-rose-500/50 transition-all text-left flex flex-col justify-between shadow-sm group active:scale-95 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between mb-2">
                <Lock className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] uppercase font-bold tracking-wider text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded">0-Distract</span>
              </div>
              <div>
                <p className="text-sm font-bold">Lock Screen</p>
                <p className="text-xs text-slate-400 mt-0.5">Focus SOS</p>
              </div>
            </button>
          </div>

          {/* Quick Context / Incident Note */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Add Context to SOS Alert (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g., Driver missed exit, walking in dark alley..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
            />
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickNotes.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => setCustomNote(note)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry, GPS Map Link, Direct SOS Dispatches (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Location Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live GPS Coordinates
                </h3>
              </div>
              <button
                onClick={() => {
                  setLocationLoading(true);
                  getCurrentLocation()
                    .then((c) => setLocation(c))
                    .finally(() => setLocationLoading(false));
                }}
                disabled={locationLoading}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
              >
                {locationLoading ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>

            {location ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latitude:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {location.lat.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Longitude:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {location.lng.toFixed(6)}
                    </span>
                  </div>
                  {location.accuracy && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Precision:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ±{location.accuracy} meters
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={buildGoogleMapsUrl(location.lat, location.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={handleCopyLocation}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Copy Google Maps link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Acquiring satellite lock...</p>
                <button
                  onClick={() => {
                    setLocationLoading(true);
                    getCurrentLocation()
                      .then((c) => setLocation(c))
                      .finally(() => setLocationLoading(false));
                  }}
                  className="mt-2 text-xs font-semibold text-rose-600 underline"
                >
                  Enable Location
                </button>
              </div>
            )}
          </div>

          {/* Emergency Dispatch Deck */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Direct Emergency Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Send SOS with 1 click to verified phone lines and contacts.
            </p>

            <div className="space-y-2.5">
              {/* WhatsApp Broadcast */}
              <button
                onClick={handleWhatsAppBroadcast}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send WhatsApp Distress Link</span>
                </div>
                <span className="text-[11px] opacity-80">Primary Circle</span>
              </button>

              {/* Native SMS Broadcast */}
              <button
                onClick={handleSmsBroadcast}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4" />
                  <span>Send SMS Coordinates</span>
                </div>
                <span className="text-[11px] opacity-80">
                  {primaryContact ? primaryContact.name : 'Emergency SMS'}
                </span>
              </button>

              {/* Primary Guardian Call */}
              {primaryContact && (
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-rose-200 dark:border-rose-900"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4" />
                    <span>Call Guardian ({primaryContact.name})</span>
                  </div>
                  <span className="text-[11px] font-mono">{primaryContact.phone}</span>
                </a>
              )}

              {/* Dedicated India Women Safety Helpline Dials (100% Offline via Cellular Voice) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Emergency Numbers in India (Women Safety)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 rounded-xl text-left border border-amber-200 dark:border-amber-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-amber-700 dark:text-amber-400">112</span>
                      <span className="text-[9px] px-1 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 rounded font-semibold">Pan-India</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Police &amp; ERSS</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">All-in-one Emergency</span>
                  </a>

                  <a
                    href="tel:1091"
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 rounded-xl text-left border border-rose-200 dark:border-rose-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-rose-700 dark:text-rose-400">1091</span>
                      <span className="text-[9px] px-1 py-0.5 bg-rose-200/60 dark:bg-rose-900/60 rounded font-semibold">24/7 Desk</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Women Police</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Distress &amp; Molestation</span>
                  </a>

                  <a
                    href="tel:181"
                    className="p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 rounded-xl text-left border border-sky-200 dark:border-sky-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-sky-700 dark:text-sky-400">181</span>
                      <span className="text-[9px] px-1 py-0.5 bg-sky-200/60 dark:bg-sky-900/60 rounded font-semibold">WCD Govt</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Women Helpline</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Crisis &amp; Domestic Rescue</span>
                  </a>

                  <a
                    href="tel:1090"
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 rounded-xl text-left border border-purple-200 dark:border-purple-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-purple-700 dark:text-purple-400">1090</span>
                      <span className="text-[9px] px-1 py-0.5 bg-purple-200/60 dark:bg-purple-900/60 rounded font-semibold">Anti-Stalking</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Women Power Line</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Cyber &amp; Phone Stalking</span>
                  </a>

                  <a
                    href="tel:1930"
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 rounded-xl text-left border border-emerald-200 dark:border-emerald-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-emerald-700 dark:text-emerald-400">1930</span>
                      <span className="text-[9px] px-1 py-0.5 bg-emerald-200/60 dark:bg-emerald-900/60 rounded font-semibold">Cyber Cell</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Cyber Crime MHA</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Morphed Photos &amp; Extortion</span>
                  </a>

                  <a
                    href="tel:139"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-left border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-mono text-slate-700 dark:text-slate-300">139</span>
                      <span className="text-[9px] px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-semibold">RPF Rail</span>
                    </div>
                    <span className="text-[11px] font-bold block mt-0.5">Railway Security</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Train &amp; Station Escort</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accelerometer Auto-SOS Protection & Calibration Panel */}
      <div className="mt-8">
        <AutoSosSettingsCard
          config={autoSosConfig}
          onUpdateConfig={onUpdateAutoSosConfig}
          isEnabled={isAutoSosEnabled}
          onToggleEnabled={onToggleAutoSosEnabled}
          telemetry={telemetry}
          onSimulateFall={onSimulateFall}
          onSimulateShake={onSimulateShake}
          onResetPeak={onResetPeak}
          onRequestPermission={onRequestPermission}
          onOpenPayment={onOpenPayment}
          subscription={subscription}
        />
      </div>
    </div>
  );
};
