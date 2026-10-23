import React, { useState, useEffect, useMemo } from 'react';
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
  Languages,
  Globe,
  ArrowRight,
  ShieldAlert,
  Users,
  ShieldCheck
} from 'lucide-react';
import { SIMPLIFIED_LEGAL_RIGHTS, SimplifiedLawRight } from '../data/simplifiedRightsData';
import { SupportedLanguage } from '../i18n/translations';
import { UsefulWebsitesSection } from './UsefulWebsitesSection';

interface SimplifiedLegalRightsProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const SimplifiedLegalRights: React.FC<SimplifiedLegalRightsProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [activeSection, setActiveSection] = useState<'rights' | 'websites'>('rights');
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [rightsFilter, setRightsFilter] = useState<'all' | 'universal' | 'women'>('all');

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isHindiMode = currentLanguage === 'hi';

  const filteredRights = useMemo(() => {
    return SIMPLIFIED_LEGAL_RIGHTS.filter((r) => {
      if (rightsFilter === 'universal') return r.targetAudience === 'all';
      if (rightsFilter === 'women') return r.targetAudience === 'women';
      return true;
    });
  }, [rightsFilter]);

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
      case 'ShieldAlert':
        return ShieldAlert;
      default:
        return Scale;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Main Section Switcher: Legal Rights vs Useful Websites */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSection('rights')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'rights'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isHindiMode ? 'कानूनी अधिकार (सभी के लिए)' : 'Laws & Rights (For All)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('websites')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'websites'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{isHindiMode ? 'उपयोगी सरकारी वेबसाइटें' : 'Useful Websites for All'}</span>
          </button>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => onSelectLanguage('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isHindiMode
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => onSelectLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isHindiMode
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* VIEW 1: USEFUL WEBSITES & PORTALS */}
      {activeSection === 'websites' ? (
        <UsefulWebsitesSection currentLanguage={currentLanguage} />
      ) : (
        /* VIEW 2: SIMPLIFIED LEGAL LAWS & RIGHTS WITH AUDIO READOUT */
        <div className="space-y-6 animate-fade-in">
          {/* Banner: Laws for Men, Women & All Citizens */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-900/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
                    {isHindiMode ? 'पुरुषों व महिलाओं दोनों के लिए' : 'For Men, Women & Families'}
                  </span>
                  <span className="text-xs text-rose-300 font-semibold">
                    {isHindiMode ? 'बोलकर सुनें (Voice Readout)' : 'Voice Readout Enabled'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isHindiMode
                    ? 'नागरिक अधिकार, पुलिस नियम व कानूनी सुरक्षा'
                    : 'Everyday Legal Rights & Protections for Everyone'}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {isHindiMode
                    ? 'पुलिस गिरफ्तारी नियम, साइबर ब्लैकमेल से सुरक्षा, सड़क हादसे में गुड सेमेरिटन कानून, मुफ़्त सरकारी वकील और महिला सुरक्षा कानून। किसी भी कार्ड पर "बोलकर सुनें" दबाएं।'
                    : 'Vital protections against arbitrary police arrest, cyber blackmail, road accidents (Good Samaritan Law), mental health counseling, and specialized women protections. Tap the voice button on any card to listen out loud.'}
                </p>
              </div>

              {/* Toll Free Legal Aid Hotline Badge */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 self-start sm:self-auto text-center">
                <span className="text-[11px] block text-rose-200 font-medium">
                  {isHindiMode ? 'मुफ़्त कानूनी मदद (नालसा)' : 'Free Legal Aid (NALSA)'}
                </span>
                <a
                  href="tel:15100"
                  className="mt-1.5 px-4 py-2 bg-white text-slate-900 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-sm hover:bg-rose-50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call 15100 (Toll-Free)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Audience Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
              {isHindiMode ? 'अधिकार देखें:' : 'View Rights:'}
            </span>
            {[
              { id: 'all', label: isHindiMode ? 'सभी अधिकार (All)' : 'All Laws & Rights' },
              { id: 'universal', label: isHindiMode ? 'पुरुषों व महिलाओं दोनों के लिए (Men & Women)' : 'For Men & Women Both' },
              { id: 'women', label: isHindiMode ? 'महिला विशेष अधिकार (Women Protections)' : 'Women Specific Laws' },
            ].map((tab) => {
              const isSelected = rightsFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRightsFilter(tab.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Legal Rights Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRights.map((right) => {
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
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header with Icon and Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full w-fit">
                            {right.badge}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mt-1">
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
      )}
    </div>
  );
};
