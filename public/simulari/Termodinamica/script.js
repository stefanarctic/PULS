const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const toggleValveButton = document.getElementById('toggleValveButton');
const divider = document.getElementById('divider');
const temp1Slider = document.getElementById('temp1');
const temp2Slider = document.getElementById('temp2');
const molarMass1Slider = document.getElementById('molarMass1');
const molarMass2Slider = document.getElementById('molarMass2');
const numLeftSlider = document.getElementById('numMolecules1');
const numRightSlider = document.getElementById('numMolecules2');
const temp1Value = document.getElementById('temp1Value');
const temp2Value = document.getElementById('temp2Value');
const molarMass1Value = document.getElementById('molarMass1Value');
const molarMass2Value = document.getElementById('molarMass2Value');
const numLeftValue = document.getElementById('numMolecules1Value');
const numRightValue = document.getElementById('numMolecules2Value');
const tableNumLeft = document.getElementById('tableNumLeft');
const tableNumRight = document.getElementById('tableNumRight');
const tableTempLeft = document.getElementById('tableTempLeft');
const tableTempRight = document.getElementById('tableTempRight');
const tableMasaLeft = document.getElementById('tableMasaLeft');
const tableMasaRight = document.getElementById('tableMasaRight');
const tablePresiune = document.getElementById('tablePresiune');
const restartButton = document.getElementById('restartButton');
const molarMassGlobalSlider = document.getElementById('molarMassGlobal');
const molarMassGlobalValue = document.getElementById('molarMassGlobalValue');
const tableMasaGlobal = document.getElementById('tableMasaGlobal');

const RADIUS = 8;
let molecules = [];
let valveOpen = false;
let dividerHeight = 1.0; // 1.0 = complet, 0.0 = tras complet jos
let dividerAnimating = false;
let isVesselBroken = false;
let escapeHole = null;

