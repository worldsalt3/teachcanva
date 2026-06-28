"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SearchTrigger } from "@/components/ui/search-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { LiveNowCard } from "@/components/session/live-now-card";
import { UpcomingSessionCard } from "@/components/session/upcoming-session-card";
import { TeacherRow } from "@/components/teacher/teacher-card";
import { getLiveNow, getRecommendedTeachers } from "@/lib/mock";
import { useApp } from "@/lib/store/app-provider";

export default function StudentHomePage() {
  const { studentName, studentBookings, unreadCount } = useApp();
  const firstName = studentName.split(" ")[0];
  const live = getLiveNow();
  const recommended = getRecommendedTeachers();

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="tap flex items-center gap-3">
            <Avatar name={studentName} size="md" ring />
            <div>
              <p className="text-[13px] text-fg-muted">Good afternoon</p>
              <p className="font-display text-lg font-bold leading-tight text-fg">
                {firstName} 👋
              </p>
            </div>
          </Link>
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
        <div className="mt-3">
          <SearchTrigger />
        </div>
      </header>

      <div className="space-y-7 px-5 pt-5">
        <section>
          <SectionHeader
            title="Live Now"
            actionLabel="See all"
            actionHref="/explore"
          />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {live.map((item) => (
              <LiveNowCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Upcoming Sessions"
            actionLabel="Manage"
            actionHref="/profile"
          />
          {studentBookings.length > 0 ? (
            <div className="space-y-2.5">
              {studentBookings.map((session, i) => (
                <UpcomingSessionCard
                  key={session.id}
                  session={session}
                  accent={i === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border-soft px-4 py-8 text-center">
              <p className="text-[13px] text-fg-muted">
                No upcoming sessions yet.
              </p>
              <Link
                href="/explore"
                className="mt-1 inline-block text-[13px] font-semibold text-primary-soft"
              >
                Find a tutor
              </Link>
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Recommended For You"
            actionLabel="See all"
            actionHref="/explore"
          />
          <div className="space-y-2.5">
            {recommended.map((teacher) => (
              <TeacherRow key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-23 z-30 flex justify-center">
        <div className="flex w-full max-w-110 justify-end px-5">
          <Link
            href="/explore"
            aria-label="Find a tutor"
            className="tap pointer-events-auto grid size-14 place-items-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
