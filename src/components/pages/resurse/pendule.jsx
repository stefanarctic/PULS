import { useEffect, useState, useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { Button } from "../../Button";

import simulatorPendulSimpluImg from "/res/screenshots/Simplu_Screenshot.png";
import simulatorPendulAmortizatImg from "/res/screenshots/Amortizat_Screenshot.png";
import simulatorGraficePendulImg from "/res/screenshots/Grafice_Pendule_Screenshot.png";
import simulatorTrasnitPendulImg from "/res/screenshots/Trasnit_Screenshot.png";
import penduleMultipleImg from "/res/screenshots/Pendule_Multiple_Screenshot.png";

import VideoPendul from "/res/Videos/Pendul Video.mp4";
import Layout from "../../Layout";
import SEO from "../../SEO";
import { useI18n } from "@/i18n/LanguageContext";

const PendulePage = () => {
  const { t, localizedPath, lang } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const graficeFormulas = useMemo(
    () => [
      {
        formula: "\\( y(t) = A \\sin(\\omega t + \\phi) \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.motionEq", "Legea Mişcării"),
      },
      {
        formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.velocityEq", "Legea Vitezei"),
      },
      {
        formula: "\\( a(t) = -\\omega ^2 A \\sin(\\omega t + \\phi) \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.accelEq", "Legea Acceleratiei"),
      },
    ],
    [t]
  );

  const pendulSimpluFormulas = useMemo(
    () => [
      {
        formula: "\\( T = 2\\pi \\cdot \\sqrt{\\frac{l}{g}} \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.periodFormula", "Formula perioadei"),
      },
    ],
    [t]
  );

  const pendulAmortizatFormulas = useMemo(
    () => [
      {
        formula: "\\( m\\frac{d^2x}{dt^2} + b\\frac{dx}{dt} + kx = 0 \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.eqMotion", "Ecuația de mișcare"),
      },
    ],
    [t]
  );

  const pendulNeliniarFormulas = useMemo(
    () => [
      {
        formula: "\\( \\frac{d^2\\theta}{dt^2} + \\frac{g}{l} \\sin\\theta = 0 \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.eqMotion", "Ecuația de mișcare"),
      },
    ],
    [t]
  );

  const penduleMultipleFormulas = useMemo(
    () => [
      {
        formula: "\\( \\frac{d^2\\theta_i}{dt^2} + \\frac{g}{l} \\sin\\theta_i = 0 \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.eachPendulum", "Ecuația pentru fiecare pendul"),
      },
      {
        formula:
          "\\( \\frac{d^2\\theta_i}{dt^2} + \\omega_0^2 \\, \\theta_i = 0, \\quad \\omega_0 = \\sqrt{\\frac{g}{l}} \\)",
        title: t("resourcesPage.lessonPages.pendulums.formatsFormulas.smallAngleApprox", "Aproximare pentru unghiuri mici"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const sections = [
      { key: "grafice", formulas: graficeFormulas },
      { key: "pendulSimplu", formulas: pendulSimpluFormulas },
      { key: "pendulAmortizat", formulas: pendulAmortizatFormulas },
      { key: "pendulNeliniar", formulas: pendulNeliniarFormulas },
      { key: "penduleMultiple", formulas: penduleMultipleFormulas },
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
  }, [graficeFormulas, pendulSimpluFormulas, pendulAmortizatFormulas, pendulNeliniarFormulas, penduleMultipleFormulas]);

  const Images = [
    { src: simulatorGraficePendulImg, alt: t("resourcesPage.lessonPages.pendulums.harmonicGraphs.altCharts", "Grafice Pendul") },
    { src: simulatorPendulSimpluImg, alt: t("resourcesPage.lessonPages.pendulums.formats.simple", "Pendulul Simplu") },
    { src: simulatorPendulAmortizatImg, alt: t("resourcesPage.lessonPages.pendulums.formats.damped", "Pendulul Amortizat") },
    { src: simulatorTrasnitPendulImg, alt: t("resourcesPage.lessonPages.pendulums.formats.mechanical", "Pendulul Mecanic") },
    { src: VideoPendul, alt: t("resourcesPage.lessonPages.pendulums.formats.videoPendulum", "Video Pendul") },
  ];

  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  return (
    <Layout>
      <SEO
        title={t("resourcesPage.lessonPages.pendulums.seo.title", "Resurse Pendule | Mișcarea Oscilatorie Armonică - PULS")}
        description={t(
          "resourcesPage.lessonPages.pendulums.seo.description",
          "Învață despre mișcarea oscilatorie armonică și pendule. Materiale teoretice, formule, simulări interactive și video-uri educaționale pentru pendulul simplu, amortizat și neliniar."
        )}
        keywords={t(
          "resourcesPage.lessonPages.pendulums.seo.keywords",
          "pendule, mișcare oscilatorie, pendul simplu, pendul amortizat, oscilații armonice, fizică pendule"
        )}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("resourcesPage.lessonPages.pendulums.intro.title", "Mișcarea oscilatorie armonică. ")}
            </h1>
            <div className="max-w-3xl mb-10 mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("resourcesPage.lessonPages.pendulums.intro.subtitle", "Proprietățile mișcării oscilatorii armonice. ")}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.pendulums.intro.p1",
                  "Oscilatorul liniar armonic este un sistem fizic idealizat care descrie mișcarea periodică a unui obiect supus unei forțe restauratoare proporționale cu deplasarea sa față de poziția de echilibru. Este un model fundamental în fizică, cu aplicații în mecanică, electricitate, acustică și chiar mecanica cuantică."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  "resourcesPage.lessonPages.pendulums.intro.p2",
                  "Explorează simulările noastre pentru a vizualiza comportamentul oscilatorilor armonici și pentru a înțelege mai bine conceptele de bază precum perioada, frecvența și amplitudinea."
                )}
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.pendulums.harmonicGraphs.title", "Grafice Armonice")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.pendulums.harmonicGraphs.p",
                    "Mișcarea oscilatorie armonică este caracterizată printr-o oscilație periodică, care poate fi reprezentată grafic printr-o funcție sinusoidală."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={Images[0].src} alt={Images[0].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t(
                        "resourcesPage.lessonPages.pendulums.harmonicGraphs.equationsLead",
                        "Ecuațiile mișcării oscilatorii aduse la formă sinusoidală sunt:"
                      )}
                    </h3>
                    {graficeFormulas
                      .slice(0, visibleFormulasCount.grafice || graficeFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                          <div className="formula-resurse text-lg font-mono">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground mt-2">
                      {lang === "en" ? (
                        t(
                          "resourcesPage.lessonPages.pendulums.harmonicGraphs.variablesNote",
                          "unde A este amplitudinea, \\(\\omega\\) este viteza unghiulară, \\(\\phi\\) este unghiul initial, iar t este perioada."
                        )
                      ) : (
                        <>
                          unde A este amplitudinea, {"\\(\\omega\\)"} este viteza unghiulară, {"\\(\\phi\\)"} este unghiul
                          initial, iar t este perioada.
                        </>
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/grafice-pendule")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("resourcesPage.lessonPages.pendulums.sectionPendulums.title", "Pendule")}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  "resourcesPage.lessonPages.pendulums.sectionPendulums.p1",
                  "Pendulul este un exemplu clasic de sistem oscilatoriu. Studierea mișcării pendulului ne ajută să înțelegem concepte fundamentale precum perioada, frecvența și forța de restabilire."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  "resourcesPage.lessonPages.pendulums.sectionPendulums.p2",
                  "Explorează simulările noastre pentru a vizualiza comportamentul diferitelor tipuri de pendule."
                )}
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.pendulums.simplePendulum.title", "Pendulul gravitational")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.pendulums.simplePendulum.p",
                    "Pendulul gravitațional este un ansamblu format dintr-un corp punctiform de masă m, atârnat de un fir inextensibil, de masă neglijabilă și lungime l. Dacă corpul este scos din poziția de echilibru și lăsat liber, pentru unghiuri mici de deviație el va oscila liniar armonic cu perioada de oscilație:"
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={Images[1].src} alt={Images[1].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    {pendulSimpluFormulas
                      .slice(0, visibleFormulasCount.pendulSimplu || pendulSimpluFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                          <div className="formula-resurse text-lg font-mono">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground mt-2">
                      {t(
                        "resourcesPage.lessonPages.pendulums.simplePendulum.variablesNote",
                        "unde l este lungimea pendulului, iar g este accelerația gravitațională."
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/pendul-simplu")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.pendulums.dampedSection.title", "Pendulul Amortizat")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.pendulums.dampedSection.p",
                    "Pendulul amortizat este un sistem oscilatoriu în care oscilațiile sunt reduse treptat datorită forțelor de frecare sau rezistență, cum ar fi aerul sau alte medii. Acest tip de pendul este important pentru înțelegerea fenomenelor reale în care energia este disipată."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={Images[2].src} alt={Images[2].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("resourcesPage.lessonPages.pendulums.dampedSection.characteristics", "Caracteristici:")}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b1", "Oscilații cu amplitudine în scădere")}</li>
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b2", "Perioada de oscilație depinde de coeficientul de amortizare")}</li>
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b3", "Comportament complex la oscilații mari")}</li>
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b4", "Relația între forța de restabilire și viteza este liniară")}</li>
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b5", "Exemplu: pendul cu frecare")}</li>
                      <li>{t("resourcesPage.lessonPages.pendulums.dampedSection.b6", "Ecuația de mișcare:")}</li>
                      {pendulAmortizatFormulas
                        .slice(0, visibleFormulasCount.pendulAmortizat || pendulAmortizatFormulas.length)
                        .map((item, index) => (
                          <div key={index} className="formula-resurse text-lg font-mono">
                            {item.formula}
                          </div>
                        ))}
                    </ul>
                  </div>
                  <a href={localizedPath("/simulare/pendul-amortizat")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.pendulums.nonlinearSection.title", "Pendul simplu neliniar")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.pendulums.nonlinearSection.p",
                    "Este compus dintr-o masă (punctuală) legată de un fir inextensibil, care oscilează sub acțiunea gravitației, fără a aproxima unghiul. Pentru unghiuri mari, soluția nu mai este sinusoidală, iar perioada depinde de amplitudinea oscilației."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={Images[3].src} alt={Images[3].alt} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("resourcesPage.lessonPages.pendulums.nonlinearSection.formulasTitle", "Formule:")}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {t(
                        "resourcesPage.lessonPages.pendulums.nonlinearSection.introLine",
                        "Ecuația de mișcare pentru pendulul simplu neliniar este:"
                      )}
                    </p>
                    {pendulNeliniarFormulas
                      .slice(0, visibleFormulasCount.pendulNeliniar || pendulNeliniarFormulas.length)
                      .map((item, index) => (
                        <div key={index} className="formula-resurse text-lg font-mono mt-2">
                          {item.formula}
                        </div>
                      ))}
                    <p className="text-muted-foreground mt-2">
                      {lang === "en" ? (
                        t(
                          "resourcesPage.lessonPages.pendulums.nonlinearSection.variablesNote",
                          "unde \\(\\theta\\) este unghiul de deviație, l este lungimea firului și g este accelerația gravitațională."
                        )
                      ) : (
                        <>
                          unde {"\\(\\theta\\)"} este unghiul de deviație, l este lungimea firului și g este accelerația
                          gravitațională.
                        </>
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/pendul-neliniar")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">
                  {t("resourcesPage.lessonPages.pendulums.multipleSection.title", "Pendule multiple")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "resourcesPage.lessonPages.pendulums.multipleSection.p",
                    "Simulatorul de pendule multiple permite observarea comportamentului haotic al mai multor pendule care pornesc din condiții inițiale foarte apropiate. Deși diferențele inițiale sunt mici, traiectoriile lor devin rapid complet diferite, un exemplu spectaculos de sensibilitate la condițiile inițiale (haos determinist)."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={penduleMultipleImg}
                    alt={t("resourcesPage.lessonPages.pendulums.multipleSection.altSimulator", "Simulator Pendule Multiple")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("resourcesPage.lessonPages.pendulums.multipleSection.observeHeading", "Ce poți observa în simulare:")}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>{t("resourcesPage.lessonPages.pendulums.multipleSection.o1", "Cum pendule duble aproape identice se desincronizează rapid datorită naturii neliniare a mișcării.")}</li>
                      <li>
                        {t(
                          "resourcesPage.lessonPages.pendulums.multipleSection.o2",
                          "Urmele colorate ale fiecărui pendul, care evidențiază traiectoriile complexe și aparent „dezordonate”."
                        )}
                      </li>
                      <li>
                        {t(
                          "resourcesPage.lessonPages.pendulums.multipleSection.o3",
                          "Tranziția de la mișcare „aproape periodică” la comportament haotic pentru anumite valori ale parametrilor."
                        )}
                      </li>
                    </ul>
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {t("resourcesPage.lessonPages.pendulums.multipleSection.usefulHeading", "Formule utile:")}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {t(
                        "resourcesPage.lessonPages.pendulums.multipleSection.eachFollows",
                        "Fiecare pendul individual urmează, în ipoteza idealizată (fără frecare), aceeași ecuație neliniară ca pendulul simplu, dar cu condiții inițiale ușor diferite:"
                      )}
                    </p>
                    {penduleMultipleFormulas
                      .slice(0, visibleFormulasCount.penduleMultiple || penduleMultipleFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 1 && (
                            <p className="text-muted-foreground mb-2">
                              {t(
                                "resourcesPage.lessonPages.pendulums.multipleSection.smallAnglesLead",
                                "Pentru unghiuri mici, fiecare pendul poate fi aproximat ca oscilator armonic:"
                              )}
                            </p>
                          )}
                          <div className="formula-resurse text-lg font-mono mb-3">{item.formula}</div>
                        </div>
                      ))}
                    <p className="text-muted-foreground">
                      {lang === "en" ? (
                        t(
                          "resourcesPage.lessonPages.pendulums.multipleSection.sensitivityClosing",
                          "Chiar dacă ecuațiile par simple, soluțiile pentru sisteme cu pendule multiple sunt extrem de sensibile la condițiile inițiale: o mică modificare a lui \\(\\theta_i(0)\\) sau \\(\\dot{\\theta}_i(0)\\) duce la traiectorii complet diferite în timp, exact ceea ce vezi în simulare."
                        )
                      ) : (
                        <>
                          Chiar dacă ecuațiile par simple, soluțiile pentru sisteme cu pendule multiple sunt extrem de
                          sensibile la condițiile inițiale: o mică modificare a lui {"\\(\\theta_i(0)\\)"} sau{" "}
                          {"\\(\\dot{\\theta}_i(0)\\)"} duce la traiectorii complet diferite în timp, exact ceea ce vezi
                          în simulare.
                        </>
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/pendule-multiple")} className="resurse-link">
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

export default PendulePage;