function getColor(type, temp) {
    let base = type === 1 ? [231,76,60] : [41,128,219];
    let factor = 1 - Math.min(1, Math.max(0, (temp-100)/900)) * 0.7;
    let rgb = base.map(v => Math.round(v*factor));
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

function getRadius(mass) {
    // Moleculele devin mai mari la masă molară mare (ex: 2g/mol = 7px, 40g/mol = 20px)
    return 7 + (mass-2)*0.5;
}

function randomVelocity(temp, mass) {
    // viteza scade cu sqrt(masa molara)
    let v = Math.sqrt(temp)/Math.sqrt(mass)*1.5;
    let a = Math.random()*2*Math.PI;
    return {vx: v*Math.cos(a), vy: v*Math.sin(a)};
}

function createMolecules() {
    molecules = [];
    let n1 = Math.max(1, Math.round(Number(numLeftSlider.value)));
    let n2 = Math.max(1, Math.round(Number(numRightSlider.value)));
    let t1 = Number(temp1Slider.value);
    let t2 = Number(temp2Slider.value);
    let mass1 = Number(molarMass1Slider.value);
    let mass2 = Number(molarMass2Slider.value);
    let r1 = getRadius(mass1);
    let r2 = getRadius(mass2);
    for(let i=0;i<n1;i++) {
        let x = Math.random()*(canvas.width/2-2*r1)+r1;
        let y = Math.random()*(canvas.height-2*r1)+r1;
        let {vx,vy} = randomVelocity(t1, mass1);
        molecules.push({x,y,vx,vy,type:1,temp:t1,color:getColor(1,t1),mass:mass1,radius:r1});
    }
    for(let i=0;i<n2;i++) {
        let x = Math.random()*(canvas.width/2-2*r2)+canvas.width/2+r2;
        let y = Math.random()*(canvas.height-2*r2)+r2;
        let {vx,vy} = randomVelocity(t2, mass2);
        molecules.push({x,y,vx,vy,type:2,temp:t2,color:getColor(2,t2),mass:mass2,radius:r2});
    }
    isVesselBroken = false;
    escapeHole = null;
}

function canPassDivider(m) {
    return valveOpen && dividerHeight <= 0.01;
}

function updateMoleculePositions() {
    for(let m of molecules) {
        m.x += m.vx;
        m.y += m.vy;
        let r = m.radius;
        if(!isVesselBroken) {
            if(m.x<r) { m.x=r; m.vx*=-1; }
            if(m.x>canvas.width-r) { m.x=canvas.width-r; m.vx*=-1; }
            if(m.y<r) { m.y=r; m.vy*=-1; }
            if(m.y>canvas.height-r) { m.y=canvas.height-r; m.vy*=-1; }
            if(!canPassDivider(m)) {
                if(m.type===1 && m.x > canvas.width/2 - r) {
                    m.x = canvas.width/2 - r;
                    m.vx = -Math.abs(m.vx);
                }
                if(m.type===2 && m.x < canvas.width/2 + r) {
                    m.x = canvas.width/2 + r;
                    m.vx = Math.abs(m.vx);
                }
            }
        } else if(escapeHole && Math.abs(m.x-canvas.width/2)<10 && Math.abs(m.y-escapeHole.y)<escapeHole.r) {
            m.vx += (Math.random()-0.5)*0.5 + 2*Math.sign(m.x-canvas.width/2);
            m.vy += (Math.random()-0.5)*0.5;
        }
    }
    handleCollisions();
}

function handleCollisions() {
    for (let i = 0; i < molecules.length; i++) {
        for (let j = i + 1; j < molecules.length; j++) {
            let a = molecules[i], b = molecules[j];
            let dx = b.x - a.x, dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let minDist = a.radius + b.radius;
            if (dist < minDist) {
                let overlap = minDist - dist;
                let nx = dx / dist, ny = dy / dist;
                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;
                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;
                let dvx = b.vx - a.vx;
                let dvy = b.vy - a.vy;
                let impactSpeed = dvx * nx + dvy * ny;
                if (impactSpeed < 0) {
                    let impulse = 2 * impactSpeed / 2;
                    a.vx += impulse * nx;
                    a.vy += impulse * ny;
                    b.vx -= impulse * nx;
                    b.vy -= impulse * ny;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(dividerHeight > 0.01) {
        ctx.fillStyle = 'rgba(100,100,100,0.18)';
        ctx.fillRect(canvas.width/2-2,0,4,canvas.height*dividerHeight);
    }
    if(isVesselBroken && escapeHole) {
        ctx.beginPath();
        ctx.arc(canvas.width/2, escapeHole.y, escapeHole.r, 0, 2*Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fill();
    }
    for(let m of molecules) {
        ctx.beginPath();
        ctx.arc(m.x,m.y,m.radius,0,2*Math.PI);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function calcPresiune() {
    // Dacă valva e închisă, calculez presiunea separat pe fiecare jumătate și afișez media lor
    if (!valveOpen || dividerHeight > 0.01) {
        let left = molecules.filter(m => m.x < canvas.width/2);
        let right = molecules.filter(m => m.x >= canvas.width/2);
        let p1 = left.length ? left.reduce((s,m)=>s+Math.abs(m.vx)+Math.abs(m.vy),0)/left.length : 0;
        let p2 = right.length ? right.reduce((s,m)=>s+Math.abs(m.vx)+Math.abs(m.vy),0)/right.length : 0;
        return ((p1+p2)/2).toFixed(2);
    } else {
        let total = 0;
        for(let m of molecules) total += Math.abs(m.vx)+Math.abs(m.vy);
        return (total/molecules.length).toFixed(2);
    }
}

function checkBreak() {
    if (!valveOpen || dividerHeight > 0.01) return;
    let vesselArea = canvas.width * canvas.height;
    let totalArea = molecules.reduce((s, m) => s + Math.PI * m.radius * m.radius, 0);
    let density = totalArea / vesselArea;
    // Energia cinetică medie (m = masa molară, v = viteza)
    let energy = molecules.reduce((s, m) => s + 0.5 * m.mass * (m.vx * m.vx + m.vy * m.vy), 0) / molecules.length;
    // Sparge dacă densitatea e mare și energia e mare
    if (density > 0.35 && energy > 80 && !isVesselBroken) {
        isVesselBroken = true;
        escapeHole = {y:canvas.height/2, r:30};
    }
}

function updateTable() {
    let n1 = molecules.filter(m=>m.type===1).length;
    let n2 = molecules.filter(m=>m.type===2).length;
    let t1 = n1 ? (molecules.filter(m=>m.type===1).reduce((s,m)=>s+m.temp,0)/n1) : 0;
    let t2 = n2 ? (molecules.filter(m=>m.type===2).reduce((s,m)=>s+m.temp,0)/n2) : 0;
    let mass = Number(molarMassGlobalSlider.value);
    tableNumLeft.textContent = n1;
    tableNumRight.textContent = n2;
    tableTempLeft.textContent = t1.toFixed(2);
    tableTempRight.textContent = t2.toFixed(2);
    tableMasaGlobal.textContent = mass;
    tablePresiune.textContent = calcPresiune();
}

function animate() {
    if(!isVesselBroken) updateMoleculePositions();
    else {
        for(let m of molecules) {
            if(Math.abs(m.x-canvas.width/2)<10 && Math.abs(m.y-escapeHole.y)<escapeHole.r) {
                m.x += m.vx*2; m.y += m.vy*2;
            } else { m.x += m.vx; m.y += m.vy; }
        }
        molecules = molecules.filter(m => m.x>-20 && m.x<canvas.width+20 && m.y>-20 && m.y<canvas.height+20);
    }
    draw();
    if(!isVesselBroken) checkBreak();
    updateTable();
    requestAnimationFrame(animate);
}

function updateSliders() {
    temp1Value.textContent = temp1Slider.value;
    temp2Value.textContent = temp2Slider.value;
    numLeftValue.textContent = numLeftSlider.value;
    numRightValue.textContent = numRightSlider.value;
    molarMass1Value.textContent = molarMass1Slider.value;
    molarMass2Value.textContent = molarMass2Slider.value;
    molarMassGlobalValue.textContent = molarMassGlobalSlider.value;
}
[temp1Slider,temp2Slider,numLeftSlider,numRightSlider,molarMass1Slider,molarMass2Slider,molarMassGlobalSlider].forEach(sl=>{
    sl.addEventListener('input',()=>{
        updateSliders();
        if(!valveOpen) createMolecules();
        updateTable();
    });
});

function animateDivider(opening) {
    dividerAnimating = true;
    function step() {
        if(opening) {
            dividerHeight -= 0.08;
            if(dividerHeight <= 0) { dividerHeight = 0; dividerAnimating = false; }
        } else {
            dividerHeight += 0.08;
            if(dividerHeight >= 1) { dividerHeight = 1; dividerAnimating = false; }
        }
        divider.style.height = (dividerHeight*100) + '%';
        if(dividerAnimating) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

toggleValveButton.addEventListener('click',()=>{
    valveOpen = !valveOpen;
    toggleValveButton.textContent = valveOpen ? 'Închide Valvă' : 'Deschide Valvă';
    animateDivider(valveOpen);
});

restartButton.addEventListener('click', () => {
    temp1Slider.value = 300;
    temp2Slider.value = 300;
    numLeftSlider.value = 10;
    numRightSlider.value = 10;
    molarMass1Slider.value = 10;
    molarMass2Slider.value = 10;
    molarMassGlobalSlider.value = 10;
    molarMassGlobalValue.textContent = 10;
    updateSliders();
    valveOpen = false;
    toggleValveButton.textContent = 'Deschide Valvă';
    dividerHeight = 1.0;
    divider.style.height = '100%';
    isVesselBroken = false;
    escapeHole = null;
    createMolecules();
    updateTable();
});

molarMass1Slider.addEventListener('input',()=>{
    molarMass1Value.textContent = molarMass1Slider.value;
});

molarMass2Slider.addEventListener('input',()=>{
    molarMass2Value.textContent = molarMass2Slider.value;
});

molarMassGlobalSlider.addEventListener('input', () => {
    molarMassGlobalValue.textContent = molarMassGlobalSlider.value;
    molarMass1Slider.value = molarMassGlobalSlider.value;
    molarMass2Slider.value = molarMassGlobalSlider.value;
    molarMass1Value.textContent = molarMassGlobalSlider.value;
    molarMass2Value.textContent = molarMassGlobalSlider.value;
    // Actualizez mărimea și viteza moleculelor existente
    let mass = Number(molarMassGlobalSlider.value);
    for (let m of molecules) {
        m.mass = mass;
        m.radius = getRadius(mass);
        // recalculăm viteza păstrând direcția
        let v = Math.sqrt(m.temp)/Math.sqrt(mass)*1.5;
        let angle = Math.atan2(m.vy, m.vx);
        m.vx = v * Math.cos(angle);
        m.vy = v * Math.sin(angle);
    }
    updateSliders();
    updateTable();
});

divider.style.height = '100%';
createMolecules();
updateSliders();
animate();