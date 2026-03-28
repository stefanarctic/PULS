import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import { useEffect, useState } from "react";

import termodinamicaImg from "/res/screenshots/Termodinamica_Screenshot.png";
import motoareTermiceImg from "/res/screenshots/Motoare_Termice_Screenshot.png";
import tabelPeriodicImg from "/res/screenshots/Tabel_periodic_Screenshot.png";
import { tabelPeriodicFormulas } from "@/data/tabelPeriodicFormulas";

const TermodinamicaPage = () => {
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});

  // Definim formulele pentru fiecare secțiune
  const termodinamicaFormulas = [
    { formula: "\\( \\Delta U = Q - L \\)", title: "Prima lege a termodinamicii" },
    { formula: "\\( pV = nRT \\)", title: "Ecuația de stare pentru gazul ideal" },
    { formula: "\\( S = k_B \\ln \\Omega \\)", title: "Entropia (definiția Boltzmann)" },
    { formula: "\\( \\Delta S \\geq \\frac{Q}{T} \\)", title: "A doua lege a termodinamicii" },
    { formula: "\\( U = \\frac{f}{2}nRT \\)", title: "Energia internă pentru gazul ideal" },
    { formula: "\\( L = \\int_{V_1}^{V_2} p \\, dV \\)", title: "Lucrul mecanic în procese reversibile" },
    { formula: "\\( C_V = \\left(\\frac{\\partial U}{\\partial T}\\right)_V \\)", title: "Căldura specifică la volum constant" },
    { formula: "\\( C_P = \\left(\\frac{\\partial H}{\\partial T}\\right)_P \\)", title: "Căldura specifică la presiune constantă" },
    { formula: "\\( H = U + pV \\)", title: "Entalpia" },
    { formula: "\\( F = U - TS \\)", title: "Energia liberă Helmholtz" },
    { formula: "\\( G = H - TS \\)", title: "Energia liberă Gibbs" },
    { formula: "\\( \\kappa = -\\frac{1}{V}\\left(\\frac{\\partial V}{\\partial p}\\right)_T \\)", title: "Coeficientul de compresibilitate" },
    { formula: "\\( \\alpha = \\frac{1}{V}\\left(\\frac{\\partial V}{\\partial T}\\right)_p \\)", title: "Coeficientul de dilatare termică" },
    { formula: "\\( \\eta = 1 - \\frac{T_C}{T_H} \\)", title: "Eficiența motorului Carnot" },
  ];

  const motoareFormulas = [
    { formula: "\\( \\eta = \\frac{L_{util}}{Q_H} = 1 - \\frac{Q_C}{Q_H} \\)", title: "Randamentul unui motor termic" },
    { formula: "\\( \\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H} \\)", title: "Randamentul ideal (Carnot)" },
    { formula: "\\( L = \\oint p \\, dV \\)", title: "Lucrul mecanic într-un ciclu" },
    { formula: "\\( Q_{p} = n C_P \\Delta T \\)", title: "Căldura schimbată într-un proces izobar" },
  ];

  // Algoritm de încărcare progresivă - versiune optimizată
  useEffect(() => {
    const sections = [
      { key: 'termodinamica', formulas: termodinamicaFormulas },
      { key: 'motoare', formulas: motoareFormulas },
      { key: 'tabel_periodic', formulas: tabelPeriodicFormulas },
    ];

    // Inițializăm toate secțiunile cu batch-ul inițial
    setVisibleFormulasCount(prev => {
      const newState = { ...prev };
      sections.forEach(({ key, formulas }) => {
        if (!newState[key] && formulas.length > 0) {
          newState[key] = Math.min(5, formulas.length);
        }
      });
      return newState;
    });

    // Folosim un singur interval simplu pentru toate secțiunile
    let intervalId = null;

    intervalId = setInterval(() => {
      setVisibleFormulasCount(prev => {
        const newState = { ...prev };
        let hasMore = false;

        sections.forEach(({ key, formulas }) => {
          const currentVisible = newState[key] || 0;
          const totalFormulas = formulas.length;
          
          if (currentVisible < totalFormulas) {
            const batchSize = 5;
            const newCount = Math.min(currentVisible + batchSize, totalFormulas);
            newState[key] = newCount;
            if (newCount < totalFormulas) {
              hasMore = true;
            }
          }
        });

        // Oprim interval-ul dacă toate secțiunile sunt complete
        if (!hasMore && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        return newState;
      });
    }, 100); // Delay de 100ms între batch-uri

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Termodinamică</h1>
            
            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Termodinamica este ramura fizicii care studiază transformările energiei și legile care guvernează aceste procese. 
                Această disciplină fundamentală descrie comportamentul sistemelor macroscopice în funcție de parametrii termodinamici 
                precum temperatura, presiunea, volumul și energia internă.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Principalele concepte ale termodinamicii includ energia internă, entropia, căldura, lucrul mecanic și potențialele termodinamice. 
                Aceste mărimi sunt interconectate prin legile fundamentale ale termodinamicii, care guvernează toate procesele fizice și chimice.
              </p>
              <p className="text-lg text-muted-foreground">
                Studiul termodinamicii este esențial pentru înțelegerea motoarelor termice, frigiderelor, proceselor chimice și a multor alte 
                fenomene naturale și tehnologice care implică transferul și transformarea energiei.
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Procese termodinamice fundamentale</h2>
                <p className="text-muted-foreground mb-6">
                  Termodinamica studiază transformările energiei și legile care guvernează aceste procese. Principalele concepte sunt temperatura, presiunea, volumul, energia internă și entropia.
                </p>
                <p className="text-muted-foreground mb-6">
                  Un sistem termodinamic poate fi descris prin variabile de stare precum presiunea (P), volumul (V), temperatura (T) și numărul de particule (N). 
                  Aceste variabile sunt interconectate prin ecuațiile de stare, care descriu comportamentul specific al diferitelor substanțe.
                </p>
                <p className="text-muted-foreground mb-6">
                  Procesele termodinamice pot fi reversibile sau ireversibile, izoterme, izobare, izocore sau adiabatice, fiecare având caracteristici specifice 
                  și fiind descrise prin ecuații matematice precise care reflectă conservarea energiei și creșterea entropiei.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={termodinamicaImg}
                    alt="Termodinamica"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule esențiale în termodinamică:</h3>
                    
                    {termodinamicaFormulas
                      .slice(0, visibleFormulasCount.termodinamica || termodinamicaFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.termodinamica > 0 && (
                      <MathJaxRender key={`termodinamica-${visibleFormulasCount.termodinamica || 0}`} />
                    )}
                    
                    <p className="text-muted-foreground mt-6">
                      Unde: U este energia internă, Q este căldura, L este lucrul mecanic, p este presiunea, V este volumul, 
                      n este numărul de moli, R este constanta gazelor, T este temperatura, S este entropia, k_B este constanta lui Boltzmann, 
                      Ω este numărul de microstate, f este numărul de grade de libertate, H este entalpia, F este energia liberă Helmholtz, 
                      G este energia liberă Gibbs, κ este coeficientul de compresibilitate, α este coeficientul de dilatare termică, 
                      η este eficiența, T_C este temperatura sursei reci, T_H este temperatura sursei calde.
                    </p>
                  </div>
                  <a
                    href="/simulare/termodinamica"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Motoare termice */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Motoare termice</h2>
                <p className="text-muted-foreground mb-6">
                  Motoarele termice transformă energia termică (căldura) primită de la o sursă caldă în lucru mecanic util,
                  evacuând o parte din energie către o sursă rece. Exemple de motoare termice sunt motoarele cu ardere
                  internă (Otto, Diesel), turbinele cu gaz sau abur și chiar mașina idealizată a lui Carnot.
                </p>
                <p className="text-muted-foreground mb-6">
                  Simulatorul de motoare termice îți permite să vizualizezi ciclurile termodinamice pe diagrame p‑V și T‑s,
                  să compari randamentul diferitelor motoare și să înțelegi rolul fiecărei faze: comprimare, ardere/încălzire,
                  destindere și evacuare.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={motoareTermiceImg}
                    alt="Motoare termice"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule importante pentru motoarele termice:</h3>

                    {motoareFormulas
                      .slice(0, visibleFormulasCount.motoare || motoareFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-3">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.motoare > 0 && (
                      <MathJaxRender key={`motoare-${visibleFormulasCount.motoare || 0}`} />
                    )}

                    <p className="text-muted-foreground mt-4">
                      Unde: {"\\(\\eta\\)"} <MathJaxRender /> este randamentul, {"\\(L_{util}\\)"} <MathJaxRender /> lucrul
                      mecanic util pe ciclu, {"\\(Q_H\\)"} <MathJaxRender /> căldura primită de la sursa caldă,{" "}
                      {"\\(Q_C\\)"} <MathJaxRender /> căldura cedată către sursa rece, {"\\(T_H\\)"} și {"\\(T_C\\)"}
                      <MathJaxRender /> sunt temperaturile absolute ale sursei calde și reci, iar integralul{" "}
                      {"\\(\\oint p\\,dV\\)"} <MathJaxRender /> reprezintă aria ciclului pe diagrama p‑V (lucrul mecanic
                      produs de motor într-un ciclu complet.
                    </p>
                  </div>
                  <a
                    href="/simulare/motoare-termice"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Tabel periodic */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Tabelul periodic (mărimi utile în probleme)</h2>
                <p className="text-muted-foreground mb-6">
                  Tabelul periodic este esențial când ai nevoie rapid de simbolul elementului, numărul atomic (Z) și, mai ales,
                  de masa molară (M) pentru calcule cu moli, particule și concentrații. În termodinamică, aceste mărimi apar frecvent
                  în problemele cu gaze (n), amestecuri, calorimetrie și ecuația gazului ideal.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={tabelPeriodicImg}
                    alt="Tabelul periodic"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule/relatii utile:</h3>
                    {tabelPeriodicFormulas
                      .slice(0, visibleFormulasCount.tabel_periodic || tabelPeriodicFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.tabel_periodic > 0 && (
                      <MathJaxRender key={`tabel_periodic-${visibleFormulasCount.tabel_periodic || 0}`} />
                    )}
                    <p className="text-muted-foreground mt-6">
                      Unde: Z = numărul de protoni, A = numărul de masă, N = numărul de neutroni, n = numărul de moli, m = masa,
                      M = masa molară, {"\\(N_A\\)"} <MathJaxRender /> = constanta lui Avogadro, c = concentrația molară, V = volum.
                    </p>
                  </div>
                  <a
                    href="/simulare/tabel-periodic"
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

export default TermodinamicaPage;
