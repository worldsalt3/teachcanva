import { Suspense } from "react";
import { AuthGate } from "@/components/layout/auth-gate";
import { LiveRoom } from "./live-room";

export default async function LivePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <Suspense fallback={<div className="h-dvh bg-canvas" />}>
      <AuthGate />
      <LiveRoom sessionId={sessionId} />
    </Suspense>
  );
}
