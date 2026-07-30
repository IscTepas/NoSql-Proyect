const express = require("express");
const router = express.Router();

const Partido = require("../Modelos/Partido");

// GET - consultar todos los partidos (filtro opcional ?año=YYYY)
router.get("/", async (req, res) => {
    try {
        const filtro = req.query.año ? { año: Number(req.query.año) } : {};
        let query = Partido.find(filtro)
            .populate("equipo1")
            .populate("equipo2")
            .populate("equipoGanador")
            .populate("grupo")
            .populate("estadio")
            .lean();
        if (req.query.skip) query = query.skip(Number(req.query.skip));
        if (req.query.limit) query = query.limit(Number(req.query.limit));
        const partidos = await query;

        res.json({
            ok: true,
            data: partidos,
            total: partidos.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los partidos",
            error: error.message
        });
    }
});

// GET - consultar partido por ID
router.get("/:id", async (req, res) => {
    try {
        const partido = await Partido.findById(req.params.id)
            .populate("equipo1")
            .populate("equipo2")
            .populate("equipoGanador")
            .populate("grupo")
            .populate("estadio")
            .lean();

        if (!partido) {
            return res.status(404).json({
                ok: false,
                mensaje: "Partido no encontrado"
            });
        }

        res.json({
            ok: true,
            data: partido
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el partido",
            error: error.message
        });
    }
});

// POST - Crear partido
router.post("/", async (req, res) => {
    try {
        const nuevoPartido = new Partido(req.body);
        const partidoGuardado = await nuevoPartido.save();

        const partidoCompleto = await Partido.findById(partidoGuardado._id)
            .populate("equipo1")
            .populate("equipo2")
            .populate("equipoGanador")
            .populate("grupo")
            .populate("estadio");

        res.status(201).json({
            ok: true,
            mensaje: "Partido creado correctamente",
            data: partidoCompleto
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear el partido",
            error: error.message
        });
    }
});

// PUT - Actualizar partido
router.put("/:id", async (req, res) => {
    try {
        const partidoActualizado = await Partido.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate("equipo1")
            .populate("equipo2")
            .populate("equipoGanador")
            .populate("grupo")
            .populate("estadio");

        if (!partidoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Partido no encontrado"
            });
        }

        res.json({
            ok: true,
            mensaje: "Partido actualizado correctamente",
            data: partidoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar el partido",
            error: error.message
        });
    }
});

// DELETE - Eliminar partido
router.delete("/:id", async (req, res) => {
    try {
        const partidoEliminado = await Partido.findByIdAndDelete(req.params.id);

        if (!partidoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Partido no encontrado"
            });
        }

        res.json({
            ok: true,
            mensaje: "Partido eliminado correctamente",
            data: partidoEliminado
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el partido",
            error: error.message
        });
    }
});

module.exports = router;