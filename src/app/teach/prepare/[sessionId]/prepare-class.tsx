"use client";

import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Presentation,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useApp } from "@/lib/store/app-provider";
import type { Slide, SlideKind } from "@/lib/services/types";
import { isSupabaseEnabled } from "@/lib/services/config";
import { uploadSlideMedia } from "@/lib/services/storage";

function blankSlide(kind: SlideKind = "text"): Slide {
  return {
    id: `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    title: "",
    body: "",
  };
}

// Downscale a picked photo to a JPEG blob (longest edge <= 1400px) so it's
// cheap to upload/store, whether it goes to Supabase Storage or a data URL.
function downscaleImageToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error("no-2d-context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("encode-failed"))),
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-load-failed"));
    };
    img.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

export function PrepareClass({
  sessionId,
  topic,
  counterpartName,
}: {
  sessionId: string;
  topic: string;
  counterpartName: string;
}) {
  const { slides: allSlides, saveSlides, hydrated } = useApp();
  const stored = allSlides[sessionId];

  const [slides, setSlides] = useState<Slide[]>(stored ?? []);
  const [seeded, setSeeded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Seed from persisted slides once the store has hydrated from storage.
  if (hydrated && !seeded) {
    setSeeded(true);
    if (stored && stored.length) setSlides(stored);
  }

  const fireToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const addText = () => setSlides((s) => [...s, blankSlide("text")]);

  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const blob = await downscaleImageToBlob(file);
      const uploaded = isSupabaseEnabled
        ? await uploadSlideMedia(blob, sessionId, "jpg")
        : null;
      const src = uploaded ?? (await blobToDataUrl(blob));
      setSlides((s) => [...s, { ...blankSlide("image"), src }]);
    } catch {
      fireToast("Couldn't load that image");
    }
  };

  const onVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = file.name.split(".").pop() || "mp4";
    const uploaded = isSupabaseEnabled
      ? await uploadSlideMedia(file, sessionId, ext)
      : null;
    const src = uploaded ?? URL.createObjectURL(file);
    setSlides((s) => [...s, { ...blankSlide("video"), src }]);
  };

  const update = (id: string, patch: Partial<Slide>) =>
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)));

  const remove = (id: string) =>
    setSlides((s) => s.filter((sl) => sl.id !== id));

  const move = (index: number, dir: -1 | 1) =>
    setSlides((s) => {
      const j = index + dir;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const save = () => {
    const cleaned = slides.map((s) => ({
      ...s,
      title: s.title.trim(),
      body: s.body.trim(),
    }));
    saveSlides(sessionId, cleaned);
    setSlides(cleaned);
    fireToast(
      cleaned.length === 0
        ? "Slides cleared"
        : `${cleaned.length} slide${cleaned.length === 1 ? "" : "s"} saved`,
    );
  };

  const addButtons = (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="neutral" size="sm" fullWidth onClick={addText}>
        <Type className="size-4" /> Text
      </Button>
      <Button
        variant="neutral"
        size="sm"
        fullWidth
        onClick={() => imageInputRef.current?.click()}
      >
        <ImagePlus className="size-4" /> Photo
      </Button>
      <Button
        variant="neutral"
        size="sm"
        fullWidth
        onClick={() => videoInputRef.current?.click()}
      >
        <Video className="size-4" /> Video
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader bordered>
        <div className="flex w-full items-center gap-2">
          <BackButton className="-ml-2" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold leading-tight text-fg">
              Prepare class
            </h1>
            <p className="truncate text-[12px] text-fg-muted">{topic}</p>
          </div>
          {slides.length > 0 && (
            <span className="ml-auto shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[12px] font-semibold text-primary-soft">
              {slides.length} slide{slides.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </AppHeader>

      {slides.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-surface text-fg-faint">
            <Presentation className="size-7" />
          </span>
          <p className="mt-4 font-semibold text-fg">Build your presentation</p>
          <p className="mt-1 text-[13px] text-fg-muted">
            Add text slides, or snap a photo of your handwritten notes and
            upload it to explain live with {counterpartName}.
          </p>
          <div className="mt-5 w-full max-w-xs">{addButtons}</div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 px-5 py-4">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="rounded-card border border-border bg-surface p-3.5"
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-elevated text-[12px] font-bold text-fg-muted">
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold text-fg">
                  Slide {i + 1}
                </span>
                {slide.kind !== "text" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                    {slide.kind === "image" ? (
                      <ImagePlus className="size-3" />
                    ) : (
                      <Video className="size-3" />
                    )}
                    {slide.kind === "image" ? "Photo" : "Video"}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Move slide up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="tap grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronUp className="size-4.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move slide down"
                    disabled={i === slides.length - 1}
                    onClick={() => move(i, 1)}
                    className="tap grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronDown className="size-4.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete slide"
                    onClick={() => remove(slide.id)}
                    className="tap grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-danger/15 hover:text-danger"
                  >
                    <Trash2 className="size-4.5" />
                  </button>
                </div>
              </div>

              {slide.kind === "text" ? (
                <>
                  <Input
                    placeholder="Slide title (e.g. Topic: Quadratics)"
                    value={slide.title}
                    onChange={(e) =>
                      update(slide.id, { title: e.target.value })
                    }
                  />
                  <Textarea
                    className="mt-2.5"
                    rows={2}
                    placeholder="Key point, formula or question…"
                    value={slide.body}
                    onChange={(e) => update(slide.id, { body: e.target.value })}
                  />

                  <div className="mt-3 rounded-xl bg-[#f4f6fb] px-4 py-3">
                    <p className="truncate text-[11px] font-semibold text-slate-500">
                      {slide.title || "Slide title"}
                    </p>
                    <div className="my-2 h-px bg-slate-200" />
                    <p className="text-center font-display text-base font-bold text-ink">
                      {slide.body || "Slide content"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {slide.kind === "image" && slide.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.src}
                      alt={slide.title || `Slide ${i + 1}`}
                      className="max-h-60 w-full rounded-xl bg-black object-contain"
                    />
                  ) : slide.kind === "video" && slide.src ? (
                    <video
                      src={slide.src}
                      controls
                      playsInline
                      className="max-h-60 w-full rounded-xl bg-black object-contain"
                    />
                  ) : null}
                  <Input
                    className="mt-2.5"
                    placeholder="Add a caption (optional)"
                    value={slide.title}
                    onChange={(e) =>
                      update(slide.id, { title: e.target.value })
                    }
                  />
                </>
              )}
            </div>
          ))}

          <div className="pt-1">{addButtons}</div>
        </div>
      )}

      <div className="sticky bottom-0 border-t border-border bg-canvas/95 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <Button fullWidth size="lg" onClick={save}>
          Save presentation
        </Button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onImageFile}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={onVideoFile}
      />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 mx-auto flex max-w-110 justify-center px-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-success-bright px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
            <Check className="size-4" /> {toast}
          </span>
        </div>
      )}
    </div>
  );
}
