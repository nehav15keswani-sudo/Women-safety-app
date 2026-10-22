// Motion and Accelerometer API Detector for Sudden Falls & Violent Shaking

export type SensitivityLevel = 'low' | 'medium' | 'high';
export type MotionTriggerReason = 'fall' | 'violent_shake';

export interface MotionTelemetry {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  peakMagnitude: number;
  lastShakeCount: number;
  isSupported: boolean;
  permissionGranted: boolean;
}

export interface MotionDetectorConfig {
  sensitivity: SensitivityLevel;
  detectFall: boolean;
  detectShake: boolean;
}

// Config threshold matrix
const THRESHOLDS = {
  high: {
    freeFallMax: 3.5, // m/s^2 (near weightless)
    impactMin: 22.0, // m/s^2 (sudden deceleration impact)
    shakeMagnitude: 20.0, // m/s^2
    shakeReversals: 3, // count in 1.2s
  },
  medium: {
    freeFallMax: 2.8,
    impactMin: 26.0,
    shakeMagnitude: 25.0,
    shakeReversals: 4,
  },
  low: {
    freeFallMax: 2.0,
    impactMin: 32.0,
    shakeMagnitude: 30.0,
    shakeReversals: 5,
  },
};

export class MotionDetector {
  private isListening = false;
  private config: MotionDetectorConfig;
  private onTrigger: (reason: MotionTriggerReason, magnitude: number) => void;
  private onTelemetry?: (telemetry: MotionTelemetry) => void;

  // Fall detection state tracking
  private freeFallTimestamp = 0;
  private lastTriggerTimestamp = 0;

  // Shake detection state tracking
  private shakeTimestamps: number[] = [];
  private lastSignX = 0;
  private lastSignY = 0;

  // Telemetry caching
  private peakMagnitude = 0;
  private isSupported = false;
  private permissionGranted = false;

  constructor(
    config: MotionDetectorConfig,
    onTrigger: (reason: MotionTriggerReason, magnitude: number) => void,
    onTelemetry?: (telemetry: MotionTelemetry) => void
  ) {
    this.config = config;
    this.onTrigger = onTrigger;
    this.onTelemetry = onTelemetry;
    this.isSupported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  public updateConfig(newConfig: Partial<MotionDetectorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if iOS 13+ permission request is required
    const DeviceMotionEventTyped = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };

    if (DeviceMotionEventTyped && typeof DeviceMotionEventTyped.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEventTyped.requestPermission();
        this.permissionGranted = response === 'granted';
        return this.permissionGranted;
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        return false;
      }
    }

    // Android & standard desktop browsers grant by default if event supported
    this.permissionGranted = true;
    return true;
  }

  public start(): boolean {
    if (this.isListening) return true;
    if (typeof window === 'undefined') return false;

    window.addEventListener('devicemotion', this.handleDeviceMotion, true);
    this.isListening = true;
    return true;
  }

  public stop(): void {
    if (!this.isListening) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
    }
    this.isListening = false;
    this.freeFallTimestamp = 0;
    this.shakeTimestamps = [];
  }

  private handleDeviceMotion = (event: DeviceMotionEvent): void => {
    // Prefer accelerationIncludingGravity for true free-fall & impact dynamics
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Vector magnitude |a| = sqrt(x^2 + y^2 + z^2)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > this.peakMagnitude) {
      this.peakMagnitude = Math.round(magnitude * 10) / 10;
    }

    const t = THRESHOLDS[this.config.sensitivity];

    // Cooldown check (don't retrigger within 15 seconds)
    const inCooldown = now - this.lastTriggerTimestamp < 15000;

    // 1. Fall Detection Logic
    if (this.config.detectFall && !inCooldown) {
      // Step A: Free-fall phase (weightlessness / dropping)
      if (magnitude < t.freeFallMax) {
        this.freeFallTimestamp = now;
      }
      // Step B: Impact phase (spike right after free fall within 800ms)
      else if (
        this.freeFallTimestamp > 0 &&
        now - this.freeFallTimestamp < 800 &&
        magnitude >= t.impactMin
      ) {
        this.lastTriggerTimestamp = now;
        this.freeFallTimestamp = 0;
        this.onTrigger('fall', magnitude);
      }
    }

    // 2. Violent Shake / Struggle Detection Logic
    if (this.config.detectShake && !inCooldown) {
      if (magnitude >= t.shakeMagnitude) {
        const signX = Math.sign(x);
        const signY = Math.sign(y);

        // Detect direction reversal
        if ((signX !== 0 && signX !== this.lastSignX) || (signY !== 0 && signY !== this.lastSignY)) {
          this.shakeTimestamps.push(now);
          this.lastSignX = signX;
          this.lastSignY = signY;

          // Keep only shakes within the sliding 1.2-second window
          this.shakeTimestamps = this.shakeTimestamps.filter((ts) => now - ts <= 1200);

          if (this.shakeTimestamps.length >= t.shakeReversals) {
            this.lastTriggerTimestamp = now;
            this.shakeTimestamps = [];
            this.onTrigger('violent_shake', magnitude);
          }
        }
      }
    }

    // Notify telemetry subscribers for live visual gauge
    if (this.onTelemetry) {
      this.onTelemetry({
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        z: Math.round(z * 10) / 10,
        magnitude: Math.round(magnitude * 10) / 10,
        peakMagnitude: this.peakMagnitude,
        lastShakeCount: this.shakeTimestamps.length,
        isSupported: this.isSupported,
        permissionGranted: this.permissionGranted,
      });
    }
  };

  // Test Simulation Methods
  public simulateFall(): void {
    this.lastTriggerTimestamp = Date.now();
    this.onTrigger('fall', 28.5);
  }

  public simulateViolentShake(): void {
    this.lastTriggerTimestamp = Date.now();
    this.onTrigger('violent_shake', 27.2);
  }

  public simulateShake(): void {
    this.simulateViolentShake();
  }

  public requestPermission(): Promise<boolean> {
    return this.requestPermissions();
  }

  public resetPeak(): void {
    this.peakMagnitude = 0;
  }
}
