# Drawing stuff via `webGL`
You can draw using `gl.drawArrays()` and `gl.drawElements()`.

## `gl.drawArrays()`
[MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)

Draws primitives (points, lines, triangles) from the currently bound VBO (Vertex Buffer Object).  
Following primitives are available:  
- `gl.POINTS`
- `gl.LINE_STRIP`
- `gl.LINE_LOOP`
... and many more. See the MDN Docs mentioned above.

## Defining `gl_ARRAY_BUFFER`
When the `webGL` is required for using `ARRAY_BUFFER`, It will automatically use the "binded" buffer.  
In order to put "your data" into the buffer, you need to bind the buffer to `gl.ARRAY_BUFFER`. Here's how you can do.  

```js
/** @type {WebGLRenderingContext} */
var gl;

const yourArray = new Float32Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0]);

const bufId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
gl.bufferData(gl.ARRAY_BUFFER, yourArray, gl.STATIC_DRAW);
```

Then you can use `gl.drawArrays()` to draw the data.  
```js
// This will draw a triangle using (1.0, 2.0), (3.0, 4.0), (5.0, 6.0)
// offset: 0, count: 3 (3 vertices)

gl.drawArrays(gl.TRIANGLES, 0, 3);
```

## Know your sides
Most of the time, you will be working with triangles. When the vertex is defined in a counter-clockwise order, the front face is visible.  
Some legacy implementations might NOT render the back face at all (for optimization reasons)  
**Due to this convention, use the counter-clockwise order for defining vertices.**

## Tessellation
In `WebGL`, You are going to break the model down for adapting it for `gl.TRIANGLES_STRIP` or `gl.TRIANGLES_FAN`.  
This is usually done by the model itself.  

### How does the computer detects that Tessellation is required?
Computer can detect that that Tessellation is required.
* **Simple**: Edges can not be crossed.
* **Convex**: All points on the line segment between two points are also inside the polygon.
* **Flat**: All vertices are on the same plane.

