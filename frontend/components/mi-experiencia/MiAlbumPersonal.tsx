"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Gift, Sparkles, Trophy } from "lucide-react";
import type { Jugador } from "@/lib/types";
import Flag from "@/components/Flag";
import PlayerPhoto from "@/components/PlayerPhoto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

const POS_COLORS: Record<string, string> = {
  GK: "#c8a951",
  DF: "#3b82f6",
  MF: "#22c55e",
  FW: "#ef4444",
};

export default function MiAlbumPersonal({ year }: { year: number }) {
  const { data: jugadores, isLoading } = useSWR<Jugador[]>(`/api/jugadores?año=${year}`, fetcher);
  const storageKey = `wc-album-collected-${year}`;

  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState(false);
  const [newStickers, setNewStickers] = useState<Jugador[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  // Load this year's saved progress (each Mundial keeps its own collection).
  useEffect(() => {
    setLoaded(false);
    try {
      const raw = localStorage.getItem(storageKey);
      setCollectedIds(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setCollectedIds(new Set());
    }
    setLoaded(true);
  }, [storageKey]);

  // Persist progress, but never before the initial load for this year has run.
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(collectedIds)));
  }, [collectedIds, loaded, storageKey]);

  const total = jugadores?.length ?? 0;
  const collected = collectedIds.size;
  const progress = total > 0 ? (collected / total) * 100 : 0;

  const uncollected = useMemo(
    () => (jugadores || []).filter((j) => !collectedIds.has(j._id)),
    [jugadores, collectedIds]
  );

  const openPack = () => {
    if (opening || uncollected.length === 0) return;
    setOpening(true);
    setShowReveal(false);
    setNewStickers([]);

    setTimeout(() => {
      const shuffled = [...uncollected].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(3, shuffled.length));
      setNewStickers(picked);
      setShowReveal(true);

      setTimeout(() => {
        setCollectedIds((prev) => {
          const next = new Set(prev);
          picked.forEach((p) => next.add(p._id));
          return next;
        });
        setOpening(false);
        setShowReveal(false);
        setNewStickers([]);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--wc-gold)]" />
            Mi Álbum Personal
          </h2>
          <p className="text-sm text-muted-foreground">
            Colecciona a los jugadores del Mundial {year}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-bold text-[var(--wc-gold-dark)]">{collected}</span>
            <span className="text-muted-foreground">/{total}</span>
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--wc-gold)] to-[var(--wc-gold-dark)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {isLoading || !loaded ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando jugadores...</p>
      ) : (
        <>
          {/* Pack Opening Area — arriba para no tener que bajar hasta el fondo cada vez */}
          <div className="flex flex-col items-center py-6 rounded-2xl bg-gray-50/50 border border-gray-100">
            {!opening && !showReveal && (
              <button
                onClick={openPack}
                disabled={uncollected.length === 0}
                className="group relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 border-dashed border-[var(--wc-gold)]/30 bg-gradient-to-b from-[var(--wc-gold)]/5 to-transparent hover:from-[var(--wc-gold)]/10 hover:border-[var(--wc-gold)]/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--wc-gold)]/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[var(--wc-gold)] to-[var(--wc-gold-dark)] flex items-center justify-center shadow-lg shadow-[var(--wc-gold)]/20 group-hover:scale-110 transition-transform duration-300">
                    <Gift className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--wc-gold-dark)] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    ¡Abrir Sobre Mágico!
                    <Sparkles className="h-4 w-4" />
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {uncollected.length} estampillas por coleccionar
                  </p>
                </div>
              </button>
            )}

            {opening && !showReveal && (
              <div className="flex flex-col items-center gap-4 px-8 py-6">
                <div className="relative animate-bounce">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--wc-gold)] to-[var(--wc-gold-dark)] flex items-center justify-center shadow-2xl shadow-[var(--wc-gold)]/30">
                    <Gift className="h-9 w-9 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-5 w-5 text-[var(--wc-gold)] animate-ping" />
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--wc-gold-dark)] animate-pulse">
                  Abriendo sobre...
                </p>
              </div>
            )}

            {showReveal && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--wc-gold-dark)] flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    ¡Nuevas estampillas!
                    <Sparkles className="h-4 w-4" />
                  </p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap animate-in zoom-in-95 duration-300">
                  {newStickers.map((j, i) => (
                    <div
                      key={j._id}
                      className="relative rounded-xl border-2 border-[var(--wc-gold)]/40 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-lg shadow-[var(--wc-gold)]/20 p-3 w-28 animate-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white"
                            style={{ backgroundColor: POS_COLORS[j.posicion] }}
                          >
                            {j.posicion}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-[var(--wc-gold-dark)]">
                            #{j.numero}
                          </span>
                        </div>
                        <PlayerPhoto jugador={j} />
                        <p className="text-[11px] font-bold leading-tight truncate">{j.nombre}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{j.fifaCodeEquipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticker Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {(jugadores || []).map((j, i) => {
              const isCollected = collectedIds.has(j._id);
              return (
                <div
                  key={j._id}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    isCollected
                      ? "border-[var(--wc-gold)]/40 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-md shadow-[var(--wc-gold)]/10"
                      : "border-gray-200 bg-gray-50/50 opacity-60"
                  }`}
                >
                  {isCollected ? (
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                          style={{ backgroundColor: POS_COLORS[j.posicion] }}
                        >
                          {j.posicion}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[var(--wc-gold-dark)]">
                          #{j.numero}
                        </span>
                      </div>
                      <PlayerPhoto jugador={j} />
                      <div>
                        <p className="text-[11px] font-bold leading-tight truncate">{j.nombre}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flag code={j.fifaCodeEquipo} size={12} />
                          <span className="text-[9px] text-muted-foreground truncate">{j.fifaCodeEquipo}</span>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--wc-gold)] animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 flex flex-col items-center justify-center min-h-[80px] gap-1">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg text-gray-300">?</span>
                      </div>
                      <span className="text-[9px] text-gray-300">#{i + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
