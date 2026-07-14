"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a slide photo/clip to the public `slides` bucket and returns its
 * public URL. Returns `null` when Supabase isn't configured or the upload
 * fails, so the caller can keep the local data/object URL as a fallback.
 */
export async function uploadSlideMedia(
  file: Blob,
  sessionId: string,
  ext: string,
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const path = `${user.id}/${sessionId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("slides").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return null;

  return supabase.storage.from("slides").getPublicUrl(path).data.publicUrl;
}
