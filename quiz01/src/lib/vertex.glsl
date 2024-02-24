attribute vec4 a_position;
uniform mat4 u_mat;

void main() {
  gl_Position = u_mat * a_position;
}