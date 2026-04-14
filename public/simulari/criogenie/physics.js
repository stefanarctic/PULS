/** Materiale: T îngheț / T fierbere (K), rigiditate rețea */
export const MATERIALS = {
  water: {
    id: "water",
    label: "Apă",
    T_freeze: 273,
    T_boil: 373,
    springK: 0.14,
    damp: 0.88,
  },
  helium: {
    id: "helium",
    label: "Heliu",
    T_freeze: 4,
    T_boil: 5,
    springK: 0.06,
    damp: 0.92,
  },
  iron: {
    id: "iron",
    label: "Fier",
    T_freeze: 1808,
    T_boil: 3023,
    springK: 0.32,
    damp: 0.82,
  },
  nitrogen: {
    id: "nitrogen",
    label: "Azot",
    T_freeze: 63,
    T_boil: 77,
    springK: 0.16,
    damp: 0.87,
  },
};

export const PARTICLE_COUNT = 140;
export const RADIUS = 3;
const MIN_VOLUME_FRAC = 0.26;

export function getMaterial(key) {
  return MATERIALS[key] || MATERIALS.water;
}

export function getState(temp, materialKey) {
  const m = getMaterial(materialKey);
  if (temp > m.T_boil) return "gas";
  if (temp > m.T_freeze) return "liquid";
  return "solid";
}

/** Energia cinetică ~ T */
function kineticScale(temp) {
  return Math.sqrt(Math.max(temp, 1) / 300);
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function getParticleRadius() {
  return RADIUS;
}

/**
 * Cutie centrată; volumeFrac 0–1 = fracțiune din lățime/înălțime canvas.
 */
export function getContainerBounds(canvasW, canvasH, volumeFrac) {
  const vf = clamp(volumeFrac, MIN_VOLUME_FRAC, 1);
  const cw = canvasW * vf;
  const ch = canvasH * vf;
  const x0 = (canvasW - cw) / 2;
  const y0 = (canvasH - ch) / 2;
  return {
    x0,
    y0,
    x1: x0 + cw,
    y1: y0 + ch,
    width: cw,
    height: ch,
    area: Math.max(cw * ch, 1),
  };
}

/** Presiune ~ nT/V (2D: V = arie), normalizat pentru afișare */
export function computePressure(particleCount, tempK, areaPx, maxAreaPx) {
  const Vrel = clamp(areaPx / Math.max(maxAreaPx, 1), 0.04, 1);
  const raw = (particleCount * tempK) / Vrel;
  const ref = (particleCount * 300) / 1;
  const ratio = raw / Math.max(ref, 1);
  let label = "Low";
  if (ratio > 1.35) label = "High";
  else if (ratio > 0.85) label = "Medium";
  return { value: raw, ratio, label };
}

/**
 * @param {ReturnType<getContainerBounds>} bounds
 */
export function createParticles(bounds) {
  const cw = bounds.width;
  const ch = bounds.height;
  const pad = RADIUS * 2 + 8;
  const particles = [];
  const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const rows = Math.ceil(PARTICLE_COUNT / cols);
  const cellW = (cw - 2 * pad) / Math.max(cols - 1, 1);
  const cellH = (ch - 2 * pad) / Math.max(rows - 1, 1);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lx = pad + col * cellW;
    const ly = pad + row * cellH;

    const x = bounds.x0 + pad + Math.random() * (cw - 2 * pad);
    const y = bounds.y0 + pad + Math.random() * (ch - 2 * pad);
    const angle = Math.random() * Math.PI * 2;
    const vmag = 0.8 + Math.random() * 0.6;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * vmag,
      vy: Math.sin(angle) * vmag,
      relLatticeX: (lx - pad) / Math.max(cw - 2 * pad, 1),
      relLatticeY: (ly - pad) / Math.max(ch - 2 * pad, 1),
      trail: [],
    });
  }

  return particles;
}

function syncLatticeWorld(p, bounds, cw, ch) {
  const pad = RADIUS * 2 + 8;
  p.latticeX = bounds.x0 + pad + p.relLatticeX * Math.max(cw - 2 * pad, 1);
  p.latticeY = bounds.y0 + pad + p.relLatticeY * Math.max(ch - 2 * pad, 1);
}

/**
 * Coliziuni particulă–particulă (gaz / lichid).
 * @param {Array<{x:number,y:number,vx:number,vy:number}>} particles
 * @param {(x:number,y:number)=>void} [onCollide]
 */
