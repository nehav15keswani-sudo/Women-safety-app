// Speech simulation for Fake Call so anyone standing near hears a real person talking

export const FAKE_CALL_SCENARIOS = {
  guardian_pickup: {
    title: 'Guardian Waiting Outside',
    callerName: 'Alex (Guardian)',
    callerNumber: '+1 (555) 019-2834',
    phrases: [
      "Hey! I'm parked right outside the street corner with hazard lights on. I see you walking out. Are you safe? I'm coming to walk with you right now.",
      "Stay right there, I'm literally two steps away. Keep me on speaker.",
      "Got your live GPS location. Keep walking towards me, don't worry about anything."
    ]
  },
  father_waiting: {
    title: 'Family / Father Checking In',
    callerName: 'Dad',
    callerNumber: '+1 (555) 014-9821',
    phrases: [
      "Hello beta, Dad here. I'm waiting downstairs at the main gate. How many minutes until you reach? I'm coming over right now.",
      "I'm tracking your taxi ride on the map. Tell the driver you're on the phone with me.",
      "I'm standing by the car. See you in thirty seconds."
    ]
  },
  colleague_nearby: {
    title: 'Friend / Colleague Carpool',
    callerName: 'Maya (Roommate)',
    callerNumber: '+1 (555) 017-4320',
    phrases: [
      "Hey! We just arrived at the venue and everyone is waiting right outside for you. Should Sam and I walk down the block to meet you?",
      "Yeah, don't walk alone, we're heading towards your direction right now.",
      "We see your location pinned. We'll be at the intersection in one minute."
    ]
  },
  police_officer: {
    title: 'Security / Helpline Verification',
    callerName: 'Emergency Desk',
    callerNumber: '911 Dispatch',
    phrases: [
      "This is control room dispatch verifying your active safety channel. A patrol unit is stationed within 400 meters of your coordinates.",
      "Maintain open voice contact. Your telemetry and route are actively monitored.",
      "Confirm if you require an officer to approach your current position immediately."
    ]
  }
};

let currentUtterance: SpeechSynthesisUtterance | null = null;
let phraseInterval: number | null = null;

export function playScenarioVoice(scenarioKey: keyof typeof FAKE_CALL_SCENARIOS): void {
  stopScenarioVoice();
  if (!('speechSynthesis' in window)) return;

  const scenario = FAKE_CALL_SCENARIOS[scenarioKey] || FAKE_CALL_SCENARIOS.guardian_pickup;
  let phraseIndex = 0;

  const speakNext = () => {
    if (phraseIndex >= scenario.phrases.length) {
      phraseIndex = 0; // loop reassuring phrases
    }
    const text = scenario.phrases[phraseIndex];
    phraseIndex++;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try finding a natural voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Immediate first sentence after 400ms connection delay
  setTimeout(() => {
    speakNext();
    phraseInterval = window.setInterval(speakNext, 7000);
  }, 400);
}

export function stopScenarioVoice(): void {
  if (phraseInterval !== null) {
    clearInterval(phraseInterval);
    phraseInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
