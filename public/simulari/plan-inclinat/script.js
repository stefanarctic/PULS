const canvas = document.getElementById("sim");
const ctx = canvas.getContext("2d");

function simT(path, fallback) {
  if (typeof window.simLbl === "function") return window.simLbl(path, fallback);
  return fallback;
}

const el = {
  mass: document.getElementById("mass"),
  massNum: document.getElementById("massNum"),
  angle: document.getElementById("angle"),
  angleNum: document.getElementById("angleNum"),
  muS: document.getElementById("muS"),
  muSNum: document.getElementById("muSNum"),
  muK: document.getElementById("muK"),
  muKNum: document.getElementById("muKNum"),
  g: document.getElementById("g"),
  gNum: document.getElementById("gNum"),
  zoom: document.getElementById("zoom"),
  zoomNum: document.getElementById("zoomNum"),

  toggleRun: document.getElementById("toggleRun"),
  reset: document.getElementById("reset"),

  toggleVectors: document.getElementById("toggleVectors"),
  toggleLabels: document.getElementById("toggleLabels"),
  toggleGrid: document.getElementById("toggleGrid"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),

  stats: document.getElementById("stats"),
  stateBadge: document.getElementById("stateBadge"),
  hudT: document.getElementById("hudT"),
  hudV: document.getElementById("hudV"),
  hudA: document.getElementById("hudA"),

  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  miniAngle: document.getElementById("miniAngle"),
  miniA: document.getElementById("miniA"),

  sceneWrap: document.getElementById("sceneWrap"),
};

const leftPanel = document.getElementById("leftPanel");
const rightPanel = document.getElementById("rightPanel");
const togglePiLeft = document.getElementById("togglePiLeft");
const togglePiRight = document.getElementById("togglePiRight");
const topbarEl = document.querySelector(".topbar");

function isPiMobileViewport(){
  return window.matchMedia("(max-width: 1024px)").matches;
}

