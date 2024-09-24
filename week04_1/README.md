# Passing Variables to shader

## Uniform
Uniform is a `"constant"` value that is passed to the shader in `input` pipeline which consists during the `draw` call.  

### Example
```glsl
uniform vec4 uColor;
```

### Updating Uniforms
The following are available to send data to a shader, the `method` differs based on the type of data you are sending.

```js
/** @type {WebGLRenderingContext} */
const gl;

/** @type {WebGLUniformLocation} */
const loc;

// Sending a single float
gl.uniform1f(loc, value); // for float
gl.uniform1fv(loc, [value]); // <- note the array

gl.uniform2f(loc, value1, value2); // for float[] or vec2
gl.uniform2fv(loc, [value1, value2]); // <- note the array

gl.uniform3f(loc, value1, value2, value3); // for vec3
gl.uniform3fv(loc, [value1, value2, value3]); // <- note the array

gl.uniform4f(loc, value1, value2, value3, value4); // for vec4
gl.uniform4fv(loc, [value1, value2, value3, value4]); // <- note the array
```

## Varying
Varying is a value that is passed from `vertex` shader to `fragment` shader.

### Example
**Vertex Shader**
```glsl
attribute vec4 vColor;
varying vec4 fColor;

void main() {
    fColor = vColor;
}
```

**Fragment Shader**
```glsl
varying vec4 fColor;

void main() {
    // note the fColor was passed from the vertex shader
    gl_FragColor = fColor;
}
```
