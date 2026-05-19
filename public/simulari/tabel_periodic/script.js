const table = document.getElementById("periodicTable");
const modal = document.getElementById("elementModal");
const modalHeader = document.getElementById("modalHeader");
const panelGeneral = document.getElementById("panelGeneral");
const panelElectronic = document.getElementById("panelElectronic");
const panelVisual = document.getElementById("panelVisual");
const closeBtn = document.getElementById("closeModal");
const prevBtn = document.getElementById("prevElement");
const nextBtn = document.getElementById("nextElement");

// Elemente ordonate după număr atomic pentru navigare
const elementsByNumber = [...elements].sort((a, b) => a.number - b.number);

// Numere atomice ale elementelor radioactive (fără izotop stabil sau sintetice)
const RADIOACTIVE_NUMBERS = new Set([
  43, 61,                                    // Tc, Pm
  84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103,  // Po → Lr
  ...Array.from({ length: 15 }, (_, i) => 104 + i)  // Rf → Og
]);
function isRadioactive(el) { return RADIOACTIVE_NUMBERS.has(el.number); }

const NOBLE_GAS_CONFIG = {
  "[He]": "1s2",
  "[Ne]": "1s2 2s2 2p6",
  "[Ar]": "1s2 2s2 2p6 3s2 3p6",
  "[Kr]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6",
  "[Xe]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6",
  "[Rn]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6"
};

const SUPER = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function toSuperscript(str) {
  return str.replace(/\d/g, d => SUPER[+d]);
}

const LANG_EN = typeof window !== "undefined" && window.__TABEL_LANG__ === "en";

function lbl(path, ro) {
  if (!LANG_EN || typeof window.simLbl !== "function") return ro;
  return window.simLbl(path, ro);
}

/** Replace {{key}} placeholders in translator strings */
function tmpl(str, vars) {
  if (!str || !vars) return str;
  let s = String(str);
  for (const key of Object.keys(vars)) {
    const v = vars[key];
    s = s.split("{{" + key + "}}").join(v == null ? "" : String(v));
  }
  return s;
}

function elemDisplayName(el) {
  const b = typeof window !== "undefined" ? window.__SIMULATOR_UI_I18N__ : null;
  if (LANG_EN && b && b.elementNames && b.elementNames[el.symbol]) return b.elementNames[el.symbol];
  return el.name;
}



function getFullConfig(short) {
  let s = String(short).trim();
  for (const [noble, exp] of Object.entries(NOBLE_GAS_CONFIG)) {
    if (s.startsWith(noble)) {
      s = exp + " " + s.slice(noble.length).trim();
      break;
    }
  }
  return s.trim();
}

function parseSublevels(fullConfig) {
  const parts = fullConfig.split(/\s+/).filter(Boolean);
  const result = [];
  for (const p of parts) {
    const m = p.match(/^(\d)([spdf])(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      const letter = m[2];
      const l = { s: 0, p: 1, d: 2, f: 3 }[letter];
      const electrons = parseInt(m[3], 10);
      result.push({ n, l, letter, electrons, key: `${n}${letter}` });
    }
  }
  return result;
}

/** Regula Madelung / ordinea Aufbau la scriere: 1s 2s 2p … 4s înainte de 3d, etc. */
function madelungSortKey(sl) {
  const lNum = { s: 0, p: 1, d: 2, f: 3 }[sl.letter];
  return (sl.n + lNum) * 100 + sl.n;
}

function sortSublevelsAufbau(sublevels) {
  return [...sublevels].sort((a, b) => madelungSortKey(a) - madelungSortKey(b));
}

function formatSublevelsToString(sublevels) {
  return sublevels.map(({ n, letter, electrons }) => `${n}${letter}${electrons}`).join(" ");
}

/** Configurație completă expandată, sortată Aufbau (ex: … 4s¹ 3d¹⁰, nu 3d¹⁰ 4s¹). */
function formatFullConfigAufbauDisplay(shortRaw) {
  const full = getFullConfig(shortRaw);
  const sorted = sortSublevelsAufbau(parseSublevels(full));
  return formatSublevelsToString(sorted);
}

/** Varianta prescurtată: păstrează gazul nobil, sortează restul (ex: [Ar] 4s¹ 3d¹⁰). */
function formatShortConfigAufbau(shortRaw) {
  const s = String(shortRaw).trim();
  const m = s.match(/^(\[[^\]]+\])\s*(.*)$/);
  if (m) {
    const noble = m[1];
    const rest = m[2].trim();
    if (!rest) return s.replace(/\s+/g, " ");
    const sorted = sortSublevelsAufbau(parseSublevels(rest));
    return `${noble} ${formatSublevelsToString(sorted)}`.replace(/\s+/g, " ").trim();
  }
  const sorted = sortSublevelsAufbau(parseSublevels(s));
  return formatSublevelsToString(sorted);
}

/** Explicații pentru configurații excepționale la metale de tranziție (scriere Aufbau + stabilitate d⁵ / d¹⁰ etc.). */
const CONFIG_EXCEPTION_SHELL_NOTES = {
  Cr: `Scriere standard (Aufbau): <strong>4s¹ 3d⁵</strong>. Excepție clasică: subnivelul <strong>d</strong> semicomplet (d⁵) cu un singur electron pe <strong>4s</strong> este mai stabil. Ultimul electron care completează subnivelul d până la d⁵ este în <strong>3d</strong>. Distribuția pe straturi (n=3 → 13 e⁻, n=4 → 1 e⁻) reflectă această anomalie.`,
  Mo: `Scriere standard (Aufbau): <strong>5s¹ 4d⁵</strong> — același tip de excepție ca la crom: <strong>d⁵</strong> semicomplet cu <strong>5s¹</strong>. Ultimul electron care umple d până la 4d⁵ este în <strong>4d</strong>.`,
  Cu: `Scriere standard (Aufbau): <strong>4s¹ 3d¹⁰</strong> — subnivelul 4s se scrie înaintea lui 3d. Ultimul electron care completează subnivelul 3d este în <strong>3d</strong> (electron diferențiator pentru grupă). Distribuția pe straturi (n=3 → 18 e⁻, n=4 → 1 e⁻) reflectă excepția: un electron de pe 4s participă la umplerea stabilă a lui 3d¹⁰.`,
  Ag: `Scriere standard (Aufbau): <strong>5s¹ 4d¹⁰</strong> — același tip de excepție ca la cupru: subnivelul <strong>d</strong> plin (4d¹⁰) cu <strong>5s¹</strong>. Ultimul electron care finalizează 4d¹⁰ este în <strong>4d</strong>.`,
  Au: `Scriere standard (Aufbau): <strong>6s¹ 4f¹⁴ 5d¹⁰</strong> (ordinea Madelung). Excepție ca la Ag/Cu: <strong>5d¹⁰</strong> plin cu <strong>6s¹</strong>. Ultimul electron care completează 5d¹⁰ este în <strong>5d</strong>.`,
  Nb: `Scriere standard (Aufbau): <strong>5s¹ 4d⁴</strong>. Configurație excepțională (ns¹ (n−1)d<sup>x</sup>): stabilitate crescută prin aranjamentul pe d și un singur electron pe s. Ultimul electron plasat în ordinea Aufbau este în subnivelul <strong>d</strong>.`,
  Ru: `Scriere standard (Aufbau): <strong>5s¹ 4d⁷</strong>. Excepție față de umplerea „standard”; ultimul electron care contribuie la configurarea valenței este tratat în manuale pe subnivelul <strong>d</strong> (vezi și parametrii cuantici).`,
  Rh: `Scriere standard (Aufbau): <strong>5s¹ 4d⁸</strong>. Excepție similară altor metale din seria 4d: un electron pe <strong>5s</strong> și aranjament particular pe <strong>4d</strong>; ultimul electron în ordinea Aufbau pe subnivelul <strong>d</strong>.`,
  Pt: `Scriere standard (Aufbau): <strong>6s¹ 4f¹⁴ 5d⁹</strong>. Excepție (5d incomplet cu 6s¹); ultimul electron care completează treptat 5d este descris în subnivelul <strong>5d</strong>.`,
  Pd: `Excepție majoră: <strong>[Kr] 4d¹⁰</strong> — <em>fără</em> electroni pe 5s. Subnivelul <strong>4d</strong> plin este mai stabil decât varianta cu 5s²; distribuția pe straturi reflectă absența electronilor pe stratul 5s.`,
};

