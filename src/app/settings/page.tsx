"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Mail,
  Moon,
  ShieldCheck,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useApp } from "@/lib/store/app-provider";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { studentName, setProfileName, signOut } = useApp();
  const [name, setName] = useState(studentName);
  const [lastSynced, setLastSynced] = useState(studentName);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    push: true,
    email: false,
    sound: true,
    dark: true,
  });

  // Sync the field when the persisted name hydrates (no effect needed).
  if (studentName !== lastSynced) {
    setLastSynced(studentName);
    setName(studentName);
  }

  const save = () => {
    setProfileName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader bordered>
        <div className="flex items-center gap-2">
          <BackButton className="-ml-2" />
          <h1 className="font-display text-lg font-bold text-fg">Settings</h1>
        </div>
      </AppHeader>

      <div className="space-y-7 px-5 pt-4">
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={name || studentName} size="xl" ring />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold text-fg">
                {name || studentName}
              </p>
              <p className="text-[13px] text-fg-muted">Student · Lagos</p>
            </div>
          </div>

          <Field label="Display name" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </Field>

          <Button
            onClick={save}
            fullWidth
            size="lg"
            variant={saved ? "success" : "primary"}
          >
            {saved ? (
              <>
                <Check className="size-5" /> Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </section>

        <section>
          <p className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-wider text-fg-faint">
            Preferences
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            <ToggleRow
              icon={Bell}
              tint="bg-primary/15 text-primary-soft"
              label="Push notifications"
              on={prefs.push}
              onToggle={() => toggle("push")}
            />
            <ToggleRow
              icon={Mail}
              tint="bg-teal/15 text-teal"
              label="Email updates"
              on={prefs.email}
              onToggle={() => toggle("email")}
            />
            <ToggleRow
              icon={Volume2}
              tint="bg-gold/15 text-gold"
              label="Session sounds"
              on={prefs.sound}
              onToggle={() => toggle("sound")}
            />
            <ToggleRow
              icon={Moon}
              tint="bg-surface-2 text-fg-muted"
              label="Dark appearance"
              on={prefs.dark}
              onToggle={() => toggle("dark")}
            />
          </div>
        </section>

        <section>
          <p className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-wider text-fg-faint">
            About
          </p>
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-success/15 text-success-bright">
                <ShieldCheck className="size-4.5" />
              </span>
              <div className="flex-1">
                <p className="font-medium text-fg">Privacy &amp; security</p>
                <p className="text-[12px] text-fg-muted">
                  Your data is encrypted in transit.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-fg-faint">
            TeachCanvas v1.0.0
          </p>
        </section>

        <button
          type="button"
          onClick={signOut}
          className="tap mb-2 flex w-full items-center justify-center rounded-card border border-danger/30 bg-danger/10 py-3.5 font-semibold text-danger"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  tint,
  label,
  on,
  onToggle,
}: {
  icon: LucideIcon;
  tint: string;
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          tint,
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <span className="flex-1 font-medium text-fg">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "tap relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            on ? "left-5.5" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
