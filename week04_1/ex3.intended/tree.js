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

async function setup(
  /** @type {WebGLRenderingContext} */
  gl,
) {
  /* === SHADERS === */
  const program = gl.createProgram(); // Setup program
  
  // load shader
  const [vertexShader, fragmentShader] = await Promise.all([
    shaderLoader(gl, 'tree.vert'),
    shaderLoader(gl, 'tree.frag')
  ]);

  // attach shader
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link/use program
  gl.linkProgram(program);
  gl.useProgram(program);

  /* ==== DATA ==== */
  const triangleTop = [
    [0, 1],
    [-.5, .5],
    [.5, .5],
  ];

  const triangleCenter = [
    [0, .5],
    [-.5, 0],
    [.5, 0],
  ];

  const triangleBottom = [
    [0, 0],
    [-.5, -.5],
    [.5, -.5],
  ];

  const treeTrunk = [
    [-.15, -.5],
    [.15, -.5],
    [-.15, -1],
    [.15, -.5],
    [-.15, -1],
    [.15, -1],
  ];

  const verticies = [
    ...triangleTop,
    ...triangleCenter,
    ...triangleBottom,
    ...treeTrunk,
  ].flat();

  const bufId = gl.createBuffer(); // Setup buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies.flat()), gl.STATIC_DRAW);

  // Setup buffer as a vertex attribute - see triangle.vert file
  const vPosition = gl.getAttribLocation(program, 'vPosition'); // Get Pointer

  // Set Vertex Attribute is a 2D vector (Float, Float)
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
  gl.enableVertexAttribArray(vPosition);

  render(gl, program);
}

function setUniform(gl, program, name, value) {
  const location = gl.getUniformLocation(program, name);
  gl.uniform4fv(location, value);
}

function render(
  /** @type {WebGLRenderingContext} */
  gl,

  /** @type {WebGLProgram} */
  program,
) {
  // clear everything and draw Arrays
  gl.clear(gl.COLOR_BUFFER_BIT);

  setUniform(gl, program, 'uOffset', [0, 0, 0, 0]);

  setUniform(gl, program, 'uColor', [0, 1, 0, 1]);
  gl.drawArrays(gl.TRIANGLES, 0, 9);

  setUniform(gl, program, 'uColor', [.5, .25, 0, 1]);
  gl.drawArrays(gl.TRIANGLES, 9, 6);
}
