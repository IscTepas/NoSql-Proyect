"use client";

import useSWR from "swr";
import type { Partido, Equipo, Estadio, Grupo } from "@/lib/types";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Calendar, Trophy, TrendingUp, Target } from "lucide-react";
import Flag from "@/components/Flag";
import Link from "next/link";
import { useMemo } from "react";
import WCGeometry from "@/components/WCGeometry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

function MiniGroupTable({ grupo, partidos }: { grupo: Grupo; partidos: Partido[] }) {
  const standings = useMemo(() => {
    const stats: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};

    grupo.equipos.forEach((eq) => {
      stats[eq.fifaCode] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    });

    partidos.forEach((p) => {
      if (!p.grupo || p.grupo._id !== grupo._id) return;
      if (!p.marcador.ft || p.marcador.ft.length < 2) return;

      const [g1, g2] = p.marcador.ft;
      const c1 = p.equipo1.fifaCode;
      const c2 = p.equipo2.fifaCode;

      if (!stats[c1] || !stats[c2]) return;

      stats[c1].pj++;
      stats[c2].pj++;
      stats[c1].gf += g1;
      stats[c1].gc += g2;
      stats[c2].gf += g2;
      stats[c2].gc += g1;

      if (g1 > g2) {
        stats[c1].pg++;
        stats[c1].pts += 3;
        stats[c2].pp++;
      } else if (g1 < g2) {
        stats[c2].pg++;
        stats[c2].pts += 3;
        stats[c1].pp++;
      } else {
        stats[c1].pe++;
        stats[c2].pe++;
        stats[c1].pts++;
        stats[c2].pts++;
      }
    });

    return Object.entries(stats)
      .map(([code, s]) => ({
        code,
        equipo: grupo.equipos.find((e) => e.fifaCode === code),
        ...s,
        dg: s.gf - s.gc,
      }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }, [grupo, partidos]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="font-bold border-[var(--wc-gold)]/30 text-[var(--wc-gold-dark)]">Grupo {grupo.nombre}</Badge>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-[var(--wc-gold)]/10">
            <th className="text-left py-1 font-medium">Equipo</th>
            <th className="text-center py-1 font-medium">PJ</th>
            <th className="text-center py-1 font-medium">Pts</th>
            <th className="text-center py-1 font-medium">DG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.code} className={`border-b last:border-0 ${i < 2 ? "" : "text-muted-foreground"}`}>
              <td className="py-1 flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${i < 2 ? "bg-[var(--wc-green)]" : i < 3 ? "bg-[var(--wc-gold)]" : "bg-[var(--wc-red)]"}`} />
                <Flag code={s.code} size={20} /> {s.code}
              </td>
              <td className="text-center py-1">{s.pj}</td>
              <td className="text-center py-1 font-bold">{s.pts}</td>
              <td className="text-center py-1">{s.dg > 0 ? `+${s.dg}` : s.dg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchCardSmall({ partido }: { partido: Partido }) {
  const played = partido.marcador.ft && partido.marcador.ft.length === 2;
  return (
    <Link href={`/partidos#${partido.numeroPartido}`}>
      <div className="flex items-center justify-between rounded-xl border border-[var(--wc-gold)]/10 p-3.5 hover:bg-[var(--wc-gold)]/[0.03] hover:shadow-md hover:shadow-[var(--wc-gold)]/5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Flag code={partido.equipo1?.fifaCode} size={24} />
          <span className="text-sm font-semibold truncate group-hover:text-[var(--wc-gold-dark)] transition-colors">{partido.equipo1?.fifaCode}</span>
        </div>
        <div className="flex flex-col items-center mx-3 shrink-0">
          {played ? (
            <span className="text-sm font-bold bg-[var(--wc-gold)] text-white px-2.5 py-0.5 rounded-md">
              {partido.marcador.ft[0]} - {partido.marcador.ft[1]}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-mono">{partido.hora?.split(" ")[0]}</span>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="text-sm font-semibold truncate group-hover:text-[var(--wc-gold-dark)] transition-colors">{partido.equipo2?.fifaCode}</span>
          <Flag code={partido.equipo2?.fifaCode} size={24} />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-0.5">
        {partido.fecha}{played ? <> &middot; {partido.estadio?.ciudad}</> : null}
      </p>
    </Link>
  );
}

export default function Mundial2026Page() {
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>("/api/partidos?año=2026", fetcher);
  const { data: equipos, isLoading: lEquipos } = useSWR<Equipo[]>("/api/equipos?año=2026", fetcher);
  const { data: estadios, isLoading: lEstadios } = useSWR<Estadio[]>("/api/estadios?año=2026", fetcher);
  const { data: grupos, isLoading: lGrupos } = useSWR<Grupo[]>("/api/grupos?año=2026", fetcher);

  const loading = lPartidos || lEquipos || lEstadios || lGrupos;

  const confederaciones = useMemo(() => {
    if (!equipos) return 0;
    return new Set(equipos.map((e) => e.confederacion)).size;
  }, [equipos]);

  const { latest, upcoming } = useMemo(() => {
    if (!partidos) return { latest: [] as Partido[], upcoming: [] as Partido[] };
    const played = partidos
      .filter((p) => p.marcador.ft && p.marcador.ft.length === 2)
      .sort((a, b) => b.numeroPartido - a.numeroPartido);
    const notPlayed = partidos
      .filter((p) => !p.marcador.ft || p.marcador.ft.length !== 2)
      .sort((a, b) => a.numeroPartido - b.numeroPartido);
    return { latest: played.slice(0, 5), upcoming: notPlayed.slice(0, 5) };
  }, [partidos]);

  const topScorers = useMemo(() => {
    if (!partidos) return [];
    const counts: Record<string, { nombre: string; equipo: string; goles: number }> = {};

    partidos.forEach((p) => {
      const addGoals = (gols: Partido["goles1"], team: Equipo | undefined) => {
        if (!gols) return;
        gols.forEach((g) => {
          if (g.autogol) return;
          if (!counts[g.nombre]) {
            counts[g.nombre] = {
              nombre: g.nombre,
              equipo: team?.fifaCode || "",
              goles: 0,
            };
          }
          counts[g.nombre].goles++;
        });
      };
      addGoals(p.goles1, p.equipo1);
      addGoals(p.goles2, p.equipo2);
    });

    return Object.values(counts)
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 5);
  }, [partidos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--wc-gold)]/5 to-white">
        <div className="container mx-auto px-4 py-12 space-y-8">
          <div className="text-center space-y-2">
            <Skeleton className="h-12 w-64 mx-auto bg-white/10" />
            <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--wc-gold)]/5 via-white to-[var(--wc-gold)]/10 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <WCGeometry className="absolute top-0 left-0 w-64 h-64 -translate-x-1/4 -translate-y-1/4" />
          <WCGeometry className="absolute bottom-0 right-0 w-80 h-80 translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--wc-gold)]/[0.03] to-transparent" />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-[var(--wc-gold)]/10 border border-[var(--wc-gold)]/20 rounded-full px-4 py-1.5">
              <span className="text-[var(--wc-gold)] text-xs font-semibold tracking-widest uppercase">Estados Unidos &middot; Mexico &middot; Canada</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter">
                <span className="text-[var(--wc-gold)]">FIFA</span>{" "}
                <span className="text-white">World Cup</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[var(--wc-gold)]/40" />
                <span className="text-[var(--wc-gold)] text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter">26</span>
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[var(--wc-gold)]/40" />
              </div>
            </div>
            <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
              48 selecciones, 16 estadios, 104 partidos. La mayor copa del mundo.
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--wc-gold)]/30 to-transparent" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Selecciones" value={equipos?.length ?? 0} icon={Users} color="bg-white text-[var(--wc-black)] border border-[var(--wc-gold)]/10 shadow-sm" />
          <StatCard title="Estadios" value={estadios?.length ?? 0} icon={MapPin} color="bg-[var(--wc-green)]/10 text-[var(--wc-green)]" />
          <StatCard title="Partidos" value={partidos?.length ?? 0} icon={Calendar} color="bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)]" />
          <StatCard title="Confederaciones" value={confederaciones} icon={Trophy} color="bg-[var(--wc-purple)]/10 text-[var(--wc-purple)]" />
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10 space-y-8">
        <Separator className="bg-[var(--wc-gold)]/10" />

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-[var(--wc-gold)]/10 shadow-sm hover:shadow-lg hover:shadow-[var(--wc-gold)]/5 transition-shadow duration-300 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)]/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[var(--wc-gold-dark)]" />
                </div>
                Últimos Resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {latest.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay resultados</p>}
              {latest.map((p) => (
                <MatchCardSmall key={p._id} partido={p} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--wc-gold)]/10 shadow-sm hover:shadow-lg hover:shadow-[var(--wc-gold)]/5 transition-shadow duration-300 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)]/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[var(--wc-gold-dark)]" />
                </div>
                Próximos Partidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No hay partidos pendientes</p>}
              {upcoming.map((p) => (
                <MatchCardSmall key={p._id} partido={p} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--wc-gold)]/10 shadow-sm hover:shadow-lg hover:shadow-[var(--wc-gold)]/5 transition-shadow duration-300 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Goleadores Top
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topScorers.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay goleadores</p>}
              {topScorers.map((s, i) => (
                <div key={s.nombre} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                  <Flag code={s.equipo} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.nombre}</p>
                    <p className="text-xs text-muted-foreground">{s.equipo}</p>
                  </div>
                  <Badge className="bg-[var(--wc-gold)] text-white font-bold border-0">{s.goles}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--wc-gold)]/10 shadow-sm hover:shadow-lg hover:shadow-[var(--wc-gold)]/5 transition-shadow duration-300 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--wc-green)]/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-[var(--wc-green)]" />
                </div>
                Tablas de Posiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {grupos && partidos && (
                <div className="grid grid-cols-2 gap-4">
                  {grupos.slice(0, 4).map((g) => (
                    <MiniGroupTable key={g._id} grupo={g} partidos={partidos} />
                  ))}
                </div>
              )}
              {grupos && (
                <Link href="/grupos" className="block text-center text-sm text-[var(--wc-gold-dark)] hover:text-[var(--wc-gold)] font-medium transition-colors mt-2">
                  Ver todos los grupos →
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
