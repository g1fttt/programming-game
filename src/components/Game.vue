<script setup>
import { default as store } from "@/game-state.js"

import { computed } from "vue"

const worldCellSize = "50px"

// TODO: Gap for between rows, not just columns
const worldContainerStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${store.state.world.width}, ${worldCellSize})`,
  gap: "1px",
}))
const worldCellStyle = computed(() => ({
  width: worldCellSize,
  height: worldCellSize,
  backgroundColor: "green",
}))
</script>

<template>
  <section id="game-container">
    <div :style="[worldContainerStyle]">
      <div v-for="y in store.state.world.height" :key="`row-${y}`">
        <div v-for="x in store.state.world.width" :key="`column-${x}`">
          <div :style="[worldCellStyle]"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
#game-container {
  background-color: black;
}
</style>
