import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import laserSimulatorImg from "/res/screenshots/Laser_Simulator_Screenshot.png";
import eliNpLaserImg from "/res/screenshots/Eli_Np_Laser_Screenshot.png";
import acceleratorLaserImg from "/res/screenshots/Accelerator_Laser_Screenshot.png";

const simulatorSections = [
  {
    title: "Simulator 1: Laser vs materie",
    intro:
      "Acest simulator urmărește relația dintre fascicul și țintă: schimbând modul de interacție, materialul și parametrii fasciculului poți observa încălzire, emisie fotoelectrică sau ionizare.",
    image: laserSimulatorImg,
    alt: "Screenshot simulator laser vs materie",
    href: "/simulare/laser-interactie",
    cta: "Începe simularea",
    formulas: [
      {
        title: "Intensitatea fasciculului",
        formula: "\\( I = \\dfrac{P}{A} \\)",
        explanation:
          "Dacă aria spotului scade, intensitatea crește rapid. În simulator asta se vede imediat în răspunsul materialului.",
      },
      {
        title: "Energia fotonului",
        formula: "\\( E = hf = \\dfrac{hc}{\\lambda} \\)",
        explanation:
          "Lungimea de undă controlează energia fiecărui foton, deci și probabilitatea unor procese precum efectul fotoelectric.",
      },
      {
        title: "Presiunea de radiație",
        formula: "\\( p_{rad} \\approx \\dfrac{I}{c} \\)",
        explanation:
          "Lumina transportă impuls, iar la intensități mari poate transfera o presiune măsurabilă asupra suprafeței iluminate.",
      },
    ],
    facts: [
      "un spot mai mic produce efecte mai intense pentru aceeași putere totală",
      "materialele răspund diferit la încălzire și ionizare",
      "modurile de interacție ajută la compararea efectelor termice cu cele fotoelectrice",
    ],
  },
  {
    title: "Simulator 2: ELI-NP Photon Sniper",
    intro:
      "Al doilea simulator este inspirat de contextul ELI-NP și pune accent pe pulsuri ultra-scurte, focalizare strânsă și intensitatea de vârf obținută în experimente cu lasere de mare putere.",
    image: eliNpLaserImg,
    alt: "Screenshot simulator ELI-NP Photon Sniper",
    href: "/simulare/eli-np-laser",
    cta: "Începe simularea ELI-NP",
    formulas: [
      {
        title: "Puterea de vârf a pulsului",
        formula: "\\( P_{peak} \\approx \\dfrac{E_{pulse}}{\\tau} \\)",
        explanation:
          "Când energia pulsului este comprimată într-o durată extrem de mică, puterea instantanee devine foarte mare.",
      },
      {
        title: "Intensitatea de vârf",
        formula: "\\( I_{peak} \\approx \\dfrac{P_{peak}}{A} \\)",
        explanation:
          "Combinația dintre putere mare și focalizare bună conduce la regimuri extreme în care apar plasmă și ablație.",
      },
      {
        title: "Divergența gaussiană",
        formula: "\\( \\theta \\approx \\dfrac{\\lambda}{\\pi w_0} \\)",
        explanation:
          "Un fascicul foarte strâns focalizat va avea de regulă o divergență mai mare după regiunea focală.",
      },
      {
        title: "Distanța Rayleigh",
        formula: "\\( z_R = \\dfrac{\\pi w_0^2}{\\lambda} \\)",
        explanation:
          "Această distanță indică zona din jurul focarului în care fasciculul rămâne relativ bine colimat.",
      },
    ],
    facts: [
      "ELI-NP este legat de cercetarea laserelor extreme de la Măgurele",
      "durata pulsului influențează direct puterea de vârf",
      "focalizarea și dimensiunea spotului controlează regimul fizic observat",
    ],
  },
  {
    title: "Simulator 3: Accelerator laser wakefield",
    intro:
      "Al treilea simulator arată pe scurt principiul LWFA (Laser WakeField Acceleration): pulsul laser generează o undă de plasmă, iar electronul poate fi prins în faza potrivită și accelerat pe distanțe scurte.",
    image: acceleratorLaserImg,
    alt: "Screenshot simulator accelerator laser wakefield",
    href: "/simulare/accelerator-laser",
    cta: "Deschide simulatorul LWFA",
    formulas: [
      {
        title: "Unda de plasmă (model simplificat)",
        formula: "\\( y(x,t) = A\\sin(kx-\\omega t) \\)",
        explanation:
          "Unda wakefield este reprezentată aici printr-un profil sinusoidal: amplitudinea A crește odată cu intensitatea laserului, iar frecvența spațială depinde de densitatea plasmei.",
      },
      {
        title: "Intensitatea fasciculului",
        formula: "\\( I = \\dfrac{P}{A_{spot}} \\)",
        explanation:
          "Pentru aceeași putere P, focalizarea pe o arie mai mică A_spot duce la intensitate mai mare și la câmpuri de accelerație mai puternice în plasmă.",
      },
      {
        title: "Factorul Lorentz al electronului",
        formula: "\\( \\gamma = \\dfrac{1}{\\sqrt{1-v^2/c^2}} \\)",
        explanation:
          "Pe măsură ce viteza electronului v se apropie de viteza luminii c, factorul gamma crește rapid și evidențiază regimul relativist din accelerator.",
      },
      {
        title: "Energia relativistă",
        formula: "\\( E = \\gamma m_e c^2 \\)",
        explanation:
          "Această relație leagă direct creșterea lui gamma de energia electronului. În simulare, creșterea energiei apare când electronul rămâne sincronizat cu unda de plasmă.",
      },
    ],
    facts: [
      "mărirea intensității crește amplitudinea wakefield-ului și accelerația electronului",
      "densitatea plasmei schimbă perioada undei și condițiile de capturare",
      "dacă electronul iese din faza acceleratoare, câștigul energetic scade",
    ],
  },
];

