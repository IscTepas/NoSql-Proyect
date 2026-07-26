# BD/

Carpeta que contiene el script de semilla (seed) para poblar la base de datos.

## Archivos

### seed.js

Script que se ejecuta con `node BD/seed.js` para llenar MongoDB con datos iniciales del Mundial 2026.

## ¿Qué hace?

1. **Limpia** las 5 colecciones existentes (borra todo)
2. **Inserta** datos de prueba:
   - 16 estadios sede
   - 48 equipos clasificados (grupos A-L)
   - 12 grupos con tablas de posiciones
   - 72 partidos de fase de grupos
   - 9 partidos de fase eliminatoria

## ¿Cuándo ejecutarlo?

- Al configurar el proyecto por primera vez
- Cuando necesites resetear la base de datos
- Cuando quieras volver a tener datos de prueba

## Advertencia

Cada ejecución **borra todos los datos** antes de insertar los nuevos. No ejecutes este script si tienes datos importantes que quieras conservar.

## Requisitos

- Archivo `.env` con `MONGO_URI` configurado
- MongoDB Atlas accesible
