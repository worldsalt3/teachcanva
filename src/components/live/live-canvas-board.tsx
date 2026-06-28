"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BOARD_BG = "#f4f6fb";
const INK = "#0b1220";
const COLORS = [INK, "#2563eb", "#ef4444", "#16a34a", "#14b8a6", "#f5b417"];
const MAX_HISTORY = 25;

export interface Slide {
  title: string;
  body: string;
}

interface LiveCanvasBoardProps {
  slide?: Slide;
  defaultMode?: "slide" | "free";
  overlay?: ReactNode;
  className?: string;
}

export function LiveCanvasBoard({
  slide,
  defaultMode = "free",
  overlay,
  className,
}: LiveCanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);

  const [mode, setMode] = useState<"slide" | "free">(
    slide ? defaultMode : "free",
  );
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(INK);

  const drawSlide = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, s: Slide) => {
      ctx.fillStyle = "#475569";
      ctx.font =
        "600 15px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(s.title, 22, 22);

      ctx.strokeStyle = "#dbe2f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(22, 52);
      ctx.lineTo(w - 22, 52);
      ctx.stroke();

      ctx.fillStyle = INK;
      ctx.font = "700 30px 'Sora', Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.body, w / 2, h / 2, w - 48);
    },
    [],
  );

  const paintBase = useCallback(
    (m: "slide" | "free") => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.save();
      ctx.fillStyle = BOARD_BG;
      ctx.fillRect(0, 0, w, h);
      if (m === "slide" && slide) drawSlide(ctx, w, h, slide);
      ctx.restore();
      history.current = [];
    },
    [slide, drawSlide],
  );

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  useEffect(() => {
    setup();
    paintBase(mode);
    const onResize = () => {
      setup();
      paintBase(mode);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    paintBase(mode);
  }, [mode, paintBase]);

  const point = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    e.preventDefault();
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.current.length > MAX_HISTORY) history.current.shift();
    drawing.current = true;
    last.current = point(e);
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = point(e);
    ctx.strokeStyle = tool === "eraser" ? BOARD_BG : color;
    ctx.lineWidth = tool === "eraser" ? 24 : 3.5;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const endStroke = () => {
    drawing.current = false;
    last.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const prev = history.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
  };

  const clear = () => paintBase(mode);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className="absolute inset-0 touch-none"
        />

        {slide && (
          <div className="absolute left-3 top-3 flex rounded-full border border-black/10 bg-white/85 p-0.5 shadow-sm backdrop-blur-sm">
            {(["slide", "free"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-semibold capitalize transition-colors",
                  mode === m ? "bg-primary text-white" : "text-ink-soft",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {overlay}
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-border bg-surface px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Pen color ${c}`}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={cn(
                "size-7 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform",
                color === c && tool === "pen"
                  ? "scale-110 ring-white"
                  : "ring-transparent",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="mx-1 h-6 w-px shrink-0 bg-border" />
        <ToolButton
          label="Eraser"
          active={tool === "eraser"}
          onClick={() => setTool("eraser")}
        >
          <Eraser className="size-5" />
        </ToolButton>
        <ToolButton label="Undo" onClick={undo}>
          <RotateCcw className="size-5" />
        </ToolButton>
        <ToolButton label="Clear" onClick={clear}>
          <Trash2 className="size-5" />
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "tap grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
        active
          ? "bg-primary text-white"
          : "bg-elevated text-fg-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
