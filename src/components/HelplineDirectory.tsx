import React, { useState } from 'react';
import {
  Phone,
  Search,
  Shield,
  LifeBuoy,
  MapPin,
  ExternalLink,
  Building,
  HeartHandshake,
  Clock,
  Compass
} from 'lucide-react';
import { HelplineItem, SafeZone, LocationCoordinates } from '../types';
import { HELPLINE_DIRECTORY, DEMO_SAFE_ZONES } from '../data/safetyData';
import { calculateDistanceKm, buildGoogleMapsUrl } from '../utils/location';

interface HelplineDirectoryProps {
  userLocation: LocationCoordinates | null;
}

export const HelplineDirectory: React.FC<HelplineDirectoryProps> = ({ userLocation }) => {
  const [activeTab, setActiveTab] = useState<'helplines' | 'safezones'>('helplines');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredHelplines = HELPLINE_DIRECTORY.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.number.includes(q) ||
      item.region.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Calculate dynamic distances for safe zones
  const safeZonesWithDistance: SafeZone[] = DEMO_SAFE_ZONES.map((zone) => {
    if (userLocation) {
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, zone.lat, zone.lng);
      return { ...zone, distanceKm: dist };
    }
    return zone;
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="w-full space-y-6">
      {/* Header and Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Verified All-India Support Grid
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            India Emergency Helplines &amp; Safe Havens
          </h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('helplines')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'helplines'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            India Helplines
          </button>
          <button
            onClick={() => setActiveTab('safezones')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'safezones'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Nearby Safe Havens
          </button>
        </div>
      </div>

      {activeTab === 'helplines' ? (
        <div className="space-y-4">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search India helplines (e.g. 112, 1091, 181, 1090, 1930, 15100, NCW)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category Filter Pills (Functional Buttons) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All India Numbers' },
                { id: 'women', label: 'Women Desks' },
                { id: 'police', label: 'Police Rapid (112/100)' },
                { id: 'domestic', label: 'Domestic Abuse (181)' },
                { id: 'cyber', label: 'Cyber Stalking (1930)' },
                { id: 'medical', label: 'Ambulance (108)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick 1-Tap Emergency Dials in India for Women Safety */}
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-600" />
                Immediate 1-Tap Dials • All-India Free Emergency Numbers
              </span>
              <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">100% Offline via Mobile Phone</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { num: '112', title: 'ERSS / Police', desc: 'All Emergencies' },
                { num: '1091', title: 'Women Police', desc: 'Physical Distress' },
                { num: '181', title: 'Women Help', desc: 'Domestic & Crisis' },
                { num: '1090', title: 'Power Line', desc: 'Anti-Stalking' },
                { num: '1930', title: 'Cyber Crime', desc: 'Morphed / Blackmail' },
                { num: '139', title: 'Railway RPF', desc: 'Train Escort' },
              ].map((item) => (
                <a
                  key={item.num}
                  href={`tel:${item.num}`}
                  className="bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-rose-100 dark:border-slate-700 shadow-xs hover:border-rose-400 transition-colors text-center group active:scale-95"
                >
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 block font-mono group-hover:scale-105 transition-transform">
                    {item.num}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {item.title}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                    {item.desc}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Helpline Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHelplines.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                      {item.number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
                    <span>{item.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.hours}</span>
                    {item.tollFree && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Toll-Free</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>

                <a
                  href={`tel:${item.number}`}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-200 dark:border-rose-900"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {item.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Safe Havens View */
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
            <Compass className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Safe Havens are well-lit, public premises with CCTV, security guards, or active medical staff where you can seek refuge immediately if being followed.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeZonesWithDistance.map((zone) => (
              <div
                key={zone.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {zone.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                      ~{zone.distanceKm} km away
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{zone.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{zone.open24x7 ? 'Open 24/7' : 'Standard Hours'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Guard Monitored</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={buildGoogleMapsUrl(zone.lat, zone.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${zone.phone}`}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Haven</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
