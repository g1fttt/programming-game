<script setup>
import { basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { javascriptLanguage, esLint } from "@codemirror/lang-javascript"
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
  // TODO: Generate docs directly from api
  function autoCompletions() {
    return {
      CARROT: { type: "constant" },
      LETTUCE: { type: "constant" },
      ONION: { type: "constant" },
      POTATO: { type: "constant" },
      RADISH: { type: "constant" },
      TURNIP: { type: "constant" },

      EAST: { type: "constant" },
      WEST: { type: "constant" },
      SOUTH: { type: "constant" },
      NORTH: { type: "constant" },

      WORLD_WIDTH: { type: "constant" },
      WORLD_HEIGHT: { type: "constant" },

      move: {
        type: "function",
        info: "Moves the player by 1 cell in any cardinal direction: NORTH, SOUTH, EAST and WEST.",
      },
      currentCell: {
        type: "function",
        info: `Returns the current cell if it contains any crop, otherwise returns null.

The cell has the next layout:
Object { cropType: string, growthStage: number }`,
      },
      sow: {
        type: "function",
        info: "Sets the current cell to the provided type of crop if it is empty, otherwise writes error to the browser console.",
      },
      harvest: {
        type: "function",
        info: "If current cell has crop at it and it is isReadyToHarvest(), then increments crop score by 1 and sets cell to null.",
      },
      isReadyToHarvest: {
        type: "function",
        info: "Returns true if growthStage of the current cell equals to 3.",
      },
      console: [{ label: "log", type: "function" }],
    }
  }

  function autoCompletionExtension(context) {
    const nodeBefore = context.matchBefore(/[\w.]+/)
    if (!nodeBefore || (nodeBefore.from === nodeBefore.to && !context.explicit)) {
      return null
    }

    const completions = autoCompletions()

    const text = nodeBefore.text

    if (text.includes(".")) {
      const parts = text.split(".")
      const parentKey = parts.at(-2)

      return {
        from: nodeBefore.from + text.lastIndexOf(".") + 1,
        options: completions[parentKey],
      }
    }

    const toPlain = ([key, value]) => {
      if (Array.isArray(key)) {
        return {
          label: key,
          type: "namespace",
        }
      }
      return {
        label: key,
        type: value.type,
        info: value.info,
      }
    }

    const plainCompletions = Object.entries(completions).map(toPlain)

    return {
      from: nodeBefore.from,
      options: plainCompletions,
    }
  }

  const apiCompletions = javascriptLanguage.data.of({
    autocomplete: autoCompletionExtension,
  })

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

  const editorStartState = EditorState.create({
    doc: editorStartDoc,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      javascriptLanguage,
      apiCompletions,
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
