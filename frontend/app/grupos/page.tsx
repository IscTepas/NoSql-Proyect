"use client";

import useSWR from "swr";
import type { Grupo, Partido } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, Clock, Target } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

interface Standing {
  code: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

function computeStandings(grupo: Grupo, partidos: Partido[]): Standing[] {
  const stats: Record<string, Standing> = {};

  grupo.equipos.forEach((eq) => {
    stats[eq.fifaCode] = {
      code: eq.fifaCode,
      nombre: eq.nombre,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0,
    };
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

  return Object.values(stats)
    .map((s) => ({ ...s, dg: s.gf - s.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

function getRowBg(index: number): string {
  if (index < 2) return "rgba(85,155,100,0.05)";
  if (index < 3) return "rgba(180,140,60,0.05)";
  return "rgba(180,70,70,0.05)";
}

function getRowBorder(index: number): string {
  if (index < 2) return "var(--wc-green)";
  if (index < 3) return "var(--wc-gold)";
  return "var(--wc-red)";
}

function getBadgeClass(index: number): string {
  if (index < 2) return "bg-[var(--wc-green)] text-white";
  if (index < 3) return "bg-[var(--wc-gold)] text-white";
  return "bg-[var(--wc-red)] text-white";
}

function getLabel(index: number): string {
  if (index < 2) return "Clasificado";
  if (index < 3) return "3er puesto";
  return "Eliminado";
}

export default function GruposPage() {
  const { data: grupos, isLoading: lGrupos } = useSWR<Grupo[]>("/api/grupos", fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>("/api/partidos", fetcher);
  const [selectedGroup, setSelectedGroup] = useState<string>("A");

  const loading = lGrupos || lPartidos;

  const groupNames = useMemo(() => {
    if (!grupos) return [];
    return grupos.map((g) => g.nombre).sort();
  }, [grupos]);

  const currentGrupo = useMemo(() => {
    if (!grupos) return null;
    return grupos.find((g) => g.nombre === selectedGroup) || null;
  }, [grupos, selectedGroup]);

  const standings = useMemo(() => {
    if (!currentGrupo || !partidos) return [];
    return computeStandings(currentGrupo, partidos);
  }, [currentGrupo, partidos]);

  const groupMatches = useMemo(() => {
    if (!currentGrupo || !partidos) return [];
    return partidos
      .filter((p) => p.grupo && p.grupo._id === currentGrupo._id)
      .sort((a, b) => a.numeroPartido - b.numeroPartido);
  }, [currentGrupo, partidos]);

  const groupStats = useMemo(() => {
    if (standings.length === 0) return { totalGoals: 0, totalMatches: 0, avgGoals: "0" };
    const totalGoals = standings.reduce((sum, s) => sum + s.gf, 0) / 2;
    const totalMatches = standings.reduce((sum, s) => sum + s.pj, 0) / 2;
    return {
      totalGoals,
      totalMatches,
      avgGoals: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0",
    };
  }, [standings]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Grupos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tablas de posiciones y calendario por grupo
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {groupNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedGroup(name)}
            className={`h-10 w-10 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedGroup === name
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground hover:shadow-sm"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {currentGrupo && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[var(--wc-gold)]" />
                    Grupo {selectedGroup}
                  </span>
                  <div className="flex gap-1.5">
                    <Badge className="bg-[var(--wc-green)] text-white text-[10px] border-0">Clasificado</Badge>
                    <Badge className="bg-[var(--wc-gold)] text-white text-[10px] border-0">3er</Badge>
                    <Badge className="bg-[var(--wc-red)] text-white text-[10px] border-0">Eliminado</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipo</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PJ</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PE</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PP</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GF</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GC</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">DG</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr
                          key={s.code}
                          className="border-b last:border-0 transition-colors duration-150"
                          style={{ backgroundColor: getRowBg(i), borderLeft: `4px solid ${getRowBorder(i)}` }}
                        >
                          <td className="py-3 px-4">
                            <Badge className={`${getBadgeClass(i)} text-[10px] border-0 font-bold min-w-[20px] justify-center`}>
                              {i + 1}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Flag code={s.code} size={24} />
                              <div>
                                <p className="text-sm font-semibold">{s.code}</p>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{s.nombre}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-sm">{s.pj}</td>
                          <td className="text-center py-3 px-4 text-sm font-medium text-[var(--wc-green)]">{s.pg}</td>
                          <td className="text-center py-3 px-4 text-sm font-medium text-[var(--wc-orange)]">{s.pe}</td>
                          <td className="text-center py-3 px-4 text-sm font-medium text-[var(--wc-red)]">{s.pp}</td>
                          <td className="text-center py-3 px-4 text-sm">{s.gf}</td>
                          <td className="text-center py-3 px-4 text-sm">{s.gc}</td>
                          <td className="text-center py-3 px-4 text-sm font-semibold">
                            <span className={s.dg > 0 ? "text-[var(--wc-green)]" : s.dg < 0 ? "text-[var(--wc-red)]" : ""}>
                              {s.dg > 0 ? `+${s.dg}` : s.dg}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center justify-center h-7 min-w-[28px] rounded-md bg-primary text-primary-foreground text-sm font-bold">
                              {s.pts}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Estadisticas del Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{groupStats.totalMatches}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Partidos</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{groupStats.totalGoals}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Goles</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{groupStats.avgGoals}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--wc-gold)]" />
                  Calendario - Grupo {selectedGroup}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupMatches.map((p) => {
                  const played = p.marcador.ft && p.marcador.ft.length === 2;
                  return (
                    <div
                      key={p._id}
                      className="rounded-xl border border-border/60 p-3 hover:shadow-md hover:shadow-black/[0.03] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Jornada {p.numeroPartido}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {p.fecha}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Flag code={p.equipo1?.fifaCode} size={20} />
                          <span className="text-xs font-semibold truncate">{p.equipo1?.fifaCode}</span>
                        </div>
                        <div className="flex flex-col items-center mx-2 shrink-0">
                          {played ? (
                            <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">
                              {p.marcador.ft[0]} - {p.marcador.ft[1]}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">{p.hora?.split(" ")[0]}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <span className="text-xs font-semibold truncate">{p.equipo2?.fifaCode}</span>
                          <Flag code={p.equipo2?.fifaCode} size={20} />
                        </div>
                      </div>
                      {p.estadio && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {p.estadio.nombre}, {p.estadio.ciudad}
                        </div>
                      )}
                    </div>
                  );
                })}
                {groupMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay partidos programados para este grupo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
