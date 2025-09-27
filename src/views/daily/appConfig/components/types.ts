import type { Component } from 'vue'

export interface JsonModuleMeta {
  key: string
  title: string
  // JSON 中的路径（例如 ['ui', 'aiFab']）
  path: string[]
  // 默认值（新建或不存在时使用）
  defaultValue: Record<string, any>
  // 可选：对应 features 中的开关键名（来自顶层 features 对象）
  featureKey?: string
}

export interface JsonModule extends JsonModuleMeta {
  component: Component
}

