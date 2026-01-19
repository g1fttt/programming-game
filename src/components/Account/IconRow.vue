<script setup>
import { CropType } from "@/game/state.js"
import { getPublicAsset } from "@/game/utils.js"

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

function iconTexture(cropType, name) {
  const iconTexturePath = getPublicAsset(`/assets/${cropType}/${name}.png`)

  return new URL(iconTexturePath, import.meta.url)
}
</script>

<template>
  <div class="icon-row">
    <div v-for="(type, _) in CropType" :key="`${props.textureType}-icon-${type}`" class="icon">
      <img :src="iconTexture(type, props.textureType)" />
      <p style="color: white">{{ props.source[type] }}</p>
    </div>
  </div>
</template>

<style scoped>
.icon-row {
  display: flex;
  gap: 0.5rem;
  flex-direction: row;

  & > .icon {
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
