const Regl = require('regl')
const Grammar = require('./grammar')

const gui = {
  canvas: document.getElementById('canvas'),
  name: document.getElementById('name'),
  title: document.getElementById('title'),
  next: document.getElementById('next'),
  copy: document.getElementById('copy'),
  link: document.getElementById('link')
}

const fit = (w, h) => w > h
  ? [h / w, 1]
  : [1, w / h]

const regl = Regl(gui.canvas)
const draw = regl({
  // language=GLSL
  vert: `
    #define PI 3.1415926535897932384626433832795
    attribute vec2 vertex;
    uniform vec2 ratio;
    void main (void) {
      float a = vertex.x * 2.0 * PI;
      float r = vertex.y;
      float x = r * cos(a);
      float y = r * sin(a);
      gl_Position = vec4(ratio * vec2(x, y), 0.0, 1.0);
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
    ratio: ctx => fit(
      ctx.viewportWidth,
      ctx.viewportHeight
    )
  },
  attributes: {
    vertex: regl.prop('vertex')
  },
  depth: {
    enable: true
  },
  blend: {
    enable: true,
    func: {
      src: 'one',
      dst: 'one minus src alpha'
    }
  },
  count: (_, props) => props.vertex.length,
  primitive: regl.prop('primitive'),
  viewport: {
    x: 0,
    y: 0,
    width: () => regl._gl.canvas.width,
    height: () => regl._gl.canvas.height
  }
})

let scene = {}

const render = () => {
  const domSize = Math.min(window.innerWidth, window.innerHeight)
  const size = domSize * window.devicePixelRatio
  gui.canvas.width = window.innerWidth * window.devicePixelRatio
  gui.canvas.height = window.innerHeight * window.devicePixelRatio
  regl.clear({color: [...scene.color, 1]})
  scene.shapes.forEach(s => draw({...s, size}))
  const rgb = scene.color.map(x => Math.round(x * 255)).join(', ')
  document.documentElement.style.background = `rgb(${rgb})`
}

const update = hash => {
  const name = hash ? hash.substr(1) : null
  if (name === scene.name) return
  scene = Grammar(name)
  window.location.hash = scene.name
  document.title = scene.name + ', ' + scene.title
  gui.name.innerText = scene.name
  gui.title.innerText = scene.title
  gui.link.value = window.location
  render()
}

window.addEventListener('custom-ready', () => update(window.location.hash || null))
window.addEventListener('resize', () => render())
window.addEventListener('hashchange', () => update(window.location.hash))
gui.next.addEventListener('click', () => update())
gui.copy.addEventListener('click', () => {
  gui.link.focus()
  gui.link.select()
  let success
  try {
    success = document.execCommand('copy')
  } catch (e) {
    success = false
  }
  gui.link.blur()
  window.alert(success
    ? `The link was copied to your clipboard. Spread the W̴̢͇̱̯̱̫̻̙͕͎̟̒̐̃̿ͅȌ̴̰͙͓̟͓̦̥̎́̓͒̕̕R̷̻͎̺͍̆̓̐̚͜Ḑ̸̨̪͖͚̩̳͈̙͖̄̂̋̋̔̓̚ of our dark lord ${scene.name}!`
    : 'A mysterious power prevented this action.'
  )
})
