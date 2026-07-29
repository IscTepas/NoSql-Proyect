"use client";

import { useState } from "react";
import type { Jugador } from "@/lib/types";

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
  jugador: Pick<Jugador, "nombre" | "posicion" | "foto">;
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
      style={!showPhoto ? { background: `linear-gradient(135deg, #f3f4f6, #e5e7eb)` } : undefined}
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
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-lg font-black text-gray-400">{getInitials(jugador.nombre)}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: color }} />
    </div>
  );
}
