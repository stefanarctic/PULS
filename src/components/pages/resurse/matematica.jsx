import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";
import { pickSimulationThumb } from "@/lib/simulationScreenshots";

import simulatorFunctiiImg from "/res/screenshots/Functii_Screenshot.png";
import vizualizator4dImg from "/res/screenshots/Vizualizator_4d_Screenshot.png";

const MatematicaPage = () => {
  const mathRootRef = useMathJaxTypesetRoot();
  const { t, localizedPath, lang } = useI18n();
  const M = "resourcesPage.lessonPages.mathematics";

  return (
    <Layout>
      <SEO
        title={t(`${M}.seo.title`, "Matematică | Funcții și Vizualizator 4D - PULS")}
        description={t(
          `${M}.seo.description`,
          "Învață despre funcții matematice, grafice și vizualizarea obiectelor în spațiul 4D. Materiale teoretice, formule și simulări interactive pentru grafice de funcții și vizualizatorul 4D."
        )}
        keywords={t(`${M}.seo.keywords`, "matematică, funcții, grafice, vizualizator 4D, hipercub, geometrie 4D, PULS")}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t(`${M}.pageTitle`, "Matematică – Funcții și Vizualizator 4D")}
            </h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${M}.intro.p1`,
                  "Matematica oferă limbajul precis pentru descrierea fenomenelor fizice. În această secțiune explorăm reprezentarea grafică a funcțiilor și vizualizarea obiectelor în spațiul cu patru dimensiuni, concepte utile atât în analiză cât și în fizică teoretică."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  `${M}.intro.p2`,
                  "Graficele de funcții permit să vedem relațiile între mărimi, iar vizualizatorul 4D ilustrează cum obiectele geometrice pot fi extinse în spații cu mai multe dimensiuni."
                )}
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.graphs.title`, "Grafice de funcții")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.graphs.p`,
                    "Reprezentarea grafică a funcțiilor pune în evidență proprietățile acestora: domeniu, codomeniu, zerouri, extreme și comportament la limită. Funcțiile elementare (polinomiale, trigonometrice, exponențiale, logaritmice) sunt fundamentale în modelarea fizicii."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(simulatorFunctiiImg, "grafice-functii", lang)}
                    alt={t(`${M}.graphs.alt`, "Grafice Funcții")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${M}.graphs.formulasHeading`, "Formule și relații utile pentru funcții:")}
                    </h3>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_linear`, "1. Funcție liniară:")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">{"\\( y = ax + b \\)"}</div>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_quadratic`, "2. Funcție pătratică:")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">{"\\( y = ax^2 + bx + c \\)"}</div>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_trig`, "3. Funcții trigonometrice:")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( y = \\sin(x), \\quad y = \\cos(x), \\quad y = \\tan(x) \\)"}
                    </div>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_exp`, "4. Funcție exponențială:")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">{"\\( y = e^x, \\quad y = a^x \\)"}</div>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_log`, "5. Funcție logaritmică:")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">{"\\( y = \\ln(x), \\quad y = \\log_a(x) \\)"}</div>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.graphs.h_derivative`, "6. Derivată (pantă):")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\)"}
                    </div>

                    <p className="text-muted-foreground mt-4">
                      {t(
                        `${M}.graphs.legend`,
                        "Unde: a, b, c sunt parametri; x este variabila independentă; derivata descrie viteza de schimbare a funcției."
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/grafice-functii")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{t(`${M}.graphs.ctaSim`, "Vezi simularea")}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${M}.fourD.title`, "Vizualizator 4D")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${M}.fourD.p`,
                    "Spațiul cu patru dimensiuni (4D) extinde noțiunile din geometria 3D. Nu putem „vedea” direct a patra dimensiune, dar putem proiecta obiecte 4D (cum ar fi hipercubul) în 3D sau 2D, similar cum proiectăm un cub pe o foaie. Aceste idei apar în relativitate (spațiu-timp) și în matematică avansată."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={pickSimulationThumb(vizualizator4dImg, "vizualizator-4d", lang)}
                    alt={t(`${M}.fourD.alt`, "Vizualizator 4D")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {t(`${M}.fourD.conceptsHeading`, "Concepte pentru geometria 4D:")}
                    </h3>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.fourD.h_tesseract`, "1. Hipercub (teseract):")}</h4>
                    <p className="text-muted-foreground mb-2">
                      {t(
                        `${M}.fourD.p_tesseract`,
                        "Analogul 4D al cubului; are 16 vârfuri, 32 muchii, 24 fețe pătrate și 8 celule cubice."
                      )}
                    </p>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.fourD.h_proj`, "2. Proiecție 4D → 3D:")}</h4>
                    <p className="text-muted-foreground mb-2">
                      {t(
                        `${M}.fourD.p_proj`,
                        "Obținem o „umbră” 3D a unui obiect 4D, la fel cum proiecția unui cub pe plan dă un hexagon sau pătrat."
                      )}
                    </p>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.fourD.h_rot`, "3. Rotație în 4D:")}</h4>
                    <p className="text-muted-foreground mb-2">
                      {t(
                        `${M}.fourD.p_rot`,
                        "În 4D există 6 plane de rotație (perechi de axe). Vizualizatorul permite rotirea în aceste plane."
                      )}
                    </p>

                    <h4 className="text-lg font-semibold mb-2">{t(`${M}.fourD.h_minkowski`, "4. Spațiu-timp (Minkowski):")}</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( ds^2 = c^2 dt^2 - dx^2 - dy^2 - dz^2 \\)"}
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {t(
                        `${M}.fourD.p_minkowski`,
                        "În relativitate, a patra dimensiune este timpul; metrica Minkowski descrie distanța în spațiu-timp."
                      )}
                    </p>
                  </div>
                  <a href={localizedPath("/simulare/vizualizator-4d")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{t(`${M}.fourD.ctaSim`, "Vezi simularea")}</Button>
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

export default MatematicaPage;
