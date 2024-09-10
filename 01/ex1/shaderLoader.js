// ShaderLoader.js
// by Alex4386

function getAdequateShaderByFilename(filename) {
  let type = undefined;
  if (filename.endsWith('.vert')) {
    type = gl.VERTEX_SHADER;
  } else if (filename.endsWith('.frag')) {
    type = gl.FRAGMENT_SHADER;
  }

  return type;
}

async function shaderLoader(gl, filename, type) {
  let source;
  try {
    const res = await fetch(filename);
    source = await res.text();  

    if (!res.ok) {
      throw new Error('Failed to fetch shader: ' + filename);
    }
  } catch(e) {
    console.warn("It seems that fetch can not be used. Falling back to finding bundled script shaders");
    const scripts = document.getElementsByTagName('script');
    const target = Array.from(scripts).find(n => n.dataset.filename === filename);

    if (target) {
      source = target.text;
    } else {
      throw new Error('Unable to find shader source from bundled script: ' + filename);
    }
  }

  if (!type) {
    type = getAdequateShaderByFilename(filename);
    if (!type) throw new Error('Unable to determine shader type from filename: ' + filename);
  }

  if (!source) throw new Error('Unable to load shader source from filename: ' + filename);

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}
