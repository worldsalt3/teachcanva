import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  LockKeyhole,
  PenLine,
  PlayCircle,
  Sparkles,
  UsersRound,
  Wallet,
} from "lucide-react";

const BTN_PRIMARY =
  "tap inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#22304f] active:scale-[0.99]";

function Brand({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <rect x="5" y="6" width="14" height="12" rx="2.5" fill="white" />
          <path
            d="M7 15 C 10 11, 14 11, 17 8"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`font-display font-bold tracking-tight text-ink ${small ? "text-lg" : "text-lg sm:text-xl"}`}
      >
        TeachCanvas
      </span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className="landing relative flex min-h-dvh flex-col text-ink">
      {/* ── Top bar ── */}
      <header className="border-b border-ink/8 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="tap shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 text-[14px] font-medium text-ink-soft md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-ink"
            >
              How it works
            </a>
            <a href="#details" className="transition-colors hover:text-ink">
              What you get
            </a>
            <a
              href="#for-professionals"
              className="transition-colors hover:text-ink"
            >
              For professionals
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="tap whitespace-nowrap text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/signup?role=learner"
              className="tap whitespace-nowrap rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#22304f] sm:px-4"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 pt-14 md:grid-cols-[1.1fr_1fr] md:gap-12 lg:gap-16 lg:px-8 lg:pt-24">
        <section>
          <h1 className="font-display text-[2.1rem] font-bold leading-[1.15] tracking-tight md:text-4xl lg:text-[2.9rem] lg:leading-[1.1]">
            Learn{" "}
            <span className="relative inline-block">
              live
              <svg
                className="absolute -bottom-1.5 left-0 w-full lg:-bottom-2"
                viewBox="0 0 120 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M3 9 C 30 3, 62 2, 117 6"
                  stroke="#2563eb"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </span>{" "}
            from people who do the work.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Book a 1:1 or take a seat in a cohort. Your professional teaches on
            a shared canvas, your money sits in escrow until the class ends, and
            every session comes with a replay.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/signup?role=learner" className={BTN_PRIMARY}>
              Find a professional
            </Link>
            <Link
              href="/signup?role=professional"
              className="tap inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary transition-colors hover:text-primary-700"
            >
              Teach on TeachCanvas <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-8 text-[13px] text-ink-soft/80">
            1:1 sessions &amp; cohorts &nbsp;·&nbsp; escrow payments
            &nbsp;·&nbsp; replays included
          </p>
        </section>

        {/* ── Hero visual: live session mock ── */}
        <section>
          <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-surface shadow-xl shadow-ink/15 md:mx-0 md:max-w-none">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-primary/25 font-display text-sm font-bold text-primary-soft">
                  AO
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-white">
                    Advanced Calculus
                  </p>
                  <p className="text-[11px] text-white/50">Aisha Olamide</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-2.5 py-1 text-[11px] font-bold text-[#ff8a8a]">
                <span className="size-1.5 animate-pulse rounded-full bg-danger" />
                LIVE
              </span>
            </div>
            <div className="relative h-44 bg-[#0b1020]">
              <svg
                viewBox="0 0 320 160"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                {/* faint grid */}
                <path
                  d="M0 40 H320 M0 80 H320 M0 120 H320 M80 0 V160 M160 0 V160 M240 0 V160"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                {/* curve */}
                <path
                  d="M24 118 C 80 40, 128 132, 176 66 S 268 96, 300 38"
                  stroke="#7da2ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* tangent at the highlighted point */}
                <path
                  d="M136 96 L 216 36"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="1 6"
                />
                <circle cx="176" cy="66" r="5" fill="#f5b417" />
                <text
                  x="206"
                  y="122"
                  fill="#f5b417"
                  fontSize="13"
                  fontStyle="italic"
                  fontFamily="Georgia, serif"
                >
                  f′(x) = 2x
                </text>
              </svg>
              <span className="absolute left-3 top-3 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/60 backdrop-blur">
                SLIDE 3 · DERIVATIVES
              </span>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75 backdrop-blur">
                <UsersRound className="size-3 text-primary-soft" /> 132 learners
              </span>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75 backdrop-blur">
                <PenLine className="size-3 text-[#2dd4bf]" /> Canvas synced in
                real time
              </span>
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 backdrop-blur">
                <span className="size-2.5 rounded-full bg-[#7da2ff] ring-2 ring-white/30" />
                <span className="size-2.5 rounded-full bg-teal" />
                <span className="size-2.5 rounded-full bg-gold" />
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4ade80]">
                <Wallet className="size-3.5" /> ₦5,000 held in escrow
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#fbbf24]">
                <Sparkles className="size-3.5" /> +50 Learning Points
              </span>
            </div>
          </div>
          <p className="mx-auto mt-3 max-w-md text-center text-[12px] text-ink-soft/70 md:mx-0 md:text-left">
            A live session on the canvas: annotate, chat, replay.
          </p>
        </section>
      </div>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="mx-auto mt-20 w-full max-w-5xl scroll-mt-8 px-6 lg:mt-28 lg:px-8"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
          How it works
        </h2>
        <div className="mt-8 grid gap-8 border-t border-ink/10 pt-8 md:grid-cols-3 md:gap-10">
          <div>
            <span className="font-display text-3xl font-bold text-ink/12">
              01
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">
              Find your person
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Search by skill. Every professional lists their rate, availability
              and reviews, so you know what you&apos;re getting.
            </p>
          </div>
          <div>
            <span className="font-display text-3xl font-bold text-ink/12">
              02
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">Book it</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Pick a time that works, or grab a cohort seat. Payment is held in
              escrow, not handed over.
            </p>
          </div>
          <div>
            <span className="font-display text-3xl font-bold text-ink/12">
              03
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">
              Learn on the canvas
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Watch them draw, annotate and explain in real time. Rewatch the
              replay whenever you need it.
            </p>
          </div>
        </div>
        <p className="mt-10 border-t border-ink/10 pt-6 text-[13px] leading-relaxed text-ink-soft/80">
          No subscriptions — you pay per session, the service fee is shown
          upfront, and refunds are instant if you cancel before class.
        </p>
      </section>

      {/* ── Details ── */}
      <section
        id="details"
        className="mt-20 w-full scroll-mt-8 border-y border-ink/8 bg-white py-14 lg:mt-28 lg:py-20"
      >
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
            The details we sweat
          </h2>
          <div className="mt-8 grid gap-x-12 md:grid-cols-2">
            <Detail
              icon={<PenLine className="size-4.5" />}
              title="Live canvas"
              desc="Every stroke syncs in under a second, over slides, photos, even video."
            />
            <Detail
              icon={<LockKeyhole className="size-4.5" />}
              title="Escrow wallet"
              desc="Cancel before class and the refund is instant. No chasing anyone."
            />
            <Detail
              icon={<PlayCircle className="size-4.5" />}
              title="Replays"
              desc="Completed sessions are yours to rewatch, chaptered by slide."
            />
            <Detail
              icon={<UsersRound className="size-4.5" />}
              title="Cohorts"
              desc="Seat-limited group sessions, with waitlists when they fill."
            />
            <Detail
              icon={<Sparkles className="size-4.5" />}
              title="Learning Points"
              desc="A track record you earn by showing up, session after session."
            />
            <Detail
              icon={<CalendarCheck className="size-4.5" />}
              title="Real availability"
              desc="Professionals set their own days, so you only see times that exist."
            />
          </div>
          <p className="mt-8 text-[13px] text-ink-soft/80">
            Popular right now: coding, data, fintech, design, law, product,
            public speaking.
          </p>
        </div>
      </section>

      {/* ── For professionals ── */}
      <section
        id="for-professionals"
        className="mx-auto mt-20 w-full max-w-5xl scroll-mt-8 px-6 lg:mt-28 lg:px-8"
      >
        <div className="rounded-2xl bg-ink p-8 lg:p-12">
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
            <div className="max-w-md">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Teach what you do all day.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                Set your rate and your days. Open a cohort or take 1:1 bookings.
                We hold the learner&apos;s payment in escrow and release it to
                your wallet when class ends.
              </p>
              <Link
                href="/signup?role=professional"
                className="tap mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-white/90"
              >
                Start teaching <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 lg:mt-1 lg:w-80 lg:shrink-0">
              <ul className="space-y-3.5">
                {[
                  "Your availability, your hourly rate",
                  "Cohort seats capped where you want them",
                  "A slide builder for preparing class",
                  "Withdraw to your bank when you like",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[14px] text-white/85"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 rounded-xl bg-white/6 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] text-white/50">This month</span>
                  <span className="font-display text-lg font-bold text-white">
                    ₦182,500
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[12px]">
                  <span className="text-white/50">Payout · GTBank ••4218</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#4ade80]">
                    <Check className="size-3" /> Sent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="mx-auto mt-20 w-full max-w-3xl px-6 lg:mt-28 lg:px-8">
        <blockquote className="border-l-2 border-primary pl-6">
          <p className="font-display text-xl font-medium leading-relaxed text-ink lg:text-2xl">
            I opened a 100-seat cohort on a Tuesday. It filled by Friday, and I
            never had to chase a single payment.
          </p>
          <footer className="mt-4 text-[14px] text-ink-soft">
            Kwesi M., product designer — Accra
          </footer>
        </blockquote>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto mt-20 w-full max-w-5xl px-6 lg:mt-28 lg:px-8">
        <div className="border-t border-ink/10 pt-12 text-center lg:pt-16">
          <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Ready when you are.
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
            <Link href="/signup?role=learner" className={BTN_PRIMARY}>
              Create a free account
            </Link>
            <Link
              href="/login"
              className="tap text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              or log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto mt-16 w-full max-w-5xl px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:mt-24 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-7">
          <Link href="/" className="tap">
            <Brand small />
          </Link>
          <nav className="flex items-center gap-5 text-[13px] font-medium text-ink-soft">
            <Link href="/login" className="transition-colors hover:text-ink">
              Log in
            </Link>
            <Link
              href="/signup?role=learner"
              className="transition-colors hover:text-ink"
            >
              Create account
            </Link>
            <Link
              href="/signup?role=professional"
              className="transition-colors hover:text-ink"
            >
              Teach
            </Link>
          </nav>
        </div>
        <p className="mt-5 text-[12px] text-ink-soft/70">
          Live sessions on a shared canvas — from Lagos to Nairobi. © 2026
          TeachCanvas
        </p>
      </footer>
    </main>
  );
}

function Detail({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="border-t border-ink/10 py-6">
      <div className="flex items-center gap-2.5">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-[16px] font-bold">{title}</h3>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{desc}</p>
    </div>
  );
}
