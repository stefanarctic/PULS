/**
 * Simulator apă grea — schimb izotopic H₂O–H₂S pe 3 etaje (concentrație globală 5% → 20% → 30%).
 */

const CONFIG = {
    PPM_NATURAL: 140,
    PPM_ETAJ1_MAX: 50000,
    PPM_ETAJ2_MAX: 200000,
    PPM_ETAJ3_MAX: 300000,
    COLD_TEMP_DEFAULT: 35,
    HOT_TEMP_DEFAULT: 130,
    LG_RATIO_DEFAULT: 0.5,
    LG_MIN_VALID: 0.48,
    LG_MAX_VALID: 0.52,
    PARTICLE_COUNT_PER_ETAJ: 72,
    SIM_SPEED_DEFAULT: 1.0,
};

const ETAJ_CAPS = [CONFIG.PPM_ETAJ1_MAX, CONFIG.PPM_ETAJ2_MAX, CONFIG.PPM_ETAJ3_MAX];

class Simulation {
    constructor() {
        this.coldTemp = CONFIG.COLD_TEMP_DEFAULT;
        this.hotTemp = CONFIG.HOT_TEMP_DEFAULT;
        this.lgRatio = CONFIG.LG_RATIO_DEFAULT;
        this.simSpeed = CONFIG.SIM_SPEED_DEFAULT;
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.activeEtaj = 1;
        this.unlocked = [true, false, false];
        this.etajUnlockTicks = 0;
        this.milestones = { p5: false, p20: false, p30: false };
        this.primaryScore = 0;
        this.trayYByColumn = {
            cold: [0.18, 0.35, 0.52, 0.69, 0.86],
            hot: [0.18, 0.35, 0.52, 0.69, 0.86],
        };
        this.isMobileView = window.matchMedia('(max-width: 900px)').matches;
        this.etaje = [];
        this.graphCanvas = document.getElementById('graphCanvas');
        this.graphCtx = this.graphCanvas.getContext('2d');

        this.collectEtaje();
        this.initCanvases();
        this.initParticlesAll();
        this.setupEventListeners();
        this.syncEtajUi();
        this.updateHints();
        this.updateColumnLabelsAll();
        this.refreshPanelStats();
        this.calculatePhysics();
        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.drawAll();
        this.animate();
    }

    collectEtaje() {
        document.querySelectorAll('.etaj-unit').forEach((el, i) => {
            const coldCanvas = el.querySelector('.coldCanvas');
            const hotCanvas = el.querySelector('.hotCanvas');
            this.etaje.push({
                el,
                index: i + 1,
                coldCanvas,
                hotCanvas,
                particles: [],
            });
        });
    }

