import { teacherScheduled } from "@/lib/mock";
import { isSupabaseEnabled } from "@/lib/services/config";
import { AuthGate } from "@/components/layout/auth-gate";
import { PrepareClass } from "./prepare-class";

export default async function PrepareClassPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = isSupabaseEnabled
    ? undefined
    : teacherScheduled.find((s) => s.id === sessionId);
  return (
    <>
      <AuthGate />
      <PrepareClass
        sessionId={sessionId}
        topic={session?.topic ?? "Upcoming class"}
        counterpartName={session?.counterpartName ?? "your class"}
      />
    </>
  );
}
