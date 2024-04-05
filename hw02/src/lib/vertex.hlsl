attribute vec3 a_pos;
attribute vec4 a_color;

uniform mat3 u_mat;

varying vec4 v_color;

void main() {
  gl_Position = vec4(u_mat * a_pos, 1);
  v_color = a_color;
}