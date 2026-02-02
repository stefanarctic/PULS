/**
 * Main Application Entry Point
 * Handles UI interactions and initializes the 4D visualizer
 */

class App4D {
    constructor() {
        this.visualizer = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            this.setupVisualizer();
            this.setupUI();
            this.hideLoading();
            this.isInitialized = true;
            console.log('4D Visualizer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 4D Visualizer:', error);
            this.showError('Failed to initialize 4D Visualizer. Please refresh the page.');
        }
    }

    setupVisualizer() {
        const container = document.getElementById('canvas-container');
        if (!container) {
            throw new Error('Canvas container not found');
        }
        
        this.visualizer = new Visualizer4D(container);
        
        // Set up callback for rotation updates
        this.visualizer.onRotationUpdate = (x, y, z, w) => {
            this.updateRotationSliders(x, y, z, w);
        };
    }

    setupUI() {
        this.setupModelSelector();
        this.setupRotationControls();
        this.setupProjectionControls();
        this.setupAnimationControls();
        this.setupButtons();
        this.setupInfoPanel();
        this.setupSidebarToggle();
    }

    setupModelSelector() {
        // Setup custom dropdown
        const dropdownSelected = document.getElementById('dropdown-selected');
        const dropdownOptions = document.getElementById('dropdown-options');
        const modelSelect = document.getElementById('model-select');
        
        if (dropdownSelected && dropdownOptions) {
            // Toggle dropdown on click
            dropdownSelected.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
            
            // Handle option selection
            dropdownOptions.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-option')) {
                    const value = e.target.getAttribute('data-value');
                    const text = e.target.textContent;
                    
                    // Update selected text
                    dropdownSelected.querySelector('span:first-child').textContent = text;
                    
                    // Update hidden select for compatibility
                    if (modelSelect) {
                        modelSelect.value = value;
                        modelSelect.dispatchEvent(new Event('change'));
                    }
                    
                    // Update visualizer
                    this.visualizer.loadModel(value);
                    
                    // Close dropdown
                    this.closeDropdown();
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-dropdown')) {
                    this.closeDropdown();
                }
            });
        }
        
        // Keep original select for compatibility
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                this.visualizer.loadModel(e.target.value);
            });
        }
    }
    
    toggleDropdown() {
        const dropdownSelected = document.getElementById('dropdown-selected');
        const dropdownOptions = document.getElementById('dropdown-options');
        
        if (dropdownOptions.classList.contains('show')) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        const dropdownSelected = document.getElementById('dropdown-selected');
        const dropdownOptions = document.getElementById('dropdown-options');
        
        dropdownSelected.classList.add('active');
        dropdownOptions.classList.add('show');
        document.body.classList.add('dropdown-open');
    }
    
    closeDropdown() {
        const dropdownSelected = document.getElementById('dropdown-selected');
        const dropdownOptions = document.getElementById('dropdown-options');
        
        dropdownSelected.classList.remove('active');
        dropdownOptions.classList.remove('show');
        document.body.classList.remove('dropdown-open');
    }

    setupRotationControls() {
        const rotationControls = ['rotation-x', 'rotation-y', 'rotation-z', 'rotation-w'];
        const valueDisplays = ['rot-x-value', 'rot-y-value', 'rot-z-value', 'rot-w-value'];
        
        rotationControls.forEach((controlId, index) => {
            const control = document.getElementById(controlId);
            const valueDisplay = document.getElementById(valueDisplays[index]);
            
            if (control && valueDisplay) {
                control.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = `${value}°`;
                    this.updateRotation();
                });
            }
        });
    }

    setupProjectionControls() {
        const projectionSelect = document.getElementById('projection');
        if (projectionSelect) {
            projectionSelect.addEventListener('change', (e) => {
                this.visualizer.updateProjection(e.target.value);
            });
        }
    }

    setupAnimationControls() {
        const animationSpeed = document.getElementById('animation-speed');
        const animSpeedValue = document.getElementById('anim-speed-value');
        
        if (animationSpeed && animSpeedValue) {
            animationSpeed.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                animSpeedValue.textContent = speed.toFixed(1);
                this.visualizer.updateAnimationSpeed(speed);
            });
        }
    }

    setupButtons() {
        const autoRotateBtn = document.getElementById('auto-rotate');
        const resetBtn = document.getElementById('reset-view');
        
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => {
                this.visualizer.toggleAutoRotation();
                autoRotateBtn.textContent = this.visualizer.animation.autoRotate ? 
                    'Stop Auto Rotation' : 'Toggle Auto Rotation';
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.visualizer.resetView();
                this.resetRotationControls();
            });
        }
    }

    setupInfoPanel() {
        // Info panel is handled by onclick in HTML
        console.log('Info panel setup - using HTML onclick handler');
    }

    setupSidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (!sidebar || !toggle) return;

        const syncBodyClass = () => {
            if (sidebar.classList.contains('collapsed')) {
                document.body.classList.add('sidebar-collapsed');
            } else {
                document.body.classList.remove('sidebar-collapsed');
            }
        };

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            syncBodyClass();
        });

        // Start collapsed on small screens
        const mq = window.matchMedia('(max-width: 900px)');
        const applyInitial = () => {
            if (mq.matches) {
                sidebar.classList.add('collapsed');
            }
        };
        applyInitial();
        syncBodyClass();
        mq.addEventListener ? mq.addEventListener('change', applyInitial) : mq.addListener(applyInitial);
    }

    updateRotation() {
        if (!this.visualizer) return;
        
        const x = this.getRotationValue('rotation-x') * Math.PI / 180;
        const y = this.getRotationValue('rotation-y') * Math.PI / 180;
        const z = this.getRotationValue('rotation-z') * Math.PI / 180;
        const w = this.getRotationValue('rotation-w') * Math.PI / 180;
        
        this.visualizer.updateRotation(x, y, z, w);
    }

    getRotationValue(controlId) {
        const control = document.getElementById(controlId);
        return control ? parseFloat(control.value) : 0;
    }

    updateRotationSliders(xDegrees, yDegrees, zDegrees, wDegrees) {
        const rotationControls = ['rotation-x', 'rotation-y', 'rotation-z', 'rotation-w'];
        const valueDisplays = ['rot-x-value', 'rot-y-value', 'rot-z-value', 'rot-w-value'];
        const values = [xDegrees, yDegrees, zDegrees, wDegrees];
        
        rotationControls.forEach((controlId, index) => {
            const control = document.getElementById(controlId);
            const valueDisplay = document.getElementById(valueDisplays[index]);
            
            if (control && valueDisplay) {
                // Update slider value and display without triggering input event
                control.value = Math.round(values[index]);
                valueDisplay.textContent = `${Math.round(values[index])}°`;
            }
        });
    }

    resetRotationControls() {
        const rotationControls = ['rotation-x', 'rotation-y', 'rotation-z', 'rotation-w'];
        const valueDisplays = ['rot-x-value', 'rot-y-value', 'rot-z-value', 'rot-w-value'];
        
        rotationControls.forEach((controlId, index) => {
            const control = document.getElementById(controlId);
            const valueDisplay = document.getElementById(valueDisplays[index]);
            
            if (control && valueDisplay) {
                control.value = 0;
                valueDisplay.textContent = '0°';
            }
        });
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.textContent = message;
            loading.style.color = '#ff4444';
        }
    }

    // Public API methods
    loadModel(modelName) {
        if (this.visualizer) {
            this.visualizer.loadModel(modelName);
        }
    }

    setProjection(type, distance) {
        if (this.visualizer) {
            this.visualizer.updateProjection(type, distance);
        }
    }

    setRotation(x, y, z, w) {
        if (this.visualizer) {
            this.visualizer.updateRotation(x, y, z, w);
        }
    }

    toggleAutoRotation() {
        if (this.visualizer) {
            this.visualizer.toggleAutoRotation();
        }
    }

    resetView() {
        if (this.visualizer) {
            this.visualizer.resetView();
        }
    }
}

// Initialize the application
let app4D;

// Start the application when the page loads
window.addEventListener('load', () => {
    app4D = new App4D();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (app4D && app4D.visualizer) {
        app4D.visualizer.onWindowResize();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app4D && app4D.visualizer) {
        app4D.visualizer.dispose();
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App4D;
}
