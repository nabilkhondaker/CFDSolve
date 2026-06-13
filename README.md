# Computational Fluid Dynamics (CFD) Mini-Solver

A high-performance **Lattice Boltzmann Method (LBM)** fluid dynamics solver built for the web. This project simulates real-time fluid-structure interaction (FSI), allowing you to observe how fluid flows around and interacts with flexible boundaries, all rendered in the browser.

## 🚀 Project Status: Work in Progress
This simulator is an ongoing research project exploring computational fluid dynamics (CFD) in a web environment. 

---

### Current Capabilities
* **Core Engine:** Implementation of the D2Q9 lattice model for fluid simulation.
* **FSI (Fluid-Structure Interaction):** Supports flexible beam dynamics coupled with fluid flow.
* **GPU Acceleration:** Uses WebGL 2.0 and GLSL shaders to map velocity fields to visual color maps in real-time.
* **Concurrency:** Heavy physics computations are offloaded to Web Workers to keep the UI responsive.

## 📁 Structure
```
CFDSOLVE/
├── index.html
├── LICENSE
├── src/
│   ├── core/
│   │   ├── BoundaryConditions.js
│   │   ├── FDM.js
│   │   └── LBM.js
│   ├── fsi/
│   │   └── NativeStructure.js
│   ├── render/
│   │   ├── CanvasRenderer.js
│   │   └── WebGLRenderer.js
│   ├── shaders/
│   │   ├── fluid.frag
│   │   └── fluid.vert
│   ├── styles/
│   │   └── glassmorphism.css
│   ├── utils/
│   │   ├── ColorMaps.js
│   │   └── MathUtils.js
│   └── main.js
└── workers/
    └── simulationWorker.js
```
## 🛠 Tech Stack
* **Language:** Vanilla JavaScript (ES6+), GLSL (for shaders).
* **Physics:** Lattice Boltzmann Method (LBM) using custom CPU-bound solvers.
* **Rendering:** WebGL 2.0 API.
* **Architecture:** Multi-threaded communication via Web Workers, asynchronous resource management.

## ⚙️ How It Works
The engine follows a cyclic four-step physics loop:
1. **Force Application:** The fluid exerts pressure/drag on the embedded structure.
2. **Structure Integration:** The structure calculates its deformation and updates its nodal positions.
3. **Boundary Update:** The updated structure geometry is synced back into the fluid grid.
4. **Fluid Step:** The LBM solver runs the collision and streaming steps around the new obstacle geometry.



## 📋 Roadmap
- [ ] **Optimization:** Implement WebAssembly (WASM) for the LBM core to push performance closer to C++.
- [ ] **Boundary Conditions:** Refine bounce-back schemes for higher-fidelity obstacles.
- [ ] **Visuals:** Add pressure-field rendering and vector field overlays.
- [ ] **UI:** Enhance the control panel with preset scenarios (e.g., vortex shedding, airfoil analysis).

## 👤 Author
**Nabil Khondaker**

---
*Built as an experimental high-performance CFD mini-solver. Contributions and feedback are welcome as this project evolves.*
