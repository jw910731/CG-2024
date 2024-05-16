attribute vec4 a_pos;
uniform mat4 u_mvpMat;
void main(){
    gl_Position = u_mvpMat * a_pos;
}