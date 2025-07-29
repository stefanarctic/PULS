// DOM elements
const themeSwitcher = document.getElementById('themeSwitcher');
const body = document.body;
const springSVG = document.getElementById('springSVG');
const amplitudineSlider = document.getElementById('amplitudine');
const amplitudineValue = document.getElementById('amplitudineValue');
const vitezaSlider = document.getElementById('viteza');
const vitezaValue = document.getElementById('vitezaValue');
const masaSlider = document.getElementById('masa');
const masaValue = document.getElementById('masaValue');
const startBtn = document.getElementById('startBtn');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const stopBtn = document.getElementById('stopBtn');
const masoaraBtn = document.getElementById('masoaraBtn');
const frecareSlider = document.getElementById('frecare');
const frecareValue = document.getElementById('frecareValue');
const zeroFrictionBtn = document.getElementById('zeroFrictionBtn');
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
let amplitudine = parseInt(amplitudineSlider.value, 10);
let viteza = parseInt(vitezaSlider.value, 10);
let masa = parseFloat(masaSlider.value);
let x = 0;
let v = 0;
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
    if (chart) chart.destroy();
    chart = new Chart(chartCtx, {
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
    });
}

// Draw spring function
function drawSpring(xPx, mass) {
    springSVG.innerHTML = '';
    const baseX = 200, baseY = 40;
    const endY = 340 + xPx;
    const coilRadius = 30;
    const numCoils = 12;
    const coilLength = endY - baseY - 40;
    const coilSpacing = coilLength / numCoils;
    
    // Create smooth path for spring
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M${baseX},${baseY}`; // Start at top
    
    // Create smooth sine wave for spring
    const amplitude = coilRadius;
    const frequency = Math.PI * numCoils;
    const points = 100; // More points for smoother curve
    
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const y = baseY + t * coilLength;
        const phase = t * frequency;
        const x = baseX + Math.sin(phase) * amplitude;
        
        if (i === 0) {
            d += ` L${x},${y}`;
        } else {
            d += ` L${x},${y}`;
        }
    }
    
    // End at bottom center
    d += ` L${baseX},${endY}`;
    
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#222');
    path.setAttribute('stroke-width', '6');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    springSVG.appendChild(path);
    
    // Draw anchor
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    anchor.setAttribute('x', baseX - 80);
    anchor.setAttribute('y', baseY - 10);
    anchor.setAttribute('width', 160);
    anchor.setAttribute('height', 8);
    anchor.setAttribute('fill', '#444');
    anchor.setAttribute('rx', '4');
    springSVG.appendChild(anchor);
    
    // Draw weight with size based on mass
    const weight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    weight.setAttribute('cx', baseX);
    weight.setAttribute('cy', endY + 40);
    const radius = 40 + (mass - 1) * 2;
    weight.setAttribute('r', radius);
    weight.setAttribute('fill', 'silver');
    weight.setAttribute('stroke', '#444');
    weight.setAttribute('stroke-width', '4');
    springSVG.appendChild(weight);
    
    // Set a fixed height for the SVG to prevent scrollbar
    springSVG.setAttribute('height', '400');
    springSVG.style.height = '400px';
    springSVG.style.overflow = 'visible';
}

// Add elastic constant slider event listener
const kSlider = document.getElementById('k');
const kValue = document.getElementById('kValue');

kSlider.addEventListener('input', () => {
    const k = parseFloat(kSlider.value);
    kValue.textContent = k.toFixed(1) + 'N/m';
    // The effect of k is already handled in the animate function
});

// Add friction slider event listener
frecareSlider.addEventListener('input', () => {
    const frecare = parseFloat(frecareSlider.value);
    frecareValue.textContent = frecare.toFixed(2);
    if (frecare === 0) {
        zeroFrictionBtn.classList.add('active');
    } else {
        zeroFrictionBtn.classList.remove('active');
    }
});

// Add zero friction button event listener
zeroFrictionBtn.addEventListener('click', () => {
    frecareSlider.value = 0;
    frecareValue.textContent = '0.00';
    zeroFrictionBtn.classList.add('active');
    
    // If simulation is running, update the animation
    if (running) {
        // Reset time to prevent sudden jumps
        timeElapsed = 0;
        // Force a redraw of the spring
        const mass = parseFloat(masaSlider.value);
        drawSpring(x, mass);
    }
});

// Update animation loop to use k value and friction
function animate(timestamp) {
    if (!running || paused) return;
    
    // Calculate time delta for smooth animation regardless of frame rate
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
    lastTimestamp = timestamp;
    
    t++;
    timeElapsed += deltaTime;
    
    // Get current k value and friction coefficient
    const k = parseFloat(kSlider.value);
    const frecare = parseFloat(frecareSlider.value);
    
    // Oscillation with damping: x(t) = A * e^(-bt) * sin(omega * t)
    const omega = Math.min(viteza / 20 * 2 * Math.PI, 10); // Limit maximum angular velocity
    const dampingFactor = frecare * 2; // scale damping effect
    
    // Calculate damped oscillation with smoother limiting
    const damping = frecare === 0 ? 1 : Math.exp(-dampingFactor * timeElapsed); // No damping when friction is 0
    const baseX = amplitudine * damping * Math.sin(omega * timeElapsed);
    
    // Apply elastic constant effect with smoother limiting
    const kEffect = Math.min((k - 1) / 40, 1); // Limit maximum k effect
    x = baseX * (1 / (1 + kEffect));
    
    // Calculate velocity with damping and smoother limiting
    v = amplitudine * damping * (
        omega * Math.cos(omega * timeElapsed) - 
        (frecare === 0 ? 0 : dampingFactor * Math.sin(omega * timeElapsed))
    ) * (1 / (1 + kEffect));
    
    // Prevent spring from going above anchor by smoothly limiting the upward movement
    if (x < 0) {
        const limit = -150; // Maximum upward movement
        const ratio = Math.abs(x) / Math.abs(limit);
        if (ratio > 1) {
            x = limit * (2 - 1/ratio); // Smooth limiting function
            v *= (1 - (ratio - 1)); // Reduce velocity near limits
        }
    }
    
    // Prevent spring from going too far down
    const lowerLimit = 300; // Maximum downward movement
    if (x > lowerLimit) {
        const ratio = x / lowerLimit;
        if (ratio > 1) {
            x = lowerLimit * (2 - 1/ratio); // Smooth limiting function
            v *= (1 - (ratio - 1)); // Reduce velocity near limits
        }
    }
    
    // Get current mass
    const mass = parseFloat(masaSlider.value);
    
    // Calculate energies
    const g = 9.81; // gravitational acceleration
    const height = Math.abs(x / 100); // convert to meters
    const velocity = Math.abs(v / 100); // convert to m/s
    
    const Ec = 0.5 * mass * velocity * velocity;
    const Ep = mass * g * height;
    const Et = Ec + Ep;
    
    drawSpring(x, mass);
    
    // Update measurements
    document.getElementById('masaDisplay').textContent = mass.toFixed(1) + 'kg';
    document.getElementById('amplitudineDisplay').textContent = (amplitudine / 100).toFixed(2) + 'm';
    document.getElementById('timpDisplay').textContent = timeElapsed.toFixed(2) + 's';
    document.getElementById('deplasareDisplay').textContent = (x / 100).toFixed(2) + 'm';
    document.getElementById('vitezaDisplay').textContent = velocity.toFixed(2) + 'm/s';
    document.getElementById('ecDisplay').textContent = Ec.toFixed(2) + 'J';
    document.getElementById('epDisplay').textContent = Ep.toFixed(2) + 'J';
    document.getElementById('etDisplay').textContent = Et.toFixed(2) + 'J';
    
    // Chart update every frame for smoother velocity tracking
    chart.data.labels.push(timeElapsed.toFixed(2));
    chart.data.datasets[0].data.push((x / 100).toFixed(2));
    chart.data.datasets[1].data.push(velocity.toFixed(2));
    if (chart.data.labels.length > 40) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }
    chart.update('none');
    
    // Stop animation if amplitude becomes very small due to damping
    if (Math.abs(x) < 0.1 && Math.abs(v) < 0.1 && frecare > 0) {
        running = false;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        return;
    }
    
    animationFrame = requestAnimationFrame(animate);
}

function startSim() {
    running = true;
    paused = false;
    t = 0;
    timeElapsed = 0;
    lastTimestamp = 0; // Reset timestamp
    x = 0;
    v = 0;
    // Reset measurements when starting
    resetMeasurements();
    animationFrame = requestAnimationFrame(animate);
}

function resetMeasurements() {
    document.getElementById('masaDisplay').textContent = '-';
    document.getElementById('amplitudineDisplay').textContent = '-';
    document.getElementById('timpDisplay').textContent = '-';
    document.getElementById('deplasareDisplay').textContent = '-';
    document.getElementById('vitezaDisplay').textContent = '-';
    document.getElementById('ecDisplay').textContent = '-';
    document.getElementById('epDisplay').textContent = '-';
    document.getElementById('etDisplay').textContent = '-';
    isMeasuring = false;
}

function togglePauseResume() {
    if (!running) return;
    paused = !paused;
    if (paused) {
        pauseResumeBtn.textContent = 'Reia';
        pauseResumeBtn.classList.add('paused');
        if (animationFrame) cancelAnimationFrame(animationFrame);
    } else {
        pauseResumeBtn.textContent = 'Pauză';
        pauseResumeBtn.classList.remove('paused');
        lastTimestamp = 0; // Reset timestamp when resuming
        animationFrame = requestAnimationFrame(animate);
    }
}

function stopSim() {
    running = false;
    paused = false;
    t = 0;
    timeElapsed = 0;
    lastTimestamp = 0; // Reset timestamp
    x = 0;
    v = 0;
    pauseResumeBtn.textContent = 'Pauză';
    pauseResumeBtn.classList.remove('paused');
    if (animationFrame) cancelAnimationFrame(animationFrame);
    const mass = parseFloat(masaSlider.value);
    drawSpring(0, mass);
    
    // Reset measurements when stopping
    resetMeasurements();
    
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    chart.update();
}

function masoara() {
    if (!running) return; // Only measure if simulation is running
    isMeasuring = true;
    
    const mass = parseFloat(masaSlider.value);
    const velocity = Math.abs(v / 100);
    const height = Math.abs(x / 100);
    const Ec = 0.5 * mass * velocity * velocity;
    const Ep = mass * g * height;
    const Et = Ec + Ep;
    
    document.getElementById('masaDisplay').textContent = mass.toFixed(1) + 'kg';
    document.getElementById('amplitudineDisplay').textContent = (amplitudine / 100).toFixed(2) + 'm';
    document.getElementById('timpDisplay').textContent = timeElapsed.toFixed(2) + 's';
    document.getElementById('deplasareDisplay').textContent = (x / 100).toFixed(2) + 'm';
    document.getElementById('vitezaDisplay').textContent = velocity.toFixed(2) + 'm/s';
    document.getElementById('ecDisplay').textContent = Ec.toFixed(2) + 'J';
    document.getElementById('epDisplay').textContent = Ep.toFixed(2) + 'J';
    document.getElementById('etDisplay').textContent = Et.toFixed(2) + 'J';
}

// Event listeners
amplitudineSlider.addEventListener('input', () => {
    amplitudine = parseInt(amplitudineSlider.value, 10);
    amplitudineValue.textContent = (amplitudine / 100).toFixed(2) + 'm';
});

vitezaSlider.addEventListener('input', () => {
    viteza = parseInt(vitezaSlider.value, 10);
    vitezaValue.textContent = viteza + 'x';
});

masaSlider.addEventListener('input', () => {
    masa = parseFloat(masaSlider.value);
    masaValue.textContent = masa.toFixed(1) + 'kg';
    if (!running) {
        drawSpring(x, masa);
    }
});

startBtn.addEventListener('click', startSim);
pauseResumeBtn.addEventListener('click', togglePauseResume);
stopBtn.addEventListener('click', stopSim);
masoaraBtn.addEventListener('click', masoara);

// Initial setup
createChart();
const initialMass = parseFloat(masaSlider.value);
amplitudineValue.textContent = (amplitudine / 100).toFixed(2) + 'm';
vitezaValue.textContent = viteza + 'x';
masaValue.textContent = initialMass.toFixed(1) + 'kg';
frecareValue.textContent = frecareSlider.value;
drawSpring(0, initialMass); 