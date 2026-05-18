(() => {
    const $ = (id) => document.getElementById(id);

    const simT = (path, ro) =>
      typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;

    function simFmt(path, roTemplate, vars) {
      let msg = simT(path, roTemplate);
      if (vars) {
        for (const [key, val] of Object.entries(vars)) {
          msg = msg.split(key).join(String(val));
        }
      }
      return msg;
    }

    function setStatus(kind, path, roFallback, vars) {
      const msg = simFmt(path, roFallback, vars);
      statusEl.className = `status ${kind}`;
      statusEl.textContent = `${simT("status.prefix", "Status:")} ${msg}`;
    }
  
    // Panels + layout
    const layout = document.querySelector(".layout");
    const leftPanel = $("leftPanel");
    const rightPanel = $("rightPanel");
  
    // UI
    const voltage = $("voltage");
    const resistance = $("resistance");
    const pmax = $("pmax");
  
    const voltageVal = $("voltageVal");
    const resistanceVal = $("resistanceVal");
    const pmaxVal = $("pmaxVal");
  
    const swBtn = $("switch");
    const resetEnergyBtn = $("resetEnergy");
    const resetAllBtn = $("resetAll");
  
    const iVal = $("iVal");
    const pVal = $("pVal");
    const eVal = $("eVal");
    const tVal = $("tVal");
    const heatVal = $("heatVal");
    const statusEl = $("status");
  
    // Canvas (fullscreen)
    const canvas = $("c");
    const ctx = canvas.getContext("2d");
  
    // ======= Base drawing size (your old coordinates) =======
    const BASE_W = 980;
    const BASE_H = 560;
  
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
  
    /* Pe mobil încadrăm o zonă mai mică din spațiul „world” (circuit + HUD + etichete),
       nu tot dreptunghiul 980×560 → scală mai mare, circuit mai vizibil. */
    const MOBILE_VIEW_PAD = 0.94;
    const MOBILE_VIEW = { cx0: 8, cx1: 872, cy0: 16, cy1: 472 };

    function resizeCanvas(){
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
  
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
  
      const w = canvas.width;
      const h = canvas.height;
      const mobile = window.matchMedia("(max-width: 1024px)").matches;

      let s;
      let ox;
      let oy;
      if (mobile){
        const cw = MOBILE_VIEW.cx1 - MOBILE_VIEW.cx0;
        const ch = MOBILE_VIEW.cy1 - MOBILE_VIEW.cy0;
        s = Math.min(w * MOBILE_VIEW_PAD / cw, h * MOBILE_VIEW_PAD / ch);
        ox = (w - cw * s) / 2 - MOBILE_VIEW.cx0 * s;
        oy = (h - ch * s) / 2 - MOBILE_VIEW.cy0 * s;
      } else {
        s = Math.min(w / BASE_W, h / BASE_H);
        ox = (w - BASE_W * s) * 0.5;
        oy = (h - BASE_H * s) * 0.5;
      }

      scale = s;
      offsetX = ox;
      offsetY = oy;
    }
  
    const toggleEcLeft = $("toggleEcLeft");
    const toggleEcRight = $("toggleEcRight");

    function isEcMobileViewport(){
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function updateEcTogglePositions(){
      if (!toggleEcLeft || !toggleEcRight) return;
      const lw = leftPanel?.offsetWidth || 250;
      const rw = rightPanel?.offsetWidth || 250;
      const leftHidden = leftPanel?.classList.contains("hidden");
      const rightHidden = rightPanel?.classList.contains("hidden");

      toggleEcLeft.style.left = leftHidden ? "10px" : `${lw + 10}px`;
      toggleEcLeft.style.right = "auto";

      toggleEcRight.style.right = rightHidden ? "10px" : `${rw + 10}px`;
      toggleEcRight.style.left = "auto";
    }

    function syncEcToggleAria(){
      const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
      const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
      toggleEcLeft?.setAttribute("aria-expanded", String(!!lOpen));
      toggleEcRight?.setAttribute("aria-expanded", String(!!rOpen));
    }

    function syncEcPanelsUi(){
      updateEcTogglePositions();
      syncEcToggleAria();
      resizeCanvas();
    }

    function applyEcInitialPanels(){
      if (!leftPanel || !rightPanel) return;
      if (isEcMobileViewport()){
        leftPanel.classList.add("hidden");
        rightPanel.classList.add("hidden");
      } else {
        leftPanel.classList.remove("hidden");
        rightPanel.classList.remove("hidden");
      }
      syncEcPanelsUi();
    }

    function onEcResize(){
      if (!isEcMobileViewport()){
        leftPanel?.classList.remove("hidden");
        rightPanel?.classList.remove("hidden");
      }
      syncEcPanelsUi();
    }

    if (toggleEcLeft && leftPanel){
      toggleEcLeft.addEventListener("click", () => {
        leftPanel.classList.toggle("hidden");
        if (isEcMobileViewport() && !leftPanel.classList.contains("hidden") && rightPanel){
          rightPanel.classList.add("hidden");
        }
        syncEcPanelsUi();
      });
    }

    if (toggleEcRight && rightPanel){
      toggleEcRight.addEventListener("click", () => {
        rightPanel.classList.toggle("hidden");
        if (isEcMobileViewport() && !rightPanel.classList.contains("hidden") && leftPanel){
          leftPanel.classList.add("hidden");
        }
        syncEcPanelsUi();
      });
    }

    window.addEventListener("resize", onEcResize);
  
    // ======= State =======
    let isOn = false;
    let E = 0;
    let tOn = 0;
  
    let heat = 0;
    let failed = false;
    let overPowerTime = 0;
    const FAIL_AFTER = 1.5;
  
    const packets = [];
    const MAX_PACKETS = 90;
  
    // geometry in BASE coords
    const path = [
      { x: 230, y: 140 },
      { x: 770, y: 140 },
      { x: 770, y: 420 },
      { x: 230, y: 420 },
    ];
  
    function lerp(a,b,t){ return a+(b-a)*t; }
    function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
  
    function getU(){ return parseFloat(voltage.value); }
    function getR(){ return Math.max(0.0001, parseFloat(resistance.value)); }
    function getPmax(){ return Math.max(0.01, parseFloat(pmax.value)); }
  
    function pathPoint(u){
      const segs = 4;
      const s = u * segs;
      const i = Math.floor(s);
      const t = s - i;
      const A = path[i % segs];
      const B = path[(i + 1) % segs];
      return { x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t) };
    }
    function pathTangent(u){
      const eps = 0.002;
      const p1 = pathPoint((u + eps) % 1);
      const p0 = pathPoint((u - eps + 1) % 1);
      let dx = p1.x - p0.x, dy = p1.y - p0.y;
      const len = Math.hypot(dx,dy) || 1;
      return { dx: dx/len, dy: dy/len };
    }
  
    function compute(){
      const U = getU();
      const R = getR();
      const PmaxV = getPmax();
      const circuitClosed = isOn && !failed;
      const I = circuitClosed ? U / R : 0;
      const P = circuitClosed ? U * I : 0;
      return { U, R, I, P, PmaxV, circuitClosed };
    }
  
    function spawnPackets(P){
      const rate = clamp(P / 30, 0, 2.2);
      const n = Math.floor(rate);
      const extra = Math.random() < (rate - n) ? 1 : 0;
      const toSpawn = n + extra;
  
      for (let k=0;k<toSpawn;k++){
        if (packets.length >= MAX_PACKETS) break;
        packets.push({
          u: Math.random(),
          speed: 0.09 + clamp(P/250, 0, 0.30),
          size: 3.8 + clamp(P/120, 0, 6),
        });
      }
    }
  
    function refreshSwitchUI(){
      swBtn.textContent = isOn
        ? simT("switchState.on", "PORNIT")
        : simT("switchState.off", "OPRIT");
      swBtn.classList.toggle("on", isOn);
      swBtn.classList.toggle("off", !isOn);
    }
  
    // ======= Drawing (in BASE coords, scaled to fullscreen) =======
    function clear(){
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);
  
      // set transform for base coordinate system
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    }
  
    function glowCircle(x,y,r,rgba){
      ctx.save();
      ctx.fillStyle = rgba;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  
    function drawWire(){
      ctx.save();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(30,64,175,.22)";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      ctx.lineTo(path[1].x, path[1].y);
      ctx.lineTo(path[2].x, path[2].y);
      ctx.lineTo(path[3].x, path[3].y);
      ctx.closePath();
      ctx.stroke();
  
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(2,132,199,.15)";
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      ctx.lineTo(path[1].x, path[1].y);
      ctx.lineTo(path[2].x, path[2].y);
      ctx.lineTo(path[3].x, path[3].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  
    function cutWire(x,y1,y2){
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
      ctx.restore();
    }
  
    function drawBattery(U){
      const x = 230, y1=210, y2=350;
      cutWire(x,y1,y2);
  
      ctx.save();
      ctx.strokeStyle = "rgba(15,23,42,.85)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
  
      ctx.beginPath(); ctx.moveTo(x-14, 250); ctx.lineTo(x+14, 250); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x-9, 310); ctx.lineTo(x+9, 310); ctx.stroke();
  
      ctx.fillStyle = "rgba(15,23,42,.85)";
      ctx.font = "16px ui-sans-serif, system-ui";
      ctx.fillText("+", x+24, 256);
      ctx.fillText("-", x+24, 315);
  
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.fillStyle = "rgba(51,65,85,.95)";
      ctx.fillText(
        simFmt("canvas.batteryU", "U = {u} V", { "{u}": U.toFixed(1) }),
        x - 40,
        195
      );
  
      if (isOn && !failed && U > 0) {
        glowCircle(x, 280, 56, "rgba(37,99,235,.10)");
        glowCircle(x, 280, 40, "rgba(6,182,212,.10)");
      }
      ctx.restore();
    }
  
    function drawResistor(P, R, PmaxV){
      const x=770, y1=210, y2=350;
      cutWire(x,y1,y2);
  
      const overload = (PmaxV>0) ? (P/PmaxV) : 0;
      const heatGlow = clamp(overload, 0, 2);
  
      ctx.save();
  
      if (!failed){
        glowCircle(x, 280, 62, `rgba(245,158,11,${0.10*heatGlow})`);
        glowCircle(x, 280, 44, `rgba(239,68,68,${0.06*heatGlow})`);
      } else {
        glowCircle(x, 280, 70, "rgba(17,24,39,.18)");
      }
  
      ctx.strokeStyle = failed ? "rgba(17,24,39,.85)" : "rgba(15,23,42,.85)";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.beginPath();
  
      const top=220, step=12;
      let yy=top;
      ctx.moveTo(x, yy);
      for (let k=0;k<8;k++){
        yy += step;
        ctx.lineTo(x + (k%2===0 ? -18 : 18), yy);
      }
      ctx.lineTo(x, 220 + 9*step);
      ctx.stroke();
  
      ctx.fillStyle = "rgba(51,65,85,.95)";
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.fillText(
        simFmt("canvas.resistorR", "R = {r} Ω", { "{r}": R.toFixed(1) }),
        x - 42,
        195
      );
      ctx.fillText(
        simFmt("canvas.resistorPmax", "Pmax = {pmax} W", {
          "{pmax}": PmaxV.toFixed(2),
        }),
        x - 58,
        214
      );
  
      if (!failed && overload > 1.0){
        ctx.fillStyle = "rgba(148,163,184,.18)";
        for (let i=0;i<6;i++){
          const rx = x + (Math.random()*34 - 17);
          const ry = 205 - (Math.random()*42);
          ctx.beginPath();
          ctx.arc(rx, ry, 10 + Math.random()*14, 0, Math.PI*2);
          ctx.fill();
        }
      }
      if (failed){
        ctx.fillStyle = "rgba(17,24,39,.92)";
        ctx.font = "700 16px ui-sans-serif, system-ui";
        ctx.fillText(
          simT("canvas.resistorFailed", "DEFECT (DESCHIS)"),
          x - 66,
          392
        );
      }
  
      ctx.restore();
    }
  
    function drawSwitch(){
      const x1=360, y=420, x2=470;
  
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
      ctx.restore();
  
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.85)";
      ctx.beginPath(); ctx.arc(x1,y,6,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x2,y,6,0,Math.PI*2); ctx.fill();
  
      ctx.strokeStyle = failed ? "rgba(17,24,39,.85)" : (isOn ? "rgba(6,182,212,.95)" : "rgba(239,68,68,.85)");
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x1,y);
      if (isOn && !failed) ctx.lineTo(x2,y);
      else ctx.lineTo(x2-18, y-18);
      ctx.stroke();
  
      ctx.fillStyle = "rgba(51,65,85,.95)";
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.fillText(
        failed
          ? simT("canvas.switchBlocked", "comutator: BLOCAT (defect)")
          : isOn
            ? simT("canvas.switchOnLbl", "comutator: PORNIT")
            : simT("canvas.switchOffLbl", "comutator: OPRIT"),
        x1,
        y + 26
      );
      ctx.restore();
    }
  
    function drawPackets(P){
      const a = clamp(P/50, 0.18, 0.95);
      for (const pk of packets){
        const {x,y} = pathPoint(pk.u);
        const {dx,dy} = pathTangent(pk.u);
  
        glowCircle(x, y, 15, `rgba(6,182,212,${0.14*a})`);
  
        ctx.save();
        ctx.fillStyle = `rgba(6,182,212,${0.55*a})`;
        ctx.beginPath();
        ctx.arc(x,y,pk.size,0,Math.PI*2);
        ctx.fill();
  
        ctx.strokeStyle = `rgba(15,23,42,${0.15*a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - dx*10, y - dy*10);
        ctx.lineTo(x + dx*10, y + dy*10);
        ctx.stroke();
        ctx.restore();
      }
    }
  
    function drawHUD({U,R,I,P,PmaxV}){
      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,.90)";
      ctx.font = "16px ui-sans-serif, system-ui";
      ctx.fillText(
        simT(
          "canvas.hudTransport",
          "Energia (model) se transportă pe fire și se disipă în rezistor."
        ),
        26,
        40
      );

      ctx.fillStyle = "rgba(51,65,85,.95)";
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.fillText(
        simFmt("canvas.hudI", "I = U/R = {v} A", { "{v}": I.toFixed(3) }),
        26,
        68
      );
      ctx.fillText(
        simFmt("canvas.hudP", "P = U·I = {p} W   (Pmax = {pmax} W)", {
          "{p}": P.toFixed(3),
          "{pmax}": PmaxV.toFixed(2),
        }),
        26,
        90
      );
      ctx.fillText(
        simFmt("canvas.hudE", "E = ∫P dt = {e} J", { "{e}": E.toFixed(3) }),
        26,
        112
      );

      if (!failed && isOn && P > PmaxV && PmaxV>0){
        ctx.fillStyle = "rgba(239,68,68,.92)";
        ctx.fillText(
          simT(
            "canvas.hudOverload",
            "Suprasarcină: P > Pmax → rezistorul se poate arde."
          ),
          26,
          140
        );
      }
      if (failed){
        ctx.fillStyle = "rgba(17,24,39,.92)";
        ctx.fillText(
          simT(
            "canvas.hudFailed",
            "Defect: rezistor ars → circuit deschis → I = 0."
          ),
          26,
          140
        );
      }
      ctx.restore();
    }
  
    // ======= Loop =======
    let last = performance.now();
    function tick(now){
      const dt = Math.min(0.033, (now-last)/1000);
      last = now;
  
      const vals = compute();
      const {U,R,I,P,PmaxV,circuitClosed} = vals;
  
      // UI readouts
      voltageVal.textContent = U.toFixed(1);
      resistanceVal.textContent = R.toFixed(1);
      pmaxVal.textContent = PmaxV.toFixed(2);
  
      // integrate
      if (circuitClosed){
        E += P * dt;
        tOn += dt;
      }
  
      // heat model
      const target = (PmaxV > 0) ? clamp(P / PmaxV, 0, 2) : 0;
      const rise = 1.8, cool = 0.9;
      if (circuitClosed) heat = heat + (target-heat) * (1 - Math.exp(-rise*dt));
      else heat = heat + (0-heat) * (1 - Math.exp(-cool*dt));
      heat = clamp(heat,0,2);
  
      // failure
      if (!failed && circuitClosed && PmaxV>0 && P>PmaxV){
        overPowerTime += dt;
        if (overPowerTime >= FAIL_AFTER){
          failed = true;
          isOn = false;
          packets.length = 0;
          refreshSwitchUI();
          setStatus(
            "bad",
            "status.burnOut",
            "rezistor ars (circuit întrerupt). Apasă „Reparare / Resetare”."
          );
        } else {
          setStatus("warn", "status.overload", "Suprasarcină! P>Pmax — {t}s până la ardere", {
            "{t}": (FAIL_AFTER - overPowerTime).toFixed(2),
          });
        }
      } else {
        overPowerTime = Math.max(0, overPowerTime - 1.2*dt);
        if (!failed){
          setStatus(
            "ok",
            isOn ? "status.circuitOn" : "status.circuitOff",
            isOn ? "circuit PORNIT." : "circuit OPRIT."
          );
        }
      }
  
      // packets
      if (!failed && circuitClosed && P>0.0001) spawnPackets(P);
      for (let i=packets.length-1;i>=0;i--){
        const pk = packets[i];
        pk.u = (pk.u + pk.speed*dt) % 1;
        if (!circuitClosed) packets.splice(i,1);
      }
  
      // draw
      clear();
      drawWire();
      drawBattery(U);
      drawResistor(P,R,PmaxV);
      drawSwitch();
      if (!failed && circuitClosed && P>0.0001) drawPackets(P);
      drawHUD(vals);
  
      // values
      iVal.textContent = `${I.toFixed(3)} A`;
      pVal.textContent = `${P.toFixed(3)} W`;
      eVal.textContent = `${E.toFixed(3)} J`;
      tVal.textContent = `${tOn.toFixed(3)} s`;
      heatVal.textContent = `${Math.round(clamp(heat/2,0,1)*100)}%`;
  
      requestAnimationFrame(tick);
    }
  
    // Events
    swBtn.addEventListener("click", () => {
      if (failed){
        setStatus(
          "bad",
          "status.cantStart",
          "Nu poți porni: rezistor ars. Apasă „Reparare / Resetare”."
        );
        return;
      }
      isOn = !isOn;
      refreshSwitchUI();
    });
  
    resetEnergyBtn.addEventListener("click", () => {
      E = 0;
      tOn = 0;
    });
  
    resetAllBtn.addEventListener("click", () => {
      failed = false;
      overPowerTime = 0;
      heat = 0;
      isOn = false;
      packets.length = 0;
      refreshSwitchUI();
      setStatus("ok", "status.repaired", "reparat. Poți porni din nou.");
    });
  
    // Init
    refreshSwitchUI();
    setStatus("ok", "status.ready", "gata.");
    applyEcInitialPanels();
    requestAnimationFrame(tick);
  })();
  