export const ColorMaps = {
    viridis: (t) => {
        const c0 = [68, 1, 84];
        const c1 = [33, 145, 140];
        const c2 = [253, 231, 37];
        
        let r, g, b;
        if (t < 0.5) {
            const f = t * 2.0;
            r = c0[0] + (c1[0] - c0[0]) * f;
            g = c0[1] + (c1[1] - c0[1]) * f;
            b = c0[2] + (c1[2] - c0[2]) * f;
        } else {
            const f = (t - 0.5) * 2.0;
            r = c1[0] + (c2[0] - c1[0]) * f;
            g = c1[1] + (c2[1] - c1[1]) * f;
            b = c1[2] + (c2[2] - c1[2]) * f;
        }
        return [Math.floor(r), Math.floor(g), Math.floor(b)];
    }
};
