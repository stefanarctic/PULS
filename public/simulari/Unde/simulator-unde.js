// Canvas: <canvas id="amplitudeChart" …></canvas>

function simWaveLbl(path, fb) {
    const o = window.__SIMULATOR_UI_I18N__;
    return path.split(".").reduce((c, k) => (c != null ? c[k] : undefined), o) ?? fb;
}

function updatePhysicsInfo() {
    const freq = 1000 / dropSpeed;
    const waveSpeed = 100;
    const wavelength = waveSpeed / freq;

    const display = document.getElementById("physicsDisplay");
    if (!display) return;

    const L = window.__SIMULATOR_UI_I18N__?.labels;
    if (L) {
        display.innerHTML = `
            <li>${L.physicsFrequency} ${freq.toFixed(2)} ${L.physicsHz}</li>
            <li>${L.physicsWaveSpeed} ${waveSpeed} ${L.physicsPxPerS}</li>
            <li>${L.physicsWavelength} ${wavelength.toFixed(2)} ${L.physicsPx}</li>
        `;
    } else {
        display.innerHTML = `
            <li>Frecvență: ${freq.toFixed(2)} Hz</li>
            <li>Viteză undă: ${waveSpeed} px/s</li>
            <li>Lungime de undă: ${wavelength.toFixed(2)} px</li>
        `;
    }
}

function initWaveSimulatorSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleSidebar = document.getElementById("toggleSidebar");
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener("click", function () {
            sidebar.classList.toggle("visible");
        });
    }
    updatePhysicsInfo();
}

let isRunning = false;
const speedSlider = document.getElementById("speedSlider");
const sizeSlider = document.getElementById("sizeSlider");

let dropSpeed = 1100 - speedSlider.value * 100;
let dropSize = parseInt(sizeSlider.value);
let interval;
const button = document.getElementById("toggleBtn");
const water = document.getElementById("water");

const secondToggle = document.getElementById("secondFaucetToggle");
let secondInterval = null;
const faucet2 = document.getElementById("faucet2");

const measurePoints = [
    { id: "A", x: 130, y: 330, color: "red", amplitudes: [] },
    { id: "B", x: 220, y: 340, color: "green", amplitudes: [] },
    { id: "C", x: 250, y: 350, color: "blue", amplitudes: [] },
];

let dropCount = 0;
const colorPicker = document.getElementById("colorPicker");
const colorPick = document.getElementById("colorPick");

function createDrop(x = 200, y = 350) {
    const drop = document.createElement("div");
    drop.className = "drop";
    drop.style.width = drop.style.height = `${dropSize}px`;
    drop.style.left = `${x - dropSize / 2}px`;
    drop.style.top = `${y - 30}px`;
    drop.style.backgroundColor = colorPicker.value;
    water.appendChild(drop);
    dropCount++;
    document.getElementById("dropCount").textContent = dropCount;
    drop.addEventListener("animationend", () => {
        water.removeChild(drop);
        createRipple(x, y, x < 200);
    });
}

let ripples = [];

function createRipple(x, y, fromSecond = false) {
    const time = Date.now();
    ripples.push({ x, y, time });

    for (let i = 0; i < 3; i++) {
        const ripple = document.createElement("div");
        ripple.className = "ripple";
        if (fromSecond) ripple.classList.add("from-second");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.animationDelay = `${i * 0.3}s`;
        ripple.style.zIndex = 0;
        ripple.style.backgroundColor = colorPick.value;
        water.appendChild(ripple);

        ripple.addEventListener("animationend", () => {
            ripple.remove();
        });
    }
}

speedSlider.addEventListener("input", () => {
    document.getElementById("speedValue").textContent = speedSlider.value;
    dropSpeed = 1100 - speedSlider.value * 100;

    if (isRunning) {
        clearInterval(interval);
        interval = setInterval(() => {
            createDrop(200, 350);
        }, dropSpeed);

        if (secondToggle.checked) {
            clearInterval(secondInterval);
            secondInterval = setInterval(() => {
                createDrop(130, 350);
            }, dropSpeed);
        }
    }
    updatePhysicsInfo();
});

sizeSlider.addEventListener("input", () => {
    document.getElementById("sizeValue").textContent = sizeSlider.value;
    dropSize = parseInt(sizeSlider.value);
});

secondToggle.addEventListener("change", () => {
    if (secondToggle.checked) {
        faucet2.style.display = "block";
        if (isRunning) {
            clearInterval(secondInterval);
            secondInterval = setInterval(() => {
                createDrop(130, 350);
            }, dropSpeed);
        }
    } else {
        faucet2.style.display = "none";
        clearInterval(secondInterval);
    }
});

