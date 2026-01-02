<script setup>
import { store } from "@/game/state.js"

import { computed } from "vue"

const worldContainerStyle = computed(() => ({
  display: "grid",
  width: "100%",
  gap: "5px",
  gridTemplateColumns: `repeat(${store.state.world.width}, 50px)`,
  justifyContent: "center",
  alignContent: "center",
}))

const worldGrid = computed(() => {
  const world = store.state.world
  const player = store.state.player

  let grid = []

  for (let y = 0; y < world.height; ++y) {
    for (let x = 0; x < world.width; ++x) {
      const cell = world.grid[y][x]

      grid.push({
        id: `${x}-${y}`,
        cropType: cell.cropType,
        growthStage: cell.growthStage,
        isPlayer: player.pos.x === x && player.pos.y === y,
      })
    }
  }

  return grid
})

function cellTextures(cropType, growthStage) {
  const assetsPath = "../assets"

  let layers = []

  if (cropType !== null) {
    const cropTextureUrl = new URL(
      `${assetsPath}/${cropType}/stage-${growthStage}.png`,
      import.meta.url,
    )
    layers.push(`url(${cropTextureUrl})`)
  }

  const soilTextureUrl = new URL(`${assetsPath}/soil.png`, import.meta.url)
  layers.push(`url(${soilTextureUrl})`)

  return layers.join(", ")
}
</script>

<template>
  <section id="game-container">
    <div :style="[worldContainerStyle]">
      <div
        v-for="cell in worldGrid"
        :key="cell.id"
        class="cell"
        :class="{ 'is-player': cell.isPlayer }"
        :style="{ '--textures': cellTextures(cell.cropType, cell.growthStage) }"
      ></div>
    </div>
  </section>
</template>

<style scoped>
#game-container {
  display: flex;
  background-color: black;
}

.cell {
  aspect-ratio: 1 / 1;
  image-rendering: pixelated;
  background-image: var(--textures);
  background-size: cover;
}

.is-player {
  outline-color: antiquewhite;
  outline-style: solid;
  outline-width: 3px;
}
</style>
