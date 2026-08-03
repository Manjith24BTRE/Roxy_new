// -----------------------------------------------------------------------------
// export.service.ts
// -----------------------------------------------------------------------------
// Production API client for backend export endpoints with WebSocket support.
// Uses the shared apiRequest helper for auth token injection.
// -----------------------------------------------------------------------------

import { apiRequest } from '../lib/api';
import type {
  ExportCreatePayload,
  ExportJob,
  ExportStatusResponse,
  ExportDownloadResponse,
  ExportListResponse,
  ExportStatus,
} from '../types/export.types';

const BASE = '/exports';

/** Trigger a new project export job */
export async function createExport(payload: ExportCreatePayload): Promise<ExportJob> {
  console.log('[6] API request started: POST /api/v1/exports');
  console.log('[7] Request payload:', payload);
  try {
    const res = await apiRequest<ExportJob>(BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('[8] Response received:', res);
    console.log('[9] Export job created successfully, ID:', res.id);
    return res;
  } catch (err) {
    console.error('[!] API request failed:', err);
    throw err;
  }
}

/** List export jobs for the authenticated user */
export async function listExports(params?: {
  project_id?: string;
  status?: ExportStatus;
  page?: number;
  limit?: number;
}): Promise<ExportListResponse> {
  const query = new URLSearchParams();
  if (params?.project_id) query.set('project_id', params.project_id);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiRequest<ExportListResponse>(`${BASE}${qs ? '?' + qs : ''}`);
}

/** Get full export job details */
export async function getExport(exportId: string): Promise<ExportJob> {
  return apiRequest<ExportJob>(`${BASE}/${exportId}`);
}

/** Poll export progress (lightweight) */
export async function getExportStatus(exportId: string): Promise<ExportStatusResponse> {
  return apiRequest<ExportStatusResponse>(`${BASE}/${exportId}/status`);
}

/** Get signed download URL for a completed export */
export async function getExportDownload(exportId: string): Promise<ExportDownloadResponse> {
  return apiRequest<ExportDownloadResponse>(`${BASE}/${exportId}/download`);
}

/** Retry a failed or cancelled export job */
export async function retryExport(exportId: string): Promise<ExportJob> {
  return apiRequest<ExportJob>(`${BASE}/${exportId}/retry`, {
    method: 'POST',
  });
}

/** Cancel / delete an export job */
export async function cancelExport(exportId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`${BASE}/${exportId}/cancel`, {
    method: 'POST',
  });
}

/** Establish WebSocket connection for real-time progress events */
export function connectExportWebSocket(
  userId: string,
  onMessage: (data: any) => void
): WebSocket | null {
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/^http/, 'ws') : `${wsProtocol}//${window.location.host}`;
    const wsUrl = `${wsHost}/api/v1/exports/ws/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // Ignore parse error
      }
    };

    return ws;
  } catch {
    return null;
  }
}