function shellInterpretationNote(el) {
  const enInner = LANG_EN ? window.__SIMULATOR_UI_I18N__?.configExceptions?.[el.symbol] : null;
  const inner = typeof enInner === "string" ? enInner : CONFIG_EXCEPTION_SHELL_NOTES[el.symbol];
  return inner ? `<p class="config-note">${inner}</p>` : "";
}

/** Text după eticheta subnivelului în blocul „Parametri cuantici”. */
function getQuantumFoot(el) {
  const sym = el.symbol;
  if (LANG_EN) {
    const qf = window.__SIMULATOR_UI_I18N__?.quantumFoot || {};
    const qn = window.__SIMULATOR_UI_I18N__?.quantumElementNames || {};
    if (sym === "Cr" || sym === "Mo") {
      const name = sym === "Cr" ? qn.Cr ?? "chromium" : qn.Mo ?? "molybdenum";
      return String(qf.CrMoSuffix || "").replace(/\$\{name\}/g, name);
    }
    if (sym === "Cu" || sym === "Ag" || sym === "Au") {
      let name = "copper";
      if (sym === "Ag") name = qn.Ag ?? "silver";
      else if (sym === "Au") name = qn.Au ?? "gold";
      else name = qn.Cu ?? "copper";
      return String(qf.CuAgAuSuffix || "").replace(/\$\{name\}/g, name);
    }
    if (sym === "Nb" || sym === "Ru" || sym === "Rh") return qf.NbRuRhSuffix || "";
    if (sym === "Pt") return qf.PtSuffix || "";
    if (sym === "Pd") return qf.PdSuffix || "";
    return ".";
  }

  if (sym === "Cr" || sym === "Mo") {
    const name = sym === "Cr" ? "crom" : "molibden";
    return ` — la ${name}, ultimul electron care umple subnivelul d până la configurația d⁵ este în <strong>d</strong> (parametrii de mai jos corespund ultimului electron din subnivelul d).`;
  }
  if (sym === "Cu" || sym === "Ag" || sym === "Au") {
    const name = sym === "Cu" ? "cupru" : sym === "Ag" ? "argint" : "aur";
    return ` — la ${name}, ultimul electron care finalizează subnivelul d plin (d¹⁰) este în <strong>d</strong> (parametrii corespund acestui electron).`;
  }
  if (sym === "Nb" || sym === "Ru" || sym === "Rh") {
    return ` — configurație excepțională; ultimul electron plasat în ordinea Aufbau este în subnivelul <strong>d</strong> (vezi nota de mai sus).`;
  }
  if (sym === "Pt") {
    return ` — la platină, ultimul electron care completează subnivelul 5d este în <strong>5d</strong> (parametrii corespund acestui electron).`;
  }
  if (sym === "Pd") {
    return ` — paladiu nu are electroni pe 5s; parametrii corespund ultimului electron din subnivelul <strong>4d</strong>.`;
  }
  return ".";
}

function generateOrbitals(l, electrons) {
  const orbitals = 2 * l + 1;
  const slots = [];
  for (let i = 0; i < orbitals; i++) slots.push([]);
  let e = electrons;
  for (let i = 0; i < orbitals && e > 0; i++) {
    slots[i].push("up");
    e--;
  }
  for (let i = 0; i < orbitals && e > 0; i++) {
    slots[i].push("down");
    e--;
  }
  return slots;
}

function getLastElectron(sublevels) {
  if (!sublevels.length) return null;
  const last = sublevels[sublevels.length - 1];
  const { n, l, electrons } = last;
  const orbitals = 2 * l + 1;
  const orbIndex = electrons <= orbitals ? electrons - 1 : electrons - orbitals - 1;
  const m = -l + orbIndex;
  const isDown = electrons > orbitals;
  const s = isDown ? "-1/2" : "+1/2";
  return { n, l, m, s };
}

function categoryToClass(category) {
  return "category-" + category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/ă|â/g, "a")
    .replace(/ț/g, "t")
    .replace(/î/g, "i")
    .replace(/ș/g, "s");
}

function categoryDisplay(cat) {
  const b = typeof window !== "undefined" ? window.__SIMULATOR_UI_I18N__ : null;
  const key = categoryToClass(cat);
  if (LANG_EN && b && b.categories && typeof b.categories[key] === "string") return b.categories[key];
  return cat;
}

function isoDataset() {
  return typeof window !== "undefined" && window.ISOTOPE_DATA ? window.ISOTOPE_DATA : (typeof ISOTOPE_DATA !== "undefined" ? ISOTOPE_DATA : {});
}

