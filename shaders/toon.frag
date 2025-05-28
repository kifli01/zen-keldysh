uniform vec3 color;
uniform vec3 lightDirection;
uniform float paperStrength;
uniform sampler2D paperTexture;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Paper noise function
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  // EGYSZERŰSÍTETT világítás - mindig világos
  float NdotL = max(0.3, dot(normalize(vNormal), normalize(lightDirection)));

  // SOKKAL világosabb alapértelmezett lighting
  float lightLevel = mix(0.85, 1.0, NdotL); // 80%-100% közötti világítás

  // Minimális paper textúra
  vec2 paperUv = vUv * 20.0;
  float paperNoise = noise(paperUv) * 0.02; // Nagyon kis hatás

  // Tiszta színek, minimális árnyékolás
  vec3 finalColor = color * lightLevel;
  finalColor += vec3(paperNoise) * paperStrength;

  // Brightening - még világosabb
  finalColor = mix(finalColor, vec3(1.0), 0.1); // 10% fehér hozzáadása

  gl_FragColor = vec4(finalColor, 1.0);
}