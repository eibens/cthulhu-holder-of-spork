// init global DSL
Object.assign(window, Lambda.init({log: console.log}))

// TODO: integrate into library
const customRng = (...fs) => lambda(x => {
  // e.g. this is essentially a rotating scale
  let i = 0
  const seq = evaluate(x, pipe(...fs))
  return rng(() => seq[i++ % seq.length])
})
const obj = o => lambda(x => {
  const result = {}
  for (const k in o) {
    result[k] = evaluate(x, o[k])
  }
  return result
})
const eq = y => lambda(x =>
  evaluate(x) === y
)

// grammar for generating the scene
const grammar = name => evaluate(root, pipe(
  set.name(name ? [name] : pipe(
    pick(
      times(pick(2, 3, 4)),
      fork(
        times(pick(1, 2)),
        '-',
        times(pick(1, 2))
      )
    ),
    set.uppercase(eq(0)),
    unless(eq('-'), fork(
      pipe(
        pick(...'bdfgklmnprstwxyz'),
        when(get.uppercase, lambda(x => evaluate(x).toUpperCase()))
      ),
      pick(...'aeiou'),
    )),
  )),
  set.name(lambda(x => x.name.join(''))),
  seed(get.name),

  set.title(fork(
    pick('Eater', 'Consumer', 'Pillager', 'Ravager', 'Destroyer', 'Corrupter',
      'Tainter', 'Torturer', 'Executioner', 'Inquisitor', 'Enslaver', 'Master', 'Tyrant'),
    ' of ',
    pick('Worlds', 'Souls', 'Minds', 'Brains', 'Planets', 'Stars', 'Universes',
      'Galaxies', 'Dreams', 'the Void', 'Dimensions', 'the Unseen', 'Shadows',
      'the Deep', 'Death')
  )),
  set.title(lambda(x => x.title.join(''))),

  set.color(times(3), uniform(0.1, 0.2)),
  set.shapes(
    times(1),
    customRng(
      times(floor(uniform(3, 40))),
      random
    ),
    set.pupilRadius(uniform(0.05, 0.2)),
    fork(
      // iris
      pipe(
        times(floor(uniform(2, 8))),
        set.primitive('triangles'),
        set.color(times(3), random),
        set.alpha(uniform(0.7, 1)),
        set.vertex(
          set.offset(
            uniform(0, 0.4)
          ),
          set.count(
            uniform(5, 100),
            floor(it),
            mul(3)
          ),
          times(get.count),
          val(
            fork(
              div(get.count),
              pipe(
                get.pupilRadius,
                minus(uniform(0, mul(0.2))),
                plus(uniform(0, 0.3)),
                plus(get.offset)
              )
            )
          )
        )
      ),
      // pupil
      pipe(
        set.corners(40),
        set.count(5),
        set.primitive('triangle fan'),
        set.color([0, 0, 0]),
        times(get.count),
        set.index(it, plus(1)),
        set.radius(
          get.pupilRadius,
          plus(prod(mul(0.2), get.index))
        ),
        set.alpha(
          get.count,
          minus(get.index),
          div(get.count)
        ),
        set.vertex(fork(
          val([0, 0]),
          pipe(
            times(get.corners(plus(1))),
            val(fork(
              div(get.corners),
              get.radius
            ))
          )
        ))
      )
    ),
    obj({
      color: get.color,
      alpha: get.alpha,
      vertex: get.vertex,
      primitive: get.primitive
    })
  ),
  obj({
    name: get.name,
    title: get.title,
    color: get.color,
    shapes: get.shapes
  })
))

const gui = {
  canvas: document.getElementById('canvas'),
  name: document.getElementById('name'),
  title: document.getElementById('title'),
  next: document.getElementById('next'),
  copy: document.getElementById('copy'),
  link: document.getElementById('link')
}

// simple WebGL effect with radial coordinate system
const regl = createREGL(gui.canvas)
const draw = regl({
  // language=GLSL
  vert: `
    #define PI 3.1415926535897932384626433832795
    attribute vec2 vertex;
    void main (void) {
      float a = vertex.x * 2.0 * PI;
      float r = vertex.y;
      float x = r * cos(a);
      float y = r * sin(a);
      gl_Position = vec4(x, y, 0.0, 1.0);
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
    alpha: regl.prop('alpha')
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
    width: regl.prop('size'),
    height: regl.prop('size')
  },
})

// define handlers
let scene = {}
const render = () => {
  const domSize = Math.min(window.innerWidth, window.innerHeight)
  const size = domSize * window.devicePixelRatio
  gui.canvas.style.width = domSize + 'px'
  gui.canvas.style.height = domSize + 'px'
  gui.canvas.width = size
  gui.canvas.height = size
  regl.clear({color: [...scene.color, 1]})
  scene.shapes.forEach(s => draw({...s, size}))
  const rgb = scene.color.map(x => Math.round(x * 255)).join(', ')
  document.documentElement.style.background = `rgb(${rgb})`
}
const update = hash => {
  const name = hash ? hash.substr(1) : null
  if (name === scene.name) return
  scene = grammar(name)
  window.location.hash = scene.name
  document.title = scene.name + ', ' + scene.title
  gui.name.innerText = scene.name
  gui.title.innerText = scene.title
  gui.link.value = 'https://lambda.website/cthulhu-holder-of-spork/#' + scene.name
  render()
}

// hook up handlers
update(window.location.hash || null)
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
