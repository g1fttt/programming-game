<script setup>
import { store } from "@/game-state.js"

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

const worldCellStyle = computed(() => ({
  aspectRatio: "1 / 1",
}))

function getCellBackgroundColor(x, y) {
  if (x === store.state.player.pos.x && y === store.state.player.pos.y) {
    return "blue"
  }
  return "green"
}
</script>

<template>
  <section id="game-container">
    <div :style="[worldContainerStyle]">
      <!-- NOTE: "display: grid" does not affect <template>, so inner <div> is the true child -->
      <template v-for="(_, y) in store.state.world.height" :key="`row-${y}`">
        <div
          v-for="(_, x) in store.state.world.width"
          :key="`column-${x}`"
          :style="[worldCellStyle, { backgroundColor: getCellBackgroundColor(x, y) }]"
        ></div>
      </template>
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
</style>
