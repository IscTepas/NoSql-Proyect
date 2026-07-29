"use client";

import useSWR from "swr";
import type { Jugador, Partido, Equipo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCircle, Shield, Target, Users, Building2, Cake, Flag as FlagIcon, Medal } from "lucide-react";
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

const FLAG_GRADIENTS: Record<string, [string, string, string]> = {
  ARG: ["#74acdf", "#ffffff", "#74acdf"], AUS: ["#012169", "#ffcd00", "#00843d"],
  BRA: ["#009c3b", "#ffdf00", "#002776"], COL: ["#fcd116", "#003893", "#ce1126"],
  ECU: ["#ffdd00", "#034ea2", "#ed1c24"], EGY: ["#ce1126", "#ffffff", "#000000"],
  ENG: ["#f3f4f6", "#ce1124", "#ffffff"], ESP: ["#aa151b", "#f1bf00", "#aa151b"],
  FRA: ["#002654", "#ffffff", "#ed2939"], GER: ["#111111", "#dd0000", "#ffcc00"],
  MEX: ["#006847", "#ffffff", "#ce1126"], NED: ["#ae1c28", "#ffffff", "#21468b"],
  NOR: ["#ba0c2f", "#ffffff", "#00205b"], POR: ["#046a38", "#da291c", "#ffcc00"],
  RUS: ["#ffffff", "#0039a6", "#d52b1e"], SEN: ["#00853f", "#fdef42", "#e31b23"],
  SUI: ["#d52b1e", "#ffffff", "#d52b1e"], URU: ["#5bc0eb", "#ffffff", "#f6b40e"],
};

function getFlagGradient(code: string): [string, string, string] {
  return FLAG_GRADIENTS[code] || ["#2563eb", "#ffffff", "#c8a951"];
}

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

  const generalStats = useMemo(() => {
    if (!jugadores) return { teams: 0, clubs: 0, averageAge: 0 };
    const teams = new Set(jugadores.map((j) => j.fifaCodeEquipo).filter(Boolean)).size;
    const clubs = new Set(jugadores.map((j) => j.club?.nombre).filter(Boolean)).size;
    const ages = jugadores
      .map((j) => j.fechaNacimiento ? year - new Date(j.fechaNacimiento).getUTCFullYear() : null)
      .filter((age): age is number => age !== null && age > 15 && age < 50);
    const averageAge = ages.length ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
    return { teams, clubs, averageAge };
  }, [jugadores, year]);

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
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Jugadores", value: jugadores?.length || 0, icon: Users, color: "#2563eb", background: "from-blue-500/15 to-blue-500/[0.03]" },
              { label: "Selecciones", value: generalStats.teams, icon: FlagIcon, color: "#16a34a", background: "from-emerald-500/15 to-emerald-500/[0.03]" },
              { label: "Clubes", value: generalStats.clubs, icon: Building2, color: "#9333ea", background: "from-purple-500/15 to-purple-500/[0.03]" },
              { label: "Edad promedio", value: generalStats.averageAge ? generalStats.averageAge.toFixed(1) : "—", icon: Cake, color: "#d97706", background: "from-amber-500/15 to-amber-500/[0.03]" },
            ].map((stat) => (
              <Card key={stat.label} className={`overflow-hidden border-0 bg-gradient-to-br ${stat.background} shadow-sm`}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: stat.color }}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[var(--wc-black)]">{stat.value}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <Card className="relative overflow-hidden border-[var(--wc-gold)]/20 bg-gradient-to-br from-white to-[var(--wc-gold)]/[0.05] md:col-span-2 shadow-sm">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--wc-gold)]/10 blur-2xl" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--wc-gold)]/15"><Shield className="h-4 w-4 text-[var(--wc-gold-dark)]" /></div>
                  Plantel por posición
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {posDistribution.map((p) => {
                  const percentage = (p.value / (jugadores?.length || 1)) * 100;
                  return (
                    <div key={p.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_COLORS[p.key] }} />
                          <span className="text-xs font-semibold text-[var(--wc-black)]">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs"><span className="font-black">{p.value}</span><span className="w-9 text-right text-[10px] text-muted-foreground">{percentage.toFixed(1)}%</span></div>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 shadow-inner">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${POS_COLORS[p.key]}, ${POS_COLORS[p.key]}aa)` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-[var(--wc-gold)]/20 bg-gradient-to-br from-white via-white to-blue-500/[0.04] md:col-span-3 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10"><Target className="h-4 w-4 text-blue-600" /></div>
                  Máximos goleadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScorers.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {topScorers.slice(0, 3).map((scorer, index) => (
                        <div key={scorer.nombre} className={`relative rounded-xl border p-2.5 text-center ${index === 0 ? "border-[var(--wc-gold)]/40 bg-[var(--wc-gold)]/10" : "border-gray-200 bg-gray-50/70"}`}>
                          <Medal className={`mx-auto mb-1 h-4 w-4 ${index === 0 ? "text-[var(--wc-gold-dark)]" : index === 1 ? "text-slate-500" : "text-amber-700"}`} />
                          <Flag code={scorer.fifaCode} size={22} className="mx-auto mb-1" />
                          <p className="truncate text-[10px] font-bold">{scorer.nombre}</p>
                          <p className="text-sm font-black" style={{ color: index === 0 ? "var(--wc-gold-dark)" : "var(--wc-black)" }}>{scorer.goles} goles</p>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={topScorers.slice(0, 8).map((scorer) => ({ ...scorer, chartLabel: `${scorer.nombre} · ${scorer.fifaCode}` }))} layout="vertical" margin={{ left: 0, right: 18 }}>
                        <defs>
                          {topScorers.slice(0, 8).map((scorer, index) => {
                            const colors = getFlagGradient(scorer.fifaCode);
                            return (
                              <linearGradient key={scorer.nombre} id={`flag-gradient-${year}-${index}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={colors[0]} />
                                <stop offset="50%" stopColor={colors[1]} />
                                <stop offset="100%" stopColor={colors[2]} />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="chartLabel" width={125} tick={{ fontSize: 9, fill: "#505B73" }} />
                        <Tooltip cursor={{ fill: "rgba(200,169,81,0.06)" }} contentStyle={{ backgroundColor: "white", border: "1px solid rgba(200,169,81,.25)", borderRadius: "10px", fontSize: "11px", boxShadow: "0 8px 20px rgba(0,0,0,.08)" }} />
                        <Bar dataKey="goles" radius={[0, 6, 6, 0]} barSize={13}>
                          {topScorers.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={`url(#flag-gradient-${year}-${i})`} stroke="rgba(3,18,43,0.12)" strokeWidth={0.5} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay goleadores aún</p>
                )}
              </CardContent>
            </Card>
          </div>
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
