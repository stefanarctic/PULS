/**
 * 4D to 3D Projection Algorithms
 * Handles various projection methods for visualizing 4D objects in 3D space
 */

class Projection4D {
    constructor(type = 'perspective', distance = 5) {
        this.type = type;
        this.distance = distance;
        this.fov = Math.PI / 4; // Field of view for perspective projection
    }

    setType(type) {
        this.type = type;
    }

    setDistance(distance) {
        this.distance = distance;
    }

    setFOV(fov) {
        this.fov = fov;
    }

    /**
     * Projects a 4D vector to 3D space
     * @param {Vector4D} point4D - The 4D point to project
     * @returns {THREE.Vector3} - The projected 3D point
     */
    project(point4D) {
        switch (this.type) {
            case 'perspective':
                return this.perspectiveProjection(point4D);
            case 'orthographic':
                return this.orthographicProjection(point4D);
            case 'stereographic':
                return this.stereographicProjection(point4D);
            default:
                return this.perspectiveProjection(point4D);
        }
    }

    /**
     * Perspective projection - projects 4D point to 3D by dividing by W coordinate
     */
    perspectiveProjection(point4D) {
        const w = point4D.w;
        
        if (Math.abs(w) < 0.001) {
            // Handle points very close to the projection plane
            return new THREE.Vector3(point4D.x, point4D.y, point4D.z);
        }
        
        const scale = this.distance / (this.distance + w);
        return new THREE.Vector3(
            point4D.x * scale,
            point4D.y * scale,
            point4D.z * scale
        );
    }

    /**
     * Orthographic projection - simply drops the W coordinate
     */
    orthographicProjection(point4D) {
        return new THREE.Vector3(point4D.x, point4D.y, point4D.z);
    }

    /**
     * Stereographic projection - projects 4D sphere to 3D space
     */
    stereographicProjection(point4D) {
        const w = point4D.w;
        
        if (w >= 1 - 0.001) {
            // Point is at or near the north pole
            return new THREE.Vector3(0, 0, 1000); // Far away point
        }
        
        const scale = 1 / (1 - w);
        return new THREE.Vector3(
            point4D.x * scale,
            point4D.y * scale,
            point4D.z * scale
        );
    }

    /**
     * Projects an array of 4D points to 3D
     * @param {Vector4D[]} points4D - Array of 4D points
     * @returns {THREE.Vector3[]} - Array of projected 3D points
     */
    projectArray(points4D) {
        return points4D.map(point => this.project(point));
    }

    /**
     * Projects edges from 4D to 3D
     * @param {Array} edges - Array of edge pairs [startIndex, endIndex]
     * @param {Vector4D[]} vertices4D - Array of 4D vertices
     * @returns {Array} - Array of projected edge pairs
     */
    projectEdges(edges, vertices4D) {
        const projectedVertices = this.projectArray(vertices4D);
        return edges.map(edge => [
            projectedVertices[edge[0]],
            projectedVertices[edge[1]]
        ]);
    }
}

class Rotation4D {
    constructor() {
        this.matrix = new Matrix4D();
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.rotationW = 0;
    }

    setRotation(x, y, z, w) {
        this.rotationX = x;
        this.rotationY = y;
        this.rotationZ = z;
        this.rotationW = w;
        this.updateMatrix();
    }

    updateMatrix() {
        this.matrix.identity();
        
        // Apply rotations in intuitive order:
        // X Rotation -> rotate around X-axis (YZ plane)
        // Y Rotation -> rotate around Y-axis (XZ plane)  
        // Z Rotation -> rotate around Z-axis (XY plane)
        // W Rotation -> rotate around W-axis (XW plane)
        this.matrix.rotateYZ(this.rotationX);
        this.matrix.rotateXZ(this.rotationY);
        this.matrix.rotateXY(this.rotationZ);
        this.matrix.rotateXW(this.rotationW);
    }

    rotatePoint(point4D) {
        return this.matrix.transformVector(point4D);
    }

    rotateArray(points4D) {
        return points4D.map(point => this.rotatePoint(point));
    }
}

class Animation4D {
    constructor() {
        this.isAnimating = false;
        this.speed = 1.0;
        this.time = 0;
        this.autoRotate = false;
        this.rotationSpeed = 0.03; // Increased from 0.01 to 0.03
    }

    start() {
        this.isAnimating = true;
    }

    stop() {
        this.isAnimating = false;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    update(deltaTime) {
        if (this.isAnimating) {
            this.time += deltaTime * this.speed;
        }
        
        if (this.autoRotate) {
            this.time += deltaTime * this.speed * 0.03; // Use the main speed for auto-rotation
        }
    }

    getRotationValues() {
        return {
            x: Math.sin(this.time * 1.0) * 0.5,
            y: Math.cos(this.time * 0.8) * 0.5,
            z: Math.sin(this.time * 1.2) * 0.5,
            w: Math.cos(this.time * 0.9) * 0.5
        };
    }
}

class ColorMapping4D {
    constructor() {
        this.colorMode = 'depth'; // 'depth', 'w-coordinate', 'distance'
    }

    setColorMode(mode) {
        this.colorMode = mode;
    }

    getColor(point4D, minW = -2, maxW = 2) {
        let normalizedValue;
        
        switch (this.colorMode) {
            case 'w-coordinate':
                normalizedValue = (point4D.w - minW) / (maxW - minW);
                break;
            case 'distance':
                normalizedValue = Math.min(point4D.length() / 4, 1);
                break;
            case 'depth':
            default:
                normalizedValue = (point4D.z + 2) / 4; // Assuming z ranges from -2 to 2
                break;
        }
        
        normalizedValue = Math.max(0, Math.min(1, normalizedValue));
        
        // Create a color gradient from blue to red
        const hue = normalizedValue * 240; // Blue (240) to Red (0)
        return new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
    }

    getColorArray(points4D) {
        const minW = Math.min(...points4D.map(p => p.w));
        const maxW = Math.max(...points4D.map(p => p.w));
        
        return points4D.map(point => this.getColor(point, minW, maxW));
    }
}
