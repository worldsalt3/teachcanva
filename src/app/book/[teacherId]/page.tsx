import { notFound } from "next/navigation";
import { getTeacher } from "@/lib/mock";
import { BookingFlow } from "./booking-flow";

export default async function BookPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  const teacher = getTeacher(teacherId);
  if (!teacher) notFound();
  return <BookingFlow teacher={teacher} />;
}
