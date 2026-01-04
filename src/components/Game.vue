<script setup>
import Inventory from "@/components/Inventory.vue"
import World from "@/components/World.vue"
</script>

<template>
  <section id="game-container">
    <Inventory />
    <World />
  </section>
</template>

<style scoped>
#game-container {
  display: flex;
  background-color: black;
}
</style>
