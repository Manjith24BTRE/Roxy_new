import { supabase, supabaseAdmin } from '../lib/supabase';

export type LogLevel = 'info' | 'warning' | 'error';

export interface FrontendLogPayload {
  id?: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

class FrontendLogger {
  private initialized = false;

  constructor() {
    this.initGlobalErrorHandlers();
  }

  private initGlobalErrorHandlers() {
    if (typeof window === 'undefined' || this.initialized) return;
    this.initialized = true;

    // Capture unhandled JavaScript / React exceptions
    window.addEventListener('error', (event) => {
      this.error('React Error', event.message || 'Unhandled window error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', event.reason?.message || String(event.reason), {
        reason: event.reason,
      });
    });
  }

  private async writeLog(level: LogLevel, category: string, message: string, metadata?: Record<string, any>): Promise<void> {
    const payload = {
      level,
      category,
      message,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // Console output
    const prefix = `[FRONTEND] [${category}]`;
    if (level === 'error') console.error(prefix, message, metadata);
    else if (level === 'warning') console.warn(prefix, message, metadata);
    else console.log(prefix, message, metadata);

    try {
      const client = supabaseAdmin || supabase;
      if (client) {
        await client.from('frontend_logs').insert([payload]);
      }
    } catch (err) {
      console.warn('Frontend log db insert warning:', err);
    }
  }

  public info(category: string, message: string, metadata?: Record<string, any>): void {
    this.writeLog('info', category, message, metadata);
  }

  public warn(category: string, message: string, metadata?: Record<string, any>): void {
    this.writeLog('warning', category, message, metadata);
  }

  public error(category: string, message: string, metadata?: Record<string, any>): void {
    this.writeLog('error', category, message, metadata);
  }
}

export const frontendLogger = new FrontendLogger();
export default frontendLogger;
