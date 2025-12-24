import Interpreter from "js-interpreter"
import * as Babel from "@babel/standalone"

self.onmessage = function (ev) {
  const { code, state } = ev.data

  const api = {
    moveEast: () => (state.player.pos.x += 1),
    moveWest: () => (state.player.pos.x -= 1),
    moveSouth: () => (state.player.pos.y += 1),
    moveNorth: () => (state.player.pos.y -= 1),
  }

  const initFunc = (interpreter, globalObject) => {
    const pseudoState = interpreter.nativeToPseudo(state)
    interpreter.setProperty(globalObject, "state", pseudoState)

    const createCommand = (fn) => {
      return interpreter.createNativeFunction((...args) => {
        fn(...args)

        const updatedPseudo = interpreter.nativeToPseudo(state)
        interpreter.setProperty(globalObject, "state", updatedPseudo)
      })
    }

    for (const [key, value] of Object.entries(api)) {
      interpreter.setProperty(globalObject, key, createCommand(value))
    }
  }

  try {
    const transformedCode = Babel.transform(code, { presets: ["env"] }).code
    const interpreter = new Interpreter(transformedCode, initFunc)

    function run() {
      const getCurrentState = (interpreter) => {
        const pseudoState = interpreter.getValueFromScope("state")
        return interpreter.pseudoToNative(pseudoState)
      }

      if (interpreter.step()) {
        self.postMessage(getCurrentState(interpreter))

        // TODO: Make timeout configurable
        setTimeout(run, 25)
      }
    }

    run()
  } catch (err) {
    console.error(err)
  }
}
