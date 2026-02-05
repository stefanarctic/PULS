import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import { useEffect, useState } from "react";

import simulatorOscilatieOYImg from "/res/screenshots/Oscilatieoy_Screenshot.png";
import simulatorOscilatieOXImg from "/res/screenshots/Oscilatieox_Screenshot.png";
import simulatorCiocnireImg from "/res/screenshots/Ciocnire_Screenshot.png";
import simulatorPlanInclinatImg from "/res/screenshots/Plan_Inclinat_Screenshot.png";
import proiectileImg from "/res/screenshots/Proiectile_Screenshot.png";
import lanturiElasticeImg from "/res/screenshots/Lanturi_Elastice_Screenshot.png";

import Layout from "../../Layout";

const MecanicaPage = () => {
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});

  // Definim formulele pentru fiecare secțiune
  const oscilatieOXFormulas = [
    { formula: "\\( x(t) = A \\sin(\\omega t + \\phi) \\)", title: "Legea mișcării" },
    { formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)", title: "Legea vitezei" },
    { formula: "\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)", title: "Legea accelerației" },
    { formula: "\\( \\omega = \\sqrt{\\frac{k}{m}} \\)", title: "Viteza unghiulară" },
    { formula: "\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)", title: "Perioada oscilației" },
  ];

  const oscilatieOYFormulas = [
    { formula: "\\( y_0 = \\frac{mg}{k} \\)", title: "Poziția de echilibru" },
    { formula: "\\( y(t) = y_0 + A \\sin(\\omega t + \\phi) \\)", title: "Legea mișcării" },
    { formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)", title: "Legea vitezei" },
    { formula: "\\( E = \\frac{1}{2}mv^2 + \\frac{1}{2}ky^2 + mgy \\)", title: "Energia totală" },
    { formula: "\\( f = \\frac{1}{2\\pi} \\sqrt{\\frac{k}{m}} \\)", title: "Frecvența naturală" },
  ];

  const ciocnireFormulas = [
    { formula: "\\( m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\)", title: "Conservarea impulsului" },
    { formula: "\\( e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}} \\)", title: "Coeficientul de restituire" },
    { formula: "\\( v_{1f} = \\frac{(m_1 - m_2)v_{1i} + 2m_2v_{2i}}{m_1 + m_2} \\)", title: "Viteza finală 1 (ciocnire elastică)" },
    { formula: "\\( v_{2f} = \\frac{(m_2 - m_1)v_{2i} + 2m_1v_{1i}}{m_1 + m_2} \\)", title: "Viteza finală 2 (ciocnire elastică)" },
    { formula: "\\( \\frac{1}{2}m_1v_{1i}^2 + \\frac{1}{2}m_2v_{2i}^2 = \\frac{1}{2}m_1v_{1f}^2 + \\frac{1}{2}m_2v_{2f}^2 \\)", title: "Energia cinetică în ciocniri elastice" },
    { formula: "\\( \\vec{p} = m\\vec{v} \\)", title: "Impulsul total" },
  ];

  const planInclinatFormulas = [
    { formula: "\\( F_{||} = mg \\sin(\\alpha) \\)", title: "Componenta paralelă a forței gravitaționale" },
    { formula: "\\( F_{\\perp} = mg \\cos(\\alpha) \\)", title: "Componenta perpendiculară a forței gravitaționale" },
    { formula: "\\( F_f = \\mu N = \\mu mg \\cos(\\alpha) \\)", title: "Forța de frecare" },
    { formula: "\\( a = g(\\sin(\\alpha) - \\mu \\cos(\\alpha)) \\)", title: "Accelerația pe plan înclinat" },
    { formula: "\\( v = \\sqrt{2gh(1 - \\mu \\cot(\\alpha))} \\)", title: "Viteza la baza planului" },
    { formula: "\\( t = \\sqrt{\\frac{2h}{g(\\sin(\\alpha) - \\mu \\cos(\\alpha))}} \\)", title: "Timpul de coborâre" },
  ];

  const proiectilFormulas = [
    { formula: "\\( v_{0x} = v_0 \\cos\\alpha, \\quad v_{0y} = v_0 \\sin\\alpha \\)", title: "Descompunerea vitezei inițiale" },
    { formula: "\\( x(t) = v_{0x} t \\)", title: "Ecuația de mișcare pe OX" },
    { formula: "\\( y(t) = y_0 + v_{0y} t - \\frac{1}{2} g t^2 \\)", title: "Ecuația de mișcare pe OY" },
    { formula: "\\( T = \\frac{2 v_0 \\sin\\alpha}{g} \\)", title: "Timpul de zbor" },
    { formula: "\\( R = \\frac{v_0^2 \\sin(2\\alpha)}{g} \\)", title: "Bătaia maximă" },
  ];

  const lanturiElasticeFormulas = [
    { formula: "\\( F = -k \\Delta x \\)", title: "Forța în resort (legea lui Hooke)" },
    { formula: "\\( m \\frac{d^2 x_i}{dt^2} = k(x_{i+1} - x_i) - k(x_i - x_{i-1}) \\)", title: "Ecuația de mișcare pentru o masă din lanț" },
  ];

  // Algoritm de încărcare progresivă - versiune simplificată
  useEffect(() => {
    const sections = [
      { key: 'oscilatieOX', formulas: oscilatieOXFormulas },
      { key: 'oscilatieOY', formulas: oscilatieOYFormulas },
      { key: 'ciocnire', formulas: ciocnireFormulas },
      { key: 'planInclinat', formulas: planInclinatFormulas },
      { key: 'proiectil', formulas: proiectilFormulas },
      { key: 'lanturiElastice', formulas: lanturiElasticeFormulas },
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
                    
                    {oscilatieOXFormulas
                      .slice(0, visibleFormulasCount.oscilatieOX || oscilatieOXFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.oscilatieOX > 0 && (
                      <MathJaxRender key={`oscilatieOX-${visibleFormulasCount.oscilatieOX || 0}`} />
                    )}
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: A este amplitudinea, {"\\(\\omega\\)"} <MathJaxRender /> viteza unghiulară, {"\\(\\phi\\)"} <MathJaxRender /> faza inițială, 
                      k este constanta elastică, m este masa corpului, iar t este timpul.
                    </p>
                  </div>
                  <a
                    href="/simulare/oscillatii-ox"
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
                    
                    {oscilatieOYFormulas
                      .slice(0, visibleFormulasCount.oscilatieOY || oscilatieOYFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.oscilatieOY > 0 && (
                      <MathJaxRender key={`oscilatieOY-${visibleFormulasCount.oscilatieOY || 0}`} />
                    )}
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: y₀ este poziția de echilibru, A este amplitudinea, {"\\(\\omega\\)"} <MathJaxRender /> viteza unghiulară, 
                      {"\\(\\phi\\)"} <MathJaxRender /> faza inițială, k este constanta elastică, m este masa, g este accelerația gravitațională.
                    </p>
                  </div>
                  <a
                    href="/simulare/oscillatii-oy"
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
                    
                    {ciocnireFormulas
                      .slice(0, visibleFormulasCount.ciocnire || ciocnireFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 2 && <h4 className="text-lg font-semibold mb-2">{index + 1}. Vitezele finale (ciocnire elastică):</h4>}
                          {index !== 2 && <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>}
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.ciocnire > 0 && (
                      <MathJaxRender key={`ciocnire-${visibleFormulasCount.ciocnire || 0}`} />
                    )}
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: m₁, m₂ sunt masele corpurilor, v₁ᵢ, v₂ᵢ sunt vitezele inițiale, v₁f, v₂f sunt vitezele finale, 
                      e este coeficientul de restituire (e = 1 pentru ciocniri perfect elastice, e = 0 pentru ciocniri perfect inelastice).
                    </p>
                  </div>
                  <a
                    href="/simulare/coliziuni-inelastice"
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
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorPlanInclinatImg}
                    alt="Plan înclinat"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru planul înclinat:</h3>
                    
                    {planInclinatFormulas
                      .slice(0, visibleFormulasCount.planInclinat || planInclinatFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-4">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.planInclinat > 0 && (
                      <MathJaxRender key={`planInclinat-${visibleFormulasCount.planInclinat || 0}`} />
                    )}
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: m este masa corpului, g este accelerația gravitațională, {"\\(\\alpha\\)"} <MathJaxRender /> unghiul de înclinare, 
                      {"\\(\\mu\\)"} <MathJaxRender /> coeficientul de frecare, h este înălțimea planului, N este forța normală.
                    </p>
                  </div>
                  <a
                    href="/simulare/plan-inclinat"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Mișcarea proiectilului */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Mișcarea proiectilului</h2>
                <p className="text-muted-foreground mb-6">
                  Mișcarea proiectilului descrie traiectoria unui corp aruncat cu o viteză inițială într-un câmp gravitațional
                  uniform (de obicei neglijând rezistența aerului). Este un exemplu clasic de mișcare compusă: mișcare rectilinie
                  uniformă pe orizontală și mișcare rectilinie uniform variată pe verticală.
                </p>
                <p className="text-muted-foreground mb-6">
                  În funcție de viteza inițială și unghiul de lansare, proiectilul urmează o traiectorie parabolică. Simulatorul
                  îți permite să modifici unghiul, viteza inițială și înălțimea de lansare pentru a observa cum se schimbă
                  bătaia, înălțimea maximă și timpul de zbor.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={proiectileImg}
                    alt="Mișcarea proiectilului"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru mișcarea proiectilului (fără rezistența aerului):</h3>
                    {proiectilFormulas
                      .slice(0, visibleFormulasCount.proiectil || proiectilFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          {index === 1 && <h4 className="text-lg font-semibold mb-2">{index + 1}. Ecuațiile de mișcare:</h4>}
                          {index !== 1 && <h4 className="text-lg font-semibold mb-2">{index === 0 ? index + 1 : index === 2 ? index + 1 : index + 1}. {item.title}:</h4>}
                          <div className="formula-resurse text-lg font-mono mb-3">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.proiectil > 0 && (
                      <MathJaxRender key={`proiectil-${visibleFormulasCount.proiectil || 0}`} />
                    )}
                    <p className="text-muted-foreground mt-4">
                      Unde: {"\\(v_0\\)"} <MathJaxRender /> este viteza inițială, {"\\(\\alpha\\)"} <MathJaxRender /> unghiul de
                      lansare față de orizontală, {"\\(g\\)"} <MathJaxRender /> accelerația gravitațională, {"\\(y_0\\)"}{" "}
                      <MathJaxRender /> înălțimea inițială, {"\\(T\\)"} <MathJaxRender /> timpul de zbor, iar{" "}
                      {"\\(R\\)"} <MathJaxRender /> bătaia (distanța orizontală parcursă).
                    </p>
                  </div>
                  <a
                    href="/simulare/proiectile"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Lanțuri elastice */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Lanțuri elastice</h2>
                <p className="text-muted-foreground mb-6">
                  Un lanț elastic este format dintr-o serie de mase legate între ele prin resorturi (arcuri) care respectă
                  legea lui Hooke. Acest tip de sistem modelează propagarea undelor mecanice într-un mediu discret și
                  comportamentul colectiv al multor oscilatori cuplați.
                </p>
                <p className="text-muted-foreground mb-6">
                  În simulare poți observa cum o perturbație inițială se propagă de-a lungul lanțului, cum apar reflexii la
                  capete și cum energia se distribuie între oscilațiile diferitelor mase. Este un exemplu excelent pentru a
                  înțelege legătura dintre modele discrete și undele din medii continue.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={lanturiElasticeImg}
                    alt="Lanțuri elastice"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule de bază pentru un lanț elastic:</h3>
                    {lanturiElasticeFormulas
                      .slice(0, visibleFormulasCount.lanturiElastice || lanturiElasticeFormulas.length)
                      .map((item, index) => (
                        <div key={index}>
                          <h4 className="text-lg font-semibold mb-2">{index + 1}. {item.title}:</h4>
                          <div className="formula-resurse text-lg font-mono mb-3">
                            {item.formula}
                          </div>
                        </div>
                      ))}
                    {visibleFormulasCount.lanturiElastice > 0 && (
                      <MathJaxRender key={`lanturiElastice-${visibleFormulasCount.lanturiElastice || 0}`} />
                    )}
                    <p className="text-muted-foreground">
                      Unde: {"\\(m\\)"} <MathJaxRender /> este masa fiecărui element, {"\\(k\\)"} <MathJaxRender /> constanta
                      elastică a resorturilor, iar {"\\(x_i\\)"} <MathJaxRender /> este deplasarea masei a-i-a față de
                      poziția de echilibru. Diferențele dintre pozițiile vecinilor generează forțele care duc la propagarea
                      perturbațiilor de-a lungul lanțului.
                    </p>
                  </div>
                  <a
                    href="/simulare/lanturi-elastice"
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
