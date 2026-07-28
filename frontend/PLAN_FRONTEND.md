# Plan Frontend - FIFA World Cup 2026

## Stack Tecnologico

| Capa | Tecnologia | Estado |
|------|------------|--------|
| Framework | Next.js 16 + TypeScript | Instalado |
| Estilos | Tailwind CSS 4 | Instalado |
| Componentes UI | shadcn/ui | Instalado |
| Graficas | Recharts | Instalado |
| Data Fetching | SWR | Instalado |
| Iconos | lucide-react | Instalado |
| Fechas | date-fns | Instalado |
| Rendering | CSR (Client-Side Rendering) | Configurado |
| API | Backend Express en localhost:3000 | Funcional via rewrites |

---

## Estructura de Archivos

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (Inter font + Navbar + Footer + TooltipProvider)
│   ├── page.tsx                # Landing page: grid de 4 mundiales
│   ├── globals.css             # Paleta de colores mundial + shadcn vars
│   ├── tw-animate-local.css    # Animaciones Tailwind (local)
│   ├── mundiales/
│   │   ├── 2026/
│   │   │   └── page.tsx        # Dashboard 2026 (hero + stats + resultados)
│   │   ├── 2022/
│   │   │   └── page.tsx        # Placeholder "Proximamente"
│   │   ├── 2018/
│   │   │   └── page.tsx        # Placeholder "Proximamente"
│   │   └── 2014/
│   │       └── page.tsx        # Placeholder "Proximamente"
│   ├── selecciones/
│   │   └── page.tsx            # Grid de 48 selecciones filtrable
│   ├── grupos/
│   │   └── page.tsx            # Tablas de posiciones por grupo
│   ├── estadios/
│   │   └── page.tsx            # Grid de estadios con info
│   ├── partidos/
│   │   └── page.tsx            # Calendario completo de 104 partidos
│   ├── bracket/
│   │   └── page.tsx            # Bracket visual de eliminatorias
│   ├── jugadores/
│   │   └── page.tsx            # Estadisticas y busqueda de jugadores
│   └── [matchId]/
│       └── page.tsx            # Detalle de partido individual
├── components/
│   ├── Navbar.tsx              # Navegacion responsive (Mundiales, 2026, Selecciones, etc)
│   ├── Footer.tsx              # Footer con linea dorada decorativa
│   ├── StatCard.tsx            # Tarjeta reutilizable para estadisticas
│   ├── Flag.tsx                # Componente de bandera via flagcdn.com
│   ├── WCGeometry.tsx          # Patron SVG geometrico del "26" WC2026
│   └── ui/                     # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── lib/
│   ├── api.ts                  # Helper fetchApi() para llamadas al backend
│   ├── flags.ts                # Mapeo FIFA code -> ISO-2 para banderas
│   ├── types.ts                # Interfaces TypeScript (Equipo, Estadio, Grupo, Partido, Jugador)
│   └── utils.ts                # cn() utility de shadcn
├── .env.local                  # NEXT_PUBLIC_API_URL=http://localhost:3000
├── next.config.ts              # Rewrites para proxy API -> localhost:3000
└── package.json
```

---

## Paleta de Colores (Tema - WC2026 Oficial)

| Elemento | Variable CSS | Uso |
|----------|-------------|-----|
| Negro (Primario) | `--wc-black` / `--primary` | Navbar, footer, header de tablas, botones activos |
| Dorado (Acento) | `--wc-gold` | Acentos, badges, iconos de seccion, bordes, hover effects |
| Dorado Claro | `--wc-gold-light` | Fondos sutiles de acento |
| Dorado Oscuro | `--wc-gold-dark` | Texto sobre fondo claro |
| Blanco | `--wc-white` / `--background` | Fondos de cards, texto sobre negro |
| Exito (Verde) | `--wc-green` | Equipos clasificados, victorias, goles equipo 1 |
| Advertencia (Naranja) | `--wc-orange` | Goles equipo 2 |
| Peligro (Rojo) | `--wc-red` | Equipos eliminados, autogoles |
| Púrpura | `--wc-purple` | Confederaciones, charts |

---

## Modelos de Datos (API)

### Equipo
- nombre, nombreNormalizado, continente, banderaIcono, fifaCode, grupo, confederacion

### Estadio
- nombre, ciudad, capacidad, zonaHoraria, codigoPais, coordenadas

### Grupo
- nombre (A-L), torneo, equiposNombres, equipos (ref Equipo)

### Partido
- numeroPartido, ronda, fecha, hora, equipo1, equipo2, equipoGanador
- marcador: { ft, ht, et, p }
- goles1, goles2 (con nombre, minuto, penalti, autogol)
- grupo, estadio

### Jugador
- nombre, numero, posicion (GK/DF/MF/FW), fechaNacimiento
- club: { nombre, pais }
- fifaCodeEquipo, equipo (ref Equipo)

---

## Rutas de la API

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/equipos` | GET | Lista las 48 selecciones |
| `/api/estadios` | GET | Lista los 16 estadios |
| `/api/grupos` | GET | Lista los 12 grupos (con equipos populados) |
| `/api/partidos` | GET | Lista los 104 partidos (con equipos, estadio, grupo) |
| `/api/jugadores` | GET | Lista los 1248 jugadores (con equipo poblado) |

