"use client";

import { useState } from "react";
import { CalendarPlus, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { ScheduledSessionCard } from "@/components/session/teacher-session-card";
import { teacherScheduled } from "@/lib/mock";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "today", label: "Today", sub: "Oct 12" },
  { key: "tue", label: "Tue", sub: "Oct 13" },
  { key: "wed", label: "Wed", sub: "Oct 14" },
  { key: "thu", label: "Thu", sub: "Oct 15" },
  { key: "fri", label: "Fri", sub: "Oct 16" },
  { key: "sat", label: "Sat", sub: "Oct 17" },
];

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
            Schedule
          </h1>
          <button
            type="button"
            onClick={() => setAvailOpen(true)}
            className="tap inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-[13px] font-semibold text-fg-muted"
          >
            <CalendarPlus className="size-4" />
            Availability
          </button>
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
              Open up availability so students can book this day.
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
    </div>
  );
}
