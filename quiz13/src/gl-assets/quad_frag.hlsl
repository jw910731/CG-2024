precision mediump float;
uniform sampler2D u_shadowMap;

varying vec4 v_pos;

void main(){ 
     gl_FragColor = texture2D(u_shadowMap, v_pos.xy / 2.0 + 0.5);
}