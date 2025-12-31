import { reactive, readonly } from "vue"

const state = reactive({
  player: {
    pos: { x: 0, y: 0 },
  },
  world: {
    width: 3,
    height: 3,
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
