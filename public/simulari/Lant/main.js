// Lanț / frânghie: așezare statică (catenară) -> dinamic (Verlet + PBD constrângeri)
// Design: sticlă caldă.
// Interacțiune: trage noduri în dinamic.

// Constante de conversie: 100px = 1m
const PIXELS_PER_METER = 100;
const METERS_PER_PIXEL = 1 / PIXELS_PER_METER;

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });

const chartCanvasY = document.getElementById("chartCanvasY");
const chartCtxY = chartCanvasY ? chartCanvasY.getContext("2d", { alpha: false }) : null;

const chartCanvasX = document.getElementById("chartCanvasX");
const chartCtxX = chartCanvasX ? chartCanvasX.getContext("2d", { alpha: false }) : null;

const ui = {
  segCount: document.getElementById("segCount"),
  ropeLen: document.getElementById("ropeLen"),
  gravity: document.getElementById("gravity"),
  damping: document.getElementById("damping"),
  iters: document.getElementById("iters"),
  dt: document.getElementById("dt"),
  showTension: document.getElementById("showTension"),
  showNodes: document.getElementById("showNodes"),
  pinLeft: document.getElementById("pinLeft"),
  pinRight: document.getElementById("pinRight"),

  segCountVal: document.getElementById("segCountVal"),
  ropeLenVal: document.getElementById("ropeLenVal"),
  gravityVal: document.getElementById("gravityVal"),
  dampingVal: document.getElementById("dampingVal"),
  itersVal: document.getElementById("itersVal"),
  dtVal: document.getElementById("dtVal"),

  btnReset: document.getElementById("btnReset"),
  btnStatic: document.getElementById("btnStatic"),
  btnRelease: document.getElementById("btnRelease"),
  btnPause: document.getElementById("btnPause"),

  stats: document.getElementById("stats"),
  badge: document.getElementById("modeBadge"),
  
  btnClearChart: document.getElementById("btnClearChart"),
  chartEnabled: document.getElementById("chartEnabled"),
};

function simT(path, fallback) {
  if (typeof window.simLbl === "function") return window.simLbl(path, fallback);
  return fallback;
}

function simFmt(path, fallback, vars) {
  let s = simT(path, fallback);
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null && vars[k] !== undefined ? String(vars[k]) : ""));
}

let W = 800, H = 600, DPR = 1;

function resize() {
  const rect = canvas.getBoundingClientRect();
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.floor(rect.width * DPR);
  H = Math.floor(rect.height * DPR);
  canvas.width = W;
  canvas.height = H;
  
  // Redimensionează canvas-urile graficelor
  if (chartCanvasY) {
    const chartRectY = chartCanvasY.getBoundingClientRect();
    chartCanvasY.width = Math.floor(chartRectY.width * DPR);
    chartCanvasY.height = Math.floor(chartRectY.height * DPR);
    chartCanvasY.style.width = chartRectY.width + 'px';
    chartCanvasY.style.height = chartRectY.height + 'px';
  }
  if (chartCanvasX) {
    const chartRectX = chartCanvasX.getBoundingClientRect();
    chartCanvasX.width = Math.floor(chartRectX.width * DPR);
    chartCanvasX.height = Math.floor(chartRectX.height * DPR);
    chartCanvasX.style.width = chartRectX.width + 'px';
    chartCanvasX.style.height = chartRectX.height + 'px';
  }
}
window.addEventListener("resize", resize);
resize();

// Model frânghie (PBD)
let points = [];      // {x,y, px,py, invMass}
let tensions = [];    // tensiune aproximativă per segment
let segLen = 12;
let mode = "STATIC"; // STATIC sau DYNAMIC
let paused = false;

function refreshModeBadge() {
  const label = mode === "DYNAMIC"
    ? simT("modes.dynamic", "DYNAMIC")
    : simT("modes.static", "STATIC");
  ui.badge.textContent = simT("labels.badgePrefix", "MOD: ") + label;
}

const mouse = { x:0, y:0, down:false, grabbed:-1 };

// Date pentru grafice oscilație
let oscillationData = []; // {time, xPos, yPos} - pozițiile centrului frânghiei
let chartStartTime = null;
const MAX_CHART_POINTS = 500; // număr maxim de puncte în grafic

