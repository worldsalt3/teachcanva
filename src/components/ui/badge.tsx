import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "live"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "teal"
  | "gold"
  | "neutral";

const variants: Record<Variant, string> = {
  live: "bg-danger text-white",
  success: "bg-success/15 text-success-bright",
  warning: "bg-gold/15 text-gold",
  danger: "bg-danger/15 text-danger",
  info: "bg-primary/15 text-primary-soft",
  teal: "bg-teal/15 text-teal",
  gold: "bg-gold/15 text-gold",
  neutral: "bg-white/10 text-fg-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  uppercase?: boolean;
}

export function Badge({
  variant = "neutral",
  dot,
  uppercase,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
        uppercase && "uppercase",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            variant === "live" ? "bg-white" : "bg-current",
          )}
        />
      )}
      {children}
    </span>
  );
}
