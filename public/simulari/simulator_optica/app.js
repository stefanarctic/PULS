(() => {
    const canvas = document.getElementById('c');
    const stage = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    // UI
    const fSlider = document.getElementById('fSlider');
    const doSlider = document.getElementById('doSlider');
    const hoSlider = document.getElementById('hoSlider');
    const scaleSlider = document.getElementById('scaleSlider');

    const fVal = document.getElementById('fVal');
    const doVal = document.getElementById('doVal');
    const hoVal = document.getElementById('hoVal');
    const scaleVal = document.getElementById('scaleVal');

    const diOut = document.getElementById('diOut');
    const mOut = document.getElementById('mOut');
    const hiOut = document.getElementById('hiOut');
    const typeOut = document.getElementById('typeOut');
    const lensType = document.getElementById('lensType');
    const statusEl = document.getElementById('status');

    const toggleRaysBtn = document.getElementById('toggleRays');
    const toggleLabelsBtn = document.getElementById('toggleLabels');
    const resetBtn = document.getElementById('reset');
    const layout = document.getElementById('layout');
    const collapseBtn = document.getElementById('collapseBtn');
    const peekBtn = document.getElementById('peekBtn');
    function setCollapsed(collapsed) {
        layout.classList.toggle('is-collapsed', collapsed);
        

        // mic detaliu: schimb iconul
        if (collapseBtn) collapseBtn.textContent = collapsed ? "▶" : "◀";

        // IMPORTANT: după schimbarea layout-ului, forțează resize+draw
        // (presupun că ai deja resize() + draw() stabile)
        resize();
        draw();
    }

    collapseBtn?.addEventListener('click', () => {
        setCollapsed(!layout.classList.contains('is-collapsed'));
    });

    peekBtn?.addEventListener('click', () => {
        setCollapsed(false);
    });

    // shortcut: TAB pentru retract / expand (nu-ți strică focusul pe input)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // dacă ești într-un input/range, nu intervenim
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") return;

            e.preventDefault();
            setCollapsed(!layout.classList.contains('is-collapsed'));
        }
    });

    // State
    let showRays = true;
    let showLabels = true;

    // "World" units: cm. Convert to px using scale.
    let pxPerCm = +scaleSlider.value;

    // Lens at x=0 in world, optical axis y=0.
    // Object at x = -d0, height h0 (positive up).
    let f = +fSlider.value;   // cm
    let d0 = +doSlider.value; // cm (positive)
    let h0 = +hoSlider.value; // cm

    // Dragging
    let dragging = false;
    let dragOffset = { x: 0, y: 0 };

    function resize() {
        const rect = stage.getBoundingClientRect();
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const displayW = Math.max(1, Math.floor(rect.width));
        const displayH = Math.max(1, Math.floor(rect.height));

        const bufferW = Math.floor(displayW * dpr);
        const bufferH = Math.floor(displayH * dpr);

        // dacă nu s-a schimbat, nu face nimic
        if (canvas.width === bufferW && canvas.height === bufferH) return;

        canvas.width = bufferW;
        canvas.height = bufferH;

        // IMPORTANT: nu mai seta canvas.style.width/height aici!
        // canvas.style.width / height rămân din CSS (100%)

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }


    const ro = new ResizeObserver(() => {
        resize();
        draw();
    });
    ro.observe(stage);

    window.addEventListener('resize', () => {
        // fallback pentru unele telefoane / schimbare orientare
        resize();
        draw();
    });


    function fmt(x, digits = 2) {
        if (!isFinite(x)) return "—";
        const s = x.toFixed(digits);
        return s.replace(/\.00$/, "");
    }

    function setStatus(kind, html) {
        statusEl.className = "status " + (kind || "");
        statusEl.innerHTML = html;
    }

    function worldToScreen(x, y) {
        const cx = canvas.clientWidth / 2;
        const cy = canvas.clientHeight / 2;
        return { x: cx + x * pxPerCm, y: cy - y * pxPerCm };
    }

    function screenToWorld(sx, sy) {
        const cx = canvas.clientWidth / 2;
        const cy = canvas.clientHeight / 2;
        return { x: (sx - cx) / pxPerCm, y: (cy - sy) / pxPerCm };
    }

    function lensFormula(f, d0) {
        // 1/f = 1/d0 + 1/di => di = 1 / (1/f - 1/d0)
        const denom = (1 / f) - (1 / d0);
        if (Math.abs(denom) < 1e-9) return { di: Infinity };
        return { di: 1 / denom };
    }

    function compute() {
        const { di } = lensFormula(f, d0);
        const m = -di / d0;
        const hi = m * h0;

        let type = "";
        if (!isFinite(di)) {
            type = "la infinit (raze paralele)";
        } else if (di > 0) {
            type = "reală, " + (m < 0 ? "răsturnată" : "dreaptă");
        } else {
            type = "virtuală, " + (m < 0 ? "răsturnată" : "dreaptă");
        }

        return { di, m, hi, type };
    }

    function drawGrid() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1;

        const spacing = 5 * pxPerCm; // 5 cm
        const minor = 1 * pxPerCm;   // 1 cm

        ctx.strokeStyle = "rgba(40, 51, 88, 0.45)";
        for (let x = 0; x <= w; x += minor) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += minor) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = "rgba(40, 51, 88, 0.9)";
        for (let x = 0; x <= w; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += spacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        ctx.restore();
    }

    function drawAxis() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const O = worldToScreen(0, 0);

        ctx.save();
        ctx.lineWidth = 2;

        ctx.strokeStyle = "rgba(234,240,255,.28)";
        ctx.beginPath();
        ctx.moveTo(0, O.y);
        ctx.lineTo(w, O.y);
        ctx.stroke();

        ctx.strokeStyle = "rgba(122,167,255,.35)";
        ctx.beginPath();
        ctx.moveTo(O.x, 0);
        ctx.lineTo(O.x, h);
        ctx.stroke();

        ctx.restore();
    }

    function drawLens() {
        const h = canvas.clientHeight;
        const O = worldToScreen(0, 0);

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(122,167,255,.85)";

        const lensH = Math.min(h * 0.72, 420);
        const top = O.y - lensH / 2;
        const bot = O.y + lensH / 2;

        ctx.beginPath();
        ctx.moveTo(O.x, top);
        ctx.lineTo(O.x, bot);
        ctx.stroke();

        ctx.fillStyle = "rgba(122,167,255,.85)";
        const ah = 10;

        ctx.beginPath();
        ctx.moveTo(O.x, top);
        ctx.lineTo(O.x - ah, top + ah);
        ctx.lineTo(O.x + ah, top + ah);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(O.x, bot);
        ctx.lineTo(O.x - ah, bot - ah);
        ctx.lineTo(O.x + ah, bot - ah);
        ctx.closePath();
        ctx.fill();

        const F1 = worldToScreen(-f, 0);
        const F2 = worldToScreen(+f, 0);

        ctx.fillStyle = "rgba(62,233,138,.95)";
        ctx.beginPath(); ctx.arc(F1.x, F1.y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(F2.x, F2.y, 4.5, 0, Math.PI * 2); ctx.fill();

        if (showLabels) {
            ctx.font = "12px ui-sans-serif, system-ui";
            ctx.fillStyle = "rgba(234,240,255,.85)";
            ctx.fillText("Lentilă", O.x + 10, O.y - lensH / 2 + 18);

            ctx.fillStyle = "rgba(62,233,138,.95)";
            ctx.fillText("F", F1.x - 6, F1.y - 10);
            ctx.fillText("F", F2.x - 6, F2.y - 10);
        }

        ctx.restore();
    }

    function drawArrow(x, h, color, label) {
        const base = worldToScreen(x, 0);
        const tip = worldToScreen(x, h);

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        const ang = Math.atan2(base.y - tip.y, base.x - tip.x);
        const headLen = 12;
        const a1 = ang + Math.PI / 7;
        const a2 = ang - Math.PI / 7;

        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x + headLen * Math.cos(a1), tip.y + headLen * Math.sin(a1));
        ctx.lineTo(tip.x + headLen * Math.cos(a2), tip.y + headLen * Math.sin(a2));
        ctx.closePath();
        ctx.fill();

        if (showLabels && label) {
            ctx.font = "12px ui-sans-serif, system-ui";
            ctx.fillStyle = "rgba(234,240,255,.9)";
            ctx.fillText(label, tip.x + 10, tip.y + (h >= 0 ? -6 : 14));
        }

        ctx.restore();
        return { base, tip };
    }

    function drawRay(p1, p2, color, dashed = false) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        if (dashed) ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
    }

    function draw() {

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        ctx.clearRect(0, 0, w, h);
        drawGrid();
        drawAxis();
        drawLens();

        const objX = -d0;
        const { di, m, hi, type } = compute();
        const imgX = di;

        const obj = drawArrow(objX, h0, "rgba(255, 204, 102, .95)", "Obiect");

        if (isFinite(di)) {
            const imgColor = (di > 0) ? "rgba(62,233,138,.95)" : "rgba(122,167,255,.95)";
            drawArrow(imgX, hi, imgColor, "Imagine");
        }

        if (showRays) {
            const O = worldToScreen(0, 0);
            const P = obj.tip;
            const F2 = worldToScreen(+f, 0);
            const F1 = worldToScreen(-f, 0);

            // Ray 1: parallel -> through F2
            const hitLens1 = worldToScreen(0, screenToWorld(P.x, P.y).y);
            drawRay(P, hitLens1, "rgba(234,240,255,.8)");

            const dir1 = { x: (F2.x - hitLens1.x), y: (F2.y - hitLens1.y) };
            const len1 = Math.hypot(dir1.x, dir1.y) || 1;
            const u1 = { x: dir1.x / len1, y: dir1.y / len1 };
            const far1 = { x: hitLens1.x + u1.x * 2000, y: hitLens1.y + u1.y * 2000 };
            drawRay(hitLens1, far1, "rgba(234,240,255,.8)");

            // Ray 2: through center (straight)
            const center = worldToScreen(0, 0);
            drawRay(P, { x: P.x + (center.x - P.x) * 2.0, y: P.y + (center.y - P.y) * 2.0 }, "rgba(234,240,255,.65)");

            // Ray 3: through F1 -> emerges parallel
            const hitLens3 = (() => {
                const Pw = screenToWorld(P.x, P.y);
                const F1w = { x: -f, y: 0 };
                const denom = (F1w.x - Pw.x);
                if (Math.abs(denom) < 1e-9) return worldToScreen(0, Pw.y);
                const t = (0 - Pw.x) / denom;
                const y = Pw.y + t * (F1w.y - Pw.y);
                return worldToScreen(0, y);
            })();

            drawRay(P, hitLens3, "rgba(234,240,255,.55)");
            drawRay(hitLens3, { x: hitLens3.x + 2000, y: hitLens3.y }, "rgba(234,240,255,.55)");

            // Virtual image: back extensions
            if (isFinite(di) && di < 0) {
                const I = worldToScreen(imgX, hi);
                drawRay(hitLens1, I, "rgba(122,167,255,.65)", true);
                drawRay(hitLens3, I, "rgba(122,167,255,.55)", true);
            }

            if (!isFinite(di)) {
                ctx.save();
                ctx.fillStyle = "rgba(255, 204, 102, .85)";
                ctx.font = "12px ui-sans-serif, system-ui";
                ctx.fillText("Imagine la infinit: raze paralele după lentilă", O.x + 12, O.y + 18);
                ctx.restore();
            }
        }

        // UI readouts
        fVal.textContent = fmt(f, 1);
        doVal.textContent = fmt(d0, 1);
        hoVal.textContent = fmt(h0, 1);
        scaleVal.textContent = String(pxPerCm);

        if (!isFinite(di)) {
            diOut.textContent = "∞";
            mOut.textContent = "≈ 0";
            hiOut.textContent = "≈ 0";
        } else {
            diOut.textContent = fmt(di, 2) + " cm";
            mOut.textContent = fmt(m, 3);
            hiOut.textContent = fmt(hi, 2) + " cm";
        }
        typeOut.textContent = type;

        lensType.textContent = "Convergentă";

        // Status
        if (Math.abs(d0 - f) < 0.6) {
            setStatus("warn", "Ești foarte aproape de <b>d₀ = f</b> → imaginea fuge spre infinit. (Corect fizic 😄)");
        } else if (isFinite(di) && di > 0) {
            setStatus("good", "Imagine <b>reală</b> pe partea dreaptă a lentilei. O poți “prinde” pe un ecran.");
        } else if (isFinite(di) && di < 0) {
            setStatus("warn", "Imagine <b>virtuală</b> (ca o lupă). Extensiile punctate arată unde “pare” că se formează.");
        } else {
            setStatus("", "Trage obiectul sau schimbă slider-ele. 🧠");
        }
    }

    function syncFromSliders() {
        f = +fSlider.value;
        d0 = +doSlider.value;
        h0 = +hoSlider.value;
        pxPerCm = +scaleSlider.value;
        draw();
    }

    // Dragging the object
    function hitTestObject(screenX, screenY) {
        const tip = worldToScreen(-d0, h0);
        const base = worldToScreen(-d0, 0);

        const dx = screenX - tip.x, dy = screenY - tip.y;
        const nearTip = (dx * dx + dy * dy) < 18 * 18;

        // distance to shaft segment
        const px = screenX, py = screenY;
        const ax = base.x, ay = base.y;
        const bx = tip.x, by = tip.y;
        const abx = bx - ax, aby = by - ay;
        const apx = px - ax, apy = py - ay;
        const ab2 = abx * abx + aby * aby || 1;
        let t = (apx * abx + apy * aby) / ab2;
        t = Math.max(0, Math.min(1, t));
        const cx = ax + t * abx, cy = ay + t * aby;
        const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);

        const nearShaft = dist2 < 14 * 14;
        return nearTip || nearShaft;
    }

    function onPointerDown(e) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        if (!hitTestObject(sx, sy)) return;

        dragging = true;
        canvas.setPointerCapture?.(e.pointerId);

        const wpos = screenToWorld(sx, sy);
        dragOffset.x = wpos.x - (-d0);
        dragOffset.y = wpos.y - (h0);
    }

    function onPointerMove(e) {
        if (!dragging) return;

        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const wpos = screenToWorld(sx, sy);

        const newObjX = wpos.x - dragOffset.x;
        const newH = wpos.y - dragOffset.y;

        const newD0 = Math.max(3, Math.min(120, -newObjX));
        const newH0 = Math.max(1, Math.min(20, newH));

        d0 = newD0;
        h0 = newH0;

        doSlider.value = String(d0);
        hoSlider.value = String(h0);

        draw();
    }

    function onPointerUp(e) {
        dragging = false;
        try { canvas.releasePointerCapture?.(e.pointerId); } catch { }
    }

    // Buttons
    toggleRaysBtn.addEventListener('click', () => {
        showRays = !showRays;
        toggleRaysBtn.textContent = `Raze: ${showRays ? "ON" : "OFF"}`;
        toggleRaysBtn.classList.toggle('primary', showRays);
        draw();
    });

    toggleLabelsBtn.addEventListener('click', () => {
        showLabels = !showLabels;
        toggleLabelsBtn.textContent = `Etichete: ${showLabels ? "ON" : "OFF"}`;
        toggleLabelsBtn.classList.toggle('primary', showLabels);
        draw();
    });

    resetBtn.addEventListener('click', () => {
        f = 12; d0 = 35; h0 = 7; pxPerCm = 10;
        fSlider.value = f;
        doSlider.value = d0;
        hoSlider.value = h0;
        scaleSlider.value = pxPerCm;

        showRays = true;
        showLabels = true;

        toggleRaysBtn.textContent = "Raze: ON";
        toggleLabelsBtn.textContent = "Etichete: ON";
        toggleRaysBtn.classList.add('primary');
        toggleLabelsBtn.classList.add('primary');

        draw();
    });

    // Sliders
    [fSlider, doSlider, hoSlider, scaleSlider].forEach(el => {
        el.addEventListener('input', syncFromSliders);
    });

    // Pointer events
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Init
    syncFromSliders();
})();