function syncPiPanelTop(){
  if (topbarEl){
    const h = Math.ceil(topbarEl.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--pi-panel-top", `${h}px`);
  }
}

function updatePiTogglePositions(){
  if (!togglePiLeft || !togglePiRight) return;
  const lw = leftPanel?.offsetWidth || 300;
  const rw = rightPanel?.offsetWidth || 300;
  const leftHidden = leftPanel?.classList.contains("hidden");
  const rightHidden = rightPanel?.classList.contains("hidden");

  togglePiLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
  togglePiLeft.style.right = "auto";

  togglePiRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
  togglePiRight.style.left = "auto";
}

function syncPiToggleAria(){
  const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
  const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
  togglePiLeft?.setAttribute("aria-expanded", String(!!lOpen));
  togglePiRight?.setAttribute("aria-expanded", String(!!rOpen));
}

function syncPiPanelsUi(){
  syncPiPanelTop();
  updatePiTogglePositions();
  syncPiToggleAria();
  queueResize();
}

function applyPiInitialPanels(){
  if (!leftPanel || !rightPanel) return;
  if (isPiMobileViewport()){
    leftPanel.classList.add("hidden");
    rightPanel.classList.add("hidden");
  } else {
    leftPanel.classList.remove("hidden");
    rightPanel.classList.remove("hidden");
  }
  syncPiPanelsUi();
}

function onPiResize(){
  if (!isPiMobileViewport()){
    leftPanel?.classList.remove("hidden");
    rightPanel?.classList.remove("hidden");
  }
  syncPiPanelsUi();
}

if (togglePiLeft && leftPanel){
  togglePiLeft.addEventListener("click", () => {
    leftPanel.classList.toggle("hidden");
    if (isPiMobileViewport() && !leftPanel.classList.contains("hidden") && rightPanel){
      rightPanel.classList.add("hidden");
    }
    syncPiPanelsUi();
  });
}

if (togglePiRight && rightPanel){
  togglePiRight.addEventListener("click", () => {
    rightPanel.classList.toggle("hidden");
    if (isPiMobileViewport() && !rightPanel.classList.contains("hidden") && leftPanel){
      leftPanel.classList.add("hidden");
    }
    syncPiPanelsUi();
  });
}

window.addEventListener("resize", onPiResize);

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function rad(deg){ return (deg * Math.PI) / 180; }
function nice(n,d=2){ return Number.isFinite(n) ? n.toFixed(d) : "—"; }

function bindPair(rangeEl, numEl, onChange){
  const syncFromRange = () => { numEl.value = rangeEl.value; onChange(); };
  const syncFromNum = () => {
    const v = clamp(parseFloat(numEl.value || rangeEl.min), parseFloat(rangeEl.min), parseFloat(rangeEl.max));
    numEl.value = v;
    rangeEl.value = v;
    onChange();
  };
  rangeEl.addEventListener("input", syncFromRange);
  numEl.addEventListener("input", syncFromNum);
}

let running = false;
let showVectors = true;
let showLabels  = true;
let showGrid    = false;

const sim = { s: 0.18, v: 0, t: 0 };
let cameraOffsetX = 0; // offset orizontal pentru camera/perspectivă
let cameraOffsetY = 0; // offset vertical pentru camera/perspectivă
let isDraggingCamera = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;

// ---- stable responsive canvas (no feedback loop) ----
let lastCW=0, lastCH=0, resizeQueued=false;

function resizeCanvas(){
  const rect = el.sceneWrap.getBoundingClientRect();
  const cw = Math.floor(rect.width);
  const ch = Math.floor(rect.height);
  if(cw<=0 || ch<=0) return;

  if(Math.abs(cw-lastCW) < 1 && Math.abs(ch-lastCH) < 1) return;
  lastCW=cw; lastCH=ch;

  const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
  canvas.width  = Math.floor(cw * dpr);
  canvas.height = Math.floor(ch * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);

  onChange();
}

function queueResize(){
  if(resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    resizeCanvas();
  });
}

const ro = new ResizeObserver(() => queueResize());
ro.observe(el.sceneWrap);
window.addEventListener("resize", queueResize);

document.addEventListener("fullscreenchange", () => {
  queueResize();
  setTimeout(queueResize, 80);
});

// ---- physics ----
function computePhysics(){
  const m = parseFloat(el.mass.value);
  const theta = rad(parseFloat(el.angle.value));
  const muS = parseFloat(el.muS.value);
  const muK = parseFloat(el.muK.value);
  const g = parseFloat(el.g.value);

  const G = m * g;
  const Gpar = G * Math.sin(theta);
  const Gperp = G * Math.cos(theta);
  const N = Gperp;

  const FfMax = muS * N;
  const slipping = (Gpar > FfMax + 1e-9);

  let Ff, Fr, a, mode;
  if(!slipping){
    Ff = Gpar;
    Fr = 0;
    a = 0;
    mode = simT("physics.modeStatic", "STATIC \u2014 st\u0103 pe loc");
  }else{
    Ff = muK * N;
    Fr = Gpar - Ff;
    a = Fr / m;
    mode = simT("physics.modeKinetic", "CINETIC \u2014 alunec\u0103");
  }

  return { m, theta, muS, muK, g, G, Gpar, Gperp, N, FfMax, slipping, Ff, Fr, a, mode };
}

