import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useEffect, useMemo, useState } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";

import simulatorPrismaImg from "/res/screenshots/Prisma_Screenshot.png";
import lentilaSubtireImg from "/res/screenshots/Lentila_Subtire_Screenshot.png";
import reflexieRefractieImg from "/res/screenshots/Reflexie_Refractie_Screenshot.png";
import refractieAtmosfericaImg from "/res/screenshots/Refractie_Atmosferica_Screenshot.png";
import spectruImg from "/res/screenshots/spectru_Screenshot.png";
import laserImg from "/res/screenshots/laser_Screenshot.png";

const OpticaPage = () => {
  const { t, localizedPath } = useI18n();
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  const O = "resourcesPage.lessonPages.optics";
  const OF = `${O}.formulas`;

  const lentileSubtireFormulas = useMemo(
    () => [
      {
        formula: "\\( \\frac{1}{f} = \\frac{1}{x_1} + \\frac{1}{x_2} \\)",
        title: t(`${OF}.thinLens.lensEq`, "Formula lentilelor subțiri"),
      },
      {
        formula: "\\( \\beta = \\frac{x_2}{x_1} = \\frac{y_2}{y_1} \\)",
        title: t(`${OF}.thinLens.linearMag`, "Mărirea liniară"),
      },
      {
        formula: "\\( C = \\frac{1}{f} \\)",
        title: t(`${OF}.thinLens.opticalPower`, "Convergența (puterea optică)"),
      },
      {
        formula: "\\( \\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\)",
        title: t(`${OF}.thinLens.lensmaker`, "Formula constructorului de lentile"),
      },
      {
        formula: "\\( C_{total} = C_1 + C_2 + ... + C_n \\)",
        title: t(`${OF}.thinLens.systemPower`, "Convergența sistemului de lentile"),
      },
      {
        formula: "\\( \\gamma = \\frac{\\alpha_2}{\\alpha_1} \\)",
        title: t(`${OF}.thinLens.angularMag`, "Mărirea unghiulară"),
      },
    ],
    [t]
  );

  const reflexieRefractieFormulas = useMemo(
    () => [
      {
        formula: "\\( n = \\frac{c}{v} = \\frac{\\sin(i)}{\\sin(r)} \\)",
        title: t(`${OF}.refractionReflection.index`, "Indicele de refracție"),
      },
      {
        formula: "\\( n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2) \\)",
        title: t(`${OF}.refractionReflection.snell`, "Legea refracției (Snell)"),
      },
      {
        formula: "\\( \\theta_i = \\theta_r \\)",
        title: t(`${OF}.refractionReflection.reflection`, "Legea reflexiei"),
      },
      {
        formula: "\\( \\sin(\\theta_{crit}) = \\frac{n_2}{n_1} \\)",
        title: t(`${OF}.refractionReflection.critical`, "Unghiul critic pentru reflexie totală"),
      },
      {
        formula: "\\( v = \\frac{c}{n} \\)",
        title: t(`${OF}.refractionReflection.speedMedium`, "Viteza luminii în mediu"),
      },
      {
        formula: "\\( \\lambda_n = \\frac{\\lambda_0}{n} \\)",
        title: t(`${OF}.refractionReflection.wavelengthMedium`, "Lungimea de undă în mediu"),
      },
    ],
    [t]
  );

  const prismaFormulas = useMemo(
    () => [
      {
        formula: "\\( \\delta = i_1 + i_2 - A \\)",
        title: t(`${OF}.prism.deviation`, "Unghiul de deviație"),
      },
      {
        formula: "\\( D = \\frac{d\\delta}{d\\lambda} \\)",
        title: t(`${OF}.prism.angularDispersion`, "Dispersia unghiulară"),
      },
      {
        formula: "\\( P = \\frac{n_F - n_C}{n_D - 1} \\)",
        title: t(`${OF}.prism.dispersivePower`, "Puterea dispersivă"),
      },
      {
        formula: "\\( n(\\lambda) = A + \\frac{B}{\\lambda^2} + \\frac{C}{\\lambda^4} \\)",
        title: t(`${OF}.prism.cauchy`, "Formula Cauchy pentru indicele de refracție"),
      },
    ],
    [t]
  );

  const refractieAtmosfericaFormulas = useMemo(
    () => [
      {
        formula: "\\( n_{aer} = 1 + \\frac{77.6}{T}\\left(p + \\frac{4810e}{T}\\right) \\times 10^{-6} \\)",
        title: t(`${OF}.atmospheric.airIndex`, "Indicele de refracție al aerului"),
      },
      {
        formula: "\\( \\theta_r = \\theta_i - \\Delta\\theta \\)",
        title: t(`${OF}.atmospheric.refractionAngle`, "Unghiul de refracție atmosferică"),
      },
      {
        formula: "\\( \\Delta\\theta = 0.00452 \\times \\frac{p}{T} \\times \\tan(z) \\)",
        title: t(`${OF}.atmospheric.horizonCorrection`, "Corecția pentru refracție la înălțimi mici deasupra orizontului"),
      },
    ],
    [t]
  );

  const laserFormulas = useMemo(
    () => [
      {
        formula: "\\( c = \\lambda f \\)",
        title: t(`${OF}.laser.cLambdaf`, "Relația undă–frecvență"),
      },
      {
        formula: "\\( E = hf = \\frac{hc}{\\lambda} \\)",
        title: t(`${OF}.laser.photonE`, "Energia fotonului"),
      },
      {
        formula: "\\( p = \\frac{E}{c} = \\frac{h}{\\lambda} \\)",
        title: t(`${OF}.laser.photonP`, "Impulsul fotonului"),
      },
      {
        formula: "\\( I = \\frac{P}{A} \\)",
        title: t(`${OF}.laser.intensity`, "Intensitatea (putere pe suprafață)"),
      },
      {
        formula: "\\( I(r) = \\frac{P}{4\\pi r^2} \\)",
        title: t(`${OF}.laser.inverseSquare`, "Legea inversului pătrat (surse punctiforme)"),
      },
      {
        formula: "\\( \\theta \\approx \\frac{\\lambda}{\\pi w_0} \\)",
        title: t(`${OF}.laser.minDiv`, "Divergența minimă (aprox. fascicul gaussian)"),
      },
      {
        formula: "\\( z_R = \\frac{\\pi w_0^2}{\\lambda} \\)",
        title: t(`${OF}.laser.rayleigh`, "Distanța Rayleigh"),
      },
    ],
    [t]
  );

  const spectruFormulas = useMemo(
    () => [
      {
        formula: "\\( c = \\lambda f \\)",
        title: t(`${OF}.spectrum.cLambdaf`, "Relația undă–frecvență"),
      },
      { formula: "\\( E = hf \\)", title: t(`${OF}.spectrum.photonE`, "Energia fotonului") },
      {
        formula: "\\( p = \\frac{h}{\\lambda} \\)",
        title: t(`${OF}.spectrum.photonP`, "Impulsul fotonului"),
      },
      {
        formula: "\\( I = \\frac{P}{A} \\)",
        title: t(`${OF}.spectrum.intensityPlane`, "Intensitatea (undă plană)"),
      },
      {
        formula: "\\( I(r) = \\frac{P}{4\\pi r^2} \\)",
        title: t(`${OF}.spectrum.inverseSquare`, "Legea inversului pătrat (propagare sferică)"),
      },
      {
        formula: "\\( \\lambda_{max} T = b \\) (b \\approx 2{,}898\\times 10^{-3}\\,\\text{m·K})",
        title: t(`${OF}.spectrum.wien`, "Legea Wien (radiație termică)"),
      },
      {
        formula: "\\( P = \\sigma \\varepsilon A T^4 \\)",
        title: t(`${OF}.spectrum.stefanBoltzmann`, "Stefan–Boltzmann (putere radiată)"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const sections = [
      { key: "lentile_subtire", formulas: lentileSubtireFormulas },
      { key: "reflexie_refractie", formulas: reflexieRefractieFormulas },
      { key: "prisma", formulas: prismaFormulas },
      { key: "refractie_atmosferica", formulas: refractieAtmosfericaFormulas },
      { key: "laser", formulas: laserFormulas },
      { key: "spectru", formulas: spectruFormulas },
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
    lentileSubtireFormulas,
    reflexieRefractieFormulas,
    prismaFormulas,
    refractieAtmosfericaFormulas,
    laserFormulas,
    spectruFormulas,
  ]);

  const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

  return (
    <Layout>
      <SEO
        title={t(`${O}.seo.title`, "Resurse Optică | Lentile, reflexie, refracție - PULS")}
        description={t(
          `${O}.seo.description`,
          "Învață despre optică: lentile subțiri, reflexie, refracție, prismă, interferență, difracție și polarizare. Teorie și simulări."
        )}
        keywords={t(`${O}.seo.keywords`, "optică, lentile, reflexie, refracție, Snell, prismă, interferență, difracție, PULS")}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t(`${O}.pageTitle`, "Optică")}</h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${O}.intro.p1`,
                  "Optica este ramura fizicii care studiază comportamentul și proprietățile luminii, precum și interacțiunile acesteia cu materia. Această disciplină fundamentală include optică geometrică, optică fizică și optică cuantică."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${O}.intro.p2`,
                  "Studiul opticii acoperă fenomene precum reflexia, refracția, interferența, difracția și polarizarea luminii. Aceste fenomene sunt esențiale pentru înțelegerea sistemelor optice, de la lentile simple până la dispozitive optice complexe."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  `${O}.intro.p3`,
                  "Aplicațiile opticii sunt numeroase și variate, de la sisteme de iluminat și imagistică medicală până la tehnologii avansate precum laserul și fibra optică."
                )}
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.thinLens.title`, "Lentile Subțiri")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.thinLens.p1`,
                    "Lentilele subțiri sunt dispozitive optice care refractă lumina pentru a forma imagini. Ele pot fi convergente (convexe) sau divergente (concave), fiecare având caracteristici specifice de formare a imaginilor."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.thinLens.p2`,
                    "Studiul lentilelor subțiri este fundamental pentru înțelegerea sistemelor optice și a formării imaginilor. Ecuațiile lentilelor permit calcularea poziției și mărimii imaginilor formate de lentile în funcție de poziția obiectului."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={lentilaSubtireImg}
                    alt={t(`${O}.thinLens.alt`, "Simulator Lentilă Subțire")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${O}.thinLens.formulasHeading`, "Formule pentru lentile subțiri:")}</h3>

                    {lentileSubtireFormulas
                      .slice(0, visibleFormulasCount.lentile_subtire || lentileSubtireFormulas.length)
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
                        `${O}.thinLens.variablesNote`,
                        "Unde: f este distanța focală, x₁ este distanța obiectului, x₂ este distanța imaginii, β este mărirea liniară, y₁ este înălțimea obiectului, y₂ este înălțimea imaginii, C este convergența, n este indicele de refracție, R₁ și R₂ sunt razele de curbură, γ este mărirea unghiulară, α₁ și α₂ sunt unghiurile."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/lentila-subtire")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.refractionReflection.title`, "Refracție și Reflexie")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.refractionReflection.p1`,
                    "Refracția și reflexia sunt fenomene fundamentale care descriu comportamentul luminii la interfața dintre două medii cu indici de refracție diferiți. Aceste fenomene sunt guvernate de legile reflexiei și refracției."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.refractionReflection.p2`,
                    "Legea refracției, cunoscută și sub numele de legea lui Snell, descrie relația dintre unghiurile de incidență și refracție și indicii de refracție ai mediilor. Reflexia totală internă apare când lumina trece dintr-un mediu cu indice de refracție mai mare într-unul cu indice mai mic. Fenomene spectaculoase precum mirajul în deșert sau „îndoirea” aparentă a obiectelor în apă pot fi explicate prin variația indicelui de refracție."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={reflexieRefractieImg}
                    alt={t(`${O}.refractionReflection.alt`, "Simulator Reflexie și Refracție")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${O}.refractionReflection.formulasHeading`, "Formule pentru refracție și reflexie:")}
                    </h3>

                    {reflexieRefractieFormulas
                      .slice(0, visibleFormulasCount.reflexie_refractie || reflexieRefractieFormulas.length)
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
                        `${O}.refractionReflection.variablesNote`,
                        "Unde: n este indicele de refracție, c este viteza luminii în vid, v este viteza luminii în mediu, i este unghiul de incidență, r este unghiul de refracție, θ₁ și θ₂ sunt unghiurile în cele două medii, θᵢ și θᵣ sunt unghiurile de incidență și reflexie, θcrit este unghiul critic, λ₀ este lungimea de undă în vid, λₙ este lungimea de undă în mediu."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/reflexie-refractie")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.prism.title`, "Prisma și Dispersia Luminii")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.prism.p1`,
                    "Prisma este un dispozitiv optic care refractă lumina și o descompune în componentele sale spectrale. Acest fenomen, numit dispersie, apare deoarece indicele de refracție al materialului prismei variază cu lungimea de undă."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.prism.p2`,
                    "Dispersia luminii este responsabilă pentru formarea curcubeului și pentru funcționarea multor instrumente optice. Studiul prismei și al dispersiei este esențial pentru înțelegerea comportamentului luminii în medii dispersive."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorPrismaImg}
                    alt={t(`${O}.prism.alt`, "Prisma")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${O}.prism.formulasHeading`, "Formule pentru prismă și dispersie:")}
                    </h3>

                    {prismaFormulas
                      .slice(0, visibleFormulasCount.prisma || prismaFormulas.length)
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
                        `${O}.prism.variablesNote`,
                        "Unde: δ este deviația, n este indicele de refracție, A este unghiul prismei, i₁ și i₂ sunt unghiurile de incidență și de ieșire, D este dispersia unghiulară, λ este lungimea de undă, P este puterea dispersivă, nF, nC, nD sunt indicii de refracție pentru diferite lungimi de undă, A, B, C sunt constante (Cauchy)."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/prisma")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.atmospheric.title`, "Refracție Atmosferică")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.atmospheric.p1`,
                    "Refracția atmosferică este fenomenul prin care lumina se curbează când trece prin straturile atmosferei cu densități diferite. Acest fenomen este responsabil pentru efecte optice precum mirajul în deșert și apariția soarelui deasupra orizontului chiar și după ce geometric s-a așezat."
                  )}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.atmospheric.p2`,
                    "Studiul refracției atmosferice este important pentru astronomie, navigație și meteorologie. Acest fenomen demonstrează cum proprietățile optice ale atmosferei pot afecta observațiile și măsurătorile."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={refractieAtmosfericaImg}
                    alt={t(`${O}.atmospheric.alt`, "Simulator Miraj în Deșert")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${O}.atmospheric.formulasHeading`, "Formule pentru refracție atmosferică și miraj:")}
                    </h3>

                    {refractieAtmosfericaFormulas
                      .slice(0, visibleFormulasCount.refractie_atmosferica || refractieAtmosfericaFormulas.length)
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
                        `${O}.atmospheric.variablesNote`,
                        "Unde: nₐₑᵣ este indicele de refracție al aerului, T este temperatura în Kelvin, p este presiunea în hPa, e este presiunea vaporilor de apă, θᵢ este unghiul de incidență, θᵣ este unghiul de refracție, Δθ este corecția pentru refracție, z este distanța zenitală."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/refractie-atmosferica")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.laser.title`, "Laser")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.laser.p1`,
                    "Laserul produce un fascicul coerent, aproape monocromatic, cu divergență mică. În aplicații (telecomunicații, medicină, metrologie), contează legătura dintre lungimea de undă, frecvență, energie și intensitate."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img src={laserImg} alt={t(`${O}.laser.alt`, "Laser")} className="w-full h-full object-contain mx-auto my-auto" />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${O}.laser.formulasHeading`, "Formule esențiale:")}</h3>

                    {laserFormulas
                      .slice(0, visibleFormulasCount.laser || laserFormulas.length)
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
                        `${O}.laser.variablesNote`,
                        "Unde: c = viteza luminii, λ = lungimea de undă, f = frecvența, h = constanta lui Planck, E = energia, p = impulsul, P = puterea, A = aria, r = distanța, θ = divergența, w₀ = raza „waist”-ului, zR = distanța Rayleigh."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/laser")}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">{viewSimulation}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${O}.emSpectrum.title`, "Spectrul electromagnetic")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${O}.emSpectrum.p1`,
                    "Undele electromagnetice se descriu prin frecvență și lungime de undă, iar energia asociată fotonilor crește odată cu frecvența. Spectrul include radio, microunde, infraroșu, vizibil, UV, raze X și gamma."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={spectruImg}
                    alt={t(`${O}.emSpectrum.alt`, "Spectrul electromagnetic")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t(`${O}.emSpectrum.formulasHeading`, "Formule esențiale:")}</h3>

                    {spectruFormulas
                      .slice(0, visibleFormulasCount.spectru || spectruFormulas.length)
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
                        `${O}.emSpectrum.variablesNote`,
                        "Unde: c = viteza luminii, λ = lungimea de undă, f = frecvența, h = constanta lui Planck, E = energia fotonului, p = impulsul, P = puterea, A = aria, r = distanța, \\(\\lambda_{max}\\) = lungimea de undă la maxim, T = temperatura absolută, b = constanta Wien, σ = constanta Stefan–Boltzmann, ε = emisivitatea."
                      )}
                    </p>
                  </div>
                  <a
                    href={localizedPath("/simulare/spectru-electromagnetic")}
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

export default OpticaPage;
