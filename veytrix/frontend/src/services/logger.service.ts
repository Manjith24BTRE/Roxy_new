import { supabase, supabaseAdmin } from '../lib/supabase';

export type LogLevel = 'info' | 'warning' | 'error';

export interface SystemLogEntry {
  id?: string;
  service: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

class LoggerService {
  private async createLog(service: string, level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
    const payload = {
      service,
      level,
      message,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // Always output to developer console
    const logPrefix = `[${level.toUpperCase()}] [${service}]`;
    if (level === 'error') {
      console.error(logPrefix, message, metadata);
    } else if (level === 'warning') {
      console.warn(logPrefix, message, metadata);
    } else {
      console.log(logPrefix, message, metadata);
    }

    try {
      const client = supabaseAdmin || supabase;
      if (client) {
        const { error } = await client.from('system_logs').insert([payload]);
        if (error) {
          // If system_logs table has RLS or connection issue, fall back gracefully
          console.warn('System log persistence warning:', error.message);
        }
      }
    } catch (e) {
      console.warn('Could not persist system log to database:', e);
    }
  }

  public async logInfo(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.createLog(service, 'info', message, metadata);
  }

  public async logWarning(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.createLog(service, 'warning', message, metadata);
  }

  public async logError(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.createLog(service, 'error', message, metadata);
  }
}

export const loggerService = new LoggerService();
export default loggerService;
