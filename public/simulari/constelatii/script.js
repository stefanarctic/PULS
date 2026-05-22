import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { ZODIAC_DEFINITIONS, ZODIAC_HOOK, stripZodiacHook } from "./zodiac-data.js";

function simT(path, ro) {
  return typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro;
}

const canvas = document.querySelector("#c");
const labelEl = document.querySelector("#sky-label");
const learnKicker = labelEl.querySelector(".learn-kicker");
const learnTitle = labelEl.querySelector(".learn-title");
const learnMyth = labelEl.querySelector(".learn-myth");
const learnFindText = labelEl.querySelector(".learn-find-text");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x020308, 1);

const scene = new THREE.Scene();

/** Bolta cerească (planetariu): tot conținutul se rotește; observatorul rămâne în centru. */
const celestialVault = new THREE.Group();
scene.add(celestialVault);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 0);

const SKY_RADIUS = 900;
const STAR_RADIUS = SKY_RADIUS * 0.92;
const LINE_RADIUS = STAR_RADIUS * 1.024;
const HIT_RADIUS = 95;

/** RA în ore zecimale, Dec în grade → vector unitar; axa Y = polul nord ceresc */
function celestialDir(raHours, decDeg) {
  const ra = (raHours * Math.PI) / 12;
  const dec = (decDeg * Math.PI) / 180;
  const c = Math.cos(dec);
  return new THREE.Vector3(
    c * Math.cos(ra),
    Math.sin(dec),
    c * Math.sin(ra)
  );
}

function scaleToRadius(v, r) {
  return v.clone().multiplyScalar(r);
}

// ——— Sky dome ———
function createSkyDome() {
  const geometry = new THREE.SphereGeometry(SKY_RADIUS, 64, 48);

  const vertexShader = /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uTime;
    varying vec3 vDir;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec3 d = normalize(vDir);
      float h = d.y;

      vec3 horizon = vec3(0.04, 0.07, 0.18);
      vec3 zenith = vec3(0.005, 0.012, 0.06);
      float t = smoothstep(-0.35, 0.75, h);
      vec3 col = mix(horizon, zenith, t);

      float glow = pow(max(h + 0.15, 0.0), 3.2) * 0.08;
      col += vec3(0.05, 0.06, 0.12) * glow;

      vec2 nUV = d.xz * 14.0 + d.y * 3.0;
      float n =
        noise(nUV) * 0.55 +
        noise(nUV * 2.3 + 17.0) * 0.28 +
        noise(nUV * 5.1 - uTime * 0.02) * 0.12;
      col += (n - 0.5) * 0.035;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uTime: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  celestialVault.add(mesh);
  return material;
}

const skyMaterial = createSkyDome();

/** Alb / albastru rece / portocaliu cald — ca spectre reale pe cer */
const STAR_TINT_HEX = [0xffffff, 0xaaccff, 0xffccaa];

