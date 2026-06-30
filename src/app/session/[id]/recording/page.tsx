import { RecordingPlayer } from "./recording-player";

export default async function RecordingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecordingPlayer sessionId={id} />;
}
