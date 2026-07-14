"use client";

import { useState } from "react";
import { CalendarPlus, CalendarX, Check, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { Field, Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress";
import { ScheduledSessionCard } from "@/components/session/teacher-session-card";
import { teacherScheduled, currentTeacher } from "@/lib/mock";
import { useApp } from "@/lib/store/app-provider";
import { cn, formatNaira } from "@/lib/utils";

const DAYS = [
  { key: "today", label: "Today", sub: "Oct 12" },
  { key: "tue", label: "Tue", sub: "Oct 13" },
  { key: "wed", label: "Wed", sub: "Oct 14" },
  { key: "thu", label: "Thu", sub: "Oct 15" },
  { key: "fri", label: "Fri", sub: "Oct 16" },
  { key: "sat", label: "Sat", sub: "Oct 17" },
];

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COHORT_TOPICS = ["Coding", "Data", "Fintech", "STEM", "Design", "Law"];
const COHORT_TIMES = ["10:00 AM", "12:00 PM", "04:00 PM", "06:00 PM"];
const COHORT_DURATIONS = [60, 90, 120];
const COHORT_SEATS = [50, 100, 200];
const COHORT_PRICES = [2500, 5000, 7500];

export default function TeacherSchedulePage() {
  const [day, setDay] = useState("today");
  const [availOpen, setAvailOpen] = useState(false);
  const [avail, setAvail] = useState<Record<string, boolean>>({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: false,
    Sat: true,
    Sun: false,
  });
  const sessions = day === "today" ? teacherScheduled : [];

  const { cohorts, createCohortSession } = useApp();
  const myCohorts = cohorts.filter(
    (c) => c.professionalId === currentTeacher.id,
  );
  const [cohortOpen, setCohortOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(COHORT_TOPICS[0]);
  const [cohortDay, setCohortDay] = useState(DAYS[1].sub);
  const [time, setTime] = useState(COHORT_TIMES[3]);
  const [duration, setDuration] = useState(90);
  const [seatLimit, setSeatLimit] = useState(100);
  const [price, setPrice] = useState(5000);
  const [toast, setToast] = useState<string | null>(null);

  const scheduleCohort = () => {
    createCohortSession({
      title,
      topic,
      dateLabel: cohortDay.toUpperCase(),
      timeLabel: time,
      durationMins: duration,
      seatLimit,
      pricePerSeat: price,
    });
    setCohortOpen(false);
    setTitle("");
    setToast("Cohort session is open for enrolment");
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
            Schedule
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCohortOpen(true)}
              className="tap inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary-soft"
            >
              <UsersRound className="size-4" />
              New cohort
            </button>
            <button
              type="button"
              onClick={() => setAvailOpen(true)}
              className="tap inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-[13px] font-semibold text-fg-muted"
            >
              <CalendarPlus className="size-4" />
              Availability
            </button>
          </div>
        </div>
      </header>

      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-5 pt-2 pb-1">
        {DAYS.map((d) => {
          const active = d.key === day;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setDay(d.key)}
              className={cn(
                "tap grid h-17 w-16 shrink-0 place-items-center rounded-2xl border transition-colors",
                active
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                  : "border-border bg-surface text-fg",
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                {d.label}
              </span>
              <span className="text-[15px] font-bold leading-none">
                {d.sub.split(" ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-5">
        <p className="mb-3 text-[13px] text-fg-muted">
          {sessions.length === 0
            ? "No sessions scheduled"
            : `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"} scheduled`}
        </p>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <ScheduledSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-card border border-dashed border-border-soft py-12 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-2 text-fg-faint">
              <CalendarX className="size-7" />
            </span>
            <p className="mt-3 font-semibold text-fg">Nothing booked yet</p>
            <p className="mt-1 max-w-60 text-[13px] text-fg-muted">
              Open up availability so learners can book this day.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setAvailOpen(true)}
            >
              <CalendarPlus className="size-4" />
              Add availability
            </Button>
          </div>
        )}

        {myCohorts.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-[13px] font-semibold text-fg-muted">
              Your cohort sessions
            </p>
            <div className="space-y-3">
              {myCohorts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-card border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-soft">
                      {c.tag}
                    </span>
                    <span className="text-[12px] font-medium text-fg-faint">
                      {c.dateLabel} · {c.timeLabel} · {c.durationMins} mins
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-fg">{c.title}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar
                      value={(c.seatsTaken / c.seatLimit) * 100}
                      trackClassName="flex-1 bg-surface-2"
                      className="bg-teal"
                    />
                    <span className="shrink-0 text-[12px] font-semibold text-fg-muted">
                      {c.seatsTaken}/{c.seatLimit} seats ·{" "}
                      {formatNaira(c.pricePerSeat)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet
        open={availOpen}
        onClose={() => setAvailOpen(false)}
        title="Weekly availability"
      >
        <p className="mb-3 text-[13px] text-fg-muted">
          Toggle the days you&apos;re open for sessions.
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {WEEK.map((d) => (
            <div
              key={d}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium text-fg">{d}</span>
              <button
                type="button"
                role="switch"
                aria-checked={avail[d]}
                aria-label={d}
                onClick={() => setAvail((a) => ({ ...a, [d]: !a[d] }))}
                className={cn(
                  "tap relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  avail[d] ? "bg-primary" : "bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white transition-all",
                    avail[d] ? "left-5.5" : "left-0.5",
                  )}
                />
              </button>
            </div>
          ))}
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-5"
          onClick={() => setAvailOpen(false)}
        >
          Save availability
        </Button>
      </BottomSheet>

      <BottomSheet
        open={cohortOpen}
        onClose={() => setCohortOpen(false)}
        title="Schedule cohort session"
      >
        <div className="space-y-5">
          <Field label="Session title" htmlFor="cohort-title">
            <Input
              id="cohort-title"
              placeholder="e.g. Data Storytelling for Analysts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <SheetGroup label="Topic">
            {COHORT_TOPICS.map((t) => (
              <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>
                {t}
              </Chip>
            ))}
          </SheetGroup>

          <SheetGroup label="Date">
            {DAYS.slice(1).map((d) => (
              <Chip
                key={d.key}
                selected={cohortDay === d.sub}
                onClick={() => setCohortDay(d.sub)}
              >
                {d.label} · {d.sub.split(" ")[1]}
              </Chip>
            ))}
          </SheetGroup>

          <SheetGroup label="Start time">
            {COHORT_TIMES.map((t) => (
              <Chip key={t} selected={time === t} onClick={() => setTime(t)}>
                {t}
              </Chip>
            ))}
          </SheetGroup>

          <SheetGroup label="Duration">
            {COHORT_DURATIONS.map((d) => (
              <Chip
                key={d}
                selected={duration === d}
                onClick={() => setDuration(d)}
              >
                {d} mins
              </Chip>
            ))}
          </SheetGroup>

          <SheetGroup label="Seat limit">
            {COHORT_SEATS.map((s) => (
              <Chip
                key={s}
                selected={seatLimit === s}
                onClick={() => setSeatLimit(s)}
              >
                {s} seats
              </Chip>
            ))}
          </SheetGroup>

          <SheetGroup label="Price per seat">
            {COHORT_PRICES.map((p) => (
              <Chip key={p} selected={price === p} onClick={() => setPrice(p)}>
                {formatNaira(p)}
              </Chip>
            ))}
          </SheetGroup>
        </div>

        <Button
          fullWidth
          size="lg"
          className="mt-6"
          disabled={!title.trim()}
          onClick={scheduleCohort}
        >
          Open enrolment · {seatLimit} seats
        </Button>
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

function SheetGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[13px] font-semibold text-fg-muted">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
