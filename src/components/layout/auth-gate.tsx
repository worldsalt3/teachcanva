"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-provider";

/**
 * Client-side auth gate: once the store has hydrated, redirects
 * unauthenticated visitors to the login flow. Renders nothing.
 */
export function AuthGate() {
  const router = useRouter();
  const { hydrated, authenticated } = useApp();

  useEffect(() => {
    if (hydrated && !authenticated) {
      router.replace("/login");
    }
  }, [hydrated, authenticated, router]);

  return null;
}
