import { AuthGate } from "@/components/layout/auth-gate";
import { RecordingPlayer } from "./recording-player";

export default async function RecordingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <AuthGate />
      <RecordingPlayer sessionId={id} />
    </>
  );
}
