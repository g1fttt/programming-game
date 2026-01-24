import { store } from "@/game/state.js"

export function worldGridRenderInfo() {
  const world = store.state.world
  const player = store.state.player

  let grid = []

  for (let y = 0; y < world.height; ++y) {
    for (let x = 0; x < world.width; ++x) {
      const cell = world.grid[y][x]

      grid.push({
        ...cell,
        id: `${x}-${y}`,
        isPlayer: player.pos.x === x && player.pos.y === y,
      })
    }
  }
  return grid
}
