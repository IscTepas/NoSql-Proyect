require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

// Importar los 5 modelos de Mongoose
const Estadio = require("../Modelos/estadio");
const Equipo = require("../Modelos/equipo");
const Grupo = require("../Modelos/grupo");
const Partido = require("../Modelos/juegos");
const TablaPosiciones = require("../Modelos/tabla");

const URI = process.env.MONGO_URI;

// 1. LOS 16 ESTADIOS SEDE
const estadiosData = [
  // México (3)
  { nombre: "Estadio Azteca", ciudad: "Ciudad de México", pais: "México", capacidad: 83264, region: "Centro" },
  { nombre: "Estadio Akron", ciudad: "Guadalajara", pais: "México", capacidad: 48071, region: "Occidente" },
  { nombre: "Estadio BBVA", ciudad: "Monterrey", pais: "México", capacidad: 53500, region: "Norte" },
  // Canadá (2)
  { nombre: "BMO Field", ciudad: "Toronto", pais: "Canadá", capacidad: 45000, region: "Este" },
  { nombre: "BC Place", ciudad: "Vancouver", pais: "Canadá", capacidad: 54500, region: "Oeste" },
  // Estados Unidos (11)
  { nombre: "MetLife Stadium", ciudad: "Nueva York/Nueva Jersey", pais: "Estados Unidos", capacidad: 82500, region: "Este" },
  { nombre: "SoFi Stadium", ciudad: "Los Ángeles", pais: "Estados Unidos", capacidad: 70240, region: "Oeste" },
  { nombre: "AT&T Stadium", ciudad: "Dallas", pais: "Estados Unidos", capacidad: 80000, region: "Centro" },
  { nombre: "Arrowhead Stadium", ciudad: "Kansas City", pais: "Estados Unidos", capacidad: 76416, region: "Centro" },
  { nombre: "NRG Stadium", ciudad: "Houston", pais: "Estados Unidos", capacidad: 72220, region: "Centro" },
  { nombre: "Mercedes-Benz Stadium", ciudad: "Atlanta", pais: "Estados Unidos", capacidad: 71000, region: "Este" },
  { nombre: "Lincoln Financial Field", ciudad: "Filadelfia", pais: "Estados Unidos", capacidad: 69796, region: "Este" },
  { nombre: "Lumen Field", ciudad: "Seattle", pais: "Estados Unidos", capacidad: 69000, region: "Oeste" },
  { nombre: "Levi's Stadium", ciudad: "San Francisco/Santa Clara", pais: "Estados Unidos", capacidad: 68500, region: "Oeste" },
  { nombre: "Gillette Stadium", ciudad: "Boston/Foxborough", pais: "Estados Unidos", capacidad: 65878, region: "Este" },
  { nombre: "Hard Rock Stadium", ciudad: "Miami", pais: "Estados Unidos", capacidad: 64767, region: "Este" }
];