// Culori reale pentru sfera 3D în popup – aspect fizic al fiecărui element: { light, base }
const SPHERE_BY_SYMBOL = {
  H:  { light: "#f0f4f8", base: "#a8b8c8" },   // incolor/gri deschis (gaz)
  He: { light: "#e8f4ff", base: "#b0d0e8" },   // incolor, ușor albastru
  Li: { light: "#e8e8e8", base: "#b0b0b0" },   // argintiu alb
  Be: { light: "#c8d0d0", base: "#788080" },   // gri oțel
  B:  { light: "#585858", base: "#2a2a2a" },   // negru/maro (amorf)
  C:  { light: "#606060", base: "#1a1a1a" },   // negru (grafit)
  N:  { light: "#a0c8f0", base: "#6088c0" },   // albastru pal (lichid)
  O:  { light: "#88b8f0", base: "#5080c0" },   // albastru pal
  F:  { light: "#ffe858", base: "#c8b030" },   // galben pal (gaz)
  Ne: { light: "#ffb8c8", base: "#e08898" },   // roșu-portocaliu (tub descărcare)
  Na: { light: "#e8e8e8", base: "#b0b0b0" },   // argintiu alb
  Mg: { light: "#e8e8e0", base: "#b8b8a8" },   // argintiu alb
  Al: { light: "#c8d0d0", base: "#889090" },   // argintiu
  Si: { light: "#808890", base: "#485058" },   // gri închis, metalic
  P:  { light: "#fff0c0", base: "#d0b860" },   // alb-gălbui / roșu (alb)
  S:  { light: "#ffe040", base: "#c9a020" },   // galben
  Cl: { light: "#d8f040", base: "#98b020" },   // galben-verzui (gaz)
  Ar: { light: "#c8e0f0", base: "#88b0d0" },   // incolor
  K:  { light: "#e0d8c8", base: "#a89880" },   // argintiu (se oxidează gri)
  Ca: { light: "#e8e8e8", base: "#b0b0b0" },   // argintiu alb
  Sc: { light: "#d8d8d8", base: "#a0a0a0" },   // argintiu alb
  Ti: { light: "#c0c4c8", base: "#787c80" },   // argintiu
  V:  { light: "#a8acb0", base: "#686c70" },   // gri
  Cr: { light: "#a0a4a8", base: "#585c60" },   // gri albastruiu
  Mn: { light: "#b0b4a8", base: "#707468" },   // argintiu/gri
  Fe: { light: "#b8a898", base: "#706050" },   // gri metalic
  Co: { light: "#a8a8b0", base: "#686870" },   // gri cu nuanță albastră
  Ni: { light: "#c0c0b8", base: "#787870" },   // argintiu
  Cu: { light: "#e8a858", base: "#b87333" },   // roșu-cupru
  Zn: { light: "#b8b4a8", base: "#787468" },   // gri-albăstrui
  Ga: { light: "#c8d0c8", base: "#889088" },   // argintiu
  Ge: { light: "#a0a098", base: "#606058" },   // gri-albăstrui
  As: { light: "#888c88", base: "#505450" },   // gri metalic
  Se: { light: "#c0a858", base: "#806830" },   // gri / roșu (gri)
  Br: { light: "#a05838", base: "#603018" },   // roșu-maro (lichid)
  Kr: { light: "#c0d8f0", base: "#80a8c8" },   // incolor
  Rb: { light: "#d8d0c8", base: "#a09888" },   // argintiu alb
  Sr: { light: "#e0e0d8", base: "#a8a8a0" },   // argintiu alb
  Y:  { light: "#d8d8d8", base: "#a0a0a0" },   // argintiu alb
  Zr: { light: "#d0d0d0", base: "#989898" },   // argintiu alb
  Nb: { light: "#a8a8a8", base: "#686868" },   // gri
  Mo: { light: "#989898", base: "#585858" },   // gri
  Tc: { light: "#a0a098", base: "#606058" },   // argintiu gri
  Ru: { light: "#a8a8a8", base: "#686868" },   // argintiu
  Rh: { light: "#c0b8b0", base: "#787068" },   // argintiu
  Pd: { light: "#e0e0d8", base: "#a8a8a0" },   // argintiu alb
  Ag: { light: "#f0f0ec", base: "#c0c0b8" },   // argint
  Cd: { light: "#d0d0c8", base: "#989890" },   // argintiu
  In: { light: "#c8c8c0", base: "#888880" },   // argintiu
  Sn: { light: "#c8c4b8", base: "#888478" },   // argintiu
  Sb: { light: "#a8a8b0", base: "#686870" },   // argintiu cu nuanță albastră
  Te: { light: "#b0a898", base: "#706858" },   // argintiu
  I:  { light: "#8060c0", base: "#402870" },   // violet închis / negru
  Xe: { light: "#b8d0e8", base: "#7898b8" },   // incolor
  Cs: { light: "#e8d878", base: "#c8a830" },   // auriu-gălbui
  Ba: { light: "#d8d8d0", base: "#a0a098" },   // argintiu
  La: { light: "#d8d8d8", base: "#a0a0a0" },   // argintiu alb
  Ce: { light: "#c8c8c0", base: "#888880" },   // argintiu gri
  Pr: { light: "#d8d090", base: "#a89850" },   // gălbui
  Nd: { light: "#d0d0c8", base: "#989890" },   // argintiu
  Pm: { light: "#c0c0b8", base: "#808078" },   // argintiu
  Sm: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Eu: { light: "#d8d0a8", base: "#a09868" },   // argintiu ușor gălbui
  Gd: { light: "#c8c8c0", base: "#888880" },   // argintiu
  Tb: { light: "#c8c8c0", base: "#888880" },   // argintiu
  Dy: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Ho: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Er: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Tm: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Yb: { light: "#d0c8c0", base: "#989088" },   // argintiu
  Lu: { light: "#c8c8c0", base: "#888880" },   // argintiu
  Hf: { light: "#d0d0c8", base: "#989890" },   // argintiu
  Ta: { light: "#a8a8a0", base: "#686860" },   // gri
  W:  { light: "#989898", base: "#585858" },   // gri (wolfram)
  Re: { light: "#a0a098", base: "#606058" },   // argintiu gri
  Os: { light: "#9098a8", base: "#505868" },   // argintiu albastruiu
  Ir: { light: "#c0c0b8", base: "#808078" },   // argintiu
  Pt: { light: "#e8e4d8", base: "#b0a898" },   // argintiu alb/gri
  Au: { light: "#fff6a0", base: "#d4af37" },   // aur
  Hg: { light: "#e8e8e8", base: "#b8b8b8" },   // argintiu (lichid)
  Tl: { light: "#b8b8b0", base: "#787870" },   // argintiu gri
  Pb: { light: "#909098", base: "#505058" },   // gri plumb
  Bi: { light: "#c8a8a8", base: "#886868" },   // argintiu cu roz/roșu
  Po: { light: "#a8a8a0", base: "#686860" },   // argintiu
  At: { light: "#585858", base: "#282828" },   // negru/întunecat
  Rn: { light: "#a8c0d8", base: "#688098" },   // incolor
  Fr: { light: "#d8d0c0", base: "#a09880" },   // argintiu (ipotetic)
  Ra: { light: "#d0d0c8", base: "#989890" },   // argintiu
  Ac: { light: "#d0d0c8", base: "#989890" },   // argintiu
  Th: { light: "#c0c0b8", base: "#808078" },   // argintiu gri
  Pa: { light: "#b8b8b0", base: "#787870" },   // argintiu
  U:  { light: "#a8a898", base: "#686858" },   // argintiu gri
  Np: { light: "#b0b0a8", base: "#707068" },   // argintiu
  Pu: { light: "#a8a8a0", base: "#686860" },   // argintiu
  Am: { light: "#b8b8b0", base: "#787870" },   // argintiu
  Cm: { light: "#b0b0a8", base: "#707068" },   // argintiu
  Bk: { light: "#b0b0a8", base: "#707068" },   // argintiu
  Cf: { light: "#a8a8a0", base: "#686860" },   // argintiu
  Es: { light: "#a8a8a0", base: "#686860" },   // argintiu
  Fm: { light: "#a0a098", base: "#606058" },   // argintiu
  Md: { light: "#a0a098", base: "#606058" },   // argintiu
  No: { light: "#a0a098", base: "#606058" },   // argintiu
  Lr: { light: "#a0a098", base: "#606058" },   // argintiu
  Rf: { light: "#a0a098", base: "#606058" },   // sintetic, gri
  Db: { light: "#a0a098", base: "#606058" },
  Sg: { light: "#a0a098", base: "#606058" },
  Bh: { light: "#a0a098", base: "#606058" },
  Hs: { light: "#a0a098", base: "#606058" },
  Mt: { light: "#a0a098", base: "#606058" },
  Ds: { light: "#a0a098", base: "#606058" },
  Rg: { light: "#a0a098", base: "#606058" },
  Cn: { light: "#a0a098", base: "#606058" },
  Nh: { light: "#a8a8a0", base: "#686860" },
  Fl: { light: "#a8a8a0", base: "#686860" },
  Mc: { light: "#a8a8a0", base: "#686860" },
  Lv: { light: "#a8a8a0", base: "#686860" },
  Ts: { light: "#a0a098", base: "#606058" },
  Og: { light: "#b0b8c0", base: "#707880" }    // gaz rar, pal
};

