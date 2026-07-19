-- Every professional gets a public.teachers catalog row automatically, so
-- they show up on the learners' Explore/search page as soon as they sign up.
-- Covers email signups (profiles insert via handle_new_user), Google OAuth
-- signups (role set on the profile by /auth/callback afterwards) and
-- backfills existing professionals.

-- One listing per profile.
create unique index if not exists teachers_profile_uidx
  on public.teachers (profile_id)
  where profile_id is not null;

create or replace function public.ensure_professional_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof_title text;
begin
  if new.role <> 'teacher' then
    return new;
  end if;

  -- Stated occupation from signup metadata (email signups only).
  select coalesce(u.raw_user_meta_data ->> 'profession', '')
    into prof_title
    from auth.users u
   where u.id = new.id;

  insert into public.teachers (profile_id, name, title)
  values (new.id, new.name, coalesce(prof_title, ''))
  on conflict (profile_id) where profile_id is not null
  do nothing;

  return new;
end;
$$;

drop trigger if exists on_profile_professional on public.profiles;
create trigger on_profile_professional
  after insert or update of role on public.profiles
  for each row execute function public.ensure_professional_listing();

-- Backfill: existing professionals without a catalog listing.
insert into public.teachers (profile_id, name, title)
select p.id, p.name, coalesce(u.raw_user_meta_data ->> 'profession', '')
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'teacher'
  and not exists (
    select 1 from public.teachers t where t.profile_id = p.id
  );
