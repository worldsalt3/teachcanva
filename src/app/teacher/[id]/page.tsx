import { notFound } from "next/navigation";
import { getTeacher } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { fetchTeacherById } from "@/lib/services/teachers-server";
import { TeacherProfile } from "./teacher-profile";

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = isSupabaseEnabled
    ? await fetchTeacherById(id)
    : (getTeacher(id) ?? (await fetchTeacherById(id)));
  if (!teacher) notFound();
  return <TeacherProfile teacher={teacher} />;
}
