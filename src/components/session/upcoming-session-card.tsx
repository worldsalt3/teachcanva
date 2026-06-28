import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/mock";

const LIVE_HREF = "/live/live-advanced-calculus?as=student";

/** Upcoming session row for the student Home screen. */
export function UpcomingSessionCard({
  session,
  accent,
}: {
  session: Session;
  accent?: boolean;
}) {
  const [month, day] = session.dateLabel.split(" ");
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <div
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-xl text-center",
          accent ? "bg-primary text-white" : "bg-elevated text-fg",
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {month}
        </span>
        <span className="-mt-0.5 text-lg font-bold leading-none">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">{session.topic}</p>
        <p className="truncate text-[13px] text-fg-muted">
          {session.timeLabel} • {session.counterpartName}
        </p>
      </div>
      {accent ? (
        <Link href={LIVE_HREF}>
          <Button size="sm">Join</Button>
        </Link>
      ) : (
        <Button size="sm" variant="neutral">
          Remind
        </Button>
      )}
    </div>
  );
}
