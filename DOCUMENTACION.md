# NoSql-Proyect — FIFA World Cup Portal

Documentación general del proyecto, dividida en dos partes: **técnica** (arquitectura, stack, modelos, API, estructura de carpetas) y **diseño/objetivo** (qué se construyó, para quién y por qué se tomaron ciertas decisiones).

> Proyecto final de la materia de Laboratorio de NoSQL. Repositorio con múltiples colaboradores trabajando en ramas por integrante (`Mar`, `Christian`, `Roberto`, `Alexis`, `Garay`, `Tadeo`), fusionadas hacia `main`.

---

## Parte 1 — Técnica

### 1.1 Arquitectura general

Monorepo con dos aplicaciones independientes que se comunican por HTTP:

```
NoSql-Proyect/
├── Backend/     → API REST (Node.js + Express 5 + Mongoose 9 sobre MongoDB)
└── frontend/    → Next.js 16 (App Router) + React 19 + Tailwind CSS 4
```

- El **backend** expone datos de 4 mundiales (2014, 2018, 2022, 2026) almacenados en las **mismas colecciones de MongoDB**, particionados por un campo `año` en cada documento (en vez de una colección por año).
- El **frontend** consume esa API vía `fetch`/SWR y renderiza dashboards, listados y visualizaciones por torneo.
- En desarrollo, el backend corre en el puerto **3000** y el frontend en el **3001**; `next.config.ts` reescribe `/api/*` hacia `http://localhost:3000/api/*`.
- En producción, el backend se despliega como función serverless en **Vercel** (`Backend/vercel.json` + `Backend/api/index.js`).

### 1.2 Backend

**Stack:** Express `^5.2.1`, Mongoose `^9.8.0`, `cors`, `dotenv`, `morgan` (dependencia declarada pero no usada), `nodemon` para desarrollo.

**Estructura:**

```
Backend/
├── index.js        # App Express "completa": monta las 5 rutas + estáticos
├── server.js        # Entry point local: require(./index.js) + app.listen(3000)
├── conexion.js       # Carga .env, fuerza DNS 8.8.8.8/1.1.1.1, mongoose.connect(MONGO_URI)
├── vercel.json       # Config de despliegue serverless
├── api/index.js       # Entry point de Vercel (app Express reducida, ver 1.5)
├── Modelos/          # Schemas de Mongoose
│   ├── equipo.js
│   ├── estadio.js
│   ├── grupo.js
│   ├── Partido.js
│   └── Jugador.js
├── rutas/            # Routers CRUD por recurso
│   ├── equipos.js / estadios.js / grupos.js / jugadores.js / partidos.js
├── BD/
│   └── seed.js         # Script de poblado por año: node BD/seed.js <año>
└── data/
    ├── 2014/ 2018/ 2022/ 2026/   # JSON fuente por torneo (equipos, estadios, jugadores, partidos)
```

**Conexión a la base de datos** (`conexion.js`): usa `dotenv` para leer `MONGO_URI` desde `Backend/.env`, fija servidores DNS públicos antes de conectar (mitigación típica de problemas de resolución SRV con MongoDB Atlas) y exporta directamente la instancia de `mongoose` (no una `Connection`); si `MONGO_URI` no está definida, no lanza excepción, solo advierte y sigue sin BD.

#### Modelos de datos (Mongoose)

Todos los modelos incluyen `{ timestamps: true }` y un campo `año: Number` (requerido e indexado) que actúa como **partición lógica multi-torneo dentro de la misma colección**.

**Equipo**

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | String, requerido | |
| `nombreNormalizado` | String | |
| `continente` | String | |
| `banderaIcono` | String | default `""` |
| `fifaCode` | String, requerido, uppercase | ej. `MEX`, `BRA` |
| `grupo` | String, requerido, uppercase, indexado | letra A–L |
| `confederacion` | String, uppercase | |
| `año` | Number, requerido, indexado | |

Índice compuesto: `{ fifaCode: 1, año: 1 }`.

**Estadio**: `nombre`, `ciudad` (requeridos), `capacidad`, `zonaHoraria`, `codigoPais` (lowercase), `pais`, `coordenadas`, `año` (indexado).

**Grupo**: `nombre` (letra, indexado), `torneo` (ej. "World Cup 2026"), `año` (indexado), `equiposNombres: String[]` (nombres crudos tal cual vienen del JSON fuente) y `equipos: ObjectId[]` con `ref: "Equipo"` para poblar. Índice compuesto `{ nombre: 1, año: 1 }`.

