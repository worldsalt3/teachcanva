import { teacherScheduled } from "@/lib/mock";
import { PrepareClass } from "./prepare-class";

export default async function PrepareClassPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = teacherScheduled.find((s) => s.id === sessionId);
  return (
    <PrepareClass
      sessionId={sessionId}
      topic={session?.topic ?? "Upcoming class"}
      counterpartName={session?.counterpartName ?? "your student"}
    />
  );
}
