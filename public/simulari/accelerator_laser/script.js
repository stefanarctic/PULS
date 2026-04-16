const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let intensitySlider = document.getElementById("intensity");
let densitySlider = document.getElementById("density");

const c = 50;
const phaseSpeed = 4.9;
let time = 0;

let electron = {
  x: 100,
  y: canvas.height / 2,
  vx: 2,
  energy: 1
};

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  electron.y = canvas.height / 2;
}

window.addEventListener("resize", resizeCanvas);

let laser = {
  x: 0,
  speed: 5,
  width: 200
};

let particles = [];
let trail = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

function plasmaWave(phase) {
  let w = Math.sin(phase);
  return Math.sign(w) * Math.pow(Math.abs(w), 1.5);
}

function waveFade(distFromLaser) {
  let boost = Math.exp(-Math.abs(distFromLaser) * 0.02);
  return Math.pow(boost, 0.5);
}

function electronColor(energy) {
  let e = Math.max(0, energy - 1);
  let r = Math.min(255, Math.round(50 + e * 50));
  let g = Math.max(50,  Math.round(200 - e * 20));
  return `rgb(${r}, ${g}, 255)`;
}

// ── Update ────────────────────────────────────────────────────────────────────

function updateElectron() {
  let density   = densitySlider.value;
  let intensity = intensitySlider.value;
  let k = 0.02 * density;
  let A = intensity * 0.5;

  let wavePhase = k * electron.x - k * phaseSpeed * time;
  let field = plasmaWave(wavePhase);

  // trapping: accelerează doar electronii „prinși" în undă
  if (Math.abs(field) > 0.3) {
    electron.vx += field * (intensity / 100) * 0.4;
  }

  electron.vx = Math.max(-c * 0.99, Math.min(c * 0.99, electron.vx));
  electron.x += electron.vx;

  let dist = electron.x - laser.x;
  electron.y = canvas.height / 2 + plasmaWave(wavePhase) * A * waveFade(dist);
}

function updateEnergy() {
  let v = electron.vx;
  electron.energy = 1 / Math.sqrt(1 - (v * v) / (c * c));
}

function update() {
  time++;
  laser.x += laser.speed;

  updateElectron();
  updateEnergy();

  if (laser.x > canvas.width) {
    laser.x = -laser.width;
    electron.x = 100;
    electron.vx = 2;
    electron.energy = 1;
    trail = [];
  }
}

// ── Draw ──────────────────────────────────────────────────────────────────────

