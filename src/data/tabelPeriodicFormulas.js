/**
 * Relații utile pentru tabelul periodic (Z, A, moli, Avogadro).
 * Folosit la lecția Termodinamică (secțiunea cu tabelul) și la lecția Atomul.
 */
export const tabelPeriodicFormulas = [
  {
    formula: "\\( Z = p \\)",
    title: "Numărul atomic (Z) = numărul de protoni",
    explanation:
      "Z este numărul de protoni din nucleu; la atom neutru coincide cu numărul de electroni. Îl citești direct din tabelul periodic.",
  },
  {
    formula: "\\( A = Z + N \\)",
    title: "Numărul de masă (A)",
    explanation: "A însumează protonii și neutronii din nucleu. Izotopul este indicat prin A împreună cu simbolul elementului.",
  },
  {
    formula: "\\( N = A - Z \\)",
    title: "Numărul de neutroni (N)",
    explanation: "Cu A și Z cunoscute, afli rapid câți neutroni are nucleul: N = A − Z.",
  },
  {
    formula: "\\( n = \\frac{m}{M} \\)",
    title: "Numărul de moli",
    explanation: "Masa molară M (g/mol) se ia din tabelul periodic. Raportul m/M dă molii de substanță — esențial în gaze și stoichiometrie.",
  },
  {
    formula: "\\( m = nM \\)",
    title: "Masa unei substanțe (din moli)",
    explanation: "Inversul formulei anterioare: din numărul de moli și masa molară obții masa în grame.",
  },
  {
    formula: "\\( N = nN_A \\)",
    title: "Numărul de particule",
    explanation: "Leagă molii de numărul de atomi sau molecule: înmulțești cu constanta lui Avogadro N_A.",
  },
  {
    formula: "\\( N_A \\approx 6{,}022\\times 10^{23}\\,\\text{mol}^{-1} \\)",
    title: "Constanta lui Avogadro",
    explanation: "Numărul de entități elementare (atomi, molecule…) într-un mol; folosită la trecerea între scară macroscopică și microscopică.",
  },
  {
    formula: "\\( c = \\frac{n}{V} \\)",
    title: "Concentrația molară",
    explanation: "Concentrația molară (mol/L sau mol/m³) leagă numărul de moli de volumul soluției sau al amestecului.",
  },
];
