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

function getGlobalGL() {
  if (globalGL === undefined) {
    throw new Error('WebGL not initialized');
  }
  return globalGL;
}

async function setup(
  /** @type {WebGLRenderingContext} */
  gl,
) {
  /* === SHADERS === */
  const program = gl.createProgram(); // Setup program
  
  // load shader
  const [vertexShader, fragmentShader] = await Promise.all([
    shaderLoader(gl, 'assignment.vert'),
    shaderLoader(gl, 'assignment.frag')
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

  globalGL = gl;
  render();
}

function drawTriangle(position = [0,0,0,0], scale = [1,1,1,0]) {
  const gl = getGlobalGL();

  const verticies = [
    [0, .5, 0],
    [-.5, -.5, 0],
    [.5, -.5, 0],
  ];

  drawVerticies(gl, verticies, position, scale);
}

function drawSquare(position = [0,0,0,0], scale = [1,1,1,0]) {
  const gl = getGlobalGL();

  const verticies = [
    [-.5, .5, 0],
    [-.5, -.5, 0],
    [.5, -.5, 0],
    [.5, .5, 0],
    [-.5, .5, 0],
    [.5, -.5, 0],
  ];

  drawVerticies(gl, verticies, position, scale);
}

function drawCircle(divisions = 96, position = [0,0,0,0], scale = [1,1,1,0]) {
  const gl = getGlobalGL();

  const verticies = [];

  for (let i = 0; i <= divisions; i++) {
    const theta = i * 2 * Math.PI / divisions;
    const x = Math.cos(theta) * .5;
    const y = Math.sin(theta) * .5;

    verticies.push([x, y, 0]);

    if (i > 0) {
      verticies.push([0, 0, 0]);
      verticies.push([x, y, 0]);
    }
  }

  drawVerticies(gl, verticies, position, scale);
}

function drawLine(scale = [1,1,1,0], offset = [0,0,0,0], ...points) {
  if (points.length < 2) {
    throw new Error('Not enough points to draw a line.');
  }

  const gl = getGlobalGL();
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(points.flat()), vPosition, 3, gl.FLOAT);

  const scalePtr = gl.getUniformLocation(program, 'scale');
  gl.uniform4fv(scalePtr, scale);

  const translatePtr = gl.getUniformLocation(program, 'translate');
  gl.uniform4fv(translatePtr, offset);

  gl.drawArrays(gl.LINE_STRIP, 0, points.length);
}

function drawVerticies(gl, verticies, position, scale) {
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 3, gl.FLOAT);

  const scalePtr = gl.getUniformLocation(program, 'scale');
  gl.uniform4fv(scalePtr, scale);

  const translatePtr = gl.getUniformLocation(program, 'translate');
  gl.uniform4fv(translatePtr, position);

  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);
}

const Directions = {
  VERTICAL: 0,
  HORIZONTAL: 1,
}

function render() {
  const gl = getGlobalGL();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawFrame();
  onFrame();

  requestAnimationFrame(render);
}

function convertRGBToWebGLColor(...color) {
  if (typeof color === 'object') {
    return color.map(c => c / 255);
  }
}

function convertHexToWebGLColor(color) {
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      color = color.slice(1);
      color = color.match(/[0-9a-f]{1,2}/g);
      color = color.map(c => parseInt(c, 16));
      return convertRGBToWebGLColor(...color);
    }
  }
}


function setColor(color = [0,0,0,1]) {
  if (color.length === 3) {
    color.push(1);
  }

  const gl = getGlobalGL();
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const paintType = gl.getUniformLocation(program, 'paintType');
  const flatColor = gl.getUniformLocation(program, 'flatColor');

  gl.uniform1f(paintType, 0);
  gl.uniform4fv(flatColor, color);
}

function setGradientColor(upColor = [0,0,0,1], downColor = [0,0,0,1], direction = Directions.VERTICAL) {
  if (upColor.length === 3) {
    upColor.push(1);
  }

  if (downColor.length === 3) {
    downColor.push(1);
  }

  const gl = getGlobalGL();
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const paintType = gl.getUniformLocation(program, 'paintType');
  gl.uniform1f(paintType, 1 + Math.floor(Math.min(direction, 1)));

  const upColorPtr = gl.getUniformLocation(program, 'upColor');
  const downColorPtr = gl.getUniformLocation(program, 'downColor');

  gl.uniform4fv(upColorPtr, upColor);
  gl.uniform4fv(downColorPtr, downColor);
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
