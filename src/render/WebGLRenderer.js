export class WebGLRenderer {
    constructor(canvas, width, height) {
        this.gl = canvas.getContext('webgl2');
        this.w = width;
        this.h = height;
    }

    async init() {
    try {
        const vsResponse = await fetch('./src/shaders/fluid.vert');
        const fsResponse = await fetch('./src/shaders/fluid.frag');
        
        if (!vsResponse.ok || !fsResponse.ok) throw new Error("Shader file not found!");
        
        const vsSource = await vsResponse.text();
        const fsSource = await fsResponse.text();
        
        this.program = this.createProgram(vsSource, fsSource);
        this.initBuffers();
        this.initTextures();
    } catch (err) {
        console.error("WebGL Initialization failed:", err);
    }
}

    createProgram(vs, fs) {
    const gl = this.gl;
    const compileShader = (source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };

    const vertexShader = compileShader(vs, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fs, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program Link Error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

    initBuffers() {
        const gl = this.gl;
        const vertices = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(this.program, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    initTextures() {
        const gl = this.gl;
        this.velocityTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.velocityTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, this.w, this.h, 0, gl.RG, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.geometryTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.geometryTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

    render(uxArray, uyArray, geometryArray) {
    const gl = this.gl;
    const velocityData = new Float32Array(this.w * this.h * 2);
    
    for(let i=0; i < this.w * this.h; i++) {
        // FORCE DATA: Let's create a test flow going to the right
        velocityData[i*2] = 0.5; // Constant horizontal flow
        velocityData[i*2+1] = 0.0; 
    }

        gl.useProgram(this.program);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.velocityTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.w, this.h, gl.RG, gl.FLOAT, velocityData);
        gl.uniform1i(gl.getUniformLocation(this.program, "uVelocityTex"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.geometryTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this.w, this.h, 0, gl.RED, gl.FLOAT, new Float32Array(geometryArray));
        gl.uniform1i(gl.getUniformLocation(this.program, "uGeometryTex"), 1);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
