(() => {
    const $ = (id) => document.getElementById(id);

    const simT = (path, ro) =>
      typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;
  
    const leftPanel = $("leftPanel");
    const rightPanel = $("rightPanel");
    const togglePmLeft = $("togglePmLeft");
    const togglePmRight = $("togglePmRight");

    function isPmMobileViewport(){
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function updatePmTogglePositions(){
      if (!togglePmLeft || !togglePmRight) return;
      const lw = leftPanel?.offsetWidth || 250;
      const rw = rightPanel?.offsetWidth || 250;
      const leftHidden = leftPanel?.classList.contains("hidden");
      const rightHidden = rightPanel?.classList.contains("hidden");

      togglePmLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
      togglePmLeft.style.right = "auto";

      togglePmRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
      togglePmRight.style.left = "auto";
    }

    function syncPmToggleAria(){
      const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
      const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
      togglePmLeft?.setAttribute("aria-expanded", String(!!lOpen));
      togglePmRight?.setAttribute("aria-expanded", String(!!rOpen));
    }

    function syncPmPanelsUi(){
      updatePmTogglePositions();
      syncPmToggleAria();
      resizeCanvas();
    }

    function applyPmInitialPanels(){
      if (!leftPanel || !rightPanel) return;
      if (isPmMobileViewport()){
        leftPanel.classList.add("hidden");
        rightPanel.classList.add("hidden");
      } else {
        leftPanel.classList.remove("hidden");
        rightPanel.classList.remove("hidden");
      }
      syncPmPanelsUi();
    }

    function onPmResize(){
      if (!isPmMobileViewport()){
        leftPanel?.classList.remove("hidden");
        rightPanel?.classList.remove("hidden");
      }
      syncPmPanelsUi();
    }

    if (togglePmLeft && leftPanel){
      togglePmLeft.addEventListener("click", () => {
        leftPanel.classList.toggle("hidden");
        if (isPmMobileViewport() && !leftPanel.classList.contains("hidden") && rightPanel){
          rightPanel.classList.add("hidden");
        }
        syncPmPanelsUi();
      });
    }

    if (togglePmRight && rightPanel){
      togglePmRight.addEventListener("click", () => {
        rightPanel.classList.toggle("hidden");
        if (isPmMobileViewport() && !rightPanel.classList.contains("hidden") && leftPanel){
          leftPanel.classList.add("hidden");
        }
        syncPmPanelsUi();
      });
    }

    window.addEventListener("resize", onPmResize);
  
    // UI inputs
    const count = $("count");
    const theta1 = $("theta1");
    const theta2 = $("theta2");
    const spread = $("spread");
    const L1 = $("L1");
    const L2 = $("L2");
    const m1 = $("m1");
    const m2 = $("m2");
    const g = $("g");
    const damp = $("damp");
    const dtEl = $("dt");
    const trail = $("trail");
    const trailAlpha = $("trailAlpha");
  
    const countVal = $("countVal");
    const theta1Val = $("theta1Val");
    const theta2Val = $("theta2Val");
    const spreadVal = $("spreadVal");
    const L1Val = $("L1Val");
    const L2Val = $("L2Val");
    const m1Val = $("m1Val");
    const m2Val = $("m2Val");
    const gVal = $("gVal");
    const dampVal = $("dampVal");
    const dtVal = $("dtVal");
    const trailVal = $("trailVal");
    const trailAlphaVal = $("trailAlphaVal");
  
    const startPause = $("startPause");
    const resetBtn = $("reset");
  
    const showRods = $("showRods");
    const showBobs = $("showBobs");
    const showTrace = $("showTrace");
    const showAll = $("showAll");
  
    // Right panel live
    const timeVal = $("timeVal");
    const statusVal = $("statusVal");
    const fpsVal = $("fpsVal");
    const statusBox = $("statusBox");
  
    // Canvas
    const canvas = $("c");
    const ctx = canvas.getContext("2d");
  
    function resizeCanvas(){
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    // Helpers
    const TAU = Math.PI * 2;
    const deg2rad = (d) => (d * Math.PI) / 180;
    const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
  
    function lerp(a,b,t){ return a + (b-a)*t; }
  
    // Color palette (distinct + fun)
    function colorFor(i, n){
      // HSL rainbow, nice saturation, fixed lightness
      const h = (i / Math.max(1,n)) * 300 + 20;
      return `hsl(${h} 85% 48%)`;
    }
  
    // State per pendulum
    // theta1, omega1, theta2, omega2, trail[]
    let pendulums = [];
    let running = false;
    let simTime = 0;
  
    // FPS measure
    let fps = 0;
    let _frames = 0;
    let _acc = 0;
  
    function setStatus(kind, messageKey, roMessage) {
      statusBox.className = `status ${kind}`;
      const prefix = simT("status.prefix", "Stare:");
      const text = simT(messageKey, roMessage);
      statusBox.textContent = `${prefix} ${text}`;
    }
  
    function readParams(){
      const params = {
        N: parseInt(count.value, 10),
        th1: deg2rad(parseFloat(theta1.value)),
        th2: deg2rad(parseFloat(theta2.value)),
        spread: deg2rad(parseFloat(spread.value)),
        L1: parseFloat(L1.value),
        L2: parseFloat(L2.value),
        m1: parseFloat(m1.value),
        m2: parseFloat(m2.value),
        g: parseFloat(g.value),
        damp: parseFloat(damp.value),
        dt: parseFloat(dtEl.value),
        trailMax: parseInt(trail.value, 10),
        trailAlpha: parseFloat(trailAlpha.value),
      };
      return params;
    }
  
    function syncUI(){
      countVal.textContent = count.value;
      theta1Val.textContent = theta1.value;
      theta2Val.textContent = theta2.value;
      spreadVal.textContent = parseFloat(spread.value).toFixed(2);
      L1Val.textContent = parseFloat(L1.value).toFixed(2);
      L2Val.textContent = parseFloat(L2.value).toFixed(2);
      m1Val.textContent = parseFloat(m1.value).toFixed(1);
      m2Val.textContent = parseFloat(m2.value).toFixed(1);
      gVal.textContent = parseFloat(g.value).toFixed(2);
      dampVal.textContent = parseFloat(damp.value).toFixed(2);
      dtVal.textContent = parseFloat(dtEl.value).toFixed(3);
      trailVal.textContent = trail.value;
      trailAlphaVal.textContent = parseFloat(trailAlpha.value).toFixed(2);
    }
  
    // Create ensemble with small perturbations
    function buildPendulums(){
      const p = readParams();
      pendulums = [];
      simTime = 0;
      for (let i=0;i<p.N;i++){
        const t = (p.N === 1) ? 0 : (i/(p.N-1))*2 - 1; // -1..1
        const d = t * p.spread;
  
        pendulums.push({
          th1: p.th1 + d,
          w1: 0,
          th2: p.th2 - d,
          w2: 0,
          trail: [],
          color: colorFor(i, p.N),
        });
      }
      setStatus("ok", "status.stopped", "Simulare oprită");
    }
  
    // Double pendulum dynamics (standard form)
    // returns derivatives for state [th1, w1, th2, w2]
    function deriv(state, params){
      const { th1, w1, th2, w2 } = state;
      const { L1, L2, m1, m2, g, damp } = params;
  
      const dth1 = w1;
      const dth2 = w2;
  
      const delta = th2 - th1;
  
      // avoid repeated
      const sinDelta = Math.sin(delta);
      const cosDelta = Math.cos(delta);
  
      const denom1 = (m1 + m2) * L1 - m2 * L1 * cosDelta * cosDelta;
      const denom2 = (L2 / L1) * denom1;
  
      // angular accelerations
      let a1 =
        (m2 * L1 * w1 * w1 * sinDelta * cosDelta +
          m2 * g * Math.sin(th2) * cosDelta +
          m2 * L2 * w2 * w2 * sinDelta -
          (m1 + m2) * g * Math.sin(th1)) / denom1;
  
      let a2 =
        (-m2 * L2 * w2 * w2 * sinDelta * cosDelta +
          (m1 + m2) * (g * Math.sin(th1) * cosDelta - L1 * w1 * w1 * sinDelta - g * Math.sin(th2))) / denom2;
  
      // damping (simple)
      a1 -= damp * w1;
      a2 -= damp * w2;
  
      return { dth1, dw1: a1, dth2, dw2: a2 };
    }
  
    // RK4 integrator
    function rk4Step(pend, params, dt){
      const s0 = { th1: pend.th1, w1: pend.w1, th2: pend.th2, w2: pend.w2 };
  
      const k1 = deriv(s0, params);
  
      const s1 = {
        th1: s0.th1 + k1.dth1 * dt/2,
        w1:  s0.w1  + k1.dw1  * dt/2,
        th2: s0.th2 + k1.dth2 * dt/2,
        w2:  s0.w2  + k1.dw2  * dt/2,
      };
      const k2 = deriv(s1, params);
  
      const s2 = {
        th1: s0.th1 + k2.dth1 * dt/2,
        w1:  s0.w1  + k2.dw1  * dt/2,
        th2: s0.th2 + k2.dth2 * dt/2,
        w2:  s0.w2  + k2.dw2  * dt/2,
      };
      const k3 = deriv(s2, params);
  
      const s3 = {
        th1: s0.th1 + k3.dth1 * dt,
        w1:  s0.w1  + k3.dw1  * dt,
        th2: s0.th2 + k3.dth2 * dt,
        w2:  s0.w2  + k3.dw2  * dt,
      };
      const k4 = deriv(s3, params);
  
      pend.th1 += (dt/6) * (k1.dth1 + 2*k2.dth1 + 2*k3.dth1 + k4.dth1);
      pend.w1  += (dt/6) * (k1.dw1  + 2*k2.dw1  + 2*k3.dw1  + k4.dw1);
  
      pend.th2 += (dt/6) * (k1.dth2 + 2*k2.dth2 + 2*k3.dth2 + k4.dth2);
      pend.w2  += (dt/6) * (k1.dw2  + 2*k2.dw2  + 2*k3.dw2  + k4.dw2);
    }
  
    function positions(pend, params){
      const { L1, L2 } = params;
      const x1 = L1 * Math.sin(pend.th1);
      const y1 = L1 * Math.cos(pend.th1);
  
      const x2 = x1 + L2 * Math.sin(pend.th2);
      const y2 = y1 + L2 * Math.cos(pend.th2);
  
      return { x1, y1, x2, y2 };
    }
  
    // Drawing
    function clear(){
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  
    function draw(){
      const p = readParams();
      const w = canvas.width;
      const h = canvas.height;
  
      // origin near top center
      const origin = { x: w*0.5, y: h*0.20 };
  
      // scale meters -> pixels based on total length
      const total = p.L1 + p.L2;
      const s = Math.min(w, h) * 0.40 / Math.max(0.1, total);
  
      // background soft grid
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.02)";
      for(let yy=0; yy<h; yy+=40){
        ctx.fillRect(0, yy, w, 1);
      }
      for(let xx=0; xx<w; xx+=40){
        ctx.fillRect(xx, 0, 1, h);
      }
      ctx.restore();
  
      // pivot
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.55)";
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 6, 0, TAU);
      ctx.fill();
      ctx.restore();
  
      // decide which pendulums are visible
      const list = showAll.checked ? pendulums : (pendulums.length ? [pendulums[0]] : []);
  
      // traces first (behind)
      if (showTrace.checked){
        for (let i=0;i<list.length;i++){
          const pend = list[i];
          const alpha = p.trailAlpha;
          ctx.save();
          ctx.strokeStyle = pend.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 2.2;
  
          const tr = pend.trail;
          if (tr.length > 1){
            ctx.beginPath();
            ctx.moveTo(origin.x + tr[0].x*s, origin.y + tr[0].y*s);
            for (let k=1;k<tr.length;k++){
              ctx.lineTo(origin.x + tr[k].x*s, origin.y + tr[k].y*s);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
      }
  
      // rods + bobs
      for (let i=0;i<list.length;i++){
        const pend = list[i];
        const { x1,y1,x2,y2 } = positions(pend, p);
  
        const X1 = origin.x + x1*s;
        const Y1 = origin.y + y1*s;
        const X2 = origin.x + x2*s;
        const Y2 = origin.y + y2*s;
  
        // rods
        if (showRods.checked){
          ctx.save();
          ctx.strokeStyle = "rgba(15,23,42,.18)";
          ctx.lineWidth = 4.0;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(X1, Y1);
          ctx.lineTo(X2, Y2);
          ctx.stroke();
  
          // colored highlight for each pendulum (subtle)
          ctx.strokeStyle = pend.color;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(X1, Y1);
          ctx.lineTo(X2, Y2);
          ctx.stroke();
          ctx.restore();
        }
  
        // bobs
        if (showBobs.checked){
          const r1 = 7 + 6 * clamp(p.m1/5, 0, 1);
          const r2 = 8 + 8 * clamp(p.m2/5, 0, 1);
  
          ctx.save();
          // bob 1
          ctx.fillStyle = "rgba(15,23,42,.35)";
          ctx.beginPath(); ctx.arc(X1, Y1, r1+2, 0, TAU); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.95)";
          ctx.beginPath(); ctx.arc(X1, Y1, r1, 0, TAU); ctx.fill();
  
          // bob 2 (colored)
          ctx.fillStyle = pend.color;
          ctx.globalAlpha = 0.95;
          ctx.beginPath(); ctx.arc(X2, Y2, r2, 0, TAU); ctx.fill();
  
          // shine
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(X2 - r2*0.35, Y2 - r2*0.35, r2*0.45, 0, TAU); ctx.fill();
  
          ctx.restore();
        }
  
        // store last positions for trace (bob 2)
        if (showTrace.checked){
          pend.trail.push({ x: x2, y: y2 });
          const maxLen = p.trailMax;
          if (pend.trail.length > maxLen) pend.trail.splice(0, pend.trail.length - maxLen);
        } else {
          // if trace hidden, don't keep growing arrays
          pend.trail.length = 0;
        }
      }
  
      // HUD minimal
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.82)";
      ctx.font = `${Math.max(12, Math.floor(Math.min(w,h)*0.018))}px ui-sans-serif, system-ui`;
      ctx.fillText(`N=${p.N}  dt=${p.dt.toFixed(3)}s  damp=${p.damp.toFixed(2)}  spread=${(p.spread*180/Math.PI).toFixed(2)}°`, 18, 28);
      ctx.restore();
    }
  
    // Simulation step
    function step(){
      const p = readParams();
      const dt = p.dt;
  
      for (const pend of pendulums){
        rk4Step(pend, p, dt);
      }
  
      simTime += dt;
    }
  
    // Controls
    startPause.addEventListener("click", () => {
      running = !running;
      startPause.textContent = running
        ? simT("buttons.pause", "Pauză")
        : simT("buttons.start", "Pornește");
      statusVal.textContent = running
        ? simT("hud.running", "RULEAZĂ")
        : simT("hud.paused", "PAUZĂ");
      setStatus(
        running ? "ok" : "warn",
        running ? "status.running" : "status.stopped",
        running ? "Simulare pornită" : "Simulare oprită"
      );
    });
  
    resetBtn.addEventListener("click", () => {
      buildPendulums();
      startPause.textContent = simT("buttons.start", "Pornește");
      running = false;
      statusVal.textContent = simT("hud.paused", "PAUZĂ");
      setStatus("ok", "status.reset", "Simulare resetată");
    });
  
    // Rebuild when important params change
    const rebuildOn = [count, theta1, theta2, spread, L1, L2, m1, m2];
    rebuildOn.forEach(el => el.addEventListener("input", () => {
      syncUI();
      buildPendulums();
    }));
  
    // Update-only params
    const updateOnly = [g, damp, dtEl, trail, trailAlpha];
    updateOnly.forEach(el => el.addEventListener("input", () => syncUI()));
  
    // Toggle trace clearing
    showTrace.addEventListener("change", () => {
      if (!showTrace.checked){
        for (const p of pendulums) p.trail.length = 0;
      }
    });
  
    // Main loop
    let last = performance.now();
    function loop(now){
      const dtReal = (now - last) / 1000;
      last = now;
  
      // fps calc
      _frames++;
      _acc += dtReal;
      if (_acc >= 0.5){
        fps = Math.round(_frames / _acc);
        _frames = 0;
        _acc = 0;
        fpsVal.textContent = `${fps}`;
      }
  
      if (running){
        // If dt is small, we can do multiple steps per frame for stability
        // But keep it simple: 1 step per frame + RK4 helps a lot
        step();
      }
  
      timeVal.textContent = `${simTime.toFixed(2)} s`;
  
      resizeCanvas(); // keeps full screen crisp if panels moved (cheap enough)
      clear();
      draw();
  
      requestAnimationFrame(loop);
    }
  
    // Init
    syncUI();
    applyPmInitialPanels();
    buildPendulums();
    statusVal.textContent = simT("hud.paused", "PAUZĂ");
    fpsVal.textContent = "—";
  
    requestAnimationFrame(loop);
  })();
  