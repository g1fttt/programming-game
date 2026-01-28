<script setup>
import { gameState } from "@/game/state.js"
import { iconTexture } from "@/game/utils"

import { ref } from "vue"

const task = ref(gameState.task)
const playerInventory = ref(gameState.player.inventory)
</script>

<template>
  <div id="task-notification">
    <p id="description">{{ task.description }}</p>
    <div v-if="task.isAvailable">
      <div id="icon">
        <img :src="iconTexture(task.goal.cropType, 'inventory')" class="icon-texture" />
        <p id="goal-amount">
          {{ playerInventory[task.goal.cropType] - task.startingPointAmount }}/{{
            task.goal.amount
          }}
        </p>
      </div>
    </div>
    <p>({{ task.timeLeftInSeconds() }}s)</p>
  </div>
</template>

<style scoped>
#task-notification {
  display: flex;
  background-color: var(--sol-base02);
  border-style: solid;
  border-radius: var(--dialog-border-radius);
  border-color: var(--dialog-border-color);
  position: absolute;
  margin: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  right: 0;
  pointer-events: none;
  gap: 0.5rem;

  & p {
    line-height: 0;
  }

  & #icon {
    display: flex;
    gap: 1px;

    & > #goal-amount {
      font-family: "Tiny5";
    }
  }

  & > #description {
    font-size: var(--h3-and-p-font-size);
  }
}
</style>