**Partido** (archivo `Partido.js`, único con mayúscula inicial):

| Campo | Tipo | Notas |
|---|---|---|
| `numeroPartido` | Number, requerido | |
| `ronda` | String, requerido | "Matchday 1", "Round of 16", "Final", etc. |
| `fecha` / `hora` | String | fecha almacenada como string, no `Date` |
| `equipo1` / `equipo2` | ObjectId `ref: Equipo`, requeridos | |
| `equipoGanador` | ObjectId `ref: Equipo`, default `null` | |
| `marcador` | `{ ft, ht, et, p: [Number] }` | tiempo completo / primer tiempo / extra / penales |
| `goles1` / `goles2` | `[{ nombre, minuto, penalti, autogol }]` | subdocumentos sin `_id` |
| `grupo` | ObjectId `ref: Grupo`, default `null` | `null` en fase eliminatoria |
| `estadio` | ObjectId `ref: Estadio`, default `null` | |
| `año` | Number, requerido, indexado | |

Índice compuesto `{ numeroPartido: 1, año: 1 }`.

**Jugador** (colección explícita `"jugadores"`): `nombre`, `numero` (dorsal), `posicion` (enum `GK/DF/MF/FW`, uppercase), `fechaNacimiento` (Date), `club: { nombre, pais }`, `fifaCodeEquipo` (denormalizado, indexado), `foto`, `equipo: ObjectId ref Equipo`, `año` (indexado).

**Relaciones:** `Partido` → `Equipo` (×3) + `Grupo` + `Estadio`; `Grupo` → `Equipo` (×N); `Jugador` → `Equipo`. Todas las relaciones cruzadas quedan implícitamente acotadas por coincidir en `año`.

#### API REST

Los 5 routers (`Backend/rutas/*.js`) siguen el mismo patrón CRUD completo y el mismo formato de respuesta:

```json
// éxito
{ "ok": true, "mensaje": "...", "data": [...], "total": 48 }
// error
{ "ok": false, "mensaje": "...", "error": "..." }
```

| Recurso | Endpoints | Filtros de query | Populate |
|---|---|---|---|
| Equipos | `GET/POST /api/equipos`, `GET/PUT/DELETE /api/equipos/:id` | `?año=YYYY` | — |
| Estadios | `GET/POST /api/estadios`, `GET/PUT/DELETE /api/estadios/:id` | `?año=YYYY` | — |
| Grupos | `GET/POST /api/grupos`, `GET/PUT/DELETE /api/grupos/:id` | `?año=YYYY` | `.populate("equipos")` |
| Jugadores | `GET/POST /api/jugadores`, `GET/PUT/DELETE /api/jugadores/:id` | `?año=YYYY`, `?equipo=<id>` | `.populate("equipo")` |
| Partidos | `GET/POST /api/partidos`, `GET/PUT/DELETE /api/partidos/:id` | `?año=YYYY` | `equipo1`, `equipo2`, `equipoGanador`, `grupo`, `estadio` |

`GET /api` devuelve un índice JSON de rutas disponibles; `GET /` sirve `Backend/public/index.html` como página estática de referencia.

No existe un endpoint ni modelo de "tabla de posiciones": las clasificaciones de grupo se calculan **en el frontend**, a partir de los partidos crudos.

#### Seed de datos (`Backend/BD/seed.js`)

Se ejecuta manualmente por torneo: `node BD/seed.js <año>` (ej. `node BD/seed.js 2026`). Por cada año:

1. Conecta a Mongo y corre `syncIndexes()` sobre los 5 modelos.
2. Borra **solo los documentos de ese año** (`deleteMany({ año })`), no la base completa.
3. Lee 4 JSON desde `Backend/data/<año>/`: `worldcup_estadios.json`, `worldcup_equipos.json`, `worldcup_jugador.json`, `worldcup.json` (partidos).
4. Inserta Estadios → Equipos → Jugadores (normalizando posición al enum `GK/DF/MF/FW` y vinculando por `fifaCodeEquipo`/nombre) → Grupos (**12 grupos si `año >= 2026`, si no 8**, letras A–L u A–H) → Partidos (resolviendo equipos/estadio/grupo por nombre o coincidencia difusa, y calculando `equipoGanador` desde `marcador.ft`, con fallback a `et` y luego a penales).

