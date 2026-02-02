/**
 * 4D Geometry Classes for THREE.js
 * Implements various 4-dimensional objects and their projections to 3D
 */

class Vector4D {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    clone() {
        return new Vector4D(this.x, this.y, this.z, this.w);
    }

    add(v) {
        return new Vector4D(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    subtract(v) {
        return new Vector4D(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    multiplyScalar(s) {
        return new Vector4D(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector4D(0, 0, 0, 0);
        return this.multiplyScalar(1 / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    toVector3() {
        return new THREE.Vector3(this.x, this.y, this.z);
    }

    static fromVector3(v3, w = 0) {
        return new Vector4D(v3.x, v3.y, v3.z, w);
    }
}

class Matrix4D {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    identity() {
        const te = this.elements;
        te[0] = 1; te[4] = 0; te[8] = 0; te[12] = 0;
        te[1] = 0; te[5] = 1; te[9] = 0; te[13] = 0;
        te[2] = 0; te[6] = 0; te[10] = 1; te[14] = 0;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    multiply(m) {
        const ae = this.elements;
        const be = m.elements;
        const te = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                te[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    te[i * 4 + j] += ae[i * 4 + k] * be[k * 4 + j];
                }
            }
        }

        this.elements = te;
        return this;
    }

    rotateXY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = c; te[1] = s; te[2] = 0; te[3] = 0;
        te[4] = -s; te[5] = c; te[6] = 0; te[7] = 0;
        te[8] = 0; te[9] = 0; te[10] = 1; te[11] = 0;
        te[12] = 0; te[13] = 0; te[14] = 0; te[15] = 1;
       
        return this.multiply(rotationMatrix);
    }

    rotateXZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = c; te[1] = 0; te[2] = s; te[3] = 0;
        te[4] = 0; te[5] = 1; te[6] = 0; te[7] = 0;
        te[8] = -s; te[9] = 0; te[10] = c; te[11] = 0;
        te[12] = 0; te[13] = 0; te[14] = 0; te[15] = 1;
       
        return this.multiply(rotationMatrix);
    }

    rotateXW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = c; te[1] = 0; te[2] = 0; te[3] = s;
        te[4] = 0; te[5] = 1; te[6] = 0; te[7] = 0;
        te[8] = 0; te[9] = 0; te[10] = 1; te[11] = 0;
        te[12] = -s; te[13] = 0; te[14] = 0; te[15] = c;
       
        return this.multiply(rotationMatrix);
    }

    rotateYZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = 1; te[1] = 0; te[2] = 0; te[3] = 0;
        te[4] = 0; te[5] = c; te[6] = s; te[7] = 0;
        te[8] = 0; te[9] = -s; te[10] = c; te[11] = 0;
        te[12] = 0; te[13] = 0; te[14] = 0; te[15] = 1;
       
        return this.multiply(rotationMatrix);
    }

    rotateYW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = 1; te[1] = 0; te[2] = 0; te[3] = 0;
        te[4] = 0; te[5] = c; te[6] = 0; te[7] = s;
        te[8] = 0; te[9] = 0; te[10] = 1; te[11] = 0;
        te[12] = 0; te[13] = -s; te[14] = 0; te[15] = c;
       
        return this.multiply(rotationMatrix);
    }

    rotateZW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const rotationMatrix = new Matrix4D();
        const te = rotationMatrix.elements;
       
        te[0] = 1; te[1] = 0; te[2] = 0; te[3] = 0;
        te[4] = 0; te[5] = 1; te[6] = 0; te[7] = 0;
        te[8] = 0; te[9] = 0; te[10] = c; te[11] = s;
        te[12] = 0; te[13] = 0; te[14] = -s; te[15] = c;
       
        return this.multiply(rotationMatrix);
    }

    transformVector(v) {
        const te = this.elements;
        const x = v.x, y = v.y, z = v.z, w = v.w;
       
        return new Vector4D(
            te[0] * x + te[1] * y + te[2] * z + te[3] * w,
            te[4] * x + te[5] * y + te[6] * z + te[7] * w,
            te[8] * x + te[9] * y + te[10] * z + te[11] * w,
            te[12] * x + te[13] * y + te[14] * z + te[15] * w
        );
    }
}

class Tesseract {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = this.generateFaces();
    }

    generateVertices() {
        const vertices = [];
        const s = this.size / 2;
       
        // Generate all 16 vertices of a tesseract
        for (let i = 0; i < 16; i++) {
            const x = (i & 1) ? s : -s;
            const y = (i & 2) ? s : -s;
            const z = (i & 4) ? s : -s;
            const w = (i & 8) ? s : -s;
            vertices.push(new Vector4D(x, y, z, w));
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
       
        // Connect vertices that differ by exactly one bit
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                const diff = i ^ j;
                if (diff && (diff & (diff - 1)) === 0) { // Power of 2
                    edges.push([i, j]);
                }
            }
        }
       
        return edges;
    }

    generateFaces() {
        const faces = [];
       
        // Generate 8 cubic faces
        const cubeFaces = [
            [0, 1, 3, 2, 6, 7, 5, 4], // Front face
            [8, 9, 11, 10, 14, 15, 13, 12], // Back face
            [0, 1, 9, 8, 12, 13, 5, 4], // Left face
            [2, 3, 11, 10, 14, 15, 7, 6], // Right face
            [0, 2, 10, 8, 12, 14, 6, 4], // Bottom face
            [1, 3, 11, 9, 13, 15, 7, 5]  // Top face
        ];
       
        return cubeFaces;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }

    getFaces() {
        return this.faces;
    }
}

class Hypersphere4D {
    constructor(radius = 1, resolution = 32) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const phiStep = Math.PI / this.resolution;
        const thetaStep = (2 * Math.PI) / this.resolution;
       
        for (let i = 0; i <= this.resolution; i++) {
            const phi = i * phiStep;
            for (let j = 0; j <= this.resolution; j++) {
                const theta = j * thetaStep;
               
                const x = this.radius * Math.sin(phi) * Math.cos(theta);
                const y = this.radius * Math.sin(phi) * Math.sin(theta);
                const z = this.radius * Math.cos(phi) * Math.cos(theta);
                const w = this.radius * Math.cos(phi) * Math.sin(theta);
               
                vertices.push(new Vector4D(x, y, z, w));
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const rows = this.resolution + 1;
       
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const current = i * rows + j;
                const next = i * rows + (j + 1) % rows;
                const below = (i + 1) * rows + j;
                const belowNext = (i + 1) * rows + (j + 1) % rows;
               
                edges.push([current, next]);
                edges.push([current, below]);
                edges.push([current, belowNext]);
            }
        }
       
