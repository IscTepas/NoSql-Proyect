"use client";

import useSWR from "swr";
import type { Estadio, Partido } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Building2, Globe, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Flag from "@/components/Flag";
import StadiumPhoto from "@/components/StadiumPhoto";
import { useMemo, useState } from "react";

const YEAR_COLORS: Record<number, { accent: string; accentDark: string }> = {
  2014: { accent: "oklch(0.55 0.18 155)", accentDark: "oklch(0.42 0.18 155)" },
  2018: { accent: "oklch(0.58 0.20 25)", accentDark: "oklch(0.45 0.20 25)" },
  2022: { accent: "oklch(0.48 0.15 310)", accentDark: "oklch(0.35 0.15 310)" },
  2026: { accent: "oklch(0.42 0.16 255)", accentDark: "oklch(0.30 0.16 255)" },
};

const wcColors = (year: number) => YEAR_COLORS[year] || YEAR_COLORS[2026];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  const j = await res.json();
  if (j.ok === false) throw new Error(j.mensaje || "API error");
  return j.data ?? j;
};

const PAISES = [
  { value: "all", label: "Todos" },
  { value: "us", label: "Estados Unidos" },
  { value: "mx", label: "Mexico" },
  { value: "ca", label: "Canada" },
];

const PAIS_COLORS: Record<string, string> = { us: "bg-blue-500", mx: "bg-green-600", ca: "bg-red-500" };
const PAIS_LABELS: Record<string, string> = { us: "EE.UU.", mx: "Mexico", ca: "Canada" };

function formatCapacidad(n: number): string { return n.toLocaleString("es-ES"); }
function getCountryCode(stadium: Estadio): string { return (stadium.codigoPais || "us").toLowerCase().trim(); }

function StadiumCard({ stadium, partidos, expanded, onToggle, year }: { stadium: Estadio; partidos: Partido[]; expanded: boolean; onToggle: () => void; year: number }) {
  const countryCode = getCountryCode(stadium);
  const matchCount = partidos.length;
  return (
    <Card className="group hover:shadow-xl hover:shadow-[var(--wc-accent)]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden border-[var(--wc-accent)]/10 bg-white">
      <CardContent className="p-0">
        <div className="relative h-32 bg-gradient-to-br from-[var(--wc-accent)]/[0.04] via-transparent to-[var(--wc-black)]/[0.02] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center"><Building2 className="h-16 w-16 text-[var(--wc-accent)]/15" /></div>
          <StadiumPhoto year={year} stadiumName={stadium.nombre} city={stadium.ciudad} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute top-2 right-2">
            <Badge className={`${PAIS_COLORS[countryCode] || "bg-gray-500"} text-white text-[10px] border-0 shadow-sm`}>
              <Flag code={countryCode} size={14} className="mr-1" />{countryCode.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-[10px] font-mono bg-white/90 backdrop-blur-sm shadow-sm">{formatCapacidad(stadium.capacidad)} asientos</Badge>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-[var(--wc-accent-dark)] transition-colors">{stadium.nombre}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span>{stadium.ciudad}</span></div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] border-[var(--wc-accent)]/20"><Clock className="h-3 w-3 mr-1" />{stadium.zonaHoraria || "UTC"}</Badge>
            <Badge variant="outline" className="text-[10px] border-[var(--wc-accent)]/20"><Globe className="h-3 w-3 mr-1" />{PAIS_LABELS[countryCode] || countryCode}</Badge>
          </div>
          {matchCount > 0 && (
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-full flex items-center justify-between text-xs text-[var(--wc-accent-dark)] hover:text-[var(--wc-accent)] transition-colors pt-2 border-t border-[var(--wc-accent)]/10">
              <span className="font-medium">{matchCount} partidos programados</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
        {expanded && partidos.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            {partidos.map((p) => {
              const played = p.marcador.ft && p.marcador.ft.length === 2;
              return (
                <div key={p._id} className="rounded-lg border border-[var(--wc-accent)]/10 p-2.5 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-mono">#{p.numeroPartido} - {p.ronda}</span>
                    <span className="text-[10px] text-muted-foreground">{p.fecha}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1"><Flag code={p.equipo1?.fifaCode} size={16} /><span className="text-[11px] font-semibold truncate">{p.equipo1?.fifaCode}</span></div>
                    <div className="flex flex-col items-center mx-2 shrink-0">
                      {played ? (<span className="text-[11px] font-bold bg-[var(--wc-accent)] text-white px-2 py-0.5 rounded">{p.marcador.ft[0]} - {p.marcador.ft[1]}</span>) : (<span className="text-[10px] text-muted-foreground font-mono">{p.hora?.split(" ")[0]}</span>)}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end"><span className="text-[11px] font-semibold truncate">{p.equipo2?.fifaCode}</span><Flag code={p.equipo2?.fifaCode} size={16} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EstadiosMundial({ year }: { year: number }) {
  const { data: estadios, isLoading: lEstadios } = useSWR<Estadio[]>(`/api/estadios?año=${year}`, fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>(`/api/partidos?año=${year}`, fetcher);
  const [paisFilter, setPaisFilter] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { accent, accentDark } = wcColors(year);
  const loading = lEstadios || lPartidos;
  const showHostCountryFilters = year === 2026;

  const filtered = useMemo(() => {
    if (!estadios) return [];
    return estadios.filter((e) => {
      const code = getCountryCode(e);
      return (paisFilter === "all" || code === paisFilter) &&
        (e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.ciudad.toLowerCase().includes(busqueda.toLowerCase()));
    });
  }, [estadios, paisFilter, busqueda]);

  const partidosByEstadio = useMemo(() => {
    if (!partidos) return {};
    const map: Record<string, Partido[]> = {};
    partidos.forEach((p) => { const estId = p.estadio?._id; if (estId) { if (!map[estId]) map[estId] = []; map[estId].push(p); } });
    return map;
  }, [partidos]);

  const paisCount = useMemo(() => {
    if (!estadios) return {};
    const counts: Record<string, number> = {};
    estadios.forEach((e) => { const code = getCountryCode(e); counts[code] = (counts[code] || 0) + 1; });
    return counts;
  }, [estadios]);

  if (loading) {
    return (<div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-full max-w-md" />{showHostCountryFilters && <div className="flex gap-2">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-8 w-24" />)}</div>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-64" />)}</div></div>);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6"
      style={{ "--wc-accent": accent, "--wc-accent-dark": accentDark } as React.CSSProperties}>
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--wc-accent)] flex items-center justify-center"><MapPin className="h-4 w-4 text-white" /></div>
          Estadios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {estadios?.length ?? 0} estadios del mundial</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o ciudad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9 border-[var(--wc-accent)]/20 focus-visible:ring-[var(--wc-accent)]/30" />
      </div>
      {showHostCountryFilters && (
        <div className="flex flex-wrap gap-2">
          {PAISES.map((p) => (
            <button key={p.value} onClick={() => setPaisFilter(p.value)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${paisFilter === p.value ? "bg-[var(--wc-accent)] text-white shadow-md shadow-[var(--wc-accent)]/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {p.value !== "all" && <Flag code={p.value} size={14} className="mr-1" />}{p.label}
              {p.value !== "all" && paisCount[p.value] && <span className="ml-1 opacity-70">({paisCount[p.value]})</span>}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((est) => (<StadiumCard key={est._id} year={year} stadium={est} partidos={partidosByEstadio[est._id] || []} expanded={expandedId === est._id} onToggle={() => setExpandedId(expandedId === est._id ? null : est._id)} />))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No se encontraron estadios con esos filtros</p></div>}
    </div>
  );
}
