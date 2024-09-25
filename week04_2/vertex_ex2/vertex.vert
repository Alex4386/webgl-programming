attribute vec2 vPosition;
uniform vec2 vResolution;

void main() {
  vec2 normalizedPosition = vPosition / vResolution;
  vec2 clipSpacePosition = (normalizedPosition * 2.0) - 1.0;
  gl_Position = vec4(clipSpacePosition * vec2(1,-1), 0.0, 1.0);
}