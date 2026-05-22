/* =========================================================
   URANIUM PLAYGROUND · interactions + canvas animations
   ========================================================= */

// ---------- DATA ----------
const ISOTOPES = {
  'U-233': {
    Z: 92, N: 141, A: 233,
    halfLife: 1.592e5,      // 159,200 years
    halfLifeText: '159 200 ani',
    stability: 40,
    stabilityText: 'Redusă',
    color: '#ffaf4a',
    tag: 'artificial · fisil',
    desc: 'Se obține din thoriu-232. Fisionabil ca U-235, studiat pentru reactoare de generație IV.',
    uses: 'Reactor (Th)'
  },
  'U-234': {
    Z: 92, N: 142, A: 234,
    halfLife: 2.455e5,       // 245,500 years
    halfLifeText: '245 500 ani',
    stability: 50,
    stabilityText: 'Redusă',
    color: '#8bc9ff',
    tag: 'natural · urmă',
    desc: 'Apare natural în urma dezintegrării U-238 (≈0.0055% din uraniul natural). Puțin relevant industrial.',
    uses: 'Urmă naturală'
  },
  'U-235': {
    Z: 92, N: 143, A: 235,
    halfLife: 7.038e8,       // 703.8 million years
    halfLifeText: '703.8 mil. ani',
    stability: 70,
    stabilityText: 'Moderată',
    color: '#7cf9c5',
    tag: 'natural · FISIL',
    desc: 'Singurul izotop fisionabil cu neutroni lenți din natură. 0.72% din U natural. Combustibil în reactoare și arme.',
    uses: 'Reactor / armă'
  },
  'U-238': {
    Z: 92, N: 146, A: 238,
    halfLife: 4.468e9,       // 4.468 billion years
    halfLifeText: '4.47 mld. ani',
    stability: 92,
    stabilityText: 'Ridicată',
    color: '#9d7bff',
    tag: 'natural · fertil',
    desc: 'Peste 99% din uraniul natural. Nu fisionează cu n lenți, dar poate capta un neutron și deveni Pu-239 (fisil).',
    uses: 'Combustibil fertil'
  },
};

const DECAY_DAUGHTERS = {
  'U-233': { symbol: 'Th', name: 'Toriu-229', Z: 90, N: 139, A: 229, halfLifeText: '7 340 ani', stability: 35, stabilityText: 'Redusă', nextDecay: 'α' },
  'U-234': { symbol: 'Th', name: 'Toriu-230', Z: 90, N: 140, A: 230, halfLifeText: '75 400 ani', stability: 40, stabilityText: 'Redusă', nextDecay: 'α' },
  'U-235': { symbol: 'Th', name: 'Toriu-231', Z: 90, N: 141, A: 231, halfLifeText: '25,52 ore', stability: 15, stabilityText: 'Foarte redusă', nextDecay: 'β⁻' },
  'U-238': { symbol: 'Th', name: 'Toriu-234', Z: 90, N: 144, A: 234, halfLifeText: '24,10 zile', stability: 10, stabilityText: 'Foarte redusă', nextDecay: 'β⁻' },
};

const LANG_EN = new URLSearchParams(window.location.search).get('lang') === 'en';

function lbl(path, fallback) {
  return typeof window.simLbl === 'function' ? window.simLbl(path, fallback) : fallback;
}

function isoDisplay(key) {
  const base = ISOTOPES[key];
  const ov = window.__SIMULATOR_UI_I18N__?.isotopes?.[key];
  return ov ? { ...base, ...ov } : base;
}

function daughterMerged(key) {
  const base = DECAY_DAUGHTERS[key];
  const ov = window.__SIMULATOR_UI_I18N__?.daughters?.[key];
  return base && ov ? { ...base, ...ov } : base;
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// ---------- UTILS ----------
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  return { ctx, w: rect.width, h: rect.height };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function formatYears(years) {
  if (years < 1e3) return `${years.toFixed(0)} ${lbl('timeFormat.years', 'ani')}`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} ${lbl('timeFormat.kyr', 'mii ani')}`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} ${lbl('timeFormat.Myr', 'mil. ani')}`;
  return `${(years / 1e9).toFixed(2)} ${lbl('timeFormat.Gyr', 'mld. ani')}`;
}

