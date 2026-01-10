import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";

import simulatorGraficeBasicImg from "/res/screenshots/Grafice_Basic_Screenshot.png";

const ElectricitatePage = () => {
  return (
    <Layout>
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Electricitate</h1>
            
            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Electricitatea este ramura fizicii care studiază fenomenele legate de sarcinile electrice, curenții electrici, 
                câmpurile electrice și magnetice, precum și interacțiunile dintre ele. Această disciplină fundamentală stă la baza 
                tehnologiei moderne și a multor aplicații practice.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Studiul electricității include analiza circuitelor electrice, legile lui Ohm și Kirchhoff, energia electrică, 
                puterea electrică și comportamentul componentelor electrice precum rezistoarele, condensatoarele și bobinele.
              </p>
              <p className="text-lg text-muted-foreground">
                Înțelegerea electricității este esențială pentru proiectarea și analiza sistemelor electrice, de la circuite simple 
                până la sisteme complexe de distribuție a energiei.
              </p>
            </div>

            <div className="space-y-12">
              {/* Circuite Electrice */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Circuite Electrice</h2>
                <p className="text-muted-foreground mb-6">
                  Circuitele electrice sunt sisteme închise care permit circulația curentului electric prin componente conectate. 
                  Analiza circuitelor electrice se bazează pe legile fundamentale ale electricității: legea lui Ohm și legile lui Kirchhoff.
                </p>
                <p className="text-muted-foreground mb-6">
                  Un circuit electric poate conține diverse componente precum rezistoare, surse de tensiune, condensatori și bobine. 
                  Fiecare componentă are caracteristici specifice care influențează comportamentul circuitului în ansamblu.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorGraficeBasicImg}
                    alt="Circuite Electrice"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule esențiale pentru circuite electrice:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Legea lui Ohm:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( U = RI \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Puterea electrică:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( P = UI = RI^2 = \\frac{U^2}{R} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Energia electrică:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( W = UIt = RI^2t = \\frac{U^2}{R}t \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Rezistența echivalentă în serie:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( R_{eq} = R_1 + R_2 + ... + R_n \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Rezistența echivalentă în paralel:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">6. Prima lege a lui Kirchhoff (conservarea sarcinii):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\sum I_{intrare} = \\sum I_{iesire} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">7. A doua lege a lui Kirchhoff (conservarea energiei):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\sum U = \\sum RI \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">8. Rezistența unui conductor:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( R = \\rho \\frac{l}{S} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">9. Curentul electric:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( I = \\frac{q}{t} = nqvS \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">10. Densitatea curentului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( j = \\frac{I}{S} = nqv \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: U este tensiunea, I este intensitatea curentului, R este rezistența, P este puterea, W este energia, 
                      q este sarcina electrică, t este timpul, ρ este rezistivitatea, l este lungimea conductorului, 
                      S este secțiunea transversală, n este numărul de purtători de sarcină pe unitate de volum, v este viteza de drift.
                    </p>
                  </div>
                  <a
                    href="/simulare/circuite-electricitate"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Energia în Circuite */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Energia în Circuite</h2>
                <p className="text-muted-foreground mb-6">
                  Energia electrică este energia asociată cu mișcarea sarcinilor electrice într-un circuit. 
                  Această energie poate fi transformată în alte forme de energie, precum căldură, lumină sau energie mecanică.
                </p>
                <p className="text-muted-foreground mb-6">
                  Studiul energiei în circuite este esențial pentru înțelegerea eficienței energetice și a consumului de energie 
                  în sistemele electrice. Legea conservării energiei se aplică și în circuitele electrice, unde energia furnizată 
                  de surse este egală cu energia consumată de componente.
                </p>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru energia în circuite:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Energia consumată de un rezistor:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( W = RI^2t = \\frac{U^2}{R}t = UIt \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Puterea instantanee:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( P(t) = U(t)I(t) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Energia stocată într-un condensator:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( W = \\frac{1}{2}CU^2 = \\frac{Q^2}{2C} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Energia stocată într-o bobină:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( W = \\frac{1}{2}LI^2 \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Randamentul unui circuit:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\eta = \\frac{P_{utila}}{P_{totala}} \\times 100\\% \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: W este energia, P este puterea, C este capacitatea condensatorului, L este inductanța bobinei, 
                      Q este sarcina electrică, η este randamentul.
                    </p>
                  </div>
                  <a
                    href="/simulare/energie-circuite"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Câmp Electric */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Câmp Electric</h2>
                <p className="text-muted-foreground mb-6">
                  Câmpul electric este o mărime fizică vectorială care descrie forța exercitată asupra unei sarcini electrice 
                  într-un anumit punct din spațiu. Câmpul electric este generat de sarcini electrice și poate fi reprezentat 
                  prin linii de câmp care arată direcția și intensitatea câmpului.
                </p>
                <p className="text-muted-foreground mb-6">
                  Studiul câmpului electric este fundamental pentru înțelegerea interacțiunilor electrice și a comportamentului 
                  sarcinilor electrice în diferite configurații. Câmpul electric poate fi uniform sau neuniform, în funcție de 
                  distribuția sarcinilor care îl generează.
                </p>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Formule pentru câmpul electric:</h3>
                  
                  <h4 className="text-lg font-semibold mb-2">1. Intensitatea câmpului electric:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( \\vec{E} = \\frac{\\vec{F}}{q} \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">2. Câmpul electric al unei sarcini punctiforme:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( E = k \\frac{q}{r^2} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2} \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">3. Potențialul electric:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( V = \\frac{W}{q} = k \\frac{q}{r} \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">4. Tensiunea electrică:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( U = V_1 - V_2 = Ed \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">5. Capacitatea unui condensator plan:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( C = \\frac{\\varepsilon_0 S}{d} \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">6. Energia câmpului electric:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( W = \\frac{1}{2}\\varepsilon_0 E^2 V \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <p className="text-muted-foreground mt-4">
                    Unde: E este intensitatea câmpului electric, F este forța, q este sarcina, k este constanta Coulomb, 
                    r este distanța, V este potențialul, W este energia, U este tensiunea, d este distanța, 
                    ε₀ este permitivitatea vidului, S este suprafața, C este capacitatea.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ElectricitatePage;

