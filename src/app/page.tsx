import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  LockKeyhole,
  PenLine,
  PlayCircle,
  Sparkles,
  Star,
  UsersRound,
  Wallet,
} from "lucide-react";

const BTN_PRIMARY =
  "tap inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-[15px] font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/25 active:translate-y-0 active:scale-[0.99]";

function Brand({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-white">
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
        className={`font-display font-bold tracking-tight text-white ${small ? "text-lg" : "text-lg sm:text-xl"}`}
      >
        TeachCanvas
      </span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className="landing relative flex min-h-dvh flex-col text-fg">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="tap shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 text-[14px] font-medium text-fg-muted md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-fg">
              How it works
            </a>
            <a href="#details" className="transition-colors hover:text-fg">
              What you get
            </a>
            <a
              href="#for-professionals"
              className="transition-colors hover:text-fg"
            >
              For professionals
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="tap whitespace-nowrap text-[14px] font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Log in
            </Link>
            <Link
              href="/signup?role=learner"
              className="tap whitespace-nowrap rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-600 sm:px-4"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative isolate mx-auto grid w-full max-w-5xl items-center gap-10 px-6 pt-14 md:grid-cols-[1.1fr_1fr] md:gap-12 lg:gap-16 lg:px-8 lg:pt-24">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-136 bg-grid mask-[radial-gradient(70%_65%_at_50%_30%,black,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-24 right-[5%] -z-10 size-80 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[-6%] top-44 -z-10 size-64 rounded-full bg-teal/10 blur-3xl"
          aria-hidden
        />
        <section className="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[12px] font-semibold text-fg-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-bright opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success-bright" />
            </span>
            Live 1:1s &amp; cohorts · escrow protected
          </span>
          <h1 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.15] tracking-tight text-white md:text-4xl lg:text-[3.2rem] lg:leading-[1.08]">
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
                  stroke="#5b8cff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </span>{" "}
            from people who do the work.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-fg-muted">
            Book a 1:1 or take a seat in a cohort. Your professional teaches on
            a shared canvas, your money sits in escrow until the class ends, and
            every session comes with a replay.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link href="/signup?role=learner" className={BTN_PRIMARY}>
              Find a professional
            </Link>
            <Link
              href="/signup?role=professional"
              className="tap inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/12 bg-white/5 px-6 text-[15px] font-semibold text-fg transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/8 active:translate-y-0"
            >
              Teach on TeachCanvas <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex -space-x-2.5">
              {[
                ["AO", "from-[#2563eb] to-[#7da2ff]"],
                ["KM", "from-[#14b8a6] to-[#5eead4]"],
                ["ZE", "from-[#f5b417] to-[#fcd34d]"],
                ["TA", "from-[#7c3aed] to-[#c4b5fd]"],
              ].map(([initials, grad]) => (
                <span
                  key={initials}
                  className={`grid size-8 place-items-center rounded-full bg-linear-to-br ${grad} text-[10px] font-bold text-white ring-2 ring-canvas`}
                >
                  {initials}
                </span>
              ))}
            </div>
            <div>
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-gold text-gold" />
                ))}
              </span>
              <p className="mt-0.5 text-[12px] font-medium text-fg-muted">
                4.9 across 2,400+ rated sessions
              </p>
            </div>
          </div>
        </section>

        {/* ── Hero visual: a real live session ── */}
        <section className="fade-up [animation-delay:0.15s]">
          <div className="relative isolate mx-auto max-w-md md:mx-0 md:max-w-none">
            <div
              className="absolute -inset-2 -z-10 rotate-2 rounded-3xl bg-linear-to-br from-primary/30 via-teal/15 to-gold/25"
              aria-hidden
            />
            <div className="float-slow overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/50 ring-1 ring-white/10">
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
              <div className="relative h-48 bg-[#0b1020] md:h-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/board-live.jpg"
                  alt="Handwritten calculus worked live on the TeachCanvas board"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="eager"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-ink/45 to-transparent"
                  aria-hidden
                />
                <span className="absolute left-3 top-3 rounded-md bg-ink/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/85 backdrop-blur-sm">
                  SLIDE 5 · INTEGRALS
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  <UsersRound className="size-3 text-primary-soft" /> 132
                  learners
                </span>
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  <PenLine className="size-3 text-[#2dd4bf]" /> Canvas synced in
                  real time
                </span>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1.5 backdrop-blur-sm">
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
          </div>
          <p className="mx-auto mt-4 max-w-md text-center text-[12px] text-fg-faint md:mx-0 md:text-left">
            A real session on the canvas — annotate, chat, replay.
          </p>
        </section>
      </div>

      {/* ── Stats band ── */}
      <section className="mt-16 w-full border-y border-white/8 bg-white/3 lg:mt-24">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-9 md:grid-cols-4 lg:px-8">
          {[
            ["<1s", "canvas sync latency"],
            ["100%", "of payments in escrow"],
            ["4.9★", "average session rating"],
            ["100", "seats in the biggest cohorts"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center md:text-left">
              <p className="font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
                {stat}
              </p>
              <p className="mt-1 text-[12px] font-medium text-fg-muted">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="mx-auto mt-20 w-full max-w-5xl scroll-mt-24 px-6 lg:mt-28 lg:px-8"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-soft">
          How it works
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
          Booked to learning in three steps
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
          {[
            [
              "01",
              "Find your person",
              "Search by skill. Every professional lists their rate, availability and reviews, so you know what you're getting.",
            ],
            [
              "02",
              "Book it",
              "Pick a time that works, or grab a cohort seat. Payment is held in escrow, not handed over.",
            ],
            [
              "03",
              "Learn on the canvas",
              "Watch them draw, annotate and explain in real time. Rewatch the replay whenever you need it.",
            ],
          ].map(([step, title, desc]) => (
            <div
              key={step}
              className="rounded-2xl border border-white/8 bg-surface p-6 transition-all hover:-translate-y-1 hover:border-white/16 hover:bg-surface-2"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 font-display text-[13px] font-bold text-primary-soft">
                {step}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
                {desc}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[13px] leading-relaxed text-fg-faint">
          No subscriptions — you pay per session, the service fee is shown
          upfront, and refunds are instant if you cancel before class.
        </p>
      </section>

      {/* ── Details ── */}
      <section
        id="details"
        className="mt-20 w-full scroll-mt-24 border-y border-white/8 bg-white/2 py-14 lg:mt-28 lg:py-20"
      >
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-soft">
            What you get
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
            The details we sweat
          </h2>
          <div className="mt-8 grid items-start gap-10 md:grid-cols-[1fr_250px] md:gap-12 lg:grid-cols-[1fr_290px]">
            <div className="grid gap-x-12 lg:grid-cols-2">
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
            <div className="mx-auto w-full max-w-70 md:mx-0 md:max-w-none">
              <div className="overflow-hidden rounded-2xl bg-[#05070e] shadow-xl shadow-black/40 ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/screen-home.jpg"
                  alt="The TeachCanvas learner home screen with live and upcoming sessions"
                  className="aspect-9/16 w-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-center text-[12px] text-fg-faint">
                The learner home: live now, upcoming, replays.
              </p>
            </div>
          </div>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
            Popular right now
          </p>
          <div className="group relative mt-3 -mx-6 overflow-x-hidden lg:-mx-8">
            <div className="marquee flex w-max group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-2.5 pl-6 lg:pl-8"
                >
                  {[
                    "Coding",
                    "Data",
                    "Fintech",
                    "Design",
                    "Law",
                    "Product",
                    "Public speaking",
                    "Exam prep",
                    "Music theory",
                    "Career coaching",
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-fg-muted"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-[#0e121d] to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-[#0e121d] to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* ── For professionals ── */}
      <section
        id="for-professionals"
        className="mx-auto mt-20 w-full max-w-5xl scroll-mt-24 px-6 lg:mt-28 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-surface to-surface-2 p-8 ring-1 ring-white/10 lg:p-12">
          <div className="absolute inset-0 bg-grid" aria-hidden />
          <div
            className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative lg:flex lg:items-start lg:justify-between lg:gap-12">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-soft">
                For professionals
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Teach what you do all day.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                Set your rate and your days. Open a cohort or take 1:1 bookings.
                We hold the learner&apos;s payment in escrow and release it to
                your wallet when class ends.
              </p>
              <Link
                href="/signup?role=professional"
                className="tap mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-ink shadow-lg shadow-black/40 transition-all hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
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
              <div className="relative mx-auto mt-7 w-full max-w-xs overflow-hidden rounded-xl ring-1 ring-white/10 lg:mx-0 lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/screen-golive.jpg"
                  alt="The TeachCanvas professional dashboard with the Go Live Now card"
                  className="aspect-4/5 w-full object-cover object-top"
                  loading="lazy"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/70 to-transparent"
                  aria-hidden
                />
                <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white/80">
                  Your dashboard — go live in one tap.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="mx-auto mt-20 w-full max-w-3xl px-6 text-center lg:mt-28 lg:px-8">
        <span
          className="inline-flex items-center justify-center gap-0.5"
          aria-hidden
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-gold text-gold" />
          ))}
        </span>
        <blockquote className="mt-5">
          <p className="font-display text-xl font-medium leading-relaxed text-fg lg:text-[1.65rem] lg:leading-snug">
            “I opened a 100-seat cohort on a Tuesday. It filled by Friday, and I
            never had to chase a single payment.”
          </p>
          <footer className="mt-6 flex items-center justify-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-teal to-[#5eead4] font-display text-[13px] font-bold text-white">
              KM
            </span>
            <span className="text-left text-[14px]">
              <span className="block font-semibold text-white">Kwesi M.</span>
              <span className="block text-[12px] text-fg-muted">
                Product designer — Accra
              </span>
            </span>
          </footer>
        </blockquote>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto mt-20 w-full max-w-5xl px-6 lg:mt-28 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-surface px-8 py-14 text-center ring-1 ring-white/10 lg:py-20">
          <div className="absolute inset-0 bg-grid" aria-hidden />
          <div
            className="absolute -bottom-36 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-fg-muted">
              Create a free account in under a minute. No subscription — you pay
              per session, and your money stays in escrow until class ends.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup?role=learner"
                className="tap inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-7 text-[15px] font-semibold text-ink shadow-lg shadow-black/40 transition-all hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
              >
                Create a free account <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="tap text-[15px] font-semibold text-white/70 transition-colors hover:text-white"
              >
                or log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto mt-16 w-full max-w-5xl px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:mt-24 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-7">
          <Link href="/" className="tap">
            <Brand small />
          </Link>
          <nav className="flex items-center gap-5 text-[13px] font-medium text-fg-muted">
            <Link href="/login" className="transition-colors hover:text-fg">
              Log in
            </Link>
            <Link
              href="/signup?role=learner"
              className="transition-colors hover:text-fg"
            >
              Create account
            </Link>
            <Link
              href="/signup?role=professional"
              className="transition-colors hover:text-fg"
            >
              Teach
            </Link>
          </nav>
        </div>
        <p className="mt-5 text-[12px] text-fg-faint">
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
    <div className="flex items-start gap-3.5 border-t border-white/8 py-6">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-soft">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-[16px] font-bold text-white">
          {title}
        </h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">
          {desc}
        </p>
      </div>
    </div>
  );
}
