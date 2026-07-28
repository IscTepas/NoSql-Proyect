"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Clock } from "lucide-react";

export default function Mundial2014Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--wc-gold)]/5 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--wc-gold-dark)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="text-center py-20 space-y-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-[var(--wc-gold)]/10 border border-[var(--wc-gold)]/20">
            <Trophy className="h-10 w-10 text-[var(--wc-gold)]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[var(--wc-black)] mb-2">2014</h1>
            <p className="text-muted-foreground text-sm">FIFA World Cup Brazil</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Próximamente</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Los datos del mundial Brasil 2014 estarán disponibles en una futura actualización.
          </p>
        </div>
      </div>
    </div>
  );
}
