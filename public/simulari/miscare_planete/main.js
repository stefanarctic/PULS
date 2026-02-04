import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================
   CONST (Physics + scales)
========================= */
const G = 6.67430e-11;
const M_SUN = 1.98847e30;
const R_SUN = 6.9634e8;        // m (aprox)
const AU = 1.495978707e11;

const WORLD_UNITS_PER_AU = 22;
const DIST_SCALE = WORLD_UNITS_PER_AU / AU;
const RADIUS_SCALE = 0.00000006;

const SUN_RADIUS_VIS = 3.2;
const BASE_DT = 60 * 60 * 2; // 2 hours

/* =========================
   PLANETS
========================= */
const PLANETS = [
  { name:"Mercur", mass:3.3011e23, radius:2.4397e6, a_AU:0.387, color:0xb7b7b7, spinSpeed: 0.020,
    facts:["~88 zile/orbită.","Atmosferă extrem de subțire.","Temperaturi extreme."] },
  { name:"Venus", mass:4.8675e24, radius:6.0518e6, a_AU:0.723, color:0xe7c58f, spinSpeed: -0.006,
    facts:["Rotație retrogradă.","Efect de seră puternic.","Presiune mare la sol."] },
  { name:"Pământ", mass:5.97237e24, radius:6.371e6, a_AU:1.0, color:0x4aa3ff, spinSpeed: 0.030,
    facts:["Apă ~71% din suprafață.","Luna stabilizează axa.","Viață cunoscută."] },
  { name:"Marte", mass:6.4171e23, radius:3.3895e6, a_AU:1.524, color:0xff7a55, spinSpeed: 0.028,
    facts:["Olympus Mons.","Phobos & Deimos.","Țintă pt. colonizare."] },
  { name:"Jupiter", mass:1.8982e27, radius:6.9911e7, a_AU:5.203, color:0xd7b28a, spinSpeed: 0.070,
    facts:["Cel mai mare.","Marea Pată Roșie.","Multe luni."] },
  { name:"Saturn", mass:5.6834e26, radius:5.8232e7, a_AU:9.537, color:0xe6d7a8, spinSpeed: 0.060,
    facts:["Inele spectaculoase.","Densitate < apă.","Titan: atmosferă densă."] },
  { name:"Uranus", mass:8.6810e25, radius:2.5362e7, a_AU:19.191, color:0x8fe8ff, spinSpeed: 0.040,
    facts:["Axa „culcată”.","Gigant de gheață.","Inele discrete."] },
  { name:"Neptun", mass:1.02413e26, radius:2.4622e7, a_AU:30.07, color:0x4b66ff, spinSpeed: 0.038,
    facts:["Vânturi foarte rapide.","Gigant de gheață.","Triton retrograd."] },
  { name:"Pluto", mass:1.303e22, radius:1.1883e6, a_AU:39.48, color:0xc9b7aa, spinSpeed: 0.012,
    facts:["Planetă pitică.","Orbită înclinată/excentrică.","Sistem cu Charon."] }
];

/* =========================
   THREE setup
========================= */
const canvas = document.querySelector("#c");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 9000);
camera.position.set(0, 90, 160);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;

// Controls (free explore)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 10;
controls.maxDistance = 3500;
controls.target.set(0, 0, 0);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.30));
const sunLight = new THREE.PointLight(0xffffff, 4.4, 0, 2);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
const rim = new THREE.DirectionalLight(0xffffff, 0.55);
rim.position.set(1, 1, 1);
scene.add(rim);

/* =========================
   Stars
========================= */
function addStars(count = 9000) {
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = THREE.MathUtils.randFloat(700, 2600);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));
    pos[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.cos(phi);
    pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
  }
  geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.0, sizeAttenuation: true, transparent: true, opacity: 0.9 });
  scene.add(new THREE.Points(geom, mat));
}
addStars();

/* =========================
   Sun
========================= */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS_VIS, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffdd88 })
);
sun.userData.kind = "sun";
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS_VIS * 2.1, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(sunGlow);

