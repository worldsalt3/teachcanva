import { notFound } from "next/navigation";
import { getTeacher } from "@/lib/mock";
import { TeacherProfile } from "./teacher-profile";

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = getTeacher(id);
  if (!teacher) notFound();
  return <TeacherProfile teacher={teacher} />;
}
