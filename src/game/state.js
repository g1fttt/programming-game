import { msToTicks, clamp, randomIntFromRange, ticksToMs } from "@/game/utils.js"

import { reactive, readonly } from "vue"

export const CropType = Object.freeze({
  RADISH: "radish",
  LETTUCE: "lettuce",
  TURNIP: "turnip",
  POTATO: "potato",
  CARROT: "carrot",
  ONION: "onion",
})

export const GrowthStage = Object.freeze({
  SPROUTING: 1,
  SEEDLING: 2,
  RIPENING: 3,
})

export const MS_PER_TICK = 10

function cropTypeToGrowthTimeMs(cropType) {
  switch (cropType) {
    case CropType.RADISH:
      return 4500
    case CropType.LETTUCE:
      return 7000
    case CropType.TURNIP:
      return 9000
    case CropType.POTATO:
    case CropType.CARROT:
    case CropType.ONION:
      return 12000
  }
}

function randomCropType() {
  const cropTypes = Object.values(CropType)
  const randomTypeIndex = randomIntFromRange(0, cropTypes.length - 1)

  return cropTypes[randomTypeIndex]
}

class Tickable {
  constructor(ticksToTick, ticksLeft) {
    // Actual tick-counter
    this.ticksLeft = ticksLeft === undefined ? ticksToTick : ticksLeft
    // Used to reset tick-counter to
    this.ticksToTick = ticksToTick
  }

  static fromObject(object) {
    return new Tickable(object.ticksToTick, object.ticksLeft)
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

  // Returns how many time is left to tick in ms
  timeLeft() {
    return ticksToMs(this.ticksLeft)
  }

  timeLeftInSeconds() {
    return Math.floor(this.timeLeft() / 1000)
  }
}

export class WorldGridCell extends Tickable {
  constructor(cropType, growthStage) {
    const growthTimeMs = cropTypeToGrowthTimeMs(cropType)
    const growthTimeTicks = msToTicks(growthTimeMs)

    super(growthTimeTicks)

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
  let grid = gameStateObject.world.grid

  for (let y = 0; y < gameStateObject.world.height; ++y) {
    for (let x = 0; x < gameStateObject.world.width; ++x) {
      grid[y][x] = WorldGridCell.fromObject(grid[y][x])
    }
  }

  let task = gameStateObject.task
  task.tickable = Tickable.fromObject(task.tickable)
}

function genEmptyCropTypeStorage() {
  const entries = Object.entries(CropType).map(([_, value]) => [value, 0])

  return Object.fromEntries(entries)
}

function updateCurrentTask(task, playerInventory) {
  // TODO: Create wide variety of tasks, not just one
  task.description = "Collect until time expires"

  task.goal.type = randomCropType()
  task.goal.amount = randomIntFromRange(25, 50)

  task.startingPointAmount = playerInventory[task.goal.type]
}

function genTaskReward() {
  return {
    type: randomCropType(),
    amount: randomIntFromRange(1, 3),
  }
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
    seeds: { ...genEmptyCropTypeStorage(), radish: 1 },
  },
  world: {
    width: START_WORLD_WIDTH,
    height: START_WORLD_HEIGHT,
    grid: createGrid(START_WORLD_WIDTH, START_WORLD_HEIGHT),
  },
  task: {
    tickable: new Tickable(msToTicks(60_000)),
    isAvailable: false,
    description: "No task is currently available",
    goal: {
      type: null, // CropType
      amount: 0,
    },
    startingPointAmount: 0,
  },
})

function tickState(gameState) {
  for (let y = 0; y < gameState.world.height; ++y) {
    for (let x = 0; x < gameState.world.width; ++x) {
      let cell = gameState.world.grid[y][x]
      cell.tick()
    }
  }

  let task = gameState.task

  if (task.tickable.tick()) {
    const playerInventory = gameState.player.inventory
    const isGoalAchieved = playerInventory[task.goal.type] >= task.goal.amount

    if (!task.isAvailable) {
      task.isAvailable = true
    } else if (isGoalAchieved) {
      let playerSeeds = gameState.player.seeds

      const reward = genTaskReward()
      playerSeeds[reward.type] = reward.amount
    }
    updateCurrentTask(task, playerInventory)
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
  canUpgradeWorldGrid: () => false,
}
