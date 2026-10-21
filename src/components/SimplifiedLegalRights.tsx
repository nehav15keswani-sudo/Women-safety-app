import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Phone,
  Scale,
  Moon,
  FileText,
  Home,
  HeartPulse,
  Briefcase,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Languages
} from 'lucide-react';
import { SIMPLIFIED_WOMEN_RIGHTS, SimplifiedLawRight } from '../data/simplifiedRightsData';
import { SupportedLanguage } from '../i18n/translations';

interface SimplifiedLegalRightsProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const SimplifiedLegalRights: React.FC<SimplifiedLegalRightsProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isHindiMode = currentLanguage === 'hi';

  const handleSpeakRight = (right: SimplifiedLawRight) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeakingId === right.id) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setActiveSpeakingId(right.id);

    const textToSpeak = isHindiMode ? right.voiceScriptHi : right.voiceScriptEn;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick language code
    utterance.lang = isHindiMode ? 'hi-IN' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      isHindiMode ? v.lang.includes('hi') : v.lang.includes('en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setActiveSpeakingId(null);
    utterance.onerror = () => setActiveSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Moon':
        return Moon;
      case 'FileText':
        return FileText;
      case 'Scale':
        return Scale;
      case 'Home':
        return Home;
      case 'HeartPulse':
        return HeartPulse;
      case 'Briefcase':
        return Briefcase;
      default:
        return Scale;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Banner explaining this feature for uneducated / rural women */}
      <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {isHindiMode ? 'सरल भाषा में कानून · बोलकर सुनें' : 'Simplified Law Guide · Voice Readout'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {isHindiMode ? 'कम पढ़ी-लिखी महिलाओं के लिए कानूनी अधिकार' : 'Everyday Legal Rights for Common Women'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 max-w-2xl leading-relaxed">
              {isHindiMode
                ? 'कानून की कठिन धाराएं समझे बिना, सीधे अपनी भाषा में जानें कि पुलिस, ससुराल, काम की जगह और अस्पताल में आपके क्या अधिकार हैं। नीचे किसी भी कार्ड पर "बोलकर सुनें" दबाएं।'
                : 'Clear, jargon-free explanations of your constitutional protections. Tap the voice button on any card to listen out loud in simple everyday language.'}
            </p>
          </div>

          {/* Toll Free Legal Aid Hotline Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 self-start sm:self-auto text-center">
            <span className="text-[11px] block text-amber-200 font-medium">
              {isHindiMode ? 'मुफ़्त सरकारी कानूनी मदद' : 'National Free Legal Aid'}
            </span>
            <a
              href="tel:15100"
              className="mt-1.5 px-4 py-2 bg-white text-slate-900 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-sm hover:bg-amber-50 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call 15100 (Toll-Free)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Language Toggle Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Languages className="w-4 h-4 text-rose-600" />
          <span>{isHindiMode ? 'भाषा चुनें (Select Language):' : 'Read & Listen in Language:'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectLanguage('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isHindiMode
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => onSelectLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isHindiMode
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Legal Rights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SIMPLIFIED_WOMEN_RIGHTS.map((right) => {
          const Icon = getIcon(right.iconName);
          const isSpeaking = activeSpeakingId === right.id;
          const title = isHindiMode ? right.titleHi : right.titleEn;
          const summary = isHindiMode ? right.plainSummaryHi : right.plainSummaryEn;
          const points = isHindiMode ? right.actionPointsHi : right.actionPointsEn;

          return (
            <div
              key={right.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                isSpeaking
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Header with Icon and Voice Trigger */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                        {right.badge}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Plain language summary */}
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl">
                  {summary}
                </p>

                {/* Key Bullet Points */}
                <div className="space-y-2 pt-1">
                  {points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions: Audio Speak Out Loud + Call Helpline */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
                {/* 1-Tap Voice Button */}
                <button
                  onClick={() => handleSpeakRight(right)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isSpeaking
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{isHindiMode ? 'आवाज रोकें' : 'Stop Voice'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                      <span>{isHindiMode ? 'बोलकर सुनें (Voice)' : 'Listen Out Loud'}</span>
                    </>
                  )}
                </button>

                {/* Direct Dial Helpline */}
                <a
                  href={`tel:${right.helplineNumber}`}
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-900 transition-colors shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{right.helplineLabel}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
