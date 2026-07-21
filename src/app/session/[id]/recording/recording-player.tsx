"use client";

import { useEffect, useRef, useState } from "react";
import {
  FastForward,
  Maximize,
  Minimize,
  Pause,
  Play,
  Presentation,
  Rewind,
  RotateCw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { MediaThumb } from "@/components/ui/media";
import { useApp } from "@/lib/store/app-provider";
import { isSupabaseEnabled } from "@/lib/services/config";
import { fetchSlides } from "@/lib/services/repository";
import type { Slide } from "@/lib/services/types";
import {
  studentPast,
  studentUpcoming,
  teacherPast,
  teacherScheduled,
} from "@/lib/mock";
import type { Session } from "@/lib/mock";
import { cn } from "@/lib/utils";

const SPEEDS = [1, 1.5, 2] as const;
const MAX_ZOOM = 4;

interface LockableOrientation {
  lock?: (mode: string) => Promise<void>;
  unlock?: () => void;
}

/** `screen.orientation` with the (not universally shipped) lock API. */
function orientationApi(): LockableOrientation | null {
  if (typeof screen === "undefined" || !screen.orientation) return null;
  return screen.orientation as LockableOrientation;
}

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

interface StageView {
  scale: number;
  x: number;
  y: number;
}

/**
 * Gesture surface for the replay: pinch or double-tap to zoom into a slide,
 * drag to pan while zoomed, single tap to play/pause. Zoom buttons cover
 * mouse users. All content renders inside the transformed layer.
 */
function ZoomStage({
  playing,
  voice,
  fill,
  rotated,
  progress,
  bottomRight,
  onTogglePlay,
  children,
}: {
  playing: boolean;
  voice?: boolean;
  /** Fill the parent instead of rendering a rounded 16:9 card. */
  fill?: boolean;
  /** Stage sits inside a 90°-rotated wrapper — remap pointer coords. */
  rotated?: boolean;
  /** Playback progress (0–100) shown as a slim bar in fill mode. */
  progress?: number;
  bottomRight?: React.ReactNode;
  onTogglePlay: () => void;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<StageView>({ scale: 1, x: 0, y: 0 });
  const [smooth, setSmooth] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    startDist: 0,
    startScale: 1,
    startMid: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
    startPoint: { x: 0, y: 0 },
    moved: false,
    lastTap: 0,
  });
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = (v: StageView): StageView => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return v;
    // In rotated mode the screen-space bounding box has swapped dimensions.
    const w = rotated ? rect.height : rect.width;
    const h = rotated ? rect.width : rect.height;
    const maxX = ((v.scale - 1) * w) / 2;
    const maxY = ((v.scale - 1) * h) / 2;
    return {
      scale: v.scale,
      x: Math.min(maxX, Math.max(-maxX, v.x)),
      y: Math.min(maxY, Math.max(-maxY, v.y)),
    };
  };

  /**
   * Screen point → stage-centre-relative coords in the stage's own (possibly
   * rotated) coordinate system, so gestures stay correct in rotation mode.
   */
  const toLocal = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = clientX - (rect.left + rect.width / 2);
    const sy = clientY - (rect.top + rect.height / 2);
    return rotated ? { x: sy, y: -sx } : { x: sx, y: sy };
  };

  /** Zooms by `factor` keeping the stage-centre-relative `focal` point put. */
  const zoomBy = (factor: number, focal = { x: 0, y: 0 }) => {
    setSmooth(true);
    setView((v) => {
      const scale = Math.min(MAX_ZOOM, Math.max(1, v.scale * factor));
      const ratio = scale / v.scale;
      return clamp({
        scale,
        x: focal.x - (focal.x - v.x) * ratio,
        y: focal.y - (focal.y - v.y) * ratio,
      });
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, toLocal(e.clientX, e.clientY));
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      // Pinch begins: freeze the baseline and cancel any pending tap.
      g.startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      g.startScale = view.scale;
      g.startMid = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      g.startOffset = { x: view.x, y: view.y };
      g.moved = true;
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
    } else {
      g.startPoint = toLocal(e.clientX, e.clientY);
      g.startOffset = { x: view.x, y: view.y };
      g.moved = false;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const point = toLocal(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, point);
    const el = stageRef.current;
    if (!el) return;
    const g = gesture.current;
    const pts = [...pointers.current.values()];

    if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      const scale = Math.min(
        MAX_ZOOM,
        Math.max(1, (g.startScale * dist) / Math.max(1, g.startDist)),
      );
      const ratio = scale / g.startScale;
      setSmooth(false);
      setView(() =>
        clamp({
          scale,
          x: mid.x - (g.startMid.x - g.startOffset.x) * ratio,
          y: mid.y - (g.startMid.y - g.startOffset.y) * ratio,
        }),
      );
      return;
    }

    const dx = point.x - g.startPoint.x;
    const dy = point.y - g.startPoint.y;
    if (Math.hypot(dx, dy) > 6) g.moved = true;
    if (view.scale > 1 && g.moved) {
      setSmooth(false);
      setView((v) =>
        clamp({
          scale: v.scale,
          x: g.startOffset.x + dx,
          y: g.startOffset.y + dy,
        }),
      );
    }
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    const remaining = [...pointers.current.values()];
    if (remaining.length > 0) {
      // Pinch ended with one finger down — re-anchor it as a fresh drag.
      g.startPoint = { x: remaining[0].x, y: remaining[0].y };
      g.startOffset = { x: view.x, y: view.y };
      return;
    }
    if (g.moved) return;

    const now = Date.now();
    if (now - g.lastTap < 300) {
      // Double tap: zoom into the tapped point, or reset when zoomed.
      g.lastTap = 0;
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      setSmooth(true);
      if (view.scale > 1) {
        setView({ scale: 1, x: 0, y: 0 });
      } else {
        const focal = toLocal(e.clientX, e.clientY);
        setView(clamp({ scale: 2.5, x: focal.x * -1.5, y: focal.y * -1.5 }));
      }
      return;
    }
    g.lastTap = now;
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      onTogglePlay();
    }, 300);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-black",
        fill ? "h-full" : "aspect-video rounded-2xl",
      )}
    >
      {/* Pointer-gesture layer: pinch/drag/tap. Keyboard play/pause lives in
          the transport row below, so this stays a non-focusable surface. */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="absolute inset-0 h-full w-full cursor-pointer touch-none select-none"
      >
        <div
          className={cn(
            "absolute inset-0",
            smooth && "transition-transform duration-200",
          )}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          {children}
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
        <span className="size-1.5 rounded-full bg-danger" />
        {voice ? "Rec · Voice" : "Rec"}
      </span>

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {view.scale > 1 && (
          <button
            type="button"
            onClick={() => {
              setSmooth(true);
              setView({ scale: 1, x: 0, y: 0 });
            }}
            className="tap rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm"
          >
            {Math.round(view.scale * 10) / 10}× · Reset
          </button>
        )}
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(1 / 1.5)}
          className="tap grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy(1.5)}
          className="tap grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          <ZoomIn className="size-4" />
        </button>
      </div>

      {bottomRight && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {bottomRight}
        </div>
      )}

      {fill && typeof progress === "number" && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <span
            className="absolute inset-y-0 left-0 bg-primary"
            style={{ width: `${progress}%` }}
          />
        </span>
      )}

      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span
          className={cn(
            "grid size-16 place-items-center rounded-full bg-white/15 text-white shadow-xl backdrop-blur-md transition-opacity",
            playing && view.scale > 1 && "opacity-0",
          )}
        >
          {playing ? (
            <Pause className="size-7" />
          ) : (
            <Play className="size-7 translate-x-0.5" />
          )}
        </span>
      </span>
    </div>
  );
}

