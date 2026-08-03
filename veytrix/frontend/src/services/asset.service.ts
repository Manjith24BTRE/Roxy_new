import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface UploadAssetResult {
  id: string;
  file_url: string;
  storage_path: string;
}

export async function uploadAsset(
  file: File,
  assetType: 'VIDEO' | 'IMAGE' | 'AUDIO' = 'VIDEO'
): Promise<UploadAssetResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('asset_type', assetType);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/assets/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload asset (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    file_url: result.file_url,
    storage_path: result.storage_path,
  };
}