/* Sun pick helper (invisible) */
const sunPick = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS_VIS * 1.3, 16, 16),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
);
sunPick.userData.kind = "sun";
sun.add(sunPick);

/* =========================
   Textures + Halo
========================= */
function makeCanvasTexture(drawFn, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  drawFn(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function drawRocky(ctx, size, base1, base2) {
  const g = ctx.createLinearGradient(0,0,size,size);
  g.addColorStop(0, base1);
  g.addColorStop(1, base2);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);

  const img = ctx.getImageData(0,0,size,size);
  const d = img.data;
  for (let i=0;i<d.length;i+=4){
    const n = (Math.random()*70 - 35);
    d[i]   = Math.max(0, Math.min(255, d[i]   + n));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
  }
  ctx.putImageData(img,0,0);

  for (let k=0;k<160;k++){
    const x = Math.random()*size;
    const y = Math.random()*size;
    const r = 2 + Math.random()*18;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x+1,y+1,r*0.78,0,Math.PI*2);
    ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 2; ctx.stroke();
  }
}

function drawJupiter(ctx, size) {
  ctx.fillStyle = "#caa97f";
  ctx.fillRect(0,0,size,size);

  const bands = [
    ["#d8b38a", 0.00, 0.12],
    ["#c59e79", 0.12, 0.22],
    ["#e1bf96", 0.22, 0.36],
    ["#c79f7a", 0.36, 0.48],
    ["#dfb88e", 0.48, 0.62],
    ["#c89f78", 0.62, 0.74],
    ["#e3c39a", 0.74, 0.88],
    ["#c59e79", 0.88, 1.00],
  ];
  for (const [col, a, b] of bands){
    ctx.fillStyle = col;
    ctx.fillRect(0, a*size, size, (b-a)*size);
  }

  ctx.globalAlpha = 0.25;
  for (let i=0;i<260;i++){
    ctx.fillStyle = i%2 ? "#ffffff" : "#000000";
    const y = Math.random()*size;
    const h = 2 + Math.random()*18;
    const x = Math.random()*size;
    const w = 80 + Math.random()*260;
    ctx.fillRect(x,y,w,h);
  }
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.ellipse(size*0.72, size*0.62, size*0.12, size*0.07, -0.18, 0, Math.PI*2);
  ctx.fillStyle = "rgba(200, 90, 60, 0.98)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 7;
  ctx.stroke();
}

