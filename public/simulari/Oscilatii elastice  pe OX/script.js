// DOM elements
const themeSwitcher = document.getElementById('themeSwitcher');
const body = document.body;
const springSVG = document.getElementById('springSVG');
const masaSlider = document.getElementById('masa');
const masaValue = document.getElementById('masaValue');
const startBtn = document.getElementById('startBtn');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const stopBtn = document.getElementById('stopBtn');
const masoaraBtn = document.getElementById('masoaraBtn');
const frecareSlider = document.getElementById('frecare');
const frecareValue = document.getElementById('frecareValue');
const zeroFrictionBtn = document.getElementById('zeroFrictionBtn');
const kSlider = document.getElementById('k');
const kValue = document.getElementById('kValue');

// Measurements
const lungimeDisplay = document.getElementById('lungimeDisplay');
const amplitudineDisplay = document.getElementById('amplitudineDisplay');
const timpDisplay = document.getElementById('timpDisplay');
const deplasareDisplay = document.getElementById('deplasareDisplay');
const vitezaDisplay = document.getElementById('vitezaDisplay');
const kDisplay = document.getElementById('kDisplay');
const fortaDisplay = document.getElementById('fortaDisplay');
const ecDisplay = document.getElementById('ecDisplay');

// Chart
let chart;
const chartCtx = document.getElementById('chartHooke').getContext('2d');

// Simulation state
let running = false;
let paused = false;
let t = 0;
let animationFrame = null;
let lastTimestamp = 0;
let masa = 5.0; // Default value
let x = 0;  // Spring displacement on OX
let vx = 0; // Velocity 
let timeElapsed = 0;
let isMeasuring = false;

// Theme switching
let isDark = true;
themeSwitcher.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeSwitcher.innerHTML = '☀️ Schimbă tema';
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeSwitcher.innerHTML = '🌙 Schimbă tema';
    }
    createChart(); // Recreate chart with new theme colors
});

// Chart.js setup
function createChart() {
    console.log('Creating chart...');
    if (chart) {
        console.log('Destroying existing chart...');
        chart.destroy();
    }
    
    const chartConfig = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Deplasare (m)',
                    data: [],
                    borderColor: 'rgb(111, 53, 247)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.2,
                    borderWidth: 3
                },
                {
                    label: 'Viteză (m/s)',
                    data: [],
                    borderColor: 'rgb(241, 145, 66)',
                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                    tension: 0.2,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#222',
                        boxWidth: 40,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#222',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Timp (s)',
                        color: '#222',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {top: 10, bottom: 10}
                    }
                },
                y: {
                    position: 'left',
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#222',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    };

    try {
        chart = new Chart(chartCtx, chartConfig);
        console.log('Chart created successfully');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// Draw spring and ball function (OX only)
function drawSpring(xPx, mass) {
    springSVG.innerHTML = '';
    const centerY = 200;
    const startX = 50;
    const endX = 350 + xPx; // Ball moves from 350 + xPx
    const coilRadius = 25;
    const numCoils = 10;
    const points = 80;
    
    // Draw spring
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M${startX},${centerY}`;
    for (let i = 1; i <= points; i++) {
        const t = i / points;
        const x = startX + t * (endX - startX);
        const y = centerY + Math.sin(t * Math.PI * numCoils) * coilRadius * (1 - Math.abs(t - 0.5) * 0.5);
        d += ` L${x},${y}`;
    }
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#222');
    path.setAttribute('stroke-width', '6');
    path.setAttribute('fill', 'none');
    springSVG.appendChild(path);
    
    // Draw anchor
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    anchor.setAttribute('x', startX - 30);
    anchor.setAttribute('y', centerY - 20);
    anchor.setAttribute('width', 30);
    anchor.setAttribute('height', 40);
    anchor.setAttribute('fill', '#444');
    anchor.setAttribute('rx', '4');
    springSVG.appendChild(anchor);
    
    // Draw ball
    const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttribute('cx', endX);
    ball.setAttribute('cy', centerY);
    const radius = 35 + (mass - 1) * 2;
    ball.setAttribute('r', radius);
    ball.setAttribute('fill', 'silver');
    ball.setAttribute('stroke', '#444');
    ball.setAttribute('stroke-width', '4');
    springSVG.appendChild(ball);
    
    // Set SVG dimensions
    springSVG.setAttribute('height', '500');
    springSVG.style.height = '500px';
    springSVG.style.overflow = 'visible';
}

// Verify DOM elements exist
function verifyElements() {
    const elements = {
        themeSwitcher, body, springSVG, masaSlider, masaValue,
        startBtn, pauseResumeBtn, stopBtn, masoaraBtn, frecareSlider,
        frecareValue, zeroFrictionBtn, kSlider, kValue
    };

    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${name}`);
            return false;
        }
    }
    return true;
}

