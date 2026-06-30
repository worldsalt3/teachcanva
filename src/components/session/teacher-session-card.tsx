"use client";

import Link from "next/link";
import { Clock, Presentation } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarValue } from "@/components/ui/rating";
import { useApp } from "@/lib/store/app-provider";
import type { Session } from "@/lib/mock";

const TEACH_LIVE_HREF = "/live/live-advanced-calculus?as=teacher";

/** Upcoming session card for the teacher dashboard and schedule. */
export function ScheduledSessionCard({ session }: { session: Session }) {
  const { slides } = useApp();
  const start = session.timeLabel.split("-")[0].trim();
  const slideCount = slides[session.id]?.length ?? 0;
  return (
    <div className="rounded-card border border-border bg-surface p-3.5">
      <div className="flex items-center gap-3.5">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-elevated text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-fg-faint">
            {session.dateLabel}
          </span>
          <span className="text-sm font-bold leading-tight text-fg">
            {start}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg">{session.topic}</p>
          <p className="truncate text-[13px] text-fg-muted">
            {session.counterpartName}
          </p>
          {session.countdown && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary-soft">
              <Clock className="size-3" />
              {session.countdown}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-2.5">
        <Link href={`/teach/prepare/${session.id}`} className="block">
          <Button variant="outline" size="sm" fullWidth>
            <Presentation className="size-4" />
            Prepare class
            {slideCount > 0 && (
              <span className="rounded-full bg-primary/20 px-1.5 text-[11px] font-bold text-primary-soft">
                {slideCount}
              </span>
            )}
          </Button>
        </Link>
        <div className="flex gap-2.5">
          <Link href="/teach/schedule" className="flex-1">
            <Button variant="neutral" size="sm" fullWidth>
              Reschedule
            </Button>
          </Link>
          <Link
            href={`${TEACH_LIVE_HREF}&prep=${session.id}`}
            className="flex-1"
          >
            <Button size="sm" fullWidth>
              Start session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Completed session card for the teacher dashboard. */
export function PastSessionCard({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <Avatar name={session.counterpartName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">{session.topic}</p>
        <p className="truncate text-[13px] text-fg-muted">
          {session.counterpartName} · {session.dateLabel}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {session.rating !== undefined && (
          <StarValue value={session.rating} className="text-[12px]" />
        )}
        {session.replay && (
          <Link
            href={`/session/${session.id}/complete`}
            className="tap text-[12px] font-semibold text-primary-soft"
          >
            Replay
          </Link>
        )}
      </div>
    </div>
  );
}
