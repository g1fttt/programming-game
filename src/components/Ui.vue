<script setup>
import { store } from "@/game/state.js"
</script>

<template>
  <div id="ui-container">
    <button @click="store.updateGridSizeBy(1)" class="button game-button">Increase</button>
    <button @click="store.updateGridSizeBy(-1)" class="button game-button">Decrease</button>
  </div>
</template>

<style scoped>
#ui-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  gap: 0.5rem;
  margin: 1rem;
  right: 0;

  & > .game-button {
    background-color: var(--sol-yellow);
  }
}
</style>
