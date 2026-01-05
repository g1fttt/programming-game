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

let status = null

async function runCode(interpreter, gameState) {
  const sendCodeStatus = () => {
    self.postMessage({
      type: messageType.CODE_STATUS,
      status: status,
    })
  }

  let lastYieldTime = performance.now()
  let lastFrameTime = lastYieldTime
  let accumulator = 0

  mainLoop: while (status !== codeStatus.SHOULD_STOP) {
    const now = performance.now()

    const deltaTime = now - lastFrameTime
    lastFrameTime = now
    accumulator += deltaTime

    while (accumulator >= MS_PER_TICK) {
      store.tickState(gameState)

      if (interpreter.step()) {
        sendCodeStatus()
      } else {
        break mainLoop
      }

      accumulator -= MS_PER_TICK
    }

    const timeSinceLastYield = now - lastYieldTime

    const desiredFramesPerSecond = 30
    const desiredFrameTime = 1000 / desiredFramesPerSecond

    if (timeSinceLastYield > desiredFrameTime) {
      self.postMessage(gameState)

      await new Promise((resolve) => setTimeout(resolve, 0))

      lastYieldTime = performance.now()
      lastFrameTime = lastYieldTime
    }
  }

  status = null

  sendCodeStatus()

  self.postMessage(gameState)
}

function onCodeStart(code, gameState) {
  const api = genApi(gameState)

  const transformed = Babel.transform(code, {
    presets: ["env"],
    sourceType: "script",
  })
  const interpreter = new Interpreter(transformed.code, (interpreter, globalObject) => {
    initProperties(interpreter, globalObject, api)
  })

  runCode(interpreter, gameState)
}

export const messageType = Object.freeze({
  CODE_START: "code-start",
  CODE_STOP: "code-stop",
  CODE_STATUS: "code-status",
})

export const codeStatus = Object.freeze({
  SHOULD_STOP: "should-stop",
  RUNNING: "running",
})

self.onmessage = function (ev) {
  const { type, code, gameState } = ev.data

  switch (type) {
    case messageType.CODE_START:
      status = codeStatus.RUNNING
      onCodeStart(code, gameState)
      break
    case messageType.CODE_STOP:
      status = codeStatus.SHOULD_STOP
      break
  }
}
