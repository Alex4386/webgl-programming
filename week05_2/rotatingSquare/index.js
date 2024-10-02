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

let updateInterval = -1;
let currentInterval = 50;
let currentCallback = null;

function refreshInterval(
  /** @type {function} */
  newCallback,
  /** @type {number} */
  newDelay,
) {
  if (currentCallback === null && !newCallback) {
    throw new Error('no callback was previously defined');
  } else if (newCallback) {
    currentCallback = newCallback;
  }

  if (updateInterval >= 0) {
    clearInterval(updateInterval);
  } 

  updateInterval = setInterval(
    currentCallback,
    newDelay,
  );

  currentInterval = newDelay;
  document.getElementById('slider').value = currentInterval;

  console.log('newDelay updated!', currentInterval)
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
  if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
    var info = gl.getProgramInfoLog(program);
    throw new Error('Could not compile WebGL program. \n\n' + info);
  }

  gl.useProgram(program);

  /* ==== DATA ==== */
  const verticies = [
    [-.5, .5],
    [-.5, -.5],
    [.5, .5],
    [.5, -.5],
  ];

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  setArrayBuffer(gl, new Float32Array(verticies.flat()), vPosition, 2, gl.FLOAT);

  const theta = gl.getUniformLocation(program, 'theta');
  gl.uniform1f(theta, 0)

  gl.clear( gl.COLOR_BUFFER_BIT );
  const cb = () => {
    render(gl, theta);
  };

  refreshInterval(cb, 50);
}

let thetaAngle = 0;
let multiplier = .1;

function directionShift() {
  multiplier *= -1;
}

function faster() {
  if (currentInterval < 1) {
    multiplier *= 2;
    return;
  }

  refreshInterval(undefined, currentInterval / 2);
}

function slower() {
  if (multiplier > .1) {
    multiplier /= 2;
    return;
  }

  refreshInterval(undefined, currentInterval * 2);
}

document.getElementById('slider').addEventListener('change', e => {
  const val = e.target.value;
  multiplier = .1;
  refreshInterval(null, val);
});

document.getElementById('direction').addEventListener('click', directionShift);
document.getElementById('controls').addEventListener('click', e => {
  const val = parseInt(e.target.index);
  switch (val) {
    case 0:
      return directionShift();
    case 1:
      return faster();
    case 2:
      return slower();
  }
});

document.addEventListener('keydown', e => {
  switch(e.key) {
    case '1':
      return directionShift();
    case '2':
      return faster();
    case '3':
      return slower();
  }
})

function render(
  /** @type {WebGLRenderingContext} */
  gl,
  /** @type {WebGLUniformLocation} */
  theta,
) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  thetaAngle += .1 * multiplier;
  gl.uniform1f(theta, thetaAngle);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
