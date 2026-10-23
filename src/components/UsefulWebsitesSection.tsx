import React, { useState, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  Phone,
  Search,
  Check,
  Copy,
  ShieldCheck,
  Building2,
  Lock,
  Scale,
  Sparkles,
  HelpCircle,
  Users,
  Compass
} from 'lucide-react';
import { USEFUL_WEBSITES, UsefulWebsite } from '../data/usefulWebsitesData';
import { SupportedLanguage } from '../i18n/translations';

interface UsefulWebsitesSectionProps {
  currentLanguage: SupportedLanguage;
}

export const UsefulWebsitesSection: React.FC<UsefulWebsitesSectionProps> = ({
  currentLanguage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isHindiMode = currentLanguage === 'hi';

  const categories = [
    { id: 'all', label: isHindiMode ? 'सभी पोर्टल' : 'All Websites', count: USEFUL_WEBSITES.length },
    { id: 'women', label: isHindiMode ? 'महिला अधिकार व आयोग' : 'Women Rights & NCW' },
    { id: 'cyber', label: isHindiMode ? 'साइबर अपराध (1930)' : 'Cyber Safety & Fraud' },
    { id: 'legal', label: isHindiMode ? 'मुफ़्त कानूनी मदद व कोर्ट' : 'Free Legal Aid & Courts' },
    { id: 'police', label: isHindiMode ? 'पुलिस व रेलवे (112 / 139)' : 'Police & Transit' },
    { id: 'welfare', label: isHindiMode ? 'सरकारी योजनाएं व कल्याण' : 'Welfare & Financial' },
  ];

  const filteredWebsites = useMemo(() => {
    return USEFUL_WEBSITES.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nameHi.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionHi.toLowerCase().includes(q) ||
        item.displayUrl.toLowerCase().includes(q) ||
        item.features.some((f) => f.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyLink = (item: UsefulWebsite) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Section Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {isHindiMode ? 'सत्यापित सरकारी पोर्टल' : 'Official Verified Directory'}
              </span>
              <span className="text-xs text-indigo-300 font-semibold">
                {isHindiMode ? 'नागरिक व महिला सहायता' : 'Govt & Citizen Support'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              {isHindiMode
                ? 'सभी के लिए उपयोगी सरकारी वेबसाइटें व पोर्टल'
                : 'Useful Official Websites & Portals for All'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {isHindiMode
                ? 'साइबर क्राइम रिपोर्टिंग, राष्ट्रीय महिला आयोग, मुफ़्त कानूनी मदद (नालसा), अदालती तारीखें और आपातकालीन सरकारी योजनाओं के आधिकारिक लिंक। बिना किसी बिचौलिए के सीधे सरकार तक अपनी बात पहुंचाएं।'
                : 'Direct, verified access to official Indian government portals for online cybercrime reporting, National Commission for Women (NCW), free legal advocates (NALSA), e-Courts case status, and emergency transit safety.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-indigo-200 block">
              {isHindiMode ? 'सुरक्षित व आधिकारिक' : 'Govt of India Portals'}
            </span>
            <span className="text-sm font-black text-white mt-0.5 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isHindiMode
                ? 'वेबसाइट खोजें (उदा. Cyber, NCW, Free Lawyer, Court, FIR, Scheme)...'
                : 'Search portals (e.g. Cybercrime, NCW, Free Lawyer, e-Courts, Railway, Welfare)...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredWebsites.map((site) => {
          const isCopied = copiedId === site.id;
          const title = isHindiMode ? site.nameHi : site.name;
          const tagline = isHindiMode ? site.taglineHi : site.tagline;
          const desc = isHindiMode ? site.descriptionHi : site.description;

          return (
            <div
              key={site.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3.5">
                {/* Header with Title and Official Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider inline-block">
                        {site.badge}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mt-1">
                        {title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {tagline}
                </p>

                {/* Plain description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl">
                  {desc}
                </p>

                {/* Key portal capabilities */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {site.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Visit Official Portal, Helpline Call & Copy Link */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                {/* Visit Portal Button */}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
                  <span>{isHindiMode ? 'वेबसाइट खोलें' : 'Open Official Portal'}</span>
                </a>

                {/* Helpline Call if available */}
                {site.helpline && (
                  <a
                    href={`tel:${site.helpline}`}
                    className="py-3 px-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-900 transition-colors shrink-0"
                    title={`Call Helpline: ${site.helpline}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{site.helpline}</span>
                  </a>
                )}

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(site)}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0"
                  title="Copy Link to Clipboard"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWebsites.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isHindiMode ? 'कोई वेबसाइट नहीं मिली' : 'No matching websites found'}
          </p>
          <p className="text-xs text-slate-500">
            {isHindiMode ? 'कृपया दूसरा कीवर्ड खोजें' : 'Try searching for different keywords like "Cyber", "Court", or "NCW"'}
          </p>
        </div>
      )}
    </div>
  );
};
