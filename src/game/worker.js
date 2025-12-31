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
      fn(...args)

      updateGameState(interpreter, globalObject, state)
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

self.onmessage = function (ev) {
  const { code, state } = ev.data

  const api = genApi(state)

  try {
    const transformedCode = Babel.transform(code, { presets: ["env"] }).code
    const interpreter = new Interpreter(transformedCode, (interpreter, globalObject) => {
      initProperties(interpreter, globalObject, state, api)
    })

    function run() {
      if (interpreter.step()) {
        self.postMessage(currentGameState(interpreter))

        // TODO: Make timeout configurable
        setTimeout(run, 25)
      }
    }

    run()
  } catch (err) {
    console.error(err)
  }
}
