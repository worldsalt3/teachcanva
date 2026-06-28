import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-surface-2 text-fg-muted">
        <WifiOff className="size-9" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-xs text-sm text-fg-muted">
        TeachCanvas needs a connection for live sessions. Check your network and
        try again — your cached pages are still available.
      </p>
      <Link
        href="/home"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white"
      >
        Back to Home
      </Link>
    </main>
  );
}
