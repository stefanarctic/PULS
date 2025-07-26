export const problemeData = [
  // Seismologie
  {
    id: '1',
    index: 1,
    titlu: 'Viteza undei P (Seism)',
    descriere: 'Calculul vitezei undelor primare în timpul unui seism',
    categorie: 'Seismologie',
    dificultate: 'ușor',
    subpuncte: [
      {
        id: '1a',
        cerinta: 'Calculează viteza undei P știind că distanța este 150 km și timpul de propagare este 25 s',
        punctaj: 3
      },
      {
        id: '1b',
        cerinta: 'Determină timpul necesar pentru a parcurge 200 km',
        punctaj: 2
      }
    ],
    punctajTotal: 5,
    continut: 'Pentru undele seismice P (primare), viteza se calculează folosind formula $v = \\frac{d}{t}$.',
    formule: ['v = d/t', 't = d/v'],
    date: {
      distanta: 150,
      timp: 25,
      unitate_viteza: '$v = 6\km/s$'
    }
  },
  {
    id: '2',
    index: 2,
    titlu: 'Viteza undei S (Seism)',
    descriere: 'Calculul vitezei undelor secundare în timpul unui seism',
    categorie: 'Seismologie',
    dificultate: 'ușor',
    subpuncte: [
      {
        id: '2a',
        cerinta: 'Calculează viteza undei S pentru aceeași distanță de 150 km parcursă în 45 s',
        punctaj: 3
      },
      {
        id: '2b',
        cerinta: 'Compară vitezele undelor P și S și explică diferența',
        punctaj: 4
      }
    ],
    punctajTotal: 7,
    continut: 'Undele S (secundare) se propagă mai lent decât undele P. Formula vitezei: $v_S = \\frac{d}{t_S}$, iar diferența de timp: $\\Delta t = t_S - t_P$.',
    formule: ['v_S = d/t_S', 'Δt = t_S - t_P'],
    date: {
      distanta: 150,
      timp_S: 45,
      timp_P: 25
    }
  },
  // Mecanică
  {
    id: '3',
    index: 3,
    titlu: 'Căderea liberă a unui corp',
    descriere: 'Determinarea timpului de cădere și a vitezei finale.',
    categorie: 'mecanică',
    dificultate: 'ușor',
    subpuncte: [
      { id: '3a', cerinta: 'Calculează timpul de cădere de la 20 m.', punctaj: 3 },
      { id: '3b', cerinta: 'Determină viteza la impact.', punctaj: 2 }
    ],
    punctajTotal: 5,
    continut: 'Se folosește formula $h = \\frac{1}{2}gt^2$ pentru căderea liberă. Viteza la impact: $v = gt$.',
    formule: ['h = (1/2)gt²', 'v = gt'],
    date: { h: 20, g: 9.8 }
  },
  {
    id: '4',
    index: 4,
    titlu: 'Plan înclinat fără frecare',
    descriere: 'Determinarea accelerației și a timpului de coborâre.',
    categorie: 'mecanică',
    dificultate: 'mediu',
    subpuncte: [
      { id: '4a', cerinta: 'Calculează accelerația pe planul înclinat de 30°.', punctaj: 3 },
      { id: '4b', cerinta: 'Determină timpul de coborâre pe o distanță de 10 m.', punctaj: 3 }
    ],
    punctajTotal: 6,
    continut: 'Accelerația pe plan înclinat: $a = g \\sin(\\theta)$. Distanța parcursă: $s = \\frac{1}{2}at^2$.',
    formule: ['a = g sin(θ)', 's = (1/2)at²'],
    date: { theta: 30, g: 9.8, s: 10 }
  },
  // Oscilații
  {
    id: '5',
    index: 5,
    titlu: 'Perioada pendulului simplu',
    descriere: 'Calculul perioadei de oscilație pentru un pendul.',
    categorie: 'oscilații',
    dificultate: 'ușor',
    subpuncte: [
      { id: '5a', cerinta: 'Calculează perioada pentru l = 1 m.', punctaj: 3 },
      { id: '5b', cerinta: 'Determină frecvența.', punctaj: 2 }
    ],
    punctajTotal: 5,
    continut: 'Perioada pendulului: $T = 2\\pi\\sqrt{\\frac{l}{g}}$. Frecvența: $f = \\frac{1}{T}$.',
    formule: ['T = 2π√(l/g)', 'f = 1/T'],
    date: { l: 1, g: 9.8 }
  },
  {
    id: '6',
    index: 6,
    titlu: 'Oscilații amortizate',
    descriere: 'Analiza oscilațiilor cu amortizare.',
    categorie: 'oscilații',
    dificultate: 'dificil',
    subpuncte: [
      { id: '6a', cerinta: 'Scrie ecuația mișcării pentru amortizare slabă.', punctaj: 4 },
      { id: '6b', cerinta: 'Determină energia după 5 perioade.', punctaj: 4 }
    ],
    punctajTotal: 8,
    continut: 'Oscilațiile amortizate au amplitudinea în scădere exponențială. Ecuația: $x(t) = A e^{-\\beta t} \\cos(\\omega t + \\varphi)$.',
    formule: ['x(t) = A e^{-βt} cos(ωt + φ)'],
    date: { beta: 0.1, A: 5 }
  },
  // Unde
  {
    id: '7',
    index: 7,
    titlu: 'Lungimea de undă',
    descriere: 'Determinarea lungimii de undă pentru o undă sonoră.',
    categorie: 'unde',
    dificultate: 'ușor',
    subpuncte: [
      { id: '7a', cerinta: 'Calculează lungimea de undă pentru f = 440 Hz, v = 340 m/s.', punctaj: 3 },
      { id: '7b', cerinta: 'Determină perioada.', punctaj: 2 }
    ],
    punctajTotal: 5,
    continut: 'Lungimea de undă: $\\lambda = \\frac{v}{f}$. Perioada: $T = \\frac{1}{f}$.',
    formule: ['λ = v/f', 'T = 1/f'],
    date: { f: 440, v: 340 }
  },
  {
    id: '8',
    index: 8,
    titlu: 'Interferența undelor',
    descriere: 'Analiza interferenței constructive și distructive.',
    categorie: 'unde',
    dificultate: 'mediu',
    subpuncte: [
      { id: '8a', cerinta: 'Explică condiția pentru interferență constructivă.', punctaj: 3 },
      { id: '8b', cerinta: 'Calculează distanța între două maxime.', punctaj: 3 }
    ],
    punctajTotal: 6,
    continut: 'Interferența apare când două unde se suprapun. Distanța între două maxime: $\\Delta x = \\frac{\\lambda}{2}$.',
    formule: ['Δx = λ/2'],
    date: { λ: 0.5 }
  },
  // Lissajous
  {
    id: '9',
    index: 9,
    titlu: 'Figuri Lissajous simple',
    descriere: 'Descrierea figurilor Lissajous pentru frecvențe egale.',
    categorie: 'lissajous',
    dificultate: 'ușor',
    subpuncte: [
      { id: '9a', cerinta: 'Desenează figura pentru fₓ = fy.', punctaj: 3 },
      { id: '9b', cerinta: 'Explică forma obținută.', punctaj: 2 }
    ],
    punctajTotal: 5,
    continut: 'Figurile Lissajous apar la suprapunerea a două oscilații perpendiculare. Ecuații: $x = A \sin(\\omega t)$, $y = B \sin(\\omega t + \\varphi)$.',
    formule: ['x = A sin(ωt)', 'y = B sin(ωt + φ)'],
    date: { fx: 1, fy: 1 }
  },
  {
    id: '10',
    index: 10,
    titlu: 'Figuri Lissajous complexe',
    descriere: 'Analiza figurilor pentru frecvențe diferite.',
    categorie: 'lissajous',
    dificultate: 'dificil',
    subpuncte: [
      { id: '10a', cerinta: 'Desenează figura pentru fₓ = 2fy.', punctaj: 4 },
      { id: '10b', cerinta: 'Explică simetria figurii.', punctaj: 4 }
    ],
    punctajTotal: 8,
    continut: 'Raportul frecvențelor determină numărul de bucle. Ecuații: $x = A \sin(2\\omega t)$, $y = B \sin(\\omega t + \\varphi)$.',
    formule: ['x = A sin(2ωt)', 'y = B sin(ωt + φ)'],
    date: { fx: 2, fy: 1 }
  },
  // Concurs
  {
    id: '11',
    index: 11,
    titlu: 'Unde mecanice si figura Lissajous',
    descriere: 'Analiza undelor mecanice și a figurii Lissajous pentru două unde perpendiculare.',
    categorie: 'lissajous',
    dificultate: 'concurs',
    imagine: '/res/Probleme-poze/concurs1.PNG',
    continut: `
Printr-un mediu material se propagă două unde elastice, o undă longitudinală și o undă transversală, în sensul pozitiv al axei $O_1X$, ca în FIGURA 1. Undele au aceeași frecvență $v$ și viteze de propagare $v_l$ și $v_t$. Sursele celor două unde se găsesc în planul $O_1YZ$ și au elongațiile, amplitudinile și fazele inițiale notate cu $x$, $A_1$, $\\varphi_{01}$ pentru unda longitudinală și, respectiv, cu $y$, $A_t$, $\\varphi_{0t}$ pentru unda transversală.
$$
$$

Ecuațiile undelor sunt:
\\[
x = A_1 \\sin(2\\pi v t + \\varphi_{01})
\\]
\\[
y = A_t \\sin(2\\pi v t + \\varphi_{0t})
\\]
`,
    subpuncte: [
      {
        id: '11a',
        cerinta: 'Determinați ecuația implicită a traiectoriei punctului $P$, situat pe axa $OX$ la distanța $d$ față de originea $O_1$, în raport cu un sistem de coordonate $Oxy$ care are originea în poziția de echilibru a punctului $P$ și axele $Ox$ și $Oy$ paralele cu axele $O_1X$ și $O_1Y$ și să explicați forma curbei geometrice ce corespunde acestei ecuații.',
        punctaj: 5
      },
      {
        id: '11b',
        cerinta: 'Determinați valorile distanțelor de propagare $d = O_1P$ pentru care punctul $P$ se îndepărtează la distanța maximă $y_{\\text{max}}$ față de poziția sa de echilibru. Reprezentați prin desen aceste poziții ale punctului $P$ și calculați valorile lui $y_{\\text{max}}$.',
        punctaj: 5
      }
    ],
    punctajTotal: 10,
    date: {
      '$v_{l}$': '$50\\ m/s$',
      '$v_{t}$': '$30\\ m/s$',
      '$v$': '$50\\ Hz$',
      '$A_{1}$': '$4\\ mm$',
      '$A_{t}$': '$3\\ mm$',
      '$\\varphi_{01}$': '$\\dfrac{\\pi}{6}$',
      '$\\varphi_{0t}$': '$\\dfrac{\\pi}{3}$'
    },
  },
  {
    id: '12',
    index: 12,
    titlu: 'Unde seismice',
    descriere: 'Analiza undelor seismice și aplicarea modelului fizic la situații concrete.',
    categorie: 'Seismologie',
    dificultate: 'concurs',
    imagine1: '/res/Probleme-poze/concurs2-1.PNG',
    imagine2: '/res/Probleme-poze/concurs2-2.PNG',
    continut: `1. Seismologie — Analiza undelor seismice este una dintre modalitățile de investigare a structurii interne a Pământului. Modelul undelor seismice este următorul:
- Declanșarea seismului la locul de focar și reprezentarea emisiei simultane a două unde mecanice denumite unde P (primare) — unde longitudinale, respectiv unde S — secundare — unde transversale. Focarele seismice sunt situate la diverse adâncimi sub scoarța Pământului.
- Epicentrul este localizat pe suprafața Pământului fiind situat pe aceeași rază cu focarul subteranului. Perturbația seismică produsă în focar evoluează spre epicentru și, în funcție de structura geologică a straturilor traversate, undele seismice ajung la stațiile seismologice. În procesul de propagare, soluția undei ajunsă la localitatea epicentrului, dar și la diferite stații seismologice, poate suferi atenuări sau amplificări. Propagarea lor determină mișcări în plan orizontal și/sau vertical ale suprafeței Pământului.

Folosind acest model care are la bază fizica undelor mecanice, rezolvă următoarele situații problemă:
`,
    subpuncte: [
      {
        id: '12a',
        cerinta: 'La o stație seismologică se înregistrează unde P și S după un interval de timp Δt de oscilație produse de undă S. Exprimă distanța d de la focarul seismului până la stația seismologică în funcție de viteza undei P (vₚ), viteza undei S (vₛ) și Δt.',
        punctaj: 2
      },
      {
        id: '12b',
        cerinta: 'În figura 1 este prezentat un grafic pentru determinarea poziției epicentrului unui cutremur. Momentele de timp sunt cele în care au fost înregistrate undele P și S de către stații seismologice aflate la distanțe d₁, d₂ față de epicentru. Folosind datele din grafic, determină valoarea vitezei undei primare vₚ și valoarea vitezei undei secundare vₛ. Pentru o obținere mai ușoară, se poate lucra cu datele tabelate sau cu datele preluate direct de pe graficul din figura 1.',
        punctaj: 3
      },
      {
        id: '12c',
        cerinta: 'Aplicatie practică. În figura 2 este ilustrat modul în care o stație seismică folosește două registre pentru înregistrarea simultană pe verticală, pe direcția Nord–Sud și respectiv pe direcția Est–Vest (East–West) (imaginea nu este inclusă).',
        punctaj: 2
      },
      {
        id: '12C1',
        cerinta: 'C1. Pe figura 2 sunt indicate prin săgeți momentele la care undele seismice încep să fie înregistrate pe fiecare canal. Notează pe desen momentele la care pe un canal de referință frecarea este maximă, pentru fiecare tip de undă identificat, astfel încât să se poată stabili sensul de propagare al undei: VERTICAL, NORD–SUD, EST–VEST.',
        punctaj: 2
      },
      {
        id: '12C2',
        cerinta: 'C2. Determină distanța dₛ de la focarul seismului unde stația seismică a fost neglijată. Calculează vₚ, viteza undei primare, folosind datele care arată momentul t₁. Este de asemenea necesară ipoteza utilizării unui sistem de referință adecvat.',
        punctaj: 2
      },
      {
        id: '12C3',
        cerinta: 'C3. Estimă din înregistrările seismice (u.c.) indicate pe seismogramă, deplasarea undei primare t₁ = 0,35 min, față de poziția inițială, produse de undele seismice: $d_{N-S}$ = deplasare Nord–Sud și $d_{E-V}$ = deplasare Est–Vest a punctului de pe care se găsește stația seismică, la momentul t₁, adică $t_1 = 0,37$ min, exprimată în u.c./minut.',
        punctaj: 2
      },
      {
        id: '12C4',
        cerinta: 'C4. Explică importanța utilizării a două canale de înregistrare (Nord–Sud și Est–Vest) pentru analiza completă a undelor seismice.',
        punctaj: 2
      }
    ],
    punctajTotal: 15,
    date: {
      'Pentru a raspunde la cerinte ':'consulta figurile 1 si 2 intr-o fereastra noua.',
      '$t_1$': '0,37 min'
    },
    formule: [
      'd = v_{p} v_{s}\\cdot \\frac{\\Delta t}{v_{P} - v_{S}}',
      'x = A \\sin(2\\pi v t + \\varphi_0)'
    ]
  },
  {
    id: '13',
    index: 13,
    titlu: 'Oscilatori liniari armonici',
    descriere: '',
    categorie: 'oscilații',
    dificultate: 'concurs',
    imagine: '/res/Probleme-poze/concurs3.PNG',
    continut: `
În graficele de mai jos sunt reprezentate dependenţele de timp ale elongaţiilor unor oscilatori liniari
armonici.
 $$
 $$

Ecuațiile elongațiilor sunt:
\\[
y = A \\sin(\\omega t + \\varphi_{01})
\\]
\\[
v = -A \\omega \\cos(\\omega t + \\varphi_{01})
\\]
\\[
T = t_2 - t_1
\\]
\\[
\\omega = \\frac{2\\pi}{T}
\\]
`,
    subpuncte: [
      {
        id: '13a',
        cerinta: 'Amplitudinea de oscilaţie',
        punctaj: 1.5
      },
      {
        id: '13b',
        cerinta: 'Perioada de oscilaţie',
        punctaj: 1.5
      },
      {
        id: '13c',
        cerinta: 'Legea de mişcare y=f(t)',
        punctaj: 3
      },
      {
        id: '13d',
        cerinta: 'Dependenţa de timp a vitezei',
        punctaj: 4
      }
    ],
    punctajTotal: 10,
    date: {
     'Pentru a raspunde la cerinte ':'consulta figura intr-o fereastra noua.',
    },
  },
];
// Date cunoscute:

// $$
// v_l = 50 m/s
// $$

// $$
// v_t = 30 m/s
// $$

// $$
// v = 50 Hz
// $$

// $$
// A_1 = 4 mm
// $$

// $$
// A_t = 3 mm
// $$

// $$
// \\varphi_{01} = \\dfrac{\\pi}{6}
// $$

// $$
// \\varphi_{0t} = \\dfrac{\\pi}{3}
// $$
