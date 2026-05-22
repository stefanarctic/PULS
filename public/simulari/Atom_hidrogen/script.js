// =====================
//  Hydrogen Spectra Lab
//  Bohr / de Broglie / Schrödinger + Spectrometer
//  (educațional + vizual, nu numeric "de laborator")
// =====================

const scene = document.getElementById("scene");
const ctx = scene.getContext("2d");

const spectrumCanvas = document.getElementById("spectrum");
const sctx = spectrumCanvas.getContext("2d");

const els = {
  speed: document.getElementById("speed"),
  speedVal: document.getElementById("speedVal"),
  ni: document.getElementById("ni"),
  niVal: document.getElementById("niVal"),
  nf: document.getElementById("nf"),
  nfVal: document.getElementById("nfVal"),
  monoLambda: document.getElementById("monoLambda"),
  monoVal: document.getElementById("monoVal"),
  series: document.getElementById("series"),
  instrument: document.getElementById("instrument"),

  modeEmission: document.getElementById("modeEmission"),
  modeAbsorption: document.getElementById("modeAbsorption"),
  beamWhite: document.getElementById("beamWhite"),
  beamMono: document.getElementById("beamMono"),

  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  stopBtn: document.getElementById("stopBtn"),
  exciteBtn: document.getElementById("exciteBtn"),

  statusBadge: document.getElementById("statusBadge"),
  modelName: document.getElementById("modelName"),
  seriesName: document.getElementById("seriesName"),
  transitionTxt: document.getElementById("transitionTxt"),
  lambdaTxt: document.getElementById("lambdaTxt"),
  energyTxt: document.getElementById("energyTxt"),

  hint: document.getElementById("hint"),
  notes: document.getElementById("notes"),
};

const simT = (path, ro) =>
  typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;

function setBadgeMsg(i18nKey, roFallback) {
  els.statusBadge.textContent = `${simT("status.prefix", "Status:")} ${simT(i18nKey, roFallback)}`;
}

let view = "bohr"; // bohr | debroglie | schrodinger | spectrometer
let running = false;
let paused = false;

// Modes
let mode = "emission";       // emission | absorption
let beam = "white";          // white | mono
let speed = 1.0;

// Physics-ish constants (SI-ish, but we output nm/eV)
const H = 6.62607015e-34;
const C = 299792458;
const EV = 1.602176634e-19;
const HC_EV_NM = 1239.841984; // eV·nm (handy)
const RYD_M_INV = 1.0973731568508e7; // Rydberg constant (m^-1), hydrogen approx

// Timeline
let t = 0;

// Atom state
let ni = 5;
let nf = 2;

// animation state
let electronPhase = 0;
let jumpPulse = 0;
let photonPulse = 0;
let lastPhoton = null; // { lambdaNm, energyEv, color }

// theme toggler
let themeAlt = false;

// =====================
// Helpers
// =====================
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

function hintForView(v){
  if (v === "bohr") return simT("hints.bohr", "Bohr: orbite + tranziții energetice (click pe ⚡ Excită)");
  if (v === "debroglie") return simT("hints.debroglie", "de Broglie: undă staționară pe orbită (n = număr de „bucle”)");
  if (v === "schrodinger") return simT("hints.schrodinger", "Schrödinger: nor de probabilitate (1s/2s/2p vizual)");
  return simT("hints.spectrometer", "Spectrometru: fascicul + celulă + prismă/grilă + ecran");
}

function nmToRGB(nm){
  // Approx visible spectrum mapping (380–780 nm)
  // Returns [r,g,b] 0..255. Outside visible => dim gray.
  if (nm < 380 || nm > 780) return [160, 160, 170];

  let r=0,g=0,b=0;
  if (nm < 440) { r = -(nm-440)/(440-380); g = 0; b = 1; }
  else if (nm < 490) { r = 0; g = (nm-440)/(490-440); b = 1; }
  else if (nm < 510) { r = 0; g = 1; b = -(nm-510)/(510-490); }
  else if (nm < 580) { r = (nm-510)/(580-510); g = 1; b = 0; }
  else if (nm < 645) { r = 1; g = -(nm-645)/(645-580); b = 0; }
  else { r = 1; g = 0; b = 0; }

  // intensity correction near limits
  let factor = 1;
  if (nm < 420) factor = 0.3 + 0.7*(nm-380)/(420-380);
  else if (nm > 700) factor = 0.3 + 0.7*(780-nm)/(780-700);

  const gamma = 0.8;
  const R = Math.round(255*Math.pow(r*factor, gamma));
  const G = Math.round(255*Math.pow(g*factor, gamma));
  const B = Math.round(255*Math.pow(b*factor, gamma));
  return [R,G,B];
}

