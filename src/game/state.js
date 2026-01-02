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

// Classes are forbidden due to js-interpreter: no support
export function createCell(cropType) {
  return {
    cropType: cropType,
    growthStage: cropType === null ? null : growthStage.SPROUTING,
  }
}

function genCropTypeInventoryMap() {
  const entries = Object.entries(cropType).map(([_, value]) => [value, 0])

  return Object.fromEntries(entries)
}

const WORLD_WIDTH = 3
const WORLD_HEIGHT = 3

function createGrid() {
  let grid = []

  for (let y = 0; y < WORLD_HEIGHT; ++y) {
    let row = []

    for (let x = 0; x < WORLD_WIDTH; ++x) {
      row.push(createCell(null))
    }

    grid.push(row)
  }

  return grid
}

const state = reactive({
  player: {
    pos: { x: 0, y: 0 },
    inventory: genCropTypeInventoryMap(),
  },
  world: {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    grid: createGrid(),
  },
})

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

export const store = {
  state: readonly(state),
  _deepMergeState: deepMergeState,
}
