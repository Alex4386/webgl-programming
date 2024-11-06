precision mediump float;

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;
uniform float shininess;

varying vec3 N, L, E;
varying float s, t;

uniform sampler2D texture;

void main() {
  vec4 fColor;
  vec3 H = normalize(L + E);
  vec4 ambient = ambientProduct;

  float Cd = max(dot(L, N), 0.0);
  vec4 diffuse = Cd * diffuseProduct;

  float Cs = pow(max(dot(N, H), 0.0), shininess);
  vec4 specular = Cs * specularProduct;

  if (dot(L, N) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
  }

  fColor = ambient + diffuse + specular;
  fColor.a = 1.0;

  vec4 texColor = texture2D(texture, vec2(s, t));

  gl_FragColor = fColor * 0.5 + texColor * 0.5;
}