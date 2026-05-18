// Laser vs matter — app (loads after simulator-i18n boot when ?lang=en)

function resolveBundlePath(path) {
  const o = window.__SIMULATOR_UI_I18N__;
  if (!path || !o) return undefined;
  return path.split('.').reduce((cur, key) => cur?.[key], o);
}

function simT(path, ro) {
  return typeof window.simLbl === 'function' ? window.simLbl(path, ro) : ro;
}

function simHtml(path, roHtml) {
  const v = resolveBundlePath(path);
  return typeof v === 'string' ? v : roHtml;
}

function simFmt(path, vars, roTpl) {
  let s = simT(path, roTpl);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

function logLocale() {
  return new URLSearchParams(location.search).get('lang') === 'en' ? 'en-GB' : 'ro-RO';
}

// ── STATE ──────────────────────────────────────────────────
const state = {
  mode: 'photo',
  material: 'sodium',
  freq: 5.0,
  intensity: 50,
  duration: 100,
  emitted: 0,
  temperature: 300,
  firing: false,
};

const MATERIALS = {
  sodium: { phi: 2.3, color: '#ffcc44' },
  copper: { phi: 4.7, color: '#b87333' },
  gold: { phi: 5.1, color: '#ffd700' },
  silicon: { phi: 4.0, color: '#aabbcc' },
};

/** Romanian fallbacks for formula panel (HTML in desc). */
const MODE_FORMULAS_RO = {
  photo: {
    title: '⚡ Efect Fotoelectric',
    formula: 'Ec = hν − φ',
    desc: 'Un foton cu energie <em>hν</em> eliberează un electron doar dacă <em>hν > φ</em>. Energia în exces devine energie cinetică.',
  },
  heat: {
    title: '🔥 Încălzire (absorbție)',
    formula: 'ΔE = n·hν → ΔT',
    desc: 'Fotonii transferă energie rețelei cristaline. Electronii vibrează mai intens → temperatura crește.',
  },
  ionize: {
    title: '💜 Ionizare prin laser',
    formula: 'hν ≫ φ → e⁻ + ion⁺',
    desc: 'La intensități mari, electronii sunt complet smulși din atom, formând o plasmă.',
  },
};

// ── CANVAS SETUP ───────────────────────────────────────────
const canvas = document.getElementById('sim');
const ctx = canvas.getContext('2d');
let W, H;
let atoms = [];
let particles = [];
let laserBeams = [];
let animId;

function resize() {
  const wrap = document.getElementById('canvas-wrap');
  W = canvas.width = wrap.clientWidth;
  H = canvas.height = wrap.clientHeight;
  buildAtoms();
}

function buildAtoms() {
  atoms = [];
  const cols = 9,
    rows = 5;
  const spacingX = Math.min((W * 0.6) / cols, 70);
  const spacingY = Math.min((H * 0.55) / rows, 60);
  const startX = (W - spacingX * (cols - 1)) / 2;
  const startY = H * 0.3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacingX + (r % 2) * spacingX * 0.5;
      const y = startY + r * spacingY;
      const numE = 1 + (Math.random() < 0.4 ? 1 : 0);
      const electrons = [];
      for (let i = 0; i < numE; i++) {
        electrons.push({
          angle: Math.random() * Math.PI * 2,
          speed: 0.025 + Math.random() * 0.015,
          radius: 16 + i * 6,
          excited: 0,
          free: false,
          vx: 0,
          vy: 0,
          x: 0,
          y: 0,
        });
      }
      atoms.push({ x, y, r: 8, electrons, vibX: 0, vibY: 0, vibAmp: 0 });
    }
  }
}

function addPhoton(x, y, tx, ty) {
  const angle = Math.atan2(ty - y, tx - x);
  particles.push({
    type: 'photon',
    x,
    y,
    vx: Math.cos(angle) * 6,
    vy: Math.sin(angle) * 6,
    life: 1,
    decay: 0.02,
    color: state.mode === 'photo' ? '#00e5ff' : state.mode === 'heat' ? '#ff7a00' : '#b44fff',
  });
}

