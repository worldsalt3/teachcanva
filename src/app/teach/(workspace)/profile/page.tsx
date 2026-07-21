"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CalendarClock,
  ChevronRight,
  CreditCard,
  GraduationCap,
  HelpCircle,
  type LucideIcon,
  Pencil,
  Settings,
  Star,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import { currentTeacher } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { useApp } from "@/lib/store/app-provider";
import { formatCompact, formatTP, tpLevel } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  tint: string;
}

const menu: { heading: string; items: MenuItem[] }[] = [
  {
    heading: "Teaching",
    items: [
      {
        label: "Edit profile",
        icon: Pencil,
        href: "/settings",
        tint: "bg-primary/15 text-primary-soft",
      },
      {
        label: "Subjects & expertise",
        icon: BookOpen,
        href: "/settings",
        tint: "bg-teal/15 text-teal",
      },
      {
        label: "My availability",
        icon: CalendarClock,
        href: "/teach/schedule",
        tint: "bg-gold/15 text-gold",
      },
    ],
  },
  {
    heading: "Business",
    items: [
      {
        label: "Payouts & bank",
        icon: CreditCard,
        href: "/teach/earnings",
        tint: "bg-success/15 text-success-bright",
      },
      {
        label: "Reviews",
        icon: Star,
        href: "/settings",
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
        label: "Switch to learning",
        icon: GraduationCap,
        href: "/home",
        tint: "bg-primary/15 text-primary-soft",
      },
    ],
  },
];

export default function TeacherProfilePage() {
  const { teacherWallet, signOut, profileName, profileAvatarUrl, hydrated } =
    useApp();
  const level = tpLevel(teacherWallet.tpBalance);
  const displayName =
    profileName ?? (isSupabaseEnabled ? "Professional" : currentTeacher.name);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Profile
        </h1>
      </header>

      <div className="space-y-6 px-5 pt-2">
        {!hydrated ? (
          <>
            <div className="rounded-card border border-border bg-surface p-4">
              <SkeletonRow className="py-0" />
            </div>
            <Skeleton className="h-28 rounded-card" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-4">
              <Link
                href="/settings"
                aria-label="Change profile photo"
                className="tap relative shrink-0 rounded-full"
              >
                <Avatar
                  name={displayName}
                  src={profileAvatarUrl}
                  size="xl"
                  ring
                />
                <span className="absolute -bottom-0.5 -right-0.5 grid size-7 place-items-center rounded-full border-2 border-surface bg-primary text-white">
                  <Pencil className="size-3" />
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-display text-xl font-bold text-fg">
                    {displayName}
                  </p>
                  <BadgeCheck className="size-5 shrink-0 fill-primary text-white" />
                </div>
                <p className="text-[13px] text-fg-muted">
                  Professional · Mathematics &amp; Physics
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success-bright">
                  <BadgeCheck className="size-3.5" />
                  Verified professional
                </span>
              </div>
            </div>

            <div className="rounded-card border border-gold/25 bg-gold/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-fg-muted">
                  Professional Points level
                </p>
                <span className="rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-bold text-gold">
                  {level.name}
                </span>
              </div>
              <p className="mt-1 font-display text-xl font-bold text-fg">
                {formatTP(teacherWallet.tpBalance)}
              </p>
              <ProgressBar
                value={level.progress * 100}
                className="bg-gold"
                trackClassName="mt-3 bg-surface-2"
              />
              <p className="mt-1.5 text-[12px] text-fg-muted">
                {level.nextAt
                  ? `${formatTP(level.nextAt - teacherWallet.tpBalance)} to the next level`
                  : "Top level reached — Platinum professional"}
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-card border border-border bg-surface text-center">
              <Stat
                label="Rating"
                value="4.9"
                icon={<Star className="size-3.5 fill-gold text-gold" />}
              />
              <Stat
                label="Points"
                value={formatTP(teacherWallet.tpBalance)}
                divided
              />
              <Stat
                label="Lifetime"
                value={`₦${formatCompact(teacherWallet.lifetimeEarnings)}`}
                divided
              />
            </div>
          </>
        )}

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
  icon,
  divided,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  divided?: boolean;
}) {
  return (
    <div className={divided ? "border-l border-border px-2 py-4" : "px-2 py-4"}>
      <div className="flex items-center justify-center gap-1 font-bold text-fg">
        {icon}
        <span className="truncate">{value}</span>
      </div>
      <p className="mt-0.5 text-[12px] text-fg-faint">{label}</p>
    </div>
  );
}
