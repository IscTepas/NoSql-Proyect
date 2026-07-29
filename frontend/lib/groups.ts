import type { Grupo, Partido } from "@/lib/types";

/**
 * Comprueba si un partido pertenece a un grupo. Además de la referencia de
 * MongoDB, admite los datos antiguos en los que el partido quedó sin `grupo`
 * y lo infiere a partir del grupo de ambos equipos durante la fase de grupos.
 */
export function isMatchInGroup(partido: Partido, grupo: Grupo): boolean {
  if (
    partido.grupo?._id === grupo._id ||
    partido.grupo?.nombre?.toUpperCase() === grupo.nombre.toUpperCase()
  ) {
    return true;
  }

  if (!/^Matchday\b/i.test(partido.ronda)) return false;

  const groupName = grupo.nombre.toUpperCase();
  return (
    partido.equipo1?.grupo?.toUpperCase() === groupName &&
    partido.equipo2?.grupo?.toUpperCase() === groupName
  );
}
