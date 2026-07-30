"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { MessageSquare, Star, Plus, ThumbsUp, Loader2, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

const TITULO_MIN = 3;
const TITULO_MAX = 80;
const TEXTO_MIN = 10;
const TEXTO_MAX = 500;

function validarOpinion(titulo: string, texto: string): string | null {
  if (!titulo.trim() || !texto.trim()) {
    return "El título y la opinión son obligatorios.";
  }
  if (titulo.trim().length < TITULO_MIN) {
    return `El título debe tener al menos ${TITULO_MIN} caracteres.`;
  }
  if (titulo.trim().length > TITULO_MAX) {
    return `El título no puede superar los ${TITULO_MAX} caracteres.`;
  }
  if (texto.trim().length < TEXTO_MIN) {
    return `La opinión debe tener al menos ${TEXTO_MIN} caracteres.`;
  }
  if (texto.trim().length > TEXTO_MAX) {
    return `La opinión no puede superar los ${TEXTO_MAX} caracteres.`;
  }
  return null;
}

interface Opinion {
  _id: string;
  titulo: string;
  texto: string;
  rating: number;
  fecha: string;
}

export default function MiExperienciaFIFA({ year }: { year: number }) {
  const { data: opinions, isLoading } = useSWR<Opinion[]>(`/api/opiniones?año=${year}`, fetcher);
  const [showOpinionForm, setShowOpinionForm] = useState(false);

  const [newTitulo, setNewTitulo] = useState("");
  const [newTexto, setNewTexto] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editTexto, setEditTexto] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const addOpinion = async () => {
    const error = validarOpinion(newTitulo, newTexto);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/opiniones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: newTitulo.trim(),
          texto: newTexto.trim(),
          rating: newRating,
          año: year,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.mensaje || "Error al guardar la opinión.");
      }
      setNewTitulo("");
      setNewTexto("");
      setNewRating(5);
      setShowOpinionForm(false);
      mutate(`/api/opiniones?año=${year}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar la opinión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (opinion: Opinion) => {
    setEditingId(opinion._id);
    setEditTitulo(opinion.titulo);
    setEditTexto(opinion.texto);
    setEditRating(opinion.rating);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const error = validarOpinion(editTitulo, editTexto);
    if (error) {
      setEditError(error);
      return;
    }
    setEditError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/opiniones/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: editTitulo.trim(),
          texto: editTexto.trim(),
          rating: editRating,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.mensaje || "Error al actualizar la opinión.");
      }
      setEditingId(null);
      mutate(`/api/opiniones?año=${year}`);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al actualizar la opinión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeleteError(null);
  };

  const deleteOpinion = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/opiniones/${deletingId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.mensaje || "Error al eliminar la opinión.");
      }
      setDeletingId(null);
      setDeleteError(null);
      mutate(`/api/opiniones?año=${year}`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar la opinión. Intenta de nuevo.");
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type={interactive ? "button" : "button"}
        disabled={!interactive}
        onClick={() => onRate?.(i + 1)}
        className={interactive ? "transition-transform hover:scale-110" : ""}
      >
        <Star
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[var(--wc-gold)] text-[var(--wc-gold)]" : "fill-gray-200 text-gray-200"}`}
        />
      </button>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--wc-gold)]" />
      </div>
    );
  }

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4 text-[var(--wc-gold)]" />
            Mis Opiniones
          </h3>
          <button
            onClick={() => {
              setShowOpinionForm(!showOpinionForm);
              setFormError(null);
            }}
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
              maxLength={TITULO_MAX}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
            />
            <textarea
              placeholder="Escribe tu opinión sobre el Mundial..."
              value={newTexto}
              onChange={(e) => setNewTexto(e.target.value)}
              rows={3}
              maxLength={TEXTO_MAX}
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
            {formError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {formError}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowOpinionForm(false);
                  setFormError(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addOpinion}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)] text-white hover:bg-[var(--wc-gold-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Guardando..." : "Publicar"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {(!opinions || opinions.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aún no has escrito ninguna opinión. ¡Sé el primero!
            </p>
          ) : (
            opinions.map((opinion) => {
              const isEditing = editingId === opinion._id;
              const isDeleting = deletingId === opinion._id;

              // --- Edit mode: inline form ---
              if (isEditing) {
                return (
                  <div
                    key={opinion._id}
                    className="rounded-xl border-2 border-[var(--wc-gold)]/30 bg-white p-4 space-y-3 shadow-md"
                  >
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      maxLength={TITULO_MAX}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50"
                    />
                    <textarea
                      value={editTexto}
                      onChange={(e) => setEditTexto(e.target.value)}
                      rows={3}
                      maxLength={TEXTO_MAX}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wc-gold)]/30 focus:border-[var(--wc-gold)]/50 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Puntuación:</span>
                      <div className="flex gap-0.5">
                        {renderStars(editRating, true, (r) => setEditRating(r))}
                      </div>
                    </div>
                    {editError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {editError}
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Cancelar
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--wc-gold)] text-white hover:bg-[var(--wc-gold-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="h-3 w-3" />
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                );
              }

              // --- Delete confirmation ---
              if (isDeleting) {
                return (
                  <div
                    key={opinion._id}
                    className="rounded-xl border-2 border-red-200 bg-red-50 p-4 space-y-3"
                  >
                    <p className="text-sm font-medium text-red-800">
                      ¿Eliminar esta opinión?
                    </p>
                    <p className="text-xs text-red-600 line-clamp-2">{opinion.titulo}</p>
                    {deleteError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {deleteError}
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelDelete}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={deleteOpinion}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              }

              // --- Normal view ---
              return (
                <div
                  key={opinion._id}
                  className="group relative rounded-xl border border-gray-200 bg-white p-4 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold pr-8">{opinion.titulo}</p>
                      <p className="text-[10px] text-muted-foreground">{opinion.fecha}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {renderStars(opinion.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opinion.texto}</p>

                  <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(opinion)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-[var(--wc-gold)]/10 hover:text-[var(--wc-gold-dark)] transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(opinion._id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
