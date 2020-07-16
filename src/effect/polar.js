export const polar = regl => regl({
  // language=GLSL
  vert: `
    #define PI 3.1415926535897932384626433832795
    attribute vec2 vertex;
    uniform vec2 ratio;
    uniform float depth;
    uniform float speed;
    uniform float time;
    void main (void) {
      float a = (vertex.x + speed * time) * 2.0 * PI;
      float r = vertex.y * (sin(speed * 20.0 * time) / 5.0 + 0.9);
      float x = r * cos(a);
      float y = r * sin(a);
      gl_Position = vec4(ratio * vec2(x, y), depth, 1.0);
    }
  `,
  // language=GLSL
  frag: `
    precision mediump float;
    uniform vec3 color;
    uniform float alpha;
    void main (void) {
      gl_FragColor = vec4(color, alpha);
    }
  `,
  uniforms: {
    color: regl.prop('color'),
    alpha: regl.prop('alpha'),
    speed: regl.prop('speed'),
    depth: regl.prop('depth')
  },
  attributes: {
    vertex: regl.prop('vertex')
  },
  blend: {
    enable: true,
    func: {
      src: 'src alpha',
      dst: 'one minus src alpha'
    }
  },
  count: (_, props) => props.vertex.length,
  primitive: regl.prop('primitive'),
})
