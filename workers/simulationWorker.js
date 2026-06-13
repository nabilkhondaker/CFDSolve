import { LBM } from '../src/core/LBM.js';
import { NativeStructure } from '../src/fsi/NativeStructure.js';

let solver = null;
let structure = null;

self.onmessage = function(e) {
    const { type, data } = e.data;

    if (type === 'INIT') {
        solver = new LBM(data.width, data.height, data.viscosity);
        
        // Initialize our native FSI beam instead of a static airfoil
        structure = new NativeStructure(data.width, data.height);
        // Create a vertical beam in the center, 4 pixels wide, 40 pixels high
        structure.buildFlexibleBeam(data.width / 4, data.height / 2, 4, 40);
        
        structure.updateFluidGeometry(solver.geometry);
        self.postMessage({ type: 'READY', geometry: solver.geometry });
    }

    if (type === 'STEP' && solver) {
        for (let i = 0; i < data.steps; i++) {
            // 1. Fluid pushes on structure
            structure.applyFluidForces(solver.ux, solver.uy);
            // 2. Structure bends and moves
            structure.step();
            // 3. New structure shape updates fluid boundary
            structure.updateFluidGeometry(solver.geometry);
            // 4. Fluid simulates around new boundary
            solver.step();
        }
        
        console.log("Worker step complete, sending state.");

        self.postMessage({
            type: 'STATE',
            ux: solver.ux,
            uy: solver.uy,
            geometry: solver.geometry // Send updated geometry back for rendering
        });
    }
};
