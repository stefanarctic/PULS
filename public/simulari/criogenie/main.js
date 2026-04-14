import {
  createParticles,
  updateParticles,
  drawParticle,
  getContainerBounds,
  clampParticlesToBounds,
  getSpeedHistogram,
  getTheoreticalMB2DCurve,
  mb2DSigmaFromTemperature,
  getState,
} from "./physics.js";
import { initUI } from "./ui.js";
import {
  showToast,
  startExperiment,
  isExperimentActive,
  tickExperiment,
  advanceExperimentPreview,
  getCurrentExperimentDef,
  captureExperimentShot,
  initAmbientAudio,
  resumeAudioIfNeeded,
  updateAmbientLevel,
} from "./experience.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");

const shell = document.getElementById("shell");
const toggleLeft = document.getElementById("toggle-left");
const toggleRight = document.getElementById("toggle-right");

const chartWrap = document.getElementById("chart-wrap");
const chartCanvas = document.getElementById("chart-canvas");
const chartCtx = chartCanvas.getContext("2d");

let particles = [];
let temperature = 300;
let volumeFrac = 1;
let materialKey = "water";
let maxCanvasArea = 1;
let collisionFlashes = [];
let shake = 0;
let pressureBaselineTemp = 300;
let freezeChallengeMet = false;
let pressureChallengeMet = false;

let expStartTemp = 300;
let expStartVol = 1;
let expHasBeenGas = false;

let prevSimState = /** @type {string | null} */ (null);
let prevTempForReward = 300;
let prevRatioForReward = 1;
let ambientInited = false;

function syncCanvasResolution() {
  const dpr = getDpr();
  canvas.style.width = "";
  canvas.style.height = "";
  const w = Math.max(240, Math.floor(stage.clientWidth));
  const h = Math.max(200, Math.floor(stage.clientHeight));
  if (w < 8 || h < 8) return;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  maxCanvasArea = w * h;
}

function getDpr() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/** Bitmap trebuie să coincidă cu #stage; ResizeObserver poate rata tranzițiile CSS ale drawer-elor */
function needsCanvasResizeSync() {
  const dpr = getDpr();
  const tw = Math.max(240, Math.floor(stage.clientWidth));
  const th = Math.max(200, Math.floor(stage.clientHeight));
  if (tw < 8 || th < 8) return false;
  const lw = canvas.width > 0 ? canvas.width / dpr : 0;
  const lh = canvas.height > 0 ? canvas.height / dpr : 0;
  return (
    canvas.width === 0 ||
    Math.abs(tw - lw) > 0.5 ||
    Math.abs(th - lh) > 0.5
  );
}

function getCanvasLogicalSize() {
  const dpr = getDpr();
  if (canvas.width < 1 || canvas.height < 1) {
    return {
      w: Math.max(240, stage.clientWidth),
      h: Math.max(200, stage.clientHeight),
    };
  }
  return { w: canvas.width / dpr, h: canvas.height / dpr };
}

/** @param {boolean} resetParticles - true doar la init / schimb material */
function resizeCanvas(resetParticles) {
  syncCanvasResolution();
  const { w: cw, h: ch } = getCanvasLogicalSize();
  if (cw < 8 || ch < 8) return;
  const bounds = getContainerBounds(cw, ch, volumeFrac);
  if (resetParticles || particles.length === 0) {
    particles = createParticles(bounds);
  } else {
    clampParticlesToBounds(particles, bounds);
  }
}

