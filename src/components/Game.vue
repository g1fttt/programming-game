<script setup>
import { store } from "@/game/state.js"

import { computed } from "vue"

const worldCellSize = "50px"

const worldContainerStyle = computed(() => ({
  display: "grid",
  width: "100%",
  gap: "5px",
  gridTemplateColumns: `repeat(${store.state.world.width}, ${worldCellSize})`,
  justifyContent: "center",
  alignContent: "center",
}))

const cells = computed(() => {
  const world = store.state.world
  const player = store.state.player

  let grid = []

  for (let y = 0; y < world.height; ++y) {
    for (let x = 0; x < world.width; ++x) {
      grid.push({
        id: `${x}-${y}`,
        isPlayer: player.pos.x === x && player.pos.y === y,
      })
    }
  }

  return grid
})
</script>

<template>
  <section id="game-container">
    <div :style="[worldContainerStyle]">
      <div
        v-for="cell in cells"
        :key="cell.id"
        class="world-cell"
        :class="{ 'is-player': cell.isPlayer }"
      ></div>
    </div>
  </section>
</template>

<style scoped>
#game-container {
  display: flex;
  background-color: black;
}

.world-cell {
  aspect-ratio: 1 / 1;
  background-color: green;
}

.is-player {
  background-color: blue;
}
</style>
