(() => {
    const canvas = document.getElementById('reactor');
    const ctx = canvas.getContext('2d');

    // Controls
    const densitySlider = document.getElementById('density');
    const speedSlider = document.getElementById('speed');
    const probSlider = document.getElementById('probability');
    const rodsSlider = document.getElementById('rods');
    const moderatorToggle = document.getElementById('moderator');
    const delayedToggle = document.getElementById('delayed');
    const heatmapToggle = document.getElementById('heatmap');

    const densityLabel = document.getElementById('densityValue');
    const speedLabel = document.getElementById('speedValue');
    const probLabel = document.getElementById('probabilityValue');
    const rodsLabel = document.getElementById('rodsValue');

    // Stats
    const fissionsStat = document.getElementById('fissionsStat');
    const neutronsStat = document.getElementById('neutronsStat');
    const energyStat = document.getElementById('energyStat');
    const tempStat = document.getElementById('tempStat');
    const tempFill = document.getElementById('tempFill');
    const kStat = document.getElementById('kStat');
    const kMarker = document.getElementById('kMarker');
    const kStatus = document.getElementById('kStatus');

    // Buttons / popovers
    const resetBtn = document.getElementById('resetBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const injectBtn = document.getElementById('injectBtn');
    const scramBtn = document.getElementById('scramBtn');
    const infoBtn = document.getElementById('infoBtn');
    const infoPopover = document.getElementById('infoPopover');
    const infoClose = document.getElementById('infoClose');
    const kInfoBtn = document.getElementById('kInfo');
    const kTooltip = document.getElementById('kTooltip');

    const AMBIENT_TEMP = 20;

    const state = {
        width: 0,
        height: 0,
        dpr: Math.max(1, Math.min(window.devicePixelRatio || 1, 2)),
        nuclei: [],
        neutrons: [],
        flashes: [],
        particles: [],
        delayedQueue: [],
        fissions: 0,
        energy: 0,
        temperature: AMBIENT_TEMP,
        paused: false,
        lastTime: 0,
        // Empirical k: ratio of fission rate current window vs previous window
        fissionBuckets: [0, 0, 0, 0], // rolling 4 buckets of 0.75s each
        bucketTimer: 0,
        kSmoothed: 1,
        currentSpeed: parseFloat(speedSlider.value),
    };

    const C = {
        uranium: '#5e5ce6',
        uraniumGlow: 'rgba(94, 92, 230, 0.18)',
        product: '#ff9f0a',
        neutron: '#30d158',
        neutronGlow: 'rgba(48, 209, 88, 0.35)',
        line: 'rgba(0, 0, 0, 0.06)',
    };

    // --- Resizing with DPR ---
    function resize() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const sameSize = Math.abs(rect.width - state.width) < 0.5 && Math.abs(rect.height - state.height) < 0.5;
        state.width = rect.width;
        state.height = rect.height;
        canvas.width = Math.floor(rect.width * state.dpr);
        canvas.height = Math.floor(rect.height * state.dpr);
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        if (!sameSize) populateNuclei();
    }

    // --- Entities ---
    function createNucleus(x, y) {
        return {
            x, y,
            r: 7 + Math.random() * 2,
            alive: true,
            phase: Math.random() * Math.PI * 2,
        };
    }

    function createNeutron(x, y, angle, speed) {
        return {
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 2.6,
            life: 0,
            trail: [],
        };
    }

    function populateNuclei() {
        const count = parseInt(densitySlider.value, 10);
        state.nuclei = [];
        const padding = 24;
        const w = state.width - padding * 2;
        const h = state.height - padding * 2;
        if (w <= 0 || h <= 0) return;

        const minDist = Math.max(14, Math.sqrt((w * h) / (count * 1.8)));
        let tries = 0;
        while (state.nuclei.length < count && tries < count * 40) {
            const x = padding + Math.random() * w;
            const y = padding + Math.random() * h;
            let ok = true;
            for (const n of state.nuclei) {
                const dx = n.x - x, dy = n.y - y;
                if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
            }
            if (ok) state.nuclei.push(createNucleus(x, y));
            tries++;
        }
    }

    function spawnFissionProducts(x, y) {
        const baseSpeed = state.currentSpeed;
        const count = 2 + (Math.random() < 0.7 ? 1 : 0);

        let immediate = count;
        // Delayed neutrons: ~6% of neutrons are delayed in real U-235 fission.
        // When toggle is on, hold back ~1 per fission roughly every ~15 fissions.
        if (delayedToggle.checked && Math.random() < 0.06 * count) {
            immediate = Math.max(1, count - 1);
            state.delayedQueue.push({
                x, y,
                ttl: 0.4 + Math.random() * 1.8,
            });
        }

        for (let i = 0; i < immediate; i++) {
            const angle = Math.random() * Math.PI * 2;
            const jitter = 0.9 + Math.random() * 0.5;
            state.neutrons.push(createNeutron(x, y, angle, baseSpeed * 60 * jitter));
        }

        // Flash + fragments
        state.flashes.push({ x, y, r: 4, max: 48, a: 0.9 });
        for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 40 + Math.random() * 80;
            state.particles.push({
                x, y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                life: 1,
                r: 1.5 + Math.random() * 1.8,
                color: Math.random() < 0.5 ? C.product : '#ffb84d',
            });
        }
        state.fissions++;
        state.energy += 200;
        state.fissionBuckets[0]++;
        // Temperature rises with fissions
        state.temperature += 0.9;
    }

    function launchNeutron(x, y, angle) {
        const speed = state.currentSpeed * 60;
        const a = angle ?? Math.random() * Math.PI * 2;
        state.neutrons.push(createNeutron(x, y, a, speed));
    }

    // --- Collisions ---
    function collideNeutronsWithNuclei() {
        const prob = parseInt(probSlider.value, 10) / 100;
        const moderator = moderatorToggle.checked;
        for (let i = state.neutrons.length - 1; i >= 0; i--) {
            const n = state.neutrons[i];
            for (let j = 0; j < state.nuclei.length; j++) {
                const u = state.nuclei[j];
                if (!u.alive) continue;
                const dx = n.x - u.x;
                const dy = n.y - u.y;
                const rr = (u.r + n.r);
                if (dx * dx + dy * dy < rr * rr) {
                    const effectiveProb = moderator ? prob : prob * 0.45;
                    if (Math.random() < effectiveProb) {
                        u.alive = false;
                        state.neutrons.splice(i, 1);
                        spawnFissionProducts(u.x, u.y);
                    } else {
                        const ang = Math.atan2(dy, dx);
                        const sp = Math.hypot(n.vx, n.vy);
                        n.vx = Math.cos(ang) * sp;
                        n.vy = Math.sin(ang) * sp;
                        n.x = u.x + Math.cos(ang) * (rr + 0.5);
                        n.y = u.y + Math.sin(ang) * (rr + 0.5);
                    }
                    break;
                }
            }
        }
    }

    // --- Update ---
    function update(dt) {
        const rodsPct = parseInt(rodsSlider.value, 10) / 100;
        // Control rods absorb neutrons (per-second probability scaled by rods%)
        const absorbPerSec = rodsPct * 1.8;

        // Neutrons
        for (let i = state.neutrons.length - 1; i >= 0; i--) {
            const n = state.neutrons[i];
            n.x += n.vx * dt;
            n.y += n.vy * dt;
            n.life += dt;

            n.trail.push({ x: n.x, y: n.y });
            if (n.trail.length > 10) n.trail.shift();

            if (n.x < 4) { n.x = 4; n.vx *= -1; }
            if (n.y < 4) { n.y = 4; n.vy *= -1; }
            if (n.x > state.width - 4) { n.x = state.width - 4; n.vx *= -1; }
            if (n.y > state.height - 4) { n.y = state.height - 4; n.vy *= -1; }

            // Absorbed by control rods
            if (absorbPerSec > 0 && Math.random() < absorbPerSec * dt) {
                state.neutrons.splice(i, 1);
                continue;
            }

            if (n.life > 14) state.neutrons.splice(i, 1);
        }

        collideNeutronsWithNuclei();

        // Delayed neutrons
        for (let i = state.delayedQueue.length - 1; i >= 0; i--) {
            const d = state.delayedQueue[i];
            d.ttl -= dt;
            if (d.ttl <= 0) {
                launchNeutron(d.x, d.y);
                state.delayedQueue.splice(i, 1);
            }
        }

        // Flashes
        for (let i = state.flashes.length - 1; i >= 0; i--) {
            const f = state.flashes[i];
            f.r += 160 * dt;
            f.a -= 1.8 * dt;
            if (f.a <= 0 || f.r > f.max) state.flashes.splice(i, 1);
        }

        // Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= dt * 0.9;
            if (p.life <= 0) state.particles.splice(i, 1);
        }

        // Temperature cooling toward ambient
        const cooling = 0.35 + rodsPct * 0.8; // rods cool faster
        state.temperature += (AMBIENT_TEMP - state.temperature) * Math.min(1, cooling * dt);

        // Rolling fission-rate buckets (for empirical k)
        state.bucketTimer += dt;
        if (state.bucketTimer >= 0.75) {
            state.bucketTimer = 0;
            state.fissionBuckets.unshift(0);
            if (state.fissionBuckets.length > 4) state.fissionBuckets.pop();
            computeEmpiricalK();
        }
    }

    function computeEmpiricalK() {
        // Compare most-recent full bucket pair
        const recent = state.fissionBuckets[1] || 0;
        const prev = state.fissionBuckets[2] || 0;
        let k;
        if (prev === 0 && recent === 0) {
            k = null;
        } else if (prev === 0) {
            k = recent > 0 ? 2 : 1;
        } else {
            k = recent / prev;
        }
        if (k !== null) {
            // Smooth for readability
            state.kSmoothed = state.kSmoothed * 0.6 + k * 0.4;
        } else {
            state.kSmoothed = null;
        }
    }

    // --- Heatmap overlay ---
    function drawHeatmap() {
        const cell = 24;
        const cols = Math.ceil(state.width / cell);
        const rows = Math.ceil(state.height / cell);
        const grid = new Array(cols * rows).fill(0);
        for (const n of state.neutrons) {
            const cx = Math.floor(n.x / cell);
            const cy = Math.floor(n.y / cell);
            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const x = cx + ox, y = cy + oy;
                    if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
                    const falloff = (ox === 0 && oy === 0) ? 1 : 0.45;
                    grid[y * cols + x] += falloff;
                }
            }
        }
        let max = 0;
        for (const v of grid) if (v > max) max = v;
        if (max === 0) return;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const v = grid[y * cols + x] / max;
                if (v < 0.08) continue;
                const hue = 200 - v * 200; // blue → red
                ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${0.08 + v * 0.28})`;
                ctx.fillRect(x * cell, y * cell, cell, cell);
            }
        }
    }

    // --- Draw ---
    function draw() {
        ctx.clearRect(0, 0, state.width, state.height);

        // Subtle grid
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        const step = 36;
        ctx.beginPath();
        for (let x = step; x < state.width; x += step) {
            ctx.moveTo(x, 0); ctx.lineTo(x, state.height);
        }
        for (let y = step; y < state.height; y += step) {
            ctx.moveTo(0, y); ctx.lineTo(state.width, y);
        }
        ctx.stroke();

        if (heatmapToggle.checked) drawHeatmap();

        // Nuclei
        for (const u of state.nuclei) {
            if (u.alive) {
                ctx.beginPath();
                ctx.arc(u.x, u.y, u.r + 5, 0, Math.PI * 2);
                ctx.fillStyle = C.uraniumGlow;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(u.x - 2, u.y - 2, 1, u.x, u.y, u.r);
                grad.addColorStop(0, '#8b89f5');
                grad.addColorStop(1, C.uranium);
                ctx.fillStyle = grad;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(u.x, u.y, 2.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 159, 10, 0.35)';
                ctx.fill();
            }
        }

        // Particles
        for (const p of state.particles) {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Flashes
        for (const f of state.flashes) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 159, 10, ${Math.max(0, f.a)})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Neutrons with trails
        for (const n of state.neutrons) {
            if (n.trail.length > 1) {
                for (let i = 1; i < n.trail.length; i++) {
                    const t0 = n.trail[i - 1];
                    const t1 = n.trail[i];
                    const alpha = i / n.trail.length * 0.5;
                    ctx.strokeStyle = `rgba(48, 209, 88, ${alpha})`;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(t0.x, t0.y);
                    ctx.lineTo(t1.x, t1.y);
                    ctx.stroke();
                }
            }
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
            ctx.fillStyle = C.neutronGlow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = C.neutron;
            ctx.fill();
        }
    }

    // --- Loop ---
    function loop(time) {
        const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
        state.lastTime = time;
        if (!state.paused) update(dt);
        draw();
        updateStats();
        requestAnimationFrame(loop);
    }

    function updateStats() {
        fissionsStat.textContent = state.fissions.toLocaleString('ro-RO');
        neutronsStat.textContent = state.neutrons.length;
        energyStat.textContent = state.energy.toLocaleString('ro-RO');

        const tempDisplay = Math.round(state.temperature);
        tempStat.textContent = tempDisplay;
        const tempPct = Math.min(100, Math.max(0, (state.temperature - AMBIENT_TEMP) / 2.5));
        tempFill.style.width = tempPct + '%';

        // k display
        const k = state.kSmoothed;
        const hasData = k !== null && state.fissions >= 2;
        if (hasData) {
            kStat.textContent = k.toFixed(2);
        } else {
            kStat.textContent = '—';
        }

        // k gauge marker: map k in [0..2] to [0..100%]
        const kClamped = Math.min(2, Math.max(0, hasData ? k : 0));
        const markerPct = (kClamped / 2) * 100;
        kMarker.style.left = `calc(${markerPct}% - 1.5px)`;

        // Status text + color
        let statusClass = '';
        let statusText = 'Așteaptă reacția…';
        if (hasData) {
            if (k < 0.95) { statusClass = 'sub'; statusText = 'Subcritic — reacția se stinge'; }
            else if (k <= 1.05) { statusClass = 'crit'; statusText = 'Critic — reacție stabilă'; }
            else { statusClass = 'super'; statusText = 'Supercritic — creștere exponențială'; }
        }
        kStatus.className = 'k-status' + (statusClass ? ' ' + statusClass : '');
        kStatus.textContent = statusText;

        kStat.style.color = statusClass === 'super'
            ? 'var(--danger)'
            : statusClass === 'crit'
                ? '#1f8f3c'
                : statusClass === 'sub'
                    ? '#1a6fd8'
                    : '';
    }

    // --- Reset ---
    function reset(keepNuclei = false) {
        state.neutrons = [];
        state.flashes = [];
        state.particles = [];
        state.delayedQueue = [];
        state.fissions = 0;
        state.energy = 0;
        state.temperature = AMBIENT_TEMP;
        state.fissionBuckets = [0, 0, 0, 0];
        state.bucketTimer = 0;
        state.kSmoothed = 1;
        if (!keepNuclei) populateNuclei();
        else state.nuclei.forEach(n => n.alive = true);
    }

    // --- Slider feedback (fill color) ---
    function syncSlider(el) {
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        const val = parseFloat(el.value);
        const pct = ((val - min) / (max - min)) * 100;
        el.style.setProperty('--val', pct + '%');
    }

    [densitySlider, speedSlider, probSlider, rodsSlider].forEach(syncSlider);

    densitySlider.addEventListener('input', () => {
        densityLabel.textContent = densitySlider.value;
        syncSlider(densitySlider);
        populateNuclei();
    });

    speedSlider.addEventListener('input', () => {
        const newSpeed = parseFloat(speedSlider.value);
        const old = state.currentSpeed || newSpeed;
        const ratio = newSpeed / old;
        // Scale existing neutrons' velocities so change is visible instantly
        for (const n of state.neutrons) {
            n.vx *= ratio;
            n.vy *= ratio;
        }
        state.currentSpeed = newSpeed;
        speedLabel.textContent = newSpeed.toFixed(1);
        syncSlider(speedSlider);
    });

    probSlider.addEventListener('input', () => {
        probLabel.textContent = probSlider.value + '%';
        syncSlider(probSlider);
    });

    rodsSlider.addEventListener('input', () => {
        rodsLabel.textContent = rodsSlider.value + '%';
        syncSlider(rodsSlider);
    });

    // --- Click / tap to launch neutron ---
    function getPointerPos(evt) {
        const rect = canvas.getBoundingClientRect();
        const p = evt.touches ? evt.touches[0] : evt;
        return { x: p.clientX - rect.left, y: p.clientY - rect.top };
    }
    function onCanvasPointer(evt) {
        evt.preventDefault();
        const { x, y } = getPointerPos(evt);
        launchNeutron(x, y);
    }
    canvas.addEventListener('mousedown', onCanvasPointer);
    canvas.addEventListener('touchstart', onCanvasPointer, { passive: false });

    // --- Controls ---
    resetBtn.addEventListener('click', () => {
        reset();
        setTimeout(() => launchNeutron(state.width / 2, state.height / 2), 120);
    });

    pauseBtn.addEventListener('click', () => {
        state.paused = !state.paused;
        const label = pauseBtn.querySelector('span');
        label.textContent = state.paused ? 'Continuă' : 'Pauză';
    });

    injectBtn.addEventListener('click', () => {
        // Fire from a random edge toward center for visibility
        const side = Math.floor(Math.random() * 4);
        let x, y, angle;
        const m = 20;
        if (side === 0) { x = m; y = Math.random() * state.height; angle = 0 + (Math.random() - 0.5) * 0.8; }
        else if (side === 1) { x = state.width - m; y = Math.random() * state.height; angle = Math.PI + (Math.random() - 0.5) * 0.8; }
        else if (side === 2) { x = Math.random() * state.width; y = m; angle = Math.PI / 2 + (Math.random() - 0.5) * 0.8; }
        else { x = Math.random() * state.width; y = state.height - m; angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; }
        launchNeutron(x, y, angle);
    });

    // --- Presets ---
    const PRESETS = {
        stable: {
            label: 'Stabil',
            density: 140, speed: 2.0, probability: 55, rods: 38,
            moderator: true, delayed: true, seedNeutrons: 2,
        },
        near: {
            label: 'Aproape critic',
            density: 180, speed: 2.2, probability: 75, rods: 12,
            moderator: true, delayed: true, seedNeutrons: 2,
        },
        super: {
            label: 'Supercritic',
            density: 220, speed: 2.6, probability: 92, rods: 0,
            moderator: true, delayed: false, seedNeutrons: 1,
        },
        bomb: {
            label: 'Bomb mode',
            density: 260, speed: 4.2, probability: 100, rods: 0,
            moderator: false, delayed: false, seedNeutrons: 1,
        },
    };

    const presetButtons = document.querySelectorAll('.preset');

    function applyPreset(key) {
        const p = PRESETS[key];
        if (!p) return;

        densitySlider.value = p.density;
        densityLabel.textContent = p.density;
        syncSlider(densitySlider);

        speedSlider.value = p.speed;
        speedLabel.textContent = p.speed.toFixed(1);
        syncSlider(speedSlider);
        state.currentSpeed = p.speed;

        probSlider.value = p.probability;
        probLabel.textContent = p.probability + '%';
        syncSlider(probSlider);

        rodsSlider.value = p.rods;
        rodsLabel.textContent = p.rods + '%';
        syncSlider(rodsSlider);

        moderatorToggle.checked = p.moderator;
        delayedToggle.checked = p.delayed;

        // Reset simulation with new density
        reset(false);

        // Seed one or two neutrons to kick things off
        for (let i = 0; i < p.seedNeutrons; i++) {
            launchNeutron(state.width / 2, state.height / 2);
        }

        // Visual: highlight active button
        presetButtons.forEach(b => {
            const isActive = b.dataset.preset === key;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-checked', String(isActive));
        });
    }

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Clear active preset if user manually changes a parameter
    const invalidatingInputs = [densitySlider, speedSlider, probSlider, rodsSlider, moderatorToggle, delayedToggle];
    invalidatingInputs.forEach(el => {
        el.addEventListener('input', () => {
            presetButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
        });
    });

    scramBtn.addEventListener('click', () => {
        // Emergency shutdown: slam rods to 100, kill all neutrons
        rodsSlider.value = 100;
        rodsLabel.textContent = '100%';
        syncSlider(rodsSlider);
        state.neutrons = [];
        state.delayedQueue = [];
        state.fissionBuckets = [0, 0, 0, 0];
        state.kSmoothed = 0;
        // Visual pulse
        scramBtn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.96)' },
            { transform: 'scale(1)' },
        ], { duration: 220, easing: 'ease-out' });
    });

    // --- Info popover ---
    function setInfoOpen(open) {
        infoPopover.hidden = !open;
        infoBtn.setAttribute('aria-expanded', String(open));
    }
    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setInfoOpen(infoPopover.hidden);
    });
    infoClose.addEventListener('click', () => setInfoOpen(false));
    document.addEventListener('click', (e) => {
        if (!infoPopover.hidden && !infoPopover.contains(e.target) && e.target !== infoBtn) {
            setInfoOpen(false);
        }
        if (!kTooltip.hidden && !kTooltip.contains(e.target) && e.target !== kInfoBtn && !kInfoBtn.contains(e.target)) {
            kTooltip.hidden = true;
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!infoPopover.hidden) setInfoOpen(false);
            if (!kTooltip.hidden) kTooltip.hidden = true;
        }
    });

    // --- k Tooltip ---
    kInfoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        kTooltip.hidden = !kTooltip.hidden;
    });

    // --- Init ---
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => resize());
        ro.observe(canvas);
    }
    resize();
    launchNeutron(state.width / 2, state.height / 2);
    requestAnimationFrame(loop);
})();