        return edges;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class Sphere3D {
    constructor(radius = 1, resolution = 24) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const phiStep = Math.PI / this.resolution;
        const thetaStep = (2 * Math.PI) / this.resolution;
       
        for (let i = 0; i <= this.resolution; i++) {
            const phi = i * phiStep;
            for (let j = 0; j <= this.resolution; j++) {
                const theta = j * thetaStep;
               
                const x = this.radius * Math.sin(phi) * Math.cos(theta);
                const y = this.radius * Math.sin(phi) * Math.sin(theta);
                const z = this.radius * Math.cos(phi);
                const w = 0; // 3-sfera în spațiul 4D cu w=0
               
                vertices.push(new Vector4D(x, y, z, w));
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const rows = this.resolution + 1;
       
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const current = i * rows + j;
                const next = i * rows + (j + 1) % rows;
                const below = (i + 1) * rows + j;
                const belowNext = (i + 1) * rows + (j + 1) % rows;
               
                edges.push([current, next]);
                edges.push([current, below]);
                edges.push([current, belowNext]);
            }
        }
       
        return edges;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class CalabiYauManifold {
    constructor(radius = 1.5, resolution = 32) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const uStep = (2 * Math.PI) / this.resolution;
        const vStep = (2 * Math.PI) / this.resolution;
        const wStep = (2 * Math.PI) / this.resolution;
       
        for (let i = 0; i < this.resolution; i++) {
            const u = i * uStep;
            for (let j = 0; j < this.resolution; j++) {
                const v = j * vStep;
                for (let k = 0; k < this.resolution; k++) {
                    const w = k * wStep;
                   
                    // Calabi-Yau manifold parametrization
                    // Folosim o parametrizare complexă care aproximează proprietățile Calabi-Yau
                    const r = this.radius * (1 + 0.3 * Math.sin(3 * u) * Math.cos(2 * v) * Math.sin(w));
                    const theta = u + 0.2 * Math.sin(2 * v) * Math.cos(w);
                    const phi = v + 0.2 * Math.cos(u) * Math.sin(2 * w);
                    const psi = w + 0.1 * Math.sin(u) * Math.cos(v);
                   
                    // Coordonate 4D cu structură Calabi-Yau
                    const x = r * Math.sin(theta) * Math.cos(phi) * Math.cos(psi);
                    const y = r * Math.sin(theta) * Math.sin(phi) * Math.cos(psi);
                    const z = r * Math.cos(theta) * Math.cos(psi);
                    const wCoord = r * Math.sin(psi);
                   
                    // Adăugăm perturbații pentru a simula complexitatea Calabi-Yau
                    const perturbation = 0.1 * Math.sin(5 * u) * Math.cos(3 * v) * Math.sin(2 * w);
                   
                    vertices.push(new Vector4D(
                        x + perturbation * Math.cos(u),
                        y + perturbation * Math.sin(v),
                        z + perturbation * Math.cos(w),
                        wCoord + perturbation * Math.sin(u + v)
                    ));
                }
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const res = this.resolution;
       
        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                for (let k = 0; k < res; k++) {
                    const current = i * res * res + j * res + k;
                   
                    // Conectăm la vecinii din grila 3D
                    const nextI = ((i + 1) % res) * res * res + j * res + k;
                    const nextJ = i * res * res + ((j + 1) % res) * res + k;
                    const nextK = i * res * res + j * res + ((k + 1) % res);
                   
                    // Conectăm doar dacă distanța între puncte nu este prea mare
                    const currentVertex = this.vertices[current];
                   
                    if (i < res - 1) {
                        const nextIVertex = this.vertices[nextI];
                        if (this.distance(currentVertex, nextIVertex) < this.radius * 0.5) {
                            edges.push([current, nextI]);
                        }
                    }
                   
                    if (j < res - 1) {
                        const nextJVertex = this.vertices[nextJ];
                        if (this.distance(currentVertex, nextJVertex) < this.radius * 0.5) {
                            edges.push([current, nextJ]);
                        }
                    }
                   
                    if (k < res - 1) {
                        const nextKVertex = this.vertices[nextK];
                        if (this.distance(currentVertex, nextKVertex) < this.radius * 0.5) {
                            edges.push([current, nextK]);
                        }
                    }
                }
            }
        }
       
        return edges;
    }

    distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        const dw = v1.w - v2.w;
        return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class HopfFibration {
    constructor(radius = 2, resolution = 24) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const phiStep = (2 * Math.PI) / this.resolution;
        const thetaStep = (2 * Math.PI) / this.resolution;
        const psiStep = (2 * Math.PI) / this.resolution;
       
        for (let i = 0; i < this.resolution; i++) {
            const phi = i * phiStep;
            for (let j = 0; j < this.resolution; j++) {
                const theta = j * thetaStep;
                for (let k = 0; k < this.resolution; k++) {
                    const psi = k * psiStep;
                   
                    // Hopf fibration: S³ -> S²
                    // Parametrizăm 3-sfera folosind coordonate sferice 4D
                    const r = this.radius;
                   
                    // Coordonate pe 3-sfera S³
                    const x1 = r * Math.sin(phi) * Math.cos(theta);
                    const y1 = r * Math.sin(phi) * Math.sin(theta);
                    const z1 = r * Math.cos(phi) * Math.cos(psi);
                    const w1 = r * Math.cos(phi) * Math.sin(psi);
                   
                    // Hopf map: (x1, y1, z1, w1) -> (x, y, z, w)
                    // unde (x, y, z, w) sunt coordonatele în spațiul 4D
                    const x = 2 * (x1 * z1 + y1 * w1);
                    const y = 2 * (y1 * z1 - x1 * w1);
                    const z = x1 * x1 + y1 * y1 - z1 * z1 - w1 * w1;
                    const w = 0; // Hopf fibration mapează S³ la S², deci w=0
                   
                    vertices.push(new Vector4D(x, y, z, w));
                }
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const res = this.resolution;
       
        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                for (let k = 0; k < res; k++) {
                    const current = i * res * res + j * res + k;
                   
                    // Conectăm punctele care sunt apropiate în spațiul 3D
                    const nextI = ((i + 1) % res) * res * res + j * res + k;
                    const nextJ = i * res * res + ((j + 1) % res) * res + k;
                    const nextK = i * res * res + j * res + ((k + 1) % res);
                   
                    const currentVertex = this.vertices[current];
                   
                    // Conectăm doar dacă distanța este mică (pentru a păstra structura Hopf)
                    if (i < res - 1) {
                        const nextIVertex = this.vertices[nextI];
                        if (this.distance3D(currentVertex, nextIVertex) < this.radius * 0.8) {
                            edges.push([current, nextI]);
                        }
                    }
                   
                    if (j < res - 1) {
                        const nextJVertex = this.vertices[nextJ];
                        if (this.distance3D(currentVertex, nextJVertex) < this.radius * 0.8) {
                            edges.push([current, nextJ]);
                        }
                    }
                   
                    if (k < res - 1) {
                        const nextKVertex = this.vertices[nextK];
                        if (this.distance3D(currentVertex, nextKVertex) < this.radius * 0.8) {
                            edges.push([current, nextK]);
                        }
                    }
                }
            }
        }
       
        return edges;
    }

    distance3D(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class CliffordTorus {
    constructor(radius = 1.5, resolution = 32) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const uStep = (2 * Math.PI) / this.resolution;
        const vStep = (2 * Math.PI) / this.resolution;
        
        for (let i = 0; i < this.resolution; i++) {
            const u = i * uStep;
            for (let j = 0; j < this.resolution; j++) {
                const v = j * vStep;
                
                // Clifford torus parametrization
                // Este un tor perfect în spațiul 4D cu razele egale
                const r1 = this.radius / Math.sqrt(2); // Raza primului cerc
                const r2 = this.radius / Math.sqrt(2); // Raza celui de-al doilea cerc
                
                // Coordonate Clifford torus în spațiul 4D
                const x = r1 * Math.cos(u);
                const y = r1 * Math.sin(u);
                const z = r2 * Math.cos(v);
                const w = r2 * Math.sin(v);
                
                vertices.push(new Vector4D(x, y, z, w));
            }
        }
        
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const res = this.resolution;
        
        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                const current = i * res + j;
                
                // Conectăm la vecinii din grila 2D (pentru tor)
                const nextI = ((i + 1) % res) * res + j;
                const nextJ = i * res + ((j + 1) % res);
                
                // Conectăm punctele pentru a forma structura de tor
                edges.push([current, nextI]);
                edges.push([current, nextJ]);
            }
        }
        
        return edges;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class E4Hyperdiamond {
    constructor(size = 2, range = 2) {
        this.size = size; // dimensiunea unității de bază
        this.range = range; // cât de departe mergem cu generarea punctelor
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile rețelei E₄ Hyperdiamond
    generateVertices() {
        const vertices = [];
        const s = this.size / 2; // jumătate din dimensiunea unității
        
        // E₄ Hyperdiamond este bazat pe rețeaua E₄ cu atomi în poziții specifice
        // Similar cu structura diamantului 3D, dar în 4D
        
        for (let a = -this.range; a <= this.range; a++) {
            for (let b = -this.range; b <= this.range; b++) {
                for (let c = -this.range; c <= this.range; c++) {
                    for (let d = -this.range; d <= this.range; d++) {
                        // Verificăm condițiile pentru rețeaua E₄
                        let sum = a + b + c + d;
                        
                        // Atomii din rețeaua principală E₄ (cu suma pară)
                        if (sum % 2 === 0) {
                            vertices.push(new Vector4D(
                                s * a,
                                s * b,
                                s * c,
                                s * d
                            ));
                        }
                        
                        // Atomii din rețeaua secundară (cu suma pară + offset)
                        // Aceasta creează structura "diamant" în 4D
                        sum = a + b + c + d + 2;
                        if (sum % 2 === 0) {
                            // Offset pentru a crea structura tetraedrică caracteristică diamantului
                            const offset = s * 0.25; // Offset mic pentru a simula structura diamantului
                            vertices.push(new Vector4D(
                                s * a + offset,
                                s * b + offset,
                                s * c + offset,
                                s * d + offset
                            ));
                        }
                        
                        // Atomii din rețeaua terțiară pentru complexitate suplimentară
                        // Aceasta creează conexiuni suplimentare caracteristice structurii E₄
                        sum = a + b + c + d + 1;
                        if (sum % 2 === 0 && Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d) <= this.range) {
                            const offset2 = s * 0.125; // Offset și mai mic
                            vertices.push(new Vector4D(
                                s * a + offset2,
                                s * b - offset2,
                                s * c + offset2,
                                s * d - offset2
                            ));
                        }
                    }
                }
            }
        }
        
        return vertices;
    }

    // Generează muchiile pentru rețeaua E₄ Hyperdiamond
    generateEdges() {
        const edges = [];
        const vertices = this.vertices;
        
        // Pentru fiecare vârf, găsim cei mai apropiați vecini
        for (let i = 0; i < vertices.length; i++) {
            const distances = [];
            
            for (let j = 0; j < vertices.length; j++) {
                if (i === j) continue;
                
                const dx = vertices[i].x - vertices[j].x;
                const dy = vertices[i].y - vertices[j].y;
                const dz = vertices[i].z - vertices[j].z;
                const dw = vertices[i].w - vertices[j].w;
                const dist = dx*dx + dy*dy + dz*dz + dw*dw;
                
                distances.push({ j, dist });
            }
            
            // Sortăm după distanță
            distances.sort((a, b) => a.dist - b.dist);
            
            // Conectăm la cei mai apropiați 4-6 vecini (caracteristic structurii E₄)
            // Structura E₄ are coordonarea 4-6 în funcție de poziția atomului
            const numConnections = Math.min(6, distances.length);
            
            for (let k = 0; k < numConnections; k++) {
                const idx = distances[k].j;
                const dist = distances[k].dist;
                
                // Conectăm doar dacă distanța este în intervalul caracteristic E₄
                // și dacă nu am conectat deja această muchie
                if (dist <= this.size * this.size * 1.5 && i < idx) {
                    edges.push([i, idx]);
                }
            }
        }
        
        return edges;
    }

    // Funcție helper pentru a calcula distanța între două vârfuri
    distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        const dw = v1.w - v2.w;
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    }

    getVertices() { 
        return this.vertices; 
    }

    getEdges() { 
        return this.edges; 
    }

    getFaces() { 
        return this.faces; 
    }
}

class F4RootPolytope {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile sistemului de rădăcini F₄
    generateVertices() {
        const vertices = [];
        const s = this.size / 2;
        
        // Sistemul de rădăcini F₄ are 48 de rădăcini în spațiul 4D
        // Acestea sunt generate din rădăcinile simple ale grupului Lie F₄
        
        // Rădăcinile scurte (±1, ±1, 0, 0) și permutările lor
        const shortRoots = [
            [1, 1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [-1, -1, 0, 0],
            [1, 0, 1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [-1, 0, -1, 0],
            [1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, 1], [-1, 0, 0, -1],
            [0, 1, 1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, -1, -1, 0],
            [0, 1, 0, 1], [0, 1, 0, -1], [0, -1, 0, 1], [0, -1, 0, -1],
            [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, -1, -1]
        ];
        
        // Rădăcinile lungi (±1, ±1, ±1, ±1) cu numărul par de semne minus
        const longRoots = [
            [1, 1, 1, 1], [1, 1, 1, -1], [1, 1, -1, 1], [1, 1, -1, -1],
            [1, -1, 1, 1], [1, -1, 1, -1], [1, -1, -1, 1], [1, -1, -1, -1],
            [-1, 1, 1, 1], [-1, 1, 1, -1], [-1, 1, -1, 1], [-1, 1, -1, -1],
            [-1, -1, 1, 1], [-1, -1, 1, -1], [-1, -1, -1, 1], [-1, -1, -1, -1]
        ];
        
        // Adăugăm rădăcinile scurte
        for (const root of shortRoots) {
            vertices.push(new Vector4D(
                s * root[0],
                s * root[1],
                s * root[2],
                s * root[3]
            ));
        }
        
        // Adăugăm rădăcinile lungi
        for (const root of longRoots) {
            vertices.push(new Vector4D(
                s * root[0],
                s * root[1],
                s * root[2],
                s * root[3]
            ));
        }
        
        // Adăugăm rădăcinile (±2, 0, 0, 0) și permutările lor
        const doubleRoots = [
            [2, 0, 0, 0], [-2, 0, 0, 0],
            [0, 2, 0, 0], [0, -2, 0, 0],
            [0, 0, 2, 0], [0, 0, -2, 0],
            [0, 0, 0, 2], [0, 0, 0, -2]
        ];
        
        for (const root of doubleRoots) {
            vertices.push(new Vector4D(
                s * root[0],
                s * root[1],
                s * root[2],
                s * root[3]
            ));
        }
        
        return vertices;
    }

    // Generează muchiile pentru poliedrul F₄
    generateEdges() {
        const edges = [];
        const vertices = this.vertices;
        
        // Pentru fiecare vârf, găsim rădăcinile conectate
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const v1 = vertices[i];
                const v2 = vertices[j];
                
                // Calculăm produsul scalar pentru a determina dacă rădăcinile sunt conectate
                const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
                
                // În sistemul F₄, rădăcinile sunt conectate dacă:
                // 1. Produsul scalar este -1 (rădăcini adiacente)
                // 2. Produsul scalar este 0 (rădăcini ortogonale)
                // 3. Produsul scalar este 1 (rădăcini identice, dar nu conectăm la sine)
                if (Math.abs(dotProduct + 1) < 0.1 || Math.abs(dotProduct) < 0.1) {
                    edges.push([i, j]);
                }
            }
        }
        
        return edges;
    }

