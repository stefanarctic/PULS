/**
 * Distilare fractionata H2O-D2O — model cinematic didactic.
 * concBottom / concTop: fractii molare D2O; alfa afisat = volatilitate relativa H2O vs D2O.
 */

const TB_H2O = 100.0;
const TB_D2O = 101.4;
const X_FEED = 0.2;
/** D2O in zona de varf (vapori/produs usor), sub alimentare. */
const CONC_TOP_INIT = 0.17;
const TARGET_NOTE = 99.8;
const ALPHA_BASE = 1.066;

/** R = L/D — domeniu fix didactic (coloana D₂O). */
const REFLUX_R_MIN = 1;
const REFLUX_R_MAX = 1.5;
const REFLUX_R_DEFAULT = 1.25;

function simT(path, fallback) {
  if (typeof window.simLbl === "function") return window.simLbl(path, fallback);
  return fallback;
}

function simFmt(path, fallback, vars) {
  let s = simT(path, fallback);
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : ""));
}

function clampRefluxR(r) {
  const x = Number(r);
  if (!Number.isFinite(x)) return REFLUX_R_DEFAULT;
  return Math.min(REFLUX_R_MAX, Math.max(REFLUX_R_MIN, x));
}

/** 0..1 pentru R în [REFLUX_R_MIN, REFLUX_R_MAX] (animații / intensitate). */
function refluxFlowFactor() {
  return Math.min(1, Math.max(0, (refluxR - REFLUX_R_MIN) / (REFLUX_R_MAX - REFLUX_R_MIN)));
}

/** Setat la succes în simularea „Instalație de schimb izotopic”. */
const GS_COMPLETE_KEY = "puls_izotopic_gs_complete";

/** Amplifica dt ca evolutia sa fie vizibila in zeci de secunde (nu ore). */
const KINETIC_SCALE = 52;

function readBypassLockFromSearch() {
  try {
    return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("bypassGsLock") === "1";
  } catch {
    return false;
  }
}

function isGsComplete() {
  if (readBypassLockFromSearch()) return true;
  try {
    return localStorage.getItem(GS_COMPLETE_KEY) === "1";
  } catch {
    return false;
  }
}

/** @param {boolean} locked */
function setGsGateLocked(locked) {
  const lock = document.getElementById("gsLockOverlay");
  const intro = document.getElementById("introOverlay");
  if (lock) {
    lock.classList.toggle("hidden", !locked);
    lock.setAttribute("aria-hidden", locked ? "false" : "true");
  }
  if (intro) {
    if (locked) intro.classList.add("hidden");
    else intro.classList.remove("hidden");
  }
}

function smoothstep(t, e0, e1) {
  if (t <= e0) return 0;
  if (t >= e1) return 1;
  const u = (t - e0) / (e1 - e0);
  return u * u * (3 - 2 * u);
}

function alphaFromT(T_C) {
  const u = Math.max(0, Math.min(1, (T_C - TB_H2O) / (TB_D2O - TB_H2O)));
  return ALPHA_BASE + 0.01 * (u - 0.5);
}

function boilStrength(T_C) {
  const a = smoothstep(T_C, 99.82, 100.06);
  const b = 1 - smoothstep(T_C, 101.82, 102.15);
  return Math.max(0, Math.min(1, a * b));
}

function clampFrac(v) {
  return Math.min(0.999, Math.max(0.0005, v));
}

/** Rezervor: jos imbogatit, sus sarac in D2O (evolutie in timp). */
let concBottom = X_FEED;
let concTop = CONC_TOP_INIT;

/** @type {Float64Array} */
let xLiquid;
let numStages = 40;
let reboilerT = 100.5;
let refluxR = REFLUX_R_DEFAULT;
let simSpeed = 1;
let simTime = 0;
let running = false;
let paused = false;
let rafId = 0;
let lastTs = 0;

/** @type {{ t: number; pct: number }[]} */
let purityHistory = [];
const HISTORY_MAX = 450;
const HISTORY_DT = 0.12;

