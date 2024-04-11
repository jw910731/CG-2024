attribute vec4 a_pos;
attribute vec4 a_color;
attribute vec4 a_normal;

uniform mat4 u_mvpMat;
uniform mat4 u_modelMat;
uniform mat4 u_normalMat;

varying vec4 v_normal;
varying vec4 v_worldPos;
varying vec4 v_color;

void main() {
    //TODO-1: transform "a_Position" to clip space and store in "gl_Position"
    // gl_Position = u_mvpMat * a_pos;
    gl_Position = u_mvpMat * a_pos;
    //TODO-2: transform "a_Position" to world space and store its first three elements to "v_PositionInWorld"
    v_worldPos = u_modelMat * a_pos;
    //TODO-3: transform normal vector "a_Normal" to world space using "u_normalMatrix" and store the result in "v_Normal", 
    //        remember to renormalize the result before storing it to v_Normal
    v_normal = u_normalMat * a_normal;
    //TODO-4: set "a_Color" to "v_Color"
    v_color = a_color;
}