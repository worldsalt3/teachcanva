"use client";

import Link from "next/link";
import { Bell, ChevronRight, Sparkles, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/section-header";
import {
  PastSessionCard,
  ScheduledSessionCard,
} from "@/components/session/teacher-session-card";
import { currentTeacher, teacherPast, teacherScheduled } from "@/lib/mock";
import { useApp } from "@/lib/store/app-provider";
import { formatNaira, formatTP } from "@/lib/utils";

const TEACH_LIVE_HREF = "/live/live-advanced-calculus?as=teacher";

export default function TeacherDashboardPage() {
  const { teacherWallet, unreadCount } = useApp();

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/teach/profile" className="tap flex items-center gap-3">
            <Avatar name={currentTeacher.name} size="md" ring />
            <div>
              <p className="text-[13px] text-fg-muted">Good afternoon</p>
              <p className="font-display text-lg font-bold leading-tight text-fg">
                {currentTeacher.firstName} 👋
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[13px] font-bold text-gold">
              <Sparkles className="size-4" />
              {formatTP(currentTeacher.tpBalance)}
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
            Start an instant class and earn 2× Teaching Points.
          </p>
          <Link
            href={TEACH_LIVE_HREF}
            className="tap mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-semibold text-primary-700 transition-transform active:scale-[0.98]"
          >
            <Video className="size-5" />
            Go Live
          </Link>
        </div>

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

        <section>
          <SectionHeader
            title="Scheduled Sessions"
            actionLabel="View all"
            actionHref="/teach/schedule"
          />
          <div className="space-y-3">
            {teacherScheduled.map((session) => (
              <ScheduledSessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Past Sessions" />
          <div className="space-y-2.5">
            {teacherPast.map((session) => (
              <PastSessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
