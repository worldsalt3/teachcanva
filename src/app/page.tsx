import Link from "next/link";
import { ArrowRight, LogIn, GraduationCap, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="text-center">
        <h1 className="bg-linear-to-r from-[#a9c2ff] via-[#7da2ff] to-[#5b8cff] bg-clip-text font-display text-4xl font-extrabold tracking-tight text-transparent">
          TeachCanvas
        </h1>
        <p className="mt-2 text-[15px] text-fg-muted">
          Live knowledge transfer — for every professional.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <RoleCard
          href="/signup"
          badge={<Badge variant="info">Cohorts</Badge>}
          icon={<GraduationCap className="size-9 text-primary-soft" />}
          gradient="from-[#1f3b66] to-[#0d1b33]"
          title="I'm a Learner"
          description="Join live cohort sessions and 1:1 bookings with verified professionals across Africa."
          cta="Start Learning"
        />
        <RoleCard
          href="/signup"
          badge={<Badge variant="danger">Expert</Badge>}
          icon={<Presentation className="size-9 text-teal" />}
          gradient="from-[#11324a] to-[#0c1626]"
          title="I'm a Professional"
          description="Monetize your expertise — host live cohorts and 1:1 sessions in real time."
          cta="Start Teaching"
        />
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          Already have an account?{" "}
          <span className="inline-flex items-center gap-1 font-semibold text-fg">
            Sign in <LogIn className="size-4" />
          </span>
        </Link>
      </div>

      <div className="mt-auto pt-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fg-faint">
          — Engineering Excellence —
        </span>
      </div>
    </main>
  );
}

function RoleCard({
  href,
  badge,
  icon,
  gradient,
  title,
  description,
  cta,
}: {
  href: string;
  badge: React.ReactNode;
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="tap block overflow-hidden rounded-3xl bg-white shadow-xl transition-transform active:scale-[0.99]"
    >
      <div
        className={`relative grid h-44 place-items-center bg-linear-to-br ${gradient}`}
      >
        <div className="grid size-20 place-items-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
          {icon}
        </div>
        <div className="absolute right-3 top-3">{badge}</div>
      </div>
      <div className="p-5 text-ink">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {cta} <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
