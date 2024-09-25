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
    shaderLoader(gl, 'rectangles.vert'),
    shaderLoader(gl, 'rectangles.frag')
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

  /* ==== DATA ==== */
  const verticies = [
    [10, 20],
    [80, 20],
    [10, 30],
    [10, 30],
    [80, 20],
    [80, 30],
  ];

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  const vResolution = gl.getUniformLocation(program, 'vResolution');

  gl.uniform2fv(vResolution, [gl.canvas.width, gl.canvas.height]);
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 2, gl.FLOAT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

  render(gl, program);
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
 
const randomInt = i => Math.floor(Math.random() * i);
function setRectangle(
  /** @type {WebGLRenderingContext} */
  gl,
  /** @type {number} */
  x,
  /** @type {number} */
  y,
  /** @type {number} */
  w,
  /** @type {number} */
  h,
) {
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  const verticies = [
    [x, y],
    [x, y+h],
    [x+w, y],
    [x+w, y],
    [x, y+h],
    [x+w, y+h],
  ];

  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 2, gl.FLOAT);
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function render(
  /** @type {WebGLRenderingContext} */
  gl,
  /** @type {WebGLProgram} */
  program,
) {
  // gl.clear(gl.COLOR_BUFFER_BIT);
  const vColor = gl.getUniformLocation(program, 'vColor');

  for (let i = 0; i < 50; ++i) {
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
    gl.uniform4fv(vColor, [Math.random(), Math.random(), Math.random(), 1.0]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // check error
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      throw new Error(`GL Error: ${error}`);
    }

    //await wait(100);
  }
}