"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  UsersRound,
  Wallet,
  User,
  CalendarDays,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: string; // path prefix used for active detection
}

const studentItems: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Search, match: "/explore" },
  { label: "Cohorts", href: "/cohorts", icon: UsersRound, match: "/cohorts" },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

const teacherItems: NavItem[] = [
  { label: "Home", href: "/teach/dashboard", icon: Home },
  { label: "Schedule", href: "/teach/schedule", icon: CalendarDays },
  { label: "Earnings", href: "/teach/earnings", icon: CreditCard },
  { label: "Profile", href: "/teach/profile", icon: User },
];

function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-110 border-t border-border bg-canvas/90 backdrop-blur-xl">
      <ul className="flex items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((item) => {
          const base = item.match ?? item.href.split("?")[0];
          const active =
            pathname === base ||
            (base !== "/home" && pathname.startsWith(base));
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                className="tap flex flex-col items-center gap-1 py-1"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-2xl transition-colors",
                    active
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-fg-muted",
                  )}
                >
                  <Icon className="size-5.5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    active ? "text-primary-soft" : "text-fg-faint",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function StudentBottomNav() {
  return <BottomNav items={studentItems} />;
}

export function TeacherBottomNav() {
  return <BottomNav items={teacherItems} />;
}
