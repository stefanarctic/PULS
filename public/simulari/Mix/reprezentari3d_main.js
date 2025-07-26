let isPaused = false;
let isStopped = true;
let amplitude = parseFloat(document.getElementById("amplitude").value); // în grade
let speed = parseFloat(document.getElementById("speed").value);
let angle = 0;
let direction = 1;
let length = parseFloat(document.getElementById("lengthSlider").value) || 1.5; 
const mass = 1.5;
let pendulumInterval;
let measuringActive = false;
const gravity = 9.81;
let time = 0;
const timeStep = 0.02;
const ctx = document.getElementById("pendulumChart").getContext("2d");

const pendulumChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from({ length: 50 }, (_, i) => i),
        datasets: [{
            label: 'Unghi θ (rad)',
            data: [], 
            borderColor: 'blue',
            borderWidth: 2,
            pointRadius: 0,
        }, {
            label: 'Viteză unghiulară ωθ (rad/s)',
            data: [],
            borderColor: 'red',
            borderWidth: 2,
            pointRadius: 0,
        }, {
            label: 'Energia mecanică Em (J)',
            data: [],
            borderColor: 'green',
            borderWidth: 2,
            pointRadius: 0,
        }]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    font: {
                        size: 10
                    }
                }
            }
        },
        scales: {
            y: {
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

function updatePendulum() {
    // θ_max în radiani
    const thetaMax = amplitude * Math.PI / 180;
    const l = length / 100; // metri
    const omega0 = Math.sqrt(gravity / l); // rad/s
    // θ(t) = θ_max * sin(ω t)
    const theta = thetaMax * Math.sin(omega0 * time);
    // viteză unghiulară: dθ/dt = θ_max * ω * cos(ω t)
    const omega = thetaMax * omega0 * Math.cos(omega0 * time);
    // viteză liniară: v = l * dθ/dt
    const velocity = l * omega;
    // accelerație unghiulară: α = -ω0^2 * θ_max * sin(ω t) = -ω0^2 * θ(t)
    const alpha = -omega0 * omega0 * theta;
    // accelerație liniară: a = l * α
    const acceleration = l * alpha;
    // energii
    const kineticEnergy = 0.5 * mass * velocity * velocity;
    const potentialEnergy = mass * gravity * l * (1 - Math.cos(theta));
    const mechanicalEnergy = kineticEnergy + potentialEnergy;

    // Actualizăm graficul
    pendulumChart.data.labels.push(time.toFixed(2));
    pendulumChart.data.datasets[0].data.push(theta);
    pendulumChart.data.datasets[1].data.push(omega);
    pendulumChart.data.datasets[2].data.push(mechanicalEnergy);

    if (pendulumChart.data.labels.length > 300) {
        pendulumChart.data.labels.shift();
        pendulumChart.data.datasets.forEach(dataset => dataset.data.shift());
    }
    pendulumChart.update();

    // Actualizăm poziția pendulului vizual
    let pendulum = document.getElementById("string");
    let thetaDegrees = theta * 180 / Math.PI; // pentru afișare vizuală
    pendulum.style.transform = `rotate(${thetaDegrees}deg)`;

    time += timeStep;

    if (measuringActive) {
        document.getElementById("measured-length").textContent = l.toFixed(2) + "m";
        document.getElementById("measured-angle").textContent = (theta * 180 / Math.PI).toFixed(1) + "°";
        document.getElementById("measured-time").textContent = time.toFixed(2) + "s";
        document.getElementById("measured-angular-velocity").textContent = omega.toFixed(3) + "rad/s";
        document.getElementById("measured-velocity").textContent = velocity.toFixed(3) + "m/s";
        document.getElementById("measured-acceleration").textContent = acceleration.toFixed(3) + "m/s²";
        document.getElementById("measured-kineticenergy").textContent = kineticEnergy.toFixed(3) + "J";
        document.getElementById("measured-potentialenergy").textContent = potentialEnergy.toFixed(3) + "J";
        document.getElementById("measured-mechanicalenergy").textContent = mechanicalEnergy.toFixed(3) + "J";
        // Calculăm și afișăm perioada
        const period = calculateNonlinearPeriod(amplitude, length);
        document.getElementById("measured-period").textContent = period.toFixed(3) + "s";
    }
}

function startOscillation() {
    if (!isStopped) return;
    isStopped = false;
    isPaused = false;
    time = 0;
    speed = parseFloat(document.getElementById("speed").value);
    length = parseFloat(document.getElementById("lengthSlider").value);
    pendulumChart.data.labels = [];
    pendulumChart.data.datasets.forEach(dataset => dataset.data = []);
    pendulumChart.update();
    pendulumInterval = setInterval(updatePendulum, 100 / speed);
    resetMeasuringData();
    document.getElementById("measured-length").textContent = "0";
    document.getElementById("measured-angle").textContent = "0°";
    document.getElementById("measured-time").textContent = "0s";
    document.getElementById("measured-angular-velocity").textContent = "0rad/s";
    document.getElementById("measured-velocity").textContent = "0m/s";
    document.getElementById("measured-acceleration").textContent = "0m/s²";
    document.getElementById("measured-kineticenergy").textContent = "0J";
    document.getElementById("measured-potentialenergy").textContent = "0J";
    document.getElementById("measured-mechanicalenergy").textContent = "0J";
    document.getElementById("measured-period").textContent = "0s";
    document.getElementById("pauseResumeBtn").textContent = "Pauză";
}

function togglePauseResume() {
    let button = document.getElementById("pauseResumeBtn");
    if (isPaused) {
        speed = parseFloat(document.getElementById("speed").value);
        clearInterval(pendulumInterval); 
        pendulumInterval = setInterval(updatePendulum, 100 / speed);
        button.textContent = "Pauză";
    } else {
        clearInterval(pendulumInterval);
        button.textContent = "Rezumă";
    }
    isPaused = !isPaused;
}

function stopOscillation() {
    clearInterval(pendulumInterval);
    isStopped = true;
    isPaused = false;
    angle = 0;
    time = 0;
    document.getElementById("string").style.transform = `rotate(0deg)`;
    document.getElementById("measured-length").textContent = "0";
    document.getElementById("measured-angle").textContent = "0°";
    document.getElementById("measured-time").textContent = "0s";
    document.getElementById("measured-angular-velocity").textContent = "0rad/s";
    document.getElementById("measured-velocity").textContent = "0m/s";
    document.getElementById("measured-acceleration").textContent = "0m/s²";
    document.getElementById("measured-kineticenergy").textContent = "0J";
    document.getElementById("measured-potentialenergy").textContent = "0J";
    document.getElementById("measured-mechanicalenergy").textContent = "0J";
    document.getElementById("measured-period").textContent = "0s";
    document.getElementById("pauseResumeBtn").textContent = "Pauză";
}

function resetMeasuringData() {
    // Funcție pentru resetarea datelor de măsurare
}

// Perioada pendulului (aproximare pentru unghiuri mari)
function calculateNonlinearPeriod(amplitude, length) {
    const l = length / 100; // metri
    const theta0 = amplitude * Math.PI / 180; // radiani
    const g = gravity;
    // Aproximare cu seria Taylor
    const T0 = 2 * Math.PI * Math.sqrt(l / g);
    const correction = 1 + (1/16) * Math.pow(theta0, 2) + (11/3072) * Math.pow(theta0, 4);
    return T0 * correction;
}

document.getElementById("amplitude").addEventListener("input", function () {
    amplitude = parseFloat(this.value);
    document.getElementById("amplitude-value").textContent = amplitude + "° (cm)";
});

document.getElementById("speed").addEventListener("input", function () {
    speed = parseFloat(this.value);
    document.getElementById("speed-value").textContent = speed + "x";

    if (!isStopped) {
        clearInterval(pendulumInterval);
        if (!isPaused) {
            pendulumInterval = setInterval(updatePendulum, 100 / speed);
        }
    }
});

document.getElementById("lengthSlider").addEventListener("input", function () {
    length = parseFloat(this.value);
    document.getElementById("lengthValue").textContent = length;
    document.getElementById("measured-length").textContent = (length / 100).toFixed(2) + "m";
    time = 0; // Resetăm timpul pentru a evita erori de fază
    if (!isStopped) {
        clearInterval(pendulumInterval);
        pendulumInterval = setInterval(updatePendulum, 100 / speed);
    }
});

function toggleMeasuringTool() {
    measuringActive = !measuringActive;
    document.body.style.cursor = measuringActive ? "crosshair" : "default";
}

document.getElementById("toggleSidebar").addEventListener("click", function() {
    let sidebar = document.querySelector(".sidebar");
    let screenWidth = window.innerWidth;
    sidebar.classList.toggle("hidden");
    if(screenWidth < 2350)
    {
    if (sidebar.classList.contains("hidden")) {
        this.style.right = "-6px";
        this.textContent = "<";
    } else {
        this.style.right = "313px";
        this.textContent = ">";
    }
    }
    else {
            if (sidebar.classList.contains("hidden")) {
                this.style.right = "-6px";
                this.textContent = "<";
            } else {
                this.style.right = "510px";
                this.textContent = ">";
            }
    }
});

document.getElementById("toggleUniformbar").addEventListener("click", function() {
    let uniformbar = document.querySelector(".unitform-container");
    uniformbar.classList.toggle("hidden");
    let screenWidth = window.innerWidth;
    if(screenWidth < 2350)
    {
    if (uniformbar.classList.contains("hidden")) {
        this.style.left = "-6px";
        this.textContent = ">";
    } else {
        this.style.left = "333px";
        this.textContent = "<";
    }
    }
    else 
    {
        if (uniformbar.classList.contains("hidden")) {
            this.style.left = "-6px";
            this.textContent = ">";
        } else {
            this.style.left = "520px";
            this.textContent = "<";
        }
    }
    
});

document.addEventListener("DOMContentLoaded", function () {
    const lengthSlider = document.getElementById("lengthSlider");
    const lengthValue = document.getElementById("lengthValue");
    const measuredLength = document.getElementById("measured-length");

    if (!lengthSlider || !lengthValue || !measuredLength) {
        console.error("Unul dintre elemente lipsește!");
        return;
    }

    let length = parseFloat(lengthSlider.value) || 450;
    
    lengthValue.textContent = length;
    measuredLength.textContent = (length / 100).toFixed(2) + "m";

    function updatePendulumLength() {
        let newLength = parseFloat(lengthSlider.value) || 450;
        lengthValue.textContent = newLength;
        measuredLength.textContent = (newLength / 100).toFixed(2) + "m";
        
        // Actualizăm lungimea firului vizual
        const string = document.getElementById("string");
        const ball = document.getElementById("ball");
        if (string && ball) {
            string.style.height = `${newLength}px`;
            ball.style.top = `${newLength}px`;
        }
    }

    lengthSlider.addEventListener("input", updatePendulumLength);
});