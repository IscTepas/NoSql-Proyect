const express = require("express");
const app = express();

app.use(express.json());

require("../conexion");

// Importar rutas
const partidosRoutes = require("../rutas/partidos");
const jugadoresRoutes = require("../rutas/jugadores");

// Montar endpoints
app.use("/api/partidos", partidosRoutes);
app.use("/api/jugadores", jugadoresRoutes);

module.exports = app;
