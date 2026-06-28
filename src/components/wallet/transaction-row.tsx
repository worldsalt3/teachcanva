import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import type { Transaction } from "@/lib/mock";

export function TransactionRow({ tx }: { tx: Transaction }) {
  const incoming = tx.direction === "in";
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          incoming
            ? "bg-success/15 text-success-bright"
            : "bg-elevated text-fg-muted",
        )}
      >
        {incoming ? (
          <ArrowDownLeft className="size-5" />
        ) : (
          <ArrowUpRight className="size-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-fg">{tx.title}</p>
        <p className="truncate text-[12px] text-fg-faint">{tx.subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "font-semibold",
            incoming ? "text-success-bright" : "text-fg",
          )}
        >
          {incoming ? "+" : "−"}
          {formatNaira(tx.amount)}
        </p>
        {tx.status !== "completed" && (
          <p className="text-[11px] font-medium capitalize text-gold">
            {tx.status}
          </p>
        )}
      </div>
    </div>
  );
}
