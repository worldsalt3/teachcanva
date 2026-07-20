---
name: teachcanvas-setup
description: 'Set up, configure, and run the TeachCanvas project locally. Use when asked to: set up the project, install dependencies, configure .env.local (Supabase, Monnify, LiveKit), apply or push database migrations, start the dev server, run the demo, or fix setup errors (missing env, migration failures, font build errors, port conflicts). Covers zero-config stub mode and full-backend mode.'
argument-hint: 'e.g. "zero-config", "full backend", or a setup error message'
---

# TeachCanvas Setup

Gets the project from a fresh clone to a running app, in either of two modes:

- **Zero-config (stub) mode** — no keys needed; in-memory stubs + localStorage. Best for a first look.
- **Full-backend mode** — Supabase (auth/DB/realtime) + Monnify sandbox (payments) + optional LiveKit (video).

Ask the user which mode they want if it isn't obvious. Requirements: **Node 20.9+**.

## Procedure — zero-config mode

1. `npm install`
2. Ensure `.env.local` is absent or has no `NEXT_PUBLIC_SUPABASE_URL` set (any subsystem without keys stays stubbed).
3. `npm run dev` → verify http://localhost:3000 loads the landing page; the app is pre-authenticated with seeded data.

## Procedure — full-backend mode

1. `npm install` and `cp .env.example .env.local` (if not already present).
2. **Supabase** — the user must supply values from their dashboard (Project Settings → API); never invent keys:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Apply migrations (0001 → 0008, in [supabase/migrations](../../../supabase/migrations)):
     ```bash
     npx supabase login          # user completes the browser/code prompt in their terminal
     npx supabase link --project-ref <ref>
     npx supabase db push --yes
     ```
     When running as an agent, append `--agent no` to supabase commands (the CLI otherwise forces JSON output).
   - Remind the user to disable **Confirm email** (Supabase Dashboard → Authentication → Sign In / Up → Email) so demo sign-ups are instant.
3. **Monnify (sandbox)** — keys from https://app.monnify.com/developer:
   - `NEXT_PUBLIC_MONNIFY_API_KEY` (MK_TEST_…), `NEXT_PUBLIC_MONNIFY_CONTRACT_CODE`, `MONNIFY_SECRET_KEY`, `MONNIFY_BASE_URL=https://sandbox.monnify.com`, `MONNIFY_WALLET_ACCOUNT_NUMBER` (payout source).
4. **LiveKit (optional)** — `NEXT_PUBLIC_VIDEO_PROVIDER=livekit`, `NEXT_PUBLIC_LIVEKIT_URL` (wss://…), `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`. Skip freely; the live room stub still syncs canvas + chat via Supabase.
5. Restart the dev server after env changes (`npm run dev`); env is read at boot.

## Verification

1. `npm run lint` passes (ESLint is NOT run by the build).
2. `npm run build` passes (includes the TypeScript check). Stop the dev server first — both hold `.next`.
3. Full-backend smoke test: sign up as **Professional** in one browser profile and **Cohort Member** in another → learner tops up wallet (Monnify sandbox card) → books the professional → professional's Schedule updates in realtime → both Join the live room → End session → escrow lands in the professional's Earnings.
4. The demo script for judges lives in [README.md](../../../README.md) under "Demo walkthrough".

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails: `module-not-found` for `[next]/internal/font/google/inter_*.module.css` | A failed Google Fonts fetch is cached: `rm -rf .next/cache && npm run build` |
| Build hangs/conflicts while dev server runs | Kill the dev server first; both lock `.next` |
| Sign-up demands email confirmation | Disable Confirm email in Supabase Auth settings |
| `supabase db push` auth error | Token expired: `npx supabase login` again, then re-push |
| Port 3000 busy | `lsof -nP -iTCP:3000 -sTCP:LISTEN` and kill the PID, or `npm run dev -- -p 3001` |
| App shows login instead of seeded preview | Supabase keys are set, so stub mode is off — sign up, or clear the Supabase vars to return to stub mode |

## Facts to respect (do not "fix" these)

- Middleware is `src/proxy.ts` exporting `proxy()` — Next 16 convention; do NOT create `src/middleware.ts`.
- All env vars are optional by design; missing keys must fall back to stubs, never throw.
- Monnify amounts are Naira major units (no kobo ×100 conversion).
- `npm run lint` is the lint gate; `next build` only type-checks.
