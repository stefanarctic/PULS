/* ============================================================
   Fuel Cell Simulator
   - Canvas rendering (HiDPI aware, virtual design space 800x500)
   - Particles: H2, O2, electrons, protons, water
   - Model: simple & intuitive (not electrochemistry hardcore)
   ============================================================ */

(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const tooltipEl = document.getElementById('tooltip');

  const simT = (path, ro) =>
    typeof window.simLbl === 'function' ? window.simLbl(path, ro) : ro;

  /* ---------- STATE ---------- */
  const state = {
    flowH2: 60,
    flowO2: 60,
    temp: 65,
    resistance: 10,
    // derived
    current: 0,
    voltage: 0,
    power: 0,
    efficiency: 0,
    bulbGlow: 0,       // smoothed, pulsing glow 0..~1.2
    bulbGlowTarget: 0, // target value (raw)
    time: 0,           // accumulated sim time (s)
    reactionOff: false,
  };

  /* ---------- DESIGN SPACE ---------- */
  // Everything is authored in this 800x500 space.
  // We scale the canvas to fit.
  const W = 800;
  const H = 500;

  // Positions (design coords)
  const LAYOUT = {
    h2Tank:   { x: 50,  y: 140, w: 90,  h: 260 },
    o2Tank:   { x: 660, y: 140, w: 90,  h: 260 },
    cell:     { x: 250, y: 170, w: 300, h: 240 },
    anode:    { x: 250, y: 170, w: 90,  h: 240 },
    membrane: { x: 340, y: 170, w: 120, h: 240 },
    cathode:  { x: 460, y: 170, w: 90,  h: 240 },
    // wire path (top circuit)
    wireTop:  90,
    bulb:     { x: 400, y: 90, r: 26 },
  };

  // Tube connection points
  const TUBES = {
    h2In:  { x1: 140, y1: 290, x2: 250, y2: 290 }, // from h2 tank into anode
    o2In:  { x1: 660, y1: 290, x2: 550, y2: 290 }, // from o2 tank into cathode
    waterOut: { x: 505, y: 410 },
  };

  // Electron path (along wire, from anode top → up → right → down → cathode top)
  const ePath = [
    { x: 295, y: 170 },  // top of anode
    { x: 295, y: LAYOUT.wireTop },
    { x: 505, y: LAYOUT.wireTop },
    { x: 505, y: 170 },  // top of cathode
  ];

  // Precompute cumulative lengths for electron path
  const ePathSegs = [];
  let ePathTotal = 0;
  for (let i = 0; i < ePath.length - 1; i++) {
    const a = ePath[i], b = ePath[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    ePathSegs.push({ a, b, len, start: ePathTotal });
    ePathTotal += len;
  }

  function pointOnEPath(t) {
    // t: 0..1 along path
    const dist = t * ePathTotal;
    for (const seg of ePathSegs) {
      if (dist <= seg.start + seg.len) {
        const localT = (dist - seg.start) / seg.len;
        return {
          x: seg.a.x + (seg.b.x - seg.a.x) * localT,
          y: seg.a.y + (seg.b.y - seg.a.y) * localT,
        };
      }
    }
    const last = ePath[ePath.length - 1];
    return { x: last.x, y: last.y };
  }

  /* ---------- PARTICLES ---------- */
  const electrons = [];
  const protons = [];
  const h2Mols = [];
  const o2Mols = [];
  const water = [];

  const MAX_ELECTRONS = 80;
  const MAX_PROTONS = 60;
  const MAX_H2 = 40;
  const MAX_O2 = 40;
  const MAX_WATER = 50;

  /* ---------- MODEL ---------- */
  function updateModel() {
    const fH2 = state.flowH2 / 100;
    const fO2 = state.flowO2 / 100;
    const minF = Math.min(fH2, fO2);
    const maxF = Math.max(fH2, fO2);

    // Temperature factor (0.6 at 20°C → 1.0 at 90°C)
    const tempFactor = 0.6 + 0.4 * ((state.temp - 20) / 70);

    // Reactant-limited max current (A)
    const I_max = 3.2 * minF * tempFactor;

    // Open circuit voltage (V) — slight bump with temp
    const V_oc = 1.0 + 0.0015 * (state.temp - 20);

    // Load current (Ohm's law through bulb resistance)
    const I_load = V_oc / state.resistance;

    // Actual current is limited by whichever is smaller
    const I = Math.min(I_max, I_load);
    const V = I * state.resistance;
    const P = V * I;

    state.current = I;
    state.voltage = V;
    state.power = P;
    state.efficiency = (minF === 0 && maxF === 0)
      ? 0
      : (maxF === 0 ? 0 : (minF / maxF) * 100);

    // Bulb glow target 0..1
    state.bulbGlowTarget = Math.min(1, P / 1.8);
    state.reactionOff = (state.flowH2 === 0 || state.flowO2 === 0);
  }

  /* Smooth + pulse the bulb glow.
     - ease toward target (prevents instant jumps)
     - add subtle pulse whose intensity scales with current */
  function updateBulbGlow(dt) {
    // ease toward target (faster to turn on than off feels snappier)
    const diff = state.bulbGlowTarget - state.bulbGlow;
    const ease = diff > 0 ? 6 : 3;
    state.bulbGlow += diff * Math.min(1, ease * dt);

    // subtle pulse: bigger when hotter; invisible when off
    if (state.bulbGlow > 0.02) {
      const pulseAmp = 0.05 + 0.12 * state.bulbGlow;
      const pulse = Math.sin(state.time * 4.5) * pulseAmp;
      state.bulbGlowRender = Math.max(0, state.bulbGlow + pulse);
    } else {
      state.bulbGlowRender = 0;
    }
  }

  /* ---------- PARTICLE SPAWNING ---------- */
  let spawnAccum = { e: 0, p: 0, h: 0, o: 0, w: 0 };

  function spawnParticles(dt) {
    const I = state.current;
    const fH2 = state.flowH2 / 100;
    const fO2 = state.flowO2 / 100;

    // Rates per second
    const eRate = I * 22;            // electrons per sec (proportional to current)
    const pRate = I * 18;            // protons
    const h2Rate = fH2 * 8;          // H2 molecules moving in
    const o2Rate = fO2 * 8;          // O2 molecules moving in
    const wRate = I * 14;            // water droplets (more visible)

    spawnAccum.e += eRate * dt;
    spawnAccum.p += pRate * dt;
    spawnAccum.h += h2Rate * dt;
    spawnAccum.o += o2Rate * dt;
    spawnAccum.w += wRate * dt;

    while (spawnAccum.e >= 1 && electrons.length < MAX_ELECTRONS) {
      const baseSpeed = 0.35 + I * 0.15;
      electrons.push({
        t: 0,
        speed: baseSpeed * (0.75 + Math.random() * 0.5), // ±25% variation
        jitter: Math.random() * Math.PI * 2,             // phase for tiny wobble
        prevT: 0,
      });
      spawnAccum.e -= 1;
    }
    while (spawnAccum.p >= 1 && protons.length < MAX_PROTONS) {
      protons.push({
        x: LAYOUT.membrane.x,
        y: LAYOUT.membrane.y + 20 + Math.random() * (LAYOUT.membrane.h - 40),
        vx: 45 + I * 18,
        vy: (Math.random() - 0.5) * 12,
      });
      spawnAccum.p -= 1;
    }
    while (spawnAccum.h >= 1 && h2Mols.length < MAX_H2) {
      h2Mols.push({
        x: LAYOUT.h2Tank.x + 10 + Math.random() * (LAYOUT.h2Tank.w - 20),
        y: LAYOUT.h2Tank.y + 10 + Math.random() * (LAYOUT.h2Tank.h - 40),
        phase: Math.random() * Math.PI * 2,
        life: 0,
        stage: 'tank', // 'tank' then 'tube' then 'consume'
      });
      spawnAccum.h -= 1;
    }
    while (spawnAccum.o >= 1 && o2Mols.length < MAX_O2) {
      o2Mols.push({
        x: LAYOUT.o2Tank.x + 10 + Math.random() * (LAYOUT.o2Tank.w - 20),
        y: LAYOUT.o2Tank.y + 10 + Math.random() * (LAYOUT.o2Tank.h - 40),
        phase: Math.random() * Math.PI * 2,
        life: 0,
        stage: 'tank',
      });
      spawnAccum.o -= 1;
    }
    while (spawnAccum.w >= 1 && water.length < MAX_WATER) {
      water.push({
        x: TUBES.waterOut.x + (Math.random() - 0.5) * 22,
        y: TUBES.waterOut.y - 4,
        vx: (Math.random() - 0.5) * 14,
        vy: 30 + Math.random() * 35,
        life: 0,
        maxLife: 1.6 + Math.random() * 0.5,
        size: 2.8 + Math.random() * 2.4,
      });
      spawnAccum.w -= 1;
    }
  }

  /* ---------- PARTICLE UPDATE ---------- */
  function updateParticles(dt) {
    // Electrons
    for (let i = electrons.length - 1; i >= 0; i--) {
      const e = electrons[i];
      e.t += (e.speed + state.current * 0.12) * dt;
      if (e.t >= 1) electrons.splice(i, 1);
    }

    // Protons
    for (let i = protons.length - 1; i >= 0; i--) {
      const p = protons[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // sinusoidal drift
      p.vy += (Math.sin(p.x * 0.05) * 8 - p.vy) * dt * 2;
      if (p.x > LAYOUT.membrane.x + LAYOUT.membrane.w) {
        protons.splice(i, 1);
      }
    }

    // H2 molecules: float in tank → drift toward tube → get consumed at anode
    for (let i = h2Mols.length - 1; i >= 0; i--) {
      const m = h2Mols[i];
      m.life += dt;
      m.phase += dt * 2;

      if (m.stage === 'tank') {
        m.x += Math.cos(m.phase) * 8 * dt;
        m.y += Math.sin(m.phase * 1.1) * 8 * dt;
        // Keep in tank
        m.x = Math.max(LAYOUT.h2Tank.x + 6, Math.min(LAYOUT.h2Tank.x + LAYOUT.h2Tank.w - 6, m.x));
        m.y = Math.max(LAYOUT.h2Tank.y + 6, Math.min(LAYOUT.h2Tank.y + LAYOUT.h2Tank.h - 6, m.y));
        if (m.life > 1.2 + Math.random() * 0.8) m.stage = 'tube';
      } else if (m.stage === 'tube') {
        // move toward anode
        const targetX = LAYOUT.anode.x + 20;
        const targetY = LAYOUT.anode.y + LAYOUT.anode.h / 2;
        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const d = Math.hypot(dx, dy);
        const sp = 90 + state.flowH2 * 0.8;
        m.x += (dx / d) * sp * dt;
        m.y += (dy / d) * sp * dt;
        if (d < 6) {
          h2Mols.splice(i, 1);
        }
      }
    }

    // O2 molecules (symmetric, toward cathode)
    for (let i = o2Mols.length - 1; i >= 0; i--) {
      const m = o2Mols[i];
      m.life += dt;
      m.phase += dt * 2;

      if (m.stage === 'tank') {
        m.x += Math.cos(m.phase) * 8 * dt;
        m.y += Math.sin(m.phase * 1.1) * 8 * dt;
        m.x = Math.max(LAYOUT.o2Tank.x + 6, Math.min(LAYOUT.o2Tank.x + LAYOUT.o2Tank.w - 6, m.x));
        m.y = Math.max(LAYOUT.o2Tank.y + 6, Math.min(LAYOUT.o2Tank.y + LAYOUT.o2Tank.h - 6, m.y));
        if (m.life > 1.2 + Math.random() * 0.8) m.stage = 'tube';
      } else if (m.stage === 'tube') {
        const targetX = LAYOUT.cathode.x + LAYOUT.cathode.w - 20;
        const targetY = LAYOUT.cathode.y + LAYOUT.cathode.h / 2;
        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const d = Math.hypot(dx, dy);
        const sp = 90 + state.flowO2 * 0.8;
        m.x += (dx / d) * sp * dt;
        m.y += (dy / d) * sp * dt;
        if (d < 6) {
          o2Mols.splice(i, 1);
        }
      }
    }

    // Water
    for (let i = water.length - 1; i >= 0; i--) {
      const w = water[i];
      w.life += dt;
      w.vy += 90 * dt; // stronger gravity → faster fall
      // gentle horizontal sway
      w.vx += Math.sin(state.time * 6 + w.y * 0.08) * 8 * dt;
      w.vx *= 0.98;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      if (w.life >= w.maxLife || w.y > H) water.splice(i, 1);
    }
  }

  /* ---------- DRAWING ---------- */
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawBackground() {
    // Subtle dotted grid for techy feel
    ctx.save();
    ctx.fillStyle = 'rgba(90, 124, 255, 0.06)';
    const step = 20;
    for (let x = 0; x <= W; x += step) {
      for (let y = 0; y <= H; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTank(tank, color, colorSoft, label, fillRatio) {
    const { x, y, w, h } = tank;

    // outer shell
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d7dff0';
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // inner gas area with gradient
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, colorSoft);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.35 + 0.55 * fillRatio;
    roundRect(x + 6, y + 6, w - 12, h - 12, 10);
    ctx.fill();
    ctx.globalAlpha = 1;

    // valve top
    ctx.fillStyle = '#c7d0e3';
    roundRect(x + w / 2 - 14, y - 12, 28, 14, 4);
    ctx.fill();

    // label
    ctx.fillStyle = '#3a4a6a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h + 24);

    ctx.restore();
  }

  function drawTube(a, b) {
    ctx.save();
    ctx.strokeStyle = '#cdd6ea';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFuelCell() {
    const { cell, anode, membrane, cathode } = LAYOUT;

    // outer frame
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c8d2e6';
    ctx.lineWidth = 2;
    roundRect(cell.x - 6, cell.y - 6, cell.w + 12, cell.h + 12, 16);
    ctx.fill();
    ctx.stroke();

    // anode (left plate)
    const gA = ctx.createLinearGradient(anode.x, 0, anode.x + anode.w, 0);
    gA.addColorStop(0, '#ffe4ec');
    gA.addColorStop(1, '#ffc5d8');
    ctx.fillStyle = gA;
    roundRect(anode.x, anode.y, anode.w, anode.h, 10);
    ctx.fill();

    // cathode (right plate)
    const gC = ctx.createLinearGradient(cathode.x, 0, cathode.x + cathode.w, 0);
    gC.addColorStop(0, '#cfeeff');
    gC.addColorStop(1, '#a7dcff');
    ctx.fillStyle = gC;
    roundRect(cathode.x, cathode.y, cathode.w, cathode.h, 10);
    ctx.fill();

    // membrane (PEM) - vertical stripes
    const gM = ctx.createLinearGradient(membrane.x, 0, membrane.x + membrane.w, 0);
    gM.addColorStop(0, '#e8ecff');
    gM.addColorStop(0.5, '#dde2ff');
    gM.addColorStop(1, '#e8ecff');
    ctx.fillStyle = gM;
    ctx.fillRect(membrane.x, membrane.y, membrane.w, membrane.h);

    // membrane pattern
    ctx.strokeStyle = 'rgba(90, 124, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const xx = membrane.x + 10 + i * ((membrane.w - 20) / 6);
      ctx.beginPath();
      ctx.moveTo(xx, membrane.y + 6);
      ctx.lineTo(xx, membrane.y + membrane.h - 6);
      ctx.stroke();
    }

    // labels
    ctx.fillStyle = '#8a2a54';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(simT('canvas.anode', 'ANOD (−)'), anode.x + anode.w / 2, anode.y + anode.h + 22);

    ctx.fillStyle = '#1c5a8a';
    ctx.fillText(
      simT('canvas.cathode', 'CATOD (+)'),
      cathode.x + cathode.w / 2,
      cathode.y + cathode.h + 22
    );

    ctx.fillStyle = '#5a6bb0';
    ctx.font = '11px sans-serif';
    ctx.fillText(simT('canvas.pem', 'PEM'), membrane.x + membrane.w / 2, membrane.y - 8);

    ctx.restore();
  }

  function drawWire() {
    ctx.save();
    // thick base
    ctx.strokeStyle = '#b8c3db';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ePath[0].x, ePath[0].y);
    for (let i = 1; i < ePath.length; i++) ctx.lineTo(ePath[i].x, ePath[i].y);
    ctx.stroke();

    // highlight
    ctx.strokeStyle = '#e7ecf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ePath[0].x, ePath[0].y);
    for (let i = 1; i < ePath.length; i++) ctx.lineTo(ePath[i].x, ePath[i].y);
    ctx.stroke();

    ctx.restore();
  }

  function drawBulb() {
    const { x, y, r } = LAYOUT.bulb;
    const glow = state.bulbGlowRender || 0;

    ctx.save();

    // outer wide halo (dramatic at high current)
    if (glow > 0.01) {
      const haloR = r + 40 + glow * 110;
      const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, haloR);
      halo.addColorStop(0, `rgba(255, 230, 120, ${Math.min(0.75, 0.45 + glow * 0.4)})`);
      halo.addColorStop(0.45, `rgba(255, 200, 80, ${0.22 * glow})`);
      halo.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, haloR, 0, Math.PI * 2);
      ctx.fill();

      // secondary tighter flare
      const flareR = r + 10 + glow * 24;
      const flare = ctx.createRadialGradient(x, y, 0, x, y, flareR);
      flare.addColorStop(0, `rgba(255, 250, 210, ${Math.min(0.95, 0.5 + glow * 0.5)})`);
      flare.addColorStop(1, 'rgba(255, 250, 210, 0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(x, y, flareR, 0, Math.PI * 2);
      ctx.fill();
    }

    // socket
    ctx.fillStyle = '#9aa6bf';
    roundRect(x - 14, y + r - 4, 28, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#b8c3db';
    roundRect(x - 11, y + r + 6, 22, 4, 2);
    ctx.fill();

    // glass
    const bulbGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
    const topCol = glow > 0 ? `rgba(255, 240, 170, ${Math.min(1, 0.45 + glow * 0.6)})` : 'rgba(245, 248, 255, 1)';
    const botCol = glow > 0 ? `rgba(255, 180, 40, ${Math.min(1, 0.35 + glow * 0.65)})` : 'rgba(225, 231, 245, 1)';
    bulbGrad.addColorStop(0, topCol);
    bulbGrad.addColorStop(1, botCol);
    ctx.fillStyle = bulbGrad;
    ctx.strokeStyle = glow > 0.05 ? '#ffae2e' : '#c4cde0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // filament (brighter + glow at high current)
    if (glow > 0.05) {
      ctx.shadowColor = 'rgba(255, 160, 0, 0.9)';
      ctx.shadowBlur = 6 + glow * 14;
    }
    ctx.strokeStyle = glow > 0.05 ? '#ff6a00' : '#aab4cc';
    ctx.lineWidth = 1.5 + glow * 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 4);
    ctx.quadraticCurveTo(x - 4, y - 6, x, y + 2);
    ctx.quadraticCurveTo(x + 4, y + 10, x + 8, y + 4);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // shine
    ctx.fillStyle = `rgba(255,255,255,${0.5 + glow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x - r * 0.4, y - r * 0.45, 5, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawParticles() {
    // H2 molecules (two-atom dumbbell shape)
    for (const m of h2Mols) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(Math.sin(m.phase) * 0.5);
      ctx.fillStyle = '#ff6b9d';
      ctx.beginPath(); ctx.arc(-3, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 107, 157, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke();
      ctx.restore();
    }

    // O2 molecules
    for (const m of o2Mols) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(Math.sin(m.phase) * 0.5);
      ctx.fillStyle = '#31b6ff';
      ctx.beginPath(); ctx.arc(-4, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(49, 182, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();
      ctx.restore();
    }

    // Protons
    for (const p of protons) {
      ctx.save();
      ctx.fillStyle = '#ffb347';
      ctx.shadowColor = 'rgba(255, 179, 71, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // plus sign
      ctx.fillStyle = '#7a4a00';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', p.x, p.y);
      ctx.restore();
    }

    // Electrons (with glow trail)
    const TRAIL_SAMPLES = 6;
    const TRAIL_LEN = 0.04; // in path-t units
    for (const e of electrons) {
      const pt = pointOnEPath(e.t);

      ctx.save();

      // Trail: a few fading dots behind the electron
      for (let s = TRAIL_SAMPLES; s >= 1; s--) {
        const tt = Math.max(0, e.t - (TRAIL_LEN * s) / TRAIL_SAMPLES);
        const tp = pointOnEPath(tt);
        const alpha = (1 - s / (TRAIL_SAMPLES + 1)) * 0.45;
        const rad = 3.4 * (1 - s / (TRAIL_SAMPLES + 2));
        ctx.fillStyle = `rgba(59, 124, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // tiny perpendicular wobble for "life"
      const wob = Math.sin(state.time * 10 + e.jitter) * 0.8;
      // find tangent via two close path samples
      const tb = Math.min(1, e.t + 0.005);
      const ta = Math.max(0, e.t - 0.005);
      const pa = pointOnEPath(ta), pb = pointOnEPath(tb);
      const tx = pb.x - pa.x, ty = pb.y - pa.y;
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const ex = pt.x + nx * wob;
      const ey = pt.y + ny * wob;

      // main body with glow
      ctx.fillStyle = '#3b7cff';
      ctx.shadowColor = 'rgba(59, 124, 255, 0.9)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ex, ey, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // highlight dot
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(ex - 1, ey - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // "−" label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('−', ex, ey);
      ctx.restore();
    }

    // Water droplets
    for (const w of water) {
      const alpha = 1 - (w.life / w.maxLife);
      ctx.save();
      // soft aqua glow
      ctx.shadowColor = `rgba(56, 197, 200, ${alpha * 0.8})`;
      ctx.shadowBlur = 6;
      // teardrop shape (elongated in fall direction)
      const stretch = 1 + Math.min(0.8, w.vy / 120);
      ctx.fillStyle = `rgba(38, 180, 200, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, w.size, w.size * stretch, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // inner bright highlight
      ctx.fillStyle = `rgba(180, 240, 245, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(w.x - w.size * 0.3, w.y - w.size * 0.4, w.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // white sparkle
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(w.x - w.size * 0.4, w.y - w.size * 0.5, w.size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* A continuous flowing stream at the cathode water outlet.
     Visible only when current is producing water. */
  function drawWaterStream() {
    const I = state.current;
    if (I < 0.02) return;

    const strength = Math.min(1, I / 1.5);
    const baseX = TUBES.waterOut.x;
    const baseY = TUBES.waterOut.y - 10;

    ctx.save();

    // Vertical gradient stream
    const grad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + 40);
    grad.addColorStop(0, `rgba(56, 197, 200, ${0.55 * strength})`);
    grad.addColorStop(1, `rgba(56, 197, 200, 0)`);
    ctx.fillStyle = grad;
    const streamW = 10 + strength * 6;
    ctx.beginPath();
    ctx.moveTo(baseX - streamW / 2, baseY);
    ctx.quadraticCurveTo(baseX, baseY + 20, baseX - streamW / 3, baseY + 40);
    ctx.lineTo(baseX + streamW / 3, baseY + 40);
    ctx.quadraticCurveTo(baseX, baseY + 20, baseX + streamW / 2, baseY);
    ctx.closePath();
    ctx.fill();

    // Animated shimmer lines
    ctx.strokeStyle = `rgba(160, 230, 235, ${0.5 * strength})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const offset = (state.time * 60 + i * 14) % 40;
      ctx.beginPath();
      ctx.moveTo(baseX - 2 + Math.sin(state.time * 3 + i) * 2, baseY + offset);
      ctx.lineTo(baseX + 2 + Math.sin(state.time * 3 + i) * 2, baseY + offset + 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* "Reacție oprită" — subtle centered label that pulses gently.
     Shown when H2 = 0 or O2 = 0. */
  function drawReactionOff() {
    const cx = LAYOUT.cell.x + LAYOUT.cell.w / 2;
    const cy = LAYOUT.cell.y + LAYOUT.cell.h / 2;

    // pulsing alpha
    const pulse = 0.55 + 0.25 * Math.sin(state.time * 2.4);
    const label = simT('canvas.reactionOff', 'Reacție oprită');

    ctx.save();

    ctx.font = '600 13px -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    const badgeW = Math.max(170, tw + 52);
    const badgeH = 34;

    // soft badge background
    ctx.fillStyle = `rgba(255, 255, 255, ${0.82 * pulse})`;
    ctx.strokeStyle = `rgba(192, 57, 43, ${0.55 * pulse})`;
    ctx.lineWidth = 1.5;
    roundRect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 17);
    ctx.fill();
    ctx.stroke();

    // dot
    ctx.fillStyle = `rgba(192, 57, 43, ${pulse})`;
    ctx.beginPath();
    ctx.arc(cx - badgeW / 2 + 16, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // text
    ctx.fillStyle = `rgba(120, 30, 30, ${pulse})`;
    ctx.fillText(label, cx, cy);

    ctx.restore();
  }

  function drawWaterPool() {
    // Small pool/tray where water drips
    ctx.save();
    ctx.fillStyle = 'rgba(56, 197, 200, 0.18)';
    roundRect(TUBES.waterOut.x - 28, TUBES.waterOut.y + 30, 56, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#7a8aab';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('H₂O', TUBES.waterOut.x, TUBES.waterOut.y + 58);
    ctx.restore();
  }

  /* ---------- MAIN RENDER ---------- */
  let dpr = 1;
  let scale = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    scale = Math.min(rect.width / W, rect.height / H);
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    // offsets to center the design in the canvas if aspect mismatches slightly
    const offX = (rect.width - W * scale) / 2;
    const offY = (rect.height - H * scale) / 2;

    clear();
    ctx.save();
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);

    drawBackground();

    // Tubes behind everything
    drawTube(TUBES.h2In, null);
    drawTube(TUBES.o2In, null);

    // Tanks
    drawTank(
      LAYOUT.h2Tank,
      '#ff6b9d',
      '#ffd6e3',
      simT('canvas.h2Tank', 'H₂ Tank'),
      state.flowH2 / 100
    );
    drawTank(
      LAYOUT.o2Tank,
      '#31b6ff',
      '#cfeeff',
      simT('canvas.o2Tank', 'O₂ Tank'),
      state.flowO2 / 100
    );

    // Cell
    drawFuelCell();

    // Wire
    drawWire();

    // Bulb
    drawBulb();

    // Continuous water stream (behind droplets)
    drawWaterStream();

    // Water pool at bottom
    drawWaterPool();

    // Particles on top
    drawParticles();

    // Hover highlight
    if (hoverRegion) {
      drawHoverHighlight(hoverRegion);
    }

    // Reaction-off overlay
    if (state.reactionOff) {
      drawReactionOff();
    }

    ctx.restore();
  }

  /* ---------- HOVER / TOOLTIPS ---------- */
  function inRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  const REGIONS = [
    {
      id: 'anode',
      title: simT('regions.anode.title', 'Anod (−)'),
      desc: simT(
        'regions.anode.desc',
        'Aici H₂ se descompune în <b>protoni</b> (H⁺) + <b>electroni</b> (e⁻).'
      ),
      hit: (x, y) => inRect(x, y, LAYOUT.anode),
    },
    {
      id: 'membrane',
      title: simT('regions.membrane.title', 'Membrană PEM'),
      desc: simT(
        'regions.membrane.desc',
        'Lasă să treacă doar <b>protonii</b>. Blochează electronii → aceștia sunt forțați pe fir.'
      ),
      hit: (x, y) => inRect(x, y, LAYOUT.membrane),
    },
    {
      id: 'cathode',
      title: simT('regions.cathode.title', 'Catod (+)'),
      desc: simT(
        'regions.cathode.desc',
        'Protoni + electroni + O₂ → <b>H₂O</b>. Apa iese din celulă.'
      ),
      hit: (x, y) => inRect(x, y, LAYOUT.cathode),
    },
    {
      id: 'bulb',
      title: simT('regions.bulb.title', 'Consumator (bec)'),
      desc: simT(
        'regions.bulb.desc',
        'Electronii trec prin el și îl aprind. Luminozitatea = <b>putere</b>.'
      ),
      hit: (x, y) =>
        Math.hypot(x - LAYOUT.bulb.x, y - LAYOUT.bulb.y) <= LAYOUT.bulb.r + 6,
    },
    {
      id: 'h2tank',
      title: simT('regions.h2tank.title', 'Rezervor H₂'),
      desc: simT(
        'regions.h2tank.desc',
        'Sursă de hidrogen. Crește debitul pentru mai multe molecule.'
      ),
      hit: (x, y) => inRect(x, y, LAYOUT.h2Tank),
    },
    {
      id: 'o2tank',
      title: simT('regions.o2tank.title', 'Rezervor O₂'),
      desc: simT(
        'regions.o2tank.desc',
        'Sursă de oxigen. Fără O₂, reacția se oprește.'
      ),
      hit: (x, y) => inRect(x, y, LAYOUT.o2Tank),
    },
  ];

  let hoverRegion = null;

  function drawHoverHighlight(region) {
    ctx.save();
    ctx.strokeStyle = 'rgba(90, 124, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    if (region.id === 'anode') {
      roundRect(LAYOUT.anode.x - 2, LAYOUT.anode.y - 2, LAYOUT.anode.w + 4, LAYOUT.anode.h + 4, 12);
      ctx.stroke();
    } else if (region.id === 'membrane') {
      ctx.strokeRect(LAYOUT.membrane.x - 2, LAYOUT.membrane.y - 2, LAYOUT.membrane.w + 4, LAYOUT.membrane.h + 4);
    } else if (region.id === 'cathode') {
      roundRect(LAYOUT.cathode.x - 2, LAYOUT.cathode.y - 2, LAYOUT.cathode.w + 4, LAYOUT.cathode.h + 4, 12);
      ctx.stroke();
    } else if (region.id === 'bulb') {
      ctx.beginPath();
      ctx.arc(LAYOUT.bulb.x, LAYOUT.bulb.y, LAYOUT.bulb.r + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (region.id === 'h2tank') {
      roundRect(LAYOUT.h2Tank.x - 2, LAYOUT.h2Tank.y - 2, LAYOUT.h2Tank.w + 4, LAYOUT.h2Tank.h + 4, 16);
      ctx.stroke();
    } else if (region.id === 'o2tank') {
      roundRect(LAYOUT.o2Tank.x - 2, LAYOUT.o2Tank.y - 2, LAYOUT.o2Tank.w + 4, LAYOUT.o2Tank.h + 4, 16);
      ctx.stroke();
    }
    ctx.restore();
  }

  function canvasPointToDesign(evt) {
    const rect = canvas.getBoundingClientRect();
    const px = evt.clientX - rect.left;
    const py = evt.clientY - rect.top;
    const offX = (rect.width - W * scale) / 2;
    const offY = (rect.height - H * scale) / 2;
    return {
      x: (px - offX) / scale,
      y: (py - offY) / scale,
      px,
      py,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPointToDesign(e);
    let found = null;
    for (const r of REGIONS) {
      if (r.hit(p.x, p.y)) { found = r; break; }
    }
    hoverRegion = found;
    if (found) {
      tooltipEl.hidden = false;
      tooltipEl.innerHTML = `<div style="font-weight:700;margin-bottom:2px;">${found.title}</div>${found.desc}`;
      tooltipEl.style.left = `${p.px}px`;
      tooltipEl.style.top = `${p.py}px`;
      canvas.style.cursor = 'pointer';
    } else {
      tooltipEl.hidden = true;
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoverRegion = null;
    tooltipEl.hidden = true;
  });

  /* ---------- LOOP ---------- */
  let lastT = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    state.time += dt;

    updateModel();
    updateBulbGlow(dt);
    spawnParticles(dt);
    updateParticles(dt);
    updateReadouts();

    render();
    requestAnimationFrame(loop);
  }

  /* ---------- UI BINDINGS ---------- */
  function bindSlider(id, key, formatter) {
    const el = document.getElementById(id);
    const out = document.getElementById(id + 'Val');
    const apply = () => {
      state[key] = parseFloat(el.value);
      out.textContent = formatter(state[key]);
    };
    el.addEventListener('input', apply);
    apply();
  }

  bindSlider('flowH2', 'flowH2', (v) => Math.round(v));
  bindSlider('flowO2', 'flowO2', (v) => Math.round(v));
  bindSlider('temp', 'temp', (v) => `${Math.round(v)} °C`);
  bindSlider('resistance', 'resistance', (v) => `${Math.round(v)} Ω`);

  function updateReadouts() {
    document.getElementById('currentOut').textContent = `${state.current.toFixed(2)} A`;
    document.getElementById('voltageOut').textContent = `${state.voltage.toFixed(2)} V`;
    document.getElementById('powerOut').textContent = `${state.power.toFixed(2)} W`;
    document.getElementById('effOut').textContent = `${Math.round(state.efficiency)} %`;

    const hint = document.getElementById('hintMsg');
    if (state.flowH2 === 0 || state.flowO2 === 0) {
      hint.textContent = simT('hints.noReactants', '⚠ Fără reactanți → curent = 0.');
      hint.style.color = '#c0392b';
    } else if (state.efficiency < 60) {
      hint.textContent = simT(
        'hints.imbalance',
        'Dezechilibru H₂ / O₂ → eficiență scăzută.'
      );
      hint.style.color = '#c07200';
    } else if (state.power > 0.5) {
      hint.textContent = simT(
        'hints.producing',
        '⚡ Celula produce energie. Becul strălucește!'
      );
      hint.style.color = '#2a7a4a';
    } else {
      hint.textContent = simT(
        'hints.default',
        'Crește debitele pentru mai multă putere.'
      );
      hint.style.color = '#6b7a99';
    }
  }

  /* ---------- INIT ---------- */
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
