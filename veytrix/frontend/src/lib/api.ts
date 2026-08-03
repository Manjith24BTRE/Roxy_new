import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = responseData?.message || responseData?.detail?.message || responseData?.error || 'An error occurred during API request.';
    if (responseData?.message === 'Validation Error' && Array.isArray(responseData?.error) && responseData.error.length > 0) {
      const details = responseData.error.map((err: any) => `${err?.loc?.join('.') || 'field'}: ${err?.msg || 'invalid'}`).join('; ');
      errorMsg = `Validation Error (${details})`;
    } else if (typeof responseData?.error === 'string') {
      errorMsg = responseData.error;
    }
    throw new Error(errorMsg);
  }

  return responseData as T;
}