    initCanvases() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.etaje.forEach((e) => {
            e.coldCanvas.width = e.coldCanvas.parentElement.clientWidth;
            e.coldCanvas.height = e.coldCanvas.parentElement.clientHeight;
            e.hotCanvas.width = e.hotCanvas.parentElement.clientWidth;
            e.hotCanvas.height = e.hotCanvas.parentElement.clientHeight;
        });
        this.graphCanvas.width = this.graphCanvas.parentElement.clientWidth;
        this.graphCanvas.height = this.graphCanvas.parentElement.clientHeight;
    }

    initParticlesAll() {
        this.etaje.forEach((e) => {
            e.particles = [];
            for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_ETAJ; i++) {
                const isCold = Math.random() > 0.3;
                const baseSpeed = isCold
                    ? 0.0016 + Math.random() * 0.0026
                    : 0.0009 + Math.random() * 0.0015;
                e.particles.push({
                    x: Math.random(),
                    y: Math.random(),
                    type: Math.random() > 0.88 ? 'heavy' : 'bubble',
                    radius: isCold ? 1.4 + Math.random() * 2.6 : 1.0 + Math.random() * 2.0,
                    speed: baseSpeed,
                    baseSpeed,
                    jitter: 0,
                    trayHold: 0,
                    column: isCold ? 'cold' : 'hot',
                });
            }
        });
    }

    setupEventListeners() {
        this.bindRangeAndInput('coldTempSlider', 'coldTempInput', (value) => {
            this.coldTemp = value;
            document.getElementById('coldTempVal').innerText = this.coldTemp + '°C';
            this.updateColumnLabelsAll();
            this.updateTemperatureVisuals();
            this.calculatePhysics();
        }, 0);

        this.bindRangeAndInput('hotTempSlider', 'hotTempInput', (value) => {
            this.hotTemp = value;
            document.getElementById('hotTempVal').innerText = this.hotTemp + '°C';
            this.updateColumnLabelsAll();
            this.updateTemperatureVisuals();
            this.calculatePhysics();
        }, 0);

        this.bindRangeAndInput('lgRatioSlider', 'lgRatioInput', (value) => {
            this.lgRatio = value;
            document.getElementById('lgRatioVal').innerText = this.lgRatio.toFixed(2);
            this.calculatePhysics();
        }, 3);

        this.bindRangeAndInput('simSpeedSlider', 'simSpeedInput', (value) => {
            this.simSpeed = value;
            document.getElementById('simSpeedVal').innerText = this.simSpeed.toFixed(1) + 'x';
        }, 1);

        document.getElementById('startBtn').addEventListener('click', () => {
            document.getElementById('overlay').classList.add('hidden');
            this.running = true;
            this.calculatePhysics();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });

        document.querySelectorAll('.etaj-unit').forEach((el) => {
            el.addEventListener('click', () => {
                const n = parseInt(el.getAttribute('data-etaj'), 10);
                if (el.classList.contains('etaj-locked')) return;
                this.setActiveEtaj(n);
            });
        });

        document.getElementById('panelToggleBtn').addEventListener('click', () => {
            this.openControlsPanel();
        });

        document.getElementById('panelCloseBtn').addEventListener('click', () => {
            this.closeControlsPanel();
        });

        document.getElementById('panelBackdrop').addEventListener('click', () => {
            this.closeControlsPanel();
        });

        window.addEventListener('resize', () => {
            const currentMobile = window.matchMedia('(max-width: 900px)').matches;
            if (currentMobile !== this.isMobileView) {
                this.isMobileView = currentMobile;
                if (!this.isMobileView) {
                    this.closeControlsPanel(true);
                }
            }
        });
    }

    bindRangeAndInput(sliderId, inputId, onChange, decimals) {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        const applyValue = (rawValue) => {
            if (!Number.isFinite(rawValue)) return;
            const clamped = Math.min(max, Math.max(min, rawValue));
            slider.value = clamped.toFixed(decimals);
            input.value = clamped.toFixed(decimals);
            onChange(clamped);
        };

        slider.addEventListener('input', (e) => {
            applyValue(parseFloat(e.target.value));
        });

        input.addEventListener('input', (e) => {
            const typed = e.target.value;
            if (typed === '' || typed === '-' || typed === '.') return;
            applyValue(parseFloat(typed));
        });

        input.addEventListener('change', () => {
            applyValue(parseFloat(input.value));
        });
    }

    openControlsPanel() {
        if (!this.isMobileView) return;
        document.getElementById('controlsPanel').classList.add('open');
        document.getElementById('panelBackdrop').classList.add('visible');
    }

    closeControlsPanel(force = false) {
        if (!this.isMobileView && !force) return;
        document.getElementById('controlsPanel').classList.remove('open');
        document.getElementById('panelBackdrop').classList.remove('visible');
    }

    gaussianScore(value, optimal, spread) {
        return Math.exp(-Math.pow((value - optimal) / spread, 2));
    }

    calculatePrimaryScore() {
        if (this.coldTemp < 30) return 0;
        const coldScore = this.gaussianScore(this.coldTemp, CONFIG.COLD_TEMP_DEFAULT, 1.6);
        const hotScore = this.gaussianScore(this.hotTemp, CONFIG.HOT_TEMP_DEFAULT, 1.8);
        const lgScore = this.efficiency(this.lgRatio);
        return Math.max(0, coldScore * hotScore * lgScore);
    }

    efficiency(lgRatio) {
        if (lgRatio < CONFIG.LG_MIN_VALID || lgRatio > CONFIG.LG_MAX_VALID) return 0;
        return Math.max(0, -10000 * Math.pow(lgRatio - 0.5, 2) + 1);
    }

    getCapForEtaj(etaj) {
        return ETAJ_CAPS[etaj - 1];
    }

    getFloorForEtaj(etaj) {
        if (etaj <= 1) return CONFIG.PPM_NATURAL;
        return ETAJ_CAPS[etaj - 2];
    }

    /** Afișaj panou / bară: nu depășește plafonul etajului activ (numărător „înghețat” la țintă). */
    getDisplayPpmForPanel() {
        return Math.min(this.currentPpm, this.getCapForEtaj(this.activeEtaj));
    }

    /** Citiri pe cardul fiecărui etaj: nu arată peste ținta acelui etaj (5% / 20% / 30%). */
    getDisplayPpmForEtaj(etajNum) {
        return Math.min(this.currentPpm, ETAJ_CAPS[etajNum - 1]);
    }

    refreshPanelStats() {
        const d = this.getDisplayPpmForPanel();
        const pct = d / 10000;
        document.getElementById('ppmDisplay').innerText = d.toFixed(0);
        document.getElementById('percentDisplay').innerText = pct.toFixed(4) + '%';
        document.getElementById('concFill').style.height = (d / CONFIG.PPM_ETAJ3_MAX) * 100 + '%';
    }

    calculatePhysics() {
        this.primaryScore = this.calculatePrimaryScore();
        this.drawGraph();
    }

    setActiveEtaj(n) {
        if (n < 1 || n > 3) return;
        if (!this.unlocked[n - 1]) return;
        this.activeEtaj = n;
        this.syncEtajUi();
        this.updateHints();
        this.refreshPanelStats();
        this.updateColumnLabelsAll();
    }

    syncEtajUi() {
        document.querySelectorAll('.etaj-unit').forEach((el) => {
            const n = parseInt(el.getAttribute('data-etaj'), 10);
            el.classList.toggle('etaj-active', n === this.activeEtaj);
            el.classList.toggle('etaj-locked', !this.unlocked[n - 1]);
            const overlay = el.querySelector('.etaj-lock-overlay');
            if (overlay) {
                overlay.classList.toggle('hidden', this.unlocked[n - 1]);
            }
            el.setAttribute('tabindex', this.unlocked[n - 1] ? '0' : '-1');
        });
    }

    tryUnlockNextEtaj() {
        const p = this.currentPpm;
        let unlockedNow = false;
        if (p >= CONFIG.PPM_ETAJ1_MAX && !this.unlocked[1]) {
            this.unlocked[1] = true;
            this.etajUnlockTicks = 160;
            this.syncEtajUi();
            this.triggerMoment('5');
            this.setActiveEtaj(2);
            unlockedNow = true;
        }
        if (p >= CONFIG.PPM_ETAJ2_MAX && !this.unlocked[2]) {
            this.unlocked[2] = true;
            this.etajUnlockTicks = 160;
            this.syncEtajUi();
            this.triggerMoment('20');
            this.setActiveEtaj(3);
            unlockedNow = true;
        }
        if (unlockedNow) this.updateHints();
    }

    updateHints() {
        const stageDisplay = document.getElementById('stageDisplay');
        const stageHint = document.getElementById('stageHint');
        stageDisplay.innerText = `Etaj ${this.activeEtaj} (activ)`;

        if (this.activeEtaj === 1) {
            stageHint.innerText =
                'Ținta: 5% D₂O. Fixează L/G între 0,48–0,52 (ideal 0,50), coloana rece ~35°C și cea caldă ~130°C. La 5% se deblochează Etajul 2 și treci automat la el.';
        } else if (this.activeEtaj === 2) {
            let t =
                'Ținta: 20% D₂O. Aceiași parametri ca la etajul 1. La 20% se deblochează Etajul 3 și treci automat la el (scenariu „rupere de pântă”).';
            if (this.unlocked[2]) {
                t =
                    'Ținta: 20% D₂O. Ai atins 20% — Etajul 3 este activ (ipoteză). Continuă spre 30%.';
            }
            stageHint.innerText = t;
        } else {
            stageHint.innerText =
                'Ținta: 30% D₂O — „rupere de pântă”. Etaj ipotetic: vizual ai și legături de lichid între coloane (plan nerealizat). Parametrii rămân aceiași ca la etajele 1–2.';
        }
    }

    updateColumnLabelsAll() {
        document.querySelectorAll('.etaj-unit').forEach((unit) => {
            const etajNum = parseInt(unit.getAttribute('data-etaj'), 10);
            const ppmShown = this.getDisplayPpmForEtaj(etajNum);
            const pct = ppmShown / 10000;
            const pctStr = pct.toFixed(4);
            const hotStr = (pct * 0.72).toFixed(4);
            const legacy = unit.classList.contains('etaj-unit--legacy');
            const coldTitle = legacy
                ? `COLOANĂ RECE (${this.coldTemp.toFixed(0)}°C)`
                : `RECE (${this.coldTemp.toFixed(0)}°C)`;
            const hotTitle = legacy
                ? `COLOANĂ CALDĂ (${this.hotTemp.toFixed(0)}°C)`
                : `CALD (${this.hotTemp.toFixed(0)}°C)`;
            const coldConc = legacy ? `D₂O concentration: ${pctStr}%` : `D₂O: ${pctStr}%`;
            const hotConc = legacy ? `D₂O concentration: ${hotStr}%` : `D₂O: ${hotStr}%`;
            unit.querySelectorAll('.cold-col .column-label').forEach((el) => {
                el.innerText = coldTitle;
            });
            unit.querySelectorAll('.hot-col .column-label').forEach((el) => {
                el.innerText = hotTitle;
            });
            unit.querySelectorAll('.cold-col .column-conc-label').forEach((el) => {
                el.innerText = coldConc;
            });
            unit.querySelectorAll('.hot-col .column-conc-label').forEach((el) => {
                el.innerText = hotConc;
            });
        });
    }

    updateTemperatureVisuals() {
        const coldNorm = (this.coldTemp - 20) / 30;
        const hotNorm = (this.hotTemp - 100) / 60;
        const d2oGlow = Math.min(1, this.currentPpm / CONFIG.PPM_ETAJ3_MAX);
        document.querySelectorAll('.cold-col').forEach((coldCol) => {
            const coldBlue = 200 + Math.round((1 - coldNorm) * 55);
            const coldIntensity = 0.2 + (1 - coldNorm) * 0.5;
            coldCol.style.borderColor = `rgb(80, ${coldBlue}, 255)`;
            coldCol.style.boxShadow = `0 0 ${8 + (1 - coldNorm) * 22}px rgba(90, 190, 255, ${coldIntensity}), 0 0 ${20 * d2oGlow}px rgba(255, 215, 0, ${0.4 * d2oGlow})`;
            coldCol.classList.toggle('crystallization', this.coldTemp < 30);
        });
        document.querySelectorAll('.hot-col').forEach((hotCol) => {
            const hotRed = 180 + Math.round(hotNorm * 75);
            const hotIntensity = 0.2 + hotNorm * 0.55;
            hotCol.style.borderColor = `rgb(${hotRed}, 90, 70)`;
            hotCol.style.boxShadow = `0 0 ${8 + hotNorm * 24}px rgba(255, 110, 80, ${hotIntensity}), 0 0 ${20 * d2oGlow}px rgba(255, 215, 0, ${0.35 * d2oGlow})`;
        });
    }

    updateProcessState() {
        const processState = document.getElementById('processState');
        const validLg = this.lgRatio >= CONFIG.LG_MIN_VALID && this.lgRatio <= CONFIG.LG_MAX_VALID;
        const validTemp = this.coldTemp >= 30;
        const active = validLg && validTemp && this.primaryScore > 0.1;
        const cap = this.getCapForEtaj(this.activeEtaj);
        const currentPercent = this.currentPpm / 10000;
        const targetPercent = cap / 10000;
        const nearCap = targetPercent - currentPercent < 0.35 && this.currentPpm < cap;

        processState.classList.toggle('process-optimal', active);
        processState.classList.toggle('process-idle', !active);

        if (this.etajUnlockTicks > 0) {
            processState.innerText = `Etaj deblocat`;
        } else if (this.coldTemp < 30) {
            processState.innerText = 'Cristalizare — proces ineficient';
        } else if (this.primaryScore >= 0.82) {
            processState.innerText = 'Zonă bună';
        } else if (this.primaryScore >= 0.35) {
            processState.innerText = 'Acceptabil';
        } else if (nearCap) {
            processState.innerText = 'Aproape de ținta etajului';
        } else if (active) {
            processState.innerText = 'Schimb izotopic activ';
        } else {
            processState.innerText = 'Reglează L/G și temperaturile';
        }

        document.querySelectorAll('.column').forEach((col) => {
            col.classList.toggle('lg-optimal', validLg);
            col.classList.toggle('lg-off', !validLg);
        });

        this.updateInterStageConnectors(active);
    }

    updateInterStageConnectors(flowOptimal) {
        document.querySelectorAll('.etaje-connector').forEach((el) => {
            el.classList.toggle('etaje-connector--optimal', flowOptimal);
            el.classList.toggle('etaje-connector--stalled', this.running && !flowOptimal);
        });
    }

    triggerMoment(type) {
        const simArea = document.querySelector('.simulation-area');
        if (type === '5') {
            simArea.classList.remove('moment-flash');
            void simArea.offsetWidth;
            simArea.classList.add('moment-flash');
            setTimeout(() => simArea.classList.remove('moment-flash'), 380);
        } else if (type === '20') {
            simArea.classList.remove('moment-pulse');
            void simArea.offsetWidth;
            simArea.classList.add('moment-pulse');
            setTimeout(() => simArea.classList.remove('moment-pulse'), 650);
        } else if (type === '30') {
            document.querySelectorAll('.column').forEach((c) => c.classList.add('moment-glow-upgrade'));
        }
    }

    update() {
        if (!this.running || this.completed) return;
        const simFactor = Math.pow(this.simSpeed, 1.2);
        if (this.etajUnlockTicks > 0) this.etajUnlockTicks -= simFactor;

        const validLg = this.lgRatio >= CONFIG.LG_MIN_VALID && this.lgRatio <= CONFIG.LG_MAX_VALID;
        const tempsOk = this.coldTemp >= 30;
        const cap = this.getCapForEtaj(this.activeEtaj);
        const floor = this.getFloorForEtaj(this.activeEtaj);

        let deltaPpm = 0;
        if (validLg && tempsOk && this.currentPpm < cap - 1e-9) {
            deltaPpm = 8 + 85 * this.primaryScore;
        }
        let proposed = this.currentPpm + deltaPpm * simFactor;
        proposed = Math.min(proposed, cap);
        if (proposed < floor) proposed = floor;
        this.currentPpm = Math.max(this.currentPpm, proposed);

        this.tryUnlockNextEtaj();

        const flowOk = validLg && tempsOk && this.primaryScore > 0.1;
        if (!flowOk) {
            const fl = this.getFloorForEtaj(this.activeEtaj);
            this.currentPpm = Math.max(fl, this.currentPpm - 0.12 * simFactor);
        }

        const concentrationRatio = Math.min(1, this.currentPpm / CONFIG.PPM_ETAJ3_MAX);
        const displayPercentNum = this.currentPpm / 10000;
        this.refreshPanelStats();

        if (!this.milestones.p5 && displayPercentNum >= 5) {
            this.milestones.p5 = true;
        }
        if (!this.milestones.p20 && displayPercentNum >= 20) {
            this.milestones.p20 = true;
        }
        if (!this.milestones.p30 && displayPercentNum >= 30) {
            this.milestones.p30 = true;
            this.triggerMoment('30');
        }

        this.etaje.forEach((e) => {
            e.particles.forEach((p) => {
                const isColdColumn = p.column === 'cold';
                const speedFactor = isColdColumn ? 1.32 : 0.72;
                const traySlowFactor = p.trayHold > 0 ? 0.5 : 1;
                const d2oSlowFactor = 1 - concentrationRatio * 0.3;
                p.y -= p.speed * d2oSlowFactor * speedFactor * traySlowFactor * simFactor;
                p.jitter *= Math.pow(0.92 + concentrationRatio * 0.03, simFactor);
                p.x += (Math.random() - 0.5) * p.jitter;
                p.x = Math.max(0.04, Math.min(0.96, p.x));
                p.trayHold = Math.max(0, p.trayHold - simFactor);

                const trays = this.trayYByColumn[p.column];
                for (const trayY of trays) {
                    if (Math.abs(p.y - trayY) < 0.008) {
                        p.trayHold = Math.max(p.trayHold, isColdColumn ? 20 : 8);
                        p.speed = Math.max(p.baseSpeed * 0.45, p.speed * 0.86);
                        p.y += (Math.random() - 0.5) * (isColdColumn ? 0.006 : 0.004);
                        p.x += (Math.random() - 0.5) * (isColdColumn ? 0.015 : 0.01);
                        p.jitter = (isColdColumn ? 0.015 : 0.004) + Math.random() * (isColdColumn ? 0.018 : 0.006);
                    }
                }

                p.speed += (p.baseSpeed - p.speed) * 0.035 * simFactor;

                if (p.y < -0.03) {
                    p.y = 1.03;
                    p.x = 0.1 + Math.random() * 0.8;
                    p.column = Math.random() > 0.28 ? 'cold' : 'hot';
                    const becomesCold = p.column === 'cold';
                    p.baseSpeed = becomesCold
                        ? 0.0016 + Math.random() * 0.0026
                        : 0.0009 + Math.random() * 0.0015;
                    p.speed = p.baseSpeed;
                    p.trayHold = 0;
                    if (Math.random() < 0.06) {
                        p.type = 'heavy';
                    } else {
                        p.type = this.coldTemp < 30 && Math.random() < 0.9 ? 'crystal' : 'bubble';
                    }
                    p.radius = becomesCold ? 1.4 + Math.random() * 2.6 : 1.0 + Math.random() * 2.0;
                }

                if (Math.random() < 0.002) {
                    p.type = Math.random() < (this.currentPpm / CONFIG.PPM_ETAJ3_MAX) ? 'heavy' : 'bubble';
                }
            });
        });

        this.calculatePhysics();
        this.updateColumnLabelsAll();

        if (!this.completed && this.currentPpm >= CONFIG.PPM_ETAJ3_MAX - 0.5) {
            this.currentPpm = CONFIG.PPM_ETAJ3_MAX;
            this.showSuccessState();
        }

        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.drawAll();
    }

    drawAll() {
        this.etaje.forEach((e) => this.drawEtaj(e));
    }

    drawEtaj(e) {
        [e.coldCanvas, e.hotCanvas].forEach((canvas, idx) => {
            const isCold = idx === 0;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            const intensity = Math.min(0.55, this.currentPpm / CONFIG.PPM_ETAJ3_MAX);
            if (isCold) {
                const coldNorm = (this.coldTemp - 20) / 30;
                const coldGlow = 0.16 + (1 - coldNorm) * 0.3;
                grad.addColorStop(0, `rgba(170, 225, 255, ${coldGlow})`);
                grad.addColorStop(1, `rgba(35, 110, 190, ${0.25 + intensity * 0.5})`);
            } else {
                const hotNorm = (this.hotTemp - 100) / 60;
                const hotGlow = 0.14 + hotNorm * 0.34;
                grad.addColorStop(0, `rgba(130, 55, 35, ${hotGlow})`);
                grad.addColorStop(1, `rgba(255, 132, 78, ${0.26 + intensity * 0.4})`);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            e.particles.forEach((p) => {
                if ((isCold && p.column === 'cold') || (!isCold && p.column === 'hot')) {
                    if (isCold && this.coldTemp < 30 && p.type === 'bubble' && Math.random() < 0.88) {
                        return;
                    }
                    ctx.beginPath();
                    const px = p.x * canvas.width;
                    const py = p.y * canvas.height;
                    const radius = p.type === 'heavy' ? Math.max(2.5, p.radius) : p.radius;
                    ctx.arc(px, py, radius, 0, Math.PI * 2);
                    if (p.type === 'heavy') {
                        ctx.fillStyle = '#f1c40f';
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = '#f1c40f';
                    } else if (p.type === 'crystal') {
                        ctx.fillStyle = 'rgba(240, 248, 255, 0.9)';
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = 'rgba(220, 240, 255, 0.8)';
                    } else {
                        const bubbleAlpha = isCold && this.coldTemp < 30 ? 0.12 : (isCold ? 0.55 : 0.35);
                        const concentrationRatio = Math.min(1, this.currentPpm / CONFIG.PPM_ETAJ3_MAX);
                        const depthFactor = isCold ? (py / canvas.height) : 1;
                        const yellowChance = Math.min(1, concentrationRatio * (isCold ? (0.45 + 0.85 * depthFactor) : 0.5));
                        const showYellow = Math.random() < yellowChance;
                        ctx.fillStyle = showYellow
                            ? `rgba(241,196,15,${Math.min(0.95, bubbleAlpha + 0.2)})`
                            : `rgba(255,255,255,${bubbleAlpha})`;
                        ctx.shadowBlur = isCold ? 5 : 2;
                        ctx.shadowColor = showYellow
                            ? `rgba(241,196,15,${0.25 + concentrationRatio * 0.45})`
                            : (isCold ? 'rgba(180,230,255,0.45)' : 'rgba(255,210,170,0.25)');
                    }
                    ctx.fill();
                }
            });
            ctx.shadowBlur = 0;
        });
    }

    drawGraph() {
        const ctx = this.graphCtx;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = '#0b0f14';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        for (let gx = 40; gx <= w - 20; gx += 24) {
            ctx.beginPath();
            ctx.moveTo(gx, 20);
            ctx.lineTo(gx, h - 30);
            ctx.stroke();
        }
        for (let gy = 20; gy <= h - 30; gy += 20) {
            ctx.beginPath();
            ctx.moveTo(40, gy);
            ctx.lineTo(w - 20, gy);
            ctx.stroke();
        }

        ctx.strokeStyle = '#8fa2b4';
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, h - 30);
        ctx.lineTo(w - 20, h - 30);
        ctx.stroke();

        ctx.fillStyle = '#95a5a6';
        ctx.font = '10px Arial';

        const xMin = 0.45;
        const xMax = 0.55;
        const currentValue = this.lgRatio;

        ctx.fillText('r = L/G', w / 2, h - 10);
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('eficiență', 0, 0);
        ctx.restore();

        ctx.strokeStyle = 'rgba(78, 167, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 40; x < w - 20; x++) {
            const normX = (x - 40) / (w - 60);
            const value = xMin + normX * (xMax - xMin);
            const eff = this.efficiency(value);
            const y = h - 30 - eff * (h - 60);
            if (x === 40) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        const currentX = 40 + ((currentValue - xMin) / (xMax - xMin)) * (w - 60);
        const currentEff = this.efficiency(currentValue);
        const currentY = h - 30 - currentEff * (h - 60);

        ctx.fillStyle = (currentValue >= CONFIG.LG_MIN_VALID && currentValue <= CONFIG.LG_MAX_VALID) ? '#58d68d' : '#ff7070';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        if (currentValue >= CONFIG.LG_MIN_VALID && currentValue <= CONFIG.LG_MAX_VALID) {
            ctx.beginPath();
            ctx.arc(currentX, currentY, 10 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(88, 214, 141, 0.45)';
            ctx.stroke();
        }

        ctx.fillStyle = '#95a5a6';
        ctx.fillText('0.48', 40 + ((0.48 - xMin) / (xMax - xMin)) * (w - 60) - 10, h - 34);
        ctx.fillText('0.50', 40 + ((0.5 - xMin) / (xMax - xMin)) * (w - 60) - 10, h - 34);
        ctx.fillText('0.52', 40 + ((0.52 - xMin) / (xMax - xMin)) * (w - 60) - 10, h - 34);
    }

    showSuccessState() {
        this.completed = true;
        this.running = false;

        try {
            localStorage.setItem('puls_izotopic_gs_complete', '1');
        } catch (_) {
            /* ignore private mode / blocked storage */
        }

        document.getElementById('ppmDisplay').innerText = CONFIG.PPM_ETAJ3_MAX.toFixed(0);
        document.getElementById('percentDisplay').innerText = '30.0000%';
        document.getElementById('concFill').style.height = '100%';

        document.getElementById('successSummary').innerHTML = `
            <p>Ai urcat concentrația de la 140 ppm la <strong>30% D₂O</strong>, trecând pe rând prin etajele de schimb izotopic.</p>
            <p><strong>Etaj 1:</strong> până la 5% cu coloana rece la ${this.coldTemp.toFixed(0)}°C, coloana caldă la ${this.hotTemp.toFixed(0)}°C și L/G ${this.lgRatio.toFixed(2)}.</p>
            <p><strong>Etaj 2:</strong> același regim de parametri, până la 20%.</p>
            <p><strong>Etaj 3:</strong> scenariul ipotetic „rupere de pântă” până la 30% — cu ocoluri suplimentare de lichid doar ca idee de proiect, nu ca instalație reală documentată aici.</p>
        `;

        document.getElementById('successOverlay').classList.remove('hidden');
    }

    restart() {
        this.coldTemp = CONFIG.COLD_TEMP_DEFAULT;
        this.hotTemp = CONFIG.HOT_TEMP_DEFAULT;
        this.lgRatio = CONFIG.LG_RATIO_DEFAULT;
        this.simSpeed = CONFIG.SIM_SPEED_DEFAULT;
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.activeEtaj = 1;
        this.unlocked = [true, false, false];
        this.etajUnlockTicks = 0;
        this.milestones = { p5: false, p20: false, p30: false };
        this.primaryScore = 0;
        this.initParticlesAll();

        document.getElementById('coldTempSlider').value = this.coldTemp;
        document.getElementById('coldTempInput').value = this.coldTemp.toFixed(0);
        document.getElementById('hotTempSlider').value = this.hotTemp;
        document.getElementById('hotTempInput').value = this.hotTemp.toFixed(0);
        document.getElementById('lgRatioSlider').value = this.lgRatio;
        document.getElementById('lgRatioInput').value = this.lgRatio.toFixed(3);
        document.getElementById('simSpeedSlider').value = this.simSpeed.toFixed(1);
        document.getElementById('simSpeedInput').value = this.simSpeed.toFixed(1);
        document.getElementById('coldTempVal').innerText = this.coldTemp + '°C';
        document.getElementById('hotTempVal').innerText = this.hotTemp + '°C';
        document.getElementById('lgRatioVal').innerText = this.lgRatio.toFixed(2);
        document.getElementById('simSpeedVal').innerText = this.simSpeed.toFixed(1) + 'x';
        document.getElementById('successOverlay').classList.add('hidden');
        document.getElementById('overlay').classList.remove('hidden');
        document.querySelectorAll('.column').forEach((c) => c.classList.remove('moment-glow-upgrade'));

        this.syncEtajUi();
        this.updateHints();
        this.updateColumnLabelsAll();
        this.refreshPanelStats();
        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.drawAll();
        this.drawGraph();
    }

    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sim = new Simulation();
});
