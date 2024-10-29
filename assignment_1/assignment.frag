precision mediump float;

varying float fColorType;
varying vec4 fFlatColor;
varying vec4 fUpColor;
varying vec4 fDownColor;

varying float colorGradient;


void main() {
  if (fColorType == 0.0) {
    gl_FragColor = fFlatColor;
  } else if (fColorType == 1.0) {
    vec4 diff = fDownColor - fUpColor;
    vec4 colorDiff = diff * colorGradient;

    vec4 color = fUpColor + colorDiff;
    gl_FragColor = color;
  }
}