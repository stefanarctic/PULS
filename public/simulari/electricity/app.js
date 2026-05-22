(() => {
  const simT = (path, ro) =>
    typeof window.simLbl === 'function' ? window.simLbl(path, ro) : ro;
  function simTf(path, ro, vars = {}) {
    let s = simT(path, ro);
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  }

  // ============================================================
  // DOM
  // ============================================================
  const appRoot = document.querySelector('.app');
  const panel = document.querySelector('.panel');
  const togglePanelBtn = document.getElementById('togglePanel');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const flashEl = document.getElementById('flash');
  const tipEl = document.getElementById('tip');

  const toolLabel = document.getElementById('toolLabel');
  const pickHint = document.getElementById('pickHint');
  const statusEl = document.getElementById('status');

  const selInfo = document.getElementById('selInfo');
  const deleteBtn = document.getElementById('deleteBtn');

  const propBox = document.getElementById('propBox');
  const propLabel = document.getElementById('propLabel');
  const propValue = document.getElementById('propValue');
  const propHelp = document.getElementById('propHelp');

  const mItot = document.getElementById('mItot');
  const mVsrc = document.getElementById('mVsrc');
  const mPtot = document.getElementById('mPtot');
  const mReq = document.getElementById('mReq');
  const branchList = document.getElementById('branchList');
  const eduPanel = document.getElementById('eduPanel');
  const challengeList = document.getElementById('challengeList');
  const resetViewBtn = document.getElementById('resetViewBtn');

  // ============================================================
  // State
  // ============================================================
  let nodes = [];
  let elements = [];
  let probes = [];

  let nextNodeId = 1;
  let nextElemId = 1;
  let nextProbeId = 1;

  const Tools = {
    SELECT: 'SELECT', NODE: 'NODE', GND: 'GND', WIRE: 'WIRE',
    R: 'R', RH: 'RH', BAT: 'BAT', A: 'A', V: 'V'
  };
  let tool = Tools.SELECT;

  let pickedNode = null;
  let selected = null;
  let draggingNodeId = null;
  let dragOffset = { x: 0, y: 0 };

  let lastSolution = null;
  let simMode = 'schematic'; // 'schematic' | 'electron' | 'heat'

  // animation
  let particles = new Map(); // elemId -> [{t}]
  let nodePulses = new Map(); // nodeId -> timestamp
  let lastFrame = performance.now();
  let now = lastFrame;
  let mouse = { x: 0, y: 0, in: false };
  let parallax = { x: 0, y: 0 };

  // results animation
  const animatedMetrics = {
    Itot: { cur: 0, target: 0 },
    Vsrc: { cur: 0, target: 0 },
    Ptot: { cur: 0, target: 0 },
    Req:  { cur: 0, target: 0 }
  };

  // ============================================================
  // Tooltips
  // ============================================================
  function buildTips() {
    return {
      'tool-select': {
        title: simT('tips.toolSelect.title', 'Selectare'),
        desc: simT('tips.toolSelect.desc', 'Selectează / trage nodurile. Click pe element pentru editare.')
      },
      'tool-node': {
        title: simT('tips.toolNode.title', 'Nod'),
        desc: simT('tips.toolNode.desc', 'Punct de joncțiune. Click pe canvas pentru a-l adăuga.')
      },
      'tool-gnd': {
        title: simT('tips.toolGnd.title', 'Masă (GND)'),
        desc: simT('tips.toolGnd.desc', 'Nod de referință. Fără GND nu există potențial absolut.')
      },
      'tool-wire': {
        title: simT('tips.toolWire.title', 'Fir'),
        desc: simT('tips.toolWire.desc', 'Fir ideală (R ≈ 0). Click pe 2 noduri pentru a conecta.')
      },
      'tool-r': {
        title: simT('tips.toolR.title', 'Rezistor'),
        desc: simT('tips.toolR.desc', 'Element pasiv rezistiv. Disipă energie sub formă de căldură.'),
        form: 'U = R · I'
      },
      'tool-rh': {
        title: simT('tips.toolRh.title', 'Reostat'),
        desc: simT('tips.toolRh.desc', 'Rezistență variabilă pentru controlul curentului.'),
        form: 'R = 0 … Rmax'
      },
      'tool-bat': {
        title: simT('tips.toolBat.title', 'Sursă'),
        desc: simT('tips.toolBat.desc', 'Sursă ideală de tensiune. Primul nod = +, al doilea = −.'),
        form: 'Vs = constant'
      },
      'tool-a': {
        title: simT('tips.toolA.title', 'Ampermetru'),
        desc: simT('tips.toolA.desc', 'Măsoară intensitatea curentului. Se conectează în serie (R ≈ 0).'),
        form: 'I = ΔQ / Δt'
      },
      'tool-v': {
        title: simT('tips.toolV.title', 'Voltmetru'),
        desc: simT('tips.toolV.desc', 'Măsoară diferența de potențial. Probă (nu intră în circuit).'),
        form: 'U = V(a) − V(b)'
      },
      'action-solve': {
        title: simT('tips.actionSolve.title', 'Rezolvă'),
        desc: simT('tips.actionSolve.desc', 'Rezolvă circuitul (Kirchhoff + Ohm). Trebuie un nod GND.')
      },
      'action-demo': {
        title: simT('tips.actionDemo.title', 'Demo'),
        desc: simT('tips.actionDemo.desc', 'Încarcă un circuit demonstrativ.')
      },
      'action-clear': {
        title: simT('tips.actionClear.title', 'Curăță'),
        desc: simT('tips.actionClear.desc', 'Șterge tot.')
      },
      'action-fit': {
        title: simT('tips.actionFit.title', 'Încadrează'),
        desc: simT('tips.actionFit.desc', 'Recentrează circuitul în canvas.')
      },
      'mode-schematic': {
        title: simT('tips.modeSchematic.title', 'Mod schemă'),
        desc: simT('tips.modeSchematic.desc', 'Vedere clasică de schemă, cu simboluri standard.')
      },
      'mode-electron': {
        title: simT('tips.modeElectron.title', 'Mod flux de electroni'),
        desc: simT('tips.modeElectron.desc', 'Vizualizează particulele care curg prin fire.'),
        form: 'v ∝ |I|'
      },
      'mode-heat': {
        title: simT('tips.modeHeat.title', 'Mod hartă termică'),
        desc: simT('tips.modeHeat.desc', 'Colorează firele după puterea disipată.'),
        form: 'P = R · I²'
      },
      'metric-i': {
        title: simT('tips.metricI.title', 'Curent total'),
        desc: simT('tips.metricI.desc', 'Intensitatea totală debitată de sursă.'),
        form: 'I = V / R'
      },
      'metric-v': {
        title: simT('tips.metricV.title', 'Tens. sursă'),
        desc: simT('tips.metricV.desc', 'Tensiunea electromotoare a sursei principale.')
      },
      'metric-p': {
        title: simT('tips.metricP.title', 'Putere'),
        desc: simT('tips.metricP.desc', 'Puterea totală disipată în circuit.'),
        form: 'P = V · I'
      },
      'metric-r': {
        title: simT('tips.metricR.title', 'R echivalent'),
        desc: simT('tips.metricR.desc', 'Rezistența echivalentă văzută de sursă.'),
        form: 'R = V / I'
      }
    };
  }

  function emptyBranchesHtml() {
    return `<div class="empty">${simT('empty.branches', 'Apasă Rezolvă ca să vezi curenții pe ramuri.')}</div>`;
  }
  function emptyEduHtml() {
    return `<div class="empty">${simT('empty.edu', 'Apasă Rezolvă pentru pas-cu-pas (Kirchhoff & Ohm).')}</div>`;
  }

  function setCanvasHint() {
    const el = document.getElementById('canvasHint');
    if (!el) return;
    el.innerHTML = simT(
      'hints.canvas',
      '<b>Click pe canvas</b> ca să pui noduri (în instrumentul Nod). Pentru componente: click pe 2 noduri. În <span class="mono">Selectare</span> poți trage nodurile. Voltmetrul este probă (nu intră în circuit).'
    );
  }

  function showTip(e, data) {
    if (!data) return;
    tipEl.innerHTML =
      `<div class="ttitle">${data.title}</div>` +
      `<div class="tdesc">${data.desc}</div>` +
      (data.form ? `<span class="tform">${data.form}</span>` : '');
    tipEl.classList.add('show');
    moveTip(e);
  }
  function moveTip(e) {
    if (!tipEl.classList.contains('show')) return;
    const margin = 12;
    const w = tipEl.offsetWidth || 220;
    const h = tipEl.offsetHeight || 60;
    let x = e.clientX + 14;
    let y = e.clientY + 14;
    if (x + w + margin > window.innerWidth) x = e.clientX - w - 14;
    if (y + h + margin > window.innerHeight) y = e.clientY - h - 14;
    tipEl.style.left = x + 'px';
    tipEl.style.top  = y + 'px';
  }
  function hideTip() { tipEl.classList.remove('show'); }

  function attachTooltips() {
    const tips = buildTips();
    document.querySelectorAll('[data-tip-id]').forEach(el => {
      el.addEventListener('mouseenter', e => showTip(e, tips[el.dataset.tipId]));
      el.addEventListener('mousemove', moveTip);
      el.addEventListener('mouseleave', hideTip);
    });
  }

  function toolDisplayName(t) {
    const map = {
      SELECT: simT('tools.select', 'Selectare'),
      NODE: simT('tools.node', 'Nod'),
      GND: 'GND',
      WIRE: simT('tools.wire', 'Fir'),
      R: simT('tools.resistor', 'Rezistor'),
      RH: simT('tools.rheostat', 'Reostat'),
      BAT: simT('tools.source', 'Sursă'),
      A: simT('tools.ammeter', 'Ampermetru'),
      V: simT('tools.voltmeter', 'Voltmetru')
    };
    return map[t] || t;
  }

  function elemTypeName(type) {
    const map = {
      R: simT('tools.resistor', 'Rezistor'),
      RH: simT('tools.rheostat', 'Reostat'),
      BAT: simT('tools.source', 'Sursă'),
      WIRE: simT('tools.wire', 'Fir'),
      A: simT('tools.ammeter', 'Ampermetru')
    };
    return map[type] || type;
  }

  // ============================================================
  // Utilities
  // ============================================================
  function isMobileViewport() { return window.matchMedia('(max-width: 1024px)').matches; }
  function applyPanelResponsiveState() {
    if (!appRoot || !panel || !togglePanelBtn) return;
    appRoot.classList.toggle('panel-open', !isMobileViewport());
    togglePanelBtn.textContent = '\u2630';
  }
  function setStatus(text, kind = 'ok') {
    statusEl.textContent = text;
    statusEl.classList.toggle('ok', kind === 'ok');
    statusEl.classList.toggle('warn', kind === 'warn');
  }
  function fmt(x, unit = '') {
    if (!Number.isFinite(x)) return '— ' + unit;
    const ax = Math.abs(x);
    let s;
    if (ax >= 1e6) s = (x / 1e6).toFixed(2) + ' M';
    else if (ax >= 1e3) s = (x / 1e3).toFixed(2) + ' k';
    else if (ax >= 1) s = x.toFixed(2);
    else if (ax >= 1e-3) s = x.toFixed(3);
    else if (ax === 0) s = '0';
    else s = x.toExponential(2);
    return (s + (unit ? ' ' + unit : '')).trim();
  }
  function fmtNum(x) {
    if (!Number.isFinite(x)) return '—';
    const ax = Math.abs(x);
    if (ax >= 1e6) return (x / 1e6).toFixed(2) + 'M';
    if (ax >= 1e3) return (x / 1e3).toFixed(2) + 'k';
    if (ax >= 1) return x.toFixed(2);
    return x.toFixed(3);
  }
  function fit() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mousePos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function distPointToSegment(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - ax, py - ay);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - bx, py - by);
    const t = c1 / c2;
    const sx = ax + t * vx, sy = ay + t * vy;
    return Math.hypot(px - sx, py - sy);
  }
  function projectPointOnSegment(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const c2 = vx * vx + vy * vy;
    if (c2 < 1e-9) return { x: ax, y: ay, t: 0 };
    let t = (vx * wx + vy * wy) / c2;
    t = Math.max(0, Math.min(1, t));
    return { x: ax + t * vx, y: ay + t * vy, t };
  }
  function findNodeNear(p, radius = 14) {
    let best = null, bd = radius;
    for (const n of nodes) {
      const d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  function findElementNear(p, radius = 10) {
    let best = null, bd = radius;
    for (const e of elements) {
      const a = nodes.find(n => n.id === e.a);
      const b = nodes.find(n => n.id === e.b);
      if (!a || !b) continue;
      const d = distPointToSegment(p.x, p.y, a.x, a.y, b.x, b.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function findProbeNear(p, radius = 12) {
    let best = null, bd = radius;
    for (const pr of probes) {
      const a = nodes.find(n => n.id === pr.a);
      const b = nodes.find(n => n.id === pr.b);
      if (!a || !b) continue;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const d = Math.hypot(mx - p.x, my - p.y);
      if (d < bd) { bd = d; best = pr; }
    }
    return best;
  }
  function findWireNear(p, radius = 10) {
    let best = null, bd = radius, bestProj = null;
    for (const e of elements) {
      if (e.type !== 'WIRE') continue;
      const a = nodes.find(n => n.id === e.a);
      const b = nodes.find(n => n.id === e.b);
      if (!a || !b) continue;
      const proj = projectPointOnSegment(p.x, p.y, a.x, a.y, b.x, b.y);
      const d = Math.hypot(p.x - proj.x, p.y - proj.y);
      if (d < bd) { bd = d; best = e; bestProj = proj; }
    }
    if (!best) return null;
    return { wire: best, proj: bestProj };
  }
  function splitWireAt(wire, proj) {
    if (proj.t < 0.08 || proj.t > 0.92) return null;
    const newNode = { id: nextNodeId++, x: proj.x, y: proj.y, isGnd: false };
    nodes.push(newNode);
    elements = elements.filter(e => e.id !== wire.id);
    elements.push({ id: nextElemId++, type: 'WIRE', a: wire.a, b: newNode.id, value: 0.01 });
    elements.push({ id: nextElemId++, type: 'WIRE', a: newNode.id, b: wire.b, value: 0.01 });
    return newNode.id;
  }
  function pulseNode(id) { nodePulses.set(id, performance.now()); }
  function triggerFlash(x, y) {
    const r = canvas.getBoundingClientRect();
    const wrap = canvas.parentElement;
    const wr = wrap.getBoundingClientRect();
    const px = ((x + r.left - wr.left) / wr.width) * 100;
    const py = ((y + r.top - wr.top) / wr.height) * 100;
    flashEl.style.setProperty('--fx', px + '%');
    flashEl.style.setProperty('--fy', py + '%');
    flashEl.classList.remove('on');
    void flashEl.offsetWidth;
    flashEl.classList.add('on');
  }

  function setTool(t) {
    tool = t;
    toolLabel.textContent = toolDisplayName(t);

    const map = {
      toolSelect: Tools.SELECT, toolNode: Tools.NODE, toolGnd: Tools.GND, toolWire: Tools.WIRE,
      toolR: Tools.R, toolRh: Tools.RH, toolBat: Tools.BAT, toolA: Tools.A, toolV: Tools.V
    };
    for (const [id, val] of Object.entries(map)) {
      document.getElementById(id).classList.toggle('active', tool === val);
    }
    pickedNode = null;
    pickHint.textContent = '—';
  }

  function setSimMode(m) {
    simMode = m;
    document.querySelectorAll('.mode-pill').forEach(el => {
      el.classList.toggle('active', el.dataset.mode === m);
    });
    if (lastSolution) rebuildParticles();
  }

  function setSelected(obj) { selected = obj; updateSelectionUI(); }
  function clearSelected() { selected = null; updateSelectionUI(); }

  function updateSelectionUI() {
    if (!selected) {
      selInfo.textContent = '—';
      propBox.hidden = true;
      return;
    }
    if (selected.kind === 'node') {
      const n = nodes.find(x => x.id === selected.id);
      selInfo.textContent = n ? `N${n.id}${n.isGnd ? ' (GND)' : ''}` : '—';
      propBox.hidden = true;
      return;
    }
    if (selected.kind === 'probe') {
      const pr = probes.find(x => x.id === selected.id);
      selInfo.textContent = pr
        ? simTf('selection.voltmeter', 'Voltmetru P{id} (N{a} ↔ N{b})', { id: pr.id, a: pr.a, b: pr.b })
        : '—';
      propBox.hidden = true;
      return;
    }
    if (selected.kind === 'elem') {
      const e = elements.find(x => x.id === selected.id);
      if (!e) { selInfo.textContent = '—'; propBox.hidden = true; return; }
      const name = elemTypeName(e.type);
      selInfo.textContent = simTf('selection.elem', '{name} E{id} (N{a} ↔ N{b})', {
        name, id: e.id, a: e.a, b: e.b
      });
      if (e.type === 'R' || e.type === 'RH' || e.type === 'BAT') {
        propBox.hidden = false;
        if (e.type === 'BAT') {
          propLabel.textContent = simT('props.voltageLabel', 'Tensiune Vs (V)');
          propHelp.textContent = simT('props.sourceHelp', 'Sursa: primul nod = +, al doilea = −.');
          propValue.step = '0.1';
          propValue.value = String(e.value ?? 9);
        } else {
          propLabel.textContent = simT('props.resistanceLabel', 'Rezistență R (Ω)');
          propHelp.textContent = (e.type === 'RH')
            ? simT('props.rheostatHelp', 'Reostat: valoarea reprezintă Rmax.')
            : simT('props.resistorHelp', 'Rezistor fix.');
          propValue.step = '1';
          propValue.value = String(e.value ?? 100);
        }
      } else {
        propBox.hidden = true;
      }
    }
  }

  function setPickHint() {
    pickHint.textContent = pickedNode
      ? simTf('hints.pickSecond', 'Selectat N{n}, alege al doilea nod…', { n: pickedNode })
      : '—';
  }

  function connectElement(type, aId, bId) {
    if (aId === bId) return;
    if (type === 'WIRE') {
      elements.push({ id: nextElemId++, type: 'WIRE', a: aId, b: bId, value: 0.01 });
      setStatus(simTf('status.wireConnected', 'Fir între N{a} și N{b}.', { a: aId, b: bId }), 'ok');
    } else if (type === 'A') {
      elements.push({ id: nextElemId++, type: 'A', a: aId, b: bId, value: 1e-6 });
      setStatus(simTf('status.ammeterConnected', 'Ampermetru între N{a} și N{b}.', { a: aId, b: bId }), 'ok');
    } else if (type === 'R') {
      elements.push({ id: nextElemId++, type: 'R', a: aId, b: bId, value: 100 });
      setStatus(simTf('status.resistorConnected', 'Rezistor între N{a} și N{b} (selectează ca să-i setezi valoarea).', { a: aId, b: bId }), 'ok');
    } else if (type === 'RH') {
      elements.push({ id: nextElemId++, type: 'RH', a: aId, b: bId, value: 500 });
      setStatus(simTf('status.rheostatConnected', 'Reostat între N{a} și N{b}.', { a: aId, b: bId }), 'ok');
    } else if (type === 'BAT') {
      elements.push({ id: nextElemId++, type: 'BAT', a: aId, b: bId, value: 9 });
      setStatus(simTf('status.sourceConnected', 'Sursă 9V (+ la N{a}, − la N{b}).', { a: aId, b: bId }), 'ok');
    }
    pulseNode(aId); pulseNode(bId);
    const a = nodes.find(n => n.id === aId);
    const b = nodes.find(n => n.id === bId);
    if (a && b) triggerFlash((a.x + b.x) / 2, (a.y + b.y) / 2);
  }
  function addProbe(aId, bId) {
    if (aId === bId) return;
    probes.push({ id: nextProbeId++, a: aId, b: bId });
    setStatus(simTf('status.voltmeterConnected', 'Voltmetru între N{a} și N{b}.', { a: aId, b: bId }), 'ok');
    pulseNode(aId); pulseNode(bId);
    const a = nodes.find(n => n.id === aId);
    const b = nodes.find(n => n.id === bId);
    if (a && b) triggerFlash((a.x + b.x) / 2, (a.y + b.y) / 2);
  }

  // ============================================================
  // Wire-up: buttons
  // ============================================================
  document.getElementById('toolSelect').onclick = () => setTool(Tools.SELECT);
  document.getElementById('toolNode').onclick   = () => setTool(Tools.NODE);
  document.getElementById('toolGnd').onclick    = () => setTool(Tools.GND);
  document.getElementById('toolWire').onclick   = () => setTool(Tools.WIRE);
  document.getElementById('toolR').onclick      = () => setTool(Tools.R);
  document.getElementById('toolRh').onclick     = () => setTool(Tools.RH);
  document.getElementById('toolBat').onclick    = () => setTool(Tools.BAT);
  document.getElementById('toolA').onclick      = () => setTool(Tools.A);
  document.getElementById('toolV').onclick      = () => setTool(Tools.V);

  document.querySelectorAll('.mode-pill').forEach(el => {
    el.addEventListener('click', () => setSimMode(el.dataset.mode));
  });

  resetViewBtn.onclick = () => { fitToContent(); };

  document.getElementById('clearBtn').onclick = () => {
    nodes = []; elements = []; probes = [];
    nextNodeId = 1; nextElemId = 1; nextProbeId = 1;
    pickedNode = null; lastSolution = null;
    particles.clear();
    resetMetrics();
    branchList.innerHTML = emptyBranchesHtml();
    eduPanel.innerHTML = emptyEduHtml();
    clearSelected();
    setStatus(simT('status.cleared', 'Curățat. Pune noduri + GND + componente.'), 'ok');
  };

  document.getElementById('demoBtn').onclick = () => {
    nodes = [
      { id: 1, x: 240, y: 260, isGnd: false },
      { id: 2, x: 480, y: 260, isGnd: true  },
      { id: 3, x: 760, y: 160, isGnd: false },
      { id: 4, x: 760, y: 360, isGnd: false },
      { id: 5, x: 600, y: 260, isGnd: false },
      { id: 6, x: 900, y: 260, isGnd: false }
    ];
    nextNodeId = 7;
    elements = [
      { id: 1, type: 'BAT',  a: 1, b: 2, value: 9 },
      { id: 2, type: 'WIRE', a: 1, b: 5, value: 0.01 },
      { id: 3, type: 'R',    a: 5, b: 3, value: 100 },
      { id: 4, type: 'R',    a: 5, b: 4, value: 100 },
      { id: 5, type: 'RH',   a: 4, b: 2, value: 500 },
      { id: 6, type: 'A',    a: 3, b: 6, value: 1e-6 },
      { id: 7, type: 'WIRE', a: 6, b: 2, value: 0.01 }
    ];
    nextElemId = 8;
    probes = [
      { id: 1, a: 1, b: 2 },
      { id: 2, a: 5, b: 2 }
    ];
    nextProbeId = 3;
    lastSolution = null;
    particles.clear();
    resetMetrics();
    clearSelected();
    setStatus(simT('status.demoLoaded', 'Demo încărcat. Apasă Rezolvă.'), 'ok');
  };

  document.getElementById('solveBtn').onclick = () => {
    try {
      lastSolution = solveCircuit();
      if (lastSolution) {
        updateMetricsTargets();
        renderBranchList();
        renderEducation();
        rebuildParticles();
      }
    } catch (err) {
      console.error(err);
      setStatus(simT('status.solveError', 'Eroare la Rezolvă (vezi consola).'), 'warn');
    }
  };

  deleteBtn.onclick = () => {
    if (!selected) return;
    if (selected.kind === 'node') {
      const nid = selected.id;
      elements = elements.filter(e => e.a !== nid && e.b !== nid);
      probes = probes.filter(p => p.a !== nid && p.b !== nid);
      nodes = nodes.filter(n => n.id !== nid);
    } else if (selected.kind === 'elem') {
      elements = elements.filter(e => e.id !== selected.id);
      particles.delete(selected.id);
    } else if (selected.kind === 'probe') {
      probes = probes.filter(p => p.id !== selected.id);
    }
    lastSolution = null;
    resetMetrics();
    clearSelected();
    setStatus(simT('status.deleted', 'Șters.'), 'ok');
  };

  propValue.addEventListener('input', () => {
    if (!selected || selected.kind !== 'elem') return;
    const e = elements.find(x => x.id === selected.id);
    if (!e) return;
    const v = Number(propValue.value);
    if (!Number.isFinite(v)) return;
    if (e.type === 'R' || e.type === 'RH') e.value = Math.max(0.0001, v);
    if (e.type === 'BAT') e.value = v;
    lastSolution = null;
    setStatus(simT('status.valueChanged', 'Valoare modificată. Apasă Rezolvă.'), 'ok');
  });

  // ============================================================
  // Canvas interaction
  // ============================================================
  canvas.addEventListener('mousemove', (e) => {
    const p = mousePos(e);
    mouse.x = p.x; mouse.y = p.y; mouse.in = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.in = false; });

  canvas.addEventListener('mousedown', (e) => {
    const p = mousePos(e);
    if (tool !== Tools.SELECT) return;

    const hitNode = findNodeNear(p, 14);
    if (hitNode) {
      draggingNodeId = hitNode.id;
      dragOffset.x = hitNode.x - p.x;
      dragOffset.y = hitNode.y - p.y;
      setSelected({ kind: 'node', id: hitNode.id });
      return;
    }
    const hitProbe = findProbeNear(p, 14);
    if (hitProbe) { setSelected({ kind: 'probe', id: hitProbe.id }); return; }

    const hitElem = findElementNear(p, 10);
    if (hitElem) { setSelected({ kind: 'elem', id: hitElem.id }); return; }
    clearSelected();
  });
  window.addEventListener('mousemove', (e) => {
    if (!draggingNodeId) return;
    const p = mousePos(e);
    const n = nodes.find(x => x.id === draggingNodeId);
    if (!n) return;
    n.x = p.x + dragOffset.x;
    n.y = p.y + dragOffset.y;
    lastSolution = null;
  });
  window.addEventListener('mouseup', () => { draggingNodeId = null; });

  canvas.addEventListener('click', (e) => {
    const p = mousePos(e);
    if (tool === Tools.SELECT) return;

    if (tool === Tools.NODE) {
      if (findNodeNear(p, 14)) return;
      const newId = nextNodeId++;
      nodes.push({ id: newId, x: p.x, y: p.y, isGnd: false });
      pulseNode(newId);
      triggerFlash(p.x, p.y);
      setStatus(simTf('status.nodeAdded', 'Nod N{n} adăugat.', { n: newId }), 'ok');
      return;
    }
    if (tool === Tools.GND) {
      const hit = findNodeNear(p, 14);
      if (!hit) { setStatus(simT('status.clickNodeForGnd', 'Click pe un nod ca să-l setezi GND.'), 'warn'); return; }
      for (const n of nodes) n.isGnd = false;
      hit.isGnd = true;
      pulseNode(hit.id);
      lastSolution = null;
      setStatus(simTf('status.gndSet', 'GND setat pe N{n}.', { n: hit.id }), 'ok');
      return;
    }

    let hit = findNodeNear(p, 14);
    if (!hit) {
      const w = findWireNear(p, 10);
      if (w) {
        const newId = splitWireAt(w.wire, w.proj);
        if (newId) {
          hit = nodes.find(n => n.id === newId);
          pulseNode(newId);
          triggerFlash(p.x, p.y);
          setStatus(simTf('status.nodeOnWire', 'Nod N{n} creat pe Fir.', { n: newId }), 'ok');
        }
      }
    }
    if (!hit) { setStatus(simT('status.clickNodeOrWire', 'Click pe un nod (sau pe o Fir ca să creez nod).'), 'warn'); return; }

    if (!pickedNode) {
      pickedNode = hit.id;
      pulseNode(hit.id);
      setPickHint();
      return;
    }
    const aId = pickedNode;
    const bId = hit.id;
    pickedNode = null;
    setPickHint();
    if (tool === Tools.V) addProbe(aId, bId);
    else connectElement(tool, aId, bId);
    lastSolution = null;
  });

  // ============================================================
  // Drawing
  // ============================================================
  function drawBackground() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // soft gradient
    const g = ctx.createRadialGradient(w * 0.25, h * 0.15, 0, w * 0.5, h * 0.5, Math.max(w, h));
    g.addColorStop(0, 'rgba(34,211,238,0.05)');
    g.addColorStop(0.5, 'rgba(139,92,246,0.025)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // parallax target
    if (mouse.in) {
      const tx = (mouse.x / w - 0.5) * 8;
      const ty = (mouse.y / h - 0.5) * 8;
      parallax.x += (tx - parallax.x) * 0.06;
      parallax.y += (ty - parallax.y) * 0.06;
    } else {
      parallax.x *= 0.95; parallax.y *= 0.95;
    }

    // grid (two layers for depth)
    drawGridLayer(48, 'rgba(94,234,212,0.05)', 1, parallax.x * 0.5, parallax.y * 0.5);
    drawGridLayer(12, 'rgba(94,234,212,0.04)', 1, parallax.x, parallax.y);
  }

  function drawGridLayer(step, color, lw, ox, oy) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    const x0 = -((step - (ox % step)) % step);
    const y0 = -((step - (oy % step)) % step);
    for (let x = x0; x < w + step; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = y0; y < h + step; y += step) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function roundRectScreen(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function labelBubble(x, y, text, color = '#e8f0ff', accent = false) {
    ctx.save();
    ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
    const tw = ctx.measureText(text).width;
    const padX = 8, padY = 5;
    const W = tw + padX * 2, H = 22;
    const bx = x - W / 2, by = y - H / 2;

    ctx.fillStyle = accent ? 'rgba(13,30,32,0.92)' : 'rgba(10,16,30,0.86)';
    ctx.strokeStyle = accent ? 'rgba(94,234,212,0.50)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.2;
    roundRectScreen(bx, by, W, H, 9);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, bx + padX, by + 14);
    ctx.restore();
  }

  function currentForElement(e) {
    if (!lastSolution || !lastSolution.elemResults) return 0;
    const r = lastSolution.elemResults.find(x => x.id === e.id);
    return r ? r.I : 0;
  }
  function powerForElement(e) {
    if (!lastSolution || !lastSolution.elemResults) return 0;
    const r = lastSolution.elemResults.find(x => x.id === e.id);
    return r ? Math.abs(r.P) : 0;
  }
  function normCurrent() {
    if (!lastSolution || !lastSolution.elemResults) return 0.1;
    let m = 0;
    for (const r of lastSolution.elemResults) m = Math.max(m, Math.abs(r.I));
    return m || 0.1;
  }
  function normPower() {
    if (!lastSolution || !lastSolution.elemResults) return 0.1;
    let m = 0;
    for (const r of lastSolution.elemResults) m = Math.max(m, Math.abs(r.P));
    return m || 0.1;
  }

  function drawElement(e, na, nb, isSelected) {
    const ax = na.x, ay = na.y, bx = nb.x, by = nb.y;
    const I = currentForElement(e);
    const P = powerForElement(e);
    const Inorm = normCurrent();
    const Pnorm = normPower();
    const intensity = Inorm > 0 ? Math.min(1, Math.abs(I) / Inorm) : 0;

    // selection glow
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = 'rgba(94,234,212,0.35)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.restore();
    }

    // active glow (intensity = |I|/Inorm)
    if (lastSolution && intensity > 0.02) {
      ctx.save();
      ctx.strokeStyle = `rgba(94,234,212,${0.06 + intensity * 0.34})`;
      ctx.lineWidth = 6 + intensity * 8;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.restore();
    }

    // ---- WIRE: full visible line + optional heat color ----
    if (e.type === 'WIRE') {
      let stroke = isSelected ? 'rgba(94,234,212,0.95)' : 'rgba(232,240,255,0.78)';
      if (simMode === 'heat' && lastSolution) {
        stroke = heatColor(P, Pnorm);
      }
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.restore();
      drawParticlesOnSegment(e.id, ax, ay, bx, by);
      return;
    }

    // ---- Component: backbone wire + leads + symbol ----
    let backboneColor = 'rgba(232,240,255,0.18)';
    if (simMode === 'heat' && lastSolution && (e.type === 'R' || e.type === 'RH')) {
      backboneColor = 'rgba(255,255,255,0.10)';
    }
    ctx.save();
    ctx.strokeStyle = backboneColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.restore();

    const dx = bx - ax, dy = by - ay;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const px = -uy, py = ux;
    const lead = 22;
    const a1x = ax + ux * lead, a1y = ay + uy * lead;
    const b1x = bx - ux * lead, b1y = by - uy * lead;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;

    // leads
    ctx.save();
    let leadColor = 'rgba(232,240,255,0.90)';
    if (simMode === 'heat' && lastSolution) leadColor = heatColor(P, Pnorm);
    ctx.strokeStyle = leadColor;
    ctx.fillStyle = leadColor;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(a1x, a1y);
    ctx.moveTo(b1x, b1y); ctx.lineTo(bx, by);
    ctx.stroke();

    const X = (t, s) => mx + ux * t + px * s;
    const Y = (t, s) => my + uy * t + py * s;

    switch (e.type) {
      case 'R':   drawResistorBody(X, Y, ux, uy, px, py, 0, 0, 50, 18, false, P, Pnorm); break;
      case 'RH':  drawResistorBody(X, Y, ux, uy, px, py, 0, 0, 62, 20, true,  P, Pnorm); break;
      case 'BAT': drawBattery3D(mx, my, ux, uy, px, py, ax, ay, bx, by, e); break;
      case 'A':   drawAmmeterDial(mx, my, ux, uy, px, py, e, I); break;
      default:    drawResistorBody(X, Y, ux, uy, px, py, 0, 0, 50, 18, false, P, Pnorm);
    }
    ctx.restore();

    // particles on leads only (not through symbol)
    drawParticlesOnSegment(e.id + 0.1, ax, ay, a1x, a1y, true);
    drawParticlesOnSegment(e.id + 0.2, b1x, b1y, bx, by, true);

    // labels
    const offset = 32;
    if (e.type === 'R') {
      labelBubble(mx + px * offset, my + py * offset, `${fmtNum(e.value ?? 100)}Ω`);
      if (lastSolution) {
        labelBubble(mx - px * offset, my - py * offset, `I=${fmtNum(I)}A`, '#bff7eb', true);
      }
    } else if (e.type === 'RH') {
      labelBubble(mx + px * offset, my + py * offset, `Rmax ${fmtNum(e.value ?? 500)}Ω`);
      if (lastSolution) {
        labelBubble(mx - px * offset, my - py * offset, `I=${fmtNum(I)}A`, '#bff7eb', true);
      }
    } else if (e.type === 'BAT') {
      labelBubble(mx + px * offset, my + py * offset, `${fmtNum(e.value ?? 9)}V`, '#fde6a8');
      if (lastSolution) {
        labelBubble(mx - px * offset, my - py * offset, `I=${fmtNum(I)}A`, '#bff7eb', true);
      }
    } else if (e.type === 'A') {
      if (lastSolution) labelBubble(mx + px * offset, my + py * offset, `${fmtNum(I)} A`, '#d6c4ff', true);
    }
  }

  function heatColor(P, Pnorm) {
    if (Pnorm <= 0) return 'rgba(232,240,255,0.78)';
    const t = Math.min(1, Math.abs(P) / Pnorm);
    // blue → cyan → yellow → red
    let r, g, b;
    if (t < 0.33) {
      const k = t / 0.33;
      r = lerp(40, 60, k); g = lerp(120, 220, k); b = lerp(230, 230, k);
    } else if (t < 0.66) {
      const k = (t - 0.33) / 0.33;
      r = lerp(60, 240, k); g = lerp(220, 200, k); b = lerp(230, 60, k);
    } else {
      const k = (t - 0.66) / 0.34;
      r = lerp(240, 255, k); g = lerp(200, 70, k); b = lerp(60, 40, k);
    }
    return `rgb(${r|0},${g|0},${b|0})`;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawResistorBody(X, Y, ux, uy, px, py, t0, s0, w, h, rheostat, P, Pnorm) {
    // pseudo-3D rectangle: base shadow + body + highlight
    const corners = [
      [X(t0 - w / 2, s0 - h / 2), Y(t0 - w / 2, s0 - h / 2)],
      [X(t0 + w / 2, s0 - h / 2), Y(t0 + w / 2, s0 - h / 2)],
      [X(t0 + w / 2, s0 + h / 2), Y(t0 + w / 2, s0 + h / 2)],
      [X(t0 - w / 2, s0 + h / 2), Y(t0 - w / 2, s0 + h / 2)]
    ];
    // shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.moveTo(corners[0][0] + 2, corners[0][1] + 3);
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i][0] + 2, corners[i][1] + 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // body
    let bodyColor = '#c8b186';
    let topColor  = '#e8d3a3';
    if (simMode === 'heat' && lastSolution) {
      const c = heatColor(P, Pnorm);
      bodyColor = c;
      topColor = c;
    }
    ctx.save();
    const grad = ctx.createLinearGradient(
      corners[0][0], corners[0][1], corners[2][0], corners[2][1]
    );
    grad.addColorStop(0, topColor);
    grad.addColorStop(0.5, bodyColor);
    grad.addColorStop(1, '#7a6849');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i][0], corners[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // color bands (decoration) for resistor
    if (!rheostat) {
      const cols = ['#222', '#c0392b', '#f1c40f', '#16a085'];
      for (let i = 0; i < 4; i++) {
        const t = -w / 2 + 10 + i * 8;
        ctx.fillStyle = cols[i];
        const bx0 = X(t, -h / 2 + 1), by0 = Y(t, -h / 2 + 1);
        const bx1 = X(t + 3, -h / 2 + 1), by1 = Y(t + 3, -h / 2 + 1);
        const bx2 = X(t + 3, h / 2 - 1), by2 = Y(t + 3, h / 2 - 1);
        const bx3 = X(t, h / 2 - 1), by3 = Y(t, h / 2 - 1);
        ctx.beginPath();
        ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by1);
        ctx.lineTo(bx2, by2); ctx.lineTo(bx3, by3);
        ctx.closePath(); ctx.fill();
      }
    }
    // highlight strip
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    const hx0 = X(t0 - w / 2 + 4, s0 - h / 2 + 2);
    const hy0 = Y(t0 - w / 2 + 4, s0 - h / 2 + 2);
    const hx1 = X(t0 + w / 2 - 4, s0 - h / 2 + 2);
    const hy1 = Y(t0 + w / 2 - 4, s0 - h / 2 + 2);
    const hx2 = X(t0 + w / 2 - 4, s0 - h / 2 + 5);
    const hy2 = Y(t0 + w / 2 - 4, s0 - h / 2 + 5);
    const hx3 = X(t0 - w / 2 + 4, s0 - h / 2 + 5);
    const hy3 = Y(t0 - w / 2 + 4, s0 - h / 2 + 5);
    ctx.beginPath();
    ctx.moveTo(hx0, hy0); ctx.lineTo(hx1, hy1);
    ctx.lineTo(hx2, hy2); ctx.lineTo(hx3, hy3);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    if (rheostat) {
      // slider arrow
      ctx.save();
      ctx.strokeStyle = '#e8f0ff';
      ctx.fillStyle = '#e8f0ff';
      ctx.lineWidth = 2;
      const sx = X(t0 - w / 2 + 8, s0 - h / 2 - 16);
      const sy = Y(t0 - w / 2 + 8, s0 - h / 2 - 16);
      const ex = X(t0 + 6, s0);
      const ey = Y(t0 + 6, s0);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      drawArrowHead(ex, ey, sx, sy);
      ctx.restore();
    }
  }

  function drawBattery3D(mx, my, ux, uy, px, py, ax, ay, bx, by, e) {
    // pretty pseudo-3D battery: cylinder + plus terminal
    const length = 30;
    const radius = 14;
    // cylinder side
    const x0 = mx - ux * length / 2, y0 = my - uy * length / 2;
    const x1 = mx + ux * length / 2, y1 = my + uy * length / 2;

    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(mx + 2, my + 3, length / 2 + 1, radius + 1, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill();

    // body
    const grad = ctx.createLinearGradient(
      mx + px * radius, my + py * radius,
      mx - px * radius, my - py * radius
    );
    grad.addColorStop(0, '#3a3a3a');
    grad.addColorStop(0.4, '#9aa1ad');
    grad.addColorStop(0.6, '#dee3ec');
    grad.addColorStop(1, '#4f5663');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(mx, my, length / 2, radius, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // label band (orange)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(mx, my, length / 2 - 6, radius - 3, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill();
    // bolt
    ctx.fillStyle = '#fff7d6';
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.fillText('⚡', mx - 6, my + 5);

    // + cap on a side
    ctx.fillStyle = '#cfd6e2';
    ctx.beginPath();
    ctx.arc(x1 + ux * 4, y1 + uy * 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // + / − labels near nodes
    ctx.save();
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.fillStyle = '#fcd47a';
    ctx.fillText('+', ax + ux * 10 + px * (-14), ay + uy * 10 + py * (-14));
    ctx.fillStyle = '#9bf3e2';
    ctx.fillText('−', bx - ux * 10 + px * (-14), by - uy * 10 + py * (-14));
    ctx.restore();
  }

  function drawAmmeterDial(mx, my, ux, uy, px, py, e, I) {
    const r = 18;
    ctx.save();
    // outer ring shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.arc(mx + 1, my + 2, r + 1, 0, Math.PI * 2); ctx.fill();
    // face gradient
    const grad = ctx.createRadialGradient(mx - 4, my - 4, 2, mx, my, r);
    grad.addColorStop(0, '#dfe7f3');
    grad.addColorStop(1, '#7c869b');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
    // bezel
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // ticks
    ctx.strokeStyle = '#2a3650'; ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1.2 + i * (0.6 / 10));
      const rx = mx + Math.cos(a) * (r - 2);
      const ry = my + Math.sin(a) * (r - 2);
      const rx2 = mx + Math.cos(a) * (r - (i % 5 === 0 ? 8 : 5));
      const ry2 = my + Math.sin(a) * (r - (i % 5 === 0 ? 8 : 5));
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx2, ry2); ctx.stroke();
    }
    // needle
    const Inorm = normCurrent();
    const t = Inorm > 0 ? Math.min(1, Math.max(-1, I / Inorm)) : 0;
    const ang = Math.PI * (1.2 + (t * 0.5 + 0.5) * 0.6);
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + Math.cos(ang) * (r - 4), my + Math.sin(ang) * (r - 4));
    ctx.stroke();
    // pin
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2); ctx.fill();
    // "A" letter
    ctx.fillStyle = '#1a2a4a'; ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillText('A', mx - 3, my + 12);
    ctx.restore();
  }

  function drawArrowHead(xTip, yTip, xFrom, yFrom) {
    const ang = Math.atan2(yTip - yFrom, xTip - xFrom);
    const size = 8;
    ctx.beginPath();
    ctx.moveTo(xTip, yTip);
    ctx.lineTo(xTip - size * Math.cos(ang - Math.PI / 6), yTip - size * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(xTip - size * Math.cos(ang + Math.PI / 6), yTip - size * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function drawProbe(pr, na, nb, isSelected) {
    const ax = na.x, ay = na.y, bx = nb.x, by = nb.y;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const dx = bx - ax, dy = by - ay;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const px = -uy, py = ux;

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = isSelected ? 'rgba(255,77,77,0.85)' : 'rgba(232,240,255,0.40)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // digital display
    const w = 56, h = 30;
    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRectScreen(mx - w / 2 + 1, my - h / 2 + 2, w, h, 6); ctx.fill();
    // body
    const grad = ctx.createLinearGradient(mx, my - h / 2, mx, my + h / 2);
    grad.addColorStop(0, '#1f2a44');
    grad.addColorStop(1, '#0e1626');
    ctx.fillStyle = grad;
    ctx.strokeStyle = isSelected ? 'rgba(94,234,212,0.8)' : 'rgba(94,234,212,0.4)';
    ctx.lineWidth = 1.6;
    roundRectScreen(mx - w / 2, my - h / 2, w, h, 6);
    ctx.fill(); ctx.stroke();

    // screen
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRectScreen(mx - w / 2 + 4, my - h / 2 + 4, w - 8, h - 12, 3); ctx.fill();

    let txt = 'V';
    if (lastSolution?.Vnode) {
      const Va = lastSolution.Vnode.get(pr.a);
      const Vb = lastSolution.Vnode.get(pr.b);
      if (typeof Va === 'number' && typeof Vb === 'number') {
        txt = fmtNum(Va - Vb) + 'V';
      }
    }
    ctx.fillStyle = '#9bf3e2';
    ctx.font = 'bold 12px ui-monospace, Menlo, Consolas, monospace';
    ctx.shadowColor = '#5eead4';
    ctx.shadowBlur = 6;
    const tw = ctx.measureText(txt).width;
    ctx.fillText(txt, mx - tw / 2, my + 1);
    ctx.shadowBlur = 0;

    // tiny "V" badge
    ctx.fillStyle = '#cfd6e2';
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillText('V', mx + w / 2 - 12, my + h / 2 - 3);
    ctx.restore();
  }

  function drawNode(n, isSelected) {
    ctx.save();
    const r = 8;

    // pulse animation
    const pulseAt = nodePulses.get(n.id);
    if (pulseAt) {
      const age = (performance.now() - pulseAt) / 700;
      if (age < 1) {
        ctx.strokeStyle = `rgba(94,234,212,${0.6 * (1 - age)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + age * 18, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        nodePulses.delete(n.id);
      }
    }

    // base
    ctx.fillStyle = n.isGnd ? 'rgba(70,211,122,0.95)' : 'rgba(255,255,255,0.96)';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // inner dot
    ctx.fillStyle = n.isGnd ? 'rgba(15,40,25,0.6)' : 'rgba(20,30,55,0.5)';
    ctx.beginPath(); ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2); ctx.fill();

    if (isSelected) {
      ctx.strokeStyle = 'rgba(94,234,212,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2); ctx.stroke();
    }

    // label
    const text = n.isGnd ? `N${n.id} (GND)` : `N${n.id}`;
    ctx.font = '11px ui-monospace, Menlo, Consolas, monospace';
    const tw = ctx.measureText(text).width;
    const x = n.x + 12, y = n.y - 14;
    ctx.fillStyle = 'rgba(10,16,30,0.86)';
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    roundRectScreen(x, y, tw + 14, 22, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#e8f0ff';
    ctx.fillText(text, x + 7, y + 15);

    // voltage label
    if (lastSolution?.Vnode) {
      const V = lastSolution.Vnode.get(n.id);
      if (typeof V === 'number') {
        const vt = `${fmtNum(V)} V`;
        const vw = ctx.measureText(vt).width;
        const vx = n.x - vw - 18, vy = n.y - 14;
        ctx.fillStyle = 'rgba(34,211,238,0.18)';
        ctx.strokeStyle = 'rgba(94,234,212,0.4)';
        roundRectScreen(vx - 6, vy, vw + 12, 22, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#bff7eb';
        ctx.fillText(vt, vx, vy + 15);
      }
    }
    ctx.restore();
  }

  function drawPickRing(x, y) {
    ctx.save();
    const t = (now / 1000) * 2;
    const r = 16 + Math.sin(t) * 3;
    ctx.strokeStyle = 'rgba(94,234,212,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // ============================================================
  // Particle system
  // ============================================================
  function rebuildParticles() {
    if (!lastSolution) { particles.clear(); return; }
    const Inorm = normCurrent();
    const boost = simMode === 'electron' ? 2.2 : 1.0;
    for (const e of elements) {
      const I = currentForElement(e);
      const intensity = Inorm > 0 ? Math.abs(I) / Inorm : 0;
      const baseCount = e.type === 'WIRE' ? 6 : 3;
      const count = Math.max(0, Math.round(intensity * baseCount * boost));
      let arr = particles.get(e.id);
      if (!arr) { arr = []; particles.set(e.id, arr); }
      while (arr.length < count) arr.push({ t: Math.random() });
      while (arr.length > count) arr.pop();
    }
  }

  function tickParticles(dtSec) {
    if (!lastSolution) return;
    const Inorm = normCurrent();
    for (const e of elements) {
      const I = currentForElement(e);
      if (!Number.isFinite(I) || Math.abs(I) < 1e-9) continue;
      const dir = I >= 0 ? 1 : -1;
      const speed = (0.18 + 0.6 * Math.min(1, Math.abs(I) / (Inorm || 1)));
      // electron mode: slightly faster + more dense
      const modeBoost = simMode === 'electron' ? 1.4 : 1.0;
      const arr = particles.get(e.id);
      if (!arr) continue;
      for (const p of arr) {
        p.t += dir * speed * modeBoost * dtSec;
        if (p.t > 1) p.t -= 1;
        if (p.t < 0) p.t += 1;
      }
    }
  }

  function drawParticlesOnSegment(elemId, ax, ay, bx, by, isLead = false) {
    // particles can be keyed by a fractional id for leads
    const intId = Math.trunc(elemId);
    const arr = particles.get(intId);
    if (!arr || !arr.length) return;
    // For leads, draw only ~30% of particles, with slight offset
    const subset = isLead ? Math.max(1, Math.round(arr.length * 0.5)) : arr.length;
    const startIdx = isLead ? (elemId.toString().endsWith('.2') ? Math.floor(arr.length / 2) : 0) : 0;

    ctx.save();
    for (let i = 0; i < subset; i++) {
      const idx = (startIdx + i) % arr.length;
      const p = arr[idx];
      const t = p.t;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const size = simMode === 'electron' ? 3.2 : 2.4;
      // particle glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      const cyan = '94,234,212';
      grad.addColorStop(0, `rgba(${cyan},0.95)`);
      grad.addColorStop(0.4, `rgba(${cyan},0.45)`);
      grad.addColorStop(1, `rgba(${cyan},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, size * 4, 0, Math.PI * 2); ctx.fill();
      // core
      ctx.fillStyle = '#e7fffb';
      ctx.beginPath(); ctx.arc(x, y, size * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ============================================================
  // Solver (MNA) — unchanged math
  // ============================================================
  function solveCircuit() {
    const gnd = nodes.find(n => n.isGnd);
    if (!gnd) { setStatus(simT('status.noGnd', 'Nu ai GND. Setează un nod ca masă (GND).'), 'warn'); return null; }
    const resistive = elements.filter(e => e.type !== 'BAT');
    const sources = elements.filter(e => e.type === 'BAT');
    const nodeIds = nodes.map(n => n.id);
    const nongnd = nodeIds.filter(id => id !== gnd.id);
    const nV = nongnd.length;
    const m = sources.length;
    const N = nV + m;
    if (N === 0) { setStatus(simT('status.nothingToSolve', 'Nimic de rezolvat.'), 'warn'); return null; }

    const A = Array.from({ length: N }, () => Array(N).fill(0));
    const z = Array(N).fill(0);
    const nodeVarIndex = (nodeId) => (nodeId === gnd.id ? -1 : nongnd.indexOf(nodeId));

    for (const e of resistive) {
      let R = Number(e.value);
      if (!Number.isFinite(R)) R = 100;
      if (e.type === 'WIRE') R = 0.01;
      if (e.type === 'A') R = 1e-6;
      if (e.type === 'RH') R = Math.max(0.0001, R);
      if (e.type === 'R') R = Math.max(0.0001, R);
      R = Math.max(1e-9, R);
      const g = 1 / R;
      const ia = nodeVarIndex(e.a);
      const ib = nodeVarIndex(e.b);
      if (ia !== -1) A[ia][ia] += g;
      if (ib !== -1) A[ib][ib] += g;
      if (ia !== -1 && ib !== -1) { A[ia][ib] -= g; A[ib][ia] -= g; }
    }
    sources.forEach((vs, k) => {
      const row = nV + k;
      const ia = nodeVarIndex(vs.a);
      const ib = nodeVarIndex(vs.b);
      if (ia !== -1) { A[ia][row] += 1; A[row][ia] += 1; }
      if (ib !== -1) { A[ib][row] -= 1; A[row][ib] -= 1; }
      z[row] = Number(vs.value ?? 9);
    });

    const x = gaussianSolve(A, z);
    if (!x) { setStatus(simT('status.singular', 'Nu pot rezolva: circuit singular.'), 'warn'); return null; }

    const Vnode = new Map();
    Vnode.set(gnd.id, 0);
    for (let i = 0; i < nongnd.length; i++) Vnode.set(nongnd[i], x[i]);

    const elemResults = [];
    let shortWarn = false;
    for (const e of elements) {
      const Va = Vnode.get(e.a);
      const Vb = Vnode.get(e.b);
      if (typeof Va !== 'number' || typeof Vb !== 'number') continue;
      if (e.type === 'BAT') {
        const k = sources.findIndex(s => s.id === e.id);
        const Is = x[nV + k];
        elemResults.push({ id: e.id, type: 'BAT', I: Is, P: (Va - Vb) * Is, a: e.a, b: e.b, value: e.value ?? 9 });
        if (Math.abs(Is) > 30) shortWarn = true;
      } else {
        let R = Number(e.value);
        if (!Number.isFinite(R)) R = 100;
        if (e.type === 'WIRE') R = 0.01;
        if (e.type === 'A') R = 1e-6;
        if (e.type === 'RH') R = Math.max(0.0001, R);
        if (e.type === 'R') R = Math.max(0.0001, R);
        R = Math.max(1e-9, R);
        const I = (Va - Vb) / R;
        const P = I * I * R;
        elemResults.push({ id: e.id, type: e.type, I, P, a: e.a, b: e.b, value: R });
        if (R < 0.05 || Math.abs(I) > 30) shortWarn = true;
      }
    }

    setStatus(
      shortWarn
        ? simT('status.solvedShort', 'Rezolvat. Atenție: curenți foarte mari (posibil scurt).')
        : simT('status.solvedOk', 'Rezolvat. Kirchhoff + Ohm aplicate.'),
      shortWarn ? 'warn' : 'ok'
    );
    return { Vnode, elemResults, gndId: gnd.id };
  }
  function gaussianSolve(A, b) {
    const n = A.length;
    const M = A.map(row => row.slice());
    const z = b.slice();
    const EPS = 1e-12;
    for (let col = 0; col < n; col++) {
      let pivot = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
      }
      if (Math.abs(M[pivot][col]) < EPS) return null;
      if (pivot !== col) { [M[pivot], M[col]] = [M[col], M[pivot]]; [z[pivot], z[col]] = [z[col], z[pivot]]; }
      const div = M[col][col];
      for (let c = col; c < n; c++) M[col][c] /= div;
      z[col] /= div;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = M[r][col];
        if (Math.abs(f) < EPS) continue;
        for (let c = col; c < n; c++) M[r][c] -= f * M[col][c];
        z[r] -= f * z[col];
      }
    }
    return z;
  }

  // ============================================================
  // Results panel
  // ============================================================
  function resetMetrics() {
    animatedMetrics.Itot.target = 0; animatedMetrics.Itot.cur = 0;
    animatedMetrics.Vsrc.target = 0; animatedMetrics.Vsrc.cur = 0;
    animatedMetrics.Ptot.target = 0; animatedMetrics.Ptot.cur = 0;
    animatedMetrics.Req.target = 0;  animatedMetrics.Req.cur = 0;
    mItot.textContent = '— A';
    mVsrc.textContent = '— V';
    mPtot.textContent = '— W';
    mReq.textContent  = '— Ω';
  }
  function updateMetricsTargets() {
    if (!lastSolution) return;
    const bats = lastSolution.elemResults.filter(r => r.type === 'BAT');
    const Vsrc = bats[0] ? bats[0].value : 0;
    const Itot = bats.reduce((s, r) => s + Math.abs(r.I), 0);
    const Ptot = bats.reduce((s, r) => s + Math.abs(r.P), 0);
    const Req  = Itot > 0 ? Vsrc / Itot : NaN;
    animatedMetrics.Itot.target = Itot;
    animatedMetrics.Vsrc.target = Vsrc;
    animatedMetrics.Ptot.target = Ptot;
    animatedMetrics.Req.target  = Req;
  }
  function tickMetrics() {
    const k = 0.15;
    for (const key of ['Itot', 'Vsrc', 'Ptot', 'Req']) {
      const m = animatedMetrics[key];
      if (!Number.isFinite(m.target)) { m.cur = NaN; continue; }
      m.cur += (m.target - m.cur) * k;
    }
    mItot.textContent = fmt(animatedMetrics.Itot.cur, 'A');
    mVsrc.textContent = fmt(animatedMetrics.Vsrc.cur, 'V');
    mPtot.textContent = fmt(animatedMetrics.Ptot.cur, 'W');
    mReq.textContent  = Number.isFinite(animatedMetrics.Req.cur)
      ? fmt(animatedMetrics.Req.cur, 'Ω') : '— Ω';
  }

  function renderBranchList() {
    if (!lastSolution) { branchList.innerHTML = '<div class="empty">—</div>'; return; }
    const rows = lastSolution.elemResults.map(r => {
      const cls = r.type === 'BAT' ? 'bat' : r.type === 'A' ? 'am' : r.type === 'RH' ? 'rh' : r.type === 'WIRE' ? 'wire' : '';
      const name = ({ R: 'R', RH: 'RH', BAT: 'BAT', WIRE: 'W', A: 'A' })[r.type] || r.type;
      return `
        <div class="branch-row">
          <span class="tag ${cls}">${name}${r.id}</span>
          <span class="mono">N${r.a}→N${r.b}</span>
          <span class="vals">I=<b>${fmtNum(r.I)} A</b> · P=<b>${fmtNum(Math.abs(r.P))} W</b></span>
        </div>`;
    });
    branchList.innerHTML = rows.join('') || '<div class="empty">—</div>';
  }

  // ============================================================
  // Education
  // ============================================================
  function renderEducation() {
    eduPanel.innerHTML = '';
    if (!lastSolution) return;
    const steps = [];

    const bats = lastSolution.elemResults.filter(r => r.type === 'BAT');
    if (bats.length === 0) {
      steps.push({
        title: simT('edu.noSourceTitle', 'Lipsește sursa'),
        text: simT('edu.noSourceText', 'Nu există nicio sursă de tensiune. Adaugă una pentru a avea curent.')
      });
    } else {
      const Vsrc = bats[0].value;
      const Itot = Math.abs(bats[0].I);
      const Ptot = Math.abs(bats[0].P);
      const Req = Itot > 0 ? Vsrc / Itot : NaN;
      steps.push({
        title: simT('edu.ohmGlobalTitle', 'Legea lui Ohm — circuit global'),
        text: simT('edu.ohmGlobalText', 'Curent total prin sursă:'),
        form: `I = V / R = ${fmtNum(Vsrc)} V / ${fmtNum(Req)} Ω = ${fmtNum(Itot)} A`
      });
      steps.push({
        title: simT('edu.powerTitle', 'Putere disipată'),
        text: simT('edu.powerText', 'Puterea totală debitată de sursă în circuit:'),
        form: `P = V · I = ${fmtNum(Vsrc)} · ${fmtNum(Itot)} = ${fmtNum(Ptot)} W`
      });
    }

    // Kirchhoff KCL at nodes with degree >= 3
    const degree = new Map();
    for (const e of elements) {
      degree.set(e.a, (degree.get(e.a) || 0) + 1);
      degree.set(e.b, (degree.get(e.b) || 0) + 1);
    }
    const junctions = nodes.filter(n => (degree.get(n.id) || 0) >= 3);
    if (junctions.length > 0) {
      const j = junctions[0];
      const inElems = lastSolution.elemResults.filter(r => r.a === j.id || r.b === j.id);
      const detail = inElems.map(r => {
        const sign = r.a === j.id ? -1 : 1; // current into node if going from other to j
        const I = r.I * sign;
        const name = ({ R: 'R', RH: 'RH', BAT: 'V', WIRE: 'W', A: 'A' })[r.type] || r.type;
        return `${name}${r.id}: ${I >= 0 ? '+' : ''}${fmtNum(I)} A`;
      }).join(', ');
      steps.push({
        title: simTf('edu.kclTitle', 'Kirchhoff KCL la nodul N{n}', { n: j.id }),
        text: simT('edu.kclText', 'Suma curenților care intră într-un nod este 0:'),
        form: `Σ I_in = 0  →  ${detail}`
      });
    }

    // KVL hint
    const loops = (degree.size > 0 && elements.filter(e => e.type !== 'WIRE' && e.type !== 'A').length >= 2);
    if (loops) {
      steps.push({
        title: simT('edu.kvlTitle', 'Kirchhoff KVL — suma tensiunilor'),
        text: simT('edu.kvlText', 'Pe orice buclă închisă, suma diferențelor de potențial este 0:'),
        form: simT('edu.kvlForm', 'Σ V_buclă = 0')
      });
    }

    // Per-resistor breakdown (max 3)
    const Rs = lastSolution.elemResults
      .filter(r => r.type === 'R' || r.type === 'RH')
      .sort((a, b) => Math.abs(b.P) - Math.abs(a.P))
      .slice(0, 3);
    for (const r of Rs) {
      steps.push({
        title: r.type === 'RH'
          ? simTf('edu.onRheostatTitle', 'Pe reostatul R{id}', { id: r.id })
          : simTf('edu.onResistorTitle', 'Pe rezistorul R{id}', { id: r.id }),
        text: simTf('edu.onResistorText', 'Cu R = {r} Ω și I = {i} A:', { r: fmtNum(r.value), i: fmtNum(r.I) }),
        form: `U = R · I = ${fmtNum(r.value * r.I)} V · P = R · I² = ${fmtNum(Math.abs(r.P))} W`
      });
    }

    for (const s of steps) {
      const div = document.createElement('div');
      div.className = 'edu-step';
      div.innerHTML = `<div><b>${s.title}.</b> ${s.text}</div>${s.form ? `<span class="formula">${s.form}</span>` : ''}`;
      eduPanel.appendChild(div);
    }
  }

  // ============================================================
  // Challenges
  // ============================================================
  function buildChallenges() {
    return [
    {
      id: 1,
      title: simT('challenges.c1.title', 'Construiește un circuit cu R_echiv = 100 Ω (±5%)'),
      check: () => {
        if (!lastSolution) return false;
        const bats = lastSolution.elemResults.filter(r => r.type === 'BAT');
        if (!bats.length) return false;
        const Vs = bats[0].value, I = Math.abs(bats[0].I);
        if (I < 1e-6) return false;
        const Req = Vs / I;
        return Math.abs(Req - 100) / 100 < 0.05;
      }
    },
    {
      id: 2,
      title: simT('challenges.c2.title', 'Fă curentul total = 0.10 A (±5%)'),
      check: () => {
        if (!lastSolution) return false;
        const bats = lastSolution.elemResults.filter(r => r.type === 'BAT');
        if (!bats.length) return false;
        return Math.abs(Math.abs(bats[0].I) - 0.10) / 0.10 < 0.05;
      }
    },
    {
      id: 3,
      title: simT('challenges.c3.title', 'Conectează 2 rezistoare în paralel'),
      check: () => {
        // any node with 2 R as neighbors and shared the other endpoint too
        const Rs = elements.filter(e => e.type === 'R' || e.type === 'RH');
        for (let i = 0; i < Rs.length; i++) {
          for (let j = i + 1; j < Rs.length; j++) {
            const a = Rs[i], b = Rs[j];
            const setA = new Set([a.a, a.b]);
            const setB = new Set([b.a, b.b]);
            if (setA.size === 2 && [...setA].every(x => setB.has(x))) return true;
          }
        }
        return false;
      }
    }
  ];
  }

  function renderChallenges() {
    challengeList.innerHTML = '';
    buildChallenges().forEach((c, idx) => {
      const div = document.createElement('div');
      div.className = 'challenge';
      div.dataset.cid = c.id;
      div.innerHTML = `
        <span class="badge">${idx + 1}</span>
        <span class="desc">${c.title}</span>
        <button class="verify-btn">${simT('challenges.verify', 'Verifică')}</button>
      `;
      div.querySelector('.verify-btn').addEventListener('click', () => {
        const ok = c.check();
        div.classList.toggle('done', ok);
        if (ok) setStatus(simTf('status.challengeDone', 'Provocare {n} ✓ rezolvată!', { n: idx + 1 }), 'ok');
        else setStatus(simTf('status.challengePending', 'Provocare {n}: încă nu. Apasă Rezolvă și re-verifică.', { n: idx + 1 }), 'warn');
      });
      challengeList.appendChild(div);
    });
  }

  // ============================================================
  // Fit to content
  // ============================================================
  function fitToContent() {
    if (!nodes.length) return;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dx = w / 2 - cx, dy = h / 2 - cy;
    for (const n of nodes) { n.x += dx; n.y += dy; }
    lastSolution = null;
  }

  // ============================================================
  // Main draw + loop
  // ============================================================
  function draw() {
    drawBackground();

    // elements
    for (const e of elements) {
      const a = nodes.find(n => n.id === e.a);
      const b = nodes.find(n => n.id === e.b);
      if (!a || !b) continue;
      drawElement(e, a, b, selected?.kind === 'elem' && selected.id === e.id);
    }
    // probes
    for (const pr of probes) {
      const a = nodes.find(n => n.id === pr.a);
      const b = nodes.find(n => n.id === pr.b);
      if (!a || !b) continue;
      drawProbe(pr, a, b, selected?.kind === 'probe' && selected.id === pr.id);
    }
    // nodes
    for (const n of nodes) {
      drawNode(n, selected?.kind === 'node' && selected.id === n.id);
    }
    if (pickedNode) {
      const n = nodes.find(x => x.id === pickedNode);
      if (n) drawPickRing(n.x, n.y);
    }
  }

  function loop() {
    now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    tickParticles(dt);
    tickMetrics();
    draw();
    requestAnimationFrame(loop);
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    fit();
    window.addEventListener('resize', () => { fit(); });
    window.addEventListener('resize', applyPanelResponsiveState);

    if (togglePanelBtn && appRoot) {
      togglePanelBtn.addEventListener('click', () => {
        appRoot.classList.toggle('panel-open');
        togglePanelBtn.textContent = '\u2630';
      });
    }
    applyPanelResponsiveState();

    setTool(Tools.SELECT);
    setSimMode('schematic');
    setStatus(simT('status.ready', 'Gata. Începe cu Nod + GND + Fir/Rezistoare.'), 'ok');
    updateSelectionUI();
    setCanvasHint();
    attachTooltips();
    renderChallenges();
    requestAnimationFrame(loop);
  }
  init();
})();