function v(x,y){ return {x,y}; }

function clamp(a, lo, hi){ return Math.max(lo, Math.min(hi, a)); }

function mix(a,b,t){ return a + (b-a)*t; }

function setUIValues(){
  ui.segCountVal.textContent = ui.segCount.value;
  // Convertim pixeli în metri
  const ropeLenMeters = (parseFloat(ui.ropeLen.value) * METERS_PER_PIXEL).toFixed(1);
  ui.ropeLenVal.textContent = ropeLenMeters + simT("labels.suffixM", " m");

  // Convertim gravitația: valoarea în px/s² -> m/s²
  const gravityMs2 = (parseFloat(ui.gravity.value) * METERS_PER_PIXEL).toFixed(1);
  ui.gravityVal.textContent = gravityMs2 + simT("labels.suffixMs2", " m/s²");

  ui.dampingVal.textContent = Number(ui.damping.value).toFixed(3);
  ui.itersVal.textContent = ui.iters.value;
  ui.dtVal.textContent = Number(ui.dt.value).toFixed(3) + simT("labels.suffixSUnit", " s");
}

function initRope() {
  setUIValues();

  const nSeg = parseInt(ui.segCount.value, 10);
  const totalLen = parseFloat(ui.ropeLen.value);

  const nPts = nSeg + 1;
  segLen = totalLen / nSeg;

  points = [];
  tensions = new Array(nSeg).fill(0);

  // Anchor positions
  const pad = 90 * DPR;
  const left = v(pad, H * 0.30);
  const right = v(W - pad, H * 0.30);

  // Start as straight-ish line with slight sag
  for (let i=0;i<nPts;i++){
    const t = i/(nPts-1);
    const x = mix(left.x, right.x, t);
    const y = mix(left.y, right.y, t) + Math.sin(t*Math.PI)*50*DPR;
    points.push({
      x, y,
      px: x, py: y,
      invMass: 1
    });
  }

  // Pin left/right depending UI (for initial)
  applyPins(true);

  mode = "STATIC";
  refreshModeBadge();
  
  // Resetează graficul
  oscillationData = [];
  chartStartTime = null;
}

function applyPins(isInit=false){
  const pinL = ui.pinLeft.checked;
  const pinR = ui.pinRight.checked;

  // left
  if (pinL){
    points[0].invMass = 0;
    if (isInit){ points[0].px = points[0].x; points[0].py = points[0].y; }
  } else {
    points[0].invMass = 1;
  }

  // right (only meaningful before release; after release we keep it free)
  if (mode !== "DYNAMIC") {
    if (pinR){
      points[points.length-1].invMass = 0;
      if (isInit){
        const p = points[points.length-1];
        p.px = p.x; p.py = p.y;
      }
    } else {
      points[points.length-1].invMass = 1;
    }
  }
}

// --- Fizică: integrare Verlet + constrângeri PBD ---
function verletStep(dt){
  const g = parseFloat(ui.gravity.value) * DPR; // scalează cu DPR pentru consistență
  const damp = parseFloat(ui.damping.value);

  for (let i=0;i<points.length;i++){
    const p = points[i];
    if (p.invMass === 0) continue;

    const vx = (p.x - p.px) * (1 - damp);
    const vy = (p.y - p.py) * (1 - damp);

    p.px = p.x;
    p.py = p.y;

    p.x += vx;
    p.y += vy + g * dt * dt;

    // limite simple (podeauă/pereți)
    const margin = 12 * DPR;
    if (p.x < margin){ p.x = margin; p.px = p.x + vx * -0.2; }
    if (p.x > W - margin){ p.x = W - margin; p.px = p.x + vx * -0.2; }
    if (p.y < margin){ p.y = margin; p.py = p.y + vy * -0.2; }
    if (p.y > H - margin){
      p.y = H - margin;
      p.py = p.y + vy * -0.35; // bounce-ish
    }
  }
}

