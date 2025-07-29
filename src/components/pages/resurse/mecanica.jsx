import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";

import simulatorOscilatieOYImg from "/res/screenshots/Oscilatieoy_Screenshot.png";
import simulatorOscilatieOXImg from "/res/screenshots/Oscilatieox_Screenshot.png";
import simulatorCiocnireImg from "/res/screenshots/Ciocnire_Screenshot.png";
// Nu exista imagine pentru plan inclinat

import Layout from "../../Layout";

const MecanicaPage = () => {
  return (
    <Layout>
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Mecanică - Mișcări Oscilatorii și Coliziuni</h1>
            
            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Mecanica studiază mișcarea corpurilor și forțele care o produc. În această secțiune, ne concentrăm pe mișcările oscilatorii și procesele de coliziune, 
                care reprezintă fundamentul pentru înțelegerea multor fenomene fizice complexe.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Mișcările oscilatorii sunt caracterizate prin repetarea periodică a unei mișcări în timp, fiind prezente în aproape toate sistemele fizice, 
                de la pendulul simplu până la vibrațiile atomice. Aceste mișcări sunt guvernate de forțe restauratoare care tind să readucă sistemul la poziția de echilibru.
              </p>
              <p className="text-lg text-muted-foreground">
                Coliziunile, pe de altă parte, sunt procese fundamentale în care două sau mai multe corpuri interacționează prin forțe de contact pe o durată scurtă, 
                schimbându-și impulsul și energia cinetică conform legilor de conservare.
              </p>
            </div>

            <div className="space-y-12">
              {/* Miscarea oscilatorie pe OX */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Mișcarea oscilatorie pe OX</h2>
                <p className="text-muted-foreground mb-6">
                  Mișcarea oscilatorie pe OX descrie oscilația unui corp pe o direcție orizontală, sub acțiunea unei forțe restauratoare proporționale cu deplasarea. 
                  Această mișcare este fundamentală pentru înțelegerea sistemelor oscilatorii și a comportamentului lor în timp.
                </p>
                <p className="text-muted-foreground mb-6">
                  Când un corp este deplasat din poziția sa de echilibru pe axa OX, forța restauratoare F = -kx (legea lui Hooke) îl readuce spre poziția de echilibru. 
                  Această forță generează o mișcare oscilatorie armonică, caracterizată prin ecuații matematice precise care descriu poziția, viteza și accelerația corpului în timp.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorOscilatieOXImg}
                    alt="Oscilatie OX"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ecuațiile mișcării oscilatorii pe OX:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Legea mișcării:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( x(t) = A \\sin(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Legea vitezei:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Legea accelerației:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Viteza unghiulară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\omega = \\sqrt{\\frac{k}{m}} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Perioada oscilației:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: A este amplitudinea, {"\\(\\omega\\)"} <MathJaxRender /> viteza unghiulară, {"\\(\\phi\\)"} <MathJaxRender /> faza inițială, 
                      k este constanta elastică, m este masa corpului, iar t este timpul.
                    </p>
                  </div>
                  <a
                    href="/simulari/Oscilatii elastice  pe OX/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Miscarea oscilatorie pe OY */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Mișcarea oscilatorie pe OY</h2>
                <p className="text-muted-foreground mb-6">
                  Oscilatorul armonic vertical este un model fundamental pentru studiul mișcării unui corp atașat de un arc ce oscilează pe verticală. 
                  Această mișcare combină efectele gravitației cu forța elastică a arcului, creând un sistem oscilator complex și interesant.
                </p>
                <p className="text-muted-foreground mb-6">
                  În cazul oscilatorului vertical, poziția de echilibru nu mai este la x = 0, ci la o poziție unde forța elastică echilibrează forța gravitațională. 
                  Această poziție de echilibru se modifică în funcție de masa corpului și de constanta elastică a arcului.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorOscilatieOYImg}
                    alt="Oscilatie OY"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ecuațiile mișcării oscilatorii pe OY:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Poziția de echilibru:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( y_0 = \\frac{mg}{k} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Legea mișcării:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( y(t) = y_0 + A \\sin(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Legea vitezei:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Energia totală:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( E = \\frac{1}{2}mv^2 + \\frac{1}{2}ky^2 + mgy \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Frecvența naturală:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( f = \\frac{1}{2\\pi} \\sqrt{\\frac{k}{m}} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: y₀ este poziția de echilibru, A este amplitudinea, {"\\(\\omega\\)"} <MathJaxRender /> viteza unghiulară, 
                      {"\\(\\phi\\)"} <MathJaxRender /> faza inițială, k este constanta elastică, m este masa, g este accelerația gravitațională.
                    </p>
                  </div>
                  <a
                    href="/simulari/Legea Hooke-oscilatii oy/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Ciocnirea */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Ciocnirea</h2>
                <p className="text-muted-foreground mb-6">
                  Ciocnirile sunt procese fundamentale în mecanică, unde două sau mai multe corpuri interacționează prin forțe de contact pe o durată scurtă. 
                  Aceste procese sunt esențiale pentru înțelegerea conservării impulsului și energiei în sistemele fizice.
                </p>
                <p className="text-muted-foreground mb-6">
                  În timpul unei ciocniri, forțele de interacțiune sunt foarte mari comparativ cu forțele externe, ceea ce permite aplicarea principiilor de conservare. 
                  Tipurile principale de ciocniri sunt: ciocniri elastice (unde energia cinetică se conservă) și ciocniri inelastice (unde energia cinetică se transformă parțial în alte forme de energie).
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorCiocnireImg}
                    alt="Ciocnire"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru ciocniri:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Conservarea impulsului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Coeficientul de restituire (ciocniri elastice):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Vitezele finale (ciocnire elastică):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v_{1f} = \\frac{(m_1 - m_2)v_{1i} + 2m_2v_{2i}}{m_1 + m_2} \\)"}
                      <MathJaxRender />
                    </div>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v_{2f} = \\frac{(m_2 - m_1)v_{2i} + 2m_1v_{1i}}{m_1 + m_2} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Energia cinetică în ciocniri elastice:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{1}{2}m_1v_{1i}^2 + \\frac{1}{2}m_2v_{2i}^2 = \\frac{1}{2}m_1v_{1f}^2 + \\frac{1}{2}m_2v_{2f}^2 \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Impulsul total:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\vec{p} = m\\vec{v} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: m₁, m₂ sunt masele corpurilor, v₁ᵢ, v₂ᵢ sunt vitezele inițiale, v₁f, v₂f sunt vitezele finale, 
                      e este coeficientul de restituire (e = 1 pentru ciocniri perfect elastice, e = 0 pentru ciocniri perfect inelastice).
                    </p>
                  </div>
                  <a
                    href="/simulari/Ciocnire/ciocnire.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Plan înclinat */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Plan înclinat</h2>
                <p className="text-muted-foreground mb-6">
                  Planul înclinat este un exemplu clasic de analiză a forțelor și mișcării pe o suprafață înclinată. 
                  Această problemă fundamentală din mecanică demonstrează cum forța gravitațională poate fi descompusă în componente 
                  și cum acestea influențează mișcarea unui corp.
                </p>
                <p className="text-muted-foreground mb-6">
                  Studiul planului înclinat este esențial pentru înțelegerea conceptelor de forță, accelerație și energie potențială. 
                  Acesta oferă o bază solidă pentru analiza problemelor mai complexe din mecanică și inginerie.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8 bg-gray-200 text-gray-500">
                  <span className="text-xl">Imagine în curând</span>
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru planul înclinat:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Componenta paralelă a forței gravitaționale:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( F_{||} = mg \\sin(\\alpha) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Componenta perpendiculară a forței gravitaționale:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( F_{\\perp} = mg \\cos(\\alpha) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Forța de frecare:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( F_f = \\mu N = \\mu mg \\cos(\\alpha) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Accelerația pe plan înclinat:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( a = g(\\sin(\\alpha) - \\mu \\cos(\\alpha)) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Viteza la baza planului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v = \\sqrt{2gh(1 - \\mu \\cot(\\alpha))} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">6. Timpul de coborâre:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t = \\sqrt{\\frac{2h}{g(\\sin(\\alpha) - \\mu \\cos(\\alpha))}} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: m este masa corpului, g este accelerația gravitațională, {"\\(\\alpha\\)"} <MathJaxRender /> unghiul de înclinare, 
                      {"\\(\\mu\\)"} <MathJaxRender /> coeficientul de frecare, h este înălțimea planului, N este forța normală.
                    </p>
                  </div>
                  <a
                    href="/simulari/Mix/plan-inclinat.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
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

export default MecanicaPage;
