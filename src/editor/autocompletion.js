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

    SPROUTING: { type: "constant" },
    SEEDLING: { type: "constant" },
    RIPENING: { type: "constant" },

    WORLD_WIDTH: { type: "constant" },
    WORLD_HEIGHT: { type: "constant" },

    move: {
      type: "function",
      info: "Moves the player by 1 cell in any cardinal direction: NORTH, SOUTH, EAST and WEST.",
    },
    currentCell: {
      type: "function",
      info: `Returns the current cell if it contains any crop, otherwise returns null.

The cell has fields listed below:

cropType: string
growthStage: number
isWatered: boolean`,
    },
    sow: {
      type: "function",
      info: `Sets the current cell crop type to the provided one.

If current cell is not empty, then function will throw an excpetion.

If the player doesn't have any seeds for the provided crop type, then function will throw an exception.`,
    },
    hasSeedsFor: {
      type: "function",
      info: "Returns true if there is at least 1 seed for provided cropType.",
    },
    harvest: {
      type: "function",
      info: `Harvests the current cell, increments crop score by 1 and gives the player from 1 to 3 seeds.

If crop was not ready for a ripe, then score will not be incremented.

If current cell doesn't have any crop at it, then function will throw an exception.

Has 10% chance to not give player any seeds, whoops...`,
    },
    water: {
      type: "function",
      info: "Waters the current cell for 15 seconds which doubles the crop growth speed.",
    },
    console: [{ label: "log", type: "function" }],
  }
}

function nestedAutoCompletionOptions(nodeBefore, completions) {
  const text = nodeBefore.text
  if (!text.includes(".")) {
    return null
  }

  const parts = text.split(".")
  const parentKey = parts.at(-2)

  const autoCompletionOptions = completions[parentKey]
  if (!autoCompletionOptions || !Array.isArray(autoCompletionOptions)) {
    return null
  }

  return {
    from: nodeBefore.from + text.lastIndexOf(".") + 1,
    options: autoCompletionOptions,
  }
}

export function autoCompletionExtension(context) {
  const nodeBefore = context.matchBefore(/[\w.]+/)
  if (!nodeBefore || (nodeBefore.from === nodeBefore.to && !context.explicit)) {
    return null
  }

  const completions = autoCompletions()

  const nestedOptions = nestedAutoCompletionOptions(nodeBefore, completions)
  if (nestedOptions !== null) {
    return nestedOptions
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