// =========================================================
// 1) INFO CARDS
// =========================================================
function renderCards() {
  const container = document.getElementById('isotopeCards');
  const order = ['U-233', 'U-234', 'U-235', 'U-238'];
  container.innerHTML = order.map(key => {
    const iso = isoDisplay(key);
    return `
      <article class="iso-card" style="--iso-color: ${iso.color};">
        <div class="iso-card-head">
          <h3>${key}</h3>
          <span class="z">Z=${iso.Z} · N=${iso.N}</span>
        </div>
        <span class="iso-card-tag">${iso.tag}</span>
        <div class="iso-stats">
          <div><span>${lbl('cards.statHalfLife', 'T½')}</span><span>${iso.halfLifeText}</span></div>
          <div><span>${lbl('cards.statDecay', 'Dezintegrare')}</span><span>α</span></div>
          <div><span>${lbl('cards.statMass', 'Masa A')}</span><span>${iso.A}</span></div>
          <div><span>${lbl('cards.statUses', 'Utilizare')}</span><span>${iso.uses}</span></div>
        </div>
        <p>${iso.desc}</p>
      </article>
    `;
  }).join('');
}

// =========================================================
// 2) NUCLEUS SIMULATOR
// =========================================================
class NucleusSim {
  constructor(canvas) {
    const s = setupCanvas(canvas);
    this.canvas = canvas;
    this.ctx = s.ctx;
    this.w = s.w;
    this.h = s.h;
    this.cx = s.w / 2;
    this.cy = s.h / 2;

    this.currentIso = 'U-235';
    this.particles = [];
    this.alphaParticle = null;   // { x, y, vx, vy, parts }
    this.decaying = false;
    this.jiggle = 0;

    this.buildNucleus();
    this.loop();
    this.alphaLabel = lbl('canvas.alphaLabel', 'α (He-4)');
  }