function solveConstraints(iterations){
  // PBD: impune distanța între puncte consecutive la segLen
  // Tensiune aproximativă: magnitudinea corecțiilor acumulate pe fiecare segment
  tensions.fill(0);

  for (let k=0;k<iterations;k++){
    for (let i=0;i<points.length-1;i++){
      const a = points[i], b = points[i+1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const diff = (dist - segLen) / dist;

      const w1 = a.invMass;
      const w2 = b.invMass;
      const wsum = w1 + w2;
      if (wsum === 0) continue;

      // cantitate de corecție
      const cx = dx * diff;
      const cy = dy * diff;

      // distribuie pe baza maselor inverse
      if (w1 !== 0){
        a.x += cx * (w1 / wsum) * 0.5;
        a.y += cy * (w1 / wsum) * 0.5;
      }
      if (w2 !== 0){
        b.x -= cx * (w2 / wsum) * 0.5;
        b.y -= cy * (w2 / wsum) * 0.5;
      }

      // proxy tensiune: magnitudinea corecției (mai mare => mai multă forță de constrângere)
      tensions[i] += Math.hypot(cx, cy);
    }
  }
}

function staticSettle(steps=220){
  // Rulează fizică "falsă" cu iterații de constrângere mai mari pentru a ajunge la echilibru catenar
  const dt = parseFloat(ui.dt.value);
  const iters = parseInt(ui.iters.value, 10);

  // Asigură temporar pinurile
  mode = "STATIC";
  applyPins(true);

  for (let s=0;s<steps;s++){
    verletStep(dt);
    solveConstraints(Math.max(iters, 18));
  }
  refreshModeBadge();
}

// --- Randare ---
function tensionColor(t){
  // t: 0..ceva. mapează la cald -> fierbinte.
  // Vom crea un gradient simplu în RGB.
  const x = clamp(t, 0, 1);
  // de la miere moale la roșu
  const r = Math.floor(mix(235, 255, x));
  const g = Math.floor(mix(210, 90, x));
  const b = Math.floor(mix(140, 70, x));
  return `rgb(${r},${g},${b})`;
}

function draw(){
  // fundal
  ctx.fillStyle = "#0b0f14";
  ctx.fillRect(0,0,W,H);

  // blob-uri de strălucire subtile
  const grad1 = ctx.createRadialGradient(W*0.25, H*0.25, 0, W*0.25, H*0.25, Math.max(W,H)*0.7);
  grad1.addColorStop(0, "rgba(251,238,193,0.13)");
  grad1.addColorStop(1, "rgba(251,238,193,0.00)");
  ctx.fillStyle = grad1;
  ctx.fillRect(0,0,W,H);

  const grad2 = ctx.createRadialGradient(W*0.80, H*0.18, 0, W*0.80, H*0.18, Math.max(W,H)*0.6);
  grad2.addColorStop(0, "rgba(120,150,255,0.10)");
  grad2.addColorStop(1, "rgba(120,150,255,0.00)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0,0,W,H);

  // frânghie
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // normalizează tensiunile pentru colorare
  let tmax = 0;
  for (let i=0;i<tensions.length;i++) tmax = Math.max(tmax, tensions[i]);
  const denom = tmax > 1e-6 ? tmax : 1;

  for (let i=0;i<points.length-1;i++){
    const a = points[i], b = points[i+1];

    const tNorm = tensions[i] / denom; // 0..1
    const col = ui.showTension.checked ? tensionColor(tNorm) : "rgba(251,238,193,0.85)";

    // grosimea crește puțin cu tensiunea (efect frumos opțional)
    const lw = (2.2 + tNorm*2.2) * DPR;

    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // noduri
  if (ui.showNodes.checked){
    for (let i=0;i<points.length;i++){
      const p = points[i];
      ctx.beginPath();
      ctx.fillStyle = p.invMass === 0 ? "rgba(251,238,193,0.95)" : "rgba(255,255,255,0.70)";
      ctx.arc(p.x, p.y, (p.invMass===0? 4.8 : 3.5)*DPR, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // marker mic pentru "pinuri"
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.strokeStyle = "rgba(251,238,193,0.35)";
  ctx.lineWidth = 1.2*DPR;

  const p0 = points[0];
  const pN = points[points.length-1];
  drawPin(p0.x, p0.y, p0.invMass===0);
  drawPin(pN.x, pN.y, pN.invMass===0);

  // statistici
  const segLenMeters = (segLen * METERS_PER_PIXEL).toFixed(3);
  const yn = (v) => (v ? simT("labels.yes", "Da") : simT("labels.no", "Nu"));
  ui.stats.innerHTML =
    simFmt(
      "stats.line1",
      "Noduri: <b>{nodes}</b> | Segmente: <b>{segments}</b> | Lungime segment: <b>{segLen}</b> m",
      {
        nodes: points.length,
        segments: points.length - 1,
        segLen: segLenMeters,
      }
    ) +
    "<br>" +
    simFmt(
      "stats.line2",
      "Fixat stânga: <b>{pinL}</b> | Fixat dreapta: <b>{pinR}</b> | Tragere: <b>{drag}</b>",
      {
        pinL: yn(points[0].invMass === 0),
        pinR: yn(points[points.length - 1].invMass === 0),
        drag: yn(mouse.grabbed >= 0),
      }
    );
  
  // Desenează graficele
  drawChartY();
  drawChartX();
}

function drawPin(x,y,isPinned){
  const s = 10*DPR;
  ctx.beginPath();
  ctx.roundRect(x - s, y - s, s*2, s*2, 5*DPR);
  ctx.fill();
  ctx.stroke();

  if (isPinned){
    ctx.beginPath();
    ctx.strokeStyle = "rgba(251,238,193,0.80)";
    ctx.lineWidth = 2*DPR;
    ctx.moveTo(x - s*0.55, y);
    ctx.lineTo(x + s*0.55, y);
    ctx.stroke();
  }
}

// roundRect polyfill pentru browsere mai vechi
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    this.moveTo(x+r, y);
    this.arcTo(x+w, y, x+w, y+h, r);
    this.arcTo(x+w, y+h, x, y+h, r);
    this.arcTo(x, y+h, x, y, r);
    this.arcTo(x, y, x+w, y, r);
    this.closePath();
  }
}

// Funcție pentru desenarea graficului oscilației verticale (Y)
function drawChartY() {
  if (!chartCanvasY || !chartCtxY) return;
  
  if (!ui.chartEnabled.checked) {
    chartCtxY.fillStyle = "rgba(0,0,0,0.2)";
    chartCtxY.fillRect(0, 0, chartCanvasY.width || 1, chartCanvasY.height || 1);
    return;
  }
  
  if (oscillationData.length === 0) {
    chartCtxY.fillStyle = "rgba(0,0,0,0.2)";
    chartCtxY.fillRect(0, 0, chartCanvasY.width || 1, chartCanvasY.height || 1);
    chartCtxY.fillStyle = "rgba(251,238,193,0.5)";
    chartCtxY.font = `${12 * DPR}px system-ui`;
    chartCtxY.textAlign = "center";
    chartCtxY.textBaseline = "middle";
    chartCtxY.fillText(
      simT("labels.waitData", "A\u0219teapt\u0103 date..."),
      (chartCanvasY.width || 400) / 2,
      (chartCanvasY.height || 250) / 2
    );
    return;
  }
  
  const cw = chartCanvasY.width;
  const ch = chartCanvasY.height;
  const padding = 40 * DPR;
  const graphW = cw - padding * 2;
  const graphH = ch - padding * 2;
  
  chartCtxY.fillStyle = "rgba(0,0,0,0.2)";
  chartCtxY.fillRect(0, 0, cw, ch);
  
  if (oscillationData.length < 2) return;
  
  let minY = Infinity, maxY = -Infinity;
  let minTime = oscillationData[0].time;
  let maxTime = oscillationData[oscillationData.length - 1].time;
  
  for (let i = 0; i < oscillationData.length; i++) {
    minY = Math.min(minY, oscillationData[i].yPos);
    maxY = Math.max(maxY, oscillationData[i].yPos);
  }
  
  const yRange = maxY - minY || 1;
  const timeRange = maxTime - minTime || 1;
  
  chartCtxY.strokeStyle = "rgba(251,238,193,0.3)";
  chartCtxY.lineWidth = 1 * DPR;
  chartCtxY.beginPath();
  chartCtxY.moveTo(padding, padding);
  chartCtxY.lineTo(padding, ch - padding);
  chartCtxY.lineTo(cw - padding, ch - padding);
  chartCtxY.stroke();
  
  chartCtxY.fillStyle = "rgba(251,238,193,0.7)";
  chartCtxY.font = `${9 * DPR}px system-ui`;
  chartCtxY.textAlign = "right";
  chartCtxY.textBaseline = "middle";
  
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const yVal = minY + (yRange * i / ySteps);
    const yPx = ch - padding - (graphH * i / ySteps);
    const yMeters = (yVal * METERS_PER_PIXEL).toFixed(2);
    chartCtxY.fillText(yMeters + simT("labels.suffixM", " m"), padding - 6 * DPR, yPx);
  }
  
  chartCtxY.textAlign = "center";
  chartCtxY.textBaseline = "top";
  const xSteps = 5;
  for (let i = 0; i <= xSteps; i++) {
    const tVal = minTime + (timeRange * i / xSteps);
    const xPx = padding + (graphW * i / xSteps);
    chartCtxY.fillText(tVal.toFixed(1) + simT("labels.suffixS", " s"), xPx, ch - padding + 6 * DPR);
  }
  
  chartCtxY.textAlign = "center";
  chartCtxY.textBaseline = "top";
  chartCtxY.font = `${12 * DPR}px system-ui`;
  chartCtxY.fillStyle = "rgba(251,238,193,0.9)";
  chartCtxY.fillText(simT("labels.chartYTitle", "Oscila\u021bie Vertical\u0103 (Pozi\u021bie Y)"), cw / 2, 8 * DPR);
  
  chartCtxY.strokeStyle = "rgba(251,238,193,0.85)";
  chartCtxY.lineWidth = 2 * DPR;
  chartCtxY.beginPath();
  
  for (let i = 0; i < oscillationData.length; i++) {
    const d = oscillationData[i];
    const x = padding + ((d.time - minTime) / timeRange) * graphW;
    const y = ch - padding - ((d.yPos - minY) / yRange) * graphH;
    
    if (i === 0) {
      chartCtxY.moveTo(x, y);
    } else {
      chartCtxY.lineTo(x, y);
    }
  }
  chartCtxY.stroke();
  
  chartCtxY.fillStyle = "rgba(251,238,193,0.6)";
  for (let i = 0; i < oscillationData.length; i += Math.max(1, Math.floor(oscillationData.length / 50))) {
    const d = oscillationData[i];
    const x = padding + ((d.time - minTime) / timeRange) * graphW;
    const y = ch - padding - ((d.yPos - minY) / yRange) * graphH;
    chartCtxY.beginPath();
    chartCtxY.arc(x, y, 2 * DPR, 0, Math.PI * 2);
    chartCtxY.fill();
  }
}

// Funcție pentru desenarea graficului oscilației orizontale (X)
function drawChartX() {
  if (!chartCanvasX || !chartCtxX) return;
  
  if (!ui.chartEnabled.checked) {
    chartCtxX.fillStyle = "rgba(0,0,0,0.2)";
    chartCtxX.fillRect(0, 0, chartCanvasX.width || 1, chartCanvasX.height || 1);
    return;
  }
  
  if (oscillationData.length === 0) {
    chartCtxX.fillStyle = "rgba(0,0,0,0.2)";
    chartCtxX.fillRect(0, 0, chartCanvasX.width || 1, chartCanvasX.height || 1);
    chartCtxX.fillStyle = "rgba(251,238,193,0.5)";
    chartCtxX.font = `${12 * DPR}px system-ui`;
    chartCtxX.textAlign = "center";
    chartCtxX.textBaseline = "middle";
    chartCtxX.fillText(
      simT("labels.waitData", "A\u0219teapt\u0103 date..."),
      (chartCanvasX.width || 400) / 2,
      (chartCanvasX.height || 250) / 2
    );
    return;
  }
  
  const cw = chartCanvasX.width;
  const ch = chartCanvasX.height;
  const padding = 40 * DPR;
  const graphW = cw - padding * 2;
  const graphH = ch - padding * 2;
  
  chartCtxX.fillStyle = "rgba(0,0,0,0.2)";
  chartCtxX.fillRect(0, 0, cw, ch);
  
  if (oscillationData.length < 2) return;
  
  let minX = Infinity, maxX = -Infinity;
  let minTime = oscillationData[0].time;
  let maxTime = oscillationData[oscillationData.length - 1].time;
  
  for (let i = 0; i < oscillationData.length; i++) {
    minX = Math.min(minX, oscillationData[i].xPos);
    maxX = Math.max(maxX, oscillationData[i].xPos);
  }
  
  const xRange = maxX - minX || 1;
  const timeRange = maxTime - minTime || 1;
  
  chartCtxX.strokeStyle = "rgba(251,238,193,0.3)";
  chartCtxX.lineWidth = 1 * DPR;
  chartCtxX.beginPath();
  chartCtxX.moveTo(padding, padding);
  chartCtxX.lineTo(padding, ch - padding);
  chartCtxX.lineTo(cw - padding, ch - padding);
  chartCtxX.stroke();
  
  chartCtxX.fillStyle = "rgba(251,238,193,0.7)";
  chartCtxX.font = `${9 * DPR}px system-ui`;
  chartCtxX.textAlign = "right";
  chartCtxX.textBaseline = "middle";
  
  const xSteps = 5;
  for (let i = 0; i <= xSteps; i++) {
    const xVal = minX + (xRange * i / xSteps);
    const yPx = ch - padding - (graphH * i / xSteps);
    const xMeters = (xVal * METERS_PER_PIXEL).toFixed(2);
    chartCtxX.fillText(xMeters + simT("labels.suffixM", " m"), padding - 6 * DPR, yPx);
  }
  
  chartCtxX.textAlign = "center";
  chartCtxX.textBaseline = "top";
  const timeSteps = 5;
  for (let i = 0; i <= timeSteps; i++) {
    const tVal = minTime + (timeRange * i / timeSteps);
    const xPx = padding + (graphW * i / timeSteps);
    chartCtxX.fillText(tVal.toFixed(1) + simT("labels.suffixS", " s"), xPx, ch - padding + 6 * DPR);
  }
  
  chartCtxX.textAlign = "center";
  chartCtxX.textBaseline = "top";
  chartCtxX.font = `${12 * DPR}px system-ui`;
  chartCtxX.fillStyle = "rgba(251,238,193,0.9)";
  chartCtxX.fillText(simT("labels.chartXTitle", "Oscila\u021bie Orizontal\u0103 (Pozi\u021bie X)"), cw / 2, 8 * DPR);
  
  chartCtxX.strokeStyle = "rgba(251,238,193,0.85)";
  chartCtxX.lineWidth = 2 * DPR;
  chartCtxX.beginPath();
  
  for (let i = 0; i < oscillationData.length; i++) {
    const d = oscillationData[i];
    const x = padding + ((d.time - minTime) / timeRange) * graphW;
    const y = ch - padding - ((d.xPos - minX) / xRange) * graphH;
    
    if (i === 0) {
      chartCtxX.moveTo(x, y);
    } else {
      chartCtxX.lineTo(x, y);
    }
  }
  chartCtxX.stroke();
  
  chartCtxX.fillStyle = "rgba(251,238,193,0.6)";
  for (let i = 0; i < oscillationData.length; i += Math.max(1, Math.floor(oscillationData.length / 50))) {
    const d = oscillationData[i];
    const x = padding + ((d.time - minTime) / timeRange) * graphW;
    const y = ch - padding - ((d.xPos - minX) / xRange) * graphH;
    chartCtxX.beginPath();
    chartCtxX.arc(x, y, 2 * DPR, 0, Math.PI * 2);
    chartCtxX.fill();
  }
}

// --- Interacțiune: trage noduri ---
function toCanvas(e){
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * DPR;
  const y = (e.clientY - rect.top) * DPR;
  return {x,y};
}

canvas.addEventListener("pointerdown", (e)=>{
  mouse.down = true;
  const p = toCanvas(e);
  mouse.x = p.x; mouse.y = p.y;

  // găsește cel mai apropiat punct (permite și pinuri, dar dacă e fixat nu se mișcă)
  let best = -1, bestD = 1e9;
  const rad = 18*DPR;
  for (let i=0;i<points.length;i++){
    const pt = points[i];
    const d = Math.hypot(pt.x - p.x, pt.y - p.y);
    if (d < rad && d < bestD){
      best = i; bestD = d;
    }
  }
  mouse.grabbed = best;

  if (best >= 0){
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener("pointermove", (e)=>{
  const p = toCanvas(e);
  mouse.x = p.x; mouse.y = p.y;

  if (!mouse.down || mouse.grabbed < 0) return;

  const i = mouse.grabbed;
  const pt = points[i];
  if (pt.invMass === 0) return; // nu trage punctele fixate

  // mută punctul la mouse; menține verlet stabil prin sincronizarea poziției anterioare
  pt.x = p.x; pt.y = p.y;
  pt.px = p.x; pt.py = p.y;
});

canvas.addEventListener("pointerup", ()=>{
  mouse.down = false;
  mouse.grabbed = -1;
});
canvas.addEventListener("pointercancel", ()=>{
  mouse.down = false;
  mouse.grabbed = -1;
});

// --- Butoane / UI ---
ui.btnReset.addEventListener("click", ()=>{
  initRope();
  staticSettle(220);
});

ui.btnStatic.addEventListener("click", ()=>{
  staticSettle(260);
});

ui.btnRelease.addEventListener("click", ()=>{
  // eliberează capătul drept
  mode = "DYNAMIC";
  const last = points[points.length-1];
  last.invMass = 1;
  // toggle-ul pin drept devine irelevant după eliberare; încă permite pin stâng.
  if (chartStartTime === null) {
    chartStartTime = performance.now() / 1000; // începe înregistrarea pentru grafic
  }
  refreshModeBadge();
});

ui.btnPause.addEventListener("click", ()=>{
  paused = !paused;
  ui.btnPause.textContent = paused ? simT("buttons.resume", "Continu\u0103") : simT("buttons.pause", "Pauz\u0103");
});

ui.btnClearChart.addEventListener("click", ()=>{
  oscillationData = [];
  chartStartTime = null;
  drawChartY();
  drawChartX();
});

for (const el of [ui.segCount, ui.ropeLen, ui.gravity, ui.damping, ui.iters, ui.dt]){
  el.addEventListener("input", ()=>{
    setUIValues();
  });
}

ui.segCount.addEventListener("change", ()=>{
  initRope(); staticSettle(240);
});
ui.ropeLen.addEventListener("change", ()=>{
  initRope(); staticSettle(240);
});
ui.pinLeft.addEventListener("change", ()=>{
  applyPins(false);
});
ui.pinRight.addEventListener("change", ()=>{
  if (mode !== "DYNAMIC") applyPins(false);
});

// --- Buclă principală ---
let lastT = performance.now();
function tick(now){
  const dt = parseFloat(ui.dt.value);
  const iters = parseInt(ui.iters.value, 10);

  if (!paused){
    // În STATIC: încă integrăm, dar se comportă ca "așezare"
    // În DYNAMIC: dinamic complet
    applyPins(false); // pin stâng poate fi toggle; pin drept doar dacă nu e eliberat

    verletStep(dt);
    solveConstraints(iters);
    
    // Înregistrează date pentru grafice (în orice mod, dacă este activat)
    if (ui.chartEnabled.checked && points.length > 0) {
      const currentTime = performance.now() / 1000;
      if (chartStartTime === null) {
        chartStartTime = currentTime;
      }
      
      // Calculează pozițiile medii ale frânghiei (centrul)
      let sumX = 0, sumY = 0;
      for (let i = 0; i < points.length; i++) {
        sumX += points[i].x;
        sumY += points[i].y;
      }
      const avgX = sumX / points.length;
      const avgY = sumY / points.length;
      
      const timeSinceStart = currentTime - chartStartTime;
      
      oscillationData.push({
        time: timeSinceStart,
        xPos: avgX,
        yPos: avgY
      });
      
      // Limitează numărul de puncte pentru performanță
      if (oscillationData.length > MAX_CHART_POINTS) {
        oscillationData.shift(); // elimină cele mai vechi puncte
      }
    }
  }

  draw();
  requestAnimationFrame(tick);
}

initRope();
staticSettle(220);
requestAnimationFrame(tick);
