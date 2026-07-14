/**
 * Shared row → domain mapping for teachers. Kept free of "use client" so both
 * the browser repository and Server Components can import it.
 */
import type { Teacher } from "@/lib/mock/types";

export interface TeacherRow {
  id: string;
  name: string;
  title: string;
  subjects: string[];
  rating: number | string;
  review_count: number;
  sessions_count: number;
  hourly_rate: number;
  session_length_mins: number;
  is_live: boolean;
  is_pro: boolean;
  verified: boolean;
  next_slot_label: string | null;
  bio: string;
  tp_bonus_per_hour: number;
  cohort_capacity: number | null;
  expertise: string[];
  education: Teacher["education"];
  availability: Teacher["availability"];
  reviews: Teacher["reviews"];
}

export function toTeacher(r: TeacherRow): Teacher {
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    subjects: r.subjects ?? [],
    rating: Number(r.rating),
    reviewCount: r.review_count,
    sessionsCount: r.sessions_count,
    hourlyRate: r.hourly_rate,
    sessionLengthMins: r.session_length_mins,
    isLive: r.is_live,
    isPro: r.is_pro,
    verified: r.verified,
    nextSlotLabel: r.next_slot_label ?? undefined,
    bio: r.bio,
    education: r.education ?? [],
    expertise: r.expertise ?? [],
    tpBonusPerHour: r.tp_bonus_per_hour,
    cohortCapacity: r.cohort_capacity ?? 100,
    availability: r.availability ?? [],
    reviews: r.reviews ?? [],
  };
}

/** Postgres uuid — used to skip remote lookups for local/seed string ids. */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
