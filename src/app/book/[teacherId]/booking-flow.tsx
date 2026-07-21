"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { StarValue } from "@/components/ui/rating";
import { BottomSheet } from "@/components/ui/sheet";
import { useApp } from "@/lib/store/app-provider";
import { processPayment } from "@/lib/services";
import { cn, formatNaira } from "@/lib/utils";
import type { Teacher } from "@/lib/mock";

type Method = "wallet" | "card";

/** "16:30" → "04:30 PM" (matches the slot-grid time labels). */
function to12h(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function BookingFlow({ teacher }: { teacher: Teacher }) {
  const { studentWallet, createBooking, userEmail } = useApp();
  const firstAvailable = teacher.availability.findIndex((d) => d.available);
  // No availability grid published yet → free-form date & time inputs.
  const manual = firstAvailable === -1;
  const [dayIndex, setDayIndex] = useState(
    firstAvailable === -1 ? 0 : firstAvailable,
  );
  const [time, setTime] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [topic, setTopic] = useState("");
  const [method, setMethod] = useState<Method>("wallet");
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const day = teacher.availability[dayIndex];
  const serviceFee = Math.round(teacher.hourlyRate * 0.05);
  const total = teacher.hourlyRate + serviceFee;
  const walletShort = studentWallet.balance < total;
  // Wallet payments require covering funds — top up or switch to card.
  const insufficient = method === "wallet" && walletShort;

  const chosenTime = manual ? (customTime ? to12h(customTime) : null) : time;
  const canConfirm =
    Boolean(chosenTime) &&
    (!manual || Boolean(customDate)) &&
    !processing &&
    !insufficient;

  const summaryDate = useMemo(() => {
    if (manual) {
      if (!customDate) return "";
      const d = new Date(`${customDate}T00:00:00`);
      return `${d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase()} ${d.getDate()}`;
    }
    return day ? `${day.label} ${day.day}` : "";
  }, [manual, customDate, day]);

  const handleConfirm = async () => {
    if (!chosenTime || (manual && !customDate) || insufficient) return;
    setProcessing(true);
    try {
      if (method === "card") {
        const res = await processPayment({
          amount: total,
          email: userEmail ?? "student@teachcanvas.app",
          label: `Session with ${teacher.name}`,
        });
        if (res.status !== "success") return;
      }
      createBooking({
        teacherId: teacher.id,
        dateLabel: summaryDate,
        time: chosenTime,
        topic,
        amount: total,
        payWith: method,
      });
      setConfirmed(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <AppHeader bordered>
        <div className="flex items-center gap-2">
          <BackButton className="-ml-2" />
          <h1 className="font-display text-lg font-bold text-fg">
            Book a Session
          </h1>
        </div>
      </AppHeader>

      <div className="space-y-6 px-5 pt-4">
        <div className="flex items-center gap-3.5 rounded-card border border-border bg-surface p-3.5">
          <Avatar
            name={teacher.name}
            src={teacher.avatarUrl}
            size="lg"
            ring={teacher.isLive}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{teacher.name}</p>
            <p className="truncate text-[13px] text-fg-muted">
              {teacher.title}
            </p>
            <StarValue
              value={teacher.rating}
              count={teacher.reviewCount}
              className="mt-1 text-[12px]"
            />
          </div>
        </div>

        {manual ? (
          <Section title="Pick a date & time">
            <div className="space-y-4">
              <Field label="Date" htmlFor="booking-date">
                <div className="relative">
                  <Input
                    id="booking-date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                  {!customDate && (
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] text-fg-faint">
                      Pick a date
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Time" htmlFor="booking-time">
                <div className="relative">
                  <Input
                    id="booking-time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                  {!customTime && (
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] text-fg-faint">
                      Pick a time
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </Section>
        ) : (
          <>
            <Section title="Select date">
              <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
                {teacher.availability.map((d, i) => {
                  const active = i === dayIndex;
                  return (
                    <button
                      key={d.label}
                      type="button"
                      disabled={!d.available}
                      onClick={() => {
                        setDayIndex(i);
                        setTime(null);
                      }}
                      className={cn(
                        "tap grid h-20 w-16 shrink-0 place-items-center rounded-2xl border transition-colors",
                        active
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                          : d.available
                            ? "border-border bg-surface text-fg"
                            : "border-border/60 bg-surface/50 text-fg-faint opacity-50",
                      )}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                        {d.label}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {d.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Select time">
              {day?.available ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {day.slots.map((slot) => {
                    const active = slot.time === time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTime(slot.time)}
                        className={cn(
                          "tap h-11 rounded-xl border text-[13px] font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                            : slot.available
                              ? "border-border bg-surface text-fg hover:border-border-soft"
                              : "border-transparent bg-surface/40 text-fg-faint line-through opacity-50",
                        )}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border-soft px-4 py-6 text-center text-[13px] text-fg-muted">
                  No slots available on this day.
                </p>
              )}
            </Section>
          </>
        )}

        <Section title="What would you like to cover?">
          <Textarea
            placeholder="e.g. Help with integration by parts and past exam questions"
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </Section>

        <Section title="Payment method">
          <div className="space-y-2.5">
            <PaymentOption
              selected={method === "wallet"}
              onClick={() => setMethod("wallet")}
              icon={<WalletIcon className="size-5" />}
              title="TeachCanvas Wallet"
              subtitle={
                walletShort
                  ? `Balance ${formatNaira(studentWallet.balance)} · top up needed`
                  : `Balance ${formatNaira(studentWallet.balance)}`
              }
            />
            <PaymentOption
              selected={method === "card"}
              onClick={() => setMethod("card")}
              icon={<CreditCard className="size-5" />}
              title="Debit Card"
              subtitle="Visa •••• 4242"
            />
          </div>
        </Section>

        <div className="rounded-card border border-border bg-surface p-4">
          <Row label="Session fee" value={formatNaira(teacher.hourlyRate)} />
          <Row label="Service fee" value={formatNaira(serviceFee)} />
          <div className="my-3 border-t border-border-soft/60" />
          <Row label="Total" value={formatNaira(total)} emphasis />
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gold/10 px-3 py-2.5">
            <Sparkles className="size-4 shrink-0 text-gold" />
            <p className="text-[13px] text-gold">
              You&apos;ll earn {teacher.tpBonusPerHour} Learning Points
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <div className="pointer-events-auto w-full max-w-110 border-t border-border bg-canvas/90 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <Button
            fullWidth
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {processing
              ? "Processing…"
              : insufficient
                ? "Insufficient balance — top up or pay by card"
                : canConfirm
                  ? `Confirm & Pay ${formatNaira(total)}`
                  : manual
                    ? "Pick a date & time to continue"
                    : "Select a time to continue"}
          </Button>
          {insufficient && (
            <p className="mt-2 text-center text-[12px] text-fg-muted">
              Wallet balance {formatNaira(studentWallet.balance)} · needs{" "}
              {formatNaira(total)}.{" "}
              <Link
                href="/wallet"
                className="font-semibold text-primary-soft underline"
              >
                Top up wallet
              </Link>
            </p>
          )}
        </div>
      </div>

      <BottomSheet open={confirmed} onClose={() => setConfirmed(false)}>
        <div className="pb-2 text-center">
          <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success/15 text-success-bright">
            <Check className="size-9" strokeWidth={3} />
          </span>
          <h3 className="font-display text-xl font-bold text-fg">
            Booking confirmed
          </h3>
          <p className="mt-1.5 text-[14px] text-fg-muted">
            Your session with {teacher.name} is booked for{" "}
            <span className="font-semibold text-fg">
              {summaryDate} · {chosenTime}
            </span>
            .
          </p>

          <div className="mt-5 space-y-2.5 text-left">
            <Link href="/home">
              <Button fullWidth size="lg">
                Done
              </Button>
            </Link>
            <Link href="/explore">
              <Button fullWidth size="lg" variant="neutral">
                Browse more professionals
              </Button>
            </Link>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-base font-bold text-fg">{title}</h2>
      {children}
    </section>
  );
}

function PaymentOption({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-surface hover:border-border-soft",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          selected ? "bg-primary text-white" : "bg-elevated text-fg-muted",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-fg">{title}</p>
        <p className="truncate text-[13px] text-fg-muted">{subtitle}</p>
      </div>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary" : "border-border-soft",
        )}
      >
        {selected && <Check className="size-3 text-white" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span
        className={cn(
          emphasis ? "font-semibold text-fg" : "text-[14px] text-fg-muted",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          emphasis
            ? "text-lg font-bold text-fg"
            : "text-[14px] font-medium text-fg",
        )}
      >
        {value}
      </span>
    </div>
  );
}
