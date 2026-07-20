"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  CreditCard,
  Info,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { AuthGate } from "@/components/layout/auth-gate";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/store/app-provider";
import type { AppNotification } from "@/lib/services/types";
import { cn } from "@/lib/utils";

const meta: Record<
  AppNotification["kind"],
  { icon: LucideIcon; tint: string }
> = {
  session: { icon: CalendarClock, tint: "bg-primary/15 text-primary-soft" },
  payment: { icon: CreditCard, tint: "bg-teal/15 text-teal" },
  tp: { icon: Sparkles, tint: "bg-gold/15 text-gold" },
  system: { icon: Info, tint: "bg-surface-2 text-fg-muted" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    hydrated,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useApp();

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthGate />
      <AppHeader bordered>
        <div className="flex w-full items-center gap-2">
          <BackButton className="-ml-2" />
          <h1 className="font-display text-lg font-bold text-fg">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="tap ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-soft"
            >
              <CheckCheck className="size-4" /> Mark all read
            </button>
          )}
        </div>
      </AppHeader>

      {!hydrated ? (
        <div className="divide-y divide-border px-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-4">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-surface text-fg-faint">
            <Bell className="size-7" />
          </span>
          <p className="mt-4 font-semibold text-fg">No notifications</p>
          <p className="mt-1 text-[13px] text-fg-muted">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((n) => {
            const { icon: Icon, tint } = meta[n.kind];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => open(n)}
                className={cn(
                  "tap flex w-full items-start gap-3 px-5 py-4 text-left transition-colors",
                  n.read ? "bg-transparent" : "bg-surface/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    tint,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-fg">{n.title}</p>
                    {!n.read && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[11px] text-fg-faint">{n.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
