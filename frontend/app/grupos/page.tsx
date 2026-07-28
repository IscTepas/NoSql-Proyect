"use client";

import useSWR from "swr";
import type { Grupo, Partido, Equipo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, Clock, X, Target, Shield, Globe } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useState, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

interface Standing {
  code: string;
  nombre: string;
  confederacion: string;
  continente: string;
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
      confederacion: eq.confederacion,
      continente: eq.continente,
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

function getPositionColor(index: number) {
  if (index < 2) return { bg: "bg-emerald-50", border: "border-emerald-400", badge: "bg-emerald-500 text-white", label: "Clasificado" };
  if (index < 3) return { bg: "bg-amber-50", border: "border-amber-400", badge: "bg-amber-500 text-white", label: "3er Lugar" };
  return { bg: "bg-red-50", border: "border-red-300", badge: "bg-red-400 text-white", label: "Eliminado" };
}

function CountryCard({ standing, position, onClick }: { standing: Standing; position: number; onClick: () => void }) {
  const posStyle = getPositionColor(position);
  return (
    <button
      onClick={onClick}
      className={`group relative ${posStyle.bg} rounded-xl border ${posStyle.border} p-4 text-left transition-all duration-200 hover:shadow-lg hover:shadow-[var(--wc-gold)]/10 hover:-translate-y-0.5 cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Flag code={standing.code} size={40} />
          <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full ${posStyle.badge} text-[9px] font-bold flex items-center justify-center shadow-sm`}>
            {position + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-[var(--wc-black)] truncate group-hover:text-[var(--wc-gold-dark)] transition-colors">
            {standing.nombre}
          </p>
          <p className="text-[10px] text-muted-foreground">{standing.confederacion}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[var(--wc-gold-dark)]">{standing.pts}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Pts</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>PJ: {standing.pj}</span>
          <span>PG: <span className="text-emerald-600 font-medium">{standing.pg}</span></span>
          <span>PE: <span className="text-amber-600 font-medium">{standing.pe}</span></span>
          <span>PP: <span className="text-red-500 font-medium">{standing.pp}</span></span>
        </div>
        <span className={`text-[10px] font-semibold ${standing.dg > 0 ? "text-emerald-600" : standing.dg < 0 ? "text-red-500" : "text-muted-foreground"}`}>
          DG {standing.dg > 0 ? `+${standing.dg}` : standing.dg}
        </span>
      </div>
    </button>
  );
}

function TeamPopup({ standing, matches, onClose }: { standing: Standing; matches: Partido[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[var(--wc-gold)]/10 to-white p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-4">
            <Flag code={standing.code} size={56} />
            <div>
              <h2 className="text-xl font-black text-[var(--wc-black)]">{standing.nombre}</h2>
              <p className="text-sm text-muted-foreground">{standing.code} &middot; {standing.confederacion}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "PJ", value: standing.pj, icon: Shield },
              { label: "PG", value: standing.pg, icon: Trophy },
              { label: "GF", value: standing.gf, icon: Target },
              { label: "GC", value: standing.gc, icon: Target },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-lg bg-[var(--wc-gold)]/5">
                <p className="text-lg font-black text-[var(--wc-black)]">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Points highlight */}
          <div className="flex items-center justify-center gap-3 py-3 bg-[var(--wc-gold)]/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Puntos</span>
            <span className="text-3xl font-black text-[var(--wc-gold-dark)]">{standing.pts}</span>
          </div>

          {/* Matches */}
          {matches.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Partidos</h3>
              <div className="space-y-1.5">
                {matches.map((m) => {
                  const played = m.marcador.ft && m.marcador.ft.length === 2;
                  const isHome = m.equipo1?.fifaCode === standing.code;
                  const opponent = isHome ? m.equipo2 : m.equipo1;
                  const opponentScore = played ? (isHome ? m.marcador.ft[1] : m.marcador.ft[0]) : null;
                  const myScore = played ? (isHome ? m.marcador.ft[0] : m.marcador.ft[1]) : null;
                  const won = played && myScore !== null && opponentScore !== null && myScore > opponentScore;
                  const draw = played && myScore === opponentScore;

                  return (
                    <div
                      key={m._id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        won ? "bg-emerald-50 border border-emerald-200" :
                        draw ? "bg-amber-50 border border-amber-200" :
                        "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flag code={opponent?.fifaCode} size={16} />
                        <span className="font-medium">{opponent?.fifaCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {played ? (
                          <span className={`font-bold ${won ? "text-emerald-600" : draw ? "text-amber-600" : "text-red-500"}`}>
                            {myScore} - {opponentScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono">{m.fecha}</span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          won ? "bg-emerald-500 text-white" :
                          draw ? "bg-amber-500 text-white" :
                          "bg-red-400 text-white"
                        }`}>
                          {won ? "W" : draw ? "D" : "L"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GruposPage() {
  const { data: grupos, isLoading: lGrupos } = useSWR<Grupo[]>("/api/grupos", fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>("/api/partidos", fetcher);
  const [selectedGroup, setSelectedGroup] = useState<string>("A");
  const [selectedTeam, setSelectedTeam] = useState<Standing | null>(null);

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

  const teamMatches = useMemo(() => {
    if (!selectedTeam || !currentGrupo || !partidos) return [];
    return partidos
      .filter((p) => p.grupo && p.grupo._id === currentGrupo._id)
      .filter((p) => p.equipo1?.fifaCode === selectedTeam.code || p.equipo2?.fifaCode === selectedTeam.code)
      .sort((a, b) => a.numeroPartido - b.numeroPartido);
  }, [selectedTeam, currentGrupo, partidos]);

  const handleTeamClick = useCallback((standing: Standing) => {
    setSelectedTeam(standing);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          Grupos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona un grupo para ver las selecciones
        </p>
      </div>

      {/* Group Selector */}
      <div className="flex flex-wrap gap-1.5">
        {groupNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedGroup(name)}
            className={`h-10 w-10 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedGroup === name
                ? "bg-[var(--wc-gold)] text-white shadow-md shadow-[var(--wc-gold)]/25"
                : "bg-[var(--wc-gold)]/10 hover:bg-[var(--wc-gold)]/20 text-[var(--wc-black)] hover:shadow-sm"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Country Cards Grid */}
      {currentGrupo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {standings.map((s, i) => (
            <CountryCard
              key={s.code}
              standing={s}
              position={i}
              onClick={() => handleTeamClick(s)}
            />
          ))}
        </div>
      )}

      {/* Matches Calendar */}
      {currentGrupo && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Calendario - Grupo {selectedGroup}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partidos
              ?.filter((p) => p.grupo && p.grupo._id === currentGrupo._id)
              .sort((a, b) => a.numeroPartido - b.numeroPartido)
              .map((p) => {
                const played = p.marcador.ft && p.marcador.ft.length === 2;
                return (
                  <div
                    key={p._id}
                    className="rounded-xl border border-[var(--wc-gold)]/10 p-3.5 hover:shadow-md hover:shadow-[var(--wc-gold)]/5 transition-all duration-200 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-muted-foreground font-mono">#{p.numeroPartido}</span>
                      <span className="text-[10px] text-muted-foreground">{p.fecha}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Flag code={p.equipo1?.fifaCode} size={22} />
                        <span className="text-xs font-semibold truncate">{p.equipo1?.fifaCode}</span>
                      </div>
                      <div className="flex flex-col items-center mx-2 shrink-0">
                        {played ? (
                          <span className="text-xs font-bold bg-[var(--wc-gold)] text-white px-2.5 py-0.5 rounded-md">
                            {p.marcador.ft[0]} - {p.marcador.ft[1]}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">{p.hora?.split(" ")[0]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                        <span className="text-xs font-semibold truncate">{p.equipo2?.fifaCode}</span>
                        <Flag code={p.equipo2?.fifaCode} size={22} />
                      </div>
                    </div>
                    {p.estadio && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {p.estadio.ciudad}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Team Popup */}
      {selectedTeam && (
        <TeamPopup
          standing={selectedTeam}
          matches={teamMatches}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}
