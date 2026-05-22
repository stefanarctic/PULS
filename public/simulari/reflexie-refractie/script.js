// Physics Simulator for Reflection and Refraction
// Based on Snell's Law and the Law of Reflection

function simUI(path, fallback) {
    return typeof window.simLbl === 'function' ? window.simLbl(path, fallback) : fallback;
}

class PhysicsSimulator {
    constructor() {
        this.canvas = document.getElementById('simulatorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Physics parameters
        this.incidentAngle = 45; // degrees
        this.n1 = 1.00; // refractive index of medium 1 (air)
        this.n2 = 1.52; // refractive index of medium 2 (glass)
        this.lightColor = '#ff6b6b';
        
        // Display options
        this.showNormal = true;
        this.showAngles = true;
        this.showIntensity = true;
        
        // Speed of light in vacuum (m/s)
        this.c = 299792458;
        
        // Animation
        this.animationId = null;
        this.rayProgress = 0;
        this.animationSpeed = 0.02;
        
        // Initialize
        this.setupCanvas();
        this.bindEvents();
        this.initCarousel();
        this.update();
        this.animate();
    }
    
    setupCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Use device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        const width = Math.min(rect.width - 40, 800);
        const height = 500;
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }
    
    bindEvents() {
        // Incident angle slider
        const incidentAngleSlider = document.getElementById('incidentAngle');
        const incidentAngleValue = document.getElementById('incidentAngleValue');
        incidentAngleSlider.addEventListener('input', (e) => {
            this.incidentAngle = parseFloat(e.target.value);
            incidentAngleValue.textContent = this.incidentAngle + '°';
            this.update();
        });
        
        // Refractive index n1 slider
        const n1Slider = document.getElementById('n1');
        const n1Value = document.getElementById('n1Value');
        n1Slider.addEventListener('input', (e) => {
            this.n1 = parseFloat(e.target.value);
            n1Value.textContent = this.n1.toFixed(2);
            document.getElementById('medium1Select').value = 'custom';
            this.update();
        });
        
        // Refractive index n2 slider
        const n2Slider = document.getElementById('n2');
        const n2Value = document.getElementById('n2Value');
        n2Slider.addEventListener('input', (e) => {
            this.n2 = parseFloat(e.target.value);
            n2Value.textContent = this.n2.toFixed(2);
            document.getElementById('medium2Select').value = 'custom';
            this.update();
        });
        
        // Medium 1 select
        document.getElementById('medium1Select').addEventListener('change', (e) => {
            if (e.target.value !== 'custom') {
                this.n1 = parseFloat(e.target.value);
                n1Slider.value = this.n1;
                n1Value.textContent = this.n1.toFixed(2);
                this.update();
            }
        });
        
        // Medium 2 select
        document.getElementById('medium2Select').addEventListener('change', (e) => {
            if (e.target.value !== 'custom') {
                this.n2 = parseFloat(e.target.value);
                n2Slider.value = this.n2;
                n2Value.textContent = this.n2.toFixed(2);
                this.update();
            }
        });
        
        // Display options
        document.getElementById('showNormal').addEventListener('change', (e) => {
            this.showNormal = e.target.checked;
            this.update();
        });
        
        document.getElementById('showAngles').addEventListener('change', (e) => {
            this.showAngles = e.target.checked;
            this.update();
        });
        
        document.getElementById('showIntensity').addEventListener('change', (e) => {
            this.showIntensity = e.target.checked;
            this.update();
        });
        
        // Light color
        const lightColorPicker = document.getElementById('lightColor');
        lightColorPicker.addEventListener('input', (e) => {
            this.lightColor = e.target.value;
            this.updateWavelengthDisplay();
            this.update();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.update();
        });
    }
    
