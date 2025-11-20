import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import MathJaxRender from "@/components/MathJaxRender";
import Video1 from "/res/Videos/Pendul Video.mp4";
import Video2 from "/res/Videos/Frecventa Undelor Video.mp4";
import Video3 from "/res/Videos/Unde Videoclip.mp4";
import Video4 from "/res/Videos/Front Unda 1.mp4";
import Video5 from "/res/Videos/Front Unda 2.mp4";
import Video6 from "/res/Videos/Lissajous-Video-1.mp4";
import Thumbnail1 from "/res/Thumbnails/Pendul Video.png";
import Thumbnail2 from "/res/Thumbnails/Frecventa Undelor Video.png";
import Thumbnail3 from "/res/Thumbnails/Unde Videoclip.png";
import Thumbnail4 from "/res/Thumbnails/Front Unda 1.png";
import Thumbnail5 from "/res/Thumbnails/Front Unda 2.png";
import Thumbnail6 from "/res/Thumbnails/Lissajous-Video-1.png";
import Layout from "../Layout";
import { useEffect } from "react";
import VideoPopup from "../VideoPopup";
import { useNavigate } from "react-router-dom";


const lessonCards = [
  {
    title: "Pendule",
    description:
      "Descoperă mișcarea oscilatorie, formulele și simulări pentru pendulul simplu, amortizat și neliniar.",
    path: "/resurse/pendule",
  },
  {
    title: "Unde",
    description:
      "Află despre propagarea undelor mecanice și electromagnetice, tipuri de unde și simulări interactive.",
    path: "/resurse/unde",
  },
  {
    title: "Figuri Lissajous",
    description:
      "Explorează curbele Lissajous, ecuațiile parametrice și aplicațiile lor în fizică.",
    path: "/resurse/lissajous",
  },
  {
    title: "Seisme",
    description:
      "Învață despre cutremure, unde seismice, propagare și vizualizări interactive.",
    path: "/resurse/seism",
  },
  {
    title: "Termodinamică",
    description:
      "Învață despre termodinamică, principiile și aplicațiile ei în fizică.",
    path: "/resurse/termodinamica",
  },
  {
    title: "Mecanică",
    description:
      "Învață despre mecanică, principiile și aplicațiile ei în fizică.",
    path: "/resurse/mecanica",
  },
];

