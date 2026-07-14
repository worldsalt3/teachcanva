import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchTriggerProps {
  href?: string;
  placeholder?: string;
  className?: string;
}

/** Read-only search field that navigates to a search screen on tap. */
export function SearchTrigger({
  href = "/explore",
  placeholder = "Search topics, skills or professionals",
  className,
}: SearchTriggerProps) {
  return (
    <Link
      href={href}
      className={cn(
        "tap flex h-12 items-center gap-3 rounded-2xl border border-border bg-surface px-4 text-fg-muted",
        className,
      )}
    >
      <Search className="size-5 shrink-0 text-fg-faint" />
      <span className="truncate text-sm">{placeholder}</span>
    </Link>
  );
}