---

## Paginas Implementadas

### 1. Home/Dashboard (`/`) - COMPLETADO

**Componentes:**
- Hero Banner: Titulo "FIFA World Cup 2026" con gradiente + subtitulo con paises
- 4 StatCards: 48 Selecciones, 16 Estadios, 104 Partidos, 6 Confederaciones
- Grid 2x2:
  - Ultimos Resultados (5 partidos mas recientes jugados)
  - Proximos Partidos (5 partidos por jugar)
  - Goleadores Top 5 (calculados de goles en partidos)
  - Tablas de Posiciones (primeros 4 grupos A-D)
- Loading states con Skeleton
- Error handling si la API no responde

**Datos que consume:**
- GET /api/partidos
- GET /api/equipos
- GET /api/estadios
- GET /api/grupos

### 2. Selecciones (`/selecciones`) - COMPLETADO
- Grid de tarjetas de las 48 selecciones con bandera (SVG real via flagcdn.com), nombre, codigo FIFA, confederacion, grupo
- Filtros por confederacion (UEFA, CAF, AFC, CONCACAF, CONMEBOL, OFC) con conteo
- Busqueda por nombre o codigo FIFA
- Toggle vista grid / tabla
- Contador de equipos filtrados
- Loading skeleton

### 3. Grupos (`/grupos`) - COMPLETADO
- Selector de grupo (A-L) con botones de estilo pill
- Tabla de posiciones completa (PJ, PG, PE, PP, GF, GC, DG, Pts)
- Colores: verde (clasificado), amarillo (tercero), rojo (eliminado) con indicador lateral
- Badge numerico de posicion con color por estado
- Calendario de partidos del grupo con resultados y estadios
- Estadisticas del grupo (total partidos, goles, promedio)
- Vista responsive: grid 2 columnas en desktop (tabla + sidebar)

---

### 4. Estadios (`/estadios`) - COMPLETADO
- Grid de 16 estadios con tarjetas (icono Building2, bandera pais)
- Info: nombre, ciudad, pais, capacidad, zona horaria
- Filtro por pais (US, MX, CA) con conteo y bandera
- Busqueda por nombre o ciudad
- Detalle expandible con lista de partidos programados por estadio
- Badge de pais con color (azul=US, verde=MX, rojo=CA)
- Capacidad formateada con separadores de miles
- Loading skeleton

### 5. Calendario de Partidos (`/partidos`) - COMPLETADO
- Timeline vertical con linea conectando partidos por fecha
- Filtros por ronda (Fase de Grupos, Octavos, Cuartos, Semifinal, 3er Puesto, Final)
- Busqueda por equipo, estadio o fecha
- Colores por fase: azul=grupos, naranja=octavos, purpura=cuartos, dorado=semifinal/final, rojo=3er puesto
- Partido expandible con: marcador HT/ET/Penales, goles detallados (minuto, penalti, autogol), ganador
- Agrupacion por fecha con header sticky
- Indicador visual de partidos jugados (borde verde izquierdo)
- Loading skeleton

