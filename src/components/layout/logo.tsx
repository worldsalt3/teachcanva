import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withMark?: boolean;
  href?: string;
}

const sizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

export function Logo({ className, size = "md", withMark, href }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {withMark && (
        <span className="grid size-8 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <rect x="5" y="6" width="14" height="12" rx="2.5" fill="white" />
            <path
              d="M7 15 C 10 11, 14 11, 17 8"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      <span
        className={cn(
          "font-display font-extrabold tracking-tight text-fg",
          sizes[size],
        )}
      >
        Teach<span className="text-primary-soft">Canvas</span>
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
