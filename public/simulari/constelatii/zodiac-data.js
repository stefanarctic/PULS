/**
 * Cele 12 zodii ca constelații astronomice (cer „real”).
 * stele: [RA ore zecimale, Dec grade]
 * segments: indici în lista stele
 */

export const ZODIAC_HOOK =
  "Horoscopul din ziar e „tropical”. Aici vezi constelațiile de pe harta astronomilor, același cer, alt poveste.";

export const ZODIAC_DEFINITIONS = [
  {
    id: "aries",
    title: "Berbec · Aries",
    colorLine: 0xff8a65,
    colorNode: 0xffb59d,
    hitRadius: 88,
    stars: [
      [2.119, 23.46],
      [1.911, 20.8],
      [1.892, 19.29],
    ],
    segments: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
    myth:
      "Berbecul auriu din basmul lui Phrixos și Helle, sacrificat apoi pe altar, Zeus l-a rânduit pe boltă ca amintire a curajului (și a unui truc cu viscol de aur).",
    find:
      "Întinde linia pe bandă ecleptică spre est de „șaua” Pești–Berbec; Hamal e portocaliu-strălucitor. " +
      ZODIAC_HOOK,
  },
  {
    id: "taurus",
    title: "Taur · Taurus",
    colorLine: 0x7ecf7e,
    colorNode: 0xb8f0b0,
    hitRadius: 92,
    stars: [
      [4.599, 16.51],
      [5.438, 28.61],
      [3.791, 24.11],
    ],
    segments: [
      [0, 1],
      [0, 2],
    ],
    myth:
      "Zeus însuși s-a prefăcut în taur ca s-o răpească pe Europa; în alt mit, taurul e creatura pe care o vânează Heracle. Aldebaran licăre ca ochiul roșcat al fiarei.",
    find:
      "Vara-toamnă urmărește planeta Venus pe același arc cu Aldebaran și roiul Hyadelor. Elnath e coarne strălucitoare spre Gemini. " +
      ZODIAC_HOOK,
  },
  {
    id: "gemini",
    title: "Gemeni · Gemini",
    colorLine: 0xfff176,
    colorNode: 0xfff9c4,
    hitRadius: 90,
    stars: [
      [7.577, 31.89],
      [7.755, 28.03],
      [6.629, 16.4],
      [7.069, 22.57],
    ],
    segments: [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
    ],
    myth:
      "Castor și Pollux, fiii lui Leda: unul muritor, unul nemuritor, împărțind același nume pe cer, gemenii care nu se lasă despărțiți nici în stele.",
    find:
      "Două stele strălucitoare apropiate, Castor și Pollux, de nedespărțit pe bolta de primăvară. " + ZODIAC_HOOK,
  },
  {
    id: "cancer",
    title: "Rac · Cancer",
    colorLine: 0x90caf9,
    colorNode: 0xc5e4ff,
    hitRadius: 95,
    stars: [
      [8.975, 11.86],
      [8.275, 21.47],
      [8.745, 18.15],
    ],
    segments: [
      [1, 2],
      [2, 0],
      [0, 1],
    ],
    myth:
      "Racul a mușcat cârja lui Heracle în lupta cu Hidra, o zbatere mică, pedepsită cu loc pe boltă.",
    find:
      "Constelație palidă între Gemeni și Leu; „cuibul Racului” (Beehive / Praesepe) e lângă stelele Asellorum. " +
      ZODIAC_HOOK,
  },
  {
    id: "leo",
    title: "Leu · Leo",
    colorLine: 0xffca28,
    colorNode: 0xffe082,
    hitRadius: 94,
    stars: [
      [10.14, 11.97],
      [10.333, 19.84],
      [11.235, 20.52],
      [11.818, 14.57],
    ],
    segments: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    myth:
      "Primul labor al lui Heracle, nemeul lion, pe cer, Regulus e inima fiarei; zmeul spintecat devine asterismul secerei (sickle).",
    find:
      "Regulus strălucește pe banda ecliptică; „secera” Leului urcă spre capul constelației, apoi șirul coboară spre Denebola. " +
      ZODIAC_HOOK,
  },
  {
    id: "virgo",
    title: "Fecioara · Virgo",
    colorLine: 0xb2df99,
    colorNode: 0xdcedc8,
    hitRadius: 88,
    stars: [
      [13.42, -11.16],
      [12.694, -1.45],
      [13.036, 10.96],
    ],
    segments: [
      [0, 1],
      [1, 2],
    ],
    myth:
      "Demeter / Astrea, ultima nemuritoare lăsată pe Pământ, sau fecioara cu spiga, Spica e secera de grâu strălucitoare.",
    find:
      "Spica e una dintre cele mai strălucitoare stele ale serii; urcă pe bolta de primăvară spre sud-est după apusul Berbecului. " +
      ZODIAC_HOOK,
  },
  {
    id: "libra",
    title: "Balanța · Libra",
    colorLine: 0xf48fb1,
    colorNode: 0xfce4ec,
    hitRadius: 100,
    stars: [
      [14.848, -16.04],
      [15.283, -9.38],
    ],
    segments: [[0, 1]],
    myth:
      "Ghearele Scorpionului devenite taler, zeita Themis și justiția cosmică; Balanța e singura zodie „obiect”, nu făptură.",
    find:
      "Două stele strălucitoare, vestigii din ghearele vechi ale Scorpionului; între Fecioară și Antares. " +
      ZODIAC_HOOK,
  },
  {
    id: "scorpius",
    title: "Scorpion · Scorpius",
    colorLine: 0xff5252,
    colorNode: 0xff8a80,
    hitRadius: 100,
    stars: [
      [16.49, -26.43],
      [17.56, -37.11],
      [17.622, -42.998],
      [16.006, -22.62],
    ],
    segments: [
      [3, 0],
      [0, 1],
      [1, 2],
    ],
    myth:
      "Orion lăudăcios, înțepat de scorpion trimis de Artemis, pe cer, vânătorul și fiara sunt puse la distanță veșnică.",
    find:
      "Antares, „inima” roșie, e neschimbător reper pe cerul de vară; coada îndreptată spre sud desenează litera J. " +
      ZODIAC_HOOK,
  },
  {
    id: "sagittarius",
    title: "Săgetător · Sagittarius",
    colorLine: 0xffab40,
    colorNode: 0xffcc80,
    hitRadius: 102,
    stars: [
      [18.097, -30.06],
      [18.346, -29.83],
      [18.397, -34.38],
      [18.433, -25.42],
      [18.921, -26.3],
      [18.784, -29.87],
    ],
    segments: [
      [0, 1],
      [1, 2],
      [1, 5],
      [5, 4],
      [4, 2],
      [2, 3],
    ],
    myth:
      "Centaurul Cheiron, blând învățător și rănit cu săgeată otrăvită în cer ține arcul spre inima Scorpionului.",
    find:
      "„Ceainicul” din Sagittarius e asterism ușor de recunoscut pe bolta de vară (Milky Way în ceașcă). " + ZODIAC_HOOK,
  },
  {
    id: "capricornus",
    title: "Capricorn · Capricornus",
    colorLine: 0x9fa8da,
    colorNode: 0xc5cae9,
    hitRadius: 94,
    stars: [
      [21.784, -16.13],
      [21.674, -16.84],
      [20.35, -14.78],
    ],
    segments: [
      [0, 1],
      [1, 2],
    ],
    myth:
      "Capra-fish a zeului Pan, care s-a cufundat în Nil în cozi de pește ca să fugă de Tifon, jumătate țap, jumătate pește.",
    find:
      "Spre sud pe ecliptică după Sagittarius; triunghiul lui Deneb Algedi urcă târziu-toamnă deasupra orizontului. " +
      ZODIAC_HOOK,
  },
  {
    id: "aquarius",
    title: "Vărsător · Aquarius",
    colorLine: 0x4fc3f7,
    colorNode: 0xb3e5fc,
    hitRadius: 96,
    stars: [
      [22.961, -0.06],
      [21.527, -5.57],
      [22.361, -0.49],
    ],
    segments: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
    myth:
      "Ganymede, paharul zeilor, Vărsătorul varsă apele din amforă cerească; constelația marchează potopul binecuvântat al ploii.",
    find:
      "Sadalmelik și Sadalsuud pe banda ecuatorială; urcă pe cer de toamnă până în iarnă, lângă Pești. " + ZODIAC_HOOK,
  },
  {
    id: "pisces",
    title: "Pești · Pisces",
    colorLine: 0xce93d8,
    colorNode: 0xe1bee7,
    hitRadius: 98,
    stars: [
      [2.034, 15.35],
      [23.065, 3.82],
      [1.757, 9.16],
    ],
    segments: [
      [0, 1],
      [1, 2],
    ],
    myth:
      "Aphrodite și Eros legați cu sfoară ca să scape de Tifon, cei doi pești împletiți au devenit simbolul ascensiunii din ape.",
    find:
      "Lanțul palid de stele pe ecliptică, vest de W din Andromeda; Alrescha strălucește spre „nodul” Pești-Andromeda. " +
      ZODIAC_HOOK,
  },
];
