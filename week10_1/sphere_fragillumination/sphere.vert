attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec3 N, L, E;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 lightPosition;

void main() {
  vec3 pos = (modelViewMatrix * vPosition).xyz;

  if (lightPosition.w == 0.0) {
    L = normalize((modelViewMatrix * lightPosition).xyz);
  } else {
    L = normalize((modelViewMatrix * lightPosition).xyz - pos);
  }

  E = normalize(-pos);
  N = normalize((modelViewMatrix * vNormal).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}
