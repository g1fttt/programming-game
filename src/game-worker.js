self.onmessage = function (ev) {
  const { code, state } = ev.data

  const api = {
    movePlayer: (x, y) => {
      ctx.state.player.pos.x = x
      ctx.state.player.pos.y = y
    },
  }

  const ctx = { state, ...api }

  try {
    const runner = new Function(...Object.keys(ctx), code)

    runner(...Object.values(ctx))

    self.postMessage(state)
  } catch (err) {
    console.error(err)
  }
}
