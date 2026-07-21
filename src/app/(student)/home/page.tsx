"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SearchTrigger } from "@/components/ui/search-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton, SkeletonCard, SkeletonRail } from "@/components/ui/skeleton";
import { LiveNowCard } from "@/components/session/live-now-card";
import {
  RecentSessionCard,
  UpcomingSessionCard,
} from "@/components/session/upcoming-session-card";
import { TeacherSpotlightCard } from "@/components/teacher/teacher-card";
import { getLiveNow, recommendedTeacherIds, studentPast } from "@/lib/mock";
import type { LiveNowItem } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { useApp } from "@/lib/store/app-provider";

export default function StudentHomePage() {
  const {
    hydrated,
    studentName,
    studentBookings,
    unreadCount,
    teachers,
    cohorts,
  } = useApp();
  const firstName = studentName.split(" ")[0];

  // Live Now comes from cohorts that are actually live; the seed rail only
  // backs the stub preview.
  const liveCohorts: LiveNowItem[] = cohorts
    .filter((c) => c.status === "live")
    .map((c) => ({
      id: c.id,
      teacherId: c.professionalId,
      teacherName: c.professionalName,
      topic: c.title,
      tag: c.tag,
      viewers: Math.max(1, c.seatsTaken),
    }));
  const live =
    liveCohorts.length || isSupabaseEnabled ? liveCohorts : getLiveNow();

  const upcoming = studentBookings.filter((s) => s.status === "upcoming");
  const recent = isSupabaseEnabled
    ? studentBookings.filter((s) => s.status === "completed")
    : studentPast;

  const featured = teachers.filter((t) => recommendedTeacherIds.includes(t.id));
  const recommended = featured.length ? featured : teachers.slice(0, 5);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="tap flex items-center gap-3">
            <Avatar name={studentName} size="md" ring />
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
          {!hydrated ? (
            <SkeletonRail />
          ) : live.length > 0 ? (
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
              {live.map((item) => (
                <LiveNowCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border-soft px-4 py-8 text-center">
              <p className="text-[13px] text-fg-muted">
                No one is live right now.
              </p>
              <Link
                href="/explore"
                className="mt-1 inline-block text-[13px] font-semibold text-primary-soft"
              >
                Browse upcoming sessions
              </Link>
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Upcoming Sessions"
            actionLabel="Manage"
            actionHref="/profile"
          />
          {!hydrated ? (
            <div className="space-y-2.5">
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-2.5">
              {upcoming.map((session, i) => (
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
                Find a professional
              </Link>
            </div>
          )}
        </section>

        {hydrated && recent.length > 0 && (
          <section>
            <SectionHeader
              title="Recent Sessions"
              actionLabel="History"
              actionHref="/profile"
            />
            <div className="space-y-2.5">
              {recent.map((session) => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        {!hydrated ? (
          <section>
            <SectionHeader
              title="Recommended For You"
              actionLabel="See all"
              actionHref="/explore"
            />
            <SkeletonRail />
          </section>
        ) : (
          recommended.length > 0 && (
            <section>
              <SectionHeader
                title="Recommended For You"
                actionLabel="See all"
                actionHref="/explore"
              />
              {/* Auto-scrolling picture rail — pauses while pressed/hovered so
                  cards stay easy to tap; the sequence is doubled for a
                  seamless loop. Falls back to a swipeable rail when there are
                  too few cards to loop nicely. */}
              {recommended.length >= 3 ? (
                <div className="group -mx-5 overflow-x-hidden">
                  <div className="marquee flex w-max group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]">
                    {[0, 1].map((copy) => (
                      <div
                        key={copy}
                        aria-hidden={copy === 1}
                        className="flex shrink-0 gap-3 pr-3"
                      >
                        {recommended.map((teacher) => (
                          <TeacherSpotlightCard
                            key={`${copy}-${teacher.id}`}
                            teacher={teacher}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                  {recommended.map((teacher) => (
                    <TeacherSpotlightCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              )}
            </section>
          )
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-23 z-30 flex justify-center">
        <div className="flex w-full max-w-110 justify-end px-5">
          <Link
            href="/explore"
            aria-label="Find a professional"
            className="tap pointer-events-auto grid size-14 place-items-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
