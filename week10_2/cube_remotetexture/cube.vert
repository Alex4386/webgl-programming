attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec2 vTexCoord;

varying vec4 fColor;
varying vec2 fTexCoord;

uniform mat4 modelViewMatrix;

void main()
{
    fColor = vColor;
    fTexCoord = vTexCoord;
    gl_Position = modelViewMatrix * vPosition;
}
