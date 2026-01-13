<script setup>
import { store, CropType } from "@/game/state.js"
import { getPublicAsset } from "@/game/utils.js"

function iconTexture(cropType, name) {
  const iconTexturePath = getPublicAsset(`/assets/${cropType}/${name}.png`)

  return new URL(iconTexturePath, import.meta.url)
}
</script>

<template>
  <div id="account-container">
    <div class="cell-row">
      <div v-for="(type, _) in CropType" :key="`inventory-cell-${type}`" class="cell">
        <img :src="iconTexture(type, 'inventory')" />
        <p style="color: white">{{ store.state.player.inventory[type] }}</p>
      </div>
    </div>
    <div class="cell-row">
      <div v-for="(type, _) in CropType" :key="`pouch-cell-${type}`" class="cell">
        <img :src="iconTexture(type, 'pouch')" />
        <p style="color: white">{{ store.state.player.seeds[type] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
#account-container {
  position: absolute;
  margin: 1rem;

  & > .cell-row {
    display: flex;
    gap: 0.5rem;
    flex-direction: row;
  }

  & .cell {
    display: flex;
    flex-direction: row;
    gap: 1px;

    & > img {
      --icon-size: 32px;

      width: var(--icon-size);
      height: var(--icon-size);
      image-rendering: pixelated;
    }

    & > p {
      font-family: "Tiny5", sans-serif;
      margin-bottom: 1.5rem;
      margin-top: 0;
    }
  }
}
</style>
