import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Scale, Car, Zap, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { SAFETY_GUIDES } from '../data/safetyData';

export const SafetyGuides: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('g1');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const icons = {
    g1: Scale,
    g2: Car,
    g3: Zap,
    g4: Eye,
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          Knowledge is Defense
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Tactical Safety Protocols &amp; Legal Rights
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Verified constitutional legal protections, transit safety checklists, and physical defense principles designed for high-stress scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAFETY_GUIDES.map((guide) => {
          const isExpanded = expandedId === guide.id;
          const IconComponent = icons[guide.id as keyof typeof icons] || ShieldCheck;

          return (
            <div
              key={guide.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition-all ${
                isExpanded
                  ? 'border-rose-400/80 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => toggleExpand(guide.id)}
                className="cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{guide.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{guide.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {guide.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                {guide.summary}
              </p>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  {guide.content.map((point, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                      <p className="leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
