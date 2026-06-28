import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-3", className)}
    >
      <h2 className="font-display text-lg font-bold tracking-tight text-fg">
        {title}
      </h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="tap shrink-0 text-[13px] font-semibold text-primary-soft"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
