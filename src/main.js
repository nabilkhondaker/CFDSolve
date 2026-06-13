import { WebGLRenderer } from './render/WebGLRenderer.js';
import { CanvasRenderer } from './render/CanvasRenderer.js';
import { NativeStructure } from './fsi/NativeStructure.js';

const canvas = document.getElementById('cfdCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scale = 4;
const width = Math.floor(canvas.width / scale);
const height = Math.floor(canvas.height / scale);

let renderer;
let geometry;
const worker = new Worker('workers/simulationWorker.js', { type: 'module' });

// Try WebGL, fallback to Canvas
try {
    renderer = new WebGLRenderer(canvas, width, height);
    renderer.init().then(() => startSimulation());
} catch (e) {
    console.warn("WebGL failed, falling back to 2D Canvas");
    renderer = new CanvasRenderer(canvas, width, height);
    startSimulation();
}

function startSimulation() {
    worker.postMessage({
        type: 'INIT',
        data: { width, height, viscosity: 0.02 }
    });
}

worker.onmessage = function(e) {
    if (e.data.type === 'READY') {
        geometry = e.data.geometry;
        requestAnimationFrame(loop);
    }
    
    if (e.data.type === 'STATE') {
        renderer.render(e.data.ux, e.data.uy, geometry);
        requestAnimationFrame(loop);
    }
};

function loop() {
    worker.postMessage({ type: 'STEP', data: { steps: 5 } });
}

document.getElementById('viscosity').addEventListener('input', (e) => {
    console.log("Viscosity Confirm"); // See if this logs when you move the slider
    const val = parseFloat(e.target.value);
    worker.postMessage({ type: 'UPDATE_PARAMS', data: { viscosity: val } });
});
