import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: Tone;
}

export function Chip({
  selected,
  tone = "dark",
  className,
  type = "button",
  ...props
}: ChipProps) {
  const styles = selected
    ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
    : tone === "light"
      ? "bg-white text-ink-soft border-[#d7dde8] hover:border-primary/50"
      : "bg-surface-2 text-fg-muted border-border hover:border-border-soft hover:text-fg";

  return (
    <button
      type={type}
      className={cn(
        "tap inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98]",
        styles,
        className,
      )}
      {...props}
    />
  );
}