function renderStats(p){
  const items = [
    ["G", `${nice(p.G,2)} N`],
    ["Gt", `${nice(p.Gpar,2)} N`],
    ["Gn", `${nice(p.Gperp,2)} N`],
    ["N", `${nice(p.N,2)} N`],
    ["μs·N", `${nice(p.FfMax,2)} N`],
    ["Ff", `${nice(p.Ff,2)} N`],
    ["Fr", `${nice(p.Fr,2)} N`],
    ["a", `${nice(p.a,3)} m/s²`],
  ];

  el.stats.innerHTML = items.map(([k,v]) => `
    <div class="stat">
      <div class="sk">${k}</div>
      <div class="sv">${v}</div>
    </div>
  `).join("");

  el.stateBadge.textContent = `${simT("labels.stateBadgePrefix", "Stare:")} ${p.mode}`;
  el.hudT.textContent = `${nice(sim.t,2)} s`;
  el.hudV.textContent = `${nice(sim.v,3)} m/s`;
  el.hudA.textContent = `${nice(p.a,3)} m/s²`;

  el.miniAngle.textContent = `${nice(p.theta*180/Math.PI,1)}°`;
  el.miniA.textContent = `${nice(p.a,3)}`;

  if(running){
    el.statusText.textContent = p.slipping ? simT("labels.statusRunning", "RUNNING") : simT("labels.statusHold", "HOLD (static)");
    el.statusDot.style.background =
      p.slipping
        ? "radial-gradient(circle at 30% 30%, #fff, var(--a3))"
        : "radial-gradient(circle at 30% 30%, #fff, var(--a4))";
  }else{
    el.statusText.textContent = simT("labels.statusReady", "READY");
    el.statusDot.style.background = "radial-gradient(circle at 30% 30%, #fff, var(--a1))";
  }
}

function lerp(a,b,t){ return a + (b-a)*t; }
function lerpPt(p0,p1,t){ return { x: lerp(p0.x,p1.x,t), y: lerp(p0.y,p1.y,t) }; }

