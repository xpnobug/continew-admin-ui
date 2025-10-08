<template>
  <a-space direction="vertical" fill :size="12">
    <a-card :bordered="true" size="small" title="基本信息">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="12">
          <a-space align="center" fill>
            <span class="lbl">应用名称</span>
            <a-input v-model="model.appName" placeholder="请输入应用名称" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center" fill>
            <span class="lbl">应用宣传语</span>
            <a-input v-model="model.appSlogan" placeholder="让世界看见你的价值" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="24">
          <a-space direction="vertical" fill>
            <span class="lbl">应用公告</span>
            <a-textarea v-model="model.appNotice" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="24">
          <a-space direction="vertical" fill>
            <span class="lbl">应用描述</span>
            <a-textarea v-model="model.appDesc" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center" fill>
            <span class="lbl">上传类型</span>
            <a-input v-model="model.uploadType" placeholder="local / cos / s3 ..." />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">状态</span>
            <a-radio-group v-model="model.status" type="button">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="2">禁用</a-radio>
            </a-radio-group>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="版权信息">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">版权类型</span>
            <a-input-number v-model="model.copyType" :min="0" :step="1" style="width: 140px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="16">
          <a-space align="center" fill>
            <span class="lbl">版权图片</span>
            <a-input v-model="model.copyImg" placeholder="点击选择或粘贴图片URL" readonly>
              <template #suffix>
                <a-button type="text" size="mini" @click="openCopyImgSelector">
                  <icon-folder /> 选择
                </a-button>
              </template>
            </a-input>
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center" fill>
            <span class="lbl">版权文本</span>
            <a-input v-model="model.copyText" placeholder="Copyright © 2025" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center" fill>
            <span class="lbl">版权网站</span>
            <a-input v-model="model.copyWebsite" placeholder="https://example.com" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="24">
          <a-space align="center" fill>
            <span class="lbl">版权链接</span>
            <a-input v-model="model.copyLink" placeholder="https://example.com" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="功能开关">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">活动功能</span><a-switch v-model="model.isActivity" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">瀑布流</span><a-switch v-model="model.isWaterfall" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">分类功能</span><a-switch v-model="model.isClassify" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">商城功能</span><a-switch v-model="model.isNoteShop" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">视频功能</span><a-switch v-model="model.isNoteVideo" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">卡片功能</span><a-switch v-model="model.isCard" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">直播功能</span><a-switch v-model="model.isLive" /></a-space></a-grid-item>
        <a-grid-item :span="6"><a-space align="center"><span class="lbl">备忘录模式</span><a-switch v-model="model.isMemo" /></a-space></a-grid-item>
      </a-grid>
    </a-card>
    <!-- 文件选择器：版权图片 -->
    <FileSelector
      v-model="copyImgSelectorVisible"
      title="选择版权图片"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onCopyImgSelected"
      @cancel="copyImgSelectorVisible = false"
    />
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'
export const meta: JsonModuleMeta = {
  key: 'basicInfo',
  title: '基础配置',
  path: ['basic'],
  defaultValue: {
    appName: '',
    appSlogan: '',
    appNotice: '',
    appDesc: '',
    uploadType: 'local',
    status: 1,
    copyType: 1,
    copyImg: '',
    copyText: '',
    copyWebsite: '',
    copyLink: '',
    isActivity: false,
    isWaterfall: true,
    isClassify: true,
    isNoteShop: false,
    isNoteVideo: false,
    isCard: true,
    isLive: false,
    isMemo: false,
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

// 文件选择：版权图片
const copyImgSelectorVisible = ref(false)
const openCopyImgSelector = () => { copyImgSelectorVisible.value = true }
const onCopyImgSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    localValue.value.copyImg = (file as any).url as any
  }
  copyImgSelectorVisible.value = false
}
</script>

<style scoped>
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>
