"use client";

import useSWR from "swr";
import type { Partido } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search, MapPin, Clock, ChevronDown, ChevronUp, Circle } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useState } from "react";

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

const RONDAS = [
  { value: "all", label: "Todas" },
  { value: "Matchday 1", label: "Matchday 1" },
  { value: "Matchday 2", label: "Matchday 2" },
  { value: "Matchday 3", label: "Matchday 3" },
  { value: "Round of 32", label: "Round of 32" },
  { value: "Round of 16", label: "Round of 16" },
  { value: "Quarter-final", label: "Quarter-final" },
  { value: "Semi-final", label: "Semi-final" },
  { value: "Match for third place", label: "3rd Place" },
  { value: "Final", label: "Final" },
];

function getRondaColor(ronda: string): { bg: string; text: string; dot: string } {
  if (ronda.startsWith("Matchday")) return { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" };
  if (ronda === "Round of 32") return { bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-500" };
  if (ronda === "Round of 16") return { bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" };
  if (ronda === "Quarter-final") return { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" };
  if (ronda === "Semi-final") return { bg: "bg-rose-500/10", text: "text-rose-600", dot: "bg-rose-500" };
  if (ronda === "Match for third place") return { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" };
  if (ronda === "Final") return { bg: "bg-[var(--wc-accent)]/10", text: "text-[var(--wc-accent-dark)]", dot: "bg-[var(--wc-accent)]" };
  return { bg: "bg-gray-500/10", text: "text-gray-600", dot: "bg-gray-500" };
}

function MatchCard({ partido, expanded, onToggle }: { partido: Partido; expanded: boolean; onToggle: () => void }) {
  const played = partido.marcador.ft && partido.marcador.ft.length === 2;
  const colors = getRondaColor(partido.ronda);
  const grupoNombre = partido.grupo?.nombre || "";
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-3.5 h-3.5 rounded-full ${colors.dot} ring-4 ring-background z-10`} />
        <div className="w-px flex-1 bg-[var(--wc-accent)]/10" />
      </div>
      <Card className={`flex-1 mb-4 hover:shadow-lg hover:shadow-[var(--wc-accent)]/5 transition-all duration-300 border-[var(--wc-accent)]/10 cursor-pointer overflow-hidden bg-white ${played ? "border-l-2" : ""}`} style={played ? { borderLeftColor: "var(--wc-green)" } : undefined} onClick={onToggle}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={`${colors.bg} ${colors.text} text-[10px] border-0`}>{partido.ronda}</Badge>
              {grupoNombre && <Badge variant="outline" className="text-[10px] border-[var(--wc-accent)]/20">Grupo {grupoNombre}</Badge>}
              <span className="text-[10px] text-muted-foreground font-mono">#{partido.numeroPartido}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /><span>{partido.fecha}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span>{partido.hora?.split(" ")[0]}</span></div>
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Flag code={partido.equipo1?.fifaCode} size={32} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{partido.equipo1?.nombre || "Por definir"}</p>
                <p className="text-[10px] text-muted-foreground">{partido.equipo1?.fifaCode}</p>
              </div>
            </div>
            <div className="flex flex-col items-center mx-4 shrink-0">
              {played ? (<div className="flex items-center gap-2"><span className={`text-xl font-bold ${partido.marcador.ft[0] > partido.marcador.ft[1] ? "text-[var(--wc-green)]" : ""}`}>{partido.marcador.ft[0]}</span><span className="text-muted-foreground">-</span><span className={`text-xl font-bold ${partido.marcador.ft[1] > partido.marcador.ft[0] ? "text-[var(--wc-green)]" : ""}`}>{partido.marcador.ft[1]}</span></div>) : (<Badge variant="outline" className="text-xs font-mono border-[var(--wc-accent)]/20">VS</Badge>)}
            </div>
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <div className="text-right min-w-0"><p className="text-sm font-semibold truncate">{partido.equipo2?.nombre || "Por definir"}</p><p className="text-[10px] text-muted-foreground">{partido.equipo2?.fifaCode}</p></div>
              <Flag code={partido.equipo2?.fifaCode} size={32} />
            </div>
          </div>
          {partido.estadio && <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span>{partido.estadio.nombre}, {partido.estadio.ciudad}</span></div>}
        </CardContent>
        {expanded && (
          <div className="border-t border-[var(--wc-accent)]/10 p-4 space-y-3 bg-[var(--wc-accent)]/[0.02]">
            {played && (
              <div className="space-y-2">
                {partido.marcador.ht && partido.marcador.ht.length === 2 && <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Medio tiempo:</span><span className="font-mono font-medium">{partido.marcador.ht[0]} - {partido.marcador.ht[1]}</span></div>}
                {partido.marcador.et && partido.marcador.et.length === 2 && <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Tiempo extra:</span><span className="font-mono font-medium">{partido.marcador.et[0]} - {partido.marcador.et[1]}</span></div>}
                {partido.marcador.p && partido.marcador.p.length === 2 && <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Penales:</span><span className="font-mono font-medium">{partido.marcador.p[0]} - {partido.marcador.p[1]}</span></div>}
              </div>
            )}
            {(partido.goles1?.length > 0 || partido.goles2?.length > 0) && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Goles</p>
                <div className="space-y-1">
                  {partido.goles1?.map((g, i) => (<div key={`g1-${i}`} className="flex items-center gap-2 text-xs"><Circle className="h-2 w-2 fill-[var(--wc-green)] text-[var(--wc-green)]" /><span className="font-medium">{g.nombre}</span><span className="text-muted-foreground">{g.minuto}&apos;</span>{g.penalti && <Badge className="bg-[var(--wc-accent)]/10 text-[var(--wc-accent-dark)] text-[8px] border-0">PEN</Badge>}{g.autogol && <Badge className="bg-[var(--wc-red)] text-white text-[8px] border-0">OG</Badge>}</div>))}
                  {partido.goles2?.map((g, i) => (<div key={`g2-${i}`} className="flex items-center gap-2 text-xs"><Circle className="h-2 w-2 fill-[var(--wc-orange)] text-[var(--wc-orange)]" /><span className="font-medium">{g.nombre}</span><span className="text-muted-foreground">{g.minuto}&apos;</span>{g.penalti && <Badge className="bg-[var(--wc-accent)]/10 text-[var(--wc-accent-dark)] text-[8px] border-0">PEN</Badge>}{g.autogol && <Badge className="bg-[var(--wc-red)] text-white text-[8px] border-0">OG</Badge>}</div>))}
                </div>
              </div>
            )}
            {partido.equipoGanador && <div className="flex items-center gap-2 text-xs"><span className="text-muted-foreground">Ganador:</span><Badge className="bg-[var(--wc-green)] text-white text-[10px] border-0"><Flag code={partido.equipoGanador.fifaCode} size={12} className="mr-1" />{partido.equipoGanador.nombre}</Badge></div>}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PartidosMundial({ year }: { year: number }) {
  const { accent, accentDark } = wcColors(year);
  const { data: partidos, isLoading } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);
  const [rondaFilter, setRondaFilter] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rondaCount = useMemo(() => {
    if (!partidos) return {};
    const counts: Record<string, number> = {};
    partidos.forEach((p) => { counts[p.ronda] = (counts[p.ronda] || 0) + 1; });
    return counts;
  }, [partidos]);

  const filtered = useMemo(() => {
    if (!partidos) return [];
    const searchLower = busqueda.toLowerCase().trim();
    return partidos.filter((p) => {
      const matchRonda = rondaFilter === "all" || p.ronda === rondaFilter;
      if (!matchRonda) return false;
      if (!searchLower) return true;
      const grupoNombre = p.grupo?.nombre || "";
      return (`group ${grupoNombre}`.includes(searchLower) || grupoNombre.toLowerCase().includes(searchLower) || p.equipo1?.nombre?.toLowerCase().includes(searchLower) || p.equipo1?.fifaCode?.toLowerCase().includes(searchLower) || p.equipo2?.nombre?.toLowerCase().includes(searchLower) || p.equipo2?.fifaCode?.toLowerCase().includes(searchLower) || p.estadio?.nombre?.toLowerCase().includes(searchLower) || p.estadio?.ciudad?.toLowerCase().includes(searchLower) || p.fecha?.toLowerCase().includes(searchLower) || p.ronda?.toLowerCase().includes(searchLower));
    }).sort((a, b) => a.numeroPartido - b.numeroPartido);
  }, [partidos, rondaFilter, busqueda]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Partido[]> = {};
    filtered.forEach((p) => { const key = p.fecha || "Sin fecha"; if (!groups[key]) groups[key] = []; groups[key].push(p); });
    return groups;
  }, [filtered]);

  if (isLoading) {
    return (<div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-full max-w-md" /><div className="flex gap-2">{[1,2,3,4,5,6,7].map((i) => <Skeleton key={i} className="h-8 w-20" />)}</div><div className="space-y-4">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-28" />)}</div></div>);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--wc-accent)] flex items-center justify-center"><Calendar className="h-4 w-4 text-white" /></div>
          Calendario de Partidos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {partidos?.length ?? 0} partidos</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por equipo, grupo, estadio o fecha..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9 border-[var(--wc-accent)]/20 focus-visible:ring-[var(--wc-accent)]/30" />
      </div>
      <div className="flex flex-wrap gap-2">
        {RONDAS.map((r) => (
          <button key={r.value} onClick={() => setRondaFilter(r.value)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${rondaFilter === r.value ? "bg-[var(--wc-accent)] text-white shadow-md shadow-[var(--wc-accent)]/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {r.label}
            {r.value !== "all" && rondaCount[r.value] ? <span className="ml-1 opacity-70">({rondaCount[r.value]})</span> : r.value === "Matchday 1" || r.value === "Matchday 2" || r.value === "Matchday 3" ? <span className="ml-1 opacity-70">({(rondaCount["Matchday 1"] || 0) + (rondaCount["Matchday 2"] || 0) + (rondaCount["Matchday 3"] || 0)})</span> : null}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {[{label:"Grupos",color:"bg-blue-500"},{label:"Round of 32",color:"bg-orange-500"},{label:"Round of 16",color:"bg-purple-500"},{label:"Quarter-final",color:"bg-amber-500"},{label:"Semi-final",color:"bg-rose-500"},{label:"3rd Place",color:"bg-red-500"},{label:"Final",color:"bg-[var(--wc-accent)]"}].map((item) => (<div key={item.label} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-full ${item.color}`} /><span>{item.label}</span></div>))}
      </div>
      <div className="space-y-2">
        {Object.entries(groupedByDate).map(([fecha, partidosFecha]) => (
          <div key={fecha} className="space-y-2">
            <div className="flex items-center gap-3 sticky top-20 z-20 bg-background/95 backdrop-blur-sm py-2">
              <div className="h-px flex-1 bg-[var(--wc-accent)]/10" />
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-[var(--wc-accent)] text-white border-0"><Calendar className="h-3.5 w-3.5 mr-1.5" />{fecha}<span className="ml-2 opacity-60">({partidosFecha.length})</span></Badge>
              <div className="h-px flex-1 bg-[var(--wc-accent)]/10" />
            </div>
            {partidosFecha.map((p) => (<MatchCard key={p._id} partido={p} expanded={expandedId === p._id} onToggle={() => setExpandedId(expandedId === p._id ? null : p._id)} />))}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No se encontraron partidos con esos filtros</p></div>}
    </div>
  );
}
