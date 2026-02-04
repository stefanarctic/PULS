import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";

import termodinamicaImg from "/res/screenshots/Termodinamica_Screenshot.png";
import motoareTermiceImg from "/res/screenshots/Motoare_Termice_Screenshot.png";

const TermodinamicaPage = () => {
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
                    
                    <h4 className="text-lg font-semibold mb-2">1. Prima lege a termodinamicii:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta U = Q - L \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Ecuația de stare pentru gazul ideal:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( pV = nRT \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Entropia (definiția Boltzmann):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( S = k_B \\ln \\Omega \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. A doua lege a termodinamicii:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta S \\geq \\frac{Q}{T} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Energia internă pentru gazul ideal:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( U = \\frac{f}{2}nRT \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">6. Lucrul mecanic în procese reversibile:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( L = \\int_{V_1}^{V_2} p \\, dV \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">7. Căldura specifică la volum constant:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( C_V = \\left(\\frac{\\partial U}{\\partial T}\\right)_V \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">8. Căldura specifică la presiune constantă:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( C_P = \\left(\\frac{\\partial H}{\\partial T}\\right)_P \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">9. Entalpia:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( H = U + pV \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">10. Energia liberă Helmholtz:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( F = U - TS \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">11. Energia liberă Gibbs:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( G = H - TS \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">12. Coeficientul de compresibilitate:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\kappa = -\\frac{1}{V}\\left(\\frac{\\partial V}{\\partial p}\\right)_T \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">13. Coeficientul de dilatare termică:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\alpha = \\frac{1}{V}\\left(\\frac{\\partial V}{\\partial T}\\right)_p \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">14. Eficiența motorului Carnot:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\eta = 1 - \\frac{T_C}{T_H} \\)"}
                      <MathJaxRender />
                    </div>
                    
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

                    <h4 className="text-lg font-semibold mb-2">1. Randamentul unui motor termic:</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\eta = \\frac{L_{util}}{Q_H} = 1 - \\frac{Q_C}{Q_H} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">2. Randamentul ideal (Carnot):</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">3. Lucrul mecanic într-un ciclu:</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( L = \\oint p \\, dV \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">4. Căldura schimbată într-un proces izobar:</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( Q_{p} = n C_P \\Delta T \\)"}
                      <MathJaxRender />
                    </div>

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
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default TermodinamicaPage;
