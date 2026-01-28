import { msToTicks, clamp, randomIntFromRange, ticksToMs } from "@/game/utils.js"

import { reactive } from "vue"

const RADISH_GROWTH_TIME = 4500,
  LETTUCE_GROWTH_TIME = 7000,
  TURNIP_GROWTH_TIME = 9000,
  POTATO_GROWTH_TIME = 12_000,
  CARROT_GROWTH_TIME = 12_000,
  ONION_GROWTH_TIME = 12_000

const WATER_RETENTION_TIME = 15_000

const TASK_HOLD_TIME = 60_000

const START_WORLD_WIDTH = 3,
  START_WORLD_HEIGHT = 3

const MAX_WORLD_WIDTH = 10,
  MAX_WORLD_HEIGHT = 10

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
    const cell = structuredClone(object)

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
    this.goal = { cropType: null, amount: 0 }
    this.startingPointAmount = 0
  }

  tick(playerInventory, playerSeeds) {
    if (!super.tick()) {
      return false
    }

    const isGoalAchieved = playerInventory[this.goal.cropType] >= this.goal.amount

    if (!this.isAvailable) {
      this.isAvailable = true
    } else if (isGoalAchieved) {
      const reward = {
        cropType: randomCropType(),
        amount: randomIntFromRange(1, 3),
      }
      playerSeeds[reward.cropType] = reward.amount
    }

    this.update(playerInventory)

    return true
  }

  update(playerInventory) {
    // TODO: Create wide variety of tasks, not just one
    this.description = "Collect until time expires"

    this.goal.cropType = randomCropType()
    this.goal.amount = randomIntFromRange(25, 50)

    this.startingPointAmount = playerInventory[this.goal.cropType]
  }
}

class Player {
  constructor() {
    function emptyCropTypeStorage() {
      const entries = Object.entries(CropType).map(([_, value]) => [value, 0])

      return Object.fromEntries(entries)
    }

    this.pos = { x: 0, y: 0 }
    this.inventory = emptyCropTypeStorage()
    this.seeds = { ...emptyCropTypeStorage(), radish: 1 }
  }
}

class World {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.createGrid(width, height)
  }

  static fromObject(object) {
    const world = structuredClone(object)

    for (let y = 0; y < world.height; ++y) {
      for (let x = 0; x < world.width; ++x) {
        world.grid[y][x] = WorldGridCell.fromObject(world.grid[y][x])
      }
    }

    Object.setPrototypeOf(world, World.prototype)

    return world
  }

  createGrid(width, height) {
    const grid = []

    for (let y = 0; y < height; ++y) {
      const row = []

      for (let x = 0; x < width; ++x) {
        row.push(new WorldGridCell())
      }
      grid.push(row)
    }
    this.grid = grid
  }

  enlargeGrid() {
    const newWorldWidth = clamp(this.world.width + 1, START_WORLD_WIDTH, MAX_WORLD_WIDTH)
    const newWorldHeight = clamp(this.world.height + 1, START_WORLD_HEIGHT, MAX_WORLD_HEIGHT)

    if (newWorldWidth === this.world.width && newWorldHeight === this.world.height) {
      return false
    }

    this.world.width = newWorldWidth
    this.world.height = newWorldHeight

    const newGrid = this.world.grid
    const newRow = []

    for (let x = 0; x < this.world.width; ++x) {
      newRow.push(new WorldGridCell())
    }

    newGrid.splice(0, 0, newRow)

    for (let y = 0; y < this.world.height; ++y) {
      newGrid[y].push(new WorldGridCell())
    }

    this.world.grid = newGrid

    return true
  }

  canUpgradeGrid() {
    return false
  }
}

export class GameState {
  constructor() {
    this.player = new Player()
    this.world = new World(START_WORLD_WIDTH, START_WORLD_HEIGHT)
    this.task = new Task()
  }

  // Reconstructs game state object after transition between main thread and worker because
  // postMessage sends only fields of the game state object, but not methods.
  static fromObject(object) {
    const gameState = structuredClone(object)

    Object.setPrototypeOf(gameState.player, Player.prototype)

    gameState.world = World.fromObject(gameState.world)

    Object.setPrototypeOf(gameState.task, Task.prototype)
    Object.setPrototypeOf(gameState, GameState.prototype)

    return gameState
  }

  tick() {
    for (let y = 0; y < this.world.height; ++y) {
      for (let x = 0; x < this.world.width; ++x) {
        const cell = this.world.grid[y][x]
        cell.tick()
      }
    }

    const player = this.player
    this.task.tick(player.inventory, player.seeds)
  }

  deepMerge(newState) {
    const merge = (target, source) => {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          merge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
    merge(this, newState)
  }

  enlargeWorldGrid() {
    if (!this.world.enlargeGrid()) {
      return
    }

    // Don't let the player to go up along with the new grid
    ++this.player.pos.y
  }

  canUpgradeWorldGrid() {
    return this.world.canUpgradeGrid()
  }
}

export const gameState = reactive(new GameState())
