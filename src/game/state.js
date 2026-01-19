import { msToTicks, clamp } from "@/game/utils.js"

import { reactive, readonly } from "vue"

export const CropType = Object.freeze({
  CARROT: "carrot",
  LETTUCE: "lettuce",
  ONION: "onion",
  POTATO: "potato",
  RADISH: "radish",
  TURNIP: "turnip",
})

export const GrowthStage = Object.freeze({
  SPROUTING: 1,
  SEEDLING: 2,
  RIPENING: 3,
})

export const MS_PER_TICK = 10

class Tickable {
  constructor(ticksToTick) {
    this.ticksLeft = ticksToTick
    this.ticksToTick = ticksToTick
  }

  static reconstruct(instance, object) {
    instance.ticksLeft = object.ticksLeft
    instance.tickToTick = object.ticksToTick
  }

  tick() {
    const isDoneTicking = --this.ticksLeft <= 0

    if (isDoneTicking) {
      this.ticksLeft = this.ticksToTick
    }

    return isDoneTicking
  }
}

export class WorldGridCell extends Tickable {
  constructor(cropType, growthStage) {
    super(msToTicks(3000))

    this.cropType = !cropType ? null : cropType

    if (!cropType) {
      this.growthStage = null
    } else if (growthStage) {
      this.growthStage = growthStage
    } else {
      this.growthStage = GrowthStage.SPROUTING
    }
  }

  static fromObject(object) {
    let cell = new WorldGridCell(object.cropType, object.growthStage)
    Tickable.reconstruct(cell, object)

    return cell
  }

  tick() {
    const isDoneTicking = super.tick()

    if (isDoneTicking && this.growthStage < GrowthStage.RIPENING) {
      this.growthStage = clamp(this.growthStage + 1, GrowthStage.SPROUTING, GrowthStage.RIPENING)
    }

    return isDoneTicking
  }
}

export function reconstructState(gameStateObject) {
  for (let y = 0; y < gameStateObject.world.height; ++y) {
    for (let x = 0; x < gameStateObject.world.width; ++x) {
      gameStateObject.world.grid[y][x] = WorldGridCell.fromObject(gameStateObject.world.grid[y][x])
    }
  }
}

function genEmptyCropTypeStorage() {
  const entries = Object.entries(CropType).map(([_, value]) => [value, 0])

  return Object.fromEntries(entries)
}

function createGrid(width, height) {
  let grid = []

  for (let y = 0; y < width; ++y) {
    let row = []

    for (let x = 0; x < height; ++x) {
      row.push(new WorldGridCell())
    }
    grid.push(row)
  }
  return grid
}

const START_WORLD_WIDTH = 3
const START_WORLD_HEIGHT = 3

const MAX_WORLD_WIDTH = 10
const MAX_WORLD_HEIGHT = 10

let state = reactive({
  player: {
    pos: { x: 0, y: 0 },
    inventory: genEmptyCropTypeStorage(),
    seeds: genEmptyCropTypeStorage(),
  },
  world: {
    width: START_WORLD_WIDTH,
    height: START_WORLD_HEIGHT,
    grid: createGrid(START_WORLD_WIDTH, START_WORLD_HEIGHT),
  },
})

function tickState(gameState) {
  for (let y = 0; y < gameState.world.height; ++y) {
    for (let x = 0; x < gameState.world.width; ++x) {
      let cell = gameState.world.grid[y][x]
      cell.tick()
    }
  }
}

function deepMergeState(newState) {
  const merge = (target, source) => {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        merge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
  merge(state, newState)
}

function enlargeWorldGrid() {
  state.world.width = clamp(state.world.width + 1, START_WORLD_WIDTH, MAX_WORLD_WIDTH)
  state.world.height = clamp(state.world.height + 1, START_WORLD_HEIGHT, MAX_WORLD_HEIGHT)

  let newGrid = state.world.grid

  let newRow = []

  for (let x = 0; x < state.world.width; ++x) {
    newRow.push(new WorldGridCell())
  }

  newGrid.splice(0, 0, newRow)

  for (let y = 0; y < state.world.height; ++y) {
    newGrid[y].push(new WorldGridCell())
  }

  // Don't let the player to go up along with the new grid
  ++state.player.pos.y

  state.world.grid = newGrid
}

export const store = {
  state: readonly(state),
  tickState: tickState,
  deepMergeState: deepMergeState,
  enlargeWorldGrid: enlargeWorldGrid,
  canUpgradeWorldGrid: () => false,
}
