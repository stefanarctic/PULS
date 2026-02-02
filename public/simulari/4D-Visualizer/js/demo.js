/**
 * Demo Script for 4D Visualizer
 * Shows how to use the visualizer programmatically
 */

// Wait for the app to be initialized
function waitForApp() {
    return new Promise((resolve) => {
        const checkApp = () => {
            if (window.app4D && window.app4D.isInitialized) {
                resolve(window.app4D);
            } else {
                setTimeout(checkApp, 100);
            }
        };
        checkApp();
    });
}

// Demo functions
async function demoSequence() {
    const app = await waitForApp();
    
    console.log('Starting 4D Visualizer Demo...');
    
    // Demo 1: Cycle through different models
    const models = ['tesseract', 'hypersphere', 'hyperplane', 'klein-bottle'];
    
    for (let i = 0; i < models.length; i++) {
        console.log(`Loading model: ${models[i]}`);
        app.loadModel(models[i]);
        
        // Wait 3 seconds before next model
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Demo 2: Animate rotation
    console.log('Starting rotation animation...');
    app.toggleAutoRotation();
    
    // Wait 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Demo 3: Try different projections
    console.log('Testing different projections...');
    const projections = ['perspective', 'orthographic', 'stereographic'];
    
    for (let i = 0; i < projections.length; i++) {
        console.log(`Setting projection: ${projections[i]}`);
        app.setProjection(projections[i]);
        
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Demo 4: Manual rotation
    console.log('Manual rotation demo...');
    app.toggleAutoRotation(); // Stop auto rotation
    
    const steps = 20;
    for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        app.setRotation(angle, angle * 0.5, angle * 0.3, angle * 0.7);
        
        // Wait 200ms between steps
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Reset everything
    console.log('Resetting view...');
    app.resetView();
    
    console.log('Demo completed!');
}

// Interactive demo functions
function createInteractiveDemo() {
    const app = window.app4D;
    if (!app) return;
    
    // Create demo buttons
    const demoContainer = document.createElement('div');
    demoContainer.style.cssText = `
        position: absolute;
        top: 20px;
        right: 350px;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px;
        border-radius: 10px;
        color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 5;
    `;
    
    demoContainer.innerHTML = `
        <h4 style="margin-top: 0; color: #4CAF50;">Interactive Demo</h4>
        <button onclick="runDemoSequence()" style="margin: 5px; padding: 8px 12px;">Run Full Demo</button>
        <button onclick="cycleModels()" style="margin: 5px; padding: 8px 12px;">Cycle Models</button>
        <button onclick="animateRotation()" style="margin: 5px; padding: 8px 12px;">Animate Rotation</button>
        <button onclick="testProjections()" style="margin: 5px; padding: 8px 12px;">Test Projections</button>
    `;
    
    document.body.appendChild(demoContainer);
    
    // Make functions globally available
    window.runDemoSequence = demoSequence;
    window.cycleModels = async () => {
        const models = ['tesseract', 'hypersphere', 'hyperplane', 'klein-bottle'];
        for (const model of models) {
            app.loadModel(model);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    };
    
    window.animateRotation = () => {
        app.toggleAutoRotation();
        setTimeout(() => app.toggleAutoRotation(), 5000);
    };
    
    window.testProjections = async () => {
        const projections = ['perspective', 'orthographic', 'stereographic'];
        for (const projection of projections) {
            app.setProjection(projection);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    };
}

// Initialize demo when page loads
window.addEventListener('load', () => {
    setTimeout(createInteractiveDemo, 2000); // Wait for app to initialize
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        demoSequence,
        createInteractiveDemo,
        waitForApp
    };
}
