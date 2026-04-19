import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import superconductivitateImg from "/res/screenshots/Supraconductivitate_Screenshot.png";

const electromagnetismSections = [
  {
    title: "Superconductivitate și efectul Meissner",
    intro:
      "Aici vezi partea de electromagnetism observabilă direct: câmp magnetic, levitație și tranziția la stare normală când temperatura depășește Tc.",
    image: superconductivitateImg,
    alt: "Simulator superconductivitate și Meissner",
    href: "/simulare/supraconductivitate",
    cta: "Deschide simulatorul Meissner",
    formulas: [
      {
        title: "Condiția de superconductivitate",
        formula: "\\( T < T_c \\)",
        explanation:
          "Sub temperatura critică \\(T_c\\), materialul intră în fază superconductoare și apare ecranarea câmpului magnetic.",
      },
      {
        title: "Forță magnetică (model educativ)",
        formula: "\\( F_m \\propto \\dfrac{B^2}{h^2} \\)",
        explanation:
          "În simulator, efectul de respingere crește cu pătratul câmpului magnetic \\(B\\) și scade când distanța \\(h\\) crește.",
      },
      {
        title: "Echilibru pe verticală",
        formula: "\\( F_m - mg = m a_y \\)",
        explanation:
          "Levitația stabilă apare când forța magnetică compensează greutatea (\\(F_m \\approx mg\\)).",
      },
      {
        title: "Adâncimea de penetrare London",
        formula: "\\( \\lambda_L = \\sqrt{\\dfrac{m}{\\mu_0 n_s e^2}} \\)",
        explanation:
          "Descrie scara pe care câmpul magnetic pătrunde în superconductori înainte să fie ecranat.",
      },
    ],
  },
];

const ElectromagnetismPage = () => {
  return (
    <Layout>
      <SEO
        title="Electromagnetism | Superconductivitate și efect Meissner - PULS"
        description="Resursă dedicată superconductivității în electromagnetism: efectul Meissner, levitație magnetică, condiția T<Tc și formule explicate pentru simulatorul interactiv."
        keywords="electromagnetism, superconductivitate, efect meissner, levitatie magnetica, temperatura critica, tc, camp magnetic"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Electromagnetism: câmpuri, forțe și aplicații moderne
            </h1>

            <div className="max-w-5xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                Electromagnetismul descrie legătura dintre sarcină electrică, câmp electric, câmp magnetic și undele
                electromagnetice. Este unul dintre pilonii fizicii moderne și baza tehnologiei electrice actuale.
              </p>
              <p className="text-base sm:text-lg leading-7 text-muted-foreground">
                În această pagină păstrăm focusul pe superconductivitate: efectul Meissner, levitația magnetică și
                tranziția către starea normală când temperatura depășește pragul critic.
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              {electromagnetismSections.map((section) => (
                <section key={section.href} className="rounded-container px-4 py-5 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">{section.intro}</p>

                  <div className="image-slider h-64 sm:h-72 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                    <img src={section.image} alt={section.alt} className="w-full h-full object-contain mx-auto my-auto" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Formule și explicații</h3>
                  {section.formulas.map((item) => (
                    <div key={item.title}>
                      <h4 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h4>
                      <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-4">{item.formula}</div>
                      <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">{item.explanation}</p>
                    </div>
                  ))}

                  <MathJaxRender key={section.href} />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6 mt-6">
                    <a href={section.href} className="resurse-link w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto">
                        {section.cta}
                      </Button>
                    </a>
                  </div>
                </section>
              ))}
            </div>
            <MathJaxRender />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ElectromagnetismPage;
