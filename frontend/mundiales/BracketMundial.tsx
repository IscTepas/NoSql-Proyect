"use client";

import useSWR from "swr";
import type { Partido } from "@/lib/types";
import { WORLDCUPS } from "@/lib/worldcups";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from "lucide-react";
import Flag from "@/components/Flag";
import { useEffect, useMemo, useRef, useState } from "react";

const YEAR_COLORS: Record<number, { accent: string; accentDark: string }> = {
  2014: { accent: "oklch(0.55 0.18 155)", accentDark: "oklch(0.42 0.18 155)" },
  2018: { accent: "oklch(0.58 0.20 25)", accentDark: "oklch(0.45 0.20 25)" },
  2022: { accent: "oklch(0.48 0.15 310)", accentDark: "oklch(0.35 0.15 310)" },
  2026: { accent: "oklch(0.42 0.16 255)", accentDark: "oklch(0.30 0.16 255)" },
};

const wcColors = (year: number) => YEAR_COLORS[year] || YEAR_COLORS[2026];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

interface BracketRound { label: string; matchNums: number[] }
interface BracketHalf { label: string; rounds: BracketRound[] }

const SLOT_H = 72;
const SLOT_GAP = 8;
const COL_GAP = 8;
const MATCH_W = 150;
const LABEL_H = 18;
const LABEL_GAP = 10;
const TOP_PAD = LABEL_H + LABEL_GAP;
const CENTER_W = 165;
const CENTER_GAP = 20;
const BOTTOM_PAD = 200;
const EXTRA_TOP = 130;
const FINAL_HALF = SLOT_H / 2;
const GAP_SMALL = 20;
const MIN_SCALE = 0.85;

function computeMatchPositions(rounds: BracketRound[]): number[][] {
  if (rounds.length === 0) return [];
  const positions: number[][] = [];
  const slotStep = SLOT_H + SLOT_GAP;
  positions.push(rounds[0].matchNums.map((_, i) => i * slotStep));

  for (let r = 1; r < rounds.length; r++) {
    const prev = positions[r - 1];
    const current: number[] = [];
    for (let i = 0; i < rounds[r].matchNums.length; i++) {
      const c1 = prev[i * 2] + SLOT_H / 2;
      const c2 = prev[i * 2 + 1] + SLOT_H / 2;
      current.push(Math.round((c1 + c2) / 2 - SLOT_H / 2));
    }
    positions.push(current);
  }
  return positions;
}

function colXPositions(roundCount: number, mirrored: boolean): number[] {
  const step = MATCH_W + COL_GAP;
  return Array.from({ length: roundCount }, (_, ri) => (mirrored ? (roundCount - 1 - ri) * step : ri * step));
}

function teamLabel(equipo: Partido["equipo1"] | undefined) {
  return equipo?.nombre || equipo?.fifaCode || "Por definir";
}

