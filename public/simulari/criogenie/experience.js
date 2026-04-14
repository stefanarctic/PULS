/** Toast-uri, experimente ghidate, captură PNG */

let toastTimer = null;

export function showToast(message, icon = "\u2728") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = `${icon} ${message}`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("toast--show");
    setTimeout(() => el.remove(), 450);
  }, 3400);
}

export const EXPERIMENTS = [
  {
    title: "Presiune mare, fără T mai mare",
    desc: "Obține Pressure: High fără să crești temperatura față de momentul Start.",
    winMsg: "Experiment reușit: presiune mare la T controlată!",
    check: (c) =>
      c.active &&
      c.ratio > 1.38 &&
      c.temp <= c.startTemp + 1.5,
  },
  {
    title: "Lichid fără volum mai mare",
    desc: "Cu Apă: pornește la T mare (gaz), coboară T spre lichid. Nu crește slider-ul Volum după Start.",
    winMsg: "Experiment reușit: lichid fără să mărești cutia!",
    check: (c) =>
      c.active &&
      c.mat === "water" &&
      c.hasBeenGas &&
      c.state === "liquid" &&
      c.vol <= c.startVol + 0.015,
  },
  {
    title: "Zonă criogenică",
    desc: "Adu temperatura sub 80 K și observă încetinirea.",
    winMsg: "Experiment reușit: zonă ultrarece!",
    check: (c) => c.active && c.temp < 80,
  },
  {
    title: "Stare solidă",
    desc: "Obține solid pentru materialul ales (coboară T sau alege un material cu T de îngheț potrivit).",
    winMsg: "Experiment reușit: solid atins!",
    check: (c) => c.active && c.state === "solid",
  },
];

let expIndex = 0;
let expActive = false;

export function isExperimentActive() {
  return expActive;
}

export function getExperimentIndex() {
  return expIndex;
}

export function getCurrentExperimentDef() {
  return EXPERIMENTS[expIndex];
}

export function startExperiment() {
  expActive = true;
  return EXPERIMENTS[expIndex];
}

export function stopExperiment() {
  expActive = false;
}

/**
 * @returns {string|null} mesaj win
 */
export function tickExperiment(c) {
  if (!expActive) return null;
  const def = EXPERIMENTS[expIndex];
  if (!def.check(c)) return null;
  expActive = false;
  const msg = def.winMsg;
  expIndex = (expIndex + 1) % EXPERIMENTS.length;
  return msg;
}

export function advanceExperimentPreview() {
  expIndex = (expIndex + 1) % EXPERIMENTS.length;
  return EXPERIMENTS[expIndex];
}

/** Captură canvas simulare + banner T, P, stare */
export function captureExperimentShot(sourceCanvas, meta) {
  const cw = sourceCanvas.width;
  const ch = sourceCanvas.height;
  const bh = Math.max(96, Math.floor(ch * 0.14));

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch + bh;
  const o = out.getContext("2d");

  o.fillStyle = "#070a10";
  o.fillRect(0, 0, cw, bh);

  const pad = Math.floor(bh * 0.12);
  o.fillStyle = "#e8eaef";
  const fs = Math.max(15, Math.floor(bh * 0.22));
  o.font = `600 ${fs}px system-ui, "Segoe UI", sans-serif`;
  o.fillText(
    `T = ${meta.temp} K  ·  ${meta.pressure}  ·  ${meta.state}`,
    pad,
    Math.floor(bh * 0.42)
  );
  o.font = `500 ${Math.floor(fs * 0.72)}px system-ui, sans-serif`;
  o.fillStyle = "#7ec8e3";
  o.fillText("Simulated on puls-fizica.ro", pad, Math.floor(bh * 0.78));

  o.drawImage(sourceCanvas, 0, bh);

  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `criogenie-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Imagine salvată", "\uD83D\uDCF8");
  }, "image/png");
}

let audioCtx = null;
let oscNode = null;
let gainNode = null;

export function initAmbientAudio() {
  if (audioCtx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    oscNode = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    oscNode.type = "sine";
    oscNode.frequency.value = 48;
    gainNode.gain.value = 0;
    oscNode.connect(gainNode).connect(audioCtx.destination);
    oscNode.start();
  } catch (_) {
    audioCtx = null;
  }
}

export function resumeAudioIfNeeded() {
  if (audioCtx?.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

/** Volum ~ proporțional cu T² în model simplu; „aproape tăcere” la T mic */
export function updateAmbientLevel(tempK) {
  if (!audioCtx || !gainNode) return;
  const t = Math.max(0, Math.min(1, tempK / 300));
  const target = 0.018 * t * t * t;
  try {
    gainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.08);
  } catch (_) {
    gainNode.gain.value = target;
  }
}
