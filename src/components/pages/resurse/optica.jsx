import Layout from "../../Layout";
import { Button } from "../../Button";
import MathJaxRender from "@/components/MathJaxRender";

import simulatorPrismaImg from "/res/screenshots/Prisma_Screenshot.png";

const OpticaPage = () => {
  return (
    <Layout>
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
                    src={simulatorPrismaImg}
                    alt="Lentilă Subțire"
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
                    target="_blank"
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
                  mai mare într-unul cu indice mai mic.
                </p>
                <div className="mt-8">
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
                    
                    <h4 className="text-lg font-semibold mb-2">1. Deviația minimă în prismă:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\delta_{min} = (n - 1)A \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">2. Unghiul de deviație:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( \\delta = i_1 + i_2 - A \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">3. Dispersia unghiulară:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( D = \\frac{d\\delta}{d\\lambda} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">4. Puterea dispersivă:</h4>
                    <div className="formula-resurse text-lg font-mono mb-4">
                      {"\\( P = \\frac{n_F - n_C}{n_D - 1} \\)"}
                      <MathJaxRender />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">5. Formula Cauchy pentru indicele de refracție:</h4>
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

              {/* Interferență și Difracție */}
              <div className="rounded-container">
                <h2 className="text-2xl font-bold mb-4">Interferență și Difracție</h2>
                <p className="text-muted-foreground mb-6">
                  Interferența și difracția sunt fenomene caracteristice opticii fizice care demonstrează natura undelor a luminii. 
                  Aceste fenomene apar când lumina întâlnește obstacole sau trece prin fante, creând modele caracteristice de intensitate.
                </p>
                <p className="text-muted-foreground mb-6">
                  Interferența apare când două sau mai multe unde luminoase se suprapun, creând zone de intensitate maximă (maxime) 
                  și minimă (minime). Difracția apare când lumina trece prin deschideri mici sau în jurul obstacolelor, 
                  demonstrând că lumina se comportă ca o undă.
                </p>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Formule pentru interferență și difracție:</h3>
                  
                  <h4 className="text-lg font-semibold mb-2">1. Condiția pentru maxime de interferență:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( \\Delta = k\\lambda = d\\sin(\\theta) \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">2. Condiția pentru minime de interferență:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( \\Delta = \\left(k + \\frac{1}{2}\\right)\\lambda = d\\sin(\\theta) \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">3. Diferența de drum optic:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( \\Delta = n_2d_2 - n_1d_1 \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">4. Poziția maximelor în difracție pe o fantă:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( a\\sin(\\theta) = k\\lambda \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">5. Poziția minimelor în difracție pe o fantă:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( a\\sin(\\theta) = k\\lambda \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">6. Rețeaua de difracție:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( d\\sin(\\theta) = m\\lambda \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">7. Puterea de rezoluție a rețelei:</h4>
                  <div className="formula-resurse text-lg font-mono mb-4">
                    {"\\( R = \\frac{\\lambda}{\\Delta\\lambda} = mN \\)"}
                    <MathJaxRender />
                  </div>
                  
                  <p className="text-muted-foreground mt-4">
                    Unde: Δ este diferența de drum optic, k și m sunt numere întregi, λ este lungimea de undă, 
                    d este distanța dintre surse sau fante, θ este unghiul, a este lățimea fantei, 
                    n₁ și n₂ sunt indicii de refracție, d₁ și d₂ sunt distanțele, R este puterea de rezoluție, N este numărul de linii.
                  </p>
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
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Formule pentru refracție atmosferică:</h3>
                    
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
                    
                    <h4 className="text-lg font-semibold mb-2">3. Corecția pentru refracție:</h4>
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
                    target="_blank"
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

