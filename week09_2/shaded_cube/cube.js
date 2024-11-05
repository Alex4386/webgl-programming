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

async function setup(
  /** @type {WebGLRenderingContext} */
  gl,
) {
  /* === SHADERS === */
  const program = gl.createProgram(); // Setup program
  
  // load shader
  const [vertexShader, fragmentShader] = await Promise.all([
    shaderLoader(gl, 'cube.vert'),
    shaderLoader(gl, 'cube.frag')
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

  /* DATA */
  const [verticies, normals, colors] = calculateVerticies();

  const vNormal = gl.getAttribLocation(program, 'vNormal');
  setArrayBuffer(gl, new Float32Array(normals.flat()), vNormal, 3, gl.FLOAT);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 4, gl.FLOAT);

  const projection = ortho(-1, 1, -1, 1, -100, 100);
  const ambientProduct = mult(lightAmbient, materialAmbient);
  const diffuseProduct = mult(lightDiffuse, materialDiffuse);
  const specularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), ambientProduct);
  gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), diffuseProduct);
  gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), specularProduct);
  gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), lightPos);

  gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, projection.flat());

  globalGL = gl;
  render();
}

let verticiesCache = [];
const lightPos = [1,1,1,0];
const lightAmbient = [0.2,0.2,0.2,1];
const lightDiffuse = [1,1,1,1];
const lightSpecular = [1,1,1,1];

const materialAmbient = [1,0,1,1]; // gray
const materialDiffuse = [1,.8,0,1]; // yellow
const materialSpecular = [1,1,1,1]; // white
const materialShininess = 100.0;

function calculateVerticies() {
  if (verticiesCache.length) return verticiesCache;

  const verticies = [];
  const normals = [];
  const colors = [];

  [
    [1,0,3,2],
    [2,3,7,6],
    [3,0,4,7],
    [6,5,1,2],
    [4,5,6,7],
    [5,4,0,1],
  ].map(a => {
    const [sideVerticies, sideNormals, sideColors] = drawSide(...a);
    verticies.push(...sideVerticies);
    normals.push(...sideNormals);
    colors.push(...sideColors);
  });

  verticiesCache = [verticies, normals, colors];
  return verticiesCache;
}

const theta = [0, 0, 0];
let axis = 0;
let thetaLoc;

let rotating = true;
function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  const program = gl.getParameter(gl.CURRENT_PROGRAM);
  if (rotating) theta[axis] += 2.0;

  let modelView = mat4();

  modelView = mult(modelView, rotate(theta[0], [1,0,0]));
  modelView = mult(modelView, rotate(theta[1], [0,1,0]));
  modelView = mult(modelView, rotate(theta[2], [0,0,1]));

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, 'modelViewMatrix'),
    false,
    modelView.flat(),
  );

  [verticies, _, _] = calculateVerticies();
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);

  // requestAnimationFrame(render);
}

function setAxis(a) {
  axis = a;
  render();
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

  const normals = sidePoints.map(_ => calculateNomral(verticies[pointB], verticies[pointA], verticies[pointC]))
  const color = sidePoints.map(_ => colors[pointA]);

  return [sidePoints, normals, color];
}
function calculateNomral(a, b, c) {
  const u = subtract(b, a);
  const v = subtract(c, a);

  return cross(u,v);
}

function toggleRotate() {
  rotating = !rotating;
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
