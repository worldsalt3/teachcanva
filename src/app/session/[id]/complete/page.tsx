"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StarRating } from "@/components/ui/star-rating";
import { completedSession, sessionRewards } from "@/lib/mock";
import { formatNaira, formatTP } from "@/lib/utils";

const CONFETTI_COLORS = [
  "#2563eb",
  "#14b8a6",
  "#f5b417",
  "#ef4444",
  "#16a34a",
  "#aac2ff",
];

export default function SessionCompletePage() {
  const session = completedSession;
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <Confetti />

      <div className="relative z-10 px-5 pb-12 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-full bg-success/15 text-success-bright ring-8 ring-success/5">
            <Check className="size-11" strokeWidth={3} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-fg">
            Session Complete!
          </h1>
          <p className="mt-1 text-[14px] text-fg-muted">
            {session.subject} · {session.topic}
          </p>
          <p className="text-[12px] text-fg-faint">{session.dateLabel}</p>
        </div>

        <div className="mt-7 rounded-card border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Avatar name={session.teacherName} size="md" ring />
            <div>
              <p className="font-semibold text-fg">{session.teacherName}</p>
              <p className="text-[13px] text-fg-muted">
                {session.teacherTitle}
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-sm font-semibold text-fg">
            How was your session?
          </p>
          <StarRating
            value={rating}
            onChange={setRating}
            className="mt-3 justify-center"
          />
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share feedback for your tutor (optional)"
            rows={3}
            className="mt-4"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-card border border-gold/25 bg-gold/10">
          <div className="flex items-center justify-between gap-3 border-b border-gold/15 p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-gold/20 text-gold">
                <Sparkles className="size-5" />
              </span>
              <p className="font-semibold text-fg">Teaching Points earned</p>
            </div>
            <p className="font-display text-2xl font-extrabold text-gold">
              +{session.totalTp}
            </p>
          </div>
          <div className="space-y-2 p-4">
            {sessionRewards.map((reward) => (
              <div
                key={reward.label}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="text-fg-muted">{reward.label}</span>
                <span className="font-semibold text-fg">
                  +{formatTP(reward.tp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success/15 text-success-bright">
            <Wallet className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] text-fg-muted">Added to your wallet</p>
            <p className="font-semibold text-fg">
              {formatNaira(session.payout)}
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-2.5">
          <Link href={`/book/${session.teacherId}`}>
            <Button fullWidth size="lg">
              Book Next Session
            </Button>
          </Link>
          <Link href="/home">
            <Button fullWidth size="lg" variant="neutral">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 });
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 12) * 0.16;
        const duration = 2.4 + (i % 6) * 0.35;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const round = i % 3 === 0;
        return (
          <span
            key={i}
            className="confetti-piece absolute -top-6 size-2"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              borderRadius: round ? "9999px" : "2px",
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-12px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(680deg); opacity: 0; }
        }
        .confetti-piece {
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