function drawArrow(x1,y1,x2,y2,label,color){
  const head = 10;
  const ang = Math.atan2(y2-y1, x2-x1);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2 - head*Math.cos(ang - Math.PI/7), y2 - head*Math.sin(ang - Math.PI/7));
  ctx.lineTo(x2 - head*Math.cos(ang + Math.PI/7), y2 - head*Math.sin(ang + Math.PI/7));
  ctx.closePath();
  ctx.fill();

  if(showLabels && label){
    ctx.font = `12px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
    ctx.fillText(label, x2 + 8, y2 + 4);
  }
  ctx.restore();
}

function draw(p){
  const W = el.sceneWrap.clientWidth;
  const H = el.sceneWrap.clientHeight;
  const z = parseFloat(el.zoom.value);

  // clear
  ctx.clearRect(0,0,W,H);

  // soft background
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0, "rgba(255,255,255,0.92)");
  bg.addColorStop(1, "rgba(255,255,255,0.62)");
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  // dots
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = "rgba(10,14,30,0.18)";
  for(let i=0;i<70;i++){
    const px = (i*97) % W;
    const py = (i*53) % H;
    ctx.beginPath(); ctx.arc(px,py,1.3,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();

  if(showGrid){
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "rgba(10,14,30,0.18)";
    ctx.lineWidth = 1;
    const step = 32;
    for(let x=0;x<W;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.restore();
  }

  // camera pan + zoom around center
  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.scale(z, z);
  ctx.translate(-W/2 + cameraOffsetX, -H/2 + cameraOffsetY);

  const theta = p.theta;

  // ramp size & placement
  const L = Math.min(W, H) * 0.98;
  const p0 = { x: W*0.10, y: H*0.86 };
  const p1 = { x: p0.x + Math.cos(theta)*L, y: p0.y - Math.sin(theta)*L };

  // ground
  ctx.fillStyle = "rgba(10,14,30,0.04)";
  ctx.fillRect(0, p0.y + 18, W, H - (p0.y + 18));

  // ramp glow
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(18,194,255,0.25)";
  ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();

  // ramp body
  ctx.strokeStyle = "rgba(10,14,30,0.20)";
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();

  // highlight
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();

  // angle arc
  ctx.strokeStyle = "rgba(10,14,30,0.20)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p0.x, p0.y, 46, -theta, 0, false);
  ctx.stroke();
  if(showLabels){
    ctx.fillStyle = "rgba(10,14,30,0.72)";
    ctx.font = "13px var(--sans)";
    ctx.fillText(`θ=${nice(theta*180/Math.PI,1)}°`, p0.x + 48, p0.y - 12);
  }

  // block pos
  const t = clamp(sim.s, 0.06, 0.94);
  const center = lerpPt(p1, p0, t);

  const ux = Math.cos(theta), uy = -Math.sin(theta); // up
  const dx = -ux, dy = -uy;                          // down
  const nx = Math.sin(theta), ny = Math.cos(theta);

  // block
  const size = 56;
  const half = size/2;

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(-theta);

  ctx.fillStyle = "rgba(16,24,40,0.18)";
  ctx.beginPath(); ctx.roundRect(-half+5, -half+7, size, size, 12); ctx.fill();

  const grad = ctx.createLinearGradient(-half,-half,half,half);
  grad.addColorStop(0, "rgba(18,194,255,0.25)");
  grad.addColorStop(1, "rgba(255,79,163,0.18)");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "rgba(10,14,30,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-half, -half, size, size, 12);
  ctx.fill(); ctx.stroke();

  // little face
  ctx.globalAlpha = 0.60;
  ctx.fillStyle = "rgba(10,14,30,0.55)";
  ctx.beginPath(); ctx.arc(-10, -4, 2.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( 10, -4, 2.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 8, 6, 0, Math.PI); ctx.stroke();
  ctx.globalAlpha = 1;

  if(showLabels){
    ctx.fillStyle = "rgba(10,14,30,0.72)";
    ctx.font = `12px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
    ctx.fillText(`m=${nice(p.m,1)}kg`, -half + 8, 4);
  }
  ctx.restore();

  // culori forțe (definite aici pentru a fi accesibile și în legendă)
  const colG  = "rgba(255,79,163,0.92)";
  const colN  = "rgba(124,92,255,0.92)";
  const colFf = "rgba(255,183,3,0.92)";
  const colGp = "rgba(219, 12, 157, 0.95)";
  const colFr = "rgba(16,24,40,0.70)";
  const colGc = "rgba(18,194,255,0.95)";

  // forces
  if(showVectors){
    const cap = 160;
    const scale = 0.010 * L;
    const vec = (Fx,Fy)=>{
      const len = Math.hypot(Fx,Fy);
      const k = len>0 ? Math.min(cap, len*scale)/len : 0;
      return { x: Fx*k, y: Fy*k };
    };

    const ox = center.x, oy = center.y;

    const Gv = vec(0, p.G);
    drawArrow(ox,oy, ox+Gv.x, oy+Gv.y, `G ${nice(p.G,1)}N`, colG);

    const Nv = vec(-p.N*nx, -p.N*ny);
    drawArrow(ox,oy, ox+Nv.x, oy+Nv.y, `N ${nice(p.N,1)}N`, colN);

    const Ffv = vec(p.Ff*ux, p.Ff*uy);
    drawArrow(ox,oy, ox+Ffv.x, oy+Ffv.y, `Ff ${nice(p.Ff,1)}N`, colFf);

    const GparV = vec(p.Gpar*dx, p.Gpar*dy);
    drawArrow(ox,oy, ox+GparV.x, oy+GparV.y, `Gt ${nice(p.Gpar,1)}N`, colGp);

    const FrV = vec(p.Fr*dx, p.Fr*dy);
    drawArrow(ox,oy, ox+FrV.x, oy+FrV.y, `Fr ${nice(p.Fr,1)}N`, colFr);

    const GperpV = vec(p.Gperp*nx, p.Gperp*ny);
    drawArrow(ox,oy, ox+GperpV.x, oy+GperpV.y, `Gn ${nice(p.Gperp,1)}N`, colGc);

  }

  // sparkles
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(18,194,255,0.55)";
  for(let i=0;i<8;i++){
    const px = W*0.18 + i*W*0.09 + Math.sin(sim.t*0.8 + i)*10;
    const py = H*0.12 + Math.cos(sim.t*0.9 + i)*10;
    ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();

  // legendă forțe (în colțul din stânga sus, fixă pe ecran)
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0); // reset transform pentru poziție fixă
  const legendX = 16;
  const legendY = 16;
  const legendPadding = 12;
  const legendItemHeight = 20;
  const legendItems = [
    { name: "G", color: colG, desc: simT("labels.legendG", "Greutate") },
    { name: "Gn", color: colGc, desc: simT("labels.legendGn", "Greutate normal\u0103") },
    { name: "Gt", color: colGp, desc: simT("labels.legendGt", "Greutate tangen\u021bial\u0103") },
    { name: "N", color: colN, desc: simT("labels.legendN", "Reac\u021biune normal\u0103") },
    { name: "Ff", color: colFf, desc: simT("labels.legendFf", "For\u021b\u0103 frecare") },
    { name: "Fr", color: colFr, desc: simT("labels.legendFr", "For\u021b\u0103 rezultant\u0103") },
  ];
  
  const legendWidth = 220;
  const legendHeight = legendItems.length * legendItemHeight + legendPadding * 2 + 10;
  
  // fundal legendă
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(10,14,30,0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 8);
  ctx.fill();
  ctx.stroke();
  
  // titlu
  ctx.fillStyle = "rgba(10,14,30,0.85)";
  ctx.font = "bold 13px var(--sans)";
  ctx.fillText(simT("labels.legendTitle", "For\u021be"), legendX + legendPadding, legendY + legendPadding + 12);
  
  // items
  ctx.font = `12px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
  let yOffset = legendY + legendPadding + 28;
  
  for(const item of legendItems){
    // linie colorată
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + legendPadding, yOffset);
    ctx.lineTo(legendX + legendPadding + 30, yOffset);
    ctx.stroke();
    
    // nume
    ctx.fillStyle = "rgba(10,14,30,0.85)";
    ctx.fillText(item.name, legendX + legendPadding + 38, yOffset + 4);
    
    // descriere
    ctx.fillStyle = "rgba(10,14,30,0.55)";
    ctx.font = "11px var(--sans)";
    ctx.fillText(item.desc, legendX + legendPadding + 70, yOffset + 4);
    ctx.font = `12px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
    
    yOffset += legendItemHeight;
  }
  ctx.restore();

  ctx.restore(); // zoom
}

