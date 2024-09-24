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
    shaderLoader(gl, 'polygon.vert'),
    shaderLoader(gl, 'polygon.frag')
  ]);

  // attach shader
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link/use program
  gl.linkProgram(program);
  gl.useProgram(program);

  /* ==== DATA ==== */
  const hexagon = [
    [-.3, .6],
    [-.4, .8],
    [-.6, .8],
    [-.7, .6],
    [-.6, .4],
    [-.4, .4],
    [-.3, .6],
  ];

  const triangle = [
    [.3, .4],
    [.7, .4],
    [.5, .8],
  ];

  const colors = [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
  ];

  const strip = [
    [-.5, .2],
    [-.4, .0],
    [-.3, .2],
    [-.2, .0],
    [-.1, .2],
    [0, 0],
    [.1, .2],
    [.2, 0],
    [.3, .2],
    [.4, 0],
    [.5, .2],

    [-.5, -.3],
    [-.4, -.5],
    [-.3, -.3],
    [-.2, -.5],
    [-.1, -.3],
    [0, -.5],
    [.1, -.3],
    [.2, -.5],
    [.3, -.3],
    [.4, -.5],
    [.5, -.3],
  ];

  const vPosition = gl.getAttribLocation(program, 'vPosition'); // Get Pointer
  const vColor = gl.getAttribLocation(program, 'vColor'); // Get Pointer

  setArrayBuffer(gl, new Float32Array(hexagon.flat()), vPosition, 2, gl.FLOAT);
  gl.drawArrays(gl.LINE_STRIP, 0, hexagon.length);

  setArrayBuffer(gl, new Float32Array(triangle.flat()), vPosition, 2, gl.FLOAT);
  setArrayBuffer(gl, new Float32Array(colors.flat()), vColor, 4, gl.FLOAT);
  gl.drawArrays(gl.TRIANGLES, 0, triangle.length);

  setArrayBuffer(gl, new Float32Array(strip.flat()), vPosition, 2, gl.FLOAT);
  gl.disableVertexAttribArray(vColor);
  gl.vertexAttrib4fv(vColor, [1, 1, 0, 1]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 11);

  gl.vertexAttrib4fv(vColor, [0, 0, 0, 1]);
  gl.drawArrays(gl.LINE_STRIP, 0, 11);

  gl.drawArrays(gl.LINE_STRIP, 11, 11);
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
