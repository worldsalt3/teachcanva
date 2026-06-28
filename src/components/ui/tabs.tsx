"use client";

import { cn } from "@/lib/utils";

export interface TabsProps {
  tabs: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Underline-style segmented tabs. */
export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border-b border-border",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={cn(
              "tap relative -mb-px pb-3 text-sm font-semibold transition-colors",
              active ? "text-primary-soft" : "text-fg-muted hover:text-fg",
            )}
          >
            {tab}
            {active && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
