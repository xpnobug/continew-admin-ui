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
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="base" title="基础配置">
            <GiForm
              ref="formRefBase"
              v-model="form"
              :columns="columnsBase"
              :layout="'vertical'"
            />
          </a-tab-pane>
          <a-tab-pane key="json" title="扩展JSON">
            <a-space direction="vertical" fill>
              <a-card size="small" :bordered="true" title="可视化配置">
                <AppConfigEditor v-model="editorCfg" />
              </a-card>
              <a-textarea
                v-model="form.configJson"
                :auto-size="{ minRows: 12, maxRows: 30 }"
                allow-clear
                class="json-editor"
                placeholder='{"features": {"isAiFab": true}, "ui": {"aiFab": {"size": 88, "defaultPosition": {"left": 320, "top": 520}}}}'
              />
              <div class="tip">配置JSON将覆盖部分开关（features），用于扩展自定义配置。上方为可视化编辑（会同步到JSON）。</div>
            </a-space>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { addAppConfig, listAppConfig, updateAppConfig } from '@/apis/daily/appConfig'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

defineOptions({ name: 'AppConfig' })

const { common_type, common02_type } = useDict('common_type', 'common02_type')

const formRefBase = ref<InstanceType<typeof GiForm>>()
const activeTab = ref('base')
const dataId = ref<string>('')
const saving = ref(false)
let autoSaveTimer: any = null

const [form, resetForm] = useResetReactive({
  appName: '',
  appSlogan: '',
  appNotice: '',
  appDesc: '',
  uploadType: 'local',
  status: 1,
  copyType: undefined as any,
  copyImg: '',
  copyText: '',
  copyWebsite: '',
  copyLink: '',
  isActivity: false,
  isWaterfall: false,
  isClassify: false,
  isNoteShop: false,
  isNoteVideo: false,
  isCard: false,
  isLive: false,
  isMemo: false,
  configJson: ''
})

const columnsBase: ColumnItem[] = reactive([
  { label: '基本信息', field: 'basic-info', type: 'title', span: 24 },
  { label: '应用名称', field: 'appName', type: 'input', span: 12, required: true },
  { label: '应用宣传语', field: 'appSlogan', type: 'input', span: 12 },
  { label: '应用公告', field: 'appNotice', type: 'textarea', span: 24, props: { rows: 3, maxLength: 255, showWordLimit: true } },
  { label: '应用描述', field: 'appDesc', type: 'textarea', span: 24, props: { rows: 3, maxLength: 255, showWordLimit: true } },
  { label: '上传类型', field: 'uploadType', type: 'input', span: 12 },
  { label: '状态', field: 'status', type: 'radio-group', span: 12, required: true, props: { options: common_type } },

  { label: '版权信息', field: 'copyright-info', type: 'title', span: 24 },
  { label: '版权类型', field: 'copyType', type: 'input', span: 12 },
  { label: '版权图片', field: 'copyImg', type: 'input', span: 12 },
  { label: '版权文本', field: 'copyText', type: 'input', span: 12 },
  { label: '版权网站', field: 'copyWebsite', type: 'input', span: 12 },
  { label: '版权链接', field: 'copyLink', type: 'input', span: 12 },

  { label: '功能开关', field: 'feature-switches', type: 'title', span: 24 },
  { label: '活动功能', field: 'isActivity', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '瀑布流', field: 'isWaterfall', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '分类功能', field: 'isClassify', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '商城功能', field: 'isNoteShop', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '视频功能', field: 'isNoteVideo', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '卡片功能', field: 'isCard', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '直播功能', field: 'isLive', type: 'switch', span: 6, props: { options: common02_type } },
  { label: '备忘录模式', field: 'isMemo', type: 'switch', span: 6, props: { options: common02_type } },
])