let historyAccum = 0;

let nuclearMilestoneShown = false;

/** @type {HTMLCanvasElement | null} */
let flowCanvas = null;
/** @type {CanvasRenderingContext2D | null} */
let flowCtx = null;
/** @type {{ x: number; y: number; type: string; r: number; vx: number; vy: number }[]} */
let flowParticles = [];
const N_FLOW = 64;

function rebuildLiquidProfile() {
  if (!xLiquid || xLiquid.length !== numStages) {
    xLiquid = new Float64Array(Math.max(1, numStages));
  }
  const n = numStages;
  const exp = 0.92;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    xLiquid[i] = clampFrac(concTop + (concBottom - concTop) * Math.pow(t, exp));
  }
  if (concTop > concBottom) {
    concTop = Math.min(concTop, concBottom * 0.95);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 1 : i / (n - 1);
      xLiquid[i] = clampFrac(concTop + (concBottom - concTop) * Math.pow(t, exp));
    }
  }
}

function rebuildTrays() {
  const host = document.getElementById("traysContainer");
  if (!host) return;
  host.innerHTML = "";
  const n = xLiquid.length;
  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "tray-row";
    row.setAttribute("role", "listitem");
    const plate = document.createElement("div");
    plate.className = "tray-plate";
    plate.dataset.index = String(i);
    const lab = document.createElement("span");
    lab.className = "tray-label";
    lab.textContent = i === 0 ? "1" : i === n - 1 ? String(n) : "";
    row.appendChild(plate);
    row.appendChild(lab);
    host.appendChild(row);
  }
}

function syncStagesFromUI() {
  const slider = document.getElementById("stagesSlider");
  const v = slider ? parseInt(slider.value, 10) : 40;
  numStages = Number.isFinite(v) ? Math.min(100, Math.max(8, v)) : 40;
  xLiquid = new Float64Array(numStages);
  rebuildLiquidProfile();
  rebuildTrays();
  flowParticles = [];
  setupFlowCanvas();
}

/**
 * efficiency = (talere teoretice * reflux) / 1000; delta mic daca talere teoretice sau reflux mici.
 * concBottom += delta * (1 - concBottom); concTop -= delta * concTop;
 */
function applyKinetics(dt) {
  const boil = boilStrength(reboilerT);
  const efficiency = (numStages * refluxR) / 1000;
  let delta = efficiency * 0.001 * boil * simSpeed * dt * KINETIC_SCALE;
  if (boil < 1e-5 || delta < 1e-14) return;

  concBottom = Math.min(0.998, concBottom + delta * (1 - concBottom));
  concTop = Math.max(0.0005, concTop - delta * concTop);
  if (concTop >= concBottom) concTop = concBottom * 0.92;
}

/**
 * Relaxare usoara pe talere teoretice: transfer mic intre vecini + tinta profil (vapori–lichid simplificat).
 */
function stepTrayMixing(dt, boil) {
  const n = xLiquid.length;
  if (n < 2) return;
  const exp = 0.92;
  const efficiency = (numStages * refluxR) / 1000;
  const kMix =
    0.075 *
    Math.min(1, Math.max(0.06, efficiency * 14)) *
    Math.max(0.04, boil) *
    simSpeed *
    dt *
    50;
  xLiquid[0] = clampFrac(concTop);
  xLiquid[n - 1] = clampFrac(concBottom);
  if (n < 3) return;
  for (let i = 1; i < n - 1; i++) {
    const ideal = concTop + (concBottom - concTop) * Math.pow(i / (n - 1), exp);
    const lap = xLiquid[i + 1] + xLiquid[i - 1] - 2 * xLiquid[i];
    xLiquid[i] = clampFrac(xLiquid[i] + kMix * (0.62 * (ideal - xLiquid[i]) + 0.38 * lap));
  }
}

