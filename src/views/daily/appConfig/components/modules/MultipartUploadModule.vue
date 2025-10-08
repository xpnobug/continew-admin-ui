<template>
  <a-space direction="vertical" fill :size="12">
    <a-card :bordered="true" size="small" title="分片上传基础配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="24">
          <a-alert type="info">
            根据网络环境调整分片大小和并发数，可提升上传成功率。WiFi环境建议使用较大分片和较高并发，弱网环境建议使用较小分片和较低并发。
          </a-alert>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">分片大小 (MB)</span>
            <a-input-number
              v-model="model.chunkSize"
              :min="1"
              :max="20"
              :step="1"
              placeholder="3"
              style="width: 100%"
            >
              <template #append>MB</template>
            </a-input-number>
            <span class="tip">建议: WiFi 5-10MB, 4G 2-5MB, 弱网 1-2MB</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">并发分片数</span>
            <a-input-number
              v-model="model.maxConcurrent"
              :min="1"
              :max="10"
              :step="1"
              placeholder="5"
              style="width: 100%"
            />
            <span class="tip">建议: WiFi 3-5, 4G 2-3, 弱网 1-2</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">分片上传阈值 (MB)</span>
            <a-input-number
              v-model="model.chunkThreshold"
              :min="1"
              :max="50"
              :step="1"
              placeholder="5"
              style="width: 100%"
            >
              <template #append>MB</template>
            </a-input-number>
            <span class="tip">超过此大小的文件将使用分片上传</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="高级配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">最大重试次数</span>
            <a-input-number
              v-model="model.maxRetries"
              :min="1"
              :max="10"
              :step="1"
              placeholder="3"
              style="width: 100%"
            />
            <span class="tip">分片上传失败后的重试次数</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">同时上传文件数</span>
            <a-input-number
              v-model="model.maxConcurrentFiles"
              :min="1"
              :max="5"
              :step="1"
              placeholder="2"
              style="width: 100%"
            />
            <span class="tip">允许同时上传的文件数量</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">MD5计算块大小 (MB)</span>
            <a-input-number
              v-model="model.md5ChunkSize"
              :min="5"
              :max="50"
              :step="5"
              placeholder="10"
              style="width: 100%"
            >
              <template #append>MB</template>
            </a-input-number>
            <span class="tip">计算文件MD5时的分块大小</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="网络环境预设">
      <a-space direction="vertical" fill>
        <a-alert type="info">
          快速应用推荐配置，点击按钮将自动填充对应环境的最佳参数
        </a-alert>
        <a-space :size="12">
          <a-button type="outline" @click="applyPreset('wifi')">
            <template #icon><icon-wifi /></template>
            WiFi环境
          </a-button>
          <a-button type="outline" @click="applyPreset('4g')">
            <template #icon><icon-mobile /></template>
            4G环境
          </a-button>
          <a-button type="outline" @click="applyPreset('weak')">
            <template #icon><icon-sync /></template>
            弱网环境
          </a-button>
          <a-button type="outline" @click="applyPreset('default')">
            <template #icon><icon-settings /></template>
            恢复默认
          </a-button>
        </a-space>
      </a-space>
    </a-card>
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'multipartUpload',
  title: '分片上传',
  path: ['modules', 'multipartUpload'],
  defaultValue: {
    chunkSize: 3,           // 分片大小(MB)
    maxConcurrent: 5,       // 并发分片数
    chunkThreshold: 5,      // 分片上传阈值(MB)
    maxRetries: 3,          // 最大重试次数
    maxConcurrentFiles: 2,  // 同时上传文件数
    md5ChunkSize: 10        // MD5计算块大小(MB)
  }
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { deepClone } from '../jsonUtils'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

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
    props.apply(deepClone(v))
  },
  { deep: true }
)

const model = computed(() => localValue.value)

// 网络环境预设配置
const presets = {
  wifi: {
    chunkSize: 10,
    maxConcurrent: 5,
    chunkThreshold: 10,
    maxRetries: 3,
    maxConcurrentFiles: 2,
    md5ChunkSize: 10
  },
  '4g': {
    chunkSize: 5,
    maxConcurrent: 3,
    chunkThreshold: 5,
    maxRetries: 3,
    maxConcurrentFiles: 2,
    md5ChunkSize: 10
  },
  weak: {
    chunkSize: 2,
    maxConcurrent: 2,
    chunkThreshold: 3,
    maxRetries: 5,
    maxConcurrentFiles: 1,
    md5ChunkSize: 10
  },
  default: {
    chunkSize: 3,
    maxConcurrent: 5,
    chunkThreshold: 5,
    maxRetries: 3,
    maxConcurrentFiles: 2,
    md5ChunkSize: 10
  }
}

// 应用预设配置
function applyPreset(type: 'wifi' | '4g' | 'weak' | 'default') {
  Object.assign(localValue.value, presets[type])
}
</script>

<style scoped>
.lbl {
  color: var(--color-text-2);
  font-weight: 500;
  font-size: 13px;
}
.tip {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: -4px;
}
</style>