// 2. LOS 48 EQUIPOS CLASIFICADOS OFICIALES (GRUPOS A-L)
const equiposData = [
  // Grupo A
  { nombre: "México", bandera: "🇲🇽", fifaCode: "MEX", iso2: "MX", grupo: "A" },
  { nombre: "Sudáfrica", bandera: "🇿🇦", fifaCode: "RSA", iso2: "ZA", grupo: "A" },
  { nombre: "Corea del Sur", bandera: "🇰🇷", fifaCode: "KOR", iso2: "KR", grupo: "A" },
  { nombre: "República Checa", bandera: "🇨🇿", fifaCode: "CZE", iso2: "CZ", grupo: "A" },
  // Grupo B
  { nombre: "Canadá", bandera: "🇨🇦", fifaCode: "CAN", iso2: "CA", grupo: "B" },
  { nombre: "Suiza", bandera: "🇨🇭", fifaCode: "SUI", iso2: "CH", grupo: "B" },
  { nombre: "Bosnia y Herzegovina", bandera: "🇧🇦", fifaCode: "BIH", iso2: "BA", grupo: "B" },
  { nombre: "Catar", bandera: "🇶🇦", fifaCode: "QAT", iso2: "QA", grupo: "B" },
  // Grupo C
  { nombre: "Brasil", bandera: "🇧🇷", fifaCode: "BRA", iso2: "BR", grupo: "C" },
  { nombre: "Marruecos", bandera: "🇲🇦", fifaCode: "MAR", iso2: "MA", grupo: "C" },
  { nombre: "Escocia", bandera: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaCode: "SCO", iso2: "GB", grupo: "C" },
  { nombre: "Haití", bandera: "🇭🇹", fifaCode: "HAI", iso2: "HT", grupo: "C" },
  // Grupo D
  { nombre: "Estados Unidos", bandera: "🇺🇸", fifaCode: "USA", iso2: "US", grupo: "D" },
  { nombre: "Australia", bandera: "🇦🇺", fifaCode: "AUS", iso2: "AU", grupo: "D" },
  { nombre: "Paraguay", bandera: "🇵🇾", fifaCode: "PAR", iso2: "PY", grupo: "D" },
  { nombre: "Turquía", bandera: "🇹🇷", fifaCode: "TUR", iso2: "TR", grupo: "D" },
  // Grupo E
  { nombre: "Alemania", bandera: "🇩🇪", fifaCode: "GER", iso2: "DE", grupo: "E" },
  { nombre: "Costa de Marfil", bandera: "🇨🇮", fifaCode: "CIV", iso2: "CI", grupo: "E" },
  { nombre: "Ecuador", bandera: "🇪🇨", fifaCode: "ECU", iso2: "EC", grupo: "E" },
  { nombre: "Curazao", bandera: "🇨🇼", fifaCode: "CUW", iso2: "CW", grupo: "E" },
  // Grupo F
  { nombre: "Países Bajos", bandera: "🇳🇱", fifaCode: "NED", iso2: "NL", grupo: "F" },
  { nombre: "Japón", bandera: "🇯🇵", fifaCode: "JPN", iso2: "JP", grupo: "F" },
  { nombre: "Suecia", bandera: "🇸🇪", fifaCode: "SWE", iso2: "SE", grupo: "F" },
  { nombre: "Túnez", bandera: "🇹🇳", fifaCode: "TUN", iso2: "TN", grupo: "F" },
  // Grupo G
  { nombre: "Bélgica", bandera: "🇧🇪", fifaCode: "BEL", iso2: "BE", grupo: "G" },
  { nombre: "Egipto", bandera: "🇪🇬", fifaCode: "EGY", iso2: "EG", grupo: "G" },
  { nombre: "Irán", bandera: "🇮🇷", fifaCode: "IRN", iso2: "IR", grupo: "G" },
  { nombre: "Nueva Zelanda", bandera: "🇳🇿", fifaCode: "NZL", iso2: "NZ", grupo: "G" },
  // Grupo H
  { nombre: "España", bandera: "🇪🇸", fifaCode: "ESP", iso2: "ES", grupo: "H" },
  { nombre: "Cabo Verde", bandera: "🇨🇻", fifaCode: "CPV", iso2: "CV", grupo: "H" },
  { nombre: "Uruguay", bandera: "🇺🇾", fifaCode: "URU", iso2: "UY", grupo: "H" },
  { nombre: "Arabia Saudita", bandera: "🇸🇦", fifaCode: "KSA", iso2: "SA", grupo: "H" },
  // Grupo I
  { nombre: "Francia", bandera: "🇫🇷", fifaCode: "FRA", iso2: "FR", grupo: "I" },
  { nombre: "Noruega", bandera: "🇳🇴", fifaCode: "NOR", iso2: "NO", grupo: "I" },
  { nombre: "Senegal", bandera: "🇸🇳", fifaCode: "SEN", iso2: "SN", grupo: "I" },
  { nombre: "Irak", bandera: "🇮🇶", fifaCode: "IRQ", iso2: "IQ", grupo: "I" },
  // Grupo J
  { nombre: "Argentina", bandera: "🇦🇷", fifaCode: "ARG", iso2: "AR", grupo: "J" },
  { nombre: "Austria", bandera: "🇦🇹", fifaCode: "AUT", iso2: "AT", grupo: "J" },
  { nombre: "Argelia", bandera: "🇩🇿", fifaCode: "ALG", iso2: "DZ", grupo: "J" },
  { nombre: "Jordania", bandera: "🇯🇴", fifaCode: "JOR", iso2: "JO", grupo: "J" },
  // Grupo K
  { nombre: "Colombia", bandera: "🇨🇴", fifaCode: "COL", iso2: "CO", grupo: "K" },
  { nombre: "Portugal", bandera: "🇵🇹", fifaCode: "POR", iso2: "PT", grupo: "K" },
  { nombre: "RD Congo", bandera: "🇨🇩", fifaCode: "COD", iso2: "CD", grupo: "K" },
  { nombre: "Uzbekistán", bandera: "🇺🇿", fifaCode: "UZB", iso2: "UZ", grupo: "K" },
  // Grupo L
  { nombre: "Inglaterra", bandera: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaCode: "ENG", iso2: "GB", grupo: "L" },
  { nombre: "Croacia", bandera: "🇭🇷", fifaCode: "CRO", iso2: "HR", grupo: "L" },
  { nombre: "Ghana", bandera: "🇬🇭", fifaCode: "GHA", iso2: "GH", grupo: "L" },
  { nombre: "Panamá", bandera: "🇵🇦", fifaCode: "PAN", iso2: "PA", grupo: "L" }
];

