import { MS_PER_TICK } from "@/game/state.js"

export function getPublicAsset(path) {
  const base = import.meta.env.BASE_URL

  return `${base}/${path}`.replace(/\/+/g, "/")
}

// NOTE: Very unconsistent due to setTimeout nature: very web-browser dependant
export function msToTicks(timeMs) {
  return Math.round(timeMs / MS_PER_TICK)
}