Esto confirma que **la escala de datos no es uniforme entre torneos**: 2026 tiene 48 equipos / 104 partidos / 12 grupos (formato ampliado), mientras que 2014, 2018 y 2022 usan el formato clásico de 32 equipos / 64 partidos / 8 grupos.

#### Despliegue

`Backend/vercel.json` define un despliegue clásico de Vercel: `Backend/api/index.js` como función serverless (`@vercel/node`) y `Backend/public/**` como estáticos, con `/api/(.*)` enrutado a la función y el resto a `/public`.

> **Nota de estado conocido:** `Backend/api/index.js` (el entry point real de producción) monta una app Express **reducida**, distinta de `Backend/index.js` usado en local — actualmente solo registra `/api/partidos` y `/api/jugadores`. Los endpoints de `equipos`, `estadios` y `grupos` funcionan en local (`npm run dev` / `npm start`) pero **no están expuestos en el despliegue de Vercel** tal como está escrito hoy. Es lo primero a corregir si se necesita paridad completa entre entornos.
>
> Además, los `README.md` dentro de `Backend/Modelos/` y `Backend/BD/` describen una versión anterior del esquema (nombres de campo distintos, modelos que ya no existen) — no son una fuente confiable, los `.js` reales son la referencia.

### 1.3 Frontend

**Stack:** Next.js `16.2.11` (App Router) + React `19.2.4`, TypeScript, Tailwind CSS `^4`, `shadcn` (sobre Base UI), `swr` para data fetching, `recharts` para gráficas, `lucide-react` para iconos, `date-fns`.

**Estructura relevante:**

```
frontend/
├── app/                     # Rutas (App Router)
│   ├── page.tsx               # Home → <WorldCupCarousel />
│   ├── layout.tsx              # Layout raíz (fuentes, SiteChrome, TooltipProvider)
│   ├── [matchId]/               # Detalle de partido (año=2026 fijo)
│   ├── bracket/ partidos/ mi-experiencia/    # Alias de nivel superior → año 2026 (reutilizan componentes compartidos)
│   ├── grupos/ estadios/ jugadores/ selecciones/   # Implementaciones propias, año=2026 fijo (ver nota abajo)
│   └── mundiales/
│       ├── 2014/ 2018/ 2022/ 2026/
│       │   ├── page.tsx                     # → HomeMundial year={N}
│       │   └── {bracket,estadios,grupos,jugadores,mi-experiencia,partidos,selecciones}/page.tsx
│       └── (cada archivo es un wrapper de 1-2 líneas sobre un componente en frontend/mundiales/)
├── mundiales/                # Componentes compartidos "por año" (year: number como prop)
│   ├── HomeMundial.tsx GruposMundial.tsx PartidosMundial.tsx SeleccionesMundial.tsx
│   ├── EstadiosMundial.tsx JugadoresMundial.tsx BracketMundial.tsx MatchDetailMundial.tsx
├── components/
│   ├── WorldCupCarousel.tsx MundialCard.tsx Navbar.tsx SiteChrome.tsx Footer.tsx
│   ├── Flag.tsx PlayerPhoto.tsx StadiumPhoto.tsx StatCard.tsx WCGeometry.tsx
│   ├── mi-experiencia/     # Feature de personalización (ver Parte 2)
│   │   ├── MiExperienciaPage.tsx MiAlbumPersonal.tsx MiExperienciaFIFA.tsx
│   │   ├── MiOnceIdeal.tsx MisLogros.tsx
│   └── ui/                # Primitivas shadcn (badge, button, card, input, table, tabs, tooltip...)
└── lib/
    ├── api.ts             # fetchApi() genérico (poco usado; la mayoría de componentes usan SWR + fetcher inline)
    ├── types.ts            # Interfaces TS espejo de los schemas de Mongoose
    ├── flags.ts            # Mapeo FIFA code → ISO-2 + getFlagUrl() (flagcdn.com)
    ├── groups.ts            # isMatchInGroup(): deduce pertenencia a grupo de un partido
    ├── stadium-images.ts     # Overrides de imágenes oficiales por estadio/año (ej. Rusia 2018)
    ├── worldcups.ts          # Datos estáticos agregados de los 4 mundiales (WORLDCUPS, PROJECT_INFO)
    └── utils.ts             # cn() de shadcn
```

