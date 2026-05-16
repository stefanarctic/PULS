// Simulator Termodinamică — Otto / Diesel / Carnot + Compare selector
// p-V + T-s (entropie relativă) + Wnet/Qin/eta/IMEP

function simUI(path, fallback) {
  return typeof window.simLbl === "function" ? window.simLbl(path, fallback) : fallback;
}

const MODE_LABEL_FALLBACK = {
  otto: "Otto",
  diesel: "Diesel",
  carnot: "Carnot",
  compare: "Comparație",
};

function modeStatusLabel(m) {
  return simUI("status.mode." + m, MODE_LABEL_FALLBACK[m] || m);
}

const R = 8.314462618; // J/(mol*K)

const els = {
  status: document.getElementById("statusPill"),

  pv: document.getElementById("pv"),
  ts: document.getElementById("ts"),

  btnOtto: document.getElementById("btnOtto"),
  btnDiesel: document.getElementById("btnDiesel"),
  btnCarnot: document.getElementById("btnCarnot"),
  btnCompare: document.getElementById("btnCompare"),

  compareGroup: document.getElementById("compareGroup"),
  cmpA: document.getElementById("cmpA"),
  cmpB: document.getElementById("cmpB"),
  cmpAll: document.getElementById("cmpAll"),

  p1: document.getElementById("p1"),
  t1: document.getElementById("t1"),
  v1: document.getElementById("v1"),
  r: document.getElementById("r"),
  gamma: document.getElementById("gamma"),
  n: document.getElementById("n"),
  t3: document.getElementById("t3"),
  rho: document.getElementById("rho"),

  carnotGroup: document.getElementById("carnotGroup"),
  th: document.getElementById("th"),
  tc: document.getElementById("tc"),
  alpha: document.getElementById("alpha"),

  res: document.getElementById("res"),

  p1Out: document.getElementById("p1Out"),
  t1Out: document.getElementById("t1Out"),
  v1Out: document.getElementById("v1Out"),
  rOut: document.getElementById("rOut"),
  gammaOut: document.getElementById("gammaOut"),
  nOut: document.getElementById("nOut"),
  t3Out: document.getElementById("t3Out"),
  rhoOut: document.getElementById("rhoOut"),
  resOut: document.getElementById("resOut"),

  thOut: document.getElementById("thOut"),
  tcOut: document.getElementById("tcOut"),
  alphaOut: document.getElementById("alphaOut"),

  ottoControls: document.getElementById("ottoControls"),
  dieselControls: document.getElementById("dieselControls"),

  showStates: document.getElementById("showStates"),
  animate: document.getElementById("animate"),

  btnRecalc: document.getElementById("btnRecalc"),
  btnReset: document.getElementById("btnReset"),

  stateNow: document.getElementById("stateNow"),
  pNow: document.getElementById("pNow"),
  vNow: document.getElementById("vNow"),
  tNow: document.getElementById("tNow"),

  eta: document.getElementById("eta"),
  etaHint: document.getElementById("etaHint"),
  wnet: document.getElementById("wnet"),
  qin: document.getElementById("qin"),
  imep: document.getElementById("imep"),

  statesBody: document.getElementById("statesBody"),
};

let mode = "otto"; // "otto" | "diesel" | "carnot" | "compare"
let animT = 0;

function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function fmt(x, d=2){ if(!isFinite(x)) return "—"; return Number(x).toFixed(d); }
function fmtBar(xPa){ return fmt(xPa/1e5, 2); }
function fmtL(xm3){ return fmt(xm3*1000, 3); }

function gasProps(gamma){
  const Cv = R / (gamma - 1);
  const Cp = gamma * Cv;
  return { Cv, Cp };
}

// s - s1 = Cv ln(T/T1) + R ln(V/V1)  (per mol)
function sRelPerMol(T, V, ref, props){
  return props.Cv * Math.log(T/ref.T1) + R * Math.log(V/ref.V1);
}

