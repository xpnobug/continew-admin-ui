<template>
  <a-space direction="vertical" fill :size="12">
    <a-card :bordered="true" size="small" title="签到基础设置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">签到总天数</span>
            <a-input-number v-model="model.totalDays" :min="1" :max="365" :step="1" style="width: 140px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">默认展开天数</span>
            <a-input-number v-model="model.defaultExpandDays" :min="1" :max="model.totalDays" :step="1" style="width: 140px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">断签重置进度</span>
            <a-switch v-model="model.resetOnMiss" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="按钮文案与样式配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">已签到文案</span>
            <a-input v-model="model.buttonText.checked" placeholder="今日已打卡" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">签到中文案</span>
            <a-input v-model="model.buttonText.checking" placeholder="打卡中..." />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">未签到文案</span>
            <a-input v-model="model.buttonText.unchecked" placeholder="打卡领取福利" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">按钮背景色</span>
            <a-input v-model="model.buttonStyle.backgroundColor" placeholder="#FF6B6B">
              <template #prefix>
                <div :style="{ width: '16px', height: '16px', backgroundColor: model.buttonStyle.backgroundColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
              </template>
              <template #suffix>
                <a-popover trigger="click" position="bottom" v-model:popup-visible="showBgColorPicker">
                  <template #content>
                    <ColorPicker theme="light" :color="model.buttonStyle.backgroundColor || '#FF6B6B'" :sucker-hide="true" @change-color="onPickBgColor" />
                  </template>
                  <a-button type="text" size="mini">取色</a-button>
                </a-popover>
              </template>
            </a-input>
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">按钮字体颜色</span>
            <a-input v-model="model.buttonStyle.color" placeholder="#FFFFFF">
              <template #prefix>
                <div :style="{ width: '16px', height: '16px', backgroundColor: model.buttonStyle.color, border: '1px solid #ddd', borderRadius: '2px' }"></div>
              </template>
              <template #suffix>
                <a-popover trigger="click" position="bottom" v-model:popup-visible="showTextColorPicker">
                  <template #content>
                    <ColorPicker theme="light" :color="model.buttonStyle.color || '#FFFFFF'" :sucker-hide="true" @change-color="onPickTextColor" />
                  </template>
                  <a-button type="text" size="mini">取色</a-button>
                </a-popover>
              </template>
            </a-input>
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">按钮字体大小</span>
            <a-input-number v-model="model.buttonStyle.fontSize" :min="12" :max="32" :step="1" placeholder="16">
              <template #append>px</template>
            </a-input-number>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="签到图标配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="24">
          <a-alert type="info">点击"选择"按钮从文件管理器选择图片，或直接输入URL地址</a-alert>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">已签到图标</span>
            <a-input v-model="model.icons.signed" placeholder="/static/welfare/signed.png" readonly>
              <template #suffix>
                <a-button type="text" size="mini" @click="openIconSelector('signed')">
                  <icon-folder /> 选择
                </a-button>
              </template>
            </a-input>
            <img v-if="model.icons.signed" :src="model.icons.signed" style="width: 48px; height: 48px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px;" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">未签到图标</span>
            <a-input v-model="model.icons.unsigned" placeholder="/static/welfare/no_signed.png" readonly>
              <template #suffix>
                <a-button type="text" size="mini" @click="openIconSelector('unsigned')">
                  <icon-folder /> 选择
                </a-button>
              </template>
            </a-input>
            <img v-if="model.icons.unsigned" :src="model.icons.unsigned" style="width: 48px; height: 48px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px;" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">积分奖励图标</span>
            <a-input v-model="model.icons.reward" placeholder="/static/welfare/carrot_points.png" readonly>
              <template #suffix>
                <a-button type="text" size="mini" @click="openIconSelector('reward')">
                  <icon-folder /> 选择
                </a-button>
              </template>
            </a-input>
            <img v-if="model.icons.reward" :src="model.icons.reward" style="width: 48px; height: 48px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px;" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <!-- 文件选择器：签到图标 -->
    <FileSelector
      v-model="iconSelectorVisible"
      title="选择图标"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onIconSelected"
      @cancel="iconSelectorVisible = false"
    />

    <a-card :bordered="true" size="small" title="签到奖励配置">
      <a-space direction="vertical" fill>
        <a-alert type="info">每天的签到积分奖励,格式:天数=积分(如: 1=5 表示第1天奖励5积分)</a-alert>
        <a-grid :cols="24" :col-gap="12" :row-gap="8">
          <a-grid-item v-for="day in displayedDays" :key="day" :span="4">
            <a-space align="center">
              <span class="day-label">第{{ day }}天</span>
              <a-input-number v-model="model.rewards[day]" :min="0" :step="1" style="width: 100px" placeholder="积分" />
            </a-space>
          </a-grid-item>
        </a-grid>
        <a-button v-if="model.totalDays > 30" type="text" @click="showAllDays = !showAllDays">
          {{ showAllDays ? '收起' : `展开全部(${model.totalDays}天)` }}
        </a-button>
      </a-space>
    </a-card>

    <a-card :bordered="true" size="small" title="温馨提示">
      <a-space direction="vertical" fill>
        <span class="lbl">提示内容（每行一个）</span>
        <a-textarea v-model="tipsText" :auto-size="{ minRows: 3, maxRows: 8 }" placeholder="连续签到可获得更多积分,断签将重置进度&#10;若遇异常,可稍后重试或联系管理员" />
      </a-space>
    </a-card>
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'
export const meta: JsonModuleMeta = {
  key: 'checkin',
  title: '签到配置',
  path: ['modules', 'checkin'],
  defaultValue: {
    totalDays: 30,
    defaultExpandDays: 14,
    resetOnMiss: true,
    rewards: {
      1: 5, 2: 5, 3: 5, 4: 5, 5: 5,
      6: 8, 7: 8, 8: 8, 9: 8, 10: 8,
      11: 8, 12: 8, 13: 15, 14: 10, 15: 10,
      16: 10, 17: 10, 18: 10, 19: 10, 20: 20,
      21: 12, 22: 12, 23: 12, 24: 12, 25: 12,
      26: 12, 27: 12, 28: 12, 29: 30, 30: 50
    },
    buttonText: {
      checked: '今日已打卡',
      checking: '打卡中...',
      unchecked: '打卡领取福利'
    },
    buttonStyle: {
      backgroundColor: '#FF6B6B',
      color: '#FFFFFF',
      fontSize: 16
    },
    icons: {
      signed: '/static/welfare/signed.png',
      unsigned: '/static/welfare/no_signed.png',
      reward: '/static/welfare/carrot_points.png'
    },
    tips: [
      '连续签到可获得更多积分,断签将重置进度',
      '若遇异常,可稍后重试或联系管理员'
    ]
  },
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

const localValue = ref<Record<string, any>>(deepClone(props.value || {}))
const syncingFromParent = ref(false)
const showAllDays = ref(false)

// 图标文件选择器
const iconSelectorVisible = ref(false)
const currentIconType = ref<'signed' | 'unsigned' | 'reward'>('signed')

const openIconSelector = (type: 'signed' | 'unsigned' | 'reward') => {
  currentIconType.value = type
  iconSelectorVisible.value = true
}

const onIconSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    if (!localValue.value.icons) localValue.value.icons = {}
    localValue.value.icons[currentIconType.value] = (file as any).url
  }
  iconSelectorVisible.value = false
}