function step(dt){
  const p = computePhysics();
  if(!p.slipping){
    sim.v = 0;
  }else{
    sim.v += p.a * dt;
    sim.v = clamp(sim.v, -50, 50);
    const metersToFrac = 0.08;
    sim.s += (sim.v * dt) * metersToFrac;

    if(sim.s > 0.94){ sim.s = 0.94; sim.v = 0; }
    if(sim.s < 0.06){ sim.s = 0.06; sim.v = 0; }
  }
  sim.t += dt;
  renderStats(p);
  draw(p);
}

function resetSim(){
  sim.s = 0.18;
  sim.v = 0;
  sim.t = 0;
  const p = computePhysics();
  renderStats(p);
  draw(p);
}

function onChange(){
  const p = computePhysics();
  if(!p.slipping) sim.v = 0;
  renderStats(p);
  draw(p);
}

// roundRect polyfill
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
    const rr = Math.min(r, w/2, h/2);
    this.beginPath();
    this.moveTo(x+rr, y);
    this.arcTo(x+w, y, x+w, y+h, rr);
    this.arcTo(x+w, y+h, x, y+h, rr);
    this.arcTo(x, y+h, x, y, rr);
    this.arcTo(x, y, x+w, y, rr);
    this.closePath();
    return this;
  };
}

// bindings
bindPair(el.mass, el.massNum, onChange);
bindPair(el.angle, el.angleNum, onChange);
bindPair(el.muS, el.muSNum, onChange);
bindPair(el.muK, el.muKNum, onChange);
bindPair(el.g, el.gNum, onChange);
bindPair(el.zoom, el.zoomNum, onChange);

