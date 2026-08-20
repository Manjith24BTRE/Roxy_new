import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
  (typeof process !== "undefined" && process.env?.["VITE_SUPABASE_URL"]) ||
  "";

const supabasePublishableKey =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      import.meta.env?.["VITE_SUPABASE_ANON_KEY"])) ||
  (typeof process !== "undefined" &&
    (process.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env?.["VITE_SUPABASE_ANON_KEY"])) ||
  "";

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.trim() !== "" &&
  supabasePublishableKey.trim() !== "",
);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey)
  : null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase client is not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env file.",
    );
  }
  return supabase;
}
