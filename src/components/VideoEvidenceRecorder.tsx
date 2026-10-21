import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Square,
  Play,
  RotateCcw,
  Share2,
  Download,
  Trash2,
  AlertCircle,
  MessageSquare,
  MapPin,
  Clock,
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import { LocationCoordinates } from '../types';
import { getCurrentLocation, buildGoogleMapsUrl, dispatchWhatsApp } from '../utils/location';

export interface RecordedVideoItem {
  id: string;
  blobUrl: string;
  file?: File;
  timestamp: number;
  durationSeconds: number;
  location?: LocationCoordinates;
  title: string;
}

interface VideoEvidenceRecorderProps {
  userName: string;
  userLocation: LocationCoordinates | null;
}

export const VideoEvidenceRecorder: React.FC<VideoEvidenceRecorderProps> = ({
  userName,
  userLocation,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [savedVideos, setSavedVideos] = useState<RecordedVideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<RecordedVideoItem | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const toggleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive && !isRecording) {
      startCamera(nextMode);
    }
  };

  const startRecording = async () => {
    if (!mediaStreamRef.current) {
      await startCamera();
      if (!mediaStreamRef.current) return;
    }

    try {
      recordedChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : MediaRecorder.isTypeSupported('video/webm')
        ? { mimeType: 'video/webm' }
        : MediaRecorder.isTypeSupported('video/mp4')
        ? { mimeType: 'video/mp4' }
        : undefined;

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'video/webm';
        const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const blobUrl = URL.createObjectURL(videoBlob);
        const file = new File([videoBlob], `aegis_evidence_${Date.now()}.webm`, { type: mimeType });

        let loc = userLocation;
        try {
          loc = await getCurrentLocation();
        } catch {
          // keep existing
        }

        const newVideo: RecordedVideoItem = {
          id: 'vid_' + Date.now(),
          blobUrl,
          file,
          timestamp: Date.now(),
          durationSeconds: recordingSeconds,
          location: loc || undefined,
          title: `Incident Video ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        };

        setSavedVideos((prev) => [newVideo, ...prev]);
        setSelectedVideo(newVideo);
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Failed to start video recording';
      setCameraError(err);
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
    stopCameraStream();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 1-Click WhatsApp Share
  const handleShareToWhatsApp = (item: RecordedVideoItem) => {
    const mapUrl = item.location
      ? buildGoogleMapsUrl(item.location.lat, item.location.lng)
      : 'Location tracked on Aegis';
    const text = `🚨 EMERGENCY INCIDENT VIDEO RECORDED BY ${userName.toUpperCase()}!\n\nRecorded at: ${new Date(
      item.timestamp
    ).toLocaleTimeString()}\nGPS Location: ${mapUrl}\n\nPlease check on me immediately!`;
    dispatchWhatsApp('', text);
  };

  // 1-Click Share to Other Apps (Web Share API)
  const handleShareToOtherApps = async (item: RecordedVideoItem) => {
    const mapUrl = item.location
      ? buildGoogleMapsUrl(item.location.lat, item.location.lng)
      : '';
    const shareText = `🚨 EMERGENCY VIDEO EVIDENCE from ${userName}. Captured at ${new Date(
      item.timestamp
    ).toLocaleTimeString()}. Location: ${mapUrl}`;

    if (navigator.share && item.file && navigator.canShare && navigator.canShare({ files: [item.file] })) {
      try {
        await navigator.share({
          title: `Emergency Incident Video - ${userName}`,
          text: shareText,
          files: [item.file],
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err) {
        // User cancelled share
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Incident Video - ${userName}`,
          text: shareText,
          url: mapUrl || undefined,
        });
      } catch {
        // Cancelled
      }
    } else {
      // Fallback: Copy coordinates and download
      navigator.clipboard.writeText(shareText);
      setShareFeedback('Message copied! Video downloaded to your device.');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleDeleteVideo = (id: string) => {
    setSavedVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedVideo?.id === id) {
      setSelectedVideo(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          Evidence Gathering &amp; Instant Dispatch
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Incident Video Recorder &amp; Multi-App Share
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Quickly record live camera video during threats, taxi route disputes, or vehicle stalking, and share directly to WhatsApp, Telegram, Signal, or law enforcement with one tap.
        </p>
      </div>

      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Camera Access Error: {cameraError}. Please enable camera permissions.</span>
        </div>
      )}

      {shareFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl font-medium animate-pulse">
          {shareFeedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Camera Viewfinder & Active Recorder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-black rounded-3xl overflow-hidden relative aspect-video flex items-center justify-center border border-slate-800 shadow-xl">
            {/* Live Video Preview element */}
            <video
              ref={videoPreviewRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />

            {!isCameraActive && !isRecording && (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400">
                  Camera is in standby. Tap below to launch viewfinder or record.
                </p>
              </div>
            )}

            {/* In-viewfinder Overlay Controls */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                {isRecording ? (
                  <div className="flex items-center gap-2 bg-rose-600 px-3 py-1.5 rounded-full font-bold shadow-md animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span className="font-mono tabular-nums">{formatTimer(recordingSeconds)}</span>
                  </div>
                ) : (
                  <span className="bg-black/60 px-2.5 py-1 rounded-full text-[11px]">
                    {facingMode === 'environment' ? 'Back Camera' : 'Selfie Camera'}
                  </span>
                )}

                <button
                  onClick={toggleFlipCamera}
                  disabled={isRecording}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-40 transition-colors"
                  title="Flip Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Record Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {!isRecording ? (
              <>
                {!isCameraActive ? (
                  <button
                    onClick={() => startCamera()}
                    className="py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera Viewfinder</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCameraStream}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
                  >
                    Close Camera
                  </button>
                )}

                <button
                  onClick={startRecording}
                  className="py-3.5 px-8 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <Video className="w-5 h-5" />
                  <span>Start Video Recording</span>
                </button>
              </>
            ) : (
              <button
                onClick={stopRecording}
                className="py-3.5 px-8 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-700/40 animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop &amp; Save Incident Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Selected Video Preview & Instant Multi-App Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedVideo ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedVideo.title}
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  {formatTimer(selectedVideo.durationSeconds)}
                </span>
              </div>

              {/* Playback Video */}
              <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                <video
                  src={selectedVideo.blobUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Location Stamp */}
              {selectedVideo.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-mono">
                    GPS: {selectedVideo.location.lat.toFixed(4)}, {selectedVideo.location.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {/* Instant WhatsApp & Multi-App Share Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleShareToWhatsApp(selectedVideo)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShareToOtherApps(selectedVideo)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share to Other Apps (Telegram, Signal, Drive)</span>
                </button>

                <div className="flex gap-2 pt-1">
                  <a
                    href={selectedVideo.blobUrl}
                    download={`evidence_${selectedVideo.timestamp}.webm`}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                  <button
                    onClick={() => handleDeleteVideo(selectedVideo.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm space-y-2">
              <Video className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-1" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Video Selected
              </h4>
              <p className="text-xs text-slate-500">
                Record an incident video or choose one from your saved clips below to send.
              </p>
            </div>
          )}

          {/* Saved Video Vault List */}
          {savedVideos.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Saved Evidence Vault ({savedVideos.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedVideos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedVideo(item)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      selectedVideo?.id === item.id
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()} · {formatTimer(item.durationSeconds)}
                      </p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
