import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useEffect, useState, useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";
import { pickSimulationThumb } from "@/lib/simulationScreenshots";

import circuiteElectricitateImg from "/res/screenshots/Circuite_Electricitate_Screenshot.png";
import energieCircuiteImg from "/res/screenshots/Energie_Circuite_Screenshot.png";
import curentAlternativImg from "/res/screenshots/ac_Screenshot.png";
import kirchhoffSimulatorImg from "/res/screenshots/kirchoff_Screenshot.png";

const ElectricitatePage = () => {
  const { t, localizedPath, lang } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const E = "resourcesPage.lessonPages.electricity";
  const FE = `${E}.formulas`;

  const circuiteFormulas = useMemo(
    () => [
      { formula: "\\( U = RI \\)", title: t(`${FE}.circuits.ohmsLaw`, "Legea lui Ohm") },
      { formula: "\\( P = UI = RI^2 = \\frac{U^2}{R} \\)", title: t(`${FE}.circuits.power`, "Puterea electrică") },
      { formula: "\\( W = UIt = RI^2t = \\frac{U^2}{R}t \\)", title: t(`${FE}.circuits.energy`, "Energia electrică") },
      {
        formula: "\\( R_{eq} = R_1 + R_2 + ... + R_n \\)",
        title: t(`${FE}.circuits.seriesReq`, "Rezistența echivalentă în serie"),
      },
      {
        formula: "\\( \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n} \\)",
        title: t(`${FE}.circuits.parallelReq`, "Rezistența echivalentă în paralel"),
      },
      {
        formula: "\\( \\sum I_{intrare} = \\sum I_{iesire} \\)",
        title: t(`${FE}.circuits.kcl`, "Prima lege a lui Kirchhoff"),
      },
      { formula: "\\( \\sum U = \\sum RI \\)", title: t(`${FE}.circuits.kvl`, "A doua lege a lui Kirchhoff") },
      { formula: "\\( R = \\rho \\frac{l}{S} \\)", title: t(`${FE}.circuits.conductorR`, "Rezistența unui conductor") },
      { formula: "\\( I = \\frac{q}{t} = nqvS \\)", title: t(`${FE}.circuits.current`, "Curentul electric") },
      { formula: "\\( j = \\frac{I}{S} = nqv \\)", title: t(`${FE}.circuits.currentDensity`, "Densitatea curentului") },
    ],
    [t]
  );

  const energieFormulas = useMemo(
    () => [
      {
        formula: "\\( W = RI^2t = \\frac{U^2}{R}t = UIt \\)",
        title: t(`${FE}.energie.resistorEnergy`, "Energia consumată de un rezistor"),
      },
      { formula: "\\( P(t) = U(t)I(t) \\)", title: t(`${FE}.energie.instantPower`, "Puterea instantanee") },
      {
        formula: "\\( W = \\frac{1}{2}CU^2 = \\frac{Q^2}{2C} \\)",
        title: t(`${FE}.energie.capEnergy`, "Energia stocată într-un condensator"),
      },
      { formula: "\\( W = \\frac{1}{2}LI^2 \\)", title: t(`${FE}.energie.indEnergy`, "Energia stocată într-o bobină") },
      {
        formula: "\\( \\eta = \\frac{P_{utila}}{P_{totala}} \\times 100\\% \\)",
        title: t(`${FE}.energie.efficiency`, "Randamentul unui circuit"),
      },
    ],
    [t]
  );

  const kirchhoffFormulas = useMemo(
    () => [
      { formula: "\\( \\sum_{k} I_k = 0 \\)", title: t(`${FE}.kirchhoff.kclNode`, "Prima lege (KCL) la un nod") },
      {
        formula: "\\( \\sum I_{\\text{intră}} = \\sum I_{\\text{iese}} \\)",
        title: t(`${FE}.kirchhoff.kclBalance`, "KCL — bilanțul curenților"),
      },
      {
        formula: "\\( \\sum_{m} U_m = 0 \\)",
        title: t(`${FE}.kirchhoff.kvlLoop`, "A doua lege (KVL) pe un ochi închis"),
      },
      {
        formula: "\\( \\sum (\\pm R_i I_i) = \\sum (\\pm E_j) \\)",
        title: t(`${FE}.kirchhoff.kvlBranches`, "KVL — tensiuni pe rezistențe și surse"),
      },
      { formula: "\\( U_{AB} = V_A - V_B \\)", title: t(`${FE}.kirchhoff.nodeVoltage`, "Tensiunea între două noduri") },
    ],
    [t]
  );

  const curentAlternativFormulas = useMemo(
    () => [
      {
        formula: "\\( u(t) = U_{max}\\sin(\\omega t) \\)",
        title: t(`${FE}.ac.uSine`, "Tensiune sinusoidală"),
      },
      {
        formula: "\\( i(t) = I_{max}\\sin(\\omega t + \\varphi) \\)",
        title: t(`${FE}.ac.iSine`, "Curent sinusoidal (defazaj φ)"),
      },
      { formula: "\\( \\omega = 2\\pi f \\)", title: t(`${FE}.ac.omegaRel`, "Pulsația") },
      { formula: "\\( U_{ef} = \\frac{U_{max}}{\\sqrt{2}} \\)", title: t(`${FE}.ac.uRms`, "Valoarea efectivă a tensiunii") },
      { formula: "\\( I_{ef} = \\frac{I_{max}}{\\sqrt{2}} \\)", title: t(`${FE}.ac.iRms`, "Valoarea efectivă a curentului") },
      { formula: "\\( X_L = \\omega L \\)", title: t(`${FE}.ac.xl`, "Reactanța inductivă") },
      { formula: "\\( X_C = \\frac{1}{\\omega C} \\)", title: t(`${FE}.ac.xc`, "Reactanța capacitivă") },
      { formula: "\\( P = U_{ef}I_{ef}\\cos\\varphi \\)", title: t(`${FE}.ac.pActive`, "Puterea activă în AC") },
    ],
    [t]
  );

  useEffect(() => {
    const sections = [
      { key: "circuite", formulas: circuiteFormulas },
      { key: "kirchhoff", formulas: kirchhoffFormulas },
      { key: "energie", formulas: energieFormulas },
      { key: "curent_alternativ", formulas: curentAlternativFormulas },
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
  }, [circuiteFormulas, kirchhoffFormulas, energieFormulas, curentAlternativFormulas]);

  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  return (
    <Layout>
      <SEO
        title={t(`${E}.seo.title`, "Electricitate - Resurse | PULS")}
        description={t(
          `${E}.seo.description`,
          "Electricitate: circuite electrice, legile lui Ohm și Kirchhoff, energie în circuite, curent alternativ — teorie, formule și simulări interactive."
        )}
        keywords={t(
          `${E}.seo.keywords`,
          "electricitate, circuite electrice, Ohm, Kirchhoff, curent alternativ, PULS"
        )}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t(`${E}.pageTitle`, "Electricitate")}
            </h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${E}.intro.p1`,
                  "Electricitatea este ramura fizicii care studiază fenomenele legate de sarcinile electrice, curenții electrici, câmpurile electrice și magnetice, precum și interacțiunile dintre ele. Această disciplină fundamentală stă la baza tehnologiei moderne și a multor aplicații practice."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${E}.intro.p2`,
                  "Studiul electricității include analiza circuitelor electrice, legile lui Ohm și Kirchhoff, energia electrică, puterea electrică și comportamentul componentelor electrice precum rezistoarele, condensatoarele și bobinele."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  `${E}.intro.p3`,
                  "Înțelegerea electricității este esențială pentru proiectarea și analiza sistemelor electrice, de la circuite simple până la sisteme complexe de distribuție a energiei."
                )}
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${E}.circuits.title`, "Circuite Electrice")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.circuits.p1`,
                    "Circuitele electrice sunt sisteme închise care permit circulația curentului electric prin componente conectate. Analiza circuitelor electrice se bazează pe legile fundamentale ale electricității: legea lui Ohm și legile lui Kirchhoff."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.circuits.p2`,
                    "Un circuit electric poate conține diverse componente precum rezistoare, surse de tensiune, condensatori și bobine. Fiecare componentă are caracteristici specifice care influențează comportamentul circuitului în ansamblu."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(circuiteElectricitateImg, "circuite-electricitate", lang)}
                    alt={t(`${E}.circuits.alt`, "Simulator Circuite Electrice")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${E}.circuits.formulasHeading`, "Formule esențiale pentru circuite electrice:")}
                    </h3>

                    {circuiteFormulas
                      .slice(0, visibleFormulasCount.circuite || circuiteFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${E}.circuits.variablesNote`,
                        "Unde: U este tensiunea, I este intensitatea curentului, R este rezistența, P este puterea, W este energia, q este sarcina electrică, t este timpul, ρ este rezistivitatea, l este lungimea conductorului, S este secțiunea transversală, n este numărul de purtători de sarcină pe unitate de volum, v este viteza de drift."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/circuite-electricitate")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${E}.kirchhoff.title`, "Legile lui Kirchhoff")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.kirchhoff.p1`,
                    "Pentru circuite mai complexe (mai multe noduri și ochiuri), legile lui Ohm nu sunt suficiente singure. Prima lege a lui Kirchhoff (KCL) exprimă conservarea sarcinii la fiecare nod; a doua lege (KVL) exprimă conservarea energiei pe fiecare ochi închis al circuitului."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.kirchhoff.p2`,
                    "Simulatorul de mai jos îți permite să construiești și să analizezi astfel de circuite interactiv."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(kirchhoffSimulatorImg, "kirchhoff", lang)}
                    alt={t(`${E}.kirchhoff.alt`, "Simulator legile lui Kirchhoff")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${E}.kirchhoff.formulasHeading`, "Formule esențiale (KCL și KVL):")}
                    </h3>

                    {kirchhoffFormulas
                      .slice(0, visibleFormulasCount.kirchhoff || kirchhoffFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${E}.kirchhoff.variablesNote`,
                        "Unde: curenții se iau cu semn conform unei convenții alese la nod; tensiunile se parcurg pe ochi în sens consistent; R și I sunt rezistențe și curenți pe ramuri, E sunt t.e.m. ale surselor, V la noduri sunt potențiale electrice."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/kirchhoff")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${E}.energy.title`, "Energia în Circuite")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.energy.p1`,
                    "Energia electrică este energia asociată cu mișcarea sarcinilor electrice într-un circuit. Această energie poate fi transformată în alte forme de energie, precum căldură, lumină sau energie mecanică."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.energy.p2`,
                    "Studiul energiei în circuite este esențial pentru înțelegerea eficienței energetice și a consumului de energie în sistemele electrice. Legea conservării energiei se aplică și în circuitele electrice, unde energia furnizată de surse este egală cu energia consumată de componente."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(energieCircuiteImg, "energie-circuite", lang)}
                    alt={t(`${E}.energy.alt`, "Simulator Energie în Circuite")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${E}.energy.formulasHeading`, "Formule pentru energia în circuite:")}
                    </h3>

                    {energieFormulas
                      .slice(0, visibleFormulasCount.energie || energieFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${E}.energy.variablesNote`,
                        "Unde: W este energia, P este puterea, C este capacitatea condensatorului, L este inductanța bobinei, Q este sarcina electrică, η este randamentul."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/energie-circuite")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${E}.ac.title`, "Curent alternativ (AC)")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${E}.ac.p1`,
                    "În curent alternativ, tensiunea și curentul variază în timp (de obicei sinusoidal). În practică folosim valori efective (RMS), care produc același efect termic ca în curent continuu."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(curentAlternativImg, "curent-alternativ", lang)}
                    alt={t(`${E}.ac.alt`, "Curent alternativ")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${E}.ac.formulasHeading`, "Formule esențiale:")}
                    </h3>

                    {curentAlternativFormulas
                      .slice(0, visibleFormulasCount.curent_alternativ || curentAlternativFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${E}.ac.variablesNote`,
                        "Unde: u(t), i(t) sunt mărimi instantanee, \\(U_{max}\\), \\(I_{max}\\) sunt amplitudini, f este frecvența, ω este pulsația, \\(U_{ef}\\), \\(I_{ef}\\) valori efective, L inductanța, C capacitatea, φ defazajul, cosφ factorul de putere."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/curent-alternativ")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
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

export default ElectricitatePage;