### 6. Bracket de Eliminatorias (`/bracket`) - COMPLETADO
- Bracket visual horizontal: Round of 32 → Round of 16 → Quarter-final → Semi-final → Final
- Lado Izquierdo (Grupos A-D) y Lado Derecho (Grupos E-L)
- MatchCard con flags, scores, ganador destacado en verde
- Badge de ronda por columna (R32 negro, QF/SF dorado, Final dorado con icono Trophy)
- Display del campeon al final con Trophy, bandera y score
- Manejo de partidos no jugados ("Por definir")
- Score detallado: PEN, AET indicators
- Dark theme (fondo negro a gradiente)

### 7. Jugadores (`/jugadores`) - COMPLETADO
- Busqueda por nombre, equipo o codigo FIFA
- Filtros por posicion (Porteros, Defensas, Mediocampistas, Delanteros) con colores por posicion
- Filtros por equipo (primeros 16 con bandera)
- Panel de estadísticas: distribución por posición (barras), top goleadores (Recharts BarChart)
- Grid de jugadores: card con posición (color badge), numero, nombre, equipo, club
- Barra de color por posición en cada card
- Toggle mostrar/ocultar estadísticas
- Dark theme

### 8. Detalle de Partido (`/[matchId]`) - COMPLETADO
- Header: Bandera eq1 vs Bandera eq2 + marcador grande
- Score detallado: FT, HT, ET, PEN
- Ganador destacado en dorado, perdedor atenuado
- Badge de Final del Mundial con icono Trophy
- Lista de goles por equipo: minuto, nombre, badges PEN/OG
- Card de estadio: nombre, ciudad, capacidad, pais
- Badges informativos: numero, ronda, grupo, tipo (eliminatoria)
- Link "Volver a Partidos"
- Loading skeleton, 404 state
- Dark theme

### 9. Estructura de Rutas Mundiales - COMPLETADO
- Landing page (`/`) con grid de 4 mundiales (2026, 2022, 2018, 2014)
- 2026 marcado como "Actual" con badge dorado
- Dashboard 2026 (`/mundiales/2026`) con hero + stats + resultados
- Placeholders para 2022, 2018, 2014 con "Proximamente"
- Navbar actualizada: "Mundiales" → `/`, "2026" → `/mundiales/2026`

---

## Features Adicionales

1. Busqueda global en navbar
2. Toggle Dark/Light Mode
3. Favoritos en localStorage
4. Comparacion de equipos
5. Mapa de sedes
6. Linea de tiempo del torneo
7. Predicciones del usuario
8. Contador regresivo
9. Estadisticas por estadio
10. Panel de progreso del torneo

---

## Actualizaciones

### 2026-07-26: Pasos 1-4 Completado

**Archivos creados:**
- `frontend/.env.local` - Variable de entorno API
- `frontend/next.config.ts` - Rewrites para proxy API
- `frontend/app/grupos/page.tsx` - Pagina de grupos con selector, tabla y calendario
- `frontend/app/selecciones/page.tsx` - Pagina de selecciones con grid/tabla y filtros
- `frontend/components/Flag.tsx` - Componente de bandera SVG via flagcdn.com
- `frontend/components/ui/input.tsx` - Componente input de shadcn
- `frontend/lib/flags.ts` - Mapeo FIFA code -> ISO-2 para banderas
- `frontend/components/ui/*` - shadcn components (badge, button, card, separator, skeleton, table, tabs, tooltip, input)

