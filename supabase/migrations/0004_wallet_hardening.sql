-- Money-movement hardening + professional applications.
--
-- Before this migration, clients updated wallet balances directly (RLS only
-- checked ownership, not amounts). Now:
--   • balance mutations go through an atomic SECURITY DEFINER function with
--     row locking and an insufficient-funds check;
--   • clients lose direct UPDATE/INSERT on wallets and wallet_transactions
--     (reads stay owner-scoped; credits from card top-ups happen server-side
--     via the service role in /api/payments/verify).

-- ─── atomic wallet mutation ──────────────────────────────────────────────────
create or replace function public.wallet_apply(
  p_role      text,
  p_title     text,
  p_subtitle  text,
  p_amount    bigint,
  p_direction text,
  p_status    text default 'completed',
  p_reference text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_role not in ('student', 'teacher') then
    raise exception 'invalid role';
  end if;
  if p_direction not in ('in', 'out') then
    raise exception 'invalid direction';
  end if;
  if p_amount < 0 then
    raise exception 'invalid amount';
  end if;

  select * into w
  from public.wallets
  where owner_id = auth.uid() and role = p_role
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  if p_direction = 'out' and w.balance < p_amount then
    raise exception 'insufficient funds';
  end if;

  update public.wallets
  set balance = balance + case when p_direction = 'in' then p_amount else -p_amount end,
      lifetime_earnings = lifetime_earnings
        + case when p_direction = 'in' then p_amount else 0 end,
      updated_at = now()
  where id = w.id;

  insert into public.wallet_transactions
    (wallet_id, title, subtitle, amount, direction, status, reference)
  values
    (w.id, p_title, p_subtitle, p_amount, p_direction, p_status, p_reference);
end;
$$;

revoke all on function public.wallet_apply from public;
grant execute on function public.wallet_apply to authenticated;

-- ─── lock down direct writes ─────────────────────────────────────────────────
drop policy if exists "wallets: owner all" on public.wallets;
create policy "wallets: owner read"
  on public.wallets for select
  using (auth.uid() = owner_id);

drop policy if exists "wallet_tx: owner all" on public.wallet_transactions;
create policy "wallet_tx: owner read"
  on public.wallet_transactions for select
  using (
    exists (
      select 1 from public.wallets w
      where w.id = wallet_id and w.owner_id = auth.uid()
    )
  );

-- ─── professional applications (teach/apply) ────────────────────────────────
create table if not exists public.teacher_applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  full_name   text not null,
  email       text not null,
  subjects    text[] not null default '{}',
  experience  text not null default '',
  bio         text not null default '',
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

alter table public.teacher_applications enable row level security;

-- Applicants can be pre-signup, so anonymous inserts are allowed (the API is
-- rate limited); reading/updating is reserved for the service role.
create policy "teacher_applications: public insert"
  on public.teacher_applications for insert
  with check (true);

create policy "teacher_applications: own read"
  on public.teacher_applications for select
  using (auth.uid() = user_id);
