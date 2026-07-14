"use client";

import { useState } from "react";
import { Check, Copy, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionRow } from "@/components/wallet/transaction-row";
import { useApp } from "@/lib/store/app-provider";
import { processPayment } from "@/lib/services";
import { cn, formatNaira, formatTP } from "@/lib/utils";

const TOP_UP_AMOUNTS = [5000, 10000, 20000];

export default function WalletPage() {
  const { studentWallet: wallet, topUpWallet } = useApp();
  const [copied, setCopied] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [amount, setAmount] = useState(10000);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleTopUp = async () => {
    setProcessing(true);
    try {
      const res = await processPayment({
        amount,
        email: "student@teachcanvas.app",
        label: "Wallet top-up",
        creditRole: "student",
      });
      if (res.status === "success") {
        topUpWallet("student", amount, res.reference);
        setTopUpOpen(false);
        setToast(`${formatNaira(amount)} added to your wallet`);
        setTimeout(() => setToast(null), 2600);
      }
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(wallet.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Wallet
        </h1>
      </header>

      <div className="space-y-5 px-5 pt-2">
        <div className="relative overflow-hidden rounded-card bg-linear-to-br from-primary via-primary-600 to-primary-700 p-5 text-white shadow-xl shadow-primary/25">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[13px] font-medium text-white/80">
            Wallet Balance
          </p>
          <p className="mt-1.5 font-display text-[34px] font-extrabold leading-none">
            {formatNaira(wallet.balance)}
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={() => setTopUpOpen(true)}
              className="tap h-11 flex-1 rounded-xl bg-white text-sm font-semibold text-primary-700 transition-transform active:scale-[0.98]"
            >
              Top Up
            </button>
            <button
              type="button"
              onClick={() => notify("Statement is on its way to your email")}
              className="tap h-11 flex-1 rounded-xl bg-white/15 text-sm font-semibold text-white backdrop-blur-sm transition-transform active:scale-[0.98]"
            >
              Statement
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card border border-gold/25 bg-gold/10 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] text-fg-muted">Teaching Points</p>
            <p className="font-display text-xl font-bold text-fg">
              {formatTP(wallet.tpBalance)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              notify(
                wallet.tpBalance >= 500
                  ? "Redeem unlocked — choose a reward"
                  : `Earn ${500 - wallet.tpBalance} more TP to redeem`,
              )
            }
            className="tap text-[13px] font-semibold text-gold"
          >
            Redeem
          </button>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">
              <Gift className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-fg">Invite &amp; Earn</p>
              <p className="text-[13px] text-fg-muted">
                Get {formatNaira(wallet.referralReward)} when a friend joins
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-dashed border-border-soft bg-surface-2 px-3 py-2.5">
            <span className="flex-1 font-mono text-sm font-semibold tracking-wide text-fg">
              {wallet.referralCode}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="tap inline-flex items-center gap-1.5 rounded-lg bg-teal/15 px-3 py-1.5 text-[13px] font-semibold text-teal transition-transform active:scale-95"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <SectionHeader title="Recent Activity" />
          <div className="divide-y divide-border rounded-card border border-border bg-surface px-4">
            {wallet.transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      </div>

      <BottomSheet
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Top up wallet"
      >
        <p className="mb-3 text-[13px] text-fg-muted">Choose an amount</p>
        <div className="grid grid-cols-3 gap-2.5">
          {TOP_UP_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={cn(
                "tap h-12 rounded-xl border text-sm font-semibold transition-colors",
                amount === a
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                  : "border-border bg-surface text-fg hover:border-border-soft",
              )}
            >
              {formatNaira(a)}
            </button>
          ))}
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-6"
          onClick={handleTopUp}
          disabled={processing}
        >
          {processing ? "Processing…" : `Add ${formatNaira(amount)}`}
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
