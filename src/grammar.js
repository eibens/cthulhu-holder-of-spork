// NOTE: this files assumes the lambda.min.js library is in the global scope
// you should disable everything but syntax checks for this file
module.exports = n => {
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

  const vec3 = n => val(times(3, n))

  const consonant = pick(...'bdfgklmnprstwxyz')

  const vowel = pick(...'aeiou')

  const syllable = u => pipe(
    set.upperCase(u),
    join(
      pipe(
        consonant,
        when(get.upperCase, upperCase)
      ),
      vowel
    )
  )

  const word = length => join(
    pipe(
      times(length),
      syllable(eq(0))
    )
  )

  const name = pick(
    word(pick(2, 3, 4)),
    join(
      word(pick(1, 2)),
      '-',
      word(pick(1, 2))
    )
  )

  const ruler = pick(
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
  )

  const domain = pick(
    'Dreams',
    'the Void',
    'Dimensions',
    'the Unseen',
    'Shadows',
    'the Deep',
    'Death'
  )

  const title = join(
    ruler,
    ' of ',
    domain
  )

  const iris = pipe(
    times(floor(uniform(2, 8))),
    set.primitive('triangles'),
    set.depth(0),
    set.speed(uniform(1/240, 1/60), mul(pick(1, -1))),
    set.color(vec3(random)),
    set.alpha(1),
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
            get.radius,
            minus(uniform(0, mul(0.2))),
            plus(uniform(0, 0.3)),
            plus(get.offset)
          )
        )
      )
    )
  )

  const pupil = pipe(
    set.corners(40),
    set.count(5),
    set.primitive('triangle fan'),
    set.speed(0),
    set.color(vec3(0)),
    times(get.count),
    set.indexR(it, plus(1)),
    set.index(negate(it), plus(get.count)),
    set.depth(
      get.indexR,
      div(get.count)
    ),
    set.alpha(
      get.indexR,
      div(get.count)
    ),
    set.radius(
      get.radius,
      plus(prod(mul(0.2), get.index))
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

  const shape = obj({
    color: get.color,
    alpha: get.alpha,
    depth: get.depth,
    vertex: get.vertex,
    speed: get.speed,
    primitive: get.primitive
  })

  const scene = obj({
    name: get.name,
    title: get.title,
    color: get.color,
    shapes: get.shapes,
    radius: get.radius
  })

  const eye = pipe(
    set.name(n ? [n] : name),
    seed(get.name),
    set.title(title),
    set.color(vec3(uniform(0.1, 0.2))),
    set.radius(uniform(0.05, 0.2)),
    customRng(
      times(floor(uniform(3, 40))),
      random
    ),
    set.shapes(
      fork(iris, pupil),
      shape
    ),
    scene
  )

  return evaluate(root, eye)
}
