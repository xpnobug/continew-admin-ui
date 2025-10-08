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

// 深度合并：以 defaults 为基，value 覆盖其同名字段；
// - 仅对纯对象递归合并；
// - 数组与基础类型直接用 value 覆盖；
export function mergeDeep<T = any>(defaults: any, value: any): T {
  if (value === undefined || value === null) return deepClone(defaults) as any
  if (Array.isArray(defaults) || Array.isArray(value)) return deepClone(value ?? defaults) as any
  if (typeof defaults !== 'object' || typeof value !== 'object') return deepClone(value ?? defaults) as any
  const res: Record<string, any> = {}
  const keys = new Set<string>([...Object.keys(defaults || {}), ...Object.keys(value || {})])
  for (const k of keys) {
    const dv = (defaults || {})[k]
    const vv = (value || {})[k]
    res[k] = mergeDeep(dv, vv)
  }
  return res as any
}
