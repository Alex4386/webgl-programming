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

function loadTexture(
  /** @type {WebGLRenderingContext} */
  gl,
  /** @type {Image} */
  img,
) {
  const program = gl.getParameter(gl.CURRENT_PROGRAM);

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);
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
    shaderLoader(gl, 'cube.vert'),
    shaderLoader(gl, 'cube.frag')
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

  /* DATA */
  const [verticies, colors, textureCoords] = calculateVerticies();

  const vColor = gl.getAttribLocation(program, 'vColor');
  const vPosition = gl.getAttribLocation(program, 'vPosition');
  const vTexCoord = gl.getAttribLocation(program, 'vTexCoord');


  console.log(verticies, colors, );

  setArrayBuffer(gl, flatten(verticies), vPosition, 4, gl.FLOAT);
  setArrayBuffer(gl, flatten(colors), vColor, 4, gl.FLOAT);
  setArrayBuffer(gl, flatten(textureCoords), vTexCoord, 2 , gl.FLOAT);

  const image = new Image();
  image.onload = () => loadTexture(gl, image);
  image.crossOrigin = '';
  image.src = 'https://c1.staticflickr.com/9/8873/18598400202_3af67ef38f_q.jpg';

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);

  globalGL = gl;
  render();
}

let verticiesCache = [];
const lightPos = [1,1,1,0];
const lightAmbient = [0.2,0.2,0.2,1];
const lightDiffuse = [1,1,1,1];
const lightSpecular = [1,1,1,1];

const materialAmbient = [1,0,1,1]; // gray
const materialDiffuse = [1,.8,0,1]; // yellow
const materialSpecular = [1,1,1,1]; // white
const materialShininess = 100.0;

function calculateVerticies() {
  if (verticiesCache.length) return verticiesCache;

  const verticies = [];
  const colors = [];
  const textureCoords = [];

  [
    [1,0,3,2],
    [2,3,7,6],
    [3,0,4,7],
    [6,5,1,2],
    [4,5,6,7],
    [5,4,0,1],
  ].map(a => {
    const [sideVerticies, sideColors, sideTextureCoords] = drawSide(...a);
    verticies.push(...sideVerticies);
    colors.push(...sideColors);
    textureCoords.push(...sideTextureCoords);
  });

  verticiesCache = [verticies, colors, textureCoords];
  return verticiesCache;
}

const theta = [0, 0, 0];
let axis = 0;
let thetaLoc;

let rotating = true;
function render() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  const program = gl.getParameter(gl.CURRENT_PROGRAM);
  if (rotating) theta[axis] += 2.0;

  let modelView = mat4();

  modelView = mult(modelView, rotate(theta[0], [1,0,0]));
  modelView = mult(modelView, rotate(theta[1], [0,1,0]));
  modelView = mult(modelView, rotate(theta[2], [0,0,1]));

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, 'modelViewMatrix'),
    false,
    modelView.flat(),
  );

  [verticies, _, _] = calculateVerticies();
  gl.drawArrays(gl.TRIANGLES, 0, verticies.length);

  requestAnimationFrame(render);
}

function setAxis(a) {
  axis = a;
  render();
}

function drawSide(pointA, pointB, pointC, pointD) {
  const verticies = [
    [-.5, -.5, .5, 1],
    [-.5, .5, .5, 1],
    [.5, .5, .5, 1],
    [.5, -.5, .5, 1],
    [-.5, -.5, -.5, 1],
    [-.5, .5, -.5, 1],
    [.5, .5, -.5, 1],
    [.5, -.5, -.5, 1],
  ];

  const colors = [
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
  ];

  const textureCoords = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ];

  const sidePoints = [
    verticies[pointA],
    verticies[pointB],
    verticies[pointC], // first triangle
    verticies[pointA],
    verticies[pointC],
    verticies[pointD], // second triangle
  ];

  const texCoordsArray = [
    textureCoords[0],
    textureCoords[1],
    textureCoords[2],
    textureCoords[0],
    textureCoords[2],
    textureCoords[3],
  ];

  const color = sidePoints.map(_ => colors[pointA]);

  return [sidePoints, color, texCoordsArray];
}
function calculateNomral(a, b, c) {
  const u = subtract(b, a);
  const v = subtract(c, a);

  return cross(u,v);
}

function toggleRotate() {
  rotating = !rotating;
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
