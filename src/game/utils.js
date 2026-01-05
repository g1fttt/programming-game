export function getPublicAsset(path) {
  const base = import.meta.env.BASE_URL

  return `${base}/${path}`.replace(/\/+/g, "/")
}
