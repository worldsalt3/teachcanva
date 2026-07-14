-- Every user gets BOTH wallets (student + teacher) so role switching never
-- hits a missing-wallet edge case (top-ups, payouts, escrow all assume the
-- row exists). Backfills existing users.

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
  code text := upper(substr(replace(new.id::text, '-', ''), 1, 8));
begin
  insert into public.profiles (id, role, name)
  values (new.id, new_role, new_name)
  on conflict (id) do nothing;

  insert into public.wallets (owner_id, role, referral_code)
  values
    (new.id, 'student', code),
    (new.id, 'teacher', code)
  on conflict (owner_id, role) do nothing;

  return new;
end;
$$;

-- Backfill: any profile missing one of the two wallets.
insert into public.wallets (owner_id, role, referral_code)
select p.id, r.role, upper(substr(replace(p.id::text, '-', ''), 1, 8))
from public.profiles p
cross join (values ('student'), ('teacher')) as r (role)
on conflict (owner_id, role) do nothing;
