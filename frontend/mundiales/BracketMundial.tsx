"use client";

import useSWR from "swr";
import type { Partido } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Trophy, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useRef } from "react";

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

interface BracketRound { label: string; matchNums: number[]; columnWidth?: number }

interface BracketHalf { label: string; rounds: BracketRound[] }

const SLOT_H = 68;
const SLOT_GAP = 8;
const COL_GAP = 16;
const MATCH_W_COMPACT = 170;

function computeMatchPositions(rounds: BracketRound[]): number[][] {
  if (rounds.length === 0) return [];
  const positions: number[][] = [];
  const round0Count = rounds[0].matchNums.length;
  const slotStep = SLOT_H + SLOT_GAP;

  const r0Positions = rounds[0].matchNums.map((_, i) => i * slotStep);
  positions.push(r0Positions);

  for (let r = 1; r < rounds.length; r++) {
    const prev = positions[r - 1];
    const current: number[] = [];
    for (let i = 0; i < rounds[r].matchNums.length; i++) {
      const leftIdx = i * 2;
      const c1 = prev[leftIdx] + SLOT_H / 2;
      const c2 = prev[leftIdx + 1] + SLOT_H / 2;
      current.push(Math.round((c1 + c2) / 2 - SLOT_H / 2));
    }
    positions.push(current);
  }
  return positions;
}

