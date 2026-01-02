import Interpreter from "js-interpreter"
import * as Babel from "@babel/standalone"
import { genApi } from "@/game/api.js"

function updateGameState(interpreter, globalObject, state) {
  const pseudoState = interpreter.nativeToPseudo(state)
  interpreter.setProperty(globalObject, "state", pseudoState)
}

function currentGameState(interpreter) {
  const pseudoState = interpreter.getValueFromScope("state")
  return interpreter.pseudoToNative(pseudoState)
}

function initProperties(interpreter, globalObject, state, api) {
  updateGameState(interpreter, globalObject, state)

  const createCommand = (fn) => {
    return interpreter.createNativeFunction((...args) => {
      const result = fn(...args)

      updateGameState(interpreter, globalObject, state)

      return interpreter.nativeToPseudo(result)
    })
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
        let pseudoValue = interpreter.nativeToPseudo(value)
        interpreter.setProperty(globalObject, key, pseudoValue)

        break
    }
  }
}

let shouldStop = false

function onCodeStart(code, gameState) {
  const api = genApi(gameState)

  try {
    const transformedCode = Babel.transform(code, { presets: ["env"] }).code
    const interpreter = new Interpreter(transformedCode, (interpreter, globalObject) => {
      initProperties(interpreter, globalObject, gameState, api)
    })

    function run() {
      if (interpreter.step() && !shouldStop) {
        self.postMessage(currentGameState(interpreter))

        setTimeout(run, 0)
      } else {
        shouldStop = false
      }
    }

    run()
  } catch (err) {
    console.error(err)
  }
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