function getSphereGradient(el) {
  const c = SPHERE_BY_SYMBOL[el.symbol];
  if (c) return `radial-gradient(circle at 30% 30%, ${c.light}, ${c.base})`;
  return "radial-gradient(circle at 30% 30%, #e0e0e0, #909090)";
}

let bohrAnimationId = null;

function drawBohr(canvas, shells, timeOffset = 0) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const numShells = shells.length;
  const step = Math.min((w / 2 - 50) / numShells, 55);
  const baseR = step * 0.9;
  ctx.clearRect(0, 0, w, h);

  const nucleusRadius = Math.max(12, w / 40);
  ctx.fillStyle = "rgba(255, 200, 100, 0.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, nucleusRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = `${Math.max(11, w / 35)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lbl("labels.nucleusLabel", "nucleu"), cx, cy);

  const totalElectrons = shells.reduce((a, b) => a + b, 0);
  let idx = 0;
  const t = timeOffset * 0.002;
  const electronRadius = Math.max(5, w / 70);
  const orbitWidth = 1.5 + (w > 400 ? 0.5 : 0);
  shells.forEach((count, i) => {
    const r = baseR + i * step;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = orbitWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let j = 0; j < count; j++) {
      const baseAngle = (idx / totalElectrons) * Math.PI * 2 - Math.PI / 2;
      const angle = baseAngle + t + idx * 0.15;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.fillStyle = "rgba(100, 200, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(x, y, electronRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
      idx++;
    }
  });
}

function runBohrAnimation(canvas, shells) {
  if (bohrAnimationId) cancelAnimationFrame(bohrAnimationId);
  let start = null;
  function frame(timestamp) {
    if (!start) start = timestamp;
    drawBohr(canvas, shells, timestamp - start);
    bohrAnimationId = requestAnimationFrame(frame);
  }
  bohrAnimationId = requestAnimationFrame(frame);
}

/** Canvas Bohr la lățimea containerului (mobil). */
function sizeBohrCanvas(canvas, el) {
  if (!canvas || !el?.shells?.length) return;
  const container = canvas.closest(".bohr-container");
  const rawW = container ? container.clientWidth : 320;
  const logical = Math.floor(Math.min(420, Math.max(220, Math.min(rawW, 420))));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const px = Math.floor(logical * dpr);
  canvas.width = px;
  canvas.height = px;
  canvas.style.width = `${logical}px`;
  canvas.style.height = `${logical}px`;
}

function buildOrbitalHTML(l, electrons, label) {
  const slots = generateOrbitals(l, electrons);
  const mValues = [];
  for (let i = -l; i <= l; i++) mValues.push(i);
  let boxes = slots.map((slot, i) => {
    const up = slot.includes("up");
    const down = slot.includes("down");
    let content = "";
    if (down) content += "↓";
    if (up) content += "↑";
    if (!content) content = LANG_EN ? lbl("labels.orbitalBoxEmpty", "○") : "○";
    return `<div class="orbital-box" title="m = ${mValues[i]}"><div>${content}</div><div class="m-value">m=${mValues[i]}</div></div>`;
  }).join("");
  return `<div class="orbital-row"><span class="orbital-label">${label}</span><div class="orbital-boxes">${boxes}</div></div>`;
}

