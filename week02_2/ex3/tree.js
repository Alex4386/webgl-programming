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
  const verticies = [
    //  x,   y
    [0, 0.3], // top
    [-0.5, 0], // left
    [0.5, 0], // right
    [], // offset: 6
    [-0.15, 0.5],
    [-0.15, 0],
    [0.15, 0.5],
    [0.15, 0],
  ]

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

  setUniform(gl, program, 'uColor', [.37, .09, 0, 1]);
  setUniform(gl, program, 'uOffset', [0, -.65, 0, 0]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 3, 4);

  setUniform(gl, program, 'uColor', [0, 1, 0, 1]);
  setUniform(gl, program, 'uOffset', [0, .3, 0, 0]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  setUniform(gl, program, 'uOffset', [0, 0, 0, 0]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  setUniform(gl, program, 'uOffset', [0, -.3, 0, 0]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
