<script setup>
import Account from "@/components/Account.vue"
import Quiz from "@/components/Quiz.vue"

import { store } from "@/game/state.js"

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
  <dialog id="quiz-dialog" ref="quizDialogRef">
    <!-- Don't do any unnecessary calculations before we even open the quiz dialog -->
    <Quiz v-if="isQuizDialogOpen" @close="closeQuizDialog()" />
  </dialog>

  <Account />

  <div id="right-panel-container">
    <button @click="store.enlargeWorldGrid()" class="button game-button">Upgrade</button>
    <button @click="openQuizDialog()" class="button misc-button">Quiz</button>
  </div>
</template>

<style scoped>
#quiz-dialog {
  background-color: var(--sol-base02);
  border-radius: 8px;
  border-color: #00252f;

  &::backdrop {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.25);
  }
}

#right-panel-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  right: 0;
  justify-content: space-between;

  --button-margin: 1rem;

  & > button:first-of-type {
    margin-top: var(--button-margin);
  }

  & > button:last-of-type {
    margin-bottom: var(--button-margin);
  }

  & > button {
    margin-right: 1rem;
  }

  & > .game-button {
    background-color: var(--sol-yellow);
  }

  & > .misc-button {
    background-color: var(--sol-blue);
  }
}
</style>
