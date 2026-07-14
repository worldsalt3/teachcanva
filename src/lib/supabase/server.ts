import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { integrations, isSupabaseEnabled } from "@/lib/services/config";

/**
 * Request-scoped server Supabase client bound to the auth cookies. Returns
 * `null` when Supabase env vars are absent. Call inside Server Components,
 * Route Handlers and Server Actions.
 */
export async function createClient() {
  if (!isSupabaseEnabled) return null;

  const cookieStore = await cookies();

  return createServerClient(
    integrations.supabase.url,
    integrations.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component where cookies are read-only —
            // safe to ignore; the middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
