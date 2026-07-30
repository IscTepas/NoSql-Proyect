"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORLDCUPS, type WorldCup } from "@/lib/worldcups";
import MundialCard from "@/components/MundialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = { type: "wc"; data: WorldCup } | { type: "info" };

const byId = (id: string) => WORLDCUPS.find((w) => w.id === id)!;

const SLIDES: Slide[] = [
  { type: "wc", data: byId("2014") },
  { type: "wc", data: byId("2018") },
  { type: "info" },
  { type: "wc", data: byId("2022") },
  { type: "wc", data: byId("2026") },
];

const CENTER_INDEX = 2;
const TOTAL = SLIDES.length;

const SIZE = "w-[280px] h-[420px] sm:w-[400px] sm:h-[580px] lg:w-[480px] lg:h-[660px]";

function InfoPanel({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`
        relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] text-white select-none
        transition-shadow duration-500 ease-out
        ${isActive ? "ring-2 ring-white/50" : "ring-1 ring-white/10"}
      `}
      style={{
        background:
          "linear-gradient(155deg, color-mix(in oklab, var(--primary) 85%, white 12%) 0%, color-mix(in oklab, var(--primary) 60%, black 20%) 55%, color-mix(in oklab, var(--wc-gold) 55%, black 35%) 100%)",
        boxShadow: isActive
          ? "0 30px 70px -18px color-mix(in oklab, var(--primary) 65%, transparent), 0 8px 20px -8px rgba(0,0,0,0.35)"
          : "0 14px 34px -14px rgba(0,0,0,0.4)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-white/[0.06] blur-2xl" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mundiales/referencias/Copa del mundo.png"
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[92%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-70"
      />
      {/* Cheap gradient overlay instead of mask-image: fades the photo's edges without the
          GPU-compositing cost of a CSS mask on an element animated with a 3D transform. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 40%, color-mix(in oklab, var(--primary) 60%, black 25%) 88%)",
        }}
      />

      <h2
        className="relative z-10 px-6 text-center text-4xl uppercase leading-[1.05] tracking-wide break-words [text-shadow:0_4px_18px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Experiencia
        <br />
        mundialista
      </h2>
    </div>
  );
}

export default function WorldCupCarousel() {
  const [active, setActive] = useState(CENTER_INDEX);
  const [hovered, setHovered] = useState<number | null>(null);
  const [step, setStep] = useState(264);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; dragging: boolean; moved: boolean }>({ startX: 0, dragging: false, moved: false });
  const wheelAccum = useRef(0);
  const lastStepTime = useRef(0);
  const lastWheelTime = useRef(0);

  useEffect(() => {
    const updateStep = () => {
      const w = window.innerWidth;
      setStep(w < 640 ? 140 : w < 1024 ? 200 : 264);
    };
    updateStep();
    window.addEventListener("resize", updateStep);
    return () => window.removeEventListener("resize", updateStep);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive(Math.min(TOTAL - 1, Math.max(0, index)));
  }, []);
  const next = useCallback(() => setActive((a) => Math.min(TOTAL - 1, a + 1)), []);
  const prev = useCallback(() => setActive((a) => Math.max(0, a - 1)), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const STEP_THRESHOLD = 45;
    const LOCK_MS = 260;
    const GESTURE_GAP_MS = 150;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();

      // A pause between wheel events longer than this means a fresh scroll
      // gesture is starting — don't let trailing momentum from a previous
      // trackpad swipe carry over and fire an unwanted extra step later.
      if (now - lastWheelTime.current > GESTURE_GAP_MS) {
        wheelAccum.current = 0;
      }
      lastWheelTime.current = now;

      // Right after a step fires, ignore input entirely for a short window
      // instead of accumulating it — otherwise one continuous swipe cascades
      // through several panels once the lock lifts.
      if (now - lastStepTime.current < LOCK_MS) return;

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      wheelAccum.current += delta;

      if (wheelAccum.current > STEP_THRESHOLD) {
        wheelAccum.current = 0;
        lastStepTime.current = now;
        next();
      } else if (wheelAccum.current < -STEP_THRESHOLD) {
        wheelAccum.current = 0;
        lastStepTime.current = now;
        prev();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const CLICK_MOVE_THRESHOLD = 6;

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current.dragging) return;
      const wasClick = !dragState.current.moved;
      dragState.current.dragging = false;
      const threshold = 50;
      setDragOffset((offset) => {
        if (offset < -threshold) next();
        else if (offset > threshold) prev();
        return 0;
      });

      // A tap/click (negligible movement) selects the slide directly instead of relying
      // on the browser's native click synthesis, which can silently miss after a pointer
      // capture + tiny hand-jitter movement, making panel switching feel flaky.
      if (wasClick) {
        const slideEl = (e.target as HTMLElement).closest("[data-slide-index]");
        const index = slideEl ? Number(slideEl.getAttribute("data-slide-index")) : NaN;
        if (!Number.isNaN(index) && index !== active) goTo(index);
      }
    },
    [next, prev, goTo, active]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragState.current = { startX: e.clientX, dragging: true, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const offset = e.clientX - dragState.current.startX;
    if (Math.abs(offset) > CLICK_MOVE_THRESHOLD) dragState.current.moved = true;
    setDragOffset(offset);
  };

  const activeSlide = SLIDES[active];
  const activeColor = activeSlide.type === "wc" ? activeSlide.data.color : "var(--primary)";

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 transition-[background] duration-700"
          style={{
            background: `radial-gradient(circle at 22% 25%, color-mix(in oklab, ${activeColor} 55%, transparent), transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 transition-[background] duration-700"
          style={{
            background: `radial-gradient(circle at 78% 80%, color-mix(in oklab, ${activeColor} 45%, transparent), transparent 55%)`,
          }}
        />
      </div>
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Carrusel de mundiales FIFA"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative h-full w-full touch-pan-y select-none outline-none"
        style={{ perspective: "1700px" }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label="Mundial anterior"
          className="absolute left-3 sm:left-8 lg:left-14 top-1/2 z-40 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={active === TOTAL - 1}
          aria-label="Mundial siguiente"
          className="absolute right-3 sm:right-8 lg:right-14 top-1/2 z-40 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="absolute inset-0">
          {SLIDES.map((slide, i) => {
            const offset = i - active;
            const isActive = offset === 0;
            const isHovered = hovered === i;
            const dist = Math.abs(offset);

            const translate = offset * step + (dragState.current.dragging ? dragOffset : 0);
            const lift = isHovered && !isActive ? -6 : 0;
            const scale = (isActive ? 1 : Math.max(0.82, 0.92 - (dist - 1) * 0.08)) + (isHovered ? 0.03 : 0);
            const rotate = Math.max(-24, Math.min(24, offset * -12));
            const opacity = Math.max(0.5, 1 - dist * 0.18);

            return (
              <div
                key={i}
                data-slide-index={i}
                className={`absolute left-1/2 top-1/2 will-change-transform ${SIZE}`}
                style={{
                  transform: `translate3d(-50%, -50%, 0) translateX(${translate}px) translateY(${lift}px) scale(${scale}) rotateY(${rotate}deg)`,
                  opacity,
                  zIndex: 30 - dist,
                  transition: dragState.current.dragging
                    ? "none"
                    : "transform 480ms cubic-bezier(.22,1,.36,1), opacity 480ms",
                  pointerEvents: dist > 2 ? "none" : "auto",
                  cursor: isActive ? undefined : "pointer",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {slide.type === "wc" ? (
                  <MundialCard mundial={slide.data} isActive={isActive} />
                ) : (
                  <InfoPanel isActive={isActive} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={slide.type === "wc" ? `Ir a ${slide.data.year}` : "Ir al panel del portal"}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "w-8 bg-white" : "w-2 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-white/50">
          <ChevronLeft className="h-3 w-3" />
          <ChevronRight className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
}
