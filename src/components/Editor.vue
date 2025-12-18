<script setup>
import { basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { solarizedDark } from "@fsegurai/codemirror-theme-solarized-dark"

import { onMounted, ref } from "vue"

const editorContainer = ref(null)

onMounted(() => {
  const startState = EditorState.create({
    doc: "Hello, World!",
    extensions: [basicSetup, keymap.of(defaultKeymap), javascript(), solarizedDark],
  })

  new EditorView({
    state: startState,
    parent: editorContainer.value,
  })
})
</script>

<template>
  <section id="editor-container" ref="editorContainer"></section>
</template>

<style scoped>
#editor-container {
  overflow: auto;

  &:deep(.cm-editor) {
    height: 100%;
  }
}
</style>