const loadConfig = async () => {
  const { data } = await listAppConfig({ page: 1, size: 1, sort: ['id,desc'] } as any)
  const items = Array.isArray(data) ? data : data.list
  if (items && items.length) {
    dataId.value = (items[0] as any).id
    Object.assign(form, items[0])
  } else {
    dataId.value = ''
    resetForm()
  }
}

const save = async () => {
  const invalid = await formRefBase.value?.formRef?.validate()
  if (invalid) return
  // 校验JSON
  if (form.configJson) {
    try { JSON.parse(form.configJson) } catch (e) {
      Message.error('配置JSON格式不正确')
      return
    }
  }
  try {
    saving.value = true
    if (dataId.value) {
      await updateAppConfig(form, dataId.value)
      Message.success('保存成功')
    } else {
      const res = await addAppConfig(form)
      Message.success('创建成功')
      await loadConfig()
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)

// ------------------ JSON 可视化联动（模块化） ------------------
import AppConfigEditor from './AppConfigEditor.vue'
import { jsonModules } from './components/registry'
import { deepClone, getByPath, setByPath } from './components/jsonUtils'

const editorCfg = ref<Record<string, any>>({})
let syncingFromJson = false
let syncingToJson = false

function ensureDefaults(obj: any) {
  const root = typeof obj === 'object' && obj ? obj : {}
  if (!root.features || typeof root.features !== 'object') root.features = {}
  jsonModules.forEach((m) => {
    const cur = getByPath(root, m.path)
    if (cur === undefined) setByPath(root, m.path, deepClone(m.defaultValue))
    if (m.featureKey && root.features[m.featureKey] === undefined) root.features[m.featureKey] = false
  })
  return root
}

const parseAndSyncFromJson = () => {
  if (syncingToJson) return
  try {
    const obj = form.configJson ? JSON.parse(form.configJson) : {}
    syncingFromJson = true
    editorCfg.value = ensureDefaults(obj)
  } catch (e) {
    // ignore parse error; 保持编辑器当前值
  } finally {
    syncingFromJson = false
  }
}

const syncEditorToJson = () => {
  if (syncingFromJson) return
  try {
    const next = JSON.stringify(editorCfg.value ?? {}, null, 2)
    if (form.configJson !== next) {
      syncingToJson = true
      form.configJson = next
      setTimeout(() => { syncingToJson = false }, 0)
      scheduleAutoSave()
    }
  } catch (e) {
    // no-op
  }
}

watch(() => form.configJson, parseAndSyncFromJson)
watch(editorCfg, syncEditorToJson, { deep: true })

// 取消显式保存回调，改为实时同步由 watcher 完成

function scheduleAutoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    autoSaveTimer = null
    autoSave()
  }, 800) // 800ms 防抖
}

async function autoSave() {
  // 若未加载到任何数据（首次创建前），不自动保存
  if (!form.appName && !form.configJson) return
  // 校验 JSON
  try { if (form.configJson) JSON.parse(form.configJson) } catch { return }
  // 避免与手动保存冲突
  if (saving.value) return
  try {
    saving.value = true
    if (dataId.value) {
      await updateAppConfig(form, dataId.value)
    } else {
      const res = await addAppConfig(form)
      // 兼容接口返回结构
      const newId = (res && (res.id || res.data?.id)) || ''
      if (newId) dataId.value = String(newId)
    }
    Message.success('已自动保存')
  } catch (e) {
    // 静默失败（可按需提示）
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.gi_form_page { height: 100%; padding: 0; overflow: auto; }
.cfg-card { height: 100%; display: flex; flex-direction: column; margin: 0; }
.cfg-card :deep(.arco-card-body) { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.cfg-scroll { flex: 1; min-height: 0; overflow: auto; padding: 12px; }
.tip {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: 8px;
}

/* 配置JSON 区域优化 */
:deep(.arco-form-item[data-field="configJson"]) .arco-textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
:deep(.arco-form-item[data-field="configJson"]) .arco-textarea textarea {
  line-height: 1.6;
}
.json-editor {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>