function drawBackgroundWave() {
  ctx.beginPath();
  let t = performance.now();
  for (let x = 0; x < canvas.width; x += 2) {
    let y = canvas.height / 2 + Math.sin(0.01 * x - t * 0.002) * 10;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(0,150,255,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawWakefield() {
  let density   = densitySlider.value;
  let intensity = intensitySlider.value;
  let k = 0.02 * density;
  let A = intensity * 0.5;
  const step = 5;

  // precalculează toate punctele o singură dată
  let pts = [];
  for (let x = 0; x < canvas.width; x += step) {
    let phase = k * x - k * phaseSpeed * time;
    let wave  = plasmaWave(phase);
    let fade  = waveFade(x - laser.x);
    pts.push({ x, y: canvas.height / 2 + wave * A * fade, wave, fade });
  }

  // shadow pass: un singur path faint, shadow global
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = "rgba(0,200,255,0.25)";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(0,200,255,0.5)";
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // color pass: fiecare segment colorat după intensitate locală
  ctx.lineWidth = 2;
  for (let i = 1; i < pts.length; i++) {
    let intensity = Math.abs(pts[i].wave) * pts[i].fade;
    let r = Math.round(Math.min(255, 50 + intensity * 205));
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x,     pts[i].y);
    ctx.strokeStyle = `rgba(${r},200,255,0.9)`;
    ctx.stroke();
  }
}

function drawLaser() {
  let gradient = ctx.createLinearGradient(laser.x, 0, laser.x + laser.width, 0);
  gradient.addColorStop(0,   "rgba(255,0,0,0)");
  gradient.addColorStop(0.5, "rgba(255,0,0,0.8)");
  gradient.addColorStop(1,   "rgba(255,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(laser.x, 0, laser.width, canvas.height);
}

function spawnParticles() {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: laser.x + Math.random() * laser.width,
      y: canvas.height / 2 + (Math.random() - 0.5) * 120,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      life: 60 + Math.random() * 60
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    let alpha = (p.life / 120) * 0.6;
    ctx.fillStyle = `rgba(100,200,255,${alpha.toFixed(2)})`;
    ctx.fillRect(p.x, p.y, 2, 2);
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawTrail() {
  trail.push({ x: electron.x, y: electron.y, energy: electron.energy });
  if (trail.length > 60) trail.shift();

  trail.forEach((p, i) => {
    let alpha = (i / trail.length) * 0.85;
    ctx.fillStyle = electronColor(p.energy).replace("rgb(", `rgba(`).replace(")", `, ${alpha.toFixed(2)})`);
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
  });
}

function drawAccelerationZone() {
  let e = Math.max(0, electron.energy - 1);
  let outerRadius = 80 + e * 10;

  // radial glow
  let grd = ctx.createRadialGradient(
    electron.x, electron.y, 5,
    electron.x, electron.y, outerRadius
  );
  grd.addColorStop(0, `rgba(0,255,255,${Math.min(0.25 + e * 0.05, 0.5).toFixed(2)})`);
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // highlight ring
  ctx.beginPath();
  ctx.arc(electron.x, electron.y, 20 + e * 2, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,255,255,${Math.min(0.15 + e * 0.05, 0.4).toFixed(2)})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawElectron() {
  let e     = Math.max(0, electron.energy - 1);
  let pulse = Math.sin(performance.now() * 0.02) * electron.energy * 3;
  let size  = Math.min(6 + pulse, 28);
  let color = electronColor(electron.energy);

  ctx.shadowBlur  = 20 + electron.energy * 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(electron.x, electron.y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.shadowColor = "transparent";
}

function drawHUD() {
  let e = Math.max(0, electron.energy - 1);

  // γ bar
  let barW = 180;
  let fill = Math.min(e / 10, 1) * barW;
  ctx.fillStyle = "rgba(0,30,50,0.7)";
  ctx.fillRect(16, canvas.height - 62, barW + 4, 14);
  let barGrad = ctx.createLinearGradient(18, 0, 18 + barW, 0);
  barGrad.addColorStop(0,   "cyan");
  barGrad.addColorStop(0.6, "rgba(100,180,255,1)");
  barGrad.addColorStop(1,   "white");
  ctx.fillStyle = barGrad;
  ctx.fillRect(18, canvas.height - 60, fill, 10);

  ctx.fillStyle = "cyan";
  ctx.font = "bold 16px monospace";
  ctx.fillText("γ: " + electron.energy.toFixed(2), 20, canvas.height - 70);
  ctx.font = "13px monospace";
  ctx.fillStyle = "rgba(0,200,255,0.75)";
  ctx.fillText("v: " + electron.vx.toFixed(2) + "  c=" + c, 20, canvas.height - 20);
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBackgroundWave();
  drawWakefield();
  drawParticles();
  drawLaser();
  drawAccelerationZone();
  drawTrail();
  drawElectron();
  drawHUD();
}

// ── Loop ──────────────────────────────────────────────────────────────────────

function loop() {
  update();
  spawnParticles();
  draw();
  requestAnimationFrame(loop);
}

loop();

// ── Info card ─────────────────────────────────────────────────────────────────

const toggleBtn  = document.getElementById("toggleInfo");
const infoCard   = document.getElementById("infoCard");

toggleBtn.addEventListener("click", () => {
  infoCard.classList.toggle("hidden");
});
