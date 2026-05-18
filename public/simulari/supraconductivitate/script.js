(function () {
  "use strict";

  const MATERIALS = {
    ybco: { name: "YBCO", Tc: 92 },
    hg: { name: "Mercur", Tc: 4.2 },
    nb: { name: "Niobiu", Tc: 9.2 },
  };

  const sim = document.getElementById("sim");
  const ctx = sim.getContext("2d");
  const chart = document.getElementById("chart");
  const cctx = chart.getContext("2d");
  const stageWrap = sim.closest(".stage-wrap");
  const condBadge = document.getElementById("condBadge");

  const CHART_BASE_W = 260;
  const CHART_BASE_H = 88;
  let chartLw = CHART_BASE_W;
  let chartLh = CHART_BASE_H;

  function resizeChartCanvas() {
    const wrap = chart.parentElement;
    if (!wrap) return;
    const raw = wrap.clientWidth;
    const cssW = Math.max(140, raw > 0 ? raw : CHART_BASE_W);
    const cssH = Math.round((cssW * CHART_BASE_H) / CHART_BASE_W);
    if (Math.abs(cssW - chartLw) < 0.5 && Math.abs(cssH - chartLh) < 0.5) {
      return;
    }
    chartLw = cssW;
    chartLh = cssH;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    chart.width = Math.floor(cssW * dpr);
    chart.height = Math.floor(cssH * dpr);
    chart.style.width = `${cssW}px`;
    chart.style.height = `${cssH}px`;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const SIM_BASE_W = 900;
  /** Mai înalt decât 520px ca levitația să aibă spațiu vertical (în special pe telefon). */
  const SIM_BASE_H = 820;
  let simW = SIM_BASE_W;
  let simH = SIM_BASE_H;

  function resizeSim() {
    const wrap = sim.closest(".stage-wrap");
    if (!wrap) return;
    const raw = wrap.clientWidth;
    const targetW = Math.min(SIM_BASE_W, Math.max(200, raw > 0 ? raw : SIM_BASE_W));
    const narrow =
      typeof window.matchMedia === "function" && window.matchMedia("(max-width: 640px)").matches;
    const effH = narrow ? Math.round(SIM_BASE_H * 1.22) : SIM_BASE_H;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    simW = targetW;
    simH = Math.round((targetW * effH) / SIM_BASE_W);
    sim.width = Math.floor(simW * dpr);
    sim.height = Math.floor(simH * dpr);
    sim.style.width = `${simW}px`;
    sim.style.height = `${simH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const sliderT = document.getElementById("sliderT");
  const sliderB = document.getElementById("sliderB");
  const sliderH0 = document.getElementById("sliderH0");
  const selectMat = document.getElementById("selectMat");
  const chkLock = document.getElementById("chkLock");
  const chkEdu = document.getElementById("chkEdu");
  const valT = document.getElementById("valT");
  const valB = document.getElementById("valB");
  const valH0 = document.getElementById("valH0");
  const gameover = document.getElementById("gameover");
  const btnReset = document.getElementById("btnReset");
  const btnApplyH0 = document.getElementById("btnApplyH0");
  const tooltip = document.getElementById("tooltip");

  const simT = (path, ro) =>
    typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;

  /** @type {{
   * T: number, B: number, Tc: number, h: number, v: number, x: number, vx: number,
   * fallen: boolean, wasSuper: boolean, meissnerBlend: number,
   * tcRedFlash: number, tcWhiteFlash: number,
   * pinH: number, pinX: number,
   * dragging: boolean, dragPtrId: number | null,
   * dragTargetH: number, dragTargetX: number,
   * livingPhase: number, microImpulse: number,
   * visualGlow: number
   * }} */
  const state = {
    T: 77,
    B: 0.65,
    Tc: MATERIALS.ybco.Tc,
    h: 120,
    v: 0,
    x: 0,
    vx: 0,
    fallen: false,
    wasSuper: true,
    meissnerBlend: 1,
    tcRedFlash: 0,
    tcWhiteFlash: 0,
    pinH: 120,
    pinX: 0,
    dragging: false,
    dragPtrId: null,
    dragTargetH: 120,
    dragTargetX: 0,
    livingPhase: 0,
    microImpulse: 0,
    visualGlow: 1,
  };

  let prevB = 0.65;
  let prevT = 77;

  const PHYS = {
    g: 980,
    m: 1,
    /** F_mag ≈ kLev * B² / (h² + hRef²) pentru echilibru plutitor ~ 60–120 px */
    kLev: 1.05e7,
    hRef: 16,
    hFloor: 16,
    dampingSup: 0.987,
    dampingAir: 0.998,
    restitution: 0.42,
    restitutionSup: 0.58,
    dt: 1 / 60,
    jitterTcBand: 8,
    lockStiffness: 520,
    kDrag: 2200,
    kDragLockPin: 12,
    repelHMin: 32,
    kRepel: 5200,
    meissnerLerpUp: 3.5,
    meissnerLerpDown: 22,
    livingFreq: 1.15,
    livingAmp: 1.6,
    microNoiseAmp: 3.45,
    /** resort slab spre ținta slider — fizica găsește oscilația, nu teleport */
    kHeightSpring: 26,
    pinFollowHSlider: 0.11,
    vNoiseSuper: 4.85,
    vNoiseAir: 1.32,
    glowFallRate: 5.1,
    glowRiseRate: 3.55,
    microImpulseDecay: 0.895,
  };

  /** @type {{ x: number, y: number, vy: number, vx: number, a: number, t: number }[]} */
  let particles = [];

  /** @type {{ x: number, y: number, vx: number, vy: number, s: number, p: number }[]} */
  let microDots = [];

  let discY = 0;
  let discTop = 0;
  let discRx = 140;
  let discRy = 28;
  const magnetH = 36;
  const magnetW = 52;
  let centerX = 0;
  let simTime = 0;

  function syncDiscGeometry() {
    centerX = simW / 2;
    discY = simH - 95;
    discRx = Math.min(140, simW * 0.18);
    discRy = 28;
    discTop = discY - discRy;
  }

  function materialTc() {
    const key = selectMat.value;
    return MATERIALS[key] ? MATERIALS[key].Tc : 92;
  }

  function isSuperconducting() {
    return state.T < state.Tc;
  }

  function canvasPoint(clientX, clientY) {
    const r = sim.getBoundingClientRect();
    const sx = simW / r.width;
    const sy = simH / r.height;
    return {
      x: (clientX - r.left) * sx,
      y: (clientY - r.top) * sy,
    };
  }

  function magnetHit(px, py, mx, my) {
    const half = magnetW / 2 + 14;
    const top = my - magnetH - 12;
    const bot = my + 10;
    return px > mx - half && px < mx + half && py > top && py < bot;
  }

  function initParticles() {
    particles = [];
    const n = 62;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: centerX + (Math.random() - 0.5) * discRx * 2.2,
        y: discY - Math.random() * 40,
        vy: 18 + Math.random() * 55,
        vx: (Math.random() - 0.5) * 22,
        a: 0.12 + Math.random() * 0.35,
        t: Math.random() * Math.PI * 2,
      });
    }
  }

  function initMicroDots() {
    microDots = [];
    const n = 110;
    for (let i = 0; i < n; i++) {
      microDots.push({
        x: Math.random() * Math.max(400, simW),
        y: Math.random() * Math.max(300, simH),
        vx: (Math.random() - 0.5) * 5.5,
        vy: (Math.random() - 0.5) * 5.5,
        s: 0.35 + Math.random() * 0.65,
        p: Math.random() * Math.PI * 2,
      });
    }
  }

  function stepMicroDots(dt, coldness) {
    const drift = 10 + 14 * coldness;
    const wob = 2.8 + 2.2 * coldness;
    for (const d of microDots) {
      d.p += dt * (0.35 + 0.5 * coldness);
      d.x += (d.vx + Math.sin(d.p) * wob) * dt * drift;
      d.y += (d.vy + Math.cos(d.p * 0.73) * wob) * dt * drift;
      if (d.x < -5) d.x = simW + 5;
      if (d.x > simW + 5) d.x = -5;
      if (d.y < -5) d.y = simH + 5;
      if (d.y > simH + 5) d.y = -5;
    }
  }

  function drawMicroDots(supGlowVis, coldness) {
    const base = supGlowVis * (0.12 + 0.62 * coldness);
    if (base < 0.018) return;
    ctx.save();
    for (const d of microDots) {
      const a = base * d.s * (0.35 + 0.65 * coldness);
      ctx.fillStyle = `rgba(130, 215, 255, ${Math.min(0.85, a)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 0.5 + d.s * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function stepParticles(dt, coldness) {
    const topLim = 40;
    const chill = 0.45 + 0.55 * coldness;
    for (const p of particles) {
      p.t += dt * (1.6 + Math.sin(simTime * 0.003)) * (0.85 + 0.35 * coldness);
      p.y -= p.vy * dt * chill;
      p.x += (p.vx + Math.sin(p.t) * 12) * dt * chill;
      p.x += Math.sin(simTime * 0.002 + p.t) * 0.4 * chill;
      if (p.y < topLim || p.x < 0 || p.x > simW) {
        p.y = discY - 8 - Math.random() * 25;
        p.x = centerX + (Math.random() - 0.5) * discRx * 2.4;
        p.vy = 18 + Math.random() * 55;
        p.vx = (Math.random() - 0.5) * 22;
      }
    }
  }

  function drawParticles(supGlow, coldness) {
    if (supGlow < 0.05) return;
    const dens = 0.55 + 0.45 * coldness;
    ctx.save();
    for (const p of particles) {
      const alpha =
        p.a * supGlow * dens * (0.35 + 0.65 * (p.y / (discY + 40)));
      ctx.fillStyle = `rgba(200, 235, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.9 + Math.sin(p.t) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** 0 = full super, 1 = normal (with smooth zone near Tc) */
  function transitionFactor() {
    const band = PHYS.jitterTcBand;
    const t = (state.T - (state.Tc - band)) / band;
    return Math.max(0, Math.min(1, t));
  }

  /** 1 = foarte sub Tc („înghețat”), 0 = la limita supraconductorului */
  function coldnessFactor() {
    if (!isSuperconducting()) return 0;
    const span = Math.max(12, state.Tc * 0.55);
    return Math.max(0, Math.min(1, (state.Tc - state.T) / span));
  }

  function magneticUpForce() {
    const hEff = Math.max(state.h, PHYS.hFloor);
    const Brel = state.B;
    const h2 = hEff * hEff + PHYS.hRef * PHYS.hRef;
    return (PHYS.kLev * Brel * Brel) / h2;
  }

  function thermalJitter() {
    const tr = transitionFactor();
    if (tr <= 0) return 0;
    const amp = 95 * Math.pow(tr, 2);
    return (Math.random() - 0.5) * 2 * amp;
  }

  function triggerTcCrossDrama() {
    state.tcRedFlash = 1;
    state.tcWhiteFlash = 0.42;
    state.meissnerBlend = 0;
    state.visualGlow = 0.02;
    state.vx += (Math.random() - 0.5) * 95;
  }

  function step() {
    const dt = PHYS.dt;
    simTime += dt * 1000;

    state.Tc = materialTc();
    state.T = parseFloat(sliderT.value);
    state.B = parseFloat(sliderB.value);

    const dT = state.T - prevT;
    prevT = state.T;

    const sup = isSuperconducting();
    const tr = transitionFactor();

    if (state.wasSuper && !sup && !state.fallen) {
      triggerTcCrossDrama();
    }
    state.wasSuper = sup;

    if (sup) {
      state.meissnerBlend = Math.min(
        1,
        state.meissnerBlend + dt * PHYS.meissnerLerpUp
      );
      state.visualGlow = Math.min(
        1,
        state.visualGlow + dt * PHYS.glowRiseRate
      );
    } else {
      state.meissnerBlend = Math.max(
        0,
        state.meissnerBlend - dt * PHYS.meissnerLerpDown
      );
      state.visualGlow = Math.max(
        0,
        state.visualGlow - dt * PHYS.glowFallRate
      );
    }

    state.tcRedFlash *= 0.88;
    state.tcWhiteFlash *= 0.82;

    const dB = state.B - prevB;
    prevB = state.B;
    if (Math.abs(dB) > 0.003) {
      const snap = dB * 240;
      state.microImpulse += snap;
      state.v += snap * 0.085;
      state.v += (Math.random() - 0.5) * Math.abs(dB) * 55;
    }
    state.microImpulse *= PHYS.microImpulseDecay;

    if (state.fallen) return;

    if (sup && Math.abs(dT) > 0.06 && !state.dragging) {
      const j = dT * 1.15;
      state.microImpulse -= j * 18;
      state.v -= j * 0.85;
      state.v += (Math.random() - 0.5) * Math.min(22, Math.abs(dT) * 0.4);
      state.vx += (Math.random() - 0.5) * Math.abs(dT) * 0.12;
    }

    const hWant = parseFloat(sliderH0.value);
    if (sup && !state.dragging) {
      if (chkLock.checked) {
        state.pinH += (hWant - state.pinH) * PHYS.pinFollowHSlider;
      }
    }

    if (!sup) {
      const a = -PHYS.g;
      if (!state.dragging) {
        state.v += a * dt;
        state.h += state.v * dt;
        state.v *= PHYS.dampingAir;
        state.v += (Math.random() - 0.5) * PHYS.vNoiseAir;
        state.vx *= 0.985;
        state.x += state.vx * dt;
      } else {
        const dh = state.dragTargetH - state.h;
        const dx = state.dragTargetX - state.x;
        state.h += dh * 0.38;
        state.x += dx * 0.38;
        state.h = Math.max(PHYS.hFloor, Math.min(300, state.h));
        state.v = ((dh * 0.38) / dt) * 0.15;
        state.vx = ((dx * 0.38) / dt) * 0.15;
      }

      if (state.h <= PHYS.hFloor) {
        state.h = PHYS.hFloor;
        state.v = -state.v * PHYS.restitution;
        if (Math.abs(state.v) < 40) state.v = 0;
      }

      if (
        state.h <= PHYS.hFloor + 2 &&
        Math.abs(state.v) < 18 &&
        !state.dragging
      ) {
        state.fallen = true;
        gameover.classList.remove("hidden");
      }
      return;
    }

    const Fmag = magneticUpForce() * (1 - 0.82 * tr);
    const Fg = PHYS.m * PHYS.g;
    let Fnet =
      Fmag - Fg + thermalJitter() + state.microImpulse;

    if (!state.dragging) {
      Fnet += PHYS.kHeightSpring * (hWant - state.h);
    }

    if (state.h < PHYS.repelHMin) {
      const pen = (PHYS.repelHMin - state.h) / PHYS.repelHMin;
      Fnet += PHYS.kRepel * pen * pen;
    }

    if (state.dragging) {
      const dh = state.dragTargetH - state.h;
      const dx = state.dragTargetX - state.x;
      if (chkLock.checked) {
        state.pinH += (state.dragTargetH - state.pinH) * PHYS.kDragLockPin * dt;
        state.pinX += (state.dragTargetX - state.pinX) * PHYS.kDragLockPin * dt;
        const ph = state.pinH - state.h;
        const px = state.pinX - state.x;
        Fnet += PHYS.lockStiffness * ph * 0.35;
        state.vx += PHYS.lockStiffness * px * dt * 0.45;
      } else {
        Fnet += PHYS.kDrag * dh * 0.0016;
        state.vx += PHYS.kDrag * dx * dt * 0.00125;
      }
    } else if (chkLock.checked) {
      const ph = state.pinH - state.h;
      const px = state.pinX - state.x;
      Fnet += PHYS.lockStiffness * ph * 0.28;
      state.vx += (PHYS.lockStiffness * px - 70 * state.vx) * dt;
    } else {
      state.vx *= 0.945;
    }

    state.x += state.vx * dt;

    const a = Fnet / PHYS.m;
    state.v += a * dt;
    state.h += state.v * dt;
    state.v *= PHYS.dampingSup;
    state.v += (Math.random() - 0.5) * PHYS.vNoiseSuper;

    if (state.h < PHYS.hFloor) {
      state.h = PHYS.hFloor;
      state.v = Math.abs(state.v) * PHYS.restitutionSup;
      if (!state.dragging && state.v < 35) {
        state.v += (Math.random() - 0.5) * 15;
      }
    }

    if (!state.dragging && !chkLock.checked) {
      state.pinH = state.h;
      state.pinX = state.x;
    }
  }

  function drawDisc(cx, w, h, supGlow, pulse, coldness) {
    const pulseSmooth =
      Math.sin(pulse) * 0.74 + Math.sin(pulse * 0.58 + 1.05) * 0.26;
    const pulseA = 0.66 + 0.34 * pulseSmooth;
    const chillGlow = supGlow * (0.5 + 0.5 * coldness);
    const gCore = ctx.createRadialGradient(cx, discY - 6, 8, cx, discY, w * 0.55);
    gCore.addColorStop(0, `rgba(180, 230, 255, ${0.45 * chillGlow * pulseA})`);
    gCore.addColorStop(0.35, "#4a6fa5");
    gCore.addColorStop(0.7, "#2a3d5c");
    gCore.addColorStop(1, "#141c2e");

    ctx.save();
    ctx.fillStyle = gCore;
    ctx.beginPath();
    ctx.ellipse(cx, discY, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const rimA = 0.5 + 0.35 * chillGlow * (0.92 + 0.08 * pulseSmooth);
    ctx.strokeStyle = `rgba(150, 220, 255, ${rimA})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = `rgba(100, 200, 255, ${0.72 * chillGlow + 0.03 * pulseSmooth})`;
    ctx.shadowBlur =
      17 + 20 * chillGlow * pulseA + 12 * coldness * supGlow + 4 * pulseSmooth;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(200, 240, 255, ${0.35 * chillGlow})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, discY, w / 2 - 4, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    ctx.save();
    const outerA = (0.21 + 0.11 * pulseA + 0.02 * pulseSmooth) * chillGlow;
    const gHalo = ctx.createRadialGradient(cx, discY, w / 3, cx, discY, w * 1.15);
    gHalo.addColorStop(0, `rgba(100, 190, 255, ${outerA})`);
    gHalo.addColorStop(0.5, `rgba(60, 140, 220, ${outerA * 0.5})`);
    gHalo.addColorStop(1, "transparent");
    ctx.fillStyle = gHalo;
    ctx.beginPath();
    ctx.ellipse(cx, discY + 3, w / 2 + 45, h / 2 + 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMagnet(cx, cy, wobble) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(wobble * 0.012);

    const w = magnetW;
    const h = magnetH;
    ctx.fillStyle = "#c41e3a";
    ctx.fillRect(-w / 2, -h, w / 2, h);
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(0, -h, w / 2, h);

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-w / 2, -h, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "10px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", -w / 4, -h / 2 + 3);
    ctx.fillText("S", w / 4, -h / 2 + 3);

    ctx.restore();
  }

  function fieldLineGeometry(mx, my, angle, bendAmt, phase, lenMul, curvScale, lineIndex) {
    const tOrg = simTime * 0.0011;
    const i = lineIndex;
    const offA = Math.sin(tOrg + i * 0.53) * 0.5 + Math.sin(tOrg * 1.37 + i * 0.29) * 0.35;
    const offB = Math.cos(tOrg * 0.88 + i * 0.41) * 0.5 + Math.sin(phase * 0.25 + i * 0.67) * 0.28;
    const offC = Math.sin(tOrg * 0.62 + i * 0.71 + angle) * 0.45;
    const pxScale = 5.2;
    const jx1 = (offA * Math.cos(angle * 0.7) + offC * 0.4) * pxScale;
    const jy1 = (offB + offA * 0.35) * pxScale;
    const jx2 = (offB * Math.sin(angle * 0.5) - offA * 0.25) * pxScale * 0.85;
    const jy2 = (offC * 0.9 + Math.cos(tOrg + i) * 0.35) * pxScale * 0.85;
    const jEnd = Math.sin(tOrg * 1.1 + i * 0.38) * 0.4 * pxScale;

    const lenVar = lenMul * (1 + Math.sin(i * 0.92 + tOrg) * 0.035);
    const len = 340 * lenVar;
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    const wob = Math.sin(phase + angle * 2) * 6;

    const bx = centerX;
    const by = discY;
    const avoid = bendAmt;

    let cx1 = mx + dx * 0.32 + wob + jx1;
    let cy1 = my + dy * 0.32 + jy1;

    const side = mx < centerX ? -1 : 1;
    if (avoid > 0.04) {
      const wrap = (1 - Math.abs(Math.sin(angle))) * avoid * curvScale;
      const bulge = 95 * wrap;
      cy1 += bulge;
      cx1 += side * (55 * wrap + wob * 0.5);
      const pullTowardRim = 0.55 * wrap;
      cx1 += (bx - cx1) * pullTowardRim;
      cy1 += (by - discTop - 20 - cy1) * pullTowardRim * 0.4;
    }

    let cx2 = mx + dx * 0.72 + Math.sin(phase * 0.7) * 4 + jx2;
    let cy2 = my + dy * 0.72 + jy2;

    let endX = mx + dx * 0.94 + jEnd * Math.cos(angle * 0.3);
    let endY = my + dy * 0.94 + jEnd * Math.sin(angle * 0.25);

    return { cx1, cy1, cx2, cy2, endX, endY };
  }

  function drawFieldLines(mx, my) {
    const B = Math.max(0.12, Math.min(1.05, state.B));
    const n = Math.round(16 + 22 * B);
    const lenMul = 0.72 + 0.38 * B;
    const phase = simTime * (0.00135 + 0.0011 * B);
    const supStrength = state.fallen ? 0 : state.meissnerBlend;
    const bBoost = 0.62 + 0.55 * B;
    const hPix = Math.max(state.h, PHYS.hFloor);
    const curvScale = 0.42 + 1.08 * (100 / (hPix + 12));

    ctx.save();
    ctx.lineCap = "round";

    const L = (aN, aS) => aN + (aS - aN) * supStrength;

    for (let i = 0; i < n; i++) {
      const t = (i / Math.max(1, n - 1)) * Math.PI - Math.PI / 2;
      const spread = 0.98;
      const angle = -Math.PI / 2 + (t + Math.PI / 2) * spread;

      const ph = phase + i * 0.35;
      const geoS = fieldLineGeometry(mx, my, angle, 1, ph, lenMul, curvScale, i);
      const geoN = fieldLineGeometry(mx, my, angle, 0, ph, lenMul, curvScale, i);

      const cx1 = L(geoN.cx1, geoS.cx1);
      const cy1 = L(geoN.cy1, geoS.cy1);
      const cx2 = L(geoN.cx2, geoS.cx2);
      const cy2 = L(geoN.cy2, geoS.cy2);
      const endXA = L(geoN.endX, geoS.endX);
      const endYA = L(geoN.endY, geoS.endY);

      const sink = Math.max(0.15, Math.sin(angle + Math.PI / 2));
      const endXDisc = centerX + (geoN.endX - centerX) * (0.35 + 0.4 * sink);
      const endYDisc = discY + discRy * (0.2 + 0.65 * sink);

      const endX = L(endXDisc, endXA);
      const endY = L(endYDisc, endYA);

      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, endX, endY);

      const lineWobble = 0.94 + 0.06 * Math.sin(simTime * 0.0008 + i * 0.73);
      const alphaVar =
        (0.34 + 0.42 * supStrength + 0.26 * (1 - supStrength)) * bBoost;
      const alphaJit = alphaVar * (0.92 + 0.08 * Math.sin(i * 0.41 + phase * 0.5));
      const width =
        (1.2 + supStrength * 1.15 + (1 - supStrength) * 0.5) *
        (0.88 + 0.22 * B) *
        lineWobble;
      ctx.strokeStyle = `rgba(160, 225, 255, ${Math.min(0.98, alphaJit)})`;
      ctx.lineWidth = width;
      ctx.stroke();

      ctx.strokeStyle = `rgba(220, 245, 255, ${(0.12 + 0.16 * supStrength) * bBoost * (0.9 + 0.1 * Math.sin(i + phase))})`;
      ctx.lineWidth = width + 2.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCryoVignette(supGlow, pulse, coldness, nearTc) {
    const pulseSmooth =
      Math.sin(pulse) * 0.74 + Math.sin(pulse * 0.58 + 1.05) * 0.26;
    const g = ctx.createRadialGradient(
      centerX,
      discTop - 60,
      30,
      centerX,
      simH * 0.45,
      simH * 0.95
    );
    const a =
      (0.135 + 0.065 * pulseSmooth) * supGlow * (0.55 + 0.45 * coldness);
    g.addColorStop(0, `rgba(120, 200, 255, ${a})`);
    g.addColorStop(0.45, `rgba(50, 120, 200, ${a * 0.45})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, simW, simH);

    if (nearTc > 0.02 && supGlow > 0.05) {
      const w = ctx.createRadialGradient(
        centerX,
        discTop,
        20,
        centerX,
        discY,
        simH * 0.55
      );
      w.addColorStop(0, `rgba(255, 180, 120, ${nearTc * 0.14})`);
      w.addColorStop(0.4, `rgba(255, 100, 80, ${nearTc * 0.06})`);
      w.addColorStop(1, "transparent");
      ctx.fillStyle = w;
      ctx.fillRect(0, 0, simW, simH);
    }
  }

  function drawTcFlashes() {
    if (state.tcWhiteFlash > 0.02) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.tcWhiteFlash * 0.5})`;
      ctx.fillRect(0, 0, simW, simH);
    }
    if (state.tcRedFlash > 0.02) {
      ctx.fillStyle = `rgba(248, 113, 113, ${state.tcRedFlash * 0.42})`;
      ctx.fillRect(0, 0, simW, simH);
    }
  }

  function updateCondBadge() {
    if (!condBadge) return;
    const sup = isSuperconducting() && !state.fallen;
    condBadge.className =
      "cond-badge " + (sup ? "cond-badge--super" : "cond-badge--normal");
    const label = condBadge.querySelector(".cond-label");
    if (label) {
      label.textContent = sup
        ? simT("badge.super", "Supraconductor · Meissner")
        : simT("badge.normal", "Material normal");
    }
  }

  function render() {
    ctx.clearRect(0, 0, simW, simH);

    syncDiscGeometry();

    const mx = centerX + state.x;
    const my = discTop - state.h;

    const supAlive = isSuperconducting() && !state.fallen;
    const cryoGlow =
      state.visualGlow *
      (supAlive ? 0.12 + 0.88 * state.meissnerBlend : 0.1 + 0.15 * state.meissnerBlend);
    const pulse = simTime * 0.00315;
    const coldness = coldnessFactor();
    const nearTc = supAlive ? transitionFactor() : 0;

    drawCryoVignette(cryoGlow, pulse, coldness, nearTc);
    drawMicroDots(cryoGlow, coldness);
    drawFieldLines(mx, my - magnetH / 2);
    drawDisc(centerX, discRx * 2, discRy * 2, cryoGlow, pulse, coldness);
    drawParticles(cryoGlow, coldness);

    const calm = 0.55 + 0.45 * coldness;
    const living =
      PHYS.livingAmp *
        calm *
        Math.sin(simTime * 0.001 * PHYS.livingFreq + state.livingPhase) +
      (Math.random() - 0.5) *
        PHYS.microNoiseAmp *
        (supAlive ? 0.35 + 0.65 * (1 - coldness * 0.85) : 0.3);
    const wobble = living * (state.dragging ? 0.35 : 1);

    drawMagnet(mx, my + living * 0.4, wobble);

    drawTcFlashes();

    ctx.save();
    ctx.textAlign = "left";
    const narrow = simW < 460;
    const tiny = simW < 360;
    const px = narrow ? 8 : 16;
    let py = narrow ? (tiny ? 14 : 18) : 26;
    const fsTitle = tiny ? 9 : narrow ? 10 : 13;
    const fsMeta = tiny ? 8 : narrow ? 9 : 11;
    const lh = tiny ? 11 : narrow ? 13 : 18;

    ctx.fillStyle = "rgba(230, 237, 243, 0.88)";
    ctx.font = `${fsTitle}px system-ui,sans-serif`;
    const status = state.fallen
      ? simT("hud.statusFallen", "Stare: normală (conductor)")
      : supAlive
        ? narrow
          ? simT("hud.statusSuperNarrow", "Supraconductor · Meissner")
          : simT("hud.statusSuperWide", "Stare: supraconductor · Meissner activ")
        : narrow
          ? simT("hud.aboveNarrow", "Peste Tc — cade")
          : simT("hud.aboveWide", "Stare: peste Tc — cade");
    ctx.fillText(status, px, py);
    py += lh;

    ctx.fillStyle = "rgba(139, 156, 179, 0.92)";
    ctx.font = `${fsMeta}px system-ui,sans-serif`;
    const dTc = state.Tc - state.T;
    if (tiny) {
      ctx.fillText(
        `T ${state.T.toFixed(0)}K  Δ${dTc.toFixed(0)}  B${state.B.toFixed(2)}  h${state.h.toFixed(0)}`,
        px,
        py
      );
    } else if (narrow) {
      ctx.fillText(
        `T=${state.T.toFixed(1)} K  Tc=${state.Tc}  Δ=${dTc.toFixed(1)}  B=${state.B.toFixed(2)}`,
        px,
        py
      );
      py += lh - 1;
      ctx.fillText(
        simT("hud.hNarrow", "h≈{h} → țintă {v}")
          .replace("{h}", state.h.toFixed(0))
          .replace("{v}", String(parseFloat(sliderH0.value))),
        px,
        py
      );
    } else {
      ctx.fillText(
        `T = ${state.T.toFixed(1)} K · Tc = ${state.Tc} K (Δ = ${dTc.toFixed(1)} K) · B = ${state.B.toFixed(2)}`,
        px,
        py
      );
      py += lh;
      ctx.fillText(
        simT("hud.hWide", "h ≈ {h} px · țintă slider = {v} px")
          .replace("{h}", state.h.toFixed(0))
          .replace("{v}", String(parseFloat(sliderH0.value))),
        px,
        py
      );
    }
    if (state.dragging) {
      py += lh;
      ctx.fillStyle = "rgba(126, 200, 255, 0.85)";
      ctx.fillText(
        narrow ? simT("hud.dragNarrow", "Tragere…") : simT("hud.dragWide", "Tragere activă"),
        px,
        py
      );
    }
    ctx.restore();

    updateCondBadge();
  }

  function drawChart() {
    resizeChartCanvas();
    const w = chartLw;
    const h = chartLh;
    cctx.clearRect(0, 0, w, h);

    const padL = w < 200 ? 28 : 36;
    const pad = { l: padL, r: 10, t: 12, b: 20 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    const Tmin = 0;
    const Tmax = 120;

    cctx.fillStyle = "#0d1218";
    cctx.fillRect(0, 0, w, h);

    const xTc = pad.l + ((state.Tc - Tmin) / (Tmax - Tmin)) * cw;
    cctx.fillStyle = "rgba(74, 222, 128, 0.12)";
    cctx.fillRect(pad.l, pad.t, xTc - pad.l, ch);
    cctx.fillStyle = "rgba(248, 113, 113, 0.1)";
    cctx.fillRect(xTc, pad.t, pad.l + cw - xTc, ch);

    cctx.strokeStyle = "#2a3548";
    cctx.lineWidth = 1;
    cctx.strokeRect(pad.l, pad.t, cw, ch);

    cctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
    cctx.setLineDash([4, 3]);
    cctx.beginPath();
    cctx.moveTo(xTc, pad.t);
    cctx.lineTo(xTc, pad.t + ch);
    cctx.stroke();
    cctx.setLineDash([]);

    cctx.fillStyle = "#8b9cb3";
    const fsAxis = Math.max(8, Math.min(10, w * 0.035));
    cctx.font = `${fsAxis}px system-ui,sans-serif`;
    cctx.textAlign = "center";
    cctx.fillText("0", pad.l, h - 5);
    cctx.fillText("120 K", pad.l + cw, h - 5);
    cctx.fillText("Tc", xTc, h - 5);

    const xT = pad.l + ((state.T - Tmin) / (Tmax - Tmin)) * cw;
    const dotR = Math.max(4, Math.min(6, w * 0.02));
    cctx.beginPath();
    cctx.arc(xT, pad.t + ch / 2, dotR, 0, Math.PI * 2);
    cctx.fillStyle = isSuperconducting() ? "#4ade80" : "#f87171";
    cctx.fill();
    cctx.strokeStyle = "#e6edf3";
    cctx.lineWidth = 1.25;
    cctx.stroke();

    cctx.fillStyle = "#e6edf3";
    cctx.textAlign = "left";
    const fsTitle = Math.max(9, Math.min(11, w * 0.038));
    cctx.font = `${fsTitle}px system-ui,sans-serif`;
    cctx.fillText(simT("hud.chartCurrentT", "T curent"), pad.l, 11);
  }

  function loop() {
    const dt = PHYS.dt;
    step();
    stepParticles(dt, coldnessFactor());
    stepMicroDots(dt, coldnessFactor());
    render();
    drawChart();
    requestAnimationFrame(loop);
  }

  function resetSimulation() {
    syncDiscGeometry();
    state.Tc = materialTc();
    state.T = parseFloat(sliderT.value);
    state.B = parseFloat(sliderB.value);
    prevB = state.B;
    prevT = parseFloat(sliderT.value);
    state.h = parseFloat(sliderH0.value);
    state.pinH = state.h;
    state.pinX = 0;
    state.x = 0;
    state.vx = 0;
    state.fallen = false;
    state.wasSuper = isSuperconducting();
    state.meissnerBlend = state.wasSuper ? 1 : 0;
    state.visualGlow = state.wasSuper ? 1 : 0;
    state.tcRedFlash = 0;
    state.tcWhiteFlash = 0;
    state.dragging = false;
    state.dragPtrId = null;
    if (state.wasSuper) {
      state.v = -155;
    } else {
      state.v = 0;
    }
    gameover.classList.add("hidden");
    initParticles();
    initMicroDots();
  }

  function updateLabels() {
    valT.textContent = `${parseFloat(sliderT.value).toFixed(1)} K`;
    valB.textContent = parseFloat(sliderB.value).toFixed(2);
    valH0.textContent = `${sliderH0.value} px`;
  }

  function getEduTip(key) {
    const fallbacks = {
      stage:
        "Canvas: trage magnetul. Sub Tc respingerea Meissner te împinge; peste Tc câmpul pătrunde și magnetul cade. Linii animate = flux magnetic.",
      temp:
        "T: cu cât e mai departe sub Tc, scena e „mai rece” (glow, vapori); aproape de Tc apare încălzire vizuală și instabilitate.",
      field:
        "B: numărul și strălucirea liniilor de câmp cresc cu sliderul; magnetul reacționează mai tare la schimbări bruște.",
      dist:
        "Distanță: un resort slab trage spre valoarea sliderului — poziția apare din lupta mg vs kB²/h², nu din teleport.",
      material:
        "T fiecărui material are Tc diferit — compară cât de ușor păstrezi starea supraconductoare la aceeași T.",
      lock:
        "Quantum locking: poziția țintă (pin) urmează neted cursorul; la eliberare magnetul rămâne ancorat — flux pinning simplificat.",
      chart:
        "Grafic live: zona verde = T sub Tc (supraconductor); roșu = peste Tc. Punctul = temperatura ta.",
      compare:
        "YBCO are Tc mare (~92 K); mercurul, primul supraconductor cunoscut, are Tc foarte mic (~4 K) — necesită heliu lichid.",
    };
    return simT(`edu.${key}`, fallbacks[key] || "");
  }

  function setEduMode(on) {
    document.body.classList.toggle("edu-active", on);
  }

  function onEduHover(ev, key) {
    if (!chkEdu.checked || !key) return;
    const text = getEduTip(key);
    if (!text) return;
    tooltip.textContent = text;
    tooltip.classList.remove("hidden");
    const pad = 12;
    let x = ev.clientX + pad;
    let y = ev.clientY + pad;
    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > innerWidth - 8) x = ev.clientX - rect.width - pad;
    if (y + rect.height > innerHeight - 8) y = ev.clientY - rect.height - pad;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    tooltip.classList.add("hidden");
  }

  function setDragTargetsFromEvent(ev) {
    const p = canvasPoint(ev.clientX, ev.clientY);
    state.dragTargetX = p.x - centerX;
    state.dragTargetH = discTop - p.y;
    state.dragTargetH = Math.max(PHYS.hFloor, Math.min(280, state.dragTargetH));
    state.dragTargetX = Math.max(-160, Math.min(160, state.dragTargetX));
  }

  sim.addEventListener("pointerdown", (ev) => {
    if (state.fallen) return;
    const p = canvasPoint(ev.clientX, ev.clientY);
    const mx = centerX + state.x;
    const my = discTop - state.h;
    if (!magnetHit(p.x, p.y, mx, my)) return;
    ev.preventDefault();
    sim.setPointerCapture(ev.pointerId);
    state.dragging = true;
    state.dragPtrId = ev.pointerId;
    if (stageWrap) stageWrap.classList.add("is-dragging");
    setDragTargetsFromEvent(ev);
  });

  sim.addEventListener("pointermove", (ev) => {
    if (!state.dragging || ev.pointerId !== state.dragPtrId) return;
    setDragTargetsFromEvent(ev);
  });

  function endDrag(ev) {
    if (ev.pointerId !== state.dragPtrId) return;
    state.dragging = false;
    state.dragPtrId = null;
    if (stageWrap) stageWrap.classList.remove("is-dragging");
    try {
      sim.releasePointerCapture(ev.pointerId);
    } catch (_) {}

    if (!state.fallen && isSuperconducting() && state.h < PHYS.repelHMin + 32) {
      state.v += 110 + Math.random() * 55;
      state.microImpulse += 180;
    }
  }

  sim.addEventListener("pointerup", endDrag);
  sim.addEventListener("pointercancel", endDrag);

  document.querySelectorAll("[data-edu]").forEach((el) => {
    const key = el.getAttribute("data-edu");
    el.addEventListener("mousemove", (e) => onEduHover(e, key));
    el.addEventListener("mouseleave", hideTooltip);
  });

  chkEdu.addEventListener("change", () => {
    setEduMode(chkEdu.checked);
    if (!chkEdu.checked) hideTooltip();
  });

  chkLock.addEventListener("change", () => {
    if (chkLock.checked) {
      state.pinH = state.h;
      state.pinX = state.x;
    }
  });

  selectMat.addEventListener("change", () => {
    state.Tc = materialTc();
    resetSimulation();
  });

  document.querySelectorAll(".mat-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const m = card.getAttribute("data-mat");
      if (m && MATERIALS[m]) {
        selectMat.value = m;
        selectMat.dispatchEvent(new Event("change"));
      }
    });
  });

  ["input", "change"].forEach((evt) => {
    sliderT.addEventListener(evt, updateLabels);
    sliderB.addEventListener(evt, updateLabels);
    sliderH0.addEventListener(evt, updateLabels);
  });

  btnReset.addEventListener("click", resetSimulation);
  btnApplyH0.addEventListener("click", resetSimulation);

  sliderT.addEventListener("input", () => {
    if (!state.fallen) {
      state.T = parseFloat(sliderT.value);
    }
  });

  gameover.classList.add("hidden");
  setEduMode(chkEdu.checked);
  updateLabels();
  function onViewportChange() {
    resizeSim();
    resizeChartCanvas();
    syncDiscGeometry();
    initParticles();
    initMicroDots();
  }

  resizeSim();
  resizeChartCanvas();
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("orientationchange", () => {
    requestAnimationFrame(onViewportChange);
  });
  syncDiscGeometry();
  resetSimulation();
  requestAnimationFrame(loop);
})();
