import { useState } from "react";
import simulatorPendulSimpluImg from "/res/screenshots/Simplu_Screenshot.png";
import simulatorPendulAmortizatImg from "/res/screenshots/Amortizat_Screenshot.png";
import simulatorPendulTrasnitImg from "/res/screenshots/Trasnit_Screenshot.png";
import simulatorUndeImg from "/res/screenshots/Unde_Screenshot.png";
import simulatorLissajousImg from "/res/screenshots/Lissajous_Screenshot.png";
import simulatorSeismImg from "/res/screenshots/Seism_Screenshot.png";
import simulatorPrismaImg from "/res/screenshots/Prisma_Screenshot.png";
import simulatorFunctiiImg from "/res/screenshots/Functii_Screenshot.png";
import simulatorGraficePendulImg from "/res/screenshots/Grafice_Pendule_Screenshot.png";
import simulatorGraficeBasicImg from "/res/screenshots/Grafice_Basic_Screenshot.png";
import Layout from "../Layout";

// Data for simulations
const simulationsData = [
  {
    id: 1,
    title: "Pendulul Oscilator Simplu",
    description: "Simularea mișcării oscilatorii armonice simple.",
    image: simulatorPendulSimpluImg,
    caption: "Oscilație armonică simplă",
  },
  {
    id: 2,
    title: "Pendulul Oscilator Amortizat",
    description: "Simularea mișcării oscilatorii amortizate.",
    image: simulatorPendulAmortizatImg,
    caption: "Oscilație amortizată",
  },
  {
    id: 3,
    title: "Pendul simplu neliniar",
    description: "Simularea mișcării oscilatorii neliniare a unui pendul.",
    image: simulatorPendulTrasnitImg,
    caption: "Oscilație mecanică",
  },
  {
    id: 4,
    title: "Undele produse in apa",
    description: "Simulează propagarea undelor în apă.",
    image: simulatorUndeImg,
    caption: "Unde în apă",
  },
  {
    id: 5,
    title: "Figuri Lissajous",
    description: "Simulează figuri Lissajous în funcție de frecvențele oscilatorilor.",
    image: simulatorLissajousImg,
    caption: "Figuri Lissajous",
  },
  {
    id: 6,
    title: "Grafice Pendule",
    description: "Simulează graficele pentru diferite tipuri de pendule.",
    image: simulatorGraficePendulImg,
    caption: "Grafice Pendule",
  },
  {
    id: 7,
    title: "Grafice Funcții",
    description: "Simulează graficele pentru diferite funcții.",
    image: simulatorFunctiiImg,
    caption: "Grafice Funcții",
  },
  {
    id: 8,
    title: "Grafice Simple",
    description: "Simulează graficele pentru diferite funcții simple.",
    image: simulatorGraficeBasicImg,
    caption: "Grafice Simple",
  },
  {
    id: 9,
    title: "Seism",
    description: "Simulează un cutremur și efectele sale.",
    image: simulatorSeismImg,
    caption: "Cutremur",
  },
  {
    id: 10,
    title: "Prisma",
    description: "Simulează dispersia luminii printr-o prismă.",
    image: simulatorPrismaImg,
    caption: "Prisma",
  },
];

const SimulariPage = () => {
  // State for each slider
  const [currentSlides, setCurrentSlides] = useState(
    simulationsData.reduce((acc, simulation) => {
      acc[simulation.id] = 0;
      return acc;
    }, {})
  );

  const handlePrev = (simulationId) => {
    setCurrentSlides((prev) => {
      const simulation = simulationsData.find((s) => s.id === simulationId);
      if (!simulation) return prev;

      const currentIndex = prev[simulationId];
      const newIndex =
        currentIndex === 0
          ? simulation.slides.length - 1
          : currentIndex - 1;

      return { ...prev, [simulationId]: newIndex };
    });
  };

  const handleNext = (simulationId) => {
    setCurrentSlides((prev) => {
      const simulation = simulationsData.find((s) => s.id === simulationId);
      if (!simulation) return prev;

      const currentIndex = prev[simulationId];
      const newIndex =
        currentIndex === simulation.slides.length - 1 ? 0 : currentIndex + 1;

      return { ...prev, [simulationId]: newIndex };
    });
  };

  const goToSlide = (simulationId, index) => {
    setCurrentSlides((prev) => ({ ...prev, [simulationId]: index }));
  };

  return (
    <Layout>
      <div className="simulari-page">
        <main className="main-content">
          <h1>Simulări</h1>
          <p>Explorează concepte fizice prin intermediul simulărilor interactive.</p>

          <div className="simulations-grid">
            {simulationsData.map((simulation) => (
              <div key={simulation.id} className="simulation-card">
                <div className="card-content">
                  <h2>{simulation.title}</h2>
                  <p className="description">{simulation.description}</p>
                </div>
                <div className="image-container">
                  <div className="card-image active">
                    <img
                      src={simulation.image}
                      alt={simulation.caption}
                    />
                    <div className="caption">
                      {simulation.caption}
                    </div>
                  </div>
                </div>
                <button
                  className="start-simulation-btn"
                  onClick={() => {
                    // Deschide fiecare simulare în funcție de id
                    switch (simulation.id) {
                      case 1:
                        window.open(
                          "/simulari/Mix/Reprezentari3d.html",
                          "_blank"
                        );
                        break;
                      case 2:
                        window.open(
                          "/simulari/Mix/Oscilatie-amortizata.html",
                          "_blank"
                        );
                        break;
                      case 3:
                        window.open(
                          "/simulari/Mix/Pendul-amplitudine.html",
                          "_blank"
                        );
                        break;
                      case 4:
                        window.open(
                          "/simulari/Unde/simulator-unde.html",
                          "_blank"
                        );
                        break;
                      case 5:
                        window.open(
                          "/simulari/Figuri-Lissajous/grafice.html",
                          "_blank"
                        );
                        break;
                      case 6:
                        window.open(
                          "/simulari/Grafice-Armonice/index.html",
                          "_blank"
                        );
                        break;
                      case 7:
                        window.open(
                          "/simulari/Functii/functii1.html",
                          "_blank"
                        );
                        break;
                      case 8:
                        window.open(
                          "/simulari/Mix/grafice.html",
                          "_blank"
                        );
                        break;
                      case 9:
                        window.open(
                          "/simulari/Mix/Cutremur.html",
                          "_blank"
                        );
                        break;
                      case 10:
                        window.open(
                          "/simulari/prisma/prisma-simulator.html",
                          "_blank"
                        );
                        break;
                      default:
                        window.open(
                          "/simulari/prisma/prisma-simulator.html",
                          "_blank"
                        );
                    }
                  }}
                >
                  Începe simularea
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default SimulariPage;
