<script setup>
import { basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { javascript, esLint } from "@codemirror/lang-javascript"
import { linter, lintGutter } from "@codemirror/lint"

import { solarizedDark } from "@fsegurai/codemirror-theme-solarized-dark"

import * as esLintBrowserify from "eslint-linter-browserify"

import { store } from "@/game/state.js"
import { onMounted, ref } from "vue"

let editorView = undefined
let codeWorker = undefined

const editAreaRef = ref(null)

onMounted(() => {
  const esLintConfig = {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },
  }

  const startState = EditorState.create({
    doc: 'console.log("Hello, World!")',
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      javascript(),
      solarizedDark,

      lintGutter(),
      linter(esLint(new esLintBrowserify.Linter(), esLintConfig)),
    ],
  })

  editorView = new EditorView({
    state: startState,
    parent: editAreaRef.value,
  })

  const codeWorkerUrl = new URL("@/game/worker.js", import.meta.url)

  codeWorker = new Worker(codeWorkerUrl, { type: "module" })
  codeWorker.onmessage = (ev) => store._deepMergeState(ev.data)
})

function onRunButtonClick() {
  // Unnecessary, yet a good practice anyway
  if (!editorView || !codeWorker) {
    return
  }

  const rawState = JSON.parse(JSON.stringify(store.state))

  codeWorker.postMessage({
    code: editorView.state.doc.toString(),
    state: rawState,
  })
}
</script>

<template>
  <div id="editor-container">
    <div id="button-row">
      <button @click="onRunButtonClick()" id="run-button">Run</button>
    </div>
    <div id="edit-area" ref="editAreaRef"></div>
  </div>
</template>

<style scoped>
#editor-container {
  padding: 1rem;

  & > #edit-area,
  #stdout-area {
    overflow: auto;
    contain: inline-size;

    border-style: solid;
    border-radius: 0.5rem;
    border-color: #00252f;
  }

  & > #edit-area {
    height: 85vh;
    margin-bottom: 0.5rem;

    &:deep(.cm-editor) {
      height: 100%;
    }
  }
}

#button-row {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-bottom: 1rem;

  & > * {
    width: 5rem;
    height: 2rem;
    color: var(--sol-base03);
    border-style: none;
    border-radius: 4px;
    filter: brightness(80%);
    transition: 150ms;

    &:hover {
      filter: brightness(100%);
    }

    &:active {
      background-color: var(--sol-base00) !important;
    }
  }

  & > #run-button {
    background-color: var(--sol-green);
  }
}
</style>
