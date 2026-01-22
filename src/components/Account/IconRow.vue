<script setup>
import { CropType } from "@/game/state.js"
import { iconTexture } from "@/game/utils.js"

const props = defineProps({
  source: {
    type: Object,
    required: true,
  },
  textureType: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="icon-row">
    <div v-for="(type, _) in CropType" :key="`${props.textureType}-icon-${type}`" class="icon">
      <img :src="iconTexture(type, props.textureType)" class="icon-texture" />
      <p style="color: white">{{ props.source[type] }}</p>
    </div>
  </div>
</template>

<style scoped>
.icon-row {
  display: flex;
  gap: 0.5rem;
  pointer-events: none;

  & > .icon {
    display: flex;
    gap: 1px;

    & > p {
      font-family: "Tiny5";
      margin-bottom: 1.5rem;
      margin-top: 0;
    }
  }
}
</style>
