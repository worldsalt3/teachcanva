# TeachCanvas

**Learn live. Teach live.** TeachCanvas is a mobile-first PWA where professionals teach live, interactive sessions on a shared canvas — 1:1 bookings or seat-limited cohorts — with escrow-backed wallet payments in Naira.

- **Learners** find professionals, book sessions or enrol in cohorts, pay from an in-app wallet (topped up via Monnify), and join live rooms with a synced whiteboard, slides, and chat.
- **Professionals** publish availability, get booked (schedule updates in realtime), teach on the live canvas, and get paid automatically — escrow is released to their earnings wallet the moment a session completes.

Built with Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (auth, Postgres, Realtime, Storage) · Monnify (payments) · LiveKit (optional video).

---

## Quick start (zero config — 2 minutes)

No accounts or keys needed. The app runs fully on in-memory stubs + localStorage:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You land signed-in with seeded data — every screen, flow, and interaction works (bookings, wallet, cohorts, live canvas, completion). Best viewed at a mobile viewport (DevTools device toolbar) or installed as a PWA.

> **Requirements:** Node 20.9+ and npm.

---

## Full setup (real backend — ~10 minutes)

Copy the env template, then enable each integration by filling its keys. Any subsystem without keys gracefully stays on stubs.

```bash
cp .env.example .env.local
```

### 1. Supabase — auth, database, realtime (core)

1. Create a free project at [supabase.com](https://supabase.com).
2. Put the **Project URL**, **anon key**, and **service_role key** (Project Settings → API) into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Apply the database migrations (tables, RLS, triggers, storage buckets, realtime):
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   _(No CLI? Paste each file in [supabase/migrations](supabase/migrations) into the dashboard SQL Editor, in order 0001 → 0008.)_
4. **Important for demos:** disable email confirmation so sign-ups are instant — Dashboard → Authentication → Sign In / Up → Email → turn off **Confirm email**.
5. Restart `npm run dev`. The app now gates behind real auth — sign up to continue.

### 2. Monnify — wallet top-ups, checkout, payouts (sandbox)

1. Grab sandbox credentials from [app.monnify.com/developer](https://app.monnify.com/developer).
2. Fill in:
   ```
   NEXT_PUBLIC_MONNIFY_API_KEY=MK_TEST_...
   NEXT_PUBLIC_MONNIFY_CONTRACT_CODE=...
   MONNIFY_SECRET_KEY=...
   MONNIFY_BASE_URL=https://sandbox.monnify.com
   MONNIFY_WALLET_ACCOUNT_NUMBER=...   # payout source for withdrawals
   ```
3. Wallet top-ups open the Monnify checkout modal; payments are verified **server-side** before the wallet is credited. Use Monnify's sandbox test cards (see their developer docs).

### 3. LiveKit — real video in the live room (optional)

```
NEXT_PUBLIC_VIDEO_PROVIDER=livekit
NEXT_PUBLIC_LIVEKIT_URL=wss://<your>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

Without these, the live room uses a polished stub (canvas, slides, and chat still sync in realtime through Supabase).

---

## Demo walkthrough (the 5-minute judge tour)

Use two browser profiles (or a normal + private window) side by side.

| Step | Who          | What to do                                                                                                            |
| ---- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1    | Professional | Sign up → pick **Professional**. A public listing is auto-created — you're instantly discoverable on Explore.         |
| 2    | Professional | Schedule → **Availability** → toggle days → save. Optionally **New cohort** to open a seat-limited group session.     |
| 3    | Learner      | Sign up → pick **Cohort Member** → Wallet → **Top up** with a Monnify sandbox card.                                   |
| 4    | Learner      | Explore → open the professional → **Book a Session** → pick a slot → pay from wallet (held in escrow).                |
| 5    | Professional | Watch the schedule update **in realtime** — no reload — with a "New session booked" notification.                     |
| 6    | Both         | **Join** the session from either side → same live room: draw on the shared canvas (syncs live), chat, present slides. |
| 7    | Professional | End the session → completion screen → **escrow is released** to the earnings wallet automatically.                    |
| 8    | Professional | Teach → Earnings → see the credited session → **Withdraw** (Monnify sandbox disbursement).                            |

Also worth showing: booking cancellation with automatic refund, cohort enrolment with waitlisting when seats run out, insufficient-balance guard with top-up prompt, the "Prepare class" slide builder, and installing the app as a PWA.

---

## Scripts

| Command         | What it does                             |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Dev server at localhost:3000 (Turbopack) |
| `npm run build` | Production build + TypeScript check      |
| `npm run lint`  | ESLint                                   |
| `npm start`     | Serve the production build               |

## Project structure

```
src/
  app/                  Routes (App Router)
    (student)/          Learner shell: home, explore, cohorts, wallet, profile
    teach/(workspace)/  Professional shell: dashboard, schedule, earnings, profile
    book/[teacherId]/   Booking flow (slots, escrow payment)
    live/[sessionId]/   Live room: canvas, slides, chat, video
    session/[id]/       Completion (escrow settlement) + replay
    api/                Payments (init/verify/withdraw), session completion, video tokens
  components/           UI primitives + feature components
  lib/
    services/           Integration seam: config, payments (Monnify), repository (Supabase), video
    store/              App-wide state (hydrates from Supabase or localStorage)
    supabase/           Browser/server/admin clients
supabase/migrations/    Schema: profiles, teachers, bookings, cohorts, wallets, RLS, realtime
```

## Architecture notes

- **Graceful integration seam** — every external service is optional and feature-flagged from env ([src/lib/services/config.ts](src/lib/services/config.ts)). Missing keys → deterministic stubs, never crashes.
- **Escrow lifecycle** — booking/enrolment holds funds → completion releases to the professional (server-side, idempotent) → cancellation refunds the learner.
- **Money safety** — wallet writes go through an atomic `wallet_apply` Postgres function (row-locked, balance-checked); payments are verified against Monnify server-side before crediting; payment/completion APIs are rate-limited.
- **Realtime everywhere** — chat, canvas strokes, and incoming bookings stream over Supabase Realtime.
- **Security** — RLS on every table, service-role key confined to server routes, no secrets in the client bundle.

## Troubleshooting

- **Build fails with a Google Fonts `module-not-found`** — a failed font fetch got cached: `rm -rf .next/cache && npm run build`.
- **`npm run build` conflicts with the dev server** — stop `npm run dev` first (both hold `.next`).
- **Sign-up stuck at "check your email"** — disable Confirm email in Supabase (Full setup, step 4).
- **Port 3000 busy** — `lsof -nP -iTCP:3000 -sTCP:LISTEN` to find the process.
