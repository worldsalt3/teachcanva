import { cn, initials, avatarGradient } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizes: Record<Size, string> = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
  "2xl": "size-28 text-3xl",
};

export interface AvatarProps {
  name: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}

export function Avatar({ name, size = "md", className, ring }: AvatarProps) {
  const [from, to] = avatarGradient(name);
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold text-white",
        ring && "ring-2 ring-white/15",
        sizes[size],
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
