<script setup>
import IconRow from "@/components/Account/IconRow.vue"

import { store } from "@/game/state.js"
</script>

<template>
  <div id="account-container">
    <IconRow :source="store.state.player.inventory" texture-type="inventory" />
    <IconRow :source="store.state.player.seeds" texture-type="pouch" />
  </div>
</template>

<style scoped>
#account-container {
  position: absolute;
  margin: 1rem;
}
</style>
