import { HTMLAttributes } from "react";
import { User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDIA_GRADIENTS = [
  "from-[#1e3a5f] via-[#152a47] to-[#0a1424]",
  "from-[#2a2350] via-[#1a1638] to-[#0c0a1d]",
  "from-[#10403c] via-[#0d2e2c] to-[#061413]",
  "from-[#3a2244] via-[#241531] to-[#10081a]",
  "from-[#143a52] via-[#0f2a3c] to-[#06141d]",
  "from-[#3a2a18] via-[#281d11] to-[#130d07]",
];

function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return MEDIA_GRADIENTS[h % MEDIA_GRADIENTS.length];
}

export interface MediaThumbProps extends HTMLAttributes<HTMLDivElement> {
  seed?: string;
  icon?: LucideIcon | false;
  vignette?: boolean;
}

/** Deterministic dark gradient placeholder for video/photo media. */
export function MediaThumb({
  seed = "tc",
  icon = User,
  vignette = true,
  className,
  children,
  ...props
}: MediaThumbProps) {
  const Icon = icon;
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-br",
        pickGradient(seed),
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/12"
          strokeWidth={1.5}
        />
      )}
      {vignette && (
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />
      )}
      {children}
    </div>
  );
}
