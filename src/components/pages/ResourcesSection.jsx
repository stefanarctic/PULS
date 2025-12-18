import { BookOpen, Waves, Activity, Thermometer, Cog, Radio } from "lucide-react";
import ResourceCard from "./ResourceCard";
import useDarkMode from "../../hooks/useDarkMode";
import pendulumLight from "/res/resources-section/pendule_light.webp";
import pendulumDark from "/res/resources-section/pendule_dark.webp";
import wavesLight from "/res/resources-section/unde_light.webp";
import wavesDark from "/res/resources-section/unde_dark.webp";
import lissajousLight from "/res/resources-section/lissajous_light.webp";
import lissajousDark from "/res/resources-section/lissajous_dark.webp";
import thermodynamicsLight from "/res/resources-section/termodinamica_light.webp";
import thermodynamicsDark from "/res/resources-section/termodinamica_dark.webp";
import mechanicsLight from "/res/resources-section/mecanica_light.webp";
import mechanicsDark from "/res/resources-section/mecanica_dark.webp";
import seismicLight from "/res/resources-section/seism_light.webp";
import seismicDark from "/res/resources-section/seism_dark.webp";
import "/src/scss/components/_resources-section-landing.scss"; // Import the SCSS stylesheet

const resources = [
  {
    title: "Pendulul",
    description: "Descoperă mișcarea oscilatorie, formulele perioadei și aplicațiile pendulului în măsurarea timpului.",
    imageLight: pendulumLight,
    imageDark: pendulumDark,
    icon: <Activity className="resource-icon" />,
  },
  {
    title: "Unde",
    description: "Află despre unde mecanice și electromagnetice, interferență, difracție și aplicații practice.",
    imageLight: wavesLight,
    imageDark: wavesDark,
    icon: <Waves className="resource-icon" />,
  },
  {
    title: "Figuri Lissajous",
    description: "Explorează curbe armonice suprapuse, vizualizări matematice și oscilații perpendiculare.",
    imageLight: lissajousLight,
    imageDark: lissajousDark,
    icon: <Radio className="resource-icon" />,
  },
  {
    title: "Termodinamică",
    description: "Studiază transferul de căldură, legile termodinamicii și transformările energetice.",
    imageLight: thermodynamicsLight,
    imageDark: thermodynamicsDark,
    icon: <Thermometer className="resource-icon" />,
  },
  {
    title: "Mecanică",
    description: "Înțelege mișcarea corpurilor, forțele, energia cinetică și potențială, și legile lui Newton.",
    imageLight: mechanicsLight,
    imageDark: mechanicsDark,
    icon: <Cog className="resource-icon" />,
  },
  {
    title: "Seism",
    description: "Analizează undele seismice, propagarea lor prin straturile Pământului și detectarea cutremurelor.",
    imageLight: seismicLight,
    imageDark: seismicDark,
    icon: <Activity className="resource-icon" />,
  },
];

const ResourcesSection = () => {
  const isDarkMode = useDarkMode();

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
          {resources.map((resource, index) => {
            const image = isDarkMode ? resource.imageDark : resource.imageLight;
            return (
              <ResourceCard
                key={resource.title}
                {...resource}
                image={image}
                delay={index * 100}
              />
            );
          })}
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