function renderModal(el) {
  const fullConfig = getFullConfig(el.electronConfiguration);
  const sublevels = sortSublevelsAufbau(parseSublevels(fullConfig));
  const lastEl = getLastElectron(sublevels);
  const lastSubForLabel = sublevels.length ? sublevels[sublevels.length - 1] : null;
  const lastSubLabel = lastSubForLabel ? `${lastSubForLabel.n}${lastSubForLabel.letter}` : "";
  const mass = Number(el.atomicMass);
  const massStr = mass === Math.round(mass) ? mass : mass.toFixed(3);
  const ox = el.oxidationStates || [];
  const oxStr = ox.length ? ox.join(", ") : "—";

  const sphereGradient = getSphereGradient(el);
  const dispName = elemDisplayName(el).toUpperCase();
  modalHeader.innerHTML = `
    <div class="modal-header-top">
      <div class="color-box" style="background: ${sphereGradient}" title="${lbl("labels.metaColourCue", "Culoare element").replace(/"/g, "&quot;")}"></div>
      <div class="element-title">${dispName} (${el.symbol})</div>
    </div>
    <div class="element-meta">
      <span><strong>${lbl("labels.metaAtomic", "Număr atomic:")}</strong> ${el.number}</span>
      <span><strong>${lbl("labels.metaMass", "Masă atomică:")}</strong> ${massStr}</span>
      <span><strong>${lbl("labels.metaCategory", "Categorie:")}</strong> ${categoryDisplay(el.category)}</span>
      <span><strong>${lbl("labels.metaBlock", "Bloc:")}</strong> ${el.block}</span>
      <span><strong>${lbl("labels.metaPeriod", "Perioadă:")}</strong> ${el.period}</span>
      <span><strong>${lbl("labels.metaGroup", "Grupă:")}</strong> ${el.group}</span>
    </div>
  `;

  panelGeneral.innerHTML = `
    <div class="modal-section">
      <h3>${lbl("labels.oxidationHeading", "Valență și stări de oxidare")}</h3>
      <p>${oxStr}</p>
    </div>
    <div class="modal-section">
      <h3>${lbl("labels.physicsHeading", "Proprietăți fizice")}</h3>
      <div class="prop-grid">
        <div class="prop-item"><strong>${lbl("labels.density", "Densitate")}</strong>${el.density ?? lbl("labels.noneDash", "—")}</div>
        <div class="prop-item"><strong>${lbl("labels.meltingPt", "Punct topire")}</strong>${el.meltingPoint ?? lbl("labels.noneDash", "—")}</div>
        <div class="prop-item"><strong>${lbl("labels.boilingPt", "Punct fierbere")}</strong>${el.boilingPoint ?? lbl("labels.noneDash", "—")}</div>
        <div class="prop-item"><strong>${lbl("labels.electronegativity", "Electronegativitate")}</strong>${el.electronegativity ?? lbl("labels.noneDash", "—")}</div>
      </div>
    </div>
  `;

  const fullSup = toSuperscript(formatFullConfigAufbauDisplay(el.electronConfiguration).replace(/\s+/g, " "));
  const shortSup = toSuperscript(formatShortConfigAufbau(el.electronConfiguration).replace(/\s+/g, " "));

  let shellsHTML = "";
  (el.shells || []).forEach((count, i) => {
    const n = i + 1;
    if (LANG_EN) {
      const line = tmpl(lbl("labels.shellElectronsLine", "<strong>n = {{n}}</strong> → {{count}} e⁻"), { n, count });
      shellsHTML += `<li>${line}</li>`;
    } else {
      shellsHTML += `<li><strong>n = ${n}</strong> → ${count} e⁻</li>`;
    }
  });

  let sublevelsHTML = "";
  const lLabels = { s: "s (l=0)", p: "p (l=1)", d: "d (l=2)", f: "f (l=3)" };
  const lInfo = {
    s: "m = 0, 1 orbital, max 2 e⁻",
    p: "m ∈ {-1, 0, +1}, 3 orbitali, max 6 e⁻",
    d: "m ∈ {-2, -1, 0, +1, +2}, 5 orbitali, max 10 e⁻",
    f: "m ∈ {-3..+3}, 7 orbitali, max 14 e⁻"
  };
  const L = window.__SIMULATOR_UI_I18N__?.labels;
  sublevels.forEach(({ n, letter, electrons }) => {
    const lNum = { s: 0, p: 1, d: 2, f: 3 }[letter];
    const label = `${n}${letter}${electrons}`;
    const lblTxt = LANG_EN && L?.lLabels?.[letter] ? L.lLabels[letter] : lLabels[letter];
    const infoTxt = LANG_EN && L?.lInfo?.[letter] ? L.lInfo[letter] : lInfo[letter];
    const heading = LANG_EN
      ? tmpl(lbl(`labels.sublevelTitle`, `Subshell {{lbl}} – {{info}}`), { lbl: lblTxt, info: infoTxt })
      : `Subnivel ${lLabels[letter]} – ${lInfo[letter]}`;
    sublevelsHTML += `<div class="modal-section"><h3>${heading}</h3>`;
    sublevelsHTML += buildOrbitalHTML(lNum, electrons, label);
    sublevelsHTML += "</div>";
  });

  let quantumHTML = "";
  if (lastEl) {
    const quantumFoot = getQuantumFoot(el);
    let quantumExplain;
    if (LANG_EN) {
      const qTpl = lbl(
        `labels.quantumPrefix`,
        `<p class="quantum-clarification">Subshell filled last in Aufbau order: <strong>{{last}}</strong>{{foot}}</p>`
      );
      quantumExplain = tmpl(qTpl, { last: lastSubLabel, foot: quantumFoot });
    } else {
      quantumExplain = `<p class="quantum-clarification">Subnivelul completat ultimul în ordinea Aufbau: <strong>${lastSubLabel}</strong>${quantumFoot}</p>`;
    }
    quantumHTML = `
      <div class="modal-section">
        <h3>${lbl(`labels.quantumHeading`, `Parametri cuantici (ultimul electron plasat)`)}</h3>
        ${quantumExplain}
        <div class="quantum-params">
          <span><strong>n</strong> = ${lastEl.n}</span>
          <span><strong>l</strong> = ${lastEl.l}</span>
          <span><strong>m</strong> = ${lastEl.m}</span>
          <span><strong>s</strong> = ± ${lastEl.s}</span>
        </div>
      </div>
    `;
  }

  panelElectronic.innerHTML = `
    <div class="electronic-grid">
      <div class="electronic-col">
        <div class="modal-section">
          <h3>${lbl(`labels.electronConfigHeading`, `Configurație electronică`)}</h3>
          <p class="config-aufbau-hint">${lbl(`labels.aufbauHint`, `Subnivelurile sunt afișate în <strong>ordinea Aufbau</strong> (ex. 4s înainte de 3d), ca în manualele de chimie.`)}</p>
          <p><strong>${lbl(`labels.fullVariant`, `Varianta completă:`)}</strong></p>
          <div class="config-full">${fullSup}</div>
          <p><strong>${lbl(`labels.shortVariant`, `Varianta prescurtată:`)}</strong></p>
          <div class="config-short">${shortSup}</div>
        </div>
        <div class="modal-section">
          <h3>${lbl(`labels.shellsHeading`, `Distribuția pe nivele (n)`)}</h3>
          <ul class="shells-list">${shellsHTML}</ul>
          ${shellInterpretationNote(el)}
        </div>
        ${quantumHTML}
      </div>
      <div class="electronic-col">
        <div class="modal-section">
          <h3>${lbl(`labels.subshellOrbitalHeading`, `Distribuția pe subnivele (orbitali)`)}</h3>
          ${sublevelsHTML}
        </div>
      </div>
    </div>
  `;

  panelVisual.innerHTML = `
    <div class="modal-section">
      <h3>${lbl(`labels.bohrHeading`, `Model Bohr – straturi și electroni`)}</h3>
      <div class="bohr-container">
        <canvas id="bohrCanvas"></canvas>
      </div>
    </div>
    <div class="modal-section">
      <h3>${lbl(`labels.bohrConfigRefHeading`, `Configurație (referință)`)}</h3>
      <div class="config-short">${shortSup}</div>
    </div>
  `;

  modal.style.display = "flex";
  requestAnimationFrame(() => {
    const canvas = document.getElementById("bohrCanvas");
    if (canvas && el.shells && el.shells.length) {
      sizeBohrCanvas(canvas, el);
      runBohrAnimation(canvas, el.shells);
    }
  });
}

let currentModalElement = null;

const UNSTABLE_GLITCH_SYMBOLS = ["Og", "Ts", "Lv"];

function showElement(el) {
  currentModalElement = el;
  renderModal(el);
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panelGeneral").classList.add("active");
  document.querySelector('.tab-btn[data-tab="general"]').classList.add("active");

  const tabIso = document.getElementById("tabIsotopes");
  const hasIsotopes = isoDataset()[el.symbol];
  tabIso.style.display = hasIsotopes ? "" : "none";
  if (hasIsotopes) renderIsotopePanel(el);

  const modalContent = modal.querySelector(".modal-content");
  if (modalContent && UNSTABLE_GLITCH_SYMBOLS.includes(el.symbol)) {
    modalContent.classList.remove("modal-glitch");
    void modalContent.offsetWidth;
    modalContent.classList.add("modal-glitch");
    setTimeout(() => modalContent.classList.remove("modal-glitch"), 220);
  }

  const idx = elementsByNumber.findIndex((e) => e.number === el.number);
  if (prevBtn) {
    prevBtn.disabled = idx <= 0;
    prevBtn.title = idx > 0
      ? `${elemDisplayName(elementsByNumber[idx - 1])} (${elementsByNumber[idx - 1].symbol})`
      : lbl("labels.navPrevTitle", "Elementul anterior");
  }
  if (nextBtn) {
    nextBtn.disabled = idx < 0 || idx >= elementsByNumber.length - 1;
    nextBtn.title = idx >= 0 && idx < elementsByNumber.length - 1
      ? `${elemDisplayName(elementsByNumber[idx + 1])} (${elementsByNumber[idx + 1].symbol})`
      : lbl("labels.navNextTitle", "Următorul element");
  }
}

function goToPrevElement() {
  if (!currentModalElement) return;
  const idx = elementsByNumber.findIndex((e) => e.number === currentModalElement.number);
  if (idx > 0) showElement(elementsByNumber[idx - 1]);
}

function goToNextElement() {
  if (!currentModalElement) return;
  const idx = elementsByNumber.findIndex((e) => e.number === currentModalElement.number);
  if (idx >= 0 && idx < elementsByNumber.length - 1) showElement(elementsByNumber[idx + 1]);
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const panelMap = { general: "panelGeneral", electronic: "panelElectronic", visual: "panelVisual", isotopes: "panelIsotopes" };
    document.getElementById(panelMap[tab]).classList.add("active");
    if (tab === "visual") {
      requestAnimationFrame(() => {
        const canvas = document.getElementById("bohrCanvas");
        if (canvas && currentModalElement?.shells?.length) {
          sizeBohrCanvas(canvas, currentModalElement);
          runBohrAnimation(canvas, currentModalElement.shells);
        }
      });
    }
    if (tab === "isotopes") {
      requestAnimationFrame(() => {
        const nc = document.getElementById("nucleusCanvas");
        if (nc) drawNucleus(nc);
      });
    }
  });
});

