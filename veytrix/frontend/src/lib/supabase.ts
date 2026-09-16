import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as any).SUPABASE_URL ||
  'https://vriqwtzyxdnlpagexqay.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta.env as any).SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDY4MDMsImV4cCI6MjEwMTA4MjgwM30.-ohvCVsIivfcohHcSiYgsA1TnnDYdIsuSkP_VTwN_IM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables.');
}

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn('localStorage getItem notice:', e);
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn('localStorage setItem failed, attempting cleanup of cached items:', e);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (
              k &&
              k !== key &&
              (k.startsWith('veytrix_project_backup_') ||
                k.startsWith('veytrix_recent_') ||
                k.startsWith('veytrix_favorite_') ||
                k.startsWith('veytrix_gallery_'))
            ) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k));
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (retryErr) {
        console.warn('localStorage setItem retry after cleanup failed:', retryErr);
      }
    }
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage removeItem notice:', e);
    }
    delete memoryStore[key];
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: safeStorage,
  },
});

const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta.env as any).SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjgwMywiZXhwIjoyMTAxMDgyODAzfQ.04Y_5qeUW8sT2KzPJAnZVSb_i5qkTTscKWjRMpquvA8';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});


