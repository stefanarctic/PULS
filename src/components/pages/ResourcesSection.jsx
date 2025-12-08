import { BookOpen, Waves, Activity, Thermometer, Cog, Radio } from "lucide-react";
import ResourceCard from "./ResourceCard";
import pendulumImg from "/res/resources-section/pendulum.png";
import wavesImg from "/res/resources-section/waves.png";
import lissajousImg from "/res/resources-section/lissajous.png";
import thermodynamicsImg from "/res/resources-section/thermodynamics.png";
import mechanicsImg from "/res/resources-section/mechanics.png";
import seismicImg from "/res/resources-section/seismic.png";
import "/src/scss/components/_resources-section-landing.scss"; // Import the SCSS stylesheet

const resources = [
  {
    title: "Pendulul",
    description: "Descoperă mișcarea oscilatorie, formulele perioadei și aplicațiile pendulului în măsurarea timpului.",
    image: pendulumImg,
    icon: <Activity className="resource-icon" />,
  },
  {
    title: "Unde",
    description: "Află despre unde mecanice și electromagnetice, interferență, difracție și aplicații practice.",
    image: wavesImg,
    icon: <Waves className="resource-icon" />,
  },
  {
    title: "Figuri Lissajous",
    description: "Explorează curbe armonice suprapuse, vizualizări matematice și oscilații perpendiculare.",
    image: lissajousImg,
    icon: <Radio className="resource-icon" />,
  },
  {
    title: "Termodinamică",
    description: "Studiază transferul de căldură, legile termodinamicii și transformările energetice.",
    image: thermodynamicsImg,
    icon: <Thermometer className="resource-icon" />,
  },
  {
    title: "Mecanică",
    description: "Înțelege mișcarea corpurilor, forțele, energia cinetică și potențială, și legile lui Newton.",
    image: mechanicsImg,
    icon: <Cog className="resource-icon" />,
  },
  {
    title: "Seism",
    description: "Analizează undele seismice, propagarea lor prin straturile Pământului și detectarea cutremurelor.",
    image: seismicImg,
    icon: <Activity className="resource-icon" />,
  },
];

const ResourcesSection = () => {
  return (
    <section className="resources-section">
      <div className="container">
        {/* Header with book decoration */}
        <div className="resources-header">
          {/* Decorative book icon */}
          <div className="book-icon-wrapper">
            <BookOpen className="book-icon" />
          </div>
          <h2 className="resources-title">Resurse didactice</h2>
          <p className="resources-description">
            Explorează lecții teoretice, formule esențiale, experimente practice și bibliografie recomandată pentru a-ți aprofunda cunoștințele de fizică.
          </p>
          {/* Decorative line */}
          <div className="resources-decorative-line">
            <div className="line-left" />
            <div className="line-dot" />
            <div className="line-right" />
          </div>
        </div>
        {/* Resource cards grid */}
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <ResourceCard key={resource.title} {...resource} delay={index * 100} />
          ))}
        </div>
        {/* View all button */}
        <div className="resources-footer">
          <button className="view-all-btn">
            <BookOpen className="view-all-icon" />
            Vezi toate resursele
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;