    // Funcție helper pentru a calcula distanța între două vârfuri
    distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        const dw = v1.w - v2.w;
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    }

    getVertices() { 
        return this.vertices; 
    }

    getEdges() { 
        return this.edges; 
    }

    getFaces() { 
        return this.faces; 
    }
}

class Cell24Dual {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile dualului 24-cell (F₄ lattice)
    generateVertices() {
        const vertices = [];
        const s = this.size / 2;
        
        // Dualul 24-cell-ului are 24 de vârfuri (centrul fețelor 24-cell-ului original)
        // Acestea sunt poziționate pe rețeaua F₄
        
        // Vârfurile dualului 24-cell sunt centrul fețelor octaedrice ale 24-cell-ului original
        // Coordonatele sunt generate din rețeaua F₄ cu poziții specifice
        
        // Primul set de vârfuri: (±1, ±1, 0, 0) și permutările lor
        const vertices1 = [
            [1, 1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [-1, -1, 0, 0],
            [1, 0, 1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [-1, 0, -1, 0],
            [1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, 1], [-1, 0, 0, -1],
            [0, 1, 1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, -1, -1, 0],
            [0, 1, 0, 1], [0, 1, 0, -1], [0, -1, 0, 1], [0, -1, 0, -1],
            [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, -1, -1]
        ];
        
        // Al doilea set de vârfuri: (±1, ±1, ±1, ±1) cu numărul par de semne minus
        const vertices2 = [
            [1, 1, 1, 1], [1, 1, 1, -1], [1, 1, -1, 1], [1, 1, -1, -1],
            [1, -1, 1, 1], [1, -1, 1, -1], [1, -1, -1, 1], [1, -1, -1, -1],
            [-1, 1, 1, 1], [-1, 1, 1, -1], [-1, 1, -1, 1], [-1, 1, -1, -1],
            [-1, -1, 1, 1], [-1, -1, 1, -1], [-1, -1, -1, 1], [-1, -1, -1, -1]
        ];
        
        // Adăugăm primul set de vârfuri
        for (const vertex of vertices1) {
            vertices.push(new Vector4D(
                s * vertex[0],
                s * vertex[1],
                s * vertex[2],
                s * vertex[3]
            ));
        }
        
        // Adăugăm al doilea set de vârfuri
        for (const vertex of vertices2) {
            vertices.push(new Vector4D(
                s * vertex[0],
                s * vertex[1],
                s * vertex[2],
                s * vertex[3]
            ));
        }
        
        return vertices;
    }

    // Generează muchiile pentru dualul 24-cell
    generateEdges() {
        const edges = [];
        const vertices = this.vertices;
        
        // Pentru fiecare vârf, găsim vârfurile conectate
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const v1 = vertices[i];
                const v2 = vertices[j];
                
                // Calculăm distanța între vârfuri
                const dx = v1.x - v2.x;
                const dy = v1.y - v2.y;
                const dz = v1.z - v2.z;
                const dw = v1.w - v2.w;
                const dist = dx*dx + dy*dy + dz*dz + dw*dw;
                
                // În dualul 24-cell, vârfurile sunt conectate dacă:
                // 1. Distanța este √2 (vârfuri adiacente)
                // 2. Distanța este 2 (vârfuri opuse pe fețe)
                if (Math.abs(dist - 2) < 0.1 || Math.abs(dist - 4) < 0.1) {
                    edges.push([i, j]);
                }
            }
        }
        
        return edges;
    }

