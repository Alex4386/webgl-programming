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
  const gl = globalGL;

  const verticies = [
    [0, .5, 0],
    [-.5, -.5, 0],
    [.5, -.5, 0],
  ];

  drawVerticies(gl, verticies, position, scale);
}

function drawSquare(position = [0,0,0,0], scale = [1,1,1,0]) {
  const gl = globalGL;

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
  const gl = globalGL;

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

function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const isSunny = Math.random() > .5;

  if (isSunny) {
    // sunny
    setGradientColor(
      convertRGBToWebGLColor(0, 128, 255),
      convertRGBToWebGLColor(0, 25, 255),
    );
    drawSquare([0, 0, 0, 0], [2, 2, 1, 1]);
  
    setColor([1,1,0]);
    drawCircle(96, [.2, .5, 0, 0], [.5, .5, 1, 1]);
  } else {
    // cloudy
    setGradientColor(
      convertRGBToWebGLColor(128, 128, 128),
      convertRGBToWebGLColor(64, 64, 64),
    );
    drawSquare([0, 0, 0, 0], [2, 2, 1, 1]);
  }

  if (isSunny) {
    setGradientColor(
      convertHexToWebGLColor('#6b8e23'),
      convertHexToWebGLColor('#2e8b57'),
    );

    [0,1,2,3,4,5].map(n => {
      const random = Math.random() * 2 - 1;
      const heightRandom = Math.random() * .5;
      console.log(random, heightRandom)
      drawTriangle([random, -.25, 0, 0], [2, .7 + heightRandom, 1, 1]);
    })

  }

  setGradientColor(
    convertHexToWebGLColor('#96c94a'),
    convertHexToWebGLColor('#478a0b'),
  );
  drawTriangle([-.5, 0, 0, 0], [1.4, 1, 1, 1]);
  drawTriangle([.5, .1, 0, 0], [1.4, 1.2, 1, 1]);

  setGradientColor(
    convertHexToWebGLColor('#654321'),
    convertHexToWebGLColor('#8b4513'),
  );
  drawSquare([0, -.75, 0, 0], [2, .5, 1, 1]);

  setColor([0,0,0]);
  drawCircle(4, [-.5, -.45, 0, 0], [.25, .35, 1, 1]);

  // set it as skin color
  setColor(convertHexToWebGLColor('#f0d9b5'));
  drawCircle(24, [-.5, -.5, 0, 0], [.25, .25, 1, 1]);

  setColor(convertHexToWebGLColor('#654B00'));
  drawSquare([-.5, -.8, 0, 0], [.125, .35, 1, 1]);
  drawSquare([-.5, -.65, 0, 0], [.35, .075, 1, 1]);

  setColor([1,1,1]);
  drawCircle(16, [-.555, -.5, 0, 0], [.05, .05, 1, 1]);
  drawCircle(16, [-.45, -.5, 0, 0], [.05, .05, 1, 1]);

  setColor([0,0,0]);
  drawCircle(16, [-.555, -.5, 0, 0], [.025, .025, 1, 1]);
  drawCircle(16, [-.45, -.5, 0, 0], [.025, .025, 1, 1]);
  drawSquare([-.5, -.415, 0, 0], [.35, .08, 1, 1])

  if (isSunny) {
    setColor([1,0,0]);
    drawCircle(16, [-.5, -.535, 0, 0], [.05, .05, 1, 1]);
    
    setColor(convertHexToWebGLColor('#f0d9b5'));
    drawSquare([-.5, -.51, 0, 0], [.05, .05, 1, 1]);
  } else {
    setColor([1,0,0]);
    drawCircle(16, [-.5, -.555, 0, 0], [.05, .05, 1, 1]);
    
    setColor(convertHexToWebGLColor('#f0d9b5'));
    drawSquare([-.5, -.58, 0, 0], [.05, .05, 1, 1]);
  }

  // brick house
  setColor(convertHexToWebGLColor('#b9b9b9'));
  drawSquare([.5, -.5, 0, 0], [.8, .4, 1, 1]);

  // red roof
  setGradientColor(
    convertHexToWebGLColor('#8b0000'),
    convertHexToWebGLColor('#ff0000'),
  );
  drawTriangle([.5, -.1, 0, 0], [1, .4, 1, 1]);

  // red door
  setColor(convertHexToWebGLColor('#8b0000'));
  drawCircle(16, [.5, -.5, 0, 0], [.2, .2, 1, 1]);
  drawSquare([.5, -.6, 0, 0], [.2, .2, 1, 1]);

  // door handle
  setColor([1,1,0]);
  drawCircle(16, [.425, -.575, 0, 0], [.025, .025, 1, 1]);  





  // setGradientColor([1,0,0,1], [0,1,0,1]);

  // drawSquare([0, 0, 0, 0], [1, 1, 1, 1]);
  // drawTriangle([0, 1, 0, 0], [1, 1, 1, 1]);
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

  const gl = globalGL;
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const paintType = gl.getUniformLocation(program, 'paintType');
  const flatColor = gl.getUniformLocation(program, 'flatColor');

  gl.uniform1f(paintType, 0);
  gl.uniform4fv(flatColor, color);
}

function setGradientColor(upColor = [0,0,0,1], downColor = [0,0,0,1]) {
  if (upColor.length === 3) {
    upColor.push(1);
  }

  if (downColor.length === 3) {
    downColor.push(1);
  }

  console.log('setGraidentColor', upColor, downColor);

  const gl = globalGL;
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  const paintType = gl.getUniformLocation(program, 'paintType');
  gl.uniform1f(paintType, 1);

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
