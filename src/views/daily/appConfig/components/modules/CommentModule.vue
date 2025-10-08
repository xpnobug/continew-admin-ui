<template>
  <a-space direction="vertical" fill :size="12">
    <a-card :bordered="true" size="small" title="基础设置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">启用评论</span>
            <a-switch v-model="model.enabled" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">模式</span>
            <a-radio-group v-model="model.mode" type="button">
              <a-radio value="off">关闭</a-radio>
              <a-radio value="pre">先审后发</a-radio>
              <a-radio value="post">先发后审</a-radio>
            </a-radio-group>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="敏感词配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">词表（每行一个）</span>
            <a-textarea v-model="blocklistText" :auto-size="{ minRows: 4, maxRows: 8 }" placeholder="广告\n低俗\n违禁品" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">正则（每行一个）</span>
            <a-textarea v-model="regexText" :auto-size="{ minRows: 4, maxRows: 8 }" placeholder="(?i)某\\s*品牌" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">白名单（每行一个）</span>
            <a-textarea v-model="whitelistText" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="合法例外词" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">命中处理策略</span>
            <a-radio-group v-model="model.sensitive.action" type="button">
              <a-radio value="reject">拒绝</a-radio>
              <a-radio value="mask">脱敏</a-radio>
              <a-radio value="review">转人工审核</a-radio>
            </a-radio-group>
            <a-space align="center">
              <span class="lbl">掩码字符</span>
              <a-input v-model="model.sensitive.maskChar" style="width: 120px" placeholder="*" />
              <a-checkbox v-model="model.sensitive.maskFully">整条替换</a-checkbox>
            </a-space>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="频率与长度限制">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">最小长度</span>
            <a-input-number v-model="model.limits.minLen" :min="0" :step="1" style="width: 140px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">最大长度</span>
            <a-input-number v-model="model.limits.maxLen" :min="1" :step="1" style="width: 140px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">最小间隔(秒)</span>
            <a-input-number v-model="model.limits.intervalSec" :min="0" :step="1" style="width: 160px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">每日上限</span>
            <a-input-number v-model="model.limits.maxPerDay" :min="0" :step="1" style="width: 160px" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">判重窗口(秒)</span>
            <a-input-number v-model="model.limits.duplicateWindowSec" :min="0" :step="1" style="width: 180px" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="附件与链接">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">允许图片</span>
            <a-switch v-model="model.attachments.allowImage" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">允许链接</span>
            <a-switch v-model="model.attachments.allowLink" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="举报配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">启用举报</span>
            <a-switch v-model="model.report.enabled" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="24">
          <a-space direction="vertical" fill>
            <span class="lbl">举报原因（每行一个）</span>
            <a-textarea v-model="reportReasonsText" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="涉黄\n广告\n人身攻击\n违法\n其他" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <a-card :bordered="true" size="small" title="AI 审核（预留）">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space align="center">
            <span class="lbl">启用</span>
            <a-switch v-model="model.ai.enabled" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center" fill>
            <span class="lbl">Provider</span>
            <a-input v-model="model.ai.provider" placeholder="留空则不启用" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="8">
          <a-space align="center" fill>
            <span class="lbl">Model</span>
            <a-input v-model="model.ai.model" placeholder="例如 gpt-4o-mini" />
          </a-space>
        </a-grid-item>
        <a-grid-item :span="12">
          <a-space align="center">
            <span class="lbl">阈值(0-1)</span>
            <a-input-number v-model="model.ai.threshold" :min="0" :max="1" :step="0.01" style="width: 160px" />
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'
export const meta: JsonModuleMeta = {
  key: 'comment',
  title: '评论与审核',
  path: ['modules', 'comment'],
  defaultValue: {
    enabled: true,
    mode: 'post',
    sensitive: {
      blocklist: [],
      regex: [],
      whitelist: [],
      action: 'reject',
      maskChar: '*',
      maskFully: false,
    },
    limits: {
      minLen: 1,
      maxLen: 500,
      intervalSec: 10,
      maxPerDay: 50,
      duplicateWindowSec: 60,
    },
    attachments: {
      allowImage: false,
      allowLink: false,
    },
    report: {
      enabled: true,
      reasons: ['涉黄', '广告', '人身攻击', '违法', '其他'],
    },
    ai: {
      enabled: false,
      provider: '',
      model: '',
      threshold: 0.85,
    },
  },
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

// 文本域 <-> 数组 映射
const nl = /\r?\n/
const arr2text = (arr?: any[]) => Array.isArray(arr) ? arr.join('\n') : ''
const text2arr = (s: string) => s.split(nl).map(x => x.trim()).filter(Boolean)

const blocklistText = computed({
  get: () => arr2text(model.value.sensitive?.blocklist),
  set: (s: string) => {
    model.value.sensitive = model.value.sensitive || {}
    model.value.sensitive.blocklist = text2arr(s)
  },
})
const regexText = computed({
  get: () => arr2text(model.value.sensitive?.regex),
  set: (s: string) => {
    model.value.sensitive = model.value.sensitive || {}
    model.value.sensitive.regex = text2arr(s)
  },
})
const whitelistText = computed({
  get: () => arr2text(model.value.sensitive?.whitelist),
  set: (s: string) => {
    model.value.sensitive = model.value.sensitive || {}
    model.value.sensitive.whitelist = text2arr(s)
  },
})
const reportReasonsText = computed({
  get: () => arr2text(model.value.report?.reasons),
  set: (s: string) => {
    model.value.report = model.value.report || { enabled: true, reasons: [] }
    model.value.report.reasons = text2arr(s)
  },
})
</script>

<style scoped>
.lbl { color: var(--color-text-2); min-width: 96px; display: inline-block; }
</style>