  buildNucleus() {
    const iso = ISOTOPES[this.currentIso];
    const total = iso.Z + iso.N;
    const baseR = Math.min(this.w, this.h) * 0.38;
    // particle radius: scale to fit
    const particleR = Math.sqrt((baseR * baseR) / (total * 1.8));

    // fibonacci disk packing
    const positions = [];
    for (let i = 0; i < total; i++) {
      const r = Math.sqrt((i + 0.5) / total) * (baseR - particleR);
      const theta = i * GOLDEN;
      positions.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        baseX: Math.cos(theta) * r,
        baseY: Math.sin(theta) * r,
        r: particleR,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // shuffle and assign types (protons / neutrons mixed)
    const indices = positions.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const protonIdx = new Set(indices.slice(0, iso.Z));

    this.particles = positions.map((p, i) => ({
      ...p,
      type: protonIdx.has(i) ? 'p' : 'n',
    }));
  }

  setIsotope(iso) {
    if (this.decaying) return;
    this.currentIso = iso;
    this.buildNucleus();
  }

  triggerDecay() {
    if (this.decaying) return;
    this.decaying = true;

    // pick 2 protons + 2 neutrons near the edge, grouped close together
    // find particle with max distance from center, then 3 nearest
    const sorted = [...this.particles].sort((a, b) => {
      return (b.baseX ** 2 + b.baseY ** 2) - (a.baseX ** 2 + a.baseY ** 2);
    });
    const anchor = sorted[0];
    const nearby = this.particles
      .map(p => ({ p, d: (p.baseX - anchor.baseX) ** 2 + (p.baseY - anchor.baseY) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .map(x => x.p);

    // greedy: pick 2p + 2n among the nearest
    const picked = [];
    let p = 0, n = 0;
    for (const part of nearby) {
      if (part.type === 'p' && p < 2) { picked.push(part); p++; }
      else if (part.type === 'n' && n < 2) { picked.push(part); n++; }
      if (p === 2 && n === 2) break;
    }

    // direction away from center
    const avgX = picked.reduce((s, p) => s + p.baseX, 0) / picked.length;
    const avgY = picked.reduce((s, p) => s + p.baseY, 0) / picked.length;
    const len = Math.hypot(avgX, avgY) || 1;
    const dirX = avgX / len;
    const dirY = avgY / len;

    // remove from particles, create alpha group
    this.particles = this.particles.filter(p => !picked.includes(p));
    this.alphaParticle = {
      parts: picked.map(p => ({
        offsetX: p.baseX - avgX,
        offsetY: p.baseY - avgY,
        type: p.type,
        r: p.r,
      })),
      x: avgX,
      y: avgY,
      vx: dirX * 2,
      vy: dirY * 2,
      age: 0,
    };

    this.jiggle = 20;
    this.canvas.parentElement.classList.add('shake');
    setTimeout(() => this.canvas.parentElement.classList.remove('shake'), 500);

    // after animation, relabel to daughter (Thorium)
    setTimeout(() => {
      this.alphaParticle = null;
      this.decaying = false;
      ui.showDaughter(this.currentIso);
    }, 1800);
  }

  reset() {
    if (this.decaying) {
      this.alphaParticle = null;
      this.decaying = false;
    }
    this.buildNucleus();
  }

  update(dt) {
    this.jiggle *= 0.95;

    // jitter particles
    const t = performance.now() / 1000;
    for (const p of this.particles) {
      p.x = p.baseX + Math.sin(t * 2 + p.phase) * 0.8;
      p.y = p.baseY + Math.cos(t * 2 + p.phase * 1.3) * 0.8;
    }

    if (this.alphaParticle) {
      this.alphaParticle.x += this.alphaParticle.vx * dt * 60;
      this.alphaParticle.y += this.alphaParticle.vy * dt * 60;
      this.alphaParticle.vx *= 1.03;
      this.alphaParticle.vy *= 1.03;
      this.alphaParticle.age += dt;
    }
  }

  draw() {
    const { ctx, w, h, cx, cy } = this;
    ctx.clearRect(0, 0, w, h);

    // glow background around nucleus
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
    grad.addColorStop(0, 'rgba(124, 249, 197, 0.08)');
    grad.addColorStop(1, 'rgba(124, 249, 197, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // draw particles
    ctx.save();
    ctx.translate(cx + (Math.random() - 0.5) * this.jiggle * 0.4,
                  cy + (Math.random() - 0.5) * this.jiggle * 0.4);

    // soft shadows for depth
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'p'
        ? 'rgba(255, 90, 106, 0.15)'
        : 'rgba(78, 169, 255, 0.15)';
      ctx.fill();
    }

    for (const p of this.particles) {
      this.drawParticle(ctx, p.x, p.y, p.r, p.type);
    }
    ctx.restore();

    // alpha particle
    if (this.alphaParticle) {
      const a = this.alphaParticle;
      ctx.save();
      ctx.translate(cx + a.x, cy + a.y);

      // trail
      ctx.strokeStyle = 'rgba(255, 207, 74, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-a.vx * 15, -a.vy * 15);
      ctx.stroke();

      // glow
      const aGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      aGlow.addColorStop(0, 'rgba(255, 207, 74, 0.4)');
      aGlow.addColorStop(1, 'rgba(255, 207, 74, 0)');
      ctx.fillStyle = aGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();

      for (const part of a.parts) {
        this.drawParticle(ctx, part.offsetX, part.offsetY, part.r, part.type);
      }

      // label
      ctx.fillStyle = 'rgba(255, 207, 74, 0.9)';
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.alphaLabel, 0, -30);

      ctx.restore();
    }
  }

  drawParticle(ctx, x, y, r, type) {
    const color = type === 'p' ? '#ff5a6a' : '#4ea9ff';
    const hi = type === 'p' ? '#ffb0ba' : '#a8d2ff';

    // base
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0, hi);
    g.addColorStop(0.6, color);
    g.addColorStop(1, type === 'p' ? '#a03040' : '#2060a0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  loop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// =========================================================
// 3) FISSION SIMULATOR
// =========================================================
class FissionSim {
  constructor(canvas) {
    const s = setupCanvas(canvas);
    this.canvas = canvas;
    this.ctx = s.ctx;
    this.w = s.w;
    this.h = s.h;
    this.state = 'idle';   // idle | incoming | explode | fly
    this.t = 0;
    this.incomingN = null;
    this.fragments = [];
    this.releasedN = [];
    this.flash = 0;
    this.shake = 0;

    this.energyFlashLabel = lbl('canvas.fissionEnergy', '+200 MeV');

    this.loop();
  }

  trigger() {
    if (this.state !== 'idle') return;
    this.state = 'incoming';
    this.t = 0;
    this.incomingN = {
      x: -30, y: this.h / 2,
      vx: 280, vy: 0,
    };
    this.fragments = [];
    this.releasedN = [];
  }

  update(dt) {
    this.t += dt;
    this.flash *= 0.9;
    this.shake *= 0.9;

    if (this.state === 'incoming') {
      this.incomingN.x += this.incomingN.vx * dt;
      if (this.incomingN.x > this.w / 2 - 40) {
        this.state = 'explode';
        this.t = 0;
        this.flash = 1;
        this.shake = 10;
        // create 2 fragments: Ba-141 (left-up) and Kr-92 (right-down)
        this.fragments = [
          {
            x: this.w / 2, y: this.h / 2,
            vx: -160, vy: -60,
            label: 'Ba-141',
            color: '#ffcf4a',
            size: 44,
            p: 56, n: 85,
          },
          {
            x: this.w / 2, y: this.h / 2,
            vx: 150, vy: 70,
            label: 'Kr-92',
            color: '#9d7bff',
            size: 36,
            p: 36, n: 56,
          },
        ];
        // 3 neutrons
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 2 * i / 3) + Math.random() * 0.5;
          this.releasedN.push({
            x: this.w / 2, y: this.h / 2,
            vx: Math.cos(angle) * 220,
            vy: Math.sin(angle) * 220,
          });
        }
        this.incomingN = null;
      }
    }

    if (this.state === 'explode' || this.state === 'fly') {
      this.state = 'fly';
      for (const f of this.fragments) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
      }
      for (const n of this.releasedN) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
      }
      if (this.t > 2.5) {
        this.state = 'idle';
      }
    }
  }

  draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // shake offset
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    ctx.save();
    ctx.translate(sx, sy);

    // flash background
    if (this.flash > 0.01) {
      ctx.fillStyle = `rgba(255, 207, 74, ${this.flash * 0.25})`;
      ctx.fillRect(-sx, -sy, w, h);
    }

    // draw U-235 nucleus if idle or incoming
    if (this.state === 'idle' || this.state === 'incoming') {
      this.drawNucleusBlob(ctx, w / 2, h / 2, 50, '#7cf9c5', 'U-235');
    }

    // incoming neutron
    if (this.incomingN) {
      const n = this.incomingN;
      // trail
      ctx.strokeStyle = 'rgba(78, 169, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(n.x - 40, n.y);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
      this.drawNeutron(ctx, n.x, n.y, 10);
    }

    // fragments
    for (const f of this.fragments) {
      // trail
      ctx.strokeStyle = `${f.color}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(f.x - f.vx * 0.1, f.y - f.vy * 0.1);
      ctx.lineTo(f.x, f.y);
      ctx.stroke();

      this.drawNucleusBlob(ctx, f.x, f.y, f.size, f.color, f.label);
    }

    // released neutrons
    for (const n of this.releasedN) {
      ctx.strokeStyle = 'rgba(78, 169, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(n.x - n.vx * 0.04, n.y - n.vy * 0.04);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
      this.drawNeutron(ctx, n.x, n.y, 8);
    }

    // energy burst text
    if (this.flash > 0.1) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.fillStyle = `rgba(255, 207, 74, ${this.flash})`;
      ctx.font = `bold ${24 + this.flash * 20}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.energyFlashLabel, 0, -80);
      ctx.restore();
    }

