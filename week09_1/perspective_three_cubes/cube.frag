#ifdef GL_ES
precision highp float;
#else
precision mediump float;
#endif

varying vec4 fColor;

void main() {
  gl_FragColor = fColor;
}
