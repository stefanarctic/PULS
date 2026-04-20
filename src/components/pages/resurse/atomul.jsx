import Layout from "../../Layout";
import { Button } from "../../Button";
import SEO from "../../SEO";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";
import { tabelPeriodicFormulas } from "@/data/tabelPeriodicFormulas";

import atomulDeHidrogenImg from "/res/screenshots/Atom_hidrogen.png";
import tabelPeriodicImg from "/res/screenshots/Tabel_periodic_Screenshot.png";

const AtomulPage = () => {
  const mathRootRef = useMathJaxTypesetRoot();
  return (
    <Layout>
      <SEO
        title="Atomul | Structură atomică, hidrogen și tabel periodic - PULS"
        description="Atomul de hidrogen (Bohr, Schrödinger), spectru și tranziții; tabelul periodic și proprietăți de bază ale elementelor — teorie și simulări."
        keywords="atom, atom de hidrogen, tabel periodic, mecanica cuantica, nivele de energie, spectru, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div className="resurse-page-container">
          <main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Atomul</h1>

            <div className="max-w-4xl mb-10">
              <p className="text-lg text-muted-foreground mb-4">
                Structura atomului și organizarea elementelor în chimie și fizică: de la cel mai simplu atom (hidrogenul) la
                tabelul periodic al elementelor. Mai jos găsești teorie esențială și legături către simulări interactive.
              </p>
            </div>

            <div className="space-y-12 mb-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Atomul de hidrogen</h2>
                <p className="text-muted-foreground mb-4">
                  Atomul de hidrogen este cel mai simplu atom: un proton și un electron. A fost „laboratorul” ideal pentru
                  dezvoltarea mecanicii cuantice, deoarece spectrul său de emisie are linii foarte clare și precise.
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
                  este:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( E_n = - \\frac{13{,}6\\ \\text{eV}}{n^2} \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  Valoarea de{" "}
                  {"\\(13{,}6\\ \\text{eV}\\)"} este energia de ionizare a hidrogenului (energia necesară
                  pentru a scoate electronul de pe nivelul fundamental {"\\(n = 1\\)"} la infinit).
                  Semnul minus arată că electronul este legat de proton.
                </p>

                <h3 className="text-xl font-semibold mb-3">Tranziții și linii spectrale</h3>
                <p className="text-muted-foreground mb-3">
                  Când electronul sare de pe un nivel cu energie mai mare {"\\(E_m\\)"} pe unul mai mic
                  {"\\(E_n\\)"}, diferența de energie se emite sub formă de foton:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\Delta E = E_m - E_n = h \\nu = \\frac{hc}{\\lambda} \\)"}
                </div>
                <p className="text-muted-foreground mb-3">
                  Relația dintre lungimile de undă ale liniilor spectrale ale hidrogenului este dată de formula lui Rydberg:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( \\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n^2} - \\frac{1}{m^2} \\right),\\quad m > n \\)"}
                </div>
                <p className="text-muted-foreground mb-4">
                  unde {"\\(R_H\\)"} este constanta lui Rydberg pentru hidrogen, iar seriile spectrale
                  (Lyman, Balmer, Paschen etc.) corespund diferitelor valori ale lui {"\\(n\\)"}.
                </p>

                <h3 className="text-xl font-semibold mb-3">Descriere cuantică: funcția de undă a electronului</h3>
                <p className="text-muted-foreground mb-3">
                  În mecanica cuantică modernă, electronul din atomul de hidrogen este descris de o funcție de undă
                  {"\\(\\psi_{n\\ell m}(r,\\theta,\\varphi)\\)"} care satisface ecuația Schrödinger în
                  potențialul coulombian al protonului:
                </p>
                <div className="formula-resurse text-lg font-mono mb-4">
                  {"\\( -\\frac{\\hbar^2}{2m_e} \\nabla^2 \\psi - \\frac{e^2}{4\\pi\\varepsilon_0 r} \\, \\psi = E \\, \\psi \\)"}
                </div>
                <p className="text-muted-foreground mb-6">
                  Soluțiile duc la aceleași nivele de energie {"\\(E_n\\)"} ca în modelul lui Bohr,
                  dar oferă și formele orbitale (s, p, d, …) și probabilitățile de găsire a electronului în jurul nucleului.
                </p>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a
                    href="/simulare/atom_hidrogen"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Simulare: atomul de hidrogen</Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Tabelul periodic al elementelor</h2>
                <p className="text-muted-foreground mb-6">
                  Elementele sunt aranjate după număr atomic {"\\(Z\\)"}. În același grup, atomii au
                  configurații electronice similare pe ultimul strat; în aceeași perioadă, cresc protonii în nucleu și
                  electronii pe straturi.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={tabelPeriodicImg}
                    alt="Tabel periodic"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-2 mb-8 max-w-4xl">
                  <h3 className="text-xl font-semibold mb-4">Formule / relații utile (ca la lecția de termodinamică)</h3>
                  {tabelPeriodicFormulas.map((item, index) => (
                    <div key={item.title}>
                      <h4 className="text-lg font-semibold mb-2">
                        {index + 1}. {item.title}:
                      </h4>
                      <div className="formula-resurse text-lg font-mono mb-4">{item.formula}</div>
                    </div>
                  ))}

                  <p className="text-muted-foreground mt-4">
                    Unde: Z = numărul de protoni, A = numărul de masă, N = numărul de neutroni, n = numărul de moli, m = masa,
                    M = masa molară, {"\\(N_A\\)"} = constanta lui Avogadro, c = concentrația molară, V = volum.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                  <a
                    href="/simulare/tabel-periodic"
                    rel="noopener noreferrer"
                    className="resurse-link"
                  >
                    <Button size="lg">Simulare: tabel periodic interactiv</Button>
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

export default AtomulPage;
