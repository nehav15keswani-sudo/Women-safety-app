import React, { useState, useEffect, useRef } from 'react';
import {
  Footprints,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Share2,
  Navigation,
  ShieldCheck,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { CheckInTrip, LocationCoordinates, EmergencyContact } from '../types';
import { getCurrentLocation, buildGoogleMapsUrl, dispatchWhatsApp, dispatchSms } from '../utils/location';
import { startEmergencySiren } from '../utils/audioAlert';

interface WalkWithMeProps {
  contacts: EmergencyContact[];
  userName: string;
}

export const WalkWithMe: React.FC<WalkWithMeProps> = ({ contacts, userName }) => {
  const [activeTrip, setActiveTrip] = useState<CheckInTrip | null>(() => {
    const saved = localStorage.getItem('aegis_active_trip');
    return saved ? JSON.parse(saved) : null;
  });

  const [destinationInput, setDestinationInput] = useState('');
  const [minutesInput, setMinutesInput] = useState(15);
  const [checkInIntervalInput, setCheckInIntervalInput] = useState(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);
  const [checkInDeadlineSeconds, setCheckInDeadlineSeconds] = useState(60);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);

  const timerRef = useRef<number | null>(null);
  const checkInTimerRef = useRef<number | null>(null);

  // Sync active trip to localStorage
  useEffect(() => {
    if (activeTrip) {
      localStorage.setItem('aegis_active_trip', JSON.stringify(activeTrip));
    } else {
      localStorage.removeItem('aegis_active_trip');
    }
  }, [activeTrip]);

  // Main journey timer loop
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((activeTrip.expectedEndAt - now) / 1000));
      setSecondsRemaining(diff);

      // Check periodic check-in condition
      const elapsedSinceCheckIn = (now - activeTrip.lastCheckInAt) / 1000 / 60;
      if (elapsedSinceCheckIn >= activeTrip.checkInIntervalMinutes && !needsCheckIn) {
        setNeedsCheckIn(true);
        setCheckInDeadlineSeconds(60);
      }

      if (diff === 0 && activeTrip.status === 'active') {
        // Time expired without safe arrival!
        handleTripExpired();
      }
    };

    calculateRemaining();
    timerRef.current = window.setInterval(calculateRemaining, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTrip, needsCheckIn]);

  // Urgent check-in countdown loop
  useEffect(() => {
    if (!needsCheckIn) {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
      return;
    }

    checkInTimerRef.current = window.setInterval(() => {
      setCheckInDeadlineSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(checkInTimerRef.current!);
          handleTripExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
    };
  }, [needsCheckIn]);

  // Periodic location breadcrumb collector
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'active') return;

    const updateLocation = async () => {
      try {
        const coords = await getCurrentLocation();
        setCurrentLocation(coords);
        setActiveTrip((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            breadcrumbs: [...prev.breadcrumbs.slice(-9), coords],
          };
        });
      } catch (err) {
        console.warn('GPS breadcrumb update failed:', err);
      }
    };

    updateLocation();
    const locInterval = window.setInterval(updateLocation, 45000); // every 45s
    return () => clearInterval(locInterval);
  }, [activeTrip?.id]);

  const handleStartTrip = async () => {
    const dest = destinationInput.trim() || 'Commute / Night Walk';
    const now = Date.now();
    let initialCoords: LocationCoordinates | null = null;
    try {
      initialCoords = await getCurrentLocation();
      setCurrentLocation(initialCoords);
    } catch (e) {
      console.warn('Initial GPS query skipped:', e);
    }

    const newTrip: CheckInTrip = {
      id: 'trip_' + now,
      destination: dest,
      estimatedMinutes: minutesInput,
      startedAt: now,
      expectedEndAt: now + minutesInput * 60 * 1000,
      checkInIntervalMinutes: checkInIntervalInput,
      lastCheckInAt: now,
      status: 'active',
      breadcrumbs: initialCoords ? [initialCoords] : [],
    };

    setActiveTrip(newTrip);
    setNeedsCheckIn(false);
  };

  const handleIHaveArrived = () => {
    if (!activeTrip) return;
    setActiveTrip({
      ...activeTrip,
      status: 'completed',
    });
    setNeedsCheckIn(false);
    setTimeout(() => {
      setActiveTrip(null);
      setDestinationInput('');
    }, 3000);
  };

  const handleConfirmSafetyCheckIn = () => {
    setNeedsCheckIn(false);
    if (activeTrip) {
      setActiveTrip({
        ...activeTrip,
        lastCheckInAt: Date.now(),
      });
    }
  };

  const handleAddFiveMinutes = () => {
    if (!activeTrip) return;
    setActiveTrip({
      ...activeTrip,
      expectedEndAt: activeTrip.expectedEndAt + 5 * 60 * 1000,
      estimatedMinutes: activeTrip.estimatedMinutes + 5,
    });
  };

  const handleTripExpired = () => {
    if (!activeTrip) return;
    setActiveTrip((prev) => (prev ? { ...prev, status: 'alert_triggered' } : null));
    startEmergencySiren();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleShareTrip = () => {
    if (!activeTrip) return;
    const mapUrl = currentLocation
      ? buildGoogleMapsUrl(currentLocation.lat, currentLocation.lng)
      : 'Location tracked on Aegis SafeGuard';
    const text = `🚶‍♀️ WALK WITH ME: ${userName} is en route to "${activeTrip.destination}". Expected arrival in ~${Math.ceil(
      secondsRemaining / 60
    )} mins.\nLive location: ${mapUrl}`;
    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
    if (primary) {
      dispatchWhatsApp(primary.phone, text);
    } else {
      dispatchWhatsApp('', text);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Active Trip Alert if missed check-in */}
      {needsCheckIn && (
        <div className="bg-amber-500 text-slate-950 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 shrink-0 text-slate-950" />
            <div>
              <h4 className="font-extrabold text-base">Safety Check-In Required</h4>
              <p className="text-xs font-medium">
                Confirm you are safe within <span className="font-bold underline">{checkInDeadlineSeconds}s</span> or automatic SOS will trigger!
              </p>
            </div>
          </div>
          <button
            onClick={handleConfirmSafetyCheckIn}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-950 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors whitespace-nowrap shadow-md"
          >
            I AM SAFE (CONFIRM)
          </button>
        </div>
      )}

      {/* When Alert is Triggered */}
      {activeTrip?.status === 'alert_triggered' && (
        <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-7 h-7 text-white animate-bounce" />
            <h3 className="text-lg font-bold">
              Check-in Window Missed — SOS Beacon Triggered
            </h3>
          </div>
          <p className="text-xs text-rose-100">
            You did not check in within the allotted time frame. Your emergency contacts are being alerted with your last known coordinates.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleIHaveArrived}
              className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl"
            >
              I Am Safe (Cancel Alarm)
            </button>
            <button
              onClick={handleShareTrip}
              className="px-4 py-2 bg-rose-800 text-white font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Resend Live Coordinates</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trip Status or Trip Creation (7 cols) */}
        <div className="lg:col-span-7">
          {activeTrip && activeTrip.status === 'completed' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Arrived Safely!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Your journey to &quot;{activeTrip.destination}&quot; has concluded. The emergency guardian check has been stood down.
              </p>
              <button
                onClick={() => {
                  setActiveTrip(null);
                  setDestinationInput('');
                }}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
              >
                Plan Another Journey
              </button>
            </div>
          ) : activeTrip && activeTrip.status === 'active' ? (
            /* Active Journey Cockpit */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Journey In Progress
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeTrip.destination}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Started at {new Date(activeTrip.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                  <Footprints className="w-6 h-6" />
                </div>
              </div>

              {/* Countdown Display */}
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">Estimated Time Remaining</span>
                <div className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums mt-1 font-mono">
                  {formatTimer(secondsRemaining)}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Check-in ping every {activeTrip.checkInIntervalMinutes} minutes</span>
                </div>
              </div>

              {/* Safe Arrival & Add Time Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleIHaveArrived}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>I Have Arrived Safely</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddFiveMinutes}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>+5 Mins (Delay)</span>
                  </button>

                  <button
                    onClick={handleShareTrip}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Share Live ETA</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Create New Journey Form */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Automated Journey Guardian
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Start Safe Commute
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Heading home late or taking a cab alone? Set your expected trip time. If you don&apos;t confirm arrival, Aegis automatically raises an alert.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Destination / Route
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      placeholder="e.g. Metro Station to Green Valley Apt 4B"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Duration presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Estimated Transit Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 25, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setMinutesInput(mins)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                          minutesInput === mins
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {mins} mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Periodic check-in interval */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Safety Check-In Ping Interval
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => setCheckInIntervalInput(interval)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                          checkInIntervalInput === interval
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        Every {interval} min
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartTrip}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-colors"
                >
                  <Footprints className="w-5 h-5" />
                  <span>Start &quot;Walk With Me&quot; Protection</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Why Walk With Me & Active Breadcrumb Snapshot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              How the Journey Guardian Works
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  1
                </div>
                <p>
                  <strong className="text-slate-900 dark:text-white">Continuous GPS lock:</strong> Aegis passively polls your coordinates every 45 seconds to create a breadcrumb trail.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  2
                </div>
                <p>
                  <strong className="text-slate-900 dark:text-white">Discreet Safety Pings:</strong> You receive a silent prompt on screen to verify you are OK. A quick single tap resets the timer.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  3
                </div>
                <p>
                  <strong className="text-slate-900 dark:text-white">Emergency Auto-Escalation:</strong> If a check-in is unanswered for 60 seconds, your phone sounds an alert and generates an urgent SOS dispatch link.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sharing Deck */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Share Route with Trusted Circle
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Send a 1-tap message to your primary guardian before stepping into a taxi or subway.
            </p>
            <button
              onClick={() => {
                const mapUrl = currentLocation
                  ? buildGoogleMapsUrl(currentLocation.lat, currentLocation.lng)
                  : 'Aegis SafeGuard GPS tracking';
                const msg = `Hi, I am starting my commute now. Track my trip: ${mapUrl}`;
                dispatchWhatsApp('', msg);
              }}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Send Pre-Commute WhatsApp Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