function rgbToCss([r,g,b], a=1){
  return `rgba(${r},${g},${b},${a})`;
}

function energyLevelEv(n){
  return -13.6/(n*n);
}

function transitionEnergyEv(ni, nf){
  return Math.abs(energyLevelEv(nf) - energyLevelEv(ni));
}

function rydbergLambdaNm(ni, nf){
  // 1/λ = R(1/nf^2 - 1/ni^2) , λ in meters -> nm
  const inv = RYD_M_INV * (1/(nf*nf) - 1/(ni*ni));
  if (inv <= 0) return null;
  const lambdaM = 1/inv;
  return lambdaM * 1e9;
}

function pickSeriesNf(series){
  if (series === "lyman") return 1;
  if (series === "balmer") return 2;
  if (series === "paschen") return 3;
  return 2;
}

function describeSeries(series){
  if (series === "lyman") return simT("seriesName.lyman", "Lyman");
  if (series === "balmer") return simT("seriesName.balmer", "Balmer");
  if (series === "paschen") return simT("seriesName.paschen", "Paschen");
  return simT("seriesName.balmer", "Balmer");
}

function setActive(btnOn, btnOff){
  btnOn.classList.add("active");
  btnOff.classList.remove("active");
}

function fmtNm(x){
  const dash = simT("readoutsFmt.dash", "–");
  if (x == null) return dash;
  return `${x.toFixed(1)} nm`;
}
function fmtEv(x){
  const dash = simT("readoutsFmt.dash", "–");
  if (x == null) return dash;
  return `${x.toFixed(3)} eV`;
}

// =====================
// UI Wiring
// =====================
function syncUI(){
  els.speedVal.textContent = `${speed.toFixed(2)}×`;
  els.niVal.textContent = `${ni}`;
  els.nfVal.textContent = `${nf}`;
  els.monoVal.textContent = `${els.monoLambda.value} nm`;

  els.modelName.textContent =
    view === "bohr" ? simT("modelName.bohr", "Bohr") :
    view === "debroglie" ? simT("modelName.debroglie", "de Broglie") :
    view === "schrodinger" ? simT("modelName.schrodinger", "Schrödinger") : simT("modelName.spectrometer", "Spectrometru");

  els.seriesName.textContent = describeSeries(els.series.value);

  const Eev = transitionEnergyEv(ni, nf);
  const lambdaNm = HC_EV_NM / Eev;
  // for hydrogen, better: use Rydberg when possible
  const rydNm = rydbergLambdaNm(ni, nf);

  const shownLambda = rydNm ?? lambdaNm;

  els.transitionTxt.textContent =
    (mode === "emission")
      ? `${ni} → ${nf}`
      : `${nf} → ${ni}`;

  els.lambdaTxt.textContent = fmtNm(shownLambda);
  els.energyTxt.textContent = fmtEv(Eev);

  // keep nf < ni for emission feel; for absorption we still show target
  if (mode === "emission" && nf >= ni){
    nf = Math.max(1, ni-1);
    els.nf.value = nf;
    els.nfVal.textContent = `${nf}`;
  }
}

document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    view = tab.dataset.view;
    syncUI();
    lastPhoton = null;
    photonPulse = 0;
    jumpPulse = 0;

    els.hint.textContent = hintForView(view);
  });
});

els.speed.addEventListener("input", ()=>{
  speed = parseFloat(els.speed.value);
  syncUI();
});

els.ni.addEventListener("input", ()=>{
  ni = parseInt(els.ni.value, 10);
  // keep nf <= ni-1 in emission
  if (mode === "emission") nf = clamp(nf, 1, ni-1);
  els.nf.max = String(Math.max(1, ni-1));
  els.nf.value = nf;
  syncUI();
});

els.nf.addEventListener("input", ()=>{
  nf = parseInt(els.nf.value, 10);
  if (mode === "emission") nf = clamp(nf, 1, ni-1);
  syncUI();
});

els.series.addEventListener("change", ()=>{
  const targetNf = pickSeriesNf(els.series.value);
  nf = targetNf;
  els.nf.value = nf;
  syncUI();
});

els.monoLambda.addEventListener("input", ()=>{
  els.monoVal.textContent = `${els.monoLambda.value} nm`;
});

