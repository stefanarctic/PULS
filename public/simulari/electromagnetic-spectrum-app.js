// EN UI via ?lang=en + /translations/simulatoare.en.json (simulators.spectru-electromagnetic)
'use strict';

const simT = (path, ro) =>
  typeof window.simLbl === 'function' ? window.simLbl(path, ro) : ro;

function simFmt(path, vars, roTpl) {
  let s = simT(path, roTpl);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

// === DATA (Romanian fallbacks when lang ≠ en) ===
const REGIONS = [
  {
    id: 'radio',
    name: 'UNDE RADIO',
    color: '#4488ff',
    range: 'λ > 1 mm · f < 300 GHz',
    desc: 'Undele radio au cea mai mare lungime de undă din spectrul electromagnetic. Ele se propagă la viteza luminii și pot parcurge mii de km, reflexându-se de pe ionosfera Pământului.',
    props: [
      { l: 'Lungime undă', v: '1 mm – 100 km' },
      { l: 'Frecvență', v: '3 Hz – 300 GHz' },
      { l: 'Energie foton', v: '1 feV – 1 μeV' },
      { l: 'Penetrare', v: 'Foarte mare' },
    ],
    apps: ['Radiodifuziune AM/FM', 'Comunicații satelit', 'Radar meteorologic', 'WiFi & Bluetooth', 'Astrofizică radio'],
    freq: 0.05,
    amp: 0.3,
    barPos: 0.04,
  },
  {
    id: 'microwave',
    name: 'MICROUNDE',
    color: '#aa44ff',
    range: 'λ = 1 mm – 1 m · f = 300 MHz – 300 GHz',
    desc: 'Microundele sunt utilizate în cuptoarele cu microunde prin rezonanța moleculelor de apă. Ele stau la baza tehnologiei 5G și sunt folosite în observarea cosmosului prin fondul cosmic de microunde (CMB).',
    props: [
      { l: 'Lungime undă', v: '1 mm – 1 m' },
      { l: 'Frecvență', v: '300 MHz – 300 GHz' },
      { l: 'Energie foton', v: '1 μeV – 1 meV' },
      { l: 'Penetrare', v: 'Medie' },
    ],
    apps: ['Cuptoare cu microunde', 'Rețele 5G/6G', 'Radar aviatic', 'Fondul cosmic CMB', 'Comunicații militare'],
    freq: 0.12,
    amp: 0.35,
    barPos: 0.15,
  },
  {
    id: 'ir',
    name: 'INFRAROȘU',
    color: '#ff4400',
    range: 'λ = 700 nm – 1 mm · f = 300 GHz – 430 THz',
    desc: 'Radiația infraroșie este percepută ca căldură de corp uman. Orice obiect cu temperatură >0 K emite IR. Camerele termice detectează diferențele de temperatură cu precizie de 0.01°C.',
    props: [
      { l: 'Lungime undă', v: '700 nm – 1 mm' },
      { l: 'Frecvență', v: '300 GHz – 430 THz' },
      { l: 'Energie foton', v: '1 meV – 1.7 eV' },
      { l: 'Tip', v: 'Radiație termică' },
    ],
    apps: ['Camere termice', 'Telecomenzi IR', 'Astronomie IR (JWST)', 'Detectoare de mișcare', 'Laser fibre optice'],
    freq: 0.3,
    amp: 0.4,
    barPos: 0.3,
  },
  {
    id: 'visible',
    name: 'LUMINA VIZIBILĂ',
    color: '#aaff00',
    range: 'λ = 380 – 700 nm · f = 430 – 790 THz',
    desc: 'Lumina vizibilă este singura regiune a spectrului electromagnetic detectabilă cu ochiul uman. Culorile curcubeului (ROGVAIV) corespund diferitelor frecvențe ale luminii vizibile. Laserii vizibili sunt utilizați pe scară largă în medicină și industrie.',
    props: [
      { l: 'Lungime undă', v: '380 – 700 nm' },
      { l: 'Frecvență', v: '430 – 790 THz' },
      { l: 'Energie foton', v: '1.7 – 3.3 eV' },
      { l: 'Viteza în vid', v: '299 792 km/s' },
    ],
    apps: ['Laseri (chirurgie, ind.)', 'Fotografie & display-uri', 'Fibră optică', 'Fotosinteza', 'Spectroscopie optică'],
    freq: 0.6,
    amp: 0.45,
    barPos: 0.46,
  },
  {
    id: 'uv',
    name: 'ULTRAVIOLET',
    color: '#7700ff',
    range: 'λ = 10 – 380 nm · f = 790 THz – 30 PHz',
    desc: 'Radiația UV este produsă de Soare și de lămpile UV. Deși invizibilă ochiului uman, UV-A bronzează pielea, UV-B produce vitamina D dar și arsuri solare, iar UV-C (blocată de ozon) este letală pentru microorganisme.',
    props: [
      { l: 'Lungime undă', v: '10 – 380 nm' },
      { l: 'Frecvență', v: '790 THz – 30 PHz' },
      { l: 'Energie foton', v: '3.3 – 124 eV' },
      { l: 'Risc biologic', v: 'Mutagenic' },
    ],
    apps: ['Sterilizare UV-C', 'Detectare bancnote false', 'Astronomie UV (Hubble)', 'Tratament psoriazis', 'Lămpi solare'],
    freq: 1.2,
    amp: 0.5,
    barPos: 0.58,
  },
  {
    id: 'xray',
    name: 'RAZE X',
    color: '#00c8ff',
    range: 'λ = 0.01 – 10 nm · f = 30 PHz – 30 EHz',
    desc: 'Razele X penetrează țesuturile moi dar sunt oprite de os și metal, ceea ce le face indispensabile în medicină. Descoperite de Wilhelm Röntgen în 1895, ele au revoluționat diagnosticul medical. La energii mari sunt utilizate în cristalografie și astronomie.',
    props: [
      { l: 'Lungime undă', v: '0.01 – 10 nm' },
      { l: 'Frecvență', v: '30 PHz – 30 EHz' },
      { l: 'Energie foton', v: '0.1 – 100 keV' },
      { l: 'Penetrare', v: 'Foarte mare' },
    ],
    apps: ['Radiografie medicală', 'CT Scanner', 'Securitate aeroporturi', 'Cristalografie X', 'Telescoape X (Chandra)'],
    freq: 2.5,
    amp: 0.55,
    barPos: 0.73,
  },
  {
    id: 'gamma',
    name: 'RAZE GAMMA',
    color: '#ff006e',
    range: 'λ < 0.01 nm · f > 30 EHz',
    desc: 'Razele gamma sunt cele mai energice radiații din univers, produse în explozii nucleare, dezintegrări radioactive și coliziuni de stele neutronice (kilonove). Ele pot penetra aproape orice material și sunt letale în doze mari, dar esențiale în radioterapia cancer.',
    props: [
      { l: 'Lungime undă', v: '< 0.01 nm' },
      { l: 'Frecvență', v: '> 30 EHz' },
      { l: 'Energie foton', v: '> 100 keV' },
      { l: 'Risc', v: 'EXTREM' },
    ],
    apps: ['Radioterapie (cancer)', 'PET Scan', 'Sterilizare alimente', 'Detectare bombe nucleare', 'Cuțitul Gamma (neurochir.)'],
    freq: 5,
    amp: 0.6,
    barPos: 0.88,
  },
];

let currentRegion = REGIONS[3];
let animFrame;

function laserColorBandName(wl) {
  if (wl < 450) return simT('laser.bandBlueViolet', 'ALBASTRU-VIOLET');
  if (wl < 500) return simT('laser.bandBlue', 'ALBASTRU');
  if (wl < 560) return simT('laser.bandGreen', 'VERDE');
  if (wl < 620) return simT('laser.bandYellowOrange', 'GALBEN-PORTOCALIU');
  return simT('laser.bandRed', 'ROȘU');
}

function regionName(r) {
  return simT(`regions.${r.id}.name`, r.name);
}

function regionRange(r) {
  return simT(`regions.${r.id}.range`, r.range);
}

function regionDesc(r) {
  return simT(`regions.${r.id}.desc`, r.desc);
}

function propLabel(r, p, i) {
  return simT(`regions.${r.id}.props.${i}.l`, p.l);
}

function propValue(r, p, i) {
  return simT(`regions.${r.id}.props.${i}.v`, p.v);
}

function appLine(r, text, i) {
  return simT(`regions.${r.id}.apps.${i}`, text);
}

// === REGION BUTTONS ===
const btnContainer = document.getElementById('region-buttons');
REGIONS.forEach((r) => {
  const btn = document.createElement('button');
  btn.className = 'region-btn' + (r.id === 'visible' ? ' active' : '');
  btn.textContent = regionName(r);
  btn.style.color = r.color;
  btn.style.borderColor = r.color;
  btn.onclick = () => selectRegion(r);
  btn.id = 'btn-' + r.id;
  btnContainer.appendChild(btn);
});

function selectRegion(r) {
  currentRegion = r;
  document.querySelectorAll('.region-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById('btn-' + r.id).classList.add('active');

  document.getElementById('region-name').textContent = regionName(r);
  document.getElementById('region-name').style.color = r.color;
  document.getElementById('region-name').style.textShadow = '0 0 20px ' + r.color;
  document.getElementById('region-range').textContent = regionRange(r);
  document.getElementById('region-desc').textContent = regionDesc(r);

  const pg = document.getElementById('props-grid');
  pg.innerHTML = '';
  r.props.forEach((p, i) => {
    pg.innerHTML += `<div class="prop-card">
      <div class="prop-label">${propLabel(r, p, i)}</div>
      <div class="prop-value" style="color:${r.color}">${propValue(r, p, i)}</div>
    </div>`;
  });

  const al = document.getElementById('app-list');
  al.innerHTML = '';
  r.apps.forEach((a, i) => {
    const li = document.createElement('li');
    li.textContent = appLine(r, a, i);
    li.style.setProperty('--accent', r.color);
    al.appendChild(li);
  });
  al.querySelectorAll('li').forEach((li) => {
    li.style.borderBottomColor = r.color + '22';
  });
  document.getElementById('wave-panel').style.setProperty('--accent', r.color);
  document.getElementById('info-panel').style.setProperty('--accent', r.color);

  const cursor = document.getElementById('spectrum-cursor');
  cursor.style.left = r.barPos * 100 + '%';

  startWaveAnimation(r);
}

// === WAVE CANVAS ===
const waveCanvas = document.getElementById('wave-canvas');
const wCtx = waveCanvas.getContext('2d');
let waveT = 0;

function startWaveAnimation(r) {
  if (animFrame) cancelAnimationFrame(animFrame);
  function draw() {
    const W = waveCanvas.offsetWidth;
    const H = waveCanvas.offsetHeight;
    waveCanvas.width = W;
    waveCanvas.height = H;

    wCtx.clearRect(0, 0, W, H);
    wCtx.fillStyle = '#010308';
    wCtx.fillRect(0, 0, W, H);

    wCtx.strokeStyle = 'rgba(255,255,255,0.03)';
    wCtx.lineWidth = 1;
    for (let y = H / 4; y < H; y += H / 4) {
      wCtx.beginPath();
      wCtx.moveTo(0, y);
      wCtx.lineTo(W, y);
      wCtx.stroke();
    }
    for (let x = 0; x < W; x += 40) {
      wCtx.beginPath();
      wCtx.moveTo(x, 0);
      wCtx.lineTo(x, H);
      wCtx.stroke();
    }

    const freq = r.freq;
    const amp = r.amp * H * 0.4;
    const cycles = Math.max(1, Math.min(freq * 8, 30));

    wCtx.shadowBlur = 15;
    wCtx.shadowColor = r.color;
    wCtx.strokeStyle = r.color;
    wCtx.lineWidth = 2;
    wCtx.beginPath();

    for (let x = 0; x <= W; x += 1) {
      const t = (x / W) * cycles * Math.PI * 2;
      const y = H / 2 + Math.sin(t + waveT) * amp;
      if (x === 0) wCtx.moveTo(x, y);
      else wCtx.lineTo(x, y);
    }
    wCtx.stroke();

    wCtx.globalAlpha = 0.25;
    wCtx.shadowBlur = 5;
    wCtx.lineWidth = 1;
    wCtx.beginPath();
    for (let x = 0; x <= W; x += 1) {
      const t = (x / W) * cycles * Math.PI * 2;
      const y = H / 2 + Math.sin(t + waveT * 1.3 + 1) * amp * 0.6;
      if (x === 0) wCtx.moveTo(x, y);
      else wCtx.lineTo(x, y);
    }
    wCtx.stroke();
    wCtx.globalAlpha = 1;

    waveT += 0.04;
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// === LASER CANVAS ===
const laserCanvas = document.getElementById('laser-canvas');
const lCtx = laserCanvas.getContext('2d');

function wlToRGB(wl) {
  let r;
  let g;
  let b;
  if (wl < 380) {
    r = 0.5;
    g = 0;
    b = 0.8;
  } else if (wl < 440) {
    r = (440 - wl) / 60;
    g = 0;
    b = 1;
  } else if (wl < 490) {
    r = 0;
    g = (wl - 440) / 50;
    b = 1;
  } else if (wl < 510) {
    r = 0;
    g = 1;
    b = (510 - wl) / 20;
  } else if (wl < 580) {
    r = (wl - 510) / 70;
    g = 1;
    b = 0;
  } else if (wl < 645) {
    r = 1;
    g = (645 - wl) / 65;
    b = 0;
  } else {
    r = 1;
    g = 0;
    b = 0;
  }
  if (wl < 420) {
    const f = 0.3 + (0.7 * (wl - 380)) / 40;
    r *= f;
    g *= f;
    b *= f;
  } else if (wl > 700) {
    const f = 0.3 + (0.7 * (780 - wl)) / 80;
    r *= f;
    g *= f;
    b *= f;
  }
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

let laserT = 0;
function drawLaser() {
  const W = laserCanvas.offsetWidth;
  const H = laserCanvas.offsetHeight;
  laserCanvas.width = W;
  laserCanvas.height = H;

  const wl = parseInt(document.getElementById('wl-slider').value, 10);
  const intensity = parseInt(document.getElementById('int-slider').value, 10) / 100;
  const divergence = parseInt(document.getElementById('div-slider').value, 10) / 10;
  const color = wlToRGB(wl);

  lCtx.fillStyle = '#010308';
  lCtx.fillRect(0, 0, W, H);

  lCtx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 8; i++) {
    const px = (i * 137 + laserT * 20) % W;
    const py = H / 2 + Math.sin(laserT + i) * 15 * divergence;
    const dist = px / W;
    const spread = dist * divergence * 10;
    if (Math.abs(py - H / 2) < spread + 5) {
      lCtx.beginPath();
      lCtx.arc(px, py, 1, 0, Math.PI * 2);
      lCtx.fill();
    }
  }

  const beamHeight = divergence * 2 + 4;

  for (let g = 4; g >= 0; g--) {
    const alpha = (intensity * 0.15 * (5 - g)) / 5;
    const spread = (g + 1) * beamHeight * 0.8;
    const grad = lCtx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `,${alpha})`));
    grad.addColorStop(0.5, color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.8})`));
    grad.addColorStop(1, color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.1})`));

    const yGrad = lCtx.createLinearGradient(0, H / 2 - spread, 0, H / 2 + spread);
    yGrad.addColorStop(0, 'transparent');
    yGrad.addColorStop(0.5, color.replace('rgb', 'rgba').replace(')', `,${alpha * intensity})`));
    yGrad.addColorStop(1, 'transparent');

    lCtx.fillStyle = yGrad;
    lCtx.fillRect(0, H / 2 - spread, W, spread * 2);
  }

  const coreGrad = lCtx.createLinearGradient(0, 0, W, 0);
  coreGrad.addColorStop(0, color);
  coreGrad.addColorStop(0.7, color.replace('rgb', 'rgba').replace(')', `,${intensity})`));
  coreGrad.addColorStop(1, 'transparent');
  lCtx.fillStyle = coreGrad;
  lCtx.fillRect(0, H / 2 - 1, W, 2);

  lCtx.shadowBlur = 20 * intensity;
  lCtx.shadowColor = color;
  lCtx.fillStyle = 'white';
  lCtx.beginPath();
  lCtx.arc(12, H / 2, 5 * intensity + 2, 0, Math.PI * 2);
  lCtx.fill();
  lCtx.shadowBlur = 0;

  lCtx.fillStyle = 'rgba(255,255,255,0.3)';
  lCtx.font = '9px Orbitron, monospace';
  lCtx.fillText(simFmt('laser.lambdaEq', { wl }, `λ = ${wl} nm`), 20, 16);
  lCtx.fillText(laserColorBandName(wl), 20, H - 8);

  const danger = Math.min(100, intensity * 80 + (beamHeight > 10 ? 20 : 0));
  const fill = document.getElementById('danger-fill');
  fill.style.width = danger + '%';
  const dangerEl = document.getElementById('danger-text');
  if (danger < 30) {
    fill.style.background = 'linear-gradient(90deg, #00ff88, #aaff00)';
    dangerEl.textContent = simT('dangerMessages.class1', 'CLASA 1 — Inofensiv');
    dangerEl.style.color = '#00ff88';
  } else if (danger < 60) {
    fill.style.background = 'linear-gradient(90deg, #ffe600, #ffaa00)';
    dangerEl.textContent = simT('dangerMessages.class3r', 'CLASA 3R — Evitați privitul direct');
    dangerEl.style.color = '#ffe600';
  } else if (danger < 85) {
    fill.style.background = 'linear-gradient(90deg, #ff4400, #ff0000)';
    dangerEl.textContent = simT('dangerMessages.class3b', 'CLASA 3B — PERICULOS pentru ochi');
    dangerEl.style.color = '#ff4400';
  } else {
    fill.style.background = 'linear-gradient(90deg, #ff0000, #ff006e)';
    dangerEl.textContent = simT('dangerMessages.class4', '⚠ CLASA 4 — PERICOL EXTREM');
    dangerEl.style.color = '#ff006e';
  }

  laserT += 0.01;
  requestAnimationFrame(drawLaser);
}

