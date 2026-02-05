import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import { useEffect, useState } from "react";

import circuiteElectricitateImg from "/res/screenshots/Circuite_Electricitate_Screenshot.png";
import energieCircuiteImg from "/res/screenshots/Energie_Circuite_Screenshot.png";

const ElectricitatePage = () => {
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});

  // Definim formulele pentru fiecare secțiune
  const circuiteFormulas = [
    { formula: "\\( U = RI \\)", title: "Legea lui Ohm" },
    { formula: "\\( P = UI = RI^2 = \\frac{U^2}{R} \\)", title: "Puterea electrică" },
    { formula: "\\( W = UIt = RI^2t = \\frac{U^2}{R}t \\)", title: "Energia electrică" },
    { formula: "\\( R_{eq} = R_1 + R_2 + ... + R_n \\)", title: "Rezistența echivalentă în serie" },
    { formula: "\\( \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n} \\)", title: "Rezistența echivalentă în paralel" },
    { formula: "\\( \\sum I_{intrare} = \\sum I_{iesire} \\)", title: "Prima lege a lui Kirchhoff" },
    { formula: "\\( \\sum U = \\sum RI \\)", title: "A doua lege a lui Kirchhoff" },
    { formula: "\\( R = \\rho \\frac{l}{S} \\)", title: "Rezistența unui conductor" },
    { formula: "\\( I = \\frac{q}{t} = nqvS \\)", title: "Curentul electric" },
    { formula: "\\( j = \\frac{I}{S} = nqv \\)", title: "Densitatea curentului" },
  ];

  const energieFormulas = [
    { formula: "\\( W = RI^2t = \\frac{U^2}{R}t = UIt \\)", title: "Energia consumată de un rezistor" },
    { formula: "\\( P(t) = U(t)I(t) \\)", title: "Puterea instantanee" },
    { formula: "\\( W = \\frac{1}{2}CU^2 = \\frac{Q^2}{2C} \\)", title: "Energia stocată într-un condensator" },
    { formula: "\\( W = \\frac{1}{2}LI^2 \\)", title: "Energia stocată într-o bobină" },
    { formula: "\\( \\eta = \\frac{P_{utila}}{P_{totala}} \\times 100\\% \\)", title: "Randamentul unui circuit" },
  ];

  // Algoritm de încărcare progresivă
  useEffect(() => {
    const sections = [
      { key: 'circuite', formulas: circuiteFormulas },
      { key: 'energie', formulas: energieFormulas },
    ];

    sections.forEach(({ key, formulas }) => {
      const totalFormulas = formulas.length;
      if (totalFormulas === 0) return;

      setVisibleFormulasCount(prev => {
        const currentVisible = prev[key] || 0;
        if (currentVisible >= totalFormulas) {
          return prev;
        }
        const batchSize = 5;
        const startCount = currentVisible > 0 ? currentVisible : Math.min(batchSize, totalFormulas);
        return {
          ...prev,
          [key]: startCount
        };
      });

      const intervalId = setInterval(() => {
        setVisibleFormulasCount(prev => {
          const currentVisible = prev[key] || 0;
          if (currentVisible < totalFormulas) {
            const batchSize = 5;
            const newCount = Math.min(currentVisible + batchSize, totalFormulas);
            if (newCount >= totalFormulas) {
              clearInterval(intervalId);
            }
            return {
              ...prev,
              [key]: newCount
            };
          }
          clearInterval(intervalId);
          return prev;
        });
      }, 50);

      return () => clearInterval(intervalId);
    });
  }, []);

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
                    src={circuiteElectricitateImg}
                    alt="Simulator Circuite Electrice"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule esențiale pentru circuite electrice:</h3>
                    
                    {circuiteFormulas
                      .slice(0, visibleFormulasCount.circuite || circuiteFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                            <MathJaxRender />
                          </div>
                        </div>
                      ))}
                    <MathJaxRender key={`circuite-${visibleFormulasCount.circuite || 0}`} />
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: U este tensiunea, I este intensitatea curentului, R este rezistența, P este puterea, W este energia, 
                      q este sarcina electrică, t este timpul, ρ este rezistivitatea, l este lungimea conductorului, 
                      S este secțiunea transversală, n este numărul de purtători de sarcină pe unitate de volum, v este viteza de drift.
                    </p>
                  </div>
                  <a
                    href="/simulare/circuite-electricitate"
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
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={energieCircuiteImg}
                    alt="Simulator Energie în Circuite"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru energia în circuite:</h3>
                    
                    {energieFormulas
                      .slice(0, visibleFormulasCount.energie || energieFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                            <MathJaxRender />
                          </div>
                        </div>
                      ))}
                    <MathJaxRender key={`energie-${visibleFormulasCount.energie || 0}`} />
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: W este energia, P este puterea, C este capacitatea condensatorului, L este inductanța bobinei, 
                      Q este sarcina electrică, η este randamentul.
                    </p>
                  </div>
                  <a
                    href="/simulare/energie-circuite"
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

export default ElectricitatePage;