function simulationTick(dt) {
  const alpha = alphaFromT(reboilerT);
  const boil = boilStrength(reboilerT);

  applyKinetics(dt);
  stepTrayMixing(dt, boil);

  simTime += dt * simSpeed;

  historyAccum += dt * simSpeed;
  if (historyAccum >= HISTORY_DT) {
    historyAccum = 0;
    purityHistory.push({ t: simTime, pct: concBottom * 100 });
    if (purityHistory.length > HISTORY_MAX) purityHistory.shift();
  }

  updateReadouts(alpha, boil);
  updateTrayStyles();
  updateRefluxVisual();
  document.querySelector(".reflux-bridge")?.classList.toggle("reflux-bridge--live", boil > 0.05);
  checkNuclearMilestone();
  drawChart();
  tickParticles(dt * simSpeed, boil);
}

function checkNuclearMilestone() {
  if (nuclearMilestoneShown || !running || paused) return;
  if (concBottom < 0.998 - 1e-4) return;
  nuclearMilestoneShown = true;
  const m = document.getElementById("nuclearMilestone");
  if (m) m.hidden = false;
  document.getElementById("simulationArea")?.classList.add("simulation-area--nuclear-win");
}

function clearNuclearMilestone() {
  nuclearMilestoneShown = false;
  const m = document.getElementById("nuclearMilestone");
  if (m) m.hidden = true;
  document.getElementById("simulationArea")?.classList.remove("simulation-area--nuclear-win");
}

function updateProcessMessage(boil) {
  const el = document.getElementById("processBanner");
  if (!el) return;
  if (!running) {
    el.textContent = "";
    el.classList.add("process-banner--hidden");
    return;
  }
  el.classList.remove("process-banner--hidden");
  if (paused) {
    el.textContent = simT("process.paused", "Pauz\u0103 \u2014 concentra\u021biile sunt \u00eenghe\u021bate.");
    return;
  }
  if (boil < 0.18) {
    el.textContent = simT(
      "process.boilLow",
      "Temperatur\u0103 prea mic\u0103: nu se produce vaporizare eficient\u0103 \u00een blaz."
    );
    return;
  }
  let msg = "";
  if (concBottom < 0.38) {
    msg = simT(
      "process.phase1",
      "Se evapor\u0103 preferen\u021bial H\u2082O \u2014 vapori mai boga\u021bi \u00een ap\u0103 u\u0219oar\u0103 urc\u0103 spre condensator."
    );
  } else if (concBottom < 0.82) {
    msg = simT(
      "process.phase2",
      "Refluxul \u00eembun\u0103t\u0103\u021be\u0219te separarea: lichidul se \u00eentoarce \u0219i spal\u0103 D\u2082O spre baza coloanei."
    );
  } else if (concBottom < 0.995) {
    msg = simT(
      "process.phase3",
      "Aproape de puritate maxim\u0103 \u2192 proces lent (platou). Ultimii procenti sunt cei mai costisitori."
    );
  } else {
    msg = simT(
      "process.phase4",
      "\u021aint\u0103 didactic\u0103 atins\u0103 \u00een model \u2014 \u00een practic\u0103, ultimii ppm cer \u0219i mai mult timp \u0219i trepte."
    );
  }
  el.textContent = msg;
}

function updateTempWarning(boil) {
  const el = document.getElementById("tempWarning");
  if (!el) return;
  if (boil < 0.2) {
    el.textContent = simT(
      "tempWarning",
      "Nu se produce vaporizare eficient\u0103 la aceast\u0103 temperatur\u0103 \u2014 ridic\u0103 u\u0219or blazul."
    );
    el.classList.remove("temp-warning--hidden");
  } else {
    el.textContent = "";
    el.classList.add("temp-warning--hidden");
  }
}

function updateRefluxDripVisual(boil) {
  const drip = document.getElementById("refluxDripColumn");
  const live = running && !paused && boil > 0.08 && refluxR >= REFLUX_R_MIN;
  drip?.classList.toggle("reflux-drip-column--live", live);
  if (drip && live) {
    const f = refluxFlowFactor();
    const spd = Math.min(1.25, 0.62 + f * 0.55);
    drip.style.setProperty("--drip-period", `${1.28 / spd}s`);
  }
}

