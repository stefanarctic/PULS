import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";
import MrDeuteronWidget from "../../MrDeuteronWidget";

import apaGreaImg from "/res/screenshots/apa_grea_1.png";
import instalatieSchimbIzotopicImg from "/res/screenshots/schimb_izotopic_Screenshot.png";
import distilareD2oFractionataResurseImg from "/res/screenshots/Distilare_D2o_Fractionata_Resurse.png";
import reactorFuziuneDtImg from "/res/screenshots/Reactor_Fuziune_Dt_Screenshot.png";
import fisiuneNuclearaImg from "/res/screenshots/Fisiune_Nucleara_Screenshot.png";
import izotopiUraniuImg from "/res/screenshots/Izotopi_Uraniu_Screenshot.png";
import totiIzotopiiImg from "/res/screenshots/Toti_Izotopii_Screenshot.png";

const FizicaNuclearaPage = () => {
  const mathRootRef = useMathJaxTypesetRoot();
  const { t, localizedPath } = useI18n();
  const NP = "resourcesPage.lessonPages.nuclearPhysics";

  return (
    <Layout>
      <SEO
        title={t(
          `${NP}.seo.title`,
          "Fizică nucleară | Izotopi U, fisiune U-235, apă grea, fuziune D–T - PULS"
        )}
        description={t(
          `${NP}.seo.description`,
          "Resurse: izotopii uraniului (model de nucleu, α, harta celor 26 de izotopi), fisiune în lanț (U-235, factor k), D₂O vs H₂O, schimb izotopic, distilare fracționată și model educativ de fuziune D–T (~17,6 MeV), cu simulatoare interactive."
        )}
        keywords={t(
          `${NP}.seo.keywords`,
          "fizica nucleara, izotopi uraniu, harta nuclidelor, dezintegrare alfa, fisiune, U-235, factor k, apa grea, D2O, fuziune, deuteriu, tritiu, reactor, schimb izotopic, moderator"
        )}
        image="/res/icons/New-logo.png"
      />
      <MrDeuteronWidget />
      <div className="resurse-pagina resurse-fizica-nucleara min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main
            ref={mathRootRef}
            className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10 tex2jax_process"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 md:mb-6">{t(`${NP}.pageTitle`, "Fizică nucleară")}</h1>

            <div className="max-w-4xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                {t(
                  `${NP}.intro.p1`,
                  'Pagina grupează materiale despre fisiunea indusă în U-235, un model educativ de fuziune D–T, apă grea și separarea deuteriului (schimb izotopic, distilare), apoi — la final — două simulări despre izotopii uraniului (patru izotopi esențiali și harta celor 26). Simulatoarele nu înlocuiesc cursuri de inginerie nucleară sau dosare de siguranță; sunt pentru intuiție și legătura cu programa de liceu.'
                )}
              </p>
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-0">
                {t(
                  `${NP}.intro.p2`,
                  'Mai jos: fisiune în lanț (U-235), fuziunea D–T, D₂O vs H₂O, schimb izotopic și distilare fracționată; la final, două simulări despre izotopii uraniului (patru izotopi esențiali și harta celor 26).'
                )}
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t(`${NP}.fissionSim.title`, "Simulator: fisiune nucleară în lanț (U-235)")}</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.fissionSim.p1`,
                    "Un neutron termic poate fi captat de un nucleu de U-235 (²³⁵₉₂U); compusul intermediar se descompune în fragmente de fisiune, neutroni noi (în medie 2–3 per fisiune pentru U-235) și radiații γ. Dacă, în medie, dintr-o generație de neutroni se produce mai mult de un neutron util pentru noi fisiuni, factorul de multiplicare efectiv depășește 1 și puterea crește — principiul din spatele reacției în lanț controlate cu bare și moderator."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.fissionSim.p2`,
                    "În codul simulatorului, fiecare fisiune adaugă orientativ 200 MeV la energia cumulată (valoare de reper didactică pentru energia eliberată per eveniment). Factorul k afișat este un raport empiric între ratele de fisiune pe intervale consecutive, ca să poți discuta subcritic / critic / supercritic fără a pretinde un model de reactor complet."
                  )}
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={fisiuneNuclearaImg}
                    alt={t(
                      `${NP}.fissionSim.alt`,
                      "Simulator fisiune nucleară U-235: neutroni, nuclei, factor k și energie cumulată"
                    )}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {t(`${NP}.fissionSim.formulasTitle`, "Formule legate de modelul din simulator")}
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.fissionSim.h_induced_title`, "1. Fisiune indusă (schematic)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.fissionSim.h_induced_p`,
                    "Captură de neutron și fragmente (nu = număr de neutroni emiși; valorile concrete ale maselor și Z depind de canalul de fisiune):"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {
                    "\\( {}^{235}_{92}\\mathrm{U} + {}^1_0\\mathrm{n} \\rightarrow {}^{A_1}_{Z_1}\\mathrm{X} + {}^{A_2}_{Z_2}\\mathrm{Y} + \\nu\\,{}^1_0\\mathrm{n} + \\gamma \\)"
                  }
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.fissionSim.h_induced_note`,
                    "Condiția de conservare: \\(235 + 1 = A_1 + A_2 + \\nu\\) și \\(92 = Z_1 + Z_2\\)."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fissionSim.h_etot_title`, "2. Energie cumulată (reper în simulare)")}</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.fissionSim.h_etot_p`,
                    "Cu \\(N\\) numărul de fisiuni numărate și \\(\\langle E\\rangle\\) energie medie eliberată per fisiune (în aplicație \\(\\langle E\\rangle = 200\\ \\mathrm{MeV}\\)):"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( E_{\\mathrm{tot}} \\approx N\\,\\langle E\\rangle \\)"}
                </div>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fissionSim.h_qmass_title`, "3. Defect de masă și energie de reacție (Q)")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( Q = \\bigl(m_{\\mathrm{U}} + m_n - m_{\\mathrm{frag1}} - m_{\\mathrm{frag2}} - \\nu m_n\\bigr)\\,c^2 \\)"}
                </div>
                  {t(
                    `${NP}.fissionSim.h_qmass_p`,
                    "Ordin de mărime tipic: \\(Q\\) de zeci de MeV per nucleon eliberați în fragmente; total per fisiune de ordinul sutelor de MeV — de aceea modelul didactic rotunjește la ~200 MeV."
                  )}

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fissionSim.h_k_title`, "4. Factorul k (idee în simulator)")}</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.fissionSim.h_k_p`,
                    "Într-o descriere pe generații de neutroni, factorul de multiplicare se scrie simbolic ca raport între neutronii utili din generația următoare și cei din generația curentă. Aplicația estimează un k empiric din evoluția ratei de fisiune, nu din secțiuni eficace microscopice:"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( k = \\dfrac{N_{i+1}}{N_i} \\quad (\\text{model simplificat}) \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(`${NP}.fissionSim.h_k_tail`, "\\(k < 1\\) subcritic, \\(k \\approx 1\\) critic (în medie stabil), \\(k > 1\\) supercritic — creștere a puterii dacă nu intervine răcirea/absorbția (bare SCRAM în simulare).")}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/fisiune-nucleara")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      {t(`${NP}.fissionSim.ctaSim`, "Simulare: fisiune nucleară în lanț")}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t(`${NP}.fusionSim.title`, "Simulator: reactor fuziune D–T")}</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.fusionSim.p1`,
                    "În codul simulatorului, fiecare eveniment de „fuziune” lângă nucleu adaugă o energie de 17,6 MeV, valoare standard citată pentru reacția dintre un nucleu de deuteriu și unul de tritiu. Controalele (temperatură, presiune, flux de neutroni) modifică viteza particulelor, probabilitatea de întâlnire în zona nucleului și stabilitatea afișată; peste un prag critic, aplicația trece într-un scenariu vizual de meltdown, exclusiv demonstrativ."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.fusionSim.p2`,
                    "Parametri în interfață: temperatura (0–1000 K), presiunea (0–100, scală relativă), flux neutroni (0–10). În script, zona de fuziune se extinde ușor cu energia cumulată; meltdown se declanșează dacă fluxul depășește ~8,5 și temperatura ~850 K simultan."
                  )}
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={reactorFuziuneDtImg}
                    alt={t(
                      `${NP}.fusionSim.alt`,
                      "Simulator educativ reactor fuziune D–T: nucleu, particule, controale și grafic energie"
                    )}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">{t(`${NP}.fusionSim.formulasTitle`, "Formule legate de modelul din simulator")}</h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fusionSim.h_dt_title`, "1. Reacția de fuziune D + T")}</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(`${NP}.fusionSim.h_dt_p`, "Schematic (particule emise și energie eliberată orientativă):")}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( {}^2_1\\mathrm{H} + {}^3_1\\mathrm{H} \\rightarrow {}^4_2\\mathrm{He} + {}^1_0\\mathrm{n} + 17{,}6\\ \\mathrm{MeV} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.fusionSim.h_dt_note`,
                    "Tritiul (\\({}^3_1\\mathrm{H}\\)) este instabil (\\(\\beta^-\\)), de aceea în practică trebuie produs sau regenerat într-un lanț de reacții; simulatorul nu detaliază acest lanț, doar folosește energia per eveniment ca reper didactic."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fusionSim.h_cum_title`, "2. Energia cumulată afișată")}</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(`${NP}.fusionSim.h_cum_p`, "Cu \\(N\\) numărul de evenimente de fuziune numărate în simulare:")}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( E_{\\mathrm{tot}} = N \\cdot 17{,}6\\ \\mathrm{MeV} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.fusionSim.h_cum_note`,
                    "Graficul „Energie în timp” urmărește \\(E_{\\mathrm{tot}}\\) eșantionat în bucla de animație; rata „Fuziuni / secundă” estimează evenimentele din ultima secundă (timestamps în cod)."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.fusionSim.h_q_dt_title`, "3. Defect de masă și energie de reacție (Q)")}</h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(`${NP}.fusionSim.h_q_dt_p`, "În nucleu, energia eliberată se leagă de diferența dintre masa reactanților și cea a produsilor:")}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( Q = \\bigl(m_D + m_T - m_{\\mathrm{He}} - m_n\\bigr)\\,c^2 \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.fusionSim.h_q_dt_note`,
                    "Valoarea \\(Q \\approx 17{,}6\\ \\mathrm{MeV}\\) pentru D–T este cea folosită în simulator ca energie per eveniment; într-un reactor real energia se împarte între particule și structură, iar confinarea plasmei sau materialele nu sunt modelate aici."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.fusionSim.h_stab_title`, "4. Stabilitate și prag critic (doar în simulare)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.fusionSim.h_stab_p`,
                    "Aplicația afișează stări de tip OK / instabil înainte de meltdown; condiția de declanșare din cod este echivalentă cu „flux mare și temperatură mare” simultan. Nu există o formulă fizică unică aici — este un prag pedagogic pentru a discuta feedback-ul puterii și al răcirii într-un curs real de fizică sau inginerie."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/reactor-fuziune-dt")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">{t(`${NP}.fusionSim.ctaSim`, "Simulare: reactor fuziune D–T")}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t(`${NP}.historyRo.title`, "Scurt istoric și context românesc")}</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.historyRo.p1`,
                    "În România, discuția despre apă grea este legată de dezvoltarea infrastructurii nucleare și de etapa în care au fost construite instalații proprii pentru separarea izotopică a deuteriului. În acest context apare și numele fizicianului Dorel Mihai Constantinescu, asociat cu modelarea proceselor de fabricație pentru D₂O."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.historyRo.p2`,
                    "În anii 1970, la Uzina G din Râmnicu Vâlcea, el a lucrat în zona de calcul și simulare a proceselor implicate în obținerea apei grele, contribuind la etapa în care România a trecut de la idee și proiectare la rezultate experimentale concrete."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-0">
                  {t(
                    `${NP}.historyRo.p3`,
                    "Pentru elevi, această legătură este utilă fiindcă arată că apa grea nu ține doar de formule sau definiții, ci și de istoria tehnologiei nucleare din România, de rolul moderatorului în reactor și de modul în care cercetarea, ingineria și simularea au lucrat împreună."
                  )}
                </p>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t(`${NP}.heavyWater.title`, "Ce compară simulatorul D₂O vs H₂O (apă grea)")}</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.heavyWater.p`,
                    "În cod, secțiunea „Corp” folosește un slider de fracție molară fictivă pentru D₂O și o grilă vizuală (status OK/Atenție/Ridicat/Critic), cu mesaj explicit că este doar demonstrație educațională. Secțiunea „Fizică” compară proprietăți orientative (fierbere, densitate, frecvență), iar secțiunea „Reactor” ilustrează schematic diferența de captură a neutronilor pentru D₂O vs H₂O."
                  )}
                </p>
                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={apaGreaImg}
                    alt={t(`${NP}.heavyWater.alt`, "Simulator moderator cu apă grea")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {t(`${NP}.heavyWater.formulasTitle`, "Formule și relații folosite în comparația D₂O / H₂O")}
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.heavyWater.h_frac_title`, "1. Fracție procentuală D₂O (mod „Corp”)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(`${NP}.heavyWater.h_frac_p`, "Pentru un amestec modelat în simulator, procentul de D₂O este:")}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( x_{D_2O}(\\%) = 100 \\cdot \\dfrac{n_{D_2O}}{n_{D_2O}+n_{H_2O}} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.heavyWater.h_frac_note`,
                    "În pagină este o fracție fictivă pentru înțelegere vizuală; nu este instrument medical și nu descrie direct concentrația reală din organism."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.heavyWater.h_freq_title`, "2. Raportul frecvențelor vibraționale (mod „Fizică”)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.heavyWater.h_freq_p`,
                    "În aproximația oscilatorului armonic, frecvența depinde invers de rădăcina masei reduse:"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( f \\propto \\dfrac{1}{\\sqrt{\\mu}}, \\qquad \\dfrac{f_{D_2O}}{f_{H_2O}} \\approx \\sqrt{\\dfrac{\\mu_{H_2O}}{\\mu_{D_2O}}} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.heavyWater.h_freq_note`,
                    "În simulator, sliderul de raport al masei reduse folosește exact această idee: masă mai mare pentru D₂O → frecvențe caracteristice mai mici."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.heavyWater.h_dT_title`, "3. Diferențe de temperatură la schimbări de fază")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.heavyWater.h_dT_p`,
                    "Diferența dintre valorile orientative de fierbere / îngheț este:"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-5">
                  {"\\( \\Delta T_b = T_b(D_2O)-T_b(H_2O), \\qquad \\Delta T_f = T_f(D_2O)-T_f(H_2O) \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.heavyWater.h_dT_note`,
                    "Pagina folosește valori orientative din simulator: \\(T_b(H_2O)\\approx100.0^\\circ C\\) și \\(T_b(D_2O)\\approx101.4^\\circ C\\), respectiv îngheț în jur de \\(0^\\circ C\\) vs \\(3.8^\\circ C\\)."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/apa-grea")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      {t(`${NP}.heavyWater.ctaSim`, "Simulare: D₂O vs H₂O")}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t(`${NP}.exchange.title`, "Instalație de schimb izotopic (H₂S - H₂O)")}
                </h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.exchange.p1`,
                    "Acest simulator ilustrează pe scurt cum funcționează o instalație de schimb izotopic pentru creșterea concentrației de deuteriu în apă. În loc să urmărești doar formula finală, vezi și efectul etapelor de proces, al transferului de masă și al eficienței globale."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.exchange.p2`,
                    "Modelul este educațional: te ajută să înțelegi tendințele principale din separarea izotopică, nu să proiectezi industrial o instalație reală."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.exchange.p3`,
                    "În contextul istoriei tehnologiei românești, Dorel Mihai Constantinescu a explicat în detaliu de ce separarea apei grele este dificilă: proprietățile chimice ale H₂O și D₂O sunt foarte apropiate, diferențele utile sunt în principal fizice, iar trecerea de la abundența naturală (aprox. 140 ppm) la concentrații nucleare de 99,8% cere instalații extinse și consum energetic mare."
                  )}
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={instalatieSchimbIzotopicImg}
                    alt={t(`${NP}.exchange.alt`, "Simulator instalație de schimb izotopic pentru apă grea")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {t(`${NP}.exchange.formulasTitle`, "Formule utile pentru interpretarea simulatorului")}
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.exchange.h_alpha_title`, "1. Factor de separare izotopică")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( \\alpha = \\dfrac{(x_D/(1-x_D))_{faza\\,A}}{(x_D/(1-x_D))_{faza\\,B}} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.exchange.h_alpha_note`,
                    "Factorul \\(\\alpha\\) arată cât de bine se separă izotopii între două faze la echilibru. Cu \\(\\alpha\\) mai mare, separarea e mai eficientă pe fiecare etapă."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.exchange.h_mass_title`, "2. Bilanț de masă pentru deuteriu")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( F\\,x_F = P\\,x_P + W\\,x_W \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.exchange.h_mass_note`,
                    "Relația leagă debitul de alimentare \\(F\\) și concentrația \\(x_F\\) de curenții de produs \\(P\\) și reziduu \\(W\\)."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.exchange.h_stage_title`, "3. Îmbogățire pe etaje (model simplificat)")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-5">
                  {"\\( x_D^{(n)} \\approx x_D^{(0)}\\,\\alpha^{n} \\) (aprox. didactică)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.exchange.h_stage_note`,
                    "Formula arată ideea-cheie: mai multe etaje utile \\(n\\) pot crește concentrația de deuteriu, mai ales când fiecare etapă contribuie cu o separare netă."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.exchange.h_twostep_title`, "4. Structura tehnologică pe două trepte")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.exchange.h_twostep_p`,
                    "Contribuția tehnică descrisă pentru Uzina G evidențiază două zone: îmbogățire primară (debite mari, concentrații mici, pondere majoră în consum) și finisare (debite mici, concentrații mari până la 99,8% D₂O)."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.exchange.h_twostep_p2`,
                    "Schema clasică cuplează schimbul izotopic H₂O-H₂S în etaje bitermice (coloană rece + coloană caldă) cu distilarea/rectificarea sub vid pentru etapa finală. Simulatorul reproduce didactic această logică de cascadă și importanța optimizării raportului lichid-gaz."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/instalatie-schimb-izotopic")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">{t(`${NP}.exchange.ctaSim`, "Simulare: instalație schimb izotopic")}</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t(`${NP}.distillation.title`, "Distilare fracționată: de la ~20% la apă grea finisată")}
                </h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.distillation.p1`,
                    "După ce concentrația urcă în zona zecilor de procente prin schimb izotopic, separarea fină se bazează pe diferența mică dintre punctele de fierbere ale H₂O și D₂O (~1,4 °C): o coloană de rectificare cu multe etaje, reflux mare și reboiler jos concentrează D₂O la baza coloanei, iar vapori mai bogați în H₂O ies spre condensator."
                  )}
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.distillation.p2`,
                    "Simulatorul urmărește schematic puritatea în timp, efectul refluxului și al numărului de etaje — util pentru înțelegerea de ce ultimii procenti spre 99,8% sunt cei mai costisitori. În aplicație, această etapă rămâne blocată până finalizezi simularea de schimb izotopic (progres salvat local în browser)."
                  )}
                </p>

                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={distilareD2oFractionataResurseImg}
                    alt={t(
                      `${NP}.distillation.alt`,
                      "Simulator distilare fracționată H₂O–D₂O: coloană, reflux și grafic de puritate"
                    )}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {t(`${NP}.distillation.formulasTitle`, "Formule utile pentru rectificarea H₂O / D₂O")}
                </h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.distillation.h_vol_title`, "1. Volatilitate relativă (componentă ușoară față de grea)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.distillation.h_vol_p`,
                    "Notând cu L componenta mai volatilă (H₂O) și H pe cea mai puțin volatilă (D₂O), la echilibru:"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( \\alpha_{L/H} = \\dfrac{(y_L/x_L)}{(y_H/x_H)} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.distillation.h_vol_note`,
                    "Pentru H₂O/D₂O, \\(\\alpha_{L/H}\\) este aproape de 1 (în simulator ~1,06), deci fiecare etaj separă puțin — de aceea sunt necesare multe trepte și reflux ridicat."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(
                    `${NP}.distillation.h_eq_title`,
                    "2. Echilibru vapori–lichid (fracție molară a componentei ușoare)"
                  )}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.distillation.h_eq_p`,
                    "Cu \\(x\\) și \\(y\\) fracțiile molare ale H₂O în lichid, respectiv în vapori, și \\(\\alpha\\) constant (model didactic):"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( y = \\dfrac{\\alpha\\,x}{1+(\\alpha-1)\\,x} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.distillation.h_eq_note`,
                    "Concentrația D₂O în lichid este \\(1-x\\); la baza coloanei, prin rectificare, \\(x\\) scade și fracția de D₂O crește."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.distillation.h_R_title`, "3. Refluxul intern")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( R = \\dfrac{L}{D} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.distillation.h_R_note`,
                    "\\(L\\) este debitul molar de lichid care revine în coloană (reflux), \\(D\\) debitul de produs preluat de sus. \\(R\\) mare îmbunătățește separarea, dar reduce debitul de produs ușor și prelungește timpul spre purități foarte mari jos."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.distillation.h_fenske_title`, "4. Număr minim de trepte (Fenske, volatilitate relativă constantă)")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.distillation.h_fenske_p`,
                    "Estimare didactică pentru câte trepte ar fi necesare la reflux total, între fracțiile molare ale componentei ușoare în distillat \\(x_D\\) și în reziduu \\(x_B\\):"
                  )}
                </p>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( N_{\\min} = \\dfrac{\\ln\\!\\left(\\dfrac{x_D/(1-x_D)}{x_B/(1-x_B)}\\right)}{\\ln \\alpha} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.distillation.h_fenske_note`,
                    "În practică, refluxul finit și eficiența etajelor măresc numărul real de trepte față de \\(N_{\\min}\\); formula arată totuși de ce un \\( \\alpha \\) aproape de 1 duce la \\( N \\) foarte mare pentru separare pronunțată."
                  )}
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(`${NP}.distillation.h_bp_title`, "5. Legătură cu diferența de fierbere")}
                </h4>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-3">
                  {t(
                    `${NP}.distillation.h_bp_p`,
                    "Separarea prin distilare folosește direct faptul că temperaturile de fierbere diferă; pentru discuție calitativă, în pagină avem deja \\( \\Delta T_b = T_b(D_2O)-T_b(H_2O) \\) (orientativ ~1,4 °C), ceea ce se traduce într-o volatilitate relativă foarte apropiată de 1."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/distilare-d2o-fractionata")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      {t(`${NP}.distillation.ctaSim`, "Simulare: distilare fracționată D₂O")}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t(`${NP}.uFour.title`, "Simulator: izotopii uraniului (nucleu, α, fisiune, timp)")}
                </h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.uFour.p`,
                    "Uraniul are mereu Z = 92 protoni; izotopii diferă prin numărul de neutroni \\(N\\) și deci prin numărul de masă \\(A = Z + N\\). Simulatorul pune în evidență patru izotopi frecvent întâlniți în cursuri (U-233 … U-238): vizualizare schematică a nucleului, dezintegrare \\(\\alpha\\) (pierdere de nucleu de heliu-4), un exemplu de fisiune pe U-235 și o „mașină a timpului” care aplică legea dezintegrării radioactive cu \\(T_{1/2}\\) specific fiecărui izotop."
                  )}
                </p>
                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={izotopiUraniuImg}
                    alt={t(`${NP}.uFour.alt`, "Simulator izotopii uraniului: nucleu, raport N/Z, dezintegrare alfa și evoluție în timp")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">{t(`${NP}.uFour.formulasTitle`, "Formule legate de model")}</h3>
                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.uFour.h_note_title`, "1. Notație și neutroni")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( {}^A_Z\\mathrm{X}, \\quad A = Z + N \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.uFour.h_note_p`,
                    "Pentru uraniu, \\(Z = 92\\); izotopul se notează uzual U-A (ex. \\({}^{235}_{92}\\mathrm{U}\\))."
                  )}
                </p>
                <h4 className="text-base sm:text-lg font-semibold mb-2">{t(`${NP}.uFour.h_alpha_title`, "2. Dezintegrare α (schematic)")}</h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {
                    "\\( {}^{A}_{Z}\\mathrm{X} \\rightarrow {}^{A-4}_{Z-2}\\mathrm{Y} + {}^{4}_{2}\\mathrm{He} \\)"
                  }
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                  {t(
                    `${NP}.uFour.h_alpha_note`,
                    "În simulare, după \\( \\alpha \\), nucleul fiu are cu doi protoni și patru nucleoni mai puțin decât părintele."
                  )}
                </p>
                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  {t(
                    `${NP}.uFour.h_decay_title`,
                    "3. Radioactivitate — același exponent ca în modulul „timp”"
                  )}
                </h4>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( N(t) = N_0\\,e^{-\\lambda t}, \\quad \\lambda = \\dfrac{\\ln 2}{T_{1/2}} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.uFour.h_decay_note`,
                    "Interfața poate folosi și forma cu puteri de ½: \\(N(t) = N_0\\,(1/2)^{t/T_{1/2}}\\)."
                  )}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/izotopi-uraniu")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      {t(`${NP}.uFour.ctaSim`, "Simulare: izotopii uraniului")}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t(`${NP}.u26.title`, "Simulator: harta celor 26 de izotopi ai uraniului")}
                </h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  {t(
                    `${NP}.u26.p`,
                    "Experimental sunt cunoscuți 26 de izotopi ai uraniului (domenii tipice ale lui \\(A\\) între 217 și 242). În natură, în proporții semnificative, apar doar U-234, U-235 și U-238; ceilalți sunt produși în laborator sau apar tranzitoriu în lanțuri de dezintegrare. Harta din simulator colorează modul dominant de dezintegrare (\\(\\alpha\\), \\(\\beta^-\\), captură electronică / \\(\\beta^+\\)) și oferă detalii la selectarea fiecărui izotop, plus o vedere a legii \\(N(t)\\) cu \\(\\lambda\\) calculat din \\(T_{1/2}\\)."
                  )}
                </p>
                <div className="image-slider h-52 sm:h-64 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                  <img
                    src={totiIzotopiiImg}
                    alt={t(`${NP}.u26.alt`, "Harta izotopilor uraniului: celule pe rândul Z egal cu 92, legendă moduri de dezintegrare")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {t(`${NP}.u26.formulasTitle`, "Formule utile (aceeași lege pentru fiecare izotop)")}
                </h3>
                <div className="formula-resurse overflow-x-auto max-w-full text-sm sm:text-base md:text-lg font-mono mb-4">
                  {"\\( \\lambda = \\dfrac{\\ln 2}{T_{1/2}}, \\qquad N(t) = N_0\\,e^{-\\lambda t} \\)"}
                </div>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                  {t(
                    `${NP}.u26.formulas_follow`,
                    "Luminozitatea celulelor în hartă reflectă stabilitatea relativă (viață medie / T½); valorile afișate sunt repere educative din date publice agregate, nu substitute pentru tabele nucleare oficiale."
                  )}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6">
                  <a
                    href={localizedPath("/simulare/toti-izotopii")}
                    rel="noopener noreferrer"
                    className="resurse-link w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      {t(`${NP}.u26.ctaSim`, "Simulare: toți izotopii uraniului")}
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
