"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  GraduationCap,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function TeacherApplyPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <main className="min-h-dvh pb-10">
      <div className="flex items-center justify-between px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <span className="font-display text-lg font-extrabold">
          Teach<span className="text-primary-soft">Canvas</span>
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
      </div>

      <div className="px-6 pb-2 text-center">
        <h1 className="font-display text-2xl font-bold">Join as a Tutor</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-fg-muted">
          Share your knowledge and earn with the leading learning platform in
          Africa.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/teach/dashboard");
        }}
        className="mx-4 mt-4 rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative"
          >
            <span className="grid size-24 place-items-center overflow-hidden rounded-full bg-surface text-white/80">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt="Profile preview"
                  className="size-full object-cover"
                />
              ) : (
                <Camera className="size-8" />
              )}
            </span>
            <span className="absolute bottom-1 right-1 grid size-7 place-items-center rounded-full bg-primary text-white ring-4 ring-white">
              <Pencil className="size-3.5" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }}
          />
          <span className="mt-3 text-sm text-ink-soft">
            {photo
              ? "Photo added — tap to change"
              : "Upload professional photo"}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Full name" htmlFor="name" tone="light">
            <Input id="name" tone="light" placeholder="e.g. Chinelo Olumide" />
          </Field>
          <Field label="Email or phone number" htmlFor="contact" tone="light">
            <Input id="contact" tone="light" placeholder="Enter contact info" />
          </Field>
          <Field label="Create password" htmlFor="password" tone="light">
            <PasswordInput id="password" tone="light" placeholder="••••••••" />
          </Field>
          <Field label="Subjects taught" htmlFor="subjects" tone="light">
            <div className="relative">
              <Input
                id="subjects"
                tone="light"
                className="pr-11"
                placeholder="e.g. Mathematics, Physics"
              />
              <GraduationCap className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-teal" />
            </div>
          </Field>
          <Field label="Hourly rate (₦)" htmlFor="rate" tone="light">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-soft">
                ₦
              </span>
              <Input
                id="rate"
                tone="light"
                inputMode="numeric"
                className="pl-9"
                placeholder="5,000"
              />
            </div>
          </Field>
          <Field
            label="Tell students about yourself"
            htmlFor="bio"
            tone="light"
            hint="Bio"
          >
            <Textarea
              id="bio"
              tone="light"
              rows={4}
              placeholder="Briefly describe your teaching style, experience, and what students can expect…"
            />
          </Field>
        </div>

        <div className="mt-6 flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
          <ShieldCheck className="size-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-bold text-ink">Verification note</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Your profile will be reviewed within 24 hours to ensure platform
              quality. You&apos;ll receive an email once approved.
            </p>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth className="mt-6">
          Create Instructor Profile <ArrowRight className="size-5" />
        </Button>
      </form>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-linear-to-br from-[#1f3b66] to-[#0d1b33]" />
        <div className="h-24 rounded-2xl bg-linear-to-br from-[#11324a] to-[#0c1626]" />
      </div>
    </main>
  );
}
