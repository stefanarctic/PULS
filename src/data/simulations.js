import simulatorPendulSimpluImg from "/res/screenshots/Simplu_Screenshot.png";
import simulatorPendulAmortizatImg from "/res/screenshots/Amortizat_Screenshot.png";
import simulatorPendulTrasnitImg from "/res/screenshots/Trasnit_Screenshot1.png";
import simulatorUndeImg from "/res/screenshots/Unde_Screenshot.png";
import simulatorLissajousImg from "/res/screenshots/Lissajous_Screenshot.png";
import simulatorSeismImg from "/res/screenshots/Seism_Screenshot.png";
import simulatorPrismaImg from "/res/screenshots/Prisma_Screenshot.png";
import simulatorFunctiiImg from "/res/screenshots/Functii_Screenshot.png";
import simulatorGraficePendulImg from "/res/screenshots/Grafice_Pendule_Screenshot.png";
import simulatorGraficeBasicImg from "/res/screenshots/Grafice_Basic_Screenshot.png";
import termodinamicaImg from "/res/screenshots/Termodinamica_Screenshot.png";
import simulatorOscilatieOYImg from "/res/screenshots/Oscilatieoy_Screenshot.png";
import simulatorOscilatieOXImg from "/res/screenshots/Oscilatieox_Screenshot.png";
import simulatorCiocnireImg from "/res/screenshots/Ciocnire_Screenshot.png";
import circuiteElectricitateImg from "/res/screenshots/Circuite_Electricitate_Screenshot.png";
import energieCircuiteImg from "/res/screenshots/Energie_Circuite_Screenshot.png";
import motoareTermiceImg from "/res/screenshots/Motoare_Termice_Screenshot.png";
import penduleMultipleImg from "/res/screenshots/Pendule_Multiple_Screenshot.png";
import planInclinatImg from "/res/screenshots/Plan_Inclinat_Screenshot.png";
import proiectileImg from "/res/screenshots/Proiectile_Screenshot.png";
import refractieAtmosfericaImg from "/res/screenshots/Refractie_Atmosferica_Screenshot.png";
import lentilaSubtireImg from "/res/screenshots/Lentila_Subtire_Screenshot.png";
import polarizareCircularaImg from "/res/screenshots/Polarizare_Circulara_Screenshot.png";
import reflexieRefractieImg from "/res/screenshots/Reflexie_Refractie_Screenshot.png";
import vizualizator4dImg from "/res/screenshots/Vizualizator_4d_Screenshot.png";
import constelatiiImg from "/res/screenshots/Constelatii_Screenshot.png";
import legiKeplerImg from "/res/screenshots/Legi_Kepler_Screenshot.png";
import atomHidrogenImg from "/res/screenshots/Atom_Hidrogen_Screenshot.png";
import michaelsonMorleyImg from "/res/screenshots/Michaelson_Morley_Screenshot.png";
import lanturiElasticeImg from "/res/screenshots/Lanturi_Elastice_Screenshot.png";
import miscarePlaneteImg from "/res/screenshots/Miscare_Planete_Screenshot.png";
import curentAlternativImg from "/res/screenshots/ac_Screenshot.png";
import kirchhoffImg from "/res/screenshots/kirchoff_Screenshot.png";
import spectruImg from "/res/screenshots/spectru_Screenshot.png";
import dublaFantaImg from "/res/screenshots/dubla_fanta_Screenshot.png";
import tunelareCuanticaImg from "/res/screenshots/tunelare_Screenshot.png";
import laserImg from "/res/screenshots/laser_Screenshot.png";
import laserSimulatorImg from "/res/screenshots/Laser_Simulator_Screenshot.png";
import eliNpLaserImg from "/res/screenshots/Eli_Np_Laser_Screenshot.png";
import tabelPeriodicImg from "/res/screenshots/Tabel_periodic_Screenshot.png";
import legaturiAtomiImg from "/res/screenshots/legaturi_atomi_Screenshot.png";
import apaGreaImg from "/res/screenshots/apa_grea_1.png";
export const simulationsConfig = [
  {
    id: 1,
    slug: "pendul-simplu",
    route: "/simulare/pendul-simplu",
    title: "Pendulul Oscilator Simplu",
    description: "Simularea mișcării oscilatorii armonice simple.",
    image: simulatorPendulSimpluImg,
    caption: "Oscilație armonică simplă",
    iframeSrc: "/simulari/Mix/Reprezentari3d.html",
    maxHeight: '90vh',
    category: "Pendule"
  },
  {
    id: 2,
    slug: "pendul-amortizat",
    route: "/simulare/pendul-amortizat",
    title: "Pendulul Oscilator Amortizat",
    description: "Simularea mișcării oscilatorii amortizate.",
    image: simulatorPendulAmortizatImg,
    caption: "Oscilație amortizată",
    iframeSrc: "/simulari/Mix/Oscilatie-amortizata.html",
    maxHeight: '90vh',
    category: "Pendule"
  },
  {
    id: 3,
    slug: "pendul-neliniar",
    route: "/simulare/pendul-neliniar",
    title: "Pendul simplu neliniar",
    description: "Simularea mișcării oscilatorii neliniare a unui pendul.",
    image: simulatorPendulTrasnitImg,
    caption: "Oscilație mecanică",
    iframeSrc: "/simulari/Mix/Pendul-amplitudine.html",
    maxHeight: '90vh',
    category: "Pendule"
  },
  {
    id: 4,
    slug: "unde-apa",
    route: "/simulare/unde-apa",
    title: "Undele produse în apă",
    description: "Simulează propagarea undelor în apă.",
    image: simulatorUndeImg,
    caption: "Unde în apă",
    iframeSrc: "/simulari/Unde/simulator-unde.html",
    maxHeight: '90vh',
    category: "Unde"
  },
  {
    id: 5,
    slug: "figuri-lissajous",
    route: "/simulare/figuri-lissajous",
    title: "Figuri Lissajous",
    description: "Simulează figuri Lissajous în funcție de frecvențele oscilatorilor.",
    image: simulatorLissajousImg,
    caption: "Figuri Lissajous",
    iframeSrc: "/simulari/Figuri-Lissajous/grafice.html",
    maxHeight: '90vh',
    category: "Unde"
  },
  {
    id: 6,
    slug: "grafice-pendule",
    route: "/simulare/grafice-pendule",
    title: "Grafice Pendule",
    description: "Simulează graficele pentru diferite tipuri de pendule.",
    image: simulatorGraficePendulImg,
    caption: "Grafice Pendule",
    iframeSrc: "/simulari/Grafice-Armonice/index.html",
    maxHeight: '90vh',
    category: "Grafice"
  },
  {
    id: 7,
    slug: "grafice-functii",
    route: "/simulare/grafice-functii",
    title: "Grafice Funcții",
    description: "Simulează graficele pentru diferite funcții.",
    image: simulatorFunctiiImg,
    caption: "Grafice Funcții",
    iframeSrc: "/simulari/Functii/Functii/index.html",
    maxHeight: '90vh',
    category: "Grafice"
  },
  {
    id: 8,
    slug: "grafice-simple",
    route: "/simulare/grafice-simple",
    title: "Grafice Simple",
    description: "Simulează graficele pentru diferite funcții simple.",
    image: simulatorGraficeBasicImg,
    caption: "Grafice Simple",
    iframeSrc: "/simulari/Mix/grafice.html",
    maxHeight: '90vh',
    category: "Grafice"
  },
  {
    id: 9,
    slug: "seism",
    route: "/simulare/seism",
    title: "Seism",
    description: "Simulează un cutremur și efectele sale.",
    image: simulatorSeismImg,
    caption: "Cutremur",
    iframeSrc: "/simulari/Mix/Cutremur.html",
    maxHeight: '70vh',
    category: "Unde"
  },
  {
    id: 10,
    slug: "prisma",
    route: "/simulare/prisma",
    title: "Prisma",
    description: "Simulează dispersia luminii printr-o prismă.",
    image: simulatorPrismaImg,
    caption: "Prisma",
    iframeSrc: "/simulari/prisma/prisma-simulator.html",
    maxHeight: '90vh',
    category: "Optică"
  },
  {
    id: 11,
    slug: "termodinamica",
    route: "/simulare/termodinamica",
    title: "Termodinamică – Gaz ideal într-un vas",
    description: "Ajustează parametrii și urmărește în timp real comportamentul unui gaz ideal în simulator.",
    image: termodinamicaImg,
    caption: "Termodinamică",
    iframeSrc: "/simulari/Termodinamica/index.html",
    category: "Termodinamică"
  },
  {
    id: 12,
    slug: "oscillatii-ox",
    route: "/simulare/oscillatii-ox",
    title: "Mișcări Oscilatorii pe OX",
    description: "Simulează mișcările oscilatorii pe OX.",
    image: simulatorOscilatieOXImg,
    caption: "Mișcări Oscilatorii pe OX",
    iframeSrc: "/simulari/Oscilatii-ox/index.html",
    category: "Oscilații"
  },
  {
    id: 13,
    slug: "oscillatii-oy",
    route: "/simulare/oscillatii-oy",
    title: "Mișcări Oscilatorii pe OY",
    description: "Simulează mișcările oscilatorii pe OY.",
    image: simulatorOscilatieOYImg,
    caption: "Mișcări Oscilatorii pe OY",
    iframeSrc: "/simulari/Oscilatii-oy/index.html",
    maxHeight: '90vh',
    category: "Oscilații"
  },
  {
    id: 14,
    slug: "coliziuni-inelastice",
    route: "/simulare/coliziuni-inelastice",
    title: "Coliziuni Inelastice",
    description: "Simulează coliziunile inelastice.",
    image: simulatorCiocnireImg,
    caption: "Coliziuni Inelastice",
    iframeSrc: "/simulari/Ciocnire/ciocnire.html",
    maxHeight: '100vh',
    category: "Mecanică"
  },
  {
    id: 15,
    slug: "circuite-electricitate",
    route: "/simulare/circuite-electricitate",
    title: "Circuite Electrice",
    description: "Simulator pentru circuite electrice cu legea lui Ohm și Kirchhoff.",
    image: circuiteElectricitateImg, 
    caption: "Circuite Electrice",
    iframeSrc: "/simulari/electricity/index.html",
    maxHeight: '90vh',
    category: "Electricitate"
  },
  {
    id: 16,
    slug: "energie-circuite",
    route: "/simulare/energie-circuite",
    title: "Energia în Circuite",
    description: "Simulează fluxul de energie în circuite electrice.",
    image: energieCircuiteImg, 
    caption: "Energia în Circuite",
    iframeSrc: "/simulari/energie_circuite/index.html",
    maxHeight: '90vh',
    category: "Electricitate"
  },
  {
    id: 17,
    slug: "motoare-termice",
    route: "/simulare/motoare-termice",
    title: "Motoare Termice",
    description: "Simulează ciclurile Otto, Diesel și Carnot cu diagrame p-V și T-s.",
    image: motoareTermiceImg, 
    caption: "Motoare Termice",
    iframeSrc: "/simulari/motoare/index.html",
    maxHeight: '90vh',
    category: "Termodinamică"
  },
  {
    id: 18,
    slug: "pendule-multiple",
    route: "/simulare/pendule-multiple",
    title: "Penduluri Duble Multiple",
    description: "Simulează penduluri duble multiple cu efecte haotice și urme.",
    image: penduleMultipleImg, 
    caption: "Penduluri Multiple",
    iframeSrc: "/simulari/pendule_multiple/index.html",
    maxHeight: '90vh',
    category: "Pendule"
  },
  {
    id: 19,
    slug: "plan-inclinat",
    route: "/simulare/plan-inclinat",
    title: "Plan Înclinat",
    description: "Simulează mișcarea pe plan înclinat cu frecare statică și cinetică.",
    image: planInclinatImg, 
    caption: "Plan Înclinat",
    iframeSrc: "/simulari/plan-inclinat/index.html",
    maxHeight: '90vh',
    category: "Mecanică"
  },
  {
    id: 20,
    slug: "proiectile",
    route: "/simulare/proiectile",
    title: "Mișcarea Proiectilului",
    description: "Simulator BAC pentru mișcarea proiectilului cu și fără rezistență aerului.",
    image: proiectileImg, 
    caption: "Mișcarea Proiectilului",
    iframeSrc: "/simulari/proiectile/index.html",
    maxHeight: '90vh',
    category: "Mecanică"
  },
  {
    id: 21,
    slug: "refractie-atmosferica",
    route: "/simulare/refractie-atmosferica",
    title: "Miraj în Deșert",
    description: "Simulează refracția atmosferică și efectul de miraj în deșert.",
    image: refractieAtmosfericaImg, 
    caption: "Refracție Atmosferică",
    iframeSrc: "/simulari/refractie_atmosferica/index.html",
    maxHeight: '90vh',
    category: "Optică"
  },
  {
    id: 22,
    slug: "lentila-subtire",
    route: "/simulare/lentila-subtire",
    title: "Lentilă Subțire",
    description: "Simulator optică pentru lentile subțiri cu raze și imagini reale/virtuale.",
    image: lentilaSubtireImg, 
    caption: "Lentilă Subțire",
    iframeSrc: "/simulari/simulator_optica/index.html",
    maxHeight: '90vh',
    category: "Optică"
  },
  {
    id: 23,
    slug: "polarizare-circulara",
    route: "/simulare/polarizare-circulara",
    title: "Polarizare Circulară",
    description: "Simulează polarizarea circulară a undelor electromagnetice cu vizualizări 3D și parametri Stokes.",
    image: polarizareCircularaImg, 
    caption: "Polarizare Circulară",
    iframeSrc: "/simulari/polarizare-circulara/index.html",
    maxHeight: '90vh',
    category: "Unde"
  },
  {
    id: 24,
    slug: "reflexie-refractie",
    route: "/simulare/reflexie-refractie",
    title: "Reflexie și Refracție",
    description: "Simulează reflexia și refracția luminii la interfața dintre două medii cu indici de refracție diferiți.",
    image: reflexieRefractieImg, 
    caption: "Reflexie și Refracție",
    iframeSrc: "/simulari/reflexie-refractie/index.html",
    maxHeight: '90vh',
    category: "Optică"
  },
  {
    id: 25,
    slug: "Vizualizator-4d",
    route: "/simulare/vizualizator-4d",
    title: "Vizualizator 4D",
    description: "Explorează și vizualizează obiecte geometrice 4D prin proiecții interactive, rotații în spațiul hiperdimensional și tranziții controlate în 4D.",
    image: vizualizator4dImg, 
    caption: "Vizualizator 4D",
    iframeSrc: "/simulari/4D-Visualizer/index.html",
    maxHeight: '90vh',
    category: "4D"
  },
  {
    id: 39,
    slug: "constelatii",
    route: "/simulare/constelatii",
    title: "Constelații pe cer",
    description:
      "Hartă interactivă a cerului: recunoaștere constelații, orientare după Steaua polară, povești scurte și legătura cu coordonatele astronomice.",
    image: constelatiiImg,
    caption: "Constelații pe cer",
    iframeSrc: "/simulari/constelatii/index.html",
    maxHeight: "90vh",
    category: "Astronomie",
  },
  {
    id: 26,
    slug: "legi_Kepler",
    route: "/simulare/legi_Kepler",
    title: "Legile lui Kepler",
    description: "Simulează mișcarea planetelor conform celor trei legi ale lui Kepler, cu orbite eliptice, variația vitezei și relația perioadă–rază orbitală.",
    image: legiKeplerImg, 
    caption: "Legile lui Kepler",
    iframeSrc: "/simulari/Legi_Kepler/index.html",
    maxHeight: '90vh',
    category: "Astronomie"
  },
  {
    id: 27,
    slug: "atom_hidrogen",
    route: "/simulare/atom_hidrogen",
    title: "Atomul de hidrogen",
    description: "Simulează structura atomului de hidrogen folosind modelele Bohr, de Broglie și mecanica cuantică (Schrödinger), cu tranziții energetice și orbitale.",
    image: atomHidrogenImg, 
    caption: "Atomul de hidrogen",
    iframeSrc: "/simulari/Atom_hidrogen/index.html",
    maxHeight: '90vh',
    category: "Atomul"
  },
  {
    id: 28,
    slug: "michaelson-morley",
    route: "/simulare/michaelson-morley",
    title: "Experimentul Michelson-Morley",
    description: "Reproduce virtual experimentul Michelson–Morley și analizează interferența luminii pentru a evidenția absența eterului și implicațiile relativiste.",
    image: michaelsonMorleyImg, 
    caption: "Experimentul Michelson-Morley",
    iframeSrc: "/simulari/michaelson-moray/index.html",
    maxHeight: '90vh',
    category: "Astronomie"
  },
  {
    id: 29,
    slug: "lanturi-elastice",
    route: "/simulare/lanturi-elastice",
    title: "Lanțuri Elastice",
    description: "Simulează dinamica lanțurilor elastice cu resorturi, propagarea undelor mecanice și comportamentul sistemelor oscilante interconectate.",
    image: lanturiElasticeImg, 
    caption: "Lanțuri Elastice",
    iframeSrc: "/simulari/Lant/index.html",
    maxHeight: '90vh',
    category: "Mecanică"
  },
  {
    id: 30,
    slug: "miscare-planete",
    route: "/simulare/miscare-planete",
    title: "Mișcarea Planetelor",
    description: "Simulează mișcarea planetelor in sistemul solar, cu efecte de relativitate generala",
    image: miscarePlaneteImg, 
    caption: "Mișcarea Planetelor",
    iframeSrc: "/simulari/miscare_planete/index.html",
    maxHeight: '90vh',
    category: "Astronomie"
  },
  {
    id: 31,
    slug: "tabel-periodic",
    route: "/simulare/tabel-periodic",
    title: "Tabelul periodic",
    description: "Explorează tabelul periodic: elemente, simboluri, număr atomic și proprietăți de bază.",
    image: tabelPeriodicImg,
    caption: "Tabel periodic",
    iframeSrc: "/simulari/tabel_periodic/index.html",
    maxHeight: "90vh",
    category: "Atomul"
  },
  {
    id: 32,
    slug: "laser",
    route: "/simulare/laser",
    title: "Laser",
    description: "Simulare pentru fascicul laser și parametri optici (lungime de undă, intensitate, divergență).",
    image: laserImg,
    caption: "Laser",
    iframeSrc: "/simulari/laser/index.html",
    maxHeight: "90vh",
    category: "Optică"
  },
  {
    id: 41,
    slug: "laser-interactie",
    route: "/simulare/laser-interactie",
    title: "Laser vs materie",
    description:
      "Explorează cum influențează intensitatea, materialul și focalizarea încălzirea, ionizarea și interacția dintre fascicul și țintă.",
    image: laserSimulatorImg,
    caption: "Interacție laser-materie",
    iframeSrc: "/simulari/laser_simulator.html",
    maxHeight: "90vh",
    category: "Lasere",
    eyebrow: "Lasere | Simulare interactivă"
  },
  {
    id: 42,
    slug: "eli-np-laser",
    route: "/simulare/eli-np-laser",
    title: "ELI-NP Photon Sniper",
    description:
      "Simulator inspirat de contextul ELI-NP: pulsuri ultra-scurte, focalizare strânsă, intensitate de vârf și răspunsul materialului țintă.",
    image: eliNpLaserImg,
    caption: "ELI-NP și pulsuri ultra-scurte",
    iframeSrc: "/simulari/eli-np-laser/index.html",
    maxHeight: "95vh",
    category: "Lasere",
    eyebrow: "ELI-NP | Simulare interactivă"
  },
  {
    id: 33,
    slug: "spectru-electromagnetic",
    route: "/simulare/spectru-electromagnetic",
    title: "Spectrul electromagnetic",
    description: "Explorează spectrul electromagnetic: frecvență, lungime de undă și aplicații.",
    image: spectruImg,
    caption: "Spectrul electromagnetic",
    iframeSrc: "/simulari/electromagnetic-spectrum.html",
    maxHeight: "90vh",
    category: "Optică"
  },
  {
    id: 34,
    slug: "curent-alternativ",
    route: "/simulare/curent-alternativ",
    title: "Curent alternativ",
    description: "Simulare pentru tensiune/curent sinusoidal, frecvență și mărimi efective.",
    image: curentAlternativImg,
    caption: "Curent alternativ",
    iframeSrc: "/simulari/curent-alternativ/index.html",
    maxHeight: "90vh",
    category: "Electricitate"
  },
  {
    id: 35,
    slug: "kirchhoff",
    route: "/simulare/kirchhoff",
    title: "Legile lui Kirchhoff",
    description: "Construiește și analizează circuite electrice: noduri, ochiuri, surse și rezistențe cu KCL și KVL.",
    image: kirchhoffImg,
    caption: "Simulator Kirchhoff",
    iframeSrc: "https://kirchoff.vercel.app/",
    maxHeight: "90vh",
    category: "Electricitate"
  },
  {
    id: 36,
    slug: "dubla-fanta",
    route: "/simulare/dubla-fanta",
    title: "Dubla fantă (cuantic)",
    description: "Interferență și probabilitate în experimentul cu două fante, regim undă–particulă și pattern pe ecran.",
    image: dublaFantaImg,
    caption: "Dubla fantă",
    iframeSrc: "/simulari/dubla_fanta/index.html",
    maxHeight: "90vh",
    category: "Fizică cuantică"
  },
  {
    id: 37,
    slug: "tunelare-cuantica",
    route: "/simulare/tunelare-cuantica",
    title: "Tunelare cuantică",
    description: "Penetrarea unei bariere de potențial când energia particulei este sub înălțimea barierei, undă evanescentă și coeficient de transmisie.",
    image: tunelareCuanticaImg,
    caption: "Tunelare cuantică",
    iframeSrc: "/simulari/tunelare/index.html",
    maxHeight: "90vh",
    category: "Fizică cuantică"
  },
  {
    id: 38,
    slug: "legaturi-atomi",
    route: "/simulare/legaturi-atomi",
    title: "Legături între atomi",
    description:
      "Vizualizează legături chimice (σ, π), orbitali moleculari de legătură/antilegătură și distribuția densității de probabilitate între nuclee.",
    image: legaturiAtomiImg,
    caption: "Legături între atomi",
    iframeSrc: "/simulari/legaturi_atomi/index.html",
    maxHeight: "90vh",
    category: "Fizică cuantică"
  },
  {
    id: 40,
    slug: "apa-grea",
    route: "/simulare/apa-grea",
    title: "D₂O vs H₂O",
    description:
      "Compară D₂O cu H₂O: fracție în lichid, efecte biologice orientative, densitate, puncte de fierbere/îngheț și mod de moderare în reactor.",
    image: apaGreaImg,
    caption: "Simulator apă grea",
    iframeSrc: "/simulari/apa_grea/index.html",
    maxHeight: "90vh",
    category: "Fizică nucleară"
  },
];

export default simulationsConfig;

