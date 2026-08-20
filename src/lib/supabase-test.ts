import { isSupabaseConfigured, supabase } from "./supabase";

export interface SupabaseTestResult {
  isConfigured: boolean;
  initialized: boolean;
  message: string;
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      initialized: false,
      message:
        "Supabase credentials are not configured in environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).",
    };
  }

  try {
    // Check client initialization by querying auth session state
    // (does not require any specific database tables to exist)
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        isConfigured: true,
        initialized: true,
        message: `Supabase client initialized, auth service response: ${error.message}`,
      };
    }

    return {
      isConfigured: true,
      initialized: true,
      message: "Supabase client successfully initialized and reachable.",
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      initialized: false,
      message: `Supabase client error: ${errorMessage}`,
    };
  }
}
