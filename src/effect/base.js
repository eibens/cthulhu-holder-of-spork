export const base = regl => regl({
  depth: {
    enable: false
  },
  viewport: {
    x: 0,
    y: 0,
    width: () => regl._gl.canvas.width,
    height: () => regl._gl.canvas.height
  },
  uniforms: {
    time: regl.context('time'),
    ratio: ({viewportWidth: w, viewportHeight: h}) => w > h
      ? [h / w, 1]
      : [1, w / h]
  }
})
