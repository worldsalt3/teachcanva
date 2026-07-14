import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { integrations, isSupabaseEnabled } from "@/lib/services/config";

/**
 * Refreshes the Supabase auth session on each request so expired access
 * tokens are rotated into the response cookies. A no-op (passes the request
 * straight through) when Supabase isn't configured.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseEnabled) return response;

  const supabase = createServerClient(
    integrations.supabase.url,
    integrations.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
