-- Denormalised host display name so the Cohorts tab renders without a join
-- against teachers (which stays empty until professionals are onboarded).
alter table public.cohort_sessions
  add column if not exists professional_name text not null default '';
