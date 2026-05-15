import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { useI18n } from "@/i18n/LanguageContext";

import dublaFantaImg from "/res/screenshots/dubla_fanta_Screenshot.png";
import tunelareImg from "/res/screenshots/tunelare_Screenshot.png";
import legaturiAtomiImg from "/res/screenshots/legaturi_atomi_Screenshot.png";

const FizicaCuanticaPage = () => {
  const { t, localizedPath } = useI18n();
  const mathRootRef = useMathJaxTypesetRoot();

  const Q = "resourcesPage.lessonPages.quantumPhysics";

  return (
    <Layout>
      <SEO
        title={t(`${Q}.seo.title`, "Fizică cuantică | Dublă fantă și tunelare - PULS")}
        description={t(
          `${Q}.seo.description`,
          "Lecție și simulări: experimentul dublei fante (interferență, probabilitate) și tunelarea cuantică prin bariere de potențial — formule și explicații pe pagină."
        )}
        keywords={t(
          `${Q}.seo.keywords`,
          "fizica cuantica, dubla fanta, interferenta, tunelare cuantica, Schrodinger, mecanica cuantica, PULS"
        )}
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t(`${Q}.pageTitle`, "Fizică cuantică")}</h1>

            <div className="max-w-4xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                {t(
                  `${Q}.intro.p1`,
                  "Introducem două fenomene de bază: superpoziția amplitudinilor la dublă fantă (interferență și probabilitate) și penetrarea unei bariere de potențial (tunelare). Mai jos, sub fiecare simulare, găsești formulele folosite des în probleme, cu explicații scurte."
                )}
              </p>
            </div>

            <div className="space-y-12 mb-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${Q}.doubleSlit.title`, "Experimentul dublei fante")}</h2>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.doubleSlit.p1`,
                    "Un fascicul trece prin două fante paralele. În descrierea cuantică, amplitudinea pe ecran este suma contribuțiilor de la fiecare fantă; intensitatea măsurată urmează regula lui Born și poate arăta franje de interferență. Dacă localizezi particula pe o singură cale înainte de ecran, pattern-ul de interferență se schimbă — complementaritatea undă–corpuscul."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={dublaFantaImg}
                    alt={t(`${Q}.doubleSlit.alt`, "Simulator dublă fantă")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">{t(`${Q}.doubleSlit.formulasHeading`, "Formule esențiale (dublă fantă)")}</h3>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.doubleSlit.maximaTitle`, "Maxime de interferență")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.doubleSlit.maximaLead`,
                    "Pentru două fante la distanța d și lungime de undă λ, la unghiul θ față de axa de simetrie, diferența de drum este aproximativ d sin θ. Interferență constructivă (maxime de intensitate) când această diferență este un multiplu întreg de lungimi de undă:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( d\\sin\\theta = m\\lambda, \\quad m = 0, \\pm 1, \\pm 2, \\ldots \\)"}
                </div>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.doubleSlit.fringeTitle`, "Distanța între franje (Young, unghi mic)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.doubleSlit.fringeLead`,
                    "Pe un ecran la distanța L ≫ d de fante, în aproximația unghiurilor mici sin θ ≈ y/L, distanța între două maxime consecutive de ordin m și m+1 pe ecran este aproximativ:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( \\Delta y \\approx \\frac{\\lambda L}{d} \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.doubleSlit.fringeNote`,
                    "Cu cât fantele sunt mai apropiate (d mic) sau lungimea de undă mai mare, cu atât franjele sunt mai depărtate pe ecran."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.doubleSlit.bornTitle`, "Regula lui Born (probabilitate)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.doubleSlit.bornLead`,
                    "Probabilitatea de a detecta particula într-o mică zonă spațială este proporțională cu pătratul modulului funcției de undă (suma amplitudinilor asociate tuturor căilor relevante):"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( P \\propto |\\psi|^2 \\)"}
                </div>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${Q}.doubleSlit.bornNote`,
                    "De aceea „se vede” interferență: termenii care se adună în ψ pot produce maxime sau minime ale lui |ψ|², nu doar o sumă de intensități independente."
                  )}
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href={localizedPath("/simulare/dubla-fanta")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{t(`${Q}.doubleSlit.cta`, "Simulare: dublă fantă")}</Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${Q}.tunnelling.title`, "Tunelarea cuantică")}</h2>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.tunnelling.p1`,
                    "În regiuni unde clasic ar avea energie cinetică negativă (E < V(x)), funcția de undă nu dispare brusc: în barieră apare o parte care scade exponențial, astfel încât există probabilitate nenulă ca particula să fie găsită dincolo de barieră — fenomenul de tunelare. Apare în diode tunel, microscoape cu efect tunel (STM) și în multe modele nucleare și chimice."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={tunelareImg}
                    alt={t(`${Q}.tunnelling.alt`, "Simulator tunelare cuantică")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">{t(`${Q}.tunnelling.formulasHeading`, "Formule esențiale (tunelare)")}</h3>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.tunnelling.schroTitle`, "Ecuația lui Schrödinger staționară (1D)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.tunnelling.schroLead`,
                    "Pentru o stare cu energie E bine definită, forma independentă de timp în o dimensiune este:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( -\\dfrac{\\hbar^2}{2m} \\dfrac{d^2\\psi}{dx^2} + V(x)\\,\\psi = E\\,\\psi \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.tunnelling.schroNote`,
                    "În fiecare zonă unde V este aproximativ constant, soluția este combinație de exponențiale (oscilatorii dacă E > V, crescătoare/scăzătoare dacă E < V)."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.tunnelling.kappaTitle`, "Număr de undă în zona permisă și decay în barieră")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.tunnelling.kappaLead`,
                    "Pentru o barieră rectangulară de înălțime V₀ și E < V₀, în interiorul barierei (unde clasic nu ar trece particula) soluția evanescentă implică parametrul κ:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\kappa = \\dfrac{\\sqrt{2m(V_0 - E)}}{\\hbar} \\)"}
                </div>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${Q}.tunnelling.kappaNote`,
                    "Cu cât bariera e mai „înaltă” față de E (adică V₀ − E mai mare), cu atât κ e mai mare și unda scade mai rapid în barieră."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.tunnelling.transTitle`, "Transmisie la barieră groasă (idee)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.tunnelling.transLead`,
                    "Pentru o barieră suficient de lată a, coeficientul de transmisie (probabilitatea de a trece) scade foarte rapid cu grosimea, adesea dominant fiind un factor de tipul:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( T \\sim e^{-2\\kappa a} \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.tunnelling.transNote`,
                    "Factorii numerici exacti depind de forma barierei (treaptă, netedă etc.), dar dependența exponențială de κa explică de ce tunelarea e sensibilă la câțiva angstromi în STM sau la grosimea stratului în dispozitive reale."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.tunnelling.heisenbergTitle`, "Ordine de mărime: energie și durată (Heisenberg)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.tunnelling.heisenbergLead`,
                    "O stare care nu trăiește la nesfârșit (de exemplu un nivel meta-stabil) are o incertitudine în energie legată de durata sa caracteristică Δt:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( \\Delta E\\,\\Delta t \\gtrsim \\dfrac{\\hbar}{2} \\)"}
                </div>
                <p className="text-muted-foreground mb-6">
                  {t(
                    `${Q}.tunnelling.heisenbergNote`,
                    "Utilă când estimezi lățimea nivelurilor sau timpii de viață în procese care implică tunelare dintr-o stare constrânsă."
                  )}
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href={localizedPath("/simulare/tunelare-cuantica")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{t(`${Q}.tunnelling.cta`, "Simulare: tunelare cuantică")}</Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-12 mt-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">{t(`${Q}.bonding.title`, "Legături între atomi și orbitali moleculari")}</h2>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.bonding.p1`,
                    "Dincolo de atomul izolat, mecanica cuantică explică de ce atomii se pot lega în molecule stabile: combinația liniară a orbitalilor atomici duce la orbitali moleculari de legătură și antilegătură. Densitatea de probabilitate crescută între nuclee corespunde unei energii totale mai mici decât suma energiilor atomilor separați."
                  )}
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={legaturiAtomiImg}
                    alt={t(`${Q}.bonding.alt`, "Simulator legături între atomi")}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">{t(`${Q}.bonding.formulasHeading`, "Formule esențiale (legături între atomi)")}</h3>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.bonding.moTitle`, "Combinarea orbitalilor atomici (MO de legătură / antilegătură)")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.bonding.moLead`,
                    "În modelul foarte simplificat al moleculei H₂, doi orbitali 1s se pot combina într-un orbital de legătură (simetric) și unul de antilegătură (antisimetric):"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\psi_{\\text{leg}} = c_1 \\psi_A + c_2 \\psi_B, \\quad \\psi_{\\text{anti}} = c_1 \\psi_A - c_2 \\psi_B \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.bonding.moNote`,
                    "În orbitalul de legătură, densitatea de probabilitate |ψ_leg|² este mai mare între nuclee, ceea ce duce la o energie totală mai mică decât pentru atomii separați."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.bonding.ebindTitle`, "Energie de legătură")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.bonding.ebindLead`,
                    "Energia de legătură se definește ca diferența dintre energia atomilor separați și energia moleculei:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( E_{\\text{leg}} = E_{\\text{atomi separați}} - E_{\\text{moleculă}} \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.bonding.ebindNote`,
                    "Cu cât E_leg este mai mare, cu atât legătura este mai puternică și molecula mai stabilă."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.bonding.forceTitle`, "Forță de legătură – aproximația oscilatorului")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.bonding.forceLead`,
                    "În jurul distanței de echilibru r₀ dintre nuclee, potențialul de legătură poate fi aproximat printr-un oscilator armonic:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( F \\approx -k (r - r_0) \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.bonding.forceNote`,
                    "Constanta efectivă k se corelează cu „rigiditatea” legăturii; frecvența vibrațională depinde de k și de masa redusă a celor doi atomi."
                  )}
                </p>

                <h4 className="text-lg font-semibold mb-2">{t(`${Q}.bonding.rhoTitle`, "Densitate de probabilitate pe legătură")}</h4>
                <p className="text-muted-foreground mb-3">
                  {t(
                    `${Q}.bonding.rhoLead`,
                    "Probabilitatea de a găsi electronii într-un punct \\(\\vec{r}\\) este dată de densitatea de probabilitate:"
                  )}
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\rho(\\vec{r}) = |\\psi_{\\text{leg}}(\\vec{r})|^2 \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t(
                    `${Q}.bonding.rhoNote`,
                    "O densitate mare între nuclee este semnătura unei legături covalente; în orbitalul de antilegătură această densitate este mică sau nulă în zona dintre nuclee."
                  )}
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a href={localizedPath("/simulare/legaturi-atomi")} rel="noopener noreferrer" className="resurse-link">
                    <Button size="lg">{t(`${Q}.bonding.cta`, "Simulare: legături între atomi")}</Button>
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
