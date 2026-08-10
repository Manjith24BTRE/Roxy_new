// src/services/sync.service.ts
import { supabase } from '../lib/supabase';
import { ProjectSavePayload } from '../components/editor-main-screen/tools/project-save/projectSave.types';

export class SyncService {
  private static instance: SyncService;
  private syncQueue: Set<string> = new Set();
  private isProcessing = false;
  private retryCounts: Map<string, number> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncService] Network reconnected. Flushing pending sync queue...');
        this.processQueue();
      });
    }
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Enqueues a project payload for background syncing to Supabase.
   */
  public async queueSync(project: ProjectSavePayload): Promise<void> {
    this.syncQueue.add(project.id);
    this.processQueue();
  }

  /**
   * Processes all pending project sync tasks in background.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.size === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[SyncService] Currently offline. Deferred sync until online.');
      return;
    }

    this.isProcessing = true;
    const projectIds = Array.from(this.syncQueue);

    for (const projectId of projectIds) {
      try {
        const success = await this.syncProjectToCloud(projectId);
        if (success) {
          this.syncQueue.delete(projectId);
          this.retryCounts.delete(projectId);
        } else {
          this.handleSyncFailure(projectId);
        }
      } catch (err) {
        console.warn(`[SyncService] Sync error for project ${projectId}:`, err);
        this.handleSyncFailure(projectId);
      }
    }

    this.isProcessing = false;
  }

  private handleSyncFailure(projectId: string): void {
    const attempts = (this.retryCounts.get(projectId) || 0) + 1;
    this.retryCounts.set(projectId, attempts);

    if (attempts >= 3) {
      console.error(`[SyncService] Max retries reached for project ${projectId}. Keeping in local queue.`);
      this.syncQueue.delete(projectId);
    } else {
      setTimeout(() => {
        this.processQueue();
      }, attempts * 2000);
    }
  }

  /**
   * Pushes single project payload to Supabase database.
   */
  public async syncProjectToCloud(projectId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not logged in, local-only mode
        return true;
      }

      // Read from LocalStorage / IndexedDB payload
      const localData = localStorage.getItem(`veytrix_project_backup_${projectId}`);
      if (!localData) return true;

      const payload = JSON.parse(localData) as ProjectSavePayload;

      // Validate UUID format for Supabase PK
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);

      const dbRecord: any = {
        user_id: user.id,
        title: payload.name || 'Untitled Project',
        timeline_json: payload,
        updated_at: new Date(payload.updatedAt || Date.now()).toISOString(),
      };

      if (isUuid) {
        dbRecord.id = projectId;
      }

      const { error } = await supabase.from('projects').upsert(dbRecord, { onConflict: 'id' });

      if (error) {
        console.warn('[SyncService] Supabase upsert error:', error.message);
        return false;
      }

      console.log(`[SyncService] Project ${projectId} successfully synced to Supabase.`);
      return true;
    } catch (err) {
      console.warn('[SyncService] Exception syncing project to cloud:', err);
      return false;
    }
  }

  /**
   * Fetches all projects for current user from Supabase.
   */
  public async fetchRemoteProjects(): Promise<ProjectSavePayload[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => {
        const payload: ProjectSavePayload = row.timeline_json || {};
        return {
          ...payload,
          id: row.id || payload.id,
          name: row.title || payload.name || 'Untitled Project',
          updatedAt: new Date(row.updated_at).getTime(),
          syncStatus: 'synced',
        };
      });
    } catch (err) {
      console.warn('[SyncService] Failed to fetch remote projects:', err);
      return [];
    }
  }
}

export const syncService = SyncService.getInstance();
