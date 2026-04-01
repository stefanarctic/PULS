// ===========================
// Kepler Lab (3 Laws) - Canvas
// Units: a in AU, T in years, M in solar masses
// mu = 4*pi^2*M  (AU^3 / yr^2)
// Orbit parametric via Kepler equation: M = E - e sin E
// Position: x = a(cosE - e), y = b sinE, b=a*sqrt(1-e^2)
// Focus (Sun) is at (0,0). Center of ellipse is at (ae, 0).
// ===========================

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const plot = document.getElementById("law3Plot");
const pctx = plot.getContext("2d");

const els = {
  speed: document.getElementById("speed"),
  speedVal: document.getElementById("speedVal"),
  a: document.getElementById("a"),
  aVal: document.getElementById("aVal"),
  e: document.getElementById("e"),
  eVal: document.getElementById("eVal"),
  M: document.getElementById("M"),
  mVal: document.getElementById("mVal"),
  dtDays: document.getElementById("dtDays"),
  dtVal: document.getElementById("dtVal"),

  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  impulseBtn: document.getElementById("impulseBtn"),

  addPointBtn: document.getElementById("addPointBtn"),
  clearPlotBtn: document.getElementById("clearPlotBtn"),

  showEllipse: document.getElementById("showEllipse"),
  showAreas: document.getElementById("showAreas"),
  showLaw3: document.getElementById("showLaw3"),
  showFoci: document.getElementById("showFoci"),
  showTrail: document.getElementById("showTrail"),

  statusBadge: document.getElementById("statusBadge"),
  hint: document.getElementById("hint"),

  aTxt: document.getElementById("aTxt"),
  eTxt: document.getElementById("eTxt"),
  tTxt: document.getElementById("tTxt"),
  ratioTxt: document.getElementById("ratioTxt"),
  areaTxt: document.getElementById("areaTxt"),

  areasLog: document.getElementById("areasLog"),
};

let running = true;
let paused = false;

let speed = parseFloat(els.speed.value);
let a = parseFloat(els.a.value);
let e = parseFloat(els.e.value);
let Mstar = parseFloat(els.M.value);
let dtDays = parseInt(els.dtDays.value, 10);

// time in years
let t = 0;

// area law sampling
let lastImpulseTime = 0;
let lastArea = 0;
let areaHistory = [];

// trail (add point only every so often in sim time to avoid tangles when a small / e large)
let trail = [];
let lastTrailTime = 0;
const TRAIL_MAX = 600;
const TRAIL_TIME_STEP = 0.002; // min sim years between trail points

// plot points for law 3: (x=a^3, y=T^2)
let points = [];

// palette toggle
let altPalette = false;

// constants
const TAU = Math.PI * 2;
const DAYS_PER_YEAR = 365.25;

function mu(){
  return 4 * Math.PI * Math.PI * Mstar;
}
function meanMotion(){
  return Math.sqrt(mu() / (a*a*a)); // rad/yr
}
function period(){
  return TAU / meanMotion(); // years
}
function ratioT2a3(){
  const T = period();
  return (T*T) / (a*a*a);
}

