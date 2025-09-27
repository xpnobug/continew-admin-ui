<template>
  <a-grid :cols="24" :col-gap="12" :row-gap="8">
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">功能开关</span>
        <a-switch v-model="features[featureKey]" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">文本</span>
        <a-input v-model="model.text" placeholder="Hello" style="width: 220px" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">数量</span>
        <a-input-number v-model="model.count" :min="0" :step="1" style="width: 160px" placeholder="1" />
      </a-space>
    </a-grid-item>
  </a-grid>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'
export const meta: JsonModuleMeta = {
  key: 'sample',
  title: '示例模块',
  path: ['ui', 'sample'],
  featureKey: 'isSample',
  defaultValue: {
    text: 'Hello',
    count: 1,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: Record<string, any>
  features: Record<string, any>
  onChange: (val: Record<string, any>, features?: Record<string, any>) => void
}>()

const featureKey = 'isSample'

const model = computed({
  get: () => props.value,
  set: (val) => props.onChange(val, props.features),
})

const features = computed({
  get: () => props.features,
  set: (val) => props.onChange(model.value, val),
})
</script>

<style scoped>
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>

