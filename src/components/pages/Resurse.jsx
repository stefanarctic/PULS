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
import { useEffect, useState } from "react";
import VideoPopup from "../VideoPopup";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../SEO";


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
  {
    title: "Electricitate",
    description:
      "Explorează circuitele electrice, legile lui Ohm și Kirchhoff, energia electrică și câmpurile electrice.",
    path: "/resurse/electricitate",
  },
  {
    title: "Optică",
    description:
      "Descoperă comportamentul luminii, refracția, reflexia, lentilele și fenomenele de interferență și difracție.",
    path: "/resurse/optica",
  },
  {
    title: "Matematică",
    description:
      "Funcții, grafice și vizualizator 4D. Explorează reprezentarea grafică a funcțiilor și geometria în spațiul cu patru dimensiuni.",
    path: "/resurse/matematica",
  },
  {
    title: "Astronomie",
    description:
      "Legile lui Kepler: orbite eliptice, legea ariilor și relația perioadă–rază. Mișcarea planetelor și sateliților.",
    path: "/resurse/astronomie",
  },
  {
    title: "Michelson-Morley",
    description:
      "Experimentul Michelson-Morley, căutarea eterului și implicațiile pentru relativitatea restrânsă.",
    path: "/resurse/michaelson-morley",
  },
];

