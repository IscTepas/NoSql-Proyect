# Plan: Panel Principal con Carrusel Multi-Mundiales

## Objetivo

Transformar el home del portal (que solo mostraba datos del Mundial 2026) en un **panel principal con carrusel horizontal** que muestre 5 paneles:
- 4 paneles laterales (2 por lado) con información resumen de cada mundial
- 1 panel central informativo general del proyecto

---

## Mundiales Incluidos

| Año | Sede | Campeón | Bandera |
|-----|------|---------|---------|
| 2026 | Estados Unidos, México, Canadá | Por definirse | — |
| 2022 | Catar | Argentina | AR |
| 2018 | Rusia | Francia | FR |
| 2014 | Brasil | Alemania | DE |

---

## Layout del Carrusel

```
[ Panel 2014 ] [ Panel 2018 ] [ CENTRO INFO ] [ Panel 2022 ] [ Panel 2026 ]
```

- **Scroll horizontal** con `scroll-snap-type: x mandatory`
- **Flechas de navegación** izquierda/derecha en desktop
- **Indicadores** (dots) debajo del carrusel
- **Responsive**: en móvil se muestra 1 panel a la vez con scroll snap

### Comportamiento del Panel Central
- Muestra: título del portal, descripción, estadísticas globales (4 mundiales, 144 selecciones, 296 partidos, 512 goles)
- **Hover**: se expande con `scale(1.05)` y transición de 500ms, muestra "Explorar portal →"
- **Click**: hace scroll hacia el panel central (snap)

### Comportamiento de los Paneles de Mundiales
- Muestra: año grande decorativo, bandera del campeón, nombre del mundial, sede, campeón, stats (equipos, partidos)
- **Hover**: `scale(1.03)`, sombra, borde dorado
- **Click**: navega a `/mundiales/{año}` (pendiente de crear rutas)

---

## Archivos Creados

### `frontend/lib/worldcups.ts`
Datos estáticos de los 4 mundiales + info del proyecto.

```typescript
export interface WorldCup {
  id: string;           // "2026", "2022", etc.
  year: number;
  name: string;         // "FIFA World Cup 2026"
  host: string;         // "Estados Unidos, México, Canadá"
  champion: string;     // "Argentina"
  championFlag: string; // código FIFA "AR"
  runnerUp: string;
  teams: number;
  matches: number;
  goals: number;
  topScorer: string;
  color: string;        // variable CSS por mundial
  route: string;        // "/mundiales/2026"
}

export const WORLDCUPS: WorldCup[] = [...];
export const PROJECT_INFO = { title, description, totalWorldCups, ... };
```

### `frontend/components/MundialCard.tsx`
Tarjeta individual para cada mundial.
- Usa componente `Flag` existente para banderas
- Iconos de lucide-react (Trophy, Users, Calendar, MapPin)
- Gradiente de color por mundial
- Año grande como fondo decorativo (opacity 10-20%)

### `frontend/components/WorldCupCarousel.tsx`
Componente principal del carrusel.
- Separa mundiales en `leftWorldCups` (2014, 2018) y `rightWorldCups` (2022, 2026)
- Panel central con `PROJECT_INFO`
- Estado `centerHovered` para expandir el panel central
- Estado `activeIndex` para el indicador activo
- Función `scrollTo(index)` con scroll smooth
- Función `scrollBy(direction)` para flechas
- `checkScroll()` para habilitar/deshabilitar flechas

---

## Archivos Modificados

### `frontend/app/page.tsx`
- **ANTES**: Dashboard con StatCards, grid 2x2 (resultados, próximos partidos, goleadores, tablas)
- **AHORA (2026-07-27)**: Landing page con grid de 4 cards de mundiales (2026, 2022, 2018, 2014)
- El dashboard anterior se movió a `/mundiales/2026/page.tsx`
- **PENDIENTE**: El carrusel horizontal aún NO se ha construido; actualmente es un grid estático

### `frontend/app/globals.css`
- Agregadas variables de color por mundial:
  ```css
  --wc-2014: oklch(0.55 0.18 155);  /* Verde Brasil */
  --wc-2018: oklch(0.58 0.20 25);   /* Rojo Rusia */
  --wc-2022: oklch(0.48 0.15 310);  /* Morado Qatar */
  --wc-2026: oklch(0.42 0.16 255);  /* Azul Norteamérica */
  ```
- Agregada utilidad `.hide-scrollbar` para ocultar scrollbar del carrusel

### `frontend/components/Navbar.tsx`
- Logo mantiene el dorado "26" de WC2026
- Links actualizados: "Mundiales" → `/`, "2026" → `/mundiales/2026`
- Resto de links (Selecciones, Grupos, Estadios, Partidos, Bracket, Jugadores) sin cambios

### `frontend/components/Footer.tsx`
- Texto cambiado de "FIFA World Cup 2026" a "FIFA World Cup Portal"
- Años mostrados: "2014 · 2018 · 2022 · 2026"

---

## Pendiente (Próximos Pasos)

### 1. ~~Crear rutas para cada mundial~~ COMPLETADO (2026-07-27)
```
frontend/app/mundiales/2026/page.tsx  → Dashboard del 2026 (hero + stats + resultados)
frontend/app/mundiales/2022/page.tsx  → Placeholder "Proximamente"
frontend/app/mundiales/2018/page.tsx  → Placeholder "Proximamente"
frontend/app/mundiales/2014/page.tsx  → Placeholder "Proximamente"
frontend/app/page.tsx                  → Landing page con grid de 4 mundiales
```

### 2. Agregar datos de mundiales anteriores
- Crear JSONs seed para 2014, 2018, 2022 en `Backend/data/`
- Actualizar `Backend/BD/seed.js` para soportar múltiples mundiales
- O crear un parámetro `?mundial=2022` en la API existente

### 3. Adaptar la API
- Opción A: Agregar campo `mundial` a cada modelo (Equipo, Partido, etc.)
- Opción B: Crear colecciones separadas por mundial (`equipos_2022`, `partidos_2022`)
- Recomendación: Opción A con índice compuesto para performance

### 4. Navbar dinámico
- Selector de mundial activo en el navbar
- Links adaptados al mundial seleccionado

### 5. Mejoras del carrusel (opcional)
- Autoplay con pausa en hover
- Drag para scroll en desktop
- Animación de entrada con framer-motion
- Imágenes de fondo por mundial (logos oficiales)

---

## Comandos Útiles

```bash
# Correr frontend en desarrollo
cd frontend && npm run dev

# Build de producción
cd frontend && npm run build

# Verificar tipos TypeScript
cd frontend && npx tsc --noEmit
```

---

## Notas Técnicas

- **Sin dependencias nuevas**: Todo con Tailwind CSS + React + Next.js (ya instalados)
- **Componentes reutilizados**: `Flag` (banderas), `Skeleton`, shadcn/ui
- **Patrón de datos**: `WORLDCUPS` array centralizado en `lib/worldcups.ts` fácil de modificar
- **CSS**: Variables `--wc-{año}` para tematización por mundial
- **Build verificado**: `npm run build` pasa sin errores TypeScript
