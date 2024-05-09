attribute vec4 a_pos;

varying vec4 v_pos;

void main(){
    v_pos = a_pos;
    gl_Position = a_pos;
}