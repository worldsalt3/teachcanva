"use client";

import { useState } from "react";
import { Building2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionRow } from "@/components/wallet/transaction-row";
import { useApp } from "@/lib/store/app-provider";
import { makePaymentReference } from "@/lib/services";
import { cn, formatNaira, formatTP } from "@/lib/utils";

export default function TeacherEarningsPage() {
  const { teacherWallet: wallet, withdrawWallet } = useApp();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState(wallet.balance);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const presets = [50000, 100000, wallet.balance];

  const handleWithdraw = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    withdrawWallet("teacher", amount, makePaymentReference("PAYOUT"));
    setProcessing(false);
    setWithdrawOpen(false);
    setToast(`${formatNaira(amount)} sent to your bank`);
    setTimeout(() => setToast(null), 2600);
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Earnings
        </h1>
      </header>

      <div className="space-y-5 px-5 pt-2">
        <div className="relative overflow-hidden rounded-card bg-linear-to-br from-primary via-primary-600 to-primary-700 p-5 text-white shadow-xl shadow-primary/25">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[13px] font-medium text-white/80">
            Available balance
          </p>
          <p className="mt-1.5 font-display text-[34px] font-extrabold leading-none">
            {formatNaira(wallet.balance)}
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="tap h-11 flex-1 rounded-xl bg-white text-sm font-semibold text-primary-700 transition-transform active:scale-[0.98]"
            >
              Withdraw
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

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-[12px] text-fg-muted">Pending payout</p>
            <p className="mt-1 font-display text-lg font-bold text-gold">
              {formatNaira(wallet.pendingPayouts)}
            </p>
            <p className="mt-0.5 text-[11px] text-fg-faint">
              Clears in {wallet.pendingClearsIn}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-[12px] text-fg-muted">Lifetime earnings</p>
            <p className="mt-1 font-display text-lg font-bold text-fg">
              {formatNaira(wallet.lifetimeEarnings)}
            </p>
            <p className="mt-0.5 text-[11px] text-fg-faint">All-time payouts</p>
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
          <span className="rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-semibold text-gold">
            2× live bonus
          </span>
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
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        title="Withdraw funds"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-soft">
            <Building2 className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-fg">Access Bank</p>
            <p className="text-[13px] text-fg-muted">•••• 2312</p>
          </div>
          <button
            type="button"
            onClick={() => notify("Verify your identity to change payout bank")}
            className="tap text-[13px] font-semibold text-primary-soft"
          >
            Change
          </button>
        </div>

        <p className="mb-3 mt-5 text-[13px] text-fg-muted">Amount</p>
        <div className="grid grid-cols-3 gap-2.5">
          {presets.map((a, i) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={cn(
                "tap h-12 rounded-xl border text-[13px] font-semibold transition-colors",
                amount === a
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                  : "border-border bg-surface text-fg hover:border-border-soft",
              )}
            >
              {i === presets.length - 1 ? "All" : formatNaira(a)}
            </button>
          ))}
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-6"
          onClick={handleWithdraw}
          disabled={processing}
        >
          {processing ? "Processing…" : `Withdraw ${formatNaira(amount)}`}
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
