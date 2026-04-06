/* =====================================================
   ELI-NP – Lovește Ținta  |  script.js
   Simulare fascicul laser de mare putere
   ===================================================== */

"use strict";

// ─────────────────────────────────────────────
//  Canvas setup
// ─────────────────────────────────────────────
const canvas  = document.getElementById("simCanvas");
const ctx     = canvas.getContext("2d");

function resizeCanvas() {
  const section = canvas.parentElement;
  canvas.width  = section.clientWidth;
  canvas.height = section.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", () => { resizeCanvas(); drawScene(); });

// ─────────────────────────────────────────────
//  DOM refs
// ─────────────────────────────────────────────
const sliderPower    = document.getElementById("sliderPower");
const sliderFocus    = document.getElementById("sliderFocus");
const sliderDist     = document.getElementById("sliderDist");
const selectMaterial = document.getElementById("selectMaterial");
const toggleELI      = document.getElementById("toggleELI");
const sliderPulse    = document.getElementById("sliderPulse");
const sliderRep      = document.getElementById("sliderRep");
const eliParams      = document.getElementById("eliParams");
const btnFire        = document.getElementById("btnFire");
const btnReset       = document.getElementById("btnReset");
const overlayMsg     = document.getElementById("overlayMsg");

const labelPower  = document.getElementById("labelPower");
const labelFocus  = document.getElementById("labelFocus");
const labelDist   = document.getElementById("labelDist");
const labelPulse  = document.getElementById("labelPulse");
const labelRep    = document.getElementById("labelRep");

const rdIntensity = document.getElementById("rdIntensity");
const rdTemp      = document.getElementById("rdTemp");
const rdIoniz     = document.getElementById("rdIoniz");
const rdPressure  = document.getElementById("rdPressure");
const rdPeakInt   = document.getElementById("rdPeakInt");
const rdEliBlock  = document.getElementById("rdEliBlock");
const rdState     = document.getElementById("rdState");
const regimeFill  = document.getElementById("regimeFill");
const infoBox     = document.getElementById("infoBox");

const defaults = {
  power: sliderPower.value,
  focus: sliderFocus.value,
  dist: sliderDist.value,
  material: selectMaterial.value,
  eli: toggleELI.checked,
  pulse: sliderPulse.value,
  rep: sliderRep.value,
};

// ─────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────
let state = {
  firing:       false,
  animFrame:    null,
  phase:        "idle",   // idle | heating | ablation | plasma | boom
  phaseTime:    0,
  particles:    [],
  sparks:       [],
  shockRings:   [],
  beamProgress: 0,        // 0..1 beam travel animation
  craterRadius: 0,
  glowIntensity:0,
  eliPulseTimer:0,
  eliPulseActive:false,
};

// ─────────────────────────────────────────────
//  Physics helpers
// ─────────────────────────────────────────────

/** Spot area in cm² from diameter in µm */
function spotArea_cm2(diam_um) {
  const r_cm = (diam_um * 1e-4) / 2;
  return Math.PI * r_cm * r_cm;
}

/** Effective spot diameter after divergence at distance d */
function effectiveDiam(diam_um, dist_m) {
  // Simple Gaussian divergence: θ ≈ λ/πw₀, λ=800nm
  const lambda = 800e-9;
  const w0 = (diam_um * 1e-6) / 2;
  const zR = Math.PI * w0 * w0 / lambda;          // Rayleigh range
  const w  = w0 * Math.sqrt(1 + (dist_m / zR) ** 2);
  return w * 2 * 1e6;                              // back to µm
}

/** Intensity in W/cm² */
function intensity(power_PW, diam_um, dist_m) {
  const effD = effectiveDiam(diam_um, dist_m);
  const A    = spotArea_cm2(effD);
  const P_W  = power_PW * 1e15;
  // Scale up by 1e4 to reach ELI-NP realistic range (10^18-10^23 W/cm² for focused beams)
  return (P_W / A) * 1e4;
}

/** Peak intensity for pulsed mode */
function peakIntensity(power_PW, diam_um, dist_m, pulse_fs) {
  // For ELI ultra-short pulses: I_peak = P_peak / A
  // P_peak = E_pulse / tau; E_pulse ~ power_PW * 1e15 * 1s (stored energy)
  // But for simulation: peak power = power_PW * 1e15 * (1s / pulse_fs*1e-15) = power / tau
  // This gives the compression factor for ultra-short pulses
  const effD   = effectiveDiam(diam_um, dist_m);
  const A      = spotArea_cm2(effD);
  const P_W    = power_PW * 1e15;
  // Peak power = average power compressed into pulse duration
  // Compression factor: 1 second / pulse_duration
  const compressionFactor = 1.0 / (pulse_fs * 1e-15);
  const P_peak = P_W * Math.min(compressionFactor, 1e10); // cap at 10^10 compression
  return (P_peak / A) * 1e4; // same scale factor as CW
}

/** Approximate temperature from intensity (very simplified) */
function temperature(I_Wcm2, material) {
  const matFactor = { metal: 1.0, plastic: 1.4, plasma: 2.0 };
  const f = matFactor[material] || 1;
  // T ~ I^0.5 * constant; scaled for ELI range
  return Math.min(1e10, f * 0.0004 * Math.sqrt(I_Wcm2));
}

/** Ionization degree 0-100% */
function ionization(I_Wcm2) {
  // Threshold ~10^15 W/cm², saturation ~10^22
  const log = Math.log10(Math.max(1, I_Wcm2));
  return Math.min(100, Math.max(0, (log - 15) / 7 * 100));
}

/** Radiation pressure in GPa */
function radPressure(I_Wcm2) {
  const c = 3e10; // cm/s
  return (2 * I_Wcm2 / c) * 1e-9; // GPa
}

/** Regime 0..1 */
function regimeLevel(I_Wcm2) {
  // Range: 10^14 (thermal) to 10^23 (relativistic) → 9 decades
  const log = Math.log10(Math.max(1, I_Wcm2));
  return Math.min(1, Math.max(0, (log - 14) / 9));
}

/** Format big numbers */
function fmtSci(n) {
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const man = n / Math.pow(10, exp);
  return `${man.toFixed(2)} × 10<sup>${exp}</sup>`;
}

function fmtTemp(T) {
  if (T < 1e3)  return T.toFixed(0) + " K";
  if (T < 1e6)  return (T/1e3).toFixed(1) + " kK";
  if (T < 1e9)  return (T/1e6).toFixed(2) + " MK";
  return (T/1e9).toFixed(2) + " GK";
}

// ─────────────────────────────────────────────
//  Slider live update
// ─────────────────────────────────────────────
function updateLabels() {
  labelPower.textContent = `${parseFloat(sliderPower.value).toFixed(2)} PW`;
  labelFocus.textContent = `${sliderFocus.value} µm`;
  labelDist.textContent  = `${parseFloat(sliderDist.value).toFixed(1)} m`;
  labelPulse.textContent = `${sliderPulse.value} fs`;
  labelRep.textContent   = `${sliderRep.value} Hz`;
}

[sliderPower, sliderFocus, sliderDist, sliderPulse, sliderRep].forEach(s => {
  s.addEventListener("input", () => { updateLabels(); if (!state.firing) drawScene(); });
});

toggleELI.addEventListener("change", () => {
  eliParams.classList.toggle("hidden", !toggleELI.checked);
  rdEliBlock.style.display = toggleELI.checked ? "block" : "none";
  if (!state.firing) drawScene();
});

selectMaterial.addEventListener("change", () => { if (!state.firing) drawScene(); });

updateLabels();

// ─────────────────────────────────────────────
//  Drawing helpers
// ─────────────────────────────────────────────

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Deep space background
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#090909");
  bg.addColorStop(1, "#121212");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(0,217,255,0.14)";
  ctx.lineWidth = 0.5;
  const step = 40;
  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.restore();
}

