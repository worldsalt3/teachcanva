import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  GraduationCap,
  LockKeyhole,
  PenLine,
  PlayCircle,
  Presentation,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Wallet,
  Zap,
} from "lucide-react";

const TOPIC_CHIPS = [
  "Coding",
  "Data",
  "Fintech",
  "Design",
  "Law",
  "STEM",
  "Product",
  "Marketing",
  "Accounting",
  "Public Speaking",
];

const STATS = [
  { value: "1:1", label: "& COHORT SESSIONS" },
  { value: "100%", label: "ESCROW PROTECTED" },
  { value: "LIVE", label: "SYNCED CANVAS" },
  { value: "4.8★", label: "AVERAGE RATING" },
];

/** Signature gradient CTA pill in TeachCanvas brand blues. */
const GRADIENT_PILL =
  "tap inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-linear-to-r from-primary to-[#6d5cff] px-7 text-[15px] font-bold text-white shadow-lg shadow-primary/30 transition-[filter,transform] hover:brightness-110 active:scale-[0.98]";

/** Secondary white pill. */
const WHITE_PILL =
  "tap inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#e2e7f6] bg-white px-7 text-[15px] font-bold text-ink shadow-md shadow-indigo-200/40 transition-[background,transform] hover:bg-[#f7f8fd] active:scale-[0.98]";

