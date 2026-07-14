import { notFound } from "next/navigation";
import { getTeacher } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { fetchTeacherById } from "@/lib/services/teachers-server";
import { AuthGate } from "@/components/layout/auth-gate";
import { BookingFlow } from "./booking-flow";

export default async function BookPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  const teacher = isSupabaseEnabled
    ? await fetchTeacherById(teacherId)
    : (getTeacher(teacherId) ?? (await fetchTeacherById(teacherId)));
  if (!teacher) notFound();
  return (
    <>
      <AuthGate />
      <BookingFlow teacher={teacher} />
    </>
  );
}
