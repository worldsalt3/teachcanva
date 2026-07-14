-- TeachCanvas — v3 pivot: cohorts, waitlists, notifications, escrow and
-- Teaching Point levels. Additive migration on top of 0001_init.sql.

-- ─── profiles / teachers additions ──────────────────────────────────────────
-- Max seats a professional accepts in a cohort live session (FR-P01).
alter table public.teachers
  add column if not exists cohort_capacity int not null default 100;

-- ─── bookings: escrow + cancellation (FR-S07, FR-W02) ───────────────────────
alter table public.bookings
  add column if not exists amount int not null default 0,
  add column if not exists escrow_status text not null default 'none'
    check (escrow_status in ('none', 'held', 'released', 'refunded'));

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
    check (status in ('live', 'upcoming', 'completed', 'cancelled'));

-- ─── cohort_sessions (1:many live sessions, FR-S02/S04/D06) ─────────────────
create table if not exists public.cohort_sessions (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid references public.teachers (id) on delete set null,
  owner_id        uuid references public.profiles (id) on delete set null,
  title           text not null,
  topic           text not null default '',
  tag             text not null default '',
  date_label      text not null default '',
  time_label      text not null default '',
  duration_mins   int not null default 60,
  seat_limit      int not null default 100,
  price_per_seat  int not null default 0,
  status          text not null default 'scheduled'
                    check (status in ('scheduled', 'live', 'ended')),
  series_name     text,
  series_part     int,
  series_of       int,
  created_at      timestamptz not null default now()
);

alter table public.cohort_sessions enable row level security;

-- Open cohort sessions are world-readable so the Cohorts tab works pre-login.
create policy "cohort_sessions: public read"
  on public.cohort_sessions for select
  using (true);

create policy "cohort_sessions: owner writes"
  on public.cohort_sessions for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─── cohort_enrolments (seats + waitlist, FR-S02) ───────────────────────────
create table if not exists public.cohort_enrolments (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references public.cohort_sessions (id) on delete cascade,
  member_id   uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'enrolled'
                check (status in ('enrolled', 'waitlisted', 'cancelled')),
  amount_paid int not null default 0,
  escrow_status text not null default 'held'
                check (escrow_status in ('none', 'held', 'released', 'refunded')),
  created_at  timestamptz not null default now(),
  unique (cohort_id, member_id)
);

alter table public.cohort_enrolments enable row level security;

create policy "cohort_enrolments: member all"
  on public.cohort_enrolments for all
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- The hosting professional can see who enrolled.
create policy "cohort_enrolments: host read"
  on public.cohort_enrolments for select
  using (
    exists (
      select 1 from public.cohort_sessions c
      where c.id = cohort_id and c.owner_id = auth.uid()
    )
  );

create index if not exists cohort_enrolments_cohort_idx
  on public.cohort_enrolments (cohort_id);
create index if not exists cohort_enrolments_member_idx
  on public.cohort_enrolments (member_id);

-- Seats taken is derived, never trusted from the client.
create or replace view public.cohort_seats as
  select cohort_id, count(*)::int as seats_taken
  from public.cohort_enrolments
  where status = 'enrolled'
  group by cohort_id;

-- ─── notifications (FR-N01/N02/N03) ─────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  kind       text not null default 'system'
               check (kind in ('session', 'payment', 'tp', 'system')),
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: owner all"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- Realtime delivery for the in-app notification centre / Go Live alerts.
alter publication supabase_realtime add table public.notifications;