export function resolveCollisions(particles, onCollide) {
  const minD = RADIUS * 2;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);
      if (dist < 1e-6) {
        dx = (Math.random() - 0.5) * 0.02;
        dy = (Math.random() - 0.5) * 0.02;
        dist = Math.hypot(dx, dy);
      }
      if (dist >= minD) continue;

      if (onCollide) {
        onCollide((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);
      }

      const overlap = minD - dist;
      const nx = dx / dist;
      const ny = dy / dist;
      p1.x -= nx * overlap * 0.5;
      p1.y -= ny * overlap * 0.5;
      p2.x += nx * overlap * 0.5;
      p2.y += ny * overlap * 0.5;

      const tx = -ny;
      const ty = nx;
      const v1n = p1.vx * nx + p1.vy * ny;
      const v2n = p2.vx * nx + p2.vy * ny;
      const v1t = p1.vx * tx + p1.vy * ty;
      const v2t = p2.vx * tx + p2.vy * ty;

      const v1nNew = v2n;
      const v2nNew = v1n;

      p1.vx = v1nNew * nx + v1t * tx;
      p1.vy = v1nNew * ny + v1t * ty;
      p2.vx = v2nNew * nx + v2t * tx;
      p2.vy = v2nNew * ny + v2t * ty;
    }
  }
}

/**
 * @param {Array} particles
 * @param {number} temp Kelvin
 * @param {ReturnType<getContainerBounds>} bounds
 * @param {string} materialKey
 * @param {(x:number,y:number)=>void} [onCollide]
 */
export function updateParticles(particles, temp, bounds, materialKey, onCollide) {
  const m = getMaterial(materialKey);
  const state = getState(temp, materialKey);
  const pad = RADIUS + 2;
  const cw = bounds.width;
  const ch = bounds.height;
  const scale = kineticScale(temp);
  const ultraCold = temp < 20;
  const motionScale = ultraCold ? 0.12 + (temp / 20) * 0.88 : 1;

  const xmin = bounds.x0 + pad;
  const xmax = bounds.x1 - pad;
  const ymin = bounds.y0 + pad;
  const ymax = bounds.y1 - pad;

  if (state === "gas") {
    for (const p of particles) {
      const speed = 1.35 * scale * motionScale;
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < xmin) {
        p.x = xmin;
        p.vx *= -1;
      } else if (p.x > xmax) {
        p.x = xmax;
        p.vx *= -1;
      }
      if (p.y < ymin) {
        p.y = ymin;
        p.vy *= -1;
      } else if (p.y > ymax) {
        p.y = ymax;
        p.vy *= -1;
      }

      p.vx += (Math.random() - 0.5) * 0.14 * scale * motionScale;
      p.vy += (Math.random() - 0.5) * 0.14 * scale * motionScale;
      const sp = Math.hypot(p.vx, p.vy);
      const cap = ultraCold ? 0.6 : 3.2;
      if (sp > cap) {
        p.vx = (p.vx / sp) * cap;
        p.vy = (p.vy / sp) * cap;
      }
    }
    resolveCollisions(particles, onCollide);
    return;
  }

  if (state === "liquid") {
    const attractR = 44;
    const attract = 0.022 * scale * motionScale;
    const drift = 0.5 * scale * motionScale;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let ax = 0;
      let ay = 0;

      for (let j = 0; j < particles.length; j++) {
        if (i === j) continue;
        const o = particles[j];
        const dx = o.x - p.x;
        const dy = o.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < attractR && d > 0.5) {
          const u = 1 - d / attractR;
          ax += (dx / d) * u * attract;
          ay += (dy / d) * u * attract;
        }
      }

      p.vx = p.vx * 0.988 + ax;
      p.vy = p.vy * 0.988 + ay;

      p.x += p.vx * drift;
      p.y += p.vy * drift;

      if (p.x < xmin) {
        p.x = xmin;
        p.vx *= -1;
      } else if (p.x > xmax) {
        p.x = xmax;
        p.vx *= -1;
      }
      if (p.y < ymin) {
        p.y = ymin;
        p.vy *= -1;
      } else if (p.y > ymax) {
        p.y = ymax;
        p.vy *= -1;
      }
    }
    resolveCollisions(particles, onCollide);
    return;
  }

  const kSpring = m.springK;
  const damp = m.damp;
  let jitter = 0.35 * Math.sqrt(clamp(temp / Math.max(m.T_freeze, 1), 0, 1));
  if (ultraCold) jitter *= 0.08;

  for (const p of particles) {
    syncLatticeWorld(p, bounds, cw, ch);
    const dx = p.latticeX - p.x;
    const dy = p.latticeY - p.y;
    p.vx = p.vx * damp + dx * kSpring;
    p.vy = p.vy * damp + dy * kSpring;

    p.x += p.vx * motionScale + (Math.random() - 0.5) * jitter * motionScale;
    p.y += p.vy * motionScale + (Math.random() - 0.5) * jitter * motionScale;
  }
}

