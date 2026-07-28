"use client";

import useSWR from "swr";
import type { Equipo } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, LayoutGrid, List } from "lucide-react";
import Flag from "@/components/Flag";
import { useMemo, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

const CONFEDERACIONES = [
  { value: "all", label: "Todas" },
  { value: "UEFA", label: "UEFA" },
  { value: "CAF", label: "CAF" },
  { value: "AFC", label: "AFC" },
  { value: "CONCACAF", label: "CONCACAF" },
  { value: "CONMEBOL", label: "CONMEBOL" },
  { value: "OFC", label: "OFC" },
];

const CONF_COLORS: Record<string, string> = { UEFA: "bg-blue-500", CAF: "bg-amber-500", AFC: "bg-emerald-500", CONCACAF: "bg-orange-500", CONMEBOL: "bg-teal-500", OFC: "bg-purple-500" };

function TeamCardGrid({ equipo }: { equipo: Equipo }) {
  return (
    <Card className="group hover:shadow-xl hover:shadow-[var(--wc-gold)]/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border-[var(--wc-gold)]/10 bg-white">
      <CardContent className="p-0">
        <div className="relative h-28 bg-gradient-to-br from-[var(--wc-gold)]/[0.04] via-transparent to-transparent group-hover:scale-105 transition-transform duration-300 overflow-hidden">
          <Flag code={equipo.fifaCode} fill className="rounded-none" />
          <div className="absolute top-2 right-2"><Badge variant="secondary" className="text-[10px] font-mono bg-white/90 backdrop-blur-sm">{equipo.fifaCode}</Badge></div>
        </div>
        <div className="p-3.5 space-y-2.5">
          <h3 className="font-semibold text-sm truncate group-hover:text-[var(--wc-gold-dark)] transition-colors">{equipo.nombre}</h3>
          <div className="flex items-center justify-between">
            <Badge className={`${CONF_COLORS[equipo.confederacion] || "bg-gray-500"} text-white text-[10px] border-0 shadow-sm`}>{equipo.confederacion}</Badge>
            <span className="text-xs text-muted-foreground font-medium">Grupo {equipo.grupo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamTableRow({ equipo }: { equipo: Equipo }) {
  return (
    <tr className="border-b hover:bg-[var(--wc-gold)]/[0.02] transition-colors">
      <td className="py-3 px-4"><div className="flex items-center gap-3"><Flag code={equipo.fifaCode} size={32} /><div><p className="font-medium text-sm">{equipo.nombre}</p><p className="text-xs text-muted-foreground">{equipo.nombreNormalizado || equipo.nombre}</p></div></div></td>
      <td className="py-3 px-4 text-center"><Badge variant="outline" className="font-mono text-xs border-[var(--wc-gold)]/20">{equipo.fifaCode}</Badge></td>
      <td className="py-3 px-4 text-center"><Badge className={`${CONF_COLORS[equipo.confederacion] || "bg-gray-500"} text-white text-xs border-0 shadow-sm`}>{equipo.confederacion}</Badge></td>
      <td className="py-3 px-4 text-center text-sm text-muted-foreground">{equipo.continente}</td>
      <td className="py-3 px-4 text-center text-sm font-medium">Grupo {equipo.grupo}</td>
    </tr>
  );
}

export default function SeleccionesMundial({ year }: { year: number }) {
  const { data: equipos, isLoading } = useSWR<Equipo[]>(`/api/equipos?año=${year}`, fetcher);
  const [busqueda, setBusqueda] = useState("");
  const [confFilter, setConfFilter] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    if (!equipos) return [];
    return equipos.filter((e) => (e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.fifaCode.toLowerCase().includes(busqueda.toLowerCase())) && (confFilter === "all" || e.confederacion === confFilter));
  }, [equipos, busqueda, confFilter]);

  const confCount = useMemo(() => {
    if (!equipos) return {};
    const counts: Record<string, number> = {};
    equipos.forEach((e) => { counts[e.confederacion] = (counts[e.confederacion] || 0) + 1; });
    return counts;
  }, [equipos]);

  if (isLoading) return <div className="container mx-auto px-4 py-8 space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-full max-w-md" /><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{Array.from({length:12}).map((_,i) => <Skeleton key={i} className="h-40" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
            <div className="h-8 w-8 rounded-lg bg-[var(--wc-gold)] flex items-center justify-center"><Users className="h-4 w-4 text-white" /></div>
            Selecciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {equipos?.length ?? 0} equipos</p>
        </div>
        <div className="flex items-center border border-[var(--wc-gold)]/20 rounded-lg overflow-hidden shadow-sm">
          <button onClick={() => setView("grid")} className={`p-2.5 transition-all duration-200 ${view === "grid" ? "bg-[var(--wc-gold)] text-white shadow-sm" : "hover:bg-[var(--wc-gold)]/10 text-muted-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView("table")} className={`p-2.5 transition-all duration-200 ${view === "table" ? "bg-[var(--wc-gold)] text-white shadow-sm" : "hover:bg-[var(--wc-gold)]/10 text-muted-foreground"}`}><List className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o codigo FIFA..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9 border-[var(--wc-gold)]/20 focus-visible:ring-[var(--wc-gold)]/30" />
      </div>
      <div className="flex flex-wrap gap-2">
        {CONFEDERACIONES.map((conf) => (
          <button key={conf.value} onClick={() => setConfFilter(conf.value)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${confFilter === conf.value ? "bg-[var(--wc-gold)] text-white shadow-md shadow-[var(--wc-gold)]/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {conf.label}{conf.value !== "all" && confCount[conf.value] && <span className="ml-1 opacity-70">({confCount[conf.value]})</span>}
          </button>
        ))}
      </div>
      {view === "grid" && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{filtered.map((eq) => <TeamCardGrid key={eq._id} equipo={eq} />)}</div>}
      {view === "table" && (
        <div className="border border-[var(--wc-gold)]/10 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full">
            <thead><tr className="bg-[var(--wc-gold)] text-white border-b"><th className="text-left py-3 px-4 text-sm font-medium">Equipo</th><th className="text-center py-3 px-4 text-sm font-medium">Codigo</th><th className="text-center py-3 px-4 text-sm font-medium">Confederacion</th><th className="text-center py-3 px-4 text-sm font-medium">Continente</th><th className="text-center py-3 px-4 text-sm font-medium">Grupo</th></tr></thead>
            <tbody>{filtered.map((eq) => <TeamTableRow key={eq._id} equipo={eq} />)}</tbody>
          </table>
        </div>
      )}
      {filtered.length === 0 && <div className="text-center py-16"><Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No se encontraron equipos con esos filtros</p></div>}
    </div>
  );
}
