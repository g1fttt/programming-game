import { cropType, createCell, growthStage } from "@/game/state.js"

const direction = Object.freeze({
  EAST: "east",
  WEST: "west",
  SOUTH: "south",
  NORTH: "north",
})

function genMove(gameState) {
  const wrap = (x, max) => (x + max) % max

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

    newPlayerPos.x = wrap(newPlayerPos.x, gameState.world.width)
    newPlayerPos.y = wrap(newPlayerPos.y, gameState.world.height)

    gameState.player.pos = newPlayerPos
  }
}

function genCurrentCell(gameState) {
  return () => {
    const playerPos = gameState.player.pos

    const cell = gameState.world.grid[playerPos.y][playerPos.x]

    return cell.cropType === null ? null : cell
  }
}

function genSow(gameState) {
  const currentCell = genCurrentCell(gameState)

  return (cropTypeToSow) => {
    if (currentCell() === null) {
      setCurrentCell(gameState, createCell(cropTypeToSow))
    } else {
      console.error("Unable to sow crop: cell is already occupied")
    }
  }
}

function genHarvest(gameState) {
  const currentCell = genCurrentCell(gameState)

  return () => {
    const cell = currentCell()

    if (cell !== null) {
      setCurrentCell(gameState, createCell(null))

      if (cell.growthStage === growthStage.RIPENING) {
        ++gameState.player.inventory[cell.cropType]
      }
    }
  }
}

function genIsReadyToHarvest(gameState) {
  const currentCell = genCurrentCell(gameState)

  return () => {
    const cell = currentCell()

    return cell !== null && cell.growthStage === growthStage.RIPENING
  }
}

function setCurrentCell(gameState, cell) {
  const playerPos = gameState.player.pos

  gameState.world.grid[playerPos.y][playerPos.x] = cell
}

export function genApi(gameState) {
  return {
    ...cropType,
    ...direction,
    WORLD_WIDTH: gameState.world.width,
    WORLD_HEIGHT: gameState.world.height,
    move: genMove(gameState),
    currentCell: genCurrentCell(gameState),
    sow: genSow(gameState),
    harvest: genHarvest(gameState),
    isReadyToHarvest: genIsReadyToHarvest(gameState),
    console: {
      log: (obj) => console.log(obj),
    },
  }
}