    // Funcție helper pentru a calcula distanța între două vârfuri
    distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        const dw = v1.w - v2.w;
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    }

    getVertices() { 
        return this.vertices; 
    }

    getEdges() { 
        return this.edges; 
    }

    getFaces() { 
        return this.faces; 
    }
}

class Hyperplane4D {
    constructor(size = 4, resolution = 20) {
        this.size = size;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const step = this.size / this.resolution;
       
        for (let i = 0; i <= this.resolution; i++) {
            for (let j = 0; j <= this.resolution; j++) {
                const x = (i - this.resolution / 2) * step;
                const y = (j - this.resolution / 2) * step;
                const z = 0;
                const w = 0;
               
                vertices.push(new Vector4D(x, y, z, w));
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const rows = this.resolution + 1;
       
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const current = i * rows + j;
                const right = i * rows + j + 1;
                const below = (i + 1) * rows + j;
               
                edges.push([current, right]);
                edges.push([current, below]);
            }
        }
       
        return edges;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

class KleinBottle4D {
    constructor(radius = 1, resolution = 32) {
        this.radius = radius;
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
    }

    generateVertices() {
        const vertices = [];
        const uStep = (2 * Math.PI) / this.resolution;
        const vStep = (2 * Math.PI) / this.resolution;
       
        for (let i = 0; i <= this.resolution; i++) {
            const u = i * uStep;
            for (let j = 0; j <= this.resolution; j++) {
                const v = j * vStep;
               
                // Klein bottle parametric equations in 4D
                const x = (2 + Math.cos(v)) * Math.cos(u);
                const y = (2 + Math.cos(v)) * Math.sin(u);
                const z = Math.sin(v) * Math.cos(u / 2);
                const w = Math.sin(v) * Math.sin(u / 2);
               
                vertices.push(new Vector4D(x, y, z, w));
            }
        }
       
        return vertices;
    }

    generateEdges() {
        const edges = [];
        const rows = this.resolution + 1;
       
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const current = i * rows + j;
                const next = i * rows + (j + 1) % rows;
                const below = (i + 1) * rows + j;
               
                edges.push([current, next]);
                edges.push([current, below]);
            }
        }
       
        return edges;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}
class Pentachoron {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = this.generateFaces();
    }

