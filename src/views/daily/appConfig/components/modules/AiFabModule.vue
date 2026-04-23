<template>
  <a-grid :cols="24" :col-gap="12" :row-gap="8">
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">启用</span>
        <a-switch v-model="model.enabled" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">按钮文字</span>
        <a-input v-model="model.label" placeholder="AI" style="width: 200px" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">背景样式</span>
        <a-input v-model="model.background" placeholder="CSS 背景，如 linear-gradient(...)" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">背景图片</span>
        <a-input v-model="model.bgImage" placeholder="可粘贴图片 URL 或右侧选择上传" allow-clear>
          <template #suffix>
            <a-button type="text" size="mini" @click="openBgSelector">
              <icon-folder /> 选择
            </a-button>
          </template>
        </a-input>
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center" fill>
        <span class="lbl">跳转路径</span>
        <a-input v-model="model.route" placeholder="/imaPackages/pages/agent-chat/index" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">层级</span>
        <a-input-number v-model="model.zIndex" :min="0" :step="1" style="width: 140px" placeholder="1002" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">尺寸(正方形)</span>
        <a-input-number v-model="model.size" :min="1" :step="2" style="width: 160px" placeholder="88" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">宽/高(可选)</span>
        <a-input-number v-model="model.width" :min="1" :step="2" style="width: 120px" placeholder="width(px)" />
        <a-input-number v-model="model.height" :min="1" :step="2" style="width: 120px" placeholder="height(px)" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">默认位置</span>
        <a-input-number v-model="model.defaultPosition.left" :min="0" :step="5" style="width: 120px" placeholder="left(px)" />
        <a-input-number v-model="model.defaultPosition.top" :min="0" :step="5" style="width: 120px" placeholder="top(px)" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">边距(px)</span>
        <a-input-number v-model="model.margin" :min="0" :step="1" style="width: 140px" placeholder="8" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">可拖动</span>
        <a-switch v-model="model.draggable" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="12">
      <a-space align="center">
        <span class="lbl">吸附边缘</span>
        <a-switch v-model="model.edgeSnap" />
      </a-space>
    </a-grid-item>
    <a-grid-item :span="24">
      <a-space align="center" fill>
        <span class="lbl">位置存储键</span>
        <a-input v-model="model.storageKey" placeholder="ai_fab_pos" style="max-width: 320px" />
      </a-space>
    </a-grid-item>
  </a-grid>
  <!-- 文件选择器：背景图片 -->
  <FileSelector
    v-model="bgSelectorVisible"
    title="选择背景图片"
    :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
    :only-file="true"
    :select-multiple="false"
    @select="onBgSelected"
    @cancel="bgSelectorVisible = false"
  />
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'
export const meta: JsonModuleMeta = {
  key: 'aiFab',
  title: 'AI 按钮',
  path: ['ui', 'aiFab'],
  defaultValue: {
    enabled: false,
    label: 'AI',
    background: 'linear-gradient(-29deg, #bf975c, #d2ad77)',
    bgImage: '',
    route: '/imaPackages/pages/agent-chat/index',
    zIndex: 1002,
    size: 88,
    width: undefined,
    height: undefined,
    defaultPosition: { left: 0, top: 0 },
    margin: 8,
    draggable: true,
    edgeSnap: true,
    storageKey: 'ai_fab_pos',
  },
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

// 本地副本，避免直接改动父组件的 prop，同时便于侦听深度变更
const localValue = ref<Record<string, any>>(deepClone(props.value || {}))
const syncingFromParent = ref(false)

watch(
  () => props.value,
  (v) => {
    syncingFromParent.value = true
    localValue.value = deepClone(v || {})
  },
  { deep: true }
)
watch(
  () => localValue.value,
  (v) => {
    if (syncingFromParent.value) {
      syncingFromParent.value = false
      return
    }
    // 任何字段变更均同步给父组件（实时）
    props.apply(deepClone(v))
  },
  { deep: true }
)

const model = computed(() => localValue.value)

// 文件选择：背景图片
const bgSelectorVisible = ref(false)
const openBgSelector = () => { bgSelectorVisible.value = true }
const onBgSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    localValue.value.bgImage = (file as any).url as any
  }
  bgSelectorVisible.value = false
}
</script>

<style scoped>
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>