const ResursePage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("lectii");
  const [activeFormulaTab, setActiveFormulaTab] = useState("mecanica");
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});

  const [searchParams] = useSearchParams();

  const ResurseVideos = [
    { src: Video1, alt: "Video Pendul", thumbnail: Thumbnail1 },
    { src: Video2, alt: "Video Frecvența Undelor", thumbnail: Thumbnail2 },
    { src: Video3, alt: "Video Unde", thumbnail: Thumbnail3 },
    { src: Video4, alt: "Video Front Undă 1", thumbnail: Thumbnail4 },
    { src: Video5, alt: "Video Front Undă 2", thumbnail: Thumbnail5 },
    { src: Video6, alt: "Video Lissajous", thumbnail: Thumbnail6 },
  ];

  const mecanicaFormulas = [
    { title: "Legea a doua a lui Newton", formula: "\\( \\vec{F} = m\\vec{a} \\)" },
    { title: "Forța de greutate", formula: "\\( G = mg \\)" },
    { title: "Forța de frecare", formula: "\\( F_f = \\mu N \\)" },
    { title: "Energia cinetică", formula: "\\( E_c = \\frac{1}{2}mv^2 \\)" },
    { title: "Energia potențială gravitațională", formula: "\\( E_p = mgh \\)" },
    { title: "Energia potențială elastică", formula: "\\( E_p = \\frac{1}{2}kx^2 \\)" },
    { title: "Lucrul mecanic", formula: "\\( L = F \\cdot d \\cdot \\cos(\\alpha) \\)" },
    { title: "Teorema variației energiei cinetice", formula: "\\( L = \\Delta E_c = \\frac{1}{2}mv_2^2 - \\frac{1}{2}mv_1^2 \\)" },
    { title: "Conservarea energiei mecanice", formula: "\\( E_m = E_c + E_p = const. \\)" },
    { title: "Impulsul", formula: "\\( \\vec{p} = m\\vec{v} \\)" },
    { title: "Conservarea impulsului", formula: "\\( m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\)" },
    { title: "Coeficientul de restituire", formula: "\\( e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}} \\)" },
    { title: "Mișcare uniformă", formula: "\\( x(t) = x_0 + vt \\)" },
    { title: "Mișcare uniform variată", formula: "\\( x(t) = x_0 + v_0t + \\frac{1}{2}at^2 \\)" },
    { title: "Viteza în mișcare uniform variată", formula: "\\( v(t) = v_0 + at \\)" },
    { title: "Ecuația lui Galilei", formula: "\\( v^2 = v_0^2 + 2a(x - x_0) \\)" },
    { title: "Mișcare circulară uniformă - accelerația centripetă", formula: "\\( a_c = \\frac{v^2}{R} = \\omega^2 R \\)" },
    { title: "Viteza unghiulară", formula: "\\( \\omega = \\frac{2\\pi}{T} = 2\\pi f \\)" },
    { title: "Forța centripetă", formula: "\\( F_c = m\\frac{v^2}{R} = m\\omega^2 R \\)" },
    { title: "Legea mișcării oscilatorii pe OX", formula: "\\( x(t) = A \\sin(\\omega t + \\phi) \\)" },
    { title: "Legea vitezei oscilatorii", formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)" },
    { title: "Legea accelerației oscilatorii", formula: "\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)" },
    { title: "Viteza unghiulară (oscilator)", formula: "\\( \\omega = \\sqrt{\\frac{k}{m}} \\)" },
    { title: "Perioada oscilației", formula: "\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)" },
    { title: "Perioada pendulului gravitațional", formula: "\\( T = 2\\pi \\sqrt{\\frac{l}{g}} \\)" },
    { title: "Forța pe plan înclinat (componenta paralelă)", formula: "\\( F_{||} = mg \\sin(\\alpha) \\)" },
    { title: "Forța pe plan înclinat (componenta perpendiculară)", formula: "\\( F_{\\perp} = mg \\cos(\\alpha) \\)" },
    { title: "Accelerația pe plan înclinat", formula: "\\( a = g(\\sin(\\alpha) - \\mu \\cos(\\alpha)) \\)" },
    { title: "Puterea mecanică", formula: "\\( P = \\frac{L}{t} = F \\cdot v \\)" },
  ];

  const termodinamicaFormulas = [
    { title: "Prima lege a termodinamicii", formula: "\\( \\Delta U = Q - L \\)" },
    { title: "Ecuația de stare pentru gazul ideal", formula: "\\( pV = nRT \\)" },
    { title: "Entropia (Boltzmann)", formula: "\\( S = k_B \\ln \\Omega \\)" },
    { title: "A doua lege a termodinamicii", formula: "\\( \\Delta S \\geq \\frac{Q}{T} \\)" },
    { title: "Energia internă pentru gazul ideal", formula: "\\( U = \\frac{f}{2}nRT \\)" },
    { title: "Lucrul mecanic în procese reversibile", formula: "\\( L = \\int_{V_1}^{V_2} p \\, dV \\)" },
    { title: "Căldura specifică la volum constant", formula: "\\( C_V = \\left(\\frac{\\partial U}{\\partial T}\\right)_V \\)" },
    { title: "Entalpia", formula: "\\( H = U + pV \\)" },
    { title: "Energia liberă Helmholtz", formula: "\\( F = U - TS \\)" },
    { title: "Energia liberă Gibbs", formula: "\\( G = H - TS \\)" },
    { title: "Eficiența motorului Carnot", formula: "\\( \\eta = 1 - \\frac{T_C}{T_H} \\)" },
  ];

  const seismFormulas = [
    { title: "Viteza undei P (Seism)", formula: "\\( v_P = \\sqrt{\\frac{K + \\frac{4}{3}G}{\\rho}} \\)" },
    { title: "Viteza undei S (Seism)", formula: "\\( v_S = \\sqrt{\\frac{G}{\\rho}} \\)" },
    { title: "Magnitudinea Richter", formula: "\\( M_L = \\log_{10} A - \\log_{10} A_0 \\)" },
    { title: "Magnitudinea moment seismic", formula: "\\( M_w = \\frac{2}{3} \\log_{10} M_0 - 10.7 \\)" },
    { title: "Momentul seismic", formula: "\\( M_0 = \\mu A D \\)" },
    { title: "Energia seismică eliberată", formula: "\\( E = 10^{1.5M + 4.8} \\)" },
  ];

  const undeFormulas = [
    { title: "Formula generală a undelor", formula: "\\( v = \\lambda \\cdot f \\)" },
    { title: "Viteza de propagare", formula: "\\( v = \\sqrt{\\frac{T}{\\mu}} \\)" },
    { title: "Ecuația undei progresive", formula: "\\( y(x,t) = A \\sin(kx - \\omega t + \\phi) \\)" },
    { title: "Numărul de undă", formula: "\\( k = \\frac{2\\pi}{\\lambda} \\)" },
    { title: "Energia undei", formula: "\\( E = \\frac{1}{2}\\mu A^2\\omega^2 \\)" },
    { title: "Intensitatea undei", formula: "\\( I = \\frac{P}{A} = \\frac{1}{2}\\rho v A^2\\omega^2 \\)" },
  ];

  const prismaFormulas = [
    { title: "Legea refracției (Snell)", formula: "\\( n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2) \\)" },
    { title: "Unghiul de deviație în prismă", formula: "\\( \\delta = (\\theta_1 + \\theta_2') - A \\)" },
    { title: "Indicele de refracție", formula: "\\( n = n(\\lambda) \\)" },
    { title: "Formula Cauchy pentru dispersie", formula: "\\( n(\\lambda) = A + \\frac{B}{\\lambda^2} + \\frac{C}{\\lambda^4} \\)" },
    { title: "Unghiul de deviație minimă", formula: "\\( \\delta_{min} = 2\\arcsin(n\\sin\\frac{A}{2}) - A \\)" },
    { title: "Puterea de dispersie", formula: "\\( P = \\frac{n_F - n_C}{n_D - 1} \\)" },
  ];

  const penduleFormulas = [
    { title: "Legea mișcării oscilatorii", formula: "\\( y(t) = A \\sin(\\omega t + \\phi) \\)" },
    { title: "Legea vitezei", formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)" },
    { title: "Legea accelerației", formula: "\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)" },
    { title: "Perioada pendulului gravitațional", formula: "\\( T = 2\\pi \\sqrt{\\frac{l}{g}} \\)" },
    { title: "Ecuația pendulului amortizat", formula: "\\( m\\frac{d^2x}{dt^2} + b\\frac{dx}{dt} + kx = 0 \\)" },
    { title: "Coeficientul de amortizare", formula: "\\( \\gamma = \\frac{b}{2m} \\)" },
    { title: "Frecvența amortizată", formula: "\\( \\omega_d = \\sqrt{\\omega_0^2 - \\gamma^2} \\)" },
    { title: "Decrementul logaritmic", formula: "\\( \\delta = \\ln\\frac{A_n}{A_{n+1}} = \\gamma T_d \\)" },
    { title: "Factorul de calitate", formula: "\\( Q = \\frac{\\omega_0}{2\\gamma} = \\frac{\\pi}{\\delta} \\)" },
    { title: "Ecuația pendulului simplu neliniar", formula: "\\( \\frac{d^2\\phi}{dt^2} + \\frac{g}{l} \\sin\\phi = 0 \\)" },
    { title: "Perioada pentru oscilații mari", formula: "\\( T = 4\\sqrt{\\frac{l}{g}}K(k) \\)" },
  ];

  const lissajousFormulas = [
    { title: "Ecuația parametrică x", formula: "\\( x(t) = A_1 \\sin(\\omega_1 t + \\phi_1) \\)" },
    { title: "Ecuația parametrică y", formula: "\\( y(t) = A_2 \\sin(\\omega_2 t + \\phi_2) \\)" },
    { title: "Raportul frecvențelor", formula: "\\( r = \\frac{\\omega_1}{\\omega_2} = \\frac{f_1}{f_2} \\)" },
    { title: "Diferența de fază", formula: "\\( \\Delta\\phi = \\phi_1 - \\phi_2 \\)" },
    { title: "Ecuația implicită (r = 1)", formula: "\\( \\frac{x^2}{A_1^2} + \\frac{y^2}{A_2^2} - \\frac{2xy}{A_1A_2}\\cos(\\Delta\\phi) = \\sin^2(\\Delta\\phi) \\)" },
    { title: "Perioada figurii", formula: "\\( T = \\frac{2\\pi}{\\gcd(\\omega_1, \\omega_2)} \\)" },
    { title: "Energia totală", formula: "\\( E = \\frac{1}{2}m(A_1^2\\omega_1^2 + A_2^2\\omega_2^2) \\)" },
    { title: "Aria figurii (r = 1)", formula: "\\( A = \\pi A_1A_2|\\sin(\\Delta\\phi)| \\)" },
  ];

  const electricitateFormulas = [
    { title: "Legea lui Ohm", formula: "\\( U = RI \\)" },
    { title: "Puterea electrică", formula: "\\( P = UI = RI^2 = \\frac{U^2}{R} \\)" },
    { title: "Energia electrică", formula: "\\( W = UIt = RI^2t = \\frac{U^2}{R}t \\)" },
    { title: "Rezistența echivalentă în serie", formula: "\\( R_{eq} = R_1 + R_2 + ... + R_n \\)" },
    { title: "Rezistența echivalentă în paralel", formula: "\\( \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n} \\)" },
    { title: "Prima lege a lui Kirchhoff", formula: "\\( \\sum I_{intrare} = \\sum I_{iesire} \\)" },
    { title: "A doua lege a lui Kirchhoff", formula: "\\( \\sum U = \\sum RI \\)" },
    { title: "Rezistența unui conductor", formula: "\\( R = \\rho \\frac{l}{S} \\)" },
    { title: "Curentul electric", formula: "\\( I = \\frac{q}{t} = nqvS \\)" },
    { title: "Densitatea curentului", formula: "\\( j = \\frac{I}{S} = nqv \\)" },
    { title: "Intensitatea câmpului electric", formula: "\\( \\vec{E} = \\frac{\\vec{F}}{q} \\)" },
    { title: "Câmpul electric al unei sarcini punctiforme", formula: "\\( E = k \\frac{q}{r^2} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2} \\)" },
    { title: "Potențialul electric", formula: "\\( V = \\frac{W}{q} = k \\frac{q}{r} \\)" },
    { title: "Tensiunea electrică", formula: "\\( U = V_1 - V_2 = Ed \\)" },
    { title: "Capacitatea unui condensator plan", formula: "\\( C = \\frac{\\varepsilon_0 S}{d} \\)" },
    { title: "Energia stocată într-un condensator", formula: "\\( W = \\frac{1}{2}CU^2 = \\frac{Q^2}{2C} \\)" },
    { title: "Energia stocată într-o bobină", formula: "\\( W = \\frac{1}{2}LI^2 \\)" },
  ];

  const opticaFormulas = [
    { title: "Formula lentilelor subțiri", formula: "\\( \\frac{1}{f} = \\frac{1}{x_1} + \\frac{1}{x_2} \\)" },
    { title: "Mărirea liniară", formula: "\\( \\beta = \\frac{x_2}{x_1} = \\frac{y_2}{y_1} \\)" },
    { title: "Convergența (puterea optică)", formula: "\\( C = \\frac{1}{f} \\)" },
    { title: "Formula constructorului de lentile", formula: "\\( \\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\)" },
    { title: "Indicele de refracție", formula: "\\( n = \\frac{c}{v} = \\frac{\\sin(i)}{\\sin(r)} \\)" },
    { title: "Legea refracției (Snell)", formula: "\\( n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2) \\)" },
    { title: "Legea reflexiei", formula: "\\( \\theta_i = \\theta_r \\)" },
    { title: "Unghiul critic pentru reflexie totală", formula: "\\( \\sin(\\theta_{crit}) = \\frac{n_2}{n_1} \\)" },
    { title: "Viteza luminii în mediu", formula: "\\( v = \\frac{c}{n} \\)" },
    { title: "Lungimea de undă în mediu", formula: "\\( \\lambda_n = \\frac{\\lambda_0}{n} \\)" },
    { title: "Deviația minimă în prismă", formula: "\\( \\delta_{min} = (n - 1)A \\)" },
    { title: "Unghiul de deviație", formula: "\\( \\delta = i_1 + i_2 - A \\)" },
    { title: "Condiția pentru maxime de interferență", formula: "\\( \\Delta = k\\lambda = d\\sin(\\theta) \\)" },
    { title: "Condiția pentru minime de interferență", formula: "\\( \\Delta = \\left(k + \\frac{1}{2}\\right)\\lambda = d\\sin(\\theta) \\)" },
    { title: "Rețeaua de difracție", formula: "\\( d\\sin(\\theta) = m\\lambda \\)" },
    { title: "Puterea de rezoluție a rețelei", formula: "\\( R = \\frac{\\lambda}{\\Delta\\lambda} = mN \\)" },
  ];

  const matematicaFormulas = [
    { title: "Funcție liniară", formula: "\\( y = ax + b \\)" },
    { title: "Funcție pătratică", formula: "\\( y = ax^2 + bx + c \\)" },
    { title: "Derivată (definiție)", formula: "\\( f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\)" },
    { title: "Derivata sinusului", formula: "\\( \\frac{d}{dx}\\sin(x) = \\cos(x) \\)" },
    { title: "Derivata cosinusului", formula: "\\( \\frac{d}{dx}\\cos(x) = -\\sin(x) \\)" },
    { title: "Derivata exponențialei", formula: "\\( \\frac{d}{dx}e^x = e^x \\)" },
    { title: "Derivata logaritmului", formula: "\\( \\frac{d}{dx}\\ln(x) = \\frac{1}{x} \\)" },
    { title: "Metrica Minkowski (spațiu-timp)", formula: "\\( ds^2 = c^2 dt^2 - dx^2 - dy^2 - dz^2 \\)" },
  ];

  const astronomieFormulas = [
    { title: "Legea I Kepler – elipsa", formula: "\\( \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad b = a\\sqrt{1-e^2} \\)" },
    { title: "Legea a II-a Kepler – ariile", formula: "\\( \\frac{dA}{dt} = \\frac{L}{2m} = \\text{const.} \\)" },
    { title: "Legea a III-a Kepler", formula: "\\( T^2 = \\frac{4\\pi^2}{GM}\\, a^3 \\)" },
    { title: "Viteza orbitală medie", formula: "\\( v = \\frac{2\\pi a}{T} \\)" },
    { title: "Energia pe orbită eliptică", formula: "\\( E = -\\frac{GMm}{2a} \\)" },
    { title: "Viteza la periheliu", formula: "\\( v_p = \\sqrt{\\frac{GM}{a}\\frac{1+e}{1-e}} \\)" },
    { title: "Viteza la afeliu", formula: "\\( v_a = \\sqrt{\\frac{GM}{a}\\frac{1-e}{1+e}} \\)" },
  ];

  const relativitateFormulas = [
    { title: "Viteza luminii (invariant)", formula: "\\( c = 299\\,792\\,458 \\,\\text{m/s} \\)" },
    { title: "Dilatarea timpului", formula: "\\( \\Delta t' = \\gamma \\Delta t, \\quad \\gamma = \\frac{1}{\\sqrt{1-v^2/c^2}} \\)" },
    { title: "Contracția lungimii", formula: "\\( L' = \\frac{L}{\\gamma} \\)" },
    { title: "Transformări Lorentz (x, t)", formula: "\\( x' = \\gamma(x - vt), \\quad t' = \\gamma(t - vx/c^2) \\)" },
    { title: "Adunarea relativistă a vitezelor", formula: "\\( u' = \\frac{u - v}{1 - uv/c^2} \\)" },
    { title: "Energia relativistă", formula: "\\( E = \\gamma mc^2 \\)" },
    { title: "Energia de repaus", formula: "\\( E_0 = mc^2 \\)" },
    { title: "Impuls relativist", formula: "\\( p = \\gamma m v \\)" },
  ];

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const formulaParam = searchParams.get("formula");

    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (formulaParam) {
      const allowed = [
        "mecanica",
        "termodinamica",
        "seism",
        "unde",
        "prisma",
        "pendule",
        "lissajous",
        "electricitate",
        "optica",
        "matematica",
        "astronomie",
        "relativitate",
      ];
      if (allowed.includes(formulaParam)) {
        setActiveFormulaTab(formulaParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typeset()
    }
  }, []);

  // Încărcare progresivă a formulelor pentru a evita blocajul
  useEffect(() => {
    if (activeTab !== "formule") return;

    const formulasMap = {
      mecanica: mecanicaFormulas,
      termodinamica: termodinamicaFormulas,
      seism: seismFormulas,
      unde: undeFormulas,
      prisma: prismaFormulas,
      pendule: penduleFormulas,
      lissajous: lissajousFormulas,
      electricitate: electricitateFormulas,
      optica: opticaFormulas,
      matematica: matematicaFormulas,
      astronomie: astronomieFormulas,
      relativitate: relativitateFormulas,
    };

    const currentFormulas = formulasMap[activeFormulaTab] || [];
    const totalFormulas = currentFormulas.length;
    
    if (totalFormulas === 0) return;

    // Verificăm dacă categoria a fost deja încărcată complet
    setVisibleFormulasCount(prev => {
      const currentVisible = prev[activeFormulaTab] || 0;
      
      // Dacă categoria a fost deja încărcată complet, nu facem nimic
      if (currentVisible >= totalFormulas) {
        return prev;
      }

      // Inițializăm sau continuăm de unde am rămas
      const batchSize = 5;
      const startCount = currentVisible > 0 ? currentVisible : Math.min(batchSize, totalFormulas);

      return {
        ...prev,
        [activeFormulaTab]: startCount
      };
    });

    // Pornim încărcarea progresivă dacă nu am terminat
    let intervalId = null;

    // Verificăm periodic dacă trebuie să continuăm încărcarea
    intervalId = setInterval(() => {
      setVisibleFormulasCount(prev => {
        const currentVisible = prev[activeFormulaTab] || 0;
        if (currentVisible < totalFormulas) {
          const batchSize = 5;
          const newCount = Math.min(currentVisible + batchSize, totalFormulas);
          if (newCount >= totalFormulas && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return {
            ...prev,
            [activeFormulaTab]: newCount
          };
        }
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return prev;
      });
    }, 50); // Delay de 50ms între batch-uri

    // Cleanup: oprim interval-ul când se schimbă tab-ul sau când componenta se demontează
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab, activeFormulaTab]);

  return (
    <Layout>
      <SEO
        title="Resurse Educaționale Fizică | PULS - Materiale Teoretice și Video-uri"
        description="Resurse educaționale complete pentru fizică: materiale teoretice, video-uri, formule și explicații pentru pendule, unde, oscilații, termodinamică, mecanică, electricitate și optică."
        keywords="resurse fizică, materiale fizică, video fizică, formule fizică, teorie fizică, educație fizică"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-page page-section">
        <main>
          <h1 className="resurse-title">Resurse</h1>

          <div className="resurse-description">
            <p>
              Accesează materiale educaționale pentru studiul fizicii, categorizate după nivelul de dificultate și tipul de conținut.
            </p>
          </div>

          <Tabs defaultValue="lectii" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger key="lectii" value="lectii">Lecții</TabsTrigger>
              <TabsTrigger key="formule" value="formule">Formule</TabsTrigger>
              <TabsTrigger key="experimente" value="experimente">Experimente</TabsTrigger>
              <TabsTrigger key="bibliografie" value="bibliografie">Bibliografie</TabsTrigger>
            </TabsList>

            <TabsContent key="formule" value="formule">
              <div className="rounded-container">
                <h2 className="resurse-section-title">Formule esențiale în fizică</h2>
                <p className="text-muted-foreground mb-4">
                  Alege o categorie pentru a vedea formulele corespunzătoare.
                </p>

                <Tabs defaultValue="mecanica" value={activeFormulaTab} onValueChange={setActiveFormulaTab}>
                  <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="mecanica">Mecanică</TabsTrigger>
                    <TabsTrigger value="termodinamica">Termodinamică</TabsTrigger>
                    <TabsTrigger value="seism">Seism</TabsTrigger>
                    <TabsTrigger value="unde">Unde</TabsTrigger>
                    <TabsTrigger value="prisma">Refracție</TabsTrigger>
                    <TabsTrigger value="pendule">Oscilații</TabsTrigger>
                    <TabsTrigger value="lissajous">Lissajous</TabsTrigger>
                    <TabsTrigger value="electricitate">Electricitate</TabsTrigger>
                    <TabsTrigger value="optica">Optică</TabsTrigger>
                    <TabsTrigger value="matematica">Matematică</TabsTrigger>
                    <TabsTrigger value="astronomie">Astronomie</TabsTrigger>
                    <TabsTrigger value="relativitate">Relativitate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="mecanica">
                    <div className="formula-grid mb-4">
                      {mecanicaFormulas
                        .slice(0, visibleFormulasCount.mecanica || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`mecanica-${visibleFormulasCount.mecanica || 0}`} />
                  </TabsContent>

                  <TabsContent value="termodinamica">
                    <div className="formula-grid mb-4">
                      {termodinamicaFormulas
                        .slice(0, visibleFormulasCount.termodinamica || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`termodinamica-${visibleFormulasCount.termodinamica || 0}`} />
                  </TabsContent>

                  <TabsContent value="seism">
                    <div className="formula-grid mb-4">
                      {seismFormulas
                        .slice(0, visibleFormulasCount.seism || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`seism-${visibleFormulasCount.seism || 0}`} />
                  </TabsContent>

                  <TabsContent value="unde">
                    <div className="formula-grid mb-4">
                      {undeFormulas
                        .slice(0, visibleFormulasCount.unde || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`unde-${visibleFormulasCount.unde || 0}`} />
                  </TabsContent>

                  <TabsContent value="prisma">
                    <div className="formula-grid mb-4">
                      {prismaFormulas
                        .slice(0, visibleFormulasCount.prisma || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`prisma-${visibleFormulasCount.prisma || 0}`} />
                  </TabsContent>

                  <TabsContent value="pendule">
                    <div className="formula-grid mb-4">
                      {penduleFormulas
                        .slice(0, visibleFormulasCount.pendule || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`pendule-${visibleFormulasCount.pendule || 0}`} />
                  </TabsContent>

                  <TabsContent value="lissajous">
                    <div className="formula-grid mb-4">
                      {lissajousFormulas
                        .slice(0, visibleFormulasCount.lissajous || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`lissajous-${visibleFormulasCount.lissajous || 0}`} />
                  </TabsContent>

                  <TabsContent value="electricitate">
                    <div className="formula-grid mb-4">
                      {electricitateFormulas
                        .slice(0, visibleFormulasCount.electricitate || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`electricitate-${visibleFormulasCount.electricitate || 0}`} />
                  </TabsContent>

                  <TabsContent value="optica">
                    <div className="formula-grid mb-4">
                      {opticaFormulas
                        .slice(0, visibleFormulasCount.optica || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`optica-${visibleFormulasCount.optica || 0}`} />
                  </TabsContent>

                  <TabsContent value="matematica">
                    <div className="formula-grid mb-4">
                      {matematicaFormulas
                        .slice(0, visibleFormulasCount.matematica || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`matematica-${visibleFormulasCount.matematica || 0}`} />
                  </TabsContent>

                  <TabsContent value="astronomie">
                    <div className="formula-grid mb-4">
                      {astronomieFormulas
                        .slice(0, visibleFormulasCount.astronomie || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`astronomie-${visibleFormulasCount.astronomie || 0}`} />
                  </TabsContent>

                  <TabsContent value="relativitate">
                    <div className="formula-grid mb-4">
                      {relativitateFormulas
                        .slice(0, visibleFormulasCount.relativitate || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`relativitate-${visibleFormulasCount.relativitate || 0}`} />
                  </TabsContent>
                </Tabs>
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
