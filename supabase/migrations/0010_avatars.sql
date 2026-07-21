-- Profile pictures: public `avatars` bucket + avatar_url on the public
-- teachers catalog (profiles RLS is own-read-only, so learner-facing cards
-- read the photo from the world-readable teachers row instead).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars: owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars: owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid());

alter table public.teachers
  add column if not exists avatar_url text;
