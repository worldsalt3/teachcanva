"use client";

import { useEffect, useRef, useState } from "react";
import { FastForward, Pause, Play, Presentation, Rewind } from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { MediaThumb } from "@/components/ui/media";
import { useApp } from "@/lib/store/app-provider";
import {
  studentPast,
  studentUpcoming,
  teacherPast,
  teacherScheduled,
} from "@/lib/mock";
import type { Session } from "@/lib/mock";
import { cn } from "@/lib/utils";

const SPEEDS = [1, 1.5, 2] as const;

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function RecordingPlayer({ sessionId }: { sessionId: string }) {
  const { studentBookings, slides } = useApp();

  const session: Session | undefined = [
    ...studentBookings,
    ...studentPast,
    ...studentUpcoming,
    ...teacherScheduled,
    ...teacherPast,
  ].find((s) => s.id === sessionId);

  const chapters = slides[sessionId] ?? [];
  const duration = (session?.durationMins ?? 10) * 60;

  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const barRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => Math.min(duration, p + speed));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed, duration]);

  // Stop at the end of the recording (deferred so it stays out of the effect
  // body, satisfying the no-set-state-in-effect rule).
  useEffect(() => {
    if (!playing || position < duration) return;
    const t = setTimeout(() => setPlaying(false), 0);
    return () => clearTimeout(t);
  }, [playing, position, duration]);

  const togglePlay = () => {
    if (!playing && position >= duration) setPosition(0);
    setPlaying((p) => !p);
  };

  const skip = (delta: number) =>
    setPosition((p) => Math.min(duration, Math.max(0, p + delta)));

  const seek = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setPosition(ratio * duration);
  };

  const cycleSpeed = () =>
    setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);

  const progress = duration ? (position / duration) * 100 : 0;
  const chapterIndex = chapters.length
    ? Math.min(
        chapters.length - 1,
        Math.floor(position / (duration / chapters.length)),
      )
    : -1;
  const activeSlide = chapterIndex >= 0 ? chapters[chapterIndex] : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader bordered>
        <div className="flex w-full items-center gap-2">
          <BackButton className="-ml-2" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold leading-tight text-fg">
              Recording
            </h1>
            {session && (
              <p className="truncate text-[12px] text-fg-muted">
                {session.counterpartName} · {session.dateLabel}
              </p>
            )}
          </div>
        </div>
      </AppHeader>

      <div className="space-y-5 px-5 py-4">
        {/* Video surface */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <MediaThumb
            seed={sessionId}
            icon={false}
            className="absolute inset-0"
          />

          {activeSlide ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-white/60">
                  {activeSlide.title || `Slide ${chapterIndex + 1}`}
                </p>
                <p className="mt-2 font-display text-xl font-bold text-white">
                  {activeSlide.body || "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <p className="font-display text-lg font-bold text-white/90">
                {session?.topic ?? "Session recording"}
              </p>
            </div>
          )}

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-danger" />
            Rec
          </span>

          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid size-16 place-items-center rounded-full bg-white/15 text-white shadow-xl backdrop-blur-md transition-transform active:scale-95">
              {playing ? (
                <Pause className="size-7" />
              ) : (
                <Play className="size-7 translate-x-0.5" />
              )}
            </span>
          </button>
        </div>

        {/* Scrubber */}
        <div>
          <button
            ref={barRef}
            type="button"
            aria-label="Seek recording"
            onClick={(e) => seek(e.clientX)}
            className="tap relative block h-2 w-full cursor-pointer rounded-full bg-surface-2"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
            <span
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: `${progress}%` }}
            />
          </button>
          <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-fg-muted">
            <span>{fmt(position)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Back 10 seconds"
            onClick={() => skip(-10)}
            className="tap grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:bg-white/5"
          >
            <Rewind className="size-5.5" />
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
            className="tap grid size-14 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            {playing ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 translate-x-0.5" />
            )}
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            onClick={() => skip(10)}
            className="tap grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:bg-white/5"
          >
            <FastForward className="size-5.5" />
          </button>
          <button
            type="button"
            aria-label="Change playback speed"
            onClick={cycleSpeed}
            className="tap grid h-11 w-12 place-items-center rounded-full border border-border-soft text-[13px] font-bold tabular-nums text-fg"
          >
            {speed}×
          </button>
        </div>

        {/* Session meta */}
        {session && (
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="font-semibold text-fg">{session.topic}</p>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              {session.subject} · {session.timeLabel} · {session.durationMins}{" "}
              min
            </p>
          </div>
        )}

        {/* Slide chapters */}
        {chapters.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <Presentation className="size-4 text-fg-muted" />
              <h2 className="text-[13px] font-semibold text-fg">
                Slides covered
              </h2>
            </div>
            <div className="space-y-2">
              {chapters.map((slide, i) => {
                const at = (duration / chapters.length) * i;
                const active = i === chapterIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setPosition(at)}
                    className={cn(
                      "tap flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-surface hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold",
                        active
                          ? "bg-primary text-white"
                          : "bg-elevated text-fg-muted",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-fg">
                        {slide.title || `Slide ${i + 1}`}
                      </span>
                      <span className="block truncate text-[12px] text-fg-muted">
                        {slide.body || "—"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-fg-faint">
                      {fmt(at)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
