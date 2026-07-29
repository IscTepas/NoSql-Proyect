"use client";

import useSWR from "swr";
import type { Jugador, Partido, Equipo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCircle, Shield, Target } from "lucide-react";
import Flag from "@/components/Flag";
import PlayerPhoto from "@/components/PlayerPhoto";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

const POSITIONS = [
  { value: "all", label: "Todos" },
  { value: "GK", label: "Porteros", color: "#c8a951" },
  { value: "DF", label: "Defensas", color: "#3b82f6" },
  { value: "MF", label: "Mediocampistas", color: "#22c55e" },
  { value: "FW", label: "Delanteros", color: "#ef4444" },
];

const POS_COLORS: Record<string, string> = {
  GK: "#c8a951",
  DF: "#3b82f6",
  MF: "#22c55e",
  FW: "#ef4444",
};

const POS_LABELS: Record<string, string> = {
  GK: "Portero",
  DF: "Defensa",
  MF: "Mediocampista",
  FW: "Delantero",
};

export default function JugadoresMundial({ year }: { year: number }) {
  const { data: jugadores, isLoading: lJugadores } = useSWR<Jugador[]>(`/api/jugadores?año=${year}`, fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);

  const [busqueda, setBusqueda] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [equipoFilter, setEquipoFilter] = useState("all");
  const [showStats, setShowStats] = useState(true);

  const loading = lJugadores || lPartidos;

  const filtered = useMemo(() => {
    if (!jugadores) return [];
    return jugadores.filter((j) => {
      const matchSearch =
        j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.fifaCodeEquipo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (j.equipo?.nombre || "").toLowerCase().includes(busqueda.toLowerCase());
      const matchPos = posFilter === "all" || j.posicion === posFilter;
      const matchEquipo = equipoFilter === "all" || j.fifaCodeEquipo === equipoFilter;
      return matchSearch && matchPos && matchEquipo;
    });
  }, [jugadores, busqueda, posFilter, equipoFilter]);

  const posDistribution = useMemo(() => {
    if (!jugadores) return [];
    const counts: Record<string, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
    jugadores.forEach((j) => { counts[j.posicion] = (counts[j.posicion] || 0) + 1; });
    return Object.entries(counts).map(([pos, count]) => ({
      name: POS_LABELS[pos] || pos,
      value: count,
      key: pos,
    }));
  }, [jugadores]);

  const topScorers = useMemo(() => {
    if (!partidos) return [];
    const counts: Record<string, { nombre: string; fifaCode: string; goles: number }> = {};

    partidos.forEach((p) => {
      const addGoals = (gols: Partido["goles1"], team: Equipo | undefined) => {
        if (!gols) return;
        gols.forEach((g) => {
          if (g.autogol) return;
          if (!counts[g.nombre]) {
            counts[g.nombre] = { nombre: g.nombre, fifaCode: team?.fifaCode || "", goles: 0 };
          }
          counts[g.nombre].goles++;
        });
      };
      addGoals(p.goles1, p.equipo1);
      addGoals(p.goles2, p.equipo2);
    });

    return Object.values(counts)
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 10);
  }, [partidos]);

  const teamCounts = useMemo(() => {
    if (!jugadores) return [];
    const counts: Record<string, number> = {};
    jugadores.forEach((j) => {
      counts[j.fifaCodeEquipo] = (counts[j.fifaCodeEquipo] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count }));
  }, [jugadores]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
            <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center">
              <UserCircle className="h-4 w-4 text-white" />
            </div>
            Jugadores
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} de {jugadores?.length ?? 0} jugadores
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)] border border-[var(--wc-gold)]/20 hover:bg-[var(--wc-gold)]/20 transition-colors"
        >
          {showStats ? "Ocultar" : "Mostrar"} estadísticas
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, equipo o codigo FIFA..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 border-[var(--wc-gold)]/20 focus-visible:ring-[var(--wc-gold)]/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos.value}
              onClick={() => setPosFilter(pos.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                posFilter === pos.value
                  ? pos.value === "all"
                    ? "bg-[var(--wc-gold)] text-white shadow-md"
                    : "text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={posFilter === pos.value && pos.value !== "all" ? { backgroundColor: pos.color } : undefined}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Team filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setEquipoFilter("all")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
              equipoFilter === "all"
                ? "bg-[var(--wc-gold)] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {teamCounts.slice(0, 16).map((t) => (
            <button
              key={t.code}
              onClick={() => setEquipoFilter(equipoFilter === t.code ? "all" : t.code)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                equipoFilter === t.code
                  ? "bg-[var(--wc-gold)] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Flag code={t.code} size={12} />
              {t.code}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Panels */}
      {showStats && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--wc-gold-dark)]" />
                Por Posición
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {posDistribution.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 truncate">{p.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(p.value / (jugadores?.length || 1)) * 100}%`,
                        backgroundColor: POS_COLORS[p.key],
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--wc-black)] w-8 text-right">{p.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--wc-gold-dark)]" />
                Top Goleadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topScorers} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={110}
                      tick={{ fontSize: 10, fill: "#888" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="goles" radius={[0, 4, 4, 0]}>
                      {topScorers.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#c8a951" : "#e5e7eb"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay goleadores aún</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((j) => (
          <div
            key={j._id}
            className="group rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:shadow-[var(--wc-gold)]/10 hover:border-[var(--wc-gold)]/30 transition-all duration-200 overflow-hidden"
          >
            <div className="p-3 space-y-2">
              <PlayerPhoto jugador={j} />
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ backgroundColor: POS_COLORS[j.posicion] }}
                >
                  {POS_LABELS[j.posicion]?.charAt(0) || j.posicion}
                </span>
                <span className="text-xs font-mono text-muted-foreground">#{j.numero}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--wc-black)] truncate group-hover:text-[var(--wc-gold-dark)] transition-colors">
                  {j.nombre}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Flag code={j.fifaCodeEquipo} size={14} />
                  <span className="text-[10px] text-muted-foreground">{j.fifaCodeEquipo}</span>
                </div>
              </div>
              {j.club && (
                <p className="text-[9px] text-muted-foreground truncate">{j.club.nombre}</p>
              )}
            </div>
            <div
              className="h-0.5 w-full"
              style={{ backgroundColor: POS_COLORS[j.posicion] }}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-muted-foreground">No se encontraron jugadores con esos filtros</p>
        </div>
      )}
    </div>
  );
}
