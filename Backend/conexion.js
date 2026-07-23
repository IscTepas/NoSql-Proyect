const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const URI = "mongodb+srv://rolopezag_db_user:abc123ABC@cluster0.r79byhz.mongodb.net/?appName=Cluster0";

mongoose.connect(URI)
  .then(() => {
    console.log("Conectado correctamente a la base de datos");
  })
  .catch((error) => {
    console.error("Error al conectarse a la base de datos", error);
  });

module.exports = mongoose;