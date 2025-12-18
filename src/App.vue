<script setup>
import Editor from "./components/Editor.vue"
import Game from "./components/Game.vue"
</script>

<template>
  <div id="app-container">
    <Editor />
    <Game />
  </div>
</template>

<style scoped>
#app-container {
  display: grid;

  grid-template-columns: 1fr 1fr;

  width: 100vw;
  height: 100vh;
}
</style>
