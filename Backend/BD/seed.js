require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

// 1. Importar únicamente los 5 modelos necesarios
const Estadio = require("../Modelos/estadio");
const Equipo = require("../Modelos/equipo");
const Jugador = require("../Modelos/jugador");
const Grupo = require("../Modelos/grupo");
const Partido = require("../Modelos/juegos");

// 2. Importar los archivos JSON de datos
const teamsData = require("./teams.json");          // worldcup.teams.json
const squadsData = require("./squads.json");        // worldcup.squads.json
const stadiumsData = require("./worldcup.stadiums.json"); // worldcup.stadiums.json

const URI = process.env.MONGO_URI;
const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const poblarBaseDeDatos = async () => {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(URI);
    console.log("Conectado con éxito.");

    // Limpiar colecciones
    console.log("Limpiando base de datos...");
    await Promise.all([
      Estadio.deleteMany(),
      Equipo.deleteMany(),
      Jugador.deleteMany(),
      Grupo.deleteMany(),
      Partido.deleteMany()
    ]);

    // 1. Insertar Estadios desde JSON
    console.log("Insertando Estadios...");
    const estadiosFormateados = stadiumsData.stadiums.map(stadium => ({
      nombre: stadium.name,
      ciudad: stadium.city,
      pais: stadium.cc === "mx" ? "México" : stadium.cc === "ca" ? "Canadá" : "Estados Unidos",
      capacidad: stadium.capacity
    }));
    const estadiosDB = await Estadio.insertMany(estadiosFormateados);

    // 2. Insertar Equipos desde JSON
    console.log("Insertando Equipos...");
    const equiposFormateados = teamsData.map(team => ({
      nombre: team.name,
      bandera: team.flag_icon || "",
      fifaCode: team.fifa_code,
      iso2: team.fifa_code.substring(0, 2),
      grupo: team.group
    }));
    const equiposDB = await Equipo.insertMany(equiposFormateados);

    // 3. Insertar Jugadores vinculados a cada Equipo desde squads.json
    console.log("Insertando Jugadores...");
    const listaJugadores = [];

    for (const equipo of equiposDB) {
      const squad = squadsData.find(s => s.fifa_code === equipo.fifaCode);
      if (squad && squad.players) {
        squad.players.forEach(p => {
          listaJugadores.push({
            nombre: p.name,
            numero: p.number,
            posicion: p.pos,
            fechaNacimiento: p.date_of_birth,
            club: {
              nombre: p.club ? p.club.name : "",
              pais: p.club ? p.club.country : ""
            },
            fifaCodeEquipo: equipo.fifaCode,
            equipo: equipo._id // Relación ObjectId
          });
        });
      }
    }
    const jugadoresDB = await Jugador.insertMany(listaJugadores);
    console.log(` ${jugadoresDB.length} jugadores insertados.`);

    // 4. Crear Grupos y Partidos de la Fase de Grupos
    console.log("Creando Grupos y Partidos de Fase de Grupos...");
    const partidosFaseGrupos = [];

    for (const letra of letrasGrupos) {
      const equiposDelGrupo = equiposDB.filter(e => e.grupo === letra);
      const equiposIDs = equiposDelGrupo.map(e => ({ equipo: e._id }));

      // Crear Grupo
      const nuevoGrupo = await Grupo.create({
        nombre: letra,
        equipos: equiposIDs
      });

      // Generar partidos (Todos contra todos dentro del grupo)
      const combinaciones = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
      combinaciones.forEach((comb, idx) => {
        const estadioAzar = estadiosDB[Math.floor(Math.random() * estadiosDB.length)];
        partidosFaseGrupos.push({
          fecha: new Date(2026, 5, 11 + idx * 3),
          estadio: estadioAzar._id,
          equipoLocal: equiposDelGrupo[comb[0]]._id,
          equipoVisitante: equiposDelGrupo[comb[1]]._id,
          fase: "grupos",
          jornada: Math.floor(idx / 2) + 1,
          grupo: nuevoGrupo._id,
          estado: "programado"
        });
      });
    }

    await Partido.insertMany(partidosFaseGrupos);

    // 5. Crear Partidos de Eliminatoria
    console.log("Insertando Partidos Eliminatorios...");
    const partidosEliminatoria = [
      { fase: "dieciseisavos", etiquetaLocal: "1A", etiquetaVisitante: "2B", estadio: estadiosDB[0]._id, fecha: new Date(2026, 5, 28) },
      { fase: "dieciseisavos", etiquetaLocal: "1C", etiquetaVisitante: "2D", estadio: estadiosDB[1]._id, fecha: new Date(2026, 5, 28) },
      { fase: "dieciseisavos", etiquetaLocal: "1E", etiquetaVisitante: "2F", estadio: estadiosDB[2]._id, fecha: new Date(2026, 5, 29) },
      { fase: "dieciseisavos", etiquetaLocal: "1G", etiquetaVisitante: "2H", estadio: estadiosDB[3]._id, fecha: new Date(2026, 5, 29) },
      { fase: "octavos", etiquetaLocal: "Ganador M73", etiquetaVisitante: "Ganador M74", estadio: estadiosDB[4]._id, fecha: new Date(2026, 6, 4) },
      { fase: "octavos", etiquetaLocal: "Ganador M75", etiquetaVisitante: "Ganador M76", estadio: estadiosDB[5]._id, fecha: new Date(2026, 6, 4) },
      { fase: "cuartos", etiquetaLocal: "Ganador Octavos 1", etiquetaVisitante: "Ganador Octavos 2", estadio: estadiosDB[6]._id, fecha: new Date(2026, 6, 9) },
      { fase: "semifinal", etiquetaLocal: "Ganador Cuartos 1", etiquetaVisitante: "Ganador Cuartos 2", estadio: estadiosDB[7]._id, fecha: new Date(2026, 6, 14) },
      { fase: "final", etiquetaLocal: "Ganador Semifinal 1", etiquetaVisitante: "Ganador Semifinal 2", estadio: estadiosDB[5]._id, fecha: new Date(2026, 6, 19) }
    ];

    await Partido.insertMany(partidosEliminatoria);

    console.log("\n¡BASE DE DATOS POBLADA AL 100%!");
    process.exit(0);

  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

poblarBaseDeDatos();