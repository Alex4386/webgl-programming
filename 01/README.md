# How does `WebGL` work?
WebGL functions as a finite-state machine. It has set of states and a set of commands (coded in `GLSL`) to run a pipeline.  

In WebGL, The attributes (states) can be updated via following:  
```js
gl.pushAttrib(); // Save the current state
gl.getAttrib(); // Get the current state
```

Also, `GLSL` is C-like language, but with some differences:  
- variables are vectors or matrices

and obviously:
- No pointers
- No dynamic memory allocation

## For this course
For faster lab sessions, we will use several `helper` scripts to simplify the process.  
Those are available on [`../_common` directory](../_common/) and will be used in the labs.