const ResursePage = () => {
  const navigate = useNavigate();

  const ResurseVideos = [
    { src: Video1, alt: "Video Pendul", thumbnail: Thumbnail1 },
    { src: Video2, alt: "Video Frecvența Undelor", thumbnail: Thumbnail2 },
    { src: Video3, alt: "Video Unde", thumbnail: Thumbnail3 },
    { src: Video4, alt: "Video Front Undă 1", thumbnail: Thumbnail4 },
    { src: Video5, alt: "Video Front Undă 2", thumbnail: Thumbnail5 },
    { src: Video6, alt: "Video Lissajous", thumbnail: Thumbnail6 },
  ];

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typeset()
    }
  }, []);

  return (
    <Layout>
      <div className="resurse-page page-section">
        <main>
          <h1 className="resurse-title">Resurse</h1>

          <div className="resurse-description">
            <p>
              Accesează materiale educaționale pentru studiul fizicii, categorizate după nivelul de dificultate și tipul de conținut.
            </p>
          </div>

          <Tabs defaultValue="lectii">
            <TabsList>
              <TabsTrigger key="lectii" value="lectii">Lecții</TabsTrigger>
              <TabsTrigger key="formule" value="formule">Formule</TabsTrigger>
              <TabsTrigger key="experimente" value="experimente">Experimente</TabsTrigger>
              <TabsTrigger key="bibliografie" value="bibliografie">Bibliografie</TabsTrigger>
            </TabsList>

            <TabsContent key="formule" value="formule">
              <div className="rounded-container">
                <h2 className="resurse-section-title">Formule esențiale în fizică</h2>

                {/* Seism */}
                <h3 className="resurse-section-subtitle mt-6 mb-3">Seism</h3>
                <div className="formula-grid mb-4">
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Viteza undei P (Seism)</div>
                    <div className="text-lg font-mono">
                      {"\\( v_P = \\frac{d}{t_P} \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Viteza undei S (Seism)</div>
                    <div className="text-lg font-mono">
                      {"\\( v_S = \\frac{d}{t_S} \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                </div>

                {/* Unde */}
                <h3 className="resurse-section-subtitle mt-6 mb-3">Unde</h3>
                <div className="formula-grid mb-4">
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Formula generală a undelor</div>
                    <div className="text-lg font-mono">
                      {"\\( v = \\lambda \\cdot f \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                </div>

                {/* Prisma */}
                <h3 className="resurse-section-subtitle mt-6 mb-3">Prisma</h3>
                <div className="formula-grid mb-4">
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Legea refracției (Snell)</div>
                    <div className="text-lg font-mono">
                      {"\\( n_1 \\cdot \\sin(\\theta_1) = n_2 \\cdot \\sin(\\theta_2) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Unghiul de deviație în prismă</div>
                    <div className="text-lg font-mono">
                      {"\\( \\delta = (\\theta_1 + \\theta_2') - A \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Indicele de refracție</div>
                    <div className="text-lg font-mono">
                      {"\\( n = n(\\lambda) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                </div>

                {/* Pendule */}
                <h3 className="resurse-section-subtitle mt-6 mb-3">Pendule</h3>
                <div className="formula-grid mb-4">
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Legea mișcării oscilatorii</div>
                    <div className="text-lg font-mono">
                      {"\\( y(t) = A \\cdot \\sin(\\omega t + \\varphi) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Legea vitezei</div>
                    <div className="text-lg font-mono">
                      {"\\( v(t) = \\omega A \\cdot \\cos(\\omega t + \\varphi) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Legea accelerației</div>
                    <div className="text-lg font-mono">
                      {"\\( a(t) = -\\omega^2 A \\cdot \\sin(\\omega t + \\varphi) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Perioada pendulului gravitațional</div>
                    <div className="text-lg font-mono">
                      {"\\( T = 2\\pi \\cdot \\sqrt{\\frac{l}{g}} \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Ecuația pendulului amortizat</div>
                    <div className="text-lg font-mono">
                      {"\\( m\\frac{d^2x}{dt^2} + b\\frac{dx}{dt} + kx = 0 \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Ecuația pendulului simplu neliniar</div>
                    <div className="text-lg font-mono">
                      {"\\( \\frac{d^2\\theta}{dt^2} + \\frac{g}{l}\\sin\\theta = 0 \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                </div>

                {/* Lissajous */}
                <h3 className="resurse-section-subtitle mt-6 mb-3">Lissajous</h3>
                <div className="formula-grid">
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Ecuații Lissajous (x)</div>
                    <div className="text-lg font-mono">
                      {"\\( x(t) = A_1 \\cdot \\sin(\\omega_1 t) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <div className="formula-card">
                    <div className="font-semibold mb-2">Ecuații Lissajous (y)</div>
                    <div className="text-lg font-mono">
                      {"\\( y(t) = A_2 \\cdot \\sin(\\omega_2 t + \\varphi) \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Lecții de fizică */}
            <TabsContent key="lectii" value="lectii">
              <div className="rounded-container">
                <h2 className="resurse-section-title">Lecții de fizică</h2>
                <div className="formula-grid">
                  {lessonCards.map(({ title, description, path }) => (
                    <div
                      key={path}
                      className="formula-card resurse-lesson-card"
                      role="button"
                      tabIndex={0}
                      aria-label={`Deschide lecția ${title}`}
                      onClick={() => navigate(path)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(path);
                        }
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">{title}</h3>
                      <p className="text-muted-foreground mb-2">{description}</p>
                      <span className="resurse-link resurse-lesson-link">
                        Citește lecția
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Experimente practice */}
            <TabsContent key="experimente" value="experimente">
              <div className="rounded-container">
                <h2 className="resurse-section-title">Experimente practice</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Vizualizează experimente video pentru a înțelege mai bine fenomenele fizice prezentate.
                </p>
                <div className="experimente-video-grid">
                  <div className="experiment-card">
                    <h3 className="experiment-title">Oscilaţii armonice</h3>
                    <p className="experiment-desc">
                      Observă cum se comportă un pendul simplu în mișcare oscilatorie.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[0].src}
                      alt={ResurseVideos[0].alt}
                      thumbnail={ResurseVideos[0].thumbnail}
                      title="Pendulul simplu (experiment video)"
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">Unde Stationare in coarda vibranta</h3>
                    <p className="experiment-desc">
                      Explorează formarea undelor stationare într-o coardă vibrată.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[1].src}
                      alt={ResurseVideos[1].alt}
                      thumbnail={ResurseVideos[1].thumbnail}
                      title="Unde Stationare in coarda vibranta (experiment video)"
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">Tub sonor - frecvenţa fundamentală</h3>
                    <p className="experiment-desc">
                      Demonstrează cum se formează undele sonore într-un tub și cum se determină frecvența fundamentală.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[2].src}
                      alt={ResurseVideos[2].alt}
                      thumbnail={ResurseVideos[2].thumbnail}
                      title="Tub sonor - frecvenţa fundamentală (experiment video)"
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">Frontul de Unda</h3>
                    <p className="experiment-desc">
                      Observă cum se propagă frontul de undă în apa.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[3].src}
                      alt={ResurseVideos[3].alt}
                      thumbnail={ResurseVideos[3].thumbnail}
                      title="Frontul de Unda (experiment video)"
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">Frontul de Unda</h3>
                    <p className="experiment-desc">
                      Observă cum se propagă frontul de undă în apa.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[4].src}
                      alt={ResurseVideos[4].alt}
                      thumbnail={ResurseVideos[4].thumbnail}
                      title="Frontul de Unda (experiment video)"
                    />
                  </div>
                  <div className="experiment-card">
                    <h3 className="experiment-title">Figuri Lissajous</h3>
                    <p className="experiment-desc">
                      Explorează cum se formează figurile Lissajous prin oscilații perpendiculare.
                    </p>
                    <VideoPopup
                      src={ResurseVideos[5].src}
                      alt={ResurseVideos[5].alt}
                      thumbnail={ResurseVideos[5].thumbnail}
                      title="Figuri Lissajous (experiment video)"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent key="bibliografie" value="bibliografie">
              <div className="rounded-container">
                <h2 className="resurse-section-title">Bibliografie recomandată</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="resurse-section-subtitle">Manuale</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <strong>Fizică manual pentru clasa a XI-a</strong>, Autori: Cleopatra Gherbanovschi , Nicolae Gherbanovschi.
                      </li>
                      <li>
                        <strong>Fizică manual pentru clasa a XI-a (M1/M2)" </strong>, Autori: Cristian Păun, Marius Burtea.
                      </li>
                      <li>
                        <strong>Culegere de probleme de fizică. Clasa a XI-a</strong>, Autor: Florin Grigore, Editura Paralela 45
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="resurse-section-subtitle">Cărți pentru aprofundare</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <strong>Fizica povestită</strong>, Autor: Cristian Presură
                      </li>
                      <li>
                        <strong>Principia Mathematica</strong>, Autor: Isaac Newton
                      </li>
                      <li>
                        <strong>Șase lecții ușoare</strong>, Autor: Richard Feynman
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="resurse-section-subtitle">Resurse online</h3>
                    <ul className="resurse-list space-y-2">
                      <li>
                        <a href="https://www.khanacademy.org" className="resurse-link">
                          Khan Academy - Fizică
                        </a>
                      </li>
                      <li>
                        <a href="https://phet.colorado.edu" className="resurse-link">
                          PhET Interactive Simulations
                        </a>
                      </li>
                      <li>
                        <a href="https://www.physics.org" className="resurse-link">
                          Physics.org
                        </a>
                      </li>
                      <li>
                        <a href="https://manuale.edu.ro/" className="resurse-link">
                          Manuale.edu.ro - Resurse educaționale
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default ResursePage;
