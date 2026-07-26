const express = require("express");
const cors = require("cors");
require("./conexion");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar los archivos de rutas
const equiposRoutes = require("./rutas/equipos");
const estadiosRoutes = require("./rutas/estadios");
const gruposRoutes = require("./rutas/grupos");
const partidosRoutes = require("./rutas/partidos");

// Montar las rutas bajo /api
app.use("/api/equipos", equiposRoutes);
app.use("/api/estadios", estadiosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/partidos", partidosRoutes);

// Ruta de prueba
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        mensaje: "API del Mundial 2026",
        rutas: ["/api/equipos", "/api/estadios", "/api/grupos", "/api/partidos"]
    });
});

// Exportar para Vercel (serverless)
module.exports = app;