**Archivos modificados:**
- `frontend/app/layout.tsx` - Fuente Inter + JetBrains Mono, layout con Navbar + Footer + TooltipProvider
- `frontend/app/page.tsx` - Dashboard con banderas SVG, gradientes, hover effects
- `frontend/app/selecciones/page.tsx` - Cards con banderas SVG que llenan el recuadro
- `frontend/app/grupos/page.tsx` - Tabla con colores por posicion y calendario de partidos
- `frontend/app/globals.css` - Paleta de colores WC2026 + shadcn + tw-animate-local
- `frontend/components/Navbar.tsx` - Logo con icono lucide, sin emojis
- `frontend/components/StatCard.tsx` - Gradiente sutil y shadow hover
- `frontend/components/Footer.tsx` - Icono lucide
- `Backend/BD/seed.js` - Fix: mapeo de confederacion, nombreNormalizado, continente, banderaIcono

**Dependencias instaladas:**
- swr, recharts, lucide-react, date-fns, shadcn/ui, tw-animate-css

**Mejoras de UI:**
- Fuente Inter para todo el sitio, JetBrains Mono para monoespaciado
- Banderas SVG reales via flagcdn.com (mapeo FIFA -> ISO-2, 48 paises)
- Cards con hover shadow-xl, transiciones 300ms, gradientes sutiles
- Navbar con backdrop-blur-xl
- Badges con sombra, botones de filtro con shadow al activar
- Tablas con indicador lateral de color por posicion (verde/amarillo/rojo)

**Verificacion:**
- `npm run build` exitoso sin errores de TypeScript
- 3 paginas funcionando: `/`, `/selecciones`, `/grupos`
- Banderas SVG cargando correctamente desde flagcdn.com
- Filtros de confederacion funcionando (requerio fix del seed backend)
- Grupos con tabla de posiciones y calendario por grupo

### 2026-07-27: Pasos 4-5 Completado

**Archivos creados:**
- `frontend/app/estadios/page.tsx` - Pagina de estadios con grid, filtros por pais, busqueda y detalle expandible
- `frontend/app/partidos/page.tsx` - Pagina de calendario con timeline, filtros por ronda y partidos expandibles

**Features implementadas:**
- Estadios: Grid responsive 1-4 columnas con tarjetas que muestran icono Building2, bandera del pais, capacidad formateada, zona horaria
- Estadios: Filtros por pais (US/MX/CA) con conteo y bandera, busqueda por nombre/ciudad
- Estadios: Detalle expandible por estadio mostrando partidos programados con resultado o hora
- Estadios: Colores por pais (azul=US, verde=MX, rojo=CA) en badges
- Partidos: Timeline vertical con linea conectando partidos, agrupados por fecha con header sticky
- Partidos: Filtros por ronda (7 fases) con conteo, busqueda por equipo/estadio/fecha
- Partidos: Colores por fase (azul=grupos, naranja=octavos, purpura=cuartos, dorado=semifinal/final, rojo=3er puesto)
- Partidos: Partido expandible con marcador HT/ET/Penales, goles detallados (minuto, penalti, autogol), ganador
- Partidos: Indicador visual de partidos jugados (borde verde izquierdo)

**Verificacion:**
- `npm run build` exitoso sin errores de TypeScript
- 5 paginas funcionando: `/`, `/selecciones`, `/grupos`, `/estadios`, `/partidos`
- Estadios con 16 tarjetas y filtro por 3 paises
- Partidos con timeline de 104 partidos y 7 filtros de ronda

### 2026-07-27: Fix Estadios y Partidos

**Bug seed.js (Backend/BD/seed.js):**
- El seed escribia `pais: "Estados Unidos"` en vez de `codigoPais` (campo del schema)
- Usaba `stadium.cc` (inexistente en JSON) en vez de `stadium.codigoPais`
- No incluia `zonaHoraria` ni `coordenadas`
- Fix: Ahora escribe `codigoPais`, `zonaHoraria`, `coordenadas` correctamente desde el JSON

**Fix frontend/app/estadios/page.tsx:**
- `getCountryCode()` ahora lee `codigoPais` en lowercase de la DB
- Mapeo de paises usa keys lowercase ("us", "mx", "ca") consistentes con la DB
- Labels legibles: "EE.UU.", "Mexico", "Canada"

