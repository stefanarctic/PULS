document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const toggleSidebar = document.getElementById("toggleSidebar");
    const sidebarleft = document.getElementById("sidebarleft");
    const toggleSidebarleft = document.getElementById("toggleSidebarleft");

    toggleSidebar.addEventListener("click", function () {
        sidebar.classList.toggle("visible");
    });

    toggleSidebarleft.addEventListener("click", function () {
        sidebarleft.classList.toggle("visible");
    });

    // Initializare valori slidere
    document.getElementById('m1Value').innerText = document.getElementById('m1').value;
    document.getElementById('m2Value').innerText = document.getElementById('m2').value;
    document.getElementById('v1Value').innerText = document.getElementById('v1').value;
    document.getElementById('v2Value').innerText = document.getElementById('v2').value;
    document.getElementById('sizeValue').innerText = document.getElementById('size').value;
    document.getElementById('speedValue').innerText = document.getElementById('speed').value;

    // Set initial ball sizes
    let initialSize = parseInt(document.getElementById('size').value);
    ball1.style.width = initialSize + 'px';
    ball1.style.height = initialSize + 'px';
    ball2.style.width = initialSize + 'px';
    ball2.style.height = initialSize + 'px';
    ball1.style.lineHeight = initialSize + 'px';
    ball2.style.lineHeight = initialSize + 'px';

    // Set initial positions
    pos1 = 0;
    let simulatorWidth = document.getElementById('simulator').offsetWidth;
    pos2 = simulatorWidth - initialSize;
    ball1.style.left = pos1 + 'px';
    ball2.style.left = pos2 + 'px';

    // Inițializează graficul
    initializeChart();
});

let ball1 = document.getElementById('ball1');
let ball2 = document.getElementById('ball2');
let info = document.getElementById('info');

let m1Slider = document.getElementById('m1');
let m2Slider = document.getElementById('m2');
let v1Slider = document.getElementById('v1');
let v2Slider = document.getElementById('v2');
let sizeSlider = document.getElementById('size');
let speedSlider = document.getElementById('speed');
let color1Picker = document.getElementById('color1');
let color2Picker = document.getElementById('color2');

let collisionHappened = false;

// Constants for unit conversion
const PIXELS_TO_METERS = 0.01;  // 100px = 1m
const FRAMES_TO_SECONDS = 1/60; // 60fps
const METERS_TO_PIXELS = 100;   // 1m = 100px

// Convert m/s to px/frame for animation
function metersPerSecondToPixelsPerFrame(mps) {
    return mps * METERS_TO_PIXELS * FRAMES_TO_SECONDS;
}

// Convert px/frame to m/s for display
function pixelsPerFrameToMetersPerSecond(pxf) {
    return pxf / (METERS_TO_PIXELS * FRAMES_TO_SECONDS);
}

let m1 = parseInt(m1Slider.value), m2 = parseInt(m2Slider.value);
let v1 = parseInt(v1Slider.value), v2 = parseInt(v2Slider.value);
let size = parseInt(sizeSlider.value);
let speed = parseFloat(speedSlider.value);

m1Slider.addEventListener('input', function() {
    m1 = parseInt(this.value);
    document.getElementById('m1Value').innerText = this.value;
});

m2Slider.addEventListener('input', function() {
    m2 = parseInt(this.value);
    document.getElementById('m2Value').innerText = this.value;
});

v1Slider.addEventListener('input', function() {
    v1 = metersPerSecondToPixelsPerFrame(parseFloat(this.value));
    document.getElementById('v1Value').innerText = this.value;
});

v2Slider.addEventListener('input', function() {
    v2 = metersPerSecondToPixelsPerFrame(parseFloat(this.value));
    document.getElementById('v2Value').innerText = this.value;
});

sizeSlider.addEventListener('input', function() {
    size = parseInt(this.value);
    let simulatorWidth = document.getElementById('simulator').offsetWidth;
    
    // Update ball sizes
    ball1.style.width = size + 'px';
    ball1.style.height = size + 'px';
    ball2.style.width = size + 'px';
    ball2.style.height = size + 'px';
    ball1.style.lineHeight = size + 'px';
    ball2.style.lineHeight = size + 'px';
    
    // Update ball 2 position if simulation is not running
    if (!isRunning) {
        pos2 = simulatorWidth - size;
        ball2.style.left = pos2 + 'px';
    }
    
    document.getElementById('sizeValue').innerText = this.value;
});

speedSlider.addEventListener('input', function() {
    speed = parseFloat(this.value);
    document.getElementById('speedValue').innerText = this.value;
});

color1Picker.addEventListener('input', function() {
    ball1.style.background = this.value;
});

