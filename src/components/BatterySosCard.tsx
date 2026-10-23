import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  ZapOff,
  ShieldCheck,
  Send,
  Sliders,
  Check,
  Info,
  Radio
} from 'lucide-react';
import { BatteryConfig, BatteryState } from '../utils/batterySentinel';

interface BatterySosCardProps {
  config: BatteryConfig;
  onUpdateConfig: (newConfig: Partial<BatteryConfig>) => void;
  batteryState: BatteryState | null;
  onSimulateLowBattery: (percent?: number) => void;
}

export const BatterySosCard: React.FC<BatterySosCardProps> = ({
  config,
  onUpdateConfig,
  batteryState,
  onSimulateLowBattery,
}) => {
  const currentLevel = batteryState ? Math.round(batteryState.level * 100) : 85;
  const isCharging = batteryState?.isCharging ?? false;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
      {/* Top Header & Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <ZapOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Dying Phone Safety Sentinel
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                Auto-SMS
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Low Battery Auto-Location Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Automatically transmits your <strong>last known live GPS coordinates</strong> via SMS to guardians when your phone battery drops critically low (&le;{config.thresholdPercent}%) before the device turns off completely.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {config.isEnabled ? 'Sentinel Active' : 'Off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={config.isEnabled}
            onClick={() => onUpdateConfig({ isEnabled: !config.isEnabled })}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.isEnabled ? 'bg-amber-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Live Battery Meter & Threshold Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Battery Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isCharging
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                : currentLevel <= config.thresholdPercent
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              {isCharging ? (
                <BatteryCharging className="w-6 h-6" />
              ) : currentLevel <= config.thresholdPercent ? (
                <BatteryWarning className="w-6 h-6" />
              ) : (
                <Battery className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {currentLevel}%
                </span>
                <span className="text-xs text-slate-500">
                  {isCharging ? '• Charging on AC/USB' : '• On Battery'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isCharging
                  ? 'Guardians not alerted while charging.'
                  : `Auto-SMS triggers if battery reaches ${config.thresholdPercent}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Threshold Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Emergency Trigger Threshold
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((pct) => {
              const isSelected = config.thresholdPercent === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onUpdateConfig({ thresholdPercent: pct })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  &le; {pct}% {pct === 5 ? '(Dying)' : pct === 10 ? '(Rec.)' : '(Low)'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test Simulation Trigger Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Test the dying phone SMS dispatch without draining your battery:
        </span>
        <button
          type="button"
          onClick={() => onSimulateLowBattery(5)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <BatteryWarning className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulate Dying Phone (5% Test)</span>
        </button>
      </div>
    </div>
  );
};
