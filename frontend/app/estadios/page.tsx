"use client";

import useSWR from "swr";
import type { Estadio, Partido } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Building2, Globe, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

const PAISES = [
  { value: "all", label: "Todos" },
  { value: "us", label: "Estados Unidos" },
  { value: "mx", label: "Mexico" },
  { value: "ca", label: "Canada" },
];

const PAIS_COLORS: Record<string, string> = {
  us: "bg-blue-500",
  mx: "bg-green-600",
  ca: "bg-red-500",
};

const PAIS_LABELS: Record<string, string> = {
  us: "EE.UU.",
  mx: "Mexico",
  ca: "Canada",
};

function formatCapacidad(n: number): string {
  return n.toLocaleString("es-ES");
}

function getCountryCode(stadium: Estadio): string {
  return (stadium.codigoPais || "us").toLowerCase().trim();
}

function StadiumCard({
  stadium,
  partidos,
  expanded,
  onToggle,
}: {
  stadium: Estadio;
  partidos: Partido[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const countryCode = getCountryCode(stadium);
  const matchCount = partidos.length;

  return (
    <Card className="group hover:shadow-xl hover:shadow-[var(--wc-gold)]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden border-[var(--wc-gold)]/10 bg-white">
      <CardContent className="p-0">
        <div className="relative h-32 bg-gradient-to-br from-[var(--wc-gold)]/[0.04] via-transparent to-[var(--wc-black)]/[0.02] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-16 w-16 text-[var(--wc-gold)]/15" />
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={`${PAIS_COLORS[countryCode] || "bg-gray-500"} text-white text-[10px] border-0 shadow-sm`}>
              <Flag code={countryCode} size={14} className="mr-1" />
              {countryCode.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-[10px] font-mono bg-white/90 backdrop-blur-sm">
              {formatCapacidad(stadium.capacidad)} asientos
            </Badge>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-[var(--wc-gold-dark)] transition-colors">
            {stadium.nombre}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{stadium.ciudad}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] border-[var(--wc-gold)]/20">
              <Clock className="h-3 w-3 mr-1" />
              {stadium.zonaHoraria || "UTC"}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-[var(--wc-gold)]/20">
              <Globe className="h-3 w-3 mr-1" />
              {PAIS_LABELS[countryCode] || countryCode}
            </Badge>
          </div>
          {matchCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="w-full flex items-center justify-between text-xs text-[var(--wc-gold-dark)] hover:text-[var(--wc-gold)] transition-colors pt-2 border-t border-[var(--wc-gold)]/10"
            >
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
                <div
                  key={p._id}
                  className="rounded-lg border border-[var(--wc-gold)]/10 p-2.5 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      #{p.numeroPartido} - {p.ronda}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{p.fecha}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Flag code={p.equipo1?.fifaCode} size={16} />
                      <span className="text-[11px] font-semibold truncate">{p.equipo1?.fifaCode}</span>
                    </div>
                    <div className="flex flex-col items-center mx-2 shrink-0">
                      {played ? (
                        <span className="text-[11px] font-bold bg-[var(--wc-gold)] text-white px-2 py-0.5 rounded">
                           {p.marcador.ft[0]} - {p.marcador.ft[1]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">{p.hora?.split(" ")[0]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className="text-[11px] font-semibold truncate">{p.equipo2?.fifaCode}</span>
                      <Flag code={p.equipo2?.fifaCode} size={16} />
                    </div>
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

export default function EstadiosPage() {
  const { data: estadios, isLoading: lEstadios } = useSWR<Estadio[]>("/api/estadios?año=2026", fetcher);
  const { data: partidos, isLoading: lPartidos } = useSWR<Partido[]>("/api/partidos?año=2026", fetcher);
  const [paisFilter, setPaisFilter] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loading = lEstadios || lPartidos;

  const filtered = useMemo(() => {
    if (!estadios) return [];
    return estadios.filter((e) => {
      const code = getCountryCode(e);
      const matchPais = paisFilter === "all" || code === paisFilter;
      const matchSearch =
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.ciudad.toLowerCase().includes(busqueda.toLowerCase());
      return matchPais && matchSearch;
    });
  }, [estadios, paisFilter, busqueda]);

  const partidosByEstadio = useMemo(() => {
    if (!partidos) return {};
    const map: Record<string, Partido[]> = {};
    partidos.forEach((p) => {
      const estId = p.estadio?._id;
      if (estId) {
        if (!map[estId]) map[estId] = [];
        map[estId].push(p);
      }
    });
    return map;
  }, [partidos]);

  const paisCount = useMemo(() => {
    if (!estadios) return {};
    const counts: Record<string, number> = {};
    estadios.forEach((e) => {
      const code = getCountryCode(e);
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [estadios]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
            <MapPin className="h-4 w-4 text-[var(--wc-black)]" />
          </div>
          Estadios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} de {estadios?.length ?? 0} estadios del mundial
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o ciudad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 border-[var(--wc-gold)]/20 focus-visible:ring-[var(--wc-gold)]/30"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PAISES.map((p) => (
          <button
            key={p.value}
            onClick={() => setPaisFilter(p.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              paisFilter === p.value
                ? "bg-[var(--wc-gold)] text-white shadow-md shadow-[var(--wc-gold)]/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.value !== "all" && <Flag code={p.value} size={14} className="mr-1" />}
            {p.label}
            {p.value !== "all" && paisCount[p.value] && (
              <span className="ml-1 opacity-70">({paisCount[p.value]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((est) => (
          <StadiumCard
            key={est._id}
            stadium={est}
            partidos={partidosByEstadio[est._id] || []}
            expanded={expandedId === est._id}
            onToggle={() => setExpandedId(expandedId === est._id ? null : est._id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No se encontraron estadios con esos filtros</p>
        </div>
      )}
    </div>
  );
}
