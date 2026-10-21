import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Target,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Trash2,
  Layers,
  FileVideo,
  Shield,
  Clock,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import {
  ANIMATED_TECHNIQUES,
  AnimatedTechnique,
  renderDefenseFrame
} from '../utils/animatedDefenseEngine';
import {
  recordAndDownloadTechniqueVideo,
  downloadTechniqueCardPng
} from '../utils/animatedVideoRecorder';
import {
  getUploadedVideos,
  saveUploadedVideo,
  deleteUploadedVideo,
  UploadedDefenseVideo
} from '../utils/defenseVideoStorage';
import { SupportedLanguage } from '../i18n/translations';

interface DefenseVideosProps {
  currentLanguage?: SupportedLanguage;
}

export const DefenseVideos: React.FC<DefenseVideosProps> = ({ currentLanguage = 'en' }) => {
  const isHi = currentLanguage === 'hi';

  const [activeTab, setActiveTab] = useState<'animated' | 'uploads'>('animated');
  const [selectedTechniqueIndex, setSelectedTechniqueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [showTargetOverlay, setShowTargetOverlay] = useState(true);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Uploaded videos state
  const [uploadedVideos, setUploadedVideos] = useState<UploadedDefenseVideo[]>([]);
  const [selectedUploadedVideo, setSelectedUploadedVideo] = useState<UploadedDefenseVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTechnique, setUploadTechnique] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Voice narration state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTech = ANIMATED_TECHNIQUES[selectedTechniqueIndex];

  // Load uploaded videos from IndexedDB
  useEffect(() => {
    getUploadedVideos().then((vids) => {
      setUploadedVideos(vids);
      if (vids.length > 0 && !selectedUploadedVideo) {
        setSelectedUploadedVideo(vids[0]);
      }
    });
  }, []);

  // Main 60fps Animation Loop
  useEffect(() => {
    let currentProgress = progress;

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        const step = (delta / currentTech.durationSec) * playbackSpeed;
        currentProgress = (currentProgress + step) % 1.0;
        setProgress(currentProgress);
      }

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderDefenseFrame(
            ctx,
            currentTech.id,
            currentProgress,
            canvas.width,
            canvas.height,
            showTargetOverlay
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, currentTech, showTargetOverlay]);

  // Adjust canvas resolution for retina display
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
  }, [selectedTechniqueIndex, activeTab]);

  // Determine active step from progress
  const activeStep = currentTech.steps.find(
    (s) => progress >= s.timeRange[0] && progress < s.timeRange[1]
  ) || currentTech.steps[0];

  // Speech Narration of Technique Rules
  const handleToggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = isHi
      ? `${currentTech.titleHi}. नियम: ${currentTech.keyRuleHi}. चरण 1: ${currentTech.steps[0].titleHi}. चरण 2: ${currentTech.steps[1].titleHi}. चरण 3: ${currentTech.steps[2].titleHi}.`
      : `${currentTech.title}. Rule: ${currentTech.keyRule}. Step 1: ${currentTech.steps[0].title}. Step 2: ${currentTech.steps[1].title}. Step 3: ${currentTech.steps[2].title}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isHi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Download Animated Video File (.webm)
  const handleDownloadVideo = async () => {
    setIsDownloadingVideo(true);
    setDownloadProgress(0);
    setNoticeMessage(isHi ? 'एनिमेटेड वीडियो तैयार हो रहा है...' : 'Generating offline video file...');

    try {
      await recordAndDownloadTechniqueVideo(
        currentTech,
        640,
        480,
        (pct) => setDownloadProgress(pct)
      );
      setNoticeMessage(
        isHi
          ? 'वीडियो डाउनलोड हो गया! आप इसे बिना इंटरनेट के देख सकते हैं।'
          : 'Video downloaded successfully! Saved to your device for offline viewing.'
      );
      setTimeout(() => setNoticeMessage(null), 6000);
    } catch (err) {
      console.error('Download video error:', err);
      // Fallback: download PNG card
      downloadTechniqueCardPng(currentTech);
      setNoticeMessage(
        isHi
          ? 'सचित्र कार्ड डाउनलोड हो गया।'
          : 'Offline visual card saved to device.'
      );
      setTimeout(() => setNoticeMessage(null), 6000);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  // Download PNG visual card
  const handleDownloadCard = () => {
    downloadTechniqueCardPng(currentTech);
    setNoticeMessage(isHi ? 'कार्ड डाउनलोड हो गया!' : 'Visual technique card downloaded!');
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Upload custom video handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const newVideo: UploadedDefenseVideo = {
          id: 'vid_' + Date.now(),
          title: uploadTitle.trim() || 'Custom Defense Drill',
          technique: uploadTechnique.trim() || 'User Video Tutorial',
          notes: uploadNotes.trim() || 'Offline saved defense clip',
          videoDataUrl: dataUrl,
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          uploadedAt: Date.now(),
        };

        await saveUploadedVideo(newVideo);
        setUploadedVideos((prev) => [newVideo, ...prev]);
        setSelectedUploadedVideo(newVideo);
        setSelectedFile(null);
        setUploadTitle('');
        setUploadTechnique('');
        setUploadNotes('');
        setIsUploading(false);
        setActiveTab('uploads');
        setNoticeMessage(
          isHi
            ? 'आपका वीडियो सेव हो गया! अब यह ऑफलाइन भी चलेगा।'
            : 'Video saved to device! Accessible 100% offline anytime.'
        );
        setTimeout(() => setNoticeMessage(null), 5000);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('Save upload failed:', err);
      setIsUploading(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    await deleteUploadedVideo(id);
    setUploadedVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedUploadedVideo?.id === id) {
      setSelectedUploadedVideo(uploadedVideos.find((v) => v.id !== id) || null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isHi ? 'ऑफ़लाइन एनिमेटेड आत्मरक्षा वीडियो' : 'Offline Animated Defense Simulators'}</span>
            </span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>100% Offline (No YouTube)</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {isHi ? 'सचित्र व एनिमेटेड आत्मरक्षा तकनीकें' : 'Self-Defense Animated Techniques'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {isHi
              ? 'बिना यूट्यूब के, आसान एनिमेशन से सीखें। तकनीक को एक क्लिक में अपने फोन में डाउनलोड करें ताकि इंटरनेट न होने पर भी देख सकें।'
              : 'Learn practical escape mechanics with smooth step-by-step animations. Easily download video clips directly to your phone for offline study.'}
          </p>
        </div>

        {/* Tab Switcher: Built-in Animated Simulators vs Uploaded Video Shelf */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('animated')}
            className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'animated'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHi ? 'एनिमेटेड वीडियो' : 'Animated Simulators'}</span>
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'uploads'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isHi ? 'मेरे अपलोड वीडियो' : 'My Uploads'} ({uploadedVideos.length})</span>
          </button>
        </div>
      </div>

      {/* Global In-UI Notice Banner */}
      {noticeMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. ANIMATED TECHNIQUE SIMULATOR MODE */}
      {activeTab === 'animated' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 60fps Canvas Simulator & Video Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* The 60fps Canvas Screen */}
            <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative aspect-[4/3] flex flex-col justify-center items-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* Floating Speed & Slow-Mo Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{currentTech.techniqueName}</span>
                </span>
                {playbackSpeed < 1 && (
                  <span className="px-2 py-0.5 bg-amber-500/90 text-slate-950 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                    Slow-Mo {playbackSpeed}x
                  </span>
                )}
              </div>

              {/* Target Overlay Toggle */}
              <button
                onClick={() => setShowTargetOverlay(!showTargetOverlay)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md ${
                  showTargetOverlay
                    ? 'bg-red-600/90 text-white shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                }`}
                title="Toggle Vulnerable Target Point Glow"
              >
                <Target className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Target Points</span>
              </button>

              {/* Centered Play Pause Overlay if Paused */}
              {!isPlaying && (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Video Player Control Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
              {/* Timeline Scrubber */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{(progress * currentTech.durationSec).toFixed(1)}s</span>
                  <span className="font-bold text-rose-600">
                    Step {activeStep.stepNumber}: {isHi ? activeStep.titleHi : activeStep.title}
                  </span>
                  <span>{currentTech.durationSec.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.005"
                  value={progress}
                  onChange={(e) => {
                    setProgress(parseFloat(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              {/* Playback Controls & Speed Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setProgress(0);
                      setIsPlaying(true);
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Restart Animation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Speech Voice Narration */}
                  <button
                    onClick={handleToggleVoice}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    title="Listen to technique voice cues"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
                    <span>{isSpeaking ? (isHi ? 'आवाज बंद करें' : 'Stop Voice') : (isHi ? 'बोलकर सुनें' : 'Listen Voice')}</span>
                  </button>
                </div>

                {/* Speed Selector (0.5x, 1x, 1.5x) */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {[0.5, 1.0, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        playbackSpeed === speed
                          ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {speed === 0.5 ? '0.5x Slow' : `${speed}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* DOWNLOAD BUTTONS BAR */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownloadVideo}
                  disabled={isDownloadingVideo}
                  className="w-full sm:flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloadingVideo
                      ? `${isHi ? 'डाउनलोड हो रहा है' : 'Downloading Video...'} (${downloadProgress}%)`
                      : isHi
                      ? 'एनिमेटेड वीडियो डाउनलोड करें (.webm)'
                      : 'Download Animated Video (.webm)'}
                  </span>
                </button>

                <button
                  onClick={handleDownloadCard}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  title="Download Illustrated Flashcard PNG"
                >
                  <FileVideo className="w-4 h-4 text-rose-500" />
                  <span>{isHi ? 'कार्ड डाउनलोड' : 'Save Image Card'}</span>
                </button>
              </div>
            </div>

            {/* Active Move Step Breakdown Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    {isHi ? currentTech.categoryHi : currentTech.category} · {currentTech.durationSec}s
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {isHi ? currentTech.titleHi : currentTech.title}
                  </h3>
                </div>
              </div>

              {/* 3-Second Golden Rule Callout */}
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    {isHi ? '3 सेकंड का अचूक नियम:' : 'Key 3-Second Rule:'}
                  </strong>
                  <span>{isHi ? currentTech.keyRuleHi : currentTech.keyRule}</span>
                </div>
              </div>

              {/* Target Anatomy Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span>
                    <strong>{isHi ? 'कमजोर अंग:' : 'Vulnerable Target:'}</strong>{' '}
                    {isHi ? currentTech.targetPointHi : currentTech.targetPoint}
                  </span>
                </div>
              </div>

              {/* Step Sequence */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isHi ? 'कदम-दर-कदम दांव सीखें:' : 'Step-by-Step Execution:'}
                </h4>

                <div className="space-y-2">
                  {currentTech.steps.map((st) => {
                    const isStepActive = activeStep.stepNumber === st.stepNumber;
                    return (
                      <div
                        key={st.stepNumber}
                        onClick={() => {
                          setProgress(st.timeRange[0]);
                          setIsPlaying(false);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isStepActive
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isStepActive
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {st.stepNumber}
                          </span>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                              {isHi ? st.titleHi : st.title}
                            </strong>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {isHi ? st.descHi : st.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Technique Selector Carousel & Upload Shortcut (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Upload Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isHi ? 'अपना वीडियो अपलोड करें' : 'Upload Custom Defense Video'}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'अपने फोन से कोई भी सेल्फ-डिफेंस या कराटे वीडियो क्लिप जोड़ें। यह ऐप में सुरक्षित रहेगा और बिना इंटरनेट के चलेगा।'
                  : 'Add your own karate, college safety drill, or defense video clip. Stored locally in your device for offline practice.'}
              </p>

              <button
                onClick={() => {
                  setActiveTab('uploads');
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>{isHi ? 'वीडियो फाइल चुनें' : 'Choose Video File (.mp4 / .webm)'}</span>
              </button>
            </div>

            {/* Techniques Carousel Playlist */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isHi ? 'सभी एनिमेटेड तकनीकें' : 'Techniques Library'} ({ANIMATED_TECHNIQUES.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Offline Canvas 60fps</span>
              </div>

              <div className="space-y-2.5">
                {ANIMATED_TECHNIQUES.map((tech, idx) => {
                  const isSelected = idx === selectedTechniqueIndex;
                  return (
                    <div
                      key={tech.id}
                      onClick={() => {
                        setSelectedTechniqueIndex(idx);
                        setProgress(0);
                        setIsPlaying(true);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {isHi ? tech.titleHi : tech.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {tech.techniqueName} · {tech.durationSec}s
                          </span>
                        </div>
                      </div>

                      <Play
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-rose-600 fill-current' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER UPLOADED VIDEOS SHELF */}
      {activeTab === 'uploads' && (
        <div className="space-y-6">
          {/* Upload Form Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                {isHi ? 'स्थानीय वीडियो स्टोरेज' : 'Personal Video Vault'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {isHi ? 'नया सेल्फ-डिफेंस वीडियो जोड़ें' : 'Upload Your Defense Training Video'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isHi
                  ? 'वीडियो सीधे आपके डिवाइस की मेमोरी (IndexedDB) में सेव होता है। आप इंटरनेट के बिना कभी भी इसे देख और डाउनलोड कर सकते हैं।'
                  : 'Videos are stored directly in your browser local database (IndexedDB). They never expire and play 100% offline.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHi ? 'वीडियो का नाम' : 'Video Title'}
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Wrist Escape Practice"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHi ? 'तकनीक का प्रकार' : 'Technique Category'}
                </label>
                <input
                  type="text"
                  value={uploadTechnique}
                  onChange={(e) => setUploadTechnique(e.target.value)}
                  placeholder="e.g. Karate / Street Escape"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHi ? 'मुख्य सीख या नोट' : 'Key Memory Rule'}
                </label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Remember to drop hips first"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-rose-500" />
                <span>
                  {selectedFile
                    ? `Selected: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : isHi
                    ? 'गैलरी / फाइल से वीडियो चुनें'
                    : 'Choose Video File from Device'}
                </span>
              </button>

              <button
                onClick={handleSaveUpload}
                disabled={!selectedFile || isUploading}
                className="w-full sm:w-auto py-2.5 px-5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isUploading ? (isHi ? 'सेव हो रहा है...' : 'Saving to Device...') : (isHi ? 'सुरक्षित सेव करें' : 'Save Video to Offline Vault')}</span>
              </button>
            </div>
          </div>

          {/* Uploaded Videos Gallery */}
          {uploadedVideos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <FileVideo className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isHi ? 'अभी तक कोई वीडियो अपलोड नहीं किया गया' : 'No custom videos uploaded yet'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {isHi
                  ? 'ऊपर दिए गए बटन से अपने फोन से कोई भी सेल्फ-डिफेंस वीडियो जोड़ें। यह पूरी तरह से ऑफलाइन चलेगा।'
                  : 'Upload personal training drills, karate moves, or defense practice videos to review offline anytime.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Active Upload Video Player (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {selectedUploadedVideo && (
                  <div className="space-y-4">
                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video relative">
                      <video
                        src={selectedUploadedVideo.videoDataUrl}
                        controls
                        playsInline
                        loop
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                            {selectedUploadedVideo.technique} · Offline IndexedDB
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                            {selectedUploadedVideo.title}
                          </h3>
                        </div>

                        {/* Download Video File to phone */}
                        <a
                          href={selectedUploadedVideo.videoDataUrl}
                          download={selectedUploadedVideo.fileName || 'defense_video.mp4'}
                          className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </a>
                      </div>

                      {selectedUploadedVideo.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                          <strong>Note:</strong> {selectedUploadedVideo.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Videos List (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isHi ? 'सेव किए गए वीडियो' : 'Saved Offline Videos'} ({uploadedVideos.length})
                </h4>

                <div className="space-y-2.5">
                  {uploadedVideos.map((vid) => {
                    const isSelected = selectedUploadedVideo?.id === vid.id;
                    return (
                      <div
                        key={vid.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div
                          onClick={() => setSelectedUploadedVideo(vid)}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {vid.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>{vid.technique}</span>
                            <span>·</span>
                            <span>{(vid.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDeleteUpload(vid.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