let bohrResizeTimer = null;
window.addEventListener("resize", () => {
  if (modal.style.display !== "flex") return;
  clearTimeout(bohrResizeTimer);
  bohrResizeTimer = setTimeout(() => {
    const canvas = document.getElementById("bohrCanvas");
    if (canvas && currentModalElement?.shells?.length) {
      sizeBohrCanvas(canvas, currentModalElement);
      runBohrAnimation(canvas, currentModalElement.shells);
    }
  }, 120);
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  if (bohrAnimationId) {
    cancelAnimationFrame(bohrAnimationId);
    bohrAnimationId = null;
  }
});

if (prevBtn) prevBtn.addEventListener("click", goToPrevElement);
if (nextBtn) nextBtn.addEventListener("click", goToNextElement);

// Mod Big Bang: click H → Ne → He în ordine
const COSMIC_SEQUENCE = ["H", "Ne", "He"];
let cosmicStep = 0;
let cosmicModeTimeout = null;
const cosmicOverlay = document.getElementById("cosmicOverlay");

function checkCosmicSequence(symbol) {
  if (COSMIC_SEQUENCE[cosmicStep] === symbol) {
    cosmicStep++;
    if (cosmicStep === COSMIC_SEQUENCE.length) {
      activateCosmicMode();
      cosmicStep = 0;
    }
  } else {
    cosmicStep = 0;
    if (COSMIC_SEQUENCE[0] === symbol) cosmicStep = 1;
  }
}

function activateCosmicMode() {
  document.body.classList.add("cosmic-mode");
  if (cosmicOverlay) {
    cosmicOverlay.setAttribute("aria-hidden", "false");
    cosmicOverlay.classList.add("visible");
  }
  if (cosmicModeTimeout) clearTimeout(cosmicModeTimeout);
  cosmicModeTimeout = setTimeout(() => {
    document.body.classList.remove("cosmic-mode");
    if (cosmicOverlay) {
      cosmicOverlay.classList.remove("visible");
      cosmicOverlay.setAttribute("aria-hidden", "true");
    }
    cosmicModeTimeout = null;
  }, 7000);
}

elements.forEach(el => {
  const div = document.createElement("div");
  div.classList.add("element", categoryToClass(el.category), "block-" + (el.block || "s"));
  if (el.period != null) div.dataset.period = String(el.period);
  if (isRadioactive(el)) div.classList.add("radioactive");
  div.style.gridColumn = el.group;
  div.style.gridRow = el.period;
  const mass = Number(el.atomicMass);
  const massStr = mass === Math.round(mass) ? mass : mass.toFixed(2);
  const radioIcon = isRadioactive(el) ? `<span class="radioactive-icon" title="${lbl("labels.radioactiveTitle", "Radioactiv").replace(/"/g, "&quot;")}">☢</span>` : '';
  div.innerHTML = `
    <div class="number">${el.number}</div>
    <div class="symbol">${el.symbol}</div>
    <div class="mass">${massStr}</div>
    ${radioIcon}
  `;
  div.addEventListener("click", () => {
    checkCosmicSequence(el.symbol);
    showElement(el);
  });
  table.appendChild(div);
});

// Easter egg: tastezi "orbital" → Quantum View (tabel pe blocuri s/p/d/f + schemă orbitală)
const QUANTUM_VIEW_TRIGGER = "orbital";
let keyBuffer = "";
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : "";
  if (!key) return;
  keyBuffer = (keyBuffer + key).slice(-QUANTUM_VIEW_TRIGGER.length);
  if (keyBuffer === QUANTUM_VIEW_TRIGGER) {
    document.body.classList.toggle("quantum-view");
    const bg = document.getElementById("quantumOrbitalBg");
    if (bg) {
      bg.setAttribute("aria-hidden", document.body.classList.contains("quantum-view") ? "false" : "true");
    }
    keyBuffer = "";
  }
});

// Legendă: la click pe categorie, evidențiază elementele din tabel
const legendItems = document.querySelectorAll(".legend-item[data-category]");
const HIGHLIGHT_PREFIX = "highlight-category-";

legendItems.forEach((item) => {
  item.addEventListener("click", () => {
    const category = item.getAttribute("data-category");
    const currentHighlight = Array.from(table.classList).find((c) => c.startsWith(HIGHLIGHT_PREFIX));

    if (currentHighlight === HIGHLIGHT_PREFIX + category) {
      table.classList.remove(currentHighlight);
      item.classList.remove("active");
      return;
    }

    if (currentHighlight) table.classList.remove(currentHighlight);
    legendItems.forEach((i) => i.classList.remove("active"));
    table.classList.add(HIGHLIGHT_PREFIX + category);
    item.classList.add("active");
  });

  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      item.click();
    }
  });
});

