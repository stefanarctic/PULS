const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const leftPanel = document.getElementById("leftPanel");
const rightPanel = document.getElementById("rightPanel");
const toggleCaLeft = document.getElementById("toggleCaLeft");
const toggleCaRight = document.getElementById("toggleCaRight");

function isCaMobileViewport() {
    return window.matchMedia("(max-width: 1024px)").matches;
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function updateCaTogglePositions() {
    if (!toggleCaLeft || !toggleCaRight) return;
    /* Colțuri fixe — butoanele rămân îndepărtate (nu se aduc spre centru când panoul e deschis). */
    toggleCaLeft.style.left = "max(14px, env(safe-area-inset-left, 0px))";
    toggleCaLeft.style.right = "auto";

    toggleCaRight.style.right = "max(14px, env(safe-area-inset-right, 0px))";
    toggleCaRight.style.left = "auto";
}

function syncCaToggleAria() {
    const lOpen = leftPanel && !leftPanel.classList.contains("hidden");
    const rOpen = rightPanel && !rightPanel.classList.contains("hidden");
    toggleCaLeft?.setAttribute("aria-expanded", String(!!lOpen));
    toggleCaRight?.setAttribute("aria-expanded", String(!!rOpen));
}

function syncCaPanelsUi() {
    updateCaTogglePositions();
    syncCaToggleAria();
    resizeCanvas();
    resizePhasor();
    resizeMini();
}

function applyCaInitialPanels() {
    if (!leftPanel || !rightPanel) return;
    if (isCaMobileViewport()) {
        leftPanel.classList.add("hidden");
        rightPanel.classList.add("hidden");
    } else {
        leftPanel.classList.remove("hidden");
        rightPanel.classList.remove("hidden");
    }
    syncCaPanelsUi();
}

function onCaResize() {
    if (!isCaMobileViewport()) {
        leftPanel?.classList.remove("hidden");
        rightPanel?.classList.remove("hidden");
    }
    syncCaPanelsUi();
}

if (toggleCaLeft && leftPanel) {
    toggleCaLeft.addEventListener("click", () => {
        leftPanel.classList.toggle("hidden");
        syncCaPanelsUi();
    });
}

if (toggleCaRight && rightPanel) {
    toggleCaRight.addEventListener("click", () => {
        rightPanel.classList.toggle("hidden");
        syncCaPanelsUi();
    });
}

window.addEventListener("resize", onCaResize);

let t = 0;

// UI elements
const ampUSlider = document.getElementById("ampU");
const ampISlider = document.getElementById("ampI");
const freqSlider = document.getElementById("freq");

const ampUVal = document.getElementById("ampUVal");
const ampIVal = document.getElementById("ampIVal");
const freqVal = document.getElementById("freqVal");
const formula = document.getElementById("formula");
const speedSlider = document.getElementById("speed");
const speedVal = document.getElementById("speedVal");

const modeSelect = document.getElementById("mode");

const instantDiv = document.getElementById("instant");
const rmsDiv = document.getElementById("rms");
const phaseSlider = document.getElementById("phase");
const phaseVal = document.getElementById("phaseVal");
const powerDiv = document.getElementById("power");
const cosphiDiv = document.getElementById("cosphi");
const impedanceDiv = document.getElementById("impedance");
const indicators = document.getElementById("indicators");
const miniCanvas = document.getElementById("miniGraph");
const miniCtx = miniCanvas.getContext("2d");
const phasorCanvas = document.getElementById("phasor");
const phasorCtx = phasorCanvas.getContext("2d");

function simT(path, ro) {
    return typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;
}

function simFmt(path, roTemplate, vars) {
    let msg = simT(path, roTemplate);
    if (vars) {
        for (const [key, val] of Object.entries(vars)) {
            msg = msg.split(key).join(String(val));
        }
    }
    return msg;
}

function resizePhasor() {
    phasorCanvas.width = phasorCanvas.clientWidth;
    phasorCanvas.height = phasorCanvas.clientHeight;
}

function resizeMini() {
    miniCanvas.width = miniCanvas.clientWidth;
    miniCanvas.height = miniCanvas.clientHeight;
}

applyCaInitialPanels();

let phase = 0; // în radiani

let speed = speedSlider.value / 1000;
let mode = "ac";
// valori inițiale
let amplitudeU = parseInt(ampUSlider.value);
let amplitudeI = parseInt(ampISlider.value);
let frequency = freqSlider.value / 1000;

function updateUI() {
    ampUVal.textContent = amplitudeU;
    ampIVal.textContent = amplitudeI;
    freqVal.textContent = frequency.toFixed(3);
    speedVal.textContent = speed.toFixed(3);
    phaseVal.textContent = phase.toFixed(2);

    let omega = 2 * Math.PI * frequency;

    let irms = mode === "ac" ? amplitudeI / Math.sqrt(2) : amplitudeI;
    let urms = mode === "ac" ? amplitudeU / Math.sqrt(2) : amplitudeU;

    let cosphi = Math.cos(phase);
    let sinphi = Math.sin(phase);

    let P = urms * irms * cosphi;
    let S = urms * irms;
    let Q = urms * irms * sinphi;
    let Z = irms !== 0 ? (urms / irms) : Infinity;

    const radPerS = simT("units.radPerS", "rad/s");
    const pActive = simT("formula.active", "(activă)");
    const pApparent = simT("formula.apparent", "(aparentă)");
    const pReactive = simT("formula.reactive", "(reactivă)");

    formula.innerHTML = `
    <b>i(t)</b> = ${amplitudeI} · sin(${omega.toFixed(2)}t + ${phase.toFixed(2)})<br>
    <b>u(t)</b> = ${amplitudeU} · sin(${omega.toFixed(2)}t)<br><br>

    <b>ω</b> = 2πf = ${omega.toFixed(2)} ${radPerS}<br>
    <b>Irms</b> = ${irms.toFixed(2)}<br>
    <b>Urms</b> = ${urms.toFixed(2)}<br><br>

    <b>P</b> = ${P.toFixed(2)} ${pActive}<br>
    <b>S</b> = ${S.toFixed(2)} ${pApparent}<br>
    <b>Q</b> = ${Q.toFixed(2)} ${pReactive}<br><br>

    <b>cosφ</b> = ${cosphi.toFixed(2)}
    `;
    let analysis = document.getElementById("analysis");

    if (cosphi > 0.9) {
        analysis.innerHTML = simT("analysis.ideal", "✔ Circuit aproape ideal (rezistiv)");
    } else if (cosphi > 0) {
        analysis.innerHTML = simT("analysis.reactive", "⚠ Circuit cu componentă reactivă");
    } else {
        analysis.innerHTML = simT("analysis.negativePower", "❌ Putere negativă (energie returnată)");
    }
    if (impedanceDiv) {
        const zStr = Number.isFinite(Z) ? Z.toFixed(3) : "∞";
        impedanceDiv.textContent = simFmt("measurements.impedance", "Z = {z} Ω", { "{z}": zStr });
    }
    indicators.innerHTML = `
    φ = ${(phase).toFixed(2)} rad<br>
    cosφ = ${cosphi.toFixed(2)}<br>
    P/S = ${(cosphi).toFixed(2)}
    `;
    let energy = P * 1;
    const eStr = energy.toFixed(2);
    document.getElementById("energy").textContent = simFmt(
        "energy.line",
        "E ≈ {e} J",
        { "{e}": eStr }
    );
    let phaseDeg = (phase * 180 / Math.PI).toFixed(1);

    let phaseText = "";

    if (phase > 0) phaseText = simT("phaseText.currentLags", "Curentul este întârziat");
    else if (phase < 0) phaseText = simT("phaseText.currentLeads", "Curentul este în avans");
    else phaseText = simT("phaseText.inPhase", "În fază");

    document.getElementById("phaseInfo").textContent = `${phaseDeg}° → ${phaseText}`;

    rmsDiv.innerHTML = ``; 
    cosphiDiv.innerHTML = ``;
}

updateUI();

// listeners
ampUSlider.addEventListener("input", () => {
    amplitudeU = parseInt(ampUSlider.value);
    updateUI();
});
ampISlider.addEventListener("input", () => {
    amplitudeI = parseInt(ampISlider.value);
    updateUI();
});

freqSlider.addEventListener("input", () => {
    frequency = freqSlider.value / 1000;
    updateUI();
});
speedSlider.addEventListener("input", () => {
    speed = speedSlider.value / 1000;
    updateUI();
});
phaseSlider.addEventListener("input", () => {
    phase = phaseSlider.value / 100; // 0 → 6.28 (≈ 2π)
    updateUI();
});
modeSelect.addEventListener("change", () => {
    mode = modeSelect.value;
    updateUI();
});
function drawGrid() {
    const spacing = 50;

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;

    // linii verticale
    for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255,255,255,0.03)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#38bdf8";
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // linii orizontale
    for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#38bdf8";
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // axe principale
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    // axa X (mijloc)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffffff";
    // // axa Y (stânga)
    // ctx.beginPath();
    // ctx.moveTo(0, 0);
    // ctx.lineTo(0, canvas.height);
    // ctx.stroke();
}
function draw() {
    // trail (oscilloscope effect)
    ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    let movingX = canvas.width / 4;
    let mid = canvas.height / 2;
    let scale = (canvas.height / 2 - 20) / 200;

    let uPoint, iPoint;

if (mode === "ac") {
    uPoint = amplitudeU * Math.sin(frequency * movingX + t);
    iPoint = amplitudeI * Math.sin(frequency * movingX + t + phase);
} else {
    uPoint = amplitudeU;
    iPoint = amplitudeI; // DC simplu (poți pune /R dacă vrei realism)
}

    let movingYU = mid + uPoint * scale;
    let movingYI = mid + iPoint * scale;

    // TENSIUNE U(t) - albastru
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        let yU;

        if (mode === "ac") {
            let u = amplitudeU * Math.sin(frequency * x + t);
            yU = mid + u * scale;
        } else {
            yU = mid + amplitudeU * scale;
        }

        if (x === 0) ctx.moveTo(x, yU);
        else ctx.lineTo(x, yU);
    }

    ctx.stroke();

    ctx.strokeStyle = "#38bdf8";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#38bdf8";

    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();

    //  CURENT I(t) cu defazaj - verde
    for (let x = 0; x < canvas.width; x++) {
        let yI;

        if (mode === "ac") {
            let i = amplitudeI * Math.sin(frequency * x + t + phase);
            yI = mid + i * scale;
        } else {
            yI = mid + amplitudeI * scale;
        }

        if (x === 0) ctx.moveTo(x, yI);
        else ctx.lineTo(x, yI);
    }

    ctx.strokeStyle = "#22c55e";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#22c55e";

    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(movingX, mid);
    ctx.lineTo(movingX, movingYU);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.77)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, movingYU);
    ctx.lineTo(canvas.width, movingYU);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();
    // punct tensiune(galben)
    ctx.beginPath();
    ctx.arc(movingX, movingYU, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff000";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(movingX, mid);
    ctx.lineTo(movingX, movingYI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.77)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, movingYI);
    ctx.lineTo(canvas.width, movingYI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();
    // punct curent(galben)
    ctx.beginPath();
    ctx.arc(movingX, movingYI, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff000";
    ctx.fill();


    // valori instantanee
    let u = mode === "ac"
        ? amplitudeU * Math.sin(frequency * movingX + t)
        : amplitudeU;

    let i = mode === "ac"
        ? amplitudeI * Math.sin(frequency * movingX + t + phase)
        : amplitudeI;

    let p = u * i;

    instantDiv.textContent = `u(t) = ${u.toFixed(2)} | i(t) = ${i.toFixed(2)}`;
    powerDiv.textContent = `P(t) = ${p.toFixed(2)}`;

    // animație
    if (mode === "ac") {
        t += speed;
    }

    requestAnimationFrame(draw);
    drawMiniGraph();
    drawPhasor();
}
function drawMiniGraph() {
    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

    let mid = miniCanvas.height / 2;

    // scale diferite 
    let scaleSignal = 0.3;
    let scalePower = 0.002;

    // 🔵 U(t)
    miniCtx.beginPath();
    for (let x = 0; x < miniCanvas.width; x++) {
        let u;
    
        if (mode === "ac") {
            u = amplitudeU * Math.sin(frequency * x + t);
        } else {
            u = amplitudeU; // DC = constant
        }
    
        let y = mid + u * scaleSignal;
    
        if (x === 0) miniCtx.moveTo(x, y);
        else miniCtx.lineTo(x, y);
    }
    miniCtx.strokeStyle = "#38bdf8";
    miniCtx.lineWidth = 2;
    miniCtx.stroke();


    // 🟢 I(t)
    miniCtx.beginPath();
    for (let x = 0; x < miniCanvas.width; x++) {
        let i;
    
        if (mode === "ac") {
            i = amplitudeI * Math.sin(frequency * x + t + phase);
        } else {
            i = amplitudeI;
        }
    
        let y = mid + i * scaleSignal;
    
        if (x === 0) miniCtx.moveTo(x, y);
        else miniCtx.lineTo(x, y);
    }
    miniCtx.strokeStyle = "#22c55e";
    miniCtx.lineWidth = 2;
    miniCtx.stroke();

    // 🟡 P(t)
    miniCtx.beginPath();
    for (let x = 0; x < miniCanvas.width; x++) {
        let u, i;
    
        if (mode === "ac") {
            u = amplitudeU * Math.sin(frequency * x + t);
            i = amplitudeI * Math.sin(frequency * x + t + phase);
        } else {
            u = amplitudeU;
            i = amplitudeI;
        }
    
        let p = u * i;
    
        let y = mid - p * scalePower;
    
        if (x === 0) miniCtx.moveTo(x, y);
        else miniCtx.lineTo(x, y);
    }
    miniCtx.strokeStyle = "#facc15";
    miniCtx.lineWidth = 2;
    miniCtx.stroke();
}
function drawPhasor() {
    let w = phasorCanvas.width;
    let h = phasorCanvas.height;

    let cx = w / 2;
    let cy = h / 2;
    let R = Math.min(w, h) / 3;

    phasorCtx.clearRect(0, 0, w, h);

    // cerc
    phasorCtx.beginPath();
    phasorCtx.arc(cx, cy, R, 0, Math.PI * 2);
    phasorCtx.strokeStyle = "rgba(255,255,255,0.2)";
    phasorCtx.stroke();

    // 🔵 U (referință)
    let angleU = 0;
    let xU = cx + R * Math.cos(angleU);
    let yU = cy - R * Math.sin(angleU);

    phasorCtx.beginPath();
    phasorCtx.moveTo(cx, cy);
    phasorCtx.lineTo(xU, yU);
    phasorCtx.strokeStyle = "#38bdf8";
    phasorCtx.lineWidth = 3;
    phasorCtx.stroke();

    // 🟢 I (defazat)
    let angleI = -phase;
    let xI = cx + R * Math.cos(angleI);
    let yI = cy - R * Math.sin(angleI);

    phasorCtx.beginPath();
    phasorCtx.moveTo(cx, cy);
    phasorCtx.lineTo(xI, yI);
    phasorCtx.strokeStyle = "#22c55e";
    phasorCtx.lineWidth = 3;
    phasorCtx.stroke();

    // arc φ
    phasorCtx.beginPath();
    phasorCtx.arc(cx, cy, R * 0.6, 0, -phase, phase < 0);
    phasorCtx.strokeStyle = "#facc15";
    phasorCtx.stroke();
}

draw();