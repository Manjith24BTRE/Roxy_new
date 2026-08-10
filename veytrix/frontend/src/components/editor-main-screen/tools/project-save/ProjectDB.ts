// src/components/editor-main-screen/tools/project-save/ProjectDB.ts
import { ProjectSavePayload } from './projectSave.types';
import { syncService } from '../../../../services/sync.service';

const DB_NAME = 'veytrix_projects_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const LOCAL_STORAGE_KEY_PREFIX = 'veytrix_project_backup_';

function cleanSerializableData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'function') return undefined;
  if (typeof obj !== 'object') return obj;

  if (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement) return undefined;
  if (typeof Node !== 'undefined' && obj instanceof Node) return undefined;
  if (obj.$$typeof && typeof obj.$$typeof === 'symbol') return undefined;

  if (Array.isArray(obj)) {
    return obj.map(cleanSerializableData).filter((item) => item !== undefined);
  }

  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (
      key.startsWith('_') ||
      key.endsWith('Ref') ||
      key === 'element' ||
      key === 'node' ||
      key === 'mediaElement' ||
      key === 'file'
    ) {
      continue;
    }
    const val = cleanSerializableData(obj[key]);
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

export class ProjectDB {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported in this browser environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Saves a project payload to IndexedDB with LocalStorage fallback.
   */
  public static async saveProject(payload: ProjectSavePayload): Promise<boolean> {
    const rawData = {
      ...payload,
      id: payload.id || 'default_project',
      updatedAt: Date.now(),
    };

    const projectData = cleanSerializableData(rawData);

    // Try IndexedDB first
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(projectData);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      // Also save light version to LocalStorage as instant fallback
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${payload.id}`, JSON.stringify(projectData));
      } catch (e) {
        // Ignore localStorage quota errors if IndexedDB succeeded
      }

      // Background cloud sync to Supabase
      syncService.queueSync(projectData).catch((e) => console.warn('Background sync queue error:', e));

      return true;
    } catch (err) {
      console.warn('IndexedDB save failed, attempting LocalStorage fallback:', err);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${payload.id}`, JSON.stringify(projectData));
        syncService.queueSync(projectData).catch((e) => console.warn('Background sync queue error:', e));
        return true;
      } catch (fallbackErr) {
        console.error('LocalStorage fallback save failed:', fallbackErr);
        return false;
      }
    }
  }

  /**
   * Loads a project payload by ID from IndexedDB or LocalStorage.
   */
  public static async loadProject(projectId: string): Promise<ProjectSavePayload | null> {
    try {
      const db = await this.getDB();
      const projectFromIDB = await new Promise<ProjectSavePayload | null>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(projectId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (projectFromIDB) return projectFromIDB;
    } catch (err) {
      console.warn('IndexedDB load failed, attempting LocalStorage fallback:', err);
    }

    // LocalStorage fallback
    try {
      const localData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${projectId}`);
      if (localData) {
        return JSON.parse(localData) as ProjectSavePayload;
      }
    } catch (e) {
      console.error('LocalStorage load fallback failed:', e);
    }

    return null;
  }

  /**
   * Retrieves all saved projects from IndexedDB, LocalStorage fallback, and Supabase cloud.
   */
  public static async getAllProjects(): Promise<ProjectSavePayload[]> {
    const projectsMap = new Map<string, ProjectSavePayload>();

    // 1. Fetch from IndexedDB
    try {
      const db = await this.getDB();
      const idbProjects = await new Promise<ProjectSavePayload[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      for (const p of idbProjects) {
        if (p && p.id) {
          projectsMap.set(p.id, p);
        }
      }
    } catch (err) {
      console.warn('IndexedDB getAllProjects failed, checking LocalStorage fallback:', err);
    }

    // 2. Scan LocalStorage fallback keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_KEY_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const p = JSON.parse(raw) as ProjectSavePayload;
            if (p && p.id && !projectsMap.has(p.id)) {
              projectsMap.set(p.id, p);
            }
          }
        }
      }
    } catch (e) {
      // Ignore localStorage read errors
    }

    // 3. Merge remote projects from Supabase in background
    try {
      const remoteProjects = await syncService.fetchRemoteProjects();
      for (const rp of remoteProjects) {
        if (rp && rp.id) {
          const existing = projectsMap.get(rp.id);
          // If remote is newer or local does not exist, update local cache
          if (!existing || (rp.updatedAt && rp.updatedAt > (existing.updatedAt || 0))) {
            projectsMap.set(rp.id, rp);
            // Cache to local IndexedDB
            this.saveProject(rp).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('Supabase remote fetch warning:', e);
    }

    const result = Array.from(projectsMap.values());
    result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return result;
  }
}
