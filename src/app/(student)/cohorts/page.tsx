"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock,
  Hourglass,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { BottomSheet } from "@/components/ui/sheet";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { useApp } from "@/lib/store/app-provider";
import type { CohortSession } from "@/lib/mock/types";
import { cn, formatNaira } from "@/lib/utils";

const LIVE_HREF = "/live/live-advanced-calculus?as=student";

export default function CohortsPage() {
  const { cohorts, cohortEnrolments, enrolInCohort, studentWallet } = useApp();
  const [topic, setTopic] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const topics = useMemo(
    () => ["All", ...Array.from(new Set(cohorts.map((c) => c.topic)))],
    [cohorts],
  );

  const results =
    topic === "All" ? cohorts : cohorts.filter((c) => c.topic === topic);

  const open = openId ? cohorts.find((c) => c.id === openId) : undefined;
  const openStatus = openId ? cohortEnrolments[openId] : undefined;
  const openFull = open ? open.seatsTaken >= open.seatLimit : false;

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleEnrol = () => {
    if (!open) return;
    setError(null);
    const result = enrolInCohort(open.id);
    if (result === "insufficient") {
      setError("Not enough wallet balance. Top up to reserve your seat.");
      return;
    }
    setOpenId(null);
    notify(
      result === "waitlisted"
        ? "Added to the waitlist"
        : "Seat reserved — see you live!",
    );
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Cohorts
        </h1>
        <p className="mt-0.5 text-[13px] text-fg-muted">
          Live group sessions hosted by professionals.
        </p>
      </header>

      <div className="no-scrollbar mt-1 flex gap-2 overflow-x-auto px-5 pb-1 pt-2">
        {topics.map((t) => (
          <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-3 px-5">
        {results.map((cohort) => (
          <CohortCard
            key={cohort.id}
            cohort={cohort}
            enrolment={cohortEnrolments[cohort.id]}
            onOpen={() => {
              setError(null);
              setOpenId(cohort.id);
            }}
          />
        ))}
        {results.length === 0 && (
          <div className="rounded-card border border-dashed border-border-soft py-12 text-center">
            <p className="font-semibold text-fg">No cohort sessions</p>
            <p className="mt-1 text-[13px] text-fg-muted">
              Try a different topic.
            </p>
          </div>
        )}
      </div>

      <BottomSheet
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title="Cohort session"
      >
        {open && (
          <>
            <div className="flex items-start gap-3">
              <Avatar name={open.professionalName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold leading-snug text-fg">
                  {open.title}
                </p>
                <p className="mt-0.5 text-[13px] text-fg-muted">
                  {open.professionalName}
                  {open.series &&
                    ` · ${open.series.name} — Part ${open.series.part} of ${open.series.of}`}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <InfoTile
                icon={CalendarDays}
                label="Starts"
                value={
                  open.status === "live"
                    ? "Live now"
                    : `${open.dateLabel} · ${open.timeLabel}`
                }
              />
              <InfoTile
                icon={Clock}
                label="Duration"
                value={`${open.durationMins} mins`}
              />
              <InfoTile
                icon={Users}
                label="Seats"
                value={`${open.seatLimit - open.seatsTaken} of ${open.seatLimit} left`}
              />
              <InfoTile
                icon={Wallet}
                label="Per seat"
                value={formatNaira(open.pricePerSeat)}
              />
            </div>

            {!openStatus && !openFull && (
              <p className="mt-4 text-[13px] text-fg-muted">
                Wallet balance:{" "}
                <span className="font-semibold text-fg">
                  {formatNaira(studentWallet.balance)}
                </span>{" "}
                · fee is held in escrow until the session ends.
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-[13px] font-medium text-danger">
                {error}
              </p>
            )}

            <div className="mt-5">
              {openStatus === "enrolled" ? (
                open.status === "live" ? (
                  <Link href={LIVE_HREF} className="block">
                    <Button fullWidth size="lg" variant="success">
                      Join live session
                    </Button>
                  </Link>
                ) : (
                  <Button fullWidth size="lg" variant="soft" disabled>
                    <Check className="size-5" /> Enrolled — starts{" "}
                    {open.countdown ?? `${open.dateLabel} ${open.timeLabel}`}
                  </Button>
                )
              ) : openStatus === "waitlisted" ? (
                <Button fullWidth size="lg" variant="soft" disabled>
                  <Hourglass className="size-5" /> On the waitlist
                </Button>
              ) : openFull ? (
                <Button
                  fullWidth
                  size="lg"
                  variant="neutral"
                  onClick={handleEnrol}
                >
                  <Hourglass className="size-5" /> Session full — join waitlist
                </Button>
              ) : (
                <Button fullWidth size="lg" onClick={handleEnrol}>
                  Enrol · {formatNaira(open.pricePerSeat)}
                </Button>
              )}
            </div>
          </>
        )}
      </BottomSheet>

      {toast && (
        <div className="fixed inset-x-0 bottom-28 z-40 mx-auto flex max-w-110 justify-center px-5">
          <div className="flex items-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
            <Check className="size-4" /> {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function CohortCard({
  cohort,
  enrolment,
  onOpen,
}: {
  cohort: CohortSession;
  enrolment?: "enrolled" | "waitlisted";
  onOpen: () => void;
}) {
  const seatsLeft = cohort.seatLimit - cohort.seatsTaken;
  const full = seatsLeft <= 0;
  const fill = (cohort.seatsTaken / cohort.seatLimit) * 100;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="tap block w-full rounded-card border border-border bg-surface p-4 text-left transition-colors hover:border-border-soft"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-soft">
          {cohort.tag}
        </span>
        {cohort.status === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-danger/15 px-2 py-0.5 text-[11px] font-bold text-danger">
            <span className="size-1.5 animate-pulse rounded-full bg-danger" />
            LIVE
          </span>
        ) : (
          <span className="text-[12px] font-medium text-fg-faint">
            {cohort.dateLabel} · {cohort.timeLabel}
          </span>
        )}
        <span className="flex-1" />
        {enrolment === "enrolled" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success-bright">
            <Check className="size-3" /> Enrolled
          </span>
        )}
        {enrolment === "waitlisted" && (
          <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">
            Waitlist
          </span>
        )}
      </div>

      <p className="mt-2.5 font-display text-[16px] font-bold leading-snug text-fg">
        {cohort.title}
      </p>
      <p className="mt-1 text-[13px] text-fg-muted">
        {cohort.professionalName} · {cohort.durationMins} mins
        {cohort.series && ` · Part ${cohort.series.part}/${cohort.series.of}`}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar
          value={fill}
          trackClassName="flex-1 bg-surface-2"
          className={cn(full ? "bg-gold" : "bg-teal")}
        />
        <span
          className={cn(
            "shrink-0 text-[12px] font-semibold",
            full ? "text-gold" : "text-fg-muted",
          )}
        >
          {full ? "Full · waitlist open" : `${seatsLeft} seats left`}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[13px] font-bold text-fg">
          {formatNaira(cohort.pricePerSeat)}
          <span className="font-medium text-fg-faint"> / seat</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-fg-faint">
          <Users className="size-3.5" />
          {cohort.seatsTaken} enrolled
        </span>
      </div>
    </button>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-3">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-faint">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-fg">{value}</p>
    </div>
  );
}
