import { Suspense } from "react";
import { liveSession } from "@/lib/mock";
import { LiveRoom } from "./live-room";

export default function LivePage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-canvas" />}>
      <LiveRoom session={liveSession} />
    </Suspense>
  );
}
