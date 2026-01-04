<script setup>
import Inventory from "@/components/Inventory.vue"
import Ui from "@/components/Ui.vue"
import World from "@/components/World.vue"
</script>

<template>
  <section id="game-container">
    <Inventory />
    <Ui />
    <World />
  </section>
</template>

<style scoped>
#game-container {
  display: flex;
  background-color: black;
}
</style>
