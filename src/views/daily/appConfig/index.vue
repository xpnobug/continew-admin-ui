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
                <a-grid :cols="24" :col-gap="12" :row-gap="8">
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">悬浮AI按钮</span>
                      <a-switch v-model="vCfg.features.isAiFab" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center" fill>
                      <span class="lbl">按钮文字</span>
                      <a-input v-model="vCfg.ui.aiFab.label" placeholder="AI" style="width: 200px" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center" fill>
                      <span class="lbl">背景样式</span>
                      <a-input v-model="vCfg.ui.aiFab.background" placeholder="CSS 背景，如 linear-gradient(...)" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center" fill>
                      <span class="lbl">跳转路径</span>
                      <a-input v-model="vCfg.ui.aiFab.route" placeholder="/imaPackages/pages/agent-chat/index" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">层级</span>
                      <a-input-number v-model="vCfg.ui.aiFab.zIndex" :min="0" :step="1" style="width: 140px" placeholder="1002" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">尺寸(正方形)</span>
                      <a-input-number v-model="vCfg.ui.aiFab.size" :min="1" :step="2" style="width: 160px" placeholder="88" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">宽/高(可选)</span>
                      <a-input-number v-model="vCfg.ui.aiFab.width" :min="1" :step="2" style="width: 120px" placeholder="width(px)" />
                      <a-input-number v-model="vCfg.ui.aiFab.height" :min="1" :step="2" style="width: 120px" placeholder="height(px)" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">AI按钮默认位置</span>
                      <a-input-number v-model="vCfg.ui.aiFab.defaultPosition.left" :min="0" :step="5" style="width: 120px" placeholder="left(px)" />
                      <a-input-number v-model="vCfg.ui.aiFab.defaultPosition.top" :min="0" :step="5" style="width: 120px" placeholder="top(px)" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">边距(px)</span>
                      <a-input-number v-model="vCfg.ui.aiFab.margin" :min="0" :step="1" style="width: 140px" placeholder="8" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">可拖动</span>
                      <a-switch v-model="vCfg.ui.aiFab.draggable" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="12">
                    <a-space align="center">
                      <span class="lbl">吸附边缘</span>
                      <a-switch v-model="vCfg.ui.aiFab.edgeSnap" />
                    </a-space>
                  </a-grid-item>
                  <a-grid-item :span="24">
                    <a-space align="center" fill>
                      <span class="lbl">位置存储键</span>
                      <a-input v-model="vCfg.ui.aiFab.storageKey" placeholder="ai_fab_pos" style="max-width: 320px" />
                    </a-space>
                  </a-grid-item>
                </a-grid>
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

// ------------------ JSON 可视化联动 ------------------
const vCfg = reactive({
  features: { isAiFab: true },
  ui: {
    aiFab: {
      label: 'AI',
      background: 'linear-gradient(-29deg, #bf975c, #d2ad77)',
      route: '/imaPackages/pages/agent-chat/index',
      zIndex: 1002,
      size: 88,
      width: undefined as number | undefined,
      height: undefined as number | undefined,
      defaultPosition: { left: 0, top: 0 },
      margin: 8,
      draggable: true,
      edgeSnap: true,
      storageKey: 'ai_fab_pos',
    },
  },
})

let syncingFromJson = false
let syncingToJson = false

const parseAndSyncFromJson = () => {
  if (syncingToJson) return
  try {
    const obj = form.configJson ? JSON.parse(form.configJson) : {}
    syncingFromJson = true
    // features
    const isAiFab = Boolean(obj?.features?.isAiFab ?? vCfg.features.isAiFab)
    if (vCfg.features.isAiFab !== isAiFab) vCfg.features.isAiFab = isAiFab
    // 仅使用 ui.aiFab（保持与前端读取一致）
    const ai = obj?.ui?.aiFab || {}
    // 基础
    if (typeof ai.label === 'string' && vCfg.ui.aiFab.label !== ai.label) vCfg.ui.aiFab.label = ai.label
    if (typeof ai.background === 'string' && vCfg.ui.aiFab.background !== ai.background) vCfg.ui.aiFab.background = ai.background
    if (typeof ai.route === 'string' && vCfg.ui.aiFab.route !== ai.route) vCfg.ui.aiFab.route = ai.route
    if (Number.isFinite(ai.zIndex) && vCfg.ui.aiFab.zIndex !== ai.zIndex) vCfg.ui.aiFab.zIndex = ai.zIndex
    if (Number.isFinite(ai.size) && vCfg.ui.aiFab.size !== ai.size) vCfg.ui.aiFab.size = ai.size
    if (Number.isFinite(ai.width) && vCfg.ui.aiFab.width !== ai.width) vCfg.ui.aiFab.width = ai.width
    if (Number.isFinite(ai.height) && vCfg.ui.aiFab.height !== ai.height) vCfg.ui.aiFab.height = ai.height
    if (Number.isFinite(ai.margin) && vCfg.ui.aiFab.margin !== ai.margin) vCfg.ui.aiFab.margin = ai.margin
    if (typeof ai.draggable === 'boolean' && vCfg.ui.aiFab.draggable !== ai.draggable) vCfg.ui.aiFab.draggable = ai.draggable
    if (typeof ai.edgeSnap === 'boolean' && vCfg.ui.aiFab.edgeSnap !== ai.edgeSnap) vCfg.ui.aiFab.edgeSnap = ai.edgeSnap
    if (typeof ai.storageKey === 'string' && vCfg.ui.aiFab.storageKey !== ai.storageKey) vCfg.ui.aiFab.storageKey = ai.storageKey
    const lp = ai.defaultPosition || {}
    if (Number.isFinite(lp.left) && vCfg.ui.aiFab.defaultPosition.left !== lp.left) vCfg.ui.aiFab.defaultPosition.left = lp.left
    if (Number.isFinite(lp.top) && vCfg.ui.aiFab.defaultPosition.top !== lp.top) vCfg.ui.aiFab.defaultPosition.top = lp.top
  } catch (e) {
    // ignore parse error here,校验在保存时处理
  } finally {
    syncingFromJson = false
  }
}

