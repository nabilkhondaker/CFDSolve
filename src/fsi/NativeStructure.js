export class NativeStructure {
    constructor(width, height) {
        this.w = width;
        this.h = height;
        this.nodes = [];
        this.springs = [];
        this.k = 0.5;    // Structural stiffness (higher = more rigid)
        this.damp = 0.1; // Damping (prevents infinite oscillation)
    }

    // Generates a flexible vertical beam in the center of the flow
    buildFlexibleBeam(centerX, centerY, beamWidth, beamHeight) {
        const startX = centerX - beamWidth / 2;
        const startY = centerY - beamHeight / 2;

        // 1. Create Nodes
        for (let y = 0; y < beamHeight; y++) {
            for (let x = 0; x < beamWidth; x++) {
                const isAnchored = (y === beamHeight - 1); // Anchor the bottom of the beam
                this.nodes.push({
                    id: y * beamWidth + x,
                    x: startX + x,
                    y: startY + y,
                    vx: 0,
                    vy: 0,
                    fx: 0,
                    fy: 0,
                    fixed: isAnchored
                });
            }
        }

        // 2. Connect nearest neighbors with springs
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);
                
                // Connect adjacent and diagonal nodes
                if (dist <= Math.SQRT2 + 0.1) {
                    this.springs.push({ n1, n2, restLength: dist });
                }
            }
        }
    }

    // Apply fluid pressure/momentum to the structural nodes
    applyFluidForces(solverUx, solverUy) {
        for (let node of this.nodes) {
            if (node.fixed) continue;
            
            // Map node position to fluid grid
            const gridX = Math.floor(node.x);
            const gridY = Math.floor(node.y);
            
            if (gridX > 0 && gridX < this.w && gridY > 0 && gridY < this.h) {
                const idx = gridY * this.w + gridX;
                // Fluid pushing on the structure
                node.fx += solverUx[idx] * 0.1; 
                node.fy += solverUy[idx] * 0.1;
            }
        }
    }

    step() {
        // Calculate Spring Forces
        for (let spring of this.springs) {
            const dx = spring.n2.x - spring.n1.x;
            const dy = spring.n2.y - spring.n1.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist === 0) continue;

            const force = (dist - spring.restLength) * this.k;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!spring.n1.fixed) {
                spring.n1.fx += fx;
                spring.n1.fy += fy;
            }
            if (!spring.n2.fixed) {
                spring.n2.fx -= fx;
                spring.n2.fy -= fy;
            }
        }

        // Euler Integration to move nodes
        for (let node of this.nodes) {
            if (node.fixed) continue;

            // Apply damping
            node.fx -= node.vx * this.damp;
            node.fy -= node.vy * this.damp;

            // Update velocity and position (assuming mass = 1)
            node.vx += node.fx;
            node.vy += node.fy;
            node.x += node.vx;
            node.y += node.vy;

            // Reset forces for next step
            node.fx = 0;
            node.fy = 0;
        }
    }

    // Rasterize the deformed structure back into the LBM fluid grid
    updateFluidGeometry(geometryArray) {
        geometryArray.fill(0); // Clear old geometry
        for (let node of this.nodes) {
            const gx = Math.floor(node.x);
            const gy = Math.floor(node.y);
            if (gx >= 0 && gx < this.w && gy >= 0 && gy < this.h) {
                geometryArray[gy * this.w + gx] = 1;
            }
        }
    }
}
