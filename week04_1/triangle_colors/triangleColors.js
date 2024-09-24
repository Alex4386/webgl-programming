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
    shaderLoader(gl, 'triangleColors.vert'),
    shaderLoader(gl, 'triangleColors.frag')
  ]);

  // attach shader
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link/use program
  gl.linkProgram(program);
  gl.useProgram(program);

  /* ==== DATA ==== */
  const triangle = [
  // x   y
    [0, .5],
    [-.5, -.5],
    [.5, -.5]
  ];

  const verticies = [
    ...triangle,
  ];

  const colors = [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
  ]

  // vertex position buffer
  const vPosId = gl.createBuffer(); // Setup buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vPosId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies.flat()), gl.STATIC_DRAW);

  // Setup buffer as a vertex attribute - see triangle.vert file
  const vPosition = gl.getAttribLocation(program, 'vPosition'); // Get Pointer
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // vPosition vec2
  gl.enableVertexAttribArray(vPosition);

  // vertex color buffer
  const vColorId = gl.createBuffer(); // Setup buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vColorId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors.flat()), gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0); // vColor vec4
  gl.enableVertexAttribArray(vColor);

  render(gl, program);
}

function render(
  /** @type {WebGLRenderingContext} */
  gl,

  /** @type {WebGLProgram} */
  program,
) {
  // clear everything and draw Arrays
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
