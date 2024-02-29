uniform vec4 u_pos;

void main() {
  gl_Position = u_pos;
  gl_PointSize = 10.0;
}