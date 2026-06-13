export class BoundaryConditions {
    static applyVelocityInlet(solver, u0) {
        for (let y = 0; y < solver.h; y++) {
            const idx = y * solver.w;
            const f = solver.f;
            
            const r = f[idx*9+0] + f[idx*9+2] + f[idx*9+4] + 2.0 * (f[idx*9+3] + f[idx*9+6] + f[idx*9+7]);
            const rho = r / (1.0 - u0);

            f[idx*9+1] = f[idx*9+3] + (2.0/3.0) * rho * u0;
            f[idx*9+5] = f[idx*9+7] - 0.5 * (f[idx*9+2] - f[idx*9+4]) + (1.0/6.0) * rho * u0;
            f[idx*9+8] = f[idx*9+6] + 0.5 * (f[idx*9+2] - f[idx*9+4]) + (1.0/6.0) * rho * u0;
        }
    }

    static applyOpenOutlet(solver) {
        for (let y = 0; y < solver.h; y++) {
            const idx_out = y * solver.w + (solver.w - 1);
            const idx_in = y * solver.w + (solver.w - 2);
            for (let i = 0; i < 9; i++) {
                solver.f[idx_out * 9 + i] = solver.f[idx_in * 9 + i];
            }
        }
    }
}
