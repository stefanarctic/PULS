import { Button } from "../../Button";
import { useEffect, useState, useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";

import simulatorOscilatieOYImg from "/res/screenshots/Oscilatieoy_Screenshot.png";
import simulatorOscilatieOXImg from "/res/screenshots/Oscilatieox_Screenshot.png";
import simulatorCiocnireImg from "/res/screenshots/Ciocnire_Screenshot.png";
import simulatorPlanInclinatImg from "/res/screenshots/Plan_Inclinat_Screenshot.png";
import proiectileImg from "/res/screenshots/Proiectile_Screenshot.png";
import lanturiElasticeImg from "/res/screenshots/Lanturi_Elastice_Screenshot.png";
import frecareAerImg from "/res/screenshots/Frecare_Aer_Screenshot.png";

import Layout from "../../Layout";
import SEO from "../../SEO";
import { useI18n } from "@/i18n/LanguageContext";

const MecanicaPage = () => {
  const { t, localizedPath, lang } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const F = "resourcesPage.lessonPages.mechanics.formulas";

  const oscilatieOXFormulas = useMemo(
    () => [
      { formula: "\\( x(t) = A \\sin(\\omega t + \\phi) \\)", title: t(`${F}.oscOX.motionLaw`, "Legea mișcării") },
      { formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)", title: t(`${F}.oscOX.velocityLaw`, "Legea vitezei") },
      { formula: "\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)", title: t(`${F}.oscOX.accelLaw`, "Legea accelerației") },
      { formula: "\\( \\omega = \\sqrt{\\frac{k}{m}} \\)", title: t(`${F}.oscOX.angularSpeed`, "Viteza unghiulară") },
      { formula: "\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)", title: t(`${F}.oscOX.period`, "Perioada oscilației") },
    ],
    [t]
  );

  const oscilatieOYFormulas = useMemo(
    () => [
      { formula: "\\( y_0 = \\frac{mg}{k} \\)", title: t(`${F}.oscOY.equilibriumPos`, "Poziția de echilibru") },
      { formula: "\\( y(t) = y_0 + A \\sin(\\omega t + \\phi) \\)", title: t(`${F}.oscOY.motionLaw`, "Legea mișcării") },
      { formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)", title: t(`${F}.oscOY.velocityLaw`, "Legea vitezei") },
      { formula: "\\( E = \\frac{1}{2}mv^2 + \\frac{1}{2}ky^2 + mgy \\)", title: t(`${F}.oscOY.totalEnergy`, "Energia totală") },
      { formula: "\\( f = \\frac{1}{2\\pi} \\sqrt{\\frac{k}{m}} \\)", title: t(`${F}.oscOY.naturalFreq`, "Frecvența naturală") },
    ],
    [t]
  );

  const ciocnireFormulas = useMemo(
    () => [
      { formula: "\\( m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\)", title: t(`${F}.collision.momentum`, "Conservarea impulsului") },
      { formula: "\\( e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}} \\)", title: t(`${F}.collision.restitution`, "Coeficientul de restituire") },
      { formula: "\\( v_{1f} = \\frac{(m_1 - m_2)v_{1i} + 2m_2v_{2i}}{m_1 + m_2} \\)", title: t(`${F}.collision.v1f`, "Viteza finală 1 (ciocnire elastică)") },
      { formula: "\\( v_{2f} = \\frac{(m_2 - m_1)v_{2i} + 2m_1v_{1i}}{m_1 + m_2} \\)", title: t(`${F}.collision.v2f`, "Viteza finală 2 (ciocnire elastică)") },
      {
        formula: "\\( \\frac{1}{2}m_1v_{1i}^2 + \\frac{1}{2}m_2v_{2i}^2 = \\frac{1}{2}m_1v_{1f}^2 + \\frac{1}{2}m_2v_{2f}^2 \\)",
        title: t(`${F}.collision.kineticElastic`, "Energia cinetică în ciocniri elastice"),
      },
      { formula: "\\( \\vec{p} = m\\vec{v} \\)", title: t(`${F}.collision.impulse`, "Impulsul total") },
    ],
    [t]
  );

  const planInclinatFormulas = useMemo(
    () => [
      { formula: "\\( F_{||} = mg \\sin(\\alpha) \\)", title: t(`${F}.inclined.parallel`, "Componenta paralelă a forței gravitaționale") },
      { formula: "\\( F_{\\perp} = mg \\cos(\\alpha) \\)", title: t(`${F}.inclined.perpendicular`, "Componenta perpendiculară a forței gravitaționale") },
      { formula: "\\( F_f = \\mu N = \\mu mg \\cos(\\alpha) \\)", title: t(`${F}.inclined.friction`, "Forța de frecare") },
      { formula: "\\( a = g(\\sin(\\alpha) - \\mu \\cos(\\alpha)) \\)", title: t(`${F}.inclined.acceleration`, "Accelerația pe plan înclinat") },
      { formula: "\\( v = \\sqrt{2gh(1 - \\mu \\cot(\\alpha))} \\)", title: t(`${F}.inclined.speedBase`, "Viteza la baza planului") },
      { formula: "\\( t = \\sqrt{\\frac{2h}{g(\\sin(\\alpha) - \\mu \\cos(\\alpha))}} \\)", title: t(`${F}.inclined.timeDescent`, "Timpul de coborâre") },
    ],
    [t]
  );

  const proiectilFormulas = useMemo(
    () => [
      {
        formula: "\\( v_{0x} = v_0 \\cos\\alpha, \\quad v_{0y} = v_0 \\sin\\alpha \\)",
        title: t(`${F}.projectile.decompose`, "Descompunerea vitezei inițiale"),
      },
      { formula: "\\( x(t) = v_{0x} t \\)", title: t(`${F}.projectile.motionOX`, "Ecuația de mișcare pe OX") },
      { formula: "\\( y(t) = y_0 + v_{0y} t - \\frac{1}{2} g t^2 \\)", title: t(`${F}.projectile.motionOY`, "Ecuația de mișcare pe OY") },
      { formula: "\\( T = \\frac{2 v_0 \\sin\\alpha}{g} \\)", title: t(`${F}.projectile.timeOfFlight`, "Timpul de zbor") },
      { formula: "\\( R = \\frac{v_0^2 \\sin(2\\alpha)}{g} \\)", title: t(`${F}.projectile.range`, "Bătaia maximă") },
    ],
    [t]
  );

  const lanturiElasticeFormulas = useMemo(
    () => [
      { formula: "\\( F = -k \\Delta x \\)", title: t(`${F}.elasticChain.hooke`, "Forța în resort (legea lui Hooke)") },
      {
        formula: "\\( m \\frac{d^2 x_i}{dt^2} = k(x_{i+1} - x_i) - k(x_i - x_{i-1}) \\)",
        title: t(`${F}.elasticChain.chainEq`, "Ecuația de mișcare pentru o masă din lanț"),
      },
    ],
    [t]
  );

  const frecareAerFormulas = useMemo(
    () => [
      { formula: "\\( F_d = \\frac{1}{2}\\, C_d \\, \\rho \\, A \\, v^2 \\)", title: t(`${F}.airDrag.drag`, "Forța de rezistență a aerului (drag)") },
      { formula: "\\( ma = mg - \\frac{1}{2}\\, C_d \\, \\rho \\, A \\, v^2 \\)", title: t(`${F}.airDrag.motionWithDrag`, "Ecuația mișcării în cădere cu rezistență") },
      { formula: "\\( v_t = \\sqrt{\\frac{2mg}{C_d \\, \\rho \\, A}} \\)", title: t(`${F}.airDrag.terminalV`, "Viteza terminală") },
      { formula: "\\( v(t) = v_t \\tanh\\!\\left(\\frac{g\\,t}{v_t}\\right) \\)", title: t(`${F}.airDrag.vOfT`, "Viteza în funcție de timp") },
      { formula: "\\( y(t) = \\frac{v_t^2}{g} \\ln\\!\\left(\\cosh\\!\\left(\\frac{g\\,t}{v_t}\\right)\\right) \\)", title: t(`${F}.airDrag.yOfT`, "Poziția în funcție de timp") },
      { formula: "\\( \\text{Re} = \\frac{\\rho \\, v \\, L}{\\mu} \\)", title: t(`${F}.airDrag.reynolds`, "Numărul Reynolds") },
    ],
    [t]
  );

  useEffect(() => {
    const sections = [
      { key: "oscilatieOX", formulas: oscilatieOXFormulas },
      { key: "oscilatieOY", formulas: oscilatieOYFormulas },
      { key: "ciocnire", formulas: ciocnireFormulas },
      { key: "planInclinat", formulas: planInclinatFormulas },
      { key: "proiectil", formulas: proiectilFormulas },
      { key: "lanturiElastice", formulas: lanturiElasticeFormulas },
      { key: "frecareAer", formulas: frecareAerFormulas },
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
  }, [
    oscilatieOXFormulas,
    oscilatieOYFormulas,
    ciocnireFormulas,
    planInclinatFormulas,
    proiectilFormulas,
    lanturiElasticeFormulas,
    frecareAerFormulas,
  ]);

  const M = "resourcesPage.lessonPages.mechanics";
  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  const noteOscOX =
    lang === "en" ? (
      t(
        `${M}.oscOX.variablesNote`,
        "Unde: A este amplitudinea, \\(\\omega\\) viteza unghiulară, \\(\\phi\\) faza inițială, k este constanta elastică, m este masa corpului, iar t este timpul."
      )
    ) : (
      <>
        Unde: A este amplitudinea, {"\\(\\omega\\)"} viteza unghiulară, {"\\(\\phi\\)"} faza inițială, k este constanta elastică,
        m este masa corpului, iar t este timpul.
      </>
    );

  const noteOscOY =
    lang === "en" ? (
      t(
        `${M}.oscOY.variablesNote`,
        "Unde: y₀ este poziția de echilibru, A este amplitudinea, \\(\\omega\\) viteza unghiulară, \\(\\phi\\) faza inițială, k este constanta elastică, m este masa, g este accelerația gravitațională."
      )
    ) : (
      <>
        Unde: y₀ este poziția de echilibru, A este amplitudinea, {"\\(\\omega\\)"} viteza unghiulară, {"\\(\\phi\\)"} faza inițială,
        k este constanta elastică, m este masa, g este accelerația gravitațională.
      </>
    );

  const noteInclined =
    lang === "en" ? (
      t(
        `${M}.inclined.variablesNote`,
        "Unde: m este masa corpului, g este accelerația gravitațională, \\(\\alpha\\) unghiul de înclinare, \\(\\mu\\) coeficientul de frecare, h este înălțimea planului, N este forța normală."
      )
    ) : (
      <>
        Unde: m este masa corpului, g este accelerația gravitațională, {"\\(\\alpha\\)"} unghiul de înclinare,{" "}
        {"\\(\\mu\\)"} coeficientul de frecare, h este înălțimea planului, N este forța normală.
      </>
    );

  const noteProjectile =
    lang === "en" ? (
      t(
        `${M}.projectile.variablesNote`,
        "Unde: \\(v_0\\) este viteza inițială, \\(\\alpha\\) unghiul de lansare față de orizontală, g accelerația gravitațională, \\(y_0\\) înălțimea inițială, \\(T\\) timpul de zbor, iar \\(R\\) bătaia."
      )
    ) : (
      <>
        Unde: {"\\(v_0\\)"} este viteza inițială, {"\\(\\alpha\\)"} unghiul de lansare față de orizontală, {"\\(g\\)"}{" "}
        accelerația gravitațională, {"\\(y_0\\)"} înălțimea inițială, {"\\(T\\)"} timpul de zbor, iar {"\\(R\\)"} bătaia
        (distanța orizontală parcursă).
      </>
    );

  const noteAC =
    lang === "en" ? (
      t(
        `${M}.airDrag.variablesNote`,
        "where: C_d is the drag coefficient (shape-dependent), ρ fluid density (≈ 1.225 kg/m³ for air at sea level), A cross-sectional area, v speed, m mass, g gravity, v_t terminal speed, Re Reynolds number, L a characteristic length and μ dynamic viscosity."
      )
    ) : (
      <>
        Unde: {"\\(C_d\\)"} este coeficientul de drag (adimensional, depinde de forma corpului), {"\\(\\rho\\)"} densitatea
        fluidului (≈ 1.225 kg/m³ pentru aer la nivel de mare), {"\\(A\\)"} aria secțiunii transversale, {"\\(v\\)"} viteza
        corpului, {"\\(m\\)"} masa, {"\\(g\\)"} accelerația gravitațională, {"\\(v_t\\)"} viteza terminală,{" "}
        {"\\(\\text{Re}\\)"} numărul Reynolds, {"\\(L\\)"} lungimea caracteristică, iar {"\\(\\mu\\)"} vâscozitatea dinamică a
        fluidului.
      </>
    );

  return (
    <Layout>
      <SEO
        title={t(`${M}.seo.title`, "Mecanică - Resurse | PULS")}
        description={t(
          `${M}.seo.description`,
          "Mecanică: mișcări oscilatorii, ciocniri, plan înclinat, proiectile, lanțuri elastice și frecare cu aerul. Teorie, formule și simulări."
        )}
        keywords={t(`${M}.seo.keywords`, "mecanică, oscilații, ciocniri, plan înclinat, proiectile, PULS")}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t(`${M}.pageTitle`, "Mecanică - Mișcări Oscilatorii și Coliziuni")}
            </h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${M}.intro.p1`,
                  "Mecanica studiază mișcarea corpurilor și forțele care o produc. În această secțiune, ne concentrăm pe mișcările oscilatorii și procesele de coliziune, care reprezintă fundamentul pentru înțelegerea multor fenomene fizice complexe."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${M}.intro.p2`,
                  "Mișcările oscilatorii sunt caracterizate prin repetarea periodică a unei mișcări în timp, fiind prezente în aproape toate sistemele fizice, de la pendulul simplu până la vibrațiile atomice. Aceste mișcări sunt guvernate de forțe restauratoare care tind să readucă sistemul la poziția de echilibru."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  `${M}.intro.p3`,
                  "Coliziunile, pe de altă parte, sunt procese fundamentale în care două sau mai multe corpuri interacționează prin forțe de contact pe o durată scurtă, schimbându-și impulsul și energia cinetică conform legilor de conservare."
                )}
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.oscOX.title`, "Mișcarea oscilatorie pe OX")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.oscOX.p1`,
                    "Mișcarea oscilatorie pe OX descrie oscilația unui corp pe o direcție orizontală, sub acțiunea unei forțe restauratoare proporționale cu deplasarea. Această mișcare este fundamentală pentru înțelegerea sistemelor oscilatorii și a comportamentului lor în timp."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.oscOX.p2`,
                    "Când un corp este deplasat din poziția sa de echilibru pe axa OX, forța restauratoare F = -kx (legea lui Hooke) îl readuce spre poziția de echilibru. Această forță generează o mișcare oscilatorie armonică, caracterizată prin ecuații matematice precise care descriu poziția, viteza și accelerația corpului în timp."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={simulatorOscilatieOXImg} alt={t(`${M}.oscOX.alt`, "Oscilatie OX")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.oscOX.formulasHeading`, "Ecuațiile mișcării oscilatorii pe OX:")}</h3>

                    {oscilatieOXFormulas
                      .slice(0, visibleFormulasCount.oscilatieOX || oscilatieOXFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">{noteOscOX}</p>
                  </div>
                  <a href={localizedPath("/simulare/oscillatii-ox")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.oscOY.title`, "Mișcarea oscilatorie pe OY")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.oscOY.p1`,
                    "Oscilatorul armonic vertical este un model fundamental pentru studiul mișcării unui corp atașat de un arc ce oscilează pe verticală. Această mișcare combină efectele gravitației cu forța elastică a arcului, creând un sistem oscilator complex și interesant."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.oscOY.p2`,
                    "În cazul oscilatorului vertical, poziția de echilibru nu mai este la x = 0, ci la o poziție unde forța elastică echilibrează forța gravitațională. Această poziție de echilibru se modifică în funcție de masa corpului și de constanta elastică a arcului."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={simulatorOscilatieOYImg} alt={t(`${M}.oscOY.alt`, "Oscilatie OY")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.oscOY.formulasHeading`, "Ecuațiile mișcării oscilatorii pe OY:")}</h3>

                    {oscilatieOYFormulas
                      .slice(0, visibleFormulasCount.oscilatieOY || oscilatieOYFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">{noteOscOY}</p>
                  </div>
                  <a href={localizedPath("/simulare/oscillatii-oy")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.collision.title`, "Ciocnirea")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.collision.p1`,
                    "Ciocnirile sunt procese fundamentale în mecanică, unde două sau mai multe corpuri interacționează prin forțe de contact pe o durată scurtă. Aceste procese sunt esențiale pentru înțelegerea conservării impulsului și energiei în sistemele fizice."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.collision.p2`,
                    "În timpul unei ciocniri, forțele de interacțiune sunt foarte mari comparativ cu forțele externe, ceea ce permite aplicarea principiilor de conservare. Tipurile principale de ciocniri sunt: ciocniri elastice (unde energia cinetică se conservă) și ciocniri inelastice (unde energia cinetică se transformă parțial în alte forme de energie)."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={simulatorCiocnireImg} alt={t(`${M}.collision.alt`, "Ciocnire")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.collision.formulasHeading`, "Formule pentru ciocniri:")}</h3>

                    {ciocnireFormulas
                      .slice(0, visibleFormulasCount.ciocnire || ciocnireFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 2 && (
                            <h4 className="text-lg font-semibold mb-2">
                              {index + 1}. {t(`${M}.collision.finalVelocitiesGroupHeading`, "Vitezele finale (ciocnire elastică)")}:
                            </h4>
                          )}
                          {index !== 2 && (
                            <h4 className="text-lg font-semibold mb-2">
                              {index + 1}. {item.title}:
                            </h4>
                          )}
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${M}.collision.variablesNote`,
                        "Unde: m₁, m₂ sunt masele corpurilor, v₁ᵢ, v₂ᵢ sunt vitezele inițiale, v₁f, v₂f sunt vitezele finale, e este coeficientul de restituire (e = 1 pentru ciocniri perfect elastice, e = 0 pentru ciocniri perfect inelastice)."
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/coliziuni-inelastice")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.inclined.title`, "Plan înclinat")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.inclined.p1`,
                    "Planul înclinat este un exemplu clasic de analiză a forțelor și mișcării pe o suprafață înclinată. Această problemă fundamentală din mecanică demonstrează cum forța gravitațională poate fi descompusă în componente și cum acestea influențează mișcarea unui corp."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.inclined.p2`,
                    "Studiul planului înclinat este esențial pentru înțelegerea conceptelor de forță, accelerație și energie potențială. Acesta oferă o bază solidă pentru analiza problemelor mai complexe din mecanică și inginerie."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={simulatorPlanInclinatImg} alt={t(`${M}.inclined.alt`, "Plan înclinat")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.inclined.formulasHeading`, "Formule pentru planul înclinat:")}</h3>

                    {planInclinatFormulas
                      .slice(0, visibleFormulasCount.planInclinat || planInclinatFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">{noteInclined}</p>
                  </div>
                  <a href={localizedPath("/simulare/plan-inclinat")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.projectile.title`, "Mișcarea proiectilului")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.projectile.p1`,
                    "Mișcarea proiectilului descrie traiectoria unui corp aruncat cu o viteză inițială într-un câmp gravitațional uniform (de obicei neglijând rezistența aerului). Este un exemplu clasic de mișcare compusă: mișcare rectilinie uniformă pe orizontală și mișcare rectilinie uniform variată pe verticală."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.projectile.p2`,
                    "În funcție de viteza inițială și unghiul de lansare, proiectilul urmează o traiectorie parabolică. Simulatorul îți permite să modifici unghiul, viteza inițială și înălțimea de lansare pentru a observa cum se schimbă bătaia, înălțimea maximă și timpul de zbor."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={proiectileImg} alt={t(`${M}.projectile.alt`, "Mișcarea proiectilului")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${M}.projectile.formulasHeading`, "Formule pentru mișcarea proiectilului (fără rezistența aerului):")}
                    </h3>
                    {proiectilFormulas
                      .slice(0, visibleFormulasCount.proiectil || proiectilFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 1 && (
                            <h4 className="text-lg font-semibold mb-2">
                              {index + 1}. {t(`${M}.projectile.motionEquationsHeading`, "Ecuațiile de mișcare")}:
                            </h4>
                          )}
                          {index !== 1 && (
                            <h4 className="text-lg font-semibold mb-2">
                              {index + 1}. {item.title}:
                            </h4>
                          )}
                          <div className="formula-resurse text-lg font-mono mb-3">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground mt-4">{noteProjectile}</p>
                  </div>
                  <a href={localizedPath("/simulare/proiectile")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.elasticChains.title`, "Lanțuri elastice")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.elasticChains.p1`,
                    "Un lanț elastic este format dintr-o serie de mase legate între ele prin resorturi (arcuri) care respectă legea lui Hooke. Acest tip de sistem modelează propagarea undelor mecanice într-un mediu discret și comportamentul colectiv al multor oscilatori cuplați."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.elasticChains.p2`,
                    "În simulare poți observa cum o perturbație inițială se propagă de-a lungul lanțului, cum apar reflexii la capete și cum energia se distribuie între oscilațiile diferitelor mase. Este un exemplu excelent pentru a înțelege legătura dintre modele discrete și undele din medii continue."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={lanturiElasticeImg} alt={t(`${M}.elasticChains.alt`, "Lanțuri elastice")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.elasticChains.formulasHeading`, "Formule de bază pentru un lanț elastic:")}</h3>
                    {lanturiElasticeFormulas
                      .slice(0, visibleFormulasCount.lanturiElastice || lanturiElasticeFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-3">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground">
                      {t(
                        `${M}.elasticChains.variablesNote`,
                        "Unde: \\(m\\) este masa fiecărui element, \\(k\\) constanta elastică a resorturilor, iar \\(x_i\\) este deplasarea masei a-i-a față de poziția de echilibru. Diferențele dintre pozițiile vecinilor generează forțele care duc la propagarea perturbațiilor de-a lungul lanțului."
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/lanturi-elastice")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.airDrag.title`, "Frecarea cu aerul (rezistența aerodinamică)")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.airDrag.p1`,
                    "Atunci când un corp se deplasează printr-un fluid (aer, apă etc.), fluidul exercită asupra lui o forță de rezistență numită drag. Această forță se opune mereu direcției de mișcare și crește rapid odată cu viteza — mai exact, proporțional cu pătratul vitezei în regimul turbulent obișnuit."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.airDrag.p2`,
                    "Forma corpului, aria secțiunii transversale și densitatea fluidului determină cât de mare este rezistența. De exemplu, o foaie de hârtie întinsă cade mult mai încet decât aceeași foaie mototolită într-o bilă, deși masa este identică — diferența vine din aria efectivă și coeficientul de drag. Când forța de drag echilibrează greutatea, corpul atinge viteza terminală și nu mai accelerează."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.airDrag.p3`,
                    "Înțelegerea rezistenței aerului este esențială în ingineria aeronautică, balistică, sporturi extreme și chiar în proiectarea vehiculelor eficiente energetic. Numărul Reynolds indică dacă curgerea din jurul corpului este laminară sau turbulentă, influențând direct valoarea coeficientului de drag."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={frecareAerImg} alt={t(`${M}.airDrag.alt`, "Simulare frecare cu aerul")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${M}.airDrag.formulasHeading`, "Formule pentru rezistența aerului:")}</h3>

                    {frecareAerFormulas
                      .slice(0, visibleFormulasCount.frecareAer || frecareAerFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">
                            {index + 1}. {item.title}:
                          </h4>
                          <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                        </div>
                      ))}

                    <p className="text-muted-foreground mt-4">{noteAC}</p>
                  </div>
                  <a href={localizedPath("/simulare/frecare-aer")} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
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

export default MecanicaPage;