/** Repoziționează particulele dacă cutia s-a micșorat */
export function clampParticlesToBounds(particles, bounds) {
  const pad = RADIUS + 2;
  const xmin = bounds.x0 + pad;
  const xmax = bounds.x1 - pad;
  const ymin = bounds.y0 + pad;
  const ymax = bounds.y1 - pad;
  for (const p of particles) {
    p.x = clamp(p.x, xmin, xmax);
    p.y = clamp(p.y, ymin, ymax);
  }
}

export function particleFillStyle(temp) {
  const t = clamp(temp / 300, 0, 1);
  const r = Math.floor(255 * t);
  const b = Math.floor(255 * (1 - t));
  return `rgb(${r}, 150, ${b})`;
}

export function drawParticle(ctx, p, temp) {
  const ultraCold = temp < 22;
  const fade =
    temp < 45 ? clamp((temp - 8) / 38, 0.18, 1) : 1;
  ctx.globalAlpha = fade;

  if (ultraCold) {
    ctx.shadowColor = "rgba(120, 200, 255, 0.75)";
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = particleFillStyle(temp);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

const HIST_BINS = 20;

/**
 * Histogramă viteze (modul vitezei 2D din starea curentă a modelului).
 * Axă adaptivă: se bazează pe vitezele măsurate + o podea legată de √T
 * (ca la Maxwell: lărgimea tipică ~ √T), ca să nu fie totul într-un bin * și să se vadă lățirea la temperaturi mari.
 */
export function getSpeedHistogram(particles, tempK) {
  const speeds = particles.map((p) => Math.hypot(p.vx, p.vy));
  const n = speeds.length;
  if (n === 0) {
    return {
      bins: new Array(HIST_BINS).fill(0),
      binCount: HIST_BINS,
      vmax: 1,
      meanSpeed: 0,
      maxSpeed: 0,
    };
  }

  let sum = 0;
  let maxObs = 0;
  for (const s of speeds) {
    sum += s;
    if (s > maxObs) maxObs = s;
  }
  const meanSpeed = sum / n;

  const sorted = [...speeds].sort((a, b) => a - b);
  const p92 = sorted[Math.min(sorted.length - 1, Math.floor(n * 0.92))] || maxObs;

  const tRef = Math.max(tempK, 1) / 300;
  const theoryScale = 3.6 * Math.sqrt(tRef);

  const vmax = Math.max(
    p92 * 1.08,
    maxObs * 1.02,
    meanSpeed * 2.8,
    theoryScale * 0.42,
    0.06
  );

  const bins = new Array(HIST_BINS).fill(0);
  for (const s of speeds) {
    const r = s / vmax;
    const i =
      r >= 1
        ? HIST_BINS - 1
        : Math.min(HIST_BINS - 1, Math.floor(r * HIST_BINS));
    bins[i]++;
  }

  return {
    bins,
    binCount: HIST_BINS,
    vmax,
    meanSpeed,
    maxSpeed: maxObs,
  };
}

/**
 * CDF Rayleigh pentru viteza în 2D când vx, vy ~ N(0, σ²) independente
 * („Maxwell–Boltzmann” pentru modulul vitezei în 2D).
 */
export function rayleighSpeedCdf(v, sigma) {
  if (v <= 0 || sigma <= 0) return 0;
  return 1 - Math.exp(-(v * v) / (2 * sigma * sigma));
}

/** σ ~ √T în unitățile modelului (calibrare calitativă pentru gaz ~300 K). */
export function mb2DSigmaFromTemperature(tempK, scale = 0.92) {
  return scale * Math.sqrt(Math.max(tempK, 12) / 300);
}

/**
 * Puncte pentru overlay: număr așteptat în fâșii [v₀,v₁], renormalizat pe [0, vmax]
 * ca masa totală să fie N (comparabil cu histograma tăiată la axă).
 */
export function getTheoreticalMB2DCurve(N, vmax, sigma, nSamples = 100) {
  if (N < 1 || vmax <= 0 || sigma <= 0) return [];
  const cdfFull = rayleighSpeedCdf(vmax, sigma);
  const inv = cdfFull > 1e-8 ? 1 / cdfFull : 1;
  const pts = [];
  for (let j = 0; j < nSamples; j++) {
    const v0 = (j / nSamples) * vmax;
    const v1 = ((j + 1) / nSamples) * vmax;
    const p0 = rayleighSpeedCdf(v0, sigma);
    const p1 = rayleighSpeedCdf(v1, sigma);
    const expected = N * (p1 - p0) * inv;
    pts.push({ v: (v0 + v1) / 2, count: expected });
  }
  return pts;
}