// Buton evidențiere radioactivitate
const radioactiveBtn = document.getElementById("highlightRadioactive");
if (radioactiveBtn) {
  radioactiveBtn.addEventListener("click", () => {
    const hasHighlight = table.classList.contains("highlight-radioactive");
    if (hasHighlight) {
      table.classList.remove("highlight-radioactive");
      radioactiveBtn.classList.remove("active");
      return;
    }
    table.classList.forEach((c) => {
      if (c.startsWith(HIGHLIGHT_PREFIX)) table.classList.remove(c);
    });
    legendItems.forEach((i) => i.classList.remove("active"));
    table.classList.add("highlight-radioactive");
    radioactiveBtn.classList.add("active");
  });
  radioactiveBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      radioactiveBtn.click();
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  ISOTOPE TAB
// ═══════════════════════════════════════════════════════════

let isoState = { symbol: null, sliderIdx: 0, compareA: null, compareB: null, comparing: false };

function stabilityClass(s) {
  if (s === "stable") return "iso-stable";
  if (s === "weakly-radioactive") return "iso-weak";
  return "iso-radio";
}
function stabilityLabel(s) {
  if (s === "stable") return lbl("labels.isoStable", "Stabil");
  if (s === "weakly-radioactive") return lbl("labels.isoWeak", "Slab radioactiv");
  return lbl("labels.isoRadio", "Radioactiv");
}
function stabilityIcon(s) {
  if (s === "stable") return "✓";
  if (s === "weakly-radioactive") return "⚠";
  return "☢";
}

function renderIsotopePanel(el) {
  const panel = document.getElementById("panelIsotopes");
  const data = isoDataset()[el.symbol];
  if (!data) {
    panel.innerHTML = `<p>${lbl(
      "labels.isoNoData",
      "Nu sunt disponibile date despre izotopi pentru acest element."
    )}</p>`;
    return;
  }

  const iso = data.isotopes;
  isoState.symbol = el.symbol;
  isoState.sliderIdx = 0;
  isoState.compareA = null;
  isoState.compareB = null;
  isoState.comparing = false;

  let html = `<div class="iso-header-section">
    <h3>${elemDisplayName(el)} (${el.symbol}) ${lbl("labels.isoTitleSuffix", "— Izotopi")}</h3>
    <p class="iso-subtitle">${tmpl(
      lbl(
        "labels.isoSubtitle",
        "{{count}} izotopi selectați • Z = {{z}}"
      ),
      { count: String(iso.length), z: String(data.protons) }
    )}</p>
  </div>`;

  html += `<div class="iso-legend-bar">
    <span class="iso-leg iso-stable">${lbl("labels.isoLegendStable", "✓ Stabil")}</span>
    <span class="iso-leg iso-weak">${lbl("labels.isoLegendWeak", "⚠ Slab radioactiv")}</span>
    <span class="iso-leg iso-radio">${lbl("labels.isoLegendRadio", "☢ Radioactiv")}</span>
  </div>`;

  html += `<div class="iso-grid">`;

  // LEFT column: slider + nucleus
  html += `<div class="iso-col-left">`;

  html += `<div class="iso-slider-section">
    <div class="iso-slider-label">${lbl("labels.isoSliderHint", "Adaugă neutroni →")}</div>
    <div class="iso-slider-wrap">
      <input type="range" id="isoSlider" min="0" max="${iso.length - 1}" value="0" step="1" class="iso-slider" />
      <div class="iso-slider-ticks" id="isoSliderTicks"></div>
    </div>
    <div class="iso-slider-current" id="isoSliderCurrent"></div>
  </div>`;

  html += `<div class="iso-nucleus-section">
    <div class="iso-nucleus-wrap">
      <canvas id="nucleusCanvas" width="260" height="260"></canvas>
    </div>
    <div class="iso-nucleus-legend">
      <span class="nuc-leg"><span class="nuc-dot nuc-proton"></span> ${tmpl(
        lbl("labels.isoLegendProtons", "Protoni ({{z}})"),
        { z: String(data.protons) }
      )}</span>
      <span class="nuc-leg"><span class="nuc-dot nuc-neutron"></span> ${lbl(
        "labels.isoLegendNeutrons",
        "Neutroni"
      )}</span>
      <span class="nuc-leg"><span class="nuc-dot nuc-electron"></span> ${lbl(
        "labels.isoLegendElectrons",
        "Electroni"
      )}</span>
    </div>
  </div>`;

  html += `</div>`; // end iso-col-left

  // RIGHT column: cards
  html += `<div class="iso-col-right">`;
  html += `<div class="iso-cards" id="isoCards">`;
  iso.forEach((i, idx) => {
    const cls = stabilityClass(i.stability);
    const sup = toSuperscript(String(i.A));
    html += `<div class="iso-card ${cls} ${idx === 0 ? 'iso-card-active' : ''}" data-idx="${idx}">
      <div class="iso-card-head">
        <div class="iso-card-symbol">${sup}${el.symbol}</div>
        <div class="iso-card-name">${i.name}</div>
        <div class="iso-card-badge ${cls}">${stabilityIcon(i.stability)} ${stabilityLabel(i.stability)}</div>
      </div>
      <div class="iso-card-props">
        <div class="iso-prop"><strong>${lbl("labels.isoMass", "Masă")}</strong>${i.mass.toFixed(5)} u</div>
        <div class="iso-prop"><strong>${lbl("labels.isoNeutrons", "Neutroni")}</strong>${i.neutrons}</div>
        <div class="iso-prop"><strong>${lbl("labels.isoHalfLife", "T½")}</strong>${i.halfLife}</div>
        ${i.abundance ? `<div class="iso-prop"><strong>${lbl("labels.isoAbundance", "Abundență")}</strong>${i.abundance}</div>` : ""}
      </div>
      <div class="iso-card-uses">
        <strong>${lbl("labels.isoUsesHeading", "Utilizări:")}</strong>
        <ul>${i.uses.map(u => `<li>${u}</li>`).join("")}</ul>
      </div>
      <div class="iso-card-expand-btn" data-idx="${idx}">${lbl("labels.isoDetailsExpand", "▼ Detalii")}</div>
      <div class="iso-card-details" id="isoDetail${idx}" style="display:none;">
        ${i.decay ? `<div class="iso-detail-row"><strong>${lbl("labels.decayHeading", "Dezintegrare")}:</strong> ${i.decay}</div>` : ""}
        ${i.decayEq ? `<div class="iso-detail-row iso-equation">${i.decayEq.replace(/\n/g, '<br>')}</div>` : ''}
        <div class="iso-detail-row">${i.details}</div>
      </div>
      <label class="iso-compare-check"><input type="checkbox" class="iso-cmp-cb" data-idx="${idx}" /> ${lbl("labels.isoCompare", "Compară")}</label>
    </div>`;
  });
  html += `</div>`;
  html += `</div>`; // end iso-col-right

  html += `</div>`; // end iso-grid

  // Compare panel (full width below)
  html += `<div class="iso-compare-panel" id="isoComparePanel" style="display:none;">
    <h3>${lbl("labels.isoCompareHeading", "Comparare izotopi")}</h3>
    <div class="iso-compare-grid" id="isoCompareGrid"></div>
  </div>`;

  panel.innerHTML = html;

  // Wire slider
  const slider = document.getElementById("isoSlider");
  const ticksWrap = document.getElementById("isoSliderTicks");
  let ticksHTML = "";
  iso.forEach((i, idx) => {
    const sup = toSuperscript(String(i.A));
    ticksHTML += `<span class="iso-tick ${idx === 0 ? 'active' : ''}" data-idx="${idx}">${sup}${el.symbol}</span>`;
  });
  ticksWrap.innerHTML = ticksHTML;

  updateSliderDisplay(0, el.symbol);

  slider.addEventListener("input", () => {
    const idx = parseInt(slider.value, 10);
    isoState.sliderIdx = idx;
    updateSliderDisplay(idx, el.symbol);
  });

  // Wire expand buttons
  panel.querySelectorAll(".iso-card-expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const det = document.getElementById("isoDetail" + idx);
      const open = det.style.display !== "none";
      det.style.display = open ? "none" : "block";
      btn.textContent = open
        ? lbl("labels.isoDetailsExpand", "▼ Detalii")
        : lbl("labels.isoDetailsCollapse", "▲ Ascunde");
    });
  });

  // Wire compare checkboxes
  panel.querySelectorAll(".iso-cmp-cb").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = [...panel.querySelectorAll(".iso-cmp-cb:checked")];
      if (checked.length > 2) { cb.checked = false; return; }
      if (checked.length === 2) {
        isoState.compareA = parseInt(checked[0].dataset.idx, 10);
        isoState.compareB = parseInt(checked[1].dataset.idx, 10);
        isoState.comparing = true;
        renderCompare(el.symbol);
      } else {
        isoState.comparing = false;
        document.getElementById("isoComparePanel").style.display = "none";
      }
    });
  });

  // Wire card clicks to slider
  panel.querySelectorAll(".iso-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".iso-card-expand-btn") || e.target.closest(".iso-compare-check") || e.target.tagName === "INPUT") return;
      const idx = parseInt(card.dataset.idx, 10);
      slider.value = idx;
      isoState.sliderIdx = idx;
      updateSliderDisplay(idx, el.symbol);
    });
  });
}

