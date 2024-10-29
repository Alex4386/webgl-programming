attribute vec4 vPosition;

uniform float paintType;
uniform vec4 flatColor;
uniform vec4 upColor;
uniform vec4 downColor;

uniform vec4 scale;
uniform vec4 translate;

varying float fColorType;
varying vec4 fFlatColor;
varying vec4 fUpColor;
varying vec4 fDownColor;

varying float colorGradient;

void main() {
  fColorType = paintType;
  fFlatColor = flatColor;
  fUpColor = upColor;
  fDownColor = downColor;

  // vPosition.y ranges -.5 ~ .5
  colorGradient = -max(-0.5, min(0.5, vPosition.y)) + 0.5;

  gl_Position = vec4(vPosition.x * scale.x + translate.x, vPosition.y * scale.y + translate.y, vPosition.z * scale.z + translate.z, 1);
}