attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec4 fColor;

uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform mat4 modelViewMatrix, projectionMatrix;
uniform vec4 lightPosition;
uniform float shininess;

void main() {
  vec3 pos = (modelViewMatrix * vPosition).xyz;
  vec3 L;

  if (lightPosition.w == 0.0) {
    L = normalize((modelViewMatrix * lightPosition).xyz);
  } else {
    L = normalize((modelViewMatrix * lightPosition).xyz - pos);
  }

  vec3 E = normalize(pos);
  vec3 H = normalize(L + E);
  vec3 N = normalize((modelViewMatrix * vNormal).xyz);
  vec4 ambient = ambientProduct;
  
  float Kd = max(dot(L, N), 0.0);
  vec4 diffuse = Kd * diffuseProduct;

  float Ks = pow(max(dot(N, H), 0.0), shininess);
  vec4 specular = Ks * specularProduct;

  if (dot(L, N) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
  }

  gl_Position = projectionMatrix * modelViewMatrix * vPosition;
  fColor = ambient + diffuse + specular;
  fColor.a = 1.0;
}
