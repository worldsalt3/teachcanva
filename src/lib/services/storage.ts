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

/**
 * Uploads the voice track recorded during a live session to the private
 * `recordings` bucket (played back via signed URLs from
 * /api/sessions/recording). Ending the same session again overwrites the
 * previous track. Returns false when Supabase is off or the upload fails.
 */
export async function uploadSessionVoice(
  blob: Blob,
  sessionId: string,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.storage
    .from("recordings")
    .upload(`${sessionId}/voice`, blob, {
      contentType: blob.type || "audio/webm",
      upsert: true,
    });
  return !error;
}

// ─── profile pictures ────────────────────────────────────────────────────────

const PENDING_AVATAR_KEY = "teachcanvas:pending-avatar";
const AVATAR_SIZE = 512;

/**
 * Downscales an image to a 512×512 center-cropped JPEG data URL — small
 * enough to stash in localStorage or persist directly in stub mode.
 */
export async function blobToAvatarDataUrl(file: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

/**
 * Stashes a signup profile photo (data URL) until the user has a session —
 * uploaded by the store on the first successful backend load, which also
 * covers email-confirmation and OAuth signups.
 */
export function stashPendingAvatar(dataUrl: string): void {
  try {
    localStorage.setItem(PENDING_AVATAR_KEY, dataUrl);
  } catch {
    // quota/private mode — the user can still add a photo in Settings
  }
}

export function readPendingAvatar(): string | null {
  try {
    return localStorage.getItem(PENDING_AVATAR_KEY);
  } catch {
    return null;
  }
}

export function clearPendingAvatar(): void {
  try {
    localStorage.removeItem(PENDING_AVATAR_KEY);
  } catch {
    // ignore
  }
}

/**
 * Uploads a profile picture to the public `avatars` bucket (one file per
 * user, overwritten on change) and returns a cache-busted public URL.
 * Accepts a raw file/blob or an already-downscaled data URL.
 */
export async function uploadAvatar(
  source: Blob | string,
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let blob: Blob;
  if (typeof source === "string") {
    try {
      blob = await (await fetch(source)).blob();
    } catch {
      return null;
    }
  } else {
    const dataUrl = await blobToAvatarDataUrl(source);
    if (!dataUrl) return null;
    blob = await (await fetch(dataUrl)).blob();
  }

  const path = `${user.id}/avatar.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, blob, {
    cacheControl: "3600",
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) return null;

  const { publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(path).data;
  // Same path on every change → bust caches so the new photo shows at once.
  return `${publicUrl}?v=${Date.now()}`;
}
