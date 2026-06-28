"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

interface AppHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
  bordered?: boolean;
}

export function AppHeader({
  children,
  className,
  sticky = true,
  bordered,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "z-30 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
        sticky && "sticky top-0 bg-canvas/85 backdrop-blur-xl",
        bordered && "border-b border-border",
        className,
      )}
    >
      {children}
    </header>
  );
}

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <IconButton
      variant="ghost"
      aria-label="Go back"
      onClick={() => router.back()}
      className={className}
    >
      <ChevronLeft className="size-6" />
    </IconButton>
  );
}
