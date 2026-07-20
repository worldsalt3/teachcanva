"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCw } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_EDGE = 1400;
const MAX_ZOOM = 4;

const ASPECTS = [
  { key: "original", label: "Original" },
  { key: "wide", label: "3:2", ratio: 3 / 2 },
  { key: "square", label: "1:1", ratio: 1 },
] as const;

type AspectKey = (typeof ASPECTS)[number]["key"];

interface Dims {
  w: number;
  h: number;
}

/**
 * Frame-based photo editor for slide images: the picked photo pans/zooms
 * under a fixed crop frame (drag, pinch or slider), rotates in 90° steps,
 * and "Use photo" renders exactly the framed region to a JPEG blob.
 */
export function PhotoEditorSheet({
  src,
  onCancel,
  onApply,
}: {
  src: string;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
}) {
  const [natural, setNatural] = useState<Dims | null>(null);
  const [frame, setFrame] = useState<Dims | null>(null);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [zoom, setZoom] = useState(1); // 1 = image covers the frame
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState<AspectKey>("original");
  const [busy, setBusy] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    startDist: 0,
    startZoom: 1,
    startPoint: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
  });

  // Dimensions of the image after rotation (image pixels).
  const rotated: Dims | null = natural
    ? rotation % 180 === 0
      ? natural
      : { w: natural.h, h: natural.w }
    : null;

  const picked = ASPECTS.find((a) => a.key === aspect);
  const frameRatio =
    (picked && "ratio" in picked ? picked.ratio : undefined) ??
    (rotated ? rotated.w / rotated.h : 3 / 2);

  // Track the frame's on-screen size so the preview transform and the final
  // crop share exactly the same geometry.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0) setFrame({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Scale that makes the rotated image exactly cover the frame at zoom 1. */
  const coverScale = (f: Dims): number =>
    rotated ? Math.max(f.w / rotated.w, f.h / rotated.h) : 1;

  const clampOffset = (
    o: { x: number; y: number },
    z: number,
  ): { x: number; y: number } => {
    if (!frame || !rotated) return o;
    const s = coverScale(frame) * z;
    const maxX = Math.max(0, (rotated.w * s - frame.w) / 2);
    const maxY = Math.max(0, (rotated.h * s - frame.h) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  };

  const setZoomClamped = (z: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z));
    setZoom(next);
    setOffset((o) => clampOffset(o, next));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    frameRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      g.startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      g.startZoom = zoom;
    } else {
      g.startPoint = { x: e.clientX, y: e.clientY };
      g.startOffset = { ...offset };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setZoomClamped((g.startZoom * dist) / Math.max(1, g.startDist));
      return;
    }
    setOffset(() =>
      clampOffset(
        {
          x: g.startOffset.x + (e.clientX - g.startPoint.x),
          y: g.startOffset.y + (e.clientY - g.startPoint.y),
        },
        zoom,
      ),
    );
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const remaining = [...pointers.current.values()];
    if (remaining.length === 1) {
      const g = gesture.current;
      g.startPoint = { x: remaining[0].x, y: remaining[0].y };
      g.startOffset = { ...offset };
    }
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const pickAspect = (key: AspectKey) => {
    setAspect(key);
    setOffset({ x: 0, y: 0 });
  };

  /** Renders the framed region to a JPEG blob (longest edge <= 1400px). */
  const apply = () => {
    const img = imgRef.current;
    if (!img || !frame || !natural || !rotated || busy) return;
    setBusy(true);

    const s = coverScale(frame) * zoom;
    // Crop region size in rotated-image pixels, and its centre relative to
    // the rotated image's centre (screen offset moves the image, so the
    // frame centre sits at -offset/s in rotated coords).
    const regionW = frame.w / s;
    const regionH = frame.h / s;
    const cx = -offset.x / s;
    const cy = -offset.y / s;

    const outScale = Math.min(1, MAX_EDGE / Math.max(regionW, regionH));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(regionW * outScale));
    canvas.height = Math.max(1, Math.round(regionH * outScale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(outScale, outScale);
    ctx.translate(-cx, -cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -natural.w / 2, -natural.h / 2, natural.w, natural.h);
    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onApply(blob);
      },
      "image/jpeg",
      0.82,
    );
  };

  return (
    <BottomSheet open onClose={onCancel} title="Adjust photo">
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="relative mx-auto max-h-[46vh] w-full cursor-grab touch-none select-none overflow-hidden rounded-xl bg-black active:cursor-grabbing"
        style={{ aspectRatio: `${frameRatio}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="Photo being adjusted"
          draggable={false}
          onLoad={(e) =>
            setNatural({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center",
            (!natural || !frame) && "opacity-0",
          )}
          style={
            natural && frame
              ? {
                  width: natural.w,
                  height: natural.h,
                  // translate(-50%,-50%) centres the natural-size image, then
                  // pan/rotate/zoom mirror the crop math used in apply().
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${coverScale(frame) * zoom})`,
                }
              : undefined
          }
        />
        {/* Rule-of-thirds grid */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Rotate 90 degrees"
          onClick={rotate}
          className="tap grid size-10 shrink-0 place-items-center rounded-xl border border-border-soft text-fg transition-colors hover:bg-white/5"
        >
          <RotateCw className="size-4.5" />
        </button>
        <input
          type="range"
          aria-label="Zoom"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoomClamped(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-primary"
        />
        <span className="w-10 shrink-0 text-right text-[12px] font-semibold tabular-nums text-fg-muted">
          {zoom.toFixed(1)}×
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {ASPECTS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => pickAspect(a.key)}
            className={cn(
              "tap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
              aspect === a.key
                ? "bg-primary text-white"
                : "bg-elevated text-fg-muted hover:text-fg",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Button variant="neutral" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={apply} disabled={busy || !natural || !frame}>
          <Check className="size-4" /> {busy ? "Saving…" : "Use photo"}
        </Button>
      </div>
    </BottomSheet>
  );
}