color2Picker.addEventListener('input', function() {
    ball2.style.background = this.value;
});


let pos1 = 0;
let pos2 = 920;

let animationFrame;
let isRunning = false; 
let isPaused = false;
let showMeasurements = false;
let physicsChart;
let chartData = {
    labels: [],
    p1: [],
    p2: [],
    pTotal: [],
    energy: []
};

function initializeChart() {
    const ctx = document.getElementById('physicsChart').getContext('2d');
    physicsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Impuls Bila 1 (kg·px/frame)',
                    data: [],
                    borderColor: '#13c79a',
                    backgroundColor: 'rgba(19, 199, 154, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Impuls Bila 2 (kg·px/frame)',
                    data: [],
                    borderColor: '#c75513',
                    backgroundColor: 'rgba(199, 85, 19, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Impuls Total (kg·px/frame)',
                    data: [],
                    borderColor: '#3455d3',
                    backgroundColor: 'rgba(52, 85, 211, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Energie Totală (J)',
                    data: [],
                    borderColor: '#d34555',
                    backgroundColor: 'rgba(211, 69, 85, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        boxWidth: 20,
                        boxHeight: 12,
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            return datasets.map((ds, i) => {
                                const value = ds.data.length > 0 ? ds.data[ds.data.length - 1] : '-';
                                return {
                                    text: `${ds.label}: ${value}`,
                                    fillStyle: ds.backgroundColor,
                                    strokeStyle: ds.borderColor,
                                    lineWidth: 2,
                                    hidden: !chart.isDatasetVisible(i),
                                    index: i
                                };
                            });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 0.1,
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function updateChart() {
    const physics = calculatePhysicsInfo();
    
    // Limitează numărul de puncte pentru a menține performanța
    if (chartData.labels.length > 50) {
        chartData.labels.shift();
        chartData.p1.shift();
        chartData.p2.shift();
        chartData.pTotal.shift();
        chartData.energy.shift();
    }

    // Adaugă noile date
    chartData.labels.push('');
    chartData.p1.push(parseFloat(physics.p1));
    chartData.p2.push(parseFloat(physics.p2));
    chartData.pTotal.push(parseFloat(physics.pTotal));
    chartData.energy.push(parseFloat(physics.ETotal));

    // Actualizează graficul
    physicsChart.data.labels = chartData.labels;
    physicsChart.data.datasets[0].data = chartData.p1;
    physicsChart.data.datasets[1].data = chartData.p2;
    physicsChart.data.datasets[2].data = chartData.pTotal;
    physicsChart.data.datasets[3].data = chartData.energy;
    physicsChart.update();
}

function toggleMeasurements() {
    showMeasurements = !showMeasurements;
    const button = document.getElementById('measurementsButton');
    button.innerText = showMeasurements ? 'Ascunde Măsurători' : 'Arată Măsurători';
    if (!showMeasurements) {
        info.innerText = '';
    }
}
function hasCollided() {
    return pos1 < pos2 + size && pos1 + size > pos2;
}



function calculatePhysicsInfo() {
    // Convert pixels to meters (assuming 100px = 1m for educational purposes)
    const PIXELS_TO_METERS = 0.01;
    // Convert frames to seconds (assuming 60fps)
    const FRAMES_TO_SECONDS = 1/60;

    // Convert velocities from px/frame to m/s
    let v1_mps = v1 * PIXELS_TO_METERS / FRAMES_TO_SECONDS;
    let v2_mps = v2 * PIXELS_TO_METERS / FRAMES_TO_SECONDS;

    // Calculează impulsul (p = m * v) in kg·m/s
    let p1 = m1 * v1_mps;
    let p2 = m2 * v2_mps;
    let pTotal = p1 + p2;

    // Calculează energia cinetică (E = 1/2 * m * v^2) in Joules
    let E1 = 0.5 * m1 * v1_mps * v1_mps;
    let E2 = 0.5 * m2 * v2_mps * v2_mps;
    let ETotal = E1 + E2;

    // Calculează forța (F = m * a) in Newtons
    // Pentru simplitate, considerăm Δt = 1 frame
    let F1 = m1 * v1_mps / FRAMES_TO_SECONDS;
    let F2 = m2 * v2_mps / FRAMES_TO_SECONDS;
    let FTotal = F1 + F2;

        if (hasCollided() && !collisionHappened) {
        pTotal /= 2;
        ETotal /= 2;
        collisionHappened = true;
    }

    return {
        p1: p1.toFixed(2),
        p2: p2.toFixed(2),
        pTotal: pTotal.toFixed(2),
        v1: v1_mps.toFixed(2),
        v2: v2_mps.toFixed(2),
        E1: E1.toFixed(2),
        E2: E2.toFixed(2),
        ETotal: ETotal.toFixed(2),
        F1: F1.toFixed(2),
        F2: F2.toFixed(2),
        FTotal: FTotal.toFixed(2)
    };
}

function updateMeasurements() {
    if (!showMeasurements) {
        info.innerHTML = '';
        return;
    }

    const physics = calculatePhysicsInfo();

    // Create main container
    const container = document.createElement('div');
    container.style.textAlign = 'left';
    container.style.padding = '15px';
    container.style.backgroundColor = '#FAEDCD';
    container.style.borderRadius = '5px';
    container.style.border = '1px solid #333';
    container.style.width = '90%';

    // Create title
    const title = document.createElement('h3');
    title.style.color = '#333';
    title.style.marginBottom = '10px';
    title.innerText = 'Măsurători:';
    container.appendChild(title);

    // Function to create measurement block
    function createMeasurementBlock(ballNumber, v, p, E, F) {
        const block = document.createElement('div');
        block.style.marginBottom = '15px';

        const ballTitle = document.createElement('p');
        ballTitle.style.fontWeight = 'bold';
        ballTitle.style.color = '#333';
        ballTitle.innerText = `Bila ${ballNumber}:`;
        block.appendChild(ballTitle);

        const list = document.createElement('ul');
        list.style.listStyleType = 'none';
        list.style.paddingLeft = '10px';

        const velocityItem = document.createElement('li');
        velocityItem.innerText = `Viteză: ${v} m/s`;
        list.appendChild(velocityItem);

        const impulseItem = document.createElement('li');
        impulseItem.innerText = `Impuls: ${p} kg·m/s`;
        list.appendChild(impulseItem);

        const energyItem = document.createElement('li');
        energyItem.innerText = `Energie cinetică: ${E} J`;
        list.appendChild(energyItem);

        const forceItem = document.createElement('li');
        forceItem.innerText = `Forță: ${F} N`;
        list.appendChild(forceItem);

        block.appendChild(list);
        return block;
    }

    // Create measurement blocks for ball 1 and ball 2
    const ball1Block = createMeasurementBlock(1, physics.v1, physics.p1, physics.E1, physics.F1);
    const ball2Block = createMeasurementBlock(2, physics.v2, physics.p2, physics.E2, physics.F2);
    container.appendChild(ball1Block);
    container.appendChild(ball2Block);

    // Create total measurement block
    const totalBlock = document.createElement('div');
    const totalTitle = document.createElement('p');
    totalTitle.style.fontWeight = 'bold';
    totalTitle.style.color = '#333';
    totalTitle.innerText = 'Total:';
    totalBlock.appendChild(totalTitle);

    const totalList = document.createElement('ul');
    totalList.style.listStyleType = 'none';
    totalList.style.paddingLeft = '10px';

    const totalImpulseItem = document.createElement('li');
    totalImpulseItem.innerText = `Impuls total: ${physics.pTotal} kg·m/s`;
    totalList.appendChild(totalImpulseItem);

    const totalEnergyItem = document.createElement('li');
    totalEnergyItem.innerText = `Energie totală: ${physics.ETotal} J`;
    totalList.appendChild(totalEnergyItem);

    const totalForceItem = document.createElement('li');
    totalForceItem.innerText = `Forţa totală: ${physics.FTotal} J`;
    totalList.appendChild(totalForceItem);

    totalBlock.appendChild(totalList);
    container.appendChild(totalBlock);

    // Clear existing content and append the new container
    info.innerHTML = '';
    info.appendChild(container);
}

function pauseResumeSimulation() {
    if (isRunning) {
        if (!isPaused) {
            cancelAnimationFrame(animationFrame);
            isPaused = true;
            document.getElementById('pauseResumeButton').innerText = 'Resume';
            if (!showMeasurements) {
                info.innerText = "Simulare în pauză.";
            }
        } else {
            animate();
            collisionHappened = false;
            isPaused = false;
            document.getElementById('pauseResumeButton').innerText = 'Pauză';
            if (!showMeasurements) {
                info.innerText = "Simulare reluată.";
            }
        }
    }
}

function startSimulation() {
    cancelAnimationFrame(animationFrame);
    
    // Reset positions
    pos1 = 0;
    let simulatorWidth = document.getElementById('simulator').offsetWidth;
    pos2 = simulatorWidth - size;
    ball1.style.left = pos1 + 'px';
    ball2.style.left = pos2 + 'px';

    // Reset velocities (convert from m/s to px/frame)
    m1 = parseInt(m1Slider.value);
    m2 = parseInt(m2Slider.value);
    v1 = metersPerSecondToPixelsPerFrame(parseFloat(v1Slider.value));
    v2 = metersPerSecondToPixelsPerFrame(parseFloat(v2Slider.value));
    size = parseInt(sizeSlider.value);
    speed = parseFloat(speedSlider.value);

    // Set ball sizes
    ball1.style.width = size + 'px';
    ball1.style.height = size + 'px';
    ball2.style.width = size + 'px';
    ball2.style.height = size + 'px';
    ball1.style.lineHeight = size + 'px';
    ball2.style.lineHeight = size + 'px';

    info.innerText = '';

    // Resetează datele graficului
    chartData.labels = [];
    chartData.p1 = [];
    chartData.p2 = [];
    chartData.pTotal = [];
    chartData.energy = [];
    
    if (physicsChart) {
        physicsChart.data.labels = [];
        physicsChart.data.datasets[0].data = [];
        physicsChart.data.datasets[1].data = [];
        physicsChart.data.datasets[2].data = [];
        physicsChart.data.datasets[3].data = [];
        physicsChart.update();
    }

    isRunning = true;
    isPaused = false;
    document.getElementById('pauseResumeButton').innerText = 'Pauză';

    animate();
}

function stopSimulation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    isRunning = false;
    isPaused = false;
    
    // Reset positions
    pos1 = 0;
    let simulatorWidth = document.getElementById('simulator').offsetWidth;
    pos2 = simulatorWidth - size;
    ball1.style.left = pos1 + 'px';
    ball2.style.left = pos2 + 'px';
    
    // Reset velocities (convert from m/s to px/frame)
    v1 = metersPerSecondToPixelsPerFrame(parseFloat(v1Slider.value));
    v2 = metersPerSecondToPixelsPerFrame(parseFloat(v2Slider.value));
    
    // Reset ball sizes
    size = parseInt(sizeSlider.value);
    ball1.style.width = size + 'px';
    ball1.style.height = size + 'px';
    ball2.style.width = size + 'px';
    ball2.style.height = size + 'px';
    ball1.style.lineHeight = size + 'px';
    ball2.style.lineHeight = size + 'px';
    
    info.innerText = '';
    
    // Resetează datele graficului
    chartData.labels = [];
    chartData.p1 = [];
    chartData.p2 = [];
    chartData.pTotal = [];
    chartData.energy = [];
    
    if (physicsChart) {
        physicsChart.data.labels = [];
        physicsChart.data.datasets[0].data = [];
        physicsChart.data.datasets[1].data = [];
        physicsChart.data.datasets[2].data = [];
        physicsChart.data.datasets[3].data = [];
        physicsChart.update();
    }
}

