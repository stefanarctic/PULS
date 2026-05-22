import MathJaxRender from "@/components/MathJaxRender";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import Video1 from "/res/Videos/Pendul Video.mp4";
import Video2 from "/res/Videos/Frecventa Undelor Video.mp4";
import Video3 from "/res/Videos/Unde Videoclip.mp4";
import Video4 from "/res/Videos/Front Unda 1.mp4";
import Video5 from "/res/Videos/Front Unda 2.mp4";
import Video6 from "/res/Videos/Lissajous-Video-1.mp4";
import Thumbnail1 from "/res/Thumbnails/Pendul Video.png";
import Thumbnail2 from "/res/Thumbnails/Frecventa Undelor Video.png";
import Thumbnail3 from "/res/Thumbnails/Unde Videoclip.png";
import Thumbnail4 from "/res/Thumbnails/Front Unda 1.png";
import Thumbnail5 from "/res/Thumbnails/Front Unda 2.png";
import Thumbnail6 from "/res/Thumbnails/Lissajous-Video-1.png";
import Layout from "../Layout";
import { useEffect, useState, useMemo } from "react";
import VideoPopup from "../VideoPopup";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../SEO";
import { useAssistant } from "@/hooks/useAssistant";
import {
  ASTRONOMIE_FORMULAS_RO,
  ATOMUL_FORMULAS_RO,
  ELECTRICITATE_FORMULAS_RO,
  ELECTROMAGNETISM_FORMULAS_RO,
  FIZICA_CUANTICA_FORMULAS_RO,
  FIZICA_NUCLEARA_FORMULAS_RO,
  LASERE_FORMULAS_RO,
  LISSAJOUS_FORMULAS_RO,
  MATEMATICA_FORMULAS_RO,
  MECANICA_FORMULAS_RO,
  OPTICA_FORMULAS_RO,
  PENDULE_FORMULAS_RO,
  PRISMA_FORMULAS_RO,
  RELATIVITATE_FORMULAS_RO,
  SEISM_FORMULAS_RO,
  TERMODINAMICA_FORMULAS_RO,
  UNDE_FORMULAS_RO,
} from "@/data/resurseFormulasRo";
import { localizeFormulaSheet } from "@/i18n/formulaSheetOverlay";
import { useI18n } from "../../i18n/LanguageContext";


const lessonCards = [
  {
    title: "Pendule",
    description:
      "Descoperă mișcarea oscilatorie, formulele și simulări pentru pendulul simplu, amortizat și neliniar.",
    path: "/resurse/pendule",
  },
  {
    title: "Unde",
    description:
      "Află despre propagarea undelor mecanice și electromagnetice, tipuri de unde și simulări interactive.",
    path: "/resurse/unde",
  },
  {
    title: "Figuri Lissajous",
    description:
      "Explorează curbele Lissajous, ecuațiile parametrice și aplicațiile lor în fizică.",
    path: "/resurse/lissajous",
  },
  {
    title: "Seisme",
    description:
      "Învață despre cutremure, unde seismice, propagare și vizualizări interactive.",
    path: "/resurse/seism",
  },
  {
    title: "Termodinamică",
    description:
      "Învață despre termodinamică, principiile și aplicațiile ei în fizică.",
    path: "/resurse/termodinamica",
  },
  {
    title: "Mecanică",
    description:
      "Învață despre mecanică, principiile și aplicațiile ei în fizică.",
    path: "/resurse/mecanica",
  },
  {
    title: "Electricitate",
    description:
      "Explorează circuitele electrice, legile lui Ohm și Kirchhoff, energia electrică și câmpurile electrice.",
    path: "/resurse/electricitate",
  },
  {
    title: "Electromagnetism",
    description:
      "Câmp electric și magnetic, inducție, forța Lorentz, efectul Meissner și supraconductivitate în simulări interactive.",
    path: "/resurse/electromagnetism",
  },
  {
    title: "Optică",
    description:
      "Descoperă comportamentul luminii, refracția, reflexia, lentilele și fenomenele de interferență și difracție.",
    path: "/resurse/optica",
  },
  {
    title: "Lasere",
    description:
      "Principii de funcționare, formule pentru fascicule și pulsuri, context ELI-NP și trei simulatoare interactive dedicate laserelor.",
    path: "/resurse/lasere",
  },
  {
    title: "Matematică",
    description:
      "Funcții, grafice și vizualizator 4D. Explorează reprezentarea grafică a funcțiilor și geometria în spațiul cu patru dimensiuni.",
    path: "/resurse/matematica",
  },
  {
    title: "Astronomie",
    description:
      "Legile lui Kepler, mișcarea planetelor, gravitația și experimentul Michelson–Morley (lumină, eter, interferență).",
    path: "/resurse/astronomie",
  },
  {
    title: "Fizică cuantică",
    description:
      "Dublă fantă (interferență și probabilitate) și tunelare cuantică lecție, formule și simulatoare interactive.",
    path: "/resurse/fizica-cuantica",
  },
  {
    title: "Atomul",
    description:
      "Atomul de hidrogen (Bohr, Schrödinger, spectru) și tabelul periodic al elementelor, teorie și simulări.",
    path: "/resurse/atomul",
  },
  {
    title: "Fizică nucleară",
    description:
      "Izotopii uraniului (patru izotopi și harta celor 26), fisiune în lanț (U-235, factor k), model educativ de fuziune D–T (~17,6 MeV), apă grea D₂O vs H₂O, schimb izotopic și distilare fracționată — lecții, formule și simulatoare.",
    path: "/resurse/fizica-nucleara",
  },
];

