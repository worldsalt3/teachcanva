"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress";
import { GoogleIcon } from "@/components/icons/google";
import { interests } from "@/lib/mock";
import { useApp } from "@/lib/store/app-provider";

export default function SignupPage() {
  const router = useRouter();
  const { signIn, setProfileName } = useApp();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>(["Further Maths"]);

  const toggle = (topic: string) =>
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );

  const completeSignup = () => {
    if (name.trim()) setProfileName(name);
    signIn();
    router.push("/home");
  };

  return (
    <main className="min-h-dvh">
      <div className="px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-extrabold">
            Teach<span className="text-primary-soft">Canvas</span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-fg-muted">
            Step 1 of 2
          </span>
        </div>
        <ProgressBar value={50} className="mt-3" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          completeSignup();
        }}
        className="mx-4 mb-6 rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Start your learning journey today.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Full name" htmlFor="name" tone="light">
            <Input
              id="name"
              tone="light"
              placeholder="e.g. Chinelo Olumide"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email or phone number" htmlFor="email" tone="light">
            <Input
              id="email"
              tone="light"
              placeholder="name@email.com or 080..."
            />
          </Field>
          <Field label="Password" htmlFor="password" tone="light">
            <PasswordInput id="password" tone="light" placeholder="••••••••" />
          </Field>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">
              What are you interested in learning?
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map((topic) => (
                <Chip
                  key={topic}
                  tone="light"
                  selected={selected.includes(topic)}
                  onClick={() => toggle(topic)}
                >
                  {topic}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth className="mt-6">
          Create Account <ArrowRight className="size-5" />
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs font-medium text-ink-soft/70">
          <span className="h-px flex-1 bg-ink/10" /> OR{" "}
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          onClick={completeSignup}
          className="tap flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-ink/10 bg-white text-sm font-semibold text-ink transition-colors hover:bg-ink/3"
        >
          <GoogleIcon className="size-5" /> Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary">
            Log In
          </Link>
        </p>
      </form>

      <p className="pb-8 text-center text-xs text-fg-faint">
        Need help? <span className="underline">Contact Support</span> ·{" "}
        <span className="underline">Terms of Service</span>
      </p>
    </main>
  );
}
