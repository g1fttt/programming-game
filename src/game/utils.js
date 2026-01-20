import { MS_PER_TICK } from "@/game/state.js"

export function getPublicAsset(path) {
  const base = import.meta.env.BASE_URL

  return `${base}/${path}`.replace(/\/+/g, "/")
}

// NOTE: Very inconsistent due to setTimeout nature: very web-browser dependant
export function msToTicks(timeMs) {
  return Math.round(timeMs / MS_PER_TICK)
}

export function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max)
}

export function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Shuffles array using Fisher-Yates algorithm
export function shuffledArray(array) {
  let newArray = structuredClone(array)

  for (let i = newArray.length - 1; i > 0; --i) {
    const j = randomIntFromRange(0, i)

    if (i !== j) {
      const temp = newArray[i]
      newArray[i] = newArray[j]
      newArray[j] = temp
    }
  }
  return newArray
}
