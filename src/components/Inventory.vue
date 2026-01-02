<script setup>
import { store, cropType } from "@/game/state.js"

function inventoryIconTexture(cropType) {
  const url = new URL(`../assets/${cropType}/inventory.png`, import.meta.url)

  return `${url}`
}
</script>

<template>
  <div id="inventory">
    <div v-for="(type, _) in cropType" :key="type" class="inventory-cell">
      <img class="inventory-icon" :src="inventoryIconTexture(type)"></img>
      <p style="color: white">{{ store.state.player.inventory[type] }}</p>
    </div>
  </div>
</template>

<style>
#inventory {
  display: flex;
  flex-direction: row;
  position: absolute;
  gap: 1rem;
  margin: 1rem;

  & > .inventory-cell {
    display: flex;
    flex-direction: row;
    gap: 1px;

    & > .inventory-icon {
      --icon-size: 32px;

      width: var(--icon-size);
      height: var(--icon-size);
      image-rendering: pixelated;
    }
  }
}
</style>
