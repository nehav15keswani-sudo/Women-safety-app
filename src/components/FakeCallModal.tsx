import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Grid,
  Clock,
  Sparkles,
  User,
  Shield,
  X
} from 'lucide-react';
import { FAKE_CALL_SCENARIOS, playScenarioVoice, stopScenarioVoice } from '../utils/speechVoice';
import { startPhoneRingTone, stopPhoneRingTone } from '../utils/audioAlert';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'configure' | 'waiting' | 'ringing' | 'in_call'>('configure');
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof FAKE_CALL_SCENARIOS>('guardian_pickup');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [secondsUntilRing, setSecondsUntilRing] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const delayTimerRef = useRef<number | null>(null);
  const callDurationTimerRef = useRef<number | null>(null);

  // Clean up sounds when modal unmounts or closes
  useEffect(() => {
    return () => {
      stopPhoneRingTone();
      stopScenarioVoice();
      if (delayTimerRef.current) clearInterval(delayTimerRef.current);
      if (callDurationTimerRef.current) clearInterval(callDurationTimerRef.current);
    };
  }, []);

  const handleStartSchedule = (delay: number) => {
    setDelaySeconds(delay);
    if (delay === 0) {
      triggerRinging();
    } else {
      setStage('waiting');
      setSecondsUntilRing(delay);
      delayTimerRef.current = window.setInterval(() => {
        setSecondsUntilRing((prev) => {
          if (prev <= 1) {
            clearInterval(delayTimerRef.current!);
            triggerRinging();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const triggerRinging = () => {
    setStage('ringing');
    startPhoneRingTone();
  };

  const handleAcceptCall = () => {
    stopPhoneRingTone();
    setStage('in_call');
    setCallDuration(0);
    playScenarioVoice(selectedScenario);

    callDurationTimerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleEndCall = () => {
    stopPhoneRingTone();
    stopScenarioVoice();
    if (callDurationTimerRef.current) clearInterval(callDurationTimerRef.current);
    if (delayTimerRef.current) clearInterval(delayTimerRef.current);
    setStage('configure');
    onClose();
  };

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentScenarioData = FAKE_CALL_SCENARIOS[selectedScenario];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 1. Ringing Screen (Authentic smartphone call incoming) */}
      {stage === 'ringing' && (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white flex flex-col justify-between p-8 z-50">
          {/* Top caller info */}
          <div className="pt-16 text-center space-y-2">
            <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-300 shadow-xl border border-slate-700">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mt-4">
              {currentScenarioData.callerName}
            </h2>
            <p className="text-sm text-slate-400 font-mono">
              {currentScenarioData.callerNumber}
            </p>
            <p className="text-xs text-rose-400 uppercase tracking-widest font-semibold pt-1 animate-pulse">
              Incoming Call...
            </p>
          </div>

          {/* Bottom Accept / Decline Actions */}
          <div className="pb-16 max-w-sm mx-auto w-full flex items-center justify-around">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleEndCall}
                className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 transition-transform active:scale-90"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <span className="text-xs text-slate-400 font-medium">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAcceptCall}
                className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 animate-bounce transition-transform active:scale-90"
              >
                <PhoneCall className="w-8 h-8" />
              </button>
              <span className="text-xs text-slate-400 font-medium">Accept</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. In-Call Connected Screen (Realistic ongoing call with voice dialogue) */}
      {stage === 'in_call' && (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white flex flex-col justify-between p-8 z-50">
          <div className="pt-16 text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {currentScenarioData.callerName}
            </h2>
            <p className="text-base text-slate-400 font-mono tabular-nums">
              {formatCallDuration(callDuration)}
            </p>
            <p className="text-xs text-emerald-400 pt-2 font-medium">
              Audio Dialogue Active (Listen or talk along)
            </p>
          </div>

          {/* In-Call Controls Grid */}
          <div className="max-w-xs mx-auto w-full grid grid-cols-3 gap-6 text-center my-auto">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full flex flex-col items-center justify-center ${
                isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-[10px] mt-1.5">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-full flex flex-col items-center justify-center ${
                isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-[10px] mt-1.5">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
            </button>

            <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex flex-col items-center justify-center">
              <Grid className="w-6 h-6" />
              <span className="text-[10px] mt-1.5">Keypad</span>
            </button>
          </div>

          {/* End Call Button */}
          <div className="pb-16 text-center">
            <button
              onClick={handleEndCall}
              className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-700 mx-auto flex items-center justify-center text-white shadow-xl shadow-rose-600/40 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <span className="text-xs text-slate-400 mt-2 block font-medium">End Call</span>
          </div>
        </div>
      )}

      {/* 3. Waiting Scheduled Screen */}
      {stage === 'waiting' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl mb-4 tabular-nums">
              {secondsUntilRing}s
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Fake Call Scheduled
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Your phone will ring in {secondsUntilRing} seconds from &quot;{currentScenarioData.callerName}&quot;. Keep your screen handy.
            </p>
            <div className="space-y-2">
              <button
                onClick={triggerRinging}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Ring Immediately
              </button>
              <button
                onClick={handleEndCall}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Configuration & Setup Screen */}
      {stage === 'configure' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                <Phone className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Realistic Escape Tool
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Fake Call Simulator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Provides a polite, undeniable reason to step away from uncomfortable conversations, awkward rides, or persistent strangers.
              </p>
            </div>

            {/* Caller Persona Selection */}
            <div className="space-y-4 mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Caller Scenario
              </label>
              <div className="space-y-2">
                {(Object.keys(FAKE_CALL_SCENARIOS) as Array<keyof typeof FAKE_CALL_SCENARIOS>).map((key) => {
                  const item = FAKE_CALL_SCENARIOS[key];
                  const isSelected = selectedScenario === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedScenario(key)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.callerName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {item.callerNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        &quot;{item.phrases[0].slice(0, 75)}...&quot;
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timing options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Trigger Timing
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleStartSchedule(0)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Ring Right Now
                </button>
                <button
                  onClick={() => handleStartSchedule(15)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  In 15 seconds
                </button>
                <button
                  onClick={() => handleStartSchedule(30)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  In 30 seconds
                </button>
                <button
                  onClick={() => handleStartSchedule(60)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  In 1 minute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
