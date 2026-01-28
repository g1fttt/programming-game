<script setup>
import IconRow from "@/components/IconRow.vue"
import Quiz from "@/components/Quiz.vue"
import TaskNotification from "@/components/TaskNotification.vue"

import { gameState } from "@/game/state.js"

import { ref, onMounted, onUnmounted } from "vue"

const quizDialogRef = ref(null)

function openQuizDialog() {
  quizDialogRef.value.showModal()
}

function closeQuizDialog() {
  quizDialogRef.value.close()
}

let observer = undefined
let isQuizDialogOpen = ref(false)

onMounted(() => {
  if (!quizDialogRef.value) {
    return
  }

  observer = new MutationObserver(() => (isQuizDialogOpen.value = quizDialogRef.value?.open))
  observer.observe(quizDialogRef.value, { attributes: true })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div id="ui-container">
    <IconRow :source="gameState.player.inventory" texture-type="inventory" class="icon-row" />
    <IconRow
      :source="gameState.player.seeds"
      texture-type="pouch"
      class="icon-row"
      id="seeds-icon-row"
    />

    <TaskNotification />

    <div id="button-column">
      <button
        v-if="gameState.canUpgradeWorldGrid()"
        @click="gameState.enlargeWorldGrid()"
        class="button game-button"
      >
        Upgrade
      </button>
      <button @click="openQuizDialog()" class="button misc-button">Quiz</button>
    </div>

    <dialog id="quiz-dialog" ref="quizDialogRef">
      <!-- Don't do any unnecessary calculations before we even open the quiz dialog -->
      <Quiz v-if="isQuizDialogOpen" @close="closeQuizDialog()" />
    </dialog>
  </div>
</template>

<style scoped>
#ui-container {
  --dialog-border-radius: 8px;
  --dialog-border-color: #00252f;

  & > .icon-row {
    position: absolute;
    margin: 1rem;
  }

  & > #seeds-icon-row {
    bottom: 0;
  }

  & > #button-column {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    bottom: 0;
    margin: 1rem;
    gap: 1rem;

    & > .game-button {
      background-color: var(--sol-yellow);
    }

    & > .misc-button {
      background-color: var(--sol-blue);
    }
  }

  & > #quiz-dialog {
    background-color: var(--sol-base02);
    border-radius: var(--dialog-border-radius);
    border-color: var(--dialog-border-color);

    &::backdrop {
      backdrop-filter: blur(8px);
      background-color: rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