**Ruteo — un esquema híbrido:** no existe una ruta dinámica `mundiales/[year]/`; en su lugar hay 4 carpetas estáticas (`2014`, `2018`, `2022`, `2026`), cada una con el mismo conjunto de 8 sub-rutas. Cada archivo es un wrapper trivial que importa el componente compartido correspondiente desde `frontend/mundiales/` y le pasa `year` como prop — por lo que no hay duplicación de lógica entre años, solo de boilerplate de ruteo. Además existen rutas de nivel superior (`/grupos`, `/estadios`, `/jugadores`, `/selecciones`, `/bracket`, `/partidos`, `/mi-experiencia`) que actúan como alias del torneo vigente (2026); de estas, `bracket`, `partidos` y `mi-experiencia` reutilizan los componentes compartidos, mientras que `grupos`, `estadios`, `jugadores` y `selecciones` son implementaciones propias y separadas — una inconsistencia a unificar a futuro.

`Navbar.tsx` detecta el año activo leyendo la URL (`/mundiales/(\d{4})`) y arma sus enlaces dinámicamente hacia las rutas prefijadas por año, o hacia los alias de nivel superior si no hay año en la URL.

**Data fetching:** patrón basado en `useSWR` con un `fetcher` inline por componente (`fetch(url).then(r => r.json()).then(j => j.data ?? j)`), llamando a `/api/partidos?año=X`, `/api/equipos?año=X`, `/api/estadios?año=X`, `/api/grupos?año=X` en paralelo. Las tablas de posiciones se calculan en el cliente a partir de los partidos crudos (no hay endpoint de standings).

**Sistema de diseño** (`app/globals.css`):
- Paleta en espacio de color **OKLCH**, con tema claro y oscuro completos (variables shadcn: `--background`, `--primary`, `--chart-1..5`, etc.) — aunque no hay actualmente un toggle visible de dark mode en la UI.
- Paleta oficial "WC2026": negro / dorado / blanco (`--wc-black`, `--wc-gold`, `--wc-gold-dark`, `--wc-gold-light`).
- Un color propio por torneo para tematizar cada mundial: `--wc-2014` (verde), `--wc-2018` (rojo), `--wc-2022` (púrpura), `--wc-2026` (azul) — usados tanto en `worldcups.ts` como en el mapa `YEAR_COLORS` de `HomeMundial.tsx`.
- Tipografías: Inter (texto general) y JetBrains Mono (monoespaciado).

### 1.4 Estado conocido / deuda técnica

- El despliegue serverless en Vercel (`Backend/api/index.js`) no expone `equipos`, `estadios` ni `grupos` — solo `partidos` y `jugadores`. Pendiente de alinear con `Backend/index.js`.
- Cuatro rutas de nivel superior del frontend (`grupos`, `estadios`, `jugadores`, `selecciones`) duplican lógica en vez de reusar los componentes de `frontend/mundiales/`.
- Los `README.md` de `Backend/Modelos/` y `Backend/BD/` describen una versión antigua del esquema/seed y no deben usarse como referencia.
- `morgan` está declarado como dependencia pero no se usa en el código.

---

## Parte 2 — Diseño y objetivo del proyecto

### 2.1 Qué es y para qué se hizo

**NoSql-Proyect** es un **portal informativo de los Mundiales de la FIFA**, construido como proyecto final de la materia de *Laboratorio de NoSQL*. El objetivo académico central es demostrar el modelado y consumo de datos en una base de datos documental (MongoDB) para un dominio con relaciones naturales (equipos, jugadores, partidos, estadios, grupos) y con **múltiples "instancias" del mismo dominio a lo largo del tiempo** (cuatro ediciones distintas del torneo: 2014, 2018, 2022, 2026).

En vez de modelar cada mundial como una base o colección separada, el proyecto usa un **único conjunto de colecciones compartido**, particionado por el campo `año` en cada documento. Esta es la decisión de modelado más importante del proyecto: permite reutilizar exactamente el mismo esquema, las mismas rutas de API y los mismos componentes de interfaz para los cuatro torneos, a costa de que cada consulta deba filtrar explícitamente por año.

### 2.2 Alcance funcional (qué puede hacer el usuario)

Por cada mundial (2014, 2018, 2022 y 2026) el portal ofrece:

- **Inicio del torneo** con resumen, colores propios y estadísticas destacadas.
- **Selecciones**: listado de equipos participantes con bandera, código FIFA y confederación.
- **Grupos**: tabla de posiciones calculada a partir de los resultados reales.
- **Estadios**: sedes del torneo con capacidad, ciudad e imagen oficial.
- **Calendario de partidos**: resultados y próximos encuentros.
- **Bracket de eliminatorias**: cuadro visual de octavos a la final.
- **Jugadores**: búsqueda y estadísticas por selección/posición.
- **Detalle de partido**: marcador, goleadores, minuto a minuto.

Adicionalmente, existe una sección **"Mi Experiencia"** (fuera del dominio puramente informativo de datos del mundial) que introduce un componente de personalización/gamificación para el usuario: un álbum personal, un "Once Ideal" armado por el usuario y un panel de logros — pensado para diferenciar el proyecto de un simple visor de datos y darle una capa de interacción propia.

### 2.3 Página principal: el carrusel

La landing (`/`) no es un dashboard de datos, sino un **carrusel visual tipo "coverflow"** (`WorldCupCarousel.tsx`) que presenta los 4 mundiales como tarjetas navegables en 3D (arrastre, rueda del mouse, flechas y teclado), con un panel central que actúa como portada del portal ("FIFA World Cup Portal"). Cada mundial tiene su propio color e imagen de logo oficial; la tarjeta del mundial vigente (2026) destaca al campeón. Esta pantalla es intencionalmente más "vitrina" que "tabla de datos": el resto del sitio (accesible al navegar a cada mundial) es donde vive la exploración detallada de datos.

### 2.4 Identidad visual

- Paleta oficial del **FIFA World Cup 2026**: negro, dorado y blanco, usada como base del sistema (navegación, tipografía, acentos) para anclar el proyecto a la edición actual del torneo.
- Cada mundial histórico recibe **un color de identidad propio** (verde 2014, rojo 2018, púrpura 2022, azul 2026) que se propaga consistentemente a través de tarjetas, gráficas y acentos de esa sección — de forma que el usuario siempre sabe "en qué mundial está" con solo mirar el color dominante de la pantalla.
- Tipografía Inter para lectura general y JetBrains Mono para elementos monoespaciados (marcadores, códigos), reforzando el carácter de "panel de datos deportivos".
- El sistema de diseño está construido sobre `shadcn/ui` + Tailwind 4 con variables en espacio **OKLCH**, lo que da consistencia perceptual de color entre temas y facilita mantener paletas por torneo sin recalcular manualmente contraste o saturación.

### 2.5 Por qué esta arquitectura

- **Backend desacoplado del frontend** (dos proyectos, dos puertos, comunicación por HTTP/JSON) para reflejar una arquitectura cliente-servidor real, no un monolito con renderizado server-side acoplado a la base de datos.
- **Un esquema, cuatro torneos**: en vez de crear cuatro bases o colecciones distintas, se reutiliza el mismo modelo con un discriminador (`año`), lo que evidencia una decisión NoSQL deliberada: los documentos comparten forma pero se particionan lógicamente, aprovechando índices compuestos (`{ campo: 1, año: 1 }`) en vez de normalizar en tablas separadas como se haría en SQL.
- **Relaciones vía referencias (`ObjectId` + `populate`)** en lugar de incrustar todo el documento — refleja el patrón "normalizado" de MongoDB para entidades que se consultan también de forma independiente (un equipo aparece en partidos, grupos y jugadores a la vez).
- **Cálculo de tablas de posiciones en el cliente**: deliberadamente no existe un modelo/endpoint de "standings"; se prioriza mantener el partido como única fuente de verdad y derivar la tabla en el frontend, evitando datos duplicados o desincronizados en la base.
- **Componentes de mundial parametrizados por año** (`frontend/mundiales/*.tsx` con prop `year`) en vez de cuatro copias de cada pantalla: refleja la intención de mantener una sola implementación de cada vista y reutilizarla para los cuatro torneos, aunque el ruteo aún se apoya en carpetas estáticas por año en vez de un segmento dinámico `[year]`.

### 2.6 Contexto de colaboración

El repositorio conserva ramas por integrante del equipo (`Mar`, `Christian`, `Roberto`, `Alexis`, `Garay`, `Tadeo`) fusionadas progresivamente hacia `main`, reflejando un desarrollo repartido por features/torneos (por ejemplo, la integración de datos de 2018 y 2022 aparece como trabajo independiente antes de fusionarse), típico de un proyecto de equipo académico con entregas incrementales.