function drawEarth(ctx, size) {
  const g = ctx.createLinearGradient(0,0,0,size);
  g.addColorStop(0, "#0b2d66");
  g.addColorStop(1, "#0a4aa0");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);

  ctx.fillStyle = "rgba(50, 200, 110, 0.95)";
  for (let i=0;i<160;i++){
    ctx.beginPath();
    ctx.arc(Math.random()*size, Math.random()*size, 10+Math.random()*38, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(220, 190, 120, 0.55)";
  for (let i=0;i<70;i++){
    ctx.beginPath();
    ctx.arc(Math.random()*size, Math.random()*size, 10+Math.random()*28, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(0, 0, size, size*0.08);
  ctx.fillRect(0, size*0.92, size, size*0.08);

  ctx.globalAlpha = 0.38;
  ctx.fillStyle = "#ffffff";
  for (let i=0;i<260;i++){
    ctx.beginPath();
    ctx.arc(Math.random()*size, Math.random()*size, 6+Math.random()*26, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSaturn(ctx, size){
  ctx.fillStyle = "#e2d3a4";
  ctx.fillRect(0,0,size,size);
  for (let i=0;i<220;i++){
    const y = (i/220)*size;
    const a = 0.06 + Math.random()*0.22;
    ctx.fillStyle = `rgba(120, 90, 60, ${a})`;
    ctx.fillRect(0,y,size,2+Math.random()*10);
  }
}

function makeHaloTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size/2, size/2, size*0.12, size/2, size/2, size*0.5);
  g.addColorStop(0.00, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, "rgba(255,255,255,0.35)");
  g.addColorStop(1.00, "rgba(255,255,255,0.00)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const HALO_TEX = makeHaloTexture();

function addHalo(mesh, colorHex, scaleFactor = 3.2, opacity = 0.65) {
  const mat = new THREE.SpriteMaterial({
    map: HALO_TEX,
    color: colorHex,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const sprite = new THREE.Sprite(mat);
  const r = mesh.geometry.parameters.radius || 1;
  sprite.scale.set(r * scaleFactor, r * scaleFactor, 1);
  mesh.add(sprite);
  return sprite;
}

/* =========================
   Orbits
========================= */
const orbitLines = [];
function createOrbitLine(radiusWorld) {
  const segments = 320;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radiusWorld, 0, Math.sin(t) * radiusWorld));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 });
  return new THREE.Line(geom, mat);
}

/* =========================
   Planet creation + picking
========================= */
const planetBodies = [];
const pickTargets = [sunPick];

function visRadiusFromMeters(m) {
  const raw = m * RADIUS_SCALE;
  return Math.max(0.35, Math.min(raw, 4.9));
}

function computeAccel(posMeters) {
  const r = posMeters.length();
  const eps = 1e7;
  const rr = Math.max(r, eps);
  const factor = -(G * M_SUN) / (rr * rr * rr);
  return posMeters.clone().multiplyScalar(factor);
}

function makePlanetMaterial(def) {
  let map = null;

  if (def.name === "Jupiter") {
    map = makeCanvasTexture(drawJupiter, 1024);
    map.repeat.set(2,1);
  } else if (def.name === "Pământ") {
    map = makeCanvasTexture(drawEarth, 1024);
    map.repeat.set(2,1);
  } else if (def.name === "Saturn") {
    map = makeCanvasTexture(drawSaturn, 1024);
    map.repeat.set(2,1);
  } else if (["Mercur","Venus","Marte","Pluto"].includes(def.name)) {
    const palette = {
      "Mercur": ["#b5b5b5", "#6f6f6f"],
      "Venus":  ["#f2d2a8", "#b98b5a"],
      "Marte":  ["#e0754f", "#7b2f20"],
      "Pluto":  ["#d8c7b7", "#7d6b5f"]
    }[def.name];
    map = makeCanvasTexture((ctx, s)=>drawRocky(ctx, s, palette[0], palette[1]), 1024);
    map.repeat.set(2,1);
  }

  const emissiveIntensity = def.name === "Pământ" ? 0.75 : 0.48;

  return new THREE.MeshStandardMaterial({
    color: def.color,
    map,
    roughness: 0.78,
    metalness: 0.03,
    emissive: new THREE.Color(def.color),
    emissiveIntensity
  });
}

function addRing(parentMesh, inner, outer, opacity = 0.18, tilt = 0.35) {
  const ringGeom = new THREE.RingGeometry(inner, outer, 96);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = Math.PI * 0.5;
  ring.rotation.z = tilt;
  parentMesh.add(ring);
  return ring;
}

function setupPlanets() {
  let phase = 0.0;

  for (const def of PLANETS) {
    const rMeters = def.a_AU * AU;
    const rWorld = rMeters * DIST_SCALE;

    phase += 0.55;
    const xW = Math.cos(phase) * rWorld;
    const zW = Math.sin(phase) * rWorld;

    // SI state
    const rx = xW / DIST_SCALE;
    const rz = zW / DIST_SCALE;
    const rLen = Math.hypot(rx, rz);

    // circular orbit approx
    const v = Math.sqrt((G * M_SUN) / rMeters);
    const tx = -rz / rLen;
    const tz =  rx / rLen;

    const geom = new THREE.SphereGeometry(visRadiusFromMeters(def.radius), 64, 64);
    const mat = makePlanetMaterial(def);
    const body = new THREE.Mesh(geom, mat);
    body.position.set(xW, 0, zW);
    body.userData.kind = "planet";
    body.userData.planetName = def.name;

    // orbit line
    const orbit = createOrbitLine(rWorld);
    orbitLines.push(orbit);
    scene.add(orbit);

    // rings
    if (def.name === "Saturn") addRing(body, 1.2, 2.35, 0.22, 0.35);
    if (def.name === "Jupiter") addRing(body, 1.25, 2.15, 0.16, 0.10);

    // halos (more for small planets)
    const isSmall = ["Mercur","Venus","Pământ","Marte","Pluto"].includes(def.name);
    addHalo(body, def.color, isSmall ? 5.2 : 3.8, isSmall ? 0.80 : 0.68);

    // Earth atmosphere extra
    if (def.name === "Pământ") {
      const r = body.geometry.parameters.radius || 1;
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.06, 48, 48),
        new THREE.MeshBasicMaterial({
          color: 0x55aaff,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      body.add(atmo);
      addHalo(body, 0x55aaff, 6.4, 0.72);
    }

    scene.add(body);

    // pick helper for small planets (invisible hit sphere)
    const visR = body.geometry.parameters.radius || 1;
    const hitR = Math.max(visR * 2.8, 1.35);
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(hitR, 16, 16),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
    );
    hit.userData.kind = "planet";
    hit.userData.planetName = def.name;
    body.add(hit);
    pickTargets.push(hit);

    planetBodies.push({
      def,
      mesh: body,
      pos: new THREE.Vector3(rx, 0, rz),
      vel: new THREE.Vector3(tx * v, 0, tz * v),
      acc: new THREE.Vector3(0, 0, 0)
    });
  }
}
setupPlanets();

/* =========================
   Selection marker
========================= */
const selectedMarker = new THREE.Mesh(
  new THREE.RingGeometry(1.8, 2.2, 64),
  new THREE.MeshBasicMaterial({
    color: 0x78beff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
selectedMarker.visible = false;
selectedMarker.rotation.x = Math.PI * 0.5;
scene.add(selectedMarker);

/* =========================
   UI
========================= */
const btnPause = document.querySelector("#btnPause");
const btnReset = document.querySelector("#btnReset");
const timeWarp = document.querySelector("#timeWarp");
const timeWarpVal = document.querySelector("#timeWarpVal");
const toggleOrbits = document.querySelector("#toggleOrbits");
const followSelect = document.querySelector("#followSelect");
// Panel toggle (fix close button)
const btnPanel = document.querySelector("#btnPanel");
const btnClosePanel = document.querySelector("#btnClosePanel");
const panelEl = document.querySelector("#panel");

btnPanel?.addEventListener("click", () => panelEl?.classList.toggle("open"));
btnClosePanel?.addEventListener("click", () => panelEl?.classList.remove("open"));


const selectedName = document.querySelector("#selectedName");
const selectedTag = document.querySelector("#selectedTag");
const selectedStats = document.querySelector("#selectedStats");
const selectedFacts = document.querySelector("#selectedFacts");

let userPaused = false;
let tempPauseUntil = 0;

// selection can be: {kind:"sun"} or planetBody reference
let selected = null;

// follow + camera framing
let followTarget = "Nimic";
let followStrength = 0.045;      // “ușor”, nu te blochează
let camMoveT = 0;               // 0..1 for smooth camera move
let camFrom = new THREE.Vector3();
let camTo = new THREE.Vector3();
let targetFrom = new THREE.Vector3();
let targetTo = new THREE.Vector3();

function fillFollowSelect() {
  followSelect.innerHTML = "";
  const options = ["Nimic", "Soare", ...PLANETS.map(p => p.name)];
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    followSelect.appendChild(o);
  }
  followSelect.value = "Nimic";
}
fillFollowSelect();

btnPause?.addEventListener("click", () => {
  userPaused = !userPaused;
  btnPause.textContent = userPaused ? "▶ Play" : "⏸ Pause";
});

btnReset?.addEventListener("click", () => {
  // remove planets + orbits
  for (const p of planetBodies) scene.remove(p.mesh);
  for (const o of orbitLines) scene.remove(o);

  planetBodies.length = 0;
  orbitLines.length = 0;

  // pickTargets reset to just sunPick
  pickTargets.length = 0;
  pickTargets.push(sunPick);

  selected = null;
  setSelected(null);
  selectedMarker.visible = false;

  setupPlanets();
  for (const o of orbitLines) o.visible = toggleOrbits?.checked ?? true;
});

timeWarp?.addEventListener("input", () => {
  timeWarpVal.textContent = `${Number(timeWarp.value).toFixed(1)}×`;
});

toggleOrbits?.addEventListener("change", () => {
  for (const o of orbitLines) o.visible = toggleOrbits.checked;
});

/* IMPORTANT: dropdown now also sets info + camera */
followSelect?.addEventListener("change", () => {
  followTarget = followSelect.value;

  if (followTarget === "Nimic") return;

  if (followTarget === "Soare") {
    setSelected({ kind: "sun" });
    focusCameraOnSun();
    return;
  }

  const p = planetBodies.find(x => x.def.name === followTarget);
  if (p) {
    setSelected(p);
    focusCameraOnPlanet(p);
  }
});

/* =========================
   Picking (click planets + sun)
========================= */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("pointermove", (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
});

window.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pickTargets, true);
  if (!hits.length) return;

  const hit = hits[0].object;
  const kind = hit.userData.kind;

  if (kind === "sun") {
    setSelected({ kind: "sun" });
    tempPauseUntil = performance.now() + 450;
    // optional: if user clicks sun, set dropdown to Soare
    if (followSelect) followSelect.value = "Soare";
    followTarget = "Soare";
    focusCameraOnSun();
    return;
  }

  if (kind === "planet") {
    const name = hit.userData.planetName;
    const p = planetBodies.find(x => x.def.name === name);
    if (p) {
      setSelected(p);
      tempPauseUntil = performance.now() + 650;
      // sync dropdown to chosen planet
      if (followSelect) followSelect.value = p.def.name;
      followTarget = p.def.name;
      focusCameraOnPlanet(p);
    }
  }
});

/* =========================
   Selection + Info formatting
========================= */
function formatSI(x) {
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 1e6 || ax < 1e-2) return x.toExponential(3);
  return x.toFixed(3);
}

function setSelected(obj) {
  selected = obj;

  if (!obj) {
    selectedName.textContent = "—";
    selectedTag.textContent = "Click pe o planetă sau Soare…";
    selectedStats.textContent = "";
    selectedFacts.textContent = "—";
    selectedMarker.visible = false;
    return;
  }

  if (obj.kind === "sun") {
    selectedName.textContent = "Soare";
    selectedTag.textContent = "Corp selectat: Soare";
    selectedFacts.innerHTML =
      `<ul>
        <li>~99.86% din masa Sistemului Solar.</li>
        <li>Furnizează energia prin fuziune (H → He).</li>
        <li>Influențează toate orbitele prin gravitație.</li>
      </ul>`;

    selectedMarker.visible = true;
    selectedMarker.position.set(0, 0, 0);
    selectedMarker.scale.setScalar(2.0);
    return;
  }

  // planet
  selectedName.textContent = obj.def.name;
  selectedTag.textContent = `Planetă selectată: ${obj.def.name}`;
  selectedFacts.innerHTML = `<ul>${obj.def.facts.map(f => `<li>${f}</li>`).join("")}</ul>`;

  selectedMarker.visible = true;
  selectedMarker.position.copy(obj.mesh.position);
  const r = obj.mesh.geometry.parameters.radius || 1;
  selectedMarker.scale.setScalar(Math.max(0.8, r * 0.90));
}

function updateSelectedStats() {
  if (!selected) return;

  if (selected.kind === "sun") {
    const mu = G * M_SUN; // m^3/s^2
    selectedStats.textContent =
`M☉ = ${formatSI(M_SUN)} kg
R☉ ≈ ${formatSI(R_SUN)} m
μ = G·M☉ = ${formatSI(mu)} m³/s²

G = 6.67430×10⁻¹¹ N·m²/kg²`;
    return;
  }

  // planet
  const r = selected.pos.length();
  const v = selected.vel.length();
  const a = selected.acc.length();
  const F = (G * M_SUN * selected.def.mass) / (r * r);
  const rAU = r / AU;

  selectedStats.textContent =
`r = ${rAU.toFixed(3)} AU  (${formatSI(r)} m)
v = ${formatSI(v)} m/s
a = ${formatSI(a)} m/s²
F = ${formatSI(F)} N

m = ${formatSI(selected.def.mass)} kg
G = 6.67430×10⁻¹¹ N·m²/kg²
M☉ = 1.98847×10³⁰ kg`;
}

/* =========================
   Camera framing + soft follow
========================= */
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function startCameraMove(newTarget, desiredCamPos) {
  camFrom.copy(camera.position);
  camTo.copy(desiredCamPos);

  targetFrom.copy(controls.target);
  targetTo.copy(newTarget);

  camMoveT = 0.0001;
}

function focusCameraOnPlanet(p) {
  // planet world pos
  const pos = p.mesh.position.clone();
  const r = p.mesh.geometry.parameters.radius || 1;

  // keep current camera direction but place closer & nicer
  const dir = camera.position.clone().sub(controls.target).normalize();
  const dist = Math.max(18, r * 9.5); // “prim-plan” adaptiv
  const desired = pos.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, r * 1.2, 0));

  startCameraMove(pos, desired);
}