// Initialize event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Start button
    if (startBtn) {
        console.log('Adding click listener to start button');
        startBtn.onclick = function() {
            console.log('Start button clicked');
            masa = parseFloat(masaSlider.value);
            startSim();
        };
    } else {
        console.error('Start button not found!');
    }

    // Pause/Resume button
    if (pauseResumeBtn) {
        console.log('Adding click listener to pause/resume button');
        pauseResumeBtn.onclick = function() {
            console.log('Pause/Resume button clicked');
            togglePauseResume();
        };
        pauseResumeBtn.disabled = true; // Initially disabled
    } else {
        console.error('Pause/Resume button not found!');
    }

    // Stop button
    if (stopBtn) {
        console.log('Adding click listener to stop button');
        stopBtn.onclick = function() {
            console.log('Stop button clicked');
            stopSim();
        };
        stopBtn.disabled = true; // Initially disabled
    } else {
        console.error('Stop button not found!');
    }

    // Measure button
    if (masoaraBtn) {
        console.log('Adding click listener to measure button');
        masoaraBtn.onclick = function() {
            console.log('Measure button clicked');
            masoara();
        };
    } else {
        console.error('Measure button not found!');
    }

    // Mass slider
    if (masaSlider && masaValue) {
        masaSlider.addEventListener('input', () => {
            try {
                masa = parseFloat(masaSlider.value);
                masaValue.textContent = masa.toFixed(1) + ' kg';
                console.log('Mass changed:', masa);
                if (!running) {
                    drawSpring(x * 80, masa);
                }
            } catch (error) {
                console.error('Error updating mass:', error);
            }
        });
    }

    // Friction slider
    if (frecareSlider && frecareValue) {
        frecareSlider.addEventListener('input', () => {
            try {
                const frecare = parseFloat(frecareSlider.value);
                frecareValue.textContent = frecare.toFixed(2);
                console.log('Friction changed:', frecare);
                if (frecare === 0) {
                    zeroFrictionBtn.classList.add('active');
                } else {
                    zeroFrictionBtn.classList.remove('active');
                }
            } catch (error) {
                console.error('Error updating friction:', error);
            }
        });
    }

    // Spring constant slider
    if (kSlider && kValue) {
        kSlider.addEventListener('input', () => {
            try {
                const k = parseFloat(kSlider.value);
                kValue.textContent = k.toFixed(1) + 'N/m';
                console.log('Spring constant changed:', k);
            } catch (error) {
                console.error('Error updating spring constant:', error);
            }
        });
    }

    // Zero friction button
    if (zeroFrictionBtn) {
        zeroFrictionBtn.addEventListener('click', () => {
            console.log('Zero friction button clicked');
            if (frecareSlider) {
                frecareSlider.value = 0;
                if (frecareValue) {
                    frecareValue.textContent = '0.00';
                }
                zeroFrictionBtn.classList.add('active');
            }
        });
    }
}

// Update animation loop
function animate(timestamp) {
    if (!running || paused) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.016);
    lastTimestamp = timestamp;
    timeElapsed += deltaTime;
    const k = parseFloat(kSlider.value);
    const frecare = parseFloat(frecareSlider.value);
    
    // Hooke + friction
    const Fx = -k * x;
    const F_friction = -frecare * vx;
    const ax = (Fx + F_friction) / masa;
    vx = vx * (1 - frecare * deltaTime) + ax * deltaTime;
    x += vx * deltaTime;
    
    // Boundary conditions
    const maxDisplacement = 2.5;
    const bounceDamping = 0.7;
    if (x > maxDisplacement) { x = maxDisplacement; vx = -vx * bounceDamping; }
    if (x < -maxDisplacement) { x = -maxDisplacement; vx = -vx * bounceDamping; }
    
    // Update measurements if measuring
    if (isMeasuring) updateMeasurements(x, vx);
    
    // Update chart
    if (chart) {
        chart.data.labels.push(timeElapsed.toFixed(1));
        chart.data.datasets[0].data.push(x);
        chart.data.datasets[1].data.push(vx);
        if (chart.data.labels.length > 100) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }
        chart.update('none');
    }
    
    // Draw spring and ball
    drawSpring(x * 80, masa);
    animationFrame = requestAnimationFrame(animate);
}

