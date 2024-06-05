precision mediump float;

uniform vec4 u_lightPos;
uniform vec4 u_viewPos;

uniform float u_Ka;
uniform float u_Kd;
uniform float u_Ks;
uniform float u_shininess;

varying vec4 v_normal;
varying vec4 v_worldPos;
varying vec4 v_color;   // this is texture coord when uniform: u_texture_ena is non-zero

uniform int u_texture_ena;
uniform sampler2D u_texture;

const float deMachThreshold = 0.005; //0.001 if having high precision depth
void main(){ 
    vec3 ambientLightColor;
    vec3 diffuseLightColor;
    if(u_texture_ena > 0) {
        ambientLightColor = texture2D(u_texture, v_color.xy).rgb;
        diffuseLightColor = texture2D(u_texture, v_color.xy).rgb;
    } else {
        if(abs(v_color.r + 1.0) < 1e-5) {
            gl_FragColor = texture2D(u_texture, vec2(-v_color.z - 1.0, v_color.y + 1.0) / 2.0);
        return;
        } else {
            ambientLightColor = v_color.rgb;
            diffuseLightColor = v_color.rgb;
        }
    }
    vec3 specularLightColor = vec3(1.0, 1.0, 1.0);        

    ambientLightColor *= u_Ka;
    
    vec3 normal = normalize(v_normal.xyz); //normalize the v_Normal before using it, before it comes from normal vectors interpolation
    vec3 direction = normalize(u_lightPos.xyz - v_worldPos.xyz);
    float nDotL = max(dot(direction, normal), 0.0);
    vec3 diffuse = diffuseLightColor * u_Kd * nDotL;

    vec3 specular = vec3(0.0, 0.0, 0.0); 
    if(nDotL > 0.0) {
        vec3 r = reflect(-direction, normal);
        vec3 v = normalize(u_viewPos.xyz - v_worldPos.xyz);
        float specAngle = clamp(dot(r, v), 0.0, 1.0);
        specular = u_Ks * pow(specAngle, u_shininess) * specularLightColor;
    }

    gl_FragColor = vec4( (ambientLightColor + diffuse + specular), 1.0);
}