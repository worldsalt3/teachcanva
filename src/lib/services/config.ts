/**
 * Central integration config.
 *
 * The app ships with stub providers so every flow (auth, payments, video)
 * works end-to-end with no external services. To go live, set the matching
 * environment variables and the service factories will pick up the real
 * provider without any page-level changes.
 */

export type VideoProviderName = "stub" | "livekit" | "daily";

export const integrations = {
  /** Supabase — auth + database backend. */
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
  /** Monnify — card/transfer payments, wallet top-ups and payouts (₦). */
  monnify: {
    apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY ?? "",
    contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE ?? "",
  },
  /** Realtime video for the live session room. */
  video: {
    provider:
      (process.env.NEXT_PUBLIC_VIDEO_PROVIDER as VideoProviderName) || "stub",
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "",
  },
} as const;

export const isSupabaseEnabled = Boolean(
  integrations.supabase.url && integrations.supabase.anonKey,
);

export const isMonnifyEnabled = Boolean(
  integrations.monnify.apiKey && integrations.monnify.contractCode,
);

export const isRealVideoEnabled =
  integrations.video.provider !== "stub" && Boolean(integrations.video.url);
