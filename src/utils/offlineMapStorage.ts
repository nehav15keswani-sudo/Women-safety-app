// IndexedDB Storage Manager for Offline Emergency Map Tiles

const DB_NAME = 'AegisOfflineMapsDB';
const DB_VERSION = 1;
const TILE_STORE = 'offline_tiles';
const PACKAGE_STORE = 'offline_packages';

export interface OfflineMapPackage {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  tileCount: number;
  sizeBytes: number;
  downloadedAt: number;
  zoomLevels: number[];
}

export function openOfflineMapDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TILE_STORE)) {
        db.createObjectStore(TILE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(PACKAGE_STORE)) {
        db.createObjectStore(PACKAGE_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Convert Lat/Lng to Slippy Map Tile Coordinates
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// Calculate bounding box tiles around center point
export function getTileRangeForArea(
  lat: number,
  lng: number,
  radiusKm: number,
  zoom: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((lat * Math.PI) / 180);

  const deltaLat = radiusKm / kmPerDegLat;
  const deltaLng = radiusKm / kmPerDegLng;

  const nw = latLngToTile(lat + deltaLat, lng - deltaLng, zoom);
  const se = latLngToTile(lat - deltaLat, lng + deltaLng, zoom);

  return {
    minX: Math.min(nw.x, se.x),
    maxX: Math.max(nw.x, se.x),
    minY: Math.min(nw.y, se.y),
    maxY: Math.max(nw.y, se.y),
  };
}

// Save a single tile
export async function saveTile(key: string, dataUrl: string, packageId: string): Promise<void> {
  const db = await openOfflineMapDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TILE_STORE, 'readwrite');
    const store = tx.objectStore(TILE_STORE);
    store.put({ key, dataUrl, packageId, savedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Retrieve a tile from IndexedDB
export async function getTile(key: string): Promise<string | null> {
  try {
    const db = await openOfflineMapDb();
    return new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, 'readonly');
      const store = tx.objectStore(TILE_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Download an offline map package
export async function downloadAreaPackage(
  name: string,
  lat: number,
  lng: number,
  radiusKm: number,
  zoomLevels: number[] = [13, 14, 15],
  onProgress?: (downloaded: number, total: number) => void
): Promise<OfflineMapPackage> {
  const packageId = 'pkg_' + Date.now();
  const tilesToDownload: { z: number; x: number; y: number }[] = [];

  for (const z of zoomLevels) {
    const range = getTileRangeForArea(lat, lng, radiusKm, z);
    for (let x = range.minX; x <= range.maxX; x++) {
      for (let y = range.minY; y <= range.maxY; y++) {
        tilesToDownload.push({ z, x, y });
      }
    }
  }

  const total = tilesToDownload.length;
  let downloadedCount = 0;
  let totalBytes = 0;

  // Process tiles in batches of 4 concurrent downloads
  const batchSize = 4;
  for (let i = 0; i < tilesToDownload.length; i += batchSize) {
    const batch = tilesToDownload.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (tile) => {
        const key = `${tile.z}_${tile.x}_${tile.y}`;
        const url = `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
        let saved = false;
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            totalBytes += blob.size;
            const dataUrl = await blobToDataUrl(blob);
            await saveTile(key, dataUrl, packageId);
            saved = true;
          }
        } catch {
          // Network or CORS issue; handled below
        }

        if (!saved) {
          // Generate crisp offline tactical grid tile as fallback
          const fallbackDataUrl = createSyntheticTileDataUrl(tile.z, tile.x, tile.y);
          totalBytes += 800; // estimated SVG size
          await saveTile(key, fallbackDataUrl, packageId);
        }

        downloadedCount++;
        if (onProgress) {
          onProgress(downloadedCount, total);
        }
      })
    );
  }

  const newPackage: OfflineMapPackage = {
    id: packageId,
    name: name || `Area (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
    centerLat: lat,
    centerLng: lng,
    radiusKm,
    tileCount: downloadedCount,
    sizeBytes: totalBytes,
    downloadedAt: Date.now(),
    zoomLevels,
  };

  const db = await openOfflineMapDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PACKAGE_STORE, 'readwrite');
    const store = tx.objectStore(PACKAGE_STORE);
    store.put(newPackage);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return newPackage;
}

export async function getSavedPackages(): Promise<OfflineMapPackage[]> {
  try {
    const db = await openOfflineMapDb();
    return new Promise((resolve) => {
      const tx = db.transaction(PACKAGE_STORE, 'readonly');
      const store = tx.objectStore(PACKAGE_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deletePackage(packageId: string): Promise<void> {
  const db = await openOfflineMapDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PACKAGE_STORE, TILE_STORE], 'readwrite');
    const pkgStore = tx.objectStore(PACKAGE_STORE);
    pkgStore.delete(packageId);

    // Delete associated tiles
    const tileStore = tx.objectStore(TILE_STORE);
    const req = tileStore.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.packageId === packageId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function createSyntheticTileDataUrl(z: number, x: number, y: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#0f172a"/>
    <path d="M0 64h256M0 128h256M0 192h256M64 0v256M128 0v256M192 0v256" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <path d="M0 128h256M128 0v256" stroke="#334155" stroke-width="2"/>
    <circle cx="128" cy="128" r="3" fill="#38bdf8" opacity="0.5"/>
    <text x="10" y="22" font-family="monospace" font-size="9" fill="#94a3b8" font-weight="bold">OFFLINE MAP · Z${z}</text>
    <text x="10" y="244" font-family="monospace" font-size="8" fill="#64748b">TILE [${x}, ${y}]</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

