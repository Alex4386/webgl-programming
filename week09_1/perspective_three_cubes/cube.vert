attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor; // vColor passed to fragment shader

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  mat4 sxyz = mat4(
    .5, 0, 0, 0,
    0, .5, 0, 0,
    0, 0, .5, 0,
    0, 0, 0, 1
  ); // scale by .5

  gl_Position = sxyz * projectionMatrix * modelViewMatrix * vPosition;
  fColor = vColor;
}