const LaserePage = () => {
  return (
    <Layout>
      <SEO
        title="Lasere | ELI-NP și simulatoare interactive - PULS"
        description="Pagină dedicată laserelor: noțiuni esențiale, formule utile, aplicații moderne, context ELI-NP și două simulatoare interactive despre interacția laser-materie."
        keywords="lasere, laser, eli-np, magurele, optica laser, intensitate laser, fascicul gaussian, puls femtosecundă"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 md:mb-6">
              Lasere: de la fotoni la impulsuri extreme
            </h1>

            <div className="max-w-5xl mb-8 md:mb-10">
              <p className="text-base sm:text-lg leading-7 text-muted-foreground mb-4">
                Laserul este o sursă de lumină cu <strong>coerență ridicată</strong>, distribuție direcțională foarte
                bună și, în multe aplicații, o lungime de undă bine controlată. Tocmai această combinație îl face util
                atât în optică de laborator, cât și în medicină, telecomunicații, metrologie sau fizica plasmei.
              </p>
              <p className="text-base sm:text-lg leading-7 text-muted-foreground">
                La Măgurele, infrastructura <strong>ELI-NP</strong> este una dintre referințele europene pentru
                experimente cu lasere de mare putere, unde interacția laser-materie deschide discuții despre plasmă,
                accelerare de particule și condiții extreme într-un cadru educațional inspirat din cercetarea reală.
              </p>
            </div>

            <div className="space-y-8 md:space-y-12">
              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Pe scurt despre lasere</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  Un laser produce lumină coerentă, direcțională și ușor de focalizat. Asta îl face ideal pentru
                  măsurători precise, telecomunicații, medicină și experimente în care energia trebuie concentrată pe o
                  zonă foarte mică.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-0">
                  Când urmărești un simulator de laser, merită să fii atent mai ales la lungimea de undă, putere,
                  diametrul spotului și durata pulsului, pentru că de aici apar intensitatea, ionizarea și regimul
                  fizic al interacției cu materia.
                </p>
              </div>

              <div className="rounded-container px-4 py-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Scurt istoric ELI-NP</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-4">
                  ELI-NP, dezvoltat la Măgurele, face parte din infrastructura europeană Extreme Light Infrastructure și
                  a fost gândit pentru cercetare la intersecția dintre lasere de mare putere și fizică nucleară.
                </p>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-0">
                  Pentru elevi, ELI-NP este important fiindcă arată cum noțiuni aparent teoretice, precum focalizarea,
                  puterea de vârf sau interacția laser-materie, devin idei centrale în experimente reale de frontieră.
                </p>
              </div>

              {simulatorSections.map((simulator) => (
                <section key={simulator.href} className="rounded-container px-4 py-5 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">{simulator.title}</h2>
                  <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-6">
                    {simulator.intro}
                  </p>

                  <div className="image-slider h-64 sm:h-72 md:h-80 relative flex items-center justify-center mb-6 md:mb-8">
                    <img
                      src={simulator.image}
                      alt={simulator.alt}
                      className="w-full h-full object-contain mx-auto my-auto"
                    />
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4">Formule și explicații</h3>
                      {simulator.formulas.map((item, index) => (
                        <div key={item.title}>
                          <h4 className="text-base sm:text-lg font-semibold mb-2">
                            {index + 1}. {item.title}
                          </h4>
                          <div className="formula-resurse text-sm sm:text-base md:text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                          <p className="text-sm sm:text-base leading-7 text-muted-foreground mb-5">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4">Ce observi în simulator</h3>
                      <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-muted-foreground">
                        {simulator.facts.map((fact) => (
                          <li key={fact}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <MathJaxRender key={simulator.href} />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-6 mt-6">
                    <a href={simulator.href} className="resurse-link w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto">
                        {simulator.cta}
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

export default LaserePage;