function addFreeElectron(x, y, vx, vy) {
  particles.push({
    type: 'electron',
    x,
    y,
    vx,
    vy,
    life: 1,
    decay: 0.008,
    trail: [],
  });
  state.emitted++;
  document.getElementById('s-emitted').textContent = state.emitted;
}

function addSpark(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({
      type: 'spark',
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: 0.04 + Math.random() * 0.03,
      color,
    });
  }
}

function ekinReadout(Ekin) {
  if (state.mode === 'photo') {
    return Ekin > 0 ? Ekin + ' eV' : simT('stats.blockedE', '0 eV (blocat)');
  }
  if (state.mode === 'heat') return simT('stats.vibrations', '— (vibrații)');
  if (state.mode === 'ionize') return simT('stats.plasma', '≫ 0 eV (plasma)');
  return simT('stats.dash', '—');
}

function fireLaser() {
  if (state.firing) return;
  state.firing = true;

  const h = 6.626e-34,
    eV = 1.6e-19;
  const nu = state.freq * 1e14;
  const Ephoton = (h * nu) / eV;
  const EphotonStr = Ephoton.toFixed(2);
  const phi = MATERIALS[state.material].phi;
  const EkinNum = Ephoton - phi;
  const EkinStr = EkinNum.toFixed(2);

  document.getElementById('s-ephoton').textContent = EphotonStr + ' eV';
  document.getElementById('s-phi').textContent = phi + ' eV';

  const ratio = Math.min(Ephoton / phi, 2);
  document.getElementById('energy-bar').style.width = Math.min(ratio * 50, 100) + '%';
  document.getElementById('energy-bar').style.background = Ephoton >= phi ? 'var(--green)' : 'var(--laser)';

  const numPhotons = Math.round(state.intensity / 10);

  if (state.mode === 'photo') {
    document.getElementById('s-ekin').textContent = ekinReadout(EkinNum);
    if (Ephoton >= phi) {
      logEvent(
        simFmt(
          'log.photoAbove',
          { Ep: EphotonStr, Ph: phi, Ek: EkinStr },
          `hν=${EphotonStr}eV > φ=${phi}eV → Ec=${EkinStr}eV`
        ),
        'photo'
      );
      atoms.forEach((a, idx) => {
        if (Math.random() < state.intensity / 120) {
          setTimeout(() => {
            a.electrons.forEach((e) => {
              if (!e.free && Math.random() < 0.6) {
                e.free = true;
                e.vx = (Math.random() - 0.5) * 3;
                e.vy = -2 - Math.random() * 2;
                addFreeElectron(
                  a.x + Math.cos(e.angle) * e.radius,
                  a.y + Math.sin(e.angle) * e.radius,
                  e.vx,
                  e.vy
                );
                addSpark(a.x, a.y, '#00e5ff', 5);
              }
            });
          }, idx * 20);
        }
      });
    } else {
      logEvent(
        simFmt('log.photoBelow', { Ep: EphotonStr, Ph: phi }, `hν=${EphotonStr}eV < φ=${phi}eV — niciun electron emis`),
        'photo'
      );
      atoms.forEach((a) => {
        a.electrons.forEach((e) => {
          e.excited = 1;
        });
      });
    }
  } else if (state.mode === 'heat') {
    document.getElementById('s-ekin').textContent = ekinReadout(0);
    const dT = Math.round(state.intensity * state.freq * 0.8);
    state.temperature += dT;
    document.getElementById('s-temp').textContent = state.temperature + ' K';
    logEvent(simFmt('log.heatDelta', { dT, T: state.temperature }, `ΔT = +${dT} K → T = ${state.temperature} K`), 'heat');
    atoms.forEach((a) => {
      a.vibAmp = 4 + state.intensity * 0.08;
      addSpark(a.x, a.y, '#ff7a00', 3);
    });
  } else if (state.mode === 'ionize') {
    document.getElementById('s-ekin').textContent = ekinReadout(0);
    logEvent(simT('log.ionBurst', 'Ionizare! e⁻ complet eliberat + ion⁺ format'), 'ion');
    atoms.forEach((a, idx) => {
      setTimeout(() => {
        a.electrons.forEach((e) => {
          e.free = true;
          const a2 = Math.random() * Math.PI * 2;
          const s = 2 + Math.random() * 4;
          e.vx = Math.cos(a2) * s;
          e.vy = Math.sin(a2) * s;
          addFreeElectron(a.x, a.y, e.vx, e.vy);
        });
        addSpark(a.x, a.y, '#b44fff', 12);
      }, idx * 15);
    });
  }

  laserBeams.push({ life: 1, decay: 0.03, mode: state.mode });

  for (let i = 0; i < numPhotons; i++) {
    setTimeout(() => {
      const targetAtom = atoms[Math.floor(Math.random() * atoms.length)];
      if (targetAtom) {
        addPhoton(0, H * 0.2 + Math.random() * H * 0.2, targetAtom.x, targetAtom.y);
      }
    }, i * 30);
  }

  setTimeout(() => {
    state.firing = false;
  }, 600);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#0d1726';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  laserBeams.forEach((b, i) => {
    const col = b.mode === 'photo' ? '#00e5ff' : b.mode === 'heat' ? '#ff7a00' : '#b44fff';
    const grad = ctx.createLinearGradient(0, H * 0.3, W * 0.5, H * 0.5);
    grad.addColorStop(0, col + Math.floor(b.life * 88).toString(16).padStart(2, '0'));
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(0, H * 0.28);
    ctx.lineTo(W * 0.7, H * 0.55);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 * b.life;
    ctx.shadowColor = col;
    ctx.shadowBlur = 20 * b.life;
    ctx.stroke();
    ctx.shadowBlur = 0;
    b.life -= b.decay;
    if (b.life <= 0) laserBeams.splice(i, 1);
  });

  const matColor = MATERIALS[state.material].color;
  const now = Date.now() / 1000;

  atoms.forEach((a) => {
    if (a.vibAmp > 0) {
      a.vibX = (Math.random() - 0.5) * a.vibAmp;
      a.vibY = (Math.random() - 0.5) * a.vibAmp;
      a.vibAmp *= 0.97;
    } else {
      a.vibX *= 0.9;
      a.vibY *= 0.9;
    }
    const ax = a.x + a.vibX,
      ay = a.y + a.vibY;

    ctx.beginPath();
    ctx.arc(ax, ay, a.r + 4, 0, Math.PI * 2);
    ctx.fillStyle = matColor + '18';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
    ctx.fillStyle = matColor;
    ctx.shadowColor = matColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    atoms.forEach((b) => {
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < 75) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(b.x + b.vibX, b.y + b.vibY);
        ctx.strokeStyle = matColor + '22';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    a.electrons.forEach((e) => {
      if (e.free) return;
      e.angle += e.speed * (1 + state.temperature / 3000);
      const ex = ax + Math.cos(e.angle) * e.radius;
      const ey = ay + Math.sin(e.angle) * e.radius;
      e.x = ex;
      e.y = ey;

      if (e.excited > 0) {
        e.excited = Math.max(0, e.excited - 0.02);
        const excR = e.radius + e.excited * 10;
        const eEx = ax + Math.cos(e.angle) * excR;
        const eEy = ay + Math.sin(e.angle) * excR;
        ctx.beginPath();
        ctx.arc(eEx, eEy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(ax, ay, e.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#00e5ff14';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  });

  particles.forEach((p, i) => {
    if (p.type === 'photon') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      for (let t = 0; t < 12; t++) {
        const tx = p.x - p.vx * t;
        const ty = p.y - p.vy * t + Math.sin(t * 0.8) * 3;
        if (t === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = p.color + '55';
      ctx.lineWidth = 1;
      ctx.stroke();

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
    } else if (p.type === 'electron') {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 12) p.trail.shift();

      p.trail.forEach((t, j) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${(j / p.trail.length) * 0.4})`;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= p.decay;
    } else if (p.type === 'spark') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= p.decay;
    }

    if (p.life <= 0) particles.splice(i, 1);
  });

  if (state.temperature > 600) {
    const alpha = Math.min((state.temperature - 600) / 2000, 0.15);
    ctx.fillStyle = `rgba(255,120,0,${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  animId = requestAnimationFrame(draw);
}

function renderFormulaPanel(mode) {
  const ro = MODE_FORMULAS_RO[mode];
  const title = simT(`modes.${mode}.title`, ro.title);
  const formula = simT(`modes.${mode}.formula`, ro.formula);
  const desc = simHtml(`modes.${mode}.desc`, ro.desc);
  const hConst = simT('modes.hConstant', 'h = 6.626×10⁻³⁴ J·s');
  const box = document.getElementById('formula-box');
  box.innerHTML = `
    <div class="f-title"></div>
    <div class="formula"></div>
    <div class="formula" style="margin-top:4px;"></div>
    <div class="f-desc" style="font-size:0.58rem;color:var(--dim);margin-top:8px;line-height:1.6;"></div>
  `;
  box.querySelector('.f-title').textContent = title;
  box.querySelector('.formula').textContent = formula;
  const formulas = box.querySelectorAll('.formula');
  if (formulas[1]) formulas[1].textContent = hConst;
  box.querySelector('.f-desc').innerHTML = desc;
}

function setMode(mode, btn) {
  state.mode = mode;
  document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const wmRo = { photo: 'EFECT FOTOELECTRIC', heat: 'ÎNCĂLZIRE', ionize: 'IONIZARE' };
  document.getElementById('mode-wm').textContent = simT(`watermark.${mode}`, wmRo[mode]);
  renderFormulaPanel(mode);
  updateParams();
}

function setMaterial(mat, btn) {
  state.material = mat;
  document.querySelectorAll('.mat-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  updateParams();
}

function updateParams() {
  state.freq = parseFloat(document.getElementById('freq').value);
  state.intensity = parseInt(document.getElementById('intensity').value, 10);
  state.duration = parseInt(document.getElementById('duration').value, 10);

  document.getElementById('freq-val').textContent = state.freq.toFixed(1) + ' × 10¹⁴ Hz';
  document.getElementById('int-val').textContent = state.intensity + '%';
  document.getElementById('dur-val').textContent = state.duration + ' fs';

  const h = 6.626e-34,
    eV = 1.6e-19;
  const nu = state.freq * 1e14;
  const Ephoton = (h * nu) / eV;
  const phi = MATERIALS[state.material].phi;
  const Ekin = Ephoton - phi;

  document.getElementById('s-ephoton').textContent = Ephoton.toFixed(2) + ' eV';
  document.getElementById('s-phi').textContent = phi + ' eV';
  document.getElementById('s-ekin').textContent = ekinReadout(Ekin);

  const ratio = Ephoton / phi;
  document.getElementById('energy-bar').style.width = Math.min(ratio * 50, 100) + '%';
  document.getElementById('energy-bar').style.background = Ephoton >= phi ? 'var(--green)' : 'var(--laser)';
}

function resetSim() {
  state.emitted = 0;
  state.temperature = 300;
  particles.length = 0;
  laserBeams.length = 0;
  document.getElementById('s-emitted').textContent = '0';
  document.getElementById('s-temp').textContent = '300 K';
  buildAtoms();
  logEvent(simT('log.reset', 'Simulator resetat.'), '');
}

function logEvent(msg, type) {
  const log = document.getElementById('event-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry' + (type ? ' ' + type : '');
  const time = new Date().toLocaleTimeString(logLocale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  entry.textContent = `[${time}] ${msg}`;
  log.insertBefore(entry, log.firstChild);
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

const wrap = document.getElementById('canvas-wrap');
const crosshair = document.getElementById('crosshair');
wrap.addEventListener('mousemove', (e) => {
  const rect = wrap.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  crosshair.style.display = 'block';
  crosshair.style.left = mx + 'px';
  crosshair.style.top = my + 'px';
});
wrap.addEventListener('mouseleave', () => {
  crosshair.style.display = 'none';
});
wrap.addEventListener('click', fireLaser);

function isMobileLayout() {
  return window.matchMedia('(max-width: 900px)').matches;
}
let lastMobileLayout = isMobileLayout();

function syncPanelUi() {
  const mobile = isMobileLayout();
  const leftBtn = document.getElementById('btn-panel-left');
  const rightBtn = document.getElementById('btn-panel-right');
  const backdrop = document.getElementById('panel-backdrop');
  const leftOn = mobile ? document.body.classList.contains('panel-left-open') : !document.body.classList.contains('panel-left-collapsed');
  const rightOn = mobile ? document.body.classList.contains('panel-right-open') : !document.body.classList.contains('panel-right-collapsed');
  leftBtn.classList.toggle('is-active', leftOn);
  rightBtn.classList.toggle('is-active', rightOn);
  leftBtn.setAttribute('aria-expanded', String(leftOn));
  rightBtn.setAttribute('aria-expanded', String(rightOn));
  const drawerOpen =
    mobile &&
    (document.body.classList.contains('panel-left-open') || document.body.classList.contains('panel-right-open'));
  document.body.classList.toggle('panel-mobile-open', drawerOpen);
  if (backdrop) {
    backdrop.setAttribute('aria-hidden', String(!drawerOpen));
  }
}

function toggleLeftPanel() {
  if (isMobileLayout()) {
    const willOpen = !document.body.classList.contains('panel-left-open');
    document.body.classList.toggle('panel-left-open', willOpen);
    if (willOpen) document.body.classList.remove('panel-right-open');
  } else {
    document.body.classList.toggle('panel-left-collapsed');
  }
  syncPanelUi();
  resize();
}

function toggleRightPanel() {
  if (isMobileLayout()) {
    const willOpen = !document.body.classList.contains('panel-right-open');
    document.body.classList.toggle('panel-right-open', willOpen);
    if (willOpen) document.body.classList.remove('panel-left-open');
  } else {
    document.body.classList.toggle('panel-right-collapsed');
  }
  syncPanelUi();
  resize();
}

function onLayoutModeChange() {
  const mobile = isMobileLayout();
  if (mobile !== lastMobileLayout) {
    lastMobileLayout = mobile;
    if (mobile) {
      document.body.classList.remove('panel-left-collapsed', 'panel-right-collapsed');
      document.body.classList.remove('panel-left-open', 'panel-right-open');
    } else {
      document.body.classList.remove('panel-left-open', 'panel-right-open');
    }
    syncPanelUi();
  }
}

function initPanels() {
  document.getElementById('btn-panel-left').addEventListener('click', toggleLeftPanel);
  document.getElementById('btn-panel-right').addEventListener('click', toggleRightPanel);
  document.getElementById('panel-backdrop').addEventListener('click', () => {
    document.body.classList.remove('panel-left-open', 'panel-right-open');
    syncPanelUi();
    resize();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!isMobileLayout()) return;
    if (!document.body.classList.contains('panel-left-open') && !document.body.classList.contains('panel-right-open')) return;
    document.body.classList.remove('panel-left-open', 'panel-right-open');
    syncPanelUi();
    resize();
  });
  syncPanelUi();
}

function initGlobals() {
  window.setMode = setMode;
  window.setMaterial = setMaterial;
  window.updateParams = updateParams;
  window.fireLaser = fireLaser;
  window.resetSim = resetSim;
}

initGlobals();
initPanels();
window.addEventListener('resize', () => {
  onLayoutModeChange();
  resize();
});
resize();
const activeModeBtn = document.querySelector('.mode-btn.active');
if (activeModeBtn) setMode(state.mode, activeModeBtn);
else renderFormulaPanel(state.mode);
updateParams();
draw();
