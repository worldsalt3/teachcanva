-- Streams booking inserts/updates to subscribed clients so a professional's
-- schedule refreshes the moment a learner books (no page reload). Row-level
-- security still applies per subscriber: teachers only receive events for
-- bookings addressed to their own listing (policy from 0007).
alter publication supabase_realtime add table public.bookings;
