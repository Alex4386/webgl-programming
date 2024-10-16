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
  [verticies, colors] = calculateVerticies();

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 4, gl.FLOAT);

  const vColor = gl.getAttribLocation(program, 'vColor');
  setArrayBuffer(gl, new Float32Array(colors.flat()), vColor, 4, gl.FLOAT);

  globalGL = gl;
  gl.enable(gl.DEPTH_TEST);
  render();
}

let verticiesCache = [];
function calculateVerticies() {
  if (verticiesCache.length) return verticiesCache;

  const verticies = [];
  const colors = [];

  [
    [1,0,3,2],
    [2,3,7,6],
    [3,0,4,7],
    [6,5,1,2],
    [4,5,6,7],
    [5,4,0,1],
  ].map(a => {
    const [sideVerticies, sideColors] = drawSide(...a);
    verticies.push(...sideVerticies);
    colors.push(...sideColors);
  });

  verticiesCache = [verticies, colors];
  return verticiesCache;
}

const theta = [0, 0, 0];
let axis = 0;
let thetaLoc;
function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  theta[axis] += 2.0;
  if (thetaLoc === undefined) {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    thetaLoc = gl.getUniformLocation(program, 'theta');
  }

  gl.uniform3fv(thetaLoc, theta);

  [verticies, _] = calculateVerticies();
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);

  requestAnimationFrame(render);
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
