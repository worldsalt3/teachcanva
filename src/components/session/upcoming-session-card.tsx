"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Play, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { StarValue } from "@/components/ui/rating";
import { useApp } from "@/lib/store/app-provider";
import { cn, formatNaira } from "@/lib/utils";
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
  const { cancelBooking } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
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
        <>
          <RemindButton />
          <button
            type="button"
            aria-label="Cancel session"
            onClick={() => setConfirmOpen(true)}
            className="tap grid size-8 shrink-0 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </>
      )}

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel session?"
      >
        <p className="text-[14px] leading-relaxed text-fg-muted">
          {session.topic} with {session.counterpartName} on {session.dateLabel}{" "}
          at {session.timeLabel} will be cancelled.
          {session.amount
            ? ` ${formatNaira(session.amount)} held in escrow is refunded to your wallet instantly.`
            : ""}{" "}
          Cancellation is free up to 2 hours before the start.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="neutral"
            fullWidth
            onClick={() => setConfirmOpen(false)}
          >
            Keep session
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              setConfirmOpen(false);
              cancelBooking(session.id);
            }}
          >
            Cancel & refund
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

function RemindButton() {
  const [on, setOn] = useState(false);
  return (
    <Button
      size="sm"
      variant={on ? "success" : "neutral"}
      onClick={() => setOn(true)}
    >
      {on ? (
        <>
          <Check className="size-4" /> Set
        </>
      ) : (
        "Remind"
      )}
    </Button>
  );
}

/** Past session row with an available recording, for the student Home screen. */
export function RecentSessionCard({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <Avatar name={session.counterpartName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">{session.topic}</p>
        <p className="truncate text-[13px] text-fg-muted">
          {session.counterpartName} · {session.dateLabel}
        </p>
        {session.rating !== undefined && (
          <StarValue value={session.rating} className="mt-1 text-[12px]" />
        )}
      </div>
      <Link href={`/session/${session.id}/recording`} className="shrink-0">
        <Button size="sm" variant="neutral">
          <Play className="size-4" /> Recording
        </Button>
      </Link>
    </div>
  );
}
