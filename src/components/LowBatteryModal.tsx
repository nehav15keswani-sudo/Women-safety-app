import React, { useState, useEffect, useRef } from 'react';
import {
  BatteryWarning,
  MapPin,
  Send,
  X,
  ShieldAlert,
  Phone,
  ZapOff,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { EmergencyContact, LocationCoordinates } from '../types';
import { formatLowBatterySosText } from '../utils/batterySentinel';
import { dispatchSms } from '../utils/location';

interface LowBatteryModalProps {
  isOpen: boolean;
  batteryPercent: number;
  location: LocationCoordinates | null;
  contacts: EmergencyContact[];
  userName: string;
  onClose: () => void;
  onDispatched?: () => void;
}

export const LowBatteryModal: React.FC<LowBatteryModalProps> = ({
  isOpen,
  batteryPercent,
  location,
  contacts,
  userName,
  onClose,
  onDispatched,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [isDispatched, setIsDispatched] = useState(false);
  const timerRef = useRef<number | null>(null);

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      setIsDispatched(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Haptic vibration alert for low battery emergency
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    setSecondsRemaining(10);
    setIsDispatched(false);

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTriggerSend();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDispatched(true);

    const smsText = formatLowBatterySosText(userName, batteryPercent, location);

    if (primaryContact) {
      dispatchSms(primaryContact.phone, smsText);
    }

    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }

    if (onDispatched) {
      onDispatched();
    }

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="low-battery-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-500/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner animate-pulse shrink-0">
              <ZapOff className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-black uppercase tracking-wider">
                  BATTERY {batteryPercent}%
                </span>
                <span className="text-xs font-bold text-amber-200">Phone Dying</span>
              </div>
              <h3 id="low-battery-modal-title" className="text-xl font-black mt-0.5">
                Last-Gasp Location Beacon
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isDispatched ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Last Known Location Dispatched!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your emergency contacts have received your GPS coordinates before your phone shuts down.
              </p>
            </div>
          ) : (
            <>
              {/* Countdown Alert Box */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black text-2xl flex items-center justify-center shrink-0 shadow-inner">
                  {secondsRemaining}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Auto-Sending Last Location SMS in {secondsRemaining}s
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Your phone is almost dead. Dispatching coordinates before the battery shuts off.
                  </p>
                </div>
              </div>

              {/* Target Guardian & Coordinates Details */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Primary Recipient:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'Default Guardian'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Live GPS Lock:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {location
                      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                      : 'Acquiring satellite lock...'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerSend}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Last Location SMS Now</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel (I have a charger / Safe)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
