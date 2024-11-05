window.addEventListener('load', () => {
  const canvas = document.getElementById('gl-canvas');
  if (!canvas) throw new Error('Canvas not found.');

  // trying not to use the helper code!!!
  gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported.');

  setupCanvas(canvas, gl);
});

async function setupCanvas(
  /** @type {HTMLCanvasElement} */
  canvas,
  /** @type {WebGLRenderingContext} */
  gl,
) {
  // Setup viewport
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0,0,0,1);

  setup(gl);
}

/** @type {WebGLRenderingContext} */
let globalGL;

let radius = 1.0;
let theta = 0.0;
let phi = 0.0;
let dr = 5.0 * Math.PI / 180.0;

let modelViewMatrix;
let projectionMatrix;

const lightPosition = vec4(10.0, 10.0, 10.0, 0.0);
const lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

const materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
const materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
const materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
const materialShininess = 2.0;


async function setup(
  /** @type {WebGLRenderingContext} */
  gl,
) {
  /* === SHADERS === */
  const program = gl.createProgram(); // Setup program
  
  // load shader
  const [vertexShader, fragmentShader] = await Promise.all([
    shaderLoader(gl, 'sphere.vert'),
    shaderLoader(gl, 'sphere.frag')
  ]);

  // attach shader
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link/use program
  gl.linkProgram(program);
  if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
    var info = gl.getProgramInfoLog(program);
    throw new Error('Could not compile WebGL program. \n\n' + info);
  }

  gl.useProgram(program);
  
  globalGL = gl;
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);

  const ambientProduct = mult(lightAmbient, materialAmbient);
  const diffuseProduct = mult(lightDiffuse, materialDiffuse);
  const specularProduct = mult(lightSpecular, materialSpecular);

  const [verticies, normal] = calculateVerticies();

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 4, gl.FLOAT);

  const vNormal = gl.getAttribLocation(program, 'vNormal');
  setArrayBuffer(gl, new Float32Array(normal.flat()), vNormal, 4, gl.FLOAT);

  gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), flatten(specularProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), flatten(lightPosition));
  gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess);
  
  render();
}

let verticiesCache = [];

function triangle(a, b, c) {
  const pointsArray = [];
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);

  const normalArray = [];
  normalArray.push([a[0], a[1], a[2], 0.0]);
  normalArray.push([b[0], b[1], b[2], 0.0]);
  normalArray.push([c[0], c[1], c[2], 0.0]);

  return [pointsArray, normalArray];
}

function divideTriangle(a, b, c, count) {
  if (count > 0) {
    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    const pointsArray = [];
    const normalArray = [];

    let [p, n] = divideTriangle(a, ab, ac, count - 1);
    pointsArray.push(...p);
    normalArray.push(...n);

    [p, n] = divideTriangle(ab, b, bc, count - 1);
    pointsArray.push(...p);
    normalArray.push(...n);

    [p, n] = divideTriangle(bc, c, ac, count - 1);
    pointsArray.push(...p);
    normalArray.push(...n);

    [p, n] = divideTriangle(ab, bc, ac, count - 1);
    pointsArray.push(...p);
    normalArray.push(...n);

    return [pointsArray, normalArray];
  } else {
    return triangle(a, b, c);
  }
}

function tetrahedron(a, b, c, d, n) {
  const [points, normal] = divideTriangle(a, b, c, n);
  let [p, no] = divideTriangle(a, c, d, n);
  points.push(...p);
  normal.push(...no);

  [p, no] = divideTriangle(a, d, b, n);
  points.push(...p);
  normal.push(...no);

  [p, no] = divideTriangle(b, d, c, n);
  points.push(...p);
  normal.push(...no);

  return [points, normal];
}

const left = -3, right = 3, ytop = 3, bottom = -3, near = -10, far = 10;

function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!modelViewMatrix) {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');
  }

  if (!projectionMatrix) {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    projectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');
  }

  const eye = [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.sin(theta),
    radius * Math.cos(theta) * Math.cos(phi),
  ] // eye point

  const matrix = lookAt(eye, [0,0,0], [0,1,0]);
  // console.log(matrix);
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(matrix));

  const projMatrix = ortho(left, right, bottom, ytop, near, far);
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(projMatrix));
 
  [verticies, _] = calculateVerticies();
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);

  requestAnimationFrame(render); // prevent automatic re-render
}

function calculateVerticies() {
  return tetrahedron(
    [0, 0, -1, 1],
    [0, 0.942809, 0.333333, 1],
    [-0.816497, -0.471405, 0.333333, 1],
    [0.816497, -0.471405, 0.333333, 1],
    4
  );
}

function setAxis(a) {
  axis = a;
}

function drawSide(pointA, pointB, pointC, pointD) {
  const verticies = [
    [-.5, -.5, .5, 1],
    [-.5, .5, .5, 1],
    [.5, .5, .5, 1],
    [.5, -.5, .5, 1],
    [-.5, -.5, -.5, 1],
    [-.5, .5, -.5, 1],
    [.5, .5, -.5, 1],
    [.5, -.5, -.5, 1],
  ];

  const colors = [
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
  ];

  const sidePoints = [
    verticies[pointA],
    verticies[pointB],
    verticies[pointC], // first triangle
    verticies[pointA],
    verticies[pointC],
    verticies[pointD], // second triangle
  ];
  const color = sidePoints.map(_ => colors[pointA]);

  return [sidePoints, color];
}

function setArrayBuffer(
  /** @type {WebGLRenderingContext} */
  gl,
  data,
  ptr,
  size,
  type,) {
  const bufId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  gl.vertexAttribPointer(ptr, size, type, false, 0, 0);
  gl.enableVertexAttribArray(ptr);

  return location;
}

function radiusIncrease() {
  radius += dr;
}

function radiusDecrease() {
  radius -= dr;
}

function thetaIncrease() {
  theta += dr;

}

function thetaDecrease() {
  theta -= dr;
}

function phiIncrease() {
  phi += dr;
}

function phiDecrease() {
  phi -= dr;
}
