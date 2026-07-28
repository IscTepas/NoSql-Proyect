"use client";

import useSWR from "swr";
import type { Grupo, Partido, Equipo } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, X, Target, Shield } from "lucide-react";
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

function getPositionStyle(index: number) {
  if (index < 2) return { dot: "bg-emerald-500", row: "hover:bg-emerald-50/50" };
  if (index < 3) return { dot: "bg-amber-400", row: "hover:bg-amber-50/50" };
  return { dot: "bg-red-400", row: "hover:bg-red-50/50" };
}

function GroupCard({
  grupo,
  partidos,
  onTeamClick,
}: {
  grupo: Grupo;
  partidos: Partido[];
  onTeamClick: (standing: Standing) => void;
}) {
  const standings = useMemo(() => computeStandings(grupo, partidos), [grupo, partidos]);

  return (
    <div className="bg-white rounded-2xl border border-[var(--wc-gold)]/15 shadow-sm hover:shadow-md hover:shadow-[var(--wc-gold)]/5 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--wc-gold)]/10 via-[var(--wc-gold)]/5 to-transparent px-4 py-3 border-b border-[var(--wc-gold)]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center">
              <span className="text-white text-xs font-black">{grupo.nombre}</span>
            </div>
            <span className="text-sm font-bold text-[var(--wc-black)]">Grupo {grupo.nombre}</span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {grupo.equipos.length} selecciones
          </span>
        </div>
      </div>

      {/* Teams Table */}
      <div className="divide-y divide-[var(--wc-gold)]/5">
        {standings.map((s, i) => {
          const pos = getPositionStyle(i);
          return (
            <button
              key={s.code}
              onClick={() => onTeamClick(s)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-150 cursor-pointer ${pos.row}`}
            >
              {/* Position dot */}
              <span className={`h-2 w-2 rounded-full shrink-0 ${pos.dot}`} />

              {/* Position number */}
              <span className="text-xs font-bold text-muted-foreground w-4 text-center shrink-0">
                {i + 1}
              </span>

              {/* Flag + Name */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Flag code={s.code} size={24} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--wc-black)] truncate">
                    {s.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.confederacion}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>PJ <span className="font-medium text-[var(--wc-black)]">{s.pj}</span></span>
                  <span>PG <span className="font-medium text-emerald-600">{s.pg}</span></span>
                  <span>PE <span className="font-medium text-amber-600">{s.pe}</span></span>
                  <span>PP <span className="font-medium text-red-500">{s.pp}</span></span>
                </div>

                {/* GF:GC */}
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {s.gf}:{s.gc}
                </span>

                {/* DG */}
                <span className={`text-[11px] font-bold tabular-nums w-7 text-right ${
                  s.dg > 0 ? "text-emerald-600" : s.dg < 0 ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {s.dg > 0 ? `+${s.dg}` : s.dg}
                </span>

                {/* Points */}
                <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)]/10 flex items-center justify-center">
                  <span className="text-sm font-black text-[var(--wc-gold-dark)]">{s.pts}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
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

          <div className="flex items-center justify-center gap-3 py-3 bg-[var(--wc-gold)]/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Puntos</span>
            <span className="text-3xl font-black text-[var(--wc-gold-dark)]">{standing.pts}</span>
          </div>

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
  const { data: grupos, isLoading: lGrupos } = useSWR<Grupo[]>("/api/grupos?año=2026", fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>("/api/partidos?año=2026", fetcher);
  const [selectedTeam, setSelectedTeam] = useState<Standing | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  const loading = lGrupos || lPartidos;

  const sortedGrupos = useMemo(() => {
    if (!grupos) return [];
    return [...grupos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [grupos]);

  const selectedGrupo = useMemo(() => {
    if (!selectedGroupName || !grupos) return null;
    return grupos.find((g) => g.nombre === selectedGroupName) || null;
  }, [grupos, selectedGroupName]);

  const teamMatches = useMemo(() => {
    if (!selectedTeam || !selectedGrupo || !partidos) return [];
    return partidos
      .filter((p) => p.grupo && p.grupo._id === selectedGrupo._id)
      .filter((p) => p.equipo1?.fifaCode === selectedTeam.code || p.equipo2?.fifaCode === selectedTeam.code)
      .sort((a, b) => a.numeroPartido - b.numeroPartido);
  }, [selectedTeam, selectedGrupo, partidos]);

  const handleTeamClick = useCallback((standing: Standing, grupoNombre: string) => {
    setSelectedGroupName(grupoNombre);
    setSelectedTeam(standing);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
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
          12 grupos &middot; 4 selecciones cada uno
        </p>
      </div>

      {/* All Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedGrupos.map((grupo) => (
          <GroupCard
            key={grupo._id}
            grupo={grupo}
            partidos={partidos || []}
            onTeamClick={(s) => handleTeamClick(s, grupo.nombre)}
          />
        ))}
      </div>

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
