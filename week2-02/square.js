
let gl;

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
    shaderLoader(gl, 'square.vert'),
    shaderLoader(gl, 'square.frag')
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
    [-0.5, 0.5], // upper left
    [-0.5, -0.5], // lower left
    [0.5, 0.5], // upper right
    [0.5, -0.5], // lower right
  ]

  const bufId = gl.createBuffer(); // Setup buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies.flat()), gl.STATIC_DRAW);

  // Setup buffer as a vertex attribute - see triangle.vert file
  const vPosition = gl.getAttribLocation(program, 'vPosition'); // Get Pointer

  // Set Vertex Attribute is a 2D vector (Float, Float)
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
  gl.enableVertexAttribArray(vPosition);

  render(gl);
}

function render(
  /** @type {WebGLRenderingContext} */
  gl,
) {
  // clear everything and draw Arrays
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
