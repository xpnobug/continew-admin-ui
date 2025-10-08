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
          <component :is="active.component" :value="getModuleValue(active)" :apply="(val: any) => updateModule(active, val)" />
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
import { computed, ref, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { jsonModules } from './components/registry'
import { getByPath, setByPath, deepClone } from './components/jsonUtils'
import type { JsonModule } from './components/types'

type EditorIO = {
  load: (m: JsonModule) => Promise<any>
  save: (m: JsonModule, v: any) => Promise<void>
}

const props = defineProps<{ modelValue?: Record<string, any>; io?: EditorIO }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Record<string, any>): void }>()

// 复用旧模式（合并型）以兼容历史调用；若提供 io，则使用按模块独立加载/保存模式
const useIo = computed(() => !!props.io)

const config = ref<Record<string, any>>(deepClone(props.modelValue ?? {}))
const moduleValues = ref<Record<string, any>>({})
const saveTimers = ref<Record<string, any>>({})

watch(
  () => props.modelValue,
  (v) => {
    if (!useIo.value && v) config.value = deepClone(v)
  },
)

// 确保每个模块至少有默认值（若不存在）
function ensureModuleDefault(m: JsonModule) {
  if (useIo.value) {
    if (moduleValues.value[m.key] === undefined) moduleValues.value[m.key] = deepClone(m.defaultValue)
    return
  }
  const cur = getByPath(config.value, m.path)
  if (cur === undefined) setByPath(config.value, m.path, deepClone(m.defaultValue))
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

function getModuleValue(m: JsonModule) {
  ensureModuleDefault(m)
  if (useIo.value) return moduleValues.value[m.key]
  return getByPath(config.value, m.path)
}

async function updateModule(m: JsonModule, val: Record<string, any>) {
  if (useIo.value && props.io) {
    moduleValues.value[m.key] = val
    scheduleModuleSave(m)
    return
  }
  setByPath(config.value, m.path, val)
  emit('update:modelValue', config.value)
}

function scheduleModuleSave(m: JsonModule) {
  if (!props.io) return
  const key = m.key
  if (saveTimers.value[key]) clearTimeout(saveTimers.value[key])
  saveTimers.value[key] = setTimeout(async () => {
    try {
      await props.io!.save(m, moduleValues.value[key])
      Message.success({ content: `已自动保存 · ${m.title}`, duration: 1000 })
    } finally {
      saveTimers.value[key] = null
    }
  }, 800)
}

function exportJson() {
  const text = JSON.stringify(config.value, null, 2)
  if (navigator?.clipboard) navigator.clipboard.writeText(text)
}

const importVisible = ref(false)
const importText = ref('')
function openImport() {
  const data = useIo.value ? moduleValues.value : config.value
  importText.value = JSON.stringify(data, null, 2)
  importVisible.value = true
}
function doImport() {
  try {
    const obj = JSON.parse(importText.value)
    if (useIo.value) {
      // 仅导入当前模块
      if (active.value) {
        moduleValues.value[active.value.key] = deepClone(obj)
        scheduleModuleSave(active.value)
      }
    } else {
      config.value = ensureRoot(obj)
      emit('update:modelValue', config.value)
    }
    importVisible.value = false
  } catch (e) {
    // ignore parse error for now
  }
}

function ensureRoot(obj: any) {
  const root = typeof obj === 'object' && obj ? obj : {}
  // 确保模块默认值
  jsonModules.forEach((m) => {
    const v = getByPath(root, m.path)
    if (v === undefined) setByPath(root, m.path, deepClone(m.defaultValue))
  })
  return root
}

// 移除显式保存按钮，改为实时同步由上层接管

async function loadActive() {
  if (!useIo.value || !props.io || !active.value) return
  const data = await props.io.load(active.value)
  moduleValues.value[active.value.key] = deepClone(data ?? active.value.defaultValue)
}

watch(
  active,
  async (newVal, oldVal) => {
    if (!useIo.value || !props.io) return
    // flush pending save for previous module
    if (oldVal && saveTimers.value[oldVal.key]) {
      clearTimeout(saveTimers.value[oldVal.key])
      saveTimers.value[oldVal.key] = null
      try {
        await props.io.save(oldVal, moduleValues.value[oldVal.key])
      } catch (e) {
        // ignore
      }
    }
    // always reload newly activated module
    if (newVal) {
      await loadActive()
    }
  },
  { immediate: true }
)

async function saveAll() {
  if (!useIo.value || !props.io) return
  for (const m of jsonModules) {
    const v = moduleValues.value[m.key]
    if (v !== undefined) await props.io.save(m, v)
  }
}

function getValues() {
  return useIo.value ? deepClone(moduleValues.value) : deepClone(config.value)
}
function reset() {
  if (useIo.value) {
    moduleValues.value = {}
    loadActiveIfNeeded()
  } else {
    config.value = {}
  }
}

defineExpose({ saveAll, getValues, reset })
</script>

<style scoped>
.app-config-editor { padding: 8px; }
/* 左侧固定，随页面滚动保持在视口内 */
.side {
  position: sticky;
  top: 0;
  align-self: flex-start;
}
.main { padding-left: 8px; }
/* 左侧模块列表内部滚动 */
.module-list {
  max-height: calc(100vh - 180px);
  overflow: auto;
}
.row { display: flex; align-items: center; justify-content: space-between; }
.title { cursor: pointer; }
.arco-list-item.active { background: var(--color-fill-2); }
</style>
