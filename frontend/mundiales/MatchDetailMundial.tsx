"use client";

import useSWR from "swr";
import type { Partido } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Clock, Calendar, Trophy, Footprints } from "lucide-react";
import Flag from "@/components/Flag";
import Link from "next/link";
import { useMemo } from "react";

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

export default function MatchDetailMundial({ year, matchId }: { year: number; matchId: string }) {
  const { accent, accentDark } = wcColors(year);
  const { data: partidos, isLoading } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);

  const partido = useMemo(() => {
    if (!partidos) return null;
    return partidos.find((p) => p._id === matchId || String(p.numeroPartido) === matchId) || null;
  }, [partidos, matchId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6"
        style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="container mx-auto px-4 py-16 text-center"
        style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
        <p className="text-muted-foreground text-lg mb-4">Partido no encontrado</p>
        <Link href={`/mundiales/${year}/partidos`} className="text-[var(--wc-accent-dark)] hover:underline">
          Volver a Partidos
        </Link>
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

  const isKnockout = !partido.grupo;
  const isFinal = partido.numeroPartido === 104;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
      <Link
        href={`/mundiales/${year}/partidos`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--wc-accent-dark)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Partidos
      </Link>

      {/* Match Header */}
      <div className={`rounded-2xl border overflow-hidden ${isFinal ? "border-[var(--wc-accent)] shadow-lg shadow-[var(--wc-accent)]/10" : "border-gray-200"} bg-white`}>
        {isFinal && (
          <div className="bg-gradient-to-r from-[var(--wc-accent)] to-[var(--wc-accent-dark)] text-white text-center py-2">
            <Trophy className="h-5 w-5 inline mr-2" />
            <span className="text-sm font-bold tracking-wider uppercase">{`Final del Mundial ${year}`}</span>
          </div>
        )}
        <div className="p-6 sm:p-10">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px]">
              <Calendar className="h-3 w-3 mr-1" />
              {partido.fecha}
            </Badge>
            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px]">
              <Clock className="h-3 w-3 mr-1" />
              {partido.hora}
            </Badge>
            {partido.grupo && (
              <Badge className="bg-[var(--wc-accent)]/10 text-[var(--wc-accent-dark)] border-0 text-[10px]">
                Grupo {partido.grupo.nombre}
              </Badge>
            )}
            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px]">
              {partido.ronda}
            </Badge>
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className={`flex flex-col items-center gap-3 ${winner === 1 ? "" : winner === 2 ? "opacity-50" : ""}`}>
              <Flag code={partido.equipo1?.fifaCode} size={64} />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-[var(--wc-black)]">{partido.equipo1?.nombre}</p>
                <p className="text-xs text-muted-foreground">{partido.equipo1?.fifaCode}</p>
              </div>
              {winner === 1 && (
                <Badge className="bg-emerald-500 text-white border-0 text-[10px]">Ganador</Badge>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              {played ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-4xl sm:text-6xl font-black ${winner === 1 ? "text-[var(--wc-accent-dark)]" : "text-gray-400"}`}>
                      {partido.marcador.ft[0]}
                    </span>
                    <span className="text-2xl sm:text-3xl text-gray-300">–</span>
                    <span className={`text-4xl sm:text-6xl font-black ${winner === 2 ? "text-[var(--wc-accent-dark)]" : "text-gray-400"}`}>
                      {partido.marcador.ft[1]}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
                    {partido.marcador.ht && partido.marcador.ht.length === 2 && (
                      <span>MT: {partido.marcador.ht[0]}-{partido.marcador.ht[1]}</span>
                    )}
                    {partido.marcador.et && partido.marcador.et.length === 2 && (
                      <span>ET: {partido.marcador.et[0]}-{partido.marcador.et[1]}</span>
                    )}
                    {partido.marcador.p && partido.marcador.p.length === 2 && (
                      <span>PEN: {partido.marcador.p[0]}-{partido.marcador.p[1]}</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-300">vs</p>
                  <p className="text-xs text-muted-foreground mt-1">Por jugar</p>
                </div>
              )}
            </div>

            <div className={`flex flex-col items-center gap-3 ${winner === 2 ? "" : winner === 1 ? "opacity-50" : ""}`}>
              <Flag code={partido.equipo2?.fifaCode} size={64} />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-[var(--wc-black)]">{partido.equipo2?.nombre}</p>
                <p className="text-xs text-muted-foreground">{partido.equipo2?.fifaCode}</p>
              </div>
              {winner === 2 && (
                <Badge className="bg-emerald-500 text-white border-0 text-[10px]">Ganador</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {played && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-b from-[var(--wc-accent)]/5 to-white border border-[var(--wc-accent)]/10 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goles Totales</p>
            <p className="text-2xl font-black text-[var(--wc-black)]">{(partido.goles1?.length || 0) + (partido.goles2?.length || 0)}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-emerald-500/5 to-white border border-emerald-500/10 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">1er Tiempo</p>
            <p className="text-2xl font-black text-[var(--wc-black)]">{partido.marcador.ht?.[0] ?? 0} – {partido.marcador.ht?.[1] ?? 0}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-amber-500/5 to-white border border-amber-500/10 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">2do Tiempo</p>
            <p className="text-2xl font-black text-[var(--wc-black)]">{(partido.marcador.ft?.[0] ?? 0) - (partido.marcador.ht?.[0] ?? 0)} – {(partido.marcador.ft?.[1] ?? 0) - (partido.marcador.ht?.[1] ?? 0)}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Goals Timeline */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[var(--wc-accent)] flex items-center justify-center">
                <Footprints className="h-3.5 w-3.5 text-white" />
              </div>
              Goles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!played && <p className="text-sm text-muted-foreground">Aún no se han jugado</p>}
            {played && (partido.goles1?.length || 0) + (partido.goles2?.length || 0) === 0 && (
              <p className="text-sm text-muted-foreground">Sin goles</p>
            )}

            {/* Team 1 goals */}
            {partido.goles1?.map((g, i) => (
              <div key={`g1-${i}`} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                <Flag code={partido.equipo1?.fifaCode} size={16} />
                <span className="text-xs text-muted-foreground w-8 font-mono">{g.minuto}&apos;</span>
                <span className="text-sm text-[var(--wc-black)] flex-1">{g.nombre}</span>
                <div className="flex gap-1">
                  {g.penalti && <Badge className="bg-[var(--wc-accent)]/10 text-[var(--wc-accent-dark)] text-[8px] border-0">PEN</Badge>}
                  {g.autogol && <Badge className="bg-red-100 text-red-600 text-[8px] border-0">OG</Badge>}
                </div>
              </div>
            ))}
            {/* Team 2 goals */}
            {partido.goles2?.map((g, i) => (
              <div key={`g2-${i}`} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-orange-50/50 border border-orange-100/50">
                <Flag code={partido.equipo2?.fifaCode} size={16} />
                <span className="text-xs text-muted-foreground w-8 font-mono">{g.minuto}&apos;</span>
                <span className="text-sm text-[var(--wc-black)] flex-1">{g.nombre}</span>
                <div className="flex gap-1">
                  {g.penalti && <Badge className="bg-[var(--wc-accent)]/10 text-[var(--wc-accent-dark)] text-[8px] border-0">PEN</Badge>}
                  {g.autogol && <Badge className="bg-red-100 text-red-600 text-[8px] border-0">OG</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stadium */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[var(--wc-accent)]/10 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-[var(--wc-accent-dark)]" />
              </div>
              Estadio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {partido.estadio ? (
              <>
                <div>
                  <p className="text-lg font-bold text-[var(--wc-black)]">{partido.estadio.nombre}</p>
                  <p className="text-sm text-muted-foreground">{partido.estadio.ciudad}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Capacidad</p>
                    <p className="text-sm font-bold text-[var(--wc-black)]">
                      {partido.estadio.capacidad?.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pais</p>
                    <p className="text-sm font-bold text-[var(--wc-black)] uppercase">
                      {partido.estadio.codigoPais}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin información de estadio</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {played && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider mb-0.5">Numero</p>
                <p className="font-bold text-[var(--wc-black)]">#{partido.numeroPartido}</p>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider mb-0.5">Ronda</p>
                <p className="font-bold text-[var(--wc-black)]">{partido.ronda}</p>
              </div>
              {partido.grupo && (
                <>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5">Grupo</p>
                    <p className="font-bold text-[var(--wc-black)]">{partido.grupo.nombre}</p>
                  </div>
                </>
              )}
              {isKnockout && (
                <>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5">Tipo</p>
                    <p className="font-bold text-[var(--wc-accent-dark)]">Eliminatoria</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
