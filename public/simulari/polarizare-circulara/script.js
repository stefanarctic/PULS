/**
 * Simulator Polarizare Circulară
 * Vizualizare fizică a undelor electromagnetice
 */

// ===== Physical Constants =====
const CONSTANTS = {
    c: 2.998e8,           // Speed of light (m/s)
    h: 6.626e-34,         // Planck's constant (J·s)
    epsilon0: 8.854e-12,  // Vacuum permittivity (F/m)
    mu0: 1.257e-6         // Vacuum permeability (H/m)
};

// ===== Simulation State =====
class SimulationState {
    constructor() {
        // Wave parameters
        this.frequency = 5e14;        // Hz (visible light ~500 THz)
        this.amplitude = 1.0;         // V/m
        this.wavelength = 600e-9;     // m (600 nm - orange)
        this.phaseDiff = Math.PI / 2; // radians (90° for circular)
        this.animationSpeed = 1.0;
        
        // Polarization type
        this.polarizationType = 'right'; // 'right', 'left', 'linear', 'elliptical'
        
        // Display options
        this.showExField = true;
        this.showEyField = true;
        this.showResultant = true;
        this.showTrail = true;
        this.showGrid = true;
        
        // View mode
        this.viewMode = '3d'; // '3d', 'xy', 'xz', 'yz'
        
        // Animation state
        this.isPlaying = true;
        this.time = 0;
        this.lastTimestamp = 0;
        
        // Derived quantities (calculated)
        this.k = 0;      // Wave number
        this.omega = 0;  // Angular frequency
        this.period = 0; // Period
        
        // Trail history
        this.trailPoints = [];
        this.maxTrailPoints = 100;
        
        this.updateDerivedQuantities();
    }
    
    updateDerivedQuantities() {
        this.k = (2 * Math.PI) / this.wavelength;
        this.omega = 2 * Math.PI * this.frequency;
        this.period = 1 / this.frequency;
    }
    
    getEx(z, t) {
        return this.amplitude * Math.cos(this.k * z - this.omega * t);
    }
    
    getEy(z, t) {
        let phase = this.phaseDiff;
        if (this.polarizationType === 'left') {
            phase = -Math.PI / 2;
        } else if (this.polarizationType === 'right') {
            phase = Math.PI / 2;
        } else if (this.polarizationType === 'linear') {
            phase = 0;
        }
        return this.amplitude * Math.cos(this.k * z - this.omega * t + phase);
    }
    
    getIntensity() {
        return 0.5 * CONSTANTS.epsilon0 * CONSTANTS.c * this.amplitude * this.amplitude;
    }
    
    getPhotonEnergy() {
        return CONSTANTS.h * this.frequency;
    }
    
    getJonesVector() {
        if (this.polarizationType === 'right') {
            return { ex: '1', ey: '-i' };
        } else if (this.polarizationType === 'left') {
            return { ex: '1', ey: 'i' };
        } else if (this.polarizationType === 'linear') {
            return { ex: '1', ey: '0' };
        } else {
            const phase = this.phaseDiff;
            return { 
                ex: '1', 
                ey: `e^(i${(phase * 180 / Math.PI).toFixed(0)}°)` 
            };
        }
    }
    
    getStokesParameters() {
        const Ex = this.amplitude;
        const Ey = this.amplitude;
        const delta = this.phaseDiff;
        
        if (this.polarizationType === 'right') {
            return { S0: 1, S1: 0, S2: 0, S3: 1 };
        } else if (this.polarizationType === 'left') {
            return { S0: 1, S1: 0, S2: 0, S3: -1 };
        } else if (this.polarizationType === 'linear') {
            return { S0: 1, S1: 1, S2: 0, S3: 0 };
        } else {
            const S0 = Ex * Ex + Ey * Ey;
            const S1 = Ex * Ex - Ey * Ey;
            const S2 = 2 * Ex * Ey * Math.cos(delta);
            const S3 = 2 * Ex * Ey * Math.sin(delta);
            // Normalize
            return { 
                S0: 1, 
                S1: (S1 / S0).toFixed(2), 
                S2: (S2 / S0).toFixed(2), 
                S3: (S3 / S0).toFixed(2) 
            };
        }
    }
}

