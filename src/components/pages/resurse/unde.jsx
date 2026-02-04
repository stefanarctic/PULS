import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import React, { useRef } from "react";


import UndeImage from "/res/screenshots/Unde_Screenshot.png"
import UndeImage1 from "/res/screenshots/Unde_Screenshot2.png"

import PrismaImage from "/res/screenshots/Prisma_Screenshot.png";
import PrismaImage1 from "/res/screenshots/Prisma_Screenshot1.png";
import PolarizareCircularaImg from "/res/screenshots/Polarizare_Circulara_Screenshot.png";

import UndeVideo from "/res/Videos/Unde Videoclip.mp4";
import UndeVideo1 from "/res/Videos/Frecventa Undelor Video.mp4";
import UndeThumbnail1 from "/res/Thumbnails/Unde Videoclip.png";
import UndeThumbnail2 from "/res/Thumbnails/Frecventa Undelor Video.png";
import Layout from "../../Layout";
import SEO from "../../SEO";
import VideoPopup from "../../VideoPopup";

// import PrismaSImulation from "/Simulations/prisma/prisma-simulator.html";

const UndePage = () => {
  const undeImages = [
    { src: UndeImage, alt: "Simulare Unde" },
    { src: UndeImage1, alt: "Simulare Unde" }
  ];

  const prismaImages = [
    { src: PrismaImage, alt: "Simulare Prisma" },
    { src: PrismaImage1, alt: "Simulare Prisma" }
  ];

  const undeVideos = [
    { src: UndeVideo, alt: "Unde", thumbnail: UndeThumbnail1 },
    { src: UndeVideo1, alt: "Unde", thumbnail: UndeThumbnail2 }
  ];
  // const HtmlPages = [
  //   { src: PrismaSImulation, alt: "Prisma Simulation" }
  // ]

  // Refs for iframe and description
  const modelFrameRef = useRef(null);
  const modelDescRef = useRef(null);

  // Function to change model and description
  const changeModel = (modelId, description) => {
    if (modelFrameRef.current && modelDescRef.current) {
      modelFrameRef.current.src = `https://sketchfab.com/models/${modelId}/embed`;
      modelDescRef.current.innerHTML = `${description}<br>🔁 Poți roti și mări cu mouse-ul<br>🗨 Textul din model este în engleză`;
    }
  };

  return (
    <Layout>
      <SEO
        title="Resurse Unde | Propagarea undelor - PULS"
        description="Învață despre propagarea undelor mecanice și electromagnetice, tipuri de unde, formule și simulări interactive."
        keywords="unde, unde mecanice, unde electromagnetice, propagare unde, fizică unde"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Unde</h1>
            <div className="max-w-3xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                Undele reprezintă fenomenul de propagare a oscilaţiilor mecanice, electromagnetice sau de altă natură în diferite medii.
              </p>
              <h3 className="text-xl font-semibold mb-2">Caracteristici:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Undele pot fi:</li>
                <li>A. Unde mecanice</li>
                Unda mecanică reprezintă o perturbaţie locală produsă într-un mediu elastic care se transmite în toate direcţiile, din aproape în aproape, din cauza forţelor elastice ce se exercită între particulele constitutive ale acelui mediu. Din acest motiv undele mecanice se mai numesc şi elastice.
                <li>B. Unde electromagnetice</li>
                Undele electromagnetice reprezintă o suprapunere dintre un câmp electric şi unul magnetic care se generează reciproc şi se propagă împreună. Undele electromagnetice nu au nevoie de un mediu suport de propagare, prin urmare undele electromagnetice se propagă şi în vid.
              </ul>
              <h3 className="text-xl font-semibold mt-4 mb-2">Tipuri de unde:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>A. Unde longitudinale</li>
                Undele longitudinale sunt acele unde în care oscilaţiile particulelor se produc în aceeaşi direcţie cu direcţia de propagare a undei. Aceste unde se propagă prin comprimarea şi rarefierea mediului elastic.
                <li>B. Unde transversale</li>
                Undele transversale sunt acele unde în care oscilaţiile particulelor se produc perpendicular pe direcţia de propagare a undei. Aceste unde se propagă prin vibrarea particulelor mediului elastic în plan perpendicular pe direcţia de propagare a undei.
              </ul>

              {/* Videos about waves */}
              <div className="experimente-video-grid">
                {/* <div className="experiment-card">
                  <VideoPopup
                    src={undeVideos[0].src}
                    alt={undeVideos[0].alt}
                    thumbnail={undeVideos[0].thumbnail}
                    title="Cum se formeaza undele stationare într-o coardă vibrată? (exemplu video)"
                  />
                </div>
                <div className="experiment-card">
                  <VideoPopup
                    src={undeVideos[1].src}
                    alt={undeVideos[1].alt}
                    thumbnail={undeVideos[1].thumbnail}
                    title="Cum se cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală? (exemplu video)"
                  />
                </div> */}
                <div className="experiment-card">
                  <h3 className="experiment-title">Tub sonor - frecvenţa fundamentală</h3>
                  <p className="experiment-desc">
                    Demonstrează cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală.
                  </p>
                  <VideoPopup
                    src={undeVideos[0].src}
                    alt={undeVideos[0].alt}
                    thumbnail={undeVideos[0].thumbnail}
                    title="Tub sonor - frecvenţa fundamentală (experiment video)"
                  />
                </div>
                <div className="experiment-card">
                <h3 className="experiment-title">Unde Stationare in coarda vibranta</h3>
                    <p className="experiment-desc">
                      Explorează formarea undelor stationare într-o coardă vibrată, fenomenul de interferență constructivă și distructivă.
                    </p>
                  <VideoPopup
                    src={undeVideos[1].src}
                    alt={undeVideos[1].alt}
                    thumbnail={undeVideos[1].thumbnail}
                    title="Unde Stationare in coarda vibranta (experiment video)"
                  />
                </div>
              </div>
              {/* <div className="flex flex-row gap-4 my-8 justify-center items-center">
                <VideoPopup
                  src={undeVideos[0].src}
                  alt={undeVideos[0].alt}
                  thumbnail={undeVideos[0].thumbnail}
                  title="Cum se formeaza undele stationare într-o coardă vibrată? (exemplu video)"
                />
                <VideoPopup
                  src={undeVideos[1].src}
                  alt={undeVideos[1].alt}
                  thumbnail={undeVideos[1].thumbnail}
                  title="Cum se cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală? (exemplu video)"
                />
              </div> */}
            </div>
            {/* Image slider for wave simulation */}
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Simulare de unde in apa</h2>
                <p className="text-muted-foreground mb-6">
                  Această simulare permite observarea propagării undelor în apă, demonstrând cum se formează și se transmit undele printr-un mediu lichid. Poți interacționa cu simularea pentru a vedea cum diferite tipuri de unde se comportă în apă.
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={undeImages[0].src}
                    alt={undeImages[0].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>

                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-2">Formula generala a undelor:</h3>
                      <div className="formula-resurse text-lg font-mono">
                        {"\\( v = \\lambda \\cdot f\\)"}
                        <MathJaxRender />
                      </div>
                      <p className="text-muted-foreground mt-2">
                        undele se caracterizează prin lungimea de undă {"\\(\\lambda\\)"}<MathJaxRender />, frecvența  {"\\(f\\)"}<MathJaxRender /> și viteza de propagare  {"\\(v\\)"}<MathJaxRender />.
                      </p>
                      <h3 className="text-xl font-semibold mt-4 mb-2">Formule utile:</h3>
                      <p className="text-muted-foreground mb-2">
                        Lungimea de undă: {"\\(\\lambda = v \\cdot T\\)"}<MathJaxRender />, unde T este perioada undelor.
                      </p>
                      <p className="text-muted-foreground mb-2">
                        Frecvența: {"\\(f = \\frac{1}{T}\\)"}<MathJaxRender />, unde T este perioada undelor.
                      </p> 
                    </div>
                  </div>
                  <a
                    href="/simulare/unde-apa"
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
              <h3 className="text-xl font-semibold mb-2">Prisma</h3>
              <p className="text-lg text-muted-foreground mb-4">
                O prismă este un obiect transparent cu două fețe paralele și cel puțin trei fețe laterale, care refractă lumina. Prisma este utilizată pentru a descompune lumina albă în spectrul său de culori prin difracție.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Difracția luminii albe prin prisma este un fenomen optic care apare atunci când lumina albă trece printr-o prismă, rezultând în separarea acesteia în culorile spectrului vizibil. Acest proces se datorează diferențelor de indice de refracție pentru diferitele lungimi de undă ale luminii.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Prisma este adesea folosită în experimentele de optică pentru a demonstra cum lumina albă poate fi descompusă în culorile sale componente, cum ar fi roșu, portocaliu, galben, verde, albastru, indigo și violet.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Lumina albă este o suprapunere formată din toate lungimile de undă aşa cum a observat prima dată acum mai bine de 300 de ani Isaac Newton descoperind fenomenul de dispersie a luminii.
              </p>
            </div>
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Difractia luminii albe prin prisma</h2>
                <p className="text-muted-foreground mb-6">
                  Această simulare permite observarea difracției luminii albe printr-o prismă, demonstrând cum lumina albă se descompune în spectrul său de culori atunci când trece printr-un mediu transparent cu un indice de refracție diferit.
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={prismaImages[1].src}
                    alt={prismaImages[1].alt}
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>

                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-2">Formule pentru refracția luminii albe în prismă:</h3>
                      <div className="flex flex-col gap-2">
                        <div className="formula-resurse text-lg font-mono">
                          {"\\( n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2 \\)"}
                          <MathJaxRender />
                        </div>
                        <div className="formula-resurse text-lg font-mono">
                          {"\\( \\delta = (\\theta_1 + \\theta_2') - A \\)"}
                          <MathJaxRender />
                        </div>
                        <div className="formula-resurse text-lg font-mono">
                          {"\\( n = n(\\lambda) \\)"}
                          <MathJaxRender />
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2">
                        <span>
                          Legea refracției (Snell): {"\\( n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2 \\)"}<MathJaxRender />.<br />
                          Unghiul de deviație în prismă: {"\\( \\delta = (\\theta_1 + \\theta_2') - A \\)"}<MathJaxRender />, unde <b>A</b> este unghiul prismului.<br />
                          Indicele de refracție depinde de lungimea de undă: {"\\( n = n(\\lambda) \\)"}<MathJaxRender />, ceea ce duce la dispersia luminii albe.
                        </span>
                      </p>
                    </div>
                  </div>
                  <a
                    href="/simulare/prisma"
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

            {/* Polarizare circulară */}
            <div className="space-y-12 mt-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Polarizarea circulară a undelor electromagnetice</h2>
                <p className="text-muted-foreground mb-6">
                  Lumina polarizată circular poate fi privită ca superpoziția a două unde plane polarizate liniar,
                  perpendiculare între ele, cu aceeași amplitudine, dar defazate cu un sfert de perioadă
                  (diferență de fază de {"\\(\\frac{\\pi}{2}\\)"} <MathJaxRender />). Vârful vectorului câmpului electric descrie
                  astfel un cerc în planul perpendicular pe direcția de propagare.
                </p>

                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={PolarizareCircularaImg}
                    alt="Simulator Polarizare Circulară"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Descriere matematică (polarizare circulară dreaptă):</h3>
                    <p className="text-muted-foreground mb-2">
                      Considerăm două componente ale câmpului electric, de-a lungul axelor {"\\(x\\)"} și {"\\(y\\)"}
                      <MathJaxRender />, cu aceeași amplitudine {"\\(E_0\\)"} <MathJaxRender /> și o diferență de fază de
                      {"\\(\\frac{\\pi}{2}\\)"} <MathJaxRender />:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-2">
                      {"\\( E_x(t) = E_0 \\cos(\\omega t) \\)"}
                      <MathJaxRender />
                    </div>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( E_y(t) = E_0 \\sin(\\omega t) \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-3">
                      La orice moment, vectorul câmpului electric {"\\(\\vec{E}(t) = (E_x(t), E_y(t))\\)"} <MathJaxRender /> are
                      modulul constant:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( E_x^2 + E_y^2 = E_0^2 \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground">
                      Aceasta înseamnă că vârful vectorului se deplasează pe un cerc de rază {"\\(E_0\\)"} <MathJaxRender />,
                      ceea ce explică denumirea de polarizare circulară. Sensul de rotație (dreapta/stânga) depinde de
                      semnul fazei relative dintre cele două componente.
                    </p>
                  </div>
                  <a
                    href="/simulare/polarizare-circulara"
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

export default UndePage;
