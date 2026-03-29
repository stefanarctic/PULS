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
import { useAssistant } from "@/hooks/useAssistant";
import { tabelPeriodicFormulas } from "@/data/tabelPeriodicFormulas";


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
      "Legile lui Kepler, mișcarea planetelor, gravitația și experimentul Michelson–Morley (lumină, eter, interferență).",
    path: "/resurse/astronomie",
  },
  {
    title: "Fizică cuantică",
    description:
      "Dublă fantă (interferență și probabilitate) și tunelare cuantică lecție, formule și simulatoare interactive.",
    path: "/resurse/fizica-cuantica",
  },
  {
    title: "Atomul",
    description:
      "Atomul de hidrogen (Bohr, Schrödinger, spectru) și tabelul periodic al elementelor, teorie și simulări.",
    path: "/resurse/atomul",
  },
];

const ResursePage = () => {
  const navigate = useNavigate();
  const assistant = useAssistant();

  const [activeTab, setActiveTab] = useState("lectii");
  const [activeFormulaTab, setActiveFormulaTab] = useState("mecanica");
  const [visibleFormulasCount, setVisibleFormulasCount] = useState({});
  const [formulaPopup, setFormulaPopup] = useState(null); // { section, title, formula, explanation }

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
    {
      section: "1. Mișcarea rectilinie uniformă",
      formulas: [
        {
          title: "Viteza",
          formula: "\\( v = \\frac{d}{t} \\)",
          explanation: "În mișcarea rectilinie uniformă (MRU), corpul se deplasează pe o dreaptă cu viteză constantă. Viteza medie este egală cu viteza instantanee și se calculează ca raportul dintre distanța parcursă (d) și intervalul de timp (t). Unitatea de măsură în SI: m/s. Exemplu: un automobil care parcurge 120 km în 2 ore are viteza v = 120/2 = 60 km/h.",
        },
      ],
    },
    {
      section: "2. Mișcarea rectilinie uniform variată",
      formulas: [
        {
          title: "Viteza",
          formula: "\\( v = v_0 + a \\cdot t \\)",
          explanation: "Viteza la un moment dat în MRUV depinde de viteza inițială (v₀), accelerația constantă (a) și timpul (t). Dacă a > 0, corpul accelerează; dacă a < 0, corpul frânează. Această ecuație rezultă din definiția accelerației: a = Δv/Δt. Exemplu: un corp lansat cu v₀ = 5 m/s și a = 2 m/s² are după 3 s viteza v = 5 + 2·3 = 11 m/s.",
        },
        {
          title: "Distanța",
          formula: "\\( x = v_0 \\cdot t + \\frac{1}{2} a \\cdot t^2 \\)",
          explanation: "Legea spațiului în MRUV: poziția (sau distanța parcursă) depinde de viteza inițială, timp și accelerație. Termenul v₀·t corespunde mișcării uniforme, iar ½·a·t² este contribuția accelerației. Graficul x(t) este o parabolă. La cădere liberă (v₀ = 0, a = g): x = ½·g·t².",
        },
        {
          title: "Torricelli",
          formula: "\\( v^2 = v_0^2 + 2 \\cdot a \\cdot x \\)",
          explanation: "Ecuația lui Torricelli leagă viteza finală de viteza inițială, accelerația și spațiul parcurs, fără a depinde explicit de timp. Utilă când timpul nu este cunoscut. Se obține eliminând t din ecuațiile v = v₀ + at și x = v₀t + ½at². La cădere liberă: v² = 2gh.",
        },
        {
          title: "Accelerația",
          formula: "\\( a = \\frac{v - v_0}{t} \\)",
          explanation: "Accelerația medie este variația vitezei pe unitatea de timp. În MRUV, accelerația este constantă. Unitatea SI: m/s². Accelerația gravitațională la suprafața Pământului: g ≈ 9,8 m/s². Semnul: a > 0 (accelerație), a < 0 (decelerație/frânare).",
        },
      ],
    },
    {
      section: "3. Legile lui Newton",
      formulas: [
        {
          title: "Legea I",
          formula: "\\( \\Sigma F = 0 \\) — corp în repaus sau mișcare uniformă",
          explanation: "Legea inerției: un corp rămâne în repaus sau în mișcare rectilinie uniformă atâta timp cât rezultanta forțelor care acționează asupra lui este zero. Inerția este proprietatea corpurilor de a-și menține starea de mișcare. Fără forțe exterioare, un corp nu-și schimbă viteza.",
        },
        {
          title: "Legea a II-a",
          formula: "\\( F = m \\cdot a \\)",
          explanation: "Forța rezultantă care acționează asupra unui corp este egală cu produsul dintre masă și accelerație. Masa (m) măsoară inerția corpului: cu cât masa e mai mare, cu atât accelerația e mai mică pentru aceeași forță. Unități: F în N (newton), m în kg, a în m/s².",
        },
        {
          title: "Legea a III-a",
          formula: "\\( F_{12} = -F_{21} \\)",
          explanation: "Legea acțiunii și reacțiunii: dacă corpul 1 acționează asupra corpului 2 cu forța F₁₂, atunci corpul 2 acționează asupra corpului 1 cu forța F₂₁ = −F₁₂. Forțele au același modul, aceeași direcție, dar sensuri opuse. Acționează asupra unor corpuri diferite.",
        },
        {
          title: "Greutatea",
          formula: "\\( G = m \\cdot g \\) (g ≈ 9,8 m/s²)",
          explanation: "Greutatea este forța cu care Pământul atrage un corp. g este accelerația gravitațională la suprafața Pământului (variază ușor cu latitudinea și altitudinea). Unitate: N (newton). Exemplu: un corp de 10 kg are greutatea G = 10·9,8 = 98 N.",
        },
        {
          title: "Forța normală",
          formula: "\\( N = m \\cdot g \\cdot \\cos\\theta \\)",
          explanation: "Forța normală este reacțiunea suprafeței de susținere, perpendiculară pe suprafață. Pe un plan înclinat cu unghiul θ, N = mg·cos θ. Ea echilibrează componenta perpendiculară a greutății. Pe plan orizontal: N = mg.",
        },
        {
          title: "Forța de frecare",
          formula: "\\( F_f = \\mu \\cdot N \\)",
          explanation: "Forța de frecare la alunecare este proporțională cu forța normală. μ este coeficientul de frecare (adimensional, depinde de natura suprafețelor). Ff se opune mișcării. La frecare statică: Ff ≤ μ·N (până la valoarea maximă care permite mișcarea).",
        },
        {
          title: "Forța pe plan înclinat",
          formula: "\\( F_{\\parallel} = m \\cdot g \\cdot \\sin\\theta \\)",
          explanation: "Componenta greutății paralelă cu planul înclinat, care produce alunecarea corpului. Cu cât unghiul θ e mai mare, cu atât F∥ e mai mare. La θ = 90° (cădere liberă): F∥ = mg. Această forță este responsabilă pentru accelerația corpului pe plan.",
        },
      ],
    },
    {
      section: "4. Lucrul mecanic și energia",
      formulas: [
        {
          title: "Lucrul mecanic",
          formula: "\\( L = F \\cdot d \\cdot \\cos\\theta \\)",
          explanation: "Lucrul mecanic este efectuat de o forță când punctul ei de aplicație se deplasează. θ este unghiul dintre forță și direcția deplasării. L = F·d când forța este paralelă cu deplasarea. L > 0 (forță motoare), L < 0 (forță rezistentă), L = 0 (forță perpendiculară). Unitate: J (jul).",
        },
        {
          title: "Energia cinetică",
          formula: "\\( E_c = \\frac{1}{2} m \\cdot v^2 \\)",
          explanation: "Energia cinetică este energia datorată mișcării. Depinde de masă și de pătratul vitezei. Unitate: J. Un corp în repaus are Ec = 0. La dublarea vitezei, energia cinetică se mărește de 4 ori. E o mărime scalară, pozitivă.",
        },
        {
          title: "Teorema lucrului mecanic",
          formula: "\\( L = \\Delta E_c = E_{c2} - E_{c1} \\)",
          explanation: "Lucrul mecanic al rezultantei forțelor este egal cu variația energiei cinetice. Dacă L > 0, corpul accelerează; dacă L < 0, corpul frânează. Această teoremă este o formă a teoremei energiei cinetice și se aplică în orice situație mecanică.",
        },
        {
          title: "Energia potențială gravitațională",
          formula: "\\( E_p = m \\cdot g \\cdot h \\)",
          explanation: "Energia potențială gravitațională depinde de înălțimea h față de un nivel de referință (de obicei solul). Crește cu h. La cădere, Ep se transformă în Ec. Nivelul de referință este arbitrar; contează doar ΔEp. Unitate: J.",
        },
        {
          title: "Conservarea energiei mecanice",
          formula: "\\( E_c + E_p = const. \\)",
          explanation: "În absența forțelor neconservative (frecare, rezistență), energia mecanică totală (cinetică + potențială) se conservă. Energia poate trece din Ec în Ep și invers, dar suma rămâne constantă. Exemplu: pendulul, căderea liberă fără frecare.",
        },
        {
          title: "Puterea",
          formula: "\\( P = \\frac{L}{t} = F \\cdot v \\)",
          explanation: "Puterea măsoară rapiditatea cu care se efectuează lucrul mecanic. P = L/t (lucru pe unitatea de timp). Forma P = F·v este utilă când forța și viteza sunt constante și paralele. Unitate: W (watt) = J/s. 1 CP ≈ 735 W.",
        },
        {
          title: "Randamentul",
          formula: "\\( \\eta = \\frac{L_u}{L_c} \\) (η ≤ 1)",
          explanation: "Randamentul este raportul dintre lucrul util (Lu) și lucrul consumat (Lc). η ≤ 1 întotdeauna; diferența se pierde prin frecări, căldură etc. η = 1 doar în sisteme ideale, fără pierderi. Se exprimă adesea în procente: η = 80% înseamnă η = 0,8.",
        },
      ],
    },
    {
      section: "5. Impuls și cantitatea de mișcare",
      formulas: [
        {
          title: "Cantitatea de mișcare",
          formula: "\\( p = m \\cdot v \\)",
          explanation: "Cantitatea de mișcare (impulsul mecanic) este un vector având direcția și sensul vitezei. Măsoară „inerția în mișcare”. Unitate: kg·m/s. În ciocniri, p total se conservă. Un camion are p mai mare decât o mașină la aceeași viteză datorită masei.",
        },
        {
          title: "Teorema impuls–cantitate de mișcare",
          formula: "\\( F \\cdot \\Delta t = \\Delta p \\)",
          explanation: "Impulsul forței (F·Δt) este egal cu variația cantității de mișcare. Pentru o forță constantă: F·Δt = m·Δv. La ciocniri, forțele sunt mari și Δt mic, deci F poate fi foarte mare. Explică de ce airbag-urile măresc Δt și reduc F.",
        },
        {
          title: "Conservarea cantității de mișcare",
          formula: "\\( m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2' \\)",
          explanation: "Într-un sistem izolat (rezultanta forțelor exterioare = 0), cantitatea de mișcare totală se conservă. În ciocniri, suma m·v înainte este egală cu suma m·v după. v' sunt vitezele după ciocnire. Ecuația este vectorială; se aplică pe fiecare axă.",
        },
      ],
    },
    {
      section: "6. Mișcarea circulară uniformă (MCU)",
      formulas: [
        {
          title: "Perioada",
          formula: "\\( T = \\frac{2\\pi}{\\omega} \\)",
          explanation: "Perioada este timpul în care corpul parcurge o rotație completă (2π radiani). Unitate: s (secundă). T = 1/f, unde f este frecvența. Exemplu: minutele ceasului au T = 60 s, deci ω = 2π/60 rad/s.",
        },
        {
          title: "Frecvența",
          formula: "\\( f = \\frac{1}{T} \\)",
          explanation: "Frecvența este numărul de rotații complete pe secundă. Unitate: Hz (hertz) = s⁻¹. f = ω/(2π). Exemplu: un disc care face 33 rotații/minut are f = 33/60 ≈ 0,55 Hz.",
        },
        {
          title: "Viteza unghiulară",
          formula: "\\( \\omega = 2\\pi \\cdot f \\)",
          explanation: "Viteza unghiulară măsoară rapiditatea rotației în radiani pe secundă. ω = 2π/T = 2πf. În MCU, ω este constantă. Unitate: rad/s. Legătura cu perioada: cu cât T e mai mare, cu atât ω e mai mic.",
        },
        {
          title: "Viteza liniară",
          formula: "\\( v = \\omega \\cdot r = \\frac{2\\pi r}{T} \\)",
          explanation: "Viteza liniară (tangențială) este perpendiculară pe rază. v = ω·r leagă viteza unghiulară de raza traiectoriei. Punctele mai depărtate de centru au v mai mare. v = 2πr/T = 2πrf. Direcția se schimbă continuu, dar modulul rămâne constant.",
        },
        {
          title: "Accelerația centripetă",
          formula: "\\( a_c = \\frac{v^2}{r} = \\omega^2 \\cdot r \\)",
          explanation: "Accelerația centripetă este îndreptată spre centrul cercului și modifică doar direcția vitezei, nu modulul. ac = v²/r = ω²r. În MCU există doar accelerație centripetă, nu tangențială. Fără ac, corpul s-ar mișca rectiliniu.",
        },
        {
          title: "Forța centripetă",
          formula: "\\( F_c = m \\cdot \\frac{v^2}{r} = m \\cdot \\omega^2 \\cdot r \\)",
          explanation: "Forța centripetă este rezultanta forțelor care țin corpul pe traiectorie circulară. Fc = m·ac. Exemple: tensiunea în fir (pendul conic), frecarea (mașina în viraj), gravitația (satelitul în orbită). E îndreptată spre centru.",
        },
      ],
    },
    {
      section: "7. Gravitația universală",
      formulas: [
        {
          title: "Legea lui Newton",
          formula: "\\( F = G \\cdot \\frac{m_1 \\cdot m_2}{r^2} \\) (G = 6,674×10⁻¹¹ N·m²/kg²)",
          explanation: "Două corpuri se atrag cu o forță proporțională cu produsul maselor și invers proporțională cu pătratul distanței dintre centre. G este constanta gravitațională universală. Legea se aplică pentru corpuri punctiforme sau sferice. Explică atât căderea corpurilor, cât și mișcarea planetelor.",
        },
        {
          title: "Accelerația gravitațională",
          formula: "\\( g = \\frac{G \\cdot M}{R^2} \\)",
          explanation: "Accelerația gravitațională la suprafața unui corp ceresc de masă M și rază R. La Pământ: g ≈ 9,8 m/s². Scade cu altitudinea. Pe Lună, g este de ~6 ori mai mic. Permite calculul g pe alte planete cunoscând M și R.",
        },
        {
          title: "Viteza de orbitare",
          formula: "\\( v = \\sqrt{\\frac{G \\cdot M}{r}} \\)",
          explanation: "Viteza pe care trebuie să o aibă un satelit pentru a orbita la distanța r de centrul planetei (masă M). Rezultă din egalarea forței gravitaționale cu forța centripetă. Cu cât orbita e mai înaltă, cu atât v e mai mic. Pentru ISS: v ≈ 7,7 km/s.",
        },
        {
          title: "Legea a III-a a lui Kepler",
          formula: "\\( \\frac{T^2}{r^3} = const. \\)",
          explanation: "Pătratul perioadei de revoluție este proporțional cu cubul semiaxei mari a orbitei. Valabil pentru toate planetele care orbitează în jurul aceluiași corp (ex. Soare). Permite calculul distanțelor planetare sau al masei Soarelui.",
        },
      ],
    },
    {
      section: "8. Dinamica rotației (corp rigid)",
      formulas: [
        {
          title: "Momentul forței",
          formula: "\\( M = F \\cdot d \\)",
          explanation: "Momentul forței (cuplul) măsoară capacitatea forței de a produce rotație. d este brațul forței (distanța de la axa de rotație la linia de acțiune a forței). Unitate: N·m. M = 0 când forța trece prin axă. M = F·d·sin θ în general.",
        },
        {
          title: "Condiție echilibru (translație)",
          formula: "\\( \\Sigma F = 0 \\)",
          explanation: "Pentru echilibru de translație, rezultanta forțelor trebuie să fie zero. Corpul nu se translatează. Prima condiție de echilibru pentru un corp rigid.",
        },
        {
          title: "Condiție echilibru (rotație)",
          formula: "\\( \\Sigma M = 0 \\)",
          explanation: "Pentru echilibru de rotație, suma momentelor forțelor în jurul oricărei axe trebuie să fie zero. Corpul nu se rotește. A doua condiție de echilibru. Cele două condiții trebuie îndeplinite simultan pentru echilibru complet.",
        },
        {
          title: "Legea fundamentală a rotației",
          formula: "\\( M = I \\cdot \\alpha \\)",
          explanation: "Analogul lui F = ma pentru rotație: momentul rezultant este egal cu produsul dintre momentul de inerție (I) și accelerația unghiulară (α). I depinde de forma corpului și de axa de rotație. Unitate pentru I: kg·m².",
        },
        {
          title: "Momentul cinetic",
          formula: "\\( L = I \\cdot \\omega \\)",
          explanation: "Momentul cinetic (momentul impulsului) este analogul cantității de mișcare pentru rotație. L = I·ω. Se conservă în sisteme izolate (ex. patinatorul care-și strânge brațele rotește mai repede). Unitate: kg·m²/s.",
        },
        {
          title: "Energia cinetică de rotație",
          formula: "\\( E_{cr} = \\frac{1}{2} I \\cdot \\omega^2 \\)",
          explanation: "Energia cinetică a unui corp care se rotește. Analogă cu Ec = ½mv² pentru translație. Un corp poate avea atât energie cinetică de translație, cât și de rotație (ex. roata care rulează).",
        },
      ],
    },
    {
      section: "9. Oscilații mecanice",
      formulas: [
        {
          title: "Legea lui Hooke",
          formula: "\\( F = -k \\cdot x \\)",
          explanation: "Forța elastică este proporțională cu deformarea x și îndreptată spre poziția de echilibru (semnul minus). k este constanta elastică a resortului (N/m). Cu cât resortul e mai rigid, cu atât k e mai mare. Forța este restabilitoare.",
        },
        {
          title: "Energia potențială elastică",
          formula: "\\( E_p = \\frac{1}{2} k \\cdot x^2 \\)",
          explanation: "Energia stocată într-un resort comprimat sau întins cu deformarea x. E maximă la amplitudine (x = ±A), zero la echilibru. Se transformă în energie cinetică și invers în timpul oscilației. Formă similară cu Ec = ½mv².",
        },
        {
          title: "Ecuația mișcării",
          formula: "\\( x = A \\cdot \\cos(\\omega t + \\varphi) \\)",
          explanation: "Legea de mișcare a oscilatorului armonic. A = amplitudinea, ω = pulsația, φ = faza inițială. Corpul oscilează între -A și +A. Cosinusul descrie mișcarea periodică. v = dx/dt = -Aω·sin(ωt + φ).",
        },
        {
          title: "Perioada oscilatorului elastic",
          formula: "\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)",
          explanation: "Perioada oscilatorului (resort–masă) depinde doar de m și k, nu de amplitudine (în limitele valabilității legii lui Hooke). Cu cât masa e mai mare sau k mai mic, cu atât T e mai mare. ω = √(k/m).",
        },
        {
          title: "Perioada pendulului simplu",
          formula: "\\( T = 2\\pi \\sqrt{\\frac{l}{g}} \\)",
          explanation: "Perioada pendulului gravitațional depinde de lungimea firului (l) și de g. Nu depinde de masa pendulului. Valabilă pentru oscilații mici (θ < ~10°). Pendulul mai lung oscilează mai lent. Util pentru măsurarea lui g.",
        },
        {
          title: "Viteza maximă",
          formula: "\\( v_{max} = A \\cdot \\omega \\)",
          explanation: "Viteza maximă se atinge la trecerea prin poziția de echilibru (x = 0), unde toată energia e cinetică. vmax = Aω. Depinde de amplitudine și pulsație. La oscilatorul elastic: vmax = A√(k/m).",
        },
      ],
    },
  ];

  const termodinamicaFormulas = [
    {
      section: "1. Mărimi termice de bază",
      formulas: [
        {
          title: "Conversia temperaturii",
          formula: "\\( T = t + 273 \\) (Kelvin ↔ Celsius)",
          explanation: "Pentru a trece din grade Celsius în Kelvin, adaugi 273. Exemplu: 25°C = 298 K. În fizică folosim Kelvin pentru că 0 K = cea mai mică temperatură posibilă.",
        },
        {
          title: "Dilatarea liniară",
          formula: "\\( l = l_0 \\cdot (1 + \\alpha \\cdot \\Delta t) \\)",
          explanation: "Când un corp se încălzește, se lungesc. α spune cât de mult (e dat în probleme). l₀ = lungimea la început, Δt = cât s-a încălzit. Exemplu: șinele de cale ferată se dilată vara.",
        },
        {
          title: "Dilatarea volumică",
          formula: "\\( V = V_0 \\cdot (1 + \\gamma \\cdot \\Delta t) \\) (γ ≈ 3α)",
          explanation: "La fel ca dilatarea liniară, dar pentru volum. γ e aproximativ de 3 ori α. Lichidele se dilată mai mult decât solidele.",
        },
      ],
    },
    {
      section: "1b. Tabelul periodic — mărimi utile",
      formulas: [
        {
          title: "Numărul atomic",
          formula: "\\( Z = p \\)",
          explanation: "Z este numărul de protoni din nucleu (și, la atom neutru, numărul de electroni). Îl găsești direct în tabelul periodic.",
        },
        {
          title: "Numărul de masă",
          formula: "\\( A = Z + N \\)",
          explanation: "A este suma dintre protoni (Z) și neutroni (N). În multe probleme, N se află cu N = A − Z (folosind izotopul dat).",
        },
        {
          title: "Numărul de neutroni",
          formula: "\\( N = A - Z \\)",
          explanation: "Dacă știi izotopul (A) și numărul atomic (Z), afli rapid numărul de neutroni din nucleu.",
        },
        {
          title: "Moli din masă",
          formula: "\\( n = \\frac{m}{M} \\)",
          explanation: "Masa molară M se ia din tabelul periodic (g/mol). Formula e esențială când treci de la masă la moli (ex: gaze, amestecuri).",
        },
        {
          title: "Masă din moli",
          formula: "\\( m = nM \\)",
          explanation: "Inversul formulei de mai sus: dacă știi molii, obții masa substanței.",
        },
        {
          title: "Numărul de particule",
          formula: "\\( N = nN_A \\)",
          explanation: "Leagă molii de numărul de particule (atomi/molecule). Apare des în probleme de gaz ideal și structură atomică.",
        },
        {
          title: "Constanta lui Avogadro",
          formula: "\\( N_A \\approx 6{,}022\\times 10^{23}\\,\\text{mol}^{-1} \\)",
          explanation: "Numărul de particule dintr-un mol. Folosește-l pentru a trece între scară microscopică și macroscopică.",
        },
        {
          title: "Concentrația molară",
          formula: "\\( c = \\frac{n}{V} \\)",
          explanation: "Concentrația (mol/L sau mol/m³) apare când lucrezi cu soluții sau distribuții de particule într-un volum V.",
        },
      ],
    },
    {
      section: "2. Gazul ideal — Legile gazelor",
      formulas: [
        {
          title: "Ecuația de stare",
          formula: "\\( p \\cdot V = \\nu \\cdot R \\cdot T \\) (R = 8,314 J/mol·K)",
          explanation: "Ecuația principală pentru gaz ideal. ν = numărul de moli. Cu ea calculezi p, V sau T când știi celelalte. R e o constantă, o folosești direct.",
        },
        { 
          title: "Relația generală pentru două stări",
          formula: "\\( \\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2} \\)",
          explanation: "Dacă știi p, V și T într-o stare, poți calcula oricare mărime în cealaltă stare. Toate temperaturile în Kelvin!",
        },
        {
          title: "Izoterm (T constant): p și V",
          formula: "\\( p \\cdot V = const. \\) → \\( p_1 V_1 = p_2 V_2 \\)",
          explanation: "Când temperatura rămâne constantă: dacă comprimi gazul (V scade), presiunea crește. Și invers. Exemplu: seringa cu dop închis.",
        },
        {
          title: "Izobar (p constant): V și T",
          formula: "\\( \\frac{V}{T} = const. \\) → \\( \\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\)",
          explanation: "Când presiunea rămâne constantă: gazul se dilată la încălzire. Cu cât e mai cald, cu atât ocupă mai mult spațiu. T trebuie în Kelvin!",
        },
        {
          title: "Izocor (V constant): p și T",
          formula: "\\( \\frac{p}{T} = const. \\) → \\( \\frac{p_1}{T_1} = \\frac{p_2}{T_2} \\)",
          explanation: "Când volumul rămâne constant: la încălzire, presiunea crește. Exemplu: butelie de gaz sau anvelopă de mașină la soare.",
        },
      ],
    },
    {
      section: "3. Principiul I al termodinamicii",
      formulas: [
        {
          title: "Legea conservării energiei",
          formula: "\\( \\Delta U = Q + L \\)",
          explanation: "Energia internă se schimbă când gazul primește sau cedează căldură (Q) și când face sau primește lucru mecanic (L). Q > 0 = primește căldură, L > 0 = e comprimat (primește lucru).",
        },
        {
          title: "Energia internă",
          formula: "\\( U = \\nu \\cdot C_v \\cdot T \\)",
          explanation: "Energia internă a gazului depinde doar de temperatură. Cv e o constantă care depinde de tipul de gaz (e dată în probleme).",
        },
        {
          title: "Variația energiei interne",
          formula: "\\( \\Delta U = \\nu \\cdot C_v \\cdot \\Delta T \\)",
          explanation: "Cât s-a schimbat energia internă? Depinde doar de cât s-a schimbat temperatura, nu de drumul parcurs. Folosești la orice proces.",
        },
      ],
    },
    {
      section: "4. Procese termodinamice",
      formulas: [
        {
          title: "Izocor — Lucrul mecanic",
          formula: "\\( L = 0 \\)",
          explanation: "La volum constant gazul nu face lucru (nu se mișcă nimic). Toată căldura primită duce la creșterea temperaturii.",
        },
        {
          title: "Izocor — Căldura și energia",
          formula: "\\( \\Delta U = Q = \\nu \\cdot C_v \\cdot \\Delta T \\)",
          explanation: "În izocor, căldura = variația energiei interne (pentru că L = 0). Câtă căldură primește, atât crește U.",
        },
        {
          title: "Izobar — Lucrul mecanic",
          formula: "\\( L = p \\cdot \\Delta V = \\nu \\cdot R \\cdot \\Delta T \\)",
          explanation: "La presiune constantă, gazul poate face lucru când se dilată. O parte din căldură devine lucru, restul mărește temperatura.",
        },
        {
          title: "Izobar — Căldura",
          formula: "\\( Q = \\nu \\cdot C_p \\cdot \\Delta T \\)",
          explanation: "Căldura la presiune constantă. Cp e puțin mai mare decât Cv (Cp = Cv + R). E dat în tabele.",
        },
        {
          title: "Izoterm — Lucrul mecanic",
          formula: "\\( L = \\nu \\cdot R \\cdot T \\cdot \\ln\\frac{V_2}{V_1} \\)",
          explanation: "Lucrul când gazul se destinde sau se comprimă la T constant. ln = logaritm natural. La comprimare (V₂ < V₁) lucrul e negativ.",
        },
        {
          title: "Izoterm — Energia și căldura",
          formula: "\\( \\Delta U = 0 \\) → \\( Q = L \\)",
          explanation: "La temperatură constantă energia internă nu se schimbă. Toată căldura primită se transformă în lucru (sau invers la comprimare).",
        },
        {
          title: "Adiabatic — Energia",
          formula: "\\( \\Delta U = -L \\)",
          explanation: "Adiabatic = fără schimb de căldură cu exteriorul. Orice lucru făcut de gaz vine din energia lui internă. La comprimare adiabatică, gazul se încălzește!",
        },
        {
          title: "Adiabatic — Relația p–V",
          formula: "\\( p \\cdot V^{\\gamma} = const. \\) (γ = Cp/Cv)",
          explanation: "În adiabatică, p și V sunt legate prin această formulă. γ ≈ 1,4 pentru aer. Folosești când știi p și V într-o stare și vrei să afli în alta.",
        },
      ],
    },
    {
      section: "5. Principiul II al termodinamicii",
      formulas: [
        {
          title: "Randamentul motorului termic",
          formula: "\\( \\eta = \\frac{L}{Q_1} = 1 - \\frac{Q_2}{Q_1} \\)",
          explanation: "Randamentul = cât din căldura primită (Q₁) s-a transformat în lucru util (L). Q₂ = căldura pierdută. Randamentul e mereu sub 1 (sub 100%).",
        },
        {
          title: "Randamentul maxim (Carnot)",
          formula: "\\( \\eta = 1 - \\frac{T_2}{T_1} \\)",
          explanation: "Randamentul maxim posibil între o sursă caldă (T₁) și una rece (T₂). Niciun motor real nu poate fi mai eficient. Temperaturile în Kelvin!",
        },
        {
          title: "Variația de entropie",
          formula: "\\( \\Delta S = \\frac{Q}{T} \\)",
          explanation: "Entropia măsoară „dezordinea”. Când primești căldură, entropia crește. T trebuie în Kelvin. Se folosește la Principiul II.",
        },
      ],
    },
    {
      section: "6. Căldura și calorimetria",
      formulas: [
        {
          title: "Căldura la încălzire/răcire",
          formula: "\\( Q = m \\cdot c \\cdot \\Delta T \\)",
          explanation: "Câtă căldură trebuie pentru a încălzi o masă m cu ΔT grade? c = căldura specifică (e dată: apa are c ≈ 4200 J/(kg·K)).",
        },
        {
          title: "Echilibrul termic",
          formula: "\\( Q_{cedat} = Q_{primit} \\)",
          explanation: "Când pui un corp cald în contact cu unul rece, căldura cedată de cel cald = căldura primită de cel rece. Până la echilibru, când au aceeași temperatură.",
        },
        {
          title: "Căldura la schimbare de stare",
          formula: "\\( Q = m \\cdot L \\)",
          explanation: "La topire, vaporizare etc. temperatura rămâne constantă, dar trebuie căldură. L = căldura latentă (de topire sau vaporizare), e dată în tabele.",
        },
      ],
    },
    {
      section: "7. Transmiterea căldurii",
      formulas: [
        {
          title: "Conducția termică",
          formula: "\\( \\frac{Q}{t} = \\frac{\\lambda \\cdot A \\cdot \\Delta T}{d} \\)",
          explanation: "Câtă căldură trece prin perete într-o secundă? λ = conductivitatea materialului (metalul conduce bine, lemnul prost), A = aria, d = grosimea.",
        },
        {
          title: "Radiația termică",
          formula: "\\( P = \\sigma \\cdot \\varepsilon \\cdot A \\cdot T^4 \\) (σ = 5,67×10⁻⁸ W/m²K⁴)",
          explanation: "Puterea radiată de un corp (fără contact). Corpurile calde radiază căldură. Cu cât e mai cald, cu atât radiază mult mai mult (T la puterea 4).",
        },
      ],
    },
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
    {
      section: "1. Curentul electric",
      formulas: [
        {
          title: "Intensitatea curentului",
          formula: "\\( I = \\frac{Q}{t} \\) (Q = sarcina, t = timpul)",
          explanation: "Câtă sarcină electrică trece printr-un conductor într-o secundă. I = curentul în Amperi (A), Q în Coulombi (C), t în secunde. Exemplu: becul de 100 W la 220 V are I ≈ 0,45 A.",
        },
        {
          title: "Sarcina electronului",
          formula: "\\( e = 1{,}6 \\times 10^{-19} \\) C",
          explanation: "Sarcina elementară — cea mai mică sarcină liberă din natură. Toate sarcinile sunt multipli de e. Electronul are −e, protonul +e. Folosești la probleme cu număr de electroni.",
        },
      ],
    },
    {
      section: "2. Legea lui Ohm",
      formulas: [
        {
          title: "Legea lui Ohm",
          formula: "\\( U = R \\cdot I \\)",
          explanation: "Tensiunea = rezistența × curentul. Căutați U? Înmulțiți R cu I. Căutați I? Împărțiți U la R. E fundamentală în orice circuit.",
        },
        {
          title: "Rezistența unui conductor",
          formula: "\\( R = \\rho \\cdot \\frac{l}{A} \\)",
          explanation: "Rezistența depinde de material (ρ = rezistivitate), lungime (l) și secțiune (A). Fir mai lung = rezistență mai mare. Fir mai gros = rezistență mai mică. ρ e dat în tabele.",
        },
        {
          title: "Rezistența cu temperatura",
          formula: "\\( R = R_0 \\cdot (1 + \\alpha \\cdot \\Delta T) \\)",
          explanation: "La metale, rezistența crește la încălzire. R₀ = rezistența la temperatura de referință, α = coeficient de temperatură (dat). La cărbune, rezistența scade!",
        },
      ],
    },
    {
      section: "3. Circuite electrice — Rezistoare",
      formulas: [
        {
          title: "Serie — Rezistența echivalentă",
          formula: "\\( R_{ec} = R_1 + R_2 + R_3 + ... \\)",
          explanation: "Rezistoarele în serie se adună. Rezistența totală e mai mare decât oricare. Curentul e același prin toate.",
        },
        {
          title: "Serie — Curentul și tensiunea",
          formula: "\\( I = I_1 = I_2 = I_3 \\) și \\( U = U_1 + U_2 + U_3 \\)",
          explanation: "În serie, curentul e același peste tot. Tensiunea sursei se împarte între rezistoare: U = U₁ + U₂ + U₃.",
        },
        {
          title: "Paralel — Rezistența echivalentă",
          formula: "\\( \\frac{1}{R_{ec}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} \\)",
          explanation: "În paralel, inversul rezistenței totale = suma inverselor. Rezistența totală e mai mică decât oricare!",
        },
        {
          title: "Paralel — Curentul și tensiunea",
          formula: "\\( U = U_1 = U_2 = U_3 \\) și \\( I = I_1 + I_2 + I_3 \\)",
          explanation: "În paralel, tensiunea e aceeași la toate. Curentul total se împarte pe ramuri: I = I₁ + I₂ + I₃.",
        },
      ],
    },
    {
      section: "4. Energia și puterea electrică",
      formulas: [
        {
          title: "Puterea electrică",
          formula: "\\( P = U \\cdot I = R \\cdot I^2 = \\frac{U^2}{R} \\)",
          explanation: "Puterea consumată de un receptor. P = U·I e forma generală. Când știi doar R și I, folosești R·I². Când știi U și R, folosești U²/R. Unitate: Watt (W).",
        },
        {
          title: "Energia electrică consumată",
          formula: "\\( W = P \\cdot t = U \\cdot I \\cdot t \\)",
          explanation: "Energia = puterea × timpul. Cât consumă un bec în 2 ore? W = P·t. Unitate: Jouli (J) sau kWh (1 kWh = 3,6×10⁶ J).",
        },
        {
          title: "Efectul Joule (căldura disipată)",
          formula: "\\( Q = R \\cdot I^2 \\cdot t \\)",
          explanation: "Căldura degajată de un rezistor (ex: încălzitor, bec). Cu cât curentul e mai mare, cu atât se încălzește mai mult. La fel ca W, dar sub formă de căldură.",
        },
      ],
    },
    {
      section: "5. Sursa electrică",
      formulas: [
        {
          title: "Tensiunea electromotoare",
          formula: "\\( \\varepsilon = U + u \\) (u = căderea internă)",
          explanation: "Tensiunea sursei (ε) se împarte: o parte pe circuit (U = tensiune la borne), o parte pe rezistența internă (u).",
        },
        {
          title: "Căderea de tensiune internă",
          formula: "\\( u = r \\cdot I \\)",
          explanation: "r = rezistența internă a sursei. Când curentul e mare, u crește și U la borne scade. Bateria se descarcă când furnizează curent.",
        },
        {
          title: "Tensiunea la borne",
          formula: "\\( U = \\varepsilon - r \\cdot I \\)",
          explanation: "Tensiunea reală pe care o primește circuitul. E mai mică decât ε când e curent. La mers în gol (I = 0): U = ε.",
        },
        {
          title: "Curentul de scurtcircuit",
          formula: "\\( I_{sc} = \\frac{\\varepsilon}{r} \\)",
          explanation: "Când bornele sunt conectate direct (fără rezistență externă). Curent foarte mare! Periculos — nu face asta în practică.",
        },
        {
          title: "Puterea totală și utilă",
          formula: "\\( P_{total} = \\varepsilon \\cdot I \\) și \\( P_{utila} = U \\cdot I \\)",
          explanation: "Puterea totală = ce dă sursa. Puterea utilă = ce primește circuitul. Diferența se pierde în rezistența internă.",
        },
        {
          title: "Randamentul sursei",
          formula: "\\( \\eta = \\frac{P_{utila}}{P_{total}} = \\frac{U}{\\varepsilon} \\)",
          explanation: "Cât din puterea sursei ajunge efectiv la circuit. η = 1 (100%) când r = 0. La baterii reale, η < 1.",
        },
      ],
    },
    {
      section: "6. Legile lui Kirchhoff",
      formulas: [
        {
          title: "Legea I (noduri)",
          formula: "\\( \\Sigma I_{intrat} = \\Sigma I_{iesit} \\)",
          explanation: "Într-un nod, curentul care intră = curentul care iese. Ce intră, iese. Nu se pierde curent în nod.",
        },
        {
          title: "Legea a II-a (ochiuri)",
          formula: "\\( \\Sigma \\varepsilon = \\Sigma R \\cdot I \\)",
          explanation: "Pe un ochi (buclă) închisă: suma tensiunilor surselor = suma căderilor de tensiune pe rezistoare. Atenție la semne (sursa și curentul)!",
        },
      ],
    },
    {
      section: "7. Condensatorul",
      formulas: [
        {
          title: "Capacitatea electrică",
          formula: "\\( C = \\frac{Q}{U} \\) (unitate: Farad, F)",
          explanation: "Câtă sarcină poate stoca condensatorul la o tensiune dată. C mare = multă sarcină. 1 F = 1 C/V.",
        },
        {
          title: "Capacitatea condensatorului plan",
          formula: "\\( C = \\frac{\\varepsilon_0 \\cdot \\varepsilon_r \\cdot A}{d} \\)",
          explanation: "C depinde de aria armăturilor (A), distanța dintre ele (d) și dielectricul (εr). Placă mai mare, mai apropiate = C mai mare.",
        },
        {
          title: "Energia stocată",
          formula: "\\( W = \\frac{1}{2} C \\cdot U^2 = \\frac{Q^2}{2C} \\)",
          explanation: "Energia din condensatorul încărcat. Se folosește la descărcare (flash, defibrilator).",
        },
        {
          title: "Condensatoare în serie",
          formula: "\\( \\frac{1}{C_{ec}} = \\frac{1}{C_1} + \\frac{1}{C_2} \\)",
          explanation: "În serie, capacitatea echivalentă e mai mică decât oricare. Ca inversul rezistențelor în paralel.",
        },
        {
          title: "Condensatoare în paralel",
          formula: "\\( C_{ec} = C_1 + C_2 \\)",
          explanation: "În paralel, capacitățile se adună. Capacitatea totală crește.",
        },
      ],
    },
    {
      section: "8. Câmpul electric",
      formulas: [
        {
          title: "Forța Coulomb",
          formula: "\\( F = k \\cdot \\frac{q_1 \\cdot q_2}{r^2} \\) (k = 9×10⁹ N·m²/C²)",
          explanation: "Forța între două sarcini punctiforme. Sarcinile de același semn se resping, de semne opuse se atrag. r = distanța dintre ele.",
        },
        {
          title: "Intensitatea câmpului electric",
          formula: "\\( E = \\frac{F}{q} = k \\cdot \\frac{Q}{r^2} \\)",
          explanation: "Câmpul creat de o sarcină Q. E spune cât e forța pe unitate de sarcină. Unitate: N/C sau V/m.",
        },
        {
          title: "Tensiunea și câmpul uniform",
          formula: "\\( U = E \\cdot d \\)",
          explanation: "Într-un câmp uniform (ex: între două plăci paralele), tensiunea = câmpul × distanța. d = distanța între puncte.",
        },
        {
          title: "Energia potențială electrică",
          formula: "\\( E_p = q \\cdot U \\)",
          explanation: "Energia unei sarcini q în punctul unde tensiunea e U. Când se mișcă, Ep se transformă în energie cinetică sau invers.",
        },
      ],
    },
    {
      section: "9. Curentul alternativ (AC)",
      formulas: [
        {
          title: "Valoarea efectivă a tensiunii",
          formula: "\\( U_{ef} = \\frac{U_{max}}{\\sqrt{2}} \\)",
          explanation: "Tensiunea efectivă e cea care produce același efect ca în curent continuu. La 220 V efectiv, U_max ≈ 311 V.",
        },
        {
          title: "Valoarea efectivă a curentului",
          formula: "\\( I_{ef} = \\frac{I_{max}}{\\sqrt{2}} \\)",
          explanation: "La fel ca la tensiune. În priză avem 220 V efectiv, 50 Hz. Curentul și tensiunea variază sinusoidal.",
        },
        {
          title: "Tensiunea instantanee",
          formula: "\\( u(t) = U_{max}\\sin(\\omega t) \\)",
          explanation: "Modelul tipic pentru o tensiune alternativă sinusoidală. U_max este amplitudinea, iar ω = 2πf este pulsația.",
        },
        {
          title: "Curentul instantaneu (defazaj)",
          formula: "\\( i(t) = I_{max}\\sin(\\omega t + \\varphi) \\)",
          explanation: "În circuite cu bobine/condensatoare, curentul poate fi defazat cu φ față de tensiune (nu sunt în fază).",
        },
        {
          title: "Pulsația",
          formula: "\\( \\omega = 2\\pi f \\)",
          explanation: "Leagă frecvența (Hz) de pulsație (rad/s). În România, f = 50 Hz ⇒ ω ≈ 314 rad/s.",
        },
        {
          title: "Puterea în curent alternativ",
          formula: "\\( P = U_{ef} \\cdot I_{ef} \\cdot \\cos\\varphi \\)",
          explanation: "cos φ = factorul de putere. La rezistor pur, cos φ = 1. La motoare, cos φ < 1 (există putere reactivă).",
        },
        {
          title: "Frecvența în România",
          formula: "\\( f = 50 \\) Hz, \\( T = 0{,}02 \\) s",
          explanation: "Tensiunea din priză oscilează cu 50 Hz. Perioada T = 1/f = 0,02 s. O dată la 0,02 s se repetă ciclul.",
        },
      ],
    },
    {
      section: "10. Circuite RLC",
      formulas: [
        {
          title: "Reactanța inductivă",
          formula: "\\( X_L = \\omega \\cdot L = 2\\pi f \\cdot L \\)",
          explanation: "Rezistența aparentă a bobinei la curent alternativ. Cu cât frecvența e mai mare, cu atât X_L e mai mare. L = inductanța (Henry).",
        },
        {
          title: "Reactanța capacitivă",
          formula: "\\( X_C = \\frac{1}{\\omega \\cdot C} \\)",
          explanation: "Rezistența aparentă a condensatorului la AC. Cu cât frecvența e mai mare, cu atât X_C e mai mic. Opus față de bobină.",
        },
        {
          title: "Impedanța",
          formula: "\\( Z = \\sqrt{R^2 + (X_L - X_C)^2} \\)",
          explanation: "Rezistența totală a circuitului RLC. Combină R, X_L și X_C. Când X_L = X_C, Z = R (rezonanță).",
        },
        {
          title: "Legea lui Ohm pentru AC",
          formula: "\\( I = \\frac{U}{Z} \\)",
          explanation: "La fel ca în curent continuu, dar cu Z în loc de R. I și U sunt valori efective.",
        },
        {
          title: "Frecvența de rezonanță",
          formula: "\\( f_0 = \\frac{1}{2\\pi \\sqrt{L \\cdot C}} \\)",
          explanation: "La această frecvență, X_L = X_C și Z = R (minim). Circuitul rezonează, curentul e maxim.",
        },
      ],
    },
  ];

  const opticaFormulas = [
    {
      section: "1. Reflexia luminii",
      formulas: [
        {
          title: "Legea reflexiei",
          formula: "\\( i = r \\) (unghi de incidență = unghi de reflexie)",
          explanation: "Raza incidentă și cea reflectată fac același unghi cu normala la suprafață. Simplu: cum intră, așa iese. Oglinda reflectă simetric.",
        },
        {
          title: "Oglinda plană",
          formula: "\\( d_i = d_o \\)",
          explanation: "Imaginea e la aceeași distanță de oglindă ca obiectul. Dacă stai la 1 m de oglindă, imaginea ta e la 1 m în spatele ei. Imagine virtuală, simetrică.",
        },
      ],
    },
    {
      section: "2. Refracția luminii",
      formulas: [
        {
          title: "Legea refracției",
          formula: "\\( n_1 \\cdot \\sin(i) = n_2 \\cdot \\sin(r) \\)",
          explanation: "Când lumina trece dintr-un mediu în altul (ex: aer în apă), raza se frânge. n₁, n₂ = indici de refracție. Cu n mai mare, unghiul e mai mic.",
        },
        {
          title: "Indicele de refracție",
          formula: "\\( n = \\frac{c}{v} \\) (c = 3×10⁸ m/s)",
          explanation: "n spune de câte ori e mai lentă lumina în mediu decât în vid. Aer: n ≈ 1. Apă: n ≈ 1,33. Sticlă: n ≈ 1,5. Cu n mai mare, lumina e mai lentă.",
        },
        {
          title: "Unghiul limită (reflexie totală)",
          formula: "\\( \\sin(i_{lim}) = \\frac{n_2}{n_1} \\) (când n₁ > n₂)",
          explanation: "Când lumina vine din mediu cu n mai mare (ex: apă) spre unul cu n mai mic (aer), există un unghi peste care nu mai există refracție, doar reflexie. Folosit la fibre optice.",
        },
      ],
    },
    {
      section: "3. Oglinzi sferice",
      formulas: [
        {
          title: "Ecuația oglinzii",
          formula: "\\( \\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\)",
          explanation: "Leagă distanța focală (f), distanța obiectului (d_o) și a imaginii (d_i). La oglindă concavă poți obține imagini reale sau virtuale, în funcție de poziția obiectului.",
        },
        {
          title: "Distanța focală",
          formula: "\\( f = \\frac{R}{2} \\) (R = raza de curbură)",
          explanation: "Focarul e la jumătatea razei. Oglindă cu R = 20 cm are f = 10 cm. f > 0 = oglindă concavă, f < 0 = oglindă convexă.",
        },
        {
          title: "Mărirea liniară",
          formula: "\\( m = -\\frac{d_i}{d_o} \\)",
          explanation: "Cât de mare e imaginea față de obiect. m negativ = imagine răsturnată. m pozitiv = imagine dreaptă. |m| > 1 = imagine mărită.",
        },
        {
          title: "Convenții de semn (oglinzi)",
          formula: "d_o > 0 obiect real; d_i > 0 imagine reală; d_i < 0 imagine virtuală; f > 0 concavă, f < 0 convexă",
          explanation: "d_o mereu pozitiv (obiectul e real). d_i > 0 când imaginea e în fața oglinzii (concavă), d_i < 0 când e în spate (virtuală). Convexă are f negativ.",
        },
      ],
    },
    {
      section: "4. Lentile subțiri",
      formulas: [
        {
          title: "Ecuația lentilei (Gauss)",
          formula: "\\( \\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\)",
          explanation: "La fel ca la oglinzi, dar convențiile sunt diferite. f > 0 = lentilă convergentă (convexă), f < 0 = divergentă (concavă).",
        },
        {
          title: "Vergența (puterea optică)",
          formula: "\\( D = \\frac{1}{f} \\) (dioptrii, δ)",
          explanation: "Puterea lentilei în dioptrii. Lentilă de 2 δ are f = 0,5 m = 50 cm. Cu cât D e mai mare, cu atât lentila e mai puternică.",
        },
        {
          title: "Mărirea liniară",
          formula: "\\( m = \\frac{d_i}{d_o} \\)",
          explanation: "La lentile, m = d_i/d_o (fără minus, spre deosebire de oglinzi). m > 0 = imagine dreaptă, m < 0 = imagine răsturnată.",
        },
        {
          title: "Formula lentilei subțiri",
          formula: "\\( \\frac{1}{f} = (n-1) \\cdot \\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\)",
          explanation: "Legătura între f, indicele n al sticlei și razele de curbură R₁, R₂. Lentilă convergentă: R₁ și R₂ au semne potrivite.",
        },
        {
          title: "Convenții de semn (lentile)",
          formula: "f > 0 convergentă; f < 0 divergentă; d_i > 0 imagine reală; d_i < 0 imagine virtuală",
          explanation: "Imagine reală = de cealaltă parte a lentilei față de obiect (poate fi prinsă pe ecran). Imagine virtuală = de aceeași parte, nu poate fi prinsă.",
        },
        {
          title: "Lentile în contact",
          formula: "\\( D_{ec} = D_1 + D_2 \\)",
          explanation: "Două lentile lipite au vergența totală = suma vergențelor. Două lentile de +2 δ și +3 δ dau +5 δ.",
        },
      ],
    },
    {
      section: "5. Ochiul uman și defecte de vedere",
      formulas: [
        {
          title: "Ochiul normal",
          formula: "Vede clar între 10 cm (proxim) și infinit (remotum)",
          explanation: "Ochiul sănătos poate focaliza de la 10 cm până la infinit. Sub 10 cm nu mai vedem clar.",
        },
        {
          title: "Miopie",
          formula: "Corecție cu lentilă divergentă (f < 0)",
          explanation: "Miopul vede bine aproape, dar nu departe. Focalul e prea aproape. Ochelarii cu lentile concave (divergente) îndepărtează imaginea.",
        },
        {
          title: "Hipermetropie",
          formula: "Corecție cu lentilă convergentă (f > 0)",
          explanation: "Hipermetropul vede bine departe, dar nu aproape. Ochelarii cu lentile convexe (convergente) aduc imaginea mai aproape.",
        },
        {
          title: "Puterea de corecție",
          formula: "\\( D_{corectie} = \\frac{1}{d_{remotum}} \\) (în metri, cu semn)",
          explanation: "Pentru miopie: D negativ, d_remotum = distanța maximă la care vede clar (în m). Pentru hipermetropie: D pozitiv.",
        },
      ],
    },
    {
      section: "6. Instrumente optice",
      formulas: [
        {
          title: "Mărirea microscopului",
          formula: "\\( M = m_{ob} \\cdot m_{oc} \\)",
          explanation: "Mărirea totală = mărirea obiectivului × mărirea ocularului. Microscopul are două lentile: obiectiv (aproape de obiect) și ocular (aproape de ochi).",
        },
        {
          title: "Mărirea lupei",
          formula: "\\( M = \\frac{25 \\ \\text{cm}}{f} \\)",
          explanation: "25 cm = distanța de vedere clară convențională. Lupă cu f = 5 cm mărește de 5 ori. Cu cât f e mai mic, cu atât mărirea e mai mare.",
        },
        {
          title: "Mărirea lunetei/telescopului",
          formula: "\\( M = \\frac{f_{ob}}{f_{oc}} \\)",
          explanation: "Mărirea = raportul focalelor. Obiectivul are f mare (captează multă lumină), ocularul f mic. Telescop bun: f_ob mare, f_oc mic.",
        },
      ],
    },
    {
      section: "7. Dispersia luminii",
      formulas: [
        {
          title: "Spectrul vizibil",
          formula: "ROGVAIV (roșu, oranj, galben, verde, albastru, indigo, violet)",
          explanation: "Lumina albă (soare) conține toate culorile. Prisma le descompune: fiecare culoare are n diferit și se frânge diferit.",
        },
        {
          title: "Indicele depinde de λ",
          formula: "\\( n = n(\\lambda) \\)",
          explanation: "n e mai mare pentru violet (λ mic) și mai mic pentru roșu (λ mare). Violetul se refractă mai mult, roșul mai puțin. De aia curcubeul.",
        },
      ],
    },
    {
      section: "8. Interferența luminii",
      formulas: [
        {
          title: "Maxim (franje luminoase)",
          formula: "\\( \\Delta = k \\cdot \\lambda \\) (k = 0, ±1, ±2, ...)",
          explanation: "Când diferența de drum (Δ) e multiplu de λ, undele se întăresc = franjă luminoasă. k = ordinul maximului.",
        },
        {
          title: "Minim (franje întunecate)",
          formula: "\\( \\Delta = (2k+1) \\cdot \\frac{\\lambda}{2} \\)",
          explanation: "Când Δ e multiplu impar de λ/2, undele se anulează = franjă întunecată.",
        },
        {
          title: "Distanța dintre franje (Young)",
          formula: "\\( \\Delta y = \\frac{\\lambda \\cdot L}{d} \\)",
          explanation: "L = distanța până la ecran, d = distanța dintre cele două fante. Cu λ mai mare sau L mai mare, franjele sunt mai depărtate.",
        },
      ],
    },
    {
      section: "9. Difracția luminii",
      formulas: [
        {
          title: "Minim la fantă simplă",
          formula: "\\( a \\cdot \\sin(\\theta) = k \\cdot \\lambda \\)",
          explanation: "a = lățimea fantei. Lumina se împrăștie când trece printr-o fantă îngustă. Primele minime la k = ±1.",
        },
        {
          title: "Rețea de difracție — maxim",
          formula: "\\( d \\cdot \\sin(\\theta) = k \\cdot \\lambda \\) (d = pasul rețelei)",
          explanation: "Rețeaua are multe fante paralele la distanța d. Maximele sunt foarte ascuțite. Folosită la spectroscop pentru a separa culorile.",
        },
      ],
    },
    {
      section: "10. Efectul fotoelectric",
      formulas: [
        {
          title: "Energia fotonului",
          formula: "\\( E = h \\cdot f = \\frac{h \\cdot c}{\\lambda} \\) (h = 6,626×10⁻³⁴ J·s)",
          explanation: "Lumina e formată din fotoni. Fiecare foton are energia h·f. Cu frecvența mai mare (λ mai mic), fotonul e mai energic.",
        },
        {
          title: "Ecuația lui Einstein",
          formula: "\\( E_k = h \\cdot f - L \\) (L = lucrul de extracție)",
          explanation: "Energia cinetică a electronului extras = energia fotonului minus lucrul de extracție (energia minimă pentru a scoate electronul).",
        },
        {
          title: "Pragul fotoelectric",
          formula: "\\( f_{min} = \\frac{L}{h} \\)",
          explanation: "Frecvența minimă pentru care apare efect fotoelectric. Sub f_min, chiar dacă lumina e puternică, nu ies electroni. E o problemă de energie, nu de intensitate.",
        },
      ],
    },
    {
      section: "11. Laser",
      formulas: [
        {
          title: "Relația undă–frecvență",
          formula: "\\( c = \\lambda f \\)",
          explanation: "Leagă lungimea de undă și frecvența. Pentru lumină în vid, c ≈ 3×10⁸ m/s. Laserul e aproape monocromatic (λ bine definit).",
        },
        {
          title: "Energia fotonului",
          formula: "\\( E = hf = \\frac{hc}{\\lambda} \\)",
          explanation: "Energia fotonilor crește când frecvența crește (λ scade). UV are fotoni mai energetici decât IR.",
        },
        {
          title: "Impulsul fotonului",
          formula: "\\( p = \\frac{h}{\\lambda} \\)",
          explanation: "Chiar și lumina transportă impuls; apare în presiunea de radiație și în aplicații de optică cu laser (trapping).",
        },
        {
          title: "Intensitatea",
          formula: "\\( I = \\frac{P}{A} \\)",
          explanation: "Laserul poate concentra puterea pe o arie mică, crescând intensitatea (W/m²).",
        },
        {
          title: "Legea inversului pătrat",
          formula: "\\( I(r) = \\frac{P}{4\\pi r^2} \\)",
          explanation: "Valabilă pentru surse care radiază aproximativ sferic. Pentru fascicule colimate (laser) scăderea cu r poate fi mult mai lentă.",
        },
        {
          title: "Divergență (aprox. gaussian)",
          formula: "\\( \\theta \\approx \\frac{\\lambda}{\\pi w_0} \\)",
          explanation: "Limita de difracție: cu cât fasciculul e mai îngust (w₀ mic), cu atât divergența crește.",
        },
        {
          title: "Distanța Rayleigh",
          formula: "\\( z_R = \\frac{\\pi w_0^2}{\\lambda} \\)",
          explanation: "Până la zR fasciculul rămâne relativ colimat; după aceea începe să se lărgească vizibil.",
        },
      ],
    },
    {
      section: "12. Spectrul electromagnetic",
      formulas: [
        {
          title: "Relația undă–frecvență",
          formula: "\\( c = \\lambda f \\)",
          explanation: "Aceeași relație pentru toate undele electromagnetice (radio → gamma). Schimbă doar f și λ.",
        },
        {
          title: "Energia fotonului",
          formula: "\\( E = hf \\)",
          explanation: "Fotonii de raze X și gamma au energii mult mai mari decât cei din vizibil.",
        },
        {
          title: "Impulsul fotonului",
          formula: "\\( p = \\frac{h}{\\lambda} \\)",
          explanation: "Când λ scade (f crește), impulsul fotonului crește.",
        },
        {
          title: "Legea Wien",
          formula: "\\( \\lambda_{max}T = b \\)",
          explanation: "Maximul spectrului de radiație al unui corp depinde de temperatură. T mai mare ⇒ λ_max mai mică (mai „albastru”).",
        },
        {
          title: "Stefan–Boltzmann",
          formula: "\\( P = \\sigma\\varepsilon AT^4 \\)",
          explanation: "Puterea radiată crește foarte repede cu temperatura (T⁴). Explică de ce corpurile foarte fierbinți radiază intens.",
        },
        {
          title: "Legea inversului pătrat",
          formula: "\\( I(r) = \\frac{P}{4\\pi r^2} \\)",
          explanation: "Intensitatea scade cu pătratul distanței pentru o sursă punctuală (ex: antenă isotropă ideală).",
        },
      ],
    },
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
    { title: "Gravitație universală", formula: "\\( F_G = G \\frac{Mm}{r^2} \\)" },
    { title: "Michelson – timp braț paralel (aprox.)", formula: "\\( t_{\\parallel} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{c^2}\\right) \\)" },
    { title: "Michelson – timp braț perpendicular (aprox.)", formula: "\\( t_{\\perp} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{2c^2}\\right) \\)" },
    { title: "Michelson – diferență de timp așteptată (eter)", formula: "\\( \\Delta t \\approx \\frac{Lv^2}{c^3} \\)" },
  ];

  const atomulFormulas = [
    { title: "Energie nivel Bohr (hidrogen)", formula: "\\( E_n = - \\frac{13{,}6\\ \\text{eV}}{n^2} \\)" },
    { title: "Formula lui Rydberg", formula: "\\( \\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n^2} - \\frac{1}{m^2} \\right) \\)" },
    { title: "Foton – legătura energie–frecvență", formula: "\\( E = h\\nu = \\frac{hc}{\\lambda} \\)" },
    { title: "Longitudine de undă de Broglie", formula: "\\( \\lambda = \\frac{h}{p} \\)" },
    { title: "Principiul incertitudinii Heisenberg", formula: "\\( \\Delta x \\, \\Delta p \\gtrsim \\frac{\\hbar}{2} \\)" },
    ...tabelPeriodicFormulas.map(({ title, formula }) => ({ title, formula })),
  ];

  const fizicaCuanticaFormulas = [
    {
      section: "1. Dublă fantă și interferență",
      formulas: [
        {
          title: "Diferența de drum și maxime",
          formula:
            "\\( \\Delta L = d\\sin\\theta \\approx m\\lambda \\) — interferență constructivă (ordin \\(m\\))",
          explanation:
            "Pentru două fante la distanța d, diferența de drum spre un punct de pe ecran depinde de unghiul față de axa de simetrie. Maximele de intensitate apar când această diferență este un multiplu întreg al lungimii de undă.",
        },
        {
          title: "Distanța între franje (Young, unghi mic)",
          formula: "\\( \\Delta y \\approx \\frac{\\lambda L}{d} \\)",
          explanation:
            "Pe un ecran la distanța L de fante, distanța aproximativă între două maxime folosește aproximația unghiurilor mici pentru sin și tang.",
        },
        {
          title: "Superpoziția amplitudinilor",
          formula: "\\( \\psi = \\psi_1 + \\psi_2 \\)",
          explanation:
            "În descrierea cuantică liniară, amplitudinea înainte de măsurare este suma contribuțiilor asociate celor două căi. Faza relativă decide dacă undele se întăresc sau se slăbesc.",
        },
        {
          title: "Regula Born (probabilitate)",
          formula: "\\( P \\propto |\\psi|^2 \\)",
          explanation:
            "Probabilitatea de a detecta particula într-o zonă este proporțională cu pătratul modulului funcției de undă în acea zonă.",
        },
      ],
    },
    {
      section: "2. Tunelare prin barieră",
      formulas: [
        {
          title: "Schrödinger staționar 1D",
          formula: "\\( -\\dfrac{\\hbar^2}{2m} \\dfrac{d^2\\psi}{dx^2} + V(x)\\psi = E\\psi \\)",
          explanation:
            "Ecuația pentru stări cu energie E bine definită. În fiecare zonă unde potențialul V este constant, soluția este combinație de exponențiale reale sau complexe, după cum energia este mai mare sau mai mică decât V.",
        },
        {
          title: "Parametri k și κ (barieră, E sub V₀)",
          formula:
            "\\( k = \\dfrac{\\sqrt{2mE}}{\\hbar}, \\quad \\kappa = \\dfrac{\\sqrt{2m(V_0-E)}}{\\hbar} \\)",
          explanation:
            "k descrie oscilația spațială în zona permisă clasic; κ măsoară cât de repede scade modulul undei în interiorul barierei (regiune interzisă clasic).",
        },
        {
          title: "Transmisie (comportare tipică, barieră groasă)",
          formula: "\\( T \\sim e^{-2\\kappa a} \\)",
          explanation:
            "Pentru o barieră de lățime a, probabilitatea de tunelare scade exponențial cu produsul κ·a. Factorii din față depind de modelul exact al barierei.",
        },
        {
          title: "Principiul incertitudinii energie–timp",
          formula: "\\( \\Delta E\\,\\Delta t \\gtrsim \\dfrac{\\hbar}{2} \\)",
          explanation:
            "Stări cu durată de viață finită (de exemplu tunelarea dintr-un nivel meta-stabil) au o lățime în energie legată de timpul caracteristic al procesului.",
        },
      ],
    },
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
        "atomul",
        "fizica_cuantica",
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

  // Închide popup formula la Escape, blochează scroll pe body
  useEffect(() => {
    if (!formulaPopup) return;
    const handleEscape = (e) => e.key === "Escape" && setFormulaPopup(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [formulaPopup]);

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
      atomul: atomulFormulas,
      fizica_cuantica: fizicaCuanticaFormulas,
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
      {formulaPopup && (
        <div className="formula-popup-overlay" onClick={() => setFormulaPopup(null)}>
          <div className="formula-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="formula-popup-header">
              <div className="formula-popup-header-left">
                <h2 className="formula-popup-title">{formulaPopup.title}</h2>
                <span className="formula-popup-section">{formulaPopup.section}</span>
              </div>
              <button type="button" className="formula-popup-close" onClick={() => setFormulaPopup(null)} aria-label="Închide">×</button>
            </div>
            <div className="formula-popup-body">
              <div className="formula-popup-formula">{formulaPopup.formula}</div>
              <p className="formula-popup-explanation">{formulaPopup.explanation}</p>
              <button
                type="button"
                className="formula-popup-ai-btn"
                onClick={() => {
                  const msg = `Explică-mi în detaliu formula „${formulaPopup.title}" din ${formulaPopup.section}. Vreau să înțeleg când și cum se aplică, cu exemple.`;
                  setFormulaPopup(null);
                  if (assistant?.openWithMessage) {
                    assistant.openWithMessage(msg);
                  }
                }}
              >
                Întreabă Profesorul Whiz
              </button>
            </div>
            <MathJaxRender key={`popup-${formulaPopup.title}`} />
          </div>
        </div>
      )}
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
                  <TabsList className="mb-4 flex flex-wrap gap-1">
                    <TabsTrigger value="mecanica">Mecanică</TabsTrigger>
                    <TabsTrigger value="termodinamica">Termodinamică</TabsTrigger>
                    <TabsTrigger value="pendule">Oscilații</TabsTrigger>
                    <TabsTrigger value="unde">Unde</TabsTrigger>
                    <TabsTrigger value="lissajous">Lissajous</TabsTrigger>
                    <TabsTrigger value="seism">Seisme</TabsTrigger>
                    <TabsTrigger value="optica">Optică</TabsTrigger>
                    <TabsTrigger value="prisma">Refracție</TabsTrigger>
                    <TabsTrigger value="electricitate">Electricitate</TabsTrigger>
                    <TabsTrigger value="matematica">Matematică</TabsTrigger>
                    <TabsTrigger value="astronomie">Astronomie</TabsTrigger>
                    <TabsTrigger value="atomul">Atomul</TabsTrigger>
                    <TabsTrigger value="fizica_cuantica">Fizică cuantică</TabsTrigger>
                    <TabsTrigger value="relativitate">Relativitate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="mecanica">
                    <p className="text-sm text-muted-foreground mb-4">Apasă pe o formulă pentru explicație detaliată.</p>
                    <div className="mb-4 space-y-6">
                      {mecanicaFormulas.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="mecanica" />
                  </TabsContent>

                  <TabsContent value="termodinamica">
                    <p className="text-sm text-muted-foreground mb-4">Apasă pe o formulă pentru explicație detaliată.</p>
                    <div className="mb-4 space-y-6">
                      {termodinamicaFormulas.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="termodinamica" />
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
                    <p className="text-sm text-muted-foreground mb-4">Apasă pe o formulă pentru explicație detaliată.</p>
                    <div className="mb-4 space-y-6">
                      {electricitateFormulas.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="electricitate" />
                  </TabsContent>

                  <TabsContent value="optica">
                    <p className="text-sm text-muted-foreground mb-4">Apasă pe o formulă pentru explicație detaliată.</p>
                    <div className="mb-4 space-y-6">
                      {opticaFormulas.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) => e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="optica" />
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

                  <TabsContent value="atomul">
                    <p className="text-sm text-muted-foreground mb-4">
                      Atom, spectru și tabel periodic — aliniat lecției „Atomul” și simulărilor din aceeași categorie.
                    </p>
                    <div className="formula-grid mb-4">
                      {atomulFormulas
                        .slice(0, visibleFormulasCount.atomul || 5)
                        .map((formula, index) => (
                        <div key={index} className="formula-card">
                          <div className="font-semibold mb-2">{formula.title}</div>
                          <div className="text-lg font-mono">
                            {formula.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key={`atomul-${visibleFormulasCount.atomul || 0}`} />
                  </TabsContent>

                  <TabsContent value="fizica_cuantica">
                    <p className="text-sm text-muted-foreground mb-4">
                      Dublă fantă și tunelare — aliniat lecției „Fizică cuantică” și simulărilor din aceeași categorie. Apasă pe o formulă pentru explicație.
                    </p>
                    <div className="mb-4 space-y-6">
                      {fizicaCuanticaFormulas.map((sec, secIndex) => (
                        <div key={secIndex}>
                          <h3 className="text-lg font-semibold mb-3 text-foreground/90">{sec.section}</h3>
                          <div className="formula-grid">
                            {sec.formulas.map((formula, index) => (
                              <div
                                key={index}
                                className="formula-card formula-card-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => formula.explanation && setFormulaPopup({ section: sec.section, ...formula })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && formula.explanation && setFormulaPopup({ section: sec.section, ...formula })
                                }
                              >
                                <div className="font-semibold mb-2">{formula.title}</div>
                                <div className="text-lg font-mono">{formula.formula}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MathJaxRender key="fizica_cuantica" />
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
