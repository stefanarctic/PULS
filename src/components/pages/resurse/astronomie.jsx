import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import constelatiiImg from "/res/screenshots/Constelatii_Screenshot.png";
import legiKeplerImg from "/res/screenshots/Legi_Kepler_Screenshot.png";
import miscarePlaneteImg from "/res/screenshots/Miscare_Planete_Screenshot.png";
import michaelsonMorleyImg from "/res/screenshots/Michaelson_Morley_Screenshot.png";

const AstronomiePage = () => {
  return (
    <Layout>
      <SEO
        title="Astronomie | Constelații, Kepler, mișcarea planetelor, Michelson–Morley - PULS"
        description="Constelații și coordonate pe cer, legile lui Kepler, mișcarea planetelor și experimentul Michelson–Morley: lecție, formule și simulări."
        keywords="astronomie, constelații, legile lui Kepler, Michelson-Morley, orbite, mișcare planetară, stele, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Astronomie</h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Mai jos începem cu cerul nopții: cum se numesc grupurile de stele (constelații), cum te poți orienta și cum descriu
                astronomii poziția unei stele pe sfera cerească. Apoi trecem la mișcarea planetelor, Johannes Kepler a formulat,
                la începutul secolului XVII, trei legi pentru orbitele eliptice în jurul Soarelui; astăzi le legăm de gravitație
                newtoniană și, pentru detalii fine, de relativitatea generală.
              </p>
              <p className="text-lg text-muted-foreground">
                La final, experimentul Michelson–Morley arată de ce viteza luminii în vid nu depinde de „vântul de eter”, o etapă
                esențială spre relativitatea restrânsă, relevantă și pentru măsurători astronomice cu interferometrie.
              </p>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Constelații pe cer</h2>
                <p className="text-muted-foreground mb-4">
                  Constelațiile sunt regiuni și pattern-uri de stele recunoscute de multe culturi; astronomia modernă folosește 88 de
                  constelații oficiale. Pe hartă, stelele au poziții date de{" "}
                  <strong>ascensiunea rectă</strong> {"\\(\\alpha\\)"} <MathJaxRender /> (ca „longitudinea” pe ecuatorul ceresc, măsurată
                  în ore, minute, secunde) și <strong>declinația</strong> {"\\(\\delta\\)"} <MathJaxRender /> (unghi față de ecuatorul
                  ceresc, ca latitudinea). Simulatorul îți permite să explorezi cerul, legende scurte și indicii practice de orientare
                  (de ex. spre Steaua polară).
                </p>
                <p className="text-muted-foreground mb-6">
                  Important: zodiacul „tropical” din horoscop nu coincide cu constelațiile de pe harta astronomilor, Pământul,
                  axa sa și orbita își schimbă încet orientarea față de fundalul de stele. În simulare vezi cerul ca pe o hartă
                  astronomică, nu ca predicții astrologice.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={constelatiiImg}
                    alt="Screenshot simulator constelații"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">Formule utile (cer, stele, distanțe)</h3>

                <h4 className="text-lg font-semibold mb-2">1. Distanță unghiulară între două direcții pe sferă</h4>
                <p className="text-muted-foreground mb-3">
                  Pentru două puncte cu coordonate ecuatoriale {"\\((\\alpha_1,\\delta_1)\\)"} <MathJaxRender /> și{" "}
                  {"\\((\\alpha_2,\\delta_2)\\)"} <MathJaxRender />, unghiul {"\\(\\theta\\)"} <MathJaxRender /> dintre ele satisface:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\cos\\theta = \\sin\\delta_1\\sin\\delta_2 + \\cos\\delta_1\\cos\\delta_2\\cos(\\alpha_1-\\alpha_2) \\)"}
                  <MathJaxRender />
                </div>

                <h4 className="text-lg font-semibold mb-2">2. Scala magnitudinilor aparente (Pogson)</h4>
                <p className="text-muted-foreground mb-3">
                  Cu cât magnitudinea {"\\(m\\)"} <MathJaxRender /> e mai mică numeric, cu atât obiectul pare mai strălucitor. O
                  diferență de o magnitudine corespunde unui raport al fluxurilor {"\\(\\approx 2{,}512\\)"} <MathJaxRender />:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( m_1 - m_2 = -2{,}5\\,\\log_{10}\\!\\left(\\frac{F_1}{F_2}\\right) \\)"}
                  <MathJaxRender />
                </div>

                <h4 className="text-lg font-semibold mb-2">3. Parsec din paralaxă</h4>
                <p className="text-muted-foreground mb-3">
                  Paralaxa {"\\(p\\)"} <MathJaxRender /> (în secunde unghiulare) măsoară „săgeata” poziției unei stele văzute din
                  poziții diferite pe orbita Pământului. Distanța în parseci:
                </p>
                <div className="formula-resurse text-lg font-mono mb-6">
                  {"\\( d\\,[\\mathrm{pc}] = \\dfrac{1}{p\\,[\\mathrm{arcsec}]} \\)"}
                  <MathJaxRender />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-sm text-muted-foreground max-w-prose">
                    În <strong>Resurse → Formule → Astronomie</strong> găsești aceleași relații alături de legile lui Kepler și
                    Michelson–Morley, ca să exersezi într-un singur loc.
                  </p>
                  <a href="/simulare/constelatii" rel="noopener noreferrer" className="resurse-link shrink-0">
                    <Button size="lg">Simulare: constelații</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Cele trei legi ale lui Kepler</h2>
                <p className="text-muted-foreground mb-6">
                  Simularea permite vizualizarea orbitei eliptice, a poziției Soarelui în focar, a variației vitezei planetei
                  și a relației dintre perioada de revoluție și semiaxa mare a elipsei.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={legiKeplerImg}
                    alt="Legile lui Kepler"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Legea I – Orbitele sunt elipse</h3>
                    <p className="text-muted-foreground mb-4">
                      Planetele se mișcă pe orbite eliptice, Soarele ocupând unul din focare. Semiaxa mare este {"\\(a\\)"} <MathJaxRender />,
                      excentricitatea {"\\(e\\)"} <MathJaxRender /> măsoară „aplatizarea” elipsei.
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad b = a\\sqrt{1-e^2} \\)"}
                      <MathJaxRender />
                    </div>

                    <h3 className="text-xl font-semibold mb-2 mt-6">Legea a II-a – Legea ariilor</h3>
                    <p className="text-muted-foreground mb-4">
                      Raza vectoare (linia Soare–planetă) mătură arii egale în intervale de timp egale. Planeta se mișcă mai
                      repede când este mai aproape de Soare (periheliu) și mai încet când este mai departe (afeliu).
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{dA}{dt} = \\frac{L}{2m} = \\text{const.} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      unde {"\\(L\\)"} <MathJaxRender /> este momentul cinetic, {"\\(m\\)"} <MathJaxRender /> masa planetei.
                    </p>

                    <h3 className="text-xl font-semibold mb-2 mt-6">Legea a III-a – Perioada și semiaxa mare</h3>
                    <p className="text-muted-foreground mb-4">
                      Pătratul perioadei de revoluție este proporțional cu cubul semiaxei mari a elipsei. Raportul
                      {"\\(T^2 / a^3\\)"} <MathJaxRender /> este același pentru toate planetele din sistemul solar.
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( T^2 = \\frac{4\\pi^2}{GM}\\, a^3 \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Unde: {"\\(T\\)"} <MathJaxRender /> perioada, {"\\(a\\)"} <MathJaxRender /> semiaxa mare, {"\\(G\\)"} <MathJaxRender /> constanta gravitațională, {"\\(M\\)"} <MathJaxRender /> masa Soarelui.
                    </p>
                  </div>
                  <a
                    href="/simulare/legi_Kepler"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Mișcarea planetelor în câmp gravitațional</h2>
                <p className="text-muted-foreground mb-6">
                  Simulatorul „Mișcarea planetelor” îți permite să vizualizezi orbitele planetelor din sistemul solar și să vezi cum
                  acestea sunt determinate de atracția gravitațională a stelei centrale. Pentru orbite foarte apropiate, sunt incluse
                  și corecții de relativitate generală, care explică fenomene precum precesia periheliului lui Mercur.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={miscarePlaneteImg}
                    alt="Simulare Mișcarea Planetelor"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Descriere teoretică și formule utile:</h3>

                    <h4 className="text-lg font-semibold mb-2">1. Legea gravitației universale (Newton):</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( F_G = G \\frac{Mm}{r^2} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Unde: {"\\(M\\)"} <MathJaxRender /> este masa stelei, {"\\(m\\)"} <MathJaxRender /> masa planetei,{" "}
                      {"\\(r\\)"} <MathJaxRender /> distanța dintre centre, iar {"\\(G\\)"} <MathJaxRender /> constanta
                      gravitațională. Această forță este centripetă și ține planeta pe orbită.
                    </p>

                    <h4 className="text-lg font-semibold mb-2">2. Ecuația vitezei orbitale pe o orbită circulară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( v = \\sqrt{\\frac{GM}{r}} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">3. Energia mecanică specifică pe orbită eliptică:</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\varepsilon = -\\frac{GM}{2a} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Unde {"\\(a\\)"} <MathJaxRender /> este semiaxa mare a orbitei. Toate orbitele legate (elipse) pentru aceeași
                      stea au energie negativă; cu cât planeta este mai legată (orbita mai mică), cu atât energia este mai mică.
                    </p>

                    <h4 className="text-lg font-semibold mb-2">4. Corecție relativistă (precesia periheliului, idee simplificată):</h4>
                    <div className="formula-resurse text-lg font-mono mb-3">
                      {"\\( \\Delta \\varphi \\approx \\frac{6\\pi GM}{a c^2 (1-e^2)} \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground">
                      Această expresie (în radiani pe orbită) arată cât de mult se rotește axa mare a elipsei la fiecare tur în
                      relativitatea generală. Efectul este foarte mic pentru planetele obișnuite, dar măsurabil pentru Mercur și
                      este unul dintre testele clasice ale teoriei lui Einstein.
                    </p>
                  </div>
                  <a
                    href="/simulare/miscare-planete"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Experimentul Michelson–Morley</h2>
                <p className="text-muted-foreground mb-4">
                  La sfârșitul secolului XIX se presupunea că lumina se propagă printr-un mediu invizibil numit „eter luminifer”.
                  Dacă acest eter ar fi existat, mișcarea Pământului prin el ar fi produs un „vânt de eter” care să modifice
                  viteza aparentă a luminii pe diferite direcții.
                </p>
                <p className="text-muted-foreground mb-4">
                  Experimentul lui Albert A. Michelson și Edward W. Morley (1887) a comparat timpii de propagare ai luminii pe
                  două direcții perpendiculare într-un interferometru. Nu s-a măsurat diferența așteptată, viteza luminii
                  părea aceeași în toate direcțiile. Acest rezultat a pregătit relativitatea restrânsă (Einstein, 1905), cu
                  implicații și pentru observațiile astronomice care folosesc lumină și interferență.
                </p>
                <p className="text-muted-foreground mb-6">
                  Interferometrul împarte un fascicul în două brațe perpendiculare de lungime {"\\(L\\)"} <MathJaxRender />,
                  reflectă în oglinzi și recombină fasciculele. Dacă ar exista „vânt de eter” cu viteza {"\\(v\\)"}{" "}
                  <MathJaxRender />, timpii de propagare ar diferi ușor; în realitate, în limita preciziei experimentului,
                  diferența a fost zero, nu putem vorbi de un eter privilegiat.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={michaelsonMorleyImg}
                    alt="Experimentul Michelson-Morley"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-4 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-semibold mb-4">Idei în formule ({"\\(v \\ll c\\)"} <MathJaxRender />)</h3>
                    <p className="text-muted-foreground mb-3">Braț paralel cu „vântul de eter”:</p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\parallel} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-3">Braț perpendicular:</p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\perp} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{2c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>
                    <p className="text-muted-foreground mb-3">Diferența de timp așteptată (absentă în experiment):</p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta t \\approx \\frac{Lv^2}{c^3} \\)"}
                      <MathJaxRender />
                    </div>
                  </div>
                  <a
                    href="/simulare/michaelson-morley"
                    rel="noopener noreferrer"
                    className="resurse-link shrink-0"
                  >
                    <Button size="lg">Simulare: Michelson–Morley</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Formule derivate utile</h2>
                <p className="text-muted-foreground mb-4">
                  Recapitulare rapidă, inclusiv mărimi legate de stele și cer, pe lângă orbite:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>
                    Distanță unghiulară pe sferă (RA/Dec):{" "}
                    {"\\( \\cos\\theta = \\sin\\delta_1\\sin\\delta_2 + \\cos\\delta_1\\cos\\delta_2\\cos(\\alpha_1-\\alpha_2) \\)"}{" "}
                    <MathJaxRender />
                  </li>
                  <li>
                    Magnitudine (Pogson): {"\\( m_1 - m_2 = -2{,}5\\,\\log_{10}(F_1/F_2) \\)"}{" "}
                    <MathJaxRender />
                  </li>
                  <li>
                    Parsec: {"\\( d\\,[\\mathrm{pc}] = 1/p\\,[\\mathrm{arcsec}] \\)"} <MathJaxRender />
                  </li>
                  <li>Viteza orbitală medie: {"\\( v = \\frac{2\\pi a}{T} \\)"} <MathJaxRender /></li>
                  <li>Energia mecanică pe orbită eliptică: {"\\( E = -\\frac{GMm}{2a} \\)"} <MathJaxRender /></li>
                  <li>Viteza la periheliu (cea mai mare): {"\\( v_p = \\sqrt{\\frac{GM}{a}\\frac{1+e}{1-e}} \\)"} <MathJaxRender /></li>
                  <li>Viteza la afeliu (cea mai mică): {"\\( v_a = \\sqrt{\\frac{GM}{a}\\frac{1-e}{1+e}} \\)"} <MathJaxRender /></li>
                </ul>
              </div>

              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Simulare interactivă</h2>
                <div className="w-full" style={{ minHeight: '600px' }}>
                  <iframe
                    src="http://simulare-sistemul-solar.s3-website.eu-north-1.amazonaws.com"
                    width="100%"
                    height="600"
                    style={{ border: 'none', borderRadius: '8px' }}
                    allowFullScreen={true}
                    title="Simulare astronomie"
                  ></iframe>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default AstronomiePage;
