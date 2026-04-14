const canvas = document.getElementById("reactorCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const chartCanvas = document.getElementById("chartCanvas");
const chartCtx = chartCanvas.getContext("2d");
let energyHistory = [];

function sizeChartCanvas() {
    const w = chartCanvas.offsetWidth || 400;
    const h = chartCanvas.offsetHeight || 200;
    const dpr = window.devicePixelRatio || 1;
    chartCanvas.width = Math.max(1, Math.floor(w * dpr));
    chartCanvas.height = Math.max(1, Math.floor(h * dpr));
    chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

sizeChartCanvas();
requestAnimationFrame(() => {
    sizeChartCanvas();
    drawChart();
});

/** Web Audio — hum reactor + alarmă meltdown (necesită gest utilizator: click) */
let audioCtx = null;
let reactorOsc = null;
let reactorGain = null;

function startReactorAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    reactorOsc = audioCtx.createOscillator();
    reactorGain = audioCtx.createGain();
    reactorOsc.type = "sine";
    reactorOsc.frequency.value = 50;
    reactorGain.gain.value = 0.05;
    reactorOsc.connect(reactorGain);
    reactorGain.connect(audioCtx.destination);
    reactorOsc.start();
}

function resumeReactorAudio() {
    startReactorAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function unlockAudio() {
    resumeReactorAudio();
}
document.body.addEventListener("click", unlockAudio, { capture: true });
document.body.addEventListener("pointerdown", unlockAudio, { capture: true });

function updateReactorAudio() {
    if (!audioCtx || !reactorOsc || !reactorGain || audioCtx.state !== "running") {
        return;
    }
    if (meltdown) {
        reactorOsc.frequency.value = 600;
        reactorGain.gain.value = 0.2;
    } else {
        const intensity = (state.temperature + state.flux * 100) / 1000;
        reactorOsc.frequency.value = 50 + intensity * 200;
        reactorGain.gain.value = 0.03 + intensity * 0.1;
    }
}

function updateChart(value) {
    energyHistory.push(value);
    if (energyHistory.length > 100) {
        energyHistory.shift();
    }
    drawChart();
}

function drawChart() {
    const w = chartCanvas.offsetWidth || 1;
    const h = chartCanvas.offsetHeight || 1;
    chartCtx.save();
    chartCtx.setTransform(1, 0, 0, 1, 0, 0);
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    chartCtx.restore();

    const pad = 10;
    const chartW = Math.max(1, w - pad * 2);
    const chartH = Math.max(1, h - pad * 2);
    const n = energyHistory.length;

    chartCtx.strokeStyle = "rgba(74, 222, 128, 0.25)";
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(pad, pad + chartH);
    chartCtx.lineTo(pad + chartW, pad + chartH);
    chartCtx.stroke();

    if (n < 2) {
        return;
    }

    let ymax = 100;
    for (let i = 0; i < n; i++) {
        if (energyHistory[i] > ymax) ymax = energyHistory[i];
    }
    ymax *= 1.08;
    if (ymax < 50) ymax = 50;

    chartCtx.strokeStyle = meltdown ? "#ef4444" : "#22c55e";
    chartCtx.lineWidth = meltdown ? 2.5 : 2;
    chartCtx.lineJoin = "round";
    chartCtx.beginPath();
    energyHistory.forEach((val, i) => {
        const x = pad + (i / (n - 1)) * chartW;
        const t = Math.max(0, val) / ymax;
        const y = pad + chartH - t * chartH;
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();
}

/* CONTROLS */
const sliders = document.querySelectorAll("input[type=range]");
const energyEl = document.getElementById("energy");
const rateEl = document.getElementById("rate");
const stabilityEl = document.getElementById("stability");
const meltdownExplainEl = document.getElementById("meltdownExplain");
const resetBtn = document.getElementById("resetBtn");

/* STATE */
let state = {
    temperature: 500,
    pressure: 50,
    flux: 5
};

/* FUZIUNE D-T: ~17.6 MeV / reacție */
const MEV_PER_FUSION = 17.6;
let reactions = 0;
/** timestamps (performance.now) pentru fuziuni — folosit la rată evenimente/s */
let fusionTimes = [];

/** Meltdown: declanșat la flux > 8.5 && temperatură > 850 (latch) */
let meltdown = false;
let meltdownTime = 0;

/* PARTICULE */
let particles = [];

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100
    };
}

for (let i = 0; i < 80; i++) {
    particles.push(createParticle());
}

function resetReactor() {
    meltdown = false;
    meltdownTime = 0;
    reactions = 0;
    fusionTimes = [];
    energyHistory = [];
    drawChart();
    canvas.style.filter = "";
    document.body.style.transform = "";
    if (meltdownExplainEl) meltdownExplainEl.hidden = true;
    if (resetBtn) resetBtn.hidden = true;
    particles.forEach(p => {
        Object.assign(p, createParticle());
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", resetReactor);
}

/* UPDATE STATE DIN SLIDERS */
sliders.forEach((slider, index) => {
    slider.addEventListener("input", () => {
        const val = parseFloat(slider.value);

        if (index === 0) state.temperature = val;
        if (index === 1) state.pressure = val;
        if (index === 2) state.flux = val;
    });
});

function fusionsPerSecond() {
    const now = performance.now();
    fusionTimes = fusionTimes.filter(t => now - t < 1000);
    return fusionTimes.length;
}

/* CALCUL FIZIC — energie din reacții reale (simulator) */
function computePhysics() {
    const { temperature, flux } = state;

    const energy = reactions * MEV_PER_FUSION;
    const rate = fusionsPerSecond();

    // stabilitate
    let stability = "OK";
    if (flux > 7 && temperature > 700) stability = "Instabil";
    if (flux > 8.5 && temperature > 850) stability = "CRITIC";

    return { energy, rate, stability };
}

function drawAftermathBackground(cx, cy, d) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, d * 0.85);
    g.addColorStop(0, "rgba(55, 30, 38, 0.95)");
    g.addColorStop(0.45, "rgba(28, 18, 22, 0.92)");
    g.addColorStop(1, "rgba(12, 8, 10, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fog = ctx.createRadialGradient(cx, cy, d * 0.12, cx, cy, d * 0.7);
    fog.addColorStop(0, "rgba(100, 200, 130, 0.07)");
    fog.addColorStop(1, "rgba(100, 200, 130, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* DRAW */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { temperature, flux } = state;
    const physics = computePhysics();
    const energy = physics.energy;

    const d = Math.min(canvas.width, canvas.height);
    /** scalare „zoom out”: nucleu + glow raportate la canvas, nu pixeli fixi */
    const ru = d * 0.018;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const inAftermath = meltdown && meltdownTime > 50;
    const inBoom = meltdown && meltdownTime > 0 && meltdownTime <= 50;

    // glow reactor — scalat cu energie (MeV)
    const energyNorm = Math.min(1, energy / 120);
    const intensity = Math.min(1, (temperature + flux * 100 + energy * 0.8) / 1200);
    const glowRadius = d * 0.36 + energy * 0.85;

    if (inAftermath) {
        drawAftermathBackground(cx, cy, d);
    } else {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            ru * 1.2 + energyNorm * ru * 2.2,
            canvas.width / 2,
            canvas.height / 2,
            glowRadius
        );
        const time = Date.now() * 0.002;
        const ringWobble = d * 0.022;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                canvas.width / 2 + Math.sin(time + i) * ringWobble,
                canvas.height / 2 + Math.cos(time + i) * ringWobble,
                d * 0.16 + i * d * 0.038,
                0,
                Math.PI * 2
            );
            ctx.strokeStyle = `rgba(34,197,94,${0.15 - i * 0.03})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        if (state.flux > 6 && !meltdown) {
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);

                const angle = Math.random() * Math.PI * 2;
                const length = d * (0.2 + Math.random() * 0.1);

                ctx.lineTo(
                    canvas.width / 2 + Math.cos(angle) * length,
                    canvas.height / 2 + Math.sin(angle) * length
                );

                ctx.strokeStyle = "rgba(74,222,128,0.3)";
                ctx.stroke();
            }
        }

        gradient.addColorStop(0, `rgba(74,222,128,${(0.55 + energyNorm * 0.35) * intensity})`);
        gradient.addColorStop(0.45, `rgba(34,197,94,${0.25 * intensity})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // nucleu „fierbinte” — alb → galben → portocaliu → roșu
        const t = Date.now() * 0.003;
        const corePulse = 1 + Math.sin(t) * 0.06 + energyNorm * 0.15;
        const coreR =
            (ru + flux * ru * 0.07 + energyNorm * ru * 4.2) * corePulse;

        const boomChaos = inBoom ? Math.min(1, meltdownTime / 22) : 0;
        const coreTint = inBoom
            ? `rgba(255, ${80 - boomChaos * 40}, ${40 - boomChaos * 20}, ${0.35 + boomChaos * 0.35})`
            : null;

        const coreHalo = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.35);
        if (inBoom) {
            coreHalo.addColorStop(0, `rgba(255,240,200,${0.5 + boomChaos * 0.35})`);
            coreHalo.addColorStop(0.25, `rgba(255,120,60,${0.45 + boomChaos * 0.2})`);
            coreHalo.addColorStop(0.55, `rgba(255,60,40,${0.35})`);
            coreHalo.addColorStop(1, "rgba(80,20,20,0)");
        } else {
            coreHalo.addColorStop(0, `rgba(255,255,255,${0.35 + 0.45 * intensity})`);
            coreHalo.addColorStop(0.12, `rgba(255,248,220,${0.5 * intensity})`);
            coreHalo.addColorStop(0.35, `rgba(255,200,80,${0.42 * intensity})`);
            coreHalo.addColorStop(0.6, `rgba(255,100,40,${0.28 * intensity})`);
            coreHalo.addColorStop(0.85, `rgba(220,50,25,${0.12 * intensity})`);
            coreHalo.addColorStop(1, "rgba(180,30,20,0)");
        }
        ctx.fillStyle = coreHalo;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2.35 * (inBoom ? 1 + boomChaos * 0.45 : 1), 0, Math.PI * 2);
        ctx.fill();

        const coreInner = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        if (inBoom) {
            coreInner.addColorStop(0, "#ffffff");
            coreInner.addColorStop(0.4, `rgba(255,200,100,${0.9})`);
            coreInner.addColorStop(1, `rgba(255,80,50,${0.75})`);
        } else {
            coreInner.addColorStop(0, `rgba(255,255,255,${0.85 + 0.1 * intensity})`);
            coreInner.addColorStop(0.35, `rgba(255,235,150,${0.75 * intensity})`);
            coreInner.addColorStop(0.7, `rgba(255,140,50,${0.55 * intensity})`);
            coreInner.addColorStop(1, `rgba(255,80,30,${0.35 * intensity})`);
        }
        ctx.fillStyle = coreInner;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * (inBoom ? 1 + boomChaos * 0.2 : 1), 0, Math.PI * 2);
        ctx.fill();

        if (inBoom && coreTint) {
            ctx.fillStyle = coreTint;
            ctx.beginPath();
            ctx.arc(cx, cy, coreR * 3.2 * boomChaos, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const tempFactor = temperature / 1000;
    const speedMultiplier = 1 + flux * 0.4 + tempFactor * 0.45;
    const particleGlow = 3 + flux * 4 + energyNorm * 7;
    const particleR = 1.35 + flux * 0.28 + energyNorm * 0.85;

    const coreRForFusion =
        (ru + flux * ru * 0.07 + energyNorm * ru * 4.2) *
        (1 + Math.sin(Date.now() * 0.003) * 0.06 + energyNorm * 0.15);
    const fusionRadius = Math.max(ru * 1.15, coreRForFusion * 1.05);
    const fusionChance = 0.02 * (0.25 + (flux / 10) * 0.85);

    const boomShake = inBoom ? 1 + meltdownTime * 0.04 : 1;

    // particule
    particles.forEach(p => {
        const dx = cx - p.x;
        const dy = cy - p.y;

        if (inAftermath) {
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.vx += (Math.random() - 0.5) * 0.22;
            p.vy += (Math.random() - 0.5) * 0.22;
            const dist = Math.hypot(p.x - cx, p.y - cy) || 1;
            const ux = (p.x - cx) / dist;
            const uy = (p.y - cy) / dist;
            p.vx += ux * 0.055;
            p.vy += uy * 0.055;
            p.x += p.vx * 0.55;
            p.y += p.vy * 0.55;
        } else if (inBoom) {
            p.vx += (Math.random() - 0.5) * 2.4;
            p.vy += (Math.random() - 0.5) * 2.4;
            p.vx += (Math.random() - 0.5) * meltdownTime * 0.06;
            p.vy += (Math.random() - 0.5) * meltdownTime * 0.06;
            p.x += p.vx * boomShake * 1.85;
            p.y += p.vy * boomShake * 1.85;
        } else {
            p.vx += dx * 0.0001 * flux;
            p.vy += dy * 0.0001 * flux;
            p.x += p.vx * speedMultiplier;
            p.y += p.vy * speedMultiplier;
        }

        if (inAftermath) {
            p.life -= 0.2;
            if (p.life <= 0) {
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * canvas.height;
                p.life = 100;
                p.vx = (Math.random() - 0.5) * 0.6;
                p.vy = (Math.random() - 0.5) * 0.6;
            }
        } else {
            p.life--;
            if (p.life <= 0) {
                Object.assign(p, createParticle());
            }
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dist = Math.hypot(p.x - cx, p.y - cy);

        if (!meltdown && dist < fusionRadius && flux > 0.1 && Math.random() < fusionChance) {
            reactions++;
            fusionTimes.push(performance.now());

            const flashR = d * 0.034;
            ctx.beginPath();
            ctx.arc(p.x, p.y, flashR * 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 220, 120, 0.28)";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, flashR, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 200, 0.65)";
            ctx.fill();

            const kick = 1.2 + flux * 0.15;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            p.vx -= nx * kick;
            p.vy -= ny * kick;
        }

        if (inAftermath) {
            const lifeT = Math.max(0, Math.min(1, p.life / 100));
            const a = lifeT * 0.4;
            const tr = d * 0.009;
            ctx.shadowColor = `rgba(100, 255, 150, ${0.15 + lifeT * 0.25})`;
            ctx.shadowBlur = 2 + lifeT * 8;
            ctx.fillStyle = `rgba(100, 255, 150, ${a * 0.75})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, tr * 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(160, 255, 190, ${Math.min(0.65, a * 1.35)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, tr * 1.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.shadowColor = "rgba(134, 239, 172, 0.95)";
            ctx.shadowBlur = particleGlow;
            ctx.fillStyle = "#86efac";
            ctx.beginPath();
            ctx.arc(p.x, p.y, particleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    if (meltdown) {
        ctx.fillStyle = "rgba(0, 255, 150, 0.02)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (inAftermath) {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    if (inBoom) {
        const peak = Math.min(0.78, meltdownTime * 0.038);
        const fade = Math.max(0, (meltdownTime - 24) * 0.028);
        const flashAlpha = Math.max(0.04, peak - fade);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(255, 200, 120, ${flashAlpha * 0.35})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/* LOOP */
function animate() {
    const { temperature, flux } = state;

    if (!meltdown && flux > 8.5 && temperature > 850) {
        meltdown = true;
    }

    if (meltdown) {
        meltdownTime++;
        if (meltdownExplainEl) {
            meltdownExplainEl.hidden = false;
        }
        if (resetBtn) {
            resetBtn.hidden = false;
        }
    }

    if (!meltdown && flux > 7) {
        canvas.style.filter = "brightness(1.2)";
    } else if (meltdown && meltdownTime > 0 && meltdownTime < 48) {
        canvas.style.filter = "brightness(1.35) contrast(1.15)";
    } else if (meltdown && meltdownTime >= 48) {
        canvas.style.filter = "brightness(0.92) saturate(0.85)";
    } else {
        canvas.style.filter = "";
    }

    if (meltdown && meltdownTime > 0 && meltdownTime < 50) {
        document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
    } else {
        document.body.style.transform = "";
    }

    const physics = computePhysics();

    updateReactorAudio();
    updateChart(physics.energy);

    energyEl.textContent = physics.energy.toFixed(1) + " MeV";
    rateEl.textContent = physics.rate.toFixed(1) + " /s";

    if (meltdown) {
        stabilityEl.textContent = "\u2622 MELTDOWN";
        stabilityEl.style.color = "#f87171";
    } else if (flux > 7) {
        stabilityEl.textContent = "\u26A0 INSTABIL";
        stabilityEl.style.color = "#fb923c";
    } else {
        stabilityEl.textContent = physics.stability;
        if (physics.stability === "OK") {
            stabilityEl.style.color = "#22c55e";
        } else {
            stabilityEl.style.color = "#22c55e";
        }
    }

    draw();
    requestAnimationFrame(animate);
}

animate();

/* RESPONSIVE FIX */
window.addEventListener("resize", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    sizeChartCanvas();
    drawChart();
});
