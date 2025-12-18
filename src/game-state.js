import { reactive, readonly } from "vue"

const state = reactive({
  player: {
    position: { x: 0, y: 0 },
  },
  world: {
    width: 5,
    height: 5,
  },
})
const actions = {}
const getters = {}

export default {
  state: readonly(state),
  ...actions,
  ...getters,
}
