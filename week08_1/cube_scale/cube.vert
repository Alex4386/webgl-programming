attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor; // vColor passed to fragment shader

uniform vec3 theta;
uniform float time;

void main() {
  vec3 angles = radians(theta);
  vec3 c = cos(angles);
  vec3 s = sin(angles);

  mat4 rotationX = mat4(
    1, 0, 0, 0,        // x axis doesn't change - due to x rotation.
    0, c.x, -s.x, 0,   // y = y * cos(theta) - z * sin(theta)
    0, s.x, c.x, 0,    // z = y * sin(theta) + z * cos(theta)
    0, 0, 0, 1
  );

  mat4 rotationY = mat4(
    c.y, 0, s.y, 0,    // x = x * cos(theta) + z * sin(theta)
    0, 1, 0, 0,        // y axis doesn't change - due to y rotation.
    -s.y, 0, c.y, 0,   // z = -x * sin(theta) + z * cos(theta)
    0, 0, 0, 1
  );

  mat4 rotationZ = mat4(
    c.z, -s.z, 0, 0,   // x = x * cos(theta) - y * sin(theta)
    s.z, c.z, 0, 0,    // y = x * sin(theta) + y * cos(theta)
    0, 0, 1, 0,        // z axis doesn't change - due to z rotation.
    0, 0, 0, 1
  );

  fColor = vColor;
  gl_Position = (1.0 + (0.5 * sin(time))) * rotationX * rotationY * rotationZ * vPosition;
  gl_Position.w = 1.0;
}