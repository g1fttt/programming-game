<script setup>
import { store } from "@/game/state.js"
import { publicAsset } from "@/game/utils.js"
import { worldGridRenderInfo } from "@/game/world.js"

import { computed } from "vue"

const worldGrid = computed(worldGridRenderInfo)

function cellTextures(cell) {
  const assetsPath = "/assets"

  let layers = []

  if (cell.cropType !== null) {
    const cropTexturePath = publicAsset(
      `${assetsPath}/${cell.cropType}/stage-${cell.growthStage}.png`,
    )
    layers.push(`url(${new URL(cropTexturePath, import.meta.url)})`)
  }

  const desiredSoilTexture = cell.isWatered ? "watered-soil" : "soil"
  const soilTexturePath = publicAsset(`${assetsPath}/${desiredSoilTexture}.png`)

  layers.push(`url(${new URL(soilTexturePath, import.meta.url)})`)

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
      :style="{ '--textures': cellTextures(cell) }"
    ></div>
  </div>
</template>

<style scoped>
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
