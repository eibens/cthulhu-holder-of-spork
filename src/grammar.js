// NOTE: this files assumes the lambda.min.js library is in the global scope
// you should disable everything but syntax checks for this file

// TODO: integrate helpers into library
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

const DOER = [
  'Eater',
  'Consumer',
  'Pillager',
  'Ravager',
  'Destroyer',
  'Corrupter',
  'Tainter',
  'Torturer',
  'Executioner',
  'Inquisitor',
  'Enslaver',
  'Master',
  'Tyrant'
]

const THING = [
  'Dreams',
  'the Void',
  'Dimensions',
  'the Unseen',
  'Shadows',
  'the Deep',
  'Death'
]

module.exports = name => evaluate(root, pipe(
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

  set.title(fork(pick(DOER), ' of ', pick(THING))),
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
