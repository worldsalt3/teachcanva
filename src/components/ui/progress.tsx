import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0..100
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  className,
  trackClassName,
}: ProgressBarProps) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/10",
        trackClassName,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-500",
          className,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
