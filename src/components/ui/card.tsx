import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light" | "elevated" | "plain";

const tones: Record<Tone, string> = {
  dark: "bg-surface border border-border",
  elevated: "bg-surface-2 border border-border-soft",
  light: "bg-white text-ink",
  plain: "bg-transparent",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "dark", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-card", tones[tone], className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";
