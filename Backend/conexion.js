require("dotenv").config({ path: __dirname + "/.env", quiet: true });
const dns = require("node:dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  console.warn("No se pudieron establecer servidores DNS personalizados");
}

const mongoose = require("mongoose");
const URI = process.env.MONGO_URI;

if (URI) {
  mongoose.connect(URI)
    .then(() => console.log("Conectado correctamente a la base de datos"))
    .catch((error) => console.error("Error al conectarse a la base de datos", error));
} else {
  console.warn("MONGO_URI no definida. La API funcionará sin conexión a BD.");
}

module.exports = mongoose;