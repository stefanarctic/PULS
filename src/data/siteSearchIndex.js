import { simulationsConfig } from "./simulations";

/**
 * Pagini principale și secțiuni — folosit la căutarea globală din navbar.
 */
const STATIC_SITE_ENTRIES = [
  {
    title: "Acasă",
    path: "/",
    keywords: ["acasa", "home", "puls", "platforma", "start", "index"],
  },
  {
    title: "Despre noi",
    path: "/about-us",
    keywords: ["despre", "about", "echipa", "cine suntem"],
  },
  {
    title: "Probleme",
    path: "/probleme",
    keywords: [
      "problema",
      "probleme",
      "exercitii",
      "exercițiu",
      "exercise",
      "test",
      "quiz",
      "intrebari",
      "fizica",
    ],
  },
  {
    title: "Probleme BAC",
    path: "/probleme/bac",
    keywords: ["bac", "bacalaureat", "subiecte bac", "examen bac", "probleme bac"],
  },
  {
    title: "Grile",
    path: "/probleme/grile",
    keywords: ["grile", "grila", "varianti", "test grilă", "răspunsuri multiple"],
  },
  {
    title: "Simulări interactive",
    path: "/simulari",
    keywords: [
      "simulare",
      "simulari",
      "simulări",
      "interactive",
      "simulator",
      "experiment virtual",
    ],
  },
  {
    title: "Resurse",
    path: "/resurse",
    keywords: ["resurse", "materiale", "curs", "lecții", "documentație"],
  },
  {
    title: "Resurse — Pendule",
    path: "/resurse/pendule",
    keywords: ["pendul", "pendule", "pendulum", "oscilație", "oscilator"],
  },
  {
    title: "Resurse — Unde",
    path: "/resurse/unde",
    keywords: ["unde", "wave", "propagare", "vibrații"],
  },
  {
    title: "Resurse — Lissajous",
    path: "/resurse/lissajous",
    keywords: ["lissajous", "figuri lissajous", "osciloscop"],
  },
  {
    title: "Resurse — Seism",
    path: "/resurse/seism",
    keywords: ["seism", "cutremur", "earthquake", "undă seismică"],
  },
  {
    title: "Resurse — Termodinamică",
    path: "/resurse/termodinamica",
    keywords: ["termodinamică", "caldură", "gaz ideal", "entropie", "cicluri"],
  },
  {
    title: "Resurse — Mecanică",
    path: "/resurse/mecanica",
    keywords: ["mecanică", "newton", "forță", "mișcare", "cinematică"],
  },
  {
    title: "Resurse — Electricitate",
    path: "/resurse/electricitate",
    keywords: ["electricitate", "curent", "ohm", "kirchhoff", "circuit"],
  },
  {
    title: "Resurse — Optică",
    path: "/resurse/optica",
    keywords: ["optică", "lumină", "lentile", "refracție", "reflexie"],
  },
  {
    title: "Resurse — Matematică",
    path: "/resurse/matematica",
    keywords: ["matematică", "algebra", "grafice", "funcții"],
  },
  {
    title: "Resurse — Astronomie",
    path: "/resurse/astronomie",
    keywords: ["astronomie", "constelații", "constelații pe cer", "planetă", "stea", "Kepler", "cosmos"],
  },
  {
    title: "Resurse — Atomul",
    path: "/resurse/atomul",
    keywords: ["atom", "nucleu", "electron", "structură atomică"],
  },
  {
    title: "Resurse — Fizică cuantică",
    path: "/resurse/fizica-cuantica",
    keywords: ["cuantică", "cuantic", "quantum", "schrodinger", "foton"],
  },
  {
    title: "Resurse — Fizică nucleară",
    path: "/resurse/fizica-nucleara",
    keywords: [
      "fizică nucleară",
      "nuclear",
      "apa grea",
      "moderator",
      "fisiune",
      "fuziune",
      "deuteriu",
      "tritiu",
      "reactor",
      "D-T",
      "17.6 MeV",
      "radioactivitate",
    ],
  },
  {
    title: "Resurse — Lasere",
    path: "/resurse/lasere",
    keywords: ["laser", "lasere", "eli-np", "magurele", "foton", "laser-materie", "optică laser"],
  },
  {
    title: "Profil",
    path: "/profil",
    keywords: ["profil", "cont", "setări utilizator"],
  },
  {
    title: "Profesor — Dashboard",
    path: "/profesor",
    keywords: ["profesor", "dashboard profesor", "clase"],
  },
  {
    title: "Clasa mea",
    path: "/clasa",
    keywords: ["elev", "clasa", "student", "teme"],
  },
  {
    title: "Intrare în clasă",
    path: "/clasa/intra",
    keywords: ["cod clasă", "intrare clasă", "join"],
  },
  {
    title: "Invită profesor",
    path: "/invite-teacher",
    keywords: ["invitație", "invite", "profesor nou"],
  },
  {
    title: "Panou administrare",
    path: "/admin",
    keywords: ["admin", "administrator", "panou"],
  },
];

/**
 * Intrări de căutare pentru fiecare simulare din `simulationsConfig`.
 */
function simulationSearchEntries() {
  return simulationsConfig.map((s) => ({
    title: s.title,
    path: s.route,
    category: s.category,
    keywords: [
      s.slug,
      s.title,
      s.description,
      s.caption,
      s.category,
      s.route.replace("/simulare/", ""),
    ].filter(Boolean),
  }));
}

export function getSiteSearchStaticEntries() {
  return [...STATIC_SITE_ENTRIES, ...simulationSearchEntries()];
}
