"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldTone } from "./input";

const tones: Record<FieldTone, string> = {
  dark: "bg-surface-2 border-border text-fg placeholder:text-fg-faint",
  light:
    "bg-[#eef1f6] border-transparent text-ink placeholder:text-ink-soft/70",
};

export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  tone?: FieldTone;
}

export function PasswordInput({
  tone = "dark",
  className,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={cn(
          "h-13 w-full rounded-2xl border px-4 pr-12 text-[15px] outline-none transition-colors focus:border-primary/70 focus:ring-4 focus:ring-primary/15",
          tones[tone],
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors",
          tone === "light"
            ? "text-ink-soft hover:text-ink"
            : "text-fg-muted hover:text-fg",
        )}
      >
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