document.getElementById('wl-slider').oninput = function () {
  document.getElementById('wl-val').textContent = this.value + ' nm';
};
document.getElementById('int-slider').oninput = function () {
  document.getElementById('int-val').textContent = this.value + '%';
};
document.getElementById('div-slider').oninput = function () {
  document.getElementById('div-val').textContent = (this.value / 10).toFixed(1) + ' mrad';
};

// === SPECTRUM BAR INTERACTION ===
const specBar = document.getElementById('spectrum-bar');
const specCursor = document.getElementById('spectrum-cursor');
const tooltip = document.getElementById('tooltip');

specBar.addEventListener('mousemove', (e) => {
  const rect = specBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  specCursor.style.left = pct * 100 + '%';

  let nearest = REGIONS[0];
  let minDist = 999;
  REGIONS.forEach((r) => {
    const d = Math.abs(r.barPos - pct);
    if (d < minDist) {
      minDist = d;
      nearest = r;
    }
  });

  tooltip.style.display = 'block';
  tooltip.style.left = e.clientX + 10 + 'px';
  tooltip.style.top = e.clientY - 30 + 'px';
  tooltip.textContent = regionName(nearest) + ' · ' + regionRange(nearest);
  tooltip.style.color = nearest.color;
  tooltip.style.borderColor = nearest.color + '66';
});

specBar.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
  specCursor.style.left = currentRegion.barPos * 100 + '%';
});

specBar.addEventListener('click', (e) => {
  const rect = specBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  let nearest = REGIONS[0];
  let minDist = 999;
  REGIONS.forEach((r) => {
    const d = Math.abs(r.barPos - pct);
    if (d < minDist) {
      minDist = d;
      nearest = r;
    }
  });
  selectRegion(nearest);
});

selectRegion(REGIONS[3]);
drawLaser();
