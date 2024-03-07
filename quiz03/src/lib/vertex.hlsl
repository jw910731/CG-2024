attribute vec4 a_pos;
attribute vec3 a_color;

varying vec4 v_color;

void main() {
  gl_Position = a_pos;
  v_color = vec4(a_color, 1.0);
}