function resizeChart() {
  if (!chartWrap || !chartCanvas) return;
  const dpr = getDpr();
  const rect = chartWrap.getBoundingClientRect();
  const w = Math.max(200, Math.floor(rect.width));
  const h = Math.max(180, Math.floor(rect.height));
  chartCanvas.width = Math.floor(w * dpr);
  chartCanvas.height = Math.floor(h * dpr);
  chartCanvas.style.width = `${w}px`;
  chartCanvas.style.height = `${h}px`;
  chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const ui = initUI({
  onTemperatureChange(temp) {
    temperature = temp;
  },
  onVolumeChange(vf) {
    volumeFrac = vf;
    const { w, h } = getCanvasLogicalSize();
    const bounds = getContainerBounds(w, h, volumeFrac);
    clampParticlesToBounds(particles, bounds);
  },
  onMaterialChange(key) {
    materialKey = key;
    freezeChallengeMet = false;
    pressureChallengeMet = false;
    pressureBaselineTemp = ui.getTemperature();
    ui.setChallengeFreeze(false);
    ui.setChallengePressure(false);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    resizeCanvas(true);
  },
});

function pushCollisionFlash(x, y) {
  collisionFlashes.push({ x, y, life: 10 });
}

function syncExperimentPanel() {
  const def = getCurrentExperimentDef();
  const titleEl = document.getElementById("experiment-title");
  const descEl = document.getElementById("experiment-desc");
  if (titleEl) titleEl.textContent = def.title;
  if (descEl) descEl.textContent = def.desc;
}

function drawAbsoluteZeroCinematic(ctx2, cw, ch, temp) {
  if (temp >= 26) return;
  const k = 1 - temp / 26;
  const g = ctx2.createRadialGradient(
    cw * 0.5,
    ch * 0.5,
    Math.min(cw, ch) * 0.12,
    cw * 0.5,
    ch * 0.5,
    Math.max(cw, ch) * 0.72
  );
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(1, `rgba(12, 22, 38, ${0.5 * k})`);
  ctx2.fillStyle = g;
  ctx2.fillRect(0, 0, cw, ch);

  ctx2.fillStyle = `rgba(220, 240, 255, ${0.88 * k})`;
  ctx2.font = "600 13px system-ui, sans-serif";
  ctx2.textAlign = "center";
  ctx2.fillText("Absolute zero cannot be reached", cw / 2, ch - 26);
  ctx2.font = "500 10px system-ui, sans-serif";
  ctx2.fillStyle = `rgba(170, 200, 235, ${0.72 * k})`;
  ctx2.fillText("Al treilea principiu — 0 K este o limită, nu o destinație", cw / 2, ch - 10);
  ctx2.textAlign = "left";
}

function drawContainer(bounds) {
  ctx.strokeStyle = "rgba(120, 170, 220, 0.55)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(bounds.x0 + 1, bounds.y0 + 1, bounds.width - 2, bounds.height - 2);
  ctx.setLineDash([]);
}

function drawFlashes() {
  for (const f of collisionFlashes) {
    const a = f.life / 10;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 200, ${a * 0.45})`;
    ctx.fill();
  }
}

function drawTrails(state) {
  if (state !== "gas") return;
  for (const p of particles) {
    const tr = p.trail;
    if (tr.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(tr[0].x, tr[0].y);
    for (let i = 1; i < tr.length; i++) {
      ctx.lineTo(tr[i].x, tr[i].y);
    }
    ctx.strokeStyle = "rgba(200, 220, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawHistogramChart() {
  const w = chartCanvas.clientWidth;
  const h = chartCanvas.clientHeight;
  if (w < 4 || h < 4) return;

  const { bins, vmax, meanSpeed, maxSpeed } = getSpeedHistogram(
    particles,
    temperature
  );
  const maxB = Math.max(...bins, 1);
  const N = particles.length;
  const sigma = mb2DSigmaFromTemperature(temperature);
  const theoryPts = getTheoreticalMB2DCurve(N, vmax, sigma, 112);
  const maxTheory =
    theoryPts.length > 0 ? Math.max(...theoryPts.map((p) => p.count), 0) : 0;
  const maxY = Math.max(maxB, maxTheory * 1.04, 1);

  const padL = 10;
  const padR = 10;
  const padT = 38;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  chartCtx.clearRect(0, 0, w, h);
  chartCtx.fillStyle = "#070a0f";
  chartCtx.fillRect(0, 0, w, h);

  chartCtx.fillStyle = "rgba(180, 200, 220, 0.92)";
  chartCtx.font = "600 11px system-ui, sans-serif";
  chartCtx.fillText("Simulare vs. teorie (Maxwell 2D)", padL, 16);

  chartCtx.fillStyle = "rgba(130, 150, 175, 0.85)";
  chartCtx.font = "10px system-ui, sans-serif";
  const stats = `medie ${meanSpeed.toFixed(2)} · max ${maxSpeed.toFixed(2)} · axă 0→${vmax.toFixed(2)} · σ=${sigma.toFixed(2)}`;
  chartCtx.fillText(stats, padL, 30);

  const n = bins.length;
  const gap = 1;
  const bw = (plotW - gap * (n - 1)) / n;

  for (let i = 0; i < n; i++) {
    const bh = (bins[i] / maxY) * plotH;
    const x = padL + i * (bw + gap);
    const y = padT + plotH - bh;
    chartCtx.fillStyle = `rgba(90, 170, 235, ${0.32 + 0.58 * (bins[i] / maxY)})`;
    chartCtx.fillRect(x, y, Math.max(1, bw), bh);
  }

  if (theoryPts.length > 1) {
    const xAt = (v) => padL + (v / vmax) * plotW;
    const yAt = (c) => padT + plotH - (c / maxY) * plotH;

    chartCtx.beginPath();
    chartCtx.moveTo(padL, padT + plotH);
    for (const p of theoryPts) {
      chartCtx.lineTo(xAt(p.v), yAt(p.count));
    }
    chartCtx.lineTo(padL + plotW, padT + plotH);
    chartCtx.closePath();
    const fillG = chartCtx.createLinearGradient(padL, padT, padL, padT + plotH);
    fillG.addColorStop(0, "rgba(255, 130, 90, 0.22)");
    fillG.addColorStop(1, "rgba(255, 130, 90, 0.02)");
    chartCtx.fillStyle = fillG;
    chartCtx.fill();

    chartCtx.beginPath();
    chartCtx.moveTo(xAt(theoryPts[0].v), yAt(theoryPts[0].count));
    for (let k = 1; k < theoryPts.length; k++) {
      chartCtx.lineTo(xAt(theoryPts[k].v), yAt(theoryPts[k].count));
    }
    chartCtx.strokeStyle = "rgba(255, 145, 105, 0.95)";
    chartCtx.lineWidth = 2.25;
    chartCtx.lineJoin = "round";
    chartCtx.lineCap = "round";
    chartCtx.shadowColor = "rgba(255, 120, 80, 0.35)";
    chartCtx.shadowBlur = 6;
    chartCtx.stroke();
    chartCtx.shadowBlur = 0;
  }

  chartCtx.strokeStyle = "rgba(100, 130, 170, 0.45)";
  chartCtx.lineWidth = 1;
  chartCtx.beginPath();
  chartCtx.moveTo(padL, padT + plotH);
  chartCtx.lineTo(padL + plotW, padT + plotH);
  chartCtx.stroke();

  chartCtx.fillStyle = "rgba(100, 120, 145, 0.9)";
  chartCtx.font = "9px system-ui, sans-serif";
  chartCtx.fillText("0", padL - 2, padT + plotH + 14);
  const vmaxStr = vmax.toFixed(2);
  chartCtx.fillText(vmaxStr, padL + plotW - chartCtx.measureText(vmaxStr).width, padT + plotH + 14);

  chartCtx.font = "9px system-ui, sans-serif";
  chartCtx.fillStyle = "rgba(200, 210, 225, 0.88)";
  const legSim = "■ simulare";
  const legTh = "── teorie Rayleigh (2D)";
  chartCtx.fillStyle = "rgba(90, 170, 235, 0.95)";
  chartCtx.fillText(legSim, padL, h - 8);
  const simW = chartCtx.measureText(legSim).width;
  chartCtx.strokeStyle = "rgba(255, 145, 105, 0.95)";
  chartCtx.lineWidth = 2;
  chartCtx.beginPath();
  chartCtx.moveTo(padL + simW + 14, h - 12);
  chartCtx.lineTo(padL + simW + 42, h - 12);
  chartCtx.stroke();
  chartCtx.fillStyle = "rgba(200, 210, 225, 0.88)";
  chartCtx.fillText(legTh, padL + simW + 48, h - 8);
}

function drawFrostOverlay(w, h, temp) {
  if (temp >= 100) return;
  const strength = 1 - Math.min(1, temp / 100);
  const a = 0.06 + 0.12 * strength;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `rgba(210, 235, 255, ${a * 0.55})`);
  g.addColorStop(0.5, `rgba(235, 245, 255, ${a * 0.85})`);
  g.addColorStop(1, `rgba(200, 225, 250, ${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function updateTrails(state) {
  if (state === "gas") {
    for (const p of particles) {
      if (!p.trail) p.trail = [];
      p.trail.push({ x: p.x, y: p.y });
      while (p.trail.length > 9) p.trail.shift();
    }
  } else {
    for (const p of particles) {
      p.trail = [];
    }
  }
}

function animate() {
  if (!ambientInited) {
    ambientInited = true;
    initAmbientAudio();
  }

  if (needsCanvasResizeSync()) {
    resizeCanvas(false);
  }

  const dpr = getDpr();
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const bounds = getContainerBounds(w, h, volumeFrac);
  const state = getState(temperature, materialKey);

  const { ratio } = ui.setPressureDisplay(bounds.area, maxCanvasArea);
  ui.maybeInsightFromPressure(ratio);

  const targetShake = Math.max(0, (ratio - 0.92) * 4.2);
  shake += (targetShake - shake) * 0.14;
  const shakeScale =
    temperature < 32 ? Math.max(0.12, temperature / 32) : 1;
  const sx = (Math.random() - 0.5) * shake * shakeScale;
  const sy = (Math.random() - 0.5) * shake * shakeScale;

  stage?.classList.toggle("stage--absolute-zero", temperature < 28);
  updateAmbientLevel(temperature);

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(sx, sy);

  drawContainer(bounds);

  updateParticles(
    particles,
    temperature,
    bounds,
    materialKey,
    pushCollisionFlash
  );
  updateTrails(state);

  drawTrails(state);

  for (const p of particles) {
    drawParticle(ctx, p, temperature);
  }

  drawFlashes();

  if (temperature < 100) {
    drawFrostOverlay(w, h, temperature);
  }

  ctx.restore();

  drawAbsoluteZeroCinematic(ctx, w, h, temperature);

  drawHistogramChart();

  collisionFlashes = collisionFlashes
    .map((f) => ({ ...f, life: f.life - 1 }))
    .filter((f) => f.life > 0);

  if (state === "solid" && !freezeChallengeMet) {
    freezeChallengeMet = true;
    ui.setChallengeFreeze(true);
  }
  if (
    !pressureChallengeMet &&
    ratio > 1.42 &&
    temperature <= pressureBaselineTemp + 0.5
  ) {
    pressureChallengeMet = true;
    ui.setChallengePressure(true);
  }

  if (isExperimentActive()) {
    if (state === "gas") expHasBeenGas = true;
    const winMsg = tickExperiment({
      active: true,
      ratio,
      temp: temperature,
      startTemp: expStartTemp,
      startVol: expStartVol,
      vol: volumeFrac,
      state,
      mat: materialKey,
      hasBeenGas: expHasBeenGas,
    });
    if (winMsg) {
      showToast(winMsg, "\u2705");
      syncExperimentPanel();
    }
  }

  if (prevSimState !== null) {
    if (state === "solid" && prevSimState !== "solid") {
      showToast("Solid achieved", "\u2705");
    }
    if (ratio > 1.36 && prevRatioForReward < 1.2) {
      showToast("High pressure reached", "\uD83D\uDE80");
    }
    if (temperature < 38 && prevTempForReward >= 45) {
      showToast("Near absolute zero", "\u2744\uFE0F");
    }
  }
  prevSimState = state;
  prevTempForReward = temperature;
  prevRatioForReward = ratio;

  requestAnimationFrame(animate);
}

function onResize() {
  resizeCanvas(false);
  resizeChart();
}

function syncPanelAria() {
  const leftOpen = !shell?.classList.contains("shell--left-collapsed");
  const rightOpen = !shell?.classList.contains("shell--right-collapsed");
  toggleLeft?.setAttribute("aria-expanded", String(leftOpen));
  toggleRight?.setAttribute("aria-expanded", String(rightOpen));
}

function syncLayoutAfterDrawerChange() {
  requestAnimationFrame(() => {
    resizeCanvas(false);
    resizeChart();
    requestAnimationFrame(() => {
      resizeCanvas(false);
      resizeChart();
    });
  });
}

function setupPanelToggles() {
  const drawerLeft = document.getElementById("drawer-left");
  const drawerRight = document.getElementById("drawer-right");

  const onDrawerTransitionEnd = (e) => {
    if (e.propertyName !== "width" && e.propertyName !== "max-width") return;
    resizeCanvas(false);
    resizeChart();
  };
  drawerLeft?.addEventListener("transitionend", onDrawerTransitionEnd);
  drawerRight?.addEventListener("transitionend", onDrawerTransitionEnd);

  toggleLeft?.addEventListener("click", () => {
    shell?.classList.toggle("shell--left-collapsed");
    syncPanelAria();
    syncLayoutAfterDrawerChange();
    try {
      localStorage.setItem(
        "crio-left",
        shell?.classList.contains("shell--left-collapsed") ? "0" : "1"
      );
    } catch (_) {
      /* ignore */
    }
  });
  toggleRight?.addEventListener("click", () => {
    shell?.classList.toggle("shell--right-collapsed");
    syncPanelAria();
    syncLayoutAfterDrawerChange();
    try {
      localStorage.setItem(
        "crio-right",
        shell?.classList.contains("shell--right-collapsed") ? "0" : "1"
      );
    } catch (_) {
      /* ignore */
    }
  });

  try {
    if (localStorage.getItem("crio-left") === "0") {
      shell?.classList.add("shell--left-collapsed");
    }
    if (localStorage.getItem("crio-right") === "0") {
      shell?.classList.add("shell--right-collapsed");
    }
  } catch (_) {
    /* ignore */
  }
  syncPanelAria();
}

window.addEventListener("resize", onResize);

if (typeof ResizeObserver !== "undefined" && chartWrap) {
  new ResizeObserver(() => resizeChart()).observe(chartWrap);
}

if (typeof ResizeObserver !== "undefined" && stage) {
  new ResizeObserver(() => resizeCanvas(false)).observe(stage);
}

setupPanelToggles();

document.getElementById("btn-exp-start")?.addEventListener("click", () => {
  initAmbientAudio();
  resumeAudioIfNeeded();
  startExperiment();
  expStartTemp = temperature;
  expStartVol = volumeFrac;
  expHasBeenGas = stateGuessGas();
  const def = getCurrentExperimentDef();
  showToast(`Start: ${def.title}`, "\uD83E\uDDEA");
});

document.getElementById("btn-exp-next")?.addEventListener("click", () => {
  advanceExperimentPreview();
  syncExperimentPanel();
  showToast("Următorul experiment — citește ținta", "\u2935\uFE0F");
});

document.getElementById("btn-capture")?.addEventListener("click", () => {
  resumeAudioIfNeeded();
  captureExperimentShot(canvas, {
    temp: ui.getTemperature(),
    pressure: ui.getPressureLabelText(),
    state: ui.getStateLabelText(),
  });
});

document.body.addEventListener(
  "click",
  () => {
    resumeAudioIfNeeded();
  },
  { once: true }
);

function stateGuessGas() {
  return getState(temperature, materialKey) === "gas";
}

volumeFrac = ui.getVolumeFrac();
materialKey = ui.getMaterial();
temperature = ui.getTemperature();
pressureBaselineTemp = temperature;
resizeCanvas(true);
resizeChart();
ui.setChallengeFreeze(false);
ui.setChallengePressure(false);
syncExperimentPanel();
prevSimState = null;
requestAnimationFrame(animate);
