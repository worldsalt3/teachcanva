import {
  teachers,
  recommendedTeacherIds,
  liveNow,
  cohortSessions,
} from "./data";
import type { CohortSession, Teacher } from "./types";

export * from "./types";
export * from "./data";

export function getTeacher(id: string): Teacher | undefined {
  return teachers.find((t) => t.id === id);
}

export function getTeachers(): Teacher[] {
  return teachers;
}

export function getLiveTeachers(): Teacher[] {
  return teachers.filter((t) => t.isLive);
}

export function getRecommendedTeachers(): Teacher[] {
  return recommendedTeacherIds
    .map((id) => teachers.find((t) => t.id === id))
    .filter((t): t is Teacher => Boolean(t));
}

export function getLiveNow() {
  return liveNow;
}

export function getCohortSessions(): CohortSession[] {
  return cohortSessions;
}

export function getCohortSession(id: string): CohortSession | undefined {
  return cohortSessions.find((c) => c.id === id);
}
