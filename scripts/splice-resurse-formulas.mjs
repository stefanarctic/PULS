import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const p = join(__dir, "../src/components/pages/Resurse.jsx");
let lines = readFileSync(p, "utf8").split(/\r?\n/);

const before = lines.slice(0, 170);
const after = lines.slice(2274);

const insert = [
  "  const formulaSheets = useMemo(() => {",
  "    const base = {",
  "      mecanica: MECANICA_FORMULAS_RO,",
  "      termodinamica: TERMODINAMICA_FORMULAS_RO,",
  "      seism: SEISM_FORMULAS_RO,",
  "      unde: UNDE_FORMULAS_RO,",
  "      prisma: PRISMA_FORMULAS_RO,",
  "      pendule: PENDULE_FORMULAS_RO,",
  "      lissajous: LISSAJOUS_FORMULAS_RO,",
  "      electricitate: ELECTRICITATE_FORMULAS_RO,",
  "      electromagnetism: ELECTROMAGNETISM_FORMULAS_RO,",
  "      optica: OPTICA_FORMULAS_RO,",
  "      lasere: LASERE_FORMULAS_RO,",
  "      matematica: MATEMATICA_FORMULAS_RO,",
  "      astronomie: ASTRONOMIE_FORMULAS_RO,",
  "      atomul: ATOMUL_FORMULAS_RO,",
  "      fizica_cuantica: FIZICA_CUANTICA_FORMULAS_RO,",
  "      fizica_nucleara: FIZICA_NUCLEARA_FORMULAS_RO,",
  "      relativitate: RELATIVITATE_FORMULAS_RO,",
  "    };",
  "    if (lang !== 'en') return base;",
  "    return Object.fromEntries(",
  "      Object.entries(base).map(([k, ro]) => [k, localizeFormulaSheet(ro, lang)])",
  "    );",
  "  }, [lang]);",
  "",
];

const out = [...before, ...insert, ...after].join("\n");
writeFileSync(p, out, "utf8");
console.log("Done lines", lines.length, "->", out.split("\n").length);