function Brand({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-[#3b82f6] to-[#7c5cff] text-white shadow-lg shadow-indigo-400/40">
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <rect x="5" y="6" width="14" height="12" rx="2.5" fill="white" />
          <path
            d="M7 15 C 10 11, 14 11, 17 8"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`font-display font-extrabold tracking-tight text-ink ${small ? "text-lg" : "text-xl"}`}
      >
        Teach<span className="text-[#3b82f6]">Canvas</span>
      </span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className="landing relative flex min-h-dvh flex-col overflow-hidden text-ink">
      {/* ── Ambient decor ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-184 bg-grid-ink mask-[linear-gradient(to_bottom,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-2xl -translate-x-1/2 rounded-full bg-[#c7d5ff]/60 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-112 size-80 rounded-full bg-[#b8f0e6]/50 blur-[110px]"
      />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-[#e3e8f6]/80 bg-white/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Link href="/" className="tap">
            <Brand />
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="tap hidden rounded-full px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup?role=learner"
              className="tap inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-[#6d5cff] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110"
            >
              Get Started <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pt-16">
        <section className="px-6 pt-10 text-center lg:px-0 lg:pt-0 lg:text-left">
          <span className="fade-up inline-flex items-center gap-2 rounded-full border border-[#9fd8cf] bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0d9488] backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-teal" />
            Live Knowledge · Africa
          </span>
          <h1
            className="fade-up mt-5 font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-ink lg:text-[4.2rem] lg:leading-[1.04]"
            style={{ animationDelay: "100ms" }}
          >
            Learn Live from Real{" "}
            <span className="bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
              Professionals.
            </span>
          </h1>
          <p
            className="fade-up mx-auto mt-5 max-w-80 text-[15px] leading-relaxed text-ink-soft lg:mx-0 lg:max-w-md lg:text-lg lg:leading-relaxed"
            style={{ animationDelay: "200ms" }}
          >
            One secure platform to join live cohorts, book 1:1 sessions with
            verified professionals, and learn on a real-time teaching canvas —
            all in your pocket.
          </p>

          <div
            className="fade-up mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:justify-start"
            style={{ animationDelay: "300ms" }}
          >
            <Link href="/signup?role=learner" className={GRADIENT_PILL}>
              Start Learning Free <ArrowRight className="size-5" />
            </Link>
            <Link href="/signup?role=professional" className={WHITE_PILL}>
              <Presentation className="size-5 text-[#3b82f6]" /> Become a
              Professional
            </Link>
          </div>

          <div
            className="fade-up mt-8 flex items-center justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex -space-x-2.5">
              {["AO", "TK", "IB", "KM"].map((initials, i) => (
                <span key={initials} className={cnAvatar(i)}>
                  {initials}
                </span>
              ))}
            </div>
            <div className="text-left">
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-3 fill-gold text-gold" />
                ))}
              </span>
              <p className="mt-1 text-[12px] leading-tight text-ink-soft">
                Trusted by early cohorts across Africa
              </p>
            </div>
          </div>
        </section>

        {/* ── Hero visual: live session mock ── */}
        <section
          className="fade-up relative mt-12 px-6 lg:mt-0 lg:px-0"
          style={{ animationDelay: "250ms" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-10 bottom-0 rounded-full bg-[#a5bdff]/50 blur-3xl"
          />
          <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-indigo-400/30 transition-transform duration-500 lg:mx-0 lg:max-w-none lg:rotate-[1.5deg] lg:justify-self-end lg:hover:rotate-0">
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
                <path
                  d="M24 118 C 80 40, 128 132, 176 66 S 268 96, 300 38"
                  stroke="#7da2ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M30 50 L 92 50"
                  stroke="#14b8a6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="176" cy="66" r="5" fill="#f5b417" />
              </svg>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75 backdrop-blur">
                <PenLine className="size-3 text-[#2dd4bf]" /> Canvas synced in
                real time
              </span>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75 backdrop-blur">
                <UsersRound className="size-3 text-primary-soft" /> 132 learners
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

          {/* Floating proof pills (desktop) */}
          <div className="float-slow absolute -left-4 top-14 hidden items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-indigo-200/60 lg:flex">
            <span className="grid size-9 place-items-center rounded-xl bg-[#e4e9ff] text-[#4f6ef7]">
              <CalendarCheck className="size-4.5" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink">Session booked</p>
              <p className="text-[11px] text-ink-soft">MON 21 · 04:00 PM</p>
            </div>
          </div>
          <div
            className="float-slow absolute -right-2 bottom-16 hidden items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-indigo-200/60 lg:flex"
            style={{ animationDelay: "-2.6s" }}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#dff5f2] text-[#0d9488]">
              <ShieldCheck className="size-4.5" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink">Escrow protected</p>
              <p className="text-[11px] text-ink-soft">Released after class</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Topic chips marquee ── */}
      <section
        className="mt-14 overflow-hidden py-2 lg:mt-20 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        aria-label="Popular topics"
      >
        <div className="marquee flex w-max gap-2.5">
          {[...TOPIC_CHIPS, ...TOPIC_CHIPS].map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e2e7f6] bg-white px-4 py-2 text-[13px] font-semibold text-ink-soft shadow-sm shadow-indigo-100"
            >
              <span className="size-1 rounded-full bg-[#3b82f6]/60" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="mx-auto mt-10 w-full max-w-6xl px-6 lg:mt-14 lg:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-200/40 md:grid-cols-4 md:divide-x md:divide-[#eef0f9]">
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-6 text-center lg:py-8">
              <p className="bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text font-display text-3xl font-extrabold text-transparent">
                {s.value}
              </p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core features ── */}
      <section className="mx-auto mt-14 w-full max-w-6xl px-6 lg:mt-24 lg:px-8">
        <SectionHeading
          eyebrow="Core Features"
          title={
            <>
              Everything You Need.{" "}
              <span className="bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                One Live Canvas.
              </span>
            </>
          }
          sub="Join, annotate, replay and earn — every session runs on a synced teaching canvas built for real-time learning."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          <FeatureCard
            tile="bg-[#ffe9e3] text-[#ea580c]"
            icon={<Radio className="size-5" />}
            title="Live Cohort Sessions"
            desc="Enrol in seat-limited live classes with professionals — waitlists, reminders and go-live alerts included."
          />
          <FeatureCard
            tile="bg-[#e4e9ff] text-[#4f6ef7]"
            icon={<CalendarCheck className="size-5" />}
            title="1:1 Bookings"
            desc="Pick a professional, choose a time that works, and get a private live session on your schedule."
          />
          <FeatureCard
            tile="bg-[#dff5f2] text-[#0d9488]"
            icon={<PenLine className="size-5" />}
            title="Synced Teaching Canvas"
            desc="Watch every stroke as it happens. Professionals annotate over slides, photos and video in real time."
          />
          <FeatureCard
            tile="bg-[#e3f6e9] text-[#16a34a]"
            icon={<LockKeyhole className="size-5" />}
            title="Escrow-Protected Wallet"
            desc="Your money is held safely until the session ends — cancel anytime before and get an instant refund."
          />
          <FeatureCard
            tile="bg-[#fff3d6] text-[#b45309]"
            icon={<PlayCircle className="size-5" />}
            title="Session Replays"
            desc="Missed something? Rewatch completed sessions with slide chapters whenever you like."
          />
          <FeatureCard
            tile="bg-[#eae4ff] text-[#7c3aed]"
            icon={<Sparkles className="size-5" />}
            title="Learning Points"
            desc="Earn verified points for every session you complete and build a track record that means something."
          />
        </div>
      </section>

      {/* ── For professionals ── */}
      <section className="mx-auto mt-14 w-full max-w-6xl px-6 lg:mt-24 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-[#101b3d] to-[#0a1128] p-6 shadow-2xl shadow-indigo-300/50 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#2dd4bf]/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-[#3b82f6]/20 blur-3xl"
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#5eead4]">
            For Professionals
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white lg:text-4xl">
            Monetize Your Expertise
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/60 lg:text-base">
            Host paid live cohorts and 1:1 sessions, prepare classes with a
            slide builder, and get paid straight to your wallet.
          </p>
          <ul className="mt-5 space-y-3 lg:grid lg:max-w-3xl lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {[
              "Set your availability days and hourly rate",
              "Open cohort enrolment with seat limits",
              "Earn Teaching Points and level up to Platinum",
              "Withdraw earnings to your bank in taps",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] text-white/90"
              >
                <BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-[#2dd4bf]" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup?role=professional"
            className={`${GRADIENT_PILL} mt-7 lg:mt-9`}
          >
            Start Teaching <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* ── Why TeachCanvas ── */}
      <section className="mx-auto mt-14 w-full max-w-6xl px-6 lg:mt-24 lg:px-8">
        <SectionHeading
          eyebrow="Why TeachCanvas"
          title="Smart, Secure, Always Available"
          sub="Built for everyday learners and growing professionals — clean, fast, and always in your pocket."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-3 lg:mt-10">
          <FeatureCard
            tile="bg-[#fff3d6] text-[#b45309]"
            icon={<Zap className="size-5" />}
            title="Easy to Set Up"
            desc="Your account is ready in two simple steps — sign up, pick your interests, and join your first session in minutes."
          />
          <FeatureCard
            tile="bg-[#e3f6e9] text-[#16a34a]"
            icon={<ShieldCheck className="size-5" />}
            title="Secure Payments"
            desc="Every transaction is escrow-protected until your session completes — your money stays safe."
          />
          <FeatureCard
            tile="bg-[#e4e9ff] text-[#4f6ef7]"
            icon={<GraduationCap className="size-5" />}
            title="Verified Professionals"
            desc="Learn from vetted experts with real reviews, ratings and session track records."
          />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto mt-14 w-full max-w-6xl px-6 lg:mt-24 lg:px-8">
        <SectionHeading
          eyebrow="Loved by Learners"
          title="Real Sessions. Real Results."
          sub="From first-time learners to working professionals levelling up — here's what live learning feels like."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-3 lg:mt-10">
          <TestimonialCard
            quote="The live canvas changed everything — I watched every step of the solution as it happened, then replayed it before my exam."
            name="Chiamaka E."
            role="Engineering student, Lagos"
            initials="CE"
          />
          <TestimonialCard
            quote="I booked a 1:1 with a chartered accountant on Tuesday and passed my certification mock that weekend. Worth every naira."
            name="Tobi A."
            role="Finance analyst, Abuja"
            initials="TA"
          />
          <TestimonialCard
            quote="As a professional, I opened a 100-seat cohort and it filled in days. Escrow means I never chase payments."
            name="Kwesi M."
            role="Product designer & mentor, Accra"
            initials="KM"
          />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto mt-14 w-full max-w-3xl px-6 lg:mt-24">
        <div className="relative overflow-hidden rounded-4xl bg-white p-8 text-center shadow-2xl shadow-indigo-200/60 lg:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-[#c7d5ff]/70 blur-3xl"
          />
          <h2 className="relative font-display text-[1.7rem] font-extrabold leading-tight text-ink lg:text-4xl">
            Learn live.{" "}
            <span className="bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
              Teach live.
            </span>
          </h2>
          <p className="relative mt-3 text-[14px] text-ink-soft lg:text-base">
            Create your free account and take your first live session today.
          </p>
          <div className="relative mx-auto mt-7 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/signup?role=learner" className={GRADIENT_PILL}>
              Get Started Free <ArrowRight className="size-5" />
            </Link>
            <Link href="/login" className={WHITE_PILL}>
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto mt-14 w-full max-w-6xl border-t border-[#dfe4f4] px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-center lg:mt-20 lg:pt-10">
        <Link href="/" className="tap inline-block">
          <Brand small />
        </Link>
        <p className="mx-auto mt-2 max-w-72 text-[12px] leading-relaxed text-ink-soft/80">
          Live knowledge transfer for Africa — one synced canvas for every way
          you learn and teach.
        </p>
        <nav className="mt-5 flex items-center justify-center gap-5 text-[12px] font-semibold text-ink-soft">
          <Link href="/login" className="transition-colors hover:text-ink">
            Sign in
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
            Become a Professional
          </Link>
        </nav>
        <p className="mt-5 text-[11px] text-ink-soft/60">
          © 2026 TeachCanvas · Made with ♥ in Africa
        </p>
      </footer>
    </main>
  );
}

const AVATAR_TINTS = [
  "from-[#3b6fe0] to-[#1d4ed8]",
  "from-[#14b8a6] to-[#0f766e]",
  "from-[#f5b417] to-[#b45309]",
  "from-[#7c5cff] to-[#4c1d95]",
];

function cnAvatar(i: number): string {
  return `grid size-8 place-items-center rounded-full bg-linear-to-br ${AVATAR_TINTS[i % AVATAR_TINTS.length]} text-[10px] font-bold text-white ring-2 ring-white`;
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="text-center">
      <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0d9488]">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink lg:text-[2.6rem]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-80 text-[14px] leading-relaxed text-ink-soft lg:max-w-xl lg:text-base">
        {sub}
      </p>
    </div>
  );
}

function FeatureCard({
  tile,
  icon,
  title,
  desc,
}: {
  tile: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-indigo-200/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60">
      <span
        className={`grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${tile}`}
      >
        {icon}
      </span>
      <h3 className="mt-4 font-display text-[17px] font-bold text-ink">
        {title}
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
        {desc}
      </p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  initials,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <figure className="flex flex-col rounded-3xl bg-white p-6 shadow-lg shadow-indigo-200/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60">
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="size-3.5 fill-gold text-gold" />
        ))}
      </span>
      <blockquote className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full bg-[#e4e9ff] text-[11px] font-bold text-[#4f6ef7]">
          {initials}
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">{name}</p>
          <p className="text-[11px] text-ink-soft">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
