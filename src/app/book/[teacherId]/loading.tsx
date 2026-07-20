import { Skeleton, SkeletonCard, SkeletonRow } from "@/components/ui/skeleton";

/** Route-level skeleton shown while the booking flow loads its professional. */
export default function Loading() {
  return (
    <div className="px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="mt-6 rounded-card border border-border bg-surface p-4">
        <SkeletonRow className="py-0" />
      </div>
      <div className="mt-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-17 w-16 shrink-0 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-xl" />
          ))}
        </div>
        <SkeletonCard lines={2} />
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-xl" />
    </div>
  );
}
