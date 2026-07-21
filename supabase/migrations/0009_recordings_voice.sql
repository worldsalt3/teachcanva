-- 0009 — session voice recordings: allow professionals to overwrite (upsert)
-- their voice track when a session is ended more than once.

create policy "recordings: owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recordings' and owner = auth.uid());
