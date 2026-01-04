<script setup>
import { store, cropType } from "@/game/state.js"

function inventoryIconTexture(cropType) {
  return new URL(`../assets/${cropType}/inventory.png`, import.meta.url)
}
</script>

<template>
  <div id="inventory-container">
    <div v-for="(type, _) in cropType" :key="`inventory-cell-${type}`" class="inventory-cell">
      <img :src="inventoryIconTexture(type)"></img>
      <p style="color: white">{{ store.state.player.inventory[type] }}</p>
    </div>
  </div>
</template>

<style scoped>
#inventory-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  gap: 1rem;
  margin: 1rem;

  & > .inventory-cell {
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
    }
  }
}
</style>
