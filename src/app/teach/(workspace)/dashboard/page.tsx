"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Sparkles, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  cohortToSession,
  PastSessionCard,
  ScheduledSessionCard,
} from "@/components/session/teacher-session-card";
import { currentTeacher, teacherPast, teacherScheduled } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { useApp } from "@/lib/store/app-provider";
import { formatNaira, formatTP } from "@/lib/utils";

export default function TeacherDashboardPage() {
  const {
    hydrated,
    teacherWallet,
    unreadCount,
    notifyGoLive,
    startInstantSession,
    profileName,
    profileAvatarUrl,
    userId,
    cohorts,
    teacherBookings,
  } = useApp();

  const displayName =
    profileName ?? (isSupabaseEnabled ? "Professional" : currentTeacher.name);
  const firstName = displayName.split(" ")[0];

  const ownerId = userId ?? currentTeacher.id;
  const scheduled = [
    // 1:1 sessions learners booked with this professional.
    ...teacherBookings.filter((b) => b.status === "upcoming"),
    ...cohorts
      .filter((c) => c.professionalId === ownerId && c.status === "scheduled")
      .map(cohortToSession),
  ];
  const scheduledList = isSupabaseEnabled
    ? scheduled
    : scheduled.length
      ? scheduled
      : teacherScheduled;
  const past = isSupabaseEnabled
    ? [
        ...teacherBookings.filter((b) => b.status === "completed"),
        // Ended cohorts (incl. instant sessions) surface here with a replay.
        ...cohorts
          .filter((c) => c.professionalId === ownerId && c.status === "ended")
          .map(cohortToSession),
      ]
    : teacherPast;

  // "Go live now" creates a real session row first so the voice recording
  // and replay reference a DB id, then joins it as the professional.
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const goLive = async () => {
    if (starting) return;
    setStarting(true);
    const id = await startInstantSession();
    notifyGoLive("Instant live session", id);
    router.push(`/live/${id}?as=teacher`);
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/teach/profile" className="tap flex items-center gap-3">
            <Avatar name={displayName} src={profileAvatarUrl} size="md" ring />
            {hydrated ? (
              <div>
                <p className="text-[13px] text-fg-muted">Good afternoon</p>
                <p className="font-display text-lg font-bold leading-tight text-fg">
                  {firstName} 👋
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[13px] font-bold text-gold">
              <Sparkles className="size-4" />
              {formatTP(teacherWallet.tpBalance)}
            </span>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="tap relative grid size-10 place-items-center rounded-xl border border-border bg-surface text-fg"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger ring-2 ring-surface" />
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 pt-3">
        <div className="relative overflow-hidden rounded-card bg-linear-to-br from-primary via-primary-600 to-primary-700 p-5 text-white shadow-xl shadow-primary/25">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-white/85">
            <span className="relative grid size-2.5 place-items-center">
              <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-white/70" />
              <span className="relative size-1.5 rounded-full bg-white" />
            </span>
            Instant session
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold">Go Live Now</h2>
          <p className="mt-1 max-w-64 text-[14px] text-white/85">
            Start an instant class and earn 2× Professional Points.
          </p>
          <button
            type="button"
            onClick={() => void goLive()}
            disabled={starting}
            className="tap mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-semibold text-primary-700 transition-transform active:scale-[0.98] disabled:opacity-80"
          >
            <Video className="size-5" />
            {starting ? "Starting…" : "Go Live"}
          </button>
        </div>

        {!hydrated ? (
          <SkeletonCard lines={2} />
        ) : (
          <Link
            href="/teach/earnings"
            className="tap block rounded-card border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-fg-muted">Available balance</p>
              <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-primary-soft">
                Earnings
                <ChevronRight className="size-4" />
              </span>
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-fg">
              {formatNaira(teacherWallet.balance)}
            </p>
            <p className="mt-1.5 text-[12px] text-fg-muted">
              Pending payout{" "}
              <span className="font-semibold text-gold">
                {formatNaira(teacherWallet.pendingPayouts)}
              </span>{" "}
              · clears in {teacherWallet.pendingClearsIn}
            </p>
          </Link>
        )}

        <section>
          <SectionHeader
            title="Scheduled Sessions"
            actionLabel="View all"
            actionHref="/teach/schedule"
          />
          {!hydrated ? (
            <div className="space-y-3">
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </div>
          ) : scheduledList.length > 0 ? (
            <div className="space-y-3">
              {scheduledList.map((session) => (
                <ScheduledSessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border-soft px-4 py-8 text-center">
              <p className="text-[13px] text-fg-muted">
                Nothing scheduled yet.
              </p>
              <Link
                href="/teach/schedule"
                className="mt-1 inline-block text-[13px] font-semibold text-primary-soft"
              >
                Schedule a session
              </Link>
            </div>
          )}
        </section>

        {hydrated && past.length > 0 && (
          <section>
            <SectionHeader title="Past Sessions" />
            <div className="space-y-2.5">
              {past.map((session) => (
                <PastSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
