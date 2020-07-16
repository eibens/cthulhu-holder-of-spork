import {polar} from './effect/polar'
import {reflection} from './effect/reflection'
import {base} from './effect/base'

const Regl = require('regl')
const resl = require('resl')
const Grammar = require('./grammar')

const gui = {
  canvas: document.getElementById('canvas'),
  name: document.getElementById('name'),
  title: document.getElementById('title'),
  next: document.getElementById('next'),
  copy: document.getElementById('copy'),
  link: document.getElementById('link')
}

const regl = Regl(gui.canvas)
const drawBase = base(regl)
const drawPolar = polar(regl)
const drawReflection = reflection(regl)
let scene = {
  color: [0, 0, 0],
  shapes: [],
  radius: 0
}
let image = regl.texture({
  width: 1,
  height: 1,
  data: [0, 0, 0, 0]
})

const update = hash => {
  const name = hash ? hash.substr(1) : null
  if (name === scene.name) return
  scene = Grammar(name)
  window.location.hash = scene.name
  document.title = scene.name + ', ' + scene.title
  gui.name.innerText = scene.name
  gui.title.innerText = scene.title
  gui.link.value = window.location
}

const copyLink = () => {
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
}

window.addEventListener('custom-ready', () => update(window.location.hash || null))
window.addEventListener('hashchange', () => update(window.location.hash))
gui.next.addEventListener('click', () => update())
gui.copy.addEventListener('click', copyLink)

regl.frame(() => {
  gui.canvas.width = window.innerWidth * window.devicePixelRatio
  gui.canvas.height = window.innerHeight * window.devicePixelRatio
  regl.clear({color: [...scene.color, 1]})
  drawBase(() => scene.shapes.forEach(s => drawPolar(s)))
  drawBase(() => drawReflection({
    image,
    radius: scene.radius
  }))
})

resl({
  manifest: {
    image: {
      type: 'image',
      src: 'galaxy1024.png',
      parser: data => regl.texture({
        data: data,
        mag: 'linear',
        min: 'linear',
        wrapS: 'mirror',
        wrapT: 'mirror'
      })
    }
  },
  onDone: res => {
    image = res.image
  }
})
