(() => {
    const $ = (id) => document.getElementById(id);

    const simT = (path, ro) =>
      typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;

    const secSuffix = simT("live.secondsSuffix", " s");

    const leftPanel = $("leftPanel");
    const rightPanel = $("rightPanel");
    const toggleRafLeft = $("toggleRafLeft");
    const toggleRafRight = $("toggleRafRight");

    function isRafMobileViewport(){
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function updateRafTogglePositions(){
      if (!toggleRafLeft || !toggleRafRight) return;
      const lw = leftPanel?.offsetWidth || 280;
      const rw = rightPanel?.offsetWidth || 280;
      const leftHidden = leftPanel?.classList.contains("hidden");
      const rightHidden = rightPanel?.classList.contains("hidden");

      toggleRafLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
      toggleRafLeft.style.right = "auto";

      toggleRafRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
      toggleRafRight.style.left = "auto";
    }

    function syncRafToggleAria(){
      const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
      const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
      toggleRafLeft?.setAttribute("aria-expanded", String(!!lOpen));
      toggleRafRight?.setAttribute("aria-expanded", String(!!rOpen));
    }

    function syncRafPanelsUi(){
      updateRafTogglePositions();
      syncRafToggleAria();
      resizeCanvas();
    }

    function applyRafInitialPanels(){
      if (!leftPanel || !rightPanel) return;
      if (isRafMobileViewport()){
        leftPanel.classList.add("hidden");
        rightPanel.classList.add("hidden");
      } else {
        leftPanel.classList.remove("hidden");
        rightPanel.classList.remove("hidden");
      }
      syncRafPanelsUi();
    }

    function onRafResize(){
      if (!isRafMobileViewport()){
        leftPanel?.classList.remove("hidden");
        rightPanel?.classList.remove("hidden");
      }
      syncRafPanelsUi();
    }

    if (toggleRafLeft && leftPanel){
      toggleRafLeft.addEventListener("click", () => {
        leftPanel.classList.toggle("hidden");
        if (isRafMobileViewport() && !leftPanel.classList.contains("hidden") && rightPanel){
          rightPanel.classList.add("hidden");
        }
        syncRafPanelsUi();
      });
    }

    if (toggleRafRight && rightPanel){
      toggleRafRight.addEventListener("click", () => {
        rightPanel.classList.toggle("hidden");
        if (isRafMobileViewport() && !rightPanel.classList.contains("hidden") && leftPanel){
          leftPanel.classList.add("hidden");
        }
        syncRafPanelsUi();
      });
    }

    window.addEventListener("resize", onRafResize);
  
    // UI
    const dist = $("dist");
    const eyeH = $("eyeH");
    const palmH = $("palmH");
    const grad = $("grad");
    const layerH = $("layerH");
    const shimmer = $("shimmer");
    const rays = $("rays");
    const spread = $("spread");
    const steps = $("steps");
    const speed = $("speed");
  
    const distVal = $("distVal");
    const eyeHVal = $("eyeHVal");
    const palmHVal = $("palmHVal");
    const gradVal = $("gradVal");
    const layerHVal = $("layerHVal");
    const shimmerVal = $("shimmerVal");
    const raysVal = $("raysVal");
    const spreadVal = $("spreadVal");
    const stepsVal = $("stepsVal");
    const speedVal = $("speedVal");
  
    const toggleAnim = $("toggleAnim");
    const resetBtn = $("reset");
  
    const showRays = $("showRays");
    const showField = $("showField");
    const showGhost = $("showGhost");
  
    // Right panel live
    const timeVal = $("timeVal");
    const statusVal = $("statusVal");
    const fpsVal = $("fpsVal");
    const statusBox = $("statusBox");
  
    function setStatus(kind, path, roFallback) {
      statusBox.className = `status ${kind}`;
      const msg = simT(path, roFallback);
      statusBox.textContent = `${simT("status.prefix", "Stare:")} ${msg}`;
    }
  
    // Canvas
    const canvas = $("c");
    const ctx = canvas.getContext("2d");
  
    function resizeCanvas(){
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
  
    // World mapping
    function worldParams(){
      const XMAX = Math.max(120, parseFloat(dist.value) + 60);
      const YMAX = 28;
      return { XMAX, YMAX };
    }
    function W2S(x, y){
      const { XMAX, YMAX } = worldParams();
      const w = canvas.width, h = canvas.height;
      const mx = w * 0.06;
      const my = h * 0.10;
  
      const sx = mx + (x / XMAX) * (w - 2*mx);
      const sy = (h - my) - (y / YMAX) * (h - 2*my);
      return { x: sx, y: sy, mx, my, w, h, XMAX, YMAX };
    }
  
    // Indice de refracție: mai mic lângă sol, mai mare mai sus (miraj inferior)
    function nOfY(y, t){
      const k = 0.00025 + 0.0016 * parseFloat(grad.value);
      const H = Math.max(0.15, parseFloat(layerH.value));
  
      const sh = parseFloat(shimmer.value);
      const wobble = sh * 0.00035 * Math.sin(t*2.3 + y*1.7) * Math.exp(-y/(H*0.8));
  
      const base = 1 + k * (1 - Math.exp(-y / H));
      return base + wobble;
    }
  
    // Trasare rază (model stratificat): n(y)*cos(theta)=const
    function traceRay({ x0, y0, theta0, t, maxSteps, stepSize, xStop }){
      const pts = [];
      let x = x0, y = y0;
  
      let n0 = nOfY(y, t);
      let cos0 = Math.cos(theta0);
      cos0 = Math.max(-0.9999, Math.min(0.9999, cos0));
      const C = n0 * cos0;
  
      let sgn = Math.sign(Math.sin(theta0));
      if (sgn === 0) sgn = -1;
  
      let hitGround = false;
      let turned = false;
  
      for (let i=0;i<maxSteps;i++){
        if (x > xStop) break;
  
        const n = nOfY(y, t);
        let cosT = C / n;
  
        if (cosT > 1) { cosT = 1; turned = true; }
        if (cosT < -1) cosT = -1;
  
        let sinT = sgn * Math.sqrt(Math.max(0, 1 - cosT*cosT));
  
        // când raza devine aproape orizontală în jos, o “întoarcem” în sus
        if (!turned && Math.abs(sinT) < 1e-4 && sgn < 0){
          turned = true;
          sgn = +1;
          sinT = +Math.sqrt(Math.max(0, 1 - cosT*cosT));
        }
  
        const dx = cosT * stepSize;
        const dy = sinT * stepSize;
  
        const nx = x + dx;
        const ny = y + dy;
  
        pts.push({x, y});
  
        if (ny <= 0){
          hitGround = true;
          const frac = (y) / (y - ny + 1e-9);
          const gx = x + dx * frac;
          pts.push({x: gx, y: 0});
          break;
        }
  
        if (ny > 40) break;
  
        x = nx;
        y = ny;
      }
  
      return { pts, hitGround, turned };
    }
  
    function lerp(a,b,t){ return a + (b-a)*t; }
  
    // Fundal: cer + dune + strat cald
    function drawBackground(t){
      const w = canvas.width, h = canvas.height;
  
      // cer
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "rgba(135, 206, 255, 0.85)");
      sky.addColorStop(0.45, "rgba(200, 245, 255, 0.55)");
      sky.addColorStop(0.72, "rgba(255, 245, 220, 0.55)");
      sky.addColorStop(1, "rgba(255, 235, 190, 0.95)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
  
      // soare glow
      const sunX = w*0.78, sunY = h*0.18;
      const g = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.min(w,h)*0.35);
      g.addColorStop(0, "rgba(255, 240, 170, 0.65)");
      g.addColorStop(0.25, "rgba(255, 220, 140, 0.25)");
      g.addColorStop(1, "rgba(255, 220, 140, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sunX, sunY, Math.min(w,h)*0.35, 0, Math.PI*2);
      ctx.fill();
  
      const groundY = W2S(0, 0).y;
  
      function duneLayer(yOffset, alpha){
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(233, 188, 120, 1)";
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, groundY - yOffset);
        const amp = 18 + 14*Math.sin(t*0.3 + yOffset*0.07);
        ctx.bezierCurveTo(w*0.25, groundY - yOffset - amp, w*0.55, groundY - yOffset + amp, w, groundY - yOffset - 6);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      duneLayer(-10, 0.55);
      duneLayer(12, 0.75);
      duneLayer(30, 0.95);
  
      // strat cald (bandă)
      if (showField.checked){
        const H = parseFloat(layerH.value);
        const bandTop = W2S(0, H*1.6).y;
        ctx.save();
        ctx.globalAlpha = 0.12 + 0.15*parseFloat(grad.value);
        const g2 = ctx.createLinearGradient(0, groundY, 0, bandTop);
        g2.addColorStop(0, "rgba(255,255,255,0.55)");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, bandTop, w, groundY - bandTop);
        ctx.restore();
      }
    }
  
    function drawOasisAndPalms(t){
      const d = parseFloat(dist.value);
      const palmHeight = parseFloat(palmH.value);
  
      const oasisX = d;
      const oasisW = 22;
  
      const pL = W2S(oasisX - oasisW*0.5, 0);
      const pR = W2S(oasisX + oasisW*0.5, 0);
      const groundY = W2S(0,0).y;
  
      // apă
      ctx.save();
      ctx.fillStyle = "rgba(40, 140, 200, 0.55)";
      ctx.strokeStyle = "rgba(15, 80, 130, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const cx = (pL.x + pR.x)/2;
      const cy = groundY - 6;
      const rx = Math.max(16, (pR.x - pL.x)*0.52);
      const ry = Math.max(5, rx*0.18);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
  
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.ellipse(cx - rx*0.18, cy - ry*0.12, rx*0.35, ry*0.35, -0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
  
      function drawPalm(xWorld, heightM, seed){
        const base = W2S(xWorld, 0);
        const top = W2S(xWorld, heightM);
  
        ctx.save();
        // trunchi
        ctx.strokeStyle = "rgba(90, 55, 30, 0.75)";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        const sway = 10*Math.sin(t*0.35 + seed);
        ctx.moveTo(base.x, base.y);
        ctx.quadraticCurveTo(
          (base.x + top.x)/2 + sway,
          (base.y + top.y)/2,
          top.x + sway*0.45,
          top.y
        );
        ctx.stroke();
  
        // frunze
        ctx.strokeStyle = "rgba(20, 120, 60, 0.70)";
        ctx.lineWidth = 4;
        const leafN = 7;
        for(let i=0;i<leafN;i++){
          const a = -Math.PI/2 + (i-(leafN-1)/2)*0.25;
          const len = 28 + 10*Math.sin(seed + i*1.7);
          const lx = top.x + sway*0.45;
          const ly = top.y;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.quadraticCurveTo(
            lx + Math.cos(a)*len*0.6,
            ly + Math.sin(a)*len*0.6,
            lx + Math.cos(a)*len,
            ly + Math.sin(a)*len
          );
          ctx.stroke();
        }
  
        // nuci de cocos (da, există 😄)
        ctx.fillStyle = "rgba(80, 50, 20, 0.55)";
        for(let i=0;i<3;i++){
          ctx.beginPath();
          ctx.arc(top.x + sway*0.45 + (i-1)*6, top.y + 8, 4.5, 0, Math.PI*2);
          ctx.fill();
        }
  
        ctx.restore();
      }
  
      drawPalm(oasisX - oasisW*0.35, palmHeight, 0.4);
      drawPalm(oasisX + oasisW*0.25, palmHeight*0.92, 1.2);
    }
  
    function drawGhostMirage(){
      if (!showGhost.checked) return;
  
      const d = parseFloat(dist.value);
      const oasisX = d;
      const oasisW = 28;
  
      const left = W2S(oasisX - oasisW*0.7, 0).x;
      const right = W2S(oasisX + oasisW*0.7, 0).x;
      const gy = W2S(0,0).y;
  
      ctx.save();
      ctx.globalAlpha = 0.28 + 0.22*parseFloat(grad.value);
      const g = ctx.createLinearGradient(0, gy-2, 0, gy-60);
      g.addColorStop(0, "rgba(90, 200, 255, 0.65)");
      g.addColorStop(1, "rgba(90, 200, 255, 0)");
      ctx.fillStyle = g;
  
      ctx.beginPath();
      ctx.moveTo(left, gy);
      for (let x = left; x <= right; x += 8){
        const wave = 6*Math.sin(x*0.03 + performance.now()*0.002);
        ctx.lineTo(x, gy - 10 - wave);
      }
      ctx.lineTo(right, gy);
      ctx.closePath();
      ctx.fill();
  
      ctx.restore();
    }
  
    function drawRays(t){
      if (!showRays.checked) return;
  
      const d = parseFloat(dist.value);
      const eyeHeight = parseFloat(eyeH.value);
      const N = parseInt(rays.value, 10);
      const spreadDeg = parseFloat(spread.value);
      const maxSteps = parseInt(steps.value, 10);
  
      // observator
      const eye = { x: 8, y: eyeHeight };
      const eyeS = W2S(eye.x, eye.y);
  
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.78)";
      ctx.beginPath();
      ctx.arc(eyeS.x, eyeS.y, 5, 0, Math.PI*2);
      ctx.fill();
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillStyle = "rgba(15,23,42,.62)";
      ctx.fillText(simT("canvas.observer", "Observator"), eyeS.x + 8, eyeS.y - 8);
      ctx.restore();
  
      const center = -2.5 * Math.PI/180;
      const half = (spreadDeg * Math.PI/180) * 0.5;
  
      const stepSize = 0.55;
      const xStop = d + 70;
  
      for (let i=0;i<N;i++){
        const u = (N===1) ? 0.5 : i/(N-1);
        const theta0 = center + lerp(-half, +half, u);
  
        const ray = traceRay({
          x0: eye.x, y0: eye.y,
          theta0,
          t,
          maxSteps,
          stepSize,
          xStop
        });
  
        const col = ray.hitGround ? "rgba(245,158,11,0.20)" : "rgba(37,99,235,0.18)";
  
        ctx.save();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k=0;k<ray.pts.length;k++){
          const p = ray.pts[k];
          const s = W2S(p.x, p.y);
          if (k===0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.stroke();
  
        if (i === Math.floor(N*0.3) || i === Math.floor(N*0.6)){
          ctx.strokeStyle = ray.hitGround ? "rgba(239,68,68,0.45)" : "rgba(6,182,212,0.35)";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          for (let k=0;k<ray.pts.length;k++){
            const p = ray.pts[k];
            const s = W2S(p.x, p.y);
            if (k===0) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
          }
          ctx.stroke();
        }
  
        ctx.restore();
      }
    }
  
    function drawHUD(){
      const w = canvas.width;
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.70)";
      ctx.font = `${Math.max(12, Math.floor(w*0.012))}px ui-sans-serif, system-ui`;
      ctx.fillText(
        simT(
          "canvas.hudLine",
          "Miraj inferior: n(y) crește cu înălțimea → raze curbate → aparent „apă”"
        ),
        16,
        26
      );
  
      const gy = W2S(0,0).y;
      ctx.strokeStyle = "rgba(15,23,42,.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
      ctx.restore();
    }
  
    // Animation
    let running = true;
    let simTime = 0;
  
    // FPS
    let fps = 0, frames = 0, acc = 0;
    let last = performance.now();
  
    function syncUI(){
      distVal.textContent = dist.value;
      eyeHVal.textContent = parseFloat(eyeH.value).toFixed(2);
      palmHVal.textContent = parseFloat(palmH.value).toFixed(1);
      gradVal.textContent = parseFloat(grad.value).toFixed(2);
      layerHVal.textContent = parseFloat(layerH.value).toFixed(2);
      shimmerVal.textContent = parseFloat(shimmer.value).toFixed(2);
      raysVal.textContent = rays.value;
      spreadVal.textContent = parseFloat(spread.value).toFixed(1);
      stepsVal.textContent = steps.value;
      speedVal.textContent = parseFloat(speed.value).toFixed(2);
    }
  
    function reset(){
      simTime = 0;
      setStatus("ok", "status.started", "Pornit");
    }
  
    toggleAnim.addEventListener("click", () => {
      running = !running;
      toggleAnim.textContent = running
        ? simT("buttons.pause", "Pauză")
        : simT("buttons.start", "Pornește");
      statusVal.textContent = running
        ? simT("live.running", "RULEAZĂ")
        : simT("live.paused", "PAUZĂ");
      setStatus(
        running ? "ok" : "warn",
        running ? "status.runningDetail" : "status.pausedDetail",
        running ? "Rulează." : "Pauză."
      );
    });
  
    resetBtn.addEventListener("click", () => reset());
  
    [dist, eyeH, palmH, grad, layerH, shimmer, rays, spread, steps, speed].forEach(el =>
      el.addEventListener("input", () => syncUI())
    );
  
    function loop(now){
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
  
      frames++;
      acc += dtReal;
      if (acc >= 0.5){
        fps = Math.round(frames / acc);
        frames = 0;
        acc = 0;
        fpsVal.textContent = `${fps}`;
      }
  
      if (running){
        simTime += dtReal * parseFloat(speed.value);
      }
  
      timeVal.textContent = `${simTime.toFixed(2)}${secSuffix}`;
  
      resizeCanvas();
      drawBackground(simTime);
      drawGhostMirage();
      drawOasisAndPalms(simTime);
      drawRays(simTime);
      drawHUD();
  
      requestAnimationFrame(loop);
    }
  
    // init
    applyRafInitialPanels();
    syncUI();
    setStatus("ok", "status.started", "Pornit");
    statusVal.textContent = simT("live.running", "RULEAZĂ");
    fpsVal.textContent = simT("live.fpsDash", "—");
    requestAnimationFrame(loop);
  })();
  