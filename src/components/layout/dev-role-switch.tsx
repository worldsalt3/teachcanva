"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight developer aid to preview the student vs teacher app shells
 * without real authentication. Not part of the production auth flow.
 */
export function DevRoleSwitch() {
  const pathname = usePathname();
  const isTeacher = pathname.startsWith("/teach");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-23 z-40 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-soft bg-surface-2/80 p-1 text-xs shadow-xl backdrop-blur-md">
        <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-fg-faint">
          Dev
        </span>
        <Link
          href="/home"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors",
            !isTeacher
              ? "bg-primary text-white"
              : "text-fg-muted hover:text-fg",
          )}
        >
          <GraduationCap className="size-3.5" /> Learner
        </Link>
        <Link
          href="/teach/dashboard"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors",
            isTeacher ? "bg-primary text-white" : "text-fg-muted hover:text-fg",
          )}
        >
          <Presentation className="size-3.5" /> Professional
        </Link>
      </div>
    </div>
  );
}
