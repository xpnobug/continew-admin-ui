<template>
  <div class="gi_form_page">
    <a-card title="应用配置" :bordered="false" class="cfg-card">
      <template #extra>
        <a-space>
          <a-button @click="loadConfig">
            <template #icon><icon-refresh /></template>
            重新加载
          </a-button>
          <a-button type="primary" :loading="saving" @click="save">
            <template #icon><icon-save /></template>
            保存配置
          </a-button>
        </a-space>
      </template>
      <div class="cfg-scroll">
        <AppConfigEditor :io="io" ref="editorRef" />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { getAppSetting, getAiFabSetting, getCommentSetting, getCheckinSetting, getMultipartUploadSetting, getUserCenterSetting, getThemeDecorationSetting, saveAppSetting, saveAiFabSetting, saveCommentSetting, saveCheckinSetting, saveMultipartUploadSetting, saveUserCenterSetting, saveThemeDecorationSetting } from '@/apis/system/setting'
import type { JsonModule } from './components/types'
import AppConfigEditor from './AppConfigEditor.vue'

defineOptions({ name: 'AppConfig' })

const saving = ref(false)
const editorRef = ref<InstanceType<typeof AppConfigEditor> | null>(null)

const io = {
  async load(m: JsonModule) {
    if (m.key === 'basicInfo') {
      const { data } = await getAppSetting<any>()
      return data ?? {}
    }
    if (m.key === 'aiFab') {
      const { data } = await getAiFabSetting<any>()
      return data ?? {}
    }
    if (m.key === 'comment') {
      const { data } = await getCommentSetting<any>()
      return data ?? {}
    }
    if (m.key === 'checkin') {
      const { data } = await getCheckinSetting<any>()
      return data ?? {}
    }
    if (m.key === 'multipartUpload') {
      const { data } = await getMultipartUploadSetting<any>()
      return data ?? {}
    }
    if (m.key === 'userCenter') {
      const { data } = await getUserCenterSetting<any>()
      return data ?? {}
    }
    if (m.key === 'themeDecoration') {
      const { data } = await getThemeDecorationSetting<any>()
      return data ?? {}
    }
    return {}
  },
  async save(m: JsonModule, v: any) {
    if (m.key === 'basicInfo') return saveAppSetting(v)
    if (m.key === 'aiFab') return saveAiFabSetting(v)
    if (m.key === 'comment') return saveCommentSetting(v)
    if (m.key === 'checkin') return saveCheckinSetting(v)
    if (m.key === 'multipartUpload') return saveMultipartUploadSetting(v)
    if (m.key === 'userCenter') return saveUserCenterSetting(v)
    if (m.key === 'themeDecoration') return saveThemeDecorationSetting(v)
  },
}

const loadConfig = async () => {
  // 重置并触发当前激活模块加载
  editorRef.value?.reset()
}

const save = async () => {
  try {
    saving.value = true
    await editorRef.value?.saveAll()
    Message.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<style scoped lang="scss">
.gi_form_page { height: 100%; padding: 0; overflow: auto; }
.cfg-card { height: 100%; display: flex; flex-direction: column; margin: 0; }
.cfg-card :deep(.arco-card-body) { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: visible; }
.cfg-scroll { flex: 1; min-height: 0; overflow: auto; padding: 12px; }
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>
