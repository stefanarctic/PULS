import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import michaelsonMorleyImg from "/res/screenshots/Michaelson_Morley_Screenshot.png";
import atomulDeHidrogenImg from "/res/screenshots/Atom_hidrogen.png";

const FizicaCuanticaPage = () => {
  return (
    <Layout>
      <SEO
        title="Fizica Cuantică | Experimentul Michelson-Morley și atomul de hidrogen - PULS"
        description="Introducere în fizica cuantică pornind de la experimentul Michelson-Morley și modelul cuantic al atomului de hidrogen: concepte, formule și explicații clare."
        keywords="fizica cuantica, Michelson-Morley, atom de hidrogen, nivele de energie, spectru, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Fizica Cuantică
            </h1>

            {/* Secțiune: De ce contează experimentul Michelson–Morley pentru fizica cuantică */}
            <div className="max-w-4xl mb-10">
              <h2 className="text-2xl font-bold mb-3">De ce este important experimentul Michelson–Morley?</h2>
              <p className="text-lg text-muted-foreground mb-4">
                La sfârșitul secolului XIX se credea că lumina se propagă printr-un mediu invizibil numit „eter luminifer”,
                asemănător cu modul în care sunetul are nevoie de aer. Dacă acest eter ar fi existat, mișcarea Pământului
                prin el ar fi produs un „vânt de eter” care să modifice viteza aparentă a luminii în funcție de direcție.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Experimentul lui Albert A. Michelson și Edward W. Morley (1887) a folosit un interferometru foarte sensibil
                pentru a compara timpii de propagare ai luminii pe două direcții perpendiculare. Rezultatul a fost
                neașteptat: nu s-a măsurat nicio diferență – viteza luminii părea aceeași în toate direcțiile.
              </p>
              <p className="text-lg text-muted-foreground">
                Acest rezultat a pregătit terenul pentru relativitatea restrânsă (Einstein, 1905), unde viteza luminii
                {"\\(c\\)"} <MathJaxRender /> este constantă în toate sistemele de referință inerțiale. Ulterior, combinația dintre
                relativitate și studiul radiației (spectrul hidrogenului, efectul fotoelectric etc.) a dus firesc la
                dezvoltarea fizicii cuantice.
              </p>
            </div>

            {/* Secțiune: Michelson–Morley – principiu pe scurt */}
            <div className="space-y-12 mb-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Experimentul Michelson–Morley (pe scurt)</h2>
                <p className="text-muted-foreground mb-6">
                  Interferometrul împarte un fascicul de lumină în două brațe perpendiculare, fiecare de lungime {"\\(L\\)"}{" "}
                  <MathJaxRender />. Fasciculele se reflectă în oglinzi și se recombină, formând un model de interferență.
                  Dacă ar exista „vânt de eter” cu viteza {"\\(v\\)"} <MathJaxRender />, timpii de propagare ar fi ușor diferiți
                  și franjele de interferență s-ar deplasa când aparatul este rotit.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={michaelsonMorleyImg}
                    alt="Experimentul Michelson-Morley"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ideea de bază în formule</h3>

                    <p className="text-muted-foreground mb-3">
                      Pentru brațul paralel cu „vântul de eter”, se obține (în aproximație pentru {"\\(v \\ll c\\)"} <MathJaxRender />):
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\parallel} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground mb-3">
                      Pentru brațul perpendicular:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( t_{\\perp} \\approx \\frac{2L}{c}\\left(1 + \\frac{v^2}{2c^2}\\right) \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground mb-3">
                      Diferența de timp ar fi:
                    </p>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta t \\approx \\frac{Lv^2}{c^3} \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground">
                      În realitate, diferența a fost zero în limita preciziei experimentului, ceea ce înseamnă că nu putem
                      vorbi de un eter privilegiat. Aceasta susține ideea că legile fizicii – inclusiv viteza luminii –
                      sunt aceleași în toate cadrele inerțiale, un punct de pornire esențial pentru teoriile moderne, inclusiv
                      pentru fizica cuantică a câmpurilor.
                    </p>
                  </div>
                  <a
                    href="/simulare/michaelson-morley"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Secțiune mare: Atomul de hidrogen în fizica cuantică */}
            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Atomul de hidrogen în fizica cuantică</h2>
                <p className="text-muted-foreground mb-4">
                  Atomul de hidrogen este cel mai simplu atom: un proton și un electron. Deși pare simplu, el a fost
                  „laboratorul” ideal pentru dezvoltarea mecanicii cuantice, deoarece spectrul său de emisie are linii
                  foarte clare și precise.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={atomulDeHidrogenImg}
                    alt="Atomul de hidrogen"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Modelul lui Bohr – nivele de energie cuantificate</h3>
                <p className="text-muted-foreground mb-3">
                  Niels Bohr (1913) a propus că electronul nu poate avea orice energie, ci doar anumite valori discrete
                  (nivele de energie). Pentru atomul de hidrogen, energia nivelului cuantic {"\\(n = 1, 2, 3, ...\\)"}{" "}
                  <MathJaxRender /> este:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( E_n = - \\frac{13{,}6\\ \\text{eV}}{n^2} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  Valoarea de{" "}
                  {"\\(13{,}6\\ \\text{eV}\\)"} <MathJaxRender /> este energia de ionizare a hidrogenului (energia necesară
                  pentru a scoate electronul de pe nivelul fundamental {"\\(n = 1\\)"} <MathJaxRender /> la infinit).
                  Semnul minus arată că electronul este legat de proton.
                </p>

                <h3 className="text-xl font-semibold mb-3">Tranziții și linii spectrale</h3>
                <p className="text-muted-foreground mb-3">
                  Când electronul sare de pe un nivel cu energie mai mare {"\\(E_m\\)"} <MathJaxRender /> pe unul mai mic
                  {"\\(E_n\\)"} <MathJaxRender />, diferența de energie se emite sub formă de foton:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\Delta E = E_m - E_n = h \\nu = \\frac{hc}{\\lambda} \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-3">
                  Relația dintre lungimile de undă ale liniilor spectrale ale hidrogenului este dată de formula lui Rydberg:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n^2} - \\frac{1}{m^2} \\right),\\quad m > n \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  unde {"\\(R_H\\)"} <MathJaxRender /> este constanta lui Rydberg pentru hidrogen, iar seriile spectrale
                  (Lyman, Balmer, Paschen etc.) corespund diferitelor valori ale lui {"\\(n\\)"} <MathJaxRender />.
                </p>

                <h3 className="text-xl font-semibold mb-3">Descriere cuantică: funcția de undă a electronului</h3>
                <p className="text-muted-foreground mb-3">
                  În mecanica cuantică modernă, electronul din atomul de hidrogen este descris de o funcție de undă
                  {"\\(\\psi_{n\\ell m}(r,\\theta,\\varphi)\\)"} <MathJaxRender /> care satisface ecuația Schrödinger în
                  potențialul coulombian al protonului:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( -\\frac{\\hbar^2}{2m_e} \\nabla^2 \\psi - \\frac{e^2}{4\\pi\\varepsilon_0 r} \\, \\psi = E \\, \\psi \\)"}
                  <MathJaxRender />
                </div>
                <p className="text-muted-foreground mb-4">
                  Soluțiile duc exact la aceleași nivele de energie {"\\(E_n\\)"} <MathJaxRender /> ca în modelul lui Bohr,
                  dar oferă și formele orbitale (s, p, d, ...) și probabilitățile de găsire a electronului în jurul nucleului.
                </p>

                <h3 className="text-xl font-semibold mb-3">Legătura cu experimentele</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground mb-6">
                  <li>
                    Spectrul liniar al hidrogenului confirmă existența nivelelor de energie cuantificate și poate fi măsurat
                    cu mare precizie.
                  </li>
                  <li>
                    Rezultatul experimentului Michelson–Morley sugerează că viteza luminii este fundamentală, iar fotonii
                    emiși/absorbiți de atom respectă această constantă universală.
                  </li>
                  <li>
                    Împreună, aceste idei au condus la dezvoltarea fizicii cuantice și a modelelor moderne ale materiei și
                    radiației.
                  </li>
                </ul>

                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-muted-foreground">
                      Poți explora mai departe tranzițiile din atomul de hidrogen și efectele cuantice în simulări dedicate
                      sau aplicații interactive de spectroscopie.
                    </p>
                  </div>
                  <a
                    href="/simulare/atom_hidrogen"
                    rel="noopener noreferrer"
                    className="resurse-link"
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

export default FizicaCuanticaPage;
