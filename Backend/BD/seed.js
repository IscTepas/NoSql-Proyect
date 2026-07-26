require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

// 1. Modelos
const Estadio = require("../Modelos/Estadio");
const Equipo = require("../Modelos/Equipo");
const Jugador = require("../Modelos/Jugador");
const Grupo = require("../Modelos/Grupo");
const Partido = require("../Modelos/Partido");

// 2. Archivos JSON
const teamsData = require("../data/worldcup_equipos.json");
const squadsData = require("../data/worldcup_jugador.json");
const stadiumsData = require("../data/worldcup_estadios.json");

const URI = process.env.MONGO_URI;
const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const poblarBaseDeDatos = async () => {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(URI);
    console.log("Conectado con éxito.");

    // Limpiar colecciones
    console.log("Limpiando colecciones...");
    await Promise.all([
      Estadio.deleteMany({}),
      Equipo.deleteMany({}),
      Jugador.deleteMany({}),
      Grupo.deleteMany({}),
      Partido.deleteMany({})
    ]);

    // 1. Insertar Estadios
    console.log("Insertando Estadios desde JSON...");
    const estadiosRaw = Array.isArray(stadiumsData) 
      ? stadiumsData 
      : (stadiumsData.stadiums || stadiumsData.estadios || []);

    const estadiosFormateados = estadiosRaw.map(stadium => ({
      nombre: stadium.name || stadium.nombre || "Estadio Sede",
      ciudad: stadium.city || stadium.ciudad || "Sede",
      pais: (stadium.cc === "mx" || stadium.pais === "México") ? "México" : (stadium.cc === "ca" || stadium.pais === "Canadá") ? "Canadá" : "Estados Unidos",
      capacidad: stadium.capacity || stadium.capacidad || 50000
    }));

    const estadiosDB = await Estadio.insertMany(estadiosFormateados);
    console.log(`✅ ${estadiosDB.length} estadios creados.`);

    // 2. Insertar Equipos
    console.log("Insertando Equipos desde JSON...");
    const equiposRaw = Array.isArray(teamsData) ? teamsData : (teamsData.teams || teamsData.equipos || []);

    const equiposFormateados = equiposRaw.map(team => ({
      nombre: team.name || team.nombre,
      bandera: team.flag_icon || team.bandera || "",
      fifaCode: team.fifa_code || team.fifaCode,
      iso2: team.iso2 || (team.fifa_code ? team.fifa_code.substring(0, 2) : "XX"),
      grupo: team.group || team.grupo
    }));

    const equiposDB = await Equipo.insertMany(equiposFormateados);
    console.log(`✅ ${equiposDB.length} equipos creados.`);

// 3. Insertar Jugadores desde JSON plano
    console.log("Insertando Jugadores...");
    const listaJugadores = [];
    const jugadoresRaw = Array.isArray(squadsData) ? squadsData : [];

    // Mapear cada jugador y asignarle el _id de su equipo en la base de datos
    jugadoresRaw.forEach(p => {
      // Buscar el _id de MongoDB del equipo correspondiente según el fifaCode
      const equipoCorrespondiente = equiposDB.find(
        e => e.fifaCode === p.fifaCodeEquipo
      );

      listaJugadores.push({
        nombre: p.nombre || p.name || "Jugador Sin Nombre",
        numero: p.numero || p.number || 0,
        posicion: p.posicion || p.pos || "DF",
        fechaNacimiento: p.fechaNacimiento || p.date_of_birth || "2000-01-01",
        club: {
          nombre: p.club ? (p.club.nombre || p.club.name || "") : "",
          pais: p.club ? (p.club.pais || p.club.country || "") : ""
        },
        fifaCodeEquipo: p.fifaCodeEquipo,
        equipo: equipoCorrespondiente ? equipoCorrespondiente._id : null
      });
    });

    const jugadoresDB = await Jugador.insertMany(listaJugadores);
    console.log(`✅ ${jugadoresDB.length} jugadores creados.`);

    // 4. Crear Grupos y Partidos de Fase de Grupos
    console.log("Creando Grupos y Partidos de Fase de Grupos...");
    const partidosFaseGrupos = [];

    for (const letra of letrasGrupos) {
      const equiposDelGrupo = equiposDB.filter(e => e.grupo === letra);
      const equiposIDs = equiposDelGrupo.map(e => e._id);

      const nuevoGrupo = await Grupo.create({
        nombre: letra,
        equipos: equiposIDs
      });

      const combinaciones = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
      combinaciones.forEach((comb, idx) => {
        if (equiposDelGrupo[comb[0]] && equiposDelGrupo[comb[1]]) {
          const estadioAzar = estadiosDB.length > 0 
            ? estadiosDB[Math.floor(Math.random() * estadiosDB.length)]._id 
            : null;

          partidosFaseGrupos.push({
            fecha: new Date(2026, 5, 11 + idx * 3),
            estadio: estadioAzar,
            equipo1: equiposDelGrupo[comb[0]]._id,
            equipo2: equiposDelGrupo[comb[1]]._id,
            equipoLocal: equiposDelGrupo[comb[0]]._id,
            equipoVisitante: equiposDelGrupo[comb[1]]._id,
            ronda: "Fase de Grupos",
            fase: "grupos",
            jornada: Math.floor(idx / 2) + 1,
            grupo: nuevoGrupo._id,
            estado: "programado"
          });
        }
      });
    }

    await Partido.insertMany(partidosFaseGrupos);

    // 5. Partidos de Eliminatoria Directa
    console.log("Insertando Partidos Eliminatorios...");
    const estadioSede = estadiosDB.length > 0 ? estadiosDB[0]._id : null;
    const equipoAuxiliar = equiposDB.length > 0 ? equiposDB[0]._id : null;

    const partidosEliminatoria = [
      { ronda: "Dieciseisavos", fase: "dieciseisavos", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "1A", etiquetaVisitante: "2B", estadio: estadioSede, fecha: new Date(2026, 5, 28) },
      { ronda: "Dieciseisavos", fase: "dieciseisavos", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "1C", etiquetaVisitante: "2D", estadio: estadioSede, fecha: new Date(2026, 5, 28) },
      { ronda: "Octavos de Final", fase: "octavos", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "Ganador M73", etiquetaVisitante: "Ganador M74", estadio: estadioSede, fecha: new Date(2026, 6, 4) },
      { ronda: "Cuartos de Final", fase: "cuartos", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "Ganador Octavos 1", etiquetaVisitante: "Ganador Octavos 2", estadio: estadioSede, fecha: new Date(2026, 6, 9) },
      { ronda: "Semifinal", fase: "semifinal", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "Ganador Cuartos 1", etiquetaVisitante: "Ganador Cuartos 2", estadio: estadioSede, fecha: new Date(2026, 6, 14) },
      { ronda: "Gran Final", fase: "final", equipo1: equipoAuxiliar, equipo2: equipoAuxiliar, etiquetaLocal: "Ganador Semifinal 1", etiquetaVisitante: "Ganador Semifinal 2", estadio: estadioSede, fecha: new Date(2026, 6, 19) }
    ];

    await Partido.insertMany(partidosEliminatoria);

    console.log("\n🚀 ¡BASE DE DATOS POBLADA AL 100% DE FORMA AUTOMÁTICA!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar:", error);
    process.exit(1);
  }
};

poblarBaseDeDatos();