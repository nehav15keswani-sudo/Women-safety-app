// IndexedDB storage for User-Uploaded Self-Defense Videos and Offline Technique Clips

const DB_NAME = 'AegisDefenseVideosDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_videos';

export interface UploadedDefenseVideo {
  id: string;
  title: string;
  technique: string;
  notes: string;
  videoDataUrl: string; // or object URL from blob
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: number;
}

export function openDefenseVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedVideo(video: UploadedDefenseVideo): Promise<void> {
  const db = await openDefenseVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(video);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUploadedVideos(): Promise<UploadedDefenseVideo[]> {
  try {
    const db = await openDefenseVideoDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteUploadedVideo(id: string): Promise<void> {
  const db = await openDefenseVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