// 颜色选择器
const showBgColorPicker = ref(false)
const showTextColorPicker = ref(false)

interface ColorObj { hex: string }

const onPickBgColor = (c: ColorObj) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) {
    if (!localValue.value.buttonStyle) localValue.value.buttonStyle = {}
    localValue.value.buttonStyle.backgroundColor = c.hex
  }
}

const onPickTextColor = (c: ColorObj) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) {
    if (!localValue.value.buttonStyle) localValue.value.buttonStyle = {}
    localValue.value.buttonStyle.color = c.hex
  }
}

// 进入模块时对数据做一次规整，避免控件基于约束自行改值从而触发"伪变更"
function normalize(v: Record<string, any>) {
  const clamp = (n: any, min: number, max: number, fallback: number) => {
    const x = Number.isFinite(n) ? Number(n) : fallback
    return Math.min(max, Math.max(min, x))
  }
  v.totalDays = clamp(v.totalDays, 1, 365, 30)
  v.defaultExpandDays = clamp(v.defaultExpandDays, 1, v.totalDays, Math.min(14, v.totalDays))
  v.resetOnMiss = !!v.resetOnMiss
  v.buttonText = v.buttonText || {}
  v.buttonText.checked = typeof v.buttonText.checked === 'string' ? v.buttonText.checked : '今日已打卡'
  v.buttonText.checking = typeof v.buttonText.checking === 'string' ? v.buttonText.checking : '打卡中...'
  v.buttonText.unchecked = typeof v.buttonText.unchecked === 'string' ? v.buttonText.unchecked : '打卡领取福利'
  v.buttonStyle = v.buttonStyle || {}
  v.buttonStyle.backgroundColor = typeof v.buttonStyle.backgroundColor === 'string' ? v.buttonStyle.backgroundColor : '#FF6B6B'
  v.buttonStyle.color = typeof v.buttonStyle.color === 'string' ? v.buttonStyle.color : '#FFFFFF'
  v.buttonStyle.fontSize = clamp(v.buttonStyle.fontSize, 12, 32, 16)
  v.icons = v.icons || {}
  v.icons.signed = typeof v.icons.signed === 'string' ? v.icons.signed : '/static/welfare/signed.png'
  v.icons.unsigned = typeof v.icons.unsigned === 'string' ? v.icons.unsigned : '/static/welfare/no_signed.png'
  v.icons.reward = typeof v.icons.reward === 'string' ? v.icons.reward : '/static/welfare/carrot_points.png'
  v.rewards = (v.rewards && typeof v.rewards === 'object') ? v.rewards : {}
  // 不强制填充所有天数奖励，保留后端已有；仅确保类型为数字或未定义
  Object.keys(v.rewards).forEach((k) => {
    const raw = (v.rewards as any)[k]
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num)) (v.rewards as any)[k] = num
    else delete (v.rewards as any)[k]
  })
  v.tips = Array.isArray(v.tips) ? v.tips.map((x: any) => String(x)) : ['连续签到可获得更多积分,断签将重置进度', '若遇异常,可稍后重试或联系管理员']
}

watch(
  () => props.value,
  (v) => {
    syncingFromParent.value = true
    const nv = deepClone(v || {})
    normalize(nv)
    localValue.value = nv
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

// 计算显示的天数范围
const displayedDays = computed(() => {
  const total = model.value.totalDays || 30
  if (showAllDays.value) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  return Array.from({ length: Math.min(30, total) }, (_, i) => i + 1)
})

// 文本域 <-> 数组 映射
const nl = /\r?\n/
const arr2text = (arr?: any[]) => Array.isArray(arr) ? arr.join('\n') : ''
const text2arr = (s: string) => s.split(nl).map(x => x.trim()).filter(Boolean)

const tipsText = computed({
  get: () => arr2text(model.value.tips),
  set: (s: string) => {
    model.value.tips = text2arr(s)
  },
})
</script>

<style scoped>
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
.day-label { color: var(--color-text-2); font-size: 12px; min-width: 50px; }
</style>