function updateReadouts(alpha, boil) {
  const n = xLiquid.length;

  const pctBot = concBottom * 100;
  const pctTopVap = concTop * 100;

  const elB = document.getElementById("bottomPurity");
  const elD = document.getElementById("distPurity");
  const rb = document.getElementById("reboilerBadge");
  if (elB) elB.textContent = `${pctBot.toFixed(2)}% D₂O`;
  if (elD) {
    const sub = simT(
      "readouts.distTopSub",
      "(sus &mdash; D\u2082O scade, H\u2082O se concentreaz\u0103)"
    );
    elD.innerHTML = `${pctTopVap.toFixed(2)}% D\u2082O <small class="dist-sub">${sub}</small>`;
  }
  if (rb) rb.textContent = `${reboilerT.toFixed(2)} °C`;

  const rt = document.getElementById("readoutT");
  const rn = document.getElementById("readoutN");
  const rr = document.getElementById("readoutR");
  const ra = document.getElementById("readoutAlpha");
  if (rt) rt.textContent = `${reboilerT.toFixed(2)} °C`;
  if (rn) rn.textContent = String(n);
  if (rr) rr.textContent = refluxR.toFixed(2);
  if (ra) ra.textContent = alpha.toFixed(3);

  void boil;
}

function updateRefluxVisual() {
  const bridge = document.querySelector(".reflux-bridge");
  const path = document.querySelector(".reflux-path");
  if (!path) return;
  const t = refluxFlowFactor();
  path.style.opacity = String(0.15 + 0.72 * t);
  if (bridge) bridge.style.setProperty("--reflux-flow", String(0.25 + 0.85 * t));
}

function updateTrayStyles() {
  const plates = document.querySelectorAll(".tray-plate");
  const n = xLiquid.length;
  plates.forEach((el) => {
    const idx = parseInt(el.dataset.index || "0", 10);
    if (idx < 0 || idx >= n) return;
    const pct = xLiquid[idx] * 100;
    el.title = simFmt(
      "trayTitle",
      `Etaj ${idx + 1} \u2192 ~${pct.toFixed(1)}% D\u2082O (lichid pe taler, model)`,
      { n: idx + 1, pct: pct.toFixed(1) }
    );
    const frac = (xLiquid[idx] - CONC_TOP_INIT) / (0.998 - CONC_TOP_INIT);
    const rich = frac > 0.35 + (idx / n) * 0.25;
    el.classList.toggle("tray-plate--rich", rich);
  });
}

function setupFlowCanvas() {
  flowCanvas = document.getElementById("flowParticles");
  if (!flowCanvas) return;
  flowCtx = flowCanvas.getContext("2d");
  resizeFlowCanvas();
}

function resizeFlowCanvas() {
  if (!flowCanvas || !flowCtx) return;
  const shell = document.getElementById("columnShell");
  if (!shell) return;
  const dpr = window.devicePixelRatio || 1;
  const w = shell.clientWidth;
  const h = shell.clientHeight;
  if (w < 2 || h < 2) return;
  flowCanvas.width = Math.floor(w * dpr);
  flowCanvas.height = Math.floor(h * dpr);
  flowCanvas.style.width = `${w}px`;
  flowCanvas.style.height = `${h}px`;
  flowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (flowParticles.length === 0) {
    flowParticles = [];
    for (let i = 0; i < N_FLOW; i++) {
      const vap = i % 2 === 0;
      flowParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        type: vap ? "vap" : "liq",
        r: vap ? 0.32 + Math.random() * 0.38 : 1.05 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 8,
        vy: 0,
      });
    }
  }
}

