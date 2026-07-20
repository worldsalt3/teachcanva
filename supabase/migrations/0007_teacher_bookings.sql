-- 0007 — professionals can see sessions booked with them.
--
-- Bookings were only visible to the learner who created them (RLS
-- `auth.uid() = student_id`), so a session never appeared on the
-- professional's dashboard/schedule. Adds:
--   * student_name — denormalised learner display name (the row previously
--     only carried counterpart_name, i.e. the professional's own name)
--   * SELECT policy for the professional the booking is addressed to
--   * index on teacher_id for that lookup

alter table public.bookings
  add column if not exists student_name text not null default '';

-- Backfill learner names from profiles.
update public.bookings b
set student_name = p.name
from public.profiles p
where b.student_id = p.id
  and b.student_name = '';

-- Professionals may read bookings addressed to their listing.
drop policy if exists "bookings: teacher read" on public.bookings;
create policy "bookings: teacher read"
  on public.bookings for select
  using (
    teacher_id in (
      select id from public.teachers where profile_id = auth.uid()
    )
  );

create index if not exists bookings_teacher_idx on public.bookings (teacher_id);
