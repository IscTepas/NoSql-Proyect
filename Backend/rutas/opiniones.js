const express = require("express");
const router = express.Router();

const Opinion = require("../Modelos/Opinion");

router.get("/", async (req, res) => {
    try {
        const filtro = req.query.año ? { año: Number(req.query.año) } : {};
        const opiniones = await Opinion.find(filtro).sort({ fecha: -1 });
        res.json({
            ok: true,
            data: opiniones,
            total: opiniones.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener las opiniones",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const opinion = await Opinion.findById(req.params.id);
        if (!opinion) {
            return res.status(404).json({
                ok: false,
                mensaje: "Opinión no encontrada"
            });
        }
        res.json({
            ok: true,
            data: opinion
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener la opinión",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { titulo, texto, rating, fecha, año } = req.body;
        if (!titulo || !texto || !rating || !año) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan campos requeridos: titulo, texto, rating, año"
            });
        }
        const nuevaOpinion = new Opinion({
            titulo,
            texto,
            rating,
            fecha: fecha || new Date().toISOString().split("T")[0],
            año
        });
        const opinionGuardada = await nuevaOpinion.save();
        res.status(201).json({
            ok: true,
            mensaje: "Opinión creada correctamente",
            data: opinionGuardada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear la opinión",
            error: error.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const opinionActualizada = await Opinion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!opinionActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: "Opinión no encontrada"
            });
        }
        res.json({
            ok: true,
            mensaje: "Opinión actualizada correctamente",
            data: opinionActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar la opinión",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const opinionEliminada = await Opinion.findByIdAndDelete(req.params.id);
        if (!opinionEliminada) {
            return res.status(404).json({
                ok: false,
                mensaje: "Opinión no encontrada"
            });
        }
        res.json({
            ok: true,
            mensaje: "Opinión eliminada correctamente",
            data: opinionEliminada
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar la opinión",
            error: error.message
        });
    }
});

module.exports = router;
