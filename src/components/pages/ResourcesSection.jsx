import { BookOpen, Waves, Activity, Thermometer, Cog, Radio, Zap, Eye } from "lucide-react";
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
import electricityLight from "/res/resources-section/mecanica_light.webp"; // Placeholder - va trebui înlocuit cu imagine reală
import electricityDark from "/res/resources-section/mecanica_dark.webp"; // Placeholder - va trebui înlocuit cu imagine reală
import opticsLight from "/res/resources-section/termodinamica_light.webp"; // Placeholder - va trebui înlocuit cu imagine reală
import opticsDark from "/res/resources-section/termodinamica_dark.webp"; // Placeholder - va trebui înlocuit cu imagine reală
import "/src/scss/components/_resources-section-landing.scss"; // Import the SCSS stylesheet
import { LocalizedLink as Link, useI18n } from "../../i18n/LanguageContext";

const resources = [
  {
    i18nKey: "pendulum",
    title: "Pendulul",
    description:
      "Descoperă mișcarea oscilatorie, formulele perioadei și aplicațiile pendulului în măsurarea timpului.",
    imageLight: pendulumLight,
    imageDark: pendulumDark,
    icon: <Activity className="resource-icon" />,
    experimentPath: "/resurse/pendule",
    formulaCategory: "pendule",
  },
  {
    i18nKey: "waves",
    title: "Unde",
    description:
      "Află despre unde mecanice și electromagnetice, interferență, difracție și aplicații practice.",
    imageLight: wavesLight,
    imageDark: wavesDark,
    icon: <Waves className="resource-icon" />,
    experimentPath: "/resurse/unde",
    formulaCategory: "unde",
  },
  {
    i18nKey: "lissajous",
    title: "Figuri Lissajous",
    description:
      "Explorează curbe armonice suprapuse, vizualizări matematice și oscilații perpendiculare.",
    imageLight: lissajousLight,
    imageDark: lissajousDark,
    icon: <Radio className="resource-icon" />,
    experimentPath: "/resurse/lissajous",
    formulaCategory: "lissajous",
  },
  {
    i18nKey: "thermodynamics",
    title: "Termodinamică",
    description:
      "Studiază transferul de căldură, legile termodinamicii și transformările energetice.",
    imageLight: thermodynamicsLight,
    imageDark: thermodynamicsDark,
    icon: <Thermometer className="resource-icon" />,
    experimentPath: "/resurse/termodinamica",
    formulaCategory: "termodinamica",
  },
  {
    i18nKey: "mechanics",
    title: "Mecanică",
    description:
      "Înțelege mișcarea corpurilor, forțele, energia cinetică și potențială, și legile lui Newton.",
    imageLight: mechanicsLight,
    imageDark: mechanicsDark,
    icon: <Cog className="resource-icon" />,
    experimentPath: "/resurse/mecanica",
    formulaCategory: "mecanica",
  },
  {
    i18nKey: "earthquake",
    title: "Seism",
    description:
      "Analizează undele seismice, propagarea lor prin straturile Pământului și detectarea cutremurelor.",
    imageLight: seismicLight,
    imageDark: seismicDark,
    icon: <Activity className="resource-icon" />,
    experimentPath: "/resurse/seism",
    formulaCategory: "seism",
  },
  {
    i18nKey: "electricity",
    title: "Electricitate",
    description:
      "Explorează circuitele electrice, legile lui Ohm și Kirchhoff, energia electrică și câmpurile electrice.",
    imageLight: electricityLight,
    imageDark: electricityDark,
    icon: <Zap className="resource-icon" />,
    experimentPath: "/resurse/electricitate",
    formulaCategory: "electricitate",
  },
  {
    i18nKey: "electromagnetism",
    title: "Electromagnetism",
    description:
      "Câmp electric și magnetic, inducție, forța Lorentz și efectul Meissner prin simulări interactive.",
    imageLight: electricityLight,
    imageDark: electricityDark,
    icon: <Zap className="resource-icon" />,
    experimentPath: "/resurse/electromagnetism",
    formulaCategory: "electromagnetism",
  },
  {
    i18nKey: "optics",
    title: "Optică",
    description:
      "Descoperă comportamentul luminii, refracția, reflexia, lentilele și fenomenele de interferență și difracție.",
    imageLight: opticsLight,
    imageDark: opticsDark,
    icon: <Eye className="resource-icon" />,
    experimentPath: "/resurse/optica",
    formulaCategory: "optica",
  },
];

const ResourcesSection = () => {
  const isDarkMode = useDarkMode();
  const { t } = useI18n();

  return (
    <section className="resources-section">
      <div className="container">
        {/* Header with book decoration */}
        <div className="resources-header">
          {/* Decorative book icon */}
          <div className="book-icon-wrapper">
            <BookOpen className="book-icon" />
          </div>
          <h2 className="resources-title">{t('resourcesSection.title', 'Resurse didactice')}</h2>
          <p className="resources-description">
            {t('resourcesSection.description', 'Explorează lecții teoretice, formule esențiale, experimente practice și bibliografie recomandată pentru a-ți aprofunda cunoștințele de fizică.')}
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
            const translatedResource = {
              ...resource,
              title: t(`resourcesSection.cards.${resource.i18nKey}.title`, resource.title),
              description: t(`resourcesSection.cards.${resource.i18nKey}.description`, resource.description),
            };
            return (
              <ResourceCard
                key={resource.title}
                {...translatedResource}
                image={image}
                delay={index * 100}
              />
            );
          })}
        </div>
        {/* View all button */}
        <div className="resources-footer">
          <Link to="/resurse" className="view-all-btn">
            <BookOpen className="view-all-icon" />
            {t('resourcesSection.viewAll', 'Vezi toate resursele')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;