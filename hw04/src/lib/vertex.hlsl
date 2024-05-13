attribute vec4 a_pos;
attribute vec4 a_color;
attribute vec4 a_normal;

uniform mat4 u_mvpMat;
uniform mat4 u_modelMat;
uniform mat4 u_normalMat;
uniform mat4 u_prevMvpMat;

varying vec4 v_normal;
varying vec4 v_worldPos;
varying vec4 v_color;
varying vec4 v_posInTexture;


void main() {
    gl_Position = u_mvpMat * a_pos;
    v_worldPos = u_modelMat * a_pos;
    v_normal = u_normalMat * a_normal;
    v_color = a_color;
    v_posInTexture = a_pos;
}