function updateMeasurements(x, vx) {
    const k = parseFloat(kSlider.value);
    const Fx = -k * x;
    const v = Math.sqrt(vx * vx);
    const Ec = 0.5 * masa * v * v;
    const Ep = 0.5 * k * x * x;
    const Em = Ec + Ep;
    
    const measurements = {
        'masaDisplay': masa.toFixed(1) + ' kg',
        'amplitudineDisplay': Math.abs(x).toFixed(2) + ' m',
        'timpDisplay': timeElapsed.toFixed(2) + ' s',
        'deplasareDisplay': x.toFixed(2) + ' m',
        'vitezaDisplay': v.toFixed(2) + ' m/s',
        'kDisplay': k.toFixed(1) + ' N/m',
        'fortaDisplay': Fx.toFixed(2) + ' N',
        'ecDisplay': Ec.toFixed(2) + ' J',
        'epDisplay': Ep.toFixed(2) + ' J',
        'etDisplay': Em.toFixed(2) + ' J'
    };
    
    for (const [id, value] of Object.entries(measurements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

function resetMeasurements() {
    const elements = {
        'masaDisplay': '-',
        'amplitudineDisplay': '-',
        'timpDisplay': '-',
        'deplasareDisplay': '-',
        'vitezaDisplay': '-',
        'kDisplay': '-',
        'fortaDisplay': '-',
        'ecDisplay': '-',
        'epDisplay': '-',
        'etDisplay': '-'
    };
    for (const [id, defaultValue] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = defaultValue;
    }
    isMeasuring = false;
}

function startSim() {
    console.log('Starting simulation...');
    running = true;
    paused = false;
    t = 0;
    timeElapsed = 0;
    lastTimestamp = 0;
    
    // Initial conditions
    x = 1.0; // Start with 1 meter displacement
    vx = 0;
    
    // Reset measurements
    resetMeasurements();
    
    // Start animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    // Force initial draw
    drawSpring(x * 80, masa);
    
    // Start animation loop
    console.log('Starting animation loop with initial conditions:', { x, vx, masa });
    animationFrame = requestAnimationFrame(animate);
    
    // Update button states
    startBtn.disabled = true;
    pauseResumeBtn.disabled = false;
    stopBtn.disabled = false;
}

function togglePauseResume() {
    if (!running) return;
    
    paused = !paused;
    if (paused) {
        pauseResumeBtn.textContent = 'Reia';
        pauseResumeBtn.classList.add('paused');
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    } else {
        pauseResumeBtn.textContent = 'Pauză';
        pauseResumeBtn.classList.remove('paused');
        lastTimestamp = 0;
        animationFrame = requestAnimationFrame(animate);
    }
}

function stopSim() {
    running = false;
    paused = false;
    t = 0;
    timeElapsed = 0;
    lastTimestamp = 0;
    x = 0;
    vx = 0;
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    // Reset button states
    startBtn.disabled = false;
    pauseResumeBtn.disabled = true;
    stopBtn.disabled = true;
    pauseResumeBtn.textContent = 'Pauză';
    pauseResumeBtn.classList.remove('paused');
    
    // Reset measurements
    resetMeasurements();
    
    // Clear chart
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];
        chart.update();
    }
    
    // Draw initial state
    const mass = parseFloat(masaSlider.value);
    drawSpring(0, mass);
}

function masoara() {
    if (!running) return; // Only measure if simulation is running
    isMeasuring = true;
    
    const mass = parseFloat(masaSlider.value);
    const velocity = Math.sqrt(vx * vx);
    const height = Math.abs(x);
    const Ec = 0.5 * mass * velocity * velocity;
    const Ep = mass * 9.81 * height;
    const Et = Ec + Ep;
    
    document.getElementById('masaDisplay').textContent = mass.toFixed(1) + 'kg';
    document.getElementById('amplitudineDisplay').textContent = Math.abs(x).toFixed(2) + 'm';
    document.getElementById('timpDisplay').textContent = timeElapsed.toFixed(2) + 's';
    document.getElementById('deplasareDisplay').textContent = x.toFixed(2) + 'm';
    document.getElementById('vitezaDisplay').textContent = velocity.toFixed(2) + 'm/s';
    document.getElementById('ecDisplay').textContent = Ec.toFixed(2) + 'J';
    document.getElementById('epDisplay').textContent = Ep.toFixed(2) + 'J';
    document.getElementById('etDisplay').textContent = Et.toFixed(2) + 'J';
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting initialization...');
    
    if (!verifyElements()) {
        console.error('Some required elements are missing!');
        return;
    }
    
    console.log('All elements found, initializing...');
    initializeEventListeners();
    createChart();
    
    // Set initial values
    const initialMass = parseFloat(masaSlider.value);
    masaValue.textContent = initialMass.toFixed(1) + 'kg';
    frecareValue.textContent = frecareSlider ? frecareSlider.value : '0.00';
    
    // Initial draw
    console.log('Performing initial draw...');
    drawSpring(0, initialMass);
    
    console.log('Initialization complete!');
}); 