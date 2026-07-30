require("dotenv").config({ path: __dirname + "/.env", quiet: true });
const dns = require("node:dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  console.warn("No se pudieron establecer servidores DNS personalizados");
}

const mongoose = require("mongoose");
const URI = process.env.MONGO_URI;

// En serverless (Vercel) cada invocación fría re-ejecuta este módulo; cachear
// la promesa de conexión en `global` evita reconectar (DNS+TLS) en cada
// invocación caliente, que es lo que hacía sentir la API "trabada" al cargar.
if (!global._mongooseConnPromise) {
  global._mongooseConnPromise = URI
    ? mongoose.connect(URI)
        .then((conn) => {
          console.log("Conectado correctamente a la base de datos");
          return conn;
        })
        .catch((error) => {
          console.error("Error al conectarse a la base de datos", error);
          global._mongooseConnPromise = null;
          throw error;
        })
    : (console.warn("MONGO_URI no definida. La API funcionará sin conexión a BD."), null);
}

module.exports = mongoose;