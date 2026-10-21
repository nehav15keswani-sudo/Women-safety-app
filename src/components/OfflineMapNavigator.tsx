import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Download,
  Wifi,
  WifiOff,
  Compass,
  Navigation,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  MessageSquare,
  Building,
  Layers,
  ChevronRight
} from 'lucide-react';
import { LocationCoordinates, EmergencyContact } from '../types';
import { DEMO_SAFE_ZONES } from '../data/safetyData';
import { getCurrentLocation, calculateDistanceKm, dispatchSms } from '../utils/location';
import {
  downloadAreaPackage,
  getSavedPackages,
  deletePackage,
  getTile,
  OfflineMapPackage
} from '../utils/offlineMapStorage';

interface OfflineMapNavigatorProps {
  contacts: EmergencyContact[];
  userName: string;
}

export const OfflineMapNavigator: React.FC<OfflineMapNavigatorProps> = ({ contacts, userName }) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);
  const [savedPackages, setSavedPackages] = useState<OfflineMapPackage[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(2);
  const [packageNameInput, setPackageNameInput] = useState('');
  const [closestSafeHaven, setClosestSafeHaven] = useState<{ name: string; distanceKm: number; address: string; phone: string } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const isActuallyOffline = !isBrowserOnline || isSimulatedOffline;

  // Monitor network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved packages on mount
  useEffect(() => {
    getSavedPackages().then(setSavedPackages);
  }, []);

  // Fetch initial location and watch GPS position
  useEffect(() => {
    let watchId: number | null = null;

    getCurrentLocation()
      .then((loc) => {
        setUserLocation(loc);
        updateClosestSafeHaven(loc);
      })
      .catch((err) => console.log('Offline Map GPS note:', err));

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp,
          };
          setUserLocation(loc);
          updateClosestSafeHaven(loc);
          updateUserMapMarker(loc);
        },
        (err) => console.warn('GPS watch error:', err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const updateClosestSafeHaven = (loc: LocationCoordinates) => {
    let min = Infinity;
    let closest = null;
    for (const haven of DEMO_SAFE_ZONES) {
      const dist = calculateDistanceKm(loc.lat, loc.lng, haven.lat, haven.lng);
      if (dist < min) {
        min = dist;
        closest = { name: haven.name, distanceKm: dist, address: haven.address, phone: haven.phone };
      }
    }
    setClosestSafeHaven(closest);
  };

  // Initialize Leaflet Map with Offline TileLayer
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation ? userLocation.lat : 28.6139; // Default New Delhi center
    const initialLng = userLocation ? userLocation.lng : 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Custom Offline-Aware TileLayer
    const OfflineTileLayer: any = L.TileLayer.extend({
      createTile(coords: { x: number; y: number; z: number }, done: (err: unknown, tile: HTMLElement) => void) {
        const tile = document.createElement('img');
        const key = `${coords.z}_${coords.x}_${coords.y}`;

        // Check IndexedDB cache first
        getTile(key).then((cachedUrl) => {
          if (cachedUrl) {
            tile.src = cachedUrl;
            done(null, tile);
          } else if (!isActuallyOffline) {
            // Online fallback to OpenStreetMap
            tile.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
            tile.onload = () => done(null, tile);
            tile.onerror = (err) => done(err, tile);
          } else {
            // Offline placeholder tile when tile is not downloaded
            tile.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" fill="#1e293b"><rect width="256" height="256" fill="#0f172a"/><path d="M0 0h256v256H0z" stroke="#334155" stroke-width="1" fill="none"/><text x="128" y="128" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Offline Area (Uncached)</text></svg>`
            );
            done(null, tile);
          }
        });

        return tile;
      },
    });

    const offlineLayer = new OfflineTileLayer('', {
      maxZoom: 18,
      minZoom: 11,
      attribution: '© OpenStreetMap | Aegis Offline Navigation',
    });

    offlineLayer.addTo(map);

    // Plot Safe Havens Pins
    DEMO_SAFE_ZONES.forEach((haven) => {
      const havenIcon = L.divIcon({
        className: 'custom-haven-pin',
        html: `<div style="background-color: #f43f5e; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); border: 2px solid white; font-weight: bold; font-size: 14px;">🛡️</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([haven.lat, haven.lng], { icon: havenIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #e11d48; font-size: 13px;">${haven.name}</strong><br/>
            <span>${haven.address}</span><br/>
            <strong style="color: #059669;">24x7 Monitored Haven</strong><br/>
            <a href="tel:${haven.phone}" style="display: inline-block; margin-top: 4px; padding: 3px 8px; background: #e11d48; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Call: ${haven.phone}</a>
          </div>
        `);
    });

    // Clean up on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const updateUserMapMarker = (loc: LocationCoordinates) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!userMarkerRef.current) {
      // Create pulsing user marker
      userMarkerRef.current = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#38bdf8',
        fillOpacity: 1,
      }).addTo(map);

      accuracyCircleRef.current = L.circle([loc.lat, loc.lng], {
        radius: loc.accuracy || 25,
        color: '#38bdf8',
        weight: 1,
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([loc.lat, loc.lng]);
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([loc.lat, loc.lng]);
        accuracyCircleRef.current.setRadius(loc.accuracy || 25);
      }
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleDownloadArea = async () => {
    const centerLat = userLocation
      ? userLocation.lat
      : mapInstanceRef.current
      ? mapInstanceRef.current.getCenter().lat
      : 28.6139;

    const centerLng = userLocation
      ? userLocation.lng
      : mapInstanceRef.current
      ? mapInstanceRef.current.getCenter().lng
      : 77.2090;

    setIsDownloading(true);
    setNoticeMessage(null);
    setDownloadProgress({ current: 0, total: 1 });

    const name =
      packageNameInput.trim() ||
      (userLocation
        ? `Local Area (${selectedRadiusKm}km)`
        : `Map Area [${centerLat.toFixed(2)}, ${centerLng.toFixed(2)}] (${selectedRadiusKm}km)`);

    try {
      const newPkg = await downloadAreaPackage(
        name,
        centerLat,
        centerLng,
        selectedRadiusKm,
        [13, 14, 15],
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );
      setSavedPackages((prev) => [newPkg, ...prev]);
      setPackageNameInput('');
      setNoticeMessage(`Offline pack "${newPkg.name}" successfully saved to local device!`);
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err) {
      console.error('Download offline pack failed:', err);
      setNoticeMessage('Failed to download some map tiles. Please retry.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    await deletePackage(id);
    setSavedPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSendOfflineGpsSms = () => {
    if (!userLocation) return;
    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
    const text = `🚨 EMERGENCY (OFFLINE GPS): ${userName} needs immediate assistance.\nGPS Coordinates: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}\nNearest Haven: ${closestSafeHaven ? closestSafeHaven.name : 'Unknown'}`;
    dispatchSms(primary ? primary.phone : '', text);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Offline Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>Emergency Offline Geolocation</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isActuallyOffline
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {isActuallyOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isActuallyOffline ? 'Offline Mode (Local Storage)' : 'Online (Connected)'}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Offline Safe Haven Navigation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Download your local area to navigate and locate nearby police booths, 24/7 hospitals, and safe havens even if mobile internet and cellular data completely drop.
          </p>
        </div>

        {/* Offline Simulation Toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Simulate Offline:
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isSimulatedOffline}
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSimulatedOffline ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isSimulatedOffline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Offline Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Leaflet Map Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative h-[420px] bg-slate-900">
            {/* The Map Div */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Map Overlay: Center on Me Button */}
            <button
              onClick={handleCenterOnUser}
              className="absolute bottom-4 right-4 z-[400] p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-xl hover:bg-slate-50 transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold"
            >
              <Navigation className="w-4 h-4 text-rose-600" />
              <span>Center GPS</span>
            </button>

            {/* Offline Active Indicator Badge */}
            {isActuallyOffline && (
              <div className="absolute top-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-amber-500/30">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Navigating 100% Offline via IndexedDB</span>
              </div>
            )}
          </div>

          {/* Quick Compass & Closest Safe Haven Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nearest Verified Safe Haven
                </h4>
              </div>
              {closestSafeHaven && (
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg">
                  ~{closestSafeHaven.distanceKm} km away
                </span>
              )}
            </div>

            {closestSafeHaven ? (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">
                      {closestSafeHaven.name}
                    </strong>
                    <span className="text-[11px] text-slate-500 block">{closestSafeHaven.address}</span>
                  </div>
                  <a
                    href={`tel:${closestSafeHaven.phone}`}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Haven</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Locating safe havens near your GPS position...</p>
            )}

            {/* Offline SMS Emergency Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Cellular data down? Native SMS works without any internet.
              </span>
              <button
                onClick={handleSendOfflineGpsSms}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                <span>Send Offline GPS SMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Download Area Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Download New Local Area Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Offline Protection Kit
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Download Local Area Map
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Save map tiles directly to your device so you can view streets and navigate even in airplane mode.
              </p>
            </div>

            {/* Radius Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Coverage Radius
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 1, label: '1 km (~1.2 MB)' },
                  { r: 2, label: '2 km (~2.8 MB)' },
                  { r: 5, label: '5 km (~6.5 MB)' },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => setSelectedRadiusKm(item.r)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedRadiusKm === item.r
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs block">{item.r} km</span>
                    <span className="text-[10px] text-slate-400 block">{item.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Label Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Area Label / Name (Optional)
              </label>
              <input
                type="text"
                value={packageNameInput}
                onChange={(e) => setPackageNameInput(e.target.value)}
                placeholder="e.g. Connaught Place / Daily Commute Route"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* Download Progress Bar if active */}
            {isDownloading && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Downloading Map Tiles...</span>
                  <span className="font-mono tabular-nums">
                    {downloadProgress.current} / {downloadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-600 h-full transition-all duration-150"
                    style={{
                      width: `${downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownloadArea}
              disabled={isDownloading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading Area Tiles...' : 'Download Area for Offline Use'}</span>
            </button>

            {/* In-UI Status Alert Notice */}
            {noticeMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{noticeMessage}</span>
              </div>
            )}
          </div>

          {/* Saved Offline Areas List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Saved Offline Map Packs ({savedPackages.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Stored in IndexedDB</span>
            </h4>

            {savedPackages.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">No offline areas downloaded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Download your neighborhood above to navigate when internet is unavailable.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {savedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {pkg.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>{pkg.radiusKm} km radius</span>
                        <span>·</span>
                        <span>{pkg.tileCount} tiles</span>
                        <span>·</span>
                        <span>{formatBytes(pkg.sizeBytes)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([pkg.centerLat, pkg.centerLng], 14);
                          }
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="View on Map"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Delete Pack"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
