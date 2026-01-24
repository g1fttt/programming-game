import { CropType, GrowthStage } from "@/game/state.js"
import { randomIntFromRange } from "@/game/utils.js"

const Direction = Object.freeze({
  EAST: "east",
  WEST: "west",
  SOUTH: "south",
  NORTH: "north",
})

function currentCell(gameState) {
  const playerPos = gameState.player.pos

  return gameState.world.grid[playerPos.y][playerPos.x]
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
    // Remove the internal fields from public interface
    const { ticksLeft, ticksToTick, ...publicCell } = currentCell(gameState)

    return publicCell
  }
}

function genSow(gameState) {
  return (cropTypeToSow) => {
    const cell = currentCell(gameState)
    if (cell.cropType) {
      throw "Unable to sow crop: the cell is already occupied"
    }

    let seeds = gameState.player.seeds
    if (seeds[cropTypeToSow] <= 0) {
      throw "Unable to sow crop: not enough seeds"
    }

    --seeds[cropTypeToSow]

    currentCell(gameState).resetWith(cropTypeToSow)
  }
}

function genHasSeedsFor(gameState) {
  return (cropType) => gameState.player.seeds[cropType] >= 1
}

function genHarvest(gameState) {
  return () => {
    const cell = currentCell(gameState)
    if (!cell.cropType) {
      throw "Unable to harvest crop: the cell is empty"
    }

    const growthStage = cell.growthStage
    const cropType = cell.cropType

    cell.resetCrop()

    if (growthStage !== GrowthStage.RIPENING) {
      return
    }

    ++gameState.player.inventory[cropType]

    // 10% chance to not obtain any seeds from crop
    if (randomIntFromRange(1, 100) <= 10) {
      return
    }

    gameState.player.seeds[cropType] += randomIntFromRange(1, 3)
  }
}

function genWater(gameState) {
  return () => (currentCell(gameState).isWatered = true)
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
    water: genWater(gameState),
    console: {
      log: (obj) => console.log(obj),
    },
  }
}