const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const poblarBaseDeDatos = async () => {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(URI);
    console.log("Conectado a MongoDB Atlas.");

    // Limpiar base de datos
    console.log("Limpiando colecciones existentes...");
    await Estadio.deleteMany();
    await Equipo.deleteMany();
    await Grupo.deleteMany();
    await Partido.deleteMany();
    await TablaPosiciones.deleteMany();

    // 1. Insertar Estadios
    console.log("Insertando 16 Estadios Sede...");
    const estadiosDB = await Estadio.insertMany(estadiosData);

    // 2. Insertar Equipos
    console.log("Insertando 48 Equipos Clasificados...");
    const equiposDB = await Equipo.insertMany(equiposData);

    // 3. Crear Grupos y Tablas de Posiciones
    console.log("Creando 12 Grupos y Tablas de Posiciones...");
    const partidosFaseGrupos = [];

    for (let i = 0; i < letrasGrupos.length; i++) {
      const letra = letrasGrupos[i];
      // Obtener los 4 equipos correspondientes a este grupo
      const equiposDelGrupo = equiposDB.filter(e => e.grupo === letra);
      const equiposIDs = equiposDelGrupo.map(e => ({ equipo: e._id }));

      // Insertar Grupo
      const nuevoGrupo = await Grupo.create({
        nombre: letra,
        equipos: equiposIDs
      });

      // Insertar TablaPosiciones inicial para el grupo
      await TablaPosiciones.create({
        grupo: nuevoGrupo._id,
        posiciones: equiposDelGrupo.map(e => ({
          equipo: e._id,
          partidosJugados: 0,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          golesFavor: 0,
          golesContra: 0,
          diferenciaGoles: 0,
          puntos: 0
        }))
      });

      // Generar 6 partidos por grupo (Todos contra todos) -> 12 * 6 = 72 Partidos de Fase de Grupos
      const combinaciones = [
        [0, 1], [2, 3], // Jornada 1
        [0, 2], [1, 3], // Jornada 2
        [0, 3], [1, 2]  // Jornada 3
      ];

      combinaciones.forEach((comb, idx) => {
        const estadioAzar = estadiosDB[Math.floor(Math.random() * estadiosDB.length)];
        partidosFaseGrupos.push({
          fecha: new Date(2026, 5, 11 + idx * 3), // Fechas distribuidas en Junio 2026
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

    // Insertar los 72 partidos de Fase de Grupos
    console.log(`Insertando ${partidosFaseGrupos.length} partidos de Fase de Grupos...`);
    await Partido.insertMany(partidosFaseGrupos);

    // 4. Crear Partidos de Eliminatoria (con etiquetaLocal y etiquetaVisitante)
    console.log("Insertando partidos de fase eliminatoria (16avos, Octavos, Cuartos, Semis, Final)...");
    const partidosEliminatoria = [
      // Dieciseisavos de final
      { fase: "dieciseisavos", etiquetaLocal: "1A", etiquetaVisitante: "2B", estadio: estadiosDB[0]._id, fecha: new Date(2026, 5, 28) },
      { fase: "dieciseisavos", etiquetaLocal: "1C", etiquetaVisitante: "2D", estadio: estadiosDB[1]._id, fecha: new Date(2026, 5, 28) },
      { fase: "dieciseisavos", etiquetaLocal: "1E", etiquetaVisitante: "2F", estadio: estadiosDB[2]._id, fecha: new Date(2026, 5, 29) },
      { fase: "dieciseisavos", etiquetaLocal: "1G", etiquetaVisitante: "2H", estadio: estadiosDB[3]._id, fecha: new Date(2026, 5, 29) },
      // Octavos de final
      { fase: "octavos", etiquetaLocal: "Ganador M73", etiquetaVisitante: "Ganador M74", estadio: estadiosDB[4]._id, fecha: new Date(2026, 6, 4) },
      { fase: "octavos", etiquetaLocal: "Ganador M75", etiquetaVisitante: "Ganador M76", estadio: estadiosDB[5]._id, fecha: new Date(2026, 6, 4) },
      // Cuartos de final
      { fase: "cuartos", etiquetaLocal: "Ganador Octavos 1", etiquetaVisitante: "Ganador Octavos 2", estadio: estadiosDB[6]._id, fecha: new Date(2026, 6, 9) },
      // Semifinales
      { fase: "semifinal", etiquetaLocal: "Ganador Cuartos 1", etiquetaVisitante: "Ganador Cuartos 2", estadio: estadiosDB[7]._id, fecha: new Date(2026, 6, 14) },
      // Gran Final
      { fase: "final", etiquetaLocal: "Ganador Semifinal 1", etiquetaVisitante: "Ganador Semifinal 2", estadio: estadiosDB[5]._id, fecha: new Date(2026, 6, 19) }
    ];

    await Partido.insertMany(partidosEliminatoria);

    console.log("\n¡BASE DE DATOS POBLADA AL 100% DE FORMA EXITOSA!");
    process.exit();
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

poblarBaseDeDatos();