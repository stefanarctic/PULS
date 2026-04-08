/**
 * Simulator de apa grea - logica principala.
 * Model simplificat cu doua etape:
 * 1. imbogatire primara prin schimb izotopic H2O - H2S;
 * 2. finisare prin rectificare sub vid pana la 99.8%.
 */

const CONFIG = {
    PPM_NATURAL: 140,
    PRIMARY_HANDOFF_PPM: 50000, // 5%
    STAGE2_MAX_PPM: 200000, // 20%
    STAGE3_MAX_PPM: 300000, // 30%
    TARGET_PPM: 998000, // 99.8%
    COLD_TEMP_DEFAULT: 35,
    HOT_TEMP_DEFAULT: 130,
    LG_RATIO_DEFAULT: 0.5,
    LG_RATIO_OPTIMAL: 0.5,
    LG_MIN_VALID: 0.48,
    LG_MAX_VALID: 0.52,
    VACUUM_DEFAULT: 55,
    VACUUM_OPTIMAL: 45,
    REFLUX_DEFAULT: 4.0,
    REFLUX_OPTIMAL: 4.5,
    PARTICLE_COUNT: 210,
    SUCCESS_EPSILON_PPM: 0.5,
    SIM_SPEED_DEFAULT: 1.0,
};

class Simulation {
    constructor() {
        this.coldTemp = CONFIG.COLD_TEMP_DEFAULT;
        this.hotTemp = CONFIG.HOT_TEMP_DEFAULT;
        this.lgRatio = CONFIG.LG_RATIO_DEFAULT;
        this.vacuumPressure = CONFIG.VACUUM_DEFAULT;
        this.refluxRatio = CONFIG.REFLUX_DEFAULT;
        this.simSpeed = CONFIG.SIM_SPEED_DEFAULT;
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.stage = 1;
        this.lastStage = 1;
        this.stageUnlockTicks = 0;
        this.milestones = { p5: false, p20: false, p30: false, p90: false };
        this.primaryScore = 0;
        this.finishingScore = 0;
        this.particles = [];
        this.trayYByColumn = {
            cold: [0.18, 0.35, 0.52, 0.69, 0.86],
            hot: [0.28, 0.72],
        };
        this.isMobileView = window.matchMedia('(max-width: 900px)').matches;
        this.initCanvases();
        this.initParticles();
        this.setupEventListeners();
        this.updateControlStates();
        this.updateStageInfo();
        this.updateColumnTemperatureLabels();
        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.draw();
        this.drawGraph();
        this.animate();
    }