function updateSliderDisplay(idx, symbol) {
  const data = isoDataset()[symbol];
  if (!data) return;
  const iso = data.isotopes[idx];
  const panel = document.getElementById("panelIsotopes");

  // Update current label
  const cur = document.getElementById("isoSliderCurrent");
  const sup = toSuperscript(String(iso.A));
  cur.innerHTML = `<span class="iso-slider-big ${stabilityClass(iso.stability)}">${sup}${symbol}</span> <span class="iso-slider-info">${iso.name} • N=${iso.neutrons} • ${stabilityLabel(iso.stability)}</span>`;

  // Highlight active card
  panel.querySelectorAll(".iso-card").forEach((c, i) => {
    c.classList.toggle("iso-card-active", i === idx);
  });

  // Update tick labels
  panel.querySelectorAll(".iso-tick").forEach((t, i) => {
    t.classList.toggle("active", i === idx);
  });

  // Draw nucleus
  requestAnimationFrame(() => {
    const nc = document.getElementById("nucleusCanvas");
    if (nc) drawNucleus(nc);
  });
}

function drawNucleus(canvas) {
  const sym = isoState.symbol;
  const data = isoDataset()[sym];
  if (!data) return;
  const iso = data.isotopes[isoState.sliderIdx];
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  ctx.clearRect(0, 0, w, h);

  const protons = data.protons;
  const neutrons = iso.neutrons;
  const total = protons + neutrons;

  // Place nucleons in a tight cluster
  const nucleonR = total <= 4 ? 12 : total <= 10 ? 9 : total <= 50 ? 6 : total <= 150 ? 4.5 : 3.5;
  const nucleons = [];
  const pArr = [], nArr = [];
  for (let i = 0; i < protons; i++) pArr.push("p");
  for (let i = 0; i < neutrons; i++) nArr.push("n");

  // Interleave for visual balance
  let pi = 0, ni = 0;
  while (pi < pArr.length || ni < nArr.length) {
    if (pi < pArr.length) { nucleons.push("p"); pi++; }
    if (ni < nArr.length) { nucleons.push("n"); ni++; }
  }

  // Spiral layout
  const positions = [];
  if (total === 1) {
    positions.push({ x: cx, y: cy });
  } else {
    const spacing = nucleonR * 2.2;
    let angle = 0, r = 0, step = spacing;
    for (let i = 0; i < total; i++) {
      positions.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      angle += (spacing / Math.max(r, spacing * 0.5));
      r = spacing * angle / (2 * Math.PI);
    }
  }

  // Determine scale to fit
  if (positions.length > 1) {
    let maxDist = 0;
    positions.forEach(p => {
      const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      if (d > maxDist) maxDist = d;
    });
    const maxR = Math.min(w, h) / 2 - 30 - nucleonR;
    if (maxDist > maxR && maxDist > 0) {
      const scale = maxR / maxDist;
      positions.forEach(p => {
        p.x = cx + (p.x - cx) * scale;
        p.y = cy + (p.y - cy) * scale;
      });
    }
  }

  // Draw nucleons
  nucleons.forEach((type, i) => {
    const pos = positions[i];
    if (!pos) return;
    const grad = ctx.createRadialGradient(pos.x - nucleonR * 0.3, pos.y - nucleonR * 0.3, 0, pos.x, pos.y, nucleonR);
    if (type === "p") {
      grad.addColorStop(0, "#ff6b6b");
      grad.addColorStop(1, "#c92a2a");
    } else {
      grad.addColorStop(0, "#adb5bd");
      grad.addColorStop(1, "#6c757d");
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nucleonR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = type === "p" ? "rgba(200,0,0,0.4)" : "rgba(100,100,100,0.4)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // Draw electron orbits
  const electrons = protons;
  if (electrons > 0) {
    const orbitR = Math.min(w, h) / 2 - 12;
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(100,180,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const eCount = Math.min(electrons, 8);
    const eR = 5;
    for (let i = 0; i < eCount; i++) {
      const a = (i / eCount) * Math.PI * 2 - Math.PI / 2;
      const ex = cx + orbitR * Math.cos(a);
      const ey = cy + orbitR * Math.sin(a);
      const eGrad = ctx.createRadialGradient(ex - 1, ey - 1, 0, ex, ey, eR);
      eGrad.addColorStop(0, "#74c0fc");
      eGrad.addColorStop(1, "#1971c2");
      ctx.beginPath();
      ctx.arc(ex, ey, eR, 0, Math.PI * 2);
      ctx.fillStyle = eGrad;
      ctx.fill();
    }
    if (electrons > 8) {
      ctx.fillStyle = "rgba(100,180,255,0.8)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`+${electrons - 8}e⁻`, cx + orbitR - 16, cy - orbitR + 16);
    }
  }

  // Label
  const sup = toSuperscript(String(iso.A));
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${sup}${sym}`, cx, h - 4);
  ctx.font = "10px sans-serif";
  ctx.fillText(`${protons}p + ${neutrons}n`, cx, h - 18);
}

function renderCompare(symbol) {
  const panel = document.getElementById("isoComparePanel");
  const grid = document.getElementById("isoCompareGrid");
  const data = isoDataset()[symbol];
  if (!data || isoState.compareA == null || isoState.compareB == null) {
    panel.style.display = "none";
    return;
  }

  const a = data.isotopes[isoState.compareA];
  const b = data.isotopes[isoState.compareB];

  const supA = toSuperscript(String(a.A));
  const supB = toSuperscript(String(b.A));

  const dash = lbl("labels.noneDash", "—");
  const rows = [
    [
      lbl("labels.isoCompareMass", "Masă (u)"),
      a.mass.toFixed(5),
      b.mass.toFixed(5),
    ],
    [lbl("labels.isoCompareNeutrons", "Neutroni"), a.neutrons, b.neutrons],
    [lbl("labels.isoCompareHalfLife", "T½"), a.halfLife, b.halfLife],
    [
      lbl("labels.isoCompareStability", "Stabilitate"),
      stabilityLabel(a.stability),
      stabilityLabel(b.stability),
    ],
    [lbl("labels.isoCompareDecay", "Dezintegrare"), a.decay || dash, b.decay || dash],
    [
      lbl("labels.isoCompareAbundance", "Abundență"),
      a.abundance || dash,
      b.abundance || dash,
    ],
  ];

  let html = `<table class="iso-compare-table">
    <thead><tr><th></th><th class="${stabilityClass(a.stability)}">${supA}${symbol}<br><small>${a.name}</small></th><th class="${stabilityClass(b.stability)}">${supB}${symbol}<br><small>${b.name}</small></th></tr></thead><tbody>`;
  rows.forEach(([label, va, vb]) => {
    const diff = va !== vb ? "iso-diff" : "";
    html += `<tr><td class="iso-cmp-label">${label}</td><td class="${diff}">${va}</td><td class="${diff}">${vb}</td></tr>`;
  });
  html += `</tbody></table>`;

  // Uses comparison
  html += `<div class="iso-compare-uses">
    <div class="iso-cmp-uses-col">
      <h4 class="${stabilityClass(a.stability)}">${supA}${symbol}</h4>
      <ul>${a.uses.map(u => `<li>${u}</li>`).join("")}</ul>
    </div>
    <div class="iso-cmp-uses-col">
      <h4 class="${stabilityClass(b.stability)}">${supB}${symbol}</h4>
      <ul>${b.uses.map(u => `<li>${u}</li>`).join("")}</ul>
    </div>
  </div>`;

  grid.innerHTML = html;
  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
