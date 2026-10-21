import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Volume2, Activity } from 'lucide-react';
import { MotionTriggerReason } from '../utils/motionDetector';
import { playWarningCountdownBeep } from '../utils/audioAlert';

interface AutoSosWarningModalProps {
  isOpen: boolean;
  reason: MotionTriggerReason | null;
  magnitude: number;
  onConfirmSos: (reason: MotionTriggerReason) => void;
  onCancel: () => void;
}

export const AutoSosWarningModal: React.FC<AutoSosWarningModalProps> = ({
  isOpen,
  reason,
  magnitude,
  onConfirmSos,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !reason) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(10);
      return;
    }

    setSecondsLeft(10);
    // Initial warning beep & vibration
    playWarningCountdownBeep(10);
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }

    let currentSeconds = 10;
    timerRef.current = window.setInterval(() => {
      currentSeconds -= 1;
      setSecondsLeft(currentSeconds);

      if (currentSeconds > 0) {
        playWarningCountdownBeep(currentSeconds);
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onConfirmSos(reason);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, reason]);

  if (!isOpen || !reason) return null;

  const isFall = reason === 'fall';
  const title = isFall ? 'Sudden Fall / Hard Impact Detected!' : 'Violent Distress Shaking Detected!';
  const description = isFall
    ? 'A sudden free-fall followed by severe ground deceleration was detected by the device accelerometer.'
    : 'Rapid, violent shaking motions matching physical distress or struggle were detected.';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-2 border-rose-500 space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Pulsating Icon & Countdown */}
        <div className="relative inline-flex items-center justify-center">
          <span className="absolute -inset-4 rounded-full bg-rose-500/30 animate-ping" />
          <div className="w-24 h-24 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center font-black text-4xl shadow-xl shadow-rose-600/40 tabular-nums">
            {secondsLeft}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Automatic Sensor Trigger</span>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Telemetry Snapshot */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-600" />
            <span>Peak G-Force:</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
            {magnitude.toFixed(1)} m/s² (~{(magnitude / 9.8).toFixed(1)}g)
          </span>
        </div>

        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
          SOS beacon will broadcast live GPS coordinates to guardians in {secondsLeft} seconds.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Huge I AM OK Button */}
          <button
            onClick={onCancel}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>I AM OK — CANCEL SOS</span>
          </button>

          {/* Immediate SOS Bypass */}
          <button
            onClick={() => onConfirmSos(reason)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors"
          >
            I Need Help — Trigger SOS Now
          </button>
        </div>
      </div>
    </div>
  );
};
