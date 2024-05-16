precision mediump float;

uniform vec4 u_lightPos;
uniform vec4 u_viewPos;

uniform float u_Ka;
uniform float u_Kd;
uniform float u_Ks;
uniform float u_shininess;

uniform sampler2D u_shadowMap;

varying vec4 v_posFromLight;

varying vec2 v_texCoord;
varying vec4 v_normal;
varying vec4 v_worldPos;
varying vec4 v_color;

const float deMachThreshold = 0.005; //0.001 if having high precision depth
void main(){ 
    vec3 ambientLightColor = v_color.rgb;
    vec3 diffuseLightColor = v_color.rgb;
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

    //***** shadow
    vec3 shadowCoord = (v_posFromLight.xyz/v_posFromLight.w)/2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy);
    /////////******** LOW precision depth implementation ********///////////
    float depth = rgbaDepth.r;
    float visibility = (shadowCoord.z > depth + deMachThreshold) ? 0.3 : 1.0;

    gl_FragColor = vec4( (ambientLightColor + diffuse + specular)*visibility, 1.0);
    // gl_FragColor = vec4( (ambientLightColor + diffuse + specular), 1.0);
}