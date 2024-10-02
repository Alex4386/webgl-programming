attribute vec3 vPosition;
uniform float theta;

void main() {
  float s = sin(theta);
  float c = cos(theta);

  gl_Position.x = c * vPosition.x - s * vPosition.y;
  gl_Position.y = s * vPosition.x + c * vPosition.y;
  gl_Position.z = 0.0;
  gl_Position.w = 1.0;
}
