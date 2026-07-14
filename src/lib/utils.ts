import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Naira currency, e.g. ₦12,500 or ₦8,925.00 */
export function formatNaira(amount: number, opts?: { decimals?: boolean }) {
  const decimals = opts?.decimals ?? false;
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

/** Format Teaching Points (professionals), e.g. 1,240 TP */
export function formatTP(points: number) {
  return `${points.toLocaleString("en-NG")} TP`;
}

/** Format Learning Points (learners), e.g. 320 LP */
export function formatLP(points: number) {
  return `${points.toLocaleString("en-NG")} LP`;
}

export type TPLevelName = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface TPLevel {
  name: TPLevelName;
  min: number;
  /** TP needed to reach the next level, or null when at Platinum. */
  nextAt: number | null;
  /** 0..1 progress from this level's floor to the next level. */
  progress: number;
}

const TP_LEVELS: { name: TPLevelName; min: number }[] = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold", min: 5000 },
  { name: "Platinum", min: 15000 },
];

/** Resolve a professional's level (Bronze → Platinum) from a TP balance. */
export function tpLevel(tp: number): TPLevel {
  let idx = 0;
  for (let i = TP_LEVELS.length - 1; i >= 0; i--) {
    if (tp >= TP_LEVELS[i].min) {
      idx = i;
      break;
    }
  }
  const level = TP_LEVELS[idx];
  const next = TP_LEVELS[idx + 1] ?? null;
  return {
    name: level.name,
    min: level.min,
    nextAt: next ? next.min : null,
    progress: next ? Math.min(1, (tp - level.min) / (next.min - level.min)) : 1,
  };
}

/** Compact count, e.g. 1.2k */
export function formatCompact(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

/** Deterministic initials from a name, e.g. "Aisha Olamide" -> "AO" */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_GRADIENTS = [
  ["#2563eb", "#14b8a6"],
  ["#7c3aed", "#2563eb"],
  ["#f5b417", "#ef4444"],
  ["#16a34a", "#14b8a6"],
  ["#ef4444", "#7c3aed"],
  ["#0ea5e9", "#6366f1"],
  ["#f97316", "#f5b417"],
];

/** Stable gradient pair for a given seed string. */
export function avatarGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const pair = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  return [pair[0], pair[1]];
}
