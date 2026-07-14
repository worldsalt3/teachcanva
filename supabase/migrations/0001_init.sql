-- TeachCanvas — initial schema, row-level security and storage.
--
-- Run against a fresh Supabase project:
--   supabase db reset          (local dev)
--   or paste into the SQL editor (hosted project).
--
-- Every table is protected by RLS. Auth is Supabase Auth (auth.users); each
-- user gets a public.profiles row + a wallet via the handle_new_user trigger.

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'student' check (role in ('student', 'teacher')),
  name       text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── teachers (public catalog) ──────────────────────────────────────────────
create table if not exists public.teachers (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid references public.profiles (id) on delete set null,
  name               text not null,
  title              text not null default '',
  subjects           text[] not null default '{}',
  rating             numeric(3, 2) not null default 0,
  review_count       int not null default 0,
  sessions_count     int not null default 0,
  hourly_rate        int not null default 0,
  session_length_mins int not null default 60,
  is_live            boolean not null default false,
  is_pro             boolean not null default false,
  verified           boolean not null default false,
  next_slot_label    text,
  bio                text not null default '',
  tp_bonus_per_hour  int not null default 0,
  expertise          text[] not null default '{}',
  education          jsonb not null default '[]',
  availability       jsonb not null default '[]',
  reviews            jsonb not null default '[]',
  created_at         timestamptz not null default now()
);

alter table public.teachers enable row level security;

-- Catalog is world-readable (including anon) so Explore works pre-login.
create policy "teachers: public read"
  on public.teachers for select
  using (true);

create policy "teachers: owner writes"
  on public.teachers for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ─── bookings (student sessions) ────────────────────────────────────────────
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles (id) on delete cascade,
  teacher_id      uuid references public.teachers (id) on delete set null,
  counterpart_name text not null default '',
  subject         text not null default '',
  topic           text not null default '',
  date_label      text not null default '',
  time_label      text not null default '',
  duration_mins   int not null default 60,
  status          text not null default 'upcoming'
                    check (status in ('live', 'upcoming', 'completed')),
  countdown       text,
  replay          boolean not null default false,
  rating          numeric(3, 2),
  created_at      timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "bookings: owner all"
  on public.bookings for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create index if not exists bookings_student_idx on public.bookings (student_id);

-- ─── slides (prepared presentation) ─────────────────────────────────────────
create table if not exists public.slides (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null,
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  position   int not null default 0,
  kind       text not null default 'text' check (kind in ('text', 'image', 'video')),
  title      text not null default '',
  body       text not null default '',
  src        text,
  created_at timestamptz not null default now()
);

alter table public.slides enable row level security;

-- Any signed-in participant can read a session's slides (shown on the board);
-- only the owner can add, edit or remove them.
create policy "slides: authenticated read"
  on public.slides for select
  to authenticated
  using (true);

create policy "slides: owner write"
  on public.slides for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "slides: owner modify"
  on public.slides for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "slides: owner delete"
  on public.slides for delete
  to authenticated
  using (auth.uid() = owner_id);

create index if not exists slides_session_idx on public.slides (session_id, position);

-- ─── chat_messages ──────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  text        text not null,
  created_at  timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat: authenticated read"
  on public.chat_messages for select
  to authenticated
  using (true);

create policy "chat: author insert"
  on public.chat_messages for insert
  to authenticated
  with check (auth.uid() = author_id);

create index if not exists chat_session_idx on public.chat_messages (session_id, created_at);

-- ─── wallets + transactions ─────────────────────────────────────────────────
create table if not exists public.wallets (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles (id) on delete cascade,
  role              text not null check (role in ('student', 'teacher')),
  balance           bigint not null default 0,
  pending_payouts   bigint not null default 0,
  lifetime_earnings bigint not null default 0,
  tp_balance        bigint not null default 0,
  referral_code     text not null default '',
  referral_reward   int not null default 0,
  updated_at        timestamptz not null default now(),
  unique (owner_id, role)
);

alter table public.wallets enable row level security;

create policy "wallets: owner all"
  on public.wallets for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.wallet_transactions (
  id         uuid primary key default gen_random_uuid(),
  wallet_id  uuid not null references public.wallets (id) on delete cascade,
  title      text not null,
  subtitle   text not null default '',
  amount     bigint not null,
  direction  text not null check (direction in ('in', 'out')),
  status     text not null default 'completed'
               check (status in ('completed', 'pending', 'sent')),
  reference  text,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "wallet_tx: owner all"
  on public.wallet_transactions for all
  using (
    exists (
      select 1 from public.wallets w
      where w.id = wallet_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.wallets w
      where w.id = wallet_id and w.owner_id = auth.uid()
    )
  );

-- ─── payments (Paystack charges) ────────────────────────────────────────────
create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references public.profiles (id) on delete set null,
  reference  text not null unique,
  amount     bigint not null,
  status     text not null default 'pending'
               check (status in ('pending', 'success', 'failed')),
  channel    text,
  purpose    text,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now(),
  paid_at    timestamptz
);

alter table public.payments enable row level security;

create policy "payments: owner read"
  on public.payments for select
  using (auth.uid() = owner_id);

create policy "payments: owner insert"
  on public.payments for insert
  with check (auth.uid() = owner_id);

-- ─── new-user trigger: profile + wallet ─────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  new_name text := coalesce(
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, role, name)
  values (new.id, new_role, new_name)
  on conflict (id) do nothing;

  insert into public.wallets (owner_id, role, referral_code)
  values (new.id, new_role, upper(substr(replace(new.id::text, '-', ''), 1, 8)))
  on conflict (owner_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Realtime ───────────────────────────────────────────────────────────────
-- Broadcast chat inserts to subscribed clients in the live room.
alter publication supabase_realtime add table public.chat_messages;

-- ─── Storage buckets ────────────────────────────────────────────────────────
-- slides: public read (fast board rendering), authenticated write.
-- recordings: private (served via signed URLs).
insert into storage.buckets (id, name, public)
values ('slides', 'slides', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "slides: public read"
  on storage.objects for select
  using (bucket_id = 'slides');

create policy "slides: owner upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'slides' and owner = auth.uid());

create policy "slides: owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'slides' and owner = auth.uid());

create policy "slides: owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'slides' and owner = auth.uid());

create policy "recordings: owner read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'recordings' and owner = auth.uid());

create policy "recordings: owner write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recordings' and owner = auth.uid());