    ctx.restore();
  }

  drawNucleusBlob(ctx, x, y, r, color, label) {
    // glow
    const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2);
    glow.addColorStop(0, `${color}55`);
    glow.addColorStop(1, `${color}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fill();

    // body
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, color);
    g.addColorStop(1, shade(color, -0.4));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // surface detail (dots)
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rr = r * 0.7;
      const px = x + Math.cos(a) * rr * Math.random();
      const py = y + Math.sin(a) * rr * Math.random();
      ctx.fillStyle = i % 2 === 0 ? '#ff5a6a' : '#4ea9ff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + r + 22);
  }

  drawNeutron(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0, '#a8d2ff');
    g.addColorStop(1, '#2060a0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // glow
    ctx.fillStyle = 'rgba(78, 169, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  loop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

function shade(hex, amount) {
  // hex like #rrggbb
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = clamp(Math.round(r + (amount > 0 ? 255 - r : r) * amount), 0, 255);
  g = clamp(Math.round(g + (amount > 0 ? 255 - g : g) * amount), 0, 255);
  b = clamp(Math.round(b + (amount > 0 ? 255 - b : b) * amount), 0, 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// =========================================================
// 4) TIME-DECAY SIMULATOR
// =========================================================
class TimeDecaySim {
  constructor(canvas) {
    const s = setupCanvas(canvas);
    this.canvas = canvas;
    this.ctx = s.ctx;
    this.w = s.w;
    this.h = s.h;

    this.iso = 'U-235';
    this.speedIdx = 4;            // 1..7 => 10^3..10^9 years/sec
    this.playing = false;
    this.totalAtoms = 1000;
    this.atoms = [];
    this.simYears = 0;

    this.buildAtoms();
    this.loop();
  }

  buildAtoms() {
    this.atoms = [];
    const cols = 40, rows = 25;
    const marginX = 20, marginY = 60;
    const availW = this.w - marginX * 2;
    const availH = this.h - marginY - 20;
    const dx = availW / (cols - 1);
    const dy = availH / (rows - 1);

    for (let i = 0; i < this.totalAtoms; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      this.atoms.push({
        x: marginX + c * dx,
        y: marginY + r * dy,
        alive: true,
        fade: 1,
      });
    }
    this.simYears = 0;
  }

  setIso(iso) { this.iso = iso; }
  setSpeed(idx) { this.speedIdx = idx; }
  play() { this.playing = true; }
  pause() { this.playing = false; }
  reset() {
    this.playing = false;
    this.buildAtoms();
  }

  get yearsPerSecond() {
    // 1 => 1e3, 7 => 1e9
    return Math.pow(10, 2 + this.speedIdx);
  }

  update(dt) {
    if (this.playing) {
      const yearsDelta = this.yearsPerSecond * dt;
      this.simYears += yearsDelta;

      const T = ISOTOPES[this.iso].halfLife;
      // probability that any given atom decays in this slice
      const pDecay = 1 - Math.pow(0.5, yearsDelta / T);

      for (const a of this.atoms) {
        if (a.alive && Math.random() < pDecay) {
          a.alive = false;
        }
      }
    }

    // animate fade
    for (const a of this.atoms) {
      const target = a.alive ? 1 : 0;
      a.fade += (target - a.fade) * 0.15;
    }

    // update UI
    const aliveCount = this.atoms.filter(a => a.alive).length;
    document.getElementById('atomsLeft').textContent = aliveCount;
    document.getElementById('timeElapsed').textContent = formatYears(this.simYears);
  }

  draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    const color = ISOTOPES[this.iso].color;

    for (const a of this.atoms) {
      if (a.fade < 0.01) continue;
      ctx.globalAlpha = a.fade;
      const r = 3;
      // glow
      ctx.fillStyle = `${color}44`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, r * 2, 0, Math.PI * 2);
      ctx.fill();
      // core
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // draw progress bar at bottom
    const aliveCount = this.atoms.filter(a => a.alive).length;
    const pct = aliveCount / this.totalAtoms;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(20, h - 30, w - 40, 6);
    ctx.fillStyle = color;
    ctx.fillRect(20, h - 30, (w - 40) * pct, 6);
  }

  loop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// =========================================================
// UI GLUE
// =========================================================
const ui = {
  nucleus: null,
  fission: null,
  timeSim: null,
  hasDecayed: false,

  showDaughter(parentKey) {
    const daughter = daughterMerged(parentKey);
    if (!daughter) return;
    const parentA = ISOTOPES[parentKey].A;

    document.getElementById('statP').textContent = daughter.Z;
    document.getElementById('statN').textContent = daughter.N;
    document.getElementById('statA').textContent = daughter.A;
    document.getElementById('statRatio').textContent = (daughter.N / daughter.Z).toFixed(3);
    document.getElementById('isoTag').textContent = `${daughter.symbol}-${daughter.A}`;
    document.getElementById('stabilityText').textContent = daughter.stabilityText;
    document.getElementById('stabilityFill').style.width = daughter.stability + '%';
    document.getElementById('halfLifeText').textContent =
      lbl('time.tHalfApprox', 'T½ ≈ ') + daughter.halfLifeText;

    document.querySelectorAll('.stat-value').forEach(el => {
      el.classList.remove('stat-flash');
      void el.offsetWidth;
      el.classList.add('stat-flash');
    });

    document.querySelectorAll('#isoSelector button').forEach(b => b.classList.remove('active'));

    const note = document.getElementById('decayNote');
    const lead = lbl('decay.resultLead', '✓ S-a obținut <b>{{name}}</b>:').replace(/\{\{name\}\}/g, daughter.name);
    const conserv = lbl('decay.conservation', 'Conservare: A ({{pa}} = {{da}} + 4) ✓ · Z (92 = {{dz}} + 2) ✓')
      .replace(/\{\{pa\}\}/g, String(parentA))
      .replace(/\{\{da\}\}/g, String(daughter.A))
      .replace(/\{\{dz\}\}/g, String(daughter.Z));
    note.innerHTML = `${lead}
      <span class="nuclide"><span class="nums"><sup>${parentA}</sup><sub>92</sub></span>U</span> →
      <span class="nuclide"><span class="nums"><sup>${daughter.A}</sup><sub>${daughter.Z}</sub></span>${daughter.symbol}</span> +
      <span class="nuclide"><span class="nums"><sup>4</sup><sub>2</sub></span>He</span> (α).
      ${conserv}`;

    const btn = document.getElementById('btnDecay');
    btn.textContent = lbl('buttons.decayDone', '✓ Dezintegrare completă');
    btn.disabled = true;
    btn.classList.add('btn-done');
    this.hasDecayed = true;
  },

  resetDecayState() {
    const btn = document.getElementById('btnDecay');
    btn.textContent = lbl('buttons.decay', '☢️ Dezintegrare α');
    btn.disabled = false;
    btn.classList.remove('btn-done');
    document.getElementById('decayNote').innerHTML = getDefaultDecayNoteHtml();
    this.hasDecayed = false;
  },
};

const defaultDecayNote = `La dezintegrarea α: <span class="nuclide"><span class="nums"><sup>A</sup><sub>Z</sub></span>X</span> →
<span class="nuclide"><span class="nums"><sup>A-4</sup><sub>Z-2</sub></span>Y</span> +
<span class="nuclide"><span class="nums"><sup>4</sup><sub>2</sub></span>He</span>.
Ex: <span class="nuclide"><span class="nums"><sup>235</sup><sub>92</sub></span>U</span> →
<span class="nuclide"><span class="nums"><sup>231</sup><sub>90</sub></span>Th</span> + α.`;

function getDefaultDecayNoteHtml() {
  return lbl('decay.defaultNoteHtml', defaultDecayNote);
}

function updateStats(iso) {
  const d = isoDisplay(iso);
  document.getElementById('statP').textContent = d.Z;
  document.getElementById('statN').textContent = d.N;
  document.getElementById('statA').textContent = d.A;
  document.getElementById('statRatio').textContent = (d.N / d.Z).toFixed(3);
  document.getElementById('isoTag').textContent = iso;
  document.getElementById('stabilityText').textContent = d.stabilityText;
  document.getElementById('stabilityFill').style.width = d.stability + '%';
  document.getElementById('halfLifeText').textContent = lbl('time.tHalfApprox', 'T½ ≈ ') + d.halfLifeText;
}

function updateTimeHalfLife() {
  const d = isoDisplay(ui.timeSim.iso);
  document.getElementById('timeHalfLife').textContent = d.halfLifeText;
}

function setupIsoSelector(selectorId, onPick) {
  const wrap = document.getElementById(selectorId);
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-iso]');
    if (!btn) return;
    wrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onPick(btn.dataset.iso);
  });
}

function applyTheoryI18n() {
  if (!LANG_EN) return;
  const b = window.__SIMULATOR_UI_I18N__?.theory;
  if (!b) return;
  const li1 = document.getElementById('theoryLi1');
  const li2 = document.getElementById('theoryLi2');
  const li3 = document.getElementById('theoryLi3');
  if (b.li1Html && li1) li1.innerHTML = b.li1Html;
  if (b.li2Html && li2) li2.innerHTML = b.li2Html;
  if (b.li3Html && li3) li3.innerHTML = b.li3Html;
}

function runUraniumSim() {
  applyTheoryI18n();
  const decayEl = document.getElementById('decayNote');
  if (decayEl) decayEl.innerHTML = getDefaultDecayNoteHtml();

  renderCards();

  ui.nucleus = new NucleusSim(document.getElementById('nucleusCanvas'));
  ui.fission = new FissionSim(document.getElementById('fissionCanvas'));
  ui.timeSim = new TimeDecaySim(document.getElementById('atomsCanvas'));

  updateStats('U-235');

  setupIsoSelector('isoSelector', (iso) => {
    ui.nucleus.setIsotope(iso);
    updateStats(iso);
    ui.resetDecayState();
  });

  setupIsoSelector('timeIsoSelector', (iso) => {
    ui.timeSim.setIso(iso);
    ui.timeSim.reset();
    document.getElementById('btnPlay').textContent = lbl('buttons.start', '▶ Pornește');
    updateTimeHalfLife();
  });

  document.getElementById('btnDecay').addEventListener('click', () => {
    if (ui.hasDecayed) return;
    ui.nucleus.triggerDecay();
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    ui.nucleus.reset();
    updateStats(ui.nucleus.currentIso);
    ui.resetDecayState();
    const isoSelector = document.getElementById('isoSelector');
    isoSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    const activeBtn = isoSelector.querySelector(`button[data-iso="${ui.nucleus.currentIso}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  });

  document.getElementById('btnFission').addEventListener('click', () => {
    ui.fission.trigger();
  });

  const playBtn = document.getElementById('btnPlay');
  playBtn.addEventListener('click', () => {
    if (ui.timeSim.playing) {
      ui.timeSim.pause();
      playBtn.textContent = lbl('buttons.start', '▶ Pornește');
    } else {
      ui.timeSim.play();
      playBtn.textContent = lbl('buttons.pause', '❚❚ Pauză');
    }
  });

  document.getElementById('btnTimeReset').addEventListener('click', () => {
    ui.timeSim.reset();
    playBtn.textContent = lbl('buttons.start', '▶ Pornește');
  });

  const speedSlider = document.getElementById('speedSlider');
  const speedVal = document.getElementById('speedVal');
  const updateSpeed = () => {
    const v = parseInt(speedSlider.value, 10);
    ui.timeSim.setSpeed(v);
    const yps = Math.pow(10, 2 + v);
    speedVal.textContent = formatYears(yps) + lbl('timeFormat.perSecSuffix', '/sec');
  };
  speedSlider.addEventListener('input', updateSpeed);
  updateSpeed();
  updateTimeHalfLife();

  // smooth scroll for nav pills
  document.querySelectorAll('.pill').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // handle resize
  window.addEventListener('resize', () => {
    clearTimeout(window._resizeT);
    window._resizeT = setTimeout(() => {
      // rebuild canvases on resize
      ['nucleusCanvas', 'fissionCanvas', 'atomsCanvas'].forEach(id => {
        const c = document.getElementById(id);
        const dpr = window.devicePixelRatio || 1;
        const rect = c.getBoundingClientRect();
        c.width = rect.width * dpr;
        c.height = rect.height * dpr;
        c.getContext('2d').scale(dpr, dpr);
      });
      ui.nucleus.w = ui.nucleus.canvas.getBoundingClientRect().width;
      ui.nucleus.h = ui.nucleus.canvas.getBoundingClientRect().height;
      ui.nucleus.cx = ui.nucleus.w / 2;
      ui.nucleus.cy = ui.nucleus.h / 2;
      ui.nucleus.buildNucleus();

      ui.fission.w = ui.fission.canvas.getBoundingClientRect().width;
      ui.fission.h = ui.fission.canvas.getBoundingClientRect().height;

      ui.timeSim.w = ui.timeSim.canvas.getBoundingClientRect().width;
      ui.timeSim.h = ui.timeSim.canvas.getBoundingClientRect().height;
      ui.timeSim.buildAtoms();
    }, 200);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runUraniumSim);
} else {
  runUraniumSim();
}
