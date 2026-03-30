import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";
import SEO from "../../SEO";

import simulatorPrismaImg from "/res/screenshots/Prisma_Screenshot.png";
import lentilaSubtireImg from "/res/screenshots/Lentila_Subtire_Screenshot.png";
import reflexieRefractieImg from "/res/screenshots/Reflexie_Refractie_Screenshot.png";
import refractieAtmosfericaImg from "/res/screenshots/Refractie_Atmosferica_Screenshot.png";
import spectruImg from "/res/screenshots/spectru_Screenshot.png";
import laserImg from "/res/screenshots/laser_Screenshot.png";

const OpticaPage = () => {
  return (
    <Layout>
      <SEO
        title="Resurse Optică | Lentile, reflexie, refracție - PULS"
        description="Învață despre optică: lentile subțiri, reflexie, refracție, prismă, interferență, difracție și polarizare. Teorie și simulări."
        keywords="optică, lentile, reflexie, refracție, Snell, prismă, interferență, difracție, PULS"
        image="/res/icons/New-logo.png"
      />
      <div className="resurse-pagina min-h-screen flex flex-col">
        <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
          <main className="flex-grow container mx-auto px-4 py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Optică</h1>
            
            <div className="max-w-4xl mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                Optica este ramura fizicii care studiază comportamentul și proprietățile luminii, precum și interacțiunile acesteia 
                cu materia. Această disciplină fundamentală include optică geometrică, optică fizică și optică cuantică.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Studiul opticii acoperă fenomene precum reflexia, refracția, interferența, difracția și polarizarea luminii. 
                Aceste fenomene sunt esențiale pentru înțelegerea sistemelor optice, de la lentile simple până la dispozitive 
                optice complexe.
              </p>
              <p className="text-lg text-muted-foreground">
                Aplicațiile opticii sunt numeroase și variate, de la sisteme de iluminat și imagistică medicală până la 
                tehnologii avansate precum laserul și fibra optică.
              </p>
            </div>

            <div className="space-y-12">
              {/* Lentile Subțiri */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Lentile Subțiri</h2>
                <p className="text-muted-foreground mb-6">
                  Lentilele subțiri sunt dispozitive optice care refractă lumina pentru a forma imagini. Ele pot fi convergente 
                  (convexe) sau divergente (concave), fiecare având caracteristici specifice de formare a imaginilor.
                </p>
                <p className="text-muted-foreground mb-6">
                  Studiul lentilelor subțiri este fundamental pentru înțelegerea sistemelor optice și a formării imaginilor. 
                  Ecuațiile lentilelor permit calcularea poziției și mărimii imaginilor formate de lentile în funcție de poziția obiectului.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={lentilaSubtireImg}
                    alt="Simulator Lentilă Subțire"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru lentile subțiri:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Formula lentilelor subțiri:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{1}{f} = \\frac{1}{x_1} + \\frac{1}{x_2} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Mărirea liniară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\beta = \\frac{x_2}{x_1} = \\frac{y_2}{y_1} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Convergența (puterea optică):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( C = \\frac{1}{f} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Formula constructorului de lentile:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Convergența sistemului de lentile:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( C_{total} = C_1 + C_2 + ... + C_n \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">6. Mărirea unghiulară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\gamma = \\frac{\\alpha_2}{\\alpha_1} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: f este distanța focală, x₁ este distanța obiectului, x₂ este distanța imaginii, 
                      β este mărirea liniară, y₁ este înălțimea obiectului, y₂ este înălțimea imaginii, 
                      C este convergența, n este indicele de refracție, R₁ și R₂ sunt razele de curbură, 
                      γ este mărirea unghiulară, α₁ și α₂ sunt unghiurile.
                    </p>
                  </div>
                  <a
                    href="/simulare/lentila-subtire"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Refracție și Reflexie */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Refracție și Reflexie</h2>
                <p className="text-muted-foreground mb-6">
                  Refracția și reflexia sunt fenomene fundamentale care descriu comportamentul luminii la interfața dintre două medii 
                  cu indici de refracție diferiți. Aceste fenomene sunt guvernate de legile reflexiei și refracției.
                </p>
                <p className="text-muted-foreground mb-6">
                  Legea refracției, cunoscută și sub numele de legea lui Snell, descrie relația dintre unghiurile de incidență și refracție 
                  și indicii de refracție ai mediilor. Reflexia totală internă apare când lumina trece dintr-un mediu cu indice de refracție 
                  mai mare într-unul cu indice mai mic. Fenomene spectaculoase precum mirajul în deșert sau „îndoirea” aparentă a obiectelor 
                  în apă pot fi explicate prin variația indicelui de refracție.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={reflexieRefractieImg}
                    alt="Simulator Reflexie și Refracție"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru refracție și reflexie:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Indicele de refracție:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( n = \\frac{c}{v} = \\frac{\\sin(i)}{\\sin(r)} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Legea refracției (Snell):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Legea reflexiei:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\theta_i = \\theta_r \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Unghiul critic pentru reflexie totală:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\sin(\\theta_{crit}) = \\frac{n_2}{n_1} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Viteza luminii în mediu:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( v = \\frac{c}{n} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">6. Lungimea de undă în mediu:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\lambda_n = \\frac{\\lambda_0}{n} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: n este indicele de refracție, c este viteza luminii în vid, v este viteza luminii în mediu, 
                      i este unghiul de incidență, r este unghiul de refracție, θ₁ și θ₂ sunt unghiurile în cele două medii, 
                      θᵢ și θᵣ sunt unghiurile de incidență și reflexie, θcrit este unghiul critic, 
                      λ₀ este lungimea de undă în vid, λₙ este lungimea de undă în mediu.
                    </p>
                  </div>
                  <a
                    href="/simulare/reflexie-refractie"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Prisma și Dispersie */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Prisma și Dispersia Luminii</h2>
                <p className="text-muted-foreground mb-6">
                  Prisma este un dispozitiv optic care refractă lumina și o descompune în componentele sale spectrale. 
                  Acest fenomen, numit dispersie, apare deoarece indicele de refracție al materialului prismei variază cu lungimea de undă.
                </p>
                <p className="text-muted-foreground mb-6">
                  Dispersia luminii este responsabilă pentru formarea curcubeului și pentru funcționarea multor instrumente optice. 
                  Studiul prismei și al dispersiei este esențial pentru înțelegerea comportamentului luminii în medii dispersive.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={simulatorPrismaImg}
                    alt="Prisma"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru prismă și dispersie:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Unghiul de deviație:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\delta = i_1 + i_2 - A \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Dispersia unghiulară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( D = \\frac{d\\delta}{d\\lambda} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Puterea dispersivă:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( P = \\frac{n_F - n_C}{n_D - 1} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Formula Cauchy pentru indicele de refracție:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( n(\\lambda) = A + \\frac{B}{\\lambda^2} + \\frac{C}{\\lambda^4} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: δ este deviația, n este indicele de refracție, A este unghiul prismei, 
                      i₁ și i₂ sunt unghiurile de incidență și de ieșire, D este dispersia unghiulară, 
                      λ este lungimea de undă, P este puterea dispersivă, nF, nC, nD sunt indicii de refracție 
                      pentru diferite lungimi de undă, A, B, C sunt constante.
                    </p>
                  </div>
                  <a
                    href="/simulare/prisma"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>
              {/* Refracție Atmosferică */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Refracție Atmosferică</h2>
                <p className="text-muted-foreground mb-6">
                  Refracția atmosferică este fenomenul prin care lumina se curbează când trece prin straturile atmosferei cu densități diferite. 
                  Acest fenomen este responsabil pentru efecte optice precum mirajul în deșert și apariția soarelui deasupra orizontului 
                  chiar și după ce geometric s-a așezat.
                </p>
                <p className="text-muted-foreground mb-6">
                  Studiul refracției atmosferice este important pentru astronomie, navigație și meteorologie. 
                  Acest fenomen demonstrează cum proprietățile optice ale atmosferei pot afecta observațiile și măsurătorile.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={refractieAtmosfericaImg}
                    alt="Simulator Miraj în Deșert"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru refracție atmosferică și miraj:</h3>
                    
                    <h4 className="text-lg font-semibold mb-2">1. Indicele de refracție al aerului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( n_{aer} = 1 + \\frac{77.6}{T}\\left(p + \\frac{4810e}{T}\\right) \\times 10^{-6} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Unghiul de refracție atmosferică:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\theta_r = \\theta_i - \\Delta\\theta \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Corecția pentru refracție la înălțimi mici deasupra orizontului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\Delta\\theta = 0.00452 \\times \\frac{p}{T} \\times \\tan(z) \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Unde: nₐₑᵣ este indicele de refracție al aerului, T este temperatura în Kelvin, 
                      p este presiunea în hPa, e este presiunea vaporilor de apă, θᵢ este unghiul de incidență, 
                      θᵣ este unghiul de refracție, Δθ este corecția pentru refracție, z este distanța zenitală.
                    </p>
                  </div>
                  <a
                    href="/simulare/refractie-atmosferica"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Laser */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Laser</h2>
                <p className="text-muted-foreground mb-6">
                  Laserul produce un fascicul coerent, aproape monocromatic, cu divergență mică. În aplicații (telecomunicații,
                  medicină, metrologie), contează legătura dintre lungimea de undă, frecvență, energie și intensitate.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={laserImg}
                    alt="Laser"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule esențiale:</h3>

                    <h4 className="text-lg font-semibold mb-2">1. Relația undă–frecvență:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( c = \\lambda f \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">2. Energia fotonului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( E = hf = \\frac{hc}{\\lambda} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">3. Impulsul fotonului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( p = \\frac{E}{c} = \\frac{h}{\\lambda} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">4. Intensitatea (putere pe suprafață):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( I = \\frac{P}{A} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">5. Legea inversului pătrat (surse punctiforme):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( I(r) = \\frac{P}{4\\pi r^2} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">6. Divergența minimă (aprox. fascicul gaussian):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\theta \\approx \\frac{\\lambda}{\\pi w_0} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">7. Distanța Rayleigh:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( z_R = \\frac{\\pi w_0^2}{\\lambda} \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground mt-4">
                      Unde: c = viteza luminii, λ = lungimea de undă, f = frecvența, h = constanta lui Planck, E = energia,
                      p = impulsul, P = puterea, A = aria, r = distanța, θ = divergența, w₀ = raza „waist”-ului, zR = distanța Rayleigh.
                    </p>
                  </div>
                  <a
                    href="/simulare/laser"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="lg">Vezi simularea</Button>
                  </a>
                </div>
              </div>

              {/* Spectrul electromagnetic */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Spectrul electromagnetic</h2>
                <p className="text-muted-foreground mb-6">
                  Undele electromagnetice se descriu prin frecvență și lungime de undă, iar energia asociată fotonilor crește odată cu frecvența.
                  Spectrul include radio, microunde, infraroșu, vizibil, UV, raze X și gamma.
                </p>
                <div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
                  <img
                    src={spectruImg}
                    alt="Spectrul electromagnetic"
                    className="w-full h-full object-contain mx-auto my-auto"
                  />
                </div>
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule esențiale:</h3>

                    <h4 className="text-lg font-semibold mb-2">1. Relația undă–frecvență:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( c = \\lambda f \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">2. Energia fotonului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( E = hf \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">3. Impulsul fotonului:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( p = \\frac{h}{\\lambda} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">4. Intensitatea (undă plană):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( I = \\frac{P}{A} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">5. Legea inversului pătrat (propagare sferică):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( I(r) = \\frac{P}{4\\pi r^2} \\)"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">6. Legea Wien (radiație termică):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\lambda_{max} T = b \\) (b \\approx 2{,}898\\times 10^{-3}\\,\\text{m·K})"}
                      <MathJaxRender />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">7. Stefan–Boltzmann (putere radiată):</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( P = \\sigma \\varepsilon A T^4 \\)"}
                      <MathJaxRender />
                    </div>

                    <p className="text-muted-foreground mt-4">
                      Unde: c = viteza luminii, λ = lungimea de undă, f = frecvența, h = constanta lui Planck, E = energia fotonului,
                      p = impulsul, P = puterea, A = aria, r = distanța, {"\\(\\lambda_{max}\\)"} <MathJaxRender /> = lungimea de undă la maxim,
                      T = temperatura absolută, b = constanta Wien, σ = constanta Stefan–Boltzmann, ε = emisivitatea.
                    </p>
                  </div>
                  <a
                    href="/simulare/spectru-electromagnetic"
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

export default OpticaPage;