function MatchSlot({ partido }: { partido: Partido | null }) {
  if (!partido)
    return (
      <div className="w-[150px] h-[72px] rounded-xl border border-dashed border-[var(--wc-accent)]/25 bg-gray-50/60 flex items-center justify-center shrink-0">
        <span className="text-[11px] text-muted-foreground">Por definir</span>
      </div>
    );
  const played = partido.marcador.ft && partido.marcador.ft.length === 2;
  const hasEt = partido.marcador.et && partido.marcador.et.length === 2;
  const hasPen = partido.marcador.p && partido.marcador.p.length === 2;
  // The score shown per team follows the deciding stage: extra time overrides full time.
  const score = hasEt ? partido.marcador.et! : partido.marcador.ft;
  const winner = partido.equipoGanador
    ? partido.equipoGanador._id === partido.equipo1?._id
      ? 1
      : partido.equipoGanador._id === partido.equipo2?._id
      ? 2
      : 0
    : 0;
  const isFinal = partido.numeroPartido === 104 || partido.numeroPartido === 64;
  const isThird = partido.numeroPartido === 103 || partido.numeroPartido === 63;

  return (
    <div
      className={`w-[150px] h-[72px] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shrink-0 flex flex-col justify-center gap-1.5 px-3 ${
        isFinal
          ? "border-[var(--wc-gold)] bg-gradient-to-b from-[var(--wc-gold)]/[0.1] to-white shadow-md shadow-[var(--wc-gold)]/20"
          : isThird
          ? "border-[var(--wc-accent)]/40 bg-[var(--wc-accent)]/[0.04]"
          : "border-gray-200 bg-white hover:border-[var(--wc-accent)]/40"
      }`}
    >
      <div className={`flex items-center gap-1.5 ${winner === 1 ? "font-bold" : "text-muted-foreground"}`}>
        <Flag code={partido.equipo1?.fifaCode} size={16} />
        <span className="min-w-0 max-w-[74px] truncate text-[11px]">{teamLabel(partido.equipo1)}</span>
        {played && <span className={`shrink-0 text-[11px] tabular-nums ${winner === 1 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>{score[0]}</span>}
      </div>
      <div className={`flex items-center gap-1.5 ${winner === 2 ? "font-bold" : "text-muted-foreground"}`}>
        <Flag code={partido.equipo2?.fifaCode} size={16} />
        <span className="min-w-0 max-w-[74px] truncate text-[11px]">{teamLabel(partido.equipo2)}</span>
        {played && <span className={`shrink-0 text-[11px] tabular-nums ${winner === 2 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>{score[1]}</span>}
      </div>
      {(hasEt || hasPen) && (
        <div className="flex justify-center gap-1">
          {hasEt && <span className="text-[8px] text-muted-foreground font-mono bg-gray-100 px-1.5 rounded">AET {partido.marcador.et![0]}–{partido.marcador.et![1]}</span>}
          {hasPen && <span className="text-[8px] text-muted-foreground font-mono bg-gray-100 px-1.5 rounded">PEN {partido.marcador.p![0]}–{partido.marcador.p![1]}</span>}
        </div>
      )}
    </div>
  );
}

function BracketTree({
  half,
  matchMap,
  mirrored,
}: {
  half: BracketHalf;
  matchMap: (n: number) => Partido | null;
  mirrored: boolean;
}) {
  const positions = computeMatchPositions(half.rounds);
  const colX = colXPositions(half.rounds.length, mirrored);
  const round0Count = half.rounds[0].matchNums.length;
  const totalHeight = round0Count * (SLOT_H + SLOT_GAP) - SLOT_GAP;
  const totalWidth = half.rounds.length * MATCH_W + (half.rounds.length - 1) * COL_GAP;

  return (
    <div className="relative shrink-0" style={{ width: totalWidth, height: TOP_PAD + totalHeight }}>
      {half.rounds.map((round, ri) => (
        <div key={ri}>
          <div className="absolute text-center" style={{ left: colX[ri], width: MATCH_W, top: 0 }}>
            <Badge className="text-[9px] font-bold tracking-wide bg-[var(--wc-accent)]/10 text-[var(--wc-accent)] border border-[var(--wc-accent)]/20 px-2 py-0.5">{round.label}</Badge>
          </div>
          {round.matchNums.map((matchNum, mi) => (
            <div key={matchNum} className="absolute" style={{ left: colX[ri], top: TOP_PAD + positions[ri][mi], width: MATCH_W }}>
              <MatchSlot partido={matchMap(matchNum)} />
            </div>
          ))}
        </div>
      ))}

      <svg className="absolute pointer-events-none" style={{ left: 0, top: TOP_PAD, width: totalWidth, height: totalHeight }}>
        {half.rounds.slice(0, -1).map((round, ri) => {
          const nextRi = ri + 1;
          const fromX = mirrored ? colX[ri] : colX[ri] + MATCH_W;
          const toX = mirrored ? colX[nextRi] + MATCH_W : colX[nextRi];
          const midX = (fromX + toX) / 2;
          return Array.from({ length: half.rounds[nextRi].matchNums.length }).map((_, pi) => {
            const top1 = positions[ri][pi * 2] + SLOT_H / 2;
            const top2 = positions[ri][pi * 2 + 1] + SLOT_H / 2;
            const targetTop = positions[nextRi][pi] + SLOT_H / 2;
            return (
              <g key={`${ri}-${pi}`}>
                <polyline points={`${fromX},${top1} ${midX},${top1} ${midX},${targetTop} ${toX},${targetTop}`} fill="none" stroke="var(--wc-accent)" strokeOpacity={0.45} strokeWidth={2} />
                <polyline points={`${fromX},${top2} ${midX},${top2} ${midX},${targetTop} ${toX},${targetTop}`} fill="none" stroke="var(--wc-accent)" strokeOpacity={0.45} strokeWidth={2} />
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}

function TrophyBlock({ year }: { year: number }) {
  const logo = WORLDCUPS.find((w) => w.year === year)?.logo;
  return (
    <div className="flex flex-col items-center">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-44 w-44 max-w-none object-contain drop-shadow-lg" />
      ) : (
        <Trophy className="h-28 w-28 text-[var(--wc-gold)]" />
      )}
    </div>
  );
}

function ChampionCard({ champion }: { champion: Partido | null }) {
  const decided = champion?.equipoGanador;
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 shadow-lg whitespace-nowrap ${
        decided
          ? "border-2 border-[var(--wc-gold)] bg-gradient-to-r from-[var(--wc-gold)]/20 via-[var(--wc-gold)]/5 to-transparent"
          : "border border-dashed border-[var(--wc-accent)]/25 bg-white"
      }`}
    >
      <Trophy className={`h-5 w-5 shrink-0 ${decided ? "text-[var(--wc-gold)]" : "text-[var(--wc-accent)]/30"}`} />
      {decided ? (
        <>
          <Flag code={champion.equipoGanador!.fifaCode} size={24} />
          <span className="text-base font-black text-[var(--wc-black)]">{champion.equipoGanador!.nombre}</span>
        </>
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">Campeón por definir</span>
      )}
    </div>
  );
}

export default function BracketMundial({ year }: { year: number }) {
  const { data: partidos, isLoading } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const match = useMemo(() => {
    if (!partidos) return (() => null) as (n: number) => Partido | null;
    const map = new Map<number, Partido>();
    partidos.forEach((p) => map.set(p.numeroPartido, p));
    return (n: number) => map.get(n) || null;
  }, [partidos]);

  const bracketDef = useMemo((): { halves: [BracketHalf, BracketHalf]; final: number; third: number } | null => {
    if (!partidos) return null;
    const is48 = partidos.length > 80;
    if (is48) {
      return {
        halves: [
          { label: "Lado izquierdo", rounds: [
            // Cada par de R32 alimenta el R16 situado en la misma posición.
            // Los dos primeros R16 llegan al QF 97 y los dos siguientes al QF 98.
            { label: "R32", matchNums: [74, 77, 73, 75, 83, 84, 81, 82] },
            { label: "R16", matchNums: [89, 90, 93, 94] },
            { label: "QF", matchNums: [97, 98] },
            { label: "SF", matchNums: [101] },
          ]},
          { label: "Lado derecho", rounds: [
            { label: "R32", matchNums: [76, 78, 79, 80, 86, 88, 85, 87] },
            { label: "R16", matchNums: [91, 92, 95, 96] },
            { label: "QF", matchNums: [99, 100] },
            { label: "SF", matchNums: [102] },
          ]},
        ],
        final: 104,
        third: 103,
      };
    }

    // En los Mundiales de 32 selecciones la numeración cronológica de los
    // cuartos no coincide con el orden de las ramas del bracket. La posición
    // correcta depende del cruce real de cada edición.
    const quarterFinalsByYear: Record<number, [[number, number], [number, number]]> = {
      2014: [[58, 57], [60, 59]],
      2018: [[57, 58], [60, 59]],
      2022: [[58, 57], [60, 59]],
    };
    const [leftQuarterFinals, rightQuarterFinals] =
      quarterFinalsByYear[year] || quarterFinalsByYear[2022];

    return {
      halves: [
        { label: "Lado izquierdo", rounds: [
          { label: "R16", matchNums: [49, 50, 53, 54] },
          { label: "QF", matchNums: leftQuarterFinals },
          { label: "SF", matchNums: [61] },
        ]},
        { label: "Lado derecho", rounds: [
          { label: "R16", matchNums: [51, 52, 55, 56] },
          { label: "QF", matchNums: rightQuarterFinals },
          { label: "SF", matchNums: [62] },
        ]},
      ],
      final: 64,
      third: 63,
    };
  }, [partidos, year]);

  const roundCount = bracketDef?.halves[0].rounds.length ?? 0;
  const halfWidth = roundCount * MATCH_W + (roundCount - 1) * COL_GAP;
  const round0Count = bracketDef?.halves[0].rounds[0].matchNums.length ?? 0;
  const totalHeight = round0Count * (SLOT_H + SLOT_GAP) - SLOT_GAP;
  const totalWidth = halfWidth * 2 + CENTER_GAP * 2 + CENTER_W;
  const totalContentHeight = EXTRA_TOP + TOP_PAD + totalHeight + BOTTOM_PAD;
  const midY = TOP_PAD + totalHeight / 2;

  useEffect(() => {
    const el = outerRef.current;
    if (!el || !totalWidth) return;
    const update = () => {
      const available = el.clientWidth;
      if (available <= 0) return setScale(1);
      const fit = available / totalWidth;
      // Shrink to fit when there's room to spare, but never go below MIN_SCALE —
      // past that point it's better to scroll horizontally than render illegibly small.
      setScale(Math.min(1, Math.max(MIN_SCALE, fit)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [totalWidth]);

  const { accent, accentDark } = wcColors(year);

  if (isLoading || !bracketDef) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6" style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const [halfA, halfB] = bracketDef.halves;
  const champion = match(bracketDef.final);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--wc-accent)] to-[var(--wc-accent-dark)] bg-clip-text text-transparent">
          Bracket de Eliminatorias
        </h1>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 blur-3xl"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 50%, oklch(0.42 0.16 255 / 0.02) 0%, oklch(0.42 0.16 255 / 0.05) 45%, oklch(0.42 0.16 255 / 0.14) 78%, oklch(0.42 0.16 255 / 0.24) 100%)",
          }}
        />
        <div ref={outerRef} className="overflow-x-auto">
          <div className="relative mx-auto" style={{ width: totalWidth * scale, height: totalContentHeight * scale }}>
            <div
              className="absolute left-0 top-0"
              style={{ width: totalWidth, height: totalContentHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}
            >
            <div className="absolute" style={{ left: 0, top: EXTRA_TOP }}>
              <BracketTree half={halfA} matchMap={match} mirrored={false} />
            </div>
            <div className="absolute" style={{ left: halfWidth + CENTER_GAP + CENTER_W + CENTER_GAP, top: EXTRA_TOP }}>
              <BracketTree half={halfB} matchMap={match} mirrored={true} />
            </div>

            {/* Connecting lines from each half's semifinal into the center final */}
            <svg className="absolute pointer-events-none" style={{ left: 0, top: EXTRA_TOP, width: totalWidth, height: TOP_PAD + totalHeight }}>
              <line x1={halfWidth} y1={midY} x2={halfWidth + CENTER_GAP} y2={midY} stroke="var(--wc-accent)" strokeOpacity={0.45} strokeWidth={2} />
              <line x1={halfWidth + CENTER_GAP + CENTER_W} y1={midY} x2={halfWidth + CENTER_GAP + CENTER_W + CENTER_GAP} y2={midY} stroke="var(--wc-accent)" strokeOpacity={0.45} strokeWidth={2} />
            </svg>

            {/* Center column: trophy on top, Final, 3rd place, champion at the bottom */}
            <div className="absolute" style={{ left: halfWidth + CENTER_GAP, top: EXTRA_TOP + TOP_PAD, width: CENTER_W, height: totalHeight }}>
              <div className="absolute" style={{ left: "50%", top: `calc(50% - ${FINAL_HALF + GAP_SMALL}px)`, transform: "translate(-50%, -100%)" }}>
                <TrophyBlock year={year} />
              </div>

              <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                <div className="text-center mb-1.5">
                  <Badge className="text-[9px] bg-[var(--wc-gold)] text-white border-0 px-2 py-0.5">Final</Badge>
                </div>
                <MatchSlot partido={champion} />
              </div>

              <div className="absolute flex flex-col items-center gap-7" style={{ left: "50%", top: `calc(50% + ${FINAL_HALF + GAP_SMALL}px)`, transform: "translateX(-50%)" }}>
                <div className="flex flex-col items-center">
                  <div className="text-center mb-1.5">
                    <Badge className="text-[8px] bg-gray-100 text-muted-foreground border border-gray-200 px-2 py-0.5"><Medal className="h-2.5 w-2.5 inline mr-0.5" />3er Puesto</Badge>
                  </div>
                  <MatchSlot partido={match(bracketDef.third)} />
                </div>
                <ChampionCard champion={champion} />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