els.instrument.addEventListener("change", ()=>{
  // just redraw, no extra state
});

els.modeEmission.addEventListener("click", ()=>{
  mode = "emission";
  setActive(els.modeEmission, els.modeAbsorption);
  // enforce nf<ni
  nf = clamp(nf, 1, ni-1);
  els.nf.value = nf;
  syncUI();
});

els.modeAbsorption.addEventListener("click", ()=>{
  mode = "absorption";
  setActive(els.modeAbsorption, els.modeEmission);
  syncUI();
});

els.beamWhite.addEventListener("click", ()=>{
  beam = "white";
  setActive(els.beamWhite, els.beamMono);
});

els.beamMono.addEventListener("click", ()=>{
  beam = "mono";
  setActive(els.beamMono, els.beamWhite);
});

els.startBtn.addEventListener("click", ()=>{
  running = true;
  paused = false;
  setBadgeMsg("status.running", "Pornit");
});

els.pauseBtn.addEventListener("click", ()=>{
  if (!running) return;
  paused = !paused;
  setBadgeMsg(paused ? "status.paused" : "status.running", paused ? "Pauză" : "Pornit");
});

els.stopBtn.addEventListener("click", ()=>{
  running = false;
  paused = false;
  t = 0;
  electronPhase = 0;
  jumpPulse = 0;
  photonPulse = 0;
  lastPhoton = null;
  setBadgeMsg("status.ready", "Gata");
});

els.exciteBtn.addEventListener("click", ()=>{
  doExcite();
});

// =====================
// Excitation logic
// =====================
function doExcite(){
  // For emission: electron drops ni->nf emitting photon of that energy.
  // For absorption: electron goes nf->ni absorbing matching photon.
  const Eev = transitionEnergyEv(ni, nf);

  // choose lambda: either Rydberg (ideal) or hc/E
  const rydNm = rydbergLambdaNm(ni, nf);
  const lambdaNm = rydNm ?? (HC_EV_NM / Eev);

  const rgb = nmToRGB(lambdaNm);
  lastPhoton = { lambdaNm, energyEv: Eev, color: rgb };

  photonPulse = 1.0;
  jumpPulse = 1.0;

  // Also paint spectrum lines
  drawSpectrum();

  setBadgeMsg("status.event", "Eveniment");
  setTimeout(()=>{
    if (running) setBadgeMsg("status.running", "Pornit");
    else setBadgeMsg("status.ready", "Gata");
  }, 450);
}

// =====================
// Drawing: shared
// =====================
function resizeHiDPI(canvas, context){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
    context.setTransform(dpr,0,0,dpr,0,0);
  }
}

