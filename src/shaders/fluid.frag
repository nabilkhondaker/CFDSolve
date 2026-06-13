#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    // This will paint a gradient based on position.
    // If you see a gradient from left to right, 
    // your vTexCoord pass-through is working perfectly!
    fragColor = vec4(vTexCoord.x, vTexCoord.y, 0.5, 1.0);
}
