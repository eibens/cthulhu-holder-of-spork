export const reflection = regl => regl({
  // language=GLSL
  vert: `
    attribute vec2 vertex;
    uniform vec2 ratio;
    varying vec2 clip;
    void main (void) {
      clip = vertex / ratio;
      gl_Position = vec4(vertex, -1.0, 1.0);
    }
  `,
  // language=GLSL
  frag: `
    #define PI 3.1415926535897932384626433832795
    precision mediump float;
    varying vec2 clip;
    uniform sampler2D image;
    uniform float time;
    uniform float radius;

    vec2 lookup(vec3 pos) {
      float phi = atan(pos.y / pos.x);
      float theta = atan(pos.y / pos.z / sin(phi));
      return vec2(phi / PI, theta / PI);
    }
    
    void main (void) {
      vec2 xy = clip / vec2(radius * 1.5, radius * 1.5);
      float rr = xy.x * xy.x + xy.y * xy.y;
      float z = sqrt(1.0 - rr);
      vec3 pos = vec3(-z, xy.y, -xy.x);
      vec2 uv = lookup(pos) + vec2(time / 100.0, time / 100.0);
      float s = pow(texture2D(image, uv).r - 0.1, 2.0);
      //float alpha = 1.0 - pow(1.0 + dot(vec3(0, 0, -1), vec3(xy, z)), 4.0);
      float a = 1.0 - sqrt(rr);
      gl_FragColor = vec4(s, s, s, a);
    }
  `,
  uniforms: {
    image: regl.prop('image'),
    radius: regl.prop('radius')
  },
  attributes: {
    vertex: [
      [-1, -1],
      [+1, -1],
      [-1, +1],
      [+1, +1]
    ]
  },
  blend: {
    enable: true,
    func: {
      src: 'src alpha',
      dst: 'one'
    }
  },
  count: 4,
  primitive: 'triangle strip'
})