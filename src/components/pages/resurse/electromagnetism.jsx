import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useMemo } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";
import { pickSimulationThumbFromSimularePath } from "@/lib/simulationScreenshots";

import supraconductivitateImg from "/res/screenshots/Supraconductivitate_Screenshot.png";
import fuelCellImg from "/res/screenshots/Fuel_Cell_Screenshot.png";

const SECTION_META = [
  {
    key: "meissner",
    image: supraconductivitateImg,
    href: "/simulare/supraconductivitate",
    formulaKeys: ["tc", "fm", "balance", "london"],
    formulas: [
      {
        formula: "\\( T < T_c \\)",
      },
      {
        formula: "\\( F_m \\propto \\dfrac{B^2}{h^2} \\)",
      },
      {
        formula: "\\( F_m - mg = m a_y \\)",
      },
      {
        formula: "\\( \\lambda_L = \\sqrt{\\dfrac{m}{\\mu_0 n_s e^2}} \\)",
      },
    ],
  },
  {
    key: "fuelCell",
    image: fuelCellImg,
    href: "/simulare/fuel-cell",
    formulaKeys: ["global", "power", "ohm", "efficiency"],
    formulas: [
      {
        formula:
          "\\( 2\\mathrm{H}_2 + \\mathrm{O}_2 \\rightarrow 2\\mathrm{H}_2\\mathrm{O} + \\text{energie} \\)",
      },
      {
        formula: "\\( P = U I \\)",
      },
      {
        formula: "\\( I \\approx \\dfrac{U}{R} \\)",
      },
      {
        formula: "\\( \\eta \\approx \\dfrac{P_{\\text{electric}}}{P_{\\text{chimic disponibil}}} \\)",
      },
    ],
  },
];

const RO_FALLBACK = {
  meissner: {
    title: "Supraconductivitate și efectul Meissner",
    intro:
      "Aici vezi partea de electromagnetism observabilă direct: câmp magnetic, levitație și tranziția la stare normală când temperatura depășește Tc.",
    alt: "Simulator supraconductivitate și Meissner",
    cta: "Deschide simulatorul Meissner",
    formulasHeading: "Formule și explicații",
    formulas: [
      {
        title: "Condiția de supraconductivitate",
        explanation:
          "Sub temperatura critică \\(T_c\\), materialul intră în fază supraconductoare și apare ecranarea câmpului magnetic.",
      },
      {
        title: "Forță magnetică (model educativ)",
        explanation:
          "În simulator, efectul de respingere crește cu pătratul câmpului magnetic \\(B\\) și scade când distanța \\(h\\) crește.",
      },
      {
        title: "Echilibru pe verticală",
        explanation:
          "Levitația stabilă apare când forța magnetică compensează greutatea (\\(F_m \\approx mg\\)).",
      },
      {
        title: "Adâncimea de penetrare London",
        explanation:
          "Descrie scara pe care câmpul magnetic pătrunde în supraconductori înainte să fie ecranat.",
      },
    ],
  },
  fuelCell: {
    title: "Pilă cu combustibil (PEM)",
    intro:
      "Celula cu membrană schimbatoare de protoni transformă energia chimică a hidrogenului și oxigenului în curent electric: la anod H₂ se oxidează, electronii merg prin circuitul exterior, iar H⁺ traversează membrana spre catod unde se reduce O₂ și se formează apă.",
    alt: "Simulator fuel cell PEM",
    cta: "Deschide simulatorul fuel cell",
    formulasHeading: "Formule și explicații",
    formulas: [
      {
        title: "Reacția globală (model educativ)",
        explanation:
          "Este bilanțul chimic al pilei cu hidrogen: hidrogenul și oxigenul se consumă, se produce apă, iar o parte din energia eliberată apare ca lucru electric în circuit.",
      },
      {
        title: "Puterea electrică livrată sarcinii",
        explanation:
          "Puterea utilă la borne este produsul dintre tensiunea \\(U\\) și curentul \\(I\\). În simulator, creșterea debitelor sau scăderea rezistenței becului măresc \\(I\\) și deci \\(P\\).",
      },
      {
        title: "Legea lui Ohm (sarcină simplă)",
        explanation:
          "Pentru o sarcină rezistivă \\(R\\), curentul este legat de tensiunea disponibilă. Modelul didactic limitează curentul și la debitul de reactanți.",
      },
      {
        title: "Randament (definiție orientativă)",
        explanation:
          "Randamentul compară puterea electrică obținută cu puterea asociată fluxului chimic de reactanți. Dezechilibrul H₂/O₂ sau pierderile interne scad \\(\\eta\\).",
      },
    ],
  },
};

