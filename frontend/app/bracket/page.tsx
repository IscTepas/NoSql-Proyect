"use client";

import useSWR from "swr";
import type { Partido } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Trophy, Medal } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

function MatchSlot({ partido, size = "normal" }: { partido: Partido | null; size?: "normal" | "compact" }) {
  const w = size === "compact" ? "w-[170px]" : "w-[200px]";

  if (!partido) {
    return (
      <div className={`${w} rounded-lg border border-dashed border-[var(--wc-gold)]/20 p-3 text-center bg-gray-50/50`}>
        <span className="text-[10px] text-muted-foreground">Por definir</span>
      </div>
    );
  }

  const played = partido.marcador.ft && partido.marcador.ft.length === 2;
  const winner = played
    ? partido.marcador.ft[0] > partido.marcador.ft[1]
      ? 1
      : partido.marcador.ft[0] < partido.marcador.ft[1]
      ? 2
      : 0
    : 0;

  const isFinal = partido.numeroPartido === 104;
  const isThird = partido.numeroPartido === 103;

  return (
    <div
      className={`${w} rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
        isFinal
          ? "border-[var(--wc-gold)] shadow-lg shadow-[var(--wc-gold)]/10 bg-gradient-to-b from-[var(--wc-gold)]/10 to-white"
          : isThird
          ? "border-[var(--wc-gold)]/30 bg-[var(--wc-gold)]/[0.03]"
          : "border-gray-200 bg-white hover:border-[var(--wc-gold)]/30"
      }`}
    >
      {isFinal && (
        <div className="bg-gradient-to-r from-[var(--wc-gold)] to-[var(--wc-gold-dark)] text-white text-center py-1.5">
          <Trophy className="h-3.5 w-3.5 inline mr-1" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Final</span>
        </div>
      )}
      {isThird && (
        <div className="bg-[var(--wc-gold)]/15 text-[var(--wc-gold-dark)] text-center py-1">
          <Medal className="h-3 w-3 inline mr-1" />
          <span className="text-[10px] font-bold tracking-wider uppercase">3er Puesto</span>
        </div>
      )}
      <div className="p-2.5 space-y-1.5">
        <div className={`flex items-center gap-2 ${winner === 1 ? "font-bold" : "text-muted-foreground"}`}>
          <Flag code={partido.equipo1?.fifaCode} size={size === "compact" ? 16 : 18} />
          <span className={`${size === "compact" ? "text-[10px]" : "text-xs"} truncate flex-1`}>
            {partido.equipo1?.fifaCode || "TBD"}
          </span>
          {played && (
            <span className={`${size === "compact" ? "text-[10px]" : "text-xs"} tabular-nums ${winner === 1 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>
              {partido.marcador.ft[0]}
            </span>
          )}
        </div>
        <div className={`flex items-center gap-2 ${winner === 2 ? "font-bold" : "text-muted-foreground"}`}>
          <Flag code={partido.equipo2?.fifaCode} size={size === "compact" ? 16 : 18} />
          <span className={`${size === "compact" ? "text-[10px]" : "text-xs"} truncate flex-1`}>
            {partido.equipo2?.fifaCode || "TBD"}
          </span>
          {played && (
            <span className={`${size === "compact" ? "text-[10px]" : "text-xs"} tabular-nums ${winner === 2 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>
              {partido.marcador.ft[1]}
            </span>
          )}
        </div>
        {played && (
          <div className="flex items-center justify-center gap-2 pt-0.5">
            {partido.marcador.p && partido.marcador.p.length === 2 && (
              <span className="text-[8px] text-muted-foreground font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                PEN {partido.marcador.p[0]}–{partido.marcador.p[1]}
              </span>
            )}
            {partido.marcador.et && partido.marcador.et.length === 2 && !partido.marcador.p?.length && (
              <span className="text-[8px] text-muted-foreground font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                AET
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BracketPage() {
  const { data: partidos, isLoading } = useSWR<Partido[]>("/api/partidos?año=2026", fetcher);

  const match = useMemo(() => {
    if (!partidos) return (n: number) => null as Partido | null;
    const map = new Map<number, Partido>();
    partidos.forEach((p) => map.set(p.numeroPartido, p));
    return (n: number) => map.get(n) || null;
  }, [partidos]);

  // Bracket pairings
  const topHalfLeft = [
    { r32: [73, 75], r16: 90 },
    { r32: [74, 77], r16: 89 },
    { r32: [76, 78], r16: 91 },
    { r32: [79, 80], r16: 92 },
  ];

  const bottomHalfRight = [
    { r32: [81, 82], r16: 94 },
    { r32: [83, 84], r16: 93 },
    { r32: [85, 87], r16: 96 },
    { r32: [86, 88], r16: 95 },
  ];

  const leftQF = [
    { r16: [90, 89], qf: 97 },
    { r16: [91, 92], qf: 99 },
  ];

  const rightQF = [
    { r16: [94, 93], qf: 98 },
    { r16: [96, 95], qf: 100 },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-28" />
              {Array.from({ length: Math.max(1, 8 / Math.pow(2, i - 1)) }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-[170px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center">
            <Swords className="h-4 w-4 text-white" />
          </div>
          Bracket de Eliminatorias
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lado Izquierdo (Grupos A–D) y Lado Derecho (Grupos E–L)
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-[var(--wc-gold)] shadow-sm" />
          <span>Final</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-gray-300" />
          <span>Otras rondas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">2</span>
          <span>Ganador</span>
        </div>
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[1100px]">
          {/* Column Headers */}
          <div className="flex items-center mb-4 px-1">
            {["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Campeón"].map((label, i) => (
              <div key={label} className={`${i === 0 ? "w-[210px]" : i === 4 ? "flex-1" : "w-[190px]"} shrink-0 text-center`}>
                <Badge
                  className={`text-[10px] ${
                    i >= 3
                      ? "bg-[var(--wc-gold)] text-white border-0"
                      : i === 2
                      ? "bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)] border border-[var(--wc-gold)]/20"
                      : "bg-gray-100 text-muted-foreground border border-gray-200"
                  }`}
                >
                  {i === 4 && <Trophy className="h-3 w-3 mr-1" />}
                  {label}
                </Badge>
              </div>
            ))}
          </div>

          {/* === TOP HALF === */}
          <div className="space-y-2 mb-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold px-1">
              Lado Izquierdo — Grupos A, B, C, D
            </p>
            <div className="flex items-start">
              {/* R32 */}
              <div className="w-[210px] shrink-0 space-y-2 pr-2">
                {topHalfLeft.map((g) =>
                  g.r32.map((num) => (
                    <MatchSlot key={num} partido={match(num)} size="compact" />
                  ))
                )}
              </div>

              {/* R16 */}
              <div className="w-[190px] shrink-0 space-y-[52px] pt-[42px] pr-2">
                {topHalfLeft.map((g) => (
                  <div key={g.r16} className="flex items-center gap-1">
                    <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                    <MatchSlot partido={match(g.r16)} size="compact" />
                  </div>
                ))}
              </div>

              {/* QF */}
              <div className="w-[190px] shrink-0 space-y-[140px] pt-[60px] pr-2">
                {leftQF.map((g) => (
                  <div key={g.qf} className="flex items-center gap-1">
                    <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                    <MatchSlot partido={match(g.qf)} size="compact" />
                  </div>
                ))}
              </div>

              {/* SF */}
              <div className="w-[190px] shrink-0 flex items-center justify-center pt-[80px] pr-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                  <MatchSlot partido={match(101)} size="compact" />
                </div>
              </div>

              {/* Final */}
              <div className="flex-1 flex items-center justify-center pt-[80px]">
                <MatchSlot partido={match(104)} />
              </div>
            </div>
          </div>

          {/* === BOTTOM HALF === */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold px-1">
              Lado Derecho — Grupos E, F, G, H, I, J, K, L
            </p>
            <div className="flex items-start">
              {/* R32 */}
              <div className="w-[210px] shrink-0 space-y-2 pr-2">
                {bottomHalfRight.map((g) =>
                  g.r32.map((num) => (
                    <MatchSlot key={num} partido={match(num)} size="compact" />
                  ))
                )}
              </div>

              {/* R16 */}
              <div className="w-[190px] shrink-0 space-y-[52px] pt-[42px] pr-2">
                {bottomHalfRight.map((g) => (
                  <div key={g.r16} className="flex items-center gap-1">
                    <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                    <MatchSlot partido={match(g.r16)} size="compact" />
                  </div>
                ))}
              </div>

              {/* QF */}
              <div className="w-[190px] shrink-0 space-y-[140px] pt-[60px] pr-2">
                {rightQF.map((g) => (
                  <div key={g.qf} className="flex items-center gap-1">
                    <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                    <MatchSlot partido={match(g.qf)} size="compact" />
                  </div>
                ))}
              </div>

              {/* SF */}
              <div className="w-[190px] shrink-0 flex items-center justify-center pt-[80px] pr-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-px bg-[var(--wc-gold)]/30" />
                  <MatchSlot partido={match(102)} size="compact" />
                </div>
              </div>

              {/* Third Place */}
              <div className="flex-1 flex items-center justify-center pt-[80px]">
                <MatchSlot partido={match(103)} />
              </div>
            </div>
          </div>

          {/* Champion Display */}
          {match(104)?.equipoGanador && (
            <div className="mt-10 text-center">
              <div className="inline-flex flex-col items-center gap-3 bg-gradient-to-b from-[var(--wc-gold)]/10 to-white rounded-2xl px-10 py-8 border border-[var(--wc-gold)]/20 shadow-lg shadow-[var(--wc-gold)]/10">
                <Trophy className="h-14 w-14 text-[var(--wc-gold)]" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Campeón del Mundo 2026</p>
                  <div className="flex items-center gap-3">
                    <Flag code={match(104)!.equipoGanador!.fifaCode} size={40} />
                    <span className="text-2xl font-black text-[var(--wc-black)]">
                      {match(104)!.equipoGanador!.nombre}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {match(104)!.equipo1?.nombre}{" "}
                  <span className="text-[var(--wc-black)] font-bold">{match(104)!.marcador.ft[0]}</span>
                  {" – "}
                  <span className="text-[var(--wc-black)] font-bold">{match(104)!.marcador.ft[1]}</span>
                  {" "}{match(104)!.equipo2?.nombre}
                  {match(104)!.marcador.et && match(104)!.marcador.et.length === 2 && (
                    <span className="text-xs text-muted-foreground ml-1 font-mono">(AET)</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