function setMode(m){
  mode = m;

  els.btnOtto.classList.toggle("active", m==="otto");
  els.btnDiesel.classList.toggle("active", m==="diesel");
  els.btnCarnot.classList.toggle("active", m==="carnot");
  els.btnCompare.classList.toggle("active", m==="compare");

  // show/hide groups
  els.compareGroup.classList.toggle("hidden", m!=="compare");
  els.carnotGroup.classList.toggle("hidden", m!=="carnot" && m!=="compare"); // in compare we still might use Carnot
  // heat group shows for otto/diesel/compare (since compare could include them)
  document.getElementById("heatGroup").classList.toggle("hidden", m==="carnot");

  // toggle otto/diesel controls depending on *current single mode*
  const dieselOn = (m === "diesel");
  els.ottoControls.classList.toggle("hidden", dieselOn);
  els.dieselControls.classList.toggle("hidden", !dieselOn);

  els.status.textContent = modeStatusLabel(m);
  recalc();
}

function readParams(){
  const p1_bar = parseFloat(els.p1.value);
  const T1 = parseFloat(els.t1.value);
  const V1_L = parseFloat(els.v1.value);
  const r = parseFloat(els.r.value);
  const gamma = parseFloat(els.gamma.value);
  const n = parseFloat(els.n.value);
  const T3 = parseFloat(els.t3.value);
  const rho = parseFloat(els.rho.value);
  const res = parseInt(els.res.value, 10);

  const Th = parseFloat(els.th.value);
  const Tc = parseFloat(els.tc.value);
  const alpha = parseFloat(els.alpha.value);

  const P1 = p1_bar * 1e5; // Pa
  const V1 = V1_L / 1000; // m3

  return { P1, T1, V1, r, gamma, n, T3, rho, Th, Tc, alpha, res };
}

function updateOutputs(p){
  els.p1Out.textContent = `${fmt(p.P1/1e5,2)} bar`;
  els.t1Out.textContent = `${fmt(p.T1,0)} K`;
  els.v1Out.textContent = `${fmt(p.V1*1000,2)} L`;
  els.rOut.textContent = `${fmt(p.r,1)}`;
  els.gammaOut.textContent = `${fmt(p.gamma,2)}`;
  els.nOut.textContent = `${fmt(p.n,3)} mol`;
  if (els.t3Out) els.t3Out.textContent = `${fmt(p.T3,0)} K`;
  if (els.rhoOut) els.rhoOut.textContent = `${fmt(p.rho,2)}`;
  els.resOut.textContent = `${p.res}`;

  els.thOut.textContent = `${fmt(p.Th,0)} K`;
  els.tcOut.textContent = `${fmt(p.Tc,0)} K`;
  els.alphaOut.textContent = `${fmt(p.alpha,2)}`;
}

// -------------------- OTTO --------------------
function makeOtto(p){
  const {Cv} = gasProps(p.gamma);
  const V1 = p.V1, P1 = p.P1, T1 = p.T1;
  const V2 = V1 / p.r;

  const T2 = T1 * Math.pow(p.r, p.gamma - 1);
  const P2 = P1 * Math.pow(p.r, p.gamma);

  const V3 = V2;
  const T3 = p.T3;
  const P3 = P2 * (T3 / T2);

  const V4 = V1;
  const T4 = T3 * Math.pow(V3 / V4, p.gamma - 1);
  const P4 = P3 * Math.pow(V3 / V4, p.gamma);

  const Qin = p.n * Cv * (T3 - T2);
  const Qout = p.n * Cv * (T4 - T1);
  const Wnet = Qin - Qout;
  const eta = Qin > 0 ? (Wnet / Qin) : NaN;

  return {
    key: "otto",
    name: simUI("cycles.otto", "Otto"),
    states: [
      {id:1, P:P1, V:V1, T:T1},
      {id:2, P:P2, V:V2, T:T2},
      {id:3, P:P3, V:V3, T:T3},
      {id:4, P:P4, V:V4, T:T4},
    ],
    Qin, Qout, Wnet, eta,
    segments: buildSegmentsOtto(p, {P1,V1,T1,P2,V2,T2,P3,V3,T3,P4,V4,T4})
  };
}

