// Battery Sentinel & Dying Phone Auto-SOS Broadcast Utility
import { LocationCoordinates, EmergencyContact } from '../types';
import { getCurrentLocation, buildGoogleMapsUrl, formatSosText, dispatchSms } from './location';

export interface BatteryConfig {
  isEnabled: boolean;
  thresholdPercent: number; // e.g. 5, 10, or 15
  autoDispatchSms: boolean;
  soundAudioWarning: boolean;
  lastDispatchedAt: number | null;
}

export interface BatteryState {
  level: number; // 0.0 to 1.0
  isCharging: boolean;
  isSupported: boolean;
  chargingTime: number;
  dischargingTime: number;
}

const BATTERY_CONFIG_KEY = 'safeguard_battery_config';
const BATTERY_LAST_DISPATCH_KEY = 'safeguard_battery_last_dispatch';

// Default configuration: enabled by default at 10% threshold
export function getBatteryConfig(): BatteryConfig {
  try {
    const raw = localStorage.getItem(BATTERY_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  return {
    isEnabled: true,
    thresholdPercent: 10, // 10% is standard critical warning in India/Android
    autoDispatchSms: true,
    soundAudioWarning: true,
    lastDispatchedAt: null,
  };
}

export function saveBatteryConfig(config: BatteryConfig): void {
  localStorage.setItem(BATTERY_CONFIG_KEY, JSON.stringify(config));
}

// Generate the distress SMS content for dying phone
export function formatLowBatterySosText(
  userName: string,
  batteryPercent: number,
  location: LocationCoordinates | null
): string {
  const mapLink = location
    ? buildGoogleMapsUrl(location.lat, location.lng)
    : 'GPS unavailable';

  const accuracyNote = location?.accuracy
    ? `(Accuracy: ±${Math.round(location.accuracy)}m)`
    : '';

  return `[CRITICAL LOW BATTERY SOS]: ${userName}'s phone is at ${batteryPercent}% battery and about to shut down completely!
LAST KNOWN LIVE LOCATION:
${mapLink} ${accuracyNote}
Please note these coordinates immediately before the phone turns off.
- Safe Guard Women Safety`;
}

// Battery Sentinel Listener Class
export class BatterySentinel {
  private config: BatteryConfig;
  private onStateChange: (state: BatteryState) => void;
  private onTriggerWarning: (batteryPercent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private batteryManager: any = null;
  private isListening = false;
  private hasDispatchedThisDischarge = false;

  constructor(
    config: BatteryConfig,
    onStateChange: (state: BatteryState) => void,
    onTriggerWarning: (batteryPercent: number) => void
  ) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.onTriggerWarning = onTriggerWarning;
  }

  public updateConfig(newConfig: Partial<BatteryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    saveBatteryConfig(this.config);
  }

  public async start(): Promise<boolean> {
    if (this.isListening) return true;

    // Check Battery Status API support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (typeof nav !== 'undefined' && typeof nav.getBattery === 'function') {
      try {
        const manager = await nav.getBattery();
        this.batteryManager = manager;
        this.isListening = true;

        const update = () => {
          const state: BatteryState = {
            level: manager.level,
            isCharging: manager.charging,
            isSupported: true,
            chargingTime: manager.chargingTime,
            dischargingTime: manager.dischargingTime,
          };
          this.onStateChange(state);
          this.evaluateThreshold(state);
        };

        manager.addEventListener('levelchange', update);
        manager.addEventListener('chargingchange', update);

        update();
        return true;
      } catch (err) {
        console.warn('Battery API error:', err);
      }
    }

    // Fallback if Battery API is not supported in this browser
    this.onStateChange({
      level: 0.85,
      isCharging: false,
      isSupported: false,
      chargingTime: 0,
      dischargingTime: 0,
    });
    return false;
  }

  private evaluateThreshold(state: BatteryState) {
    if (!this.config.isEnabled) return;

    // If phone is plugged in and charging, reset dispatch lockout
    if (state.isCharging) {
      this.hasDispatchedThisDischarge = false;
      return;
    }

    const currentPercent = Math.round(state.level * 100);

    // If battery drops below or equal to threshold and hasn't dispatched yet
    if (
      currentPercent <= this.config.thresholdPercent &&
      !this.hasDispatchedThisDischarge
    ) {
      this.hasDispatchedThisDischarge = true;
      this.onTriggerWarning(currentPercent);
    }
  }

  public stop(): void {
    this.isListening = false;
  }

  // Simulation method for testing without actually draining phone battery
  public simulateLowBattery(percent: number = 5): void {
    const simState: BatteryState = {
      level: percent / 100,
      isCharging: false,
      isSupported: true,
      chargingTime: 0,
      dischargingTime: 0,
    };
    this.onStateChange(simState);
    this.onTriggerWarning(percent);
  }

  public resetDispatchLockout(): void {
    this.hasDispatchedThisDischarge = false;
  }
}
