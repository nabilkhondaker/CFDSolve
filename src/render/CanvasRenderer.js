export class CanvasRenderer {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = width;
        this.h = height;
        this.imgData = this.ctx.createImageData(this.w, this.h);
    }

    render(ux, uy, geometry) {
        for (let i = 0; i < this.w * this.h; i++) {
            if (geometry[i] === 1) {
                this.imgData.data[i*4] = 30;
                this.imgData.data[i*4+1] = 30;
                this.imgData.data[i*4+2] = 40;
                this.imgData.data[i*4+3] = 255;
                continue;
            }
            const speed = Math.sqrt(ux[i]*ux[i] + uy[i]*uy[i]);
            const intensity = Math.min(speed * 3.0, 1.0);
            
            this.imgData.data[i*4] = Math.floor(intensity * 50);
            this.imgData.data[i*4+1] = Math.floor(intensity * 150);
            this.imgData.data[i*4+2] = Math.floor(intensity * 255);
            this.imgData.data[i*4+3] = 255;
        }
        this.ctx.putImageData(this.imgData, 0, 0);
    }
}
