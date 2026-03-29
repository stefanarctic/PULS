const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/** Geometrie de referință (pixeli); se scalează la lățimea containerului. */
const W_REF = 800;
const H_REF = 320;

let t = 0;

const energySlider = document.getElementById("energy");
const barrierSlider = document.getElementById("barrier");
const energyVal = document.getElementById("energyVal");
const barrierVal = document.getElementById("barrierVal");
const modeText = document.getElementById("modeText");
const rtText = document.getElementById("rtText");

/** Vizibilitate ceață */
const FOG_ALPHA_MUL = 14;

function syncCanvasSize() {
  const col = canvas.closest(".sim-column");
  const maxW = W_REF;
  const raw = col && col.clientWidth > 0 ? col.clientWidth : maxW;
  const w = Math.max(260, Math.min(maxW, Math.floor(raw)));
  const h = Math.round((w * H_REF) / W_REF);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

/** k și ω: k = 2√E, E_sch = k²/4 = E. */
function kOfEnergy(E) {
  return 2 * Math.sqrt(Math.max(E, 1e-6));
}

function omegaOfEnergy(E) {
  const k = kOfEnergy(E);
  return (k * k) / 4;
}

function reflectionTransmission(E, V, widthPx) {
  const scale = 0.045;
  const w = widthPx * scale;

  if (E <= 0) return { R: 1, T: 0, kappa: Math.sqrt(Math.max(V, 1e-6)), k2: 0 };

  const k1 = Math.sqrt(Math.max(E, 1e-9));

  if (E < V) {
    const kappa = Math.sqrt(V - E);
    const T = Math.exp(-2 * kappa * w) / (1 + 0.25 * Math.exp(-2 * kappa * w));
    const Tc = Math.min(Math.max(T, 0), 1);
    return { R: 1 - Tc, T: Tc, kappa, k2: 0 };
  }

  const k2 = Math.sqrt(E - V);
  const sinTerm = Math.sin(k2 * w);
  const diff = k1 * k1 - k2 * k2;
  const denom = 4 * k1 * k1 * k2 * k2 + diff * diff * sinTerm * sinTerm;
  const Tc = denom > 1e-12 ? (4 * k1 * k1 * k2 * k2) / denom : 0;
  const T = Math.min(Math.max(Tc, 0), 1);
  return { R: 1 - T, T, kappa: 0, k2 };
}

function gaussianEnvelope(x, center, sigma) {
  const z = (x - center) / sigma;
  return Math.exp(-z * z);
}

function psiComponent(x, t, E, x0, amp, semnK, sigma) {
  const k = kOfEnergy(E);
  const w = omegaOfEnergy(E);
  const g = gaussianEnvelope(x, x0, sigma);
  const phase = semnK * k * (x - x0) - w * t;
  return {
    re: amp * g * Math.cos(phase),
    im: amp * g * Math.sin(phase),
  };
}

function psiBarrierRegion(x, t, E, V, bx, bw, transAmp, kappa, k2, sigma) {
  const g =
    Math.exp(-(((x - (bx + bw * 0.5)) / (sigma * 0.85)) ** 2)) * 0.6 + 0.4;

  if (E < V) {
    const decay = Math.exp(-kappa * (x - bx) * 0.12);
    const phase = omegaOfEnergy(E) * t * 0.3;
    const amp = transAmp * 1.15 * g * decay;
    return { re: amp * Math.cos(phase), im: amp * Math.sin(phase) };
  }

  const phase = k2 * (x - bx) * 0.15 - omegaOfEnergy(E) * t;
  const amp = transAmp * 1.2 * g;
  return { re: amp * Math.cos(phase), im: amp * Math.sin(phase) };
}

function edgeFade(x, w, cw) {
  const l = Math.min(1, x / w);
  const r = Math.min(1, (cw - 1 - x) / w);
  return l * r;
}

function drawBarrierGradient(bx, bw) {
  const barrierGradient = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  barrierGradient.addColorStop(0, "rgba(127, 29, 29, 0.05)");
  barrierGradient.addColorStop(0.25, "rgba(220, 38, 38, 0.22)");
  barrierGradient.addColorStop(0.5, "rgba(248, 113, 113, 0.28)");
  barrierGradient.addColorStop(0.75, "rgba(220, 38, 38, 0.22)");
  barrierGradient.addColorStop(1, "rgba(127, 29, 29, 0.05)");
  ctx.fillStyle = barrierGradient;
  ctx.fillRect(bx, 0, bw, canvas.height);
  ctx.strokeStyle = "rgba(248, 113, 113, 0.35)";
  ctx.lineWidth = Math.max(1, canvas.width / W_REF);
  ctx.beginPath();
  ctx.moveTo(bx + 0.5, 0);
  ctx.lineTo(bx + 0.5, canvas.height);
  ctx.moveTo(bx + bw - 0.5, 0);
  ctx.lineTo(bx + bw - 0.5, canvas.height);
  ctx.stroke();
}

function draw() {
  syncCanvasSize();

  const sx = canvas.width / W_REF;
  const sy = canvas.height / H_REF;

  const BX = 350 * sx;
  const BW = 100 * sx;
  const sigma = 36 * sx;
  const packetSpeed = 95 * sx;
  const EDGE = 56 * sx;

  const E = parseFloat(energySlider.value);
  const V = parseFloat(barrierSlider.value);
  energyVal.textContent = E.toFixed(1);
  barrierVal.textContent = V.toFixed(1);

  const { R, T, kappa, k2 } = reflectionTransmission(E, V, BW);
  const sumRT = R + T;
  const rA = Math.sqrt(R);
  const tA = Math.sqrt(T);

  if (E < V) {
    modeText.textContent =
      "Electronul tunelază prin barieră, unda pătrunde în zona interzisă clasic și apare dincolo cu probabilitate redusă.";
  } else if (E > V) {
    modeText.textContent =
      "Electronul trece clasic peste barieră, are energie peste potențial; reflexia și transmisia oscilează cu lățimea barierei.";
  } else {
    modeText.textContent =
      "La limită E = V: între tunelare și propagare peste barieră, coeficienții depind fin de geometrie.";
  }

  rtText.textContent = `R ≈ ${R.toFixed(3)}   ·   T ≈ ${T.toFixed(3)}   ·   R + T = ${sumRT.toFixed(3)}`;

  const wrap = canvas.width + 280 * sx;
  const x0 = ((100 * sx + t * packetSpeed) % wrap) - 40 * sx;
  const x0Ref = 2 * BX - x0;
  const delay = BW * 0.35;
  const x0Trans = BX + BW + Math.max(0, x0 - BX) * 0.85 + delay;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBarrierGradient(BX, BW);

  const midY = canvas.height * 0.48;
  const ampScale = 52 * sy;
  const probH = 120 * sy;

  const n = canvas.width;
  const reInc = new Float64Array(n);
  const imInc = new Float64Array(n);
  const reRef = new Float64Array(n);
  const imRef = new Float64Array(n);
  const reTr = new Float64Array(n);
  const imTr = new Float64Array(n);
  const reTot = new Float64Array(n);
  const imTot = new Float64Array(n);

  for (let x = 0; x < n; x++) {
    const inc = psiComponent(x, t, E, x0, 1, 1, sigma);
    reInc[x] = inc.re;
    imInc[x] = inc.im;

    const ref = psiComponent(x, t, E, x0Ref, rA, -1, sigma);
    reRef[x] = ref.re;
    imRef[x] = ref.im;

    const tr = psiComponent(x, t, E, x0Trans, tA, 1, sigma);
    reTr[x] = tr.re;
    imTr[x] = tr.im;

    let br = { re: 0, im: 0 };
    if (x >= BX && x <= BX + BW) {
      br = psiBarrierRegion(x, t, E, V, BX, BW, tA, kappa, k2, sigma);
    }
    let re = inc.re;
    let im = inc.im;
    if (x < BX) {
      re += ref.re;
      im += ref.im;
    } else if (x > BX + BW) {
      re = tr.re;
      im = tr.im;
    } else {
      re = inc.re * 0.15 + ref.re * 0.15 + br.re;
      im = inc.im * 0.15 + ref.im * 0.15 + br.im;
    }

    reTot[x] = re;
    imTot[x] = im;
  }

  let total = 0;
  for (let i = 0; i < n; i++) {
    const pr = reTot[i];
    const pi = imTot[i];
    total += pr * pr + pi * pi;
  }
  const norm = Math.sqrt(total) || 1;

  let sumPsiSq = 0;
  const prob = new Float64Array(n);
  const incD = new Float64Array(n);
  const refD = new Float64Array(n);
  const trD = new Float64Array(n);

  for (let x = 0; x < n; x++) {
    const rn = reTot[x] / norm;
    const inn = imTot[x] / norm;
    sumPsiSq += rn * rn + inn * inn;

    const f = edgeFade(x, EDGE, n);
    const reF = rn * f;
    const imF = inn * f;
    prob[x] = reF * reF + imF * imF;

    incD[x] = (reInc[x] / norm) * f;
    refD[x] = (reRef[x] / norm) * f;
    trD[x] = (reTr[x] / norm) * f;
  }

  const fogBand = canvas.height - midY - 12;

  ctx.save();
  ctx.fillStyle = "#c4b5fd";
  for (let x = 0; x < n; x++) {
    const p = prob[x];
    ctx.globalAlpha = Math.min(1, p * 2 * FOG_ALPHA_MUL);
    const h = p * fogBand * 8;
    const y0 = canvas.height - 4 - h;
    ctx.fillRect(x, y0, Math.max(1, 1.25 * sx), h + 1);
  }
  ctx.restore();

  ctx.fillStyle = "rgba(167, 139, 250, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, midY);
  for (let x = 0; x < n; x++) {
    const p = prob[x];
    const y = midY - p * probH;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(n - 1, midY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(167, 139, 250, 0.75)";
  ctx.lineWidth = Math.max(1, 1.25 * sx);
  ctx.beginPath();
  for (let x = 0; x < n; x++) {
    const p = prob[x];
    const y = midY - p * probH;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.save();
  const vignette = ctx.createLinearGradient(0, 0, canvas.width, 0);
  vignette.addColorStop(0, "rgba(2, 6, 23, 0.92)");
  vignette.addColorStop(0.08, "rgba(2, 6, 23, 0)");
  vignette.addColorStop(0.92, "rgba(2, 6, 23, 0)");
  vignette.addColorStop(1, "rgba(2, 6, 23, 0.92)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const lineW = Math.max(1.2, 2 * sx);
  function strokePsiReOnlyArr(re, color, lineWidth, mask, glowColor) {
    ctx.save();
    ctx.shadowBlur = 10 * sx;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = 0.96;
    ctx.beginPath();
    let started = false;
    for (let x = 0; x < n; x++) {
      if (mask && !mask(x)) continue;
      const psi = re[x];
      const y = midY - psi * ampScale;
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  strokePsiReOnlyArr(incD, "#38bdf8", lineW, (x) => x < BX - 2, "#38bdf8");
  strokePsiReOnlyArr(refD, "#fb923c", lineW, (x) => x < BX - 2, "#fb923c");
  strokePsiReOnlyArr(trD, "#4ade80", lineW, (x) => x > BX + BW + 2, "#4ade80");

  const fs = Math.max(9, Math.round(11 * sx));
  ctx.fillStyle = "rgba(148, 163, 184, 0.92)";
  ctx.font = `${fs}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(
    `Σ|ψ|² = ${sumPsiSq.toFixed(3)} (normalizare pe grilă)`,
    canvas.width / 2,
    canvas.height - Math.max(8, 10 * sy)
  );

  t += 0.016;
  requestAnimationFrame(draw);
}

window.addEventListener("resize", syncCanvasSize);
draw();
