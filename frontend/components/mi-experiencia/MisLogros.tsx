"use client";

import { Award, Medal, Target, Zap, Globe, Trophy } from "lucide-react";

interface Logro {
  id: number;
  icon: typeof Trophy;
  titulo: string;
  descripcion: string;
  desbloqueado: boolean;
  color: string;
}

const LOGROS: Logro[] = [
  { id: 1, icon: Trophy, titulo: "Coleccionista Novato", descripcion: "Consigue 10 estampillas en tu álbum", desbloqueado: true, color: "#c8a951" },
  { id: 2, icon: Medal, titulo: "Experto en Fútbol", descripcion: "Completa tu once ideal con jugadores de 5+ países", desbloqueado: true, color: "#3b82f6" },
  { id: 3, icon: Globe, titulo: "Ciudadano del Mundo", descripcion: "Asiste a partidos en 3 estadios diferentes", desbloqueado: false, color: "#22c55e" },
  { id: 4, icon: Zap, titulo: "Súper Fan", descripcion: "Completa la colección completa del álbum", desbloqueado: false, color: "#ef4444" },
  { id: 5, icon: Target, titulo: "Crítico Experto", descripcion: "Escribe 5 opiniones sobre el Mundial", desbloqueado: false, color: "#a855f7" },
  { id: 6, icon: Award, titulo: "Legendario", descripcion: "Desbloquea todos los logros", desbloqueado: false, color: "#f59e0b" },
];

export default function MisLogros() {
  const desbloqueados = LOGROS.filter((l) => l.desbloqueado).length;
  const total = LOGROS.length;
  const progress = (desbloqueados / total) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--wc-gold)]" />
            Mis Logros
          </h2>
          <p className="text-sm text-muted-foreground">
            Desbloquea logros mientras exploras tu experiencia mundialista
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-bold text-[var(--wc-gold-dark)]">{desbloqueados}</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LOGROS.map((logro) => {
          const Icon = logro.icon;
          return (
            <div
              key={logro.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                logro.desbloqueado
                  ? "border-[var(--wc-gold)]/30 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-md"
                  : "border-gray-200 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    logro.desbloqueado
                      ? "shadow-md"
                      : "bg-gray-200"
                  }`}
                  style={logro.desbloqueado ? { backgroundColor: `${logro.color}20` } : undefined}
                >
                  <Icon
                    className="h-5 w-5"
                    style={logro.desbloqueado ? { color: logro.color } : { color: "#9ca3af" }}
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold ${logro.desbloqueado ? "" : "text-gray-400"}`}>
                    {logro.titulo}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {logro.descripcion}
                  </p>
                </div>
                {logro.desbloqueado && (
                  <Trophy className="h-4 w-4 text-[var(--wc-gold)] ml-auto flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
