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

import { codeStatus, messageType } from "@/game/worker.js"
import CodeWorker from "@/game/worker.js?worker"

import { onMounted, ref, toRaw } from "vue"

let editorView = undefined
let codeWorker = undefined

let codeIsRunning = ref(false)

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

  const editorStartDoc =
    window.localStorage.getItem("editorStartDoc") ?? 'console.log("Hello, World!")'

  // TODO: Autocompletion for game api
  const editorStartState = EditorState.create({
    doc: editorStartDoc,
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
    state: editorStartState,
    parent: editAreaRef.value,
  })

  window.addEventListener("beforeunload", () => {
    window.localStorage.setItem("editorStartDoc", editorView.state.doc.toString())
  })

  codeWorker = new CodeWorker()
  codeWorker.onmessage = (ev) => {
    switch (ev.data?.type) {
      case messageType.CODE_STATUS:
        codeIsRunning.value = ev.data.status === codeStatus.RUNNING
        break
      default:
        store.deepMergeState(ev.data)
        break
    }
  }
})

function onRunButtonClick() {
  // Unnecessary, yet a good practice anyway
  if (!editorView || !codeWorker) {
    return
  }

  const rawState = toRaw(store.state)

  codeWorker.postMessage({
    type: messageType.CODE_START,
    code: editorView.state.doc.toString(),
    gameState: rawState,
  })
}

function onStopButtonClick() {
  if (!codeWorker) {
    return
  }

  codeWorker.postMessage({ type: messageType.CODE_STOP })

  codeIsRunning.value = false
}
</script>

<template>
  <div id="editor-container">
    <div id="button-row">
      <button v-if="codeIsRunning" @click="onStopButtonClick()" id="stop-button" class="button">
        Stop
      </button>
      <button v-else @click="onRunButtonClick()" id="run-button" class="button">Run</button>
    </div>
    <div id="edit-area" ref="editAreaRef"></div>
  </div>
</template>

<style scoped>
#editor-container {
  padding: 1rem;

  & > #edit-area {
    overflow: auto;
    contain: inline-size;
    border-style: solid;
    border-radius: 0.5rem;
    border-color: #00252f;
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

  & > #run-button {
    background-color: var(--sol-green);
  }

  & > #stop-button {
    background-color: var(--sol-orange);
  }
}
</style>
