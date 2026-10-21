import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  FileAudio,
  AlertTriangle,
  Clock,
  Shield,
  MapPin
} from 'lucide-react';
import { AudioRecording, LocationCoordinates } from '../types';
import { getCurrentLocation } from '../utils/location';

interface AudioEvidenceRecorderProps {
  recordings: AudioRecording[];
  onSaveRecording: (recording: AudioRecording) => void;
  onDeleteRecording: (id: string) => void;
  isExternalRecording: boolean;
  onToggleExternalRecording: () => void;
}

export const AudioEvidenceRecorder: React.FC<AudioEvidenceRecorderProps> = ({
  recordings,
  onSaveRecording,
  onDeleteRecording,
  isExternalRecording,
  onToggleExternalRecording,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync with external recording trigger (e.g. from SOS beacon)
  useEffect(() => {
    if (isExternalRecording && !isRecording) {
      startRecording();
    } else if (!isExternalRecording && isRecording) {
      stopRecording();
    }
  }, [isExternalRecording]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);

        let loc: LocationCoordinates | undefined;
        try {
          loc = await getCurrentLocation();
        } catch (e) {
          console.log('Location tagging skipped for recording:', e);
        }

        const newRec: AudioRecording = {
          id: 'rec_' + Date.now(),
          timestamp: Date.now(),
          durationSeconds: recordingSeconds,
          blobUrl,
          title: `Incident Audio ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          location: loc,
        };

        onSaveRecording(newRec);
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000); // chunk every 1s
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Microphone access denied';
      setMicError(errorMsg);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (isExternalRecording) {
      onToggleExternalRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayToggle = (rec: AudioRecording) => {
    if (playingId === rec.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = rec.blobUrl;
        audioPlayerRef.current.play();
        setPlayingId(rec.id);
        audioPlayerRef.current.onended = () => setPlayingId(null);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-6">
      <audio ref={audioPlayerRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recording Deck (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Legal Protection Vault
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Ambient Audio Evidence Recorder
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-8">
              Discreetly capture audio during verbal threats, cab route deviations, or harassment. All recordings are securely saved locally with verified timestamps and GPS tags.
            </p>

            {micError && (
              <div className="p-4 mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Microphone error: {micError}. Please allow microphone permissions.</span>
              </div>
            )}

            {/* Recording Visualizer Box */}
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl mb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                {isRecording && (
                  <span className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  onClick={toggleRecording}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl transition-transform active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 shadow-rose-600/40'
                      : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-8 h-8 fill-current mb-1" />
                      <span className="text-[11px]">STOP</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8 mb-1" />
                      <span className="text-[11px]">RECORD</span>
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatDuration(recordingSeconds)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isRecording
                  ? 'Active recording... Audio chunking in real-time'
                  : 'Tap to start ambient evidence recording'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Evidence Vault List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Saved Evidence Clips ({recordings.length})
              </h4>
            </div>

            {recordings.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <FileAudio className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No recordings saved yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Recordings captured during SOS or manual triggers will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {recordings.map((rec) => {
                  const isThisPlaying = playingId === rec.id;
                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <button
                        onClick={() => handlePlayToggle(rec)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isThisPlaying
                            ? 'bg-rose-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {rec.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="font-mono">{formatDuration(rec.durationSeconds)}</span>
                          {rec.location && (
                            <>
                              <span>·</span>
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> GPS Tagged
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={rec.blobUrl}
                          download={`evidence_${rec.timestamp}.webm`}
                          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="Download audio file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => onDeleteRecording(rec.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-slate-800 dark:text-slate-200 block mb-1">
              Admissibility Tip
            </strong>
            Recordings with matching GPS timestamps and unaffected continuous audio are admissible in law enforcement complaints and court depositions.
          </div>
        </div>
      </div>
    </div>
  );
};
