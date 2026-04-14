import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import apaGreaImg from "/res/screenshots/apa_grea_1.png";
import instalatieSchimbIzotopicImg from "/res/screenshots/schimb_izotopic_Screenshot.png";
import distilareD2oFractionataResurseImg from "/res/screenshots/Distilare_D2o_Fractionata_Resurse.png";
import reactorFuziuneDtImg from "/res/screenshots/Reactor_Fuziune_Dt_Screenshot.png";

const FizicaNuclearaPage = () => {
  return (
    <Layout>
      <SEO
        title="Fizică nucleară | Apă grea, separare izotopică, model fuziune D–T - PULS"
        description="Resurse: D₂O vs H₂O, instalații de schimb izotopic și distilare fracționată; model educativ de fuziune deuteriu–tritiu cu energie ~17,6 MeV per reacție și simulator interactiv."
        keywords="fizica nucleara, apa grea, D2O, fuziune, deuteriu, tritiu, reactor, model educativ, schimb izotopic, moderator"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 md:mb-6">
              Fizică nucleară
            </h1>

            <div className="max-w-4xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                Pagina grupează materiale despre <strong>apa grea</strong> și separarea deuteriului, plus un{" "}
                <strong>model educativ de fuziune D–T</strong> (deuteriu + tritiu) cu energie orientativă eliberată
                per reacție. Simulatoarele nu înlocuiesc cursuri de inginerie nucleară sau dosare de siguranță; sunt
                pentru intuiție și legătura cu programa de liceu.
              </p>
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-0">
                Mai jos: fuziunea D–T în simulator, apoi D₂O vs H₂O, schimb izotopic și rectificare pentru D₂O.
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Simulator: reactor fuziune D–T</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  În codul simulatorului, fiecare eveniment de „fuziune” lângă nucleu adaugă o energie de{" "}
                  <strong>17,6&nbsp;MeV</strong>, valoare standard citată pentru reacția dintre un nucleu de deuteriu și
                  unul de tritiu. Controalele (temperatură, presiune, flux de neutroni) modifică viteza particulelor,
                  probabilitatea de întâlnire în zona nucleului și stabilitatea afișată; peste un prag critic, aplicația
                  trece într-un scenariu vizual de <strong>meltdown</strong>, exclusiv demonstrativ.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  <strong>Parametri în interfață:</strong> temperatura (0–1000&nbsp;K), presiunea (0–100, scală
                  relativă), flux neutroni (0–10). În script, zona de fuziune se extinde ușor cu energia cumulată;
                  meltdown se declanșează dacă fluxul depășește ~8,5 și temperatura ~850&nbsp;K simultan.
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={reactorFuziuneDtImg}
                    alt="Simulator educativ reactor fuziune D–T: nucleu, particule, controale și grafic energie"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">Formule legate de modelul din simulator</h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">1. Reacția de fuziune D + T</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Schematic (particule emise și energie eliberată orientativă):
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( {}^2_1\\mathrm{H} + {}^3_1\\mathrm{H} \\rightarrow {}^4_2\\mathrm{He} + {}^1_0\\mathrm{n} + 17{,}6\\ \\mathrm{MeV} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Tritiul ({"\\({}^3_1\\mathrm{H}\\)"} <MathJaxRender />) este instabil ({"\\(\\beta^-\\)"}{" "}
                  <MathJaxRender />
                  ), de aceea în practică trebuie produs sau regenerat într-un lanț de reacții; simulatorul nu
                  detaliază acest lanț, doar folosește energia per eveniment ca reper didactic.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">2. Energia cumulată afișată</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Cu {"\\(N\\)"} <MathJaxRender /> numărul de evenimente de fuziune numărate în simulare:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( E_{\\mathrm{tot}} = N \\cdot 17{,}6\\ \\mathrm{MeV} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Graficul „Energie în timp” urmărește {"\\(E_{\\mathrm{tot}}\\)"} <MathJaxRender /> eșantionat în bucla
                  de animație; rata „Fuziuni / secundă” estimează evenimentele din ultima secundă (timestamps în cod).
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">3. Defect de masă și energie de reacție (Q)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  În nucleu, energia eliberată se leagă de diferența dintre masa reactanților și cea a produsilor:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( Q = \\bigl(m_D + m_T - m_{\\mathrm{He}} - m_n\\bigr)\\,c^2 \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Valoarea {"\\(Q \\approx 17{,}6\\ \\mathrm{MeV}\\)"} <MathJaxRender /> pentru D–T este cea folosită
                  în simulator ca energie per eveniment; într-un reactor real energia se împarte între particule și
                  structură, iar confinarea plasmei sau materialele nu sunt modelate aici.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">4. Stabilitate și prag critic (doar în simulare)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Aplicația afișează stări de tip OK / instabil înainte de meltdown; condiția de declanșare din cod este
                  echivalentă cu „flux mare și temperatură mare” simultan. Nu există o formulă fizică unică aici — este
                  un prag pedagogic pentru a discuta <em>feedback</em>-ul puterii și al răcirii într-un curs real de fizică sau inginerie.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a href="/simulare/reactor-fuziune-dt" rel="noopener noreferrer" className="resurse-link w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Simulare: reactor fuziune D–T
                    </Button>
                  </a>
                </div>
              </div>

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
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Ce compară simulatorul D₂O vs H₂O (apă grea)</h2>
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
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Instalație de schimb izotopic (H₂S - H₂O)</h2>
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

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Distilare fracționată: de la ~20% la apă grea finisată</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  După ce concentrația urcă în zona zecilor de procente prin schimb izotopic, separarea fină se bazează pe
                  diferența mică dintre punctele de fierbere ale H₂O și D₂O (~1,4&nbsp;°C): o coloană de rectificare cu
                  multe etaje, reflux mare și reboiler jos concentrează D₂O la baza coloanei, iar vapori mai bogați în
                  H₂O ies spre condensator.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  Simulatorul urmărește schematic puritatea în timp, efectul refluxului și al numărului de etaje — util
                  pentru înțelegerea de ce ultimii procenti spre 99,8% sunt cei mai costisitori. În aplicație, această
                  etapă rămâne blocată până finalizezi simularea de schimb izotopic (progres salvat local în browser).
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={distilareD2oFractionataResurseImg}
                    alt="Simulator distilare fracționată H₂O–D₂O: coloană, reflux și grafic de puritate"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  Formule utile pentru rectificarea H₂O / D₂O
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">1. Volatilitate relativă (componentă ușoară față de grea)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Notând cu L componenta mai volatilă (H₂O) și H pe cea mai puțin volatilă (D₂O), la echilibru:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( \\alpha_{L/H} = \\dfrac{(y_L/x_L)}{(y_H/x_H)} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Pentru H₂O/D₂O, {"\\(\\alpha_{L/H}\\)"} <MathJaxRender /> este aproape de 1 (în simulator ~1,06), deci
                  fiecare etaj separă puțin — de aceea sunt necesare multe trepte și reflux ridicat.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">2. Echilibru vapori–lichid (fracție molară a componentei ușoare)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Cu {"\\(x\\)"} <MathJaxRender /> și {"\\(y\\)"} <MathJaxRender /> fracțiile molare ale H₂O în lichid,
                  respectiv în vapori, și {"\\(\\alpha\\)"} <MathJaxRender /> constant (model didactic):
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( y = \\dfrac{\\alpha\\,x}{1+(\\alpha-1)\\,x} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  Concentrația D₂O în lichid este {"\\(1-x\\)"} <MathJaxRender />; la baza coloanei, prin rectificare,
                  {"\\(x\\)"} <MathJaxRender /> scade și fracția de D₂O crește.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">3. Refluxul intern</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( R = \\dfrac{L}{D} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {"\\(L\\)"} <MathJaxRender /> este debitul molar de lichid care revine în coloană (reflux),{" "}
                  {"\\(D\\)"} <MathJaxRender /> debitul de produs preluat de sus. {"\\(R\\)"} <MathJaxRender /> mare
                  îmbunătățește separarea, dar reduce debitul de produs ușor și prelungește timpul spre purități foarte
                  mari jos.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">4. Număr minim de trepte (Fenske, volatilitate relativă constantă)</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Estimare didactică pentru câte trepte ar fi necesare la reflux total, între fracțiile molare ale
                  componentei ușoare în distillat {"\\(x_D\\)"} <MathJaxRender /> și în reziduu {"\\(x_B\\)"}{" "}
                  <MathJaxRender />:
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( N_{\\min} = \\dfrac{\\ln\\!\\left(\\dfrac{x_D/(1-x_D)}{x_B/(1-x_B)}\\right)}{\\ln \\alpha} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  În practică, refluxul finit și eficiența etajelor măresc numărul real de trepte față de{" "}
                  {"\\(N_{\\min}\\)"} <MathJaxRender />; formula arată totuși de ce un {"\\(\\alpha\\)"}{" "}
                  <MathJaxRender /> aproape de 1 duce la {"\\(N\\)"} <MathJaxRender /> foarte mare pentru separare
                  pronunțată.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">5. Legătură cu diferența de fierbere</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  Separarea prin distilare folosește direct faptul că temperaturile de fierbere diferă; pentru
                  discuție calitativă, în pagină avem deja{" "}
                  {"\\(\\Delta T_b = T_b(D_2O)-T_b(H_2O)\\)"} <MathJaxRender /> (orientativ ~1,4&nbsp;°C), ceea ce se
                  traduce într-o volatilitate relativă foarte apropiată de 1.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a href="/simulare/distilare-d2o-fractionata" rel="noopener noreferrer" className="resurse-link w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Simulare: distilare fracționată D₂O
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
