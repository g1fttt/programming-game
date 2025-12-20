<script setup>
import { basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { solarizedDark } from "@fsegurai/codemirror-theme-solarized-dark"

import { onMounted, ref } from "vue"

let editorView = undefined

const editAreaRef = ref(null)

onMounted(() => {
  const startState = EditorState.create({
    doc: "Hello, World!",
    extensions: [basicSetup, keymap.of(defaultKeymap), javascript(), solarizedDark],
  })

  editorView = new EditorView({
    state: startState,
    parent: editAreaRef.value,
  })
})

function onRunButtonClick() {
  if (!editorView) {
    return
  }

  // TODO: Execute code using Worker and Function
  console.log(editorView.state.doc.toString())
}
</script>

<template>
  <div id="editor-container">
    <div id="edit-area" ref="editAreaRef"></div>
    <button @click="onRunButtonClick()" id="run-button">Run</button>
  </div>
</template>

<style scoped>
#editor-container {
  padding: 1rem;

  & > #edit-area {
    overflow: auto;
    contain: inline-size;
    height: 85vh;
    border-style: solid;
    border-radius: 0.5rem;
    border-color: #00252f;

    &:deep(.cm-editor) {
      height: 100%;
    }
  }

  & > #run-button {
    margin-top: 1rem;
    width: 5rem;
    height: 2rem;
    float: right;
    border-style: none;
    border-radius: 4px;
    color: var(--sol-base03);
    background-color: var(--sol-green);
    filter: brightness(80%);
    transition: 350ms;

    &:hover {
      filter: brightness(100%);
    }

    &:active {
      background-color: var(--sol-base00);
    }
  }
}
</style>
