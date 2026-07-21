"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  GraduationCap,
  Plus,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress";
import { GoogleIcon } from "@/components/icons/google";
import { interests } from "@/lib/mock";
import type { Role } from "@/lib/mock/types";
import { useApp } from "@/lib/store/app-provider";
import { isSupabaseEnabled } from "@/lib/services/config";
import { signInWithGoogle, signUpWithEmail } from "@/lib/services/auth";
import {
  blobToAvatarDataUrl,
  stashPendingAvatar,
} from "@/lib/services/storage";
import { cn } from "@/lib/utils";

const ROLES: {
  value: Role;
  label: string;
  desc: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "student",
    label: "Cohort Member",
    desc: "Join live sessions & learn",
    icon: GraduationCap,
  },
  {
    value: "teacher",
    label: "Professional",
    desc: "Teach what you know & earn",
    icon: Presentation,
  },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: Role =
    roleParam === "professional" || roleParam === "teacher"
      ? "teacher"
      : "student";
  const { signIn, setProfileName, setProfileAvatar, setRole } = useApp();
  const [role, setRoleChoice] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const homeHref = role === "teacher" ? "/teach/dashboard" : "/home";

  const toggle = (topic: string) =>
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );

  const addCustomInterest = () => {
    const topic = customInterest.trim();
    if (!topic) return;
    setSelected((prev) => (prev.includes(topic) ? prev : [...prev, topic]));
    setCustomInterest("");
  };

  const onPhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await blobToAvatarDataUrl(file);
    if (dataUrl) {
      setPhoto(dataUrl);
      setError(null);
    }
  };

  /** Photo is mandatory for professionals — it fronts their public listing. */
  const requirePhoto = (): boolean => {
    if (role === "teacher" && !photo) {
      setError("Add a profile photo — learners see it on your listing.");
      return false;
    }
    return true;
  };

  const completeSignup = async () => {
    setError(null);
    setNotice(null);
    if (role === "teacher" && !profession.trim()) {
      setError("Please tell us your profession to sign up as a Professional.");
      return;
    }
    if (!requirePhoto()) return;
    setBusy(true);
    // Stash the photo pre-signup — the store uploads it on the first backend
    // load (works across email confirmation too, where no session exists yet).
    if (photo) stashPendingAvatar(photo);
    const res = await signUpWithEmail({
      name: name.trim() || email.split("@")[0],
      email,
      password,
      role,
      profession:
        role === "teacher" && profession.trim() ? profession.trim() : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not create your account.");
      return;
    }
    if (name.trim()) setProfileName(name);
    if (photo) setProfileAvatar(photo);
    setRole(role);
    if (res.needsConfirmation) {
      setNotice("Almost there — check your email to confirm your account.");
      return;
    }
    signIn();
    router.push(homeHref);
  };

  const google = async () => {
    if (!requirePhoto()) return;
    if (photo) stashPendingAvatar(photo);
    if (isSupabaseEnabled) {
      // Pass the chosen role so the callback records it on the profile —
      // OAuth signups can't carry metadata like email signups do.
      const res = await signInWithGoogle(homeHref, role);
      if (!res.ok) setError(res.error ?? "Google sign-in failed.");
      return;
    }
    if (name.trim()) setProfileName(name);
    if (photo) setProfileAvatar(photo);
    setRole(role);
    signIn();
    router.push(homeHref);
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
          Share expertise or learn with a cohort.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {ROLES.map((r) => {
            const active = role === r.value;
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRoleChoice(r.value)}
                aria-pressed={active}
                className={cn(
                  "tap rounded-2xl border p-3.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-ink/10 bg-white",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    active ? "bg-primary text-white" : "bg-ink/5 text-ink-soft",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">{r.label}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                  {r.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="tap relative shrink-0 rounded-full"
              aria-label={photo ? "Change profile photo" : "Add profile photo"}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  className="size-18 rounded-full object-cover ring-2 ring-primary/40"
                />
              ) : (
                <span className="grid size-18 place-items-center rounded-full border-2 border-dashed border-ink/20 bg-ink/5 text-ink-soft">
                  <Camera className="size-6" />
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 grid size-6.5 place-items-center rounded-full border-2 border-white bg-primary text-white">
                <Plus className="size-3.5" />
              </span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoPick}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                Profile photo{role === "teacher" ? "" : " (optional)"}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                {role === "teacher"
                  ? "Required — learners see it on your listing."
                  : "Help professionals recognise you in sessions."}
              </p>
            </div>
          </div>

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
              type="email"
              tone="light"
              placeholder="name@email.com or 080..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password" tone="light">
            <PasswordInput
              id="password"
              tone="light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {role === "teacher" ? (
            <Field
              label="State your profession"
              htmlFor="profession"
              tone="light"
            >
              <Input
                id="profession"
                tone="light"
                placeholder="e.g. Product Designer, Chartered Accountant"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </Field>
          ) : (
            <div>
              <p className="mb-3 text-sm font-semibold text-ink">
                What would you like to learn about?
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
                {selected
                  .filter((topic) => !interests.includes(topic))
                  .map((topic) => (
                    <Chip
                      key={topic}
                      tone="light"
                      selected
                      onClick={() => toggle(topic)}
                    >
                      {topic}
                    </Chip>
                  ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  id="custom-interest"
                  tone="light"
                  placeholder="Don't see it? Type your own…"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="soft"
                  onClick={addCustomInterest}
                  disabled={!customInterest.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-[13px] font-medium text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-[13px] font-medium text-primary">
            {notice}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-6"
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create Account"}{" "}
          <ArrowRight className="size-5" />
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

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
