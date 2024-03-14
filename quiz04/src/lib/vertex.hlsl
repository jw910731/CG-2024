attribute vec4 a_position;
uniform vec4 u_color;
varying vec4 v_color;
uniform mat4 u_matrix;
void main(){
    gl_Position = u_matrix * a_position;
    v_color = u_color;
}    