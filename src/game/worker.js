import Interpreter from "js-interpreter"
import * as Babel from "@babel/standalone"

import { genApi } from "@/game/api.js"
import { store, MS_PER_TICK } from "@/game/state.js"

function initProperties(interpreter, globalObject, api) {
  const createCommand = (fn) => {
    return interpreter.createNativeFunction((...args) => interpreter.nativeToPseudo(fn(...args)))
  }

  for (const [key, value] of Object.entries(api)) {
    switch (typeof value) {
      case "function":
        interpreter.setProperty(globalObject, key, createCommand(value))

        break
      case "boolean":
      case "number":
      case "string":
      case "object":
      case "symbol":
      case "bigint":
        const pseudoValue = interpreter.nativeToPseudo(value)
        interpreter.setProperty(globalObject, key, pseudoValue)

        break
    }
  }
}

let shouldStop = false

async function runCode(interpreter, gameState) {
  let lastYieldTime = performance.now()
  let lastFrameTime = lastYieldTime
  let accumulator = 0

  while (interpreter.step() && !shouldStop) {
    const now = performance.now()

    const deltaTime = now - lastFrameTime
    lastFrameTime = now
    accumulator += deltaTime

    while (accumulator >= MS_PER_TICK) {
      store.tickState(gameState)
      accumulator -= MS_PER_TICK
    }

    const timeSinceLastYield = now - lastYieldTime

    const desiredFramesPerSecond = 20
    const desiredFrameTime = 1000 / desiredFramesPerSecond

    if (timeSinceLastYield > desiredFrameTime) {
      self.postMessage(gameState)

      await new Promise((resolve) => setTimeout(resolve, 0))

      lastYieldTime = performance.now()
      lastFrameTime = lastYieldTime
    }
  }

  self.postMessage(gameState)
  shouldStop = false
}

function onCodeStart(code, gameState) {
  const api = genApi(gameState)

  const transformedCode = Babel.transform(code, { presets: ["env"] }).code
  const interpreter = new Interpreter(transformedCode, (interpreter, globalObject) => {
    initProperties(interpreter, globalObject, api)
  })

  runCode(interpreter, gameState)
}

export const messageType = Object.freeze({
  START: "start",
  STOP: "stop",
})

self.onmessage = function (ev) {
  const { type, code, gameState } = ev.data

  switch (type) {
    case messageType.START:
      onCodeStart(code, gameState)
      break
    case messageType.STOP:
      shouldStop = true
      break
  }
}
