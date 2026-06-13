export class MathUtils {
    static computeVorticity(w, h, ux, uy, vorticityArray) {
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                const du_dy = (ux[idx + w] - ux[idx - w]) * 0.5;
                const dv_dx = (uy[idx + 1] - uy[idx - 1]) * 0.5;
                vorticityArray[idx] = dv_dx - du_dy;
            }
        }
    }
}
