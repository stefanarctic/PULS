import { Button } from "../../Button";
import { useEffect, useState, useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";

import seismicWaveAnimation from "/res/screenshots/Seism_Screenshot.png";
import Layout from "../../Layout";
import SEO from "../../SEO";
import { useI18n } from "@/i18n/LanguageContext";
import { pickSimulationThumb } from "@/lib/simulationScreenshots";

const SeismePage = () => {
  const { t, localizedPath, lang } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const seismFormulas = useMemo(
    () => [
      {
        formula: "\\( v_P = \\frac{d}{t_P}\\)",
        title: t("resourcesPage.lessonPages.earthquakes.formulas.vpTime", "Formula pentru viteza undelor P"),
      },
      {
        formula: "\\( v_S = \\frac{d}{t_S}\\)",
        title: t("resourcesPage.lessonPages.earthquakes.formulas.vsTime", "Formula pentru viteza undelor S"),
      },
      {
        formula: "\\( v_P = \\sqrt{\\frac{K + \\frac{4}{3}G}{\\rho}} \\)",
        title: t("resourcesPage.lessonPages.earthquakes.formulas.vpElastic", "Viteza undelor P în mediu elastic"),
      },
      {
        formula: "\\( v_S = \\sqrt{\\frac{G}{\\rho}} \\)",
        title: t("resourcesPage.lessonPages.earthquakes.formulas.vsElastic", "Viteza undelor S în mediu elastic"),
      },
      {
        formula: "\\( M_L = \\log_{10} A - \\log_{10} A_0 \\)",
        title: t("resourcesPage.lessonPages.earthquakes.formulas.richter", "Magnitudinea Richter"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const totalFormulas = seismFormulas.length;
    if (totalFormulas === 0) return;

    setVisibleFormulasCount((prev) => {
      if (!prev.seism && totalFormulas > 0) {
        return {
          ...prev,
          seism: Math.min(5, totalFormulas),
        };
      }
      return prev;
    });

    let intervalId = null;

    intervalId = setInterval(() => {
      setVisibleFormulasCount((prev) => {
        const currentVisible = prev.seism || 0;
        if (currentVisible < totalFormulas) {
          const batchSize = 5;
          const newCount = Math.min(currentVisible + batchSize, totalFormulas);
          if (newCount >= totalFormulas && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return {
            ...prev,
            seism: newCount,
          };
        }
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return prev;
      });
    }, 100);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [seismFormulas]);

  const seismImages = [
    { src: seismicWaveAnimation, alt: t("resourcesPage.lessonPages.earthquakes.altSim", "Simulare Seisme") },
  ];

  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  const modelDescription = t(
    "resourcesPage.lessonPages.earthquakes.modelDescription",
    "🌀🌏〰Reprezentare Seism\n🔁 Poți apasa stanga drepta pentru a te misca\n🔁Poti apasa Enter pentru a vedea urmatoarea figura"
  );

  return (
    <Layout>
      <SEO
        title={t("resourcesPage.lessonPages.earthquakes.seo.title", "Resurse Seisme | Unde seismice - PULS")}
        description={t(
          "resourcesPage.lessonPages.earthquakes.seo.description",
          "Învață despre cutremure, unde seismice P și S, magnitudinea Richter și propagarea undelor. Teorie, formule și simulări."
        )}
        keywords={t("resourcesPage.lessonPages.earthquakes.seo.keywords", "seisme, cutremure, unde seismice, magnitudine Richter, PULS")}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("resourcesPage.lessonPages.earthquakes.title", "Seisme")}
            </h1>
            <div className="max-w-3xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.earthquakes.p1",
                  "Un cutremur este un eveniment brusc și violent care are loc în interiorul Pământului, rezultând unde seismice."
                )}
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                {t(
                  "resourcesPage.lessonPages.earthquakes.p2",
                  "Cutremurele sunt cauzate de eliberarea bruscă de energie în scoarța terestră, generând unde seismice care se propagă prin Pământ."
                )}
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                {t(
                  "resourcesPage.lessonPages.earthquakes.p3",
                  "Aceste unde pot fi detectate de seismografe și pot fi folosite pentru a studia structura internă a Pământului."
                )}
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                {t(
                  "resourcesPage.lessonPages.earthquakes.p4",
                  "Simulările noastre oferă o reprezentare vizuală a modului în care undele seismice se propagă și interacționează cu diferite medii."
                )}
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.earthquakes.simTitle", "Simulare de seisme")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("resourcesPage.lessonPages.earthquakes.simP", "Animație a undelor seismice generate în timpul unui cutremur.")}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(seismImages[0].src, "seism", lang)}
                    alt={seismImages[0].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("resourcesPage.lessonPages.earthquakes.characteristicsHeading", "Caracteristici:")}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t("resourcesPage.lessonPages.earthquakes.c1", "Undele seismice se propagă prin interiorul Pământului")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c2", "Există diferite tipuri de unde seismice (P, S, L, R)")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c3", "Seismografele înregistrează aceste unde")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c4", "Undele secundare S(latitudinale) si undele primare P(longitudinale)")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c5", "Undele de suprafață (L și R) provoacă cele mai mari distrugeri la suprafața solului")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c6", "Viteza de propagare a undelor P este mai mare decât a undelor S")}</li>
                      <li>{t("resourcesPage.lessonPages.earthquakes.c7", "Undele S nu se propagă prin lichide, spre deosebire de undele P")}</li>
                    </ul>
                    <div className="mt-6">
                      {seismFormulas
                        .slice(0, visibleFormulasCount.seism || seismFormulas.length)
                        .map((item, index) => (
                          <div key={index}>
                            {index === 0 && (
                              <>
                                <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                                <div className="formula-resurse text-lg font-mono">{item.formula}</div>
                              </>
                            )}
                            {index === 1 && (
                              <>
                                <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                                <div className="formula-resurse text-lg font-mono">{item.formula}</div>
                                <p className="text-muted-foreground mt-2">
                                  {t(
                                    "resourcesPage.lessonPages.earthquakes.pWaveTravelNote",
                                    "unde d este distanța de la epicentru la punctul de referință, iar t timpul în care se propagă fiecare dintre cele două unde."
                                  )}
                                </p>
                                <h3 className="text-xl font-semibold mt-4 mb-2">
                                  {t("resourcesPage.lessonPages.earthquakes.elasticHeading", "Viteze în mediu elastic:")}
                                </h3>
                              </>
                            )}
                            {index === 2 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">{item.formula}</div>
                              </>
                            )}
                            {index === 3 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">{item.formula}</div>
                                <p className="text-muted-foreground mb-2">
                                  {t(
                                    "resourcesPage.lessonPages.earthquakes.elasticNote",
                                    "unde K este modulul de compresie, G modulul de forfecare, ρ densitatea."
                                  )}
                                </p>
                                <h3 className="text-xl font-semibold mt-4 mb-2">
                                  {t("resourcesPage.lessonPages.earthquakes.formulas.richter", "Magnitudinea Richter")}:
                                </h3>
                              </>
                            )}
                            {index === 4 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">{item.formula}</div>
                                <p className="text-muted-foreground">
                                  {t(
                                    "resourcesPage.lessonPages.earthquakes.richterNote",
                                    "A este amplitudinea maximă înregistrată, A₀ o amplitudine de referință."
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <a href={localizedPath("/simulare/seism")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
            </div>
            <h2 className="top-1 p3">{t("resourcesPage.lessonPages.earthquakes.gameHeading", "Seism prezentat printr-un joc")}</h2>
            <p className="row">
              <span>
                &#9734;
                <b>
                  {t(
                    "resourcesPage.lessonPages.earthquakes.gameHint1",
                    "Apasa sageata dreapta, sageata stanga pentru a te misca in jurul obiectului 3d."
                  )}
                </b>
              </span>
            </p>
            <p className="row">
              <span>
                &#9734;
                <b>{t("resourcesPage.lessonPages.earthquakes.gameHint2", "Apasa Enter pentru a te duce la urmatorul eveniment.")}</b>
              </span>
            </p>
            <div className="model-container resurse-model-stack">
              <div className="resurse-embed-frame resurse-embed-frame--seism">
                <iframe
                  id="modelFrame"
                  src="https://stefanarctic.github.io/Cutremure-Unity/"
                  className="resurse-embed-frame__iframe resurse-seism-iframe"
                  allowFullScreen={true}
                  title={t("resourcesPage.lessonPages.earthquakes.iframeTitle", "Joc interactiv seism — Cutremure Unity")}
                />
              </div>
              <div id="modelDescription" className="sketchfab-info1 whitespace-pre-line">
                {modelDescription}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default SeismePage;
