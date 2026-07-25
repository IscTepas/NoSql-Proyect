const express = require("express");
const cors = require("cors");
const path = require("path");
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


// 1. Ruta principal por defecto (GET /)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Prototito html api.html"));
});


// 2. Montar las rutas principales
app.use("/api/equipos", equiposRoutes);
app.use("/api/estadios", estadiosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/partidos", partidosRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log("Modelos y rutas cargados correctamente");
});