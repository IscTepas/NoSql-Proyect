# Guía del Proyecto — Arquitectura, Tecnologías y Navegación

> NoSql-Proyect — Portal de los Mundiales de la FIFA (2014, 2018, 2022, 2026)

---

## 1. Arquitectura general del proyecto

El proyecto es un **monorepo con dos aplicaciones independientes** que se comunican por HTTP:

```
NoSql-Proyect/
├── Backend/     → API REST (Node.js + Express + Mongoose sobre MongoDB)
└── frontend/    → Next.js (App Router) + React + Tailwind CSS
```

- El **Backend** expone los datos de los 4 mundiales a través de una API REST. No hay una base de datos por torneo: **todos los años viven en las mismas colecciones de MongoDB**, y cada documento tiene un campo `año` que actúa como partición lógica (ej. un mismo modelo `Equipo` sirve tanto para 2014 como para 2026, filtrando por `?año=`).
- El **Frontend** consume esa API mediante peticiones HTTP (usando `SWR`) y renderiza las pantallas: selecciones, grupos, estadios, calendario, bracket, jugadores, etc.
- **Comunicación cliente-servidor real**: no es un monolito con renderizado acoplado a la base de datos; el frontend nunca toca MongoDB directamente, siempre pasa por la API.
- En **desarrollo**, el backend corre en el puerto `3000` y el frontend en el `3001`. El frontend reescribe internamente todas las llamadas a `/api/*` hacia `http://localhost:3000/api/*` (ver `next.config.ts`), por lo que desde el navegador todo parece servido desde un solo origen.
- En **producción**, el backend se despliega como función serverless en Vercel.

Diagrama simplificado del flujo de datos:

```
Navegador → (fetch /api/...) → Next.js rewrite → Express (Backend) → Mongoose → MongoDB
                                                                          ↓
Navegador ← JSON { ok, data, mensaje } ← Express ← ← ← ← ← ← ← ← ← ← ← ←
```

---

## 2. Tecnologías utilizadas

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor HTTP y definición de rutas REST |
| Mongoose | Modelado de esquemas y conexión a MongoDB |
| MongoDB | Base de datos NoSQL documental |
| cors | Habilita peticiones desde el frontend (otro puerto/origen) |
| dotenv | Carga variables de entorno (`MONGO_URI`) desde `.env` |
| nodemon | Recarga automática en desarrollo (`npm run dev`) |

### Frontend
| Tecnología | Uso |
|---|---|
| Next.js (App Router) | Framework de React, ruteo basado en carpetas |
| React | Librería de UI (componentes, estado) |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos utilitarios |
| shadcn/ui (sobre Base UI) | Componentes de interfaz reutilizables (botones, tabs, cards, tooltips…) |
| SWR | Fetching de datos con caché y revalidación automática |
| Recharts | Gráficas y visualizaciones |
| lucide-react | Iconografía |
| date-fns | Formateo de fechas |

---

## 3. Estructura del Frontend

```
frontend/
├── app/                         # Rutas (App Router de Next.js)
│   ├── page.tsx                    # Home ("/") → <WorldCupCarousel />
│   ├── layout.tsx                   # Layout raíz: fuentes, SiteChrome (Navbar+Footer), TooltipProvider
│   ├── mundiales/
│   │   ├── 2014/ 2018/ 2022/ 2026/     # Una carpeta física por torneo
│   │   │   ├── page.tsx                  # → <HomeMundial year={N} />
│   │   │   └── {selecciones,grupos,estadios,partidos,bracket,jugadores,mi-experiencia}/page.tsx
│   ├── grupos/ estadios/ jugadores/ selecciones/ bracket/ partidos/ mi-experiencia/
│   │                                # Alias de nivel superior → apuntan al mundial vigente (2026)
│   └── [matchId]/                   # Detalle de un partido
│
├── mundiales/                   # Componentes compartidos "por año" (reciben year: number como prop)
│   ├── HomeMundial.tsx  GruposMundial.tsx  PartidosMundial.tsx
│   ├── SeleccionesMundial.tsx  EstadiosMundial.tsx  JugadoresMundial.tsx
│   └── BracketMundial.tsx  MatchDetailMundial.tsx
│
├── components/                  # Componentes de UI reutilizables
│   ├── Navbar.tsx  SiteChrome.tsx  Footer.tsx  WorldCupCarousel.tsx  MundialCard.tsx
│   ├── Flag.tsx  PlayerPhoto.tsx  StadiumPhoto.tsx  StatCard.tsx
│   ├── mi-experiencia/              # Sección de personalización (álbum, once ideal, opiniones, logros)
│   └── ui/                         # Primitivas de shadcn (button, card, input, tabs, table…)
│
└── lib/                          # Utilidades y tipos compartidos
    ├── types.ts                    # Interfaces TS que reflejan los modelos de Mongoose
    ├── flags.ts                    # Mapeo código FIFA → bandera
    ├── groups.ts                   # Lógica para calcular tabla de posiciones
    ├── worldcups.ts                 # Datos estáticos de los 4 mundiales (nombre, colores, sede)
    └── utils.ts                    # Helper cn() de shadcn
```

