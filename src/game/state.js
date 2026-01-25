import { msToTicks, clamp, randomIntFromRange, ticksToMs } from "@/game/utils.js"

import { reactive, readonly } from "vue"

const RADISH_GROWTH_TIME = 4500
const LETTUCE_GROWTH_TIME = 7000
const TURNIP_GROWTH_TIME = 9000
const POTATO_GROWTH_TIME = 12_000
const CARROT_GROWTH_TIME = 12_000
const ONION_GROWTH_TIME = 12_000

const WATER_RETENTION_TIME = 15_000

const TASK_HOLD_TIME = 60_000

export const CropType = Object.freeze({
  RADISH: "radish",
  LETTUCE: "lettuce",
  TURNIP: "turnip",
  POTATO: "potato",
  CARROT: "carrot",
  ONION: "onion",
})

function cropTypeToGrowthTimeMs(cropType) {
  switch (cropType) {
    case CropType.RADISH:
      return RADISH_GROWTH_TIME
    case CropType.LETTUCE:
      return LETTUCE_GROWTH_TIME
    case CropType.TURNIP:
      return TURNIP_GROWTH_TIME
    case CropType.POTATO:
      return POTATO_GROWTH_TIME
    case CropType.CARROT:
      return CARROT_GROWTH_TIME
    case CropType.ONION:
      return ONION_GROWTH_TIME
    default:
      throw "Invalid crop type provided"
  }
}

function cropTypeToGrowthTimeTicks(cropType) {
  return msToTicks(cropTypeToGrowthTimeMs(cropType))
}

function randomCropType() {
  const cropTypes = Object.values(CropType)
  const randomTypeIndex = randomIntFromRange(0, cropTypes.length - 1)

  return cropTypes[randomTypeIndex]
}

function emptyCropTypeStorage() {
  const entries = Object.entries(CropType).map(([_, value]) => [value, 0])

  return Object.fromEntries(entries)
}

export const GrowthStage = Object.freeze({
  SPROUTING: 1,
  SEEDLING: 2,
  RIPENING: 3,
})

export const MS_PER_TICK = 10

class Tickable {
  constructor(ticksToTick) {
    this.resetTicks(ticksToTick)
  }

  tick() {
    if (this.ticksLeft === null) {
      return false
    }

    if (this.ticksLeft <= 0) {
      this.ticksLeft = this.ticksToTick

      // Automatically reset tick step modifier once we are done ticking this entity
      delete this.tickStep

      return true
    }

    this.ticksLeft -= this.tickStep ? this.tickStep : 1

    return false
  }

  resetTicks(ticksToTick) {
    // Actual tick-counter
    this.ticksLeft = ticksToTick
    // Used to reset tick-counter to
    this.ticksToTick = ticksToTick
  }

  // TODO: Make it actually adding the modifier rather than assigning
  applyTickStepModifier(modifier) {
    this.tickStep = modifier
  }

  // Returns how many time is left to tick in ms
  timeLeft() {
    return ticksToMs(this.ticksLeft)
  }

  timeLeftInSeconds() {
    return Math.round(this.timeLeft() / 1000)
  }
}

class WorldGridCell extends Tickable {
  constructor(cropType, growthStage, isWatered) {
    const growthTimeTicks = cropType ? cropTypeToGrowthTimeTicks(cropType) : null

    super(growthTimeTicks)

    this.cropType = !cropType ? null : cropType

    if (!cropType) {
      this.growthStage = null
    } else if (growthStage) {
      this.growthStage = growthStage
    } else {
      this.growthStage = GrowthStage.SPROUTING
    }

    this.isWatered = typeof isWatered === "boolean" ? isWatered : false
    this.water = new Tickable(msToTicks(WATER_RETENTION_TIME))
  }

  static fromObject(object) {
    let cell = structuredClone(object)

    Object.setPrototypeOf(cell, WorldGridCell.prototype)
    Object.setPrototypeOf(cell.water, Tickable.prototype)

    return cell
  }

  tick() {
    if (this.isWatered) {
      if (this.water.tick()) this.isWatered = false
      else this.applyTickStepModifier(2)
    }

    if (!this.cropType) {
      return false
    }

    const isDoneTicking = super.tick()

    if (isDoneTicking && this.growthStage !== GrowthStage.RIPENING) {
      this.growthStage = clamp(this.growthStage + 1, GrowthStage.SPROUTING, GrowthStage.RIPENING)
    }
    return isDoneTicking
  }

  resetCrop() {
    this.cropType = null
    this.growthStage = null
  }

  resetWith(cropType) {
    this.cropType = cropType
    this.growthStage = GrowthStage.SPROUTING
    this.resetTicks(cropTypeToGrowthTimeTicks(cropType))
  }
}

class Task extends Tickable {
  constructor() {
    super(msToTicks(TASK_HOLD_TIME))

    this.isAvailable = false
    this.description = "No task is currently available"
    this.goal = { type: null /* Croptype */, amount: 0 }
    this.startingPointAmount = 0
  }

  tick(playerInventory, playerSeeds) {
    const isDoneTicking = super.tick()

    if (isDoneTicking) {
      const isGoalAchieved = playerInventory[this.goal.type] >= this.goal.amount

      if (!this.isAvailable) {
        this.isAvailable = true
      } else if (isGoalAchieved) {
        const reward = {
          type: randomCropType(),
          amount: randomIntFromRange(1, 3),
        }
        playerSeeds[reward.type] = reward.amount
      }
      this.update(playerInventory)
    }
    return isDoneTicking
  }

  update(playerInventory) {
    // TODO: Create wide variety of tasks, not just one
    this.description = "Collect until time expires"

    this.goal.type = randomCropType()
    this.goal.amount = randomIntFromRange(25, 50)

    this.startingPointAmount = playerInventory[this.goal.type]
  }
}

// Reconstructs game state object after transition between main thread and worker because
// postMessage sends only fields of the game state object, but not methods.
export function reconstructState(gameStateObject) {
  let grid = gameStateObject.world.grid

  for (let y = 0; y < gameStateObject.world.height; ++y) {
    for (let x = 0; x < gameStateObject.world.width; ++x) {
      grid[y][x] = WorldGridCell.fromObject(grid[y][x])
    }
  }

  Object.setPrototypeOf(gameStateObject.task, Task.prototype)
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
    inventory: emptyCropTypeStorage(),
    seeds: { ...emptyCropTypeStorage(), radish: 1 },
  },
  world: {
    width: START_WORLD_WIDTH,
    height: START_WORLD_HEIGHT,
    grid: createGrid(START_WORLD_WIDTH, START_WORLD_HEIGHT),
  },
  task: new Task(),
})

function tickState(gameState) {
  for (let y = 0; y < gameState.world.height; ++y) {
    for (let x = 0; x < gameState.world.width; ++x) {
      let cell = gameState.world.grid[y][x]
      cell.tick()
    }
  }

  const player = gameState.player
  gameState.task.tick(player.inventory, player.seeds)
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
  const newWorldWidth = clamp(state.world.width + 1, START_WORLD_WIDTH, MAX_WORLD_WIDTH)
  const newWorldHeight = clamp(state.world.height + 1, START_WORLD_HEIGHT, MAX_WORLD_HEIGHT)

  if (newWorldWidth === state.world.width && newWorldHeight === state.world.height) {
    return
  }

  state.world.width = newWorldWidth
  state.world.height = newWorldHeight

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
  // TODO:
  canUpgradeWorldGrid: () => false,
}
