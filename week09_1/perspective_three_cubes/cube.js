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

let radius = 4.0;
let theta = 0.0;
let phi = 0.0;
let dr = 5.0 * Math.PI / 180.0;

let matrixLoc;
let projLoc;

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
  const [verticies, colors] = calculateVerticies();

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 4, gl.FLOAT);

  const vColor = gl.getAttribLocation(program, 'vColor');
  setArrayBuffer(gl, new Float32Array(colors.flat()), vColor, 4, gl.FLOAT);

  globalGL = gl;
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  render();
}

let verticiesCache = [];
function calculateVerticies() {
  if (verticiesCache.length) return verticiesCache;

  const verticies = [];
  const colors = [];

  const cubeBase = [
    [1,0,3,2],
    [2,3,7,6],
    [3,0,4,7],
    [6,5,1,2],
    [4,5,6,7],
    [5,4,0,1],
  ]

  cubeBase.map(a => {
    const [sideVerticies, sideColors] = drawSide(...a);
    verticies.push(...sideVerticies);
    colors.push(...sideColors);
  });

  cubeBase.map(n => n.map(o => o + 8)).map(a => {
    const [sideVerticies, sideColors] = drawSide(...a);
    verticies.push(...sideVerticies);
    colors.push(...sideColors);
  });

  cubeBase.map(n => n.map(o => o + 16)).map(a => {
    const [sideVerticies, sideColors] = drawSide(...a);
    verticies.push(...sideVerticies);
    colors.push(...sideColors);
  });


  verticiesCache = [verticies, colors];
  return verticiesCache;
}

let fovy = 45.0, aspect = 1.0, near = .3, far = 3.0;

function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!matrixLoc || !projLoc) {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    
    if (!matrixLoc) {
      matrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
    }
  
    if (!projLoc) {
      projLoc = gl.getUniformLocation(program, 'projectionMatrix');
    }
  }

  // change to Radians
  const thetaRad = theta * Math.PI / 180;
  const phiRad = phi * Math.PI / 180;

  const eye = [
    radius * Math.cos(thetaRad) * Math.sin(phiRad),
    radius * Math.sin(thetaRad),
    radius * Math.cos(thetaRad) * Math.cos(phiRad),
  ] // eye point

  const matrix = lookAt(eye, [0,0,0], [0,1,0]);
  const projectionMatrix = perspective(fovy, aspect, near, far);

  // console.log(matrix);
  gl.uniformMatrix4fv(matrixLoc, false, flatten(matrix));
  gl.uniformMatrix4fv(projLoc, false, flatten(projectionMatrix));

  [verticies, _] = calculateVerticies();
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);

  requestAnimationFrame(render); // prevent automatic re-render
}

function drawSide(pointA, pointB, pointC, pointD) {
  let verticies = [
    [-.5, -.5, .5, 1],
    [-.5, .5, .5, 1],
    [.5, .5, .5, 1],
    [.5, -.5, .5, 1],
    [-.5, -.5, -.5, 1],
    [-.5, .5, -.5, 1],
    [.5, .5, -.5, 1],
    [.5, -.5, -.5, 1],
  ];

  const rawVerticies = verticies;
  verticies = verticies.concat(rawVerticies.map(a => [a[0], a[1] - 1, a[2], a[3]]));
  verticies = verticies.concat(rawVerticies.map(a => [a[0] + 1, a[1], a[2], a[3]]));

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
  const color = sidePoints.map(_ => colors[pointA % 8]);

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

function setValue(name, value) {
  switch (name) {
    case "zNear":
      near = value;
      break;
    case "zFar":
      far = value;
      break;
    case "radius":
      radius = value;
      break;
    case "theta":
      theta = value;
      break;
    case "phi":
      phi = value;
      break;
    case "fovy":
      fovy = value;
      break;
    case "aspect":
      aspect = value;
      break;
  }
}
