import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import legiKeplerImg from "/res/screenshots/Legi_Kepler_Screenshot.png";
import miscarePlaneteImg from "/res/screenshots/Miscare_Planete_Screenshot.png";

const AstronomiePage = () => {
  return (
    <Layout>
      <SEO
        title="Astronomie | Legile lui Kepler - PULS"
        description="Învață despre legile lui Kepler care guvernează mișcarea planetelor: orbite eliptice, viteza variabilă și relația perioadă–rază. Teorie, formule și simulare interactivă."
        keywords="astronomie, legile lui Kepler, orbite eliptice, mișcare planetară, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Astronomie – Mișcarea planetelor</h1>

            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Johannes Kepler a formulat, la începutul secolului XVII, trei legi care descriu mișcarea planetelor în jurul Soarelui.
                Astăzi știm, din teoria gravitației newtoniane și apoi din relativitatea generală, că mișcarea planetelor este o
                consecință a atracției gravitaționale și, mai profund, a curburii spațiu‑timpului din jurul stelei centrale.
              </p>
              <p className="text-lg text-muted-foreground">
                Legile lui Kepler se aplică oricărui sistem în care un corp gravitează în jurul altuia (planete în jurul Soarelui,
                sateliți în jurul planetelor), în aproximația în care masa corpului orbitant este mult mai mică decât cea a corpului
                central. Simularea „Mișcarea planetelor” îți arată aceste orbite într-un mod modern, incluzând efecte relativiste
                pentru orbite foarte apropiate de stea.
              </p>
            </div>

            <div className="space-y-12">
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
                <h2 className="text-2xl font-bold mb-4">Mișcarea planetelor în câmp gravitațional (simulator nou)</h2>
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
                <h2 className="text-2xl font-bold mb-4">Formule derivate utile</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
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