const ResursePage = () => {
  const navigate = useNavigate();
  const assistant = useAssistant();
  const { t, lang, localizedPath } = useI18n();
  const FS = "resourcesPage.formulaSheet";
  const ES = "resourcesPage.experimentsSection";
  const BS = "resourcesPage.bibliographySection";
  const RS = "resourcesPage";

  // Localized lesson cards: maps the original Romanian title/description to its English counterpart from site.en.json.
  const lessonI18nMap = {
    'Pendule': 'pendulums',
    'Unde': 'waves',
    'Figuri Lissajous': 'lissajous',
    'Seisme': 'earthquakes',
    'Termodinamică': 'thermodynamics',
    'Mecanică': 'mechanics',
    'Electricitate': 'electricity',
    'Electromagnetism': 'electromagnetism',
    'Optică': 'optics',
    'Lasere': 'lasers',
    'Matematică': 'mathematics',
    'Astronomie': 'astronomy',
    'Fizică cuantică': 'quantumPhysics',
    'Atomul': 'atom',
    'Fizică nucleară': 'nuclearPhysics',
  };
  const translateLessonCard = (card) => {
    if (lang !== 'en') return card;
    const key = lessonI18nMap[card.title];
    if (!key) return card;
    return {
      ...card,
      title: t(`resourcesPage.lessons.${key}.title`, card.title),
      description: t(`resourcesPage.lessons.${key}.description`, card.description),
    };
  };

  const [activeTab, setActiveTab] = useState("lectii");
  const [activeFormulaTab, setActiveFormulaTab] = useState("mecanica");
  const [formulaPopup, setFormulaPopup] = useState(null); // { section, title, formula, explanation }

  const [searchParams] = useSearchParams();

  const ResurseVideos = useMemo(
    () => [
      { src: Video1, alt: t(`${ES}.videoAlts.pendulum`, "Video Pendul"), thumbnail: Thumbnail1 },
      {
        src: Video2,
        alt: t(`${ES}.videoAlts.waveFrequency`, "Video Frecvența Undelor"),
        thumbnail: Thumbnail2,
      },
      { src: Video3, alt: t(`${ES}.videoAlts.waves`, "Video Unde"), thumbnail: Thumbnail3 },
      { src: Video4, alt: t(`${ES}.videoAlts.wavefront1`, "Video Front Undă 1"), thumbnail: Thumbnail4 },
      { src: Video5, alt: t(`${ES}.videoAlts.wavefront2`, "Video Front Undă 2"), thumbnail: Thumbnail5 },
      { src: Video6, alt: t(`${ES}.videoAlts.lissajous`, "Video Lissajous"), thumbnail: Thumbnail6 },
    ],
    [t]
  );

  const formulaSheets = useMemo(() => {
    const base = {
      mecanica: MECANICA_FORMULAS_RO,
      termodinamica: TERMODINAMICA_FORMULAS_RO,
      seism: SEISM_FORMULAS_RO,
      unde: UNDE_FORMULAS_RO,
      prisma: PRISMA_FORMULAS_RO,
      pendule: PENDULE_FORMULAS_RO,
      lissajous: LISSAJOUS_FORMULAS_RO,
      electricitate: ELECTRICITATE_FORMULAS_RO,
      electromagnetism: ELECTROMAGNETISM_FORMULAS_RO,
      optica: OPTICA_FORMULAS_RO,
      lasere: LASERE_FORMULAS_RO,
      matematica: MATEMATICA_FORMULAS_RO,
      astronomie: ASTRONOMIE_FORMULAS_RO,
      atomul: ATOMUL_FORMULAS_RO,
      fizica_cuantica: FIZICA_CUANTICA_FORMULAS_RO,
      fizica_nucleara: FIZICA_NUCLEARA_FORMULAS_RO,
      relativitate: RELATIVITATE_FORMULAS_RO,
    };
    if (lang !== 'en') return base;
    return Object.fromEntries(
      Object.entries(base).map(([k, ro]) => [k, localizeFormulaSheet(ro, lang)])
    );
  }, [lang]);


  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const formulaParam = searchParams.get("formula");

    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (formulaParam) {
      const allowed = [
        "mecanica",
        "termodinamica",
        "seism",
        "unde",
        "prisma",
        "pendule",
        "lissajous",
        "electricitate",
        "electromagnetism",
        "optica",
        "lasere",
        "matematica",
        "astronomie",
        "atomul",
        "fizica_cuantica",
        "fizica_nucleara",
        "relativitate",
      ];
      if (allowed.includes(formulaParam)) {
        setActiveFormulaTab(formulaParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typeset()
    }
  }, []);

  // Închide popup formula la Escape, blochează scroll pe body
  useEffect(() => {
    if (!formulaPopup) return;
    const handleEscape = (e) => e.key === "Escape" && setFormulaPopup(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [formulaPopup]);

  return (
    <Layout>
      {formulaPopup && (
        <div className="formula-popup-overlay" onClick={() => setFormulaPopup(null)}>
          <div className="formula-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="formula-popup-header">
              <div className="formula-popup-header-left">
                <h2 className="formula-popup-title">{formulaPopup.title}</h2>
                <span className="formula-popup-section">{formulaPopup.section}</span>
              </div>
              <button type="button" className="formula-popup-close" onClick={() => setFormulaPopup(null)} aria-label={t(`${FS}.closePopup`, "Închide")}>×</button>
            </div>
            <div className="formula-popup-body">
              <div className="formula-popup-formula">{formulaPopup.formula}</div>
              <p className="formula-popup-explanation">{formulaPopup.explanation}</p>
              <button
                type="button"
                className="formula-popup-ai-btn"
                onClick={() => {
                  const msg = t(
                    `${FS}.whizUserMessage`,
                    'Explică-mi în detaliu formula „{title}" din {section}. Vreau să înțeleg când și cum se aplică, cu exemple.',
                    { title: formulaPopup.title, section: formulaPopup.section }
                  );
                  setFormulaPopup(null);
                  if (assistant?.openWithMessage) {
                    assistant.openWithMessage(msg);
                  }
                }}
              >
                {t(`${FS}.askProfessorWhiz`, "Întreabă Profesorul Whiz")}
              </button>
            </div>
            <MathJaxRender key={`popup-${formulaPopup.title}`} />
          </div>
        </div>
      )}
      <SEO
        title={t(`${RS}.seo.title`, "Resurse Educaționale Fizică | PULS - Materiale Teoretice și Video-uri")}
        description={t(
          `${RS}.seo.description`,
          "Resurse educaționale complete pentru fizică: materiale teoretice, video-uri, formule și explicații pentru mecanică, termodinamică, electricitate, electromagnetism, optică, lasere și multe altele."
        )}
        keywords={t(
          `${RS}.seo.keywords`,
          "resurse fizica, formule fizica, electromagnetism, supraconductivitate, meissner, termodinamica, mecanica, optica, lasere"
        )}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-page">
        <main>
          <h1 className="resurse-title">{t(`${RS}.page.title`, "Resurse")}</h1>

          <div className="resurse-description">
            <p>
              {t(
                `${RS}.page.intro`,
                "Accesează materiale educaționale pentru studiul fizicii, categorizate după nivelul de dificultate și tipul de conținut."
              )}
            </p>
          </div>

          <Tabs defaultValue="lectii" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger key="lectii" value="lectii">{t('resourcesPage.tabs.lessons', 'Lecții')}</TabsTrigger>
              <TabsTrigger key="formule" value="formule">{t('resourcesPage.tabs.formulas', 'Formule')}</TabsTrigger>
              <TabsTrigger key="experimente" value="experimente">{t('resourcesPage.tabs.experiments', 'Experimente')}</TabsTrigger>
              <TabsTrigger key="bibliografie" value="bibliografie">{t('resourcesPage.tabs.bibliography', 'Bibliografie')}</TabsTrigger>
            </TabsList>

            <TabsContent key="formule" value="formule">
              <div className="rounded-container">
                <h2 className="resurse-section-title">{t(`${FS}.title`, "Formule esențiale în fizică")}</h2>
                <p className="text-muted-foreground mb-4">{t(`${FS}.chooseCategory`, "Alege o categorie pentru a vedea formulele corespunzătoare.")}</p>

                <Tabs defaultValue="mecanica" value={activeFormulaTab} onValueChange={setActiveFormulaTab}>
                  <TabsList className="mb-4 flex flex-wrap gap-1">
                    <TabsTrigger value="mecanica">{t(`${FS}.categories.mecanica`, "Mecanică")}</TabsTrigger>
                    <TabsTrigger value="termodinamica">{t(`${FS}.categories.termodinamica`, "Termodinamică")}</TabsTrigger>
                    <TabsTrigger value="pendule">{t(`${FS}.categories.pendule`, "Oscilații")}</TabsTrigger>
                    <TabsTrigger value="unde">{t(`${FS}.categories.unde`, "Unde")}</TabsTrigger>
                    <TabsTrigger value="lissajous">{t(`${FS}.categories.lissajous`, "Lissajous")}</TabsTrigger>
                    <TabsTrigger value="seism">{t(`${FS}.categories.seism`, "Seisme")}</TabsTrigger>
                    <TabsTrigger value="optica">{t(`${FS}.categories.optica`, "Optică")}</TabsTrigger>
                    <TabsTrigger value="lasere">{t(`${FS}.categories.lasere`, "Lasere")}</TabsTrigger>
                    <TabsTrigger value="prisma">{t(`${FS}.categories.prisma`, "Refracție")}</TabsTrigger>
                    <TabsTrigger value="electricitate">{t(`${FS}.categories.electricitate`, "Electricitate")}</TabsTrigger>
                    <TabsTrigger value="electromagnetism">{t(`${FS}.categories.electromagnetism`, "Electromagnetism")}</TabsTrigger>
                    <TabsTrigger value="matematica">{t(`${FS}.categories.matematica`, "Matematică")}</TabsTrigger>
                    <TabsTrigger value="astronomie">{t(`${FS}.categories.astronomie`, "Astronomie")}</TabsTrigger>
                    <TabsTrigger value="atomul">{t(`${FS}.categories.atomul`, "Atomul")}</TabsTrigger>
                    <TabsTrigger value="fizica_cuantica">{t(`${FS}.categories.fizica_cuantica`, "Fizică cuantică")}</TabsTrigger>
                    <TabsTrigger value="fizica_nucleara">{t(`${FS}.categories.fizica_nucleara`, "Fizică nucleară")}</TabsTrigger>
                    <TabsTrigger value="relativitate">{t(`${FS}.categories.relativitate`, "Relativitate")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="mecanica">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.mecanica.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="mecanica" />
                  </TabsContent>

                  <TabsContent value="termodinamica">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.termodinamica.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="termodinamica" />
                  </TabsContent>

                  <TabsContent value="seism">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.seism.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="seism" />
                  </TabsContent>

                  <TabsContent value="unde">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.unde.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="unde" />
                  </TabsContent>

                  <TabsContent value="prisma">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.prisma.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="prisma" />
                  </TabsContent>

                  <TabsContent value="pendule">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.pendule.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="pendule" />
                  </TabsContent>

                  <TabsContent value="lissajous">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.lissajous.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="lissajous" />
                  </TabsContent>

                  <TabsContent value="electricitate">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.electricitate.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="electricitate" />
                  </TabsContent>

                  <TabsContent value="electromagnetism">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.electromagnetism.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="electromagnetism" />
                  </TabsContent>

                  <TabsContent value="optica">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.optica.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="optica" />
                  </TabsContent>

                  <TabsContent value="lasere">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.lasere.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="lasere" />
                  </TabsContent>

                  <TabsContent value="matematica">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.matematica.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="matematica" />
                  </TabsContent>

                  <TabsContent value="astronomie">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.astronomie.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="astronomie-sections" />
                  </TabsContent>

                  <TabsContent value="atomul">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.atomul.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="atomul-sections" />
                  </TabsContent>

                  <TabsContent value="fizica_cuantica">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.fizica_cuantica.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })
                                }
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="fizica_cuantica" />
                  </TabsContent>

                  <TabsContent value="fizica_nucleara">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.fizica_nucleara.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })
                                }
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="fizica_nucleara" />
                  </TabsContent>

                  <TabsContent value="relativitate">
                    <p className="text-sm text-muted-foreground mb-4">{t(`${FS}.clickForExplanation`, "Apasă pe o formulă pentru explicație detaliată.")}</p>
                    <div className="mb-4 space-y-6">
                      {formulaSheets.relativitate.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="relativitate" />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Physics lessons */}
            <TabsContent key="lectii" value="lectii">
              <div className="rounded-container">
                <h2 className="resurse-section-title">{t('resourcesPage.tabs.lessons', 'Lecții de fizică')}</h2>
                <div className="formula-grid">
                  {lessonCards.map((card) => {
                    const localized = translateLessonCard(card);
                    const { title, description, path } = localized;
                    return (
                      <div
                        key={path}
                        className="formula-card resurse-lesson-card"
                        role="button"
                        tabIndex={0}
                        aria-label={`${t('common.open', 'Deschide')} ${title}`}
                        onClick={() => navigate(localizedPath(path))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(localizedPath(path));
                          }
                        }}
                      >
                        <h3 className="text-xl font-semibold mb-2">{title}</h3>
                        <p className="text-muted-foreground mb-2">{description}</p>
                        <span className="resurse-link resurse-lesson-link">
                          {t('common.readLesson', 'Citește lecția')}
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Experimente practice */}
            <TabsContent key="experimente" value="experimente">
              <div className="rounded-container">
                <h2 className="resurse-section-title">{t(`${ES}.title`, "Experimente practice")}</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {t(
                    `${ES}.intro`,
                    "Vizualizează experimente video pentru a înțelege mai bine fenomenele fizice prezentate."
                  )}
                </p>
                <div className="experimente-video-grid">
                  <div className="experiment-card">
                    <h3 className="experiment-title">{t(`${ES}.cards.harmonic.title`, "Oscilaţii armonice")}</h3>
                    <p className="experiment-desc">
                      {t(
                        `${ES}.cards.harmonic.description`,
                        "Observă cum se comportă un pendul simplu în mișcare oscilatorie."
                      )}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[0].src}
                      alt={ResurseVideos[0].alt}
                      thumbnail={ResurseVideos[0].thumbnail}
                      title={t(`${ES}.cards.harmonic.videoTitle`, "Pendulul simplu (experiment video)")}
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">
                      {t(`${ES}.cards.standingWave.title`, "Unde Stationare in coarda vibranta")}
                    </h3>
                    <p className="experiment-desc">
                      {t(
                        `${ES}.cards.standingWave.description`,
                        "Explorează formarea undelor stationare într-o coardă vibrată."
                      )}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[1].src}
                      alt={ResurseVideos[1].alt}
                      thumbnail={ResurseVideos[1].thumbnail}
                      title={t(
                        `${ES}.cards.standingWave.videoTitle`,
                        "Unde Stationare in coarda vibranta (experiment video)"
                      )}
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">{t(`${ES}.cards.soundTube.title`, "Tub sonor - frecvenţa fundamentală")}</h3>
                    <p className="experiment-desc">
                      {t(
                        `${ES}.cards.soundTube.description`,
                        "Demonstrează cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală."
                      )}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[2].src}
                      alt={ResurseVideos[2].alt}
                      thumbnail={ResurseVideos[2].thumbnail}
                      title={t(
                        `${ES}.cards.soundTube.videoTitle`,
                        "Tub sonor - frecvenţa fundamentală (experiment video)"
                      )}
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">{t(`${ES}.cards.wavefront.title`, "Frontul de Unda")}</h3>
                    <p className="experiment-desc">
                      {t(`${ES}.cards.wavefront.description`, "Observă cum se propagă frontul de undă în apa.")}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[3].src}
                      alt={ResurseVideos[3].alt}
                      thumbnail={ResurseVideos[3].thumbnail}
                      title={t(`${ES}.cards.wavefront.videoTitle`, "Frontul de Unda (experiment video)")}
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">{t(`${ES}.cards.wavefront.title`, "Frontul de Unda")}</h3>
                    <p className="experiment-desc">
                      {t(`${ES}.cards.wavefront.description`, "Observă cum se propagă frontul de undă în apa.")}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[4].src}
                      alt={ResurseVideos[4].alt}
                      thumbnail={ResurseVideos[4].thumbnail}
                      title={t(`${ES}.cards.wavefront.videoTitle`, "Frontul de Unda (experiment video)")}
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">{t(`${ES}.cards.lissajous.title`, "Figuri Lissajous")}</h3>
                    <p className="experiment-desc">
                      {t(
                        `${ES}.cards.lissajous.description`,
                        "Explorează cum se formează figurile Lissajous prin oscilații perpendiculare."
                      )}
                    </p>
                    <VideoPopup
                      src={ResurseVideos[5].src}
                      alt={ResurseVideos[5].alt}
                      thumbnail={ResurseVideos[5].thumbnail}
                      title={t(`${ES}.cards.lissajous.videoTitle`, "Figuri Lissajous (experiment video)")}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent key="bibliografie" value="bibliografie">
              <div className="rounded-container">
                <h2 className="resurse-section-title">{t(`${BS}.title`, "Bibliografie recomandată")}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="resurse-section-subtitle">{t(`${BS}.textbooks`, "Manuale")}</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <strong>{t(`${BS}.manualGherbanovschiStrong`, "Fizică manual pentru clasa a XI-a")}</strong>
                        {", "}
                        {t(
                          `${BS}.manualGherbanovschiRest`,
                          "Autori: Cleopatra Gherbanovschi , Nicolae Gherbanovschi."
                        )}
                      </li>
                      <li>
                        <strong>{t(`${BS}.manualPaunStrong`, "Fizică manual pentru clasa a XI-a (M1/M2)")}</strong>
                        {", "}
                        {t(`${BS}.manualPaunRest`, "Autori: Cristian Păun, Marius Burtea.")}
                      </li>
                      <li>
                        <strong>{t(`${BS}.culegereStrong`, "Culegere de probleme de fizică. Clasa a XI-a")}</strong>
                        {", "}
                        {t(`${BS}.culegereRest`, "Autor: Florin Grigore, Editura Paralela 45")}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="resurse-section-subtitle">{t(`${BS}.furtherReading`, "Cărți pentru aprofundare")}</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <strong>{t(`${BS}.povestitaStrong`, "Fizica povestită")}</strong>
                        {", "}
                        {t(`${BS}.povestitaRest`, "Autor: Cristian Presură")}
                      </li>
                      <li>
                        <strong>{t(`${BS}.principiaStrong`, "Principia Mathematica")}</strong>
                        {", "}
                        {t(`${BS}.principiaRest`, "Autor: Isaac Newton")}
                      </li>
                      <li>
                        <strong>{t(`${BS}.feynmanStrong`, "Șase lecții ușoare")}</strong>
                        {", "}
                        {t(`${BS}.feynmanRest`, "Autor: Richard Feynman")}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="resurse-section-subtitle">{t(`${BS}.online`, "Resurse online")}</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <a href="https://www.khanacademy.org" className="resurse-link">
                          {t(`${BS}.linkKhan`, "Khan Academy - Fizică")}
                        </a>
                      </li>
                      <li>
                        <a href="https://phet.colorado.edu" className="resurse-link">
                          {t(`${BS}.linkPhet`, "PhET Interactive Simulations")}
                        </a>
                      </li>
                      <li>
                        <a href="https://www.physics.org" className="resurse-link">
                          {t(`${BS}.linkPhysicsOrg`, "Physics.org")}
                        </a>
                      </li>
                      <li>
                        <a href="https://manuale.edu.ro/" className="resurse-link">
                          {t(`${BS}.linkManuale`, "Manuale.edu.ro - Resurse educaționale")}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default ResursePage;