**Fix frontend/app/partidos/page.tsx:**
- Filtros de ronda ahora usan valores reales de la API: "Matchday 1-3", "Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Match for third place", "Final"
- Busqueda por grupo funciona: busca "group A" en `p.grupo.nombre`
- Busqueda incluye: equipo, fifaCode, estadio, ciudad, fecha, ronda, grupo

**Verificacion:**
- Seed ejecutado: 16 estadios, 48 equipos, 1248 jugadores, 12 grupos, 104 partidos
- `npm run build` exitoso sin errores

### 2026-07-27: Rediseño WC2026 Oficial

**Cambio de sistema de diseño:**
- Paleta: Negro/Blanco/Dorado (oficial FIFA World Cup 2026) reemplaza azul como primario
- Navbar: Fondo negro con logo dorado "26" y texto "FIFA WORLD CUP"
- Footer: Fondo negro con linea dorada decorativa
- Hero: Seccion negra con patron geometrico WCGeometry y "26" dorado grande
- Cards: Bordes dorados sutiles, hover con sombra dorada
- Botones de filtro: Negro activo, dorado inactivo
- Headers de tabla: Fondo negro con texto blanco
- Score badges: Fondo negro para marcadores
- Input fields: Bordes dorados en focus

**Archivos creados:**
- `frontend/components/WCGeometry.tsx` - Patron SVG geometrico del "26" con 48 unidades

**Archivos modificados:**
- `frontend/app/globals.css` - Nueva paleta: primary=negro, wc-gold dorado, wc-gold-dark, wc-gold-light
- `frontend/app/page.tsx` - Hero WC2026 con WCGeometry, StatCards con nueva paleta
- `frontend/components/Navbar.tsx` - Navbar negro con logo dorado "26"
- `frontend/components/Footer.tsx` - Footer negro con linea dorada
- `frontend/components/StatCard.tsx` - Cards con acentos dorados
- `frontend/app/selecciones/page.tsx` - Filtros y tabla con colores WC2026
- `frontend/app/grupos/page.tsx` - Tabla con header negro, badges dorados
- `frontend/app/estadios/page.tsx` - Cards con bordes dorados
- `frontend/app/partidos/page.tsx` - Timeline con linea dorada, badges de fecha negros

**Verificacion:**
- `npm run build` exitoso sin errores de TypeScript
- 5 paginas funcionando con nuevo sistema de diseño WC2026

### 2026-07-27: Pasos 6-8 + Estructura Mundiales Completado

**Archivos creados:**
- `frontend/app/bracket/page.tsx` - Bracket visual de eliminatorias (R32→R16→QF→SF→Final)
- `frontend/app/jugadores/page.tsx` - Busqueda/filtros de jugadores + estadisticas con Recharts
- `frontend/app/[matchId]/page.tsx` - Detalle de partido individual con scorecard
- `frontend/app/mundiales/2026/page.tsx` - Dashboard 2026 (hero + stats + resultados)
- `frontend/app/mundiales/2022/page.tsx` - Placeholder "Proximamente"
- `frontend/app/mundiales/2018/page.tsx` - Placeholder "Proximamente"
- `frontend/app/mundiales/2014/page.tsx` - Placeholder "Proximamente"

**Archivos modificados:**
- `frontend/app/page.tsx` - Landing page con grid de 4 mundiales
- `frontend/components/Navbar.tsx` - Links actualizados: "Mundiales" → `/`, "2026" → `/mundiales/2026`

**Features implementadas:**
- Bracket: Layout horizontal con columnas por ronda, MatchCard con flags/scores, campeon display
- Jugadores: Filtros por posicion/equipo, barras de distribucion, top goleadores con Recharts BarChart
- Detalle Partido: Header con flags vs score grande, goles cronologicos, info de estadio
- Rutas Mundiales: Landing `/` con 4 cards de mundiales, dashboard 2026 funcional

**Verificacion:**
- `npm run build` exitoso sin errores de TypeScript
- 14 rutas generadas: `/`, `/mundiales/2014|2018|2022|2026`, `/selecciones`, `/grupos`, `/estadios`, `/partidos`, `/bracket`, `/jugadores`, `/[matchId]`
