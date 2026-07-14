"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronLeft,
  GraduationCap,
  Heart,
  Share2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { MediaThumb } from "@/components/ui/media";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { cn, formatCompact, formatNaira } from "@/lib/utils";
import type { Review, Teacher } from "@/lib/mock";

const TABS = ["About", "Reviews", "Availability"];

export function TeacherProfile({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  const [tab, setTab] = useState("About");
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: teacher.name,
          text: `Learn with ${teacher.name} on TeachCanvas`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 1800);
    } catch {
      /* share cancelled or unavailable */
    }
  };

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <div className="relative">
        <MediaThumb seed={teacher.id} icon={false} className="h-44" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <CoverButton label="Go back" onClick={() => router.back()}>
            <ChevronLeft className="size-6" />
          </CoverButton>
          <div className="flex gap-2">
            <CoverButton label="Share" onClick={handleShare}>
              <Share2 className="size-5" />
            </CoverButton>
            <CoverButton
              label={saved ? "Saved" : "Save professional"}
              onClick={() => setSaved((v) => !v)}
            >
              <Heart
                className={cn("size-5", saved && "fill-danger text-danger")}
              />
            </CoverButton>
          </div>
        </div>
        {teacher.isLive && (
          <Badge
            variant="live"
            dot
            uppercase
            className="absolute bottom-3 right-4"
          >
            Live now
          </Badge>
        )}
      </div>

      <div className="px-5">
        <div className="-mt-10 flex items-end gap-4">
          <Avatar
            name={teacher.name}
            size="2xl"
            className="shrink-0 ring-4 ring-canvas"
          />
          <Badge variant="gold" className="mb-2">
            <Sparkles className="size-3.5" />
            Earn {teacher.tpBonusPerHour} TP / hr
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
            {teacher.name}
          </h1>
          {teacher.verified && (
            <BadgeCheck className="size-5 shrink-0 fill-primary text-white" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-fg-muted">{teacher.title}</p>

        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-card border border-border bg-surface text-center">
          <Stat
            label="Rating"
            value={teacher.rating.toFixed(1)}
            icon={<Star className="size-3.5 fill-gold text-gold" />}
          />
          <Stat
            label="Sessions"
            value={formatCompact(teacher.sessionsCount)}
            divided
          />
          <Stat
            label="Session"
            value={`${teacher.sessionLengthMins} min`}
            divided
          />
        </div>
      </div>

      <div className="mt-6 px-5">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="px-5 pt-5">
        {tab === "About" && <AboutTab teacher={teacher} />}
        {tab === "Reviews" && <ReviewsTab teacher={teacher} />}
        {tab === "Availability" && <AvailabilityTab teacher={teacher} />}
      </div>

      {shareToast && (
        <div className="fixed inset-x-0 bottom-28 z-50 mx-auto flex max-w-110 justify-center px-5">
          <span className="rounded-full bg-ink/90 px-4 py-2 text-[13px] font-semibold text-white shadow-xl backdrop-blur-sm">
            Profile link copied
          </span>
        </div>
      )}

      <BookingBar teacher={teacher} />
    </div>
  );
}

function CoverButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="tap grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  icon,
  divided,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  divided?: boolean;
}) {
  return (
    <div className={cn("px-2 py-3.5", divided && "border-l border-border")}>
      <div className="flex items-center justify-center gap-1 font-bold text-fg">
        {icon}
        {value}
      </div>
      <p className="mt-0.5 text-[12px] text-fg-faint">{label}</p>
    </div>
  );
}

function AboutTab({ teacher }: { teacher: Teacher }) {
  return (
    <div className="space-y-6">
      <p className="text-[14px] leading-relaxed text-fg-muted">{teacher.bio}</p>

      <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
          <Users className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-fg">Cohort live sessions</p>
          <p className="text-[13px] text-fg-muted">
            Hosts cohorts of up to {teacher.cohortCapacity} members
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-base font-bold text-fg">
          Education
        </h3>
        <div className="space-y-2.5">
          {teacher.education.map((e) => (
            <div
              key={e.degree}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3.5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-soft">
                <GraduationCap className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-fg">{e.degree}</p>
                <p className="text-[13px] text-fg-muted">{e.school}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-base font-bold text-fg">
          Areas of Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {teacher.expertise.map((x) => (
            <span
              key={x}
              className="rounded-full border border-border-soft bg-surface-2 px-3.5 py-1.5 text-[13px] font-medium text-fg-muted"
            >
              {x}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ teacher }: { teacher: Teacher }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-4">
        <div className="text-center">
          <p className="font-display text-4xl font-extrabold text-fg">
            {teacher.rating.toFixed(1)}
          </p>
          <Stars value={teacher.rating} className="mt-1 justify-center" />
        </div>
        <div className="flex-1 border-l border-border pl-4">
          <p className="font-semibold text-fg">Excellent</p>
          <p className="text-[13px] text-fg-muted">
            Based on {teacher.reviewCount} verified reviews
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {teacher.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={review.author} size="sm" />
          <p className="font-semibold text-fg">{review.author}</p>
        </div>
        <span className="text-[12px] text-fg-faint">{review.date}</span>
      </div>
      <Stars value={review.rating} className="mt-3" />
      <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
        {review.text}
      </p>
    </div>
  );
}

function AvailabilityTab({ teacher }: { teacher: Teacher }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-fg-muted">
        Preview of this week. Tap{" "}
        <span className="font-semibold text-fg">Book Session</span> to pick a
        time that works for you.
      </p>
      <div className="space-y-2.5">
        {teacher.availability.map((day) => (
          <div
            key={day.label}
            className="rounded-2xl border border-border bg-surface p-3.5"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-fg">
                {day.label} <span className="text-fg-faint">{day.day}</span>
              </p>
              {!day.available && (
                <span className="text-[12px] text-fg-faint">Unavailable</span>
              )}
            </div>
            {day.available && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {day.slots
                  .filter((s) => s.available)
                  .slice(0, 6)
                  .map((slot) => (
                    <span
                      key={slot.time}
                      className="rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary-soft"
                    >
                      {slot.time}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingBar({ teacher }: { teacher: Teacher }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-110 items-center justify-between gap-4 border-t border-border bg-canvas/90 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div>
          <p className="text-lg font-bold text-fg">
            {formatNaira(teacher.hourlyRate)}
            <span className="text-[13px] font-normal text-fg-faint">/hr</span>
          </p>
          <p className="text-[12px] text-fg-faint">
            {teacher.sessionLengthMins} min session
          </p>
        </div>
        {teacher.isLive ? (
          <Link href="/live/live-advanced-calculus?as=student">
            <Button size="lg" variant="success">
              Join Live Session
            </Button>
          </Link>
        ) : (
          <Link href={`/book/${teacher.id}`}>
            <Button size="lg">Book Session</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "size-3.5",
            s <= Math.round(value)
              ? "fill-gold text-gold"
              : "fill-transparent text-fg-faint",
          )}
        />
      ))}
    </div>
  );
}