// ===== Canvas Renderer =====
class WaveRenderer {
    constructor(canvas, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        
        // 3D projection parameters
        this.rotationX = 0.4;
        this.rotationY = -0.3;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Mouse interaction
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.setupCanvas();
        this.setupInteraction();
    }
    
    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    setupInteraction() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.state.viewMode === '3d') {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.rotationY += dx * 0.005;
                this.rotationX += dy * 0.005;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scale *= e.deltaY > 0 ? 0.95 : 1.05;
            this.scale = Math.max(0.5, Math.min(2, this.scale));
        });
    }
    
    project3D(x, y, z) {
        // Apply rotations
        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        
        // Rotate around Y axis
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        
        // Rotate around X axis
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        
        // Perspective projection
        const perspective = 800;
        const scale = perspective / (perspective + z2) * this.scale;
        
        return {
            x: this.centerX + x1 * scale + this.offsetX,
            y: this.centerY - y1 * scale + this.offsetY,
            scale: scale
        };
    }
    
    project2D(x, y, z) {
        const baseScale = Math.min(this.width, this.height) * 0.35 * this.scale;
        
        switch (this.state.viewMode) {
            case 'xy':
                return {
                    x: this.centerX + x * baseScale,
                    y: this.centerY - y * baseScale,
                    scale: 1
                };
            case 'xz':
                return {
                    x: this.centerX + z * baseScale,
                    y: this.centerY - x * baseScale,
                    scale: 1
                };
            case 'yz':
                return {
                    x: this.centerX + z * baseScale,
                    y: this.centerY - y * baseScale,
                    scale: 1
                };
            default:
                return this.project3D(x * 100, y * 100, z * 100);
        }
    }
    
    clear() {
        this.ctx.fillStyle = '#0f0f1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        if (!this.state.showGrid) return;
        
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)';
        this.ctx.lineWidth = 1;
        
        if (this.state.viewMode === '3d') {
            // Draw 3D grid
            const gridSize = 200;
            const gridStep = 40;
            
            for (let i = -gridSize; i <= gridSize; i += gridStep) {
                // XZ plane grid
                const p1 = this.project3D(-gridSize, 0, i);
                const p2 = this.project3D(gridSize, 0, i);
                const p3 = this.project3D(i, 0, -gridSize);
                const p4 = this.project3D(i, 0, gridSize);
                
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.moveTo(p3.x, p3.y);
                this.ctx.lineTo(p4.x, p4.y);
                this.ctx.stroke();
            }
        } else {
            // Draw 2D grid
            const gridStep = 50;
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
            
            for (let x = gridStep; x < this.width; x += gridStep) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height);
                this.ctx.stroke();
            }
            
            for (let y = gridStep; y < this.height; y += gridStep) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
            }
        }
    }
    
    drawAxes() {
        const axisLength = this.state.viewMode === '3d' ? 150 : 1.5;
        
        // Z axis (propagation direction) - cyan
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const zStart = this.project2D(0, 0, -axisLength);
        const zEnd = this.project2D(0, 0, axisLength);
        this.ctx.moveTo(zStart.x, zStart.y);
        this.ctx.lineTo(zEnd.x, zEnd.y);
        this.ctx.stroke();
        
        // X axis - pink
        this.ctx.strokeStyle = '#ff6b9d';
        this.ctx.beginPath();
        const xStart = this.project2D(-axisLength, 0, 0);
        const xEnd = this.project2D(axisLength, 0, 0);
        this.ctx.moveTo(xStart.x, xStart.y);
        this.ctx.lineTo(xEnd.x, xEnd.y);
        this.ctx.stroke();
        
        // Y axis - green
        this.ctx.strokeStyle = '#00e676';
        this.ctx.beginPath();
        const yStart = this.project2D(0, -axisLength, 0);
        const yEnd = this.project2D(0, axisLength, 0);
        this.ctx.moveTo(yStart.x, yStart.y);
        this.ctx.lineTo(yEnd.x, yEnd.y);
        this.ctx.stroke();
        
        // Axis labels
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText('z (propagare)', zEnd.x + 10, zEnd.y);
        
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText('Eₓ', xEnd.x + 10, xEnd.y);
        
        this.ctx.fillStyle = '#00e676';
        this.ctx.fillText('Eᵧ', yEnd.x + 10, yEnd.y - 10);
    }
    
    drawWave() {
        const t = this.state.time;
        const numPoints = 100;
        const zRange = this.state.viewMode === '3d' ? 3 : 2;
        
        // Draw Ex component (pink)
        if (this.state.showExField) {
            this.ctx.strokeStyle = '#ff6b9d';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i <= numPoints; i++) {
                const zNorm = (i / numPoints - 0.5) * zRange;
                const z = zNorm * this.state.wavelength * 5e9; // Scale for visualization
                const Ex = this.state.getEx(z * 1e-9, t * 1e-15);
                
                const point = this.project2D(Ex, 0, zNorm);
                
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        }
        
        // Draw Ey component (green)
        if (this.state.showEyField) {
            this.ctx.strokeStyle = '#00e676';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i <= numPoints; i++) {
                const zNorm = (i / numPoints - 0.5) * zRange;
                const z = zNorm * this.state.wavelength * 5e9;
                const Ey = this.state.getEy(z * 1e-9, t * 1e-15);
                
                const point = this.project2D(0, Ey, zNorm);
                
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        }
        
        // Draw resultant vector at z=0
        if (this.state.showResultant) {
            const Ex = this.state.getEx(0, t * 1e-15);
            const Ey = this.state.getEy(0, t * 1e-15);
            
            // Add to trail
            if (this.state.showTrail) {
                this.state.trailPoints.push({ x: Ex, y: Ey });
                if (this.state.trailPoints.length > this.state.maxTrailPoints) {
                    this.state.trailPoints.shift();
                }
            }
            
            // Draw trail
            if (this.state.showTrail && this.state.trailPoints.length > 1) {
                this.ctx.beginPath();
                for (let i = 0; i < this.state.trailPoints.length; i++) {
                    const p = this.state.trailPoints[i];
                    const point = this.project2D(p.x, p.y, 0);
                    const alpha = i / this.state.trailPoints.length;
                    
                    if (i === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }
                
                const gradient = this.ctx.createLinearGradient(
                    this.centerX - 100, this.centerY,
                    this.centerX + 100, this.centerY
                );
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
                gradient.addColorStop(1, 'rgba(118, 75, 162, 0.8)');
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            // Draw resultant vector
            const origin = this.project2D(0, 0, 0);
            const tip = this.project2D(Ex, Ey, 0);
            
            // Vector line
            const vecGradient = this.ctx.createLinearGradient(origin.x, origin.y, tip.x, tip.y);
            vecGradient.addColorStop(0, '#667eea');
            vecGradient.addColorStop(1, '#764ba2');
            
            this.ctx.strokeStyle = vecGradient;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(origin.x, origin.y);
            this.ctx.lineTo(tip.x, tip.y);
            this.ctx.stroke();
            
            // Arrow head
            const angle = Math.atan2(origin.y - tip.y, origin.x - tip.x);
            const arrowSize = 12;
            
            this.ctx.fillStyle = '#764ba2';
            this.ctx.beginPath();
            this.ctx.moveTo(tip.x, tip.y);
            this.ctx.lineTo(
                tip.x + arrowSize * Math.cos(angle - Math.PI / 6),
                tip.y + arrowSize * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.lineTo(
                tip.x + arrowSize * Math.cos(angle + Math.PI / 6),
                tip.y + arrowSize * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.closePath();
            this.ctx.fill();
            
            // Glow effect
            this.ctx.shadowColor = '#764ba2';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawHelixPath() {
        if (this.state.viewMode !== '3d') return;
        
        const t = this.state.time;
        const numPoints = 200;
        
        this.ctx.strokeStyle = 'rgba(118, 75, 162, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        for (let i = 0; i <= numPoints; i++) {
            const zNorm = (i / numPoints - 0.5) * 3;
            const z = zNorm * this.state.wavelength * 5e9;
            const Ex = this.state.getEx(z * 1e-9, t * 1e-15);
            const Ey = this.state.getEy(z * 1e-9, t * 1e-15);
            
            const point = this.project2D(Ex, Ey, zNorm);
            
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.stroke();
    }
    
    drawPolarizationEllipse() {
        if (this.state.viewMode !== 'xy') return;
        
        // Draw the polarization ellipse/circle
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const baseScale = Math.min(this.width, this.height) * 0.35 * this.scale;
        
        this.ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
            const Ex = this.state.amplitude * Math.cos(angle);
            const Ey = this.state.amplitude * Math.cos(angle + this.state.phaseDiff);
            
            const x = this.centerX + Ex * baseScale;
            const y = this.centerY - Ey * baseScale;
            
            if (angle === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawInfo() {
        // Draw view mode indicator
        this.ctx.font = '12px JetBrains Mono, monospace';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        
        const viewLabels = {
            '3d': 'Vizualizare 3D - Trage pentru rotire, scroll pentru zoom',
            'xy': 'Plan XY (Polarizare)',
            'xz': 'Plan XZ (Propagare Ex)',
            'yz': 'Plan YZ (Propagare Ey)'
        };
        
        this.ctx.fillText(viewLabels[this.state.viewMode], 20, this.height - 20);
    }
    
    render() {
        this.clear();
        this.drawGrid();
        this.drawAxes();
        
        if (this.state.viewMode === '3d') {
            this.drawHelixPath();
        } else if (this.state.viewMode === 'xy') {
            this.drawPolarizationEllipse();
        }
        
        this.drawWave();
        this.drawInfo();
    }
}

// ===== UI Controller =====
class UIController {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        
        this.setupEventListeners();
        this.updateAllDisplays();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Polarization type buttons
        document.querySelectorAll('.pol-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setPolarizationType(btn.dataset.type));
        });
        
        // View mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setViewMode(btn.dataset.view));
        });
        
        // Sliders
        document.getElementById('frequency').addEventListener('input', (e) => {
            this.state.frequency = parseFloat(e.target.value) * 1e14;
            this.state.updateDerivedQuantities();
            this.updateFrequencyDisplay();
            this.updateCalculations();
        });
        
        document.getElementById('amplitude').addEventListener('input', (e) => {
            this.state.amplitude = parseFloat(e.target.value);
            this.updateAmplitudeDisplay();
            this.updateCalculations();
        });
        
        document.getElementById('wavelength').addEventListener('input', (e) => {
            this.state.wavelength = parseFloat(e.target.value) * 1e-9;
            this.state.updateDerivedQuantities();
            this.updateWavelengthDisplay();
            this.updateCalculations();
            this.updateColorSwatch();
        });
        
        document.getElementById('phaseDiff').addEventListener('input', (e) => {
            this.state.phaseDiff = parseFloat(e.target.value) * Math.PI / 180;
            this.updatePhaseDiffDisplay();
            this.updateCalculations();
            this.state.trailPoints = []; // Reset trail
        });
        
        document.getElementById('speed').addEventListener('input', (e) => {
            this.state.animationSpeed = parseFloat(e.target.value);
            this.updateSpeedDisplay();
        });
        
        // Checkboxes
        document.getElementById('showExField').addEventListener('change', (e) => {
            this.state.showExField = e.target.checked;
        });
        
        document.getElementById('showEyField').addEventListener('change', (e) => {
            this.state.showEyField = e.target.checked;
        });
        
        document.getElementById('showResultant').addEventListener('change', (e) => {
            this.state.showResultant = e.target.checked;
        });
        
        document.getElementById('showTrail').addEventListener('change', (e) => {
            this.state.showTrail = e.target.checked;
            if (!e.target.checked) {
                this.state.trailPoints = [];
            }
        });
        
        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.state.showGrid = e.target.checked;
        });
        
        // Playback controls
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('stepBackBtn').addEventListener('click', () => {
            this.state.time -= 0.5;
        });
        
        document.getElementById('stepForwardBtn').addEventListener('click', () => {
            this.state.time += 0.5;
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSimulation();
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Content').classList.add('active');
    }
    
    setPolarizationType(type) {
        this.state.polarizationType = type;
        
        // Update buttons
        document.querySelectorAll('.pol-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Update phase difference slider based on type
        const phaseDiffSlider = document.getElementById('phaseDiff');
        switch (type) {
            case 'right':
                phaseDiffSlider.value = 90;
                this.state.phaseDiff = Math.PI / 2;
                break;
            case 'left':
                phaseDiffSlider.value = 270;
                this.state.phaseDiff = -Math.PI / 2;
                break;
            case 'linear':
                phaseDiffSlider.value = 0;
                this.state.phaseDiff = 0;
                break;
            case 'elliptical':
                phaseDiffSlider.value = 45;
                this.state.phaseDiff = Math.PI / 4;
                break;
        }
        
        this.updatePhaseDiffDisplay();
        this.updateCalculations();
        this.state.trailPoints = []; // Reset trail
    }
    
    setViewMode(mode) {
        this.state.viewMode = mode;
        
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        // Reset trail when changing view
        this.state.trailPoints = [];
    }
    
    togglePlayPause() {
        this.state.isPlaying = !this.state.isPlaying;
        
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        playIcon.classList.toggle('hidden', this.state.isPlaying);
        pauseIcon.classList.toggle('hidden', !this.state.isPlaying);
    }
    
    resetSimulation() {
        // Reset sliders to default values
        document.getElementById('frequency').value = 5;
        document.getElementById('amplitude').value = 1;
        document.getElementById('wavelength').value = 600;
        document.getElementById('phaseDiff').value = 90;
        document.getElementById('speed').value = 1;
        
        // Reset state
        this.state.frequency = 5e14;
        this.state.amplitude = 1.0;
        this.state.wavelength = 600e-9;
        this.state.phaseDiff = Math.PI / 2;
        this.state.animationSpeed = 1.0;
        this.state.polarizationType = 'right';
        this.state.time = 0;
        this.state.trailPoints = [];
        this.state.updateDerivedQuantities();
        
        // Reset polarization buttons
        document.querySelectorAll('.pol-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'right');
        });
        
        // Reset checkboxes
        document.getElementById('showExField').checked = true;
        document.getElementById('showEyField').checked = true;
        document.getElementById('showResultant').checked = true;
        document.getElementById('showTrail').checked = true;
        document.getElementById('showGrid').checked = true;
        
        this.state.showExField = true;
        this.state.showEyField = true;
        this.state.showResultant = true;
        this.state.showTrail = true;
        this.state.showGrid = true;
        
        // Reset renderer
        this.renderer.rotationX = 0.4;
        this.renderer.rotationY = -0.3;
        this.renderer.scale = 1;
        
        this.updateAllDisplays();
    }
    
    updateFrequencyDisplay() {
        const freq = this.state.frequency / 1e14;
        document.getElementById('frequencyValue').textContent = `${freq.toFixed(1)} × 10¹⁴ Hz`;
    }
    
    updateAmplitudeDisplay() {
        document.getElementById('amplitudeValue').textContent = `${this.state.amplitude.toFixed(1)} V/m`;
    }
    
    updateWavelengthDisplay() {
        const wl = this.state.wavelength * 1e9;
        document.getElementById('wavelengthValue').textContent = `${wl.toFixed(0)} nm`;
    }
    
    updatePhaseDiffDisplay() {
        const phase = this.state.phaseDiff * 180 / Math.PI;
        document.getElementById('phaseDiffValue').textContent = `${phase.toFixed(0)}°`;
    }
    
    updateSpeedDisplay() {
        document.getElementById('speedValue').textContent = `${this.state.animationSpeed.toFixed(1)}×`;
    }
    
    updateColorSwatch() {
        const wavelength = this.state.wavelength * 1e9; // nm
        const color = wavelengthToColor(wavelength);
        document.getElementById('colorSwatch').style.background = color;
    }
    
    updateCalculations() {
        const t = this.state.time * 1e-15;
        const Ex = this.state.getEx(0, t);
        const Ey = this.state.getEy(0, t);
        
        // Update current field values
        document.getElementById('exValue').textContent = `${Ex.toFixed(3)} V/m`;
        document.getElementById('eyValue').textContent = `${Ey.toFixed(3)} V/m`;
        
        // Update derived quantities
        document.getElementById('kValue').textContent = formatScientific(this.state.k, 'rad/m');
        document.getElementById('omegaValue').textContent = formatScientific(this.state.omega, 'rad/s');
        document.getElementById('periodValue').textContent = formatScientific(this.state.period * 1e15, 'fs');
        document.getElementById('velocityValue').textContent = formatScientific(CONSTANTS.c, 'm/s');
        document.getElementById('intensityValue').textContent = formatScientific(this.state.getIntensity(), 'W/m²');
        document.getElementById('photonEnergy').textContent = formatScientific(this.state.getPhotonEnergy(), 'J');
        
        // Update wave vector and angular frequency in visualization info
        document.getElementById('waveVector').textContent = `k = ${formatScientific(this.state.k, 'rad/m')}`;
        document.getElementById('angularFreq').textContent = `ω = ${formatScientific(this.state.omega, 'rad/s')}`;
        
        // Update Jones vector
        const jones = this.state.getJonesVector();
        document.querySelector('#jonesVector .matrix-content').innerHTML = `
            <span>${jones.ex}</span>
            <span>${jones.ey}</span>
        `;
        
        // Update Stokes parameters
        const stokes = this.state.getStokesParameters();
        document.getElementById('stokesParams').innerHTML = `
            <span>S₀ = ${stokes.S0}</span>
            <span>S₁ = ${stokes.S1}</span>
            <span>S₂ = ${stokes.S2}</span>
            <span>S₃ = ${stokes.S3}</span>
        `;
        
        // Update formulas based on polarization type
        let eyFormula = 'E₀ cos(kz - ωt + δ)';
        if (this.state.polarizationType === 'right') {
            eyFormula = 'E₀ cos(kz - ωt + π/2)';
        } else if (this.state.polarizationType === 'left') {
            eyFormula = 'E₀ cos(kz - ωt - π/2)';
        } else if (this.state.polarizationType === 'linear') {
            eyFormula = 'E₀ cos(kz - ωt)';
        }
        document.getElementById('eyFormula').textContent = eyFormula;
    }
    
    updateTimeDisplay() {
        document.getElementById('currentTime').textContent = `t = ${this.state.time.toFixed(2)} fs`;
    }
    
    updateAllDisplays() {
        this.updateFrequencyDisplay();
        this.updateAmplitudeDisplay();
        this.updateWavelengthDisplay();
        this.updatePhaseDiffDisplay();
        this.updateSpeedDisplay();
        this.updateColorSwatch();
        this.updateCalculations();
        this.updateTimeDisplay();
    }
}

// ===== Utility Functions =====
function formatScientific(value, unit) {
    if (value === 0) return `0 ${unit}`;
    
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);
    
    const superscripts = {
        '-': '⁻',
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    
    const expStr = exponent.toString().split('').map(c => superscripts[c] || c).join('');
    
    return `${mantissa.toFixed(2)} × 10${expStr} ${unit}`;
}

function wavelengthToColor(wavelength) {
    // Convert wavelength (nm) to RGB color
    let r, g, b;
    
    if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0;
        g = (wavelength - 440) / (490 - 440);
        b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0;
        g = 1;
        b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1;
        g = -(wavelength - 645) / (645 - 580);
        b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0;
        g = 0;
        b = 0;
    }
    
    // Intensity adjustment at the edges
    let factor;
    if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength <= 700) {
        factor = 1;
    } else if (wavelength > 700 && wavelength <= 780) {
        factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    } else {
        factor = 0;
    }
    
    r = Math.round(255 * Math.pow(r * factor, 0.8));
    g = Math.round(255 * Math.pow(g * factor, 0.8));
    b = Math.round(255 * Math.pow(b * factor, 0.8));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// ===== Main Application =====
class Application {
    constructor() {
        this.state = new SimulationState();
        this.canvas = document.getElementById('mainCanvas');
        this.renderer = new WaveRenderer(this.canvas, this.state);
        this.ui = new UIController(this.state, this.renderer);
        
        this.animate = this.animate.bind(this);
        this.lastTime = performance.now();
        
        this.start();
    }
    
    start() {
        requestAnimationFrame(this.animate);
    }
    
    animate(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        if (this.state.isPlaying) {
            // Update simulation time (in femtoseconds for visible light)
            this.state.time += deltaTime * 10 * this.state.animationSpeed;
            this.ui.updateTimeDisplay();
            this.ui.updateCalculations();
        }
        
        this.renderer.render();
        requestAnimationFrame(this.animate);
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    window.app = new Application();
});
