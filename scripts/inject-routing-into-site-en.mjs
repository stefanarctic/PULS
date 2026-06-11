/**
 * One-off / re-runnable: merges `routing` into public/translations/site.en.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const target = path.join(root, "public/translations/site.en.json");

const simulationPathMapEntries = [
  ["/simulare/pendul-simplu", "/simulation/simple-pendulum"],
  ["/simulare/pendul-amortizat", "/simulation/damped-pendulum"],
  ["/simulare/pendul-neliniar", "/simulation/nonlinear-pendulum"],
  ["/simulare/unde-apa", "/simulation/water-waves"],
  ["/simulare/figuri-lissajous", "/simulation/lissajous-figures"],
  ["/simulare/grafice-pendule", "/simulation/pendulum-graphs"],
  ["/simulare/grafice-functii", "/simulation/function-graphs"],
  ["/simulare/grafice-simple", "/simulation/simple-graphs"],
  ["/simulare/seism", "/simulation/seism"],
  ["/simulare/prisma", "/simulation/prism"],
  ["/simulare/termodinamica", "/simulation/thermodynamics"],
  ["/simulare/oscillatii-ox", "/simulation/oscillations-ox"],
  ["/simulare/oscillatii-oy", "/simulation/oscillations-oy"],
  ["/simulare/coliziuni-inelastice", "/simulation/inelastic-collisions"],
  ["/simulare/circuite-electricitate", "/simulation/electricity-circuits"],
  ["/simulare/energie-circuite", "/simulation/circuit-energy"],
  ["/simulare/motoare-termice", "/simulation/heat-engines"],
  ["/simulare/motoare-ardere-interna", "/simulation/internal-combustion-engines"],
  ["/simulare/pendule-multiple", "/simulation/multiple-pendulums"],
  ["/simulare/plan-inclinat", "/simulation/inclined-plane"],
  ["/simulare/proiectile", "/simulation/projectiles"],
  ["/simulare/refractie-atmosferica", "/simulation/atmospheric-refraction"],
  ["/simulare/lentila-subtire", "/simulation/thin-lens"],
  ["/simulare/polarizare-circulara", "/simulation/circular-polarization"],
  ["/simulare/reflexie-refractie", "/simulation/reflection-refraction"],
  ["/simulare/vizualizator-4d", "/simulation/four-d-visualizer"],
  ["/simulare/constelatii", "/simulation/constellations"],
  ["/simulare/legi_Kepler", "/simulation/kepler-laws"],
  ["/simulare/atom_hidrogen", "/simulation/hydrogen-atom"],
  ["/simulare/michaelson-morley", "/simulation/michelson-morley"],
  ["/simulare/lanturi-elastice", "/simulation/elastic-chains"],
  ["/simulare/miscare-planete", "/simulation/planetary-motion"],
  ["/simulare/tabel-periodic", "/simulation/periodic-table"],
  ["/simulare/laser", "/simulation/laser"],
  ["/simulare/laser-interactie", "/simulation/laser-interaction"],
  ["/simulare/eli-np-laser", "/simulation/eli-np-laser"],
  ["/simulare/accelerator-laser", "/simulation/laser-accelerator"],
  ["/simulare/spectru-electromagnetic", "/simulation/electromagnetic-spectrum"],
  ["/simulare/curent-alternativ", "/simulation/alternating-current"],
  ["/simulare/kirchhoff", "/simulation/kirchhoff"],
  ["/simulare/dubla-fanta", "/simulation/double-slit"],
  ["/simulare/tunelare-cuantica", "/simulation/quantum-tunneling"],
  ["/simulare/legaturi-atomi", "/simulation/atomic-bonds"],
  ["/simulare/apa-grea", "/simulation/heavy-water"],
  ["/simulare/instalatie-schimb-izotopic", "/simulation/isotope-exchange-plant"],
  ["/simulare/distilare-d2o-fractionata", "/simulation/fractional-d2o-distillation"],
  ["/simulare/frecare-aer", "/simulation/air-friction"],
  ["/simulare/reactor-fuziune-dt", "/simulation/dt-fusion-reactor"],
  ["/simulare/fisiune-nucleara", "/simulation/nuclear-fission"],
  ["/simulare/izotopi-uraniu", "/simulation/uranium-isotopes"],
  ["/simulare/toti-izotopii", "/simulation/all-uranium-isotopes"],
  ["/simulare/criogenie", "/simulation/cryogenics"],
  ["/simulare/supraconductivitate", "/simulation/superconductivity"],
  ["/simulare/fuel-cell", "/simulation/fuel-cell"],
];

const pathMap = Object.fromEntries([
  ["/", "/"],
  ["/landing-custom", "/landing-custom"],
  ["/about-us", "/about-us"],
  ["/search", "/search"],
  ["/invite-teacher", "/invite-teacher"],
  ["/admin", "/admin"],
  ["/probleme", "/problems"],
  ["/probleme/bac", "/problems/baccalaureate"],
  ["/probleme/grile", "/problems/quizzes"],
  ["/simulari", "/simulations"],
  ["/resurse", "/resources"],
  ["/resurse/pendule", "/resources/pendulums"],
  ["/resurse/unde", "/resources/waves"],
  ["/resurse/lissajous", "/resources/lissajous"],
  ["/resurse/seism", "/resources/earthquakes"],
  ["/resurse/termodinamica", "/resources/thermodynamics"],
  ["/resurse/mecanica", "/resources/mechanics"],
  ["/resurse/electricitate", "/resources/electricity"],
  ["/resurse/electromagnetism", "/resources/electromagnetism"],
  ["/resurse/optica", "/resources/optics"],
  ["/resurse/matematica", "/resources/mathematics"],
  ["/resurse/astronomie", "/resources/astronomy"],
  ["/resurse/atomul", "/resources/atom"],
  ["/resurse/fizica-cuantica", "/resources/quantum-physics"],
  ["/resurse/fizica-nucleara", "/resources/nuclear-physics"],
  ["/resurse/lasere", "/resources/lasers"],
  ["/asistent", "/assistant"],
  ["/comunitate", "/community"],
  ["/profil", "/profile"],
  ["/profesor", "/teacher"],
  ["/clasa/intra", "/class/join"],
  ["/clasa", "/class"],
  ...simulationPathMapEntries,
]);

const routing = {
  notes:
    "Romanian path keys (leading slash) map to English paths for the /en/ locale. Internal links should keep using Romanian paths in code; localizedPath() expands them. Prefix rules run after exact matches, longest ro prefix first.",
  pathMap,
  pathPrefixes: [
    { ro: "/probleme/grile/", en: "/problems/quizzes/" },
    { ro: "/probleme/", en: "/problems/" },
    { ro: "/profesor/clasa/", en: "/teacher/class/" },
    { ro: "/profil/", en: "/profile/" },
    { ro: "/clasa/", en: "/class/" },
  ],
};

const raw = fs.readFileSync(target, "utf8");
const data = JSON.parse(raw);
data.routing = routing;
fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);

console.log("Updated", target, "routing.pathMap keys:", Object.keys(pathMap).length);
