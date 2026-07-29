require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const anio = process.argv[2];
if (!anio || isNaN(anio)) {
  console.error("❌ Uso: node seed.js <año>  (ej: node seed.js 2026)");
  process.exit(1);
}
const ANIO = Number(anio);

// 1. Modelos
const Estadio = require("../Modelos/Estadio");
const Equipo = require("../Modelos/Equipo");
const Jugador = require("../Modelos/Jugador");
const Grupo = require("../Modelos/Grupo");
const Partido = require("../Modelos/Partido");

// 2. Archivos JSON (desde carpeta del año)
const teamsData = require(`../data/${ANIO}/worldcup_equipos.json`);
const squadsData = require(`../data/${ANIO}/worldcup_jugador.json`);
const stadiumsData = require(`../data/${ANIO}/worldcup_estadios.json`);
const matchesData = require(`../data/${ANIO}/worldcup.json`);

const URI = process.env.MONGO_URI;

const poblarBaseDeDatos = async () => {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(URI);
    console.log("Conectado con éxito.");

    // Limpiar colecciones del año anterior
    console.log(`Limpiando colecciones del año ${ANIO}...`);

    // Sincronizar índices: elimina los viejos unique y crea los nuevos compuestos
    await Promise.all([
      Estadio.syncIndexes(),
      Equipo.syncIndexes(),
      Jugador.syncIndexes(),
      Grupo.syncIndexes(),
      Partido.syncIndexes()
    ]);
    console.log("Índices sincronizados.");

    await Promise.all([
      Estadio.deleteMany({ año: ANIO }),
      Equipo.deleteMany({ año: ANIO }),
      Jugador.deleteMany({ año: ANIO }),
      Grupo.deleteMany({ año: ANIO }),
      Partido.deleteMany({ año: ANIO })
    ]);

    // 1. Insertar Estadios
    console.log("Insertando Estadios desde JSON...");
    const estadiosRaw = Array.isArray(stadiumsData)
      ? stadiumsData
      : (stadiumsData.stadiums || stadiumsData.estadios || []);

    const PAIS_NOMBRES = {
      mx: "México",
      us: "Estados Unidos",
      ca: "Canadá",
      br: "Brasil",
      ru: "Rusia",
      qa: "Catar",
    };

    const estadiosFormateados = estadiosRaw.map(stadium => {
      const codigoPais = (stadium.codigoPais || stadium.cc || "us").toLowerCase().trim();
      return {
        nombre: stadium.name || stadium.nombre || "Estadio Sede",
        ciudad: stadium.city || stadium.ciudad || "Sede",
        pais: stadium.pais || PAIS_NOMBRES[codigoPais] || "Desconocido",
        capacidad: stadium.capacidad || stadium.capacity || 50000,
        año: ANIO,
        codigoPais,
        zonaHoraria: stadium.zonaHoraria || "",
        coordenadas: stadium.coordenadas || ""
      };
    });

    const estadiosDB = await Estadio.insertMany(estadiosFormateados);
    console.log(`✅ ${estadiosDB.length} estadios creados.`);

    // 2. Insertar Equipos
    console.log("Insertando Equipos desde JSON...");
    const equiposRaw = Array.isArray(teamsData) ? teamsData : (teamsData.teams || teamsData.equipos || []);

    const equiposFormateados = equiposRaw.map(team => ({
      nombre: team.nombre || team.name,
      nombreNormalizado: team.nombreNormalizado || "",
      continente: team.continente || "",
      banderaIcono: team.banderaIcono || team.flag_icon || "",
      fifaCode: team.fifaCode || team.fifa_code,
      grupo: team.grupo || team.group,
      confederacion: team.confederacion || "",
      año: ANIO
    }));

    const equiposDB = await Equipo.insertMany(equiposFormateados);
    console.log(`✅ ${equiposDB.length} equipos creados.`);

// 3. Insertar Jugadores cumpliendo las validaciones del Schema
    console.log("Insertando Jugadores...");
    
    const jugadoresRaw = Array.isArray(squadsData) 
      ? squadsData 
      : (squadsData.jugadores || squadsData.players || []);

    // Función auxiliar para mapear cualquier formato de posición al ENUM ["GK", "DF", "MF", "FW"]
    const normalizarPosicion = (pos) => {
      if (!pos) return "DF";
      const p = pos.toString().toUpperCase().trim();
      if (["GK", "POR", "GOALKEEPER", "PORTERO", "ARQUERO"].includes(p)) return "GK";
      if (["DF", "DEF", "DEFENDER", "DEFENSA"].includes(p)) return "DF";
      if (["MF", "MED", "MIDFIELDER", "MEDIOCAMPISTA", "VOLANTE"].includes(p)) return "MF";
      if (["FW", "DEL", "FORWARD", "DELANTERO", "ATACANTE"].includes(p)) return "FW";
      return "DF"; // Valor por defecto válido
    };

    const listaJugadores = [];

    jugadoresRaw.forEach(p => {
      // Buscar equipo por fifaCode o por nombre
      const code = (p.fifaCodeEquipo || p.fifaCode || "").toString().trim().toUpperCase();
      const equipoCorrespondiente = equiposDB.find(
        e => e.fifaCode.toUpperCase() === code || e.nombre.toLowerCase() === (p.equipo || "").toLowerCase()
      );

      listaJugadores.push({
        nombre: p.nombre || p.name || "Jugador Sin Nombre",
        numero: Number(p.numero || p.number || p.shirtNumber || 0),
        posicion: normalizarPosicion(p.posicion || p.pos || p.position),
        fechaNacimiento: p.fechaNacimiento || p.date_of_birth ? new Date(p.fechaNacimiento || p.date_of_birth) : null,
        club: {
          nombre: p.club ? (p.club.nombre || p.club.name || p.club) : "",
          pais: p.club ? (p.club.pais || p.club.country || "") : ""
        },
        fifaCodeEquipo: code || (equipoCorrespondiente ? equipoCorrespondiente.fifaCode : "XXX"),
        foto: p.foto || p.imagen || "",
        equipo: equipoCorrespondiente ? equipoCorrespondiente._id : null,
        año: ANIO
      });
    });

    const jugadoresDB = await Jugador.insertMany(listaJugadores);
    console.log(`✅ ${jugadoresDB.length} jugadores creados con éxito.`);

    // 4. Crear Grupos
    console.log("Creando Grupos...");
    const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const gruposDB = [];

    for (const letra of letrasGrupos) {
      const equiposDelGrupo = equiposDB.filter(e => e.grupo === letra);
      const equiposIDs = equiposDelGrupo.map(e => e._id);

      const nuevoGrupo = await Grupo.create({
        nombre: letra,
        torneo: `World Cup ${ANIO}`,
        equipos: equiposIDs,
        año: ANIO
      });
      gruposDB.push(nuevoGrupo);
    }
    console.log(`✅ ${gruposDB.length} grupos creados.`);

// 5. Insertar Partidos desde worldcup.json
    console.log("Insertando Partidos desde JSON...");
    const partidosRaw = Array.isArray(matchesData) 
      ? matchesData 
      : (matchesData.partidos || []);

    const partidosFormateados = partidosRaw.map(p => {
      // Buscar ObjectId para Equipo 1 (por nombre o fifaCode)
      const eq1 = equiposDB.find(e => 
        e.nombre.toLowerCase() === (p.equipo1 || "").toLowerCase() || 
        e.fifaCode === p.equipo1
      );

      // Buscar ObjectId para Equipo 2 (por nombre o fifaCode)
      const eq2 = equiposDB.find(e => 
        e.nombre.toLowerCase() === (p.equipo2 || "").toLowerCase() || 
        e.fifaCode === p.equipo2
      );

      // Buscar ObjectId para Estadio
      const estadioDB = estadiosDB.find(est => 
        (p.estadio || "").toLowerCase().includes(est.ciudad.toLowerCase()) ||
        est.nombre.toLowerCase().includes((p.estadio || "").toLowerCase())
      );

      // Buscar ObjectId para Grupo (Ej. "Group A" -> "A")
      const letraGrupo = p.grupo ? p.grupo.replace(/[^A-L]/g, "") : null;
      const grupoDB = letraGrupo ? gruposDB.find(g => g.nombre === letraGrupo) : null;

      // LÓGICA DE GANADOR: Revisa FT, ET y Penaltis
      let ganadorId = null;
      if (eq1 && eq2 && p.marcador) {
        let g1 = p.marcador.ft ? p.marcador.ft[0] : 0;
        let g2 = p.marcador.ft ? p.marcador.ft[1] : 0;

        // Si hubo tiempo extra y no hubo penaltis, usar marcador de ET
        if (p.marcador.et && p.marcador.et.length === 2) {
          g1 = p.marcador.et[0];
          g2 = p.marcador.et[1];
        }

        // Si hubo definición por penaltis
        if (p.marcador.p && p.marcador.p.length === 2) {
          g1 = p.marcador.p[0];
          g2 = p.marcador.p[1];
        }

        if (g1 > g2) {
          ganadorId = eq1._id;
        } else if (g2 > g1) {
          ganadorId = eq2._id;
        }
      }

      return {
        numeroPartido: p.numeroPartido,
        ronda: p.ronda,
        fecha: p.fecha,
        hora: p.hora,
        equipo1: eq1 ? eq1._id : null,
        equipo2: eq2 ? eq2._id : null,
        equipoGanador: ganadorId,
        marcador: p.marcador || { ft: [], ht: [], et: [], p: [] },
        goles1: p.goles1 || [],
        goles2: p.goles2 || [],
        grupo: grupoDB ? grupoDB._id : null,
        estadio: estadioDB ? estadioDB._id : null,
        año: ANIO
      };
    });

    const partidosDB = await Partido.insertMany(partidosFormateados);
    console.log(`✅ ${partidosDB.length} partidos guardados con éxito.`);

    console.log("\n🚀 ¡BASE DE DATOS POBLADA AL 100% CON LA INFORMACIÓN COMPLETA!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar:", error);
    process.exit(1);
  }
};

poblarBaseDeDatos();