const ElectromagnetismPage = () => {
  const { t, localizedPath, lang } = useI18n();
  const mathRootRef = useMathJaxTypesetRoot();

  const E = "resourcesPage.lessonPages.electromagnetism";
  const ES = `${E}.sections`;

  const sections = useMemo(
    () =>
      SECTION_META.map((meta) => {
        const fb = RO_FALLBACK[meta.key];
        return {
          href: meta.href,
          image: meta.image,
          title: t(`${ES}.${meta.key}.title`, fb.title),
          intro: t(`${ES}.${meta.key}.intro`, fb.intro),
          alt: t(`${ES}.${meta.key}.alt`, fb.alt),
          cta: t(`${ES}.${meta.key}.cta`, fb.cta),
          formulasHeading: t(`${ES}.${meta.key}.formulasHeading`, fb.formulasHeading),
          formulas: meta.formulas.map((item, i) => ({
            formula: item.formula,
            title: t(`${ES}.${meta.key}.formulas.${meta.formulaKeys[i]}.title`, fb.formulas[i].title),
            explanation: t(
              `${ES}.${meta.key}.formulas.${meta.formulaKeys[i]}.explanation`,
              fb.formulas[i].explanation
            ),
          })),
        };
      }),
    [t, lang]
  );

  return (
    <Layout>
      <SEO
        title={t(`${E}.seo.title`, "Electromagnetism | Supraconductivitate, Meissner și fuel cell - PULS")}
        description={t(
          `${E}.seo.description`,
          "Electromagnetism aplicat: efectul Meissner și supraconductivitate, plus pilă cu combustibil PEM — reacție H₂/O₂, tensiune, curent, putere și eficiență, cu simulări interactive."
        )}
        keywords={t(
          `${E}.seo.keywords`,
          "electromagnetism, supraconductivitate, efect meissner, fuel cell, pila cu combustibil, hidrogen, pem, tensiune, curent"
        )}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10 tex2jax_process">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              {t(`${E}.pageTitle`, "Electromagnetism: câmpuri, forțe și aplicații moderne")}
            </h1>

            <div className="max-w-5xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                {t(
                  `${E}.intro.p1`,
                  "Electromagnetismul descrie legătura dintre sarcină electrică, câmp electric, câmp magnetic și undele electromagnetice. Este unul dintre pilonii fizicii moderne și baza tehnologiei electrice actuale."
                )}
              </p>
              <p className="text-base sm:text-lg leading-7 text-muted-foreground">
                {t(
                  `${E}.intro.p2`,
                  "Găsești supraconductivitatea (Meissner, levitație) și o pilă cu combustibil PEM: cum H₂ și O₂ produc curent prin separarea sarcinilor și circulația electronilor în circuitul exterior."
                )}
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              {sections.map((section) => (
                <section key={section.href} className="rounded-container px-4 py-5 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">{section.intro}</p>

                  <div className="image-slider h-64 sm:h-72 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                    <img
                      src={pickSimulationThumbFromSimularePath(section.image, section.href, lang)}
                      alt={section.alt}
                      className="w-full h-full object-contain mx-auto my-auto"
                    />
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-4">{section.formulasHeading}</h3>
                  {section.formulas.map((item) => (
                    <div key={item.title}>
                      <h4 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h4>
                      <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-4">{item.formula}</div>
                      <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">{item.explanation}</p>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6 mt-6">
                    <a href={localizedPath(section.href)} className="resurse-link w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto">
                        {section.cta}
                      </Button>
                    </a>
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ElectromagnetismPage;