function buildSegmentsOtto(p, st){
  const N = p.res;
  const segs = [];

  // 1->2 isentropic
  {
    const pts = [];
    const Vstart = st.V1, Vend = st.V2;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const P = st.P1 * Math.pow(st.V1 / V, p.gamma);
      const T = (P*V)/(p.n*R);
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 2->3 isoV
  {
    const pts = [];
    const M = Math.max(20, Math.floor(N*0.35));
    for(let i=0;i<=M;i++){
      const t = i/M;
      const T = st.T2 + (st.T3 - st.T2)*t;
      const V = st.V2;
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 3->4 isentropic
  {
    const pts = [];
    const Vstart = st.V3, Vend = st.V4;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const P = st.P3 * Math.pow(st.V3 / V, p.gamma);
      const T = (P*V)/(p.n*R);
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 4->1 isoV
  {
    const pts = [];
    const M = Math.max(20, Math.floor(N*0.35));
    for(let i=0;i<=M;i++){
      const t = i/M;
      const T = st.T4 + (st.T1 - st.T4)*t;
      const V = st.V1;
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  return segs;
}

// -------------------- DIESEL --------------------
function makeDiesel(p){
  const {Cv, Cp} = gasProps(p.gamma);
  const V1 = p.V1, P1 = p.P1, T1 = p.T1;
  const V2 = V1 / p.r;

  const T2 = T1 * Math.pow(p.r, p.gamma - 1);
  const P2 = P1 * Math.pow(p.r, p.gamma);

  const V3 = p.rho * V2;
  const P3 = P2;
  const T3 = T2 * p.rho;

  const V4 = V1;
  const T4 = T3 * Math.pow(V3 / V4, p.gamma - 1);
  const P4 = P3 * Math.pow(V3 / V4, p.gamma);

  const Qin = p.n * Cp * (T3 - T2);
  const Qout = p.n * Cv * (T4 - T1);
  const Wnet = Qin - Qout;
  const eta = Qin > 0 ? (Wnet / Qin) : NaN;

  return {
    key: "diesel",
    name: simUI("cycles.diesel", "Diesel"),
    states: [
      {id:1, P:P1, V:V1, T:T1},
      {id:2, P:P2, V:V2, T:T2},
      {id:3, P:P3, V:V3, T:T3},
      {id:4, P:P4, V:V4, T:T4},
    ],
    Qin, Qout, Wnet, eta,
    segments: buildSegmentsDiesel(p, {P1,V1,T1,P2,V2,T2,P3,V3,T3,P4,V4,T4})
  };
}

function buildSegmentsDiesel(p, st){
  const N = p.res;
  const segs = [];

  // 1->2 isentropic
  {
    const pts = [];
    const Vstart = st.V1, Vend = st.V2;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const P = st.P1 * Math.pow(st.V1 / V, p.gamma);
      const T = (P*V)/(p.n*R);
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 2->3 isoP
  {
    const pts = [];
    const M = Math.max(30, Math.floor(N*0.55));
    for(let i=0;i<=M;i++){
      const t = i/M;
      const V = st.V2 + (st.V3 - st.V2)*t;
      const P = st.P2;
      const T = (P*V)/(p.n*R);
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 3->4 isentropic
  {
    const pts = [];
    const Vstart = st.V3, Vend = st.V4;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const P = st.P3 * Math.pow(st.V3 / V, p.gamma);
      const T = (P*V)/(p.n*R);
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 4->1 isoV
  {
    const pts = [];
    const M = Math.max(20, Math.floor(N*0.35));
    for(let i=0;i<=M;i++){
      const t = i/M;
      const T = st.T4 + (st.T1 - st.T4)*t;
      const V = st.V1;
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  return segs;
}

// -------------------- CARNOT --------------------
// We build Carnot in (V,P,T) using: 1->2 isothermal at Th (expansion)
// 2->3 adiabatic (isentropic) down to Tc
// 3->4 isothermal at Tc (compression)
// 4->1 adiabatic up to Th
// User controls Th, Tc, alpha = V2/V1 (isothermal ratio at Th)
function makeCarnot(p){
  const V1 = p.V1;
  const P1 = p.P1;
  const n = p.n;

  // Ensure temperatures are sane
  const Th = Math.max(p.Th, p.Tc + 10);
  const Tc = Math.max(200, Math.min(p.Tc, Th - 5));

  // Define state 1 at Th but keep P1,V1 consistent by setting T1? We'll override T for Carnot states:
  // Use ideal gas at state 1: set T1carnot = P1 V1 / (nR)
  const T1ideal = (P1 * V1) / (n * R);

  // For Carnot, state 1 temperature should be Th. We can adapt by redefining P1c such that T=Th at V1:
  const P1c = (n * R * Th) / V1;

  const alpha = p.alpha;         // V2/V1 on Th isotherm
  const V2 = V1 * alpha;
  const T2 = Th;
  const P2 = (n * R * Th) / V2;

  // 2->3 adiabatic to Tc:
  // For isentropic: T * V^(gamma-1) = const
  const V3 = V2 * Math.pow(Th / Tc, 1/(p.gamma - 1));
  const T3 = Tc;
  const P3 = (n * R * Tc) / V3;

  // 3->4 isothermal at Tc compression to some V4:
  // Next adiabatic 4->1 must bring Tc -> Th:
  // V4 = V1 * (Th/Tc)^(1/(gamma-1))
  const V4 = V1 * Math.pow(Th / Tc, 1/(p.gamma - 1));
  const T4 = Tc;
  const P4 = (n * R * Tc) / V4;

  // Heats for Carnot:
  // Qin on hot isotherm: n R Th ln(V2/V1) = n R Th ln(alpha)
  // Qout on cold isotherm magnitude: n R Tc ln(V3/V4) (note V3>V4)
  const Qin = n * R * Th * Math.log(V2 / V1);
  const Qout = n * R * Tc * Math.log(V3 / V4);
  const Wnet = Qin - Qout;
  const eta = 1 - Tc/Th;

  return {
    key: "carnot",
    name: simUI("cycles.carnot", "Carnot"),
    states: [
      {id:1, P:P1c, V:V1, T:Th},
      {id:2, P:P2,  V:V2, T:T2},
      {id:3, P:P3,  V:V3, T:T3},
      {id:4, P:P4,  V:V4, T:T4},
    ],
    Qin, Qout, Wnet, eta,
    segments: buildSegmentsCarnot(p, {P1:P1c,V1,T1:Th,P2,V2,T2:Th,P3,V3,T3:Tc,P4,V4,T4:Tc})
  };
}

function buildSegmentsCarnot(p, st){
  const N = p.res;
  const segs = [];

  // 1->2 isothermal at Th: P = nRT/V
  {
    const pts = [];
    const Vstart = st.V1, Vend = st.V2;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const T = st.T1;
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 2->3 isentropic (adiabatic): T*V^(gamma-1)=const
  {
    const pts = [];
    const Vstart = st.V2, Vend = st.V3;
    const C = st.T2 * Math.pow(st.V2, p.gamma - 1);
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const T = C / Math.pow(V, p.gamma - 1);
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 3->4 isothermal at Tc: compression
  {
    const pts = [];
    const Vstart = st.V3, Vend = st.V4;
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const T = st.T3;
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  // 4->1 isentropic back to Th
  {
    const pts = [];
    const Vstart = st.V4, Vend = st.V1;
    const C = st.T4 * Math.pow(st.V4, p.gamma - 1);
    for(let i=0;i<=N;i++){
      const t = i/N;
      const V = Vstart + (Vend - Vstart)*t;
      const T = C / Math.pow(V, p.gamma - 1);
      const P = (p.n*R*T)/V;
      pts.push({P,V,T});
    }
    segs.push({pts});
  }

  return segs;
}

// -------------- curve points + Wnet --------------
function computeCurvePoints(cycle, p){
  const props = gasProps(p.gamma);
  const ref = {T1: cycle.states[0].T, V1: cycle.states[0].V};

  const path = [];
  cycle.segments.forEach(seg=>{
    seg.pts.forEach(pt=>{
      const s = sRelPerMol(pt.T, pt.V, ref, props);
      path.push({...pt, s});
    });
  });
  return path;
}

function computeWnetFromPV(path){
  let W = 0;
  for(let i=1;i<path.length;i++){
    const Pavg = 0.5*(path[i-1].P + path[i].P);
    const dV = path[i].V - path[i-1].V;
    W += Pavg * dV;
  }
  return W;
}

function bounds(arr, key){
  let mn = Infinity, mx = -Infinity;
  for(const o of arr){
    const v = o[key];
    if(v < mn) mn = v;
    if(v > mx) mx = v;
  }
  if(!isFinite(mn) || !isFinite(mx)) return {mn:0,mx:1};
  if(mn === mx){ mn *= 0.9; mx *= 1.1; }
  return {mn,mx};
}

function drawAxes(ctx, W, H, pad, xLabel, yLabel){
  ctx.save();
  ctx.clearRect(0,0,W,H);

  ctx.strokeStyle = "rgba(14,22,38,.08)";
  for(let i=1;i<=4;i++){
    const x = pad + (W-2*pad)*(i/5);
    const y = pad + (H-2*pad)*(i/5);
    ctx.beginPath(); ctx.moveTo(x,pad); ctx.lineTo(x,H-pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
  }

  ctx.strokeStyle = "rgba(14,22,38,.22)";
  ctx.beginPath(); ctx.moveTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, H-pad); ctx.lineTo(pad, pad); ctx.stroke();

  ctx.fillStyle = "rgba(14,22,38,.75)";
  ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText(xLabel, W-pad-40, H-pad+18);
  ctx.save();
  ctx.translate(pad-28, pad+18);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  ctx.restore();
}

function drawPath(ctx, W, H, pad, path, xKey, yKey, stroke, fill, showStates, states){
  const xb = bounds(path, xKey);
  const yb = bounds(path, yKey);
  const xMap = v => pad + (v - xb.mn) / (xb.mx - xb.mn) * (W - 2*pad);
  const yMap = v => (H - pad) - (v - yb.mn) / (yb.mx - yb.mn) * (H - 2*pad);

  ctx.save();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;

  ctx.beginPath();
  for(let i=0;i<path.length;i++){
    const x = xMap(path[i][xKey]);
    const y = yMap(path[i][yKey]);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.globalAlpha = 0.12; ctx.fill();
  ctx.globalAlpha = 1; ctx.stroke();

  if(showStates && states?.length){
    ctx.fillStyle = stroke;
    ctx.globalAlpha = 0.95;
    ctx.font = "12px ui-sans-serif, system-ui";
    states.forEach((st, idx)=>{
      const x = xMap(st[xKey]);
      const y = yMap(st[yKey]);
      ctx.beginPath(); ctx.arc(x,y,4.2,0,Math.PI*2); ctx.fill();
      ctx.fillText(String(idx+1), x+6, y-6);
    });
  }

  ctx.restore();
  return {xMap,yMap};
}

function updateStateTable(states, p){
  const props = gasProps(p.gamma);
  const ref = {T1: states[0].T, V1: states[0].V};

  els.statesBody.innerHTML = "";
  states.forEach(st=>{
    const s = sRelPerMol(st.T, st.V, ref, props);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${st.id}</b></td>
      <td>${fmtBar(st.P)}</td>
      <td>${fmtL(st.V)}</td>
      <td>${fmt(st.T,0)}</td>
      <td>${fmt(s,2)}</td>
    `;
    els.statesBody.appendChild(tr);
  });
}

function palette(cycleKey){
  if(cycleKey === "otto")   return {stroke:"rgba(255,59,48,.95)", fill:"rgba(255,59,48,.35)"};
  if(cycleKey === "diesel") return {stroke:"rgba(42,127,255,.95)", fill:"rgba(42,127,255,.35)"};
  return {stroke:"rgba(20,184,106,.95)", fill:"rgba(20,184,106,.35)"}; // carnot green
}

function paint(cycles, p){
  const pvCtx = els.pv.getContext("2d");
  const tsCtx = els.ts.getContext("2d");
  const W = els.pv.width, H = els.pv.height;
  const pad = 46;

  drawAxes(pvCtx, W, H, pad, simUI("charts.axisV", "V"), simUI("charts.axisP", "p"));
  drawAxes(tsCtx, W, H, pad, simUI("charts.axisS", "s"), simUI("charts.axisT", "T"));

  const showStates = els.showStates.checked;
  const draws = [];

  cycles.forEach(cy=>{
    const path = computeCurvePoints(cy, p);
    const col = palette(cy.key);

    const pvMaps = drawPath(pvCtx, W, H, pad, path, "V", "P", col.stroke, col.fill, showStates, cy.states);
    const tsMaps = drawPath(tsCtx, W, H, pad, path, "s", "T", col.stroke, col.fill, showStates, cy.states);

    draws.push({cy, path, pvMaps, tsMaps, stroke: col.stroke});
  });

  // animated tracer only if single cycle mode
  if (els.animate.checked && mode !== "compare" && draws[0]){
    const d = draws[0];
    const idx = Math.floor(animT * (d.path.length - 1));
    const pt = d.path[clamp(idx,0,d.path.length-1)];

    pvCtx.save();
    pvCtx.fillStyle = d.stroke;
    pvCtx.beginPath();
    pvCtx.arc(d.pvMaps.xMap(pt.V), d.pvMaps.yMap(pt.P), 5.5, 0, Math.PI*2);
    pvCtx.fill();
    pvCtx.restore();

    tsCtx.save();
    tsCtx.fillStyle = d.stroke;
    tsCtx.beginPath();
    tsCtx.arc(d.tsMaps.xMap(pt.s), d.tsMaps.yMap(pt.T), 5.5, 0, Math.PI*2);
    tsCtx.fill();
    tsCtx.restore();

    els.stateNow.textContent = simUI("hud.segment", "segment");
    els.pNow.textContent = fmtBar(pt.P);
    els.vNow.textContent = fmtL(pt.V);
    els.tNow.textContent = fmt(pt.T,0);
  } else {
    els.stateNow.textContent = "—";
    els.pNow.textContent = "—";
    els.vNow.textContent = "—";
    els.tNow.textContent = "—";
  }
}

function updateResultsSingle(cycle, p, path){
  const Wnum = computeWnetFromPV(path);
  const V1 = cycle.states[0].V;
  const V2 = cycle.states[1].V;
  const imepPa = Wnum / (V1 - V2);

  els.eta.textContent = `${fmt(cycle.eta*100, 1)}%`;
  els.etaHint.textContent =
    cycle.key === "otto"
      ? simUI("hints.etaOtto", "ideal Otto ≈ 1 − 1/r^(γ−1)")
      : cycle.key === "diesel"
        ? simUI("hints.etaDiesel", "ideal Diesel depinde de r și cutoff ρ")
        : simUI("hints.etaCarnot", "Carnot ideal: η = 1 − T𝒸/Tₕ");

  els.wnet.textContent = `${fmt(Wnum, 0)} J`;
  els.qin.textContent  = `${fmt(cycle.Qin, 0)} J`;
  els.imep.textContent = `${fmt(imepPa/1e5, 2)} bar`;

  updateStateTable(cycle.states, p);
}

function buildCycleByKey(key, p){
  if(key === "otto") return makeOtto(p);
  if(key === "diesel") return makeDiesel(p);
  return makeCarnot(p);
}

function recalc(){
  const p = readParams();
  updateOutputs(p);

  // Basic sanity
  if (p.gamma <= 1.01){
    els.status.textContent = simUI("errors.gamma", "γ invalid");
    return;
  }
  if (p.r <= 1.01){
    els.status.textContent = simUI("errors.r", "r prea mic");
    return;
  }

  // show correct sub-controls for single modes
  if(mode === "otto"){
    els.ottoControls.classList.remove("hidden");
    els.dieselControls.classList.add("hidden");
  } else if(mode === "diesel"){
    els.ottoControls.classList.add("hidden");
    els.dieselControls.classList.remove("hidden");
  }

  if(mode === "otto"){
    const cy = makeOtto(p);
    const path = computeCurvePoints(cy, p);
    paint([cy], p);
    updateResultsSingle(cy, p, path);
    els.status.textContent = modeStatusLabel("otto");
    return;
  }

  if(mode === "diesel"){
    const cy = makeDiesel(p);
    const path = computeCurvePoints(cy, p);
    paint([cy], p);
    updateResultsSingle(cy, p, path);
    els.status.textContent = modeStatusLabel("diesel");
    return;
  }

  if(mode === "carnot"){
    // ensure Th > Tc
    if(p.Th <= p.Tc + 5){
      els.status.textContent = simUI("errors.carnotTemps", "Setează Tₕ > T𝒸");
      return;
    }
    const cy = makeCarnot(p);
    const path = computeCurvePoints(cy, p);
    paint([cy], p);
    updateResultsSingle(cy, p, path);
    els.status.textContent = modeStatusLabel("carnot");
    return;
  }

  // COMPARE MODE
  const A = els.cmpA.value;
  const B = els.cmpB.value;

  // prevent same selection (if same, auto-bump B)
  if(A === B){
    const order = ["otto","diesel","carnot"];
    const next = order[(order.indexOf(B)+1)%order.length];
    els.cmpB.value = next;
  }

  const cycles = [];
  const aCycle = buildCycleByKey(els.cmpA.value, p);
  const bCycle = buildCycleByKey(els.cmpB.value, p);
  cycles.push(aCycle, bCycle);

  if(els.cmpAll.checked){
    const all = ["otto","diesel","carnot"];
    all.forEach(k=>{
      if(k !== aCycle.key && k !== bCycle.key){
        cycles.push(buildCycleByKey(k, p));
      }
    });
  }

  paint(cycles, p);

  // summary: show pair (and third if enabled)
  const summaries = cycles.slice(0, els.cmpAll.checked ? 3 : 2).map(cy=>{
    const path = computeCurvePoints(cy, p);
    const W = computeWnetFromPV(path);
    const imep = W / (cy.states[0].V - cy.states[1].V);
    return {cy, W, imep};
  });

  const line = summaries.map(s => `${s.cy.name} η ${fmt(s.cy.eta*100,1)}%`).join(" • ");
  els.status.textContent = line;

  els.eta.textContent = summaries.map(s => `${s.cy.name} ${fmt(s.cy.eta*100,1)}%`).join(" | ");
  els.etaHint.textContent = simUI("compare.pick", "selectează ce compari");

  els.wnet.textContent = summaries.map(s => `${s.cy.name} ${fmt(s.W,0)} J`).join(" | ");
  els.qin.textContent = summaries.map(s => `${s.cy.name} ${fmt(s.cy.Qin,0)} J`).join(" | ");
  els.imep.textContent = summaries.map(s => `${s.cy.name} ${fmt(s.imep/1e5,2)} bar`).join(" | ");

  // table: show A states
  updateStateTable(aCycle.states, p);
}

// animation loop
function tick(){
  if (els.animate.checked){
    animT += 0.006;
    if (animT > 1) animT -= 1;

    const p = readParams();
    if(mode === "compare"){
      const A = els.cmpA.value;
      const B = els.cmpB.value;
      const cycles = [buildCycleByKey(A,p), buildCycleByKey(B,p)];
      if(els.cmpAll.checked){
        ["otto","diesel","carnot"].forEach(k=>{
          if(k !== cycles[0].key && k !== cycles[1].key) cycles.push(buildCycleByKey(k,p));
        });
      }
      paint(cycles, p);
    } else {
      const cy = buildCycleByKey(mode, p);
      paint([cy], p);
    }
  }
  requestAnimationFrame(tick);
}

// wiring
[
  els.p1, els.t1, els.v1, els.r, els.gamma, els.n,
  els.t3, els.rho, els.res,
  els.th, els.tc, els.alpha,
  els.showStates, els.animate,
  els.cmpA, els.cmpB, els.cmpAll
].forEach(el => el && el.addEventListener("input", recalc));

els.btnRecalc.addEventListener("click", recalc);

els.btnReset.addEventListener("click", () => {
  els.p1.value = "1.00";
  els.t1.value = "300";
  els.v1.value = "0.80";
  els.r.value = "10";
  els.gamma.value = "1.35";
  els.n.value = "0.05";
  els.t3.value = "2200";
  els.rho.value = "1.8";
  els.th.value = "1500";
  els.tc.value = "400";
  els.alpha.value = "2.2";
  els.res.value = "180";
  els.showStates.checked = true;
  els.animate.checked = true;

  els.cmpA.value = "otto";
  els.cmpB.value = "diesel";
  els.cmpAll.checked = false;

  setMode("otto");
});

els.btnOtto.addEventListener("click", ()=>setMode("otto"));
els.btnDiesel.addEventListener("click", ()=>setMode("diesel"));
els.btnCarnot.addEventListener("click", ()=>setMode("carnot"));
els.btnCompare.addEventListener("click", ()=>setMode("compare"));

setMode("otto");
tick();
