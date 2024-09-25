attribute vec2 vPosition;
uniform vec4 vColor;
uniform vec2 vResolution;

varying vec4 fColor;

void main() {
  fColor = vColor;

  vec2 normalizedPosition = vPosition / vResolution;
  vec2 clipSpacePosition = (normalizedPosition * 2.0) - 1.0;
  gl_Position = vec4(clipSpacePosition, 0.0, 1.0);
}