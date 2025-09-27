import type { Component } from 'vue'
import type { JsonModule, JsonModuleMeta } from './types'

// 约定式自动注册：
// - 每个模块位于 ./modules/*.vue
// - 每个模块使用 <script setup> 并导出命名常量 `meta: JsonModuleMeta`
// - 默认导出是该模块的 Vue 组件

type SfcModule = { default: Component; meta?: JsonModuleMeta }

const raw = import.meta.glob('./modules/*.vue', { eager: true }) as Record<string, SfcModule>

export const jsonModules: JsonModule[] = Object.entries(raw)
  .map(([path, mod]) => {
    if (!mod?.default || !mod?.meta) return null
    return { ...mod.meta, component: mod.default }
  })
  .filter(Boolean) as JsonModule[]

// 可选：按 key 或自定义权重排序
// jsonModules.sort((a, b) => (a.key > b.key ? 1 : -1))

