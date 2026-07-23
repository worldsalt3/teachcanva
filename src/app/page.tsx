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
        className={`font-display font-bold tracking-tight text-ink ${small ? "text-lg" : "text-lg sm:text-xl"}`}
      >
        TeachCanvas
      </span>
    </span>
  );
}

/* ── Hand-drawn SVG accents ── */

function Scribble({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3 9 C 28 3.5, 64 2.5, 117 5.5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M9 10.5 C 40 6.5, 74 5, 111 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M10 44 C 14 28, 20 16, 34 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24 8 L 34 7 L 33 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lasso({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 72"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d="M122 6 C 46 4, 8 16, 8 36 C 8 58, 64 70, 124 68 C 190 66, 234 54, 232 34 C 230 14, 182 4, 104 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="landing relative flex min-h-dvh flex-col bg-noise text-ink">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-[#f7f8fb]/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="tap shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 text-[14px] font-medium text-ink-soft md:flex">
            <a
              href="#how-it-works"
              className="link-draw transition-colors hover:text-ink"
            >
              How it works
            </a>
            <a
              href="#details"
              className="link-draw transition-colors hover:text-ink"
            >
              What you get
            </a>
            <a
              href="#for-professionals"
              className="link-draw transition-colors hover:text-ink"
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
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-136 bg-grid-ink mask-[radial-gradient(70%_65%_at_50%_30%,black,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-24 right-[5%] -z-10 size-80 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[-6%] top-44 -z-10 size-64 rounded-full bg-teal/10 blur-3xl"
          aria-hidden
        />
        <section className="fade-up">
          <span className="inline-block -rotate-2 rounded-md border border-ink/10 bg-white px-3 py-1.5 font-serif text-[14px] italic tracking-tight text-ink-soft shadow-sm">
            live 1:1s &amp; cohorts — money held in escrow
          </span>
          <h1 className="mt-6 font-display text-[2.5rem] font-bold leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl lg:leading-[1.04]">
            Learn{" "}
            <span className="relative inline-block font-serif font-medium italic text-primary">
              live
              <Scribble className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary lg:-bottom-2.5 lg:h-3" />
            </span>{" "}
            from people who{" "}
            <span className="font-serif font-medium italic">do the work.</span>
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
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
              className="tap inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-ink/10 bg-white px-6 text-[15px] font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md active:translate-y-0"
            >
              Teach on TeachCanvas <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-9 max-w-sm border-l-2 border-gold pl-4 text-[14px] leading-relaxed text-ink-soft">
            <span className="font-serif text-lg font-semibold text-ink">
              4.9&nbsp;★
            </span>{" "}
            average across{" "}
            <span className="font-semibold text-ink">2,400+</span> rated
            sessions — from Lagos to Nairobi.
          </p>
        </section>

        {/* ── Hero visual: the real app ── */}
        <section className="fade-up [animation-delay:0.15s]">
          <div className="relative isolate mx-auto w-fit -rotate-2">
            <div
              className="pointer-events-none absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <div className="float-slow w-65 overflow-hidden rounded-[2.4rem] shadow-2xl shadow-ink/25 ring-1 ring-ink/10 md:w-72.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/phone-live.jpg"
                alt="A live calculus session on the TeachCanvas mobile canvas"
                className="block w-full"
                loading="eager"
              />
            </div>
            <span className="absolute -left-4 top-12 inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-ink shadow-lg backdrop-blur sm:-left-9">
              <span className="size-1.5 animate-pulse rounded-full bg-danger" />
              LIVE · Advanced Calculus
            </span>
            <span className="absolute -right-4 top-[40%] inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-lg backdrop-blur sm:-right-9">
              <UsersRound className="size-3.5 text-primary" /> 132 learners
            </span>
            <span className="absolute -left-4 bottom-16 inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-lg backdrop-blur sm:-left-9">
              <Wallet className="size-3.5 text-success-bright" /> ₦5,000 in
              escrow
            </span>
          </div>
          <div className="mx-auto mt-6 flex w-fit items-center gap-2.5">
            <ArrowDoodle className="size-8 shrink-0 text-ink-soft/50" />
            <p className="max-w-48 font-serif text-[15px] italic leading-snug text-ink-soft">
              the actual app — live ink, not a mockup
            </p>
          </div>
        </section>
      </div>

      {/* ── Stats band ── */}
      <section className="mt-16 w-full border-y border-ink/8 bg-white lg:mt-24">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-8 gap-y-8 px-6 py-10 md:flex md:items-end lg:px-8">
          {[
            ["<1s", "canvas sync latency"],
            ["100%", "of payments in escrow"],
            ["4.9★", "average session rating"],
            ["100", "seats in the biggest cohorts"],
          ].map(([stat, label], i) => (
            <div
              key={label}
              className={`md:flex-1 ${i > 0 ? "md:border-l md:border-ink/8 md:pl-8 lg:pl-10" : ""}`}
            >
              <p className="font-serif text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
                {stat}
              </p>
              <Scribble className="mt-1.5 h-1.5 w-10 text-primary/50" />
              <p className="mt-1.5 text-[12px] font-medium text-ink-soft">
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
        <div className="reveal">
          <p className="font-serif text-[15px] italic text-primary">
            how it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            Booked to learning in{" "}
            <span className="font-serif font-medium italic">three steps.</span>
          </h2>
        </div>
        <div className="mt-6">
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
          ].map(([step, title, desc], i) => (
            <div
              key={step}
              className={`reveal grid grid-cols-[4.5rem_1fr] items-start gap-5 border-t border-ink/8 py-8 first:border-t-0 sm:grid-cols-[6rem_1fr] sm:gap-8 ${
                i === 1 ? "md:ml-16" : i === 2 ? "md:ml-32" : ""
              }`}
            >
              <span className="font-serif text-5xl font-medium italic leading-none text-primary/40 sm:text-6xl">
                {step}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-ink">
                  {title}
                </h3>
                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="reveal max-w-2xl border-t border-ink/8 pt-6 text-[13px] leading-relaxed text-ink-soft/70">
          No subscriptions — you pay per session through Monnify&apos;s secure
          checkout, the service fee is shown upfront, and refunds are instant if
          you cancel before class.
        </p>
      </section>

      {/* ── Details ── */}
      <section
        id="details"
        className="mt-20 w-full scroll-mt-24 border-y border-ink/8 bg-white py-14 lg:mt-28 lg:py-20"
      >
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
          <p className="font-serif text-[15px] italic text-primary">
            what you get
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            The details{" "}
            <span className="font-serif font-medium italic">we sweat.</span>
          </h2>
          <div className="reveal mt-8 grid items-start gap-10 md:grid-cols-[1fr_250px] md:gap-12 lg:grid-cols-[1fr_290px]">
            <div className="grid gap-x-12 lg:grid-cols-2">
              <Detail
                icon={<PenLine className="size-4.5" />}
                title="Live canvas"
                desc="Every stroke syncs in under a second, over slides, photos, even video."
              />
              <Detail
                icon={<LockKeyhole className="size-4.5" />}
                title="Escrow wallet"
                desc="Payments run through Monnify and sit in escrow. Cancel before class and the refund is instant."
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
            <div className="mx-auto w-full max-w-60 md:mx-0 md:max-w-none">
              <div className="overflow-hidden rounded-4xl shadow-xl shadow-ink/15 ring-1 ring-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/phone-home.jpg"
                  alt="The TeachCanvas learner home screen with live and upcoming sessions"
                  className="block w-full"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-center font-serif text-[14px] italic text-ink-soft">
                the learner home — live now, upcoming, replays
              </p>
            </div>
          </div>
          <p className="mt-10 font-serif text-[15px] italic text-ink-soft">
            popular right now
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
                      className="whitespace-nowrap rounded-full bg-ink/4 px-4 py-1.5 text-[13px] font-medium text-ink-soft"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent"
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
        <div className="reveal relative overflow-hidden rounded-3xl bg-ink p-8 shadow-2xl shadow-ink/20 lg:p-12">
          <div className="absolute inset-0 bg-grid" aria-hidden />
          <div
            className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-md">
              <p className="font-serif text-[15px] italic text-primary-soft">
                for professionals
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
                Teach what you{" "}
                <span className="relative inline-block font-serif font-medium italic">
                  do all day.
                  <Scribble className="absolute -bottom-1 left-0 h-2 w-full text-primary-soft/70" />
                </span>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                Set your rate and your days. Open a cohort or take 1:1 bookings.
                We hold the learner&apos;s payment in escrow and release it to
                your wallet when class ends — withdrawals go straight to your
                bank through Monnify.
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
              <div className="relative mx-auto mt-7 w-full max-w-xs lg:mx-0 lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/screen-golive.jpg"
                  alt="The TeachCanvas professional dashboard with the Go Live Now card"
                  className="w-full mask-[radial-gradient(90%_85%_at_50%_45%,black_55%,transparent_100%)]"
                  loading="lazy"
                />
                <p className="text-center font-serif text-[14px] italic text-white/60">
                  your dashboard — go live in one tap
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="reveal mx-auto mt-20 w-full max-w-4xl px-6 lg:mt-28 lg:px-8">
        <div className="bg-ruled pb-4">
          <span
            className="block font-serif text-7xl leading-none text-primary/25"
            aria-hidden
          >
            “
          </span>
          <blockquote className="-mt-7">
            <p className="max-w-3xl font-serif text-2xl font-medium italic leading-snug text-ink lg:text-[2.4rem] lg:leading-[1.3]">
              I opened a 100-seat cohort on a Tuesday. It filled by Friday, and
              I never had to chase a single payment.
            </p>
            <footer className="mt-8 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-teal to-[#5eead4] font-display text-[13px] font-bold text-white">
                KM
              </span>
              <span className="text-[14px]">
                <span className="block font-semibold text-ink">Kwesi M.</span>
                <span className="block text-[12px] text-ink-soft">
                  Product designer — Accra · ★★★★★
                </span>
              </span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto mt-20 w-full max-w-5xl px-6 lg:mt-28 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center shadow-2xl shadow-ink/20 lg:py-20">
          <div className="absolute inset-0 bg-grid" aria-hidden />
          <div
            className="absolute -bottom-36 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white lg:text-5xl">
              Ready{" "}
              <span className="font-serif font-medium italic text-primary-soft">
                when you are.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
              Create a free account in under a minute. No subscription — you pay
              per session through Monnify, and your money stays in escrow until
              class ends.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <span className="relative inline-flex">
                <Link
                  href="/signup?role=learner"
                  className="tap inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-7 text-[15px] font-semibold text-ink shadow-lg shadow-black/40 transition-all hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
                >
                  Create a free account <ArrowRight className="size-4" />
                </Link>
                <Lasso className="pointer-events-none absolute inset-0 size-full scale-x-110 scale-y-150 text-primary-soft/60" />
              </span>
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
        <p className="mt-5 font-serif text-[13px] italic text-ink-soft/80">
          live sessions on a shared canvas — from Lagos to Nairobi · © 2026
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
    <div className="flex items-start gap-3.5 border-t border-ink/8 py-6">
      <span className="mt-1 shrink-0 text-primary">{icon}</span>
      <div>
        <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          {desc}
        </p>
      </div>
    </div>
  );
}
