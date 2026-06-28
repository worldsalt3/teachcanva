import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "surface" | "ghost" | "primary" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  surface: "bg-surface-2 text-fg border border-border hover:bg-elevated",
  ghost: "text-fg-muted hover:bg-white/5 hover:text-fg",
  primary:
    "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/25",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success-bright text-white hover:bg-success",
};

const sizes: Record<Size, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-14",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  rounded?: "full" | "xl";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "surface",
      size = "md",
      rounded = "full",
      className,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "tap inline-grid place-items-center transition-[background,transform,filter] duration-150 active:scale-95 disabled:opacity-50",
        rounded === "full" ? "rounded-full" : "rounded-2xl",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
