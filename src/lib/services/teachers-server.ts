/**
 * Server-side teacher lookup for detail routes. Remote rows use uuid ids, so
 * seed/mock ids short-circuit to null and the caller falls back to mocks.
 */
import { createClient } from "@/lib/supabase/server";
import type { Teacher } from "@/lib/mock/types";
import { toTeacher, UUID_RE, type TeacherRow } from "./teacher-mapper";

export async function fetchTeacherById(id: string): Promise<Teacher | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return toTeacher(data as TeacherRow);
}