    initCarousel() {
        const facts = document.querySelectorAll('.fact-card');
        const dotsContainer = document.getElementById('carouselDots');
        let currentFact = 0;
        
        // Create dots
        facts.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => showFact(index));
            dotsContainer.appendChild(dot);
        });
        
        const dots = document.querySelectorAll('.carousel-dot');
        
        function showFact(index) {
            facts.forEach(f => f.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            facts[index].classList.add('active');
            dots[index].classList.add('active');
            currentFact = index;
        }
        
        document.getElementById('prevFact').addEventListener('click', () => {
            const newIndex = (currentFact - 1 + facts.length) % facts.length;
            showFact(newIndex);
        });
        
        document.getElementById('nextFact').addEventListener('click', () => {
            const newIndex = (currentFact + 1) % facts.length;
            showFact(newIndex);
        });
        
        // Auto-rotate every 8 seconds
        setInterval(() => {
            const newIndex = (currentFact + 1) % facts.length;
            showFact(newIndex);
        }, 8000);
    }
    
    updateWavelengthDisplay() {
        // Convert hex color to approximate wavelength
        const hex = this.lightColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        let wavelength;
        if (r > g && r > b) {
            wavelength = 620 + (255 - r) * 0.3; // Red range
        } else if (g > r && g > b) {
            wavelength = 495 + (255 - g) * 0.2; // Green range
        } else if (b > r && b > g) {
            wavelength = 450 + (255 - b) * 0.15; // Blue range
        } else if (r > 200 && g > 100 && b < 100) {
            wavelength = 590; // Orange/Yellow
        } else {
            wavelength = 550; // Default green-ish
        }
        
        document.getElementById('wavelengthValue').textContent = `~${Math.round(wavelength)} nm`;
    }
    
    reset() {
        this.incidentAngle = 45;
        this.n1 = 1.00;
        this.n2 = 1.52;
        this.lightColor = '#ff6b6b';
        this.showNormal = true;
        this.showAngles = true;
        this.showIntensity = true;
        
        // Update UI
        document.getElementById('incidentAngle').value = 45;
        document.getElementById('incidentAngleValue').textContent = '45°';
        document.getElementById('n1').value = 1;
        document.getElementById('n1Value').textContent = '1.00';
        document.getElementById('n2').value = 1.52;
        document.getElementById('n2Value').textContent = '1.52';
        document.getElementById('medium1Select').value = '1';
        document.getElementById('medium2Select').value = '1.52';
        document.getElementById('showNormal').checked = true;
        document.getElementById('showAngles').checked = true;
        document.getElementById('showIntensity').checked = true;
        document.getElementById('lightColor').value = '#ff6b6b';
        
        this.updateWavelengthDisplay();
        this.update();
    }
    
    calculateRefraction() {
        const theta1Rad = this.incidentAngle * Math.PI / 180;
        
        // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
        const sinTheta2 = (this.n1 * Math.sin(theta1Rad)) / this.n2;
        
        // Check for Total Internal Reflection
        if (Math.abs(sinTheta2) > 1) {
            return {
                totalInternalReflection: true,
                refractionAngle: null,
                criticalAngle: this.calculateCriticalAngle()
            };
        }
        
        const theta2Rad = Math.asin(sinTheta2);
        const theta2Deg = theta2Rad * 180 / Math.PI;
        
        return {
            totalInternalReflection: false,
            refractionAngle: theta2Deg,
            refractionAngleRad: theta2Rad,
            criticalAngle: this.calculateCriticalAngle()
        };
    }
    
    calculateCriticalAngle() {
        // Critical angle only exists when n1 > n2
        if (this.n1 <= this.n2) {
            return null;
        }
        
        const criticalAngleRad = Math.asin(this.n2 / this.n1);
        return criticalAngleRad * 180 / Math.PI;
    }
    
    calculateReflectance() {
        // Fresnel equations for reflectance (simplified for unpolarized light)
        const theta1Rad = this.incidentAngle * Math.PI / 180;
        const result = this.calculateRefraction();
        
        if (result.totalInternalReflection) {
            return 1; // 100% reflection
        }
        
        const theta2Rad = result.refractionAngleRad;
        
        // Rs (s-polarized)
        const Rs = Math.pow(
            (this.n1 * Math.cos(theta1Rad) - this.n2 * Math.cos(theta2Rad)) /
            (this.n1 * Math.cos(theta1Rad) + this.n2 * Math.cos(theta2Rad)),
            2
        );
        
        // Rp (p-polarized)
        const Rp = Math.pow(
            (this.n1 * Math.cos(theta2Rad) - this.n2 * Math.cos(theta1Rad)) /
            (this.n1 * Math.cos(theta2Rad) + this.n2 * Math.cos(theta1Rad)),
            2
        );
        
        // Average for unpolarized light
        return (Rs + Rp) / 2;
    }
    
    update() {
        const result = this.calculateRefraction();
        
        // Update display values
        document.getElementById('reflectionAngle').textContent = this.incidentAngle.toFixed(1) + '°';
        
        if (result.totalInternalReflection) {
            document.getElementById('refractionAngle').textContent = simUI('results.refrNa', 'N/A (TIR)');
            document.getElementById('tirIndicator').classList.add('active');
        } else {
            document.getElementById('refractionAngle').textContent = result.refractionAngle.toFixed(1) + '°';
            document.getElementById('tirIndicator').classList.remove('active');
        }
        
        if (result.criticalAngle !== null) {
            document.getElementById('criticalAngle').textContent = result.criticalAngle.toFixed(1) + '°';
        } else {
            document.getElementById('criticalAngle').textContent = simUI('results.na', 'N/A');
        }
        
        // Update velocities
        const v1 = this.c / this.n1;
        const v2 = this.c / this.n2;
        document.getElementById('velocity1').textContent = this.formatVelocity(v1);
        document.getElementById('velocity2').textContent = this.formatVelocity(v2);
        
        this.draw();
    }
    
    formatVelocity(v) {
        if (v >= 1e8) {
            return (v / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + simUI('units.kms', ' km/s');
        }
        return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + simUI('units.ms', ' m/s');
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw media backgrounds
        this.drawMedia();
        
        // Draw interface line
        this.drawInterface();
        
        // Draw normal line
        if (this.showNormal) {
            this.drawNormal();
        }
        
        // Draw rays
        this.drawRays();
        
        // Draw angle arcs
        if (this.showAngles) {
            this.drawAngles();
        }
        
        // Draw labels
        this.drawLabels();
    }
    
    drawMedia() {
        const ctx = this.ctx;
        
        // Medium 1 (top) - lighter color for less dense
        const gradient1 = ctx.createLinearGradient(0, 0, 0, this.centerY);
        const alpha1 = Math.min(0.3 + (this.n1 - 1) * 0.2, 0.6);
        gradient1.addColorStop(0, `rgba(99, 102, 241, ${alpha1 * 0.5})`);
        gradient1.addColorStop(1, `rgba(99, 102, 241, ${alpha1})`);
        
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, this.width, this.centerY);
        
        // Medium 2 (bottom) - darker color for denser
        const gradient2 = ctx.createLinearGradient(0, this.centerY, 0, this.height);
        const alpha2 = Math.min(0.3 + (this.n2 - 1) * 0.2, 0.6);
        gradient2.addColorStop(0, `rgba(34, 211, 238, ${alpha2})`);
        gradient2.addColorStop(1, `rgba(34, 211, 238, ${alpha2 * 0.5})`);
        
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, this.centerY, this.width, this.centerY);
        
        // Medium labels
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`${simUI('canvas.medium1Prefix', 'Mediu 1')}: n₁ = ${this.n1.toFixed(2)}`, 15, 25);
        ctx.fillText(`${simUI('canvas.medium2Prefix', 'Mediu 2')}: n₂ = ${this.n2.toFixed(2)}`, 15, this.centerY + 25);
    }
    
    drawInterface() {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(0, this.centerY);
        ctx.lineTo(this.width, this.centerY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Interface label
        ctx.font = '12px Segoe UI';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'right';
        ctx.fillText(simUI('canvas.interface', 'Interfață'), this.width - 15, this.centerY - 8);
    }
    
    drawNormal() {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.setLineDash([8, 4]);
        ctx.moveTo(this.centerX, this.centerY - 180);
        ctx.lineTo(this.centerX, this.centerY + 180);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Normal label
        ctx.font = '11px Segoe UI';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(simUI('canvas.normal', 'Normala'), this.centerX, this.centerY - 190);
    }
    
    drawRays() {
        const ctx = this.ctx;
        const result = this.calculateRefraction();
        const reflectance = this.calculateReflectance();
        const transmittance = 1 - reflectance;
        
        const theta1Rad = this.incidentAngle * Math.PI / 180;
        const rayLength = 200;
        
        // Calculate incident ray endpoint (coming from top-left)
        const incidentStartX = this.centerX - rayLength * Math.sin(theta1Rad);
        const incidentStartY = this.centerY - rayLength * Math.cos(theta1Rad);
        
        // Draw incident ray
        this.drawRay(
            incidentStartX, incidentStartY,
            this.centerX, this.centerY,
            this.lightColor, 3, 1, simUI('canvas.rayIncident', 'Raza incidentă')
        );
        
        // Draw arrow on incident ray
        this.drawArrow(
            (incidentStartX + this.centerX) / 2,
            (incidentStartY + this.centerY) / 2,
            theta1Rad + Math.PI,
            this.lightColor
        );
        
        // Draw reflected ray
        const reflectedEndX = this.centerX + rayLength * Math.sin(theta1Rad);
        const reflectedEndY = this.centerY - rayLength * Math.cos(theta1Rad);
        
        const reflectedAlpha = this.showIntensity ? reflectance : 1;
        this.drawRay(
            this.centerX, this.centerY,
            reflectedEndX, reflectedEndY,
            this.lightColor, 3, reflectedAlpha, simUI('canvas.rayReflected', 'Raza reflectată')
        );
        
        // Draw arrow on reflected ray
        this.drawArrow(
            (this.centerX + reflectedEndX) / 2,
            (this.centerY + reflectedEndY) / 2,
            -theta1Rad,
            this.lightColor,
            reflectedAlpha
        );
        
        // Draw refracted ray (if not TIR)
        if (!result.totalInternalReflection) {
            const theta2Rad = result.refractionAngleRad;
            const refractedEndX = this.centerX + rayLength * Math.sin(theta2Rad);
            const refractedEndY = this.centerY + rayLength * Math.cos(theta2Rad);
            
            const refractedAlpha = this.showIntensity ? transmittance : 1;
            this.drawRay(
                this.centerX, this.centerY,
                refractedEndX, refractedEndY,
                this.lightColor, 3, refractedAlpha, simUI('canvas.rayRefracted', 'Raza refractată')
            );
            
            // Draw arrow on refracted ray
            this.drawArrow(
                (this.centerX + refractedEndX) / 2,
                (this.centerY + refractedEndY) / 2,
                theta2Rad + Math.PI,
                this.lightColor,
                refractedAlpha
            );
        }
        
        // Draw point of incidence
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = this.lightColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawRay(x1, y1, x2, y2, color, width, alpha, label) {
        const ctx = this.ctx;
        
        // Create gradient for ray glow effect
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, this.hexToRgba(color, alpha * 0.8));
        gradient.addColorStop(0.5, this.hexToRgba(color, alpha));
        gradient.addColorStop(1, this.hexToRgba(color, alpha * 0.8));
        
        // Draw glow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = this.hexToRgba(color, alpha * 0.3);
        ctx.lineWidth = width + 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw main ray
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    drawArrow(x, y, angle, color, alpha = 1) {
        const ctx = this.ctx;
        const arrowSize = 12;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(arrowSize, 0);
        ctx.lineTo(-arrowSize / 2, -arrowSize / 2);
        ctx.lineTo(-arrowSize / 2, arrowSize / 2);
        ctx.closePath();
        
        ctx.fillStyle = this.hexToRgba(color, alpha);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawAngles() {
        const ctx = this.ctx;
        const result = this.calculateRefraction();
        const theta1Rad = this.incidentAngle * Math.PI / 180;
        const arcRadius = 50;
        
        // Incident angle arc
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, arcRadius, -Math.PI / 2, -Math.PI / 2 + theta1Rad, false);
        ctx.strokeStyle = 'rgba(255, 193, 7, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Incident angle label
        const labelAngle1 = -Math.PI / 2 + theta1Rad / 2;
        const labelX1 = this.centerX + (arcRadius + 20) * Math.cos(labelAngle1);
        const labelY1 = this.centerY + (arcRadius + 20) * Math.sin(labelAngle1);
        ctx.font = 'bold 12px Segoe UI';
        ctx.fillStyle = '#ffc107';
        ctx.textAlign = 'center';
        ctx.fillText(`θ₁=${this.incidentAngle}°`, labelX1, labelY1);
        
        // Reflection angle arc
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, arcRadius, -Math.PI / 2 - theta1Rad, -Math.PI / 2, false);
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Reflection angle label
        const labelAngle2 = -Math.PI / 2 - theta1Rad / 2;
        const labelX2 = this.centerX + (arcRadius + 20) * Math.cos(labelAngle2);
        const labelY2 = this.centerY + (arcRadius + 20) * Math.sin(labelAngle2);
        ctx.fillStyle = '#4caf50';
        ctx.fillText(`θᵣ=${this.incidentAngle}°`, labelX2, labelY2);
        
        // Refraction angle arc (if not TIR)
        if (!result.totalInternalReflection && result.refractionAngle !== null) {
            const theta2Rad = result.refractionAngleRad;
            
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, arcRadius, Math.PI / 2 - theta2Rad, Math.PI / 2, false);
            ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Refraction angle label
            const labelAngle3 = Math.PI / 2 - theta2Rad / 2;
            const labelX3 = this.centerX + (arcRadius + 25) * Math.cos(labelAngle3);
            const labelY3 = this.centerY + (arcRadius + 25) * Math.sin(labelAngle3);
            ctx.fillStyle = '#2196f3';
            ctx.fillText(`θ₂=${result.refractionAngle.toFixed(1)}°`, labelX3, labelY3);
        }
    }
    
    drawLabels() {
        const ctx = this.ctx;
        
        // Intensity labels if enabled
        if (this.showIntensity) {
            const reflectance = this.calculateReflectance();
            const transmittance = 1 - reflectance;
            
            ctx.font = '11px Segoe UI';
            ctx.textAlign = 'left';
            
            // Reflectance
            ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            ctx.fillText(`R = ${(reflectance * 100).toFixed(1)}%`, this.width - 100, 50);
            
            // Transmittance
            if (transmittance > 0) {
                ctx.fillStyle = 'rgba(33, 150, 243, 0.9)';
                ctx.fillText(`T = ${(transmittance * 100).toFixed(1)}%`, this.width - 100, 70);
            }
        }
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    animate() {
        this.rayProgress += this.animationSpeed;
        if (this.rayProgress > 1) {
            this.rayProgress = 0;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

function startReflectionSimulator() {
    window.simulator = new PhysicsSimulator();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReflectionSimulator);
} else {
    startReflectionSimulator();
}