function getColors(material) {
  return {
    metal:   { base: "#8a7a60", hot: "#ff8c00", melt: "#ff4500", plasma: "#bf00ff" },
    plastic: { base: "#4a6a4a", hot: "#aaff44", melt: "#ffdd00", plasma: "#00ffcc" },
    plasma:  { base: "#1a0a3a", hot: "#8800ff", melt: "#cc44ff", plasma: "#ff00ff" },
  }[material] || { base: "#888", hot: "#f80", melt: "#f40", plasma: "#f0f" };
}

// ─────────────────────────────────────────────
//  Scene geometry
// ─────────────────────────────────────────────
function getGeometry() {
  const W = canvas.width, H = canvas.height;
  const dist_m = parseFloat(sliderDist.value);
  const distNorm = Math.max(0, Math.min(1, (dist_m - 0.1) / (5 - 0.1)));
  const sourceX = W * 0.08;
  const sourceY = H * 0.5;
  // Distance slider now affects the rendered scene, not only physics.
  // Near distance -> target appears closer to the source.
  // Far distance  -> target moves further right and slightly shrinks.
  const targetX = W * (0.62 + distNorm * 0.28);
  const targetY = H * 0.5;
  const perspectiveScale = 1 - distNorm * 0.22;
  const targetW = W * 0.12 * perspectiveScale;
  const targetH = H * 0.55 * perspectiveScale;
  return { W, H, sourceX, sourceY, targetX, targetY, targetW, targetH };
}

