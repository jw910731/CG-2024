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
varying vec4 v_posInTexture;

uniform sampler2D u_texture;


void main(){
    if(abs(v_color.r + 1.0) < 1e-5) {
        gl_FragColor = texture2D(u_texture, vec2(-v_posInTexture.z - 1.0, v_posInTexture.y + 1.0) / 2.0);
        return;
    }

    // let ambient and diffuse color are v_Color 
    // (you can also input them from ouside and make them different)
    vec3 ambientLightColor = v_color.rgb;
    vec3 diffuseLightColor = v_color.rgb;
    // assume white specular light (you can also input it from ouside)
    vec3 specularLightColor = vec3(1.0, 1.0, 1.0);        

    //TODO-5: calculate ambient light color using "ambientLightColor" and "u_Ka"
    ambientLightColor *= u_Ka;
    
    vec3 normal = normalize(v_normal.xyz); //normalize the v_Normal before using it, before it comes from normal vectors interpolation
    //TODO-6: calculate diffuse light color using "normal", "u_LightPosition", "v_PositionInWorld", "diffuseLightColor", and "u_Kd"
    vec3 direction = normalize(u_lightPos.xyz - v_worldPos.xyz);
    float nDotL = max(dot(direction, normal), 0.0);
    vec3 diffuse = diffuseLightColor * u_Kd * nDotL;

    
    vec3 specular = vec3(0.0, 0.0, 0.0); 
    if(nDotL > 0.0) {
        //TODO-7: calculate specular light color using "normal", "u_LightPosition", "v_PositionInWorld", 
        //       "u_ViewPosition", "u_shininess", "specularLightColor", and "u_Ks"
        //   You probably can store the result of specular calculation into "specular" variable
        vec3 r = reflect(-direction, normal);
        vec3 v = normalize(u_viewPos.xyz - v_worldPos.xyz);
        float specAngle = clamp(dot(r, v), 0.0, 1.0);
        specular = u_Ks * pow(specAngle, u_shininess) * specularLightColor;
    }

    //TODO-8: sum up ambient, diffuse, specular light color from above calculation and put them into "gl_FragColor"
    gl_FragColor = vec4(ambientLightColor + diffuse + specular, 1.0);
}