    // 5 vârfuri ale unui 4-simplex regulat centrat în origine
    generateVertices() {
        const s = this.size / Math.sqrt(10); // scale for similar size to tesseract
        return [
            new Vector4D(1, 1, 1, -1).multiplyScalar(s),
            new Vector4D(1, -1, -1, -1).multiplyScalar(s),
            new Vector4D(-1, 1, -1, -1).multiplyScalar(s),
            new Vector4D(-1, -1, 1, -1).multiplyScalar(s),
            new Vector4D(0, 0, 0, 2).multiplyScalar(s)
        ];
    }

    // 10 muchii: fiecare pereche de vârfuri
    generateEdges() {
        const edges = [];
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                edges.push([i, j]);
            }
        }
        return edges;
    }

    // 10 fețe triunghiulare: fiecare triplet de vârfuri
    generateFaces() {
        const faces = [];
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                for (let k = j + 1; k < 5; k++) {
                    faces.push([i, j, k]);
                }
            }
        }
        return faces;
    }

    getVertices() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }

    getFaces() {
        return this.faces;
    }
}
class Hexadecachoron {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = this.generateFaces();
    }

    // 8 perechi de vârfuri opuse pe axele 4D
    generateVertices() {
        const s = this.size / Math.sqrt(2);
        return [
            new Vector4D( s, 0, 0, 0),
            new Vector4D(-s, 0, 0, 0),
            new Vector4D(0,  s, 0, 0),
            new Vector4D(0, -s, 0, 0),
            new Vector4D(0, 0,  s, 0),
            new Vector4D(0, 0, -s, 0),
            new Vector4D(0, 0, 0,  s),
            new Vector4D(0, 0, 0, -s)
        ];
    }

    // Fiecare vârf e conectat la toate celelalte, cu excepția celui opus
    generateEdges() {
        const edges = [];
        for (let i = 0; i < 8; i++) {
            for (let j = i + 1; j < 8; j++) {
                // Nu conecta vârfurile opuse (i și i^1)
                if (
                    (i === 0 && j === 1) ||
                    (i === 2 && j === 3) ||
                    (i === 4 && j === 5) ||
                    (i === 6 && j === 7)
                ) continue;
                edges.push([i, j]);
            }
        }
        return edges;
    }

    // Fiecare față este un triunghi format din 3 vârfuri conectate
    generateFaces() {
        // Pentru simplitate, nu generăm aici toate fețele, doar muchiile și vârfurile sunt suficiente pentru vizualizare wireframe.
        return [];
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Buckyball4D {
    constructor(radius = 1) {
        this.radius = radius;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        // Fețele nu sunt implementate complet, doar pentru wireframe
        this.faces = [];
    }

    // Distribuie 60 de puncte pe o sferă 4D folosind metoda Fibonacci
    generateVertices() {
        const N = 60;
        const verts = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < N; i++) {
            const w = 2 * (i / (N - 1)) - 1; // from -1 to 1
            const r = Math.sqrt(1 - w * w);
            const theta = phi * i;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = Math.cos(theta * 1.618) * r; // extra twist for 4D
            verts.push(new Vector4D(
                this.radius * x,
                this.radius * y,
                this.radius * z,
                this.radius * w
            ));
        }
        return verts;
    }

    // Conectează fiecare vârf la cei mai apropiați 3-4 vecini (aproximează structura C60)
    generateEdges() {
        const edges = [];
        const verts = this.vertices;
        for (let i = 0; i < verts.length; i++) {
            // Găsește cei mai apropiați 3 vecini
            const dists = [];
            for (let j = 0; j < verts.length; j++) {
                if (i === j) continue;
                const dx = verts[i].x - verts[j].x;
                const dy = verts[i].y - verts[j].y;
                const dz = verts[i].z - verts[j].z;
                const dw = verts[i].w - verts[j].w;
                const dist = dx*dx + dy*dy + dz*dz + dw*dw;
                dists.push({j, dist});
            }
            dists.sort((a, b) => a.dist - b.dist);
            for (let k = 0; k < 3; k++) {
                const idx = dists[k].j;
                // Adaugă muchia doar o dată
                if (i < idx) edges.push([i, idx]);
            }
        }
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Hypertorus4D {
    constructor(R = 1.2, r = 0.5, res1 = 24, res2 = 24) {
        this.R = R; // raza mare
        this.r = r; // raza mică
        this.res1 = res1; // rezoluție pe primul cerc
        this.res2 = res2; // rezoluție pe al doilea cerc
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Parametrizare: θ, φ ∈ [0, 2π)
    generateVertices() {
        const verts = [];
        for (let i = 0; i < this.res1; i++) {
            const theta = (2 * Math.PI * i) / this.res1;
            for (let j = 0; j < this.res2; j++) {
                const phi = (2 * Math.PI * j) / this.res2;
                // 4D torus: două cercuri independente
                const x = (this.R + this.r * Math.cos(theta)) * Math.cos(phi);
                const y = (this.R + this.r * Math.cos(theta)) * Math.sin(phi);
                const z = this.r * Math.sin(theta) * Math.cos(phi);
                const w = this.r * Math.sin(theta) * Math.sin(phi);
                verts.push(new Vector4D(x, y, z, w));
            }
        }
        return verts;
    }

    // Conectează fiecare punct la vecinii săi pe grilă
    generateEdges() {
        const edges = [];
        for (let i = 0; i < this.res1; i++) {
            for (let j = 0; j < this.res2; j++) {
                const idx = i * this.res2 + j;
                // Vecin pe θ
                const nextI = ((i + 1) % this.res1) * this.res2 + j;
                edges.push([idx, nextI]);
                // Vecin pe φ
                const nextJ = i * this.res2 + ((j + 1) % this.res2);
                edges.push([idx, nextJ]);
            }
        }
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Icositetrachoron {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // 24 de vârfuri: toate permutările (±1, ±1, 0, 0)
    generateVertices() {
        const verts = [];
        const s = this.size / Math.sqrt(2);
        const signs = [1, -1];
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                for (const si of signs) {
                    for (const sj of signs) {
                        const v = [0, 0, 0, 0];
                        v[i] = si * s;
                        v[j] = sj * s;
                        verts.push(new Vector4D(v[0], v[1], v[2], v[3]));
                    }
                }
            }
        }
        return verts;
    }

    // Două vârfuri sunt conectate dacă diferă la exact două poziții (cu semne opuse)
    generateEdges() {
        const edges = [];
        const verts = this.vertices;
        for (let i = 0; i < verts.length; i++) {
            for (let j = i + 1; j < verts.length; j++) {
                let diff = 0;
                for (let k = 0; k < 4; k++) {
                    if (verts[i][['x','y','z','w'][k]] !== verts[j][['x','y','z','w'][k]]) diff++;
                }
                if (diff === 2) edges.push([i, j]);
            }
        }
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Hyperdodecahedron120Cell {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Aproximare: distribuim 600 de puncte pe o sferă 4D
    generateVertices() {
        const N = 600;
        const verts = [];
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
            const w = 2 * (i / (N - 1)) - 1;
            const r = Math.sqrt(1 - w * w);
            const theta = phi * i;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = Math.cos(theta * 1.618) * r;
            verts.push(new Vector4D(
                this.size * x,
                this.size * y,
                this.size * z,
                this.size * w
            ));
        }
        return verts;
    }

    // Fiecare vârf conectat la cei mai apropiați 3 vecini (aproximare pentru wireframe)
    generateEdges() {
        const edges = [];
        const verts = this.vertices;
        for (let i = 0; i < verts.length; i++) {
            const dists = [];
            for (let j = 0; j < verts.length; j++) {
                if (i === j) continue;
                const dx = verts[i].x - verts[j].x;
                const dy = verts[i].y - verts[j].y;
                const dz = verts[i].z - verts[j].z;
                const dw = verts[i].w - verts[j].w;
                const dist = dx*dx + dy*dy + dz*dz + dw*dw;
                dists.push({j, dist});
            }
            dists.sort((a, b) => a.dist - b.dist);
            for (let k = 0; k < 3; k++) {
                const idx = dists[k].j;
                if (i < idx) edges.push([i, idx]);
            }
        }
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Hexacosichoron600Cell {
    constructor(size = 2) {
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // 120 de vârfuri pe sfera 4D (aproximare cu distribuție Fibonacci)
    generateVertices() {
        const N = 120;
        const verts = [];
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
            const w = 2 * (i / (N - 1)) - 1;
            const r = Math.sqrt(1 - w * w);
            const theta = phi * i;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = Math.cos(theta * 1.618) * r;
            verts.push(new Vector4D(
                this.size * x,
                this.size * y,
                this.size * z,
                this.size * w
            ));
        }
        return verts;
    }

    // Fiecare vârf conectat la cei mai apropiați 3 vecini (aproximare pentru wireframe)
    generateEdges() {
        const edges = [];
        const verts = this.vertices;
        for (let i = 0; i < verts.length; i++) {
            const dists = [];
            for (let j = 0; j < verts.length; j++) {
                if (i === j) continue;
                const dx = verts[i].x - verts[j].x;
                const dy = verts[i].y - verts[j].y;
                const dz = verts[i].z - verts[j].z;
                const dw = verts[i].w - verts[j].w;
                const dist = dx*dx + dy*dy + dz*dz + dw*dw;
                dists.push({j, dist});
            }
            dists.sort((a, b) => a.dist - b.dist);
            for (let k = 0; k < 3; k++) {
                const idx = dists[k].j;
                if (i < idx) edges.push([i, idx]);
            }
        }
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}
class Duoprism4D {
    constructor(n1 = 3, n2 = 4, size = 2) {
        this.n1 = n1; // numărul de laturi ale primului poligon
        this.n2 = n2; // numărul de laturi ale celui de-al doilea poligon
        this.size = size;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile unui duoprism ca produs cartezian de două poligoane
    generateVertices() {
        const vertices = [];
        const radius1 = this.size / 2;
        const radius2 = this.size / 2;
        
        // Generează primul poligon în planul XY
        const polygon1 = [];
        for (let i = 0; i < this.n1; i++) {
            const angle1 = (2 * Math.PI * i) / this.n1;
            const x = radius1 * Math.cos(angle1);
            const y = radius1 * Math.sin(angle1);
            polygon1.push({ x, y });
        }
        
        // Generează al doilea poligon în planul ZW
        const polygon2 = [];
        for (let i = 0; i < this.n2; i++) {
            const angle2 = (2 * Math.PI * i) / this.n2;
            const z = radius2 * Math.cos(angle2);
            const w = radius2 * Math.sin(angle2);
            polygon2.push({ z, w });
        }
        
        // Produsul cartezian: fiecare vârf din primul poligon cu fiecare vârf din al doilea
        for (let i = 0; i < this.n1; i++) {
            for (let j = 0; j < this.n2; j++) {
                vertices.push(new Vector4D(
                    polygon1[i].x,
                    polygon1[i].y,
                    polygon2[j].z,
                    polygon2[j].w
                ));
            }
        }
        
        return vertices;
    }

    // Generează muchiile duoprismului
    generateEdges() {
        const edges = [];
        
        // Muchii din primul poligon (conectează vârfurile cu același j)
        for (let i = 0; i < this.n1; i++) {
            for (let j = 0; j < this.n2; j++) {
                const current = i * this.n2 + j;
                const next = ((i + 1) % this.n1) * this.n2 + j;
                edges.push([current, next]);
            }
        }
        
        // Muchii din al doilea poligon (conectează vârfurile cu același i)
        for (let i = 0; i < this.n1; i++) {
            for (let j = 0; j < this.n2; j++) {
                const current = i * this.n2 + j;
                const next = i * this.n2 + ((j + 1) % this.n2);
                edges.push([current, next]);
            }
        }
        
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}

class PolychoronPrism4D {
    constructor(baseType = 'cube', height = 2, size = 1) {
        this.baseType = baseType; // tipul poliedrului de bază: 'cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron'
        this.height = height; // înălțimea în direcția W
        this.size = size; // dimensiunea poliedrului de bază
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile poliedrului de bază în spațiul 3D (XYZ)
    generateBaseVertices() {
        const vertices = [];
        const s = this.size;
        
        switch (this.baseType) {
            case 'cube':
                // Cub: 8 vârfuri
                for (let i = 0; i < 8; i++) {
                    const x = (i & 1) ? s : -s;
                    const y = (i & 2) ? s : -s;
                    const z = (i & 4) ? s : -s;
                    vertices.push({ x, y, z });
                }
                break;
                
            case 'tetrahedron':
                // Tetraedru: 4 vârfuri
                vertices.push(
                    { x: s, y: s, z: s },
                    { x: -s, y: -s, z: s },
                    { x: -s, y: s, z: -s },
                    { x: s, y: -s, z: -s }
                );
                break;
                
            case 'octahedron':
                // Octaedru: 6 vârfuri
                vertices.push(
                    { x: s, y: 0, z: 0 },
                    { x: -s, y: 0, z: 0 },
                    { x: 0, y: s, z: 0 },
                    { x: 0, y: -s, z: 0 },
                    { x: 0, y: 0, z: s },
                    { x: 0, y: 0, z: -s }
                );
                break;
                
            case 'dodecahedron':
                // Dodecaedru: 20 vârfuri (aproximare cu distribuție pe sferă)
                const phi = (1 + Math.sqrt(5)) / 2; // rația de aur
                const vertices_dodeca = [
                    { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: -1, z: -1 },
                    { x: -1, y: 1, z: 1 }, { x: -1, y: 1, z: -1 }, { x: -1, y: -1, z: 1 }, { x: -1, y: -1, z: -1 },
                    { x: 0, y: 1/phi, z: phi }, { x: 0, y: 1/phi, z: -phi }, { x: 0, y: -1/phi, z: phi }, { x: 0, y: -1/phi, z: -phi },
                    { x: 1/phi, y: phi, z: 0 }, { x: 1/phi, y: -phi, z: 0 }, { x: -1/phi, y: phi, z: 0 }, { x: -1/phi, y: -phi, z: 0 },
                    { x: phi, y: 0, z: 1/phi }, { x: phi, y: 0, z: -1/phi }, { x: -phi, y: 0, z: 1/phi }, { x: -phi, y: 0, z: -1/phi }
                ];
                vertices.push(...vertices_dodeca.map(v => ({ x: v.x * s, y: v.y * s, z: v.z * s })));
                break;
                
            case 'icosahedron':
                // Icosaedru: 12 vârfuri (aproximare cu distribuție pe sferă)
                const vertices_icosa = [];
                const phi_ico = (1 + Math.sqrt(5)) / 2;
                const vertices_ico_coords = [
                    { x: 0, y: 1, z: phi_ico }, { x: 0, y: -1, z: phi_ico }, { x: 0, y: 1, z: -phi_ico }, { x: 0, y: -1, z: -phi_ico },
                    { x: 1, y: phi_ico, z: 0 }, { x: -1, y: phi_ico, z: 0 }, { x: 1, y: -phi_ico, z: 0 }, { x: -1, y: -phi_ico, z: 0 },
                    { x: phi_ico, y: 0, z: 1 }, { x: -phi_ico, y: 0, z: 1 }, { x: phi_ico, y: 0, z: -1 }, { x: -phi_ico, y: 0, z: -1 }
                ];
                vertices.push(...vertices_ico_coords.map(v => ({ x: v.x * s, y: v.y * s, z: v.z * s })));
                break;
                
            default:
                // Default: cub
                for (let i = 0; i < 8; i++) {
                    const x = (i & 1) ? s : -s;
                    const y = (i & 2) ? s : -s;
                    const z = (i & 4) ? s : -s;
                    vertices.push({ x, y, z });
                }
        }
        
        return vertices;
    }

    // Generează vârfurile prismei 4D
    generateVertices() {
        const vertices = [];
        const baseVertices = this.generateBaseVertices();
        const h = this.height / 2;
        
        // Adaugă vârfurile de bază cu w = -h
        for (const vertex of baseVertices) {
            vertices.push(new Vector4D(vertex.x, vertex.y, vertex.z, -h));
        }
        
        // Adaugă vârfurile de sus cu w = +h
        for (const vertex of baseVertices) {
            vertices.push(new Vector4D(vertex.x, vertex.y, vertex.z, h));
        }
        
        return vertices;
    }

    // Generează muchiile prismei 4D
    generateEdges() {
        const edges = [];
        const baseVertices = this.generateBaseVertices();
        const n = baseVertices.length;
        
        // Muchii din poliedrul de bază (conectează vârfurile cu același w)
        // Pentru simplitate, conectăm fiecare vârf la cei mai apropiați 2-3 vecini
        for (let i = 0; i < n; i++) {
            const distances = [];
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                const dx = baseVertices[i].x - baseVertices[j].x;
                const dy = baseVertices[i].y - baseVertices[j].y;
                const dz = baseVertices[i].z - baseVertices[j].z;
                const dist = dx*dx + dy*dy + dz*dz;
                distances.push({ j, dist });
            }
            distances.sort((a, b) => a.dist - b.dist);
            
            // Conectează la cei mai apropiați 2-3 vecini
            const numConnections = Math.min(3, distances.length);
            for (let k = 0; k < numConnections; k++) {
                const idx = distances[k].j;
                if (i < idx) {
                    // Muchii în baza de jos
                    edges.push([i, idx]);
                    // Muchii în baza de sus
                    edges.push([i + n, idx + n]);
                }
            }
        }
        
        // Muchii verticale (conectează vârfurile de jos cu cele de sus)
        for (let i = 0; i < n; i++) {
            edges.push([i, i + n]);
        }
        
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}

class PolychoronAntiprism4D {
    constructor(baseType = 'tetrahedron', height = 2, size = 1) {
        this.baseType = baseType; // tipul poliedrului de bază
        this.height = height; // înălțimea în direcția W
        this.size = size; // dimensiunea poliedrului de bază
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.faces = [];
    }

    // Generează vârfurile poliedrului de bază în spațiul 3D (XYZ)
    generateBaseVertices() {
        const vertices = [];
        const s = this.size;
        
        switch (this.baseType) {
            case 'tetrahedron':
                // Tetraedru: 4 vârfuri
                vertices.push(
                    { x: s, y: s, z: s },
                    { x: -s, y: -s, z: s },
                    { x: -s, y: s, z: -s },
                    { x: s, y: -s, z: -s }
                );
                break;
                
            case 'octahedron':
                // Octaedru: 6 vârfuri
                vertices.push(
                    { x: s, y: 0, z: 0 },
                    { x: -s, y: 0, z: 0 },
                    { x: 0, y: s, z: 0 },
                    { x: 0, y: -s, z: 0 },
                    { x: 0, y: 0, z: s },
                    { x: 0, y: 0, z: -s }
                );
                break;
                
            case 'cube':
                // Cub: 8 vârfuri
                for (let i = 0; i < 8; i++) {
                    const x = (i & 1) ? s : -s;
                    const y = (i & 2) ? s : -s;
                    const z = (i & 4) ? s : -s;
                    vertices.push({ x, y, z });
                }
                break;
                
            case 'dodecahedron':
                // Dodecaedru: 20 vârfuri (aproximare cu distribuție pe sferă)
                const phi = (1 + Math.sqrt(5)) / 2;
                const vertices_dodeca = [
                    { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: -1, z: -1 },
                    { x: -1, y: 1, z: 1 }, { x: -1, y: 1, z: -1 }, { x: -1, y: -1, z: 1 }, { x: -1, y: -1, z: -1 },
                    { x: 0, y: 1/phi, z: phi }, { x: 0, y: 1/phi, z: -phi }, { x: 0, y: -1/phi, z: phi }, { x: 0, y: -1/phi, z: -phi },
                    { x: 1/phi, y: phi, z: 0 }, { x: 1/phi, y: -phi, z: 0 }, { x: -1/phi, y: phi, z: 0 }, { x: -1/phi, y: -phi, z: 0 },
                    { x: phi, y: 0, z: 1/phi }, { x: phi, y: 0, z: -1/phi }, { x: -phi, y: 0, z: 1/phi }, { x: -phi, y: 0, z: -phi }
                ];
                vertices.push(...vertices_dodeca.map(v => ({ x: v.x * s, y: v.y * s, z: v.z * s })));
                break;
                
            case 'icosahedron':
                // Icosaedru: 12 vârfuri
                const phi_ico = (1 + Math.sqrt(5)) / 2;
                const vertices_ico_coords = [
                    { x: 0, y: 1, z: phi_ico }, { x: 0, y: -1, z: phi_ico }, { x: 0, y: 1, z: -phi_ico }, { x: 0, y: -1, z: -phi_ico },
                    { x: 1, y: phi_ico, z: 0 }, { x: -1, y: phi_ico, z: 0 }, { x: 1, y: -phi_ico, z: 0 }, { x: -1, y: -phi_ico, z: 0 },
                    { x: phi_ico, y: 0, z: 1 }, { x: -phi_ico, y: 0, z: 1 }, { x: phi_ico, y: 0, z: -1 }, { x: -phi_ico, y: 0, z: -1 }
                ];
                vertices.push(...vertices_ico_coords.map(v => ({ x: v.x * s, y: v.y * s, z: v.z * s })));
                break;
                
            default:
                // Default: tetraedru
                vertices.push(
                    { x: s, y: s, z: s },
                    { x: -s, y: -s, z: s },
                    { x: -s, y: s, z: -s },
                    { x: s, y: -s, z: -s }
                );
        }
        
        return vertices;
    }

    // Rotirea poliedrului pentru antiprismă
    rotatePolyhedron(vertices, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return vertices.map(vertex => ({
            x: vertex.x * cos - vertex.y * sin,
            y: vertex.x * sin + vertex.y * cos,
            z: vertex.z
        }));
    }

    // Generează vârfurile antiprismei 4D
    generateVertices() {
        const vertices = [];
        const baseVertices = this.generateBaseVertices();
        const h = this.height / 2;
        const n = baseVertices.length;
        
        // Adaugă vârfurile de bază cu w = -h
        for (const vertex of baseVertices) {
            vertices.push(new Vector4D(vertex.x, vertex.y, vertex.z, -h));
        }
        
        // Adaugă vârfurile de sus cu w = +h (rotite cu π/n)
        const rotationAngle = Math.PI / n; // Rotirea pentru antiprismă
        const rotatedVertices = this.rotatePolyhedron(baseVertices, rotationAngle);
        
        for (const vertex of rotatedVertices) {
            vertices.push(new Vector4D(vertex.x, vertex.y, vertex.z, h));
        }
        
        return vertices;
    }

    // Generează muchiile antiprismei 4D
    generateEdges() {
        const edges = [];
        const baseVertices = this.generateBaseVertices();
        const n = baseVertices.length;
        
        // Muchii din poliedrul de bază (conectează vârfurile cu același w)
        for (let i = 0; i < n; i++) {
            const distances = [];
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                const dx = baseVertices[i].x - baseVertices[j].x;
                const dy = baseVertices[i].y - baseVertices[j].y;
                const dz = baseVertices[i].z - baseVertices[j].z;
                const dist = dx*dx + dy*dy + dz*dz;
                distances.push({ j, dist });
            }
            distances.sort((a, b) => a.dist - b.dist);
            
            // Conectează la cei mai apropiați 2-3 vecini
            const numConnections = Math.min(3, distances.length);
            for (let k = 0; k < numConnections; k++) {
                const idx = distances[k].j;
                if (i < idx) {
                    // Muchii în baza de jos
                    edges.push([i, idx]);
                    // Muchii în baza de sus (cu indicii rotiți)
                    edges.push([i + n, idx + n]);
                }
            }
        }
        
        // Muchii diagonale (conectează vârfurile de jos cu cele de sus în mod antiprismă)
        for (let i = 0; i < n; i++) {
            // Conectează la vârfurile adiacente din baza de sus
            const next = (i + 1) % n;
            edges.push([i, next + n]);
            edges.push([next, i + n]);
        }
        
        return edges;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}

class E8Lattice4D {
    constructor(size = 1, range = 2) {
        this.size = size;
        this.range = range; // cât de departe mergem cu generarea punctelor
        this.vertices = this.generateVertices();
        this.edges = [];
        this.faces = [];
    }

    // Generează puncte E8 și le proiectează în 4D (primele 4 coordonate)
    generateVertices() {
        const verts = [];
        // E8 = { (z1,...,z8) ∈ Z^8 ∪ (Z+1/2)^8 | suma z_i pară }
        for (let a = -this.range; a <= this.range; a++)
        for (let b = -this.range; b <= this.range; b++)
        for (let c = -this.range; c <= this.range; c++)
        for (let d = -this.range; d <= this.range; d++)
        for (let e = -this.range; e <= this.range; e++)
        for (let f = -this.range; f <= this.range; f++)
        for (let g = -this.range; g <= this.range; g++)
        for (let h = -this.range; h <= this.range; h++) {
            // Z^8
            let sum = a + b + c + d + e + f + g + h;
            if (sum % 2 === 0) {
                verts.push(new Vector4D(
                    this.size * a,
                    this.size * b,
                    this.size * c,
                    this.size * d
                ));
            }
            // (Z+1/2)^8
            sum = a + b + c + d + e + f + g + h + 4;
            if (sum % 2 === 0) {
                verts.push(new Vector4D(
                    this.size * (a + 0.5),
                    this.size * (b + 0.5),
                    this.size * (c + 0.5),
                    this.size * (d + 0.5)
                ));
            }
        }
        return verts;
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
}