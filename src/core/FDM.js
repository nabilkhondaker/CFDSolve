export class FDMSolver {
    constructor(width, height, viscosity) {
        this.w = width;
        this.h = height;
        this.nu = viscosity;
        console.warn("FDM initialized: Note LBM is the primary solver for this architecture.");
    }
    step() {
        // Stub for classic Navier-Stokes finite difference
    }
}
