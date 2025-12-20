import { reactive, readonly } from "vue"

const state = reactive({
  player: {
    pos: { x: 0, y: 0 },
  },
  world: {
    width: 5,
    height: 5,
  },
})

const actions = {}

const getters = {}

const store = {
  state: readonly(state),
  ...actions,
  ...getters,
}

export { store }
