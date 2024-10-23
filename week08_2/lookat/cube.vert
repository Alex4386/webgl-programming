attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor; // vColor passed to fragment shader

uniform mat4 modelViewMatrix;

void main() {
  fColor = vColor;
  gl_Position = modelViewMatrix * vPosition;
}