// ——— Stele de fundal ———
function createStars(count) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const brightness = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const tmp = new THREE.Vector3();
  const tintCol = new THREE.Color();
  for (let i = 0; i < count; i++) {
    tmp
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize();
    const r = STAR_RADIUS;
    positions[i * 3] = tmp.x * r;
    positions[i * 3 + 1] = tmp.y * r;
    positions[i * 3 + 2] = tmp.z * r;

    const mag = Math.random();
    sizes[i] =
      0.7 + Math.pow(mag, 1.15) * 2.2 + Math.pow(Math.random(), 2.8) * 5.2;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.35 + Math.random() * 1.85;
    brightness[i] = 0.18 + Math.pow(Math.random(), 1.4) * 0.92;

    tintCol.setHex(
      STAR_TINT_HEX[(Math.random() * STAR_TINT_HEX.length) | 0]
    );
    colors[i * 3] = tintCol.r;
    colors[i * 3 + 1] = tintCol.g;
    colors[i * 3 + 2] = tintCol.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const starVertex = /* glsl */ `
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    attribute float aBrightness;
    attribute vec3 aColor;
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uHoverTwinkle;
    varying float vAlpha;
    varying float vBright;
    varying vec3 vColor;

    void main() {
      float twBase = sin(uTime * aSpeed + aPhase);
      float amp = mix(0.5, 0.82, uHoverTwinkle);
      float tw = 0.5 + amp * twBase;
      tw += uHoverTwinkle * 0.22 * sin(uTime * (aSpeed * 3.8 + 1.7) + aPhase * 2.3);
      tw = clamp(tw, 0.15, 1.0);
      float shimmer = 0.88 + 0.12 * sin(uTime * (aSpeed * 2.7) + aPhase * 3.1);
      float shimW = mix(1.0, 1.18 + 0.12 * sin(uTime * 5.1 + aPhase), uHoverTwinkle);
      vBright = aBrightness * mix(0.65 + 0.35 * tw, 1.0, 0.55) * shimmer * shimW;
      vAlpha = vBright;

      vColor = aColor;

      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float dist = length(mv.xyz);
      float scale = 300.0 * uPixelRatio / max(dist, 1.0);
      gl_PointSize = clamp(aSize * scale, 1.0, 120.0);
      gl_Position = projectionMatrix * mv;
    }
  `;

  const starFragment = /* glsl */ `
    varying float vAlpha;
    varying float vBright;
    varying vec3 vColor;

    void main() {
      vec2 q = gl_PointCoord * 2.0 - 1.0;
      float dist = length(q);
      if (dist > 1.0) discard;
      float core = exp(-dist * dist * 5.0);
      float halo = exp(-dist * dist * 1.8) * 0.35;
      float a = (core + halo) * vAlpha;
      vec3 col = vColor * (0.85 + 0.15 * vBright);
      gl_FragColor = vec4(col * vBright, a);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uHoverTwinkle: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 1;
  celestialVault.add(points);
  return material;
}

const starMaterial = createStars(12000);

// ——— Date stele (aprox. J2000) ———
const UMA_STARS = [
  celestialDir(11.0622, 61.75),
  celestialDir(11.0308, 56.3822),
  celestialDir(11.8972, 53.6947),
  celestialDir(12.2572, 57.0325),
  celestialDir(12.9006, 55.9597),
  celestialDir(13.3989, 54.925),
  celestialDir(13.7922, 49.3133),
];
const UMA_SEGMENTS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
];

const UMI_STARS = [
  celestialDir(2.5303, 89.2642),
  celestialDir(16.7661, 82.0372),
  celestialDir(16.2783, 77.7944),
  celestialDir(16.2919, 75.755),
  celestialDir(14.9064, 74.1556),
  celestialDir(15.3453, 71.8339),
];
const UMI_SEGMENTS = [
  [4, 5],
  [4, 3],
  [3, 2],
  [2, 1],
  [1, 0],
];

const POLARIS_IDX = 0;
const EPS_UMI_IDX = 1;

function centroidNormalized(vectors) {
  const s = new THREE.Vector3();
  for (const v of vectors) s.add(v);
  return s.normalize();
}

function makeLineSegments(dirs, segmentPairs, colorHex) {
  const pos = [];
  for (const [a, b] of segmentPairs) {
    const pa = scaleToRadius(dirs[a], LINE_RADIUS);
    const pb = scaleToRadius(dirs[b], LINE_RADIUS);
    pos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.22,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 5;
  return { lines, material: mat };
}

function makeConstellationNodes(dirs, colorHex, pointScale = 1) {
  const r = LINE_RADIUS;
  const pos = new Float32Array(dirs.length * 3);
  for (let i = 0; i < dirs.length; i++) {
    const p = scaleToRadius(dirs[i], r);
    pos[i * 3] = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: colorHex,
    size: 7.5 * pointScale,
    transparent: true,
    opacity: 0.4,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 6;
  return { points: pts, material: mat };
}

function makePickSphere(centerUnit, radiusWorld, id) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radiusWorld, 16, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  mesh.position.copy(centerUnit.clone().multiplyScalar(STAR_RADIUS * 0.72));
  mesh.userData.pickId = id;
  return mesh;
}

/** Venus (Luceafărul) — direcție pe boltă + vizual mare, glow, gălbui */
const VENUS_UNIT = new THREE.Vector3(2, 1, -3).normalize();
const VENUS_SHELL_R = STAR_RADIUS * 1.036;
const venusLabelAnchor = VENUS_UNIT.clone().multiplyScalar(VENUS_SHELL_R);

function makeVenusSpriteTexture(isCore) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx * 0.98);
  if (isCore) {
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.1, "rgba(255,250,235,0.95)");
    g.addColorStop(0.28, "rgba(255,230,200,0.35)");
    g.addColorStop(1, "rgba(255,200,150,0)");
  } else {
    g.addColorStop(0, "rgba(255,235,200,0.55)");
    g.addColorStop(0.22, "rgba(255,215,170,0.45)");
    g.addColorStop(0.5, "rgba(255,195,140,0.22)");
    g.addColorStop(1, "rgba(255,170,100,0)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let venusBillboard = null;
function addVenusToVault() {
  const texHalo = makeVenusSpriteTexture(false);
  const texCore = makeVenusSpriteTexture(true);
  const matHalo = new THREE.SpriteMaterial({
    map: texHalo,
    color: 0xffddaa,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const matCore = new THREE.SpriteMaterial({
    map: texCore,
    color: 0xfff0d4,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const halo = new THREE.Sprite(matHalo);
  const core = new THREE.Sprite(matCore);
  halo.renderOrder = 26;
  core.renderOrder = 27;
  const group = new THREE.Group();
  group.position.copy(venusLabelAnchor);
  group.add(halo);
  group.add(core);
  celestialVault.add(group);
  venusBillboard = {
    group,
    halo,
    core,
    haloBase: 168,
    coreBase: 52,
    matHalo,
    matCore,
  };
}

addVenusToVault();

const umaCent = centroidNormalized(UMA_STARS);
const umiCent = centroidNormalized(UMI_STARS);
const polarisDir = UMI_STARS[POLARIS_IDX].clone();

/** Merak → Dubhe → Polaris (traseu clasic către Steaua polară). Vizibil la click pe Carul Mare. */
function makeUmaToPolarisGuide() {
  const rGuide = LINE_RADIUS * 1.003;
  const dubhe = scaleToRadius(UMA_STARS[0], rGuide);
  const merak = scaleToRadius(UMA_STARS[1], rGuide);
  const pol = scaleToRadius(polarisDir.clone().normalize(), rGuide);
  const pos = new Float32Array([
    merak.x,
    merak.y,
    merak.z,
    dubhe.x,
    dubhe.y,
    dubhe.z,
    dubhe.x,
    dubhe.y,
    dubhe.z,
    pol.x,
    pol.y,
    pol.z,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0xffcc77,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 22;
  return { lines, material: mat };
}
const umaPolarisGuide = makeUmaToPolarisGuide();

const CONSTELLATIONS = {
  uma: {
    labelAnchor: scaleToRadius(umaCent, LINE_RADIUS),
    lines: makeLineSegments(UMA_STARS, UMA_SEGMENTS, 0xa8e0ff),
    nodes: makeConstellationNodes(UMA_STARS, 0xd8f0ff, 1),
    learn: {
      title: "Carul Mare · Ursa Major",
      myth:
        "În mitologia greacă, nimfa Calisto a fost transformată în ursoaică; Zeus a ridicat-o pe cer ca s-o ferească. Alături e fiul ei, Arcas — Carul Mic. Amândouă „se învârt” mereu, ca o amintire a iubirii și a pedepsei.",
      find:
        "Caută asterismul ca un cântar mare. Pe latura scurtă a bolții, Merak și Dubhe indică nordul: linia aurie de pe boltă leagă Merak → Dubhe → Polaris — același traseu pe care îl prelungești cam de cinci ori încontinuu ca să ajungi la Steaua polară și la nordul geografic.",
    },
  },
  umi: {
    labelAnchor: scaleToRadius(umiCent, LINE_RADIUS),
    lines: makeLineSegments(UMI_STARS, UMI_SEGMENTS, 0xffe8a8),
    nodes: makeConstellationNodes(UMI_STARS, 0xfff4d0, 1),
    learn: {
      title: "Carul Mic · Ursa Minor",
      myth:
        "Carul Mic e din același mit: Arcas, fiul Calisto, trecut pe boltă ca să rămână aproape de mama lui. Împreună, cele două Caruri sunt „urșii” care veghează spre polul nord ceresc.",
      find:
        "Arată ca un cântar mai mic în jurul Stelei polare. De obicei îl găsești după ce localizezi Carul Mare, apoi urmezi linia Dubhe–Merak spre Polaris; restul stelelor se leagă din mânerul care se termină în Polaris.",
    },
  },
  polaris: {
    labelAnchor: scaleToRadius(polarisDir, LINE_RADIUS),
    lines: makeLineSegments(UMI_STARS, [[EPS_UMI_IDX, POLARIS_IDX]], 0xffffff),
    nodes: makeConstellationNodes(
      [UMI_STARS[POLARIS_IDX], UMI_STARS[EPS_UMI_IDX]],
      0xffffff,
      1.35
    ),
    learn: {
      title: "Steaua polară · Polaris",
      myth:
        "Polaris a ghidat navigatorii mii de ani: pare nemișcată, în timp ce restul bolții se rotește în jurul ei. În folclorul românesc a fost numită adesea Steaua cu coade — ca un țăruș prins sus pe cer.",
      find:
        "E la capătul mânerului Carului Mic, foarte aproape de Polul Nord ceresc: întregul cer pare să se învârtă în jurul ei. Nu strălucește cel mai tare, dar o localizezi ușor pornind de la Carul Mare.",
    },
  },
};

for (const id of ["uma", "umi", "polaris"]) {
  const L = CONSTELLATIONS[id].learn;
  L.title = simT("constellations." + id + ".title", L.title);
  L.myth = simT("constellations." + id + ".myth", L.myth);
  L.find = simT("constellations." + id + ".find", L.find);
}

const hitMeshes = [
  makePickSphere(umaCent, HIT_RADIUS, "uma"),
  makePickSphere(umiCent, HIT_RADIUS * 0.95, "umi"),
  makePickSphere(polarisDir, HIT_RADIUS * 0.42, "polaris"),
  makePickSphere(VENUS_UNIT, 72, "venus"),
];

for (const z of ZODIAC_DEFINITIONS) {
  const dirs = z.stars.map(([ra, dec]) => celestialDir(ra, dec));
  const cent = centroidNormalized(dirs);
  const findBody = stripZodiacHook(z.find);
  CONSTELLATIONS[z.id] = {
    labelAnchor: scaleToRadius(cent, LINE_RADIUS),
    lines: makeLineSegments(dirs, z.segments, z.colorLine),
    nodes: makeConstellationNodes(dirs, z.colorNode, 1),
    learn: {
      title: simT("zodiac." + z.id + ".title", z.title),
      myth: simT("zodiac." + z.id + ".myth", z.myth),
      find: simT("zodiac." + z.id + ".find", findBody) + " " + simT("zodiacHook", ZODIAC_HOOK),
    },
    isZodiac: true,
  };
  hitMeshes.push(makePickSphere(cent, z.hitRadius ?? HIT_RADIUS * 0.82, z.id));
}

for (const h of hitMeshes) celestialVault.add(h);

celestialVault.add(umaPolarisGuide.lines);

for (const key of Object.keys(CONSTELLATIONS)) {
  const c = CONSTELLATIONS[key];
  celestialVault.add(c.lines.lines);
  celestialVault.add(c.nodes.points);
  c._lineColorBase = c.lines.material.color.clone();
  c._nodeColorBase = c.nodes.material.color.clone();
  c._nodeSizeBase = c.nodes.material.size;
}

const HL_WHITE = new THREE.Color(0xffffff);

let activeId = null;
const dimOpacity = { line: 0.24, node: 0.42 };
const brightOpacity = { line: 1, node: 1 };
const smooth = { line: 0.16, node: 0.14 };
const hueBrightLine = 1.28;
const hueBrightNode = 1.22;
const hueDimLine = 0.92;
const hueDimNode = 0.95;
const nodeSizeActiveMul = 2.05;

function setActive(id) {
  if (activeId === id) {
    activeId = null;
    labelEl.hidden = true;
    return;
  }
  activeId = id;
  if (id === "venus") {
    learnKicker.textContent = simT("venus.kicker", "Luceafărul");
    learnTitle.textContent = simT("venus.title", "Venus · Luceafărul");
    learnMyth.textContent = simT("venus.myth", "Nu e stea. E planeta Venus.");
    learnFindText.textContent = simT(
      "venus.find",
      "E cea mai strălucitoare „stea” de pe bolta noastră după Soare și Lună: o vezi diseară spre vest sau în zori, lângă răsărit. Nori groși de acid sulfuric o fac alb-strălucitoare; de aceea pare gălbuie-portocalie jos spre orizont. Poziția pe zodii se schimbă din lună în lună — e planetă, nu punct fix ca stelele."
    );
    labelEl.hidden = false;
    return;
  }
  if (id && CONSTELLATIONS[id]) {
    const c = CONSTELLATIONS[id];
    const { title, myth, find } = c.learn;
    learnKicker.textContent = c.isZodiac
      ? simT("labels.kickerZodiac", "Zodie pe cerul real")
      : simT("labels.kickerLearn", "Învață");
    learnTitle.textContent = title;
    learnMyth.textContent = myth;
    learnFindText.textContent = find;
    labelEl.hidden = false;
  } else {
    labelEl.hidden = true;
  }
}

function lerpMaterialOpacity(material, target, speed) {
  const o = material.opacity + (target - material.opacity) * speed;
  material.opacity = o;
}

function lerpNumber(v, target, speed) {
  return v + (target - v) * speed;
}

function updateHighlights(elapsed) {
  celestialVault.updateMatrixWorld(true);
  /** Highlight: hover are prioritate; fără hover rămâne ce ai apăsat (click = doar info). */
  const visualHighlightId = hoverPickId ?? activeId;

  if (venusBillboard) {
    const visV = visualHighlightId === "venus";
    const onV = activeId === "venus";
    const baseK = THREE.MathUtils.clamp(
      window.innerHeight * 0.00108,
      0.82,
      1.42
    );
    const pulse =
      visV ? 1 : onV ? 1 + 0.055 * Math.sin(elapsed * 2.35) : 1;
    const k = baseK * pulse * (visV ? 1.06 : 1);
    venusBillboard.halo.scale.setScalar(venusBillboard.haloBase * k);
    venusBillboard.core.scale.setScalar(venusBillboard.coreBase * k);
    venusBillboard.matHalo.opacity = visV ? 1 : onV ? 0.98 : 0.85;
    venusBillboard.matCore.opacity = visV ? 1 : onV ? 1 : 0.92;
  }

  const twTarget =
    pointerOverCanvas && hoverPickId !== "venus" && !view.dragging
      ? 1
      : 0;
  starMaterial.uniforms.uHoverTwinkle.value = lerpNumber(
    starMaterial.uniforms.uHoverTwinkle.value,
    twTarget,
    0.1
  );
  for (const key of Object.keys(CONSTELLATIONS)) {
    const c = CONSTELLATIONS[key];
    const vis = visualHighlightId === key;
    let tLine = vis ? brightOpacity.line : dimOpacity.line;
    let tNode = vis ? brightOpacity.node : dimOpacity.node;
    if (key === "polaris" && vis) {
      tNode += Math.sin(elapsed * 2.2) * 0.07;
    }
    lerpMaterialOpacity(c.lines.material, tLine, smooth.line);
    lerpMaterialOpacity(c.nodes.material, tNode, smooth.node);

    if (vis) {
      c.lines.material.color
        .copy(c._lineColorBase)
        .multiplyScalar(hueBrightLine)
        .lerp(HL_WHITE, 0.28);
      c.nodes.material.color
        .copy(c._nodeColorBase)
        .multiplyScalar(hueBrightNode)
        .lerp(HL_WHITE, 0.35);
    } else {
      c.lines.material.color.copy(c._lineColorBase).multiplyScalar(hueDimLine);
      c.nodes.material.color.copy(c._nodeColorBase).multiplyScalar(hueDimNode);
    }

    const targetSize = vis
      ? c._nodeSizeBase * nodeSizeActiveMul
      : c._nodeSizeBase;
    c.nodes.material.size = lerpNumber(
      c.nodes.material.size,
      targetSize,
      vis ? 0.18 : 0.12
    );

    c.lines.lines.renderOrder = vis ? 20 : 5;
    c.nodes.points.renderOrder = vis ? 21 : 6;
  }

  const guideTargetOp = activeId === "uma" ? 0.58 : 0;
  umaPolarisGuide.material.opacity = lerpNumber(
    umaPolarisGuide.material.opacity,
    guideTargetOp,
    0.14
  );
  umaPolarisGuide.lines.renderOrder = activeId === "uma" ? 24 : 22;

  const labelWorld =
    activeId === "venus"
      ? venusLabelAnchor.clone().applyMatrix4(celestialVault.matrixWorld)
      : activeId && CONSTELLATIONS[activeId]
        ? CONSTELLATIONS[activeId].labelAnchor
            .clone()
            .applyMatrix4(celestialVault.matrixWorld)
        : null;

  if (labelWorld) {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const toStar = labelWorld.clone().normalize();
    const facing = toStar.dot(camDir);

    if (facing > 0.12) {
      const v = labelWorld.clone().project(camera);
      const panelHalfW = Math.min(window.innerWidth, 400) * 0.48;
      const pad = 16;
      let x = (v.x * 0.5 + 0.5) * window.innerWidth;
      x = Math.min(
        window.innerWidth - panelHalfW - pad,
        Math.max(panelHalfW + pad, x)
      );
      const yFromTop = Math.max(56, window.innerHeight * 0.09);
      labelEl.style.transform = `translate(${x}px, ${yFromTop}px) translate(-50%, 0)`;
      labelEl.hidden = false;
    } else {
      labelEl.hidden = true;
    }
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/** Obiect sub cursor (pick); null = cer gol → highlight la click rămas, dacă e. */
let hoverPickId = null;
let pointerOverCanvas = false;

function updatePointerHover(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    pointerOverCanvas = false;
    hoverPickId = null;
    canvas.classList.remove("is-hover-venus");
    return;
  }
  pointerOverCanvas = true;
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  pointer.set(x, y);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hitMeshes, false);
  hoverPickId = hits.length > 0 ? hits[0].object.userData.pickId : null;
  canvas.classList.toggle("is-hover-venus", hoverPickId === "venus");
}

const view = {
  dragging: false,
  lastX: 0,
  lastY: 0,
  dragThreshold: 8,
};

/** Rotație bolta fără limită la poli (fără Euler / perete). */
const vaultOrientation = new THREE.Quaternion();
const _axisWorldUp = new THREE.Vector3(0, 1, 0);
const _axisWorldRight = new THREE.Vector3(1, 0, 0);
const _qHoriz = new THREE.Quaternion();
const _qVert = new THREE.Quaternion();
const _qDelta = new THREE.Quaternion();

const ROT_DRAG_RAD_PER_PX = 0.002;

function applyVaultDelta(dx, dy, radiansPerPixel) {
  const k = radiansPerPixel;
  _qVert.setFromAxisAngle(_axisWorldRight, -dy * k);
  _qHoriz.setFromAxisAngle(_axisWorldUp, -dx * k);
  _qDelta.multiplyQuaternions(_qVert, _qHoriz);
  vaultOrientation.premultiply(_qDelta);
  vaultOrientation.normalize();
  celestialVault.quaternion.copy(vaultOrientation);
}

/** Orientare inițială: cameră fixă, bolta rotită ca să arate spre Carul Mare */
const _look = umaCent.clone().multiplyScalar(420);
camera.lookAt(_look);
vaultOrientation.copy(camera.quaternion).invert();
camera.rotation.set(0, 0, 0);
celestialVault.quaternion.copy(vaultOrientation);

let gesture = null;

function pickAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  pointer.set(x, y);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hitMeshes, false);
  if (hits.length) {
    const id = hits[0].object.userData.pickId;
    setActive(id);
  } else {
    activeId = null;
    labelEl.hidden = true;
  }
}

canvas.addEventListener("pointerdown", (ev) => {
  const moveThreshold =
    ev.pointerType === "touch" ? 12 : view.dragThreshold;
  gesture = {
    x: ev.clientX,
    y: ev.clientY,
    id: ev.pointerId,
    moved: false,
    moveThreshold,
  };
  view.dragging = true;
  view.lastX = ev.clientX;
  view.lastY = ev.clientY;
  canvas.setPointerCapture(ev.pointerId);
});

canvas.addEventListener("pointermove", (ev) => {
  updatePointerHover(ev.clientX, ev.clientY);

  if (!gesture || ev.pointerId !== gesture.id) return;
  const d = Math.hypot(ev.clientX - gesture.x, ev.clientY - gesture.y);
  if (d > gesture.moveThreshold) gesture.moved = true;

  if (!view.dragging) return;
  const dx = ev.clientX - view.lastX;
  const dy = ev.clientY - view.lastY;
  view.lastX = ev.clientX;
  view.lastY = ev.clientY;
  applyVaultDelta(dx, dy, ROT_DRAG_RAD_PER_PX);
});

canvas.addEventListener("pointerenter", (ev) => {
  updatePointerHover(ev.clientX, ev.clientY);
});

canvas.addEventListener("pointerleave", () => {
  pointerOverCanvas = false;
  hoverPickId = null;
  canvas.classList.remove("is-hover-venus");
});

function endGesture(ev) {
  if (!gesture || ev.pointerId !== gesture.id) return;
  if (!gesture.moved) {
    pickAt(ev.clientX, ev.clientY);
  }
  gesture = null;
  view.dragging = false;
  try {
    canvas.releasePointerCapture(ev.pointerId);
  } catch (_) {
    /* released */
  }
}

canvas.addEventListener("pointerup", endGesture);
canvas.addEventListener("pointercancel", endGesture);

/** Două degete pe trackpad = scroll → rotește bolta (același sens ca drag). */
const WHEEL_RAD_PER_UNIT = 0.00175;
function onWheel(ev) {
  if (ev.ctrlKey) return;
  ev.preventDefault();
  let dx = ev.deltaX;
  let dy = ev.deltaY;
  if (ev.deltaMode === 1) {
    dx *= 16;
    dy *= 16;
  } else if (ev.deltaMode === 2) {
    dx *= window.innerWidth * 0.08;
    dy *= window.innerHeight * 0.08;
  }
  applyVaultDelta(dx, dy, WHEEL_RAD_PER_UNIT);
}
canvas.addEventListener("wheel", onWheel, { passive: false });

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
}

window.addEventListener("resize", onResize);

const northCompassEl = document.querySelector("#north-compass");
if (northCompassEl) {
  northCompassEl.title = simT(
    "compass.title",
    "Acul indică Steaua polară (Polul Nord ceresc). Dubhe–Merak din Carul Mare → Polaris → nord."
  );
}
const northNeedleEl = northCompassEl?.querySelector(".north-compass-needle");
const _northPolarisDir = new THREE.Vector3();
const _northPolarisProj = new THREE.Vector3();

/** Acul mic urmărește direcția Polaris pe ecran → legătură Carul Mare → Polaris → nord */
function updateNorthCompass() {
  if (!northNeedleEl || !northCompassEl) return;
  _northPolarisDir.copy(polarisDir).normalize();
  _northPolarisDir.applyQuaternion(celestialVault.quaternion);
  _northPolarisProj.copy(_northPolarisDir).multiplyScalar(450);
  _northPolarisProj.project(camera);
  northCompassEl.classList.toggle("is-behind", _northPolarisProj.z > 1);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const sx = (_northPolarisProj.x * 0.5 + 0.5) * w;
  const sy = (-_northPolarisProj.y * 0.5 + 0.5) * h;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const angleDeg =
    (Math.atan2(sx - cx, cy - sy) * 180) / Math.PI;
  northNeedleEl.style.transform = `rotate(${angleDeg}deg)`;
}

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  skyMaterial.uniforms.uTime.value = t;
  starMaterial.uniforms.uTime.value = t;
  updateHighlights(t);
  updateNorthCompass();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
