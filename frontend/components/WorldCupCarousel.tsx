"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORLDCUPS, PROJECT_INFO, type WorldCup } from "@/lib/worldcups";
import MundialCard from "@/components/MundialCard";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";

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

const SIZE_ACTIVE = "w-[250px] h-[380px] sm:w-[340px] sm:h-[500px] lg:w-[400px] lg:h-[560px]";
const SIZE_INACTIVE = "w-[190px] h-[300px] sm:w-[250px] sm:h-[390px] lg:w-[300px] lg:h-[440px]";

function InfoPanel({ isActive, sizeClassName }: { isActive: boolean; sizeClassName: string }) {
  return (
    <div
      className={`
        relative block overflow-hidden rounded-[1.75rem] text-white select-none
        transition-[width,height,transform] duration-500 ease-out
        ${sizeClassName}
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

      <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-5 text-center sm:gap-4 sm:p-8">
        <span className="mx-auto flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 ring-1 ring-white/25 backdrop-blur-sm sm:text-xs">
          <Trophy className="h-3 w-3 text-[var(--wc-gold)]" />
          Portal Oficial
        </span>

        <h2 className="text-2xl leading-[1.05] font-black tracking-tight sm:text-4xl">
          FIFA World Cup
          <br />
          Portal
        </h2>

        <p className="mx-auto max-w-[26ch] text-xs leading-relaxed text-white/70 sm:text-sm">
          {PROJECT_INFO.description}
        </p>

        <div className="mx-auto mt-1 grid w-full max-w-[280px] grid-cols-2 gap-x-4 gap-y-3 border-t border-white/20 pt-4 sm:mt-2 sm:pt-5">
          <div>
            <p className="text-xl font-bold sm:text-2xl">{PROJECT_INFO.totalWorldCups}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">Mundiales</p>
          </div>
          <div>
            <p className="text-xl font-bold sm:text-2xl">{PROJECT_INFO.totalTeams}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">Selecciones</p>
          </div>
          <div>
            <p className="text-xl font-bold sm:text-2xl">{PROJECT_INFO.totalMatches}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">Partidos</p>
          </div>
          <div>
            <p className="text-xl font-bold sm:text-2xl">{PROJECT_INFO.totalGoals}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">Goles</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorldCupCarousel() {
  const [active, setActive] = useState(CENTER_INDEX);
  const [hovered, setHovered] = useState<number | null>(null);
  const [step, setStep] = useState(220);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false });
  const wheelAccum = useRef(0);
  const lastStepTime = useRef(0);

  useEffect(() => {
    const updateStep = () => {
      const w = window.innerWidth;
      setStep(w < 640 ? 125 : w < 1024 ? 170 : 220);
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
    const COOLDOWN = 380;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastStepTime.current < COOLDOWN) return;

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

  const endDrag = useCallback(() => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const threshold = 50;
    setDragOffset((offset) => {
      if (offset < -threshold) next();
      else if (offset > threshold) prev();
      return 0;
    });
  }, [next, prev]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragState.current = { startX: e.clientX, dragging: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    setDragOffset(e.clientX - dragState.current.startX);
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
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) translateX(${translate}px) translateY(${lift}px) scale(${scale}) rotateY(${rotate}deg)`,
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
                onClick={() => !isActive && goTo(i)}
              >
                {slide.type === "wc" ? (
                  <MundialCard
                    mundial={slide.data}
                    isActive={isActive}
                    sizeClassName={isActive ? SIZE_ACTIVE : SIZE_INACTIVE}
                  />
                ) : (
                  <InfoPanel isActive={isActive} sizeClassName={isActive ? SIZE_ACTIVE : SIZE_INACTIVE} />
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
          Desliza, usa la rueda del mouse o las flechas
          <ChevronRight className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
}
