# api/index.js

Este archivo sirve como **adaptador serverless** para desplegar la API en Vercel.

## ¿Por qué existe?

Vercel no ejecuta servidores Node tradicionales (no usa `app.listen()`). En su lugar, usa **funciones serverless**: archivos independientes que se ejecutan bajo demanda cuando alguien hace una petición HTTP.

Vercel busca automáticamente los archivos dentro de la carpeta `api/` y los convierte en endpoints.

## ¿Qué hace?

```js
const app = require("../index.js");  // Importa la app Express
module.exports = app;                 // La exporta para Vercel
```

Solo importa y re-exporta tu app Express. No contiene lógica propia.

## Flujo de una petición

```
Usuario visita /equipos
    ↓
Vercel recibe la petición HTTP
    ↓
Vercel ejecuta api/index.js
    ↓
api/index.js importa la app Express (index.js)
    ↓
Express procesa la ruta /equipos
    ↓
Se devuelve la respuesta JSON
```

## ¿Por qué no funciona `app.listen()` en Vercel?

- **Localmente**: `app.listen(3000)` mantiene un servidor corriendo 24/7
- **Vercel**: No hay servidor persistente. Cada petición ejecuta una función independiente que muere después de responder

Por eso `index.js` exporta `module.exports = app` y `server.js` maneja `app.listen()` solo para desarrollo local.

## Archivos relacionados

| Archivo | Propósito |
|---------|-----------|
| `index.js` | Configuración de Express y rutas (exporta `app`) |
| `server.js` | Punto de entrada para desarrollo local (`app.listen()`) |
| `vercel.json` | Configuración de Vercel (rewrites y builds) |
