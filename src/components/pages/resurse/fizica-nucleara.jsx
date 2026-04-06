import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import apaGreaImg from "/res/screenshots/apa_grea_1.png";

const FizicaNuclearaPage = () => {
  return (
    <Layout>
      <SEO
        title="Fizică nucleară | D₂O vs H₂O și apă grea - PULS"
        description="Comparație D₂O vs H₂O: fracție de apă grea în lichid (model educațional), efecte biologice orientative, densitate, puncte de fierbere/îngheț și moderare neutroni."
        keywords="fizica nucleara, apa grea, D2O vs H2O, deuteriu, densitate apa grea, punct de fierbere D2O, moderator"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fizică nucleară: D₂O vs H₂O</h1>

            <div className="max-w-4xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                Simulatorul compară apă ușoară și apă grea în trei moduri: <strong>Corp</strong> (fracție D₂O într-un
                lichid model), <strong>Reactor</strong> (rol de moderator) și <strong>Fizică</strong> (masă moleculară,
                densitate, puncte de fierbere/îngheț, frecvențe vibraționale). Accentul este pe diferențele D₂O vs H₂O,
                nu pe un model medical sau clinic.
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Ce compară simulatorul D₂O vs H₂O</h2>
                <p className="text-muted-foreground mb-4">
                  În cod, secțiunea „Corp” folosește un <strong>slider de fracție molară fictivă</strong> pentru D₂O și
                  o grilă vizuală (status OK/Atenție/Ridicat/Critic), cu mesaj explicit că este doar demonstrație
                  educațională. Secțiunea „Fizică” compară proprietăți orientative (fierbere, densitate, frecvență),
                  iar secțiunea „Reactor” ilustrează schematic diferența de captură a neutronilor pentru D₂O vs H₂O.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={apaGreaImg}
                    alt="Simulator moderator cu apă grea"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">Formule și relații folosite în comparația D₂O / H₂O</h3>

                <h4 className="text-lg font-semibold mb-2">1. Fracție procentuală D₂O (mod „Corp”)</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru un amestec modelat în simulator, procentul de D₂O este:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( x_{D_2O}(\\%) = 100 \\cdot \\dfrac{n_{D_2O}}{n_{D_2O}+n_{H_2O}} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-5">
                  În pagină este o fracție <em>fictivă</em> pentru înțelegere vizuală; nu este instrument medical și nu
                  descrie direct concentrația reală din organism.
                </p>

                <h4 className="text-lg font-semibold mb-2">2. Raportul frecvențelor vibraționale (mod „Fizică”)</h4>
                <p className="text-muted-foreground mb-3">
                  În aproximația oscilatorului armonic, frecvența depinde invers de rădăcina masei reduse:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( f \\propto \\dfrac{1}{\\sqrt{\\mu}}, \\qquad \\dfrac{f_{D_2O}}{f_{H_2O}} \\approx \\sqrt{\\dfrac{\\mu_{H_2O}}{\\mu_{D_2O}}} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-5">
                  În simulator, sliderul de raport al masei reduse folosește exact această idee: masă mai mare pentru
                  D₂O &rarr; frecvențe caracteristice mai mici.
                </p>

                <h4 className="text-lg font-semibold mb-2">3. Diferențe de temperatură la schimbări de fază</h4>
                <p className="text-muted-foreground mb-3">
                  Diferența dintre valorile orientative de fierbere / îngheț este:
                </p>
                <div className="formula-resurse text-lg font-mono mb-5">
                  {"\\( \\Delta T_b = T_b(D_2O)-T_b(H_2O), \\qquad \\Delta T_f = T_f(D_2O)-T_f(H_2O) \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-6">
                  Pagina folosește valori orientative din simulator:{" "}
                  {"\\(T_b(H_2O)\\approx100.0^\\circ C\\)"} <MathJaxRender /> și{" "}
                  {"\\(T_b(D_2O)\\approx101.4^\\circ C\\)"} <MathJaxRender />, respectiv îngheț în jur de{" "}
                  {"\\(0^\\circ C\\)"} <MathJaxRender /> vs{" "}
                  {"\\(3.8^\\circ C\\)"} <MathJaxRender />.
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href="/simulare/apa-grea" rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">Simulare: D₂O vs H₂O</Button>
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

export default FizicaNuclearaPage;
