precision mediump float;

varying vec4 fColor;

void main() {
  gl_FragColor = fColor;
  gl_FragColor.r = 1.0; // gl_FragColor[0] = 1.0;
  gl_FragColor.g = 1.0; // gl_FragColor[1] = 1.0;
  gl_FragColor.rgb = gl_FragColor.gbr;
}