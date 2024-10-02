const NUMBER_OF_TIMES_TO_SUBDIVIDE = 3;

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
    [0,0,-1],
    [0,.9428,.3333],
    [-0.8165, -.4714, .3333],
    [.8165, -.4714, .3333],
  ];

  const [verticies, colors] = divideTetra(...triangle, NUMBER_OF_TIMES_TO_SUBDIVIDE);
  console.log(verticies);

  gl.clearColor(1,1,1,1);
  gl.enable(gl.DEPTH_TEST);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 3, gl.FLOAT);

  const vColor = gl.getAttribLocation(program, 'vColor');
  setArrayBuffer(gl, new Float32Array(colors.flat()), vColor, 3, gl.FLOAT);

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);
}

const mix = (a,b,t) => Array.isArray(a) ? a.map((v,i) => (v * (1 - t)) + (b[i] * t)) : (a * (1-t)) + (b * t);

function triangle(a,b,c,color) {
  const colors = [
    [1,0,0],
    [0,1,0],
    [0,0,1],
    [0,0,0],
  ];

  return [
    [a,b,c],
    [0,1,2].map(_ => colors[color])
  ];
}

function tetra(a,b,c,d) {
  const res = [[b,c,d,3], [a,c,b,0], [a,c,d,1], [a,b,d,2]].map(n => triangle(...n));

  const p = [], colors = [];
  res.map(n => {
    p.push(...n[0]);
    colors.push(...n[1]);
  });

  return [p, colors]
}

function divideTetra(a,b,c,d,count) {
  if (!count) return tetra(a,b,c,d);
  
  const ab = mix(a,b,.5);
  const ac = mix(a,c,.5);
  const ad = mix(a,d,.5);
  const bc = mix(b,c,.5);
  const bd = mix(b,d,.5);
  const cd = mix(c,d,.5);

  --count;

  const p = [], colors = [];
  [
    divideTetra(a, ab, ac, ad, count),
    divideTetra(ab, b, bc, bd, count),
    divideTetra(ac, bc, c, cd, count),
    divideTetra(ad, bd, cd, d, count),
  ].map(n => {
    p.push(...n[0]);
    colors.push(...n[1]);
  });

  return [p, colors];
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
