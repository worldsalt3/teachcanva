"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { requestPasswordReset } from "@/lib/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const res = await requestPasswordReset(email.trim());
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not send the reset email. Try again.");
      return;
    }
    setSent(true);
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Logo href="/" />
      </div>

      {sent ? (
        <div className="mx-4 mt-4 rounded-3xl bg-white p-6 text-ink shadow-xl">
          <div className="grid size-12 place-items-center rounded-2xl bg-success/10">
            <MailCheck className="size-6 text-success" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            If an account exists for{" "}
            <span className="font-semibold text-ink">{email.trim()}</span>,
            we&apos;ve sent a link to reset your password. The link expires
            after a short while, so use it soon.
          </p>
          <Button
            size="lg"
            fullWidth
            className="mt-6"
            onClick={() => router.push("/login")}
          >
            Back to log in <ArrowRight className="size-5" />
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mx-4 mt-4 rounded-3xl bg-white p-6 text-ink shadow-xl"
        >
          <h1 className="font-display text-2xl font-bold">Forgot password?</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <div className="mt-6">
            <Field label="Email" htmlFor="email" tone="light">
              <Input
                id="email"
                type="email"
                tone="light"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            disabled={busy || !email.trim()}
          >
            {busy ? "Sending…" : "Send reset link"}{" "}
            <ArrowRight className="size-5" />
          </Button>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-primary">
              Log in
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
