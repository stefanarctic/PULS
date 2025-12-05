// Probleme de exemplu pentru categoria Bac
// Aceste probleme pot fi încărcate în Firestore folosind uploadProblems.js sau adăugate manual prin interfața admin

export const bacProblems = [
  {
    id: 'bac-1',
    index: 100, // Index înalt pentru a nu se suprapune cu problemele existente
    titlu: 'Mișcare rectilinie uniformă - Bac 2023',
    descriere: 'Problema tipică de bacalaureat despre mișcarea rectilinie uniformă',
    categorie: 'Bac',
    dificultate: 'mediu',
    creator: '',
    subpuncte: [
      {
        id: 'bac1a',
        cerinta: 'Reprezentați grafic dependența de timp a coordonatei x(t) pentru mișcarea rectilinie uniformă.',
        punctaj: 2
      },
      {
        id: 'bac1b',
        cerinta: 'Calculați distanța parcursă de mobil în intervalul de timp t = 0 s până la t = 10 s.',
        punctaj: 3
      },
      {
        id: 'bac1c',
        cerinta: 'Determinați viteza medie pe întregul interval de mișcare.',
        punctaj: 2
      }
    ],
    punctajTotal: 7,
    continut: `Un mobil se deplasează rectiliniu uniform pe axa Ox. La momentul inițial $t_0 = 0$ s, coordonata mobilului este $x_0 = 5$ m, iar viteza sa este $v = 3$ m/s.

Ecuația de mișcare este: $x(t) = x_0 + v \\cdot t$

unde:
- $x_0$ este coordonata inițială
- $v$ este viteza constantă
- $t$ este timpul`,
    formule: [
      'x(t) = x₀ + v·t',
      'd = v·t',
      'v_med = Δx/Δt'
    ],
    date: {
      'x₀': '5 m',
      'v': '3 m/s',
      't₁': '0 s',
      't₂': '10 s'
    }
  },
  {
    id: 'bac-2',
    index: 101,
    titlu: 'Căderea liberă - Bac 2022',
    descriere: 'Problema de bacalaureat despre căderea liberă a unui corp',
    categorie: 'Bac',
    dificultate: 'mediu',
    creator: '',
    subpuncte: [
      {
        id: 'bac2a',
        cerinta: 'Calculați timpul de cădere de la înălțimea h = 20 m.',
        punctaj: 3
      },
      {
        id: 'bac2b',
        cerinta: 'Determinați viteza cu care corpul atinge solul.',
        punctaj: 3
      },
      {
        id: 'bac2c',
        cerinta: 'Reprezentați grafic dependența vitezei de timp v(t).',
        punctaj: 2
      }
    ],
    punctajTotal: 8,
    continut: `Un corp este lăsat să cadă liber de la înălțimea $h = 20$ m față de sol. Se neglijează rezistența aerului.

Pentru căderea liberă:
- Legea spațiului: $h = \\frac{1}{2}gt^2$
- Legea vitezei: $v = gt$
- Accelerația gravitațională: $g = 9,8$ m/s²`,
    formule: [
      'h = (1/2)gt²',
      'v = gt',
      'v² = 2gh'
    ],
    date: {
      'h': '20 m',
      'g': '9,8 m/s²'
    }
  },
  {
    id: 'bac-3',
    index: 102,
    titlu: 'Legea conservării energiei mecanice - Bac 2023',
    descriere: 'Aplicarea legii conservării energiei mecanice',
    categorie: 'Bac',
    dificultate: 'mediu',
    creator: '',
    subpuncte: [
      {
        id: 'bac3a',
        cerinta: 'Calculați energia potențială gravitațională a corpului la înălțimea h = 10 m.',
        punctaj: 2
      },
      {
        id: 'bac3b',
        cerinta: 'Determinați viteza corpului când acesta se află la jumătatea înălțimii.',
        punctaj: 4
      },
      {
        id: 'bac3c',
        cerinta: 'Verificați conservarea energiei mecanice totale.',
        punctaj: 2
      }
    ],
    punctajTotal: 8,
    continut: `Un corp cu masa $m = 2$ kg este lansat vertical în sus cu viteza inițială $v_0 = 10$ m/s de la nivelul solului. Se neglijează rezistența aerului.

Energia mecanică totală se conservă:
$E_m = E_c + E_p = \\text{constant}$

unde:
- $E_c = \\frac{1}{2}mv^2$ este energia cinetică
- $E_p = mgh$ este energia potențială gravitațională`,
    formule: [
      'E_c = (1/2)mv²',
      'E_p = mgh',
      'E_m = E_c + E_p = constant'
    ],
    date: {
      'm': '2 kg',
      'v₀': '10 m/s',
      'h_max': '10 m',
      'g': '9,8 m/s²'
    }
  },
  {
    id: 'bac-4',
    index: 103,
    titlu: 'Oscilații armonice - Pendul simplu - Bac 2022',
    descriere: 'Problema de bacalaureat despre oscilațiile pendulului simplu',
    categorie: 'Bac',
    dificultate: 'mediu',
    creator: '',
    subpuncte: [
      {
        id: 'bac4a',
        cerinta: 'Calculați perioada de oscilație a pendulului pentru lungimea l = 1 m.',
        punctaj: 3
      },
      {
        id: 'bac4b',
        cerinta: 'Determinați frecvența de oscilație.',
        punctaj: 2
      },
      {
        id: 'bac4c',
        cerinta: 'Calculați viteza maximă a pendulului pentru amplitudinea A = 0,1 m.',
        punctaj: 3
      }
    ],
    punctajTotal: 8,
    continut: `Un pendul simplu are lungimea $l = 1$ m și este lăsat să oscileze cu amplitudinea mică $A = 0,1$ m.

Pentru pendulul simplu:
- Perioada: $T = 2\\pi\\sqrt{\\frac{l}{g}}$
- Frecvența: $f = \\frac{1}{T}$
- Viteza maximă: $v_{max} = A\\omega = A \\cdot \\frac{2\\pi}{T}$

unde $g = 9,8$ m/s² este accelerația gravitațională.`,
    formule: [
      'T = 2π√(l/g)',
      'f = 1/T',
      'v_max = Aω = A·(2π/T)',
      'ω = 2πf'
    ],
    date: {
      'l': '1 m',
      'A': '0,1 m',
      'g': '9,8 m/s²'
    }
  },
  {
    id: 'bac-5',
    index: 104,
    titlu: 'Unde mecanice - Lungime de undă și frecvență - Bac 2023',
    descriere: 'Problema de bacalaureat despre undele mecanice',
    categorie: 'Bac',
    dificultate: 'mediu',
    creator: '',
    subpuncte: [
      {
        id: 'bac5a',
        cerinta: 'Calculați lungimea de undă pentru o undă sonoră cu frecvența f = 440 Hz, știind că viteza sunetului în aer este v = 340 m/s.',
        punctaj: 3
      },
      {
        id: 'bac5b',
        cerinta: 'Determinați perioada undei.',
        punctaj: 2
      },
      {
        id: 'bac5c',
        cerinta: 'Calculați numărul de unde care trec printr-un punct într-un interval de timp Δt = 1 s.',
        punctaj: 3
      }
    ],
    punctajTotal: 8,
    continut: `O undă sonoră se propagă în aer cu viteza $v = 340$ m/s. Frecvența undei este $f = 440$ Hz.

Relațiile fundamentale pentru unde:
- Lungimea de undă: $\\lambda = \\frac{v}{f}$
- Perioada: $T = \\frac{1}{f}$
- Numărul de unde: $N = f \\cdot \\Delta t$`,
    formule: [
      'λ = v/f',
      'T = 1/f',
      'v = λf',
      'N = f·Δt'
    ],
    date: {
      'f': '440 Hz',
      'v': '340 m/s',
      'Δt': '1 s'
    }
  },
  {
    id: 'bac-6',
    index: 105,
    titlu: 'Legea lui Hooke și oscilații elastice - Bac 2022',
    descriere: 'Problema de bacalaureat despre oscilațiile unui sistem masă-resort',
    categorie: 'Bac',
    dificultate: 'dificil',
    creator: '',
    subpuncte: [
      {
        id: 'bac6a',
        cerinta: 'Calculați constanta elastică a resortului când masa m = 0,5 kg produce o alungire Δl = 0,1 m.',
        punctaj: 3
      },
      {
        id: 'bac6b',
        cerinta: 'Determinați perioada de oscilație a sistemului masă-resort.',
        punctaj: 3
      },
      {
        id: 'bac6c',
        cerinta: 'Calculați energia totală a oscilației pentru amplitudinea A = 0,05 m.',
        punctaj: 4
      }
    ],
    punctajTotal: 10,
    continut: `Un resort elastic are constanta elastică $k$. O masă $m = 0,5$ kg este atașată de resort și produce o alungire $\\Delta l = 0,1$ m.

Legea lui Hooke: $F = k \\cdot \\Delta l$

Pentru sistemul masă-resort:
- Perioada: $T = 2\\pi\\sqrt{\\frac{m}{k}}$
- Energia totală: $E = \\frac{1}{2}kA^2$

unde $A$ este amplitudinea oscilației.`,
    formule: [
      'F = k·Δl',
      'k = mg/Δl',
      'T = 2π√(m/k)',
      'E = (1/2)kA²',
      'ω = √(k/m)'
    ],
    date: {
      'm': '0,5 kg',
      'Δl': '0,1 m',
      'A': '0,05 m',
      'g': '9,8 m/s²'
    }
  }
];

