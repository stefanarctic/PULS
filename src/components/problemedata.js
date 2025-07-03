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
    continut: 'Pentru undele seismice P (primare), viteza se calculează folosind formula v = d/t.',
    formule: ['v = d/t', 't = d/v'],
    date: {
      distanta: 150,
      timp: 25,
      unitate_viteza: 'km/s'
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
    continut: 'Undele S (secundare) se propagă mai lent decât undele P.',
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
    continut: 'Se folosește formula h = (1/2)gt² pentru căderea liberă.',
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
    continut: 'Accelerația pe plan înclinat: a = g sin(θ).',
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
    continut: 'Perioada pendulului: T = 2π√(l/g).',
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
    continut: 'Oscilațiile amortizate au amplitudinea în scădere exponențială.',
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
    continut: 'Lungimea de undă: λ = v/f.',
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
    continut: 'Interferența apare când două unde se suprapun.',
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
    continut: 'Figurile Lissajous apar la suprapunerea a două oscilații perpendiculare.',
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
    continut: 'Raportul frecvențelor determină numărul de bucle.',
    formule: ['x = A sin(2ωt)', 'y = B sin(ωt + φ)'],
    date: { fx: 2, fy: 1 }
  }
];