// ─────────────────────────────────────────────
//  Draw idle / static scene
// ─────────────────────────────────────────────
function drawScene() {
  clearCanvas();
  const g = getGeometry();
  const mat = selectMaterial.value;
  const col = getColors(mat);

  // Laser source housing
  drawLaserSource(g.sourceX, g.sourceY, g.W, g.H);

  // Lens
  const lensX = g.sourceX + (g.targetX - g.sourceX) * 0.45;
  drawLens(lensX, g.sourceY, g.H);

  // Beam (idle, dim)
  const diam_um  = parseFloat(sliderFocus.value);
  const dist_m   = parseFloat(sliderDist.value);
  const effD     = effectiveDiam(diam_um, dist_m);
  const beamW_px = Math.max(2, Math.min(60, effD / 5));

  drawBeamIdle(g.sourceX + 60, g.sourceY, lensX - 10, g.sourceY, beamW_px * 2, beamW_px);
  drawBeamIdle(lensX + 10, g.sourceY, g.targetX, g.sourceY, beamW_px * 2, beamW_px * 0.3);

  // Target plate
  drawTarget(g.targetX, g.targetY, g.targetW, g.targetH, col.base, 0, 0);

  // Labels
  drawLabels(g, lensX, diam_um, dist_m, effD);
}

function drawLaserSource(x, y, W, H) {
  ctx.save();
  // Housing body
  const hw = 55, hh = 28;
  const grad = ctx.createLinearGradient(x - hw, y - hh, x - hw, y + hh);
  grad.addColorStop(0, "#1a1a1a");
  grad.addColorStop(0.5, "#141414");
  grad.addColorStop(1, "#101010");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#2f2f2f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - hw, y - hh, hw * 2, hh * 2, 6);
  ctx.fill(); ctx.stroke();

  // Aperture glow
  ctx.beginPath();
  ctx.arc(x + hw - 8, y, 8, 0, Math.PI * 2);
  const ag = ctx.createRadialGradient(x + hw - 8, y, 0, x + hw - 8, y, 8);
  ag.addColorStop(0, "rgba(0,217,255,0.72)");
  ag.addColorStop(1, "rgba(0,217,255,0)");
  ctx.fillStyle = ag;
  ctx.fill();

  // Label
  ctx.fillStyle = "#00d9ff";
  ctx.font = "bold 9px 'Courier New'";
  ctx.textAlign = "center";
  ctx.fillText("FASCICUL", x, y - hh - 6);
  ctx.fillStyle = "#87909c";
  ctx.font = "8px 'Courier New'";
  ctx.fillText("ELI-NP · 10 PW", x, y + hh + 14);
  ctx.restore();
}

function drawLens(x, y, H) {
  ctx.save();
  const lh = 36;
  // Lens body
  ctx.strokeStyle = "rgba(0,217,255,0.45)";
  ctx.lineWidth = 2;
  ctx.fillStyle = "rgba(0,217,255,0.05)";
  ctx.beginPath();
  ctx.ellipse(x, y, 8, lh, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Refraction lines
  ctx.strokeStyle = "rgba(0,217,255,0.18)";
  ctx.lineWidth = 0.5;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 8, y + i * 10);
    ctx.lineTo(x + 8, y + i * 8);
    ctx.stroke();
  }

  ctx.fillStyle = "#87909c";
  ctx.font = "8px 'Courier New'";
  ctx.textAlign = "center";
  ctx.fillText("LENTILĂ", x, y + lh + 14);
  ctx.restore();
}