function drawGlowCircle(x,y,r, colorCss){
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = colorCss;
  ctx.shadowColor = colorCss;
  ctx.shadowBlur = 20;
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawTextGlow(text, x, y, size=14, align="left"){
  ctx.save();
  ctx.font = `800 ${size}px ui-sans-serif, system-ui`;
  ctx.textAlign = align;
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 10;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawPanelTitle(title){
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(0,0,scene.clientWidth,52);
  ctx.restore();
  drawTextGlow(title, 18, 34, 18, "left");
}

// =====================
// Spectrum drawing
// =====================
function drawSpectrum(){
  resizeHiDPI(spectrumCanvas, sctx);

  const w = spectrumCanvas.clientWidth;
  const h = spectrumCanvas.clientHeight;

  // background
  sctx.clearRect(0,0,w,h);
  sctx.fillStyle = "rgba(0,0,0,.06)";
  sctx.fillRect(0,0,w,h);

  // draw continuous band (380-760nm)
  const x0 = 12, x1 = w-12;
  const y0 = 22, y1 = h-28;

  for (let i=0;i< (x1-x0);i++){
    const nm = 380 + (i/(x1-x0))*(760-380);
    const rgb = nmToRGB(nm);
    sctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    sctx.fillRect(x0+i, y0, 1, y1-y0);
  }

  // overlay emission/absorption lines for a handful of transitions in selected series
  const series = els.series.value;
  const targetNf = pickSeriesNf(series);

  // build line set: ni from targetNf+1..8
  const lines = [];
  for (let n=targetNf+1; n<=8; n++){
    const lam = rydbergLambdaNm(n, targetNf);
    if (lam) lines.push({ ni:n, nf:targetNf, lam });
  }

  // add the user-selected transition too (even if not in that series)
  const userLam = rydbergLambdaNm(ni, nf);
  if (userLam) lines.push({ ni, nf, lam: userLam, user:true });

  for (const L of lines){
    const nm = L.lam;
    // map nm to x in [x0,x1]
    const x = x0 + ((nm-380)/(760-380))*(x1-x0);
    if (x < x0 || x > x1) continue;

    const isAbs = (mode === "absorption");
    const rgb = nmToRGB(nm);

    if (isAbs){
      sctx.strokeStyle = "rgba(0,0,0,.75)";
      sctx.lineWidth = L.user ? 3 : 2;
      sctx.beginPath();
      sctx.moveTo(x, y0);
      sctx.lineTo(x, y1);
      sctx.stroke();
    } else {
      sctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.95)`;
      sctx.lineWidth = L.user ? 3 : 2;
      sctx.shadowColor = sctx.strokeStyle;
      sctx.shadowBlur = L.user ? 10 : 6;
      sctx.beginPath();
      sctx.moveTo(x, y0);
      sctx.lineTo(x, y1);
      sctx.stroke();
      sctx.shadowBlur = 0;
    }
  }

  // labels
  sctx.fillStyle = "rgba(0,0,0,.65)";
  sctx.font = "800 11px ui-sans-serif, system-ui";
  sctx.fillText(simT("spectrumPlot.nm380", "380nm"), x0, h-10);
  sctx.fillText(simT("spectrumPlot.nm760", "760nm"), x1-38, h-10);

  sctx.fillStyle = "rgba(0,0,0,.75)";
  sctx.fillText(describeSeries(series), 12, 14);
}

// =====================
// View draws
// =====================
function drawBohr(w, h){
  drawPanelTitle(simT("canvas.bohrTitle", "Bohr: orbite cuantizate + tranziții (ΔE → foton)"));

  const cx = w*0.52, cy = h*0.52;

  // nucleus
  drawGlowCircle(cx, cy, 10, "rgba(255,90,90,.95)");

  // orbits
  const maxN = 6;
  for (let n=1;n<=maxN;n++){
    const r = 45 + n*34;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${0.08 + n*0.012})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // label
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.fillText(`n=${n}`, cx + r + 8, cy + 4);
    ctx.restore();
  }

  // electron (on orbit ni or nf depending on jumpPulse)
  const baseR = 45 + ni*34;
  const targetR = 45 + nf*34;

  const mix = jumpPulse > 0 ? (1 - easeOutExpo(1-jumpPulse)) : 0;
  const r = baseR*(1-mix) + targetR*mix;

  const ang = electronPhase;
  const ex = cx + Math.cos(ang)*r;
  const ey = cy + Math.sin(ang)*r;

  // electron glow
  drawGlowCircle(ex, ey, 7, "rgba(90,220,255,.95)");

  // photon streak in/out
  if (lastPhoton && photonPulse > 0){
    const nm = lastPhoton.lambdaNm;
    const rgb = lastPhoton.color;
    const col = rgbToCss(rgb, 0.95);

    // draw a curved arc "photon"
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    const p = photonPulse;
    ctx.beginPath();
    const ax = cx - 260, ay = cy - 120;
    const bx = cx - 60,  by = cy - 40;
    const cx2= cx - 120, cy2= cy + 180;

    // quadratic-ish path
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(bx, by, ex, ey);
    ctx.globalAlpha = p;
    ctx.stroke();
    ctx.restore();

    // label
    drawTextGlow(`${fmtNm(nm)} • ${fmtEv(lastPhoton.energyEv)}`, w-18, 34, 13, "right");
  }

  // small info box
  drawMiniBox(w, h, [
    mode === "emission"
      ? simT("canvas.bohrEmit", "Emisie: electronul cade și emite foton")
      : simT("canvas.bohrAbsorb", "Absorbție: electronul urcă dacă primește foton"),
    simT("canvas.bohrSeriesHint", "Folosește „Serie spectrală” ca să fixezi nᶠ (Lyman/Balmer/Paschen)."),
  ]);
}

function drawDeBroglie(w,h){
  drawPanelTitle(simT("canvas.debroglieTitle", "de Broglie: undă staționară pe orbită (2πr = nλ)"));

  const cx = w*0.5, cy = h*0.52;

  // nucleus
  drawGlowCircle(cx, cy, 10, "rgba(255,90,90,.95)");

  const r = 220;
  // orbit circle
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 3;
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // wave around orbit with n lobes = ni (use ni as quantum number)
  const n = ni;
  const points = 520;
  ctx.save();
  ctx.lineWidth = 3;

  for (let i=0;i<points;i++){
    const a0 = (i/points)*Math.PI*2;
    const a1 = ((i+1)/points)*Math.PI*2;

    const amp0 = 18*Math.sin(n*a0 + t*1.8);
    const amp1 = 18*Math.sin(n*a1 + t*1.8);

    const rr0 = r + amp0;
    const rr1 = r + amp1;

    const x0 = cx + Math.cos(a0)*rr0;
    const y0 = cy + Math.sin(a0)*rr0;
    const x1 = cx + Math.cos(a1)*rr1;
    const y1 = cy + Math.sin(a1)*rr1;

    // color shift along orbit
    const nm = 380 + (i/points)*380;
    const rgb = nmToRGB(nm);
    ctx.strokeStyle = rgbToCss(rgb, 0.55);

    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.stroke();
  }
  ctx.restore();

  // electron as marker moving
  const ex = cx + Math.cos(electronPhase)*r;
  const ey = cy + Math.sin(electronPhase)*r;
  drawGlowCircle(ex, ey, 7, "rgba(255,215,90,.95)");

  const waveLine = simT(
    "canvas.debroglieWaves",
    "Număr cuantic n = {n} → „încap” {n} lungimi de undă de-a lungul orbitei."
  ).replace(/\{n\}/g, String(n));
  drawMiniBox(w, h, [
    waveLine,
    simT("canvas.debroglieStable", "Dacă nu se potrivește, starea nu e stabilă (interferență destructivă)."),
  ]);

  // label
  drawTextGlow(
    simT("canvas.debroglieStationary", "n = {n} (unde staționare)").replace(/\{n\}/g, String(n)),
    w-18,
    34,
    13,
    "right"
  );
}

function drawSchrodinger(w,h){
  drawPanelTitle(simT("canvas.schroTitle", "Schrödinger: nor de probabilitate |ψ|² (vizual 2D)"));

  const cx = w*0.52, cy = h*0.52;

  // nucleus
  drawGlowCircle(cx, cy, 10, "rgba(255,90,90,.95)");

  // pick an "orbital" based on nf (just for variety)
  // nf=1 -> 1s; nf=2 -> 2s; nf=3 -> 2p-ish
  const orbital =
    nf <= 1 ? "1s" :
    nf === 2 ? "2s" : "2p";

  // draw probability density as many particles (points)
  const N = 1800;
  const scale = 150;

  ctx.save();
  ctx.globalAlpha = 0.9;

  for (let i=0;i<N;i++){
    // sample a point in [-1,1] square then accept based on density
    // simplified densities (not exact normalization; just looks right)
    let x,y,d=0;
    for (let tries=0;tries<8;tries++){
      x = (Math.random()*2 - 1);
      y = (Math.random()*2 - 1);
      const r = Math.sqrt(x*x + y*y);

      if (orbital === "1s"){
        // exp(-2r)
        d = Math.exp(-3.2*r);
      } else if (orbital === "2s"){
        // (1 - r)^2 * exp(-r)
        d = Math.pow(1 - 1.1*r, 2) * Math.exp(-2.0*r);
        d = Math.max(0, d);
      } else {
        // 2p-ish: lobes along x axis, node at center
        d = (x*x) * Math.exp(-2.2*r);
      }

      // acceptance
      if (Math.random() < d) break;
    }

    const px = cx + x*scale;
    const py = cy + y*scale;

    // color: use a gradient-ish by radius
    const rad = Math.sqrt(x*x+y*y);
    const nm = 420 + rad*220; // bluish->green->yellow
    const rgb = nmToRGB(nm);

    ctx.fillStyle = rgbToCss(rgb, 0.18);
    ctx.fillRect(px, py, 2, 2);
  }

  ctx.restore();

  // overlay nodal cues
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx,cy,scale,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();

  drawMiniBox(w,h,[
    simT("canvas.schroOrbital2d", "Orbital: {o} (vizualizare 2D).").replace(/\{o\}/g, orbital),
    simT("canvas.schroProb", "Aici nu „orbitează” ca o planetă – poziția e probabilistică."),
  ]);

  drawTextGlow(
    simT("canvas.schroOrbitalLbl", "Orbital: {o}").replace(/\{o\}/g, orbital),
    w-18,
    34,
    13,
    "right"
  );
}

function drawSpectrometer(w,h){
  drawPanelTitle(simT("canvas.specTitle", "Spectrometru: fascicul → celulă H → prismă/grilă → ecran (spectru)"));

  const leftX = 90;
  const midY = h*0.52;

  // beam source
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.fillRect(leftX-40, midY-65, 90, 130);
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.strokeRect(leftX-40, midY-65, 90, 130);
  ctx.restore();
  drawTextGlow(simT("canvas.specSource", "Sursă"), leftX+5, midY-78, 12);

  // slit
  const slitX = leftX + 120;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.fillRect(slitX, midY-70, 18, 140);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(slitX+7, midY-30, 4, 60);
  ctx.restore();
  drawTextGlow(simT("canvas.specSlit", "Fantă"), slitX+9, midY-78, 12, "center");

  // cell with hydrogen
  const cellX = slitX + 120;
  ctx.save();
  ctx.fillStyle = "rgba(90,220,255,.07)";
  ctx.strokeStyle = "rgba(90,220,255,.25)";
  roundRect(ctx, cellX, midY-85, 170, 170, 16);
  ctx.fill();
  ctx.stroke();

  // little atoms inside
  for (let i=0;i<18;i++){
    const ax = cellX + 20 + Math.random()*130;
    const ay = midY - 65 + Math.random()*130;
    drawGlowCircle(ax, ay, 2.2, "rgba(255,90,90,.65)");
  }
  ctx.restore();
  drawTextGlow(simT("canvas.specCell", "Celulă H"), cellX+85, midY-95, 12, "center");

  // disperser
  const dispX = cellX + 220;
  const instrument = els.instrument.value;

  if (instrument === "prism"){
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dispX, midY-70);
    ctx.lineTo(dispX+70, midY);
    ctx.lineTo(dispX, midY+70);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    drawTextGlow(simT("canvas.specPrism", "Prismă"), dispX+35, midY-86, 12, "center");
  } else {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    roundRect(ctx, dispX, midY-70, 24, 140, 10);
    ctx.fill(); ctx.stroke();

    // grooves
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    for (let i=0;i<10;i++){
      const yy = midY-60 + i*12;
      ctx.beginPath();
      ctx.moveTo(dispX+4, yy);
      ctx.lineTo(dispX+20, yy+6);
      ctx.stroke();
    }
    ctx.restore();
    drawTextGlow(simT("canvas.specGrating", "Grilă"), dispX+12, midY-86, 12, "center");
  }

  // screen
  const scrX = w - 210;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  roundRect(ctx, scrX, midY-110, 160, 220, 18);
  ctx.fill(); ctx.stroke();
  ctx.restore();
  drawTextGlow(simT("canvas.specScreen", "Ecran"), scrX+80, midY-126, 12, "center");

  // draw rays
  const beamIsWhite = beam === "white";
  const monoNm = parseInt(els.monoLambda.value, 10);

  // from source to slit
  drawRay(leftX+50, midY, slitX+8, midY, beamIsWhite ? null : monoNm, 0.75);

  // from slit to cell
  drawRay(slitX+18, midY, cellX, midY, beamIsWhite ? null : monoNm, 0.75);

  // from cell to disperser
  drawRay(cellX+170, midY, dispX, midY, beamIsWhite ? null : monoNm, 0.6);

  // disperser to screen: disperse wavelengths
  const series = els.series.value;
  const targetNf = pickSeriesNf(series);

  // base set lines + continuous
  if (beamIsWhite){
    // continuous fan
    for (let i=0;i<32;i++){
      const nm = 380 + (i/31)*(760-380);
      const ang = dispersionAngle(nm, instrument);
      const yEnd = midY + ang*170;
      drawRay(dispX+30, midY, scrX, yEnd, nm, 0.22);
    }
  } else {
    // mono
    const ang = dispersionAngle(monoNm, instrument);
    drawRay(dispX+30, midY, scrX, midY + ang*170, monoNm, 0.75);
  }

  // overlay emission/absorption lines from hydrogen (selected series)
  const lines = [];
  for (let n=targetNf+1; n<=8; n++){
    const lam = rydbergLambdaNm(n, targetNf);
    if (lam) lines.push(lam);
  }
  // also add chosen transition
  const userLam = rydbergLambdaNm(ni,nf);
  if (userLam) lines.push(userLam);

  for (const nm of lines){
    const ang = dispersionAngle(nm, instrument);
    const yEnd = midY + ang*170;

    if (mode === "emission"){
      drawRay(dispX+30, midY, scrX, yEnd, nm, 0.65);
      // small bright mark on screen
      const rgb = nmToRGB(nm);
      drawGlowCircle(scrX+10, yEnd, 3.2, rgbToCss(rgb, 0.95));
    } else {
      // absorption: draw "missing" lines as dark marks on screen
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,.65)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(scrX+6, yEnd-10);
      ctx.lineTo(scrX+6, yEnd+10);
      ctx.stroke();
      ctx.restore();
    }
  }

  const instrLine = instrument === "prism"
    ? simT("canvas.specInstrPrism", "Instrument: Prismă")
    : simT("canvas.specInstrGrating", "Instrument: Grilă de difracție");
  const beamLine = beamIsWhite
    ? simT("canvas.specBeamWhite", "Fascicul: Alb (continuum)")
    : simT("canvas.specBeamMono", "Fascicul: Monocromatic ({nm} nm)").replace(/\{nm\}/g, String(monoNm));
  const regimeLine = mode === "emission"
    ? simT("canvas.specRegEmission", "Regim: Emisie (linii luminoase)")
    : simT("canvas.specRegAbsorption", "Regim: Absorbție (linii întunecate)");
  drawMiniBox(w,h,[ instrLine, beamLine, regimeLine ]);
}

function dispersionAngle(nm, instrument){
  // purely visual mapping nm -> angle (bigger nm -> deviate differently)
  // prism: nonlinear; grating: more linear
  const x = (nm - 380) / (760 - 380); // 0..1
  if (instrument === "prism"){
    // blue deviates more (typical), so angle decreases with nm
    const a = (1 - Math.pow(x, 0.65)) * 0.9 - 0.45;
    return a;
  }
  // grating: fairly linear fan
  return (x - 0.5) * 1.0;
}

function drawRay(x0,y0,x1,y1,nmOrNull, alpha=0.4){
  ctx.save();
  let col = "rgba(255,255,255,.75)";
  if (nmOrNull != null){
    const rgb = nmToRGB(nmOrNull);
    col = rgbToCss(rgb, 1);
  }
  ctx.strokeStyle = col;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 3;
  ctx.shadowColor = col;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.stroke();
  ctx.restore();
}

function roundRect(c, x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r, y);
  c.arcTo(x+w, y, x+w, y+h, r);
  c.arcTo(x+w, y+h, x, y+h, r);
  c.arcTo(x, y+h, x, y, r);
  c.arcTo(x, y, x+w, y, r);
  c.closePath();
}

function drawMiniBox(w,h, lines){
  const bx = 18;
  const by = h - 116;
  const bw = 520;
  const bh = 92;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = 1;
  roundRect(ctx, bx, by, bw, bh, 16);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.font = "700 13px ui-sans-serif, system-ui";
  for (let i=0;i<lines.length;i++){
    ctx.fillText(`• ${lines[i]}`, bx+14, by+26 + i*22);
  }
  ctx.restore();
}

function easeOutExpo(x){
  return x === 1 ? 1 : 1 - Math.pow(2, -10*x);
}

// =====================
// Loop
// =====================
function tick(dt){
  if (!running || paused) return;

  t += dt * speed;
  electronPhase += dt * speed * 1.2;

  if (jumpPulse > 0) jumpPulse = Math.max(0, jumpPulse - dt*1.4*speed);
  if (photonPulse > 0) photonPulse = Math.max(0, photonPulse - dt*1.1*speed);
}

function render(){
  resizeHiDPI(scene, ctx);
  const w = scene.clientWidth;
  const h = scene.clientHeight;

  ctx.clearRect(0,0,w,h);

  // background sparkles
  drawStarfield(w,h);

  if (view === "bohr") drawBohr(w,h);
  else if (view === "debroglie") drawDeBroglie(w,h);
  else if (view === "schrodinger") drawSchrodinger(w,h);
  else drawSpectrometer(w,h);
}

function drawStarfield(w,h){
  // subtle moving noise/sparkles
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i=0;i<70;i++){
    const x = (Math.sin(t*0.12 + i*12.31)*0.5+0.5)*w;
    const y = (Math.cos(t*0.10 + i*7.77)*0.5+0.5)*h;
    const r = 1 + (i%3)*0.6;
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

// =====================
// Panouri retractabile (același model ca Legi Kepler / oscilator)
// =====================
const atomLeftPanel = document.getElementById("atomPanelLeft");
const atomRightPanel = document.getElementById("atomPanelRight");
const atomToggleLeft = document.getElementById("toggleAtomLeft");
const atomToggleRight = document.getElementById("toggleAtomRight");

function isAtomMobileViewport(){
  return window.matchMedia("(max-width: 1024px)").matches;
}

function syncAtomStageMargins(){
  const lw = atomLeftPanel?.offsetWidth || 300;
  const rw = atomRightPanel?.offsetWidth || 320;
  const leftOn = atomLeftPanel && !atomLeftPanel.classList.contains("hidden");
  const rightOn = atomRightPanel && !atomRightPanel.classList.contains("hidden");
  document.documentElement.style.setProperty("--atom-stage-ml", leftOn ? `${lw}px` : "0px");
  document.documentElement.style.setProperty("--atom-stage-mr", rightOn ? `${rw}px` : "0px");
}

function updateAtomTogglePositions(){
  if (!atomToggleLeft || !atomToggleRight) return;
  const lw = atomLeftPanel?.offsetWidth || 300;
  const rw = atomRightPanel?.offsetWidth || 320;
  const leftHidden = atomLeftPanel?.classList.contains("hidden");
  const rightHidden = atomRightPanel?.classList.contains("hidden");

  atomToggleLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
  atomToggleLeft.style.right = "auto";

  atomToggleRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
  atomToggleRight.style.left = "auto";
}

function syncAtomToggleAria(){
  const lOpen = atomLeftPanel && !atomLeftPanel.classList.contains("hidden");
  const rOpen = atomRightPanel && !atomRightPanel.classList.contains("hidden");
  atomToggleLeft?.setAttribute("aria-expanded", String(!!lOpen));
  atomToggleRight?.setAttribute("aria-expanded", String(!!rOpen));
}

function syncAtomPanelsUi(){
  syncAtomStageMargins();
  updateAtomTogglePositions();
  syncAtomToggleAria();
}

function applyAtomInitialPanels(){
  if (!atomLeftPanel || !atomRightPanel) return;
  if (isAtomMobileViewport()){
    atomLeftPanel.classList.add("hidden");
    atomRightPanel.classList.add("hidden");
  } else {
    atomLeftPanel.classList.remove("hidden");
    atomRightPanel.classList.remove("hidden");
  }
  syncAtomPanelsUi();
}

function onAtomResize(){
  if (!isAtomMobileViewport()){
    atomLeftPanel?.classList.remove("hidden");
    atomRightPanel?.classList.remove("hidden");
  }
  syncAtomPanelsUi();
  drawSpectrum();
}

if (atomToggleLeft && atomLeftPanel){
  atomToggleLeft.addEventListener("click", () => {
    atomLeftPanel.classList.toggle("hidden");
    if (isAtomMobileViewport() && !atomLeftPanel.classList.contains("hidden") && atomRightPanel){
      atomRightPanel.classList.add("hidden");
    }
    syncAtomPanelsUi();
  });
}

if (atomToggleRight && atomRightPanel){
  atomToggleRight.addEventListener("click", () => {
    atomRightPanel.classList.toggle("hidden");
    if (isAtomMobileViewport() && !atomRightPanel.classList.contains("hidden") && atomLeftPanel){
      atomLeftPanel.classList.add("hidden");
    }
    syncAtomPanelsUi();
  });
}

window.addEventListener("resize", onAtomResize);

// =====================
// init
// =====================
function init(){
  if (window.MathJax?.typesetPromise) {
    const app = document.getElementById("atomApp");
    if (app) window.MathJax.typesetPromise([app]).catch(() => {});
  }

  // set default nf from series
  nf = pickSeriesNf(els.series.value);
  els.nf.value = nf;
  els.nfVal.textContent = `${nf}`;

  speed = parseFloat(els.speed.value);
  ni = parseInt(els.ni.value, 10);

  syncUI();
  els.hint.textContent = hintForView(view);
  drawSpectrum();

  // redraw spectrum when relevant controls change
  ["change","input"].forEach(evt=>{
    els.series.addEventListener(evt, drawSpectrum);
    els.modeEmission.addEventListener("click", drawSpectrum);
    els.modeAbsorption.addEventListener("click", drawSpectrum);
    els.ni.addEventListener(evt, drawSpectrum);
    els.nf.addEventListener(evt, drawSpectrum);
  });

  // auto-run for vibe
  running = true;
  setBadgeMsg("status.running", "Pornit");

  let last = performance.now();
  function loop(now){
    const dt = (now-last)/1000;
    last = now;
    tick(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

applyAtomInitialPanels();
init();
