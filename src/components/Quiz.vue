<script setup>
import ChoiceButton from "@/components/Quiz/ChoiceButton.vue"

import questions from "@/quiz/questions.js"
import { shuffledArray } from "@/game/utils.js"

import { provide, ref, computed } from "vue"

let score = ref(0)
let isAnyPressed = ref(false)
let isAnswering = ref(true)

function onChoiceClick(choiceProps) {
  if (choiceProps.correct) {
    ++score.value
  }
  isAnyPressed.value = true
}

function cssVarsValues(varsNames) {
  const rootElement = document.documentElement
  const computedStyles = getComputedStyle(rootElement)

  const it = Iterator.from(varsNames).map((varName) => computedStyles.getPropertyValue(varName))

  return Array.from(it)
}

const possibleColors = cssVarsValues(["--sol-yellow", "--sol-red", "--sol-blue", "--sol-green"])

const shuffledQuestionsIt = Iterator.from(shuffledArray(questions)).map((q) => {
  return { ...q, answers: shuffledArray(q.answers) }
})
const shuffledQuestions = Array.from(shuffledQuestionsIt)

let currentQuestionId = ref(0)
const currentQuestion = computed(() => shuffledQuestions[currentQuestionId.value])

const hasMoreQuestions = computed(() => {
  return currentQuestionId.value + 1 < shuffledQuestions.length
})
const shouldShowNextQuestion = computed(() => isAnyPressed.value && hasMoreQuestions.value)
const shouldShowSummary = computed(() => isAnyPressed.value && !hasMoreQuestions.value)

function onNextQuestionClick() {
  ++currentQuestionId.value
  isAnyPressed.value = false
}

provide("quizState", { onChoiceClick, isAnyPressed })
</script>

<template>
  <fieldset>
    <legend>{{ isAnswering ? currentQuestion.label : "Summary" }}</legend>

    <div v-if="isAnswering">
      <div id="quiz-choices-container">
        <ChoiceButton
          v-for="(answer, i) in currentQuestion.answers"
          :key="answer.label"
          :label="answer.label"
          :correct="answer.correct"
          :backgroundColor="possibleColors[i % possibleColors.length]"
        />
      </div>
    </div>
    <div v-else>
      <p>Congratulations! You finished the quiz and there's your score: {{ score }}</p>
    </div>

    <hr id="button-row-separator" />

    <div id="button-row">
      <button @click="$emit('close')" class="button">Close</button>
      <button v-if="shouldShowNextQuestion" @click="onNextQuestionClick()" class="button">
        Next question
      </button>
      <button
        v-else-if="shouldShowSummary && isAnswering"
        @click="isAnswering = false"
        class="button"
      >
        Summary
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
fieldset {
  border-radius: var(--border-radius);
  border-style: solid;
  border-width: 3px;

  & #button-row-separator {
    border-style: dashed;
    border-width: 2px;
  }
}

#quiz-choices-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

#button-row {
  display: flex;
  justify-content: space-between;
}
</style>
