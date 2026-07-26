# public/

Contiene archivos estáticos servidos directamente por Vercel.

## Archivos

### index.html

Página de documentación de la API del Mundial 2026. Se muestra cuando alguien visita la raíz del sitio (`/`).

Incluye:
- Descripción de la API
- Lista de endpoints disponibles
- Ejemplos de uso
- Formato de las respuestas

## ¿Cómo funciona en Vercel?

Vercel sirve automáticamente los archivos de `public/` en la raíz del dominio:

| URL | Qué muestra |
|-----|-------------|
| `/` | `public/index.html` |
| `/equipos` | API (manejada por Express) |
| `/estadios` | API (manejada por Express) |

Los archivos estáticos tienen prioridad baja, las rutas de la API se procesan primero.
