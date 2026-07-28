const app = require("./index.js");

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log("Modelos y rutas cargados correctamente");
});