export function RecordingPlayer({ sessionId }: { sessionId: string }) {
  const { studentBookings, teacherBookings, slides } = useApp();

  // Real deployments only look at the member's own bookings; the seed
  // sessions exist purely for the stub preview.
  const session: Session | undefined = [
    ...studentBookings,
    ...teacherBookings,
    ...(isSupabaseEnabled
      ? []
      : [
          ...studentPast,
          ...studentUpcoming,
          ...teacherScheduled,
          ...teacherPast,
        ]),
  ].find((s) => s.id === sessionId);

  // The store only holds the user's OWN slides, so a learner replaying a
  // professional's session needs the deck fetched by session id (the slides
  // table is readable by any signed-in participant).
  const [remoteSlides, setRemoteSlides] = useState<Slide[] | null>(null);
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let cancelled = false;
    void fetchSlides(sessionId).then((rows) => {
      if (!cancelled && rows.length) setRemoteSlides(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const chapters = remoteSlides ?? slides[sessionId] ?? [];

  // Voice track recorded live in the session (professional's mic). When it
  // exists the audio element drives the whole timeline — position, duration
  // and speed — and the interval below stays off.
  const audioRef = useRef<HTMLAudioElement>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let cancelled = false;
    void fetch(`/api/sessions/recording?id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { url?: string } | null) => {
        if (!cancelled && data?.url) setVoiceUrl(data.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const duration = voiceDuration ?? (session?.durationMins ?? 10) * 60;

  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotated, setRotated] = useState<"native" | "css" | null>(null);
  const barRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || voiceUrl) return;
    const id = setInterval(() => {
      setPosition((p) => Math.min(duration, p + speed));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed, duration, voiceUrl]);

  // Keep the audio element in lockstep with the play/pause + speed state.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) void el.play().catch(() => {});
    else el.pause();
  }, [playing, voiceUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.playbackRate = speed;
  }, [speed, voiceUrl]);

  // Speaker toggle drives the audio element directly.
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.muted = muted;
  }, [muted, voiceUrl]);

  // Follow native fullscreen exits (system back / Esc) and release any
  // orientation lock when leaving the page.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
        setRotated(null);
        orientationApi()?.unlock?.();
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      orientationApi()?.unlock?.();
    };
  }, []);

  // Stop at the end of the recording (deferred so it stays out of the effect
  // body, satisfying the no-set-state-in-effect rule).
  useEffect(() => {
    if (!playing || position < duration) return;
    const t = setTimeout(() => setPlaying(false), 0);
    return () => clearTimeout(t);
  }, [playing, position, duration]);

  const seekTo = (sec: number) => {
    const next = Math.min(duration, Math.max(0, sec));
    setPosition(next);
    const el = audioRef.current;
    if (el && Number.isFinite(el.duration)) {
      el.currentTime = Math.min(next, el.duration);
    }
  };

  const togglePlay = () => {
    if (!playing && position >= duration) seekTo(0);
    setPlaying((p) => !p);
  };

  const skip = (delta: number) => seekTo(position + delta);

  const seek = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  };

  const cycleSpeed = () =>
    setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);

  /** Native fullscreen where supported; the fixed overlay covers iOS. */
  const enterFullscreen = async () => {
    setFullscreen(true);
    const el = shellRef.current;
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        // Element fullscreen unavailable — pseudo-fullscreen still applies.
      }
    }
  };

  const exitFullscreen = () => {
    if (rotated === "native") orientationApi()?.unlock?.();
    setRotated(null);
    setFullscreen(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  };

  /**
   * Landscape mode: prefer a real orientation lock (Android, requires
   * fullscreen), otherwise rotate the stage with CSS (iOS et al).
   */
  const toggleRotate = async () => {
    if (rotated) {
      if (rotated === "native") orientationApi()?.unlock?.();
      setRotated(null);
      return;
    }
    if (!fullscreen) await enterFullscreen();
    const o = orientationApi();
    if (o?.lock) {
      try {
        await o.lock("landscape");
        setRotated("native");
        return;
      } catch {
        // Lock refused by the browser/OS — fall back to CSS rotation.
      }
    }
    setRotated("css");
  };

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
        {voiceUrl && (
          <audio
            ref={audioRef}
            src={voiceUrl}
            preload="metadata"
            className="hidden"
            onLoadedMetadata={(e) => {
              const el = e.currentTarget;
              if (el.duration === Infinity) {
                // Chrome quirk: streamed MediaRecorder tracks report Infinity
                // until forced to scan — seek far ahead once to resolve it.
                el.currentTime = 1e7;
                el.ondurationchange = () => {
                  if (Number.isFinite(el.duration) && el.duration > 0) {
                    el.ondurationchange = null;
                    el.currentTime = 0;
                    setVoiceDuration(el.duration);
                  }
                };
              } else if (el.duration > 0) {
                setVoiceDuration(el.duration);
              }
            }}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (Number.isFinite(el.duration)) {
                setPosition(el.currentTime);
              }
            }}
            onEnded={() => setPlaying(false)}
          />
        )}

        {/* Video surface — pinch/double-tap to zoom, tap to play/pause.
            The shell doubles as the fullscreen overlay: native fullscreen
            where supported, fixed-position fallback everywhere else. */}
        <div
          ref={shellRef}
          className={cn(fullscreen && "fixed inset-0 z-50 bg-black")}
        >
          <div
            className={cn(
              fullscreen &&
                (rotated === "css"
                  ? "absolute left-1/2 top-1/2 h-dvw w-dvh -translate-x-1/2 -translate-y-1/2 rotate-90"
                  : "h-full w-full"),
            )}
          >
            <ZoomStage
              playing={playing}
              voice={Boolean(voiceUrl)}
              fill={fullscreen}
              rotated={fullscreen && rotated === "css"}
              progress={fullscreen ? progress : undefined}
              onTogglePlay={togglePlay}
              bottomRight={
                <>
                  {voiceUrl && (
                    <button
                      type="button"
                      aria-label={muted ? "Unmute voice" : "Mute voice"}
                      onClick={() => setMuted((m) => !m)}
                      className="tap grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                    >
                      {muted ? (
                        <VolumeX className="size-4" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={
                      rotated ? "Exit landscape view" : "Landscape view"
                    }
                    onClick={toggleRotate}
                    className={cn(
                      "tap grid size-8 place-items-center rounded-full text-white backdrop-blur-sm",
                      rotated ? "bg-primary/80" : "bg-black/50",
                    )}
                  >
                    <RotateCw className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                    onClick={fullscreen ? exitFullscreen : enterFullscreen}
                    className="tap grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                  >
                    {fullscreen ? (
                      <Minimize className="size-4" />
                    ) : (
                      <Maximize className="size-4" />
                    )}
                  </button>
                </>
              }
            >
              <MediaThumb
                seed={sessionId}
                icon={false}
                className="absolute inset-0"
              />

              {activeSlide?.kind === "image" && activeSlide.src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSlide.src}
                    alt={activeSlide.title || `Slide ${chapterIndex + 1}`}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  {activeSlide.title && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-3 py-2 text-[12px] font-medium text-white">
                      {activeSlide.title}
                    </span>
                  )}
                </>
              ) : activeSlide ? (
                <span className="absolute inset-0 grid place-items-center p-6 text-center">
                  <span className="block">
                    <span className="block text-[12px] font-semibold uppercase tracking-wide text-white/60">
                      {activeSlide.title || `Slide ${chapterIndex + 1}`}
                    </span>
                    <span className="mt-2 block font-display text-xl font-bold text-white">
                      {activeSlide.kind === "video"
                        ? "Video clip"
                        : activeSlide.body || "—"}
                    </span>
                  </span>
                </span>
              ) : (
                <span className="absolute inset-0 grid place-items-center p-6 text-center">
                  <span className="font-display text-lg font-bold text-white/90">
                    {session?.topic ?? "Session recording"}
                  </span>
                </span>
              )}
            </ZoomStage>
          </div>
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
                        {slide.kind === "image"
                          ? "Photo"
                          : slide.kind === "video"
                            ? "Video clip"
                            : slide.body || "—"}
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
