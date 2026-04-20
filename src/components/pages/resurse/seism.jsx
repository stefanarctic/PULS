import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "../../Button";
import { useEffect, useState } from "react";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";

import seismicWaveAnimation from "/res/screenshots/Seism_Screenshot.png";
import Layout from "../../Layout";
import SEO from "../../SEO";

const SeismePage = () => {
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const mathRootRef = useMathJaxTypesetRoot(JSON.stringify(visibleFormulasCount));

  // Definim formulele pentru secțiunea seism
  const seismFormulas = [
    { formula: "\\( v_P = \\frac{d}{t_P}\\)", title: "Formula pentru viteza undelor P" },
    { formula: "\\( v_S = \\frac{d}{t_S}\\)", title: "Formula pentru viteza undelor S" },
    { formula: "\\( v_P = \\sqrt{\\frac{K + \\frac{4}{3}G}{\\rho}} \\)", title: "Viteza undelor P în mediu elastic" },
    { formula: "\\( v_S = \\sqrt{\\frac{G}{\\rho}} \\)", title: "Viteza undelor S în mediu elastic" },
    { formula: "\\( M_L = \\log_{10} A - \\log_{10} A_0 \\)", title: "Magnitudinea Richter" },
  ];

  // Algoritm de încărcare progresivă - versiune optimizată
  useEffect(() => {
    const totalFormulas = seismFormulas.length;
    if (totalFormulas === 0) return;

    // Inițializăm cu batch-ul inițial
    setVisibleFormulasCount(prev => {
      if (!prev.seism && totalFormulas > 0) {
        return {
          ...prev,
          seism: Math.min(5, totalFormulas)
        };
      }
      return prev;
    });

    // Folosim un interval simplu
    let intervalId = null;

    intervalId = setInterval(() => {
      setVisibleFormulasCount(prev => {
        const currentVisible = prev.seism || 0;
        if (currentVisible < totalFormulas) {
          const batchSize = 5;
          const newCount = Math.min(currentVisible + batchSize, totalFormulas);
          if (newCount >= totalFormulas && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return {
            ...prev,
            seism: newCount
          };
        }
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return prev;
      });
    }, 100); // Delay de 100ms între batch-uri

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const seismImages = [
    { src: seismicWaveAnimation, alt: "Simulare Seisme" },
  ];

  return (
    <Layout>
      <SEO
        title="Resurse Seisme | Unde seismice - PULS"
        description="Învață despre cutremure, unde seismice P și S, magnitudinea Richter și propagarea undelor. Teorie, formule și simulări."
        keywords="seisme, cutremure, unde seismice, magnitudine Richter, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Seisme</h1>
            <div className="max-w-3xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                Un cutremur este un eveniment brusc și violent care are loc în interiorul Pământului, rezultând unde seismice.
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                Cutremurele sunt cauzate de eliberarea bruscă de energie în scoarța terestră, generând unde seismice care se propagă prin Pământ.
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                Aceste unde pot fi detectate de seismografe și pot fi folosite pentru a studia structura internă a Pământului.
              </p>
              <p className="text-lg text-muted-foreground mt-4">
                Simulările noastre oferă o reprezentare vizuală a modului în care undele seismice se propagă și interacționează cu diferite medii.
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Simulare de seisme</h2>
                <p className="text-muted-foreground mb-6">
                  Animație a undelor seismice generate în timpul unui cutremur.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={seismImages[0].src}
                    alt={seismImages[0].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Caracteristici:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Undele seismice se propagă prin interiorul Pământului</li>
                      <li>Există diferite tipuri de unde seismice (P, S, L, R)</li>
                      <li>Seismografele înregistrează aceste unde</li>
                      <li>Undele secundare S(latitudinale) si undele primare P(longitudinale)</li>
                      <li>Undele de suprafață (L și R) provoacă cele mai mari distrugeri la suprafața solului</li>
                      <li>Viteza de propagare a undelor P este mai mare decât a undelor S</li>
                      <li>Undele S nu se propagă prin lichide, spre deosebire de undele P</li>
                    </ul>
                    <div className="mt-6">
                      {seismFormulas
                        .slice(0, visibleFormulasCount.seism || seismFormulas.length)
                        .map((item, index) => (
                          <div key={index}>
                            {index === 0 && (
                              <>
                                <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                                <div className="formula-resurse text-lg font-mono">
                                  {item.formula}
                                </div>
                              </>
                            )}
                            {index === 1 && (
                              <>
                                <h3 className="text-xl font-semibold mb-2">{item.title}:</h3>
                                <div className="formula-resurse text-lg font-mono">
                                  {item.formula}
                                </div>
                                <p className="text-muted-foreground mt-2">
                                  unde d este distanța de la epicentru la punctul de referință, iar t timpul în care se propagă fiecare dintre cele două unde.
                                </p>
                                <h3 className="text-xl font-semibold mt-4 mb-2">Viteze în mediu elastic:</h3>
                              </>
                            )}
                            {index === 2 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">
                                  {item.formula}
                                </div>
                              </>
                            )}
                            {index === 3 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">
                                  {item.formula}
                                </div>
                                <p className="text-muted-foreground mb-2">unde K este modulul de compresie, G modulul de forfecare, ρ densitatea.</p>
                                <h3 className="text-xl font-semibold mt-4 mb-2">{seismFormulas[4].title}:</h3>
                              </>
                            )}
                            {index === 4 && (
                              <>
                                <div className="formula-resurse text-lg font-mono mb-2">
                                  {item.formula}
                                </div>
                                <p className="text-muted-foreground">A este amplitudinea maximă înregistrată, A₀ o amplitudine de referință.</p>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <a
                    href="/simulare/seism"
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
            <h2 className="top-1 p3">Seism prezentat printr-un joc</h2>
            <p className="row"><span>&#9734;<b>Apasa sageata dreapta, sageata stanga pentru a te misca in jurul obiectului 3d.</b></span></p>
            <p className="row"><span>&#9734;<b>Apasa Enter pentru a te duce la urmatorul eveniment.</b></span></p>
            <div className="model-container resurse-model-stack">
              <div className="resurse-embed-frame resurse-embed-frame--seism">
                <iframe
                  id="modelFrame"
                  src="https://stefanarctic.github.io/Cutremure-Unity/"
                  className="resurse-embed-frame__iframe resurse-seism-iframe"
                  allowFullScreen={true}
                  title="Joc interactiv seism — Cutremure Unity"
                />
              </div>
              <div id="modelDescription" className="sketchfab-info1">
                🌀🌏〰Reprezentare Seism<br />🔁 Poți apasa stanga drepta pentru a te misca<br />🔁Poti apasa Enter pentru a vedea urmatoarea figura
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default SeismePage;