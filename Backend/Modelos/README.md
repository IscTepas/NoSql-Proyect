# Modelos/

Define los esquemas de Mongoose que estructuran los datos en MongoDB.

## Archivos

### equipo.js

Modelo para los equipos participantes del Mundial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String | Nombre del país |
| `bandera` | String | Emoji de la bandera |
| `fifaCode` | String | Código FIFA (ej: MEX, BRA) |
| `iso2` | String | Código ISO del país |
| `grupo` | String | Letra del grupo (A-L) |

### estadio.js

Modelo para los estadios sede del Mundial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String | Nombre del estadio |
| `fifaName` | String | Nombre oficial FIFA |
| `ciudad` | String | Ciudad ubicación |
| `pais` | String | País anfitrión |
| `capacidad` | Number | Capacidad de asientos |
| `region` | String | Región geográfica |

### grupo.js

Modelo para los grupos del Mundial (A-L). Contiene un array de equipos con estadísticas básicas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String | Letra del grupo (A-L) |
| `equipos` | Array | Lista de equipos con sus estadísticas |

### juegos.js (Partido)

Modelo para los partidos del Mundial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `equipoLocal` | ObjectId | Referencia al equipo local |
| `equipoVisitante` | ObjectId | Referencia al equipo visitante |
| `marcadorLocal` | Number | Goles del equipo local |
| `marcadorVisitante` | Number | Goles del equipo visitante |
| `penalesLocal` | Number | Goles de penales local |
| `penalesVisitante` | Number | Goles de penales visitante |
| `equipoGanador` | ObjectId | Referencia al ganador |
| `grupo` | ObjectId | Referencia al grupo |
| `jornada` | Number | Número de jornada |
| `fecha` | Date | Fecha del partido |
| `estadio` | ObjectId | Referencia al estadio |
| `estado` | String | programado/en_curso/finalizado/suspendido |
| `fase` | String | grupos/dieciseisavos/octavos/cuartos/semifinal/final |
| `etiquetaLocal` | String | Etiqueta para eliminatorias (ej: "1A") |
| `etiquetaVisitante` | String | Etiqueta para eliminatorias (ej: "2B") |

### tabla.js (TablaPosiciones)

Modelo para las tablas de posiciones por grupo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `grupo` | ObjectId | Referencia al grupo |
| `equipos` | Array | Lista de equipos con estadísticas completas |

Cada equipo en la tabla tiene:
- `partidosJugados`, `victorias`, `derrotas`, `empates`
- `puntos`, `golesFavor`, `golesContra`, `diferenciaGoles`

## Conexión

Todos los modelos importan la conexión desde `conexion.js`:
```js
const mongoose = require("../conexion");
```
