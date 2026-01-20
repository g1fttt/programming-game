import { CropType, WorldGridCell, GrowthStage } from "@/game/state.js"
import { randomIntFromRange } from "@/game/utils.js"

const Direction = Object.freeze({
  EAST: "east",
  WEST: "west",
  SOUTH: "south",
  NORTH: "north",
})

function setCurrentCell(gameState, cell) {
  const playerPos = gameState.player.pos

  gameState.world.grid[playerPos.y][playerPos.x] = cell
}

function genMove(gameState) {
  const wrap = (x, max) => (x + max) % max

  return (dir) => {
    let newPlayerPos = gameState.player.pos

    switch (dir) {
      case Direction.EAST:
        newPlayerPos.x += 1
        break
      case Direction.WEST:
        newPlayerPos.x -= 1
        break
      case Direction.SOUTH:
        newPlayerPos.y += 1
        break
      case Direction.NORTH:
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
    const publicCell = { cropType: cell.cropType, growthStage: cell.growthStage }

    return cell.cropType === null ? null : publicCell
  }
}

function genSow(gameState) {
  const currentCell = genCurrentCell(gameState)

  return (cropTypeToSow) => {
    if (currentCell() !== null) {
      throw "Unable to sow crop: the cell is already occupied"
    }

    let seeds = gameState.player.seeds
    if (seeds[cropTypeToSow] <= 0) {
      throw "Unable to sow crop: not enough seeds"
    }

    --seeds[cropTypeToSow]

    setCurrentCell(gameState, new WorldGridCell(cropTypeToSow))
  }
}

function genHasSeedsFor(gameState) {
  return (cropType) => gameState.player.seeds[cropType] >= 1
}

function genHarvest(gameState) {
  const currentCell = genCurrentCell(gameState)

  return () => {
    const cell = currentCell()
    if (cell === null) {
      throw "Unable to harvest crop: the cell is empty"
    }

    setCurrentCell(gameState, new WorldGridCell())

    if (cell.growthStage !== GrowthStage.RIPENING) {
      return
    }

    ++gameState.player.inventory[cell.cropType]

    // 10% chance to not obtain any seeds from crop
    if (randomIntFromRange(1, 100) <= 10) {
      return
    }

    gameState.player.seeds[cell.cropType] += randomIntFromRange(1, 3)
  }
}

export function genApi(gameState) {
  return {
    ...CropType,
    ...Direction,
    ...GrowthStage,
    WORLD_WIDTH: gameState.world.width,
    WORLD_HEIGHT: gameState.world.height,
    move: genMove(gameState),
    currentCell: genCurrentCell(gameState),
    sow: genSow(gameState),
    hasSeedsFor: genHasSeedsFor(gameState),
    harvest: genHarvest(gameState),
    console: {
      log: (obj) => console.log(obj),
    },
  }
}
