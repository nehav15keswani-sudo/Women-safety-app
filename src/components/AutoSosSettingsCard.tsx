import React, { useState } from 'react';
import {
  Activity,
  Zap,
  ShieldAlert,
  Play,
  RotateCcw,
  Sliders,
  Smartphone,
  Info
} from 'lucide-react';
import {
  SensitivityLevel,
  MotionTelemetry,
  MotionDetectorConfig
} from '../utils/motionDetector';

interface AutoSosSettingsCardProps {
  config: MotionDetectorConfig;
  onUpdateConfig: (newConfig: Partial<MotionDetectorConfig>) => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  telemetry: MotionTelemetry | null;
  onSimulateFall: () => void;
  onSimulateShake: () => void;
  onResetPeak: () => void;
  onRequestPermission: () => Promise<boolean>;
}

export const AutoSosSettingsCard: React.FC<AutoSosSettingsCardProps> = ({
  config,
  onUpdateConfig,
  isEnabled,
  onToggleEnabled,
  telemetry,
  onSimulateFall,
  onSimulateShake,
  onResetPeak,
  onRequestPermission,
}) => {
  const [permissionPrompted, setPermissionPrompted] = useState(false);

  const handleToggle = async () => {
    if (!isEnabled) {
      const granted = await onRequestPermission();
      setPermissionPrompted(true);
      if (granted) {
        onToggleEnabled(true);
      } else {
        // Still allow enabling so web preview / desktop simulation works
        onToggleEnabled(true);
      }
    } else {
      onToggleEnabled(false);
    }
  };

  const currentMagnitude = telemetry?.magnitude ?? 9.8;
  const peakMagnitude = telemetry?.peakMagnitude ?? 9.8;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Title & Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Accelerometer Sensor Protection
            </span>
            <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">
              Auto-SOS
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Fall &amp; Violent Shake Detection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Continuously monitors device acceleration. Triggers an automated emergency beacon if you suffer a severe sudden fall or shake your phone violently in distress.
          </p>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isEnabled ? 'Monitoring Active' : 'Sensor Off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
              isEnabled ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Feature Toggles & Sensitivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detection triggers */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Active Detection Triggers
          </label>
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.detectFall}
                onChange={(e) => onUpdateConfig({ detectFall: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Sudden Fall &amp; Hard Impact
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Free-fall weightlessness (&lt;2.8 m/s²) followed by hard ground impact (&gt;26 m/s²).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.detectShake}
                onChange={(e) => onUpdateConfig({ detectShake: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Violent Distress Shaking
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rapid, high-force back-and-forth movement during physical struggle or distress.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Sensitivity preset */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Sensitivity Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as SensitivityLevel[]).map((level) => {
              const isSelected = config.sensitivity === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateConfig({ sensitivity: level })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {level === 'medium' ? 'Medium (Rec.)' : level}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Info className="w-3.5 h-3.5 text-rose-500" />
              <span>Safety Safeguard</span>
            </div>
            <p>
              When a trigger fires, you will receive a loud 10-second countdown with an audible pulse to cancel accidental triggers before any SOS alert is sent.
            </p>
          </div>
        </div>
      </div>

      {/* Live Sensor Telemetry Meter */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Live Accelerometer Telemetry
            </span>
          </div>
          <button
            onClick={onResetPeak}
            className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Peak</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Magnitude</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {currentMagnitude} <span className="text-[10px] font-normal text-slate-500">m/s²</span>
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Peak G-Force</span>
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {peakMagnitude} <span className="text-[10px] font-normal text-slate-500">m/s²</span>
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">3-Axis (X / Y / Z)</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {telemetry ? `${telemetry.x} / ${telemetry.y} / ${telemetry.z}` : '0 / 0 / 9.8'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Sensor Status</span>
            <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {isEnabled ? 'Monitoring Active' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Dynamic Magnitude Visual Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              currentMagnitude > 24
                ? 'bg-rose-600'
                : currentMagnitude > 16
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (currentMagnitude / 35) * 100)}%` }}
          />
        </div>
      </div>

      {/* Safety Simulator / Verification Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Verify and test the Auto-SOS trigger without dropping your device:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateFall}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-500" />
            <span>Simulate Fall</span>
          </button>
          <button
            onClick={onSimulateShake}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Violent Shake</span>
          </button>
        </div>
      </div>
    </div>
  );
};
