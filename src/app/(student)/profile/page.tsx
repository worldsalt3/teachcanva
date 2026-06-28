"use client";

import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  HelpCircle,
  type LucideIcon,
  Pencil,
  Presentation,
  Settings,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useApp } from "@/lib/store/app-provider";
import { formatNaira, formatTP } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  tint: string;
}

const menu: { heading: string; items: MenuItem[] }[] = [
  {
    heading: "Account",
    items: [
      {
        label: "Edit profile",
        icon: Pencil,
        href: "/settings",
        tint: "bg-primary/15 text-primary-soft",
      },
      {
        label: "Payment & wallet",
        icon: WalletIcon,
        href: "/wallet",
        tint: "bg-teal/15 text-teal",
      },
      {
        label: "Notifications",
        icon: Bell,
        href: "/notifications",
        tint: "bg-gold/15 text-gold",
      },
    ],
  },
  {
    heading: "Learning",
    items: [
      {
        label: "My sessions",
        icon: CalendarCheck,
        href: "/home",
        tint: "bg-primary/15 text-primary-soft",
      },
      {
        label: "Teaching Points",
        icon: Sparkles,
        href: "/wallet",
        tint: "bg-gold/15 text-gold",
      },
    ],
  },
  {
    heading: "More",
    items: [
      {
        label: "Help & support",
        icon: HelpCircle,
        href: "/settings",
        tint: "bg-surface-2 text-fg-muted",
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        tint: "bg-surface-2 text-fg-muted",
      },
      {
        label: "Become a tutor",
        icon: Presentation,
        href: "/teach/apply",
        tint: "bg-success/15 text-success-bright",
      },
    ],
  },
];

export default function StudentProfilePage() {
  const { studentName, studentWallet, studentBookings, signOut } = useApp();

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Profile
        </h1>
      </header>

      <div className="space-y-6 px-5 pt-2">
        <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-4">
          <Avatar name={studentName} size="xl" ring />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-bold text-fg">
              {studentName}
            </p>
            <p className="text-[13px] text-fg-muted">
              Student · Lagos, Nigeria
            </p>
            <Link
              href="/settings"
              className="tap mt-2 inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1 text-[12px] font-semibold text-fg-muted"
            >
              <Pencil className="size-3.5" />
              Edit profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 overflow-hidden rounded-card border border-border bg-surface text-center">
          <Stat label="Points" value={formatTP(studentWallet.tpBalance)} />
          <Stat
            label="Upcoming"
            value={String(studentBookings.length)}
            divided
          />
          <Stat
            label="Wallet"
            value={formatNaira(studentWallet.balance)}
            divided
          />
        </div>

        {menu.map((group) => (
          <div key={group.heading}>
            <p className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-wider text-fg-faint">
              {group.heading}
            </p>
            <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="tap flex items-center gap-3 px-4 py-3.5"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.tint}`}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <span className="flex-1 font-medium text-fg">
                      {item.label}
                    </span>
                    <ChevronRight className="size-5 text-fg-faint" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={signOut}
          className="tap flex w-full items-center justify-center rounded-card border border-danger/30 bg-danger/10 py-3.5 font-semibold text-danger"
        >
          Log out
        </button>

        <p className="pt-1 text-center text-[12px] text-fg-faint">
          TeachCanvas v1.0.0
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  divided,
}: {
  label: string;
  value: string;
  divided?: boolean;
}) {
  return (
    <div className={divided ? "border-l border-border px-2 py-4" : "px-2 py-4"}>
      <p className="truncate font-bold text-fg">{value}</p>
      <p className="mt-0.5 text-[12px] text-fg-faint">{label}</p>
    </div>
  );
}