const FORMULAS_RO = `
\\[
\\text{Frecventa undei}
\\]
\\[
f = \\frac{1}{T}
\\]

\\[
\\text{Lungimea de unda}
\\]
\\[
\\lambda = v \\cdot T = \\frac{v}{f}
\\]

\\[
\\text{Numarul de unde in timp } t
\\]
\\[
N = \\frac{t}{T}
\\]
`;

function applyWaveFormulas() {
    const el = document.getElementById("formulas");
    if (!el) return;
    const tex = window.__SIMULATOR_UI_I18N__?.formulas?.block;
    el.innerHTML = tex || FORMULAS_RO;
    if (window.MathJax?.typeset) MathJax.typeset();
}

applyWaveFormulas();

function createMeasurementPoints() {
    measurePoints.forEach(p => {
        const el = document.createElement("div");
        el.className = "measure-point";
        el.id = `point${p.id}`;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.style.backgroundColor = p.color;
        el.style.position = "absolute";
        el.style.width = "8px";
        el.style.height = "8px";
        el.style.borderRadius = "50%";
        el.style.zIndex = 10;
        el.style.display = "none";
        water.appendChild(el);
    });
}

createMeasurementPoints();

const ctxAmplitude = document.getElementById("amplitudeChart").getContext("2d");

const amplitudeChart = new Chart(ctxAmplitude, {
    type: 'line',
    data: {
        labels: Array.from({ length: 30 }, (_, i) => i),
        datasets: [
            {
                label: simWaveLbl("chart.pointA", "Punct A"),
                data: new Array(30).fill(0),
                borderColor: 'red',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
            },
            {
                label: simWaveLbl("chart.pointB", "Punct B"),
                data: new Array(30).fill(0),
                borderColor: 'green',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
            },
            {
                label: simWaveLbl("chart.pointC", "Punct C"),
                data: new Array(30).fill(0),
                borderColor: 'blue',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
            }
        ]
    },
    options: {
        animation: false,
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 10, font: { size: 10 } }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: true, color: "#ddd" },
                ticks: { font: { size: 10 } }
            },
            x: {
                grid: { display: true, color: "#ddd" },
                ticks: { font: { size: 8 } }
            }
        }

    }
});

function applyWaveChartLabels() {
    const bag = window.__SIMULATOR_UI_I18N__?.chart;
    if (!bag) return;
    amplitudeChart.data.datasets[0].label = bag.pointA || amplitudeChart.data.datasets[0].label;
    amplitudeChart.data.datasets[1].label = bag.pointB || amplitudeChart.data.datasets[1].label;
    amplitudeChart.data.datasets[2].label = bag.pointC || amplitudeChart.data.datasets[2].label;
    amplitudeChart.update();
}

applyWaveChartLabels();

let graphInterval;

function startGraph() {
    if (!graphInterval) {
        graphInterval = setInterval(() => {
            const now = Date.now();
            const waveSpeed = 100;
            measurePoints.forEach((point, index) => {
                let amplitude = 0;

                ripples.forEach(ripple => {
                    const dt = (now - ripple.time) / 1000;
                    const waveRadius = dt * waveSpeed;
                    const dx = point.x - ripple.x;
                    const dy = point.y - ripple.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const diff = Math.abs(dist - waveRadius);
                    if (diff < 10) {
                        amplitude += (1 / (1 + dist)) * 50;
                    }
                });

                const data = amplitudeChart.data.datasets[index].data;
                data.push(amplitude);
                if (data.length > 30) data.shift();
            });

            amplitudeChart.update("none");
        }, 100);
    }
}

function stopGraph() {
    clearInterval(graphInterval);
    graphInterval = null;
}

button.addEventListener("click", () => {
    isRunning = !isRunning;
    button.textContent = isRunning
        ? simWaveLbl("buttons.stop", "Stop")
        : simWaveLbl("buttons.start", "Start");

    document.querySelectorAll(".measure-point").forEach(el => {
        el.style.display = isRunning ? "block" : "none";
    });

    if (isRunning) {
        interval = setInterval(() => createDrop(200, 350), dropSpeed);
        if (secondToggle.checked) {
            secondInterval = setInterval(() => createDrop(130, 350), dropSpeed);
        }
        startGraph();
    } else {
        clearInterval(interval);
        clearInterval(secondInterval);
        stopGraph();
    }
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWaveSimulatorSidebar);
} else {
    initWaveSimulatorSidebar();
}
