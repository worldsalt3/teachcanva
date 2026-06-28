import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarValueProps {
  value: number;
  count?: number;
  className?: string;
  starClassName?: string;
}

/** Inline read-only rating display, e.g. ★ 4.9 (124) */
export function StarValue({
  value,
  count,
  className,
  starClassName,
}: StarValueProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold",
        className,
      )}
    >
      <Star className={cn("size-4 fill-gold text-gold", starClassName)} />
      <span>{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="font-normal text-fg-faint">({count})</span>
      )}
    </span>
  );
}
