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

export function autoCompletionExtension(context) {
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
