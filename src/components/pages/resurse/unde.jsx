import { Button } from "../../Button";
import React, { useEffect, useState, useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";

import UndeImage from "/res/screenshots/Unde_Screenshot.png";
import UndeImage1 from "/res/screenshots/Unde_Screenshot2.png";

import PrismaImage from "/res/screenshots/Prisma_Screenshot.png";
import PrismaImage1 from "/res/screenshots/Prisma_Screenshot1.png";
import PolarizareCircularaImg from "/res/screenshots/Polarizare_Circulara_Screenshot.png";

import UndeVideo from "/res/Videos/Unde Videoclip.mp4";
import UndeVideo1 from "/res/Videos/Frecventa Undelor Video.mp4";
import UndeThumbnail1 from "/res/Thumbnails/Unde Videoclip.png";
import UndeThumbnail2 from "/res/Thumbnails/Frecventa Undelor Video.png";
import Layout from "../../Layout";
import SEO from "../../SEO";
import VideoPopup from "../../VideoPopup";
import { useI18n } from "@/i18n/LanguageContext";

const UndePage = () => {
  const { t, localizedPath, lang } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const undeFormulas = useMemo(
    () => [
      {
        formula: "\\( v = \\lambda \\cdot f\\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.general", "Formula generala a undelor"),
      },
      {
        formula: "\\(\\lambda = v \\cdot T\\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.wavelength", "Lungimea de undă"),
      },
      { formula: "\\(f = \\frac{1}{T}\\)", title: t("resourcesPage.lessonPages.waves.formatsFormulas.frequency", "Frecvența") },
    ],
    [t]
  );

  const prismaFormulas = useMemo(
    () => [
      {
        formula: "\\( n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2 \\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.snellTitle", "Legea refracției (Snell)"),
      },
      {
        formula: "\\( \\delta = (\\theta_1 + \\theta_2') - A \\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.deviationPrismTitle", "Unghiul de deviație în prismă"),
      },
      { formula: "\\( n = n(\\lambda) \\)", title: t("resourcesPage.lessonPages.waves.formatsFormulas.nLambdaTitle", "Indicele de refracție") },
    ],
    [t]
  );

  const polarizareFormulas = useMemo(
    () => [
      {
        formula: "\\( E_x(t) = E_0 \\cos(\\omega t) \\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.exTitle", "Componenta x a câmpului electric"),
      },
      {
        formula: "\\( E_y(t) = E_0 \\sin(\\omega t) \\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.eyTitle", "Componenta y a câmpului electric"),
      },
      {
        formula: "\\( E_x^2 + E_y^2 = E_0^2 \\)",
        title: t("resourcesPage.lessonPages.waves.formatsFormulas.eModTitle", "Modulul constant al vectorului câmp"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const sections = [
      { key: "unde", formulas: undeFormulas },
      { key: "prisma", formulas: prismaFormulas },
      { key: "polarizare", formulas: polarizareFormulas },
    ];

    setVisibleFormulasCount((prev) => {
      const newState = { ...prev };
      sections.forEach(({ key, formulas }) => {
        if (!newState[key] && formulas.length > 0) {
          newState[key] = Math.min(5, formulas.length);
        }
      });
      return newState;
    });

    let intervalId = null;

    intervalId = setInterval(() => {
      setVisibleFormulasCount((prev) => {
        const newState = { ...prev };
        let hasMore = false;

        sections.forEach(({ key, formulas }) => {
          const currentVisible = newState[key] || 0;
          const totalFormulas = formulas.length;

          if (currentVisible < totalFormulas) {
            const batchSize = 5;
            const newCount = Math.min(currentVisible + batchSize, totalFormulas);
            newState[key] = newCount;
            if (newCount < totalFormulas) {
              hasMore = true;
            }
          }
        });

        if (!hasMore && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        return newState;
      });
    }, 100);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [undeFormulas, prismaFormulas, polarizareFormulas]);

  const undeImages = [
    { src: UndeImage, alt: t("resourcesPage.lessonPages.waves.altSim", "Simulare Unde") },
    { src: UndeImage1, alt: t("resourcesPage.lessonPages.waves.altSim", "Simulare Unde") },
  ];

  const prismaImages = [
    { src: PrismaImage, alt: t("resourcesPage.lessonPages.waves.altPrism", "Simulare Prisma") },
    { src: PrismaImage1, alt: t("resourcesPage.lessonPages.waves.altPrism", "Simulare Prisma") },
  ];

  const undeVideos = [
    { src: UndeVideo, alt: t("resourcesPage.lessonPages.waves.title", "Unde"), thumbnail: UndeThumbnail1 },
    { src: UndeVideo1, alt: t("resourcesPage.lessonPages.waves.title", "Unde"), thumbnail: UndeThumbnail2 },
  ];

  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  return (
    <Layout>
      <SEO
        title={t("resourcesPage.lessonPages.waves.seo.title", "Resurse Unde | Propagarea undelor - PULS")}
        description={t(
          "resourcesPage.lessonPages.waves.seo.description",
          "Învață despre propagarea undelor mecanice și electromagnetice, tipuri de unde, formule și simulări interactive."
        )}
        keywords={t("resourcesPage.lessonPages.waves.seo.keywords", "unde, unde mecanice, unde electromagnetice, propagare unde, fizică unde")}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("resourcesPage.lessonPages.waves.title", "Unde")}</h1>
            <div className="max-w-3xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.waves.introLead",
                  "Undele reprezintă fenomenul de propagare a oscilaţiilor mecanice, electromagnetice sau de altă natură în diferite medii."
                )}
              </p>
              <h3 className="text-xl font-semibold mb-2">{t("resourcesPage.lessonPages.waves.characteristicsHeading", "Caracteristici:")}</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>{t("resourcesPage.lessonPages.waves.wavesCanBe", "Undele pot fi:")}</li>
                <li>
                  <span className="font-medium text-foreground">
                    {t("resourcesPage.lessonPages.waves.mechanicalLabel", "A. Unde mecanice")}
                  </span>
                  <br />
                  {t(
                    "resourcesPage.lessonPages.waves.mechanicalParagraph",
                    "Unda mecanică reprezintă o perturbaţie locală produsă într-un mediu elastic care se transmite în toate direcţiile, din aproape în aproape, din cauza forţelor elastice ce se exercită între particulele constitutive ale acelui mediu. Din acest motiv undele mecanice se mai numesc şi elastice."
                  )}
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    {t("resourcesPage.lessonPages.waves.electromagneticLabel", "B. Unde electromagnetice")}
                  </span>
                  <br />
                  {t(
                    "resourcesPage.lessonPages.waves.electromagneticParagraph",
                    "Undele electromagnetice reprezintă o suprapunere dintre un câmp electric şi unul magnetic care se generează reciproc şi se propagă împreună. Undele electromagnetice nu au nevoie de un mediu suport de propagare, prin urmare undele electromagnetice se propagă şi în vid."
                  )}
                </li>
              </ul>
              <h3 className="text-xl font-semibold mt-4 mb-2">{t("resourcesPage.lessonPages.waves.waveTypesHeading", "Tipuri de unde:")}</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    {t("resourcesPage.lessonPages.waves.longitudinalLabel", "A. Unde longitudinale")}
                  </span>
                  <br />
                  {t(
                    "resourcesPage.lessonPages.waves.longitudinalParagraph",
                    "Undele longitudinale sunt acele unde în care oscilaţiile particulelor se produc în aceeaşi direcţie cu direcţia de propagare a undei. Aceste unde se propagă prin comprimarea şi rarefierea mediului elastic."
                  )}
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    {t("resourcesPage.lessonPages.waves.transverseLabel", "B. Unde transversale")}
                  </span>
                  <br />
                  {t(
                    "resourcesPage.lessonPages.waves.transverseParagraph",
                    "Undele transversale sunt acele unde în care oscilaţiile particulelor se produc perpendicular pe direcţia de propagare a undei. Aceste unde se propagă prin vibrarea particulelor mediului elastic în plan perpendicular pe direcţia de propagare a undei."
                  )}
                </li>
              </ul>

              <div className="experimente-video-grid mt-8">
                <div className="experiment-card">
                  <h3 className="experiment-title">{t("resourcesPage.lessonPages.waves.videos.soundTubeTitle", "Tub sonor - frecvenţa fundamentală")}</h3>
                  <p className="experiment-desc">
                    {t(
                      "resourcesPage.lessonPages.waves.videos.soundTubeDesc",
                      "Demonstrează cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală."
                    )}
                  </p>
                  <VideoPopup
                    src={undeVideos[0].src}
                    alt={undeVideos[0].alt}
                    thumbnail={undeVideos[0].thumbnail}
                    title={t(
                      "resourcesPage.lessonPages.waves.videos.soundTubePopupTitle",
                      "Tub sonor - frecvenţa fundamentală (experiment video)"
                    )}
                  />
                </div>
                <div className="experiment-card">
                  <h3 className="experiment-title">{t("resourcesPage.lessonPages.waves.videos.standingTitle", "Unde Stationare in coarda vibranta")}</h3>
                  <p className="experiment-desc">
                    {t(
                      "resourcesPage.lessonPages.waves.videos.standingDesc",
                      "Explorează formarea undelor stationare într-o coardă vibrată, fenomenul de interferență constructivă și distructivă."
                    )}
                  </p>
                  <VideoPopup
                    src={undeVideos[1].src}
                    alt={undeVideos[1].alt}
                    thumbnail={undeVideos[1].thumbnail}
                    title={t(
                      "resourcesPage.lessonPages.waves.videos.standingPopupTitle",
                      "Unde Stationare in coarda vibranta (experiment video)"
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t("resourcesPage.lessonPages.waves.waterSim.title", "Simulare de unde in apa")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.waves.waterSim.p",
                    "Această simulare permite observarea propagării undelor în apă, demonstrând cum se formează și se transmit undele printr-un mediu lichid. Poți interacționa cu simularea pentru a vedea cum diferite tipuri de unde se comportă în apă."
                  )}
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={undeImages[0].src} alt={undeImages[0].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="mt-6">
                      {undeFormulas
                        .slice(0, visibleFormulasCount.unde || undeFormulas.length)
                        .map((item, index) => (
                          <div key={index}>
                            {index === 0 && (
                              <>
                                <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                                <div className="formula-resurse text-lg font-mono">{item.formula}</div>
                                <p className="text-muted-foreground mt-2">
                                  {lang === "en" ? (
                                    t(
                                      "resourcesPage.lessonPages.waves.waveFormulas.characterisation",
                                      "undele se caracterizează prin lungimea de undă {\\(\\lambda\\)}, frecvența {\\(f\\)} și viteza de propagare {\\(v\\)}."
                                    )
                                  ) : (
                                    <>
                                      undele se caracterizează prin lungimea de undă {"\\(\\lambda\\)"}, frecvența {"\\(f\\)"}{" "}
                                      și viteza de propagare {"\\(v\\)"}.
                                    </>
                                  )}
                                </p>
                                <h3 className="text-xl font-semibold mt-4 mb-2">
                                  {t("resourcesPage.lessonPages.waves.waveFormulas.usefulHeading", "Formule utile:")}
                                </h3>
                              </>
                            )}
                            {index > 0 && (
                              <p className="text-muted-foreground mb-2">
                                {item.title}: <span className="formula-resurse">{item.formula}</span>
                                {lang === "en"
                                  ? t("resourcesPage.lessonPages.waves.waveFormulas.otherLineSuffix", ", unde T este perioada undelor.")
                                  : ", unde T este perioada undelor."}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <a href={localizedPath("/simulare/unde-apa")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mb-10">
              <h3 className="text-xl font-semibold mb-2">{t("resourcesPage.lessonPages.waves.prismIntroTitle", "Prisma")}</h3>
              <p className="text-lg text-muted-foreground mb-4">{t("resourcesPage.lessonPages.waves.prismP1", "O prismă este un obiect transparent cu două fețe paralele și cel puțin trei fețe laterale, care refractă lumina. Prisma este utilizată pentru a descompune lumina albă în spectrul său de culori prin difracție.")}</p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.waves.prismP2",
                  "Difracția luminii albe prin prisma este un fenomen optic care apare atunci când lumina albă trece printr-o prismă, rezultând în separarea acesteia în culorile spectrului vizibil. Acest proces se datorează diferențelor de indice de refracție pentru diferitele lungimi de undă ale luminii."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.waves.prismP3",
                  "Prisma este adesea folosită în experimentele de optică pentru a demonstra cum lumina albă poate fi descompusă în culorile sale componente, cum ar fi roșu, portocaliu, galben, verde, albastru, indigo și violet."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.waves.prismP4",
                  "Lumina albă este o suprapunere formată din toate lungimile de undă aşa cum a observat prima dată acum mai bine de 300 de ani Isaac Newton descoperind fenomenul de dispersie a luminii."
                )}
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t("resourcesPage.lessonPages.waves.prismSimTitle", "Difractia luminii albe prin prisma")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.waves.prismSimP",
                    "Această simulare permite observarea difracției luminii albe printr-o prismă, demonstrând cum lumina albă se descompune în spectrul său de culori atunci când trece printr-un mediu transparent cu un indice de refracție diferit."
                  )}
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={prismaImages[1].src} alt={prismaImages[1].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {t("resourcesPage.lessonPages.waves.prismFormulaHeading", "Formule pentru refracția luminii albe în prismă:")}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {prismaFormulas
                          .slice(0, visibleFormulasCount.prisma || prismaFormulas.length)
                          .map((item, index) => (
                            <div key={index} className="formula-resurse text-lg font-mono">
                              {item.formula}
                            </div>
                          ))}
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {lang === "en" ? (
                          <>
                            {t(
                              "resourcesPage.lessonPages.waves.prismLegendP1BeforeA",
                              "For the deviation angle δ = (θ₁ + θ₂′) − A, the symbol "
                            )}
                            <strong>{t("resourcesPage.lessonPages.waves.prismLegendAemphasis", "A")}</strong>
                            {t("resourcesPage.lessonPages.waves.prismLegendP1AfterA", " stands for the apex angle.")}{" "}
                            {t(
                              "resourcesPage.lessonPages.waves.prismLegendP2",
                              "Because the index n varies with wavelength, n = n(λ), neighbouring colours traverse the prism differently — that is dispersion of white light."
                            )}
                          </>
                        ) : (
                          <>
                            Legea refracției (Snell): {"\\( n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2 \\)"}.<br />
                            Unghiul de deviație în prismă: {"\\( \\delta = (\\theta_1 + \\theta_2') - A \\)"}, unde <b>A</b> este
                            unghiul prismului.<br />
                            Indicele de refracție depinde de lungimea de undă: {"\\( n = n(\\lambda) \\)"}, ceea ce duce la
                            dispersia luminii albe.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <a href={localizedPath("/simulare/prisma")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-12 mt-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t("resourcesPage.lessonPages.waves.polarisationTitle", "Polarizarea circulară a undelor electromagnetice")}</h2>
                <p className="text-muted-foreground mb-6">
                  {lang === "en" ? (
                    t(
                      "resourcesPage.lessonPages.waves.polarisationP",
                      "Lumina polarizată circular poate fi privită ca superpoziția a două unde plane polarizate liniar, perpendiculare între ele, cu aceeași amplitudine, dar defazate cu un sfert de perioadă (diferență de fază de \\(\\frac{\\pi}{2}\\)). Vârful vectorului câmpului electric descrie astfel un cerc în planul perpendicular pe direcția de propagare."
                    )
                  ) : (
                    <>
                      Lumina polarizată circular poate fi privită ca superpoziția a două unde plane polarizate liniar,
                      perpendiculare între ele, cu aceeași amplitudine, dar defazate cu un sfert de perioadă (diferență de fază
                      de {"\\(\\frac{\\pi}{2}\\)"}). Vârful vectorului câmpului electric descrie astfel un cerc în planul
                      perpendicular pe direcția de propagare.
                    </>
                  )}
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={PolarizareCircularaImg}
                    alt={t("resourcesPage.lessonPages.waves.altCircularPol", "Simulator Polarizare Circulară")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("resourcesPage.lessonPages.waves.polarMathTitle", "Descriere matematică (polarizare circulară dreaptă):")}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {lang === "en" ? (
                        t(
                          "resourcesPage.lessonPages.waves.polarLead",
                          "Considerăm două componente ale câmpului electric, de-a lungul axelor {\\(x\\)} și {\\(y\\)}, cu aceeași amplitudine {\\(E_0\\)} și o diferență de fază de {\\(\\frac{\\pi}{2}\\)}:"
                        )
                      ) : (
                        <>
                          Considerăm două componente ale câmpului electric, de-a lungul axelor {"\\(x\\)"} și {"\\(y\\)"}, cu
                          aceeași amplitudine {"\\(E_0\\)"} și o diferență de fază de {"\\(\\frac{\\pi}{2}\\)"}:
                        </>
                      )}
                    </p>
                    {polarizareFormulas
                      .slice(0, visibleFormulasCount.polarizare || polarizareFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 2 && (
                            <p className="text-muted-foreground mb-3">
                              {lang === "en" ? (
                                t(
                                  "resourcesPage.lessonPages.waves.polarModulusLead",
                                  "La orice moment, vectorul câmpului electric {\\(\\vec{E}(t) = (E_x(t), E_y(t))\\)} are modulul constant:"
                                )
                              ) : (
                                <>
                                  La orice moment, vectorul câmpului electric {"\\(\\vec{E}(t) = (E_x(t), E_y(t))\\)"} are
                                  modulul constant:
                                </>
                              )}
                            </p>
                          )}
                          <div className="formula-resurse text-lg font-mono mb-2">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground">
                      {lang === "en" ? (
                        t(
                          "resourcesPage.lessonPages.waves.polarClosing",
                          "Aceasta înseamnă că vârful vectorului se deplasează pe un cerc de rază {\\(E_0\\)}, ceea ce explică denumirea de polarizare circulară. Sensul de rotație (dreapta/stânga) depinde de semnul fazei relative dintre cele două componente."
                        )
                      ) : (
                        <>
                          Aceasta înseamnă că vârful vectorului se deplasează pe un cerc de rază {"\\(E_0\\)"}, ceea ce explică
                          denumirea de polarizare circulară. Sensul de rotație (dreapta/stânga) depinde de semnul fazei relative
                          dintre cele două componente.
                        </>
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/polarizare-circulara")} className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default UndePage;
