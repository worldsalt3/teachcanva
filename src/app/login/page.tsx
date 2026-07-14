"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleIcon } from "@/components/icons/google";
import { Logo } from "@/components/layout/logo";
import { useApp } from "@/lib/store/app-provider";
import { isSupabaseEnabled } from "@/lib/services/config";
import {
  getSessionUser,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const res = await signInWithEmail(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Could not log in. Check your details.");
      return;
    }
    signIn();
    // Land professionals in their workspace, learners on home.
    const user = isSupabaseEnabled ? await getSessionUser() : null;
    setBusy(false);
    router.push(user?.role === "teacher" ? "/teach/dashboard" : "/home");
  };

  const google = async () => {
    if (isSupabaseEnabled) {
      const res = await signInWithGoogle("/home");
      if (!res.ok) setError(res.error ?? "Google sign-in failed.");
      return;
    }
    signIn();
    router.push("/home");
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Logo href="/" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mx-4 mt-4 rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Log in to continue learning.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Email or phone number" htmlFor="email" tone="light">
            <Input
              id="email"
              type="email"
              tone="light"
              placeholder="name@email.com or 080..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            tone="light"
            hint={
              <Link
                href="/forgot-password"
                className="font-semibold text-primary"
              >
                Forgot?
              </Link>
            }
          >
            <PasswordInput
              id="password"
              tone="light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-[13px] font-medium text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-6"
          disabled={busy}
        >
          {busy ? "Logging in…" : "Log In"} <ArrowRight className="size-5" />
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs font-medium text-ink-soft/70">
          <span className="h-px flex-1 bg-ink/10" /> OR{" "}
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          onClick={google}
          className="tap flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-ink/10 bg-white text-sm font-semibold text-ink transition-colors hover:bg-ink/3"
        >
          <GoogleIcon className="size-5" /> Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New to TeachCanvas?{" "}
          <Link href="/signup" className="font-bold text-primary">
            Create account
          </Link>
        </p>
      </form>

      <div className="mt-auto pb-8 pt-10 text-center">
        <Link
          href="/teach/apply"
          className="text-sm text-fg-muted hover:text-fg"
        >
          Want to teach?{" "}
          <span className="font-semibold text-fg">Join as a Professional</span>
        </Link>
      </div>
    </main>
  );
}