function tickParticles(dt, boil) {
  if (!flowCtx || !flowCanvas) return;
  const shell = document.getElementById("columnShell");
  if (!shell) return;
  const w = shell.clientWidth;
  const h = shell.clientHeight;
  flowCtx.clearRect(0, 0, w, h);

  if (!running || paused || boil < 0.03) return;

  const refluxF = refluxFlowFactor();
  const inten = boil * (0.55 + 0.45 * refluxF);

  for (const p of flowParticles) {
    if (p.type === "vap") {
      p.y -= (108 + Math.random() * 62) * dt * inten;
      p.x += Math.sin(p.y * 0.08 + simTime * 2) * 0.42;
      if (p.y < -2) {
        p.y = h + 2;
        p.x = Math.random() * w;
      }
      flowCtx.beginPath();
      flowCtx.fillStyle = `rgba(210, 235, 255, ${0.08 + 0.14 * inten})`;
      flowCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      flowCtx.fill();
    } else {
      p.y += (10 + Math.random() * 9) * dt * inten * (0.88 + refluxF * 0.32);
      p.x += (Math.random() - 0.5) * 0.28;
      if (p.y > h + 2) {
        p.y = -2;
        p.x = Math.random() * w;
      }
      flowCtx.beginPath();
      flowCtx.fillStyle = `rgba(241, 196, 15, ${0.52 + 0.24 * inten})`;
      flowCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      flowCtx.fill();
      flowCtx.strokeStyle = `rgba(180, 130, 20, ${0.35 + 0.2 * inten})`;
      flowCtx.lineWidth = 0.85;
      flowCtx.stroke();
    }
  }
}

let chartW = 640;
let chartH = 240;