const syncVisualToJson = () => {
  if (syncingFromJson) return
  try {
    const obj = form.configJson ? JSON.parse(form.configJson) : {}
    // 写入 features
    obj.features = obj.features || {}
    obj.features.isAiFab = vCfg.features.isAiFab
    // 写入 ui.aiFab
    obj.ui = obj.ui || {}
    obj.ui.aiFab = obj.ui.aiFab || {}
    obj.ui.aiFab.label = vCfg.ui.aiFab.label
    obj.ui.aiFab.background = vCfg.ui.aiFab.background
    obj.ui.aiFab.route = vCfg.ui.aiFab.route
    obj.ui.aiFab.zIndex = vCfg.ui.aiFab.zIndex
    if (vCfg.ui.aiFab.size) {
      obj.ui.aiFab.size = vCfg.ui.aiFab.size
      delete obj.ui.aiFab.width
      delete obj.ui.aiFab.height
    } else {
      if (vCfg.ui.aiFab.width) obj.ui.aiFab.width = vCfg.ui.aiFab.width
      if (vCfg.ui.aiFab.height) obj.ui.aiFab.height = vCfg.ui.aiFab.height
      delete obj.ui.aiFab.size
    }
    obj.ui.aiFab.margin = vCfg.ui.aiFab.margin
    obj.ui.aiFab.draggable = vCfg.ui.aiFab.draggable
    obj.ui.aiFab.edgeSnap = vCfg.ui.aiFab.edgeSnap
    obj.ui.aiFab.storageKey = vCfg.ui.aiFab.storageKey
    obj.ui.aiFab.defaultPosition = {
      left: vCfg.ui.aiFab.defaultPosition.left,
      top: vCfg.ui.aiFab.defaultPosition.top,
    }
    const next = JSON.stringify(obj, null, 2)
    if (form.configJson !== next) {
      syncingToJson = true
      form.configJson = next
      // 在下一事件循环取消标记，避免递归
      setTimeout(() => { syncingToJson = false }, 0)
    }
  } catch (e) {
    // 如果现有JSON不可解析，则以vCfg生成
    const obj = {
      features: { isAiFab: vCfg.features.isAiFab },
      ui: { aiFab: { defaultPosition: { ...vCfg.ui.aiFab.defaultPosition } } },
    }
    const next = JSON.stringify(obj, null, 2)
    if (form.configJson !== next) {
      syncingToJson = true
      form.configJson = next
      setTimeout(() => { syncingToJson = false }, 0)
    }
  } finally {
    // no-op
  }
}

watch(() => form.configJson, parseAndSyncFromJson)
watch(
  () => [
    vCfg.features.isAiFab,
    vCfg.ui.aiFab.label,
    vCfg.ui.aiFab.background,
    vCfg.ui.aiFab.route,
    vCfg.ui.aiFab.zIndex,
    vCfg.ui.aiFab.size,
    vCfg.ui.aiFab.width,
    vCfg.ui.aiFab.height,
    vCfg.ui.aiFab.defaultPosition.left,
    vCfg.ui.aiFab.defaultPosition.top,
    vCfg.ui.aiFab.margin,
    vCfg.ui.aiFab.draggable,
    vCfg.ui.aiFab.edgeSnap,
    vCfg.ui.aiFab.storageKey,
  ],
  syncVisualToJson,
  { deep: true }
)
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
