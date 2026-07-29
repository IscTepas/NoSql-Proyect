"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Shirt, RefreshCw, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Jugador } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

interface Player {
  _id: string;
  nombre: string;
  posicion: string;
  numero: number;
  fifaCode: string;
  equipo: string;
}

type Formation = { name: string; label: string; lines: number[] };

const FORMATIONS: Formation[] = [
  { name: "4-3-3", label: "4-3-3", lines: [1, 4, 3, 3] },
  { name: "4-4-2", label: "4-4-2", lines: [1, 4, 4, 2] },
  { name: "3-5-2", label: "3-5-2", lines: [1, 3, 5, 2] },
  { name: "4-2-3-1", label: "4-2-3-1", lines: [1, 4, 2, 4] },
  { name: "3-4-3", label: "3-4-3", lines: [1, 3, 4, 3] },
  { name: "5-3-2", label: "5-3-2", lines: [1, 5, 3, 2] },
];

const POSITION_LABELS: Record<string, string> = {
  GK: "POR",
  DF: "DEF",
  MF: "MED",
  FW: "DEL",
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function MiOnceIdeal({ year }: { year: number }) {
  const { data: jugadores, isLoading } = useSWR<Jugador[]>(`/api/jugadores?año=${year}`, fetcher);

  const storageKey = `wc-once-ideal-${year}`;

  const allPlayers: Player[] = useMemo(() => {
    if (!jugadores) return [];
    return jugadores.map((j) => ({
      _id: j._id,
      nombre: j.nombre,
      posicion: j.posicion,
      numero: j.numero,
      fifaCode: j.fifaCodeEquipo,
      equipo: j.equipo?.nombre ?? j.fifaCodeEquipo,
    }));
  }, [jugadores]);

  const [formationIndex, setFormationIndex] = useState(0);
  const [eleven, setEleven] = useState<(Player | null)[]>(() => {
    if (typeof window === "undefined") return Array(11).fill(null);
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as (Player | null)[]) : Array(11).fill(null);
    } catch {
      return Array(11).fill(null);
    }
  });
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(eleven));
  }, [eleven, storageKey]);

  const formation = FORMATIONS[formationIndex];

  const getPositionForSlot = (slotIndex: number): string => {
    let accum = 0;
    for (let line = 0; line < formation.lines.length; line++) {
      const count = formation.lines[line];
      if (slotIndex < accum + count) {
        switch (line) {
          case 0: return "GK";
          case 1: return "DF";
          case 2: return "MF";
          case 3: return "FW";
        }
      }
      accum += count;
    }
    return "FW";
  };

  const availablePlayers = useMemo(() => {
    const usedIds = new Set(eleven.filter(Boolean).map((p) => p!._id));
    return allPlayers.filter((p) => !usedIds.has(p._id));
  }, [allPlayers, eleven]);

  const filteredPlayers = useMemo(() => {
    const posFiltered = selectedSlot !== null
      ? availablePlayers.filter((p) => p.posicion === getPositionForSlot(selectedSlot))
      : availablePlayers;
    if (!busqueda.trim()) return posFiltered;
    const q = busqueda.toLowerCase();
    return posFiltered.filter((p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.fifaCode.toLowerCase().includes(q) ||
      p.equipo.toLowerCase().includes(q)
    );
  }, [availablePlayers, selectedSlot, busqueda]);

  const selectPlayer = (player: Player) => {
    if (selectedSlot === null) return;
    setEleven((prev) => {
      const next = [...prev];
      next[selectedSlot] = player;
      return next;
    });
    setSelectedSlot(null);
    setBusqueda("");
  };

  const removePlayer = (slotIndex: number) => {
    setEleven((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const clearAll = () => {
    setEleven(Array(11).fill(null));
  };

  const positions = useMemo(() => {
    const pos: { slotIndex: number; x: number; y: number; lineLabel: string }[] = [];
    let slotIndex = 0;
    for (let line = 0; line < formation.lines.length; line++) {
      const count = formation.lines[line];
      const y = 10 + line * 22;
      for (let i = 0; i < count; i++) {
        const x = count === 1 ? 50 : 10 + (i / (count - 1)) * 80;
        pos.push({ slotIndex, x, y, lineLabel: POSITION_LABELS[getPositionForSlot(slotIndex)] });
        slotIndex++;
      }
    }
    return pos;
  }, [formation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--wc-gold)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shirt className="h-5 w-5 text-[var(--wc-gold)]" />
            Mi Once Ideal
          </h2>
          <p className="text-sm text-muted-foreground">
            Arma tu equipo soñado del Mundial {year}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFormationIndex((i) => Math.max(0, i - 1))}
              disabled={formationIndex === 0}
              className="p-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold px-2 min-w-[48px] text-center">
              {formation.label}
            </span>
            <button
              onClick={() => setFormationIndex((i) => Math.min(FORMATIONS.length - 1, i + 1))}
              disabled={formationIndex === FORMATIONS.length - 1}
              className="p-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pitch */}
        <div className="md:col-span-2">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-green-600 via-green-500 to-green-600 shadow-lg aspect-[3/4] max-h-[600px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" rx="2" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
              <rect x="30" y="0" width="40" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" rx="1" />
              <rect x="30" y="82" width="40" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" rx="1" />
            </svg>

            {positions.map((pos) => {
              const player = eleven[pos.slotIndex];
              const isSelected = selectedSlot === pos.slotIndex;
              return (
                <div
                  key={pos.slotIndex}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    isSelected ? "z-10 scale-110" : "z-0"
                  }`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => {
                    if (player) {
                      setSelectedSlot(null);
                      removePlayer(pos.slotIndex);
                    } else {
                      setSelectedSlot(pos.slotIndex);
                    }
                  }}
                >
                  {player ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-8 w-8 rounded-full bg-white shadow-lg border-2 border-[var(--wc-gold)] flex items-center justify-center">
                        <span className="text-[10px] font-black text-[var(--wc-gold-dark)]">
                          {getInitials(player.nombre)}
                        </span>
                      </div>
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <span className="text-[8px] text-white font-medium whitespace-nowrap">
                          {player.nombre.split(" ")[0]}
                        </span>
                      </div>
                      <div className="bg-[var(--wc-gold)] rounded-full px-1.5 py-0.5">
                        <span className="text-[8px] font-bold text-white">
                          #{player.numero}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center gap-0.5 ${
                        isSelected ? "animate-pulse" : ""
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[var(--wc-gold)] bg-[var(--wc-gold)]/20"
                          : "border-white/40 bg-white/10"
                      }`}>
                        <span className={`text-[9px] font-bold ${
                          isSelected ? "text-[var(--wc-gold)]" : "text-white/60"
                        }`}>
                          {pos.lineLabel}
                        </span>
                      </div>
                      <span className="text-[7px] text-white/50">Vacío</span>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="text-[10px] text-white/40 font-medium tracking-widest">
                {formation.label}
              </span>
            </div>
          </div>
        </div>

        {/* Player Selector */}
        <div className="space-y-3">
          {selectedSlot !== null ? (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                Selecciona un jugador para la posición{" "}
                <span className="font-bold text-[var(--wc-gold-dark)]">
                  {POSITION_LABELS[getPositionForSlot(selectedSlot)]}
                </span>
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, equipo o código FIFA..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 border-[var(--wc-gold)]/20 focus-visible:ring-[var(--wc-gold)]/30"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {filteredPlayers.length} jugador{filteredPlayers.length !== 1 ? "es" : ""} disponible{filteredPlayers.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredPlayers.map((player) => (
                  <button
                    key={player._id}
                    onClick={() => selectPlayer(player)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-[var(--wc-gold)]/30 hover:shadow-md transition-all group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-[var(--wc-gold)]/10 group-hover:to-[var(--wc-gold)]/5 transition-colors">
                      <span className="text-[11px] font-black text-gray-400 group-hover:text-[var(--wc-gold-dark)]">
                        {getInitials(player.nombre)}
                      </span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold truncate">{player.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {player.fifaCode} • {player.equipo}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {player.posicion}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        #{player.numero}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredPlayers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {busqueda ? "No hay jugadores que coincidan con tu búsqueda" : "No hay jugadores disponibles"}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Shirt className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm text-muted-foreground">
                Toca un espacio vacío en la cancha para elegir un jugador
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                También puedes tocar un jugador para quitarlo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