function setupChartSize() {
  const canvas = document.getElementById("purityChart");
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const w = Math.min(640, (wrap && wrap.clientWidth) || 640);
  const dpr = window.devicePixelRatio || 1;
  chartW = w;
  chartH = 240;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(chartH * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${chartH}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawChart() {
  const canvas = document.getElementById("purityChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = chartW;
  const h = chartH;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0e1118";
  ctx.fillRect(0, 0, w, h);

  const padL = 44;
  const padR = 12;
  const padT = 14;
  const padB = 36;
  const gw = w - padL - padR;
  const gh = h - padT - padB;

  const yForPct = (pct) => padT + gh * (1 - (pct - 15) / (TARGET_NOTE - 15));

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (gh * i) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + gw, y);
    ctx.stroke();
    const val = TARGET_NOTE - (TARGET_NOTE - 15) * (i / 4);
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px Segoe UI,sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${val.toFixed(0)}%`, padL - 6, y + 3);
  }

  const yTarget = yForPct(TARGET_NOTE);
  ctx.strokeStyle = "rgba(241, 196, 15, 0.75)";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL, yTarget);
  ctx.lineTo(padL + gw, yTarget);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(241, 196, 15, 0.9)";
  ctx.font = "10px Segoe UI,sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    simFmt("chart.targetLine", `Tinta ${TARGET_NOTE}% D\u2082O`, { target: TARGET_NOTE }),
    padL + 4,
    yTarget - 4
  );

  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px Segoe UI,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(simT("chart.xAxis", "t (h sim.)"), padL + gw / 2, h - 10);

  ctx.save();
  ctx.translate(12, padT + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(simT("chart.yAxis", "% D\u2082O (blaz)"), 0, 0);
  ctx.restore();

  if (purityHistory.length < 2) return;

  let t0 = purityHistory[0].t;
  let t1 = purityHistory[purityHistory.length - 1].t;
  if (t1 - t0 < 1e-6) t1 = t0 + 1;
  const windowSec = Math.max(30, t1 - t0);
  t0 = Math.max(0, t1 - windowSec);

  ctx.strokeStyle = "#3dd68c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  purityHistory.forEach((pt, i) => {
    const tx = padL + ((pt.t - t0) / (t1 - t0)) * gw;
    const py = yForPct(pt.pct);
    const yCl = Math.min(padT + gh, Math.max(padT, py));
    if (i === 0) ctx.moveTo(tx, yCl);
    else ctx.lineTo(tx, yCl);
  });
  ctx.stroke();
}

function loop(ts) {
  if (!lastTs) lastTs = ts;
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;

  const boil = boilStrength(reboilerT);
  updateTempWarning(boil);
  updateProcessMessage(boil);
  updateRefluxDripVisual(boil);
  const bridge = document.querySelector(".reflux-bridge");
  bridge?.classList.toggle(
    "reflux-bridge--obvious",
    running && !paused && boil > 0.1 && refluxFlowFactor() >= 0.75
  );

  if (running && !paused) {
    if (dt > 0) simulationTick(dt);
  } else {
    document.querySelector(".reflux-bridge")?.classList.remove("reflux-bridge--live");
    bridge?.classList.remove("reflux-bridge--obvious");
    document.getElementById("refluxDripColumn")?.classList.remove("reflux-drip-column--live");
    if (flowCtx && flowCanvas) {
      const shell = document.getElementById("columnShell");
      if (shell) flowCtx.clearRect(0, 0, shell.clientWidth, shell.clientHeight);
    }
  }

  rafId = requestAnimationFrame(loop);
}

function startSimulation() {
  if (!isGsComplete()) return;
  const overlay = document.getElementById("introOverlay");
  if (overlay) overlay.classList.add("hidden");
  clearNuclearMilestone();
  concBottom = X_FEED;
  concTop = CONC_TOP_INIT;
  rebuildLiquidProfile();
  purityHistory = [];
  historyAccum = 0;
  simTime = 0;
  running = true;
  paused = false;
  lastTs = 0;
  const alpha = alphaFromT(reboilerT);
  const boil = boilStrength(reboilerT);
  updateReadouts(alpha, boil);
  updateTrayStyles();
  drawChart();
}

function applyPreset(preset) {
  if (preset === "rapid") {
    numStages = 14;
    refluxR = REFLUX_R_MIN;
    simSpeed = 3.5;
    reboilerT = 100.42;
  } else if (preset === "industrial") {
    numStages = 88;
    refluxR = REFLUX_R_MAX;
    simSpeed = 0.85;
    reboilerT = 100.58;
  } else {
    numStages = 40;
    refluxR = REFLUX_R_DEFAULT;
    simSpeed = 1;
    reboilerT = 100.5;
  }

  const rs = document.getElementById("reboilerSlider");
  const rv = document.getElementById("reboilerVal");
  if (rs) rs.value = String(reboilerT);
  if (rv) rv.textContent = reboilerT.toFixed(2);

  const ss = document.getElementById("stagesSlider");
  const sv = document.getElementById("stagesVal");
  if (ss) ss.value = String(numStages);
  if (sv) sv.textContent = String(numStages);

  const rx = document.getElementById("refluxSlider");
  const rxv = document.getElementById("refluxVal");
  if (rx) rx.value = String(refluxR);
  if (rxv) rxv.textContent = refluxR.toFixed(2);

  const sp = document.getElementById("speedSlider");
  const spv = document.getElementById("speedVal");
  if (sp) sp.value = String(simSpeed);
  if (spv) spv.textContent = simSpeed.toFixed(2);

  syncStagesFromUI();
  rebuildLiquidProfile();
  updateRefluxVisual();
  const alpha = alphaFromT(reboilerT);
  const boil = boilStrength(reboilerT);
  updateReadouts(alpha, boil);
  updateTrayStyles();
  drawChart();
}

function wireControls() {
  const reboilerSlider = document.getElementById("reboilerSlider");
  const stagesSlider = document.getElementById("stagesSlider");
  const refluxSlider = document.getElementById("refluxSlider");
  const speedSlider = document.getElementById("speedSlider");
  const reboilerVal = document.getElementById("reboilerVal");
  const stagesVal = document.getElementById("stagesVal");
  const refluxVal = document.getElementById("refluxVal");
  const speedVal = document.getElementById("speedVal");

  if (reboilerSlider) {
    reboilerSlider.addEventListener("input", () => {
      reboilerT = parseFloat(reboilerSlider.value);
      if (reboilerVal) reboilerVal.textContent = reboilerT.toFixed(2);
    });
  }
  if (stagesSlider) {
    stagesSlider.addEventListener("input", () => {
      if (stagesVal) stagesVal.textContent = stagesSlider.value;
      syncStagesFromUI();
      const a = alphaFromT(reboilerT);
      updateReadouts(a, boilStrength(reboilerT));
      updateTrayStyles();
    });
  }
  if (refluxSlider) {
    refluxSlider.addEventListener("input", () => {
      refluxR = clampRefluxR(refluxSlider.value);
      if (refluxVal) refluxVal.textContent = refluxR.toFixed(2);
      updateRefluxVisual();
      const a = alphaFromT(reboilerT);
      updateReadouts(a, boilStrength(reboilerT));
    });
  }
  if (speedSlider) {
    speedSlider.addEventListener("input", () => {
      simSpeed = parseFloat(speedSlider.value);
      if (speedVal) speedVal.textContent = simSpeed.toFixed(2);
    });
  }

  document.getElementById("startBtn")?.addEventListener("click", startSimulation);

  document.getElementById("resetRunBtn")?.addEventListener("click", () => {
    clearNuclearMilestone();
    purityHistory = [];
    historyAccum = 0;
    simTime = 0;
    concBottom = X_FEED;
    concTop = CONC_TOP_INIT;
    rebuildLiquidProfile();
    const a = alphaFromT(reboilerT);
    updateReadouts(a, boilStrength(reboilerT));
    updateTrayStyles();
    drawChart();
  });

  document.getElementById("presetRapid")?.addEventListener("click", () => applyPreset("rapid"));
  document.getElementById("presetBalanced")?.addEventListener("click", () => applyPreset("balanced"));
  document.getElementById("presetIndustrial")?.addEventListener("click", () => applyPreset("industrial"));

  document.getElementById("pauseBtn")?.addEventListener("click", (e) => {
    paused = !paused;
    const btn = e.currentTarget;
    if (btn) btn.textContent = paused ? simT("panel.resume", "Continu\u0103") : simT("panel.pause", "Pauz\u0103");
  });

  const panel = document.getElementById("controlsPanel");
  const toggle = document.getElementById("panelToggleBtn");
  const close = document.getElementById("panelCloseBtn");
  const backdrop = document.getElementById("panelBackdrop");

  function openPanel() {
    panel?.classList.add("is-open");
    if (backdrop) backdrop.hidden = false;
  }
  function closePanel() {
    panel?.classList.remove("is-open");
    if (backdrop) backdrop.hidden = true;
  }

  toggle?.addEventListener("click", openPanel);
  close?.addEventListener("click", closePanel);
  backdrop?.addEventListener("click", closePanel);

  function onLayoutResize() {
    setupChartSize();
    setupFlowCanvas();
    drawChart();
  }

  window.addEventListener("resize", onLayoutResize);
  window.visualViewport?.addEventListener("resize", onLayoutResize);
  window.visualViewport?.addEventListener("scroll", onLayoutResize);
}

function init() {
  wireControls();

  if (!isGsComplete()) {
    setGsGateLocked(true);
  } else {
    setGsGateLocked(false);
  }

  window.addEventListener("storage", (e) => {
    if (e.key === GS_COMPLETE_KEY && e.newValue === "1") {
      setGsGateLocked(false);
    }
  });

  refluxR = clampRefluxR(document.getElementById("refluxSlider")?.value || String(REFLUX_R_DEFAULT));
  reboilerT = parseFloat(document.getElementById("reboilerSlider")?.value || "100.5");
  simSpeed = parseFloat(document.getElementById("speedSlider")?.value || "1");
  concBottom = X_FEED;
  concTop = CONC_TOP_INIT;
  syncStagesFromUI();
  setupChartSize();
  updateRefluxVisual();

  const alpha = alphaFromT(reboilerT);
  updateReadouts(alpha, boilStrength(reboilerT));
  updateTrayStyles();
  drawChart();

  rafId = requestAnimationFrame(loop);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
