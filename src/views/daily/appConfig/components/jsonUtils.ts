export function getByPath(obj: any, path: string[]): any {
  return path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj)
}

export function ensurePath(obj: any, path: string[]): any {
  let cur = obj
  for (const key of path) {
    if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {}
    cur = cur[key]
  }
  return cur
}

export function setByPath(obj: any, path: string[], value: any) {
  if (!path.length) return
  const last = path[path.length - 1]
  const parent = ensurePath(obj, path.slice(0, -1))
  parent[last] = value
}

export function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

