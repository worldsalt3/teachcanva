import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged server-only client using the service-role key. Bypasses RLS, so
 * use it ONLY in trusted server code (e.g. crediting a wallet after a payment
 * is verified). Returns `null` when the service-role key isn't configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
