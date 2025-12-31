const direction = Object.freeze({
  EAST: 0,
  WEST: 1,
  SOUTH: 2,
  NORTH: 3,
})

function genMove(gameState) {
  return (dir) => {
    let newPlayerPos = gameState.player.pos

    switch (dir) {
      case direction.EAST:
        newPlayerPos.x += 1
        break
      case direction.WEST:
        newPlayerPos.x -= 1
        break
      case direction.SOUTH:
        newPlayerPos.y += 1
        break
      case direction.NORTH:
        newPlayerPos.y -= 1
        break
    }

    const wrap = (x, max) => (x + max) % max

    newPlayerPos.x = wrap(newPlayerPos.x, gameState.world.width)
    newPlayerPos.y = wrap(newPlayerPos.y, gameState.world.height)

    gameState.player.pos = newPlayerPos
  }
}

export function genApi(gameState) {
  return {
    ...direction,
    move: genMove(gameState),
    console: {
      log: (obj) => console.log(obj),
    },
  }
}
