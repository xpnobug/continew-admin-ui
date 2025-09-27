<template>
  <div class="app-config-editor">
    <a-grid :cols="24" :col-gap="16">
      <a-grid-item :span="6" class="side">
        <a-space direction="vertical" fill>
          <a-typography-title :heading="6">配置模块</a-typography-title>
          <a-input-search v-model="keyword" placeholder="搜索模块..." allow-clear />
          <div class="module-list">
            <a-list :bordered="true" :split="true" size="small">
              <a-list-item v-for="m in filteredModules" :key="m.key" @click="select(m.key)" :class="{ active: m.key === activeKey }">
                <div class="row">
                  <span class="title">{{ m.title }}</span>
                  <a-switch v-if="m.featureKey" size="small" :model-value="features[m.featureKey] ?? false" @change="(val:boolean)=>toggleFeature(m, val)" @click.stop="() => {}" />
                </div>
              </a-list-item>
            </a-list>
          </div>
          <a-space>
            <a-button type="outline" size="small" @click="openImport">导入</a-button>
            <a-button type="outline" size="small" @click="exportJson">导出</a-button>
          </a-space>
        </a-space>
      </a-grid-item>
      <a-grid-item :span="18" class="main">
        <a-card v-if="active" :title="active.title" :bordered="true">
          <component :is="active.component" :value="getModuleValue(active)" :features="features" :apply="(val: any, f?: Record<string, any>) => updateModule(active, val, f)" />
        </a-card>
        <a-empty v-else description="请选择左侧模块" />
      </a-grid-item>
    </a-grid>

    <a-modal v-model:visible="importVisible" title="导入 JSON 配置" @ok="doImport" :mask-closable="false">
      <a-textarea v-model="importText" :auto-size="{ minRows: 8, maxRows: 20 }" placeholder="粘贴 JSON" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { jsonModules } from './components/registry'
import { getByPath, setByPath, ensurePath, deepClone } from './components/jsonUtils'
import type { JsonModule } from './components/types'

const props = defineProps<{ modelValue?: Record<string, any> }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Record<string, any>): void }>()

const config = ref<Record<string, any>>(deepClone(props.modelValue ?? {}))

watch(
  () => props.modelValue,
  (v) => {
    if (v) config.value = deepClone(v)
  },
)

// features 统一放在顶层 config.features
const features = computed<Record<string, any>>({
  get: () => {
    if (!config.value.features || typeof config.value.features !== 'object') config.value.features = {}
    return config.value.features
  },
  set: (v) => {
    config.value.features = v ?? {}
    emit('update:modelValue', config.value)
  },
})

// 确保每个模块至少有默认值（若不存在）
function ensureModuleDefault(m: JsonModule) {
  const cur = getByPath(config.value, m.path)
  if (cur === undefined) setByPath(config.value, m.path, deepClone(m.defaultValue))
  if (m.featureKey && features.value[m.featureKey] === undefined) features.value[m.featureKey] = false
}

jsonModules.forEach(ensureModuleDefault)

const activeKey = ref<string>(jsonModules[0]?.key)
const active = computed<JsonModule | undefined>(() => jsonModules.find((m) => m.key === activeKey.value))

const keyword = ref('')
const filteredModules = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return jsonModules.filter((m) => (!k ? true : m.title.toLowerCase().includes(k) || m.key.toLowerCase().includes(k)))
})

function select(key?: string) {
  if (key) activeKey.value = key
}

function toggleFeature(m: JsonModule, val: boolean) {
  if (!m.featureKey) return
  features.value = { ...features.value, [m.featureKey]: val }
}

function getModuleValue(m: JsonModule) {
  ensureModuleDefault(m)
  return getByPath(config.value, m.path)
}

function updateModule(m: JsonModule, val: Record<string, any>, f?: Record<string, any>) {
  setByPath(config.value, m.path, val)
  if (f) features.value = { ...features.value, ...f }
  emit('update:modelValue', config.value)
}

function exportJson() {
  const text = JSON.stringify(config.value, null, 2)
  if (navigator?.clipboard) navigator.clipboard.writeText(text)
}

const importVisible = ref(false)
const importText = ref('')
function openImport() {
  importText.value = JSON.stringify(config.value, null, 2)
  importVisible.value = true
}
function doImport() {
  try {
    const obj = JSON.parse(importText.value)
    config.value = ensureRoot(obj)
    emit('update:modelValue', config.value)
    importVisible.value = false
  } catch (e) {
    // ignore parse error for now
  }
}

function ensureRoot(obj: any) {
  const root = typeof obj === 'object' && obj ? obj : {}
  if (!root.features || typeof root.features !== 'object') root.features = {}
  // 确保模块默认值
  jsonModules.forEach((m) => {
    const v = getByPath(root, m.path)
    if (v === undefined) setByPath(root, m.path, deepClone(m.defaultValue))
    if (m.featureKey && root.features[m.featureKey] === undefined) root.features[m.featureKey] = false
  })
  return root
}

// 移除显式保存按钮，改为实时同步由上层接管
</script>

<style scoped>
.app-config-editor { padding: 8px; }
.side { border-right: 1px solid var(--color-border-2); min-height: 60vh; }
.main { padding-left: 8px; }
.module-list { max-height: calc(100vh - 240px); overflow: auto; }
.row { display: flex; align-items: center; justify-content: space-between; }
.title { cursor: pointer; }
.arco-list-item.active { background: var(--color-fill-2); }
</style>