// Solve Kepler equation for E with Newton-Raphson (robust for high e and near ±π)
function solveE(M, ecc){
  let Mm = ((M + Math.PI) % TAU) - Math.PI;
  // initial guess: first-order E ≈ M + e*sin(M) works well; for e high use Mm
  let E = ecc < 0.8 ? Mm : Mm + ecc * Math.sin(Mm);
  const maxIter = ecc >= 0.85 ? 20 : 12;
  for (let i = 0; i < maxIter; i++) {
    const f = E - ecc * Math.sin(E) - Mm;
    let fp = 1 - ecc * Math.cos(E);
    if (Math.abs(fp) < 1e-6) fp = fp >= 0 ? 1e-6 : -1e-6;
    const dE = f / fp;
    E = E - dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  // normalize E to [0, 2π] so no jump when M wraps ±π (avoids glitch at "bottom" of ellipse)
  E = ((E % TAU) + TAU) % TAU;
  return E;
}

function positionAtTime(tYears){
  const n = meanMotion();
  const Mmean = n * tYears; // mean anomaly
  const E = solveE(Mmean, e);

  const b = a * Math.sqrt(1 - e*e);
  const x = a * (Math.cos(E) - e);
  const y = b * Math.sin(E);

  // also radius vector from focus
  const r = a * (1 - e*Math.cos(E));
  return { x, y, E, r, Mmean };
}

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

function setBadge(txt){ els.statusBadge.textContent = txt; }

function resizeHiDPI(c, context){
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (c.width !== w || c.height !== h){
    c.width = w; c.height = h;
    context.setTransform(dpr,0,0,dpr,0,0);
  }
}

function rgbToCss(r,g,b,a=1){ return `rgba(${r},${g},${b},${a})`; }

function drawTextGlow(text, x, y, size=14, align="left"){
  ctx.save();
  ctx.font = `900 ${size}px ui-sans-serif, system-ui`;
  ctx.textAlign = align;
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 10;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundRect(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r, y);
  c.arcTo(x+w, y, x+w, y+h, r);
  c.arcTo(x+w, y+h, x, y+h, r);
  c.arcTo(x, y+h, x, y, r);
  c.arcTo(x, y, x+w, y, r);
  c.closePath();
}

function cross2(ax,ay,bx,by){
  return ax*by - ay*bx;
}

function updateReadouts(){
  els.speedVal.textContent = `${speed.toFixed(1)}×`;
  els.aVal.textContent = a.toFixed(2);
  els.eVal.textContent = e.toFixed(2);
  els.mVal.textContent = Mstar.toFixed(2);
  els.dtVal.textContent = `${dtDays}d`;

  els.aTxt.textContent = `${a.toFixed(2)} UA`;
  els.eTxt.textContent = e.toFixed(2);
  els.tTxt.textContent = `${period().toFixed(3)} ani`;
  els.ratioTxt.textContent = `${ratioT2a3().toFixed(4)} (≈ ${ (1/Mstar).toFixed(4) })`;
  els.areaTxt.textContent = lastArea ? `${lastArea.toExponential(3)} UA²` : "–";
}

function formatAreasLog(){
  if (areaHistory.length === 0) return "–";
  const rows = areaHistory
    .slice(-6)
    .map((v,i)=>`A${areaHistory.length-5+i}: ${v.toExponential(3)} UA²`);
  return rows.join("\n");
}

// Area swept over interval [t0, t1] using polygon sum around focus (0,0).
// For small steps, sum triangles: 0.5 * cross(r_i, r_{i+1})
function sweptArea(t0, t1, steps=160){
  let area = 0;
  let prev = positionAtTime(t0);
  for (let i=1;i<=steps;i++){
    const ti = t0 + (i/steps)*(t1 - t0);
    const cur = positionAtTime(ti);
    area += 0.5 * Math.abs(cross2(prev.x, prev.y, cur.x, cur.y));
    prev = cur;
  }
  return area;
}

// =====================
// Plot (Law 3)
// =====================
function drawPlot(){
  resizeHiDPI(plot, pctx);
  const w = plot.clientWidth;
  const h = plot.clientHeight;

  pctx.clearRect(0,0,w,h);

  // background
  pctx.fillStyle = "rgba(0,0,0,.06)";
  pctx.fillRect(0,0,w,h);

  // axes box
  pctx.strokeStyle = "rgba(0,0,0,.22)";
  pctx.lineWidth = 1;
  pctx.strokeRect(10, 10, w-20, h-20);

  // choose bounds
  const xs = points.map(p=>p.x);
  const ys = points.map(p=>p.y);

  const xMax = Math.max(1, ...xs, Math.pow(a,3)*1.2);
  const yMax = Math.max(1, ...ys, Math.pow(period(),2)*1.2);

  // line for expected relationship: y = (1/M)*x  (since T^2 = x / M in our units)
  const slope = 1 / Mstar;
  pctx.save();
  pctx.strokeStyle = "rgba(106,92,255,.75)";
  pctx.lineWidth = 2;
  pctx.beginPath();
  const x0 = 0;
  const y0 = slope*x0;
  const x1 = xMax;
  const y1 = slope*x1;
  pctx.moveTo(mapX(x0), mapY(y0));
  pctx.lineTo(mapX(x1), mapY(y1));
  pctx.stroke();
  pctx.restore();

  // points
  for (const p of points){
    pctx.save();
    pctx.fillStyle = "rgba(40,199,193,.9)";
    pctx.shadowColor = "rgba(40,199,193,.9)";
    pctx.shadowBlur = 8;
    pctx.beginPath();
    pctx.arc(mapX(p.x), mapY(p.y), 4, 0, Math.PI*2);
    pctx.fill();
    pctx.restore();
  }

  // labels
  pctx.fillStyle = "rgba(0,0,0,.65)";
  pctx.font = "900 11px ui-sans-serif, system-ui";
  pctx.fillText("x = a³", 14, 18);
  pctx.fillText("y = T²", 14, 32);

  function mapX(x){
    const left = 10, right = w-10;
    return left + (x/xMax)*(right-left);
  }
  function mapY(y){
    const top = 10, bottom = h-10;
    return bottom - (y/yMax)*(bottom-top);
  }
}

// =====================
// UI events
// =====================
els.speed.addEventListener("input", ()=>{ speed = parseFloat(els.speed.value); updateReadouts(); });
els.a.addEventListener("input", ()=>{
  a = parseFloat(els.a.value);
  // keep ellipse valid: e<1
  updateReadouts();
});
els.e.addEventListener("input", ()=>{
  e = parseFloat(els.e.value);
  e = clamp(e, 0, 0.9);
  updateReadouts();
});
els.M.addEventListener("input", ()=>{
  Mstar = parseFloat(els.M.value);
  updateReadouts();
  drawPlot();
});
els.dtDays.addEventListener("input", ()=>{
  dtDays = parseInt(els.dtDays.value, 10);
  updateReadouts();
});

els.startBtn.addEventListener("click", ()=>{
  running = true; paused = false;
  setBadge("Status: Pornit");
});
els.pauseBtn.addEventListener("click", ()=>{
  if (!running) return;
  paused = !paused;
  setBadge(paused ? "Status: Pauza" : "Status: Pornit");
});
els.resetBtn.addEventListener("click", ()=>{
  t = 0;
  trail = [];
  lastTrailTime = 0;
  areaHistory = [];
  lastArea = 0;
  lastImpulseTime = 0;
  els.areasLog.textContent = "–";
  setBadge("Status: Pornit");
});

els.impulseBtn.addEventListener("click", ()=>{
  const T = period();
  const dtRaw = dtDays / DAYS_PER_YEAR;
  const dtCapped = Math.min(dtRaw, T * 0.48);
  const t1 = t;
  const t0 = Math.max(0, t1 - dtCapped);
  lastArea = sweptArea(t0, t1, 180);
  areaHistory.push(lastArea);
  els.areasLog.textContent = formatAreasLog();
  updateReadouts();
});

els.addPointBtn.addEventListener("click", ()=>{
  const x = Math.pow(a,3);
  const y = Math.pow(period(),2);
  points.push({x,y});
  drawPlot();
});
els.clearPlotBtn.addEventListener("click", ()=>{
  points = [];
  drawPlot();
});

// =====================
// Render helpers
// =====================
function drawStarfield(w,h, time){
  ctx.save();
  for (let i=0;i<80;i++){
    const x = (Math.sin(time*0.12 + i*12.31)*0.5+0.5)*w;
    const y = (Math.cos(time*0.10 + i*7.77)*0.5+0.5)*h;
    const r = 1 + (i%3)*0.6;
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGlowCircle(x,y,r,color, blur=18){
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(x,y,r,0,TAU);
  ctx.fill();
  ctx.restore();
}

function drawOrbitAndPlanet(){
  resizeHiDPI(canvas, ctx);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0,0,w,h);
  drawStarfield(w,h,t);

  // coordinate transform: world AU -> pixels (clamp scale so extreme a doesn't blow up)
  const pad = 80;
  const aView = Math.max(a, 0.2);
  const scale = Math.min((w - 2 * pad), (h - 2 * pad)) / (2 * (aView * 1.2));
  const cx = w * 0.52;
  const cy = h * 0.54;

  function W2S(wx, wy){
    return { x: cx + wx*scale, y: cy - wy*scale };
  }

  // ellipse parameters
  const b = a * Math.sqrt(1 - e*e);
  const c = a * e; // focus offset (from center)
  // focus at (0,0), so center at (c,0) in world coords (because x = a(cosE - e) already centered at focus)
  // We'll draw ellipse by sampling param E and using x,y formulas directly (focus-based).
  // Also show ellipse outline (Law I)
  if (els.showEllipse.checked){
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.20)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 10]);
    ctx.beginPath();
    for (let i=0;i<=600;i++){
      const E = (i/600)*TAU;
      const x = a*(Math.cos(E) - e);
      const y = b*Math.sin(E);
      const s = W2S(x,y);
      if (i===0) ctx.moveTo(s.x,s.y);
      else ctx.lineTo(s.x,s.y);
    }
    ctx.stroke();
    ctx.restore();

    // axes a,b (subtle)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 2;
    // major axis endpoints in focus-based coords: perihel at x=a(1-e), aphel at x=-a(1+e)
    const peri = W2S(a*(1-e), 0);
    const aphe = W2S(-a*(1+e), 0);
    ctx.beginPath(); ctx.moveTo(aphe.x, aphe.y); ctx.lineTo(peri.x, peri.y); ctx.stroke();

    const top = W2S(-a*e, b);
    const bot = W2S(-a*e, -b);
    ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bot.x, bot.y); ctx.stroke();
    ctx.restore();

    drawTextGlow("Legea I: elipsă, Soarele în focar", 18, 38, 16, "left");
  } else {
    drawTextGlow("Orbită (vizual)", 18, 38, 16, "left");
  }

  // Sun at focus (0,0)
  const sun = W2S(0,0);
  drawGlowCircle(sun.x, sun.y, 10, "rgba(255,215,90,.95)", 22);
  drawTextGlow("Soare (focar)", sun.x+14, sun.y-12, 12, "left");

  // foci (optional): for ellipse, second focus at x = -2c (because focus1 at 0, center at -c? careful)
  // In focus-based coordinates, focus1 is at 0. The center is at x = -ae (because x = a(cosE - e) is centered at -ae).
  // For an ellipse, foci are at center ± c. So:
  // center = -ae, f1 = 0 => indeed 0 = center + c => center = -c = -ae correct.
  // then f2 = center - c = -2c
  if (els.showFoci.checked){
    const centerX = -c;
    const f2x = centerX - c; // -2c
    const f2 = W2S(f2x, 0);
    drawGlowCircle(f2.x, f2.y, 6, "rgba(106,92,255,.85)", 18);
    drawTextGlow("F2", f2.x+12, f2.y-10, 12, "left");
  }

  // planet position
  const pos = positionAtTime(t);
  const planet = W2S(pos.x, pos.y);

  // trail: add point only every TRAIL_TIME_STEP (or fraction of period) to avoid dense tangles when a small / e large
  if (els.showTrail.checked){
    const T = period();
    const minStep = Math.min(TRAIL_TIME_STEP, T / 120);
    if (trail.length === 0 || (t - lastTrailTime) >= minStep) {
      trail.push({ x: pos.x, y: pos.y });
      lastTrailTime = t;
      if (trail.length > TRAIL_MAX) trail.shift();
    }

    ctx.save();
    ctx.strokeStyle = "rgba(40,199,193,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < trail.length; i++) {
      const s = W2S(trail[i].x, trail[i].y);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // planet
  drawGlowCircle(planet.x, planet.y, 7, "rgba(40,199,193,.95)", 18);

  // velocity vibe: show tangent indicator
  const ahead = positionAtTime(t + 0.002);
  const vvx = ahead.x - pos.x;
  const vvy = ahead.y - pos.y;
  const vlen = Math.hypot(vvx, vvy) || 1;
  const vx = vvx / vlen;
  const vy = vvy / vlen;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(planet.x, planet.y);
  ctx.lineTo(planet.x + vx*30, planet.y - vy*30);
  ctx.stroke();
  ctx.restore();

  // Law II: area swept in last Δt window (cap at ~half period so wedge doesn't wrap and tangle when a small / e large)
  if (els.showAreas.checked){
    const T = period();
    const dtRaw = dtDays / DAYS_PER_YEAR;
    const dtCapped = Math.min(dtRaw, T * 0.48); // max ~half orbit to avoid self-overlapping wedge
    const t1 = t;
    const t0 = Math.max(0, t1 - dtCapped);

    const steps = Math.min(80, Math.max(24, Math.ceil(60 * (dtCapped / T))));

    ctx.save();
    ctx.fillStyle = "rgba(255,95,138,.18)";
    ctx.strokeStyle = "rgba(255,95,138,.35)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(sun.x, sun.y);

    for (let i = 0; i <= steps; i++) {
      const ti = t0 + (i / steps) * (t1 - t0);
      const p = positionAtTime(ti);
      const sc = W2S(p.x, p.y);
      ctx.lineTo(sc.x, sc.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    lastArea = sweptArea(t0, t1, 140);
    const daysShown = Math.round(dtCapped * DAYS_PER_YEAR);
    drawTextGlow(`Legea II: aria(Δt=${daysShown}d) ~ constantă`, 18, 62, 14, "left");
  }

  // Law III overlay — pe lățimi mici, caseta sus-dreapta acoperă textele Lege I/II (stânga sus);
  // o mutăm deasupra benzii de jos, centrată orizontal.
  if (els.showLaw3.checked){
    const T = period();
    const ratio = ratioT2a3();
    const expected = 1/Mstar;

    const bh = 96;
    const bottomBarH = 52;
    const pad = 12;
    const bw = Math.min(392, Math.max(160, w - 2 * pad));
    const boxXTopRight = Math.max(pad, w - bw - pad);
    /* Dacă caseta ar începe prea la stânga, se suprapune cu etichetele Lege I/II (x≈18). */
    const overlapsLeftLabels = boxXTopRight < 220;
    const useBottom = w < 780 || overlapsLeftLabels;
    const boxX = useBottom ? Math.max(pad, (w - bw) * 0.5) : boxXTopRight;
    const boxY = useBottom
      ? Math.max(18, h - bottomBarH - bh - 14)
      : 18;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.36)";
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    roundRect(ctx, boxX, boxY, bw, bh, 16);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "900 14px ui-sans-serif, system-ui";
    ctx.fillText("Legea III", boxX+14, boxY+26);

    ctx.font = "800 13px ui-sans-serif, system-ui";
    ctx.fillText(`T = ${T.toFixed(3)} ani`, boxX+14, boxY+50);
    ctx.fillText(`T²/a³ = ${ratio.toFixed(4)}  (≈ ${expected.toFixed(4)})`, boxX+14, boxY+72);
    ctx.fillText(`M = ${Mstar.toFixed(2)} M☉`, boxX+14, boxY+92);

    ctx.restore();
  }

  // bottom mini guide
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(0, h-52, w, 52);
  ctx.restore();
  drawTextGlow("Notă: mărește e ca să vezi cum crește viteza la periapsis (Legea II devine evidentă).", 18, h-20, 13);

  // update readouts
  updateReadouts();
}

function tick(dt){
  if (!running || paused) return;
  // dt is seconds; convert to years, scale by speed
  const dtYears = (dt / 5.0) * speed / 60; // feel-good scaling (nu real-time)
  t += dtYears;

  // wrap to avoid huge numbers
  const T = period();
  if (t > 1e6*T) t = t % T;
}

// =====================
// Main loop
// =====================
function init(){
  updateReadouts();
  drawPlot();

  let last = performance.now();
  function loop(now){
    const dt = (now - last) / 1000;
    last = now;

    tick(dt);
    drawOrbitAndPlanet();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  setBadge("Status: Pornit");
}

// —— Panouri retractabile (design ca la oscilatorul simplu / Mix) ——
const keplerLeftPanel = document.getElementById("keplerPanelLeft");
const keplerRightPanel = document.getElementById("keplerPanelRight");
const keplerToggleLeft = document.getElementById("toggleLeftPanel");
const keplerToggleRight = document.getElementById("toggleRightPanel");

function isKeplerMobileViewport(){
  return window.matchMedia("(max-width: 1024px)").matches;
}

function syncKeplerStageMargins(){
  const lw = keplerLeftPanel?.offsetWidth || 300;
  const rw = keplerRightPanel?.offsetWidth || 320;
  const leftOn = keplerLeftPanel && !keplerLeftPanel.classList.contains("hidden");
  const rightOn = keplerRightPanel && !keplerRightPanel.classList.contains("hidden");
  document.documentElement.style.setProperty("--kepler-stage-ml", leftOn ? `${lw}px` : "0px");
  document.documentElement.style.setProperty("--kepler-stage-mr", rightOn ? `${rw}px` : "0px");
}

function updateKeplerTogglePositions(){
  if (!keplerToggleLeft || !keplerToggleRight) return;
  const lw = keplerLeftPanel?.offsetWidth || 300;
  const rw = keplerRightPanel?.offsetWidth || 320;
  const leftHidden = keplerLeftPanel?.classList.contains("hidden");
  const rightHidden = keplerRightPanel?.classList.contains("hidden");

  keplerToggleLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
  keplerToggleLeft.style.right = "auto";

  keplerToggleRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
  keplerToggleRight.style.left = "auto";
}

function syncKeplerToggleAria(){
  const lOpen = keplerLeftPanel && !keplerLeftPanel.classList.contains("hidden");
  const rOpen = keplerRightPanel && !keplerRightPanel.classList.contains("hidden");
  keplerToggleLeft?.setAttribute("aria-expanded", String(!!lOpen));
  keplerToggleRight?.setAttribute("aria-expanded", String(!!rOpen));
}

function syncKeplerPanelsUi(){
  syncKeplerStageMargins();
  updateKeplerTogglePositions();
  syncKeplerToggleAria();
}

function applyKeplerInitialPanels(){
  if (!keplerLeftPanel || !keplerRightPanel) return;
  if (isKeplerMobileViewport()){
    keplerLeftPanel.classList.add("hidden");
    keplerRightPanel.classList.add("hidden");
  } else {
    keplerLeftPanel.classList.remove("hidden");
    keplerRightPanel.classList.remove("hidden");
  }
  syncKeplerPanelsUi();
}

function onKeplerResize(){
  if (!isKeplerMobileViewport()){
    keplerLeftPanel?.classList.remove("hidden");
    keplerRightPanel?.classList.remove("hidden");
  }
  syncKeplerPanelsUi();
  drawPlot();
}

if (keplerToggleLeft && keplerLeftPanel){
  keplerToggleLeft.addEventListener("click", () => {
    keplerLeftPanel.classList.toggle("hidden");
    if (isKeplerMobileViewport() && !keplerLeftPanel.classList.contains("hidden") && keplerRightPanel){
      keplerRightPanel.classList.add("hidden");
    }
    syncKeplerPanelsUi();
  });
}

if (keplerToggleRight && keplerRightPanel){
  keplerToggleRight.addEventListener("click", () => {
    keplerRightPanel.classList.toggle("hidden");
    if (isKeplerMobileViewport() && !keplerRightPanel.classList.contains("hidden") && keplerLeftPanel){
      keplerLeftPanel.classList.add("hidden");
    }
    syncKeplerPanelsUi();
  });
}

window.addEventListener("resize", onKeplerResize);

applyKeplerInitialPanels();
init();
 
