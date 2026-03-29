const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const detectorToggle = document.getElementById("detector");

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
detectorToggle.addEventListener("change", () => {
    points = [];
});

// UI
const lambdaSlider = document.getElementById("lambda");
const distanceSlider = document.getElementById("distance");
const screenSlider = document.getElementById("screenDist");
const resetBtn = document.getElementById("reset");

let t = 0;
let particles = [];
let points = [];

// probabilitate interferență
function intensity(x, lambda, d, D) {
    const k = Math.PI * d / (lambda * D);
    return Math.pow(Math.cos(k * x), 2);
}

// undă
function wave(x, t, lambda) {
    const k = 2 * Math.PI / lambda;
    const omega = 0.05;
    return Math.sin(k * x - omega * t);
}
function getColor(p) {
    // p între 0 și 1

    let r = Math.floor(255 * p);
    let g = Math.floor(150 * (1 - Math.abs(p - 0.5)));
    let b = Math.floor(255 * (1 - p));

    return `rgb(${r},${g},${b})`;
}

// random bazat pe probabilitate
function randomX(lambda, d, D, detectorOn) {

    if (detectorOn) {
        const spread = 30;
        return (Math.random() < 0.5 ? -d / 2 : d / 2) + (Math.random() - 0.5) * spread;
    }

    while (true) {
        let x = (Math.random() - 0.5) * canvas.width;
        if (Math.random() < intensity(x, lambda, d, D)) return x;
    }
}

function draw() {
    // 🔥 1. fade corect (PRIMUL!)
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const lambda = parseFloat(lambdaSlider.value);
    const d = parseFloat(distanceSlider.value);
    const D = parseFloat(screenSlider.value);
    const detectorOn = detectorToggle.checked;

    const wallX = canvas.width / 3;

    // 🔥 2. undă (înainte de perete)
    ctx.strokeStyle = "cyan";
    ctx.beginPath();

    for (let x = 0; x < wallX; x++) {
        let y = canvas.height / 2 + wave(x, t, lambda) * 40;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();

    // 🔥 3. perete + fante
    ctx.fillStyle = "#888";
    ctx.fillRect(wallX, 0, 5, canvas.height);

    ctx.clearRect(wallX, canvas.height / 2 - d / 2 - 20, 5, 40);
    ctx.clearRect(wallX, canvas.height / 2 + d / 2 - 20, 5, 40);
    // 🔥 HEATMAP
    for (let y = 0; y < canvas.height; y += 2) {

        let x = (y - canvas.height / 2);

        let p;

        if (detectorOn) {
            // fără interferență
            p =
                Math.exp(-Math.pow(x - d / 2, 2) / 1000) +
                Math.exp(-Math.pow(x + d / 2, 2) / 1000);
        } else {
            // interferență
            p = intensity(x, lambda, d, D);
        }

        ctx.fillStyle = getColor(p);
        ctx.fillRect(canvas.width - 40, y, 40, 2);
    }

    // 🔥 4. spawn particule (FIXED)

    // alegem o fantă
    let slitY = canvas.height / 2 + (Math.random() < 0.5 ? -d / 2 : d / 2);

    // poziție țintă pe ecran
    let targetX = randomX(lambda, d, D, detectorOn);
    let targetY = canvas.height / 2 + (targetX / D) * (canvas.height / 4);

    // direcție
    let dx = (canvas.width - 50) - wallX;
    let dy = targetY - slitY;

    // adăugăm particula
    particles.push({
        x: wallX,
        y: slitY,
        vx: dx / 120,
        vy: dy / 120
    });

    // 🔥 5. mișcare particule
    ctx.fillStyle = "white";

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillRect(p.x, p.y, 2, 2);
    });

    // 🔥 6. impact ecran
    particles = particles.filter(p => {
        if (p.x > canvas.width - 50) {

            let x = randomX(lambda, d, D, detectorOn);
            let scale = canvas.height / 4;
            let y = canvas.height / 2 + (x / D) * scale;

            points.push({ x, y });
            return false;
        }
        return true;
    });

    // 🔥 7. desen pattern final
    points.forEach(p => {
        ctx.fillRect(canvas.width - 50, p.y, 2, 2);
    });

    // 🔥 8. limit particles (IMPORTANT)
    if (particles.length > 2000) {
        particles.splice(0, 500);
    }

    t += 1;
    requestAnimationFrame(draw);
}

resetBtn.onclick = () => {
    points = [];
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

draw();