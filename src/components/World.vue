<script setup>
import { store } from "@/game/state.js"

import { computed } from "vue"

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
  <div id="world-grid" :style="{ gridTemplateColumns: `repeat(${store.state.world.width}, 50px)` }">
    <div
      v-for="cell in worldGrid"
      :key="cell.id"
      class="world-cell"
      :class="{ 'is-player': cell.isPlayer }"
      :style="{ '--textures': cellTextures(cell.cropType, cell.growthStage) }"
    ></div>
  </div>
</template>

<style>
#world-grid {
  display: grid;
  width: 100%;
  gap: 5px;
  justify-content: center;
  align-content: center;

  & > .world-cell {
    aspect-ratio: 1 / 1;
    image-rendering: pixelated;
    background-image: var(--textures);
    background-size: cover;
  }

  & > .is-player {
    outline-color: antiquewhite;
    outline-style: solid;
    outline-width: 3px;
  }
}
</style>
