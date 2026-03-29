import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import dublaFantaImg from "/res/screenshots/dubla_fanta_Screenshot.png";
import tunelareImg from "/res/screenshots/tunelare_Screenshot.png";

const FizicaCuanticaPage = () => {
  return (
    <Layout>
      <SEO
        title="Fizică cuantică | Dublă fantă și tunelare - PULS"
        description="Lecție și simulări: experimentul dublei fante (interferență, probabilitate) și tunelarea cuantică prin bariere de potențial — formule și explicații pe pagină."
        keywords="fizica cuantica, dubla fanta, interferenta, tunelare cuantica, Schrodinger, mecanica cuantica, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fizică cuantică</h1>

            <div className="max-w-4xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                Introducem două fenomene de bază: superpoziția amplitudinilor la dublă fantă (interferență și probabilitate) și
                penetrarea unei bariere de potențial (tunelare). Mai jos, sub fiecare simulare, găsești formulele folosite des în
                probleme, cu explicații scurte. Lista completă, pe categorii, e și în{" "}
                <a href="/resurse?tab=formule&formula=fizica_cuantica" className="resurse-link">
                  Resurse → Formule → Fizică cuantică
                </a>
                .
              </p>
            </div>

            <div className="space-y-12 mb-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Experimentul dublei fante</h2>
                <p className="text-muted-foreground mb-4">
                  Un fascicul trece prin două fante paralele. În descrierea cuantică, amplitudinea pe ecran este suma contribuțiilor
                  de la fiecare fantă; intensitatea măsurată urmează regula lui Born și poate arăta franje de interferență. Dacă
                  localizezi particula pe o singură cale înainte de ecran, pattern-ul de interferență se schimbă — complementaritatea
                  undă–corpuscul.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={dublaFantaImg}
                    alt="Simulator dublă fantă"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">Formule esențiale (dublă fantă)</h3>

                <h4 className="text-lg font-semibold mb-2">1. Maxime de interferență</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru două fante la distanța{" "}
                  {"\\(d\\)"} <MathJaxRender /> și lungime de undă{" "}
                  {"\\(\\lambda\\)"} <MathJaxRender />, la unghiul{" "}
                  {"\\(\\theta\\)"} <MathJaxRender /> față de axa de simetrie, diferența de drum este aproximativ{" "}
                  {"\\(d\\sin\\theta\\)"} <MathJaxRender />. Interferență constructivă (maxime de intensitate) când această diferență
                  este un multiplu întreg de lungimi de undă:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( d\\sin\\theta = m\\lambda, \\quad m = 0, \\pm 1, \\pm 2, \\ldots \\)"}
                  <MathJaxRender />
                </div>

                <h4 className="text-lg font-semibold mb-2">2. Distanța între franje (Young, unghi mic)</h4>
                <p className="text-muted-foreground mb-3">
                  Pe un ecran la distanța{" "}
                  {"\\(L \\gg d\\)"} <MathJaxRender /> de fante, în aproximația unghiurilor mici{" "}
                  {"\\(\\sin\\theta \\approx y/L\\)"} <MathJaxRender />, distanța între două maxime consecutive de ordin{" "}
                  {"\\(m\\)"} <MathJaxRender /> și{" "}
                  {"\\(m+1\\)"} <MathJaxRender /> pe ecran este aproximativ:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( \\Delta y \\approx \\frac{\\lambda L}{d} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  Cu cât fantele sunt mai apropiate (
                  {"\\(d\\)"} <MathJaxRender /> mic) sau lungimea de undă mai mare, cu atât franjele sunt mai depărtate pe ecran.
                </p>

                <h4 className="text-lg font-semibold mb-2">3. Regula lui Born (probabilitate)</h4>
                <p className="text-muted-foreground mb-3">
                  Probabilitatea de a detecta particula într-o mică zonă spațială este proporțională cu pătratul modulului funcției de
                  undă (suma amplitudinilor asociate tuturor căilor relevante):
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( P \\propto |\\psi|^2 \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-6">
                  De aceea „se vede” interferență: termenii care se adună în{" "}
                  {"\\(\\psi\\)"} <MathJaxRender /> pot produce maxime sau minime ale lui{" "}
                  {"\\(|\\psi|^2\\)"} <MathJaxRender />, nu doar o sumă de intensități independente.
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href="/simulare/dubla-fanta" rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">Simulare: dublă fantă</Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Tunelarea cuantică</h2>
                <p className="text-muted-foreground mb-4">
                  În regiuni unde clasic ar avea energie cinetică negativă{" "}
                  {"\\(E < V(x)\\)"} <MathJaxRender />, funcția de undă nu dispare brusc: în barieră apare o parte care scade
                  exponențial, astfel încât există probabilitate nenulă ca particula să fie găsită dincolo de barieră — fenomenul de
                  tunelare. Apare în diode tunel, microscoape cu efect tunel (STM) și în multe modele nucleare și chimice.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={tunelareImg}
                    alt="Simulator tunelare cuantică"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">Formule esențiale (tunelare)</h3>

                <h4 className="text-lg font-semibold mb-2">1. Ecuația lui Schrödinger staționară (1D)</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru o stare cu energie{" "}
                  {"\\(E\\)"} <MathJaxRender /> bine definită, forma independentă de timp în o dimensiune este:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( -\\dfrac{\\hbar^2}{2m} \\dfrac{d^2\\psi}{dx^2} + V(x)\\,\\psi = E\\,\\psi \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  În fiecare zonă unde{" "}
                  {"\\(V\\)"} <MathJaxRender /> este aproximativ constant, soluția este combinație de exponențiale (oscilatorii dacă{" "}
                  {"\\(E > V\\)"} <MathJaxRender />, crescătoare/scăzătoare dacă{" "}
                  {"\\(E < V\\)"} <MathJaxRender />).
                </p>

                <h4 className="text-lg font-semibold mb-2">2. Număr de undă în zona permisă și decay în barieră</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru o barieră rectangulară de înălțime{" "}
                  {"\\(V_0\\)"} <MathJaxRender /> și{" "}
                  {"\\(E < V_0\\)"} <MathJaxRender />, în interiorul barierei (unde clasic nu ar trece particula) soluția evanescentă
                  implică parametrul{" "}
                  {"\\(\\kappa\\)"} <MathJaxRender />:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\kappa = \\dfrac{\\sqrt{2m(V_0 - E)}}{\\hbar} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-6">
                  Cu cât bariera e mai „înaltă” față de{" "}
                  {"\\(E\\)"} <MathJaxRender /> (adică{" "}
                  {"\\(V_0 - E\\)"} <MathJaxRender /> mai mare), cu atât{" "}
                  {"\\(\\kappa\\)"} <MathJaxRender /> e mai mare și unda scade mai rapid în barieră.
                </p>

                <h4 className="text-lg font-semibold mb-2">3. Transmisie la barieră groasă (idee)</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru o barieră suficient de lată{" "}
                  {"\\(a\\)"} <MathJaxRender />, coeficientul de transmisie (probabilitatea de a trece) scade foarte rapid cu
                  grosimea, adesea dominant fiind un factor de tipul:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( T \\sim e^{-2\\kappa a} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  Factorii numerici exacti depind de forma barierei (treaptă, netedă etc.), dar dependența exponențială de{" "}
                  {"\\(\\kappa a\\)"} <MathJaxRender /> explică de ce tunelarea e sensibilă la câțiva angstromi în STM sau la grosimea
                  stratului în dispozitive reale.
                </p>

                <h4 className="text-lg font-semibold mb-2">4. Ordine de mărime: energie și durată (Heisenberg)</h4>
                <p className="text-muted-foreground mb-3">
                  O stare care nu trăiește la nesfârșit (de exemplu un nivel meta-stabil) are o incertitudine în energie legată de
                  durata sa caracteristică{" "}
                  {"\\(\\Delta t\\)"} <MathJaxRender />:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( \\Delta E\\,\\Delta t \\gtrsim \\dfrac{\\hbar}{2} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-6">
                  Utilă când estimezi lățimea nivelurilor sau timpii de viață în procese care implică tunelare dintr-o stare
                  constrânsă.
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href="/simulare/tunelare-cuantica" rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">Simulare: tunelare cuantică</Button>
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

export default FizicaCuanticaPage;
