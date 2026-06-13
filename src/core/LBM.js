import { BoundaryConditions } from './BoundaryConditions.js';

export class LBM {
    constructor(width, height, viscosity) {
        this.w = width;
        this.h = height;
        this.n = width * height;
        this.setViscosity(viscosity);
        
        this.w_i = [4/9, 1/9, 1/9, 1/9, 1/9, 1/36, 1/36, 1/36, 1/36];
        this.cx = [0, 1, 0, -1, 0, 1, -1, -1, 1];
        this.cy = [0, 0, 1, 0, -1, 1, 1, -1, -1];
        this.opposite = [0, 3, 4, 1, 2, 7, 8, 5, 6];
        
        this.f = new Float32Array(this.n * 9);
        this.f_next = new Float32Array(this.n * 9);
        this.rho = new Float32Array(this.n);
        this.ux = new Float32Array(this.n);
        this.uy = new Float32Array(this.n);
        this.geometry = new Uint8Array(this.n);
        
        this.initFlow();
    }

    setViscosity(viscosity) {
        this.omega = 1.0 / (3.0 * viscosity + 0.5);
    }

    initFlow() {
        const u0 = 0.1;
        for (let i = 0; i < this.n; i++) {
            this.rho[i] = 1.0;
            this.ux[i] = u0;
            this.uy[i] = 0.0;
            for (let d = 0; d < 9; d++) {
                this.f[i * 9 + d] = this.equilibrium(d, 1.0, u0, 0.0);
            }
        }
    }

    equilibrium(i, rho, u, v) {
        const cu = 3.0 * (this.cx[i] * u + this.cy[i] * v);
        const u2 = u * u + v * v;
        return this.w_i[i] * rho * (1.0 + cu + 0.5 * cu * cu - 1.5 * u2);
    }

    step() {
        // Collision
        for (let i = 0; i < this.n; i++) {
            if (this.geometry[i] === 1) continue;

            let r = 0, u = 0, v = 0;
            for (let d = 0; d < 9; d++) {
                const fd = this.f[i * 9 + d];
                r += fd;
                u += fd * this.cx[d];
                v += fd * this.cy[d];
            }
            u /= r; v /= r;
            this.rho[i] = r; this.ux[i] = u; this.uy[i] = v;

            for (let d = 0; d < 9; d++) {
                const feq = this.equilibrium(d, r, u, v);
                this.f[i * 9 + d] += this.omega * (feq - this.f[i * 9 + d]);
            }
        }

        // Apply Boundaries
        BoundaryConditions.applyVelocityInlet(this, 0.1);
        BoundaryConditions.applyOpenOutlet(this);

        // Streaming
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                const idx = y * this.w + x;
                for (let d = 0; d < 9; d++) {
                    let nx = x + this.cx[d];
                    let ny = y + this.cy[d];
                    
                    if (nx < 0) nx = this.w - 1; else if (nx >= this.w) nx = 0;
                    if (ny < 0) ny = this.h - 1; else if (ny >= this.h) ny = 0;
                    
                    const nextIdx = ny * this.w + nx;
                    
                    if (this.geometry[nextIdx] === 1) {
                        this.f_next[idx * 9 + this.opposite[d]] = this.f[idx * 9 + d];
                    } else {
                        this.f_next[nextIdx * 9 + d] = this.f[idx * 9 + d];
                    }
                }
            }
        }

        let temp = this.f;
        this.f = this.f_next;
        this.f_next = temp;
    }
}
