const NUMBER_OF_TIMES_TO_SUBDIVIDE = 5;

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
    shaderLoader(gl, 'gasket.vert'),
    shaderLoader(gl, 'gasket.frag')
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
  const triangle = [
    [-1, -1],
    [0, 1],
    [1, -1],
  ];

  const verticies = divideTriangle(...triangle, NUMBER_OF_TIMES_TO_SUBDIVIDE);
  console.log(verticies);

  gl.clearColor(1,1,1,1);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 2, gl.FLOAT);

  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);
}

const mix = (a,b,t) => Array.isArray(a) ? a.map((v,i) => (v * (1 - t)) + (b[i] * t)) : (a * (1-t)) + (b * t);

function divideTriangle(a,b,c,count) {
  if (!count) return [a,b,c];
  
  const ab = mix(a,b,.5);
  const ac = mix(a,c,.5);
  const bc = mix(b,c,.5);

  console.log(a,b,c,ab,ac,bc);

  --count;

  return [
    ...divideTriangle(a, ab, ac, count),
    ...divideTriangle(ab, b, bc, count),
    ...divideTriangle(ac, bc, c, count),
  ]
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
