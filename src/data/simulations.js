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
    maxHeight: '90vh'
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
    maxHeight: '90vh'
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
    maxHeight: '90vh'
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
    maxHeight: '200vh'
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
    maxHeight: '90vh'
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
    maxHeight: '90vh'
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
    maxHeight: '90vh'
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
    maxHeight: '90vh'
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
    maxHeight: '70vh'
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
    maxHeight: '90vh'
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
  },
  {
    id: 12,
    slug: "oscillatii-ox",
    route: "/simulare/oscillatii-ox",
    title: "Mișcări Oscilatorii pe OX",
    description: "Simulează mișcările oscilatorii pe OX.",
    image: simulatorOscilatieOXImg,
    caption: "Mișcări Oscilatorii pe OX",
    iframeSrc: "/simulari/Oscilatii elastice  pe OX/index.html",
  },
  {
    id: 13,
    slug: "oscillatii-oy",
    route: "/simulare/oscillatii-oy",
    title: "Mișcări Oscilatorii pe OY",
    description: "Simulează mișcările oscilatorii pe OY.",
    image: simulatorOscilatieOYImg,
    caption: "Mișcări Oscilatorii pe OY",
    iframeSrc: "/simulari/Legea Hooke-oscilatii oy/index.html",
    maxHeight: '90vh'
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
    maxHeight: '100vh'
  },
];

export default simulationsConfig;

