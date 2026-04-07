/**
 * Simulator de apa grea - logica principala.
 * Model simplificat cu doua etape:
 * 1. imbogatire primara prin schimb izotopic H2O - H2S;
 * 2. finisare prin rectificare sub vid pana la 99.8%.
 */

const CONFIG = {
    PPM_NATURAL: 140,
    PRIMARY_HANDOFF_PPM: 100000, // 10%
    PRIMARY_MAX_PPM: 300000, // 30%
    TARGET_PPM: 998000, // 99.8%
    COLD_TEMP_DEFAULT: 30,
    HOT_TEMP_DEFAULT: 130,
    LG_RATIO_DEFAULT: 1.0,
    LG_RATIO_OPTIMAL: 1.8,
    VACUUM_DEFAULT: 55,
    VACUUM_OPTIMAL: 35,
    REFLUX_DEFAULT: 4.0,
    REFLUX_OPTIMAL: 5.2,
    PARTICLE_COUNT: 150,
    SUCCESS_EPSILON_PPM: 0.5,
    PRIMARY_UNLOCK_SCORE: 0.92,
};

class Simulation {
    constructor() {
        this.coldTemp = CONFIG.COLD_TEMP_DEFAULT;
        this.hotTemp = CONFIG.HOT_TEMP_DEFAULT;
        this.lgRatio = CONFIG.LG_RATIO_DEFAULT;
        this.vacuumPressure = CONFIG.VACUUM_DEFAULT;
        this.refluxRatio = CONFIG.REFLUX_DEFAULT;
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.targetPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.stage = 'primary';
        this.finishingUnlocked = false;
        this.primaryCarryScore = 0;
        this.primaryScore = 0;
        this.finishingScore = 0;
        this.particles = [];
        this.isMobileView = window.matchMedia('(max-width: 900px)').matches;
        this.initCanvases();
        this.initParticles();
        this.setupEventListeners();
        this.updateControlStates();
        this.updateStageInfo();
        this.updateColumnTemperatureLabels();
        this.updateTemperatureVisuals();
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
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                type: Math.random() > 0.9 ? 'heavy' : 'light',
                speed: 0.002 + Math.random() * 0.003,
                direction: Math.random() > 0.5 ? 1 : -1,
                column: Math.random() > 0.5 ? 'cold' : 'hot',
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
        }, 2);

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
        const coldScore = this.gaussianScore(this.coldTemp, CONFIG.COLD_TEMP_DEFAULT, 1.2);
        const hotScore = this.gaussianScore(this.hotTemp, CONFIG.HOT_TEMP_DEFAULT, 1.8);
        const lgScore = this.gaussianScore(this.lgRatio, CONFIG.LG_RATIO_OPTIMAL, 0.07);
        return Math.max(0, coldScore * hotScore * lgScore);
    }

    calculateFinishingScore() {
        const vacuumScore = this.gaussianScore(this.vacuumPressure, CONFIG.VACUUM_OPTIMAL, 3.2);
        const refluxScore = this.gaussianScore(this.refluxRatio, CONFIG.REFLUX_OPTIMAL, 0.22);
        return Math.max(0, vacuumScore * refluxScore);
    }

    calculatePhysics() {
        this.primaryScore = this.calculatePrimaryScore();
        this.finishingScore = this.calculateFinishingScore();

        if (this.stage === 'primary') {
            this.targetPpm = CONFIG.PPM_NATURAL +
                (CONFIG.PRIMARY_MAX_PPM - CONFIG.PPM_NATURAL) * this.primaryScore;
            this.targetPpm = Math.min(CONFIG.PRIMARY_MAX_PPM, Math.max(CONFIG.PPM_NATURAL, this.targetPpm));

            if (
                !this.finishingUnlocked &&
                this.currentPpm >= CONFIG.PRIMARY_HANDOFF_PPM &&
                this.primaryScore >= CONFIG.PRIMARY_UNLOCK_SCORE
            ) {
                this.unlockFinishing();
            }
        } else {
            // Etapa primara decide daca poti intra in finisare,
            // dar nu trebuie sa blocheze ireversibil atingerea pragului final.
            // In finisare, tinta este controlata de parametrii de rectificare.
            const finishingQuality = this.finishingScore;
            this.targetPpm = CONFIG.PRIMARY_HANDOFF_PPM +
                (CONFIG.TARGET_PPM - CONFIG.PRIMARY_HANDOFF_PPM) * finishingQuality;
            this.targetPpm = Math.min(CONFIG.TARGET_PPM, Math.max(CONFIG.PRIMARY_HANDOFF_PPM, this.targetPpm));
        }

        this.updateStageInfo();
        this.drawGraph();
    }

    unlockFinishing() {
        this.finishingUnlocked = true;
        this.stage = 'finishing';
        this.primaryCarryScore = this.primaryScore;
        this.currentPpm = Math.max(this.currentPpm, CONFIG.PRIMARY_HANDOFF_PPM);
        this.targetPpm = CONFIG.PRIMARY_HANDOFF_PPM;
        this.updateControlStates();
        this.updateStageInfo();
    }

    updateControlStates() {
        const primaryDisabled = this.finishingUnlocked;
        document.getElementById('coldTempSlider').disabled = primaryDisabled;
        document.getElementById('coldTempInput').disabled = primaryDisabled;
        document.getElementById('hotTempSlider').disabled = primaryDisabled;
        document.getElementById('hotTempInput').disabled = primaryDisabled;
        document.getElementById('lgRatioSlider').disabled = primaryDisabled;
        document.getElementById('lgRatioInput').disabled = primaryDisabled;
        document.getElementById('vacuumSlider').disabled = !this.finishingUnlocked;
        document.getElementById('vacuumInput').disabled = !this.finishingUnlocked;
        document.getElementById('refluxSlider').disabled = !this.finishingUnlocked;
        document.getElementById('refluxInput').disabled = !this.finishingUnlocked;
    }

    updateStageInfo() {
        const stageDisplay = document.getElementById('stageDisplay');
        const stageHint = document.getElementById('stageHint');

        if (this.stage === 'primary') {
            stageDisplay.innerText = 'Îmbogățire primară';
            stageHint.innerText =
                'Ține coloana rece foarte aproape de 30°C, coloana caldă aproape de 130°C și raportul L/G aproape de 1.80. Instalația de finisare se deblochează doar după ce treci de 10%.';
        } else {
            stageDisplay.innerText = 'Finisare sub vid';
            stageHint.innerText =
                'Produsul primar a fost preluat de instalația de finisare. Acum trebuie să ții presiunea aproape de 35 mbar și raportul de reflux aproape de 5.20 pentru a ajunge exact la 99.8%.';
        }
    }

    updateColumnTemperatureLabels() {
        const coldLabel = document.getElementById('coldColumnLabel');
        const hotLabel = document.getElementById('hotColumnLabel');
        coldLabel.innerText = `COLOANĂ RECE (${this.coldTemp.toFixed(0)}°C)`;
        hotLabel.innerText = `COLOANĂ CALDĂ (${this.hotTemp.toFixed(0)}°C)`;
    }

    updateTemperatureVisuals() {
        const coldNorm = (this.coldTemp - 10) / 40; // 10 - 50
        const hotNorm = (this.hotTemp - 100) / 60; // 100 - 160
        const coldCol = document.querySelector('.cold-col');
        const hotCol = document.querySelector('.hot-col');

        const coldBlue = 200 + Math.round((1 - coldNorm) * 55);
        const coldIntensity = 0.2 + (1 - coldNorm) * 0.5;
        coldCol.style.borderColor = `rgb(80, ${coldBlue}, 255)`;
        coldCol.style.boxShadow = `0 0 ${8 + (1 - coldNorm) * 22}px rgba(90, 190, 255, ${coldIntensity})`;

        const hotRed = 180 + Math.round(hotNorm * 75);
        const hotIntensity = 0.2 + hotNorm * 0.55;
        hotCol.style.borderColor = `rgb(${hotRed}, 90, 70)`;
        hotCol.style.boxShadow = `0 0 ${8 + hotNorm * 24}px rgba(255, 110, 80, ${hotIntensity})`;
    }

    update() {
        if (!this.running) return;

        const diff = this.targetPpm - this.currentPpm;
        if (Math.abs(diff) <= CONFIG.SUCCESS_EPSILON_PPM) {
            this.currentPpm = this.targetPpm;
        } else {
            const stepFactor = this.stage === 'primary' ? 0.008 : 0.006;
            this.currentPpm += diff * stepFactor;
        }

        const displayPpm = this.currentPpm.toFixed(0);
        const displayPercent = (this.currentPpm / 10000).toFixed(4);
        document.getElementById('ppmDisplay').innerText = displayPpm;
        document.getElementById('percentDisplay').innerText = displayPercent + '%';
        document.getElementById('concFill').style.height = (this.currentPpm / CONFIG.TARGET_PPM * 100) + '%';

        this.particles.forEach((p) => {
            p.y += p.speed * p.direction;
            if (p.y > 1) p.y = 0;
            if (p.y < 0) p.y = 1;

            if (Math.random() < 0.001) {
                p.type = Math.random() < (this.currentPpm / CONFIG.TARGET_PPM) ? 'heavy' : 'light';
            }
        });

        if (!this.finishingUnlocked && this.stage === 'primary') {
            this.calculatePhysics();
        }

        if (!this.completed && this.currentPpm >= CONFIG.TARGET_PPM) {
            this.currentPpm = CONFIG.TARGET_PPM;
            this.showSuccessState();
        }

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
                const coldNorm = (this.coldTemp - 10) / 40;
                const coldGlow = 0.15 + (1 - coldNorm) * 0.28;
                grad.addColorStop(0, `rgba(90, 190, 255, ${coldGlow})`);
                grad.addColorStop(1, `rgba(241, 196, 15, ${intensity * 0.8})`);
            } else {
                const hotNorm = (this.hotTemp - 100) / 60;
                const hotGlow = 0.12 + hotNorm * 0.35;
                grad.addColorStop(0, `rgba(241, 196, 15, ${intensity * 0.7})`);
                grad.addColorStop(1, `rgba(255, 90, 60, ${hotGlow})`);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            this.particles.forEach((p) => {
                if ((isCold && p.column === 'cold') || (!isCold && p.column === 'hot')) {
                    ctx.beginPath();
                    ctx.arc(
                        p.x * ctx.canvas.width,
                        p.y * ctx.canvas.height,
                        p.type === 'heavy' ? 3 : 1.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle = p.type === 'heavy' ? '#f1c40f' : 'rgba(255,255,255,0.5)';
                    ctx.shadowBlur = p.type === 'heavy' ? 5 : 0;
                    ctx.shadowColor = '#f1c40f';
                    ctx.fill();
                }
            });
        });
    }

    drawGraph() {
        const ctx = this.graphCtx;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, h - 30);
        ctx.lineTo(w - 20, h - 30);
        ctx.stroke();

        ctx.fillStyle = '#95a5a6';
        ctx.font = '10px Arial';

        let xLabel = 'Raport L/G';
        let yLabel = 'Separare';
        let xMin = 0.5;
        let xMax = 3.5;
        let optimal = CONFIG.LG_RATIO_OPTIMAL;
        let spread = 0.2;
        let currentValue = this.lgRatio;

        if (this.stage === 'finishing') {
            xLabel = 'Raport reflux';
            yLabel = 'Rectificare';
            xMin = 2;
            xMax = 8;
            optimal = CONFIG.REFLUX_OPTIMAL;
            spread = 0.35;
            currentValue = this.refluxRatio;
        }

        ctx.fillText(xLabel, w / 2, h - 10);
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();

        ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
        ctx.beginPath();
        for (let x = 40; x < w - 20; x++) {
            const normX = (x - 40) / (w - 60);
            const value = xMin + normX * (xMax - xMin);
            const eff = Math.exp(-Math.pow((value - optimal) / spread, 2));
            const y = h - 30 - eff * (h - 60);
            if (x === 40) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const currentX = 40 + ((currentValue - xMin) / (xMax - xMin)) * (w - 60);
        const currentEff = Math.exp(-Math.pow((currentValue - optimal) / spread, 2));
        const currentY = h - 30 - currentEff * (h - 60);

        ctx.fillStyle = this.currentPpm >= CONFIG.PRIMARY_HANDOFF_PPM ? '#f1c40f' : '#2ecc71';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        if (Math.abs(currentValue - optimal) < spread * 0.5) {
            ctx.beginPath();
            ctx.arc(currentX, currentY, 10 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
            ctx.stroke();
        }
    }

    showSuccessState() {
        this.completed = true;
        this.running = false;

        document.getElementById('ppmDisplay').innerText = CONFIG.TARGET_PPM.toFixed(0);
        document.getElementById('percentDisplay').innerText = '99.8000%';
        document.getElementById('concFill').style.height = '100%';

        document.getElementById('successSummary').innerHTML = `
            <p><strong>Felicitări!</strong> Ai atins pragul nuclear exact de <strong>99.8%</strong>, adică ${CONFIG.TARGET_PPM.toLocaleString('ro-RO')} ppm D₂O.</p>
            <p><strong>Etapa 1 - îmbogățire primară:</strong> ai dus alimentarea de la 140 ppm la cel puțin 10% folosind coloana rece la ${this.coldTemp.toFixed(0)}°C, coloana caldă la ${this.hotTemp.toFixed(0)}°C și raportul L/G ${this.lgRatio.toFixed(2)}.</p>
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
        this.currentPpm = CONFIG.PPM_NATURAL;
        this.targetPpm = CONFIG.PPM_NATURAL;
        this.running = false;
        this.completed = false;
        this.stage = 'primary';
        this.finishingUnlocked = false;
        this.primaryCarryScore = 0;
        this.primaryScore = 0;
        this.finishingScore = 0;
        this.initParticles();

        document.getElementById('coldTempSlider').value = this.coldTemp;
        document.getElementById('coldTempInput').value = this.coldTemp.toFixed(0);
        document.getElementById('hotTempSlider').value = this.hotTemp;
        document.getElementById('hotTempInput').value = this.hotTemp.toFixed(0);
        document.getElementById('lgRatioSlider').value = this.lgRatio;
        document.getElementById('lgRatioInput').value = this.lgRatio.toFixed(2);
        document.getElementById('vacuumSlider').value = this.vacuumPressure;
        document.getElementById('vacuumInput').value = this.vacuumPressure.toFixed(0);
        document.getElementById('refluxSlider').value = this.refluxRatio;
        document.getElementById('refluxInput').value = this.refluxRatio.toFixed(2);
        document.getElementById('coldTempVal').innerText = this.coldTemp + '°C';
        document.getElementById('hotTempVal').innerText = this.hotTemp + '°C';
        document.getElementById('lgRatioVal').innerText = this.lgRatio.toFixed(2);
        document.getElementById('vacuumVal').innerText = this.vacuumPressure.toFixed(0) + ' mbar';
        document.getElementById('refluxVal').innerText = this.refluxRatio.toFixed(2);
        document.getElementById('ppmDisplay').innerText = CONFIG.PPM_NATURAL;
        document.getElementById('percentDisplay').innerText = '0.0140%';
        document.getElementById('concFill').style.height = (CONFIG.PPM_NATURAL / CONFIG.TARGET_PPM * 100) + '%';
        document.getElementById('successOverlay').classList.add('hidden');
        document.getElementById('overlay').classList.remove('hidden');

        this.updateControlStates();
        this.updateStageInfo();
        this.updateColumnTemperatureLabels();
        this.updateTemperatureVisuals();
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
