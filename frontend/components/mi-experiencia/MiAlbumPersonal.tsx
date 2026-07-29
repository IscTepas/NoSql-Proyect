"use client";

import { useState, useCallback } from "react";
import { Gift, Sparkles, Trophy } from "lucide-react";

interface Sticker {
  id: number;
  nombre: string;
  equipo: string;
  posicion: string;
  numero: number;
  fifaCode: string;
  collected: boolean;
}

const ALL_STICKERS: Sticker[] = [
  { id: 1, nombre: "Lionel Messi", equipo: "Argentina", posicion: "FW", numero: 10, fifaCode: "ARG", collected: false },
  { id: 2, nombre: "Cristiano Ronaldo", equipo: "Portugal", posicion: "FW", numero: 7, fifaCode: "POR", collected: false },
  { id: 3, nombre: "Kylian Mbappé", equipo: "Francia", posicion: "FW", numero: 10, fifaCode: "FRA", collected: false },
  { id: 4, nombre: "Neymar Jr", equipo: "Brasil", posicion: "FW", numero: 10, fifaCode: "BRA", collected: false },
  { id: 5, nombre: "Kevin De Bruyne", equipo: "Bélgica", posicion: "MF", numero: 7, fifaCode: "BEL", collected: false },
  { id: 6, nombre: "Erling Haaland", equipo: "Noruega", posicion: "FW", numero: 9, fifaCode: "NOR", collected: false },
  { id: 7, nombre: "Vinícius Jr", equipo: "Brasil", posicion: "FW", numero: 20, fifaCode: "BRA", collected: false },
  { id: 8, nombre: "Jude Bellingham", equipo: "Inglaterra", posicion: "MF", numero: 10, fifaCode: "ENG", collected: false },
  { id: 9, nombre: "Rodri", equipo: "España", posicion: "MF", numero: 16, fifaCode: "ESP", collected: false },
  { id: 10, nombre: "Antoine Griezmann", equipo: "Francia", posicion: "FW", numero: 7, fifaCode: "FRA", collected: false },
  { id: 11, nombre: "Lamine Yamal", equipo: "España", posicion: "FW", numero: 19, fifaCode: "ESP", collected: false },
  { id: 12, nombre: "Pedri", equipo: "España", posicion: "MF", numero: 8, fifaCode: "ESP", collected: false },
  { id: 13, nombre: "Phil Foden", equipo: "Inglaterra", posicion: "MF", numero: 11, fifaCode: "ENG", collected: false },
  { id: 14, nombre: "Bukayo Saka", equipo: "Inglaterra", posicion: "FW", numero: 7, fifaCode: "ENG", collected: false },
  { id: 15, nombre: "Florian Wirtz", equipo: "Alemania", posicion: "MF", numero: 10, fifaCode: "GER", collected: false },
  { id: 16, nombre: "Jamal Musiala", equipo: "Alemania", posicion: "MF", numero: 10, fifaCode: "GER", collected: false },
  { id: 17, nombre: "Theo Hernández", equipo: "Francia", posicion: "DF", numero: 22, fifaCode: "FRA", collected: false },
  { id: 18, nombre: "Rúben Dias", equipo: "Portugal", posicion: "DF", numero: 4, fifaCode: "POR", collected: false },
  { id: 19, nombre: "Virgil van Dijk", equipo: "Países Bajos", posicion: "DF", numero: 4, fifaCode: "NED", collected: false },
  { id: 20, nombre: "Thibaut Courtois", equipo: "Bélgica", posicion: "GK", numero: 1, fifaCode: "BEL", collected: false },
  { id: 21, nombre: "Emiliano Martínez", equipo: "Argentina", posicion: "GK", numero: 1, fifaCode: "ARG", collected: false },
  { id: 22, nombre: "Alisson Becker", equipo: "Brasil", posicion: "GK", numero: 1, fifaCode: "BRA", collected: false },
  { id: 23, nombre: "Manuel Neuer", equipo: "Alemania", posicion: "GK", numero: 1, fifaCode: "GER", collected: false },
  { id: 24, nombre: "Harry Kane", equipo: "Inglaterra", posicion: "FW", numero: 9, fifaCode: "ENG", collected: false },
  { id: 25, nombre: "Robert Lewandowski", equipo: "Polonia", posicion: "FW", numero: 9, fifaCode: "POL", collected: false },
  { id: 26, nombre: "Federico Valverde", equipo: "Uruguay", posicion: "MF", numero: 15, fifaCode: "URU", collected: false },
  { id: 27, nombre: "Rafael Leão", equipo: "Portugal", posicion: "FW", numero: 17, fifaCode: "POR", collected: false },
  { id: 28, nombre: "Josko Gvardiol", equipo: "Croacia", posicion: "DF", numero: 6, fifaCode: "CRO", collected: false },
  { id: 29, nombre: "Luka Modrić", equipo: "Croacia", posicion: "MF", numero: 10, fifaCode: "CRO", collected: false },
  { id: 30, nombre: "Declan Rice", equipo: "Inglaterra", posicion: "MF", numero: 4, fifaCode: "ENG", collected: false },
];

