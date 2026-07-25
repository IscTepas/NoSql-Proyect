const express = require("express");
require("./conexion");



const equiposRoutes = require("./rutas/equipos");
const estadiosRoutes = require("./rutas/estadios");
const gruposRoutes = require("./rutas/grupos");
const partidosRoutes = require("./rutas/partidos");




const app = express();





app.use(express.json());




app.get("/", (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: "Servidor funcionando correctamente",
        endpoints: {
            equipos: "/api/equipos",
            estadios: "/api/estadios",
            grupos: "/api/grupos",
            partidos: "/api/partidos"
        }
    });
});




app.use("/api/equipos", equiposRoutes);

app.use("/api/estadios", estadiosRoutes);

app.use("/api/grupos", gruposRoutes);

app.use("/api/partidos", partidosRoutes);




const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log("Modelos y rutas cargados correctamente");
});