function drawBeamIdle(x1, y1, x2, y2, w1, w2) {
  ctx.save();
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, "rgba(0,217,255,0.12)");
  grad.addColorStop(1, "rgba(0,217,255,0.05)");

  ctx.beginPath();
  ctx.moveTo(x1, y1 - w1 / 2);
  ctx.lineTo(x2, y2 - w2 / 2);
  ctx.lineTo(x2, y2 + w2 / 2);
  ctx.lineTo(x1, y1 + w1 / 2);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function drawTarget(cx, cy, tw, th, baseColor, craterR, glowI) {
  ctx.save();
  const x = cx - tw / 2, y = cy - th / 2;

  // Plate gradient
  const pg = ctx.createLinearGradient(x, y, x + tw, y);
  pg.addColorStop(0, shadeColor(baseColor, -30));
  pg.addColorStop(0.5, baseColor);
  pg.addColorStop(1, shadeColor(baseColor, -20));
  ctx.fillStyle = pg;
  ctx.strokeStyle = shadeColor(baseColor, 20);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, tw, th, 4);
  ctx.fill(); ctx.stroke();

  // Surface texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < th; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x, y + i);
    ctx.lineTo(x + tw, y + i);
    ctx.stroke();
  }

  // Crater
  if (craterR > 0) {
    const hitX = cx - tw / 2 + 4;
    const hitY = cy;

    // Crater depression
    const cg = ctx.createRadialGradient(hitX, hitY, 0, hitX, hitY, craterR);
    cg.addColorStop(0, "rgba(0,0,0,0.9)");
    cg.addColorStop(0.5, "rgba(80,20,0,0.7)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(hitX, hitY, craterR, craterR * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Molten glow ring
    if (glowI > 0) {
      const mg = ctx.createRadialGradient(hitX, hitY, craterR * 0.5, hitX, hitY, craterR * 1.5);
      const alpha = Math.min(0.8, glowI);
      mg.addColorStop(0, `rgba(255,140,0,${alpha})`);
      mg.addColorStop(0.5, `rgba(255,60,0,${alpha * 0.5})`);
      mg.addColorStop(1, "rgba(255,0,0,0)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(hitX, hitY, craterR * 1.5, craterR, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Label
  ctx.fillStyle = "#87909c";
  ctx.font = "8px 'Courier New'";
  ctx.textAlign = "center";
  const matNames = { metal: "Au (metal)", plastic: "CH₂ (plastic)", plasma: "Plasmă" };
  ctx.fillText(matNames[selectMaterial.value] || "Țintă", cx, cy + th / 2 + 14);
  ctx.restore();
}

function drawLabels(g, lensX, diam_um, dist_m, effD) {
  ctx.save();
  ctx.fillStyle = "rgba(135,144,156,0.75)";
  ctx.font = "9px 'Courier New'";
  ctx.textAlign = "center";

  // Distance arrow
  const arrowY = g.sourceY + g.H * 0.3;
  ctx.strokeStyle = "rgba(135,144,156,0.35)";
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(g.sourceX + 60, arrowY);
  ctx.lineTo(g.targetX, arrowY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillText(`d = ${parseFloat(sliderDist.value).toFixed(1)} m`, (g.sourceX + 60 + g.targetX) / 2, arrowY - 6);

  // Spot size annotation
  const spotY = g.sourceY - 30;
  ctx.fillStyle = "rgba(0,217,255,0.42)";
  ctx.fillText(`⌀ pată: ${effD.toFixed(1)} µm (ef.)`, g.targetX + g.targetW * 0.5 + 30, spotY);

  ctx.restore();
}

// ─────────────────────────────────────────────
//  Particle system
// ─────────────────────────────────────────────
function spawnParticles(cx, cy, count, type) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    const colors = {
      spark:  ["#ff8c00","#ffdd00","#ff4500"],
      plasma: ["#bf00ff","#ff00ff","#8800ff","#00ffff"],
      debris: ["#888","#aaa","#666","#ff6600"],
    };
    const palette = colors[type] || colors.spark;
    state.particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed * (type === "debris" ? 1 : 0.7),
      vy: Math.sin(angle) * speed * (type === "debris" ? 1 : 0.5) - (type !== "debris" ? 1.5 : 0),
      life: 1.0,
      decay: 0.01 + Math.random() * 0.025,
      size: 1.5 + Math.random() * 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      type,
    });
  }
}

function spawnShockRing(cx, cy, color) {
  state.shockRings.push({ x: cx, y: cy, r: 5, maxR: 80 + Math.random() * 60, life: 1.0, color });
}

function updateParticles() {
  state.particles = state.particles.filter(p => p.life > 0);
  state.particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.type !== "plasma") p.vy += 0.05; // gravity for debris
    p.life -= p.decay;
    p.vx *= 0.98;
  });

  state.shockRings = state.shockRings.filter(r => r.life > 0);
  state.shockRings.forEach(r => {
    r.r += (r.maxR - r.r) * 0.08;
    r.life -= 0.015;
  });
}

