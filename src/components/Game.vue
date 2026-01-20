<script setup>
import Ui from "@/components/Ui.vue"
import World from "@/components/World.vue"
</script>

<template>
  <div id="game-container">
    <Ui />
    <World />
  </div>
</template>

<style scoped>
#game-container {
  display: flex;
  background-color: black;
}
</style>
