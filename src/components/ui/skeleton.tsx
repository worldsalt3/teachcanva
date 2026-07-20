import { cn } from "@/lib/utils";

/**
 * Pulsing placeholder block. Compose into page-shaped loading states so
 * screens keep their layout while the store hydrates from the backend.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-surface-2", className)}
    />
  );
}

/** Avatar + two text lines — list rows (people, transactions, alerts). */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3.5", className)}>
      <Skeleton className="size-11 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

/** Bordered surface card with a heading line + body lines. */
export function SkeletonCard({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-4",
        className,
      )}
    >
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

/** Bordered card led by an avatar row, chips and a button — profile cards. */
export function SkeletonProfileCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-4",
        className,
      )}
    >
      <SkeletonRow className="py-0" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3.5 h-10 w-full rounded-xl" />
    </div>
  );
}

/** Horizontal card rail (e.g. Live Now). */
export function SkeletonRail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1",
        className,
      )}
    >
      <Skeleton className="h-36 w-64 shrink-0 rounded-card" />
      <Skeleton className="h-36 w-64 shrink-0 rounded-card" />
    </div>
  );
}

/** Hero balance card (wallet / earnings). */
export function SkeletonBalanceCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-5",
        className,
      )}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-3 h-9 w-44" />
      <div className="mt-5 flex gap-2.5">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

/** A bordered card of n divided list rows (transaction ledgers etc.). */
export function SkeletonList({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border rounded-card border border-border bg-surface px-4",
        className,
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
