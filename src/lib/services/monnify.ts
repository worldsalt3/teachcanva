import "server-only";

/**
 * Monnify server-side helpers (auth + base URL).
 *
 * Monnify's REST API authenticates with a short-lived bearer token obtained
 * by Basic-auth'ing with the API key + secret key. Defaults to the sandbox
 * environment; set MONNIFY_BASE_URL=https://api.monnify.com to go live.
 */

export const monnifyBaseUrl =
  process.env.MONNIFY_BASE_URL ?? "https://sandbox.monnify.com";

export function isMonnifyServerConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY,
  );
}

/** Exchanges the API key + secret for a bearer access token (or null). */
export async function getMonnifyToken(): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_MONNIFY_API_KEY;
  const secret = process.env.MONNIFY_SECRET_KEY;
  if (!apiKey || !secret) return null;

  const res = await fetch(`${monnifyBaseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${secret}`).toString("base64")}`,
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.requestSuccessful) return null;
  return json?.responseBody?.accessToken ?? null;
}