function animate() {
    pos1 += v1 * speed;
    pos2 += v2 * speed;

    let simulatorWidth = document.getElementById('simulator').offsetWidth;

    // Coliziune cu peretele stâng pentru bila 1
    if (pos1 < 0) {
        pos1 = 0;
        v1 = Math.abs(v1);
    }

    // Coliziune cu peretele drept pentru bila 1
    if (pos1 + size > simulatorWidth) {
        pos1 = simulatorWidth - size;
        v1 = -Math.abs(v1);
    }

    // Coliziune cu peretele stâng pentru bila 2
    if (pos2 < 0) {
        pos2 = 0;
        v2 = Math.abs(v2);
    }

    // Coliziune cu peretele drept pentru bila 2
    if (pos2 + size > simulatorWidth) {
        pos2 = simulatorWidth - size;
        v2 = -Math.abs(v2);
    }

    // Verifică coliziunea între bile
    if (pos1 + size >= pos2) {
        // Calculează viteza finală comună folosind conservarea impulsului
        let vFinal = (m1 * v1 + m2 * v2) / (m1 + m2);
        
        // Ajustează pozițiile pentru a preveni suprapunerea
        pos1 = pos2 - size;
        
        // Actualizează vitezele pentru ambele bile
        v1 = vFinal;
        v2 = vFinal;
        
        if (!showMeasurements) {
            info.innerText = `Coliziune inelastică! Viteza finală comună: ${vFinal.toFixed(2)} px/frame`;
        }
    }

    ball1.style.left = pos1 + 'px';
    ball2.style.left = pos2 + 'px';

    updateMeasurements();
    updateChart();
    animationFrame = requestAnimationFrame(animate);
}

function moveTogether(startPos, vFinal) {
    let currentPos = startPos;
    function move() {
        currentPos += vFinal * speed;
        ball1.style.left = currentPos + 'px';
        ball2.style.left = currentPos + size + 'px';
        animationFrame = requestAnimationFrame(move);
    }
    move();
}
