import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import michaelsonMorleyImg from "/res/screenshots/Michaelson_Morley_Screenshot.png";

const MichaelsonMorleyPage = () => {
  return (
    <Layout>
      <SEO
        title="Experimentul Michelson-Morley | Relativitate - PULS"
        description="Învață despre experimentul Michelson-Morley, căutarea eterului luminifer și implicațiile pentru relativitatea restrânsă. Teorie și simulare interactivă."
        keywords="Michelson-Morley, eter, relativitate, viteza luminii, interferență, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Experimentul Michelson-Morley</h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                La sfârșitul secolului XIX, fizicienii credeau că lumina se propagă printr-un mediu numit „eter luminifer”,
                similar undelor mecanice care au nevoie de un mediu. Pământul, mișcându-se pe orbită, ar fi trebuit să
                „simte” un „vânt de eter”, ceea ce ar fi influențat viteza aparentă a luminii în funcție de direcție.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Albert A. Michelson și Edward W. Morley au realizat în 1887 un experiment de interferență foarte precis,
                destinat să detecteze această diferență de viteză. Rezultatul a fost surprinzător: nu s-a observat nicio
                variație; viteza luminii părea aceeași în toate direcțiile, indiferent de mișcarea Pământului.
              </p>
              <p className="text-lg text-muted-foreground">
                Acest „eșec” experimental a deschis calea către relativitatea restrânsă: lumina se propagă cu aceeași
                viteză {"\\(c\\)"} <MathJaxRender /> în toate sistemele de referință inerțiale, iar noțiunea de eter nu mai este necesară.
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Principiul experimentului</h2>
                <p className="text-muted-foreground mb-6">
                  Un fascicul de lumină este împărțit în două fascicule perpendiculare. Fiecare parcurge o distanță {"\\(L\\)"} <MathJaxRender />,
                  se reflectă în oglindă și revine. Dacă există „vânt de eter” cu viteza {"\\(v\\)"} <MathJaxRender />, timpii de parcurs pe cele două
                  direcții ar fi diferiți, producând o deplasare a franjelor de interferență când interferometrul este rotit.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={michaelsonMorleyImg}
                    alt="Experimentul Michelson-Morley"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule (în ipoteza eterului)</h3>

                    <h4 className="text-lg font-semibold mb-2">1. Timp pe brațul paralel cu „vântul” (dus-întors):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\parallel} = \\frac{L}{c-v} + \\frac{L}{c+v} = \\frac{2Lc}{c^2-v^2} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">2. Timp pe brațul perpendicular:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\perp} = \\frac{2L}{\\sqrt{c^2-v^2}} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{2c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">3. Diferența de timp (și de fază):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta t \\approx \\frac{Lv^2}{c^3} \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground mt-4">
                      La rotirea aparatului cu 90°, rolurile brațelor se schimbă, deci diferența de fază ar trebui să se
                      modifice și să producă o deplasare măsurabilă a franjelor. În experiment nu s-a observat o astfel de
                      deplasare, ceea ce pune în dubiu existența eterului și este în acord cu invarianța vitezei luminii.
                    </p>

                    <h3 className="text-xl font-semibold mb-2 mt-6">Implicații pentru relativitatea restrânsă</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Viteza luminii în vid {"\\(c\\)"} <MathJaxRender /> este aceeași în toate sistemele inerțiale.</li>
                      <li>Nu există un „cadru preferat” al eterului; spațiul și timpul sunt relative.</li>
                      <li>Transformările Lorentz (nu Galilei) descriu corect cinematica la viteze apropiate de {"\\(c\\)"} <MathJaxRender />.</li>
                    </ul>
                  </div>
                  <a
                    href="/simulare/michaelson-morley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Vezi simularea</Button>
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

export default MichaelsonMorleyPage;
