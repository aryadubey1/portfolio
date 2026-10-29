/* The sea, as a single full-screen fragment shader (GLSL ES 1.00 / WebGL1).

   Day:   pigment pools multiplied onto paper, darker pooled rims (watercolour edge bloom).
   Night: the same pools screened onto deep ink, so they glow.
   Over both: faint topographic contour lines, because it is a sea chart.

   Budget: 4 simplex-noise calls per pixel (2 for the domain warp, 2 for the contours);
   everything else is distance maths over small uniform arrays filled from JS. */

export const POOLS = 8
export const STIRS = 8
export const DROPS = 5

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export function makeFrag(contours: boolean): string {
  return `${contours ? '#extension GL_OES_standard_derivatives : enable\n#define CONTOURS 1' : '#define CONTOURS 0'}
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;      // drawing-buffer size (px)
uniform float uAspect;   // width / height
uniform float uTime;     // seconds
uniform float uShift;    // scroll parallax, in viewport heights
uniform float uNight;    // 0 = day, 1 = night (crossfades)
uniform vec3  uPaper;
uniform vec3  uInk;
uniform vec3  uAccent;
uniform vec4  uPool[${POOLS}];   // x, y, radius (aspect space), k*10 + phase
uniform vec3  uPoolC[${POOLS}];
uniform vec4  uStir[${STIRS}];   // x, y, velocity * weight
uniform vec4  uDrop[${DROPS}];   // x, y, radius, alpha
uniform vec3  uDropC[${DROPS}];

/* 2D simplex noise — Ashima Arts / Ian McEwan, MIT */
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/* watercolour pool: thin wash inside, pigment pooled at a crisp dried rim */
float pool(float d) {
  float a = 0.2 + 0.05 * smoothstep(0.0, 0.6, d) + 0.16 * smoothstep(0.6, 0.9, d);
  return a * (1.0 - smoothstep(0.9, 1.0, d));
}
/* the same pool at night: nearly clear water, light gathered at the rim */
float glow(float d) {
  float a = 0.1 + 0.06 * smoothstep(0.0, 0.7, d) + 0.38 * smoothstep(0.7, 0.94, d);
  return a * (1.0 - smoothstep(0.93, 1.0, d));
}
/* ink drop: an expanding ring, darkest just inside the edge */
float dropRing(float d) {
  float a = mix(0.45, 0.7, smoothstep(0.0, 0.78, d)) + 0.3 * smoothstep(0.78, 0.92, d);
  return a * (1.0 - smoothstep(0.92, 1.0, d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  vec2 q = vec2(uv.x * uAspect, uv.y);
  float t = uTime;

  // slow domain warp: wobbly, breathing edges
  vec2 w = vec2(snoise(q * 1.25 + vec2(0.0, t * 0.018)),
                snoise(q * 1.25 + vec2(5.2, 1.3) - vec2(t * 0.015, 0.0)));
  vec2 qw = q + w * 0.055;

  // the brush: recent pointer samples drag the paint along their velocity.
  // the total pull is clamped well below the brush radius (~0.09) so the paper never folds over itself
  vec2 st = vec2(0.0);
  for (int i = 0; i < ${STIRS}; i++) {
    vec4 s = uStir[i];
    vec2 dv = q - s.xy;
    st += s.zw * exp(-dot(dv, dv) * 62.0);
  }
  float sl = length(st);
  if (sl > 0.034) st *= 0.034 / sl;
  qw -= st;

  vec3 day = uPaper;
  vec3 night = uPaper;

  for (int i = 0; i < ${POOLS}; i++) {
    vec4 P = uPool[i];
    vec2 dv = qw - P.xy;
    float k = floor(P.w / 10.0);
    float ph = P.w - k * 10.0;
    float th = atan(dv.y, dv.x);
    float rr = P.z * (0.9 + 0.1 * sin(k * th + t * 0.12 + ph) + 0.06 * sin((k + 3.0) * th - t * 0.08 + ph * 2.0)
                         + 0.03 * sin((k + 7.0) * th + ph * 3.0 + t * 0.05));
    float d = length(dv) / rr;
    vec3 c = uPoolC[i];
    day *= mix(vec3(1.0), c, pool(d));
    night = 1.0 - (1.0 - night) * (1.0 - c * glow(d) * 0.5);
  }

  for (int i = 0; i < ${DROPS}; i++) {
    vec4 D = uDrop[i];
    if (D.w > 0.001) {
      float a = dropRing(length(qw - D.xy) / max(D.z, 0.0001)) * D.w;
      day *= mix(vec3(1.0), uDropC[i], a);
      night = 1.0 - (1.0 - night) * (1.0 - uDropC[i] * a * 0.5);
    }
  }

#if CONTOURS
  // sea-chart contours; every fourth line is an index line, drawn a touch heavier
  vec2 qc = qw + vec2(0.0, uShift);
  float f = snoise(qc * 0.9 + vec2(t * 0.006, 0.0)) * 0.62 + snoise(qc * 2.1 + vec2(3.7, -t * 0.004)) * 0.38;
  float v = f * 4.4;
  float fw = max(fwidth(v), 0.0001);
  float line = 1.0 - smoothstep(0.0, fw * 0.9, 0.5 - abs(fract(v) - 0.5));
  float major = 1.0 - step(0.5, abs(mod(floor(v + 0.5), 4.0)));
  float la = line * (0.03 + 0.024 * major);
  day = mix(day, uInk, la);
  night = mix(night, uAccent, la * 1.35);
#endif

  // night: a little depth toward the corners
  vec2 cv = uv - 0.5;
  night *= 1.0 - 0.28 * dot(cv, cv);

  gl_FragColor = vec4(mix(day, night, uNight), 1.0);
}
`
}
