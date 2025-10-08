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

// 排序：基础配置优先，其余保持相对顺序
jsonModules.sort((a, b) => {
  if (a.key === 'basicInfo') return -1
  if (b.key === 'basicInfo') return 1
  return 0
})
