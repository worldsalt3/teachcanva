import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "success"
  | "danger"
  | "soft"
  | "outline"
  | "neutral"
  | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary/25",
  success: "bg-success-bright text-white hover:bg-success active:bg-success",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  soft: "bg-primary-soft text-primary-700 hover:brightness-105 active:brightness-95",
  outline:
    "border border-primary/45 text-primary bg-transparent hover:bg-primary/10 active:bg-primary/15",
  neutral:
    "border border-border-soft text-fg bg-transparent hover:bg-white/5 active:bg-white/10",
  ghost: "text-fg hover:bg-white/5 active:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-11 px-4 text-sm rounded-xl gap-2",
  lg: "h-14 px-5 text-[15px] rounded-2xl gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "tap inline-flex items-center justify-center font-semibold leading-none transition-[background,transform,filter] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