function MatchSlot({ partido }: { partido: Partido | null }) {
  if (!partido) return <div className="w-[170px] h-[68px] rounded-lg border border-dashed border-[var(--wc-accent)]/20 p-2 text-center bg-gray-50/50 flex items-center justify-center"><span className="text-[10px] text-muted-foreground">Por definir</span></div>;
  const played = partido.marcador.ft && partido.marcador.ft.length === 2;
  const winner = played ? (partido.marcador.ft[0] > partido.marcador.ft[1] ? 1 : partido.marcador.ft[0] < partido.marcador.ft[1] ? 2 : 0) : 0;
  const isFinal = partido.numeroPartido === 104 || partido.numeroPartido === 64;
  const isThird = partido.numeroPartido === 103 || partido.numeroPartido === 63;

  return (
    <div className={`w-[170px] h-[68px] rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md shrink-0 ${isFinal ? "border-[var(--wc-accent)] shadow-lg shadow-[var(--wc-accent)]/10 bg-gradient-to-b from-[var(--wc-accent)]/10 to-white" : isThird ? "border-[var(--wc-accent)]/30 bg-[var(--wc-accent)]/[0.03]" : "border-gray-200 bg-white hover:border-[var(--wc-accent)]/30"}`}>
      {isFinal && <div className="bg-gradient-to-r from-[var(--wc-accent)] to-[var(--wc-accent-dark)] text-white text-center py-0.5 text-[9px] font-bold tracking-wider uppercase leading-tight"><Trophy className="h-3 w-3 inline mr-0.5" />Final</div>}
      {isThird && <div className="bg-[var(--wc-accent)]/15 text-[var(--wc-accent-dark)] text-center py-0.5 text-[9px] font-bold tracking-wider uppercase leading-tight"><Medal className="h-2.5 w-2.5 inline mr-0.5" />3er Puesto</div>}
      <div className="p-1.5 space-y-1">
        <div className={`flex items-center gap-1.5 ${winner === 1 ? "font-bold" : "text-muted-foreground"}`}>
          <Flag code={partido.equipo1?.fifaCode} size={14} />
          <span className="text-[10px] truncate flex-1">{partido.equipo1?.fifaCode || "TBD"}</span>
          {played && <span className={`text-[10px] tabular-nums ${winner === 1 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>{partido.marcador.ft[0]}</span>}
        </div>
        <div className={`flex items-center gap-1.5 ${winner === 2 ? "font-bold" : "text-muted-foreground"}`}>
          <Flag code={partido.equipo2?.fifaCode} size={14} />
          <span className="text-[10px] truncate flex-1">{partido.equipo2?.fifaCode || "TBD"}</span>
          {played && <span className={`text-[10px] tabular-nums ${winner === 2 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>{partido.marcador.ft[1]}</span>}
        </div>
        {played && (
          <div className="flex items-center justify-center gap-1">
            {partido.marcador.p && partido.marcador.p.length === 2 && <span className="text-[7px] text-muted-foreground font-mono bg-gray-100 px-1 py-0.5 rounded">PEN {partido.marcador.p[0]}–{partido.marcador.p[1]}</span>}
            {partido.marcador.et && partido.marcador.et.length === 2 && !partido.marcador.p?.length && <span className="text-[7px] text-muted-foreground font-mono bg-gray-100 px-1 py-0.5 rounded">AET</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function BracketTree({ half, matchMap, slotH }: { half: BracketHalf; matchMap: (n: number) => Partido | null; slotH: number }) {
  const positions = computeMatchPositions(half.rounds);
  const round0Count = half.rounds[0].matchNums.length;
  const totalHeight = round0Count * (slotH + SLOT_GAP) - SLOT_GAP;

  return (
    <div className="flex gap-0" style={{ gap: COL_GAP }}>
      {half.rounds.map((round, ri) => (
        <div key={ri} className="relative shrink-0" style={{ width: MATCH_W_COMPACT }}>
          <div className="text-center mb-2">
            <Badge className="text-[8px] bg-gray-100 text-muted-foreground border border-gray-200">{round.label}</Badge>
          </div>
          <div className="relative" style={{ height: totalHeight }}>
            {round.matchNums.map((matchNum, mi) => {
              const top = positions[ri][mi];
              return (
                <div key={matchNum} className="absolute left-0" style={{ top, width: MATCH_W_COMPACT }}>
                  <MatchSlot partido={matchMap(matchNum)} />
                  {/* Connector lines to next round */}
                  {ri < half.rounds.length - 1 && mi % 2 === 0 && (
                    <div className="absolute" style={{ top: slotH / 2 - 0.5, left: MATCH_W_COMPACT, width: COL_GAP, height: 1 }}>
                      <div className="h-px bg-[var(--wc-accent)]/20" style={{ width: COL_GAP }} />
                    </div>
                  )}
                </div>
              );
            })}
            {/* Vertical connector lines from this round to next */}
            {ri < half.rounds.length - 1 && (
              <svg className="absolute pointer-events-none" style={{ left: MATCH_W_COMPACT - 1, top: 0, width: COL_GAP + 2, height: totalHeight }} preserveAspectRatio="none">
                {Array.from({ length: round.matchNums.length / 2 }).map((_, pi) => {
                  const top1 = positions[ri][pi * 2] + slotH / 2;
                  const top2 = positions[ri][pi * 2 + 1] + slotH / 2;
                  const targetTop = positions[ri + 1][pi] + slotH / 2;
                  return (
                    <g key={pi}>
                      <line x1={2} y1={top1} x2={COL_GAP} y2={targetTop} stroke="var(--wc-accent)" strokeOpacity={0.2} strokeWidth={1} />
                      <line x1={2} y1={top2} x2={COL_GAP} y2={targetTop} stroke="var(--wc-accent)" strokeOpacity={0.2} strokeWidth={1} />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BracketMundial({ year }: { year: number }) {
  const { data: partidos, isLoading } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);
  const scrollRef = useRef<HTMLDivElement>(null);

  const match = useMemo(() => {
    if (!partidos) return (n: number) => null as Partido | null;
    const map = new Map<number, Partido>();
    partidos.forEach((p) => map.set(p.numeroPartido, p));
    return (n: number) => map.get(n) || null;
  }, [partidos]);

  const bracketDef = useMemo((): { halves: BracketHalf[]; final: number; third: number } | null => {
    if (!partidos) return null;
    const is48 = partidos.length > 80;
    if (is48) {
      return {
        halves: [
          { label: "Grupos A–D", rounds: [
            { label: "R32", matchNums: [73, 75, 74, 77, 76, 78, 79, 80] },
            { label: "R16", matchNums: [90, 89, 91, 92] },
            { label: "QF", matchNums: [97, 99] },
            { label: "SF", matchNums: [101] },
          ]},
          { label: "Grupos E–L", rounds: [
            { label: "R32", matchNums: [81, 82, 83, 84, 85, 87, 86, 88] },
            { label: "R16", matchNums: [94, 93, 96, 95] },
            { label: "QF", matchNums: [98, 100] },
            { label: "SF", matchNums: [102] },
          ]},
        ],
        final: 104,
        third: 103,
      };
    }
    return {
      halves: [
        { label: "Eliminatorias", rounds: [
          { label: "R16", matchNums: [49, 50, 51, 52, 53, 54, 55, 56] },
          { label: "QF", matchNums: [57, 58, 59, 60] },
          { label: "SF", matchNums: [61, 62] },
        ]},
      ],
      final: 64,
      third: 63,
    };
  }, [partidos]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  const { accent, accentDark } = wcColors(year);

  if (isLoading) return <div className="container mx-auto px-4 py-8 space-y-6" style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const champion = match(bracketDef!.final);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
            <div className="h-8 w-8 rounded-lg bg-[var(--wc-accent)] flex items-center justify-center"><Swords className="h-4 w-4 text-white" /></div>
            Bracket de Eliminatorias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bracketDef!.halves.length > 1 ? "Lado Izquierdo y Derecho" : "Fase Eliminatoria"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded border-2 border-[var(--wc-accent)] shadow-sm" />
            <span>Final</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-emerald-600 font-bold">2</span>
            <span>Ganador</span>
          </div>
        </div>
      </div>

      <div className="relative group">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 -ml-4">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 -mr-4">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <div ref={scrollRef} className="overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--wc-accent) transparent" }}>
          <div className="flex items-start gap-6 min-w-max px-1">
            {bracketDef!.halves.map((half, hi) => (
              <div key={hi} className="space-y-3">
                <Badge className="text-[9px] bg-gray-100 text-muted-foreground border border-gray-200">{half.label}</Badge>
                <BracketTree half={half} matchMap={match} slotH={SLOT_H} />
              </div>
            ))}

            {/* Final & 3rd Place */}
            <div className="space-y-3">
              <Badge className="text-[9px] bg-[var(--wc-accent)] text-white border-0">Final</Badge>
              <div className="flex flex-col gap-2" style={{ paddingTop: Math.round((bracketDef!.halves[0].rounds[0].matchNums.length * (SLOT_H + SLOT_GAP) - SLOT_GAP - SLOT_H) / 2) }}>
                <MatchSlot partido={match(bracketDef!.final)} />
                <MatchSlot partido={match(bracketDef!.third)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Champion Display */}
      {champion?.equipoGanador && (
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 bg-gradient-to-b from-[var(--wc-accent)]/10 to-white rounded-2xl px-10 py-8 border border-[var(--wc-accent)]/20 shadow-lg shadow-[var(--wc-accent)]/10">
            <Trophy className="h-14 w-14 text-[var(--wc-accent)]" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Campeón del Mundo {year}</p>
              <div className="flex items-center gap-3"><Flag code={champion.equipoGanador.fifaCode} size={40} /><span className="text-2xl font-black text-[var(--wc-black)]">{champion.equipoGanador.nombre}</span></div>
            </div>
            <p className="text-sm text-muted-foreground">{champion.equipo1?.nombre} <span className="text-[var(--wc-black)] font-bold">{champion.marcador.ft[0]}</span> – <span className="text-[var(--wc-black)] font-bold">{champion.marcador.ft[1]}</span> {champion.equipo2?.nombre}</p>
          </div>
        </div>
      )}
    </div>
  );
}
