"use client";

import { createBrowserClient } from "@supabase/ssr";
import { integrations, isSupabaseEnabled } from "@/lib/services/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client (singleton). Returns `null` when Supabase env vars
 * are absent, so callers can fall back to the local/stub data path.
 */
export function createClient() {
  if (!isSupabaseEnabled) return null;
  browserClient ??= createBrowserClient(
    integrations.supabase.url,
    integrations.supabase.anonKey,
  );
  return browserClient;
}
