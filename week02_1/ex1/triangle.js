
let gl;

window.addEventListener('load', () => {
  const canvas = document.getElementById('gl-canvas');

  // trying not to use the helper code!!!
  gl = canvas.getContext('webgl');
  if (!gl) console.error('WebGL not supported.');

  setup(canvas, gl);
});

async function setup(canvas, gl) {
  // Setup Verticies
  const verticies = new Float32Array([
    -1, -1, -0.5, 1, 0, -1, 0, -1, 0.5, 1, 1, -1 
  ]);

  // Setup viewport
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0,0,0,1);

  // Setup program
  const program = gl.createProgram();
  
  // load shader
  const [vertexShader, fragmentShader] = await Promise.all([
    shaderLoader(gl, 'triangle.vert'),
    shaderLoader(gl, 'triangle.frag')
  ]);

  // attach shader
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link/use program
  gl.linkProgram(program);
  gl.useProgram(program);

  // Setup buffer
  const bufId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
  gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);

  // Setup buffer as a vertex attribute - see triangle.vert file
  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
}

function render() {
  // clear everything and draw Arrays
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
