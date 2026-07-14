"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Logo } from "@/components/layout/logo";
import { useApp } from "@/lib/store/app-provider";
import { updatePassword } from "@/lib/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { signIn } = useApp();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const res = await updatePassword(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not update your password. Try again.");
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
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Choose a strong password you haven&apos;t used before.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="New password" htmlFor="password" tone="light">
            <PasswordInput
              id="password"
              tone="light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" tone="light">
            <PasswordInput
              id="confirm"
              tone="light"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
          disabled={busy || !password || !confirm}
        >
          {busy ? "Updating…" : "Update password"}{" "}
          <ArrowRight className="size-5" />
        </Button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Link expired?{" "}
          <Link href="/forgot-password" className="font-bold text-primary">
            Request a new one
          </Link>
        </p>
      </form>
    </main>
  );
}