    initCanvases() {
        this.coldCanvas = document.getElementById('coldCanvas');
        this.hotCanvas = document.getElementById('hotCanvas');
        this.graphCanvas = document.getElementById('graphCanvas');
        this.coldCtx = this.coldCanvas.getContext('2d');
        this.hotCtx = this.hotCanvas.getContext('2d');
        this.graphCtx = this.graphCanvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.coldCanvas.width = this.coldCanvas.parentElement.clientWidth;
        this.coldCanvas.height = this.coldCanvas.parentElement.clientHeight;
        this.hotCanvas.width = this.hotCanvas.parentElement.clientWidth;
        this.hotCanvas.height = this.hotCanvas.parentElement.clientHeight;
        this.graphCanvas.width = this.graphCanvas.parentElement.clientWidth;
        this.graphCanvas.height = this.graphCanvas.parentElement.clientHeight;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const isCold = Math.random() > 0.3;
            const baseSpeed = isCold
                ? 0.0016 + Math.random() * 0.0026
                : 0.0009 + Math.random() * 0.0015;
            this.particles.push({
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
    }

    setupEventListeners() {
        this.bindRangeAndInput('coldTempSlider', 'coldTempInput', (value) => {
            this.coldTemp = value;
            document.getElementById('coldTempVal').innerText = this.coldTemp + '°C';
            this.updateColumnTemperatureLabels();
            this.updateTemperatureVisuals();
            this.calculatePhysics();
        }, 0);

        this.bindRangeAndInput('hotTempSlider', 'hotTempInput', (value) => {
            this.hotTemp = value;
            document.getElementById('hotTempVal').innerText = this.hotTemp + '°C';
            this.updateColumnTemperatureLabels();
            this.updateTemperatureVisuals();
            this.calculatePhysics();
        }, 0);

        this.bindRangeAndInput('lgRatioSlider', 'lgRatioInput', (value) => {
            this.lgRatio = value;
            document.getElementById('lgRatioVal').innerText = this.lgRatio.toFixed(2);
            this.calculatePhysics();
        }, 3);

        this.bindRangeAndInput('vacuumSlider', 'vacuumInput', (value) => {
            this.vacuumPressure = value;
            document.getElementById('vacuumVal').innerText = this.vacuumPressure.toFixed(0) + ' mbar';
            this.calculatePhysics();
        }, 0);

        this.bindRangeAndInput('refluxSlider', 'refluxInput', (value) => {
            this.refluxRatio = value;
            document.getElementById('refluxVal').innerText = this.refluxRatio.toFixed(2);
            this.calculatePhysics();
        }, 2);

        this.bindRangeAndInput('simSpeedSlider', 'simSpeedInput', (value) => {
            this.simSpeed = value;
            document.getElementById('simSpeedVal').innerText = this.simSpeed.toFixed(1) + 'x';
        }, 1);

        document.getElementById('startBtn').addEventListener('click', () => {
            document.getElementById('overlay').classList.add('hidden');
            this.running = true;
            this.calculatePhysics();
        });

        document.getElementById('continueBtn').addEventListener('click', () => {
            document.getElementById('successOverlay').classList.add('hidden');
            this.running = true;
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
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

    calculateFinishingScore() {
        // Peak real: intervalele sunt "posibile", dar maximul e in jur de P~42 si R~4.5.
        const pEff = -Math.pow(this.vacuumPressure - 42, 2) / 200 + 1;
        const rEff = -Math.pow(this.refluxRatio - 4.5, 2) / 2 + 1;
        return Math.max(0, pEff * rEff);
    }

    calculateStage3Score() {
        return this.calculateFinishingScore();
    }

    getStageFromConcentration() {
        if (this.currentPpm < CONFIG.PRIMARY_HANDOFF_PPM) return 1;
        if (this.currentPpm < CONFIG.STAGE2_MAX_PPM) return 2;
        if (this.currentPpm < CONFIG.STAGE3_MAX_PPM) return 3;
        return 4;
    }

    calculatePhysics() {
        this.primaryScore = this.calculatePrimaryScore();
        this.finishingScore = this.calculateFinishingScore();
        const currentStage = this.getStageFromConcentration();
        if (currentStage !== this.lastStage) {
            this.stageUnlockTicks = 180;
            this.lastStage = currentStage;
        }
        this.stage = currentStage;
        this.updateStageInfo();
        this.drawGraph();
    }

    updateControlStates() {
        const stage1Only = this.stage === 1;
        document.getElementById('coldTempSlider').disabled = !stage1Only;
        document.getElementById('coldTempInput').disabled = !stage1Only;
        document.getElementById('hotTempSlider').disabled = !stage1Only;
        document.getElementById('hotTempInput').disabled = !stage1Only;
        document.getElementById('lgRatioSlider').disabled = !stage1Only;
        document.getElementById('lgRatioInput').disabled = !stage1Only;
        document.getElementById('vacuumSlider').disabled = stage1Only;
        document.getElementById('vacuumInput').disabled = stage1Only;
        document.getElementById('refluxSlider').disabled = stage1Only;
        document.getElementById('refluxInput').disabled = stage1Only;
    }

    updateStageInfo() {
        const stageDisplay = document.getElementById('stageDisplay');
        const stageHint = document.getElementById('stageHint');

        if (this.stage === 1) {
            stageDisplay.innerText = 'Etapa 1: 0% -> 5%';
            stageHint.innerText =
                'Pas 1: fixează L/G la 0.48-0.52 (ideal 0.50). Pas 2: ține coloana rece la 35°C și caldă la 130°C. Pas 3: menține stabil până la 5% (tranziție automată).';
        } else if (this.stage === 2) {
            stageDisplay.innerText = 'Etapa 2: 5% -> 20%';
            stageHint.innerText =
                'Pas 1: reglează presiunea în 30-60 mbar. Pas 2: ține refluxul în 3-6. Pas 3: caută sweet spot (P~42, R~4.5) pentru avans rapid spre 20%.';
        } else if (this.stage === 3) {
            stageDisplay.innerText = 'Etapa 3: 20% -> 30%';
            stageHint.innerText =
                'Pas 1: păstrează P și R aproape fix la optim. Pas 2: evită oscilațiile mari (sunt penalizate). Pas 3: stabilizează procesul până la 30%.';
        } else {
            stageDisplay.innerText = 'Etapa 4: 30% -> 99.8%';
            stageHint.innerText =
                'Pas 1: menține control fin pe P/Reflux în zona de vârf. Pas 2: acceptă ritm lent spre final (asimptotic). Pas 3: evită abaterile, altfel apar pierderi.';
        }
    }

    updateColumnTemperatureLabels() {
        const coldLabel = document.getElementById('coldColumnLabel');
        const hotLabel = document.getElementById('hotColumnLabel');
        coldLabel.innerText = `COLOANĂ RECE (${this.coldTemp.toFixed(0)}°C)`;
        hotLabel.innerText = `COLOANĂ CALDĂ (${this.hotTemp.toFixed(0)}°C)`;
    }

    updateTemperatureVisuals() {
        const coldNorm = (this.coldTemp - 20) / 30; // 20 - 50
        const hotNorm = (this.hotTemp - 100) / 60; // 100 - 160
        const d2oGlow = Math.min(1, this.currentPpm / 1000000);
        const coldCol = document.querySelector('.cold-col');
        const hotCol = document.querySelector('.hot-col');

        const coldBlue = 200 + Math.round((1 - coldNorm) * 55);
        const coldIntensity = 0.2 + (1 - coldNorm) * 0.5;
        coldCol.style.borderColor = `rgb(80, ${coldBlue}, 255)`;
        coldCol.style.boxShadow = `0 0 ${8 + (1 - coldNorm) * 22}px rgba(90, 190, 255, ${coldIntensity}), 0 0 ${20 * d2oGlow}px rgba(255, 215, 0, ${0.4 * d2oGlow})`;

        const hotRed = 180 + Math.round(hotNorm * 75);
        const hotIntensity = 0.2 + hotNorm * 0.55;
        hotCol.style.borderColor = `rgb(${hotRed}, 90, 70)`;
        hotCol.style.boxShadow = `0 0 ${8 + hotNorm * 24}px rgba(255, 110, 80, ${hotIntensity}), 0 0 ${20 * d2oGlow}px rgba(255, 215, 0, ${0.35 * d2oGlow})`;

        coldCol.classList.toggle('crystallization', this.coldTemp < 30);
    }

    updateProcessState() {
        const processState = document.getElementById('processState');
        const coldCol = document.querySelector('.cold-col');
        const hotCol = document.querySelector('.hot-col');
        const validLg = this.lgRatio >= CONFIG.LG_MIN_VALID && this.lgRatio <= CONFIG.LG_MAX_VALID;
        const validTemp = this.coldTemp >= 30;
        const active = validLg && validTemp && this.primaryScore > 0.1;
        const stageEff = this.stage === 1 ? this.primaryScore : this.finishingScore;
        const currentPercent = this.currentPpm / 10000;
        const nextThreshold = this.stage === 1 ? 5 : this.stage === 2 ? 20 : this.stage === 3 ? 30 : 99.8;
        const nearUnlock = this.stage < 4 && (nextThreshold - currentPercent) < 0.8;

        processState.classList.toggle('process-optimal', active);
        processState.classList.toggle('process-idle', !active);

        if (this.stageUnlockTicks > 0) {
            processState.innerText = `Stage ${this.stage} unlocked`;
        } else if (this.coldTemp < 30) {
            processState.innerText = 'Crystallization - process inefficient';
        } else if (stageEff >= 0.82) {
            processState.innerText = 'Perfect zone';
        } else if (stageEff >= 0.35) {
            processState.innerText = 'Acceptable';
        } else if (nearUnlock) {
            processState.innerText = 'Approaching next enrichment stage';
        } else if (active) {
            processState.innerText = 'Optimal exchange';
        } else {
            processState.innerText = 'Process idle';
        }

        coldCol.classList.toggle('lg-optimal', validLg);
        hotCol.classList.toggle('lg-optimal', validLg);
        coldCol.classList.toggle('lg-off', !validLg);
        hotCol.classList.toggle('lg-off', !validLg);
    }

    triggerMoment(type) {
        const simArea = document.querySelector('.simulation-area');
        const coldCol = document.querySelector('.cold-col');
        const hotCol = document.querySelector('.hot-col');
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
            coldCol.classList.add('moment-glow-upgrade');
            hotCol.classList.add('moment-glow-upgrade');
        } else if (type === '90') {
            document.body.classList.add('gold-mode');
        }
    }

    update() {
        if (!this.running) return;
        const simFactor = Math.pow(this.simSpeed, 1.2);
        if (this.stageUnlockTicks > 0) this.stageUnlockTicks -= simFactor;
        this.stage = this.getStageFromConcentration();
        const concentrationRatio = Math.min(1, this.currentPpm / 1000000);

        const validLg = this.lgRatio >= CONFIG.LG_MIN_VALID && this.lgRatio <= CONFIG.LG_MAX_VALID;
        const tempsOk = this.coldTemp >= 30;
        const stage3Score = this.calculateStage3Score();
        let deltaPpm = 0;

        if (this.stage === 1) {
            if (validLg && tempsOk) {
                deltaPpm = 10 + 90 * this.primaryScore;
            }
        } else if (this.stage === 2) {
            const eff = this.finishingScore * 1.0;
            if (eff > 0.12) {
                deltaPpm = 4 + 34 * eff;
            }
            if (eff < 0.2) {
                deltaPpm -= 2.2;
            }
        } else if (this.stage === 3) {
            const eff = stage3Score * 0.6;
            if (eff > 0.3) {
                deltaPpm = 0.7 + 12 * eff;
            } else {
                deltaPpm = -(1.5 + 8 * (1 - eff));
            }
            if (eff < 0.2) {
                deltaPpm -= 3.0;
            }
        } else {
            const remaining = Math.max(0, CONFIG.TARGET_PPM - this.currentPpm);
            const remainingNorm = remaining / CONFIG.TARGET_PPM;
            const asymptoticFactor = 1 - Math.exp(-(4.2 * remainingNorm));
            const quality = Math.max(0.03, this.finishingScore * 0.3);
            deltaPpm = (0.6 + 9 * quality) * asymptoticFactor;
            if (quality < 0.2) {
                deltaPpm -= 2.0;
            }
        }
        this.currentPpm += deltaPpm * simFactor;
        this.currentPpm = Math.max(CONFIG.PPM_NATURAL, Math.min(CONFIG.TARGET_PPM, this.currentPpm));

        const displayPpm = this.currentPpm.toFixed(0);
        const displayPercent = (this.currentPpm / 10000).toFixed(4);
        const displayPercentNum = Number(displayPercent);
        document.getElementById('ppmDisplay').innerText = displayPpm;
        document.getElementById('percentDisplay').innerText = displayPercent + '%';
        document.getElementById('concFill').style.height = (this.currentPpm / CONFIG.TARGET_PPM * 100) + '%';
        document.getElementById('coldConcLabel').innerText = `D₂O concentration: ${displayPercent}%`;
        // Coloana calda ramane mai "curata", afisand mai putin D2O relativ.
        document.getElementById('hotConcLabel').innerText = `D₂O concentration: ${(displayPercentNum * 0.72).toFixed(4)}%`;

        if (!this.milestones.p5 && displayPercentNum >= 5) {
            this.milestones.p5 = true;
            this.triggerMoment('5');
        }
        if (!this.milestones.p20 && displayPercentNum >= 20) {
            this.milestones.p20 = true;
            this.triggerMoment('20');
        }
        if (!this.milestones.p30 && displayPercentNum >= 30) {
            this.milestones.p30 = true;
            this.triggerMoment('30');
        }
        if (!this.milestones.p90 && displayPercentNum >= 90) {
            this.milestones.p90 = true;
            this.triggerMoment('90');
        }

        this.particles.forEach((p) => {
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
                    // Simuleaza "holdup" pe sita: incetinire + adunare locala + turbulenta mica.
                    p.trayHold = Math.max(p.trayHold, isColdColumn ? 20 : 8);
                    p.speed = Math.max(p.baseSpeed * 0.45, p.speed * 0.86);
                    p.y += (Math.random() - 0.5) * (isColdColumn ? 0.006 : 0.004);
                    p.x += (Math.random() - 0.5) * (isColdColumn ? 0.015 : 0.01);
                    p.jitter = (isColdColumn ? 0.015 : 0.004) + Math.random() * (isColdColumn ? 0.018 : 0.006);
                }
            }

            // Revine treptat la viteza nominala dupa ce iese din zona de sita.
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
                p.type = Math.random() < (this.currentPpm / CONFIG.TARGET_PPM) ? 'heavy' : 'bubble';
            }
        });

        this.calculatePhysics();
        this.updateControlStates();

        const displayedPercentRounded = Number((this.currentPpm / 10000).toFixed(4));
        const nearTargetPpm = this.currentPpm >= (CONFIG.TARGET_PPM - 120);
        const nearTargetPercent = displayedPercentRounded >= 99.8;
        if (!this.completed && (this.currentPpm >= CONFIG.TARGET_PPM || nearTargetPpm || nearTargetPercent)) {
            this.currentPpm = CONFIG.TARGET_PPM;
            this.showSuccessState();
        }

        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.draw();
        this.drawGraph();
    }

    draw() {
        [this.coldCtx, this.hotCtx].forEach((ctx, idx) => {
            const isCold = idx === 0;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            const intensity = Math.min(0.5, this.currentPpm / CONFIG.TARGET_PPM);
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
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            this.particles.forEach((p) => {
                if ((isCold && p.column === 'cold') || (!isCold && p.column === 'hot')) {
                    if (isCold && this.coldTemp < 30 && p.type === 'bubble' && Math.random() < 0.88) {
                        return;
                    }
                    ctx.beginPath();
                    const px = p.x * ctx.canvas.width;
                    const py = p.y * ctx.canvas.height;
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
                        const concentrationRatio = Math.min(1, this.currentPpm / 1000000);
                        const depthFactor = isCold ? (py / ctx.canvas.height) : 1;
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

        const xLabel = 'r = L/G';
        const yLabel = 'p × p';
        const xMin = 0.45;
        const xMax = 0.55;
        const currentValue = this.lgRatio;

        ctx.fillText(xLabel, w / 2, h - 10);
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yLabel, 0, 0);
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

        document.getElementById('ppmDisplay').innerText = CONFIG.TARGET_PPM.toFixed(0);
        document.getElementById('percentDisplay').innerText = '99.8000%';
        document.getElementById('concFill').style.height = '100%';

        document.getElementById('successSummary').innerHTML = `
            <p><strong>Felicitări!</strong> Ai atins pragul nuclear exact de <strong>99.8%</strong>, adică ${CONFIG.TARGET_PPM.toLocaleString('ro-RO')} ppm D₂O.</p>
            <p><strong>Etapa 1 - îmbogățire primară:</strong> ai dus alimentarea de la 140 ppm la pragul de 5% folosind coloana rece la ${this.coldTemp.toFixed(0)}°C, coloana caldă la ${this.hotTemp.toFixed(0)}°C și raportul L/G ${this.lgRatio.toFixed(2)}.</p>
            <p><strong>Etapa 2 - finisare:</strong> ai continuat concentrarea prin rectificare sub vid, cu presiunea de ${this.vacuumPressure.toFixed(0)} mbar și raportul de reflux ${this.refluxRatio.toFixed(2)}, până la puritatea finală cerută.</p>
            <ul>
                <li>În coloana rece, deuteriul trece preferențial în faza lichidă.</li>
                <li>În coloana caldă, echilibrul se inversează și transferul favorizează faza gazoasă.</li>
                <li>Alternarea celor două coloane produce îmbogățirea primară, dar numai până la domeniul intermediar de 10-30%.</li>
                <li>După aceea, rectificarea sub vid preia debitul mic și îl duce la concentrația finală de 99.8%.</li>
                <li>Succesul apare doar când ambii pași funcționează suficient de aproape de regimul lor optim.</li>
            </ul>
        `;

        document.getElementById('successOverlay').classList.remove('hidden');
    }

    restart() {
        this.coldTemp = CONFIG.COLD_TEMP_DEFAULT;
        this.hotTemp = CONFIG.HOT_TEMP_DEFAULT;
        this.lgRatio = CONFIG.LG_RATIO_DEFAULT;
        this.vacuumPressure = CONFIG.VACUUM_DEFAULT;
        this.refluxRatio = CONFIG.REFLUX_DEFAULT;
        this.simSpeed = CONFIG.SIM_SPEED_DEFAULT;
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.stage = 1;
        this.lastStage = 1;
        this.stageUnlockTicks = 0;
        this.milestones = { p5: false, p20: false, p30: false, p90: false };
        this.primaryScore = 0;
        this.finishingScore = 0;
        this.initParticles();

        document.getElementById('coldTempSlider').value = this.coldTemp;
        document.getElementById('coldTempInput').value = this.coldTemp.toFixed(0);
        document.getElementById('hotTempSlider').value = this.hotTemp;
        document.getElementById('hotTempInput').value = this.hotTemp.toFixed(0);
        document.getElementById('lgRatioSlider').value = this.lgRatio;
        document.getElementById('lgRatioInput').value = this.lgRatio.toFixed(3);
        document.getElementById('vacuumSlider').value = this.vacuumPressure;
        document.getElementById('vacuumInput').value = this.vacuumPressure.toFixed(0);
        document.getElementById('refluxSlider').value = this.refluxRatio;
        document.getElementById('refluxInput').value = this.refluxRatio.toFixed(2);
        document.getElementById('simSpeedSlider').value = this.simSpeed.toFixed(1);
        document.getElementById('simSpeedInput').value = this.simSpeed.toFixed(1);
        document.getElementById('coldTempVal').innerText = this.coldTemp + '°C';
        document.getElementById('hotTempVal').innerText = this.hotTemp + '°C';
        document.getElementById('lgRatioVal').innerText = this.lgRatio.toFixed(2);
        document.getElementById('vacuumVal').innerText = this.vacuumPressure.toFixed(0) + ' mbar';
        document.getElementById('refluxVal').innerText = this.refluxRatio.toFixed(2);
        document.getElementById('simSpeedVal').innerText = this.simSpeed.toFixed(1) + 'x';
        document.getElementById('ppmDisplay').innerText = CONFIG.PPM_NATURAL;
        document.getElementById('percentDisplay').innerText = '0.0140%';
        document.getElementById('concFill').style.height = (CONFIG.PPM_NATURAL / CONFIG.TARGET_PPM * 100) + '%';
        document.getElementById('coldConcLabel').innerText = 'D₂O concentration: 0.0140%';
        document.getElementById('hotConcLabel').innerText = 'D₂O concentration: 0.0101%';
        document.getElementById('successOverlay').classList.add('hidden');
        document.getElementById('overlay').classList.remove('hidden');
        document.body.classList.remove('gold-mode');
        document.querySelector('.cold-col').classList.remove('moment-glow-upgrade');
        document.querySelector('.hot-col').classList.remove('moment-glow-upgrade');

        this.updateControlStates();
        this.updateStageInfo();
        this.updateColumnTemperatureLabels();
        this.updateTemperatureVisuals();
        this.updateProcessState();
        this.draw();
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
