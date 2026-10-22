import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Phone,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  MessageSquare,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  Smartphone,
  EyeOff,
  Flame,
  Radio,
  WifiOff,
  HeartPulse
} from 'lucide-react';
import { EmergencyContact, LocationCoordinates } from '../types';
import { getCurrentLocation, buildGoogleMapsUrl, formatSosText, dispatchSms } from '../utils/location';
import { startEmergencySiren, stopEmergencySiren, isSirenPlaying } from '../utils/audioAlert';

interface QuickSosWidgetProps {
  contacts: EmergencyContact[];
  userName: string;
  userLocation: LocationCoordinates | null;
  onEnterCloak?: () => void;
  onTriggerSosMain?: () => void;
}

export const QuickSosWidget: React.FC<QuickSosWidgetProps> = ({
  contacts,
  userName,
  userLocation,
  onEnterCloak,
  onTriggerSosMain,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [sosActivated, setSosActivated] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<LocationCoordinates | null>(userLocation);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const strobeIntervalRef = useRef<number | null>(null);

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  // Keep coords up to date
  useEffect(() => {
    if (userLocation) {
      setCurrentCoords(userLocation);
    }
  }, [userLocation]);

  // Keep siren state in sync
  useEffect(() => {
    setIsSirenOn(isSirenPlaying());
  }, [isOpen]);

  // Screen strobe flash effect
  useEffect(() => {
    if (isStrobeOn) {
      strobeIntervalRef.current = window.setInterval(() => {
        document.body.classList.toggle('invert');
      }, 120);
    } else {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
        strobeIntervalRef.current = null;
      }
      document.body.classList.remove('invert');
    }

    return () => {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
      }
      document.body.classList.remove('invert');
    };
  }, [isStrobeOn]);

  const handleToggleSiren = () => {
    if (isSirenOn) {
      stopEmergencySiren();
      setIsSirenOn(false);
    } else {
      startEmergencySiren();
      setIsSirenOn(true);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 500]);
      }
    }
  };

  const handleTriggerOfflineSos = async () => {
    setSosActivated(true);
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
    // Automatically trigger siren
    if (!isSirenPlaying()) {
      startEmergencySiren();
      setIsSirenOn(true);
    }

    // Refresh satellite location
    setIsRefreshingLocation(true);
    try {
      const freshCoords = await getCurrentLocation();
      setCurrentCoords(freshCoords);
    } catch {
      // offline fallback retained
    } finally {
      setIsRefreshingLocation(false);
    }

    if (onTriggerSosMain) {
      onTriggerSosMain();
    }
  };

  const handleSendOfflineSms = () => {
    const text = formatSosText(userName, currentCoords, 'URGENT: Triggered from Quick SOS Widget! Please call police or track me immediately.');
    const target = primaryContact ? primaryContact.phone : '';
    dispatchSms(target, text);
  };

  const handleCopyLocation = () => {
    if (currentCoords) {
      const url = buildGoogleMapsUrl(currentCoords.lat, currentCoords.lng);
      const text = `EMERGENCY LOCATION (${userName}): ${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)} -> ${url}`;
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Top Indian Women Safety Helplines
  const topIndiaHelplines = [
    {
      num: '112',
      name: 'All-in-One ERSS',
      desc: 'National Police / Ambulance / Fire',
      badge: 'Pan-India 24/7',
      primary: true,
    },
    {
      num: '1091',
      name: 'Women Police Helpline',
      desc: 'Anti-Stalking & Distress Patrol',
      badge: 'Women Police',
      primary: true,
    },
    {
      num: '181',
      name: 'National Women Helpline',
      desc: 'Domestic Violence & Rescue (WCD)',
      badge: 'Toll-Free',
      primary: false,
    },
    {
      num: '1090',
      name: 'Women Power Line',
      desc: 'Anti-Stalking & Cyber Harassment',
      badge: 'UP / Pan-India',
      primary: false,
    },
    {
      num: '1930',
      name: 'Cyber Crime Reporting',
      desc: 'Morphed photos & blackmail extortion',
      badge: 'MHA Helpline',
      primary: false,
    },
    {
      num: '139',
      name: 'Railway Women Safety',
      desc: 'Train coach escort & station safety',
      badge: 'RPF 24/7',
      primary: false,
    },
  ];

  return (
    <>
      {/* 1. FLOATING MINIMAL QUICK WIDGET DOCK (Always visible at bottom-right) */}
      {!isOpen && (
        <aside
          aria-label="Offline Quick SOS Widget"
          className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex items-center gap-2 drop-shadow-2xl animate-fade-in"
        >
          {/* Quick 112 Direct Dial button */}
          <a
            href="tel:112"
            className="w-11 h-11 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform"
            title="Immediate Call to 112 India"
          >
            <span className="font-extrabold text-xs">112</span>
          </a>

          {/* Quick Siren alarm toggle */}
          <button
            onClick={handleToggleSiren}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              isSirenOn
                ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-400/50'
                : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800'
            }`}
            title={isSirenOn ? 'Stop Siren Alarm' : 'Sound Piercing Alarm (Works Offline)'}
          >
            {isSirenOn ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Main Expand Widget Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="group px-3.5 py-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 border border-white/20"
          >
            <div className="relative">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-rose-600"></span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black tracking-wide">QUICK SOS</span>
                <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded font-semibold uppercase">Offline</span>
              </div>
              <span className="text-[10px] text-rose-100 opacity-90 block leading-none">Instant Widget</span>
            </div>
            <Maximize2 className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform hidden sm:block" />
          </button>
        </aside>
      )}

      {/* 2. EXPANDED HOME-SCREEN-LIKE QUICK-ACCESS WIDGET MODAL / LOCK SCREEN DOCK */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-sos-title"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
        >
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Widget Top Bar / Simulated Mobile Lock Screen Status */}
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center shadow-inner">
                  <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 id="quick-sos-title" className="text-sm font-extrabold tracking-wide text-white">
                      EMERGENCY QUICK WIDGET
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      100% OFFLINE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Works without internet, WiFi, or cellular data
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onEnterCloak && (
                  <button
                    onClick={onEnterCloak}
                    title="Quick disguise as Calculator"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Giant Instant SOS Trigger */}
              <div className="text-center relative py-2">
                <button
                  onClick={handleTriggerOfflineSos}
                  className={`w-36 h-36 mx-auto rounded-full text-white flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-95 ${
                    sosActivated
                      ? 'bg-gradient-to-tr from-rose-700 to-rose-600 ring-8 ring-rose-500/30'
                      : 'bg-gradient-to-tr from-rose-600 to-rose-500 hover:scale-105 ring-4 ring-rose-500/20'
                  }`}
                >
                  <Flame className="w-9 h-9 mb-1" />
                  <span className="text-3xl font-black tracking-wider">SOS</span>
                  <span className="text-[10px] font-bold tracking-widest opacity-90 uppercase mt-0.5">
                    {sosActivated ? 'ALERT ACTIVE' : 'TAP FOR 0-SEC SOS'}
                  </span>
                </button>

                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                  Immediate 1-tap activation. Sounds alarm, reads GPS &amp; preps rescue SMS.
                </p>
              </div>

              {/* Hardware Quick Action Grid (Siren, Strobe, SMS, Coordinates) */}
              <div className="grid grid-cols-4 gap-2">
                {/* 1. Piercing Siren */}
                <button
                  onClick={handleToggleSiren}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                    isSirenOn
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isSirenOn ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span className="text-[10px] font-bold mt-1 leading-tight">
                    {isSirenOn ? 'Stop Siren' : '120dB Siren'}
                  </span>
                </button>

                {/* 2. Visual Strobe */}
                <button
                  onClick={() => setIsStrobeOn(!isStrobeOn)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                    isStrobeOn
                      ? 'bg-amber-500 border-amber-400 text-white shadow-lg ring-2 ring-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110" />
                  <span className="text-[10px] font-bold mt-1 leading-tight">
                    {isStrobeOn ? 'Strobe ON' : 'Strobe'}
                  </span>
                </button>

                {/* 3. Offline SMS */}
                <button
                  onClick={handleSendOfflineSms}
                  className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-2xl text-center flex flex-col items-center justify-center transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold mt-1 leading-tight">Send SMS</span>
                </button>

                {/* 4. Copy GPS */}
                <button
                  onClick={handleCopyLocation}
                  className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-2xl text-center flex flex-col items-center justify-center transition-all"
                >
                  {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-sky-500" />}
                  <span className="text-[10px] font-bold mt-1 leading-tight">
                    {copiedLink ? 'Copied' : 'Copy GPS'}
                  </span>
                </button>
              </div>

              {/* Primary Guardian One-Touch Call */}
              {primaryContact && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Primary Guardian
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {primaryContact.name} ({primaryContact.relationship})
                      </h4>
                      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {primaryContact.phone}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-transform"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              )}

              {/* Verified Emergency Numbers in India for Women Safety */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Emergency Numbers in India (Women Safety)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Toll-Free</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {topIndiaHelplines.map((item) => (
                    <a
                      key={item.num}
                      href={`tel:${item.num.replace(/\s+/g, '')}`}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                        item.primary
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 hover:bg-rose-100/70'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                          {item.num}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Satellite GPS Coordinates pill */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                      Offline Satellite Coordinates
                    </span>
                    <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">
                      {currentCoords
                        ? `${currentCoords.lat.toFixed(4)}° N, ${currentCoords.lng.toFixed(4)}° E (±${Math.round(currentCoords.accuracy ?? 10)}m)`
                        : 'Fetching GPS coordinates...'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyLocation}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Pin to Home Screen / Lock Screen Widget Guide Toggle */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <button
                  onClick={() => setShowInstallGuide(!showInstallGuide)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-500" />
                    <span>How to add 1-Tap Widget to your Phone Home Screen</span>
                  </div>
                  <span className="text-[11px] font-mono">{showInstallGuide ? 'Hide' : 'Show'}</span>
                </button>

                {showInstallGuide && (
                  <div className="mt-2.5 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl text-xs space-y-2 text-indigo-950 dark:text-indigo-200 animate-fade-in">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Add to Phone Lock/Home Screen:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>
                        <strong>Android (Chrome):</strong> Tap the 3 dots (⋮) in the top-right &rarr; tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install App&quot;</strong>.
                      </li>
                      <li>
                        <strong>iPhone (Safari):</strong> Tap the <strong>Share</strong> button (box with arrow) at the bottom &rarr; scroll down &rarr; tap <strong>&quot;Add to Home Screen&quot;</strong>.
                      </li>
                      <li>
                        <strong>Offline Guarantee:</strong> Once pinned, this emergency SOS widget opens instantly in less than 0.3s even with zero internet or airplane mode!
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Aegis India Women Safety • Offline Protocol
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Close Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