**Idea clave:** cada pantalla (Grupos, Estadios, Partidos, etc.) tiene **una sola implementación** en `frontend/mundiales/*.tsx`, parametrizada por `year`. Las carpetas `app/mundiales/2014/…/page.tsx` son solo *wrappers* de una línea que importan ese componente y le pasan el año — así se evita repetir la lógica 4 veces (una por torneo).

---

## 4. Inicio del sistema y navegación entre pantallas

### Cómo arranca el sistema

1. **Backend** (desde `Backend/`):
   ```
   npm install
   npm run dev        # nodemon server.js → API en http://localhost:3000
   ```
   Requiere un archivo `.env` con `MONGO_URI` apuntando a la base de MongoDB.

2. **Frontend** (desde `frontend/`):
   ```
   npm install
   npm run dev         # next dev -p 3001 → sitio en http://localhost:3001
   ```
   El frontend reescribe `/api/*` hacia el backend en el puerto 3000 automáticamente.

3. El usuario entra a `http://localhost:3001/`, que carga el **layout raíz** (`app/layout.tsx`): fuentes, `SiteChrome` (que envuelve todo con `Navbar` arriba y `Footer` abajo) y el contenido de la página.

### Pantalla de inicio

La ruta `/` no muestra un dashboard de datos, sino un **carrusel 3D tipo "coverflow"** (`WorldCupCarousel.tsx`) con una tarjeta por cada mundial (2014, 2018, 2022, 2026), navegable con mouse, rueda del mouse, flechas del teclado o arrastre táctil. Desde ahí el usuario elige a qué mundial "entrar".

### Navegación entre pantallas

- Al hacer clic en una tarjeta del carrusel (o en un enlace por año), se navega a `/mundiales/<año>`, que renderiza `HomeMundial` — el inicio propio de ese torneo (resumen, color de identidad, estadísticas destacadas).
- La barra de navegación (`Navbar.tsx`) es **consciente del año activo**: detecta si la URL empieza con `/mundiales/<año>` y arma sus enlaces (Inicio, Selecciones, Grupos, Estadios, Partidos, Bracket, Jugadores) apuntando siempre a ese mismo año. Si el usuario está fuera de una ruta de mundial, la Navbar muestra los mismos enlaces pero apuntando a los alias de nivel superior (que representan siempre el mundial vigente, 2026).
- El botón **"Mi Experiencia"** en la Navbar es un enlace destacado (dorado) hacia la sección de personalización del usuario, también sensible al año activo.
- En móvil, la Navbar colapsa en un menú hamburguesa con las mismas opciones.
- Desde cualquier partido en el calendario o el bracket se puede entrar al **detalle de partido** (`/mundiales/<año>/<matchId>` o `/[matchId]`), que muestra marcador, goleadores y minuto a minuto.

En resumen, la navegación sigue siempre el mismo patrón: **Carrusel (elige mundial) → Home del mundial → secciones (Selecciones/Grupos/Estadios/Partidos/Bracket/Jugadores) → detalle de partido**, con "Mi Experiencia" como una rama paralela de personalización accesible en todo momento desde la Navbar.