function drawParticles() {
  state.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  state.shockRings.forEach(r => {
    ctx.save();
    ctx.globalAlpha = r.life * 0.6;
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2 * r.life;
    ctx.shadowColor = r.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

// ─────────────────────────────────────────────
//  Animated beam drawing
// ─────────────────────────────────────────────
function drawAnimatedBeam(progress, beamW, phase, eliMode) {
  const g = getGeometry();
  const lensX = g.sourceX + (g.targetX - g.sourceX) * 0.45;
  const hitX  = g.targetX - g.targetW / 2 + 4;
  const hitY  = g.sourceY;

  const endX = g.sourceX + 60 + (hitX - (g.sourceX + 60)) * Math.min(1, progress * 1.5);

  ctx.save();

  // ── Beam color by phase ──
  let coreColor, glowColor;
  if (eliMode) {
    coreColor = "#ffffff";
    glowColor = "#ffd700";
  } else if (phase === "plasma" || phase === "boom") {
    coreColor = "#ff00ff";
    glowColor = "#bf00ff";
  } else if (phase === "ablation") {
    coreColor = "#ff8c00";
    glowColor = "#ff4500";
  } else {
    coreColor = "#00d4ff";
    glowColor = "#0088ff";
  }

  // Pre-lens beam
  const preEnd = Math.min(lensX, endX);
  if (preEnd > g.sourceX + 60) {
    const preGrad = ctx.createLinearGradient(g.sourceX + 60, hitY, preEnd, hitY);
    preGrad.addColorStop(0, `${glowColor}00`);
    preGrad.addColorStop(0.3, glowColor);
    preGrad.addColorStop(1, coreColor);

    ctx.beginPath();
    ctx.moveTo(g.sourceX + 60, hitY - beamW);
    ctx.lineTo(preEnd, hitY - beamW * 0.5);
    ctx.lineTo(preEnd, hitY + beamW * 0.5);
    ctx.lineTo(g.sourceX + 60, hitY + beamW);
    ctx.closePath();
    ctx.fillStyle = preGrad;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;
    ctx.fill();

    // Core line
    ctx.beginPath();
    ctx.moveTo(g.sourceX + 60, hitY);
    ctx.lineTo(preEnd, hitY);
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 30;
    ctx.stroke();
  }

  // Post-lens beam (focused, narrower)
  if (endX > lensX) {
    const focW = Math.max(1.5, beamW * 0.25);
    const postGrad = ctx.createLinearGradient(lensX, hitY, endX, hitY);
    postGrad.addColorStop(0, coreColor);
    postGrad.addColorStop(1, coreColor);

    ctx.beginPath();
    ctx.moveTo(lensX, hitY - beamW * 0.5);
    ctx.lineTo(endX, hitY - focW);
    ctx.lineTo(endX, hitY + focW);
    ctx.lineTo(lensX, hitY + beamW * 0.5);
    ctx.closePath();
    ctx.fillStyle = postGrad;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 40;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.moveTo(lensX, hitY);
    ctx.lineTo(endX, hitY);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 50;
    ctx.stroke();
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
//  Plasma explosion effect
// ─────────────────────────────────────────────
function drawPlasmaExplosion(cx, cy, intensity, phase) {
  if (intensity <= 0) return;
  ctx.save();

  const r = 20 + intensity * 60;

  // Outer plasma cloud
  const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  if (phase === "boom") {
    pg.addColorStop(0, `rgba(255,255,255,${Math.min(1, intensity)})`);
    pg.addColorStop(0.2, `rgba(255,200,0,${intensity * 0.9})`);
    pg.addColorStop(0.5, `rgba(255,60,0,${intensity * 0.6})`);
    pg.addColorStop(0.8, `rgba(150,0,200,${intensity * 0.3})`);
    pg.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    pg.addColorStop(0, `rgba(255,140,0,${intensity * 0.9})`);
    pg.addColorStop(0.4, `rgba(200,0,200,${intensity * 0.5})`);
    pg.addColorStop(1, "rgba(0,0,0,0)");
  }

  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Flicker lines
  if (intensity > 0.3) {
    ctx.strokeStyle = `rgba(255,255,200,${intensity * 0.6})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + state.phaseTime * 0.1;
      const len = r * (0.5 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
//  ELI pulse flash
// ─────────────────────────────────────────────
function drawELIPulseFlash(cx, cy, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  const r = 15 + alpha * 40;
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g2.addColorStop(0, `rgba(255,255,255,${alpha})`);
  g2.addColorStop(0.3, `rgba(255,220,0,${alpha * 0.8})`);
  g2.addColorStop(1, "rgba(255,200,0,0)");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────
//  Main animation loop
// ─────────────────────────────────────────────
function animLoop() {
  const g       = getGeometry();
  const mat     = selectMaterial.value;
  const col     = getColors(mat);
  const eliMode = toggleELI.checked;

  const power_PW = parseFloat(sliderPower.value);
  const diam_um  = parseFloat(sliderFocus.value);
  const dist_m   = parseFloat(sliderDist.value);
  const pulse_fs = parseFloat(sliderPulse.value);

  const I        = intensity(power_PW, diam_um, dist_m);
  const Ipeak    = eliMode ? peakIntensity(power_PW, diam_um, dist_m, pulse_fs) : I;
  const Ieff     = eliMode ? Ipeak : I;
  const T        = temperature(Ieff, mat);
  const ioniz    = ionization(Ieff);
  const pres     = radPressure(Ieff);
  const regime   = regimeLevel(Ieff);

  const hitX = g.targetX - g.targetW / 2 + 4;
  const hitY = g.sourceY;

  state.phaseTime++;

  // ── Phase transitions ──
  if (state.phase === "idle") {
    state.beamProgress += 0.025;
    if (state.beamProgress >= 1) {
      state.beamProgress = 1;
      state.phase = "heating";
      state.phaseTime = 0;
    }
  }

  // Speed factor: higher intensity = faster transitions
  const speedMult = Math.max(1, Math.log10(Math.max(1, Ieff)) - 12);

  if (state.phase === "heating") {
    state.glowIntensity = Math.min(1, state.phaseTime / 40);
    state.craterRadius  = Math.min(20, state.phaseTime * 0.4 * speedMult);
    if (state.phaseTime % 3 === 0) spawnParticles(hitX, hitY, 2 + Math.floor(speedMult), "spark");
    if (state.phaseTime > Math.max(20, 60 / speedMult)) { state.phase = "ablation"; state.phaseTime = 0; }
  }

  if (state.phase === "ablation") {
    state.glowIntensity = 0.8 + 0.2 * Math.sin(state.phaseTime * 0.3);
    state.craterRadius  = Math.min(35, 20 + state.phaseTime * 0.35 * speedMult);
    if (state.phaseTime % 2 === 0) spawnParticles(hitX, hitY, 3 + Math.floor(speedMult), "debris");
    if (state.phaseTime % 8 === 0) spawnShockRing(hitX, hitY, col.melt);

    if (ioniz > 20 || state.phaseTime > Math.max(30, 80 / speedMult)) { state.phase = "plasma"; state.phaseTime = 0; }
  }

  if (state.phase === "plasma") {
    state.glowIntensity = 1;
    state.craterRadius  = Math.min(60, 35 + state.phaseTime * 0.4 * speedMult);
    if (state.phaseTime % 1 === 0) spawnParticles(hitX, hitY, 4 + Math.floor(speedMult), "plasma");
    if (state.phaseTime % 5 === 0) spawnShockRing(hitX, hitY, col.plasma);

    if (regime > 0.4 || state.phaseTime > Math.max(30, 80 / speedMult)) {
      state.phase = "boom";
      state.phaseTime = 0;
      spawnParticles(hitX, hitY, 80, "debris");
      spawnParticles(hitX, hitY, 60, "plasma");
      for (let i = 0; i < 5; i++) spawnShockRing(hitX, hitY, "#ffffff");
      showOverlay("💥 PLASMĂ COMPLETĂ!\nȚinta ionizată 100%");
    }
  }

  if (state.phase === "boom") {
    state.glowIntensity = Math.max(0, 1 - state.phaseTime / 120);
    if (state.phaseTime % 4 === 0) spawnParticles(hitX, hitY, 5, "plasma");
    if (state.phaseTime > 200) {
      state.phase = "done";
    }
  }

  // ELI pulse flash
  if (eliMode) {
    const repHz = parseFloat(sliderRep.value);
    const interval = Math.max(5, Math.round(60 / repHz));
    if (state.phaseTime % interval === 0 && state.phase !== "idle") {
      state.eliPulseActive = true;
      state.eliPulseTimer = 1.0;
    }
    if (state.eliPulseActive) {
      state.eliPulseTimer -= 0.08;
      if (state.eliPulseTimer <= 0) { state.eliPulseActive = false; state.eliPulseTimer = 0; }
    }
  }

  updateParticles();

  // ── Draw ──
  clearCanvas();

  const effD    = effectiveDiam(diam_um, dist_m);
  const beamW   = Math.max(3, Math.min(40, effD / 8));
  const lensX   = g.sourceX + (g.targetX - g.sourceX) * 0.45;

  drawLaserSource(g.sourceX, g.sourceY, g.W, g.H);
  drawLens(lensX, g.sourceY, g.H);
  drawAnimatedBeam(state.beamProgress, beamW, state.phase, eliMode);
  drawTarget(g.targetX, g.targetY, g.targetW, g.targetH, col.base, state.craterRadius, state.glowIntensity);
  drawPlasmaExplosion(hitX, hitY, state.glowIntensity * (state.phase === "boom" ? 1 : 0.5), state.phase);
  if (eliMode) drawELIPulseFlash(hitX, hitY, state.eliPulseTimer);
  drawParticles();
  drawLabels(g, lensX, diam_um, dist_m, effD);

  // ── Update readouts ──
  updateReadouts(I, Ipeak, T, ioniz, pres, regime, eliMode);

  if (state.phase !== "done") {
    state.animFrame = requestAnimationFrame(animLoop);
  } else {
    state.firing = false;
    btnFire.classList.remove("firing");
    btnFire.textContent = "🔴 PORNEȘTE LASERUL";
  }
}

// ─────────────────────────────────────────────
//  Readout update
// ─────────────────────────────────────────────
function updateReadouts(I, Ipeak, T, ioniz, pres, regime, eliMode) {
  // Format intensity
  rdIntensity.innerHTML = fmtSci(I);

  // Temperature color
  const Tk = T;
  rdTemp.textContent = fmtTemp(Tk);
  rdTemp.style.color = Tk > 1e7 ? "#ff00ff" : Tk > 1e5 ? "#ff4500" : Tk > 1e3 ? "#ff8c00" : "#39ff14";

  // Ionization
  rdIoniz.textContent = ioniz.toFixed(1);
  rdIoniz.style.color = ioniz > 80 ? "#ff00ff" : ioniz > 40 ? "#ff4500" : ioniz > 10 ? "#ff8c00" : "#39ff14";

  // Pressure
  rdPressure.innerHTML = fmtSci(pres);

  // ELI peak
  if (eliMode) {
    rdPeakInt.innerHTML = fmtSci(Ipeak);
  }

  // State
  const stateMap = {
    idle:     { text: "Fascicul în drum",  color: "#00d4ff" },
    heating:  { text: "Încălzire",          color: "#ff8c00" },
    ablation: { text: "Ablație",            color: "#ff4500" },
    plasma:   { text: "Ionizare / Plasmă",  color: "#bf00ff" },
    boom:     { text: "PLASMĂ COMPLETĂ 💥", color: "#ff00ff" },
    done:     { text: "Finalizat",          color: "#39ff14" },
  };
  const s = stateMap[state.phase] || stateMap.idle;
  rdState.textContent = s.text;
  rdState.style.color = s.color;

  // Regime bar
  const pct = (regime * 100).toFixed(0);
  regimeFill.style.width = `${pct}%`;
  regimeFill.style.background = regime > 0.75 ? "#ff00ff"
    : regime > 0.5 ? "#bf00ff"
    : regime > 0.25 ? "#ff4500"
    : "#39ff14";

  // Info box
  updateInfoBox(I, T, ioniz, regime, eliMode);
}

function updateInfoBox(I, T, ioniz, regime, eliMode) {
  let txt = "";
  const log = Math.log10(Math.max(1, I));

  if (log < 16) {
    txt = "<strong>Regim termic:</strong> Fasciculul încălzeşte suprafaţa. Temperatura creşte, dar nu există ablaţie semnificativă.";
  } else if (log < 18) {
    txt = "<strong>Ablaţie laser:</strong> Materialul se evaporă şi se ejectează. Se formează un crater. Presiunea de radiaţie devine semnificativă.";
  } else if (log < 21) {
    txt = "<strong>Ionizare / Plasmă:</strong> Electronii sunt smuşi din atomi. Se formează plasmă fierbinte. Intensitatea câmpului electric depăşeşte câmpul atomic.";
  } else {
    txt = "<strong>Regim relativist:</strong> Electronii sunt acceleraţi la viteze relativiste. Fizică nucleară şi generare de particule. Acesta este regimul ELI-NP!";
  }

  if (eliMode) {
    txt += " <strong style='color:#ffd700'>Modul ELI activ:</strong> pulsuri femtosecunde → putere de vârf extremă în timp ultra-scurt.";
  }

  infoBox.innerHTML = `<p>${txt}</p>`;
}

function updateIdleReadouts() {
  const power_PW = parseFloat(sliderPower.value);
  const diam_um  = parseFloat(sliderFocus.value);
  const dist_m   = parseFloat(sliderDist.value);
  const pulse_fs = parseFloat(sliderPulse.value);
  const mat      = selectMaterial.value;
  const eliMode  = toggleELI.checked;

  const I     = intensity(power_PW, diam_um, dist_m);
  const Ipeak = eliMode ? peakIntensity(power_PW, diam_um, dist_m, pulse_fs) : I;
  const Ieff  = eliMode ? Ipeak : I;
  const T     = temperature(Ieff, mat);
  const ioniz = ionization(Ieff);
  const pres  = radPressure(Ieff);
  const regime = regimeLevel(Ieff);

  rdIntensity.innerHTML = fmtSci(I);
  rdTemp.textContent = fmtTemp(T);
  rdTemp.style.color = T > 1e7 ? "#ff00ff" : T > 1e5 ? "#ff4500" : T > 1e3 ? "#ff8c00" : "#39ff14";
  rdIoniz.textContent = ioniz.toFixed(1);
  rdIoniz.style.color = ioniz > 80 ? "#ff00ff" : ioniz > 40 ? "#ff4500" : ioniz > 10 ? "#ff8c00" : "#39ff14";
  rdPressure.innerHTML = fmtSci(pres);
  rdPeakInt.innerHTML = eliMode ? fmtSci(Ipeak) : "—";
  rdState.textContent = "Intactă / În așteptare";
  rdState.style.color = "#39ff14";
  regimeFill.style.width = `${(regime * 100).toFixed(0)}%`;
  regimeFill.style.background = regime > 0.75 ? "#ff00ff"
    : regime > 0.5 ? "#bf00ff"
    : regime > 0.25 ? "#ff4500"
    : "#39ff14";
  updateInfoBox(I, T, ioniz, regime, eliMode);
}

// ─────────────────────────────────────────────
//  Overlay message
// ─────────────────────────────────────────────
function showOverlay(msg) {
  overlayMsg.innerHTML = msg.replace("\n", "<br>");
  overlayMsg.classList.remove("hidden");
  setTimeout(() => overlayMsg.classList.add("hidden"), 3200);
}

// ─────────────────────────────────────────────
//  Fire / Reset
// ─────────────────────────────────────────────
btnFire.addEventListener("click", () => {
  if (state.firing) return;

  // Reset state
  state.firing       = true;
  state.phase        = "idle";
  state.phaseTime    = 0;
  state.particles    = [];
  state.sparks       = [];
  state.shockRings   = [];
  state.beamProgress = 0;
  state.craterRadius = 0;
  state.glowIntensity= 0;
  state.eliPulseTimer= 0;
  state.eliPulseActive = false;

  if (state.animFrame) cancelAnimationFrame(state.animFrame);

  btnFire.classList.add("firing");
  btnFire.textContent = "⚡ LASER ACTIV...";

  animLoop();
});

btnReset.addEventListener("click", () => {
  if (state.animFrame) cancelAnimationFrame(state.animFrame);
  state.firing        = false;
  state.phase         = "idle";
  state.particles     = [];
  state.shockRings    = [];
  state.beamProgress  = 0;
  state.craterRadius  = 0;
  state.glowIntensity = 0;
  btnFire.classList.remove("firing");
  btnFire.textContent = "🔴 PORNEȘTE LASERUL";
  overlayMsg.classList.add("hidden");

  // Restore controls to default values.
  sliderPower.value = defaults.power;
  sliderFocus.value = defaults.focus;
  sliderDist.value = defaults.dist;
  selectMaterial.value = defaults.material;
  toggleELI.checked = defaults.eli;
  sliderPulse.value = defaults.pulse;
  sliderRep.value = defaults.rep;
  eliParams.classList.toggle("hidden", !toggleELI.checked);
  rdEliBlock.style.display = toggleELI.checked ? "block" : "none";

  updateLabels();
  // Always redraw canvas first so reset never leaves a blank background.
  resizeCanvas();
  drawScene();
  try {
    updateIdleReadouts();
  } catch (err) {
    console.error("Idle readout update failed on reset:", err);
  }
});

// ─────────────────────────────────────────────
//  Utility: shade a hex color
// ─────────────────────────────────────────────
function shadeColor(hex, pct) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, Math.max(0, r + pct));
  g = Math.min(255, Math.max(0, g + pct));
  b = Math.min(255, Math.max(0, b + pct));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

// ─────────────────────────────────────────────
//  Initial draw – wait for layout to settle
// ─────────────────────────────────────────────
requestAnimationFrame(() => {
  resizeCanvas();
  drawScene();
  updateIdleReadouts();
});
