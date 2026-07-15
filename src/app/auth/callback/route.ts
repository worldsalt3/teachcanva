import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback. Exchanges the `code` for a session
 * (cookies are written by the server client) and redirects onward. A `role`
 * param records signup intent (Google OAuth can't carry metadata) and is
 * applied to the profile; without an explicit `next` we route by role.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const roleIntent = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        let role: string | null = null;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          if (roleIntent === "teacher" || roleIntent === "student") {
            await supabase
              .from("profiles")
              .update({ role: roleIntent })
              .eq("id", user.id);
            role = roleIntent;
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            role = profile?.role ?? null;
          }
        }
        const dest =
          next ?? (role === "teacher" ? "/teach/dashboard" : "/home");
        return NextResponse.redirect(`${origin}${dest}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
