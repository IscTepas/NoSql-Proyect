"use client";

import { useState } from "react";
import type { Jugador } from "@/lib/types";
import Flag from "@/components/Flag";
import { UserRound } from "lucide-react";

const POS_COLORS: Record<string, string> = {
  GK: "#c8a951",
  DF: "#3b82f6",
  MF: "#22c55e",
  FW: "#ef4444",
};

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface PlayerPhotoProps {
  jugador: Pick<Jugador, "nombre" | "posicion" | "foto" | "fifaCodeEquipo" | "numero">;
  className?: string;
}

export default function PlayerPhoto({ jugador, className = "" }: PlayerPhotoProps) {
  const [failed, setFailed] = useState(false);
  const color = POS_COLORS[jugador.posicion] || "#9ca3af";
  const showPhoto = !!jugador.foto && !failed;

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-lg border ${
        showPhoto ? "border-gray-200 bg-gray-100" : "border-gray-200"
      } ${className}`}
      style={!showPhoto ? {
        background: `radial-gradient(circle at 75% 15%, ${color}55, transparent 36%), linear-gradient(145deg, ${color}22, #ffffff 52%, ${color}18)`,
        borderColor: `${color}45`,
      } : undefined}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={jugador.foto}
          alt={jugador.nombre}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="relative flex h-full w-full items-end justify-center">
          <span className="absolute -left-1 top-1 text-5xl font-black tracking-tighter opacity-[0.08]" style={{ color }}>
            {getInitials(jugador.nombre)}
          </span>
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-sm">
            <Flag code={jugador.fifaCodeEquipo} size={16} />
            <span className="text-[9px] font-black text-gray-600">{jugador.fifaCodeEquipo}</span>
          </div>
          <span className="absolute right-2 top-2 text-xs font-black opacity-50" style={{ color }}>#{jugador.numero}</span>
          <div className="relative flex h-[72%] w-[72%] items-end justify-center rounded-t-full" style={{ background: `linear-gradient(to top, ${color}30, ${color}08)` }}>
            <UserRound className="h-[82%] w-[82%] translate-y-1 stroke-[1.2]" style={{ color }} />
          </div>
          <div className="absolute bottom-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black tracking-wide shadow-sm" style={{ color }}>
            {getInitials(jugador.nombre)}
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: color }} />
    </div>
  );
}
