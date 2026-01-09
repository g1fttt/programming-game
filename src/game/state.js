import { msToTicks } from "@/game/utils.js"

import { reactive, readonly } from "vue"

export const cropType = Object.freeze({
  CARROT: "carrot",
  LETTUCE: "lettuce",
  ONION: "onion",
  POTATO: "potato",
  RADISH: "radish",
  TURNIP: "turnip",
})

export const growthStage = Object.freeze({
  SPROUTING: 1,
  SEEDLING: 2,
  RIPENING: 3,
})

export const MS_PER_TICK = 10
const TICKS_UNTIL_NEXT_GROWTH_STAGE = msToTicks(3000)

// Classes are forbidden due to js-interpreter: no support
export function createCell(cropType) {
  return {
    cropType: cropType,
    growthStage: cropType === null ? null : growthStage.SPROUTING,
    ticksUntilNextGrowthStage: TICKS_UNTIL_NEXT_GROWTH_STAGE,
  }
}

function genCropTypeInventoryMap() {
  const entries = Object.entries(cropType).map(([_, value]) => [value, 0])

  return Object.fromEntries(entries)
}

const START_WORLD_WIDTH = 3
const START_WORLD_HEIGHT = 3

function createGrid(width, height) {
  let grid = []

  for (let y = 0; y < width; ++y) {
    let row = []

    for (let x = 0; x < height; ++x) {
      row.push(createCell(null))
    }
    grid.push(row)
  }
  return grid
}

let state = reactive({
  player: {
    pos: { x: 0, y: 0 },
    inventory: genCropTypeInventoryMap(),
  },
  world: {
    width: START_WORLD_WIDTH,
    height: START_WORLD_HEIGHT,
    grid: createGrid(START_WORLD_WIDTH, START_WORLD_HEIGHT),
  },
})

function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max)
}

function tickState(gameState) {
  for (let y = 0; y < gameState.world.height; ++y) {
    for (let x = 0; x < gameState.world.width; ++x) {
      let cell = gameState.world.grid[y][x]

      if (cell.growthStage < growthStage.RIPENING && --cell.ticksUntilNextGrowthStage <= 0) {
        cell.ticksUntilNextGrowthStage = TICKS_UNTIL_NEXT_GROWTH_STAGE
        cell.growthStage = clamp(cell.growthStage + 1, growthStage.SPROUTING, growthStage.RIPENING)
      }
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

function updateGridSizeBy(sizeMod /* 1 or -1 */) {
  const newWidth = clamp(state.world.width + sizeMod, START_WORLD_WIDTH, 10)
  const newHeight = clamp(state.world.height + sizeMod, START_WORLD_HEIGHT, 10)
  const newGrid = createGrid(newWidth, newHeight)

  state.player.pos = { x: 0, y: 0 }

  state.world.width = newWidth
  state.world.height = newHeight
  state.world.grid = newGrid
}

export const store = {
  state: readonly(state),
  tickState: tickState,
  deepMergeState: deepMergeState,
  updateGridSizeBy: updateGridSizeBy,
}
