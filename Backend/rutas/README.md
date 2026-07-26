# rutas/

Define las rutas HTTP (endpoints) de la API REST. Cada archivo maneja las operaciones CRUD de un recurso.

## Archivos

### equipos.js

Rutas para gestionar equipos participantes.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/equipos` | Obtener todos los equipos |
| GET | `/equipos/:id` | Obtener un equipo por ID |
| POST | `/equipos` | Crear un equipo nuevo |
| PUT | `/equipos/:id` | Actualizar un equipo |
| DELETE | `/equipos/:id` | Eliminar un equipo |

### estadios.js

Rutas para gestionar estadios sede.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/estadios` | Obtener todos los estadios |
| GET | `/estadios/:id` | Obtener un estadio por ID |
| POST | `/estadios` | Crear un estadio nuevo |
| PUT | `/estadios/:id` | Actualizar un estadio |
| DELETE | `/estadios/:id` | Eliminar un estadio |

### grupos.js

Rutas para gestionar grupos del Mundial. Usa `.populate()` para incluir datos completos de los equipos.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/grupos` | Obtener todos los grupos |
| GET | `/grupos/:id` | Obtener un grupo por ID |
| POST | `/grupos` | Crear un grupo nuevo |
| PUT | `/grupos/:id` | Actualizar un grupo |
| DELETE | `/grupos/:id` | Eliminar un grupo |

### partidos.js

Rutas para gestionar partidos del Mundial. Usa `.populate()` para incluir datos de equipos, grupo y estadio.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/partidos` | Obtener todos los partidos |
| GET | `/partidos/:id` | Obtener un partido por ID |
| POST | `/partidos` | Crear un partido nuevo |
| PUT | `/partidos/:id` | Actualizar un partido |
| DELETE | `/partidos/:id` | Eliminar un partido |

## Formato de respuesta

Todas las rutas devuelven JSON con esta estructura:

```json
{
  "ok": true,
  "mensaje": "Descripción de la operación",
  "data": {},
  "total": 0
}
```

En caso de error:

```json
{
  "ok": false,
  "mensaje": "Descripción del error",
  "error": "Detalle del error"
}
```
