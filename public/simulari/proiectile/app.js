// app.js — panouri fixe + toggle ☰ + proiectil BAC + fullscreen
(() => {
    const $ = (id) => document.getElementById(id);

    function simT(path, fallback) {
      if (typeof window.simLbl === "function") return window.simLbl(path, fallback);
      return fallback;
    }

    const leftPanel = $("leftPanel");
    const rightPanel = $("rightPanel");
    const toggleProjLeft = $("toggleProjLeft");
    const toggleProjRight = $("toggleProjRight");
    const topbarEl = document.querySelector(".topbar");

    function isProjMobileViewport(){
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function syncProjPanelTop(){
      if (topbarEl){
        const h = Math.ceil(topbarEl.getBoundingClientRect().height);
        document.documentElement.style.setProperty("--proj-panel-top", `${h}px`);
      }
    }

    function updateProjTogglePositions(){
      if (!toggleProjLeft || !toggleProjRight) return;
      const lw = leftPanel?.offsetWidth || 300;
      const rw = rightPanel?.offsetWidth || 320;
      const leftHidden = leftPanel?.classList.contains("hidden");
      const rightHidden = rightPanel?.classList.contains("hidden");

      toggleProjLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
      toggleProjLeft.style.right = "auto";

      toggleProjRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
      toggleProjRight.style.left = "auto";
    }

    function syncProjToggleAria(){
      const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
      const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
      toggleProjLeft?.setAttribute("aria-expanded", String(!!lOpen));
      toggleProjRight?.setAttribute("aria-expanded", String(!!rOpen));
    }

    function syncProjPanelsUi(){
      syncProjPanelTop();
      updateProjTogglePositions();
      syncProjToggleAria();
      resize();
    }

    function applyProjInitialPanels(){
      if (!leftPanel || !rightPanel) return;
      if (isProjMobileViewport()){
        leftPanel.classList.add("hidden");
        rightPanel.classList.add("hidden");
      } else {
        leftPanel.classList.remove("hidden");
        rightPanel.classList.remove("hidden");
      }
      syncProjPanelsUi();
    }

    function onProjResize(){
      if (!isProjMobileViewport()){
        leftPanel?.classList.remove("hidden");
        rightPanel?.classList.remove("hidden");
      }
      syncProjPanelsUi();
    }

    if (toggleProjLeft && leftPanel){
      toggleProjLeft.addEventListener("click", () => {
        leftPanel.classList.toggle("hidden");
        if (isProjMobileViewport() && !leftPanel.classList.contains("hidden") && rightPanel){
          rightPanel.classList.add("hidden");
        }
        syncProjPanelsUi();
      });
    }

    if (toggleProjRight && rightPanel){
      toggleProjRight.addEventListener("click", () => {
        rightPanel.classList.toggle("hidden");
        if (isProjMobileViewport() && !rightPanel.classList.contains("hidden") && leftPanel){
          leftPanel.classList.add("hidden");
        }
        syncProjPanelsUi();
      });
    }

    window.addEventListener("resize", onProjResize);

    // Elements
    const canvas = $("canvas");
    const ctx = canvas.getContext("2d");
  
    const stage = $("stage");
    const btnPlay = $("btnPlay");
    const btnReset = $("btnReset");
    const btnFull = $("btnFull");
    const btnStep = $("btnStep");
    const btnClear = $("btnClear");
  
    const v0El = $("v0");
    const angEl = $("ang");
    const h0El = $("h0");
    const gEl = $("g");
    const speedEl = $("speed");
    const traceResEl = $("traceRes");
    const kEl = $("k");
  
    const chkAir = $("chkAir");
    const chkTrace = $("chkTrace");
    const chkVectors = $("chkVectors");
    const chkGrid = $("chkGrid");
  
    const modePill = $("modePill");
    const statusPill = $("statusPill");
    const hudText = $("hudText");
  
    const labV0 = $("labV0");
    const labAng = $("labAng");
    const labH0 = $("labH0");
    const labG = $("labG");
    const labSpeed = $("labSpeed");
    const labTrace = $("labTrace");
    const labK = $("labK");
  
    const outT = $("outT");
    const outR = $("outR");
    const outHmax = $("outHmax");
    const outTup = $("outTup");
    const outVimp = $("outVimp");
    const outYmax = $("outYmax");
  
    const outt = $("outt");
    const outx = $("outx");
    const outy = $("outy");
    const outv = $("outv");
  
    // Helpers
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const toRad = (d) => (d * Math.PI) / 180;
    const hypot = (a, b) => Math.sqrt(a * a + b * b);
    const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "—");
  
    function flightTimeNoAir(h0, v0y, g) {
      // (g/2)t^2 - v0y t - h0 = 0
      const A = g / 2;
      const B = -v0y;
      const C = -h0;
      const D = B * B - 4 * A * C;
      if (D < 0) return 0;
      const t1 = (-B + Math.sqrt(D)) / (2 * A);
      const t2 = (-B - Math.sqrt(D)) / (2 * A);
      const T = Math.max(t1, t2);
      return T > 0 ? T : 0;
    }
  
    function bacNoAir() {
      const v0 = +v0El.value;
      const a = toRad(+angEl.value);
      const h0 = +h0El.value;
      const g = +gEl.value;
  
      const v0x = v0 * Math.cos(a);
      const v0y = v0 * Math.sin(a);
  
      const Tup = v0y / g;
      const Hmax = h0 + (v0y * v0y) / (2 * g);
  
      const T = flightTimeNoAir(h0, v0y, g);
      const R = v0x * T;
  
      const Vimp = Math.sqrt(Math.max(0, v0 * v0 + 2 * g * h0));
      return { v0x, v0y, T, R, Hmax, Tup, Vimp };
    }
  
    // Simulation state
    const S = {
      running: false,
      landed: false,
      t: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ymax: 0,
      vImpact: 0,
    };
  
    // View
    const V = {
      scale: 18, // px per m
      ox: 90,
      oy: 0,
      panX: 0,
      panY: 0,
      draggingPan: false,
      draggingLaunch: false,
      lastX: 0,
      lastY: 0,
    };
  
    let trace = [];
    let predicted = [];
    let lastTraceAdd = 0;
  
    const keys = { space: false };
    window.addEventListener("keydown", (e) => { if (e.code === "Space") keys.space = true; });
    window.addEventListener("keyup", (e) => { if (e.code === "Space") keys.space = false; });
  
    // World <-> screen
    function w2s(wx, wy) {
      return { x: (V.ox + V.panX) + wx * V.scale, y: (V.oy + V.panY) - wy * V.scale };
    }
    function s2w(sx, sy) {
      return { x: (sx - (V.ox + V.panX)) / V.scale, y: ((V.oy + V.panY) - sy) / V.scale };
    }
  
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      V.oy = rect.height - 70;
      draw();
    }
  
    function buildPredicted() {
      predicted = [];
      const { v0x, v0y, T } = bacNoAir();
      const h0 = +h0El.value;
      const g = +gEl.value;
  
      const steps = clamp(+traceResEl.value, 8, 140);
      for (let i = 0; i <= steps; i++) {
        const t = (T * i) / steps;
        const x = v0x * t;
        const y = h0 + v0y * t - 0.5 * g * t * t;
        predicted.push({ x, y: Math.max(0, y) });
      }
    }
  
    // Drawing
    function clear() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  
    function drawGrid() {
      if (!chkGrid.checked) return;
      const rect = canvas.getBoundingClientRect();
      const step = V.scale; // 1m
      const right = rect.width;
      const bottom = rect.height;
  
      ctx.save();
      ctx.strokeStyle = "rgba(15,23,42,0.08)";
      ctx.lineWidth = 1;
  
      for (let x = (V.ox + V.panX) % step; x < right; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, bottom); ctx.stroke();
      }
      for (let y = (V.oy + V.panY) % step; y < bottom; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(right, y); ctx.stroke();
      }
  
      // axes
      ctx.strokeStyle = "rgba(15,23,42,0.22)";
      ctx.lineWidth = 2;
      const o = w2s(0, 0);
      ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(right, o.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, bottom); ctx.stroke();
  
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText(simT("labels.axisX", "x (m)"), right - 50, o.y - 10);
      ctx.fillText(simT("labels.axisY", "y (m)"), o.x + 10, 18);
  
      ctx.restore();
    }
  
    function drawPath(points, stroke, width) {
      if (!points || points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      const p0 = w2s(points[0].x, points[0].y);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < points.length; i++) {
        const p = w2s(points[i].x, points[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }
  
    function drawLaunchHandle() {
      const h0 = +h0El.value;
      const p = w2s(0, h0);
      const base = w2s(0, 0);
  
      ctx.save();
      ctx.strokeStyle = "rgba(15,23,42,0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(base.x, p.y);
      ctx.stroke();
  
      ctx.fillStyle = "rgba(22,163,74,0.18)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
  
      ctx.fillStyle = "rgba(22,163,74,0.95)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
  
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("h₀", p.x + 14, p.y - 10);
      ctx.restore();
    }
  
    function drawProjectile() {
      const p = w2s(S.x, S.y);
      ctx.save();
      ctx.shadowColor = "rgba(37,99,235,0.32)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(37,99,235,0.95)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  
    function drawVector(x, y, vx, vy, scale, label, color) {
      const p = w2s(x, y);
      const tip = w2s(x + vx * scale, y + vy * scale);
  
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
  
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  
      const ang = Math.atan2(tip.y - p.y, tip.x - p.x);
      const size = 8;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x - size * Math.cos(ang - 0.4), tip.y - size * Math.sin(ang - 0.4));
      ctx.lineTo(tip.x - size * Math.cos(ang + 0.4), tip.y - size * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fill();
  
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText(label, tip.x + 8, tip.y + 4);
      ctx.restore();
    }
  
    function draw() {
      clear();
      drawGrid();
  
      if (!chkAir.checked && predicted.length > 1) {
        drawPath(predicted, "rgba(22,163,74,0.65)", 2);
        ctx.save();
        ctx.fillStyle = "rgba(22,163,74,0.65)";
        for (let i = 0; i < predicted.length; i += 2) {
          const p = w2s(predicted[i].x, predicted[i].y);
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
  
      if (chkTrace.checked && trace.length > 1) {
        drawPath(trace, "rgba(37,99,235,0.9)", 2.5);
      }
  
      drawLaunchHandle();
      drawProjectile();
  
      if (chkVectors.checked) {
        drawVector(S.x, S.y, S.vx, S.vy, 0.25, "v", "rgba(37,99,235,0.9)");
        const g = +gEl.value;
        let ax = 0, ay = -g;
        if (chkAir.checked) {
          const k = +kEl.value;
          const sp = hypot(S.vx, S.vy);
          ax += -k * sp * S.vx;
          ay += -k * sp * S.vy;
        }
        drawVector(S.x, S.y, ax, ay, 0.7, "a", "rgba(239,68,68,0.9)");
      }
    }
  
    // Simulation
    function resetSim(keepTrace = false) {
      const v0 = +v0El.value;
      const a = toRad(+angEl.value);
      const h0 = +h0El.value;
  
      S.running = false;
      S.landed = false;
      S.t = 0;
      S.x = 0;
      S.y = h0;
      S.vx = v0 * Math.cos(a);
      S.vy = v0 * Math.sin(a);
      S.ymax = h0;
      S.vImpact = 0;
  
      if (!keepTrace) trace = [{ x: S.x, y: S.y }];
      lastTraceAdd = 0;
  
      updateUI();
      draw();
      hudText.textContent = simT("hud.ready", "Preg\u0103tit. Apas\u0103 Start.");
    }
  
    function integrate(dt) {
      const g = +gEl.value;
      let ax = 0, ay = -g;
  
      if (chkAir.checked) {
        const k = +kEl.value;
        const sp = hypot(S.vx, S.vy);
        ax += -k * sp * S.vx;
        ay += -k * sp * S.vy;
      }
  
      // semi-implicit Euler
      S.vx += ax * dt;
      S.vy += ay * dt;
      S.x += S.vx * dt;
      S.y += S.vy * dt;
      S.t += dt;
  
      S.ymax = Math.max(S.ymax, S.y);
  
      if (S.y <= 0) {
        S.y = 0;
        S.landed = true;
        S.running = false;
        S.vImpact = hypot(S.vx, S.vy);
        hudText.textContent = simT(
          "hud.landed",
          "A aterizat. Reset sau Start (reporne\u0219te)."
        );
      }
    }
  
    function stepFrame(dtReal) {
      const speed = +speedEl.value;
      const dt = clamp(dtReal * speed, 0, 1 / 30);
  
      integrate(dt);
  
      const targetHz = clamp(+traceResEl.value, 8, 60);
      lastTraceAdd += dt;
      if (lastTraceAdd >= 1 / targetHz) {
        lastTraceAdd = 0;
        if (chkTrace.checked) trace.push({ x: S.x, y: S.y });
      }
  
      updateUI();
      draw();
    }
  
    let raf = null;
    let prev = performance.now();
    function loop(now) {
      const dt = (now - prev) / 1000;
      prev = now;
      if (S.running) stepFrame(dt);
      raf = requestAnimationFrame(loop);
    }
  
    // UI
    function updateLabels() {
      labV0.textContent = (+v0El.value).toFixed(1);
      labAng.textContent = (+angEl.value).toFixed(0);
      labH0.textContent = (+h0El.value).toFixed(1);
      labG.textContent = (+gEl.value).toFixed(1);
      labSpeed.textContent = (+speedEl.value).toFixed(2);
      labTrace.textContent = (+traceResEl.value).toFixed(0);
      labK.textContent = (+kEl.value).toFixed(3);
    }
  
    function updateResults() {
      const air = chkAir.checked;
  
      if (!air) {
        const b = bacNoAir();
        outT.textContent = `${fmt(b.T, 2)} s`;
        outR.textContent = `${fmt(b.R, 2)} m`;
        outHmax.textContent = `${fmt(b.Hmax, 2)} m`;
        outTup.textContent = `${fmt(b.Tup, 2)} s`;
        outVimp.textContent = `${fmt(b.Vimp, 2)} m/s`;
        modePill.textContent = simT("labels.modeNoAir", "F\u0103r\u0103 aer (BAC)");
        modePill.style.borderColor = "rgba(22,163,74,.35)";
      } else {
        outT.textContent = S.landed ? `${fmt(S.t, 2)} s` : "—";
        outR.textContent = S.landed ? `${fmt(S.x, 2)} m` : "—";
        outHmax.textContent = `${fmt(S.ymax, 2)} m`;
        outTup.textContent = "—";
        outVimp.textContent = S.landed ? `${fmt(S.vImpact, 2)} m/s` : `${fmt(hypot(S.vx, S.vy), 2)} m/s`;
        modePill.textContent = simT("labels.modeAir", "Cu aer (numeric)");
        modePill.style.borderColor = "rgba(239,68,68,.30)";
      }
  
      outYmax.textContent = `${fmt(S.ymax, 2)} m`;
  
      outt.textContent = `${fmt(S.t, 2)} s`;
      outx.textContent = `${fmt(S.x, 2)} m`;
      outy.textContent = `${fmt(S.y, 2)} m`;
      outv.textContent = `${fmt(hypot(S.vx, S.vy), 2)} m/s`;
  
      statusPill.textContent = S.running
        ? simT("status.running", "ruleaz\u0103")
        : (S.landed ? simT("status.landed", "aterizat") : simT("status.stop", "stop"));
    }
  
    function updateUI() {
      updateLabels();
      updateResults();
    }
  
    function setRunning(on) {
      if (S.landed && on) {
        trace = [{ x: 0, y: +h0El.value }];
        resetSim(true);
      }
      S.running = on;
      btnPlay.textContent = on ? simT("buttons.pause", "Pauz\u0103") : simT("buttons.start", "Start");
      hudText.textContent = on
        ? simT("hud.running", "Simulare \u00een curs\u2026")
        : simT("hud.pausedHud", "Pauz\u0103.");
      updateUI();
    }
  
    // Fullscreen
    function isFullscreen() { return document.fullscreenElement === stage; }
    async function toggleFullscreen() {
      try {
        if (!isFullscreen()) await stage.requestFullscreen();
        else await document.exitFullscreen();
      } catch {
        hudText.textContent = simT(
          "hud.fullscreenBlocked",
          "Full screen blocat de browser (\u00eencearc\u0103 din nou)."
        );
      }
    }
    btnFull.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", () => {
      btnFull.textContent = isFullscreen()
        ? simT("buttons.exitFullscreen", "Exit full")
        : simT("buttons.fullscreen", "Full screen");
      setTimeout(() => resize(), 50);
    });
  
    // Events
    btnPlay.addEventListener("click", () => setRunning(!S.running));
    btnReset.addEventListener("click", () => {
      V.scale = 18; V.panX = 0; V.panY = 0;
      buildPredicted();
      resetSim(false);
    });
    btnClear.addEventListener("click", () => { trace = [{ x: S.x, y: S.y }]; draw(); });
    btnStep.addEventListener("click", () => { if (!S.running && !S.landed) stepFrame(1 / 60); });
  
    function onParamChange() {
      buildPredicted();
      if (!S.running) resetSim(false);
      else updateUI();
    }
  
    [v0El, angEl, h0El, gEl].forEach(el => el.addEventListener("input", onParamChange));
    [speedEl, traceResEl, kEl].forEach(el => el.addEventListener("input", () => { buildPredicted(); updateUI(); draw(); }));
    chkAir.addEventListener("change", () => { buildPredicted(); updateUI(); draw(); });
    chkTrace.addEventListener("change", draw);
    chkVectors.addEventListener("change", draw);
    chkGrid.addEventListener("change", draw);
  
    // Zoom / Pan / Drag launch
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
  
      const before = s2w(sx, sy);
      const zoom = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      V.scale = clamp(V.scale * zoom, 8, 60);
  
      const after = s2w(sx, sy);
      V.panX += (after.x - before.x) * V.scale;
      V.panY -= (after.y - before.y) * V.scale;
  
      draw();
    }, { passive:false });
  
    function hitLaunchHandle(sx, sy) {
      const p = w2s(0, +h0El.value);
      const dx = sx - p.x;
      const dy = sy - p.y;
      return dx * dx + dy * dy <= 14 * 14;
    }
  
    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
  
      V.lastX = sx; V.lastY = sy;
  
      if (keys.space) {
        V.draggingPan = true;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
  
      if (!S.running && hitLaunchHandle(sx, sy)) {
        V.draggingLaunch = true;
        canvas.setPointerCapture(e.pointerId);
      }
    });
  
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
  
      if (V.draggingPan) {
        V.panX += (sx - V.lastX);
        V.panY += (sy - V.lastY);
        V.lastX = sx; V.lastY = sy;
        draw();
        return;
      }
  
      if (V.draggingLaunch) {
        const w = s2w(sx, sy);
        h0El.value = String(clamp(w.y, +h0El.min, +h0El.max));
        buildPredicted();
        resetSim(false);
        draw();
      }
    });
  
    canvas.addEventListener("pointerup", (e) => {
      V.draggingPan = false;
      V.draggingLaunch = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    });
  
    // Init
    function init() {
      applyProjInitialPanels();
      buildPredicted();
      resetSim(false);
      resize();
      if (!raf) raf = requestAnimationFrame(loop);
    }
    init();
  })();
  