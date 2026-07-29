"use client";

import { useState } from "react";
import { MessageSquare, MapPin, Star, Plus, Calendar, ThumbsUp } from "lucide-react";

interface Opinion {
  id: number;
  titulo: string;
  texto: string;
  rating: number;
  fecha: string;
}

interface Asistencia {
  id: number;
  partido: string;
  estadio: string;
  fecha: string;
  comentario: string;
}

const INITIAL_OPINIONS: Opinion[] = [
  { id: 1, titulo: "¡El mejor mundial de la historia!", texto: "La organización fue increíble, los estadios espectaculares y el nivel de juego altísimo. Una experiencia inolvidable.", rating: 5, fecha: "2026-07-15" },
  { id: 2, titulo: "La sede fue espectacular", texto: "Las ciudades sede hicieron un trabajo fantástico. La infraestructura y el transporte funcionaron a la perfección.", rating: 4, fecha: "2026-07-20" },
];

const INITIAL_ASISTENCIAS: Asistencia[] = [
  { id: 1, partido: "Argentina vs Brasil - Final", estadio: "Estadio Maracaná", fecha: "2026-07-19", comentario: "¡El ambiente era eléctrico! Nunca olvidaré ese partido." },
  { id: 2, partido: "España vs Francia - Semifinal", estadio: "Estadio Santiago Bernabéu", fecha: "2026-07-14", comentario: "Partidazo de principio a fin, el público coreó todo el partido." },
];

export default function MiExperienciaFIFA() {
  const [opinions, setOpinions] = useState<Opinion[]>(INITIAL_OPINIONS);
  const [asistencias, setAsistencias] = useState<Asistencia[]>(INITIAL_ASISTENCIAS);
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [showAsistenciaForm, setShowAsistenciaForm] = useState(false);

  // Opinion form
  const [newTitulo, setNewTitulo] = useState("");
  const [newTexto, setNewTexto] = useState("");
  const [newRating, setNewRating] = useState(5);

  // Asistencia form
  const [newPartido, setNewPartido] = useState("");
  const [newEstadio, setNewEstadio] = useState("");
  const [newFechaPartido, setNewFechaPartido] = useState("");
  const [newComentario, setNewComentario] = useState("");

  const addOpinion = () => {
    if (!newTitulo.trim() || !newTexto.trim()) return;
    const opinion: Opinion = {
      id: Date.now(),
      titulo: newTitulo,
      texto: newTexto,
      rating: newRating,
      fecha: new Date().toISOString().split("T")[0],
    };
    setOpinions((prev) => [opinion, ...prev]);
    setNewTitulo("");
    setNewTexto("");
    setNewRating(5);
    setShowOpinionForm(false);
  };

  const addAsistencia = () => {
    if (!newPartido.trim() || !newEstadio.trim() || !newFechaPartido.trim()) return;
    const asistencia: Asistencia = {
      id: Date.now(),
      partido: newPartido,
      estadio: newEstadio,
      fecha: newFechaPartido,
      comentario: newComentario,
    };
    setAsistencias((prev) => [asistencia, ...prev]);
    setNewPartido("");
    setNewEstadio("");
    setNewFechaPartido("");
    setNewComentario("");
    setShowAsistenciaForm(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? "fill-[var(--wc-gold)] text-[var(--wc-gold)]" : "fill-gray-200 text-gray-200"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--wc-gold)]" />
          Mi Experiencia FIFA
        </h2>
        <p className="text-sm text-muted-foreground">
          Comparte tus opiniones y las experiencias de los partidos que viviste
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Opiniones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-[var(--wc-gold)]" />
              Mis Opiniones
            </h3>
            <button
              onClick={() => setShowOpinionForm(!showOpinionForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)] border border-[var(--wc-gold)]/20 hover:bg-[var(--wc-gold)]/20 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Nueva
            </button>
          </div>

          {showOpinionForm && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
              <input
                type="text"
                placeholder="Título de tu opinión..."
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
              />
              <textarea
                placeholder="Escribe tu opinión sobre el Mundial..."
                value={newTexto}
                onChange={(e) => setNewTexto(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50 resize-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Puntuación:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewRating(i + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          i < newRating
                            ? "fill-[var(--wc-gold)] text-[var(--wc-gold)]"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowOpinionForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addOpinion}
                  disabled={!newTitulo.trim() || !newTexto.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)] text-white hover:bg-[var(--wc-gold-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {opinions.map((opinion) => (
              <div
                key={opinion.id}
                className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{opinion.titulo}</p>
                    <p className="text-[10px] text-muted-foreground">{opinion.fecha}</p>
                  </div>
                  <div className="flex">{renderStars(opinion.rating)}</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{opinion.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Asistencias a Partidos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--wc-gold)]" />
              Partidos Asistidos
            </h3>
            <button
              onClick={() => setShowAsistenciaForm(!showAsistenciaForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)] border border-[var(--wc-gold)]/20 hover:bg-[var(--wc-gold)]/20 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Añadir
            </button>
          </div>

          {showAsistenciaForm && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
              <input
                type="text"
                placeholder="Partido (ej: Argentina vs Brasil)"
                value={newPartido}
                onChange={(e) => setNewPartido(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
              />
              <input
                type="text"
                placeholder="Estadio"
                value={newEstadio}
                onChange={(e) => setNewEstadio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
              />
              <input
                type="date"
                value={newFechaPartido}
                onChange={(e) => setNewFechaPartido(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
              />
              <textarea
                placeholder="¿Cómo fue tu experiencia en este partido?"
                value={newComentario}
                onChange={(e) => setNewComentario(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAsistenciaForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addAsistencia}
                  disabled={!newPartido.trim() || !newEstadio.trim() || !newFechaPartido.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)] text-white hover:bg-[var(--wc-gold-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {asistencias.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{a.partido}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {a.estadio}
                      </span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{a.fecha}</span>
                    </div>
                    {a.comentario && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-gray-50 rounded-lg p-2">
                        {a.comentario}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
