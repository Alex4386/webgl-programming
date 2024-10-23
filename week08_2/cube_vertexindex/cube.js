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
  const verticies = [
    [-.5, -.5, .5], // index: 0
    [-.5, .5, .5],
    [.5, .5, .5],
    [.5, -.5, .5],
    [-.5, -.5, -.5],
    [-.5, .5, -.5],
    [.5, .5, -.5],
    [.5, -.5, -.5],
  ]

  const colors = [
    [0,0,0,1],
    [1,0,0,1],
    [1,1,0,1],
    [0,1,0,1],
    [0,0,1,1],
    [1,0,1,1],
    [0,1,1,1],
    [1,1,1,1],
  ]

  const indeces = [
    [1, 0, 3],
    [3, 2, 1],
    [2, 3, 7],
    [7, 6, 2],
    [3, 0, 4],
    [4, 7, 3],
    [6, 5, 1],
    [1, 2, 6],
    [4, 5, 6],
    [6, 7, 4],
    [5, 4, 0],
    [0, 1, 5],
  ];

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indeces.flat()), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  setArrayBuffer(gl, new Float32Array(colors.flat()), colorBuffer, 4, gl.FLOAT);

  const vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  const positionBuffer = gl.createBuffer();
  setArrayBuffer(gl, new Float32Array(verticies.flat()), positionBuffer, 3, gl.FLOAT);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  globalGL = gl;
  gl.enable(gl.DEPTH_TEST);
  render();
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
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

  requestAnimationFrame(render); // prevent automatic re-render
}

function setAxis(a) {
  axis = a;
  render();
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
