import * as THREE from "https://unpkg.com/three@0.164.0/build/three.module.js";

(function () {
  const ELEMENT_DATA = {
    H: { name: "Hydrogen", atomicNumber: 1, valence: 1, electronegativity: 2.2, radius: 0.56, color: 0x8fd3ff, kind: "nonmetal", category: "basic" },
    O: { name: "Oxygen", atomicNumber: 8, valence: 6, electronegativity: 3.44, radius: 0.82, color: 0xff6b99, kind: "nonmetal", category: "basic" },
    C: { name: "Carbon", atomicNumber: 6, valence: 4, electronegativity: 2.55, radius: 0.77, color: 0xb8c3d6, kind: "nonmetal", category: "basic" },
    N: { name: "Nitrogen", atomicNumber: 7, valence: 5, electronegativity: 3.04, radius: 0.74, color: 0x7db1ff, kind: "nonmetal", category: "basic" },
    Cl: { name: "Chlorine", atomicNumber: 17, valence: 7, electronegativity: 3.16, radius: 0.9, color: 0x98ff87, kind: "nonmetal", category: "halogens" },
    F: { name: "Fluorine", atomicNumber: 9, valence: 7, electronegativity: 3.98, radius: 0.72, color: 0xb8ffcb, kind: "nonmetal", category: "halogens" },
    Na: { name: "Sodium", atomicNumber: 11, valence: 1, electronegativity: 0.93, radius: 0.92, color: 0xffc76d, kind: "metal", category: "alkali" },
    K: { name: "Potassium", atomicNumber: 19, valence: 1, electronegativity: 0.82, radius: 1.02, color: 0xcba7ff, kind: "metal", category: "alkali" },
    Ca: { name: "Calcium", atomicNumber: 20, valence: 2, electronegativity: 1.0, radius: 1.0, color: 0xffd7a4, kind: "metal", category: "alkaline_earth" },
    Fe: { name: "Iron", atomicNumber: 26, valence: 2, electronegativity: 1.83, radius: 0.94, color: 0xc48a74, kind: "metal", category: "transition_metals" },
    Cu: { name: "Copper", atomicNumber: 29, valence: 1, electronegativity: 1.9, radius: 0.9, color: 0xffa45e, kind: "metal", category: "transition_metals" },
    Si: { name: "Silicon", atomicNumber: 14, valence: 4, electronegativity: 1.9, radius: 0.88, color: 0x9ad2d9, kind: "semiconductor", category: "special" },
    S: { name: "Sulfur", atomicNumber: 16, valence: 6, electronegativity: 2.58, radius: 0.86, color: 0xffe37c, kind: "nonmetal", category: "special" },
    He: { name: "Helium", atomicNumber: 2, valence: 2, electronegativity: 0, radius: 0.48, color: 0xdff8ff, kind: "noble_gas", category: "special" }
  };

  const ELEMENT_CATEGORIES = [
    { id: "basic", label: "Basic" },
    { id: "halogens", label: "Halogens" },
    { id: "alkali", label: "Alkali metals" },
    { id: "alkaline_earth", label: "Alkaline earth metals" },
    { id: "transition_metals", label: "Transition metals" },
    { id: "special", label: "Special" }
  ];

  const COMBO_SUGGESTIONS = {
    "C|H": "Perechea este baza pentru CH4 si molecule organice simple.",
    "C|O": "Poti explora baza pentru CO2 si diferente intre legaturi multiple.",
    "H|Cl": "Poti forma HCl, un exemplu clasic de legatura polar covalenta.",
    "He|H": "Heliul este inert si ramane un bun contra-exemplu de nereactivitate.",
    "K|F": "Poti forma KF, cu polaritate si mai extrema decat la NaCl.",
    "N|H": "Perechea e baza pentru NH3, unde azotul pastreaza si o pereche libera.",
    "N|N": "Poti explora N2 si ideea de legatura tripla.",
    "Na|Cl": "Poti forma NaCl si urmari transferul aproape complet de electron.",
    "O|H": "Perechea e baza pentru H2O; adaugand inca un H obtii molecula apei.",
    "Ca|Cl": "Poti porni spre CaCl2; mai trebuie inca un atom de Cl pentru formula completa.",
    "Fe|Cu": "Poti compara doua metale si ideea de electron sea.",
    "Si|Si": "Poti explora un inceput de retea semiconductoare cu Si."
  };

  const INITIAL_ATOMS = [
    { type: "H", position: { x: -2.2, y: 0.1, z: 0 } },
    { type: "Cl", position: { x: 2.2, y: -0.1, z: 0 } }
  ];

  const CLOUD_POINT_COUNT = 850;
  const MAX_VISUAL_ELECTRONS = 8;
  const DRAG_BOUNDS = { minX: -5.8, maxX: 5.8, minY: -3.4, maxY: 3.4 };

  class Electron {
    constructor(index, energyLevel) {
      this.index = index;
      this.energyLevel = energyLevel;
      this.speed = 0.6 + index * 0.08;
      this.radiusFactor = 1 + (index % 3) * 0.22;
      this.phase = index * 0.77;
    }
  }

  class Atom {
    constructor(id, type, position) {
      this.id = id;
      this.position = position.clone();
      this.velocity = new THREE.Vector3();
      this.setType(type);
    }

    setType(type) {
      this.type = type;
      this.data = ELEMENT_DATA[type];
      this.valence = this.data.valence;
      this.baseElectronCount = this.data.valence;
      this.electronCount = this.baseElectronCount;
      this.electrons = Array.from(
        { length: MAX_VISUAL_ELECTRONS },
        (_, index) => new Electron(index, 1 + (index % 3))
      );
    }
  }

  class SimulationState {
    constructor(atoms) {
      this.atoms = atoms;
      this.energy = 0.35;
      this.timeScale = 1;
      this.viewMode = "classic";
      this.deltaENOverrideEnabled = false;
      this.deltaENOverride = 0.96;
      this.selectedAtomId = atoms[0]?.id ?? null;
      this.focusPairIds = atoms.length >= 2 ? [atoms[0].id, atoms[1].id] : [atoms[0]?.id ?? null, null];
      this.bondType = "none";
      this.distance = 0;
      this.deltaEN = 0;
      this.bondStrength = 0;
      this.chargeTransfer = 0;
      this.chargeSigns = [0, 0];
      this.cloudIntensity = 0;
      this.cloudSpread = 1;
      this.moreElectronegativeIndex = 1;
      this.thresholdDistance = 0;
      this.description = "";
      this.proximity = 0;
      this.polarity = 0;
      this.formationProgress = 0;
      this.pulse = 0;
      this.snap = 0;
      this.actualDeltaEN = 0;
      this.electronCounts = [atoms[0]?.baseElectronCount ?? 0, atoms[1]?.baseElectronCount ?? 0];
      this.electronDeltas = [0, 0];
      this.comboSuggestion = "Alege o pereche interesanta pentru a debloca scenarii chimice noi.";
      this.atomCharges = new Map();
      this.atomElectronCounts = new Map();
      this.atomElectronDeltas = new Map();
      this.bonds = [];
      this.activeBond = null;
      this.nextAtomId = atoms.length ? Math.max(...atoms.map((atom) => atom.id)) + 1 : 1;
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function fract(value) {
    return value - Math.floor(value);
  }

  function gaussianRandom(seed) {
    const u1 = fract(Math.sin(seed * 12.9898) * 43758.5453) || 0.0001;
    const u2 = fract(Math.sin((seed + 1) * 78.233) * 12345.6789);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(Math.PI * 2 * u2);
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
  }

  function createVector(layout) {
    return new THREE.Vector3(layout.x, layout.y, layout.z);
  }

  function tintColor(baseHex, tintHex, amount) {
    return new THREE.Color(baseHex).lerp(new THREE.Color(tintHex), clamp(amount, 0, 1));
  }

  function getChargeTint(baseHex, charge) {
    if (charge > 0.05) {
      return tintColor(baseHex, 0xff8f8f, clamp(charge * 0.9, 0, 0.65));
    }
    if (charge < -0.05) {
      return tintColor(baseHex, 0x7ecbff, clamp(Math.abs(charge) * 0.9, 0, 0.65));
    }
    return new THREE.Color(baseHex);
  }

  function getPairKey(symbolA, symbolB) {
    return [symbolA, symbolB].sort().join("|");
  }

  function getComboSuggestion(atomA, atomB) {
    return COMBO_SUGGESTIONS[getPairKey(atomA.type, atomB.type)] ||
      `Combinatia ${atomA.type} + ${atomB.type} poate fi explorata liber in simulator.`;
  }

  function createInitialAtoms() {
    return INITIAL_ATOMS.map((entry, index) => new Atom(index + 1, entry.type, createVector(entry.position)));
  }

  function getAtomById(state, atomId) {
    return state.atoms.find((atom) => atom.id === atomId) || null;
  }

  function makePairId(idA, idB) {
    return [idA, idB].sort((a, b) => a - b).join(":");
  }

  function showRuntimeError(message) {
    const sceneContainer = document.getElementById("sceneContainer");
    if (!sceneContainer) {
      return;
    }

    sceneContainer.innerHTML = "";
    const errorBox = document.createElement("div");
    errorBox.className = "scene-error";
    errorBox.textContent = message;
    sceneContainer.appendChild(errorBox);
  }

  function buildCloudMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uFormation: { value: 0 },
        uPulse: { value: 0 },
        uSize: { value: 24 },
        uColor: { value: new THREE.Color(0x8be7ff) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uFormation;
        uniform float uPulse;
        uniform float uSize;
        attribute float aSeed;
        varying float vSeed;
        varying float vIntensity;

        vec3 pseudoNoise(vec3 p, float seed) {
          return vec3(
            sin(p.y * 2.7 + uTime * 1.6 + seed * 7.3),
            cos(p.z * 3.1 - uTime * 1.2 + seed * 5.1),
            sin(p.x * 2.3 + uTime * 1.9 + seed * 4.7)
          );
        }

        void main() {
          vSeed = aSeed;
          vIntensity = uIntensity;
          vec3 displaced = position;
          vec3 flow = pseudoNoise(position, aSeed);
          float pulse = 0.14 + uFormation * 0.22 + uPulse * 0.25;
          displaced += normalize(flow + vec3(0.0001)) * pulse;

          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uSize * (0.85 + fract(aSeed * 31.73) * 0.8) * (300.0 / max(1.0, -mvPosition.z));
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uColor;
        varying float vSeed;
        varying float vIntensity;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float radius = length(uv) * 2.0;
          float circle = smoothstep(1.0, 0.18, radius);
          float core = smoothstep(0.55, 0.0, radius);
          float wave = sin((uv.x + vSeed) * 14.0 + uTime * 2.1) * sin((uv.y - vSeed) * 14.0 - uTime * 1.9);
          float alpha = circle * (0.45 + core * 0.55) * (0.82 + wave * 0.18 + uPulse * 0.28) * (0.25 + vIntensity * 0.75);
          if (alpha < 0.02) discard;
          vec3 color = uColor * (0.85 + core * 0.45 + uPulse * 0.18);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
  }

  function computePairBond(atomA, atomB, state) {
    const delta = new THREE.Vector3().subVectors(atomB.position, atomA.position);
    const distance = delta.length();
    const actualDeltaEN = Math.abs(atomA.data.electronegativity - atomB.data.electronegativity);
    const usedDeltaEN = state.deltaENOverrideEnabled ? state.deltaENOverride : actualDeltaEN;
    const strongerIndex = atomA.data.electronegativity > atomB.data.electronegativity ? 0 : 1;
    const donorIndex = 1 - strongerIndex;
    const acceptorIndex = strongerIndex;
    const innerDistance = atomA.data.radius + atomB.data.radius + 0.35;
    const thresholdDistance = atomA.data.radius + atomB.data.radius + 2.25;
    const proximity = 1 - clamp((distance - innerDistance) / (thresholdDistance - innerDistance), 0, 1);
    const bondStrength = smoothstep(0.05, 1, proximity);
    const polarity = clamp(usedDeltaEN / 2, 0, 1);
    const isMetallicPair = atomA.data.kind === "metal" && atomB.data.kind === "metal";
    const isSemiconductorPair = atomA.data.kind === "semiconductor" && atomB.data.kind === "semiconductor";
    const hasNobleGas = atomA.data.kind === "noble_gas" || atomB.data.kind === "noble_gas";

    let bondType = "none";
    let chargeTransfer = 0;
    let description = "Particulele raman difuze pana cand nucleele intra in regiunea de suprapunere.";

    if (hasNobleGas) {
      description = "Gazele nobile raman aproape complet inerte, chiar daca apropii atomii.";
    } else if (bondStrength > 0.08) {
      if (isSemiconductorPair) {
        bondType = "semiconductor";
        chargeTransfer = 0.1 * bondStrength;
        description = "Orbitalii se aliniaza ca intr-o retea, iar transferul ramane controlat energetic.";
      } else if (isMetallicPair) {
        bondType = "metallic";
        chargeTransfer = 0.08 * bondStrength;
        description = "Electronii devin delocalizati si curg printr-un nor comun de tip electron sea.";
      } else if (usedDeltaEN < 0.4) {
        bondType = "covalent";
        chargeTransfer = 0.12 * bondStrength;
        description = "Un electron de legatura oscileaza intre nuclee, iar norul ramane aproape simetric.";
      } else if (usedDeltaEN < 1.7) {
        bondType = "polar_covalent";
        chargeTransfer = lerp(0.18, 0.48, clamp(usedDeltaEN / 1.7, 0, 1)) * bondStrength;
        description = "Norul devine polarizat si fluxul electronic este tras spre atomul mai electronegativ.";
      } else {
        bondType = "ionic";
        chargeTransfer = lerp(0.68, 0.96, clamp(usedDeltaEN / 3.5, 0, 1)) * bondStrength;
        description = "Momentul de bonding impinge electronul spre acceptor si separa clar donatorul de acceptor.";
      }
    }

    const electronDeltas = [0, 0];
    if (bondType === "ionic") {
      electronDeltas[donorIndex] = -chargeTransfer;
      electronDeltas[acceptorIndex] = chargeTransfer;
    } else if (bondType === "polar_covalent") {
      electronDeltas[donorIndex] = -chargeTransfer * 0.55;
      electronDeltas[acceptorIndex] = chargeTransfer * 0.55;
    } else if (bondType === "covalent") {
      electronDeltas[donorIndex] = -chargeTransfer * 0.18;
      electronDeltas[acceptorIndex] = chargeTransfer * 0.18;
    }

    const chargeSigns =
      bondType === "none" || bondType === "metallic" || bondType === "semiconductor"
        ? [0, 0]
        : strongerIndex === 0
          ? [-chargeTransfer, chargeTransfer]
          : [chargeTransfer, -chargeTransfer];

    const acceptorGain = Math.max(0, electronDeltas[acceptorIndex] || 0);
    const donorLoss = Math.max(0, -(electronDeltas[donorIndex] || 0));
    const cloudIntensity = clamp(
      bondStrength * (0.32 + state.energy * 0.45 + polarity * 0.55 + acceptorGain * 0.35 + donorLoss * 0.22),
      0,
      1
    );
    const cloudSpread = lerp(1.5, 0.6, clamp(usedDeltaEN / 2.5, 0, 1)) * (1 + acceptorGain * 0.08 - donorLoss * 0.06);

    return {
      id: makePairId(atomA.id, atomB.id),
      atomIds: [atomA.id, atomB.id],
      atoms: [atomA, atomB],
      distance,
      actualDeltaEN,
      deltaEN: usedDeltaEN,
      thresholdDistance,
      bondType,
      bondStrength,
      chargeTransfer,
      chargeSigns,
      electronDeltas,
      cloudIntensity,
      cloudSpread,
      description,
      proximity,
      polarity,
      strongerIndex,
      donorIndex,
      acceptorIndex,
      comboSuggestion: getComboSuggestion(atomA, atomB)
    };
  }

  function computeSystemState(state) {
    const previousBondType = state.bondType;
    const previousStrength = state.bondStrength;
    const analyses = [];
    const activeMap = new Map();
    const atomCharges = new Map();
    const atomElectronDeltas = new Map();
    const atomElectronCounts = new Map();

    state.atoms.forEach((atom) => {
      atomCharges.set(atom.id, 0);
      atomElectronDeltas.set(atom.id, 0);
      atomElectronCounts.set(atom.id, atom.baseElectronCount);
    });

    for (let i = 0; i < state.atoms.length; i += 1) {
      for (let j = i + 1; j < state.atoms.length; j += 1) {
        const pair = computePairBond(state.atoms[i], state.atoms[j], state);
        analyses.push(pair);
        activeMap.set(pair.id, pair);

        if (pair.bondType !== "none") {
          atomCharges.set(pair.atomIds[0], atomCharges.get(pair.atomIds[0]) + pair.chargeSigns[0]);
          atomCharges.set(pair.atomIds[1], atomCharges.get(pair.atomIds[1]) + pair.chargeSigns[1]);
          atomElectronDeltas.set(pair.atomIds[0], atomElectronDeltas.get(pair.atomIds[0]) + pair.electronDeltas[0]);
          atomElectronDeltas.set(pair.atomIds[1], atomElectronDeltas.get(pair.atomIds[1]) + pair.electronDeltas[1]);
        }
      }
    }

    state.atoms.forEach((atom) => {
      const electronCount = clamp(atom.baseElectronCount + atomElectronDeltas.get(atom.id), 0, MAX_VISUAL_ELECTRONS);
      atom.electronCount = electronCount;
      atomElectronCounts.set(atom.id, electronCount);
    });

    let activeBond = null;
    const [focusIdA, focusIdB] = state.focusPairIds;
    if (focusIdA != null && focusIdB != null && focusIdA !== focusIdB) {
      activeBond = activeMap.get(makePairId(focusIdA, focusIdB)) || null;
    }

    if (!activeBond) {
      const strongestBond = analyses
        .filter((pair) => pair.bondType !== "none")
        .sort((left, right) => right.bondStrength - left.bondStrength)[0];
      activeBond = strongestBond || analyses[0] || null;
    }

    state.bonds = analyses.filter((pair) => pair.bondType !== "none" && pair.bondStrength > 0.05);
    state.activeBond = activeBond;
    state.atomCharges = atomCharges;
    state.atomElectronDeltas = atomElectronDeltas;
    state.atomElectronCounts = atomElectronCounts;

    if (activeBond) {
      state.distance = activeBond.distance;
      state.actualDeltaEN = activeBond.actualDeltaEN;
      state.deltaEN = activeBond.deltaEN;
      state.thresholdDistance = activeBond.thresholdDistance;
      state.bondType = activeBond.bondType;
      state.bondStrength = activeBond.bondStrength;
      state.chargeTransfer = activeBond.chargeTransfer;
      state.moreElectronegativeIndex = activeBond.strongerIndex;
      state.cloudIntensity = activeBond.cloudIntensity;
      state.cloudSpread = activeBond.cloudSpread;
      state.description = activeBond.description;
      state.proximity = activeBond.proximity;
      state.polarity = activeBond.polarity;
      state.chargeSigns = activeBond.chargeSigns;
      state.electronDeltas = activeBond.electronDeltas;
      state.electronCounts = [
        atomElectronCounts.get(activeBond.atomIds[0]),
        atomElectronCounts.get(activeBond.atomIds[1])
      ];
      state.comboSuggestion = activeBond.comboSuggestion;
    } else {
      state.distance = 0;
      state.actualDeltaEN = 0;
      state.deltaEN = state.deltaENOverrideEnabled ? state.deltaENOverride : 0;
      state.thresholdDistance = 0;
      state.bondType = "none";
      state.bondStrength = 0;
      state.chargeTransfer = 0;
      state.cloudIntensity = 0;
      state.cloudSpread = 1;
      state.description = "Adauga inca un atom pentru a explora legaturi.";
      state.proximity = 0;
      state.polarity = 0;
      state.chargeSigns = [0, 0];
      state.electronDeltas = [0, 0];
      state.electronCounts = [0, 0];
      state.comboSuggestion = "Alege o pereche interesanta pentru a debloca scenarii chimice noi.";
    }

    if (previousBondType !== state.bondType && state.bondType !== "none") {
      state.pulse = Math.max(state.pulse, 1);
      state.snap = Math.max(state.snap, 1);
    } else if (state.bondType !== "none" && state.bondStrength - previousStrength > 0.18) {
      state.pulse = Math.max(state.pulse, 0.55);
    }
  }

  function init() {
    const dom = {
      app: document.getElementById("app"),
      sceneContainer: document.getElementById("sceneContainer"),
      atomTooltip: document.getElementById("atomTooltip"),
      atomASelect: document.getElementById("atomASelect"),
      atomBSelect: document.getElementById("atomBSelect"),
      newAtomSelect: document.getElementById("newAtomSelect"),
      addAtomButton: document.getElementById("addAtomButton"),
      removeAtomButton: document.getElementById("removeAtomButton"),
      atomCountValue: document.getElementById("atomCountValue"),
      selectedAtomValue: document.getElementById("selectedAtomValue"),
      energySlider: document.getElementById("energySlider"),
      energyValue: document.getElementById("energyValue"),
      deltaOverrideToggle: document.getElementById("deltaOverrideToggle"),
      deltaEnOverrideSlider: document.getElementById("deltaEnOverrideSlider"),
      deltaEnOverrideValue: document.getElementById("deltaEnOverrideValue"),
      timeScaleSlider: document.getElementById("timeScaleSlider"),
      timeScaleValue: document.getElementById("timeScaleValue"),
      classicModeButton: document.getElementById("classicModeButton"),
      quantumModeButton: document.getElementById("quantumModeButton"),
      bondTypeBadge: document.getElementById("bondTypeBadge"),
      distanceValue: document.getElementById("distanceValue"),
      deltaEnValue: document.getElementById("deltaEnValue"),
      bondStrengthValue: document.getElementById("bondStrengthValue"),
      chargeValue: document.getElementById("chargeValue"),
      comboSuggestionValue: document.getElementById("comboSuggestionValue"),
      bondDescription: document.getElementById("bondDescription"),
      resetButton: document.getElementById("resetButton"),
      leftPanelToggle: document.getElementById("leftPanelToggle"),
      rightPanelToggle: document.getElementById("rightPanelToggle")
    };

    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      dom.app.classList.add("left-collapsed", "right-collapsed");
    }

    const state = new SimulationState(createInitialAtoms());
    const sceneState = {
      pointer: new THREE.Vector2(),
      raycaster: new THREE.Raycaster(),
      dragPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      dragOffset: new THREE.Vector3(),
      draggingAtomId: null,
      hoveredAtomId: null,
      clock: new THREE.Clock(),
      simTime: 0,
      cloudSeeds: Array.from({ length: CLOUD_POINT_COUNT }, (_, index) => ({
        base: index + 1,
        lane: fract(Math.sin((index + 1) * 7.123) * 43758.5453) * 2 - 1,
        swirl: fract(Math.sin((index + 1) * 3.731) * 15731.743) * 2 - 1,
        phase: fract(Math.sin((index + 1) * 9.317) * 25317.319) * Math.PI * 2
      }))
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040913);
    scene.fog = new THREE.Fog(0x040913, 9, 22);

    const containerWidth = dom.sceneContainer.clientWidth || window.innerWidth;
    const containerHeight = dom.sceneContainer.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, containerWidth / containerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 10.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerWidth, containerHeight);
    dom.sceneContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xa3b8ff, 1.8);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 7, 8);
    const fillLight = new THREE.DirectionalLight(0x66c2ff, 0.9);
    fillLight.position.set(-6, -4, 6);
    scene.add(ambientLight, keyLight, fillLight);

    const floorGrid = new THREE.GridHelper(16, 16, 0x1e355e, 0x10203b);
    floorGrid.rotation.x = Math.PI / 2;
    floorGrid.position.z = -0.35;
    floorGrid.material.transparent = true;
    floorGrid.material.opacity = 0.18;
    scene.add(floorGrid);

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    const visualsById = new Map();

    function createAtomVisual(atom) {
      const group = new THREE.Group();
      group.userData.atomId = atom.id;

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(atom.data.radius, 32, 32),
        new THREE.MeshPhysicalMaterial({
          color: atom.data.color,
          emissive: atom.data.color,
          emissiveIntensity: 0.14,
          roughness: 0.28,
          metalness: atom.data.kind === "metal" ? 0.25 : 0.08,
          clearcoat: 0.35
        })
      );
      nucleus.userData.atomId = atom.id;
      group.add(nucleus);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(atom.data.radius * 1.24, 32, 32),
        new THREE.MeshBasicMaterial({
          color: atom.data.color,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide
        })
      );
      group.add(halo);

      const electrons = atom.electrons.map(() => {
        const electronMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xe7f2ff, transparent: true, opacity: 0.88 })
        );
        group.add(electronMesh);
        return electronMesh;
      });

      atomGroup.add(group);
      visualsById.set(atom.id, { group, nucleus, halo, electrons });
    }

    function rebuildAtomVisuals() {
      atomGroup.clear();
      visualsById.clear();
      state.atoms.forEach((atom) => createAtomVisual(atom));
    }

    rebuildAtomVisuals();

    const bondMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    const bondGeometry = new THREE.BufferGeometry();
    const bondLines = new THREE.LineSegments(bondGeometry, bondMaterial);
    scene.add(bondLines);

    const bondPulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x8be7ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(bondPulse);

    const storyElectron = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0xf5fbff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(storyElectron);

    const cloudGeometry = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(CLOUD_POINT_COUNT * 3);
    const cloudSeedsArray = new Float32Array(CLOUD_POINT_COUNT);
    sceneState.cloudSeeds.forEach((seed, index) => {
      cloudSeedsArray[index] = seed.base * 0.0137 + seed.phase;
    });
    cloudGeometry.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));
    cloudGeometry.setAttribute("aSeed", new THREE.BufferAttribute(cloudSeedsArray, 1));

    const cloudMaterial = buildCloudMaterial();
    const cloudPoints = new THREE.Points(cloudGeometry, cloudMaterial);
    cloudPoints.frustumCulled = false;
    scene.add(cloudPoints);

    populateElementOptions();
    populateFocusSelectors();
    computeSystemState(state);
    updateControlStates();
    updateViewMode();
    updateUI();
    bindUI();
    animate();

    function populateElementOptions() {
      dom.newAtomSelect.innerHTML = "";
      ELEMENT_CATEGORIES.forEach((category) => {
        const group = document.createElement("optgroup");
        group.label = category.label;
        Object.entries(ELEMENT_DATA)
          .filter(([, data]) => data.category === category.id)
          .forEach(([symbol, data]) => {
            const option = document.createElement("option");
            option.value = symbol;
            option.textContent = `${symbol} - ${data.name}`;
            group.appendChild(option);
          });
        if (group.children.length) {
          dom.newAtomSelect.appendChild(group);
        }
      });
      dom.newAtomSelect.value = "C";
    }

    function populateFocusSelectors() {
      const values = [...state.focusPairIds];
      [dom.atomASelect, dom.atomBSelect].forEach((select) => {
        select.innerHTML = "";
        state.atoms.forEach((atom, index) => {
          const option = document.createElement("option");
          option.value = String(atom.id);
          option.textContent = `Atom ${index + 1} - ${atom.type}`;
          select.appendChild(option);
        });
      });

      if (state.atoms.length === 1) {
        state.focusPairIds = [state.atoms[0].id, state.atoms[0].id];
      } else if (state.atoms.length >= 2) {
        const validA = values[0] != null && getAtomById(state, values[0]);
        const validB = values[1] != null && getAtomById(state, values[1]);
        state.focusPairIds = [
          validA ? values[0] : state.atoms[0].id,
          validB ? values[1] : state.atoms[1].id
        ];
      }

      dom.atomASelect.value = String(state.focusPairIds[0] ?? state.atoms[0]?.id ?? "");
      dom.atomBSelect.value = String(state.focusPairIds[1] ?? state.atoms[1]?.id ?? "");
    }

    function bindUI() {
      dom.atomASelect.addEventListener("change", () => {
        state.focusPairIds[0] = Number(dom.atomASelect.value);
        computeSystemState(state);
        updateUI();
      });

      dom.atomBSelect.addEventListener("change", () => {
        state.focusPairIds[1] = Number(dom.atomBSelect.value);
        computeSystemState(state);
        updateUI();
      });

      dom.addAtomButton.addEventListener("click", () => {
        addAtom(dom.newAtomSelect.value);
      });

      dom.removeAtomButton.addEventListener("click", () => {
        removeSelectedAtom();
      });

      dom.energySlider.addEventListener("input", () => {
        state.energy = Number(dom.energySlider.value) / 100;
        dom.energyValue.textContent = `${dom.energySlider.value}%`;
        computeSystemState(state);
        updateUI();
      });

      dom.deltaOverrideToggle.addEventListener("change", () => {
        state.deltaENOverrideEnabled = dom.deltaOverrideToggle.checked;
        computeSystemState(state);
        updateControlStates();
        updateUI();
      });

      dom.deltaEnOverrideSlider.addEventListener("input", () => {
        state.deltaENOverride = Number(dom.deltaEnOverrideSlider.value);
        dom.deltaEnOverrideValue.textContent = state.deltaENOverride.toFixed(2);
        if (state.deltaENOverrideEnabled) {
          computeSystemState(state);
          updateUI();
        }
      });

      dom.timeScaleSlider.addEventListener("input", () => {
        state.timeScale = Number(dom.timeScaleSlider.value) / 100;
        dom.timeScaleValue.textContent = `${dom.timeScaleSlider.value}%`;
      });

      dom.classicModeButton.addEventListener("click", () => {
        state.viewMode = "classic";
        updateViewMode();
      });

      dom.quantumModeButton.addEventListener("click", () => {
        state.viewMode = "quantum";
        updateViewMode();
      });

      dom.resetButton.addEventListener("click", () => {
        resetAtoms();
        computeSystemState(state);
        updateUI();
      });

      dom.leftPanelToggle.addEventListener("click", () => {
        dom.app.classList.toggle("left-collapsed");
        setTimeout(onResize, 360);
      });

      dom.rightPanelToggle.addEventListener("click", () => {
        dom.app.classList.toggle("right-collapsed");
        setTimeout(onResize, 360);
      });

      window.addEventListener("resize", onResize);
      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", hideTooltip);
      window.addEventListener("pointerup", onPointerUp);
    }

    function addAtom(type) {
      const count = state.atoms.length;
      const angle = count * 1.33;
      const radius = 1.6 + count * 0.18;
      const position = new THREE.Vector3(
        clamp(Math.cos(angle) * radius, DRAG_BOUNDS.minX, DRAG_BOUNDS.maxX),
        clamp(Math.sin(angle) * radius * 0.72, DRAG_BOUNDS.minY, DRAG_BOUNDS.maxY),
        0
      );

      const atom = new Atom(state.nextAtomId, type, position);
      state.nextAtomId += 1;
      state.atoms.push(atom);
      state.selectedAtomId = atom.id;
      if (state.atoms.length >= 2) {
        state.focusPairIds = [state.atoms[state.atoms.length - 2].id, atom.id];
      }

      createAtomVisual(atom);
      populateFocusSelectors();
      computeSystemState(state);
      updateUI();
    }

    function removeSelectedAtom() {
      if (state.atoms.length <= 1 || state.selectedAtomId == null) {
        return;
      }

      const removeIndex = state.atoms.findIndex((atom) => atom.id === state.selectedAtomId);
      if (removeIndex === -1) {
        return;
      }

      const removed = state.atoms.splice(removeIndex, 1)[0];
      const visuals = visualsById.get(removed.id);
      if (visuals) {
        atomGroup.remove(visuals.group);
        visualsById.delete(removed.id);
      }

      state.selectedAtomId = state.atoms[Math.max(0, removeIndex - 1)]?.id ?? state.atoms[0]?.id ?? null;
      if (state.atoms.length >= 2) {
        state.focusPairIds = [state.atoms[0].id, state.atoms[1].id];
      } else {
        state.focusPairIds = [state.atoms[0]?.id ?? null, null];
      }

      populateFocusSelectors();
      computeSystemState(state);
      updateUI();
    }

    function resetAtoms() {
      state.atoms = createInitialAtoms();
      state.nextAtomId = state.atoms.length + 1;
      state.selectedAtomId = state.atoms[0].id;
      state.focusPairIds = [state.atoms[0].id, state.atoms[1].id];
      state.pulse = 0;
      state.snap = 0;
      state.formationProgress = 0;
      rebuildAtomVisuals();
      populateFocusSelectors();
    }

    function updateControlStates() {
      dom.deltaEnOverrideSlider.disabled = !state.deltaENOverrideEnabled;
      dom.removeAtomButton.disabled = state.atoms.length <= 1;
    }

    function onResize() {
      const width = dom.sceneContainer.clientWidth || window.innerWidth;
      const height = dom.sceneContainer.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function getIntersections(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      sceneState.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      sceneState.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      sceneState.raycaster.setFromCamera(sceneState.pointer, camera);
      const nuclei = [...visualsById.values()].map((visual) => visual.nucleus);
      return sceneState.raycaster.intersectObjects(nuclei, false);
    }

    function updateTooltip(event) {
      if (sceneState.hoveredAtomId == null || sceneState.draggingAtomId != null) {
        hideTooltip();
        return;
      }

      const atom = getAtomById(state, sceneState.hoveredAtomId);
      if (!atom) {
        hideTooltip();
        return;
      }

      const rect = dom.sceneContainer.getBoundingClientRect();
      dom.atomTooltip.classList.remove("is-hidden");
      dom.atomTooltip.innerHTML = `<strong>${atom.type} · ${atom.data.name}</strong><span>Z = ${atom.data.atomicNumber}</span><span>Valenta = ${atom.data.valence}</span><span>EN = ${atom.data.electronegativity.toFixed(2)}</span><span>Electroni activi = ${atom.electronCount.toFixed(2)}</span>`;
      dom.atomTooltip.style.left = `${event.clientX - rect.left + 16}px`;
      dom.atomTooltip.style.top = `${event.clientY - rect.top + 16}px`;
    }

    function hideTooltip() {
      dom.atomTooltip.classList.add("is-hidden");
    }

    function onPointerDown(event) {
      const intersections = getIntersections(event.clientX, event.clientY);
      if (!intersections.length) {
        return;
      }

      const atomId = intersections[0].object.userData.atomId;
      sceneState.draggingAtomId = atomId;
      state.selectedAtomId = atomId;
      renderer.domElement.setPointerCapture(event.pointerId);
      hideTooltip();

      const hitPoint = new THREE.Vector3();
      sceneState.raycaster.ray.intersectPlane(sceneState.dragPlane, hitPoint);
      sceneState.dragOffset.subVectors(getAtomById(state, atomId).position, hitPoint);
      updateUI();
    }

    function onPointerMove(event) {
      const intersections = getIntersections(event.clientX, event.clientY);
      sceneState.hoveredAtomId = intersections.length ? intersections[0].object.userData.atomId : null;

      if (sceneState.draggingAtomId == null) {
        renderer.domElement.style.cursor = sceneState.hoveredAtomId == null ? "grab" : "pointer";
        updateTooltip(event);
        return;
      }

      const planeHit = new THREE.Vector3();
      sceneState.raycaster.ray.intersectPlane(sceneState.dragPlane, planeHit);
      planeHit.add(sceneState.dragOffset);

      const atom = getAtomById(state, sceneState.draggingAtomId);
      atom.position.set(
        clamp(planeHit.x, DRAG_BOUNDS.minX, DRAG_BOUNDS.maxX),
        clamp(planeHit.y, DRAG_BOUNDS.minY, DRAG_BOUNDS.maxY),
        0
      );
      atom.velocity.set(0, 0, 0);

      computeSystemState(state);
      updateUI();
    }

    function onPointerUp(event) {
      if (sceneState.draggingAtomId != null) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      sceneState.draggingAtomId = null;
      renderer.domElement.style.cursor = sceneState.hoveredAtomId == null ? "grab" : "pointer";
      hideTooltip();
    }

    function updateViewMode() {
      dom.classicModeButton.classList.toggle("is-active", state.viewMode === "classic");
      dom.quantumModeButton.classList.toggle("is-active", state.viewMode === "quantum");
      updateUI();
    }

    function updateUI() {
      dom.bondTypeBadge.textContent = state.bondType;
      dom.bondTypeBadge.className = `bond-badge ${state.bondType}`;
      dom.distanceValue.textContent = state.distance.toFixed(2);
      dom.deltaEnValue.textContent = state.deltaENOverrideEnabled
        ? `${state.deltaEN.toFixed(2)} manual`
        : state.deltaEN.toFixed(2);
      dom.bondStrengthValue.textContent = `${Math.round(state.bondStrength * 100)}%`;
      dom.comboSuggestionValue.textContent = state.comboSuggestion;
      dom.atomCountValue.textContent = String(state.atoms.length);

      const selectedAtom = getAtomById(state, state.selectedAtomId);
      dom.selectedAtomValue.textContent = selectedAtom
        ? `${selectedAtom.type} #${state.atoms.findIndex((atom) => atom.id === selectedAtom.id) + 1}`
        : "none";

      const activeCharges = state.activeBond
        ? state.activeBond.atomIds.map((atomId) => formatSignedCharge(state.atomCharges.get(atomId) || 0))
        : ["0.00", "0.00"];
      dom.chargeValue.textContent = `${activeCharges[0]} / ${activeCharges[1]}`;

      const modeText = state.viewMode === "classic"
        ? "Mod classic: electron narativ, transfer vizibil si miscari pe orbite."
        : "Mod quantum: shader cu noise, pulsatie, snap de bonding si deformare in apropiere.";
      dom.bondDescription.textContent = `${state.description} ${modeText}`;

      updateControlStates();
    }

    function formatSignedCharge(value) {
      const rounded = Math.abs(value) < 0.05 ? 0 : value;
      const prefix = rounded > 0 ? "+" : "";
      return `${prefix}${rounded.toFixed(2)}`;
    }

    function applyAtomicForces(deltaTime) {
      const analyses = state.bonds.length ? state.bonds : [];
      const map = new Map(analyses.map((bond) => [bond.id, bond]));

      for (let i = 0; i < state.atoms.length; i += 1) {
        for (let j = i + 1; j < state.atoms.length; j += 1) {
          const atomA = state.atoms[i];
          const atomB = state.atoms[j];
          const delta = new THREE.Vector3().subVectors(atomB.position, atomA.position);
          const distance = Math.max(delta.length(), 0.001);
          const axis = delta.clone().normalize();
          const pair = map.get(makePairId(atomA.id, atomB.id)) || computePairBond(atomA, atomB, state);
          const repelThreshold = atomA.data.radius + atomB.data.radius + 0.55;
          const preferredDistance = atomA.data.radius + atomB.data.radius + 0.95;

          let forceMag = 0;
          if (distance < repelThreshold) {
            forceMag = -(repelThreshold - distance) * 7.5;
          } else if (distance < pair.thresholdDistance) {
            forceMag = (distance - preferredDistance) * (0.45 + pair.proximity * 1.05);
          }

          const q1 = state.atomCharges.get(atomA.id) || 0;
          const q2 = state.atomCharges.get(atomB.id) || 0;
          const chargeProduct = q1 * q2;
          if (Math.abs(chargeProduct) > 0.002) {
            const coulombMagnitude = (2.4 * Math.abs(chargeProduct)) / (distance * distance + 0.25);
            forceMag += chargeProduct < 0 ? coulombMagnitude : -coulombMagnitude;
          }

          if (sceneState.draggingAtomId == null) {
            atomA.velocity.addScaledVector(axis, forceMag * deltaTime * 0.5);
            atomB.velocity.addScaledVector(axis, -forceMag * deltaTime * 0.5);
          } else if (atomA.id !== sceneState.draggingAtomId && atomB.id !== sceneState.draggingAtomId) {
            atomA.velocity.addScaledVector(axis, forceMag * deltaTime * 0.5);
            atomB.velocity.addScaledVector(axis, -forceMag * deltaTime * 0.5);
          } else {
            const freeAtom = atomA.id === sceneState.draggingAtomId ? atomB : atomA;
            const direction = freeAtom === atomA ? axis.clone().negate() : axis.clone();
            freeAtom.velocity.addScaledVector(direction, Math.abs(forceMag) * deltaTime * 0.7);
          }
        }
      }

      state.atoms.forEach((atom) => {
        if (sceneState.draggingAtomId === atom.id) {
          atom.velocity.set(0, 0, 0);
          return;
        }

        atom.velocity.multiplyScalar(Math.pow(0.88, deltaTime * 60));
        atom.position.addScaledVector(atom.velocity, deltaTime);
        atom.position.set(
          clamp(atom.position.x, DRAG_BOUNDS.minX, DRAG_BOUNDS.maxX),
          clamp(atom.position.y, DRAG_BOUNDS.minY, DRAG_BOUNDS.maxY),
          0
        );
      });
    }

    function updateAtomVisuals(simTime) {
      state.atoms.forEach((atom) => {
        const visuals = visualsById.get(atom.id);
        const isHovered = sceneState.hoveredAtomId === atom.id;
        const isSelected = state.selectedAtomId === atom.id;
        const charge = state.atomCharges.get(atom.id) || 0;
        const electronCount = clamp(state.atomElectronCounts.get(atom.id) ?? atom.baseElectronCount, 0, MAX_VISUAL_ELECTRONS);
        const countRatio = clamp(electronCount / Math.max(1, atom.baseElectronCount), 0.35, 1.8);
        const tint = getChargeTint(atom.data.color, charge);

        visuals.group.position.copy(atom.position);
        visuals.group.scale.setScalar(1 + (isHovered ? 0.08 : 0) + (isSelected ? 0.06 : 0) + state.snap * 0.04);
        visuals.halo.scale.setScalar((0.84 + countRatio * 0.3) + state.energy * 0.12 + state.formationProgress * 0.16 + state.pulse * 0.22);
        visuals.halo.material.opacity = 0.05 + state.formationProgress * 0.08 + state.pulse * 0.12 + (isHovered ? 0.06 : 0) + (isSelected ? 0.06 : 0) + Math.abs(charge) * 0.08;
        visuals.nucleus.material.color.copy(tint);
        visuals.nucleus.material.emissive.copy(tint);
        visuals.halo.material.color.copy(tint);
        visuals.nucleus.material.emissiveIntensity = 0.12 + state.formationProgress * 0.24 + state.pulse * 0.2 + Math.abs(charge) * 0.14;

        const electronBias = charge * 0.22;
        visuals.electrons.forEach((electronMesh, electronIndex) => {
          const electron = atom.electrons[electronIndex];
          const wholeElectrons = Math.floor(electronCount);
          const fractionalElectron = electronCount - wholeElectrons;
          const hasWholeElectron = electronIndex < wholeElectrons;
          const hasFractionalElectron = electronIndex === wholeElectrons && fractionalElectron > 0.04;
          const isVisible = hasWholeElectron || hasFractionalElectron;

          electronMesh.visible = state.viewMode === "classic" && isVisible;
          if (!isVisible) {
            return;
          }

          let orbitRadius = atom.data.radius * (
            1.65 +
            electron.radiusFactor * 0.22 +
            state.energy * 0.35 +
            electronBias
          ) * lerp(0.78, 1.24, clamp((countRatio - 0.35) / 1.45, 0, 1));
          const angle = simTime * electron.speed * (1 + state.energy * 1.2) + electron.phase;
          let localX = Math.cos(angle) * orbitRadius;
          let localY = Math.sin(angle) * orbitRadius;
          let localZ = Math.sin(angle * 1.7 + electron.phase) * 0.24;

          if (state.activeBond && state.activeBond.bondType === "ionic" && state.activeBond.atomIds.includes(atom.id) && electronIndex === 0) {
            const localIndex = state.activeBond.atomIds[0] === atom.id ? 0 : 1;
            if (localIndex !== state.activeBond.acceptorIndex) {
              const transferOut = easeOutCubic(state.formationProgress);
              localX = lerp(localX, 0, transferOut);
              localY = lerp(localY, 0, transferOut);
              localZ = lerp(localZ, 0, transferOut);
              electronMesh.material.opacity = 0.88 * (1 - transferOut);
            } else {
              electronMesh.material.opacity = 0.88;
            }
          } else {
            electronMesh.material.opacity = 0.88;
          }

          electronMesh.position.set(localX, localY, localZ);
          electronMesh.material.opacity *= hasFractionalElectron ? fractionalElectron : 1;
        });
      });
    }

    function updateStoryElectron(simTime) {
      const pair = state.activeBond;
      storyElectron.visible = state.viewMode === "classic" && !!pair && pair.bondType !== "none";
      if (!storyElectron.visible) {
        storyElectron.material.opacity = 0;
        return;
      }

      const atomA = getAtomById(state, pair.atomIds[0]);
      const atomB = getAtomById(state, pair.atomIds[1]);
      const axis = new THREE.Vector3().subVectors(atomB.position, atomA.position).normalize();
      const tangent = new THREE.Vector3(-axis.y, axis.x, 0).normalize();
      const midpoint = new THREE.Vector3().addVectors(atomA.position, atomB.position).multiplyScalar(0.5);
      const acceptor = pair.atoms[pair.acceptorIndex];
      const donor = pair.atoms[pair.donorIndex];

      let position = midpoint.clone();
      let color = 0xf5fbff;
      const amplitude = pair.distance * 0.32;

      if (pair.bondType === "covalent") {
        position
          .addScaledVector(axis, Math.sin(simTime * 1.8) * amplitude)
          .addScaledVector(tangent, Math.cos(simTime * 3.2) * 0.18);
        color = 0xb8f5ff;
      } else if (pair.bondType === "polar_covalent") {
        position = midpoint.clone().lerp(acceptor.position, 0.14 + pair.polarity * 0.18);
        position
          .addScaledVector(axis, Math.sin(simTime * 1.65) * amplitude * (0.72 - pair.polarity * 0.2))
          .addScaledVector(tangent, Math.sin(simTime * 2.8) * 0.14);
        color = 0xfff29f;
      } else if (pair.bondType === "ionic") {
        const transfer = easeOutCubic(state.formationProgress);
        position = donor.position.clone().lerp(acceptor.position, clamp(transfer * 1.1, 0, 1));
        position.addScaledVector(tangent, Math.sin(simTime * 4) * 0.12);
        color = 0xffc8ba;
      } else if (pair.bondType === "semiconductor") {
        position = midpoint
          .clone()
          .addScaledVector(axis, Math.sin(simTime * 1.4) * pair.distance * 0.18)
          .addScaledVector(tangent, Math.sin(simTime * 3.5) * 0.1);
        color = 0xc6a8ff;
      } else if (pair.bondType === "metallic") {
        position = midpoint
          .clone()
          .addScaledVector(axis, Math.sin(simTime * 1.2 + 0.7) * pair.distance * 0.45)
          .addScaledVector(tangent, Math.cos(simTime * 2.6) * 0.45);
        color = 0x9beeff;
      }

      storyElectron.position.copy(position);
      storyElectron.material.color.setHex(color);
      storyElectron.material.opacity = 0.45 + state.pulse * 0.3;
      storyElectron.scale.setScalar(1 + state.pulse * 0.6);
    }

    function updateBondVisuals() {
      const colors = {
        covalent: new THREE.Color(0x7fffb1),
        polar_covalent: new THREE.Color(0xffd46f),
        ionic: new THREE.Color(0xff8f8f),
        metallic: new THREE.Color(0x84f0ff),
        semiconductor: new THREE.Color(0xc6a8ff)
      };

      const visibleBonds = state.bonds.filter((bond) => bond.bondType !== "none");
      const positions = new Float32Array(Math.max(visibleBonds.length, 1) * 6);
      const colorArray = new Float32Array(Math.max(visibleBonds.length, 1) * 6);

      visibleBonds.forEach((bond, index) => {
        const atomA = getAtomById(state, bond.atomIds[0]);
        const atomB = getAtomById(state, bond.atomIds[1]);
        const color = colors[bond.bondType] || new THREE.Color(0x6b7c98);
        const offset = index * 6;

        positions[offset] = atomA.position.x;
        positions[offset + 1] = atomA.position.y;
        positions[offset + 2] = atomA.position.z;
        positions[offset + 3] = atomB.position.x;
        positions[offset + 4] = atomB.position.y;
        positions[offset + 5] = atomB.position.z;

        colorArray[offset] = color.r;
        colorArray[offset + 1] = color.g;
        colorArray[offset + 2] = color.b;
        colorArray[offset + 3] = color.r;
        colorArray[offset + 4] = color.g;
        colorArray[offset + 5] = color.b;
      });

      bondGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      bondGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
      bondGeometry.computeBoundingSphere();
      bondLines.visible = visibleBonds.length > 0;

      if (state.activeBond) {
        const atomA = getAtomById(state, state.activeBond.atomIds[0]);
        const atomB = getAtomById(state, state.activeBond.atomIds[1]);
        const midpoint = new THREE.Vector3().addVectors(atomA.position, atomB.position).multiplyScalar(0.5);
        const activeColor = colors[state.activeBond.bondType] || new THREE.Color(0x8be7ff);

        bondPulse.position.copy(midpoint);
        bondPulse.material.color.copy(activeColor);
        bondPulse.material.opacity = state.pulse * 0.32;
        bondPulse.scale.setScalar(1 + state.pulse * 3.2 + state.snap * 0.8);
        bondPulse.visible = state.activeBond.bondType !== "none";
      } else {
        bondPulse.visible = false;
      }
    }

    function updateQuantumCloud(simTime) {
      const pair = state.activeBond;
      const visibleCloud = state.viewMode === "quantum" && !!pair && (pair.proximity > 0.03 || pair.bondType !== "none");
      if (!pair) {
        cloudPoints.visible = false;
        return;
      }

      const atomA = getAtomById(state, pair.atomIds[0]);
      const atomB = getAtomById(state, pair.atomIds[1]);
      const bondVector = new THREE.Vector3().subVectors(atomB.position, atomA.position);
      const distance = Math.max(bondVector.length(), 0.001);
      const axis = bondVector.clone().normalize();
      const tangentA = new THREE.Vector3(-axis.y, axis.x, 0);
      if (tangentA.lengthSq() < 0.001) {
        tangentA.set(1, 0, 0);
      }
      tangentA.normalize();
      const tangentB = new THREE.Vector3().crossVectors(axis, tangentA).normalize();

      const midpoint = new THREE.Vector3().addVectors(atomA.position, atomB.position).multiplyScalar(0.5);
      const acceptor = pair.atoms[pair.acceptorIndex];
      const donor = pair.atoms[pair.donorIndex];
      const formationTarget = smoothstep(0.04, 0.78, pair.proximity);
      state.formationProgress = lerp(state.formationProgress, formationTarget, 0.075);

      let center = midpoint.clone();
      let axisSpread = lerp(distance * 0.85, distance * 0.28, state.formationProgress);
      let radialSpread = lerp(1.3, 0.65, state.formationProgress) * pair.cloudSpread;
      let flowBias = 0;
      let color = 0x8be7ff;
      let globalDrift = 0.12;
      const acceptorCountRatio = clamp(
        (state.atomElectronCounts.get(acceptor.id) ?? acceptor.baseElectronCount) / Math.max(1, acceptor.baseElectronCount),
        0.35,
        1.8
      );
      const donorCountRatio = clamp(
        (state.atomElectronCounts.get(donor.id) ?? donor.baseElectronCount) / Math.max(1, donor.baseElectronCount),
        0.2,
        1.6
      );

      if (pair.bondType === "covalent") {
        center = midpoint;
        axisSpread = lerp(distance * 0.62, distance * 0.22, state.formationProgress);
        radialSpread = lerp(1.05, 0.58, state.formationProgress);
        color = 0x8be7ff;
      } else if (pair.bondType === "polar_covalent") {
        center = midpoint.clone().lerp(acceptor.position, 0.14 + pair.polarity * 0.22);
        axisSpread = lerp(distance * 0.52, distance * 0.18, state.formationProgress);
        radialSpread = lerp(0.95, 0.42, state.formationProgress);
        flowBias = pair.polarity * 0.52;
        globalDrift = 0.18;
        color = 0xfff29f;
      } else if (pair.bondType === "ionic") {
        center = acceptor.position.clone().lerp(donor.position, 0.08);
        axisSpread = lerp(distance * 0.48, acceptor.data.radius * 0.26 * donorCountRatio, state.formationProgress);
        radialSpread = lerp(0.7, acceptor.data.radius * 0.42 * acceptorCountRatio, state.formationProgress);
        flowBias = 0.92;
        globalDrift = 0.24;
        color = 0xffb0a8;
      } else if (pair.bondType === "semiconductor") {
        center = midpoint;
        axisSpread = lerp(distance * 0.5, distance * 0.2, state.formationProgress);
        radialSpread = lerp(0.86, 0.38, state.formationProgress);
        flowBias = 0.08 + state.energy * 0.12;
        globalDrift = 0.1;
        color = 0xc6a8ff;
      } else if (pair.bondType === "metallic") {
        center = midpoint;
        axisSpread = distance * 0.9;
        radialSpread = 0.78 + state.energy * 0.26;
        flowBias = 0.16;
        globalDrift = 0.32;
        color = 0x94efff;
      }

      const waveStrength = (0.08 + state.energy * 0.14) * (0.5 + state.formationProgress * 0.5);
      const biasDirection = pair.strongerIndex === 0 ? -1 : 1;

      for (let index = 0; index < CLOUD_POINT_COUNT; index += 1) {
        const seed = sceneState.cloudSeeds[index];
        const gaussianAxis = gaussianRandom(seed.base) * axisSpread;
        const gaussianRadialA = gaussianRandom(seed.base + 1000) * radialSpread;
        const gaussianRadialB = gaussianRandom(seed.base + 2000) * radialSpread;

        const driftWave = Math.sin(simTime * (1.1 + seed.lane * 0.25) + seed.phase);
        const interference = Math.sin((gaussianAxis / Math.max(distance, 0.001)) * 10 - simTime * 2.4 + seed.phase);
        const flow = biasDirection * flowBias * distance * (globalDrift + 0.14 * driftWave) * state.formationProgress;

        const chaoticMix = 1 - state.formationProgress;
        const chaoticAxis = seed.lane * distance * 0.92 * chaoticMix;
        const chaoticRadialA = seed.swirl * 1.35 * chaoticMix;
        const chaoticRadialB = Math.sin(seed.phase + simTime * 0.9) * 0.8 * chaoticMix;

        const point = center.clone()
          .addScaledVector(axis, gaussianAxis + chaoticAxis + flow + interference * waveStrength)
          .addScaledVector(tangentA, gaussianRadialA + chaoticRadialA + driftWave * 0.11)
          .addScaledVector(tangentB, gaussianRadialB + chaoticRadialB);

        cloudPositions[index * 3] = point.x;
        cloudPositions[index * 3 + 1] = point.y;
        cloudPositions[index * 3 + 2] = point.z;
      }

      cloudGeometry.attributes.position.needsUpdate = true;
      cloudMaterial.uniforms.uTime.value = simTime;
      cloudMaterial.uniforms.uIntensity.value = visibleCloud ? pair.cloudIntensity : 0;
      cloudMaterial.uniforms.uFormation.value = state.formationProgress;
      cloudMaterial.uniforms.uPulse.value = state.pulse;
      cloudMaterial.uniforms.uSize.value = (18 + state.energy * 8 + state.formationProgress * 8) * lerp(0.84, 1.18, clamp(acceptorCountRatio - 0.35, 0, 1));
      cloudMaterial.uniforms.uColor.value.copy(
        pair.bondType === "ionic"
          ? getChargeTint(color, state.atomCharges.get(acceptor.id) || 0)
          : new THREE.Color(color)
      );
      cloudPoints.visible = visibleCloud;
    }

    function animate() {
      requestAnimationFrame(animate);

      const rawDelta = sceneState.clock.getDelta();
      const scaledDelta = rawDelta * state.timeScale;
      sceneState.simTime += scaledDelta;
      state.pulse = Math.max(0, state.pulse - scaledDelta * 1.8);
      state.snap = Math.max(0, state.snap - scaledDelta * 2.4);

      computeSystemState(state);
      applyAtomicForces(scaledDelta);
      computeSystemState(state);
      updateAtomVisuals(sceneState.simTime);
      updateStoryElectron(sceneState.simTime);
      updateBondVisuals();
      updateQuantumCloud(sceneState.simTime);
      updateUI();
      renderer.render(scene, camera);
    }
  }

  try {
    init();
  } catch (error) {
    console.error(error);
    showRuntimeError(`A aparut o eroare la initializare: ${error.message}`);
  }
})();