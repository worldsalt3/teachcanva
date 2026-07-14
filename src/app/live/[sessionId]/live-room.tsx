"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/sheet";
import { MediaThumb } from "@/components/ui/media";
import { LiveCanvasBoard } from "@/components/live/live-canvas-board";
import { useApp } from "@/lib/store/app-provider";
import { useVideoRoom } from "@/lib/services/use-video-room";
import { isSupabaseEnabled } from "@/lib/services/config";
import { fetchChat, subscribeChat } from "@/lib/services/repository";
import { cn } from "@/lib/utils";
import { liveSession as previewSession } from "@/lib/mock";
import type { LiveSessionInfo } from "@/lib/services/types";

function useTimer(start: string) {
  const toSeconds = (t: string) => {
    const [h, m, s] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  const [sec, setSec] = useState(() => toSeconds(start));
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(sec / 3600))}:${pad(
    Math.floor((sec % 3600) / 60),
  )}:${pad(sec % 60)}`;
}

export function LiveRoom({ sessionId }: { sessionId: string }) {
  const params = useSearchParams();
  const role = params.get("as") === "teacher" ? "teacher" : "student";
  const {
    chat,
    cohorts,
    studentBookings,
    profileName,
    sendChatMessage,
    receiveChatMessage,
    replaceChatThread,
    slides,
  } = useApp();

  // Build the session context from real store data: cohort → booking →
  // preview seed (stub mode only) → generic fallback.
  const session = useMemo<LiveSessionInfo>(() => {
    const viewerName = profileName ?? "Member";
    const cohort = cohorts.find((c) => c.id === sessionId);
    if (cohort) {
      return {
        id: sessionId,
        topic: cohort.title,
        subject: cohort.topic,
        teacherId: cohort.professionalId,
        teacherName: cohort.professionalName,
        teacherTitle: cohort.topic,
        studentName: viewerName,
        viewers: Math.max(1, cohort.seatsTaken),
        elapsed: "00:00:00",
        tpMultiplier: 2,
        tpEarnedToast: 50,
        slideTitle: `Topic: ${cohort.title}`,
        slideBody: cohort.topic,
      };
    }
    const booking = studentBookings.find((b) => b.id === sessionId);
    if (booking) {
      return {
        id: sessionId,
        topic: booking.topic,
        subject: booking.subject,
        teacherId: "",
        teacherName: booking.counterpartName,
        teacherTitle: booking.subject,
        studentName: viewerName,
        viewers: 1,
        elapsed: "00:00:00",
        tpMultiplier: 2,
        tpEarnedToast: 50,
        slideTitle: `Topic: ${booking.topic}`,
        slideBody: booking.subject,
      };
    }
    if (!isSupabaseEnabled) {
      return { ...previewSession, id: sessionId };
    }
    return {
      id: sessionId,
      topic: "Live session",
      subject: "Live session",
      teacherId: "",
      teacherName: role === "teacher" ? viewerName : "Professional",
      teacherTitle: "Live professional",
      studentName: viewerName,
      viewers: 1,
      elapsed: "00:00:00",
      tpMultiplier: 2,
      tpEarnedToast: 50,
      slideTitle: "Live canvas",
      slideBody: "The professional will share content here.",
    };
  }, [cohorts, studentBookings, profileName, sessionId, role]);

  const endHref = `/session/${session.id}/complete`;
  const timer = useTimer(session.elapsed);

  const identity =
    profileName ??
    (role === "teacher" ? session.teacherName : session.studentName);
  const counterpartName =
    role === "teacher" ? session.studentName : session.teacherName;
  const room = useVideoRoom({ roomId: session.id, identity, counterpartName });
  const { attachRemoteVideo } = room;
  const connected = room.state === "connected";
  const messages = chat[session.id] ?? [];

  // Realtime chat sync: load backend history once, then stream new messages.
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let cancelled = false;
    void fetchChat(session.id).then((history) => {
      if (!cancelled) replaceChatThread(session.id, history);
    });
    const unsubscribe = subscribeChat(session.id, (message) => {
      receiveChatMessage(session.id, message);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [session.id, receiveChatMessage, replaceChatThread]);

  // Slides the teacher prepared for this class (passed via ?prep=<sessionId>).
  const prepId = params.get("prep");
  const prepared = useMemo(
    () => (prepId ? (slides[prepId] ?? []) : []),
    [prepId, slides],
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const current = useMemo(
    () =>
      prepared.length
        ? prepared[Math.min(slideIndex, prepared.length - 1)]
        : undefined,
    [prepared, slideIndex],
  );
  // Text slide for the board (falls back to the session's default slide).
  const teacherSlide = useMemo(() => {
    if (!current) return { title: session.slideTitle, body: session.slideBody };
    if (current.kind === "image" || current.kind === "video") return undefined;
    return { title: current.title, body: current.body };
  }, [current, session.slideTitle, session.slideBody]);
  // Uploaded photo/video for the current slide, if any.
  const teacherMedia = useMemo(
    () =>
      current &&
      (current.kind === "image" || current.kind === "video") &&
      current.src
        ? { type: current.kind, src: current.src }
        : undefined,
    [current],
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [raised, setRaised] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tpEarned, setTpEarned] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fireToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (role !== "student") return;
    const show = setTimeout(() => setTpEarned(true), 1200);
    const hide = setTimeout(() => setTpEarned(false), 4600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [role]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    sendChatMessage(session.id, text);
    setDraft("");
  };

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, chatOpen]);

  const toggleHand = () => {
    setRaised((v) => {
      const next = !v;
      fireToast(next ? "Hand raised ✋" : "Hand lowered");
      return next;
    });
  };

  return (
    <div className="relative flex h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between gap-2 px-4 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <Link
          href={endHref}
          className={cn(
            "tap inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-transform active:scale-95",
            role === "teacher"
              ? "bg-danger text-white"
              : "bg-surface-2 text-fg",
          )}
        >
          {role === "teacher" ? (
            <>
              <X className="size-4" />
              End
            </>
          ) : (
            <>
              <ChevronLeft className="size-4" />
              Leave
            </>
          )}
        </Link>

        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold text-fg">
            {session.topic}
          </p>
          <div className="flex items-center justify-center gap-2 text-[12px]">
            {connected ? (
              <span className="inline-flex items-center gap-1 font-semibold text-danger">
                <span className="size-1.5 rounded-full bg-danger" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-gold">
                <span className="size-1.5 animate-pulse rounded-full bg-gold" />
                Connecting
              </span>
            )}
            <span className="tabular-nums text-fg-faint">{timer}</span>
          </div>
        </div>

        {role === "teacher" ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-full bg-gold/15 px-3 text-[13px] font-bold text-gold">
            <Sparkles className="size-4" />
            {session.tpMultiplier}× TP
          </span>
        ) : (
          <span className="inline-flex h-9 items-center gap-1 rounded-full bg-surface-2 px-3 text-[13px] font-semibold text-fg-muted">
            <Eye className="size-4" />
            {session.viewers}
          </span>
        )}
      </header>

      {role === "student" && (
        <div className="relative px-4 pb-2">
          <MediaThumb
            seed={session.teacherId}
            className="h-40 rounded-2xl"
            icon={false}
          >
            {room.live && (
              <video
                ref={attachRemoteVideo}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute inset-0 h-full w-full bg-black object-cover",
                  (!room.remoteConnected || !room.remote.cameraOn) &&
                    "opacity-0",
                )}
              />
            )}
            {!connected && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-canvas/55 backdrop-blur-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-semibold text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-gold" />
                  Connecting…
                </span>
              </div>
            )}
            <Badge
              variant="live"
              dot
              uppercase
              className="absolute left-3 top-3"
            >
              Live
            </Badge>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Eye className="size-3.5" />
              {session.viewers}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-3">
              <Avatar name={session.teacherName} size="sm" ring />
              <div>
                <p className="text-sm font-semibold text-white">
                  {session.teacherName}
                </p>
                <p className="text-[12px] text-white/70">
                  {session.teacherTitle}
                </p>
              </div>
            </div>
          </MediaThumb>

          <div
            className={cn(
              "pointer-events-none absolute right-6 top-3 flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[13px] font-bold text-ink shadow-lg transition-all duration-300",
              tpEarned
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
          >
            <Sparkles className="size-4" />+{session.tpEarnedToast} LP
          </div>
        </div>
      )}

      <LiveCanvasBoard
        slide={role === "teacher" ? teacherSlide : undefined}
        media={role === "teacher" ? teacherMedia : undefined}
        defaultMode="slide"
        className="flex-1"
        syncId={session.id}
        overlay={
          role === "teacher" ? (
            <>
              {prepared.length > 0 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-full border border-black/10 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    disabled={slideIndex === 0}
                    onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                    className="tap grid size-8 place-items-center rounded-full text-ink disabled:opacity-30"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <span className="min-w-10 text-center text-[12px] font-bold tabular-nums text-ink">
                    {slideIndex + 1}/{prepared.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next slide"
                    disabled={slideIndex === prepared.length - 1}
                    onClick={() =>
                      setSlideIndex((i) => Math.min(prepared.length - 1, i + 1))
                    }
                    className="tap grid size-8 place-items-center rounded-full text-ink disabled:opacity-30"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              )}
              <div className="absolute bottom-3 right-3 w-28">
                <MediaThumb
                  seed={session.studentName}
                  className="h-20 rounded-xl ring-2 ring-white/25"
                  icon={false}
                >
                  {room.live && (
                    <video
                      ref={attachRemoteVideo}
                      autoPlay
                      playsInline
                      muted
                      className={cn(
                        "absolute inset-0 h-full w-full bg-black object-cover",
                        (!room.remoteConnected || !room.remote.cameraOn) &&
                          "opacity-0",
                      )}
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/40 px-2 py-1 text-[11px] font-medium text-white">
                    {session.studentName}
                  </span>
                </MediaThumb>
              </div>
            </>
          ) : null
        }
      />

      <div className="flex items-center justify-center gap-3 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-2.5">
        <DockButton
          label={room.local.micOn ? "Mute microphone" : "Unmute microphone"}
          color={room.local.micOn ? "neutral" : "danger"}
          onClick={() => {
            const wasOn = room.local.micOn;
            room.toggleMic();
            fireToast(wasOn ? "Microphone muted" : "Microphone on");
          }}
        >
          {room.local.micOn ? (
            <Mic className="size-5" />
          ) : (
            <MicOff className="size-5" />
          )}
        </DockButton>
        <DockButton
          label={room.local.cameraOn ? "Turn camera off" : "Turn camera on"}
          color={room.local.cameraOn ? "neutral" : "danger"}
          onClick={() => {
            const wasOn = room.local.cameraOn;
            room.toggleCamera();
            fireToast(wasOn ? "Camera off" : "Camera on");
          }}
        >
          {room.local.cameraOn ? (
            <Video className="size-5" />
          ) : (
            <VideoOff className="size-5" />
          )}
        </DockButton>
        {role === "student" && (
          <DockButton
            label={raised ? "Lower hand" : "Raise hand"}
            color={raised ? "gold" : "neutral"}
            onClick={toggleHand}
          >
            <Hand className="size-5" />
          </DockButton>
        )}
        <DockButton
          label="Open chat"
          badge={messages.length > 0 ? messages.length : undefined}
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="size-5" />
        </DockButton>
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <span className="rounded-full bg-ink/90 px-4 py-2 text-[13px] font-semibold text-white shadow-xl backdrop-blur-sm">
            {toast}
          </span>
        </div>
      )}

      <BottomSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Session chat"
      >
        <div className="flex max-h-[55vh] flex-col">
          <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto pb-3">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-fg-muted">
                No messages yet — say hello 👋
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col",
                    m.self ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug",
                      m.self ? "bg-primary text-white" : "bg-surface-2 text-fg",
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-fg-faint">
                    {m.self ? "You" : m.author} · {m.time}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message…"
              />
            </div>
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim()}
              aria-label="Send message"
              className="tap grid size-13 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-40"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function DockButton({
  children,
  label,
  color = "neutral",
  badge,
  onClick,
}: {
  children: ReactNode;
  label: string;
  color?: "neutral" | "danger" | "gold";
  badge?: number;
  onClick: () => void;
}) {
  const palette = {
    neutral: "bg-surface-2 text-fg",
    danger: "bg-danger text-white",
    gold: "bg-gold text-ink",
  }[color];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "tap relative grid size-12 place-items-center rounded-full transition-transform active:scale-95",
        palette,
      )}
    >
      {children}
      {badge !== undefined && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white ring-2 ring-canvas">
          {badge}
        </span>
      )}
    </button>
  );
}
