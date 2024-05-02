precision mediump float;

uniform vec4 u_lightPos;
uniform vec4 u_viewPos;

uniform float u_Ka;
uniform float u_Kd;
uniform float u_Ks;
uniform float u_shininess;

varying vec4 v_normal;
varying vec4 v_worldPos;
varying vec4 v_color;

void main(){
    // let ambient and diffuse color are v_Color 
    // (you can also input them from ouside and make them different)
    vec3 ambientLightColor = v_color.rgb;
    vec3 diffuseLightColor = v_color.rgb;
    // assume white specular light (you can also input it from ouside)
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

    gl_FragColor = vec4(ambientLightColor + diffuse + specular, 1.0);
}