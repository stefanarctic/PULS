/**
 * Main 4D Visualizer Class
 * Handles THREE.js scene setup, rendering, and user interactions
 */

class Visualizer4D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 4D objects and systems
        this.currentModel = null;
        this.projection = new Projection4D();
        this.rotation = new Rotation4D();
        this.animation = new Animation4D();
        this.colorMapping = new ColorMapping4D();
        
        // Callback for UI updates
        this.onRotationUpdate = null;
        
        // THREE.js objects
        this.points = null;
        this.lines = null;
        this.mesh = null;
        
        // Model registry
        this.models = {
            'tesseract': () => new Tesseract(2),
            'hypersphere': () => new Hypersphere4D(1, 24),
            '3-sphere': () => new Sphere3D(1.5, 24),
            'calabi-yau': () => new CalabiYauManifold(1.5, 20),
            'hopf-fibration': () => new HopfFibration(2, 20),
            'clifford-torus': () => new CliffordTorus(1.5, 24),
            'hyperplane': () => new Hyperplane4D(4, 20),
            'klein-bottle': () => new KleinBottle4D(1, 24),
            'pentachoron': () => new Pentachoron(2),
            '16-cell': () => new Hexadecachoron(2),
            'buckyball4d': () => new Buckyball4D(1),
            'hypertorus': () => new Hypertorus4D(1.2, 0.5, 32, 32),
            '24-cell': () => new Icositetrachoron(2),
            '24-cell-dual': () => new Cell24Dual(2),
            '120-cell': () => new Hyperdodecahedron120Cell(2),
            '600-cell': () => new Hexacosichoron600Cell(2),
            'duoprism': () => new Duoprism4D(3, 4, 2),
            'polychoron-prism': () => new PolychoronPrism4D('cube', 2, 1),
            'polychoron-antiprism': () => new PolychoronAntiprism4D('tetrahedron', 2, 1),
            'e4-hyperdiamond': () => new E4Hyperdiamond(1.5, 2),
            'f4-root-polytope': () => new F4RootPolytope(2),
            'e8-lattice': () => new E8Lattice4D(0.5, 2)
        };
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupEventListeners();
        this.loadModel('tesseract');
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.autoClear = true;
        this.renderer.autoClearColor = true;
        this.renderer.autoClearDepth = true;
        this.renderer.autoClearStencil = true;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxDistance = 20;
        this.controls.minDistance = 1;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for dynamic lighting
        const pointLight = new THREE.PointLight(0x4CAF50, 0.5, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    loadModel(modelName) {
        if (!this.models[modelName]) {
            console.error(`Model ${modelName} not found`);
            return;
        }

        // Create new model
        this.currentModel = this.models[modelName]();
        
        // Generate 3D representation (this will clear the old model)
        this.generate3DRepresentation();
        
        console.log(`Loaded model: ${modelName}`);
    }

    clearModel() {
        if (this.points) {
            this.scene.remove(this.points);
            this.points.geometry.dispose();
            this.points.material.dispose();
            this.points = null;
        }
        
        if (this.lines) {
            this.scene.remove(this.lines);
            this.lines.geometry.dispose();
            this.lines.material.dispose();
            this.lines = null;
        }
        
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }

    generate3DRepresentation() {
        if (!this.currentModel) return;

        // Clear existing model first
        this.clearModel();

        const vertices4D = this.currentModel.getVertices();
        const edges = this.currentModel.getEdges();
        
        // Apply rotation
        const rotatedVertices = this.rotation.rotateArray(vertices4D);
        
        // Project to 3D
        const vertices3D = this.projection.projectArray(rotatedVertices);
        
        // Create point cloud
        this.createPointCloud(vertices3D, vertices4D);
        
        // Create wireframe
        this.createWireframe(vertices3D, edges);
        
        // Create mesh if available
        if (this.currentModel.getFaces) {
            this.createMesh(vertices3D, this.currentModel.getFaces());
        }
    }

    createPointCloud(vertices3D, vertices4D) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(vertices3D.length * 3);
        const colors = new Float32Array(vertices3D.length * 3);
        
        for (let i = 0; i < vertices3D.length; i++) {
            positions[i * 3] = vertices3D[i].x;
            positions[i * 3 + 1] = vertices3D[i].y;
            positions[i * 3 + 2] = vertices3D[i].z;
            
            const color = this.colorMapping.getColor(vertices4D[i]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }

    createWireframe(vertices3D, edges) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(edges.length * 2 * 3);
        
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const start = vertices3D[edge[0]];
            const end = vertices3D[edge[1]];
            
            positions[i * 6] = start.x;
            positions[i * 6 + 1] = start.y;
            positions[i * 6 + 2] = start.z;
            positions[i * 6 + 3] = end.x;
            positions[i * 6 + 4] = end.y;
            positions[i * 6 + 5] = end.z;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x4CAF50,
            transparent: true,
            opacity: 0.6
        });
        
        this.lines = new THREE.LineSegments(geometry, material);
        this.scene.add(this.lines);
    }

    createMesh(vertices3D, faces) {
        if (!faces || faces.length === 0) return;
        
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];
        
        // Convert faces to triangles
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            if (face.length < 3) continue;
            
            // Triangulate the face
            for (let j = 1; j < face.length - 1; j++) {
                indices.push(face[0], face[j], face[j + 1]);
            }
        }
        
        // Add all vertices
        for (let i = 0; i < vertices3D.length; i++) {
            positions.push(vertices3D[i].x, vertices3D[i].y, vertices3D[i].z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshLambertMaterial({
            color: 0x4CAF50,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    updateRotation(x, y, z, w) {
        this.rotation.setRotation(x, y, z, w);
        this.generate3DRepresentation();
        
        // Notify UI about rotation changes
        if (this.onRotationUpdate) {
            this.onRotationUpdate(x, y, z, w);
        }
    }

    updateProjection(type, distance) {
        this.projection.setType(type);
        if (distance !== undefined) {
            this.projection.setDistance(distance);
        }
        this.generate3DRepresentation();
    }

    updateAnimationSpeed(speed) {
        this.animation.setSpeed(speed);
    }

    toggleAutoRotation() {
        this.animation.setAutoRotate(!this.animation.autoRotate);
    }

    resetView() {
        this.rotation.setRotation(0, 0, 0, 0);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        this.generate3DRepresentation();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016; // Approximate 60fps
        this.animation.update(deltaTime);
        
        if (this.animation.autoRotate) {
            const rotations = this.animation.getRotationValues();
            
            this.updateRotation(
                rotations.x * Math.PI * 2,
                rotations.y * Math.PI * 2,
                rotations.z * Math.PI * 2,
                rotations.w * Math.PI * 2
            );
            
            // Convert normalized values (-0.5 to 0.5) to degrees (0 to 360)
            // Add 0.5 to shift range from [-0.5, 0.5] to [0, 1], then multiply by 360
            const xDegrees = ((rotations.x + 0.5) * 360) % 360;
            const yDegrees = ((rotations.y + 0.5) * 360) % 360;
            const zDegrees = ((rotations.z + 0.5) * 360) % 360;
            const wDegrees = ((rotations.w + 0.5) * 360) % 360;
            
            // Update UI sliders with current rotation values
            if (this.onRotationUpdate) {
                this.onRotationUpdate(xDegrees, yDegrees, zDegrees, wDegrees);
            }
        }
        
        this.controls.update();
        
        // Explicitly clear the renderer
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.clearModel();
        this.renderer.dispose();
        this.controls.dispose();
    }
}