function focusCameraOnSun() {
  const pos = new THREE.Vector3(0,0,0);
  const dir = camera.position.clone().sub(controls.target).normalize();
  const desired = pos.clone().add(dir.multiplyScalar(45)).add(new THREE.Vector3(0, 10, 0));
  startCameraMove(pos, desired);
}

function updateCameraMove(dt) {
  if (camMoveT <= 0) return;
  camMoveT += dt * 1.4; // speed
  const t = Math.min(1, camMoveT);
  const k = easeOutCubic(t);

  camera.position.lerpVectors(camFrom, camTo, k);
  controls.target.lerpVectors(targetFrom, targetTo, k);

  if (t >= 1) camMoveT = 0;
}

// soft follow target (keeps planet in view but you can still orbit/pan/zoom)
function updateSoftFollow() {
  if (!followTarget || followTarget === "Nimic") return;

  let targetWorld = new THREE.Vector3(0,0,0);

  if (followTarget === "Soare") {
    targetWorld.set(0,0,0);
  } else {
    const p = planetBodies.find(x => x.def.name === followTarget);
    if (!p) return;
    targetWorld.copy(p.mesh.position);
  }

  // gentle pull
  controls.target.lerp(targetWorld, followStrength);
}

/* =========================
   Loop
========================= */
let last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  const dtFrame = (now - last) / 1000;
  last = now;

  const warp = Number(timeWarp?.value ?? 8);
  const isTempPaused = now < tempPauseUntil;
  const paused = userPaused || isTempPaused;

  const dt = BASE_DT * warp;
  const steps = Math.min(6, Math.max(1, Math.floor((dtFrame * warp) + 1)));
  const dtStep = dt / steps;

  if (!paused) {
    for (let s = 0; s < steps; s++) {
      for (const p of planetBodies) {
        p.acc.copy(computeAccel(p.pos));
        p.vel.addScaledVector(p.acc, dtStep);
        p.pos.addScaledVector(p.vel, dtStep);
        p.mesh.position.set(p.pos.x * DIST_SCALE, 0, p.pos.z * DIST_SCALE);
      }
    }
  }

  // spin always a bit
  for (const p of planetBodies) {
    p.mesh.rotation.y += p.def.spinSpeed * (paused ? 0.45 : 1.0);
  }

  // marker
  if (selected?.kind === "sun") {
    selectedMarker.position.set(0,0,0);
  } else if (selected?.mesh) {
    selectedMarker.position.copy(selected.mesh.position);
  }

  // camera move + soft follow
  updateCameraMove(dtFrame);
  updateSoftFollow();

  updateSelectedStats();

  controls.update();
  renderer.render(scene, camera);
}
animate(performance.now());

/* =========================
   Resize
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================
   Init
========================= */
for (const o of orbitLines) o.visible = toggleOrbits?.checked ?? true;
setSelected(null);