const POS_COLORS: Record<string, string> = {
  GK: "#c8a951",
  DF: "#3b82f6",
  MF: "#22c55e",
  FW: "#ef4444",
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function MiAlbumPersonal() {
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    const collected = new Set([1, 5, 9, 13, 20, 24, 29]);
    return ALL_STICKERS.map((s) => ({ ...s, collected: collected.has(s.id) }));
  });
  const [opening, setOpening] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  const openPack = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setShowReveal(false);
    setNewStickers([]);

    setTimeout(() => {
      const uncollected = stickers.filter((s) => !s.collected);
      if (uncollected.length === 0) {
        setOpening(false);
        return;
      }
      const picked: Sticker[] = [];
      const shuffled = [...uncollected].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        picked.push(shuffled[i]);
      }
      setNewStickers(picked);
      setShowReveal(true);

      setTimeout(() => {
        setStickers((prev) =>
          prev.map((s) => (picked.find((p) => p.id === s.id) ? { ...s, collected: true } : s))
        );
        setOpening(false);
        setShowReveal(false);
        setNewStickers([]);
      }, 2000);
    }, 1200);
  }, [opening, stickers]);

  const collected = stickers.filter((s) => s.collected).length;
  const total = stickers.length;
  const progress = total > 0 ? (collected / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--wc-gold)]" />
            Mi Álbum Personal
          </h2>
          <p className="text-sm text-muted-foreground">
            Colecciona todas las estampillas del Mundial
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

      {/* Sticker Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
              sticker.collected
                ? "border-[var(--wc-gold)]/40 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-md shadow-[var(--wc-gold)]/10"
                : "border-gray-200 bg-gray-50/50 opacity-60"
            }`}
          >
            {sticker.collected ? (
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                    style={{ backgroundColor: POS_COLORS[sticker.posicion] }}
                  >
                    {sticker.posicion}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--wc-gold-dark)]">
                    #{sticker.numero}
                  </span>
                </div>
                <div className="flex items-center justify-center h-10 w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-lg font-black text-gray-400">
                    {getInitials(sticker.nombre)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold leading-tight truncate">{sticker.nombre}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-muted-foreground truncate">{sticker.fifaCode}</span>
                    <span className="text-[9px] text-muted-foreground">•</span>
                    <span className="text-[9px] text-muted-foreground truncate">{sticker.equipo}</span>
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
                <span className="text-[9px] text-gray-300">#{sticker.id}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pack Opening Area */}
      <div className="flex flex-col items-center py-6">
        {!opening && !showReveal && (
          <button
            onClick={openPack}
            disabled={collected >= total}
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
                {total - collected} estampillas por coleccionar
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
            <div className="flex gap-3 justify-center animate-in zoom-in-95 duration-300">
              {newStickers.map((s, i) => (
                <div
                  key={s.id}
                  className="relative rounded-xl border-2 border-[var(--wc-gold)]/40 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-lg shadow-[var(--wc-gold)]/20 p-3 w-28 animate-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white"
                        style={{ backgroundColor: POS_COLORS[s.posicion] }}
                      >
                        {s.posicion}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[var(--wc-gold-dark)]">
                        #{s.numero}
                      </span>
                    </div>
                    <div className="flex items-center justify-center h-10 w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-lg font-black text-gray-400">
                        {getInitials(s.nombre)}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold leading-tight truncate">{s.nombre}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{s.equipo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
