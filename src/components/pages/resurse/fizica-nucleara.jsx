import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import apaGreaImg from "/res/screenshots/apa_grea_1.png";
import instalatieSchimbIzotopicImg from "/res/screenshots/apa_grea_simulator.png";

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
          <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 md:mb-6">
              Fizică nucleară: D₂O vs H₂O
            </h1>

            <div className="max-w-4xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                Simulatorul compară apă ușoară și apă grea în trei moduri: <strong>Corp</strong> (fracție D₂O într-un
                lichid model), <strong>Reactor</strong> (rol de moderator) și <strong>Fizică</strong> (masă moleculară,
                densitate, puncte de fierbere/îngheț, frecvențe vibraționale). Accentul este pe diferențele D₂O vs H₂O,
                nu pe un model medical sau clinic.
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Scurt istoric și context românesc</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  În România, discuția despre apă grea este legată de dezvoltarea infrastructurii nucleare și de etapa
                  în care au fost construite instalații proprii pentru separarea izotopică a deuteriului. În acest
                  context apare și numele fizicianului <strong>Dorel Mihai Constantinescu</strong>, asociat cu modelarea
                  proceselor de fabricație pentru D₂O.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  În anii 1970, la <strong>Uzina G din Râmnicu Vâlcea</strong>, el a lucrat în zona de calcul și simulare
                  a proceselor implicate în obținerea apei grele, contribuind la etapa în care România a trecut de la
                  idee și proiectare la rezultate experimentale concrete.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-0">
                  Pentru elevi, această legătură este utilă fiindcă arată că apa grea nu ține doar de formule sau
                  definiții, ci și de istoria tehnologiei nucleare din România, de rolul moderatorului în reactor și de
                  modul în care cercetarea, ingineria și simularea au lucrat împreună.
                </p>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Ce compară simulatorul D₂O vs H₂O</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  În cod, secțiunea „Corp” folosește un <strong>slider de fracție molară fictivă</strong> pentru D₂O și
                  o grilă vizuală (status OK/Atenție/Ridicat/Critic), cu mesaj explicit că este doar demonstrație
                  educațională. Secțiunea „Fizică” compară proprietăți orientative (fierbere, densitate, frecvență),
                  iar secțiunea „Reactor” ilustrează schematic diferența de captură a neutronilor pentru D₂O vs H₂O.
                </p>
                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={apaGreaImg}
                    alt="Simulator moderator cu apă grea"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  Formule și relații folosite în comparația D₂O / H₂O
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">1. Fracție procentuală D₂O (mod „Corp”)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Pentru un amestec modelat în simulator, procentul de D₂O este:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( x_{D_2O}(\\%) = 100 \\cdot \\dfrac{n_{D_2O}}{n_{D_2O}+n_{H_2O}} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  În pagină este o fracție <em>fictivă</em> pentru înțelegere vizuală; nu este instrument medical și nu
                  descrie direct concentrația reală din organism.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  2. Raportul frecvențelor vibraționale (mod „Fizică”)
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  În aproximația oscilatorului armonic, frecvența depinde invers de rădăcina masei reduse:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( f \\propto \\dfrac{1}{\\sqrt{\\mu}}, \\qquad \\dfrac{f_{D_2O}}{f_{H_2O}} \\approx \\sqrt{\\dfrac{\\mu_{H_2O}}{\\mu_{D_2O}}} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  În simulator, sliderul de raport al masei reduse folosește exact această idee: masă mai mare pentru
                  D₂O &rarr; frecvențe caracteristice mai mici.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  3. Diferențe de temperatură la schimbări de fază
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Diferența dintre valorile orientative de fierbere / îngheț este:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-5">
                  {"\\( \\Delta T_b = T_b(D_2O)-T_b(H_2O), \\qquad \\Delta T_f = T_f(D_2O)-T_f(H_2O) \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  Pagina folosește valori orientative din simulator:{" "}
                  {"\\(T_b(H_2O)\\approx100.0^\\circ C\\)"} <MathJaxRender /> și{" "}
                  {"\\(T_b(D_2O)\\approx101.4^\\circ C\\)"} <MathJaxRender />, respectiv îngheț în jur de{" "}
                  {"\\(0^\\circ C\\)"} <MathJaxRender /> vs{" "}
                  {"\\(3.8^\\circ C\\)"} <MathJaxRender />.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a href="/simulare/apa-grea" rel="noopener noreferrer" className="resurse-link w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Simulare: D₂O vs H₂O
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Instalație de schimb izotopic (D₂O)</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  Acest simulator ilustrează pe scurt cum funcționează o instalație de <strong>schimb izotopic</strong>&nbsp;
                  pentru creșterea concentrației de deuteriu în apă. În loc să urmărești doar formula finală, vezi și
                  efectul etapelor de proces, al transferului de masă și al eficienței globale.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  Modelul este educațional: te ajută să înțelegi tendințele principale din separarea izotopică, nu să
                  proiectezi industrial o instalație reală.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  În contextul istoriei tehnologiei românești, <strong>Dorel Mihai Constantinescu</strong> a explicat în
                  detaliu de ce separarea apei grele este dificilă: proprietățile chimice ale H₂O și D₂O sunt foarte
                  apropiate, diferențele utile sunt în principal fizice, iar trecerea de la abundența naturală (aprox.
                  140 ppm) la concentrații nucleare de 99,8% cere instalații extinse și consum energetic mare.
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={instalatieSchimbIzotopicImg}
                    alt="Simulator instalație de schimb izotopic pentru apă grea"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  Formule utile pentru interpretarea simulatorului
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">1. Factor de separare izotopică</h4>
                <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( \\alpha = \\dfrac{(x_D/(1-x_D))_{faza\\,A}}{(x_D/(1-x_D))_{faza\\,B}} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Factorul {"\\(\\alpha\\)"} <MathJaxRender /> arată cât de bine se separă izotopii între două faze la
                  echilibru. Cu {"\\(\\alpha\\)"} <MathJaxRender /> mai mare, separarea e mai eficientă pe fiecare etapă.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">2. Bilanț de masă pentru deuteriu</h4>
                <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( F\\,x_F = P\\,x_P + W\\,x_W \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Relația leagă debitul de alimentare {"\\(F\\)"} <MathJaxRender /> și concentrația {"\\(x_F\\)"}{" "}
                  <MathJaxRender /> de curenții de produs {"\\(P\\)"} <MathJaxRender /> și reziduu {"\\(W\\)"}{" "}
                  <MathJaxRender />.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">3. Îmbogățire pe etaje (model simplificat)</h4>
                <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-5">
                  {"\\( x_D^{(n)} \\approx x_D^{(0)}\\,\\alpha^{n} \\) (aprox. didactică)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  Formula arată ideea-cheie: mai multe etaje utile {"\\(n\\)"} <MathJaxRender /> pot crește concentrația
                  de deuteriu, mai ales când fiecare etapă contribuie cu o separare netă.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">4. Structura tehnologică pe două trepte</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  Contribuția tehnică descrisă pentru Uzina G evidențiază două zone:{" "}
                  <strong>îmbogățire primară</strong> (debite mari, concentrații mici, pondere majoră în consum) și{" "}
                  <strong>finisare</strong> (debite mici, concentrații mari până la 99,8% D₂O).
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  Schema clasică cuplează schimbul izotopic <strong>H₂O-H₂S</strong> în etaje bitermice
                  (coloană rece + coloană caldă) cu <strong>distilarea/rectificarea sub vid</strong> pentru etapa finală.
                  Simulatorul reproduce didactic această logică de cascadă și importanța optimizării raportului
                  lichid-gaz.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a href="/simulare/instalatie-schimb-izotopic" rel="noopener noreferrer" className="resurse-link w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Simulare: instalație schimb izotopic
                    </Button>
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
