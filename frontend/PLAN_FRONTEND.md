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
│   ├── layout.tsx              # Root layout (Navbar + Footer + TooltipProvider)
│   ├── page.tsx                # Home/Dashboard principal
│   ├── globals.css             # Paleta de colores mundial + shadcn vars
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
│   ├── Navbar.tsx              # Navegacion responsive con links activos
│   ├── Footer.tsx              # Footer con credits
│   ├── StatCard.tsx            # Tarjeta reutilizable para estadisticas
│   └── ui/                     # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── lib/
│   ├── api.ts                  # Helper fetchApi() para llamadas al backend
│   ├── types.ts                # Interfaces TypeScript (Equipo, Estadio, Grupo, Partido, Jugador)
│   └── utils.ts                # cn() utility de shadcn
├── .env.local                  # NEXT_PUBLIC_API_URL=http://localhost:3000
├── next.config.ts              # Rewrites para proxy API -> localhost:3000
└── package.json
```

---

## Paleta de Colores (Tema)

| Elemento | Variable CSS | Uso |
|----------|-------------|-----|
| Primario (Azul) | `--primary` | Navbar, botones, links activos |
| Secundario (Dorado) | `--wc-gold` | Acentos, badges, estrellas |
| Exito (Verde) | `--wc-green` | Equipos clasificados, victorias |
| Advertencia (Naranja) | `--wc-orange` | Tercer puesto, empates |
| Peligro (Rojo) | `--wc-red` | Equipos eliminados |
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
- Hero Banner: Titulo "FIFA World Cup 2026" + subtitulo con paises
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

---

## Paginas Pendientes

### 2. Selecciones (`/selecciones`) - COMPLETADO
- Grid de tarjetas de las 48 selecciones con bandera, nombre, codigo FIFA, confederacion, grupo
- Filtros por confederacion (UEFA, CAF, AFC, CONCACAF, CONMEBOL, OFC) con conteo
- Busqueda por nombre o codigo FIFA
- Toggle vista grid / tabla
- Contador de equipos filtrados
- Loading skeleton

### 3. Grupos (`/grupos`) - PENDIENTE
- Selector de grupo (A-L)
- Tabla de posiciones completa (PJ, PG, PE, PP, GF, GC, DG, Pts)
- Colores: verde (clasificado), amarillo (tercero), rojo (eliminado)
- Calendario de partidos del grupo
- Estadisticas del grupo

### 4. Estadios (`/estadios`) - PENDIENTE
- Grid de 16 estadios con tarjetas
- Info: nombre, ciudad, pais, capacidad, zona horaria
- Filtro por pais (US, MX, CA)
- Detalle con lista de partidos programados
- Mapa estatico

### 5. Calendario de Partidos (`/partidos`) - PENDIENTE
- Timeline vertical de 104 partidos
- Filtros por ronda, fecha, equipo, estadio
- Colores por fase (azul=naranja=purpura=dorado=rojo)
- Partido expandible con goles detallados

### 6. Bracket de Eliminatorias (`/bracket`) - PENDIENTE
- Bracket visual SVG: Octavos -> Cuartos -> Semis -> Final
- Lineas conectando ganadores
- Hover con info detallada
- Click para modal con detalle
- Resaltado del camino del campeon
- Vista responsive por rondas en movil

### 7. Jugadores (`/jugadores`) - PENDIENTE
- Busqueda global por nombre, equipo, posicion
- Filtros por posicion (GK, DF, MF, FW)
- Ranking de goleadores con grafica de barras
- Distribucion de posiciones (dona)
- Distribucion por confederacion
- Detalle de jugador (equipo, club, edad)

### 8. Detalle de Partido (`/[matchId]`) - PENDIENTE
- Header: Bandera eq1 vs Bandera eq2 + marcador
- Marcador detallado (FT, HT, ET, P)
- Lista cronologica de goles
- Info del estadio
- Plantillas de titulares

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

### 2026-07-26: Paso 1 + 2 Completado

**Archivos creados/modificados:**
- `frontend/.env.local` - Variable de entorno API
- `frontend/next.config.ts` - Rewrites para proxy
- `frontend/app/globals.css` - Paleta de colores WC2026 + shadcn
- `frontend/app/layout.tsx` - Layout con Navbar + Footer + TooltipProvider
- `frontend/app/page.tsx` - Dashboard completo con datos reales
- `frontend/lib/api.ts` - Helper fetchApi()
- `frontend/lib/types.ts` - Interfaces TypeScript
- `frontend/components/Navbar.tsx` - Navegacion responsive
- `frontend/components/Footer.tsx` - Footer
- `frontend/components/StatCard.tsx` - Tarjeta de estadisticas
- `frontend/components/ui/*` - shadcn components (badge, button, card, separator, skeleton, table, tabs, tooltip)

**Dependencias instaladas:**
- swr, recharts, lucide-react, date-fns, shadcn/ui

**Verificacion:**
- `npm run build` exitoso sin errores de TypeScript
- Dashboard muestra datos reales del API (48 equipos, 16 estadios, 104 partidos, 6 confederaciones)
- Navbar funcional con navegacion responsive (desktop + mobile)
- Loading states con Skeleton
- Top goleadores calculados de los partidos
- Tablas de posiciones para grupos A-D

### 2026-07-26: Paso 3 - Selecciones Completado

**Archivos creados:**
- `frontend/app/selecciones/page.tsx` - Pagina completa de selecciones
- `frontend/components/ui/input.tsx` - Componente input de shadcn

**Funcionalidades:**
- Grid de tarjetas (6 columnas desktop, 2 movil) con bandera, nombre, codigo FIFA, confederacion (color-coded), grupo
- Vista tabla alternativa con bandera, nombre, nombre normalizado, codigo, confederacion, continente, grupo
- Barra de busqueda por nombre o codigo FIFA
- Filtros de confederacion con conteo de equipos por confederacion
- Toggle grid/tabla
- Loading skeleton
- Mensaje cuando no hay resultados
