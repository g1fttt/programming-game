<script setup>
import { inject, ref } from "vue"

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    required: true,
  },
  correct: Boolean,
})

// TODO: Make buttons disabled if isAnyPressed
const { onChoiceClick, isAnyPressed } = inject("quizState")

let isPressed = ref(false)

function onClick() {
  if (isAnyPressed.value) {
    return
  }

  isPressed.value = true

  onChoiceClick(props)
}
</script>

<template>
  <button
    @click="onClick()"
    class="button"
    :class="{
      'is-correct': (isAnyPressed || isPressed) && props.correct,
      'is-incorrect': isPressed && !props.correct,
    }"
    :style="{ '--background-color': props.backgroundColor }"
    :disabled="isAnyPressed"
  >
    {{ props.label }}
  </button>
</template>

<style scoped>
button {
  width: 20rem;
  height: 10rem;
  font-size: var(--h2-font-size);
  background-color: var(--background-color);

  &:disabled {
    pointer-events: none;
    filter: var(--inactive-button-brightness);
  }
}

.is-correct,
.is-incorrect {
  outline-width: 4px;
  outline-style: dashed;

  &:disabled {
    filter: var(--active-button-brightness);
  }
}

.is-correct {
  outline-color: green;
}

.is-incorrect {
  outline-color: red;
}
</style>
