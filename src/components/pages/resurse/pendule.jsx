import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";

import simulatorPendulSimpluImg from "/res/screenshots/Simplu_Screenshot.png";
import simulatorPendulAmortizatImg from "/res/screenshots/Amortizat_Screenshot.png";
import simulatorGraficePendulImg from "/res/screenshots/Grafice_Pendule_Screenshot.png";
import simulatorTrasnitPendulImg from "/res/screenshots/Trasnit_Screenshot.png";
import penduleMultipleImg from "/res/screenshots/Pendule_Multiple_Screenshot.png";

import VideoPendul from "/res/Videos/Pendul Video.mp4";
import Layout from "../../Layout";
import SEO from "../../SEO";

const PendulePage = () => {
  const Images = [
    { src: simulatorGraficePendulImg, alt: "Grafice Pendul" },
    { src: simulatorPendulSimpluImg, alt: "Pendulul Simplu" },
    { src: simulatorPendulAmortizatImg, alt: "Pendulul Amortizat" },
    { src: simulatorTrasnitPendulImg, alt: "Pendulul Mecanic" },
    { src: VideoPendul, alt: "Video Pendul" }
  ];


  return (
    <Layout>
      <SEO
        title="Resurse Pendule | Mișcarea Oscilatorie Armonică - PULS"
        description="Învață despre mișcarea oscilatorie armonică și pendule. Materiale teoretice, formule, simulări interactive și video-uri educaționale pentru pendulul simplu, amortizat și neliniar."
        keywords="pendule, mișcare oscilatorie, pendul simplu, pendul amortizat, oscilații armonice, fizică pendule"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Mișcarea oscilatorie armonică. </h1>
            <div className="max-w-3xl mb-10 mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Proprietățile mișcării oscilatorii armonice. </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Oscilatorul liniar armonic este un sistem fizic idealizat care descrie mișcarea periodică a unui obiect supus unei forțe restauratoare proporționale cu deplasarea sa față de poziția de echilibru. Este un model fundamental în fizică, cu aplicații în mecanică, electricitate, acustică și chiar mecanica cuantică.
              </p>
              <p className="text-lg text-muted-foreground">
                Explorează simulările noastre pentru a vizualiza comportamentul oscilatorilor armonici și pentru a înțelege mai bine conceptele de bază precum perioada, frecvența și amplitudinea.
              </p>
            </div>
            <div className="space-y-12">
              {/* Grafice Pendul */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Grafice Armonice</h2>
                <p className="text-muted-foreground mb-6">
                  Mișcarea oscilatorie armonică este caracterizată printr-o oscilație periodică, care poate fi reprezentată grafic printr-o funcție sinusoidală.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={Images[0].src}
                    alt={Images[0].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ecuațiile mișcării oscilatorii aduse la formă sinusoidală sunt:</h3>
                    <h3 className="text-xl font-semibold mb-2">Legea Mişcării:</h3>
                    <div className="formula-resurse text-lg font-mono">
                      {"\\( y(t) = A \\sin(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Legea Vitezei:</h3>
                    <div className="formula-resurse text-lg font-mono">
                      {"\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Legea Acceleratiei:</h3>
                    <div className="formula-resurse text-lg font-mono">
                      {"\\( a(t) = -\\omega ^2 A \\sin(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mt-2">
                      unde A este amplitudinea, {"\\(\\omega\\)"} <MathJaxRender /> este viteza unghiulară, {"\\(\\phi\\)"} <MathJaxRender /> este unghiul initial, iar t este perioada.
                    </p>
                  </div>
                  <a
                    href="/simulare/grafice-pendule"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">
                      Vezi simularea
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pendule</h1>
              <p className="text-lg text-muted-foreground mb-4">
                Pendulul este un exemplu clasic de sistem oscilatoriu. Studierea mișcării pendulului ne ajută să înțelegem
                concepte fundamentale precum perioada, frecvența și forța de restabilire.
              </p>
              <p className="text-lg text-muted-foreground">
                Explorează simulările noastre pentru a vizualiza comportamentul diferitelor tipuri de pendule.
              </p>
            </div>
            <div className="space-y-12">
              {/* Pendulul simplu */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Pendulul gravitational</h2>
                <p className="text-muted-foreground mb-6">
                  Pendulul gravitațional este un ansamblu format dintr-un corp punctiform de masă m, atârnat de un fir inextensibil, de masă neglijabilă și lungime l. Dacă corpul este scos din poziția de echilibru și lăsat liber, pentru unghiuri mici de deviație el va oscila liniar armonic cu perioada de oscilație:
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={Images[1].src}
                    alt={Images[1].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Formula perioadei:</h3>
                    <div className="formula-resurse text-lg font-mono">
                      {"\\( T = 2\\pi \\cdot \\sqrt{\\frac{l}{g}} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mt-2">
                      unde l este lungimea pendulului, iar g este accelerația gravitațională.
                    </p>
                  </div>
                  <a
                    href="/simulare/pendul-simplu"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">
                      Vezi simularea
                    </Button>
                  </a>
                </div>
              </div>
              {/* Pendulul amortizat*/}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Pendulul Amortizat</h2>
                <p className="text-muted-foreground mb-6">
                  Pendulul amortizat este un sistem oscilatoriu în care oscilațiile sunt reduse treptat datorită forțelor de frecare sau rezistență, cum ar fi aerul sau alte medii. Acest tip de pendul este important pentru înțelegerea fenomenelor reale în care energia este disipată.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={Images[2].src}
                    alt={Images[2].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Caracteristici:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Oscilații cu amplitudine în scădere</li>
                      <li>Perioada de oscilație depinde de coeficientul de amortizare</li>
                      <li>Comportament complex la oscilații mari</li>
                      <li>Relația între forța de restabilire și viteza este liniară</li>
                      <li>Exemplu: pendul cu frecare</li>
                      <li>Ecuația de mișcare:</li>
                      <div className="formula-resurse text-lg font-mono">
                        {"\\( m\\frac{d^2x}{dt^2} + b\\frac{dx}{dt} + kx = 0 \\)"}
                        <MathJaxRender />
                      </div>

                    </ul>
                  </div>
                  <a
                    href="/simulare/pendul-amortizat"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">
                      Vezi simularea
                    </Button>
                  </a>
                </div>
              </div>
              {/* Pendulul mecanic*/}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Pendul simplu neliniar</h2>
                <p className="text-muted-foreground mb-6">
                  Este compus dintr-o masă (punctuală) legată de un fir inextensibil, care oscilează sub acțiunea gravitației, fără a aproxima unghiul.
                  Pentru unghiuri mari, soluția nu mai este sinusoidală, iar perioada depinde de amplitudinea oscilației.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={Images[3].src}
                    alt={Images[3].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Formule:</h3>
                    Ecuația de mișcare pentru pendulul simplu neliniar este:
                    <div className="formula-resurse text-lg font-mono mt-2">
                      {"\\( \\frac{d^2\\theta}{dt^2} + \\frac{g}{l} \\sin\\theta = 0 \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mt-2">
                      unde {"\\(\\theta\\)"} <MathJaxRender /> este unghiul de deviație, l este lungimea firului și g este accelerația gravitațională.
                    </p>
                  </div>
                  <a
                    href="/simulare/pendul-neliniar"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">
                      Vezi simularea
                    </Button>
                  </a>
                </div>
              </div>
              {/* Pendule multiple */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Pendule multiple</h2>
                <p className="text-muted-foreground mb-6">
                  Simulatorul de pendule multiple permite observarea comportamentului haotic al mai multor pendule
                  care pornesc din condiții inițiale foarte apropiate. Deși diferențele inițiale sunt mici, traiectoriile
                  lor devin rapid complet diferite, un exemplu spectaculos de sensibilitate la condițiile inițiale
                  (haos determinist).
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={penduleMultipleImg}
                    alt="Simulator Pendule Multiple"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ce poți observa în simulare:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>
                        Cum pendule duble aproape identice se desincronizează rapid datorită naturii neliniare a mișcării.
                      </li>
                      <li>
                        Urmele colorate ale fiecărui pendul, care evidențiază traiectoriile complexe și aparent „dezordonate”.
                      </li>
                      <li>
                        Tranziția de la mișcare „aproape periodică” la comportament haotic pentru anumite valori ale
                        parametrilor.
                      </li>
                    </ul>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Formule utile:</h3>
                    <p className="text-muted-foreground mb-2">
                      Fiecare pendul individual urmează, în ipoteza idealizată (fără frecare), aceeași ecuație neliniară ca
                      pendulul simplu, dar cu condiții inițiale ușor diferite:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\frac{d^2\\theta_i}{dt^2} + \\frac{g}{l} \\sin\\theta_i = 0 \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Pentru unghiuri mici, fiecare pendul poate fi aproximat ca oscilator armonic:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\frac{d^2\\theta_i}{dt^2} + \\omega_0^2 \\, \\theta_i = 0, \\quad \\omega_0 = \\sqrt{\\frac{g}{l}} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground">
                      Chiar dacă ecuațiile par simple, soluțiile pentru sisteme cu pendule multiple sunt extrem de
                      sensibile la condițiile inițiale: o mică modificare a lui {"\\(\\theta_i(0)\\)"} <MathJaxRender /> sau
                      {"\\(\\dot{\\theta}_i(0)\\)"} <MathJaxRender /> duce la traiectorii complet diferite în timp, exact
                      ceea ce vezi în simulare.
                    </p>
                  </div>
                  <a
                    href="/simulare/pendule-multiple"
                    className="resurse-link"
                  >
                    <Button size="lg">
                      Vezi simularea
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

export default PendulePage;
