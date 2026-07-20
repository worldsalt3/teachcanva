import { Skeleton, SkeletonCard, SkeletonRow } from "@/components/ui/skeleton";

/** Route-level skeleton shown while the professional profile is fetched. */
export default function Loading() {
  return (
    <div className="px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <Skeleton className="size-10 rounded-xl" />
      <div className="mt-6 flex items-center gap-4">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3.5 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={2} />
        <div className="rounded-card border border-border bg-surface px-4">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
      <div className="mt-6 flex gap-2.5">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
