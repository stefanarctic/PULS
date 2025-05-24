import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./scss/components/SimulariPage.scss";

import simulatorPendulSimpluImg from "../public/res/screenshots/Simplu_Screenshot.png";
import simulatorPendulSimpluImg1 from "../public/res/screenshots/Simplu_Screenshot1.png";
import simulatorPendulAmortizatImg from "../public/res/screenshots/Amortizat_Screenshot.png";
import simulatorPendulAmortizatImg1 from "../public/res/screenshots/Amortizat_Screenshot1.png";
import simulatorPendulTrasnitImg from "../public/res/screenshots/Trasnit_Screenshot.png";
import simulatorPendulTrasnitImg1 from "../public/res/screenshots/Trasnit_Screenshot1.png";
import simulatorUndeImg from "../public/res/screenshots/Unde_Screenshot.png";
import simulatorUndeImg1 from "../public/res/screenshots/Unde_Screenshot2.png";
import simulatorLissajousImg from "../public/res/screenshots/Lissajous_Screenshot.png";
import simulatorLissajousImg1 from "../public/res/screenshots/Lissajous_Screenshot1.png";
import simulatorSeismtImg from "../public/res/screenshots/Seism_Screenshot.png";
import simulatorSeismtImg1 from "../public/res/screenshots/Seism_Screenshot1.png";
import simulatorPrismaImg from "../public/res/screenshots/Prisma_Screenshot.png";
import simulatorPrismaImg1 from "../public/res/screenshots/Prisma_Screenshot1.png";
import simulatorFunctiiImg from "../public/res/screenshots/Functii_Screenshot.png";
import simulatorFunctiiImg1 from "../public/res/screenshots/Functii_Screenshot1.png";
import simulatorGraficePendulImg from "../public/res/screenshots/Grafice_Pendule_Screenshot.png"; 
import simulatorGraficePendulImg1 from "../public/res/screenshots/Grafice_Pendule_Screenshot1.png";
import simulatorGraficeBasicImg from "../public/res/screenshots/Grafice_Basic_Screenshot.png";
import simulatorGraficeBasicImg1 from "../public/res/screenshots/Grafice_Basic_Screenshot1.png";

// Data for simulations
const simulationsData = [
  {
    id: 1,
    title: "Pendulul Oscilator Simplu",
    description: "Simularea mișcării oscilatorii armonice simple.",
    slides: [
      { 
        image: simulatorPendulSimpluImg, 
        caption: "Oscilație armonică simplă" 
      },
      { 
        image: simulatorPendulSimpluImg1, 
        caption: "Oscilație armonică simplă" 
      },
    ]
  },
  {
    id: 2,
    title: "Pendulul Oscilator Amortizat",
    description: "Simularea mișcării oscilatorii amortizate.",
    slides: [
      { 
        image: simulatorPendulAmortizatImg, 
        caption: "Oscilație amortizată" 
      },
      { 
        image: simulatorPendulAmortizatImg1,
        caption: "Oscilație amortizată"
      },
    ]
  },
   {
    id: 3,
    title: "Pendulul Mecanic",
    description: "Simularea mișcării oscilatorii mecanice.",
    slides: [
      { 
        image: simulatorPendulTrasnitImg,
        caption: "Oscilație mecanică" 
      },
      { 
        image: simulatorPendulTrasnitImg1,
        caption: "Oscilație mecanică"
      },
    ]
  },
  {
    id: 4,
    title: "Undele produse in apa",
    description: "Simulează propagarea undelor în apă.",
    slides: [
      { 
        image: simulatorUndeImg,
        caption: "Unde în apă" 
      },
      { 
        image: simulatorUndeImg1,
        caption: "Unde în apă" 
      },
    ]
  },
  {
    id: 5,
    title: "Figuri Lissajous",
    description: "Simulează figuri Lissajous în funcție de frecvențele oscilatorilor.",
    slides: [
      { 
        image: simulatorLissajousImg,
        caption: "Figuri Lissajous" 
      },
      { 
        image: simulatorLissajousImg1,
        caption: "Figuri Lissajous" 
      },
    ]
  },
    {
    id: 6,
    title: "Grafice Pendule",
    description: "Simulează graficele pentru diferite tipuri de pendule.",
    slides: [
      { 
        image: simulatorGraficePendulImg,
        caption: "Grafice Pendule"
      },
      { 
        image: simulatorGraficePendulImg1,
        caption: "Grafice Pendule"
      },
    ]
  },
   {
    id: 7,
    title: "Grafice Funcții",
    description: "Simulează graficele pentru diferite funcții.",
    slides: [
      { 
        image: simulatorFunctiiImg,
        caption: "Grafice Funcții"
      },
      { 
        image: simulatorFunctiiImg1,
        caption: "Grafice Funcții"
      },
    ]
  },
     {
    id: 8,
    title: "Grafice Simple",
    description: "Simulează graficele pentru diferite funcții simple.",
    slides: [
      { 
        image: simulatorGraficeBasicImg,
        caption: "Grafice Simple"
      },
      { 
        image: simulatorGraficeBasicImg1,
        caption: "Grafice Simple"
      },
    ]
  },
  {
    id: 9,
    title: "Seism",
    description: "Simulează un cutremur și efectele sale.",
    slides: [
      { 
        image: simulatorSeismtImg,
        caption: "Cutremur"
      },
      { 
        image: simulatorSeismtImg1,
        caption: "Cutremur"
      },
    ]
  },
   {
    id: 6,
    title: "Prisma",
    description: "Simulează dispersia luminii printr-o prismă.",
    slides: [
      { 
        image: simulatorPrismaImg,
        caption: "Prisma"
      },
      { 
        image: simulatorPrismaImg1,
        caption: "Prisma"
      },
    ]
  }
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
      const simulation = simulationsData.find(s => s.id === simulationId);
      if (!simulation) return prev;
      
      const currentIndex = prev[simulationId];
      const newIndex = currentIndex === 0 ? simulation.slides.length - 1 : currentIndex - 1;
      
      return { ...prev, [simulationId]: newIndex };
    });
  };

  const handleNext = (simulationId) => {
    setCurrentSlides((prev) => {
      const simulation = simulationsData.find(s => s.id === simulationId);
      if (!simulation) return prev;
      
      const currentIndex = prev[simulationId];
      const newIndex = currentIndex === simulation.slides.length - 1 ? 0 : currentIndex + 1;
      
      return { ...prev, [simulationId]: newIndex };
    });
  };

  const goToSlide = (simulationId, index) => {
    setCurrentSlides(prev => ({ ...prev, [simulationId]: index }));
  };

  return (
    <div className="simulari-page">
      <Navbar />
      
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
              <div className="slider-wrapper">
                <div className="slider-container">
                  {simulation.slides.map((slide, index) => (
                    <div 
                      key={index} 
                      className={`slide ${index === currentSlides[simulation.id] ? 'active' : ''}`}
                    >
                      <img src={slide.image} alt={slide.caption} />
                      <div className="caption">{slide.caption}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className="arrow left" 
                  onClick={() => handlePrev(simulation.id)}
                  aria-label="Slide anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="arrow right" 
                  onClick={() => handleNext(simulation.id)}
                  aria-label="Slide următor"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="indicators">
                  {simulation.slides.map((_, index) => (
                    <div 
                      key={index} 
                      className={`dot ${index === currentSlides[simulation.id] ? 'active' : ''}`}
                      onClick={() => goToSlide(simulation.id, index)}
                    />
                  ))}
                </div>
              </div>
              <button className="start-simulation-btn">Începe simularea</button>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SimulariPage;
