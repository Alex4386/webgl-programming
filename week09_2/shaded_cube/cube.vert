attribute vec4 vPosition;
attribute vec3 vNormal;
varying vec4 fColor; // vColor passed to fragment shader

uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform mat4 modelViewMatrix, projectionMatrix;
uniform vec4 lightPosition;
uniform float shininess;

void main() {
  vec3 pos = (modelViewMatrix * vPosition).xyz;

  vec3 light = lightPosition.xyz;
  vec3 L = normalize(light - pos);
  vec3 E = normalize(-pos);
  vec3 H = normalize(L + E);
  vec4 NN = vec4(vNormal, 0.0);

  vec3 N = normalize((modelViewMatrix * NN).xyz);

  float Cd = max(dot(L,N), 0.0);
  vec4 diffuse = Cd * diffuseProduct;

  float Cs = pow(max(dot(N, H), 0.0), shininess);
  vec4 specular = Cs * specularProduct;

  if (dot(L,N) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
  }

  vec4 ambient = ambientProduct;
  gl_Position = projectionMatrix * modelViewMatrix * vPosition;

  fColor = ambient + diffuse + specular;
  fColor.a = 1.0;
}