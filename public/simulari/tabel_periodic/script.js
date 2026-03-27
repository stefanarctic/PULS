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
  ctx.fillText("nucleu", cx, cy);

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
    if (!content) content = "○";
    return `<div class="orbital-box" title="m = ${mValues[i]}"><div>${content}</div><div class="m-value">m=${mValues[i]}</div></div>`;
  }).join("");
  return `<div class="orbital-row"><span class="orbital-label">${label}</span><div class="orbital-boxes">${boxes}</div></div>`;
}

function renderModal(el) {
  const fullConfig = getFullConfig(el.electronConfiguration);
  const sublevels = parseSublevels(fullConfig);
  const lastEl = getLastElectron(sublevels);
  const mass = Number(el.atomicMass);
  const massStr = mass === Math.round(mass) ? mass : mass.toFixed(3);
  const ox = el.oxidationStates || [];
  const oxStr = ox.length ? ox.join(", ") : "—";

  const sphereGradient = getSphereGradient(el);
  modalHeader.innerHTML = `
    <div class="modal-header-top">
      <div class="color-box" style="background: ${sphereGradient}" title="Culoare element"></div>
      <div class="element-title">${el.name.toUpperCase()} (${el.symbol})</div>
    </div>
    <div class="element-meta">
      <span><strong>Număr atomic:</strong> ${el.number}</span>
      <span><strong>Masă atomică:</strong> ${massStr}</span>
      <span><strong>Categorie:</strong> ${el.category}</span>
      <span><strong>Bloc:</strong> ${el.block}</span>
      <span><strong>Perioadă:</strong> ${el.period}</span>
      <span><strong>Grupă:</strong> ${el.group}</span>
    </div>
  `;

  panelGeneral.innerHTML = `
    <div class="modal-section">
      <h3>Valență și stări de oxidare</h3>
      <p>${oxStr}</p>
    </div>
    <div class="modal-section">
      <h3>Proprietăți fizice</h3>
      <div class="prop-grid">
        <div class="prop-item"><strong>Densitate</strong>${el.density ?? "—"}</div>
        <div class="prop-item"><strong>Punct topire</strong>${el.meltingPoint ?? "—"}</div>
        <div class="prop-item"><strong>Punct fierbere</strong>${el.boilingPoint ?? "—"}</div>
        <div class="prop-item"><strong>Electronegativitate</strong>${el.electronegativity ?? "—"}</div>
      </div>
    </div>
  `;

  const fullSup = toSuperscript(fullConfig.replace(/\s+/g, " "));
  const shortSup = toSuperscript(el.electronConfiguration.replace(/\s+/g, " "));

  let shellsHTML = "";
  (el.shells || []).forEach((count, i) => {
    const n = i + 1;
    shellsHTML += `<li><strong>n = ${n}</strong> → ${count} e⁻</li>`;
  });

  let sublevelsHTML = "";
  const lLabels = { s: "s (l=0)", p: "p (l=1)", d: "d (l=2)", f: "f (l=3)" };
  const lInfo = {
    s: "m = 0, 1 orbital, max 2 e⁻",
    p: "m ∈ {-1, 0, +1}, 3 orbitali, max 6 e⁻",
    d: "m ∈ {-2, -1, 0, +1, +2}, 5 orbitali, max 10 e⁻",
    f: "m ∈ {-3..+3}, 7 orbitali, max 14 e⁻"
  };
  sublevels.forEach(({ n, letter, electrons }) => {
    const lNum = { s: 0, p: 1, d: 2, f: 3 }[letter];
    const label = `${n}${letter}${electrons}`;
    sublevelsHTML += `<div class="modal-section"><h3>Subnivel ${lLabels[letter]} – ${lInfo[letter]}</h3>`;
    sublevelsHTML += buildOrbitalHTML(lNum, electrons, label);
    sublevelsHTML += "</div>";
  });

  let quantumHTML = "";
  if (lastEl) {
    const lVal = lastEl.l;
    quantumHTML = `
      <div class="modal-section">
        <h3>Parametri cuantici (ultimul electron)</h3>
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
    <div class="modal-section">
      <h3>Configurație electronică</h3>
      <p><strong>Varianta completă:</strong></p>
      <div class="config-full">${fullSup}</div>
      <p><strong>Varianta prescurtată:</strong></p>
      <div class="config-short">${shortSup}</div>
    </div>
    <div class="modal-section">
      <h3>Distribuția pe nivele (n)</h3>
      <ul class="shells-list">${shellsHTML}</ul>
    </div>
    <div class="modal-section">
      <h3>Distribuția pe subnivele (orbitali)</h3>
      ${sublevelsHTML}
    </div>
    ${quantumHTML}
  `;

  panelVisual.innerHTML = `
    <div class="modal-section">
      <h3>Model Bohr – straturi și electroni</h3>
      <div class="bohr-container">
        <canvas id="bohrCanvas" width="420" height="420"></canvas>
      </div>
    </div>
    <div class="modal-section">
      <h3>Configurație (referință)</h3>
      <div class="config-short">${shortSup}</div>
    </div>
  `;

  modal.style.display = "flex";
  requestAnimationFrame(() => {
    const canvas = document.getElementById("bohrCanvas");
    if (canvas && el.shells && el.shells.length) runBohrAnimation(canvas, el.shells);
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
    prevBtn.title = idx > 0 ? `${elementsByNumber[idx - 1].name} (${elementsByNumber[idx - 1].symbol})` : "Elementul anterior";
  }
  if (nextBtn) {
    nextBtn.disabled = idx < 0 || idx >= elementsByNumber.length - 1;
    nextBtn.title = idx >= 0 && idx < elementsByNumber.length - 1 ? `${elementsByNumber[idx + 1].name} (${elementsByNumber[idx + 1].symbol})` : "Următorul element";
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
    const panelId = tab === "general" ? "panelGeneral" : tab === "electronic" ? "panelElectronic" : "panelVisual";
    document.getElementById(panelId).classList.add("active");
  });
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
  if (isRadioactive(el)) div.classList.add("radioactive");
  div.style.gridColumn = el.group;
  div.style.gridRow = el.period;
  const mass = Number(el.atomicMass);
  const massStr = mass === Math.round(mass) ? mass : mass.toFixed(2);
  const radioIcon = isRadioactive(el) ? '<span class="radioactive-icon" title="Radioactiv">☢</span>' : '';
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
