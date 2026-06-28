import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type FieldTone = "dark" | "light";

const base =
  "w-full rounded-2xl border px-4 text-[15px] outline-none transition-colors placeholder:font-normal focus:border-primary/70 focus:ring-4 focus:ring-primary/15";

const tones: Record<FieldTone, string> = {
  dark: "bg-surface-2 border-border text-fg placeholder:text-fg-faint",
  light:
    "bg-[#eef1f6] border-transparent text-ink placeholder:text-ink-soft/70",
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  tone?: FieldTone;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ tone = "dark", className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(base, "h-13 py-3", tones[tone], className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  tone?: FieldTone;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ tone = "dark", className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        base,
        "resize-none py-3 leading-relaxed",
        tones[tone],
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  tone?: FieldTone;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  tone = "dark",
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-semibold",
            tone === "light" ? "text-ink" : "text-fg",
          )}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-faint">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