// buttons
el.toggleRun.addEventListener("click", ()=>{
  running = !running;
  el.toggleRun.textContent = running ? simT("buttons.pause", "\u23f8 Pauz\u0103") : simT("buttons.run", "\u25b6 Porne\u0219te");
  onChange();
});
el.reset.addEventListener("click", resetSim);

function toggleIcon(btn, fn){
  fn();
  btn.classList.toggle("on");
  onChange();
}
el.toggleVectors.addEventListener("click", ()=>toggleIcon(el.toggleVectors, ()=>showVectors=!showVectors));
el.toggleLabels.addEventListener("click", ()=>toggleIcon(el.toggleLabels, ()=>showLabels=!showLabels));
el.toggleGrid.addEventListener("click", ()=>toggleIcon(el.toggleGrid, ()=>showGrid=!showGrid));

// fullscreen
el.fullscreenBtn.addEventListener("click", async ()=>{
  const target = document.querySelector(".sceneStage");
  if(!document.fullscreenElement){
    await target.requestFullscreen?.();
  }else{
    await document.exitFullscreen?.();
  }
  queueResize();
  setTimeout(queueResize, 80);
});

// loop
let last = performance.now();
function loop(now){
  const dt = clamp((now - last)/1000, 0, 0.05);
  last = now;
  if(running) step(dt);
  requestAnimationFrame(loop);
}

// ---- mouse drag pentru pan camera ----
canvas.addEventListener("mousedown", (e) => {
  isDraggingCamera = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStartOffsetX = cameraOffsetX;
  dragStartOffsetY = cameraOffsetY;
  canvas.style.cursor = "grabbing";
  e.preventDefault();
});

canvas.addEventListener("mousemove", (e) => {
  if(isDraggingCamera){
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    const z = parseFloat(el.zoom.value);
    const dx = (e.clientX - dragStartX) / dpr / z;
    const dy = (e.clientY - dragStartY) / dpr / z;
    cameraOffsetX = dragStartOffsetX + dx;
    cameraOffsetY = dragStartOffsetY + dy;
    onChange();
  } else {
    canvas.style.cursor = "grab";
  }
});

canvas.addEventListener("mouseup", () => {
  if(isDraggingCamera){
    isDraggingCamera = false;
    canvas.style.cursor = "grab";
  }
});

canvas.addEventListener("mouseleave", () => {
  if(isDraggingCamera){
    isDraggingCamera = false;
    canvas.style.cursor = "grab";
  }
});

// ---- wheel zoom ----
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const W = el.sceneWrap.clientWidth;
  const H = el.sceneWrap.clientHeight;
  const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
  
  // coordonate mouse relative la canvas
  const mouseX = (e.clientX - rect.left) / dpr;
  const mouseY = (e.clientY - rect.top) / dpr;
  
  // zoom factor
  const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
  const currentZoom = parseFloat(el.zoom.value);
  const newZoom = clamp(currentZoom * zoomFactor, 0.8, 2.2);
  
  // ajustează camera offset pentru zoom centrat pe mouse
  const cx = W/2, cy = H/2;
  const worldX = (mouseX - cx) / currentZoom + cx - cameraOffsetX;
  const worldY = (mouseY - cy) / currentZoom + cy - cameraOffsetY;
  const newWorldX = (mouseX - cx) / newZoom + cx - cameraOffsetX;
  const newWorldY = (mouseY - cy) / newZoom + cy - cameraOffsetY;
  
  cameraOffsetX += (newWorldX - worldX);
  cameraOffsetY += (newWorldY - worldY);
  
  el.zoom.value = newZoom;
  el.zoomNum.value = newZoom;
  onChange();
}, { passive: false });

// init
applyPiInitialPanels();
queueResize();
resetSim();
requestAnimationFrame(loop);
