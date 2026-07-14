"use client";

import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/mock/types";

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** True when email confirmation is required before a session is issued. */
  needsConfirmation?: boolean;
}

interface SignUpParams {
  name: string;
  email: string;
  password: string;
  role: Role;
}

/**
 * Email/password sign-up. The `name` and `role` land in user metadata, which
 * the `handle_new_user` trigger copies into the profile + wallet rows.
 * No-ops as a success when Supabase isn't configured (stub preview).
 */
export async function signUpWithEmail(
  params: SignUpParams,
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const next = params.role === "teacher" ? "/teach/dashboard" : "/home";
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { name: params.name, role: params.role },
      // Land the email-confirmation link back in the app so the callback
      // exchanges the code and signs the user straight in.
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, needsConfirmation: !data.session };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithGoogle(next = "/home"): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutBackend(): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Sends a password-reset email. The link lands on `/auth/callback` which
 * exchanges the code for a session, then forwards to `/reset-password`.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Sets a new password for the currently signed-in user (post reset link). */
export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Current signed-in user resolved from the session + profile, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? (user.user_metadata?.name as string) ?? "",
    role: (profile?.role as Role) ?? "student",
  };
}
