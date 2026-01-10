(() => {
    // ========= DOM =========
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
  
    const toolLabel = document.getElementById('toolLabel');
    const pickHint = document.getElementById('pickHint');
    const statusEl = document.getElementById('status');
  
    const selInfo = document.getElementById('selInfo');
    const deleteBtn = document.getElementById('deleteBtn');
  
    const propBox = document.getElementById('propBox');
    const propLabel = document.getElementById('propLabel');
    const propValue = document.getElementById('propValue');
    const propHelp = document.getElementById('propHelp');
  
    const nodeOut = document.getElementById('nodeOut');
    const branchOut = document.getElementById('branchOut');
  
    // ========= State =========
    // nodes: {id,x,y,isGnd}
    // elements: {id,type,a,b,value?}
    // type: 'R' resistor, 'RH' rheostat, 'BAT' battery (V source), 'WIRE' wire, 'A' ammeter
    // probes: voltmeter probes (not in solver)
    let nodes = [];
    let elements = [];
    let probes = [];
  
    let nextNodeId = 1;
    let nextElemId = 1;
    let nextProbeId = 1;
  
    const Tools = {
      SELECT: 'SELECT',
      NODE: 'NODE',
      GND: 'GND',
      WIRE: 'WIRE',
      R: 'R',
      RH: 'RH',
      BAT: 'BAT',
      A: 'A',
      V: 'V', // probe
    };
    let tool = Tools.SELECT;
  
    let pickedNode = null; // first node for connect/probe
  
    // selection + drag
    let selected = null; // {kind:'node'|'elem'|'probe', id}
    let draggingNodeId = null;
    let dragOffset = {x:0,y:0};
  
    // last solution (for displaying meter values)
    let lastSolution = null;
  
    // ========= Utilities =========
    function setStatus(text, kind = 'ok') {
      statusEl.textContent = text;
      statusEl.classList.toggle('ok', kind === 'ok');
      statusEl.classList.toggle('warn', kind === 'warn');
    }
  
    function fmt(x) {
      const ax = Math.abs(x);
      if (ax >= 1e6) return (x / 1e6).toFixed(2) + 'M';
      if (ax >= 1e3) return (x / 1e3).toFixed(2) + 'k';
      if (ax >= 1) return x.toFixed(2);
      return x.toFixed(4);
    }
  
    function setTool(t) {
      tool = t;
      toolLabel.textContent = ({
        SELECT: 'Select', NODE: 'Nod', GND: 'GND', WIRE: 'Wire',
        R: 'Rezistor', RH: 'Reostat', BAT: 'Sursă', A: 'Ampermetru', V: 'Voltmetru'
      })[t] || t;
  
      const map = {
        toolSelect: Tools.SELECT,
        toolNode: Tools.NODE,
        toolGnd: Tools.GND,
        toolWire: Tools.WIRE,
        toolR: Tools.R,
        toolRh: Tools.RH,
        toolBat: Tools.BAT,
        toolA: Tools.A,
        toolV: Tools.V,
      };
      for (const [id, val] of Object.entries(map)) {
        document.getElementById(id).classList.toggle('primary', tool === val);
      }
  
      pickedNode = null;
      pickHint.textContent = '—';
      draw();
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
  
    // ✅ Only WIRE hit-test (for "insert node on wire")
    function findWireNear(p, radius = 10) {
      let best = null, bd = radius, bestProj = null;
      for (const e of elements) {
        if (e.type !== 'WIRE') continue;
        const a = nodes.find(n => n.id === e.a);
        const b = nodes.find(n => n.id === e.b);
        if (!a || !b) continue;
  
        const proj = projectPointOnSegment(p.x, p.y, a.x, a.y, b.x, b.y);
        const d = Math.hypot(p.x - proj.x, p.y - proj.y);
        if (d < bd) {
          bd = d;
          best = e;
          bestProj = proj;
        }
      }
      if (!best) return null;
      return { wire: best, proj: bestProj };
    }
  
    // ✅ split wire into two wires by creating a node on it
    function splitWireAt(wire, proj) {
      // avoid too close to ends
      if (proj.t < 0.08 || proj.t > 0.92) return null;
  
      const newNode = { id: nextNodeId++, x: proj.x, y: proj.y, isGnd: false };
      nodes.push(newNode);
  
      // remove old wire
      elements = elements.filter(e => e.id !== wire.id);
  
      // add two wires
      elements.push({ id: nextElemId++, type: 'WIRE', a: wire.a, b: newNode.id, value: 0.01 });
      elements.push({ id: nextElemId++, type: 'WIRE', a: newNode.id, b: wire.b, value: 0.01 });
  
      return newNode.id;
    }
  
    function setSelected(obj) {
      selected = obj;
      updateSelectionUI();
      draw();
    }
  
    function clearSelected() {
      selected = null;
      updateSelectionUI();
      draw();
    }
  
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
        selInfo.textContent = pr ? `Voltmetru P${pr.id} (N${pr.a} ↔ N${pr.b})` : '—';
        propBox.hidden = true;
        return;
      }
  
      if (selected.kind === 'elem') {
        const e = elements.find(x => x.id === selected.id);
        if (!e) { selInfo.textContent = '—'; propBox.hidden = true; return; }
  
        const name = ({ R: 'Rezistor', RH: 'Reostat', BAT: 'Sursă', WIRE: 'Wire', A: 'Ampermetru' })[e.type] || e.type;
        selInfo.textContent = `${name} E${e.id} (N${e.a} ↔ N${e.b})`;
  
        if (e.type === 'R' || e.type === 'RH' || e.type === 'BAT') {
          propBox.hidden = false;
  
          if (e.type === 'BAT') {
            propLabel.textContent = 'Tensiune (V)';
            propHelp.textContent = 'Sursa: primul nod = +, al doilea = −.';
            propValue.step = '0.1';
            propValue.value = String(e.value ?? 9);
          } else {
            propLabel.textContent = 'Rezistență (Ω)';
            propHelp.textContent = (e.type === 'RH') ? 'Reostat: valoarea reprezintă Rmax (Ω).' : 'Rezistor fix (Ω).';
            propValue.step = '1';
            propValue.value = String(e.value ?? 100);
          }
        } else {
          propBox.hidden = true;
        }
      }
    }
  
    function setPickHint() {
      pickHint.textContent = pickedNode ? `Selectat N${pickedNode}, alege al doilea nod…` : '—';
    }
  
    function connectElement(type, aId, bId) {
      if (aId === bId) return;
  
      if (type === 'WIRE') {
        elements.push({ id: nextElemId++, type: 'WIRE', a: aId, b: bId, value: 0.01 });
        setStatus(`Wire între N${aId} și N${bId}.`, 'ok');
        return;
      }
      if (type === 'A') {
        elements.push({ id: nextElemId++, type: 'A', a: aId, b: bId, value: 1e-6 });
        setStatus(`Ampermetru între N${aId} și N${bId}.`, 'ok');
        return;
      }
      if (type === 'R') {
        elements.push({ id: nextElemId++, type: 'R', a: aId, b: bId, value: 100 });
        setStatus(`Rezistor între N${aId} și N${bId} (selectează ca să setezi Ω).`, 'ok');
        return;
      }
      if (type === 'RH') {
        elements.push({ id: nextElemId++, type: 'RH', a: aId, b: bId, value: 500 });
        setStatus(`Reostat între N${aId} și N${bId} (selectează ca să setezi Rmax).`, 'ok');
        return;
      }
      if (type === 'BAT') {
        elements.push({ id: nextElemId++, type: 'BAT', a: aId, b: bId, value: 9 });
        setStatus(`Sursă 9V (+ la N${aId}, − la N${bId}).`, 'ok');
        return;
      }
    }
  
    function addProbe(aId, bId) {
      if (aId === bId) return;
      probes.push({ id: nextProbeId++, a: aId, b: bId });
      setStatus(`Voltmetru între N${aId} și N${bId}.`, 'ok');
    }
  
    // ========= Buttons =========
    document.getElementById('toolSelect').onclick = () => setTool(Tools.SELECT);
    document.getElementById('toolNode').onclick = () => setTool(Tools.NODE);
    document.getElementById('toolGnd').onclick = () => setTool(Tools.GND);
    document.getElementById('toolWire').onclick = () => setTool(Tools.WIRE);
    document.getElementById('toolR').onclick = () => setTool(Tools.R);
    document.getElementById('toolRh').onclick = () => setTool(Tools.RH);
    document.getElementById('toolBat').onclick = () => setTool(Tools.BAT);
    document.getElementById('toolA').onclick = () => setTool(Tools.A);
    document.getElementById('toolV').onclick = () => setTool(Tools.V);
  
    document.getElementById('clearBtn').onclick = () => {
      nodes = [];
      elements = [];
      probes = [];
      nextNodeId = 1;
      nextElemId = 1;
      nextProbeId = 1;
      pickedNode = null;
      lastSolution = null;
  
      nodeOut.textContent = '—';
      branchOut.textContent = '—';
      clearSelected();
      setStatus('Curățat. Pune noduri + GND + componente.', 'ok');
      draw();
    };
  
    document.getElementById('demoBtn').onclick = () => {
      nodes = [
        { id: 1, x: 180, y: 220, isGnd: false },
        { id: 2, x: 430, y: 220, isGnd: true },
        { id: 3, x: 720, y: 140, isGnd: false },
        { id: 4, x: 720, y: 300, isGnd: false },
        { id: 5, x: 540, y: 220, isGnd: false },
        { id: 6, x: 860, y: 220, isGnd: false },
      ];
      nextNodeId = 7;
  
      elements = [
        { id: 1, type: 'BAT', a: 1, b: 2, value: 9 },
        { id: 2, type: 'WIRE', a: 1, b: 5, value: 0.01 },
        { id: 3, type: 'R', a: 5, b: 3, value: 100 },
        { id: 4, type: 'R', a: 5, b: 4, value: 100 },
        { id: 5, type: 'RH', a: 4, b: 2, value: 500 },
        { id: 6, type: 'A', a: 3, b: 6, value: 1e-6 },
        { id: 7, type: 'WIRE', a: 6, b: 2, value: 0.01 },
      ];
      nextElemId = 8;
  
      probes = [
        { id: 1, a: 1, b: 2 },
        { id: 2, a: 5, b: 2 },
      ];
      nextProbeId = 3;
  
      lastSolution = null;
      clearSelected();
      setStatus('Demo încărcat. Apasă Solve.', 'ok');
      draw();
    };
  
    document.getElementById('solveBtn').onclick = () => {
      try {
        lastSolution = solveCircuit();
        draw();
      } catch (err) {
        console.error(err);
        setStatus('Eroare la Solve (vezi consola).', 'warn');
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
      } else if (selected.kind === 'probe') {
        probes = probes.filter(p => p.id !== selected.id);
      }
  
      lastSolution = null;
      clearSelected();
      setStatus('Șters.', 'ok');
      draw();
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
      setStatus('Valoare modificată. Apasă Solve.', 'ok');
      draw();
    });
  
    // ========= Interaction =========
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
      if (hitProbe) {
        setSelected({ kind: 'probe', id: hitProbe.id });
        return;
      }
  
      const hitElem = findElementNear(p, 10);
      if (hitElem) {
        setSelected({ kind: 'elem', id: hitElem.id });
        return;
      }
  
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
      draw();
    });
  
    window.addEventListener('mouseup', () => {
      draggingNodeId = null;
    });
  
    canvas.addEventListener('click', (e) => {
      const p = mousePos(e);
  
      if (tool === Tools.SELECT) return;
  
      if (tool === Tools.NODE) {
        const hit = findNodeNear(p, 14);
        if (hit) return;
        nodes.push({ id: nextNodeId++, x: p.x, y: p.y, isGnd: false });
        setStatus(`Nod N${nextNodeId - 1} adăugat.`, 'ok');
        draw();
        return;
      }
  
      if (tool === Tools.GND) {
        const hit = findNodeNear(p, 14);
        if (!hit) { setStatus('Click pe un nod ca să-l setezi GND.', 'warn'); return; }
        for (const n of nodes) n.isGnd = false;
        hit.isGnd = true;
        lastSolution = null;
        setStatus(`GND setat pe N${hit.id}.`, 'ok');
        draw();
        return;
      }
  
      // ✅ For connect/probe tools: allow click on node OR on existing WIRE (auto split -> new node)
      let hit = findNodeNear(p, 14);
  
      if (!hit) {
        const w = findWireNear(p, 10);
        if (w) {
          const newId = splitWireAt(w.wire, w.proj);
          if (newId) {
            hit = nodes.find(n => n.id === newId);
            setStatus(`Nod N${newId} creat pe sârmă.`, 'ok');
          }
        }
      }
  
      if (!hit) { setStatus('Click pe un nod (sau pe o sârmă ca să creez nod).', 'warn'); return; }
  
      if (!pickedNode) {
        pickedNode = hit.id;
        setPickHint();
        draw();
        return;
      }
  
      const aId = pickedNode;
      const bId = hit.id;
  
      pickedNode = null;
      setPickHint();
  
      if (tool === Tools.V) addProbe(aId, bId);
      else connectElement(tool, aId, bId);
  
      lastSolution = null;
      draw();
    });
  
    // ========= Drawing =========
    function drawGrid() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const step = 24;
  
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = '#2a3a5f';
      ctx.lineWidth = 1;
  
      for (let x = 0; x < w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
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
  
    function labelBubble(x, y, text) {
      ctx.save();
      ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
      const tw = ctx.measureText(text).width;
      const padX = 8, padY = 6;
  
      ctx.fillStyle = 'rgba(10,16,30,0.85)';
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.2;
  
      roundRectScreen(x - (tw / 2 + padX), y - (12 / 2 + padY), tw + padX * 2, 12 + padY * 2, 10);
      ctx.fill(); ctx.stroke();
  
      ctx.fillStyle = '#e8f0ff';
      ctx.fillText(text, x - tw / 2, y + 4);
      ctx.restore();
    }
  
    function draw() {
      drawGrid();
  
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
  
    function drawPickRing(x, y) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,77,77,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  
    function drawNode(n, isSelected) {
      ctx.save();
      const r = 9;
      ctx.fillStyle = n.isGnd ? 'rgba(70,211,122,0.95)' : 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
      if (isSelected) {
        ctx.strokeStyle = 'rgba(255,77,77,0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2); ctx.stroke();
      }
  
      const text = n.isGnd ? `N${n.id} (GND)` : `N${n.id}`;
      ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
      const tw = ctx.measureText(text).width;
      const x = n.x + 12, y = n.y - 14;
  
      ctx.fillStyle = 'rgba(10,16,30,0.85)';
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1.2;
      roundRectScreen(x, y, tw + 16, 26, 10);
      ctx.fill(); ctx.stroke();
  
      ctx.fillStyle = '#e8f0ff';
      ctx.fillText(text, x + 8, y + 17);
      ctx.restore();
    }
  
    // ✅ Schematic elements:
    // - WIRE: visible full line
    // - Others: have a faint "backbone wire" full line + normal leads + symbol
    function drawElement(e, na, nb, isSelected) {
      const ax = na.x, ay = na.y, bx = nb.x, by = nb.y;
  
      // selection glow
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,77,77,0.35)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.restore();
      }
  
      // ✅ WIRE drawn fully (no gaps)
      if (e.type === 'WIRE') {
        ctx.save();
        ctx.strokeStyle = isSelected ? 'rgba(255,77,77,0.85)' : 'rgba(232,240,255,0.70)';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.restore();
        return;
      }
  
      // ✅ faint backbone wire for ANY component so "sârma" is always visible
      ctx.save();
      ctx.strokeStyle = 'rgba(232,240,255,0.22)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.restore();
  
      // geometry
      const dx = bx - ax, dy = by - ay;
      const L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L;
      const px = -uy, py = ux;
  
      const lead = 18;
      const a1x = ax + ux * lead, a1y = ay + uy * lead;
      const b1x = bx - ux * lead, b1y = by - uy * lead;
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
  
      ctx.save();
      ctx.strokeStyle = 'rgba(232,240,255,0.88)';
      ctx.fillStyle = 'rgba(232,240,255,0.88)';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
  
      // leads (wire from node to symbol)
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(a1x, a1y);
      ctx.moveTo(b1x, b1y); ctx.lineTo(bx, by);
      ctx.stroke();
  
      // local transform around midpoint
      const X = (t, s) => mx + ux * t + px * s;
      const Y = (t, s) => my + uy * t + py * s;
  
      switch (e.type) {
        case 'R':  drawResistorRect(X, Y, 0, 0, 44, 16, false); break;
        case 'RH': drawResistorRect(X, Y, 0, 0, 56, 18, true); break;
        case 'BAT': drawBattery(X, Y, 0, 0); break;
        case 'A': drawMeterCircle(X, Y, 0, 0, 'A'); break;
        default: drawResistorRect(X, Y, 0, 0, 44, 16, false); break;
      }
  
      ctx.restore();
  
      // labels
      if (e.type === 'R') {
        labelBubble(mx, my + py * 26, `${fmt(e.value ?? 100)}Ω`);
      } else if (e.type === 'RH') {
        labelBubble(mx, my + py * 28, `Rmax ${fmt(e.value ?? 500)}Ω`);
      } else if (e.type === 'BAT') {
        labelBubble(mx, my + py * 28, `${fmt(e.value ?? 9)}V`);
        // + / - near ends
        ctx.save();
        ctx.font = '14px ui-sans-serif, system-ui';
        ctx.fillStyle = 'rgba(255,77,77,0.95)';
        ctx.fillText('+', ax + ux * 10 + px * (-12), ay + uy * 10 + py * (-12));
        ctx.fillStyle = 'rgba(70,211,122,0.95)';
        ctx.fillText('−', bx - ux * 10 + px * (-12), by - uy * 10 + py * (-12));
        ctx.restore();
      } else if (e.type === 'A') {
        if (lastSolution?.elemResults) {
          const r = lastSolution.elemResults.find(x => x.id === e.id && x.type === 'A');
          if (r) labelBubble(mx, my + py * 28, `I ${fmt(r.I)}A`);
        }
      }
    }
  
    function drawResistorRect(X, Y, t0, s0, w, h, rheostat) {
      const x0 = X(t0 - w / 2, s0 - h / 2), y0 = Y(t0 - w / 2, s0 - h / 2);
      const x1 = X(t0 + w / 2, s0 - h / 2), y1 = Y(t0 + w / 2, s0 - h / 2);
      const x2 = X(t0 + w / 2, s0 + h / 2), y2 = Y(t0 + w / 2, s0 + h / 2);
      const x3 = X(t0 - w / 2, s0 + h / 2), y3 = Y(t0 - w / 2, s0 + h / 2);
  
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.stroke();
  
      if (rheostat) {
        // arrow cursor
        const sx = X(t0 - w / 2 + 6, s0 - h / 2 - 12);
        const sy = Y(t0 - w / 2 + 6, s0 - h / 2 - 12);
        const ex = X(t0 + 8, s0);
        const ey = Y(t0 + 8, s0);
  
        ctx.beginPath();
        ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.stroke();
  
        drawArrowHead(ex, ey, sx, sy);
      }
    }
  
    function drawBattery(X, Y, t0, s0) {
      const gap = 10;
      const shortLen = 14;
      const longLen = 22;
  
      const tShort = t0 - gap / 2;
      const tLong = t0 + gap / 2;
  
      ctx.beginPath();
      ctx.moveTo(X(tShort, -shortLen / 2), Y(tShort, -shortLen / 2));
      ctx.lineTo(X(tShort, +shortLen / 2), Y(tShort, +shortLen / 2));
      ctx.stroke();
  
      ctx.beginPath();
      ctx.moveTo(X(tLong, -longLen / 2), Y(tLong, -longLen / 2));
      ctx.lineTo(X(tLong, +longLen / 2), Y(tLong, +longLen / 2));
      ctx.stroke();
    }
  
    function drawMeterCircle(X, Y, t0, s0, letter) {
      const r = 16;
      ctx.beginPath();
      ctx.arc(X(t0, s0), Y(t0, s0), r, 0, Math.PI * 2);
      ctx.stroke();
  
      ctx.save();
      ctx.fillStyle = '#e8f0ff';
      ctx.font = '14px ui-sans-serif, system-ui';
      const tx = X(t0, s0), ty = Y(t0, s0);
      const w = ctx.measureText(letter).width;
      ctx.fillText(letter, tx - w / 2, ty + 5);
      ctx.restore();
    }
  
    function drawArrowHead(xTip, yTip, xFrom, yFrom) {
      const ang = Math.atan2(yTip - yFrom, xTip - xFrom);
      const size = 8;
      ctx.save();
      ctx.fillStyle = 'rgba(232,240,255,0.88)';
      ctx.beginPath();
      ctx.moveTo(xTip, yTip);
      ctx.lineTo(xTip - size * Math.cos(ang - Math.PI / 6), yTip - size * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(xTip - size * Math.cos(ang + Math.PI / 6), yTip - size * Math.sin(ang + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
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
      ctx.strokeStyle = isSelected ? 'rgba(255,77,77,0.85)' : 'rgba(232,240,255,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
  
      ctx.strokeStyle = isSelected ? 'rgba(255,77,77,0.95)' : 'rgba(232,240,255,0.80)';
      ctx.fillStyle = 'rgba(232,240,255,0.88)';
      ctx.lineWidth = 2.6;
  
      const X = (t, s) => mx + ux * t + px * s;
      const Y = (t, s) => my + uy * t + py * s;
      drawMeterCircle(X, Y, 0, 0, 'V');
  
      if (lastSolution?.Vnode) {
        const Va = lastSolution.Vnode.get(pr.a);
        const Vb = lastSolution.Vnode.get(pr.b);
        if (typeof Va === 'number' && typeof Vb === 'number') {
          labelBubble(mx, my + py * 30, `ΔV ${fmt(Va - Vb)}V`);
        }
      }
      ctx.restore();
    }
  
    // ========= Solver (MNA) =========
    function solveCircuit() {
      const gnd = nodes.find(n => n.isGnd);
      if (!gnd) { setStatus('Nu ai GND. Setează un nod ca masă (GND).', 'warn'); return null; }
  
      const resistive = elements.filter(e => e.type !== 'BAT');
      const sources = elements.filter(e => e.type === 'BAT');
  
      const nodeIds = nodes.map(n => n.id);
      const nongnd = nodeIds.filter(id => id !== gnd.id);
      const nV = nongnd.length;
      const m = sources.length;
      const N = nV + m;
  
      if (N === 0) { setStatus('Nimic de rezolvat.', 'warn'); return null; }
  
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
        if (ia !== -1 && ib !== -1) {
          A[ia][ib] -= g;
          A[ib][ia] -= g;
        }
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
      if (!x) { setStatus('Nu pot rezolva: circuit singular (flotant / lipsă conexiuni / surse conflict).', 'warn'); return null; }
  
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
  
      nodeOut.textContent = nodes
        .slice().sort((a, b) => a.id - b.id)
        .map(n => `N${n.id}${n.isGnd ? '(GND)' : ''} = ${fmt(Vnode.get(n.id))} V`)
        .join('\n') || '—';
  
      branchOut.textContent = elemResults.map(r => {
        if (r.type === 'BAT') return `BAT${r.id} (+N${r.a},-N${r.b})  I=${fmt(r.I)} A   P=${fmt(r.P)} W`;
        const name = (r.type === 'R') ? 'R' : (r.type === 'RH') ? 'RH' : r.type;
        return `${name}${r.id} (N${r.a}->N${r.b})  I=${fmt(r.I)} A   P=${fmt(r.P)} W`;
      }).join('\n') || '—';
  
      setStatus(
        shortWarn
          ? 'Rezolvat. Warning: curenți mari / aproape scurt (wire/ammeter).'
          : 'Rezolvat. Kirchhoff + Ohm aplicate.',
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
  
        if (pivot !== col) {
          [M[pivot], M[col]] = [M[col], M[pivot]];
          [z[pivot], z[col]] = [z[col], z[pivot]];
        }
  
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
  
    // ========= Init =========
    function init() {
      fit();
      window.addEventListener('resize', () => { fit(); draw(); });
  
      setTool(Tools.SELECT);
      setStatus('Ready. Începe cu Nod + GND + Wire/Rezistoare.', 'ok');
      updateSelectionUI();
      draw();
    }
  
    init();
  })();
  