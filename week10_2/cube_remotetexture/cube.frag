precision mediump float;

varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D texture;

void main() {
  gl_FragColor = texture2D(texture, fTexCoord);
}