"use client";

import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Presentation,
  Trash2,
} from "lucide-react";
import { AppHeader, BackButton } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useApp } from "@/lib/store/app-provider";
import type { Slide } from "@/lib/services/types";

function blankSlide(): Slide {
  return {
    id: `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    body: "",
  };
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

  const addSlide = () => setSlides((s) => [...s, blankSlide()]);

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
            Add slides for your class with {counterpartName}. They&apos;ll be
            ready on the board when you go live.
          </p>
          <Button className="mt-5" onClick={addSlide}>
            <Plus className="size-4" /> Add first slide
          </Button>
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

              <Input
                placeholder="Slide title (e.g. Topic: Quadratics)"
                value={slide.title}
                onChange={(e) => update(slide.id, { title: e.target.value })}
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
            </div>
          ))}

          <button
            type="button"
            onClick={addSlide}
            className="tap flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-border-soft py-3.5 text-[13px] font-semibold text-fg-muted transition-colors hover:bg-white/5"
          >
            <Plus className="size-4" /> Add slide
          </button>
        </div>
      )}

      <div className="sticky bottom-0 border-t border-border bg-canvas/95 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <Button fullWidth size="lg" onClick={save}>
          Save presentation
        </Button>
      </div>

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
