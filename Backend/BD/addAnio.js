const fs = require("fs");
const path = require("path");

const anio = process.argv[2];
if (!anio || isNaN(anio)) {
  console.error("Uso: node addAnio.js <año>  (ej: node addAnio.js 2026)");
  process.exit(1);
}
const ANIO = Number(anio);
const dataDir = path.join(__dirname, "..", "data", String(ANIO));

if (!fs.existsSync(dataDir)) {
  console.error(`Carpeta no encontrada: ${dataDir}`);
  process.exit(1);
}

// Archivos donde "año" va DENTRO de un array anidado
const nested = {
  "worldcup.json": "partidos",
  "worldcup_estadios.json": "estadios",
  "worldcup_grupos.json": "grupos"
};

// Archivos donde el array raíz ES la lista de datos
const flat = ["worldcup_equipos.json", "worldcup_jugador.json"];

let archivosModificados = 0;

// Procesar archivos planos (array raíz)
for (const archivo of flat) {
  const ruta = path.join(dataDir, archivo);
  if (!fs.existsSync(ruta)) { console.log(`Omitido: ${archivo} (no existe)`); continue; }

  const datos = JSON.parse(fs.readFileSync(ruta, "utf-8"));
  if (!Array.isArray(datos)) { console.log(`Omitido: ${archivo} (no es array)`); continue; }

  let agregados = 0;
  for (const obj of datos) {
    if (!("año" in obj)) { obj.año = ANIO; agregados++; }
  }

  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2) + "\n", "utf-8");
  console.log(`${archivo}: +${agregados} objetos con "año": ${ANIO}`);
  archivosModificados++;
}

// Procesar archivos anidados (objeto con array interno)
for (const [archivo, key] of Object.entries(nested)) {
  const ruta = path.join(dataDir, archivo);
  if (!fs.existsSync(ruta)) { console.log(`Omitido: ${archivo} (no existe)`); continue; }

  const datos = JSON.parse(fs.readFileSync(ruta, "utf-8"));
  const lista = datos[key];
  if (!Array.isArray(lista)) { console.log(`Omitido: ${archivo} (clave "${key}" no es array)`); continue; }

  let agregados = 0;
  for (const obj of lista) {
    if (!("año" in obj)) { obj.año = ANIO; agregados++; }
  }

  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2) + "\n", "utf-8");
  console.log(`${archivo}: +${agregados} objetos con "año": ${ANIO}`);
  archivosModificados++;
}

console.log(`\nListo: ${archivosModificados} archivos modificados.`);
