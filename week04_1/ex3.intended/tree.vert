attribute vec4 vPosition;

// uniform
uniform vec4 uOffset;

void main() {
  gl_Position = vPosition + uOffset;
}