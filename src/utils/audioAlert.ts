// Web Audio API siren & ringtone synthesizer for reliable offline emergency alert

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: number | null = null;
let isSirenActive = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startEmergencySiren(): void {
  if (isSirenActive) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.7, now);
    sirenGain.connect(ctx.destination);

    sirenOscillator1 = ctx.createOscillator();
    sirenOscillator2 = ctx.createOscillator();

    sirenOscillator1.type = 'sawtooth';
    sirenOscillator2.type = 'sine';

    sirenOscillator1.connect(sirenGain);
    sirenOscillator2.connect(sirenGain);

    sirenOscillator1.start();
    sirenOscillator2.start();
    isSirenActive = true;

    // Siren frequency sweep: 600Hz to 1300Hz
    let highPitch = true;
    const sweep = () => {
      if (!isSirenActive || !sirenOscillator1 || !sirenOscillator2 || !audioCtx) return;
      const t = audioCtx.currentTime;
      const targetFreq = highPitch ? 1250 : 650;
      sirenOscillator1.frequency.setTargetAtTime(targetFreq, t, 0.18);
      sirenOscillator2.frequency.setTargetAtTime(targetFreq * 0.98, t, 0.18);
      highPitch = !highPitch;
    };

    sweep();
    sirenInterval = window.setInterval(sweep, 400);
  } catch (err) {
    console.error('Failed to trigger audio siren:', err);
  }
}

export function stopEmergencySiren(): void {
  if (!isSirenActive) return;
  isSirenActive = false;
  if (sirenInterval !== null) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  try {
    if (sirenOscillator1) {
      sirenOscillator1.stop();
      sirenOscillator1.disconnect();
      sirenOscillator1 = null;
    }
    if (sirenOscillator2) {
      sirenOscillator2.stop();
      sirenOscillator2.disconnect();
      sirenOscillator2 = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
  } catch (err) {
    console.warn('Error stopping siren oscillators:', err);
  }
}

export function isSirenPlaying(): boolean {
  return isSirenActive;
}

// Phone Ringing Tone Simulator (US/International standard dual 440Hz + 480Hz)
let ringGain: GainNode | null = null;
let ringOsc1: OscillatorNode | null = null;
let ringOsc2: OscillatorNode | null = null;
let ringInterval: number | null = null;
let isRinging = false;

export function startPhoneRingTone(): void {
  if (isRinging) return;
  try {
    const ctx = getAudioContext();
    ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0, ctx.currentTime);
    ringGain.connect(ctx.destination);

    ringOsc1 = ctx.createOscillator();
    ringOsc2 = ctx.createOscillator();

    ringOsc1.type = 'sine';
    ringOsc2.type = 'sine';

    ringOsc1.frequency.setValueAtTime(440, ctx.currentTime);
    ringOsc2.frequency.setValueAtTime(480, ctx.currentTime);

    ringOsc1.connect(ringGain);
    ringOsc2.connect(ringGain);

    ringOsc1.start();
    ringOsc2.start();
    isRinging = true;

    // Ring pattern: 2 seconds ON, 2.5 seconds OFF
    let ringCycle = true;
    const cycle = () => {
      if (!isRinging || !ringGain || !audioCtx) return;
      const t = audioCtx.currentTime;
      if (ringCycle) {
        ringGain.gain.cancelScheduledValues(t);
        ringGain.gain.setTargetAtTime(0.5, t, 0.05);
      } else {
        ringGain.gain.cancelScheduledValues(t);
        ringGain.gain.setTargetAtTime(0.0001, t, 0.05);
      }
      ringCycle = !ringCycle;
    };

    cycle();
    ringInterval = window.setInterval(cycle, 1500);
  } catch (err) {
    console.error('Failed to start ringtone:', err);
  }
}

export function stopPhoneRingTone(): void {
  if (!isRinging) return;
  isRinging = false;
  if (ringInterval !== null) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  try {
    if (ringOsc1) {
      ringOsc1.stop();
      ringOsc1.disconnect();
      ringOsc1 = null;
    }
    if (ringOsc2) {
      ringOsc2.stop();
      ringOsc2.disconnect();
      ringOsc2 = null;
    }
    if (ringGain) {
      ringGain.disconnect();
      ringGain = null;
    }
  } catch (err) {
    console.warn('Error stopping ringtone:', err);
  }
}

// Warning countdown pulse for Auto-SOS fall/shake detection
export function playWarningCountdownBeep(secondsRemaining: number): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch increases as secondsRemaining drops
    const baseFreq = secondsRemaining <= 3 ? 950 : secondsRemaining <= 6 ? 750 : 550;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch (e) {
    console.warn('Countdown beep failed:', e);
  }
}
