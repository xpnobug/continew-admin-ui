<template>
  <div class="model-parameters-config">
    <!-- 基础参数 -->
    <div class="config-section">
      <div class="section-title">
        <icon-settings />
        基础参数
      </div>
      <div class="param-list">
        <div class="param-item">
          <div class="param-label">
            <span>温度 (Temperature)</span>
            <a-tooltip content="控制输出的随机性，值越高输出越随机">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-slider
            v-model="config.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :style="{ width: '150px' }"
            show-input
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>最大令牌数 (Max Tokens)</span>
            <a-tooltip content="限制生成内容的最大长度">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-input-number
            v-model="config.maxTokens"
            :min="1"
            :max="8192"
            :step="100"
            style="width: 150px"
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>Top P</span>
            <a-tooltip content="核采样参数，控制候选词的概率质量">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-slider
            v-model="config.topP"
            :min="0"
            :max="1"
            :step="0.01"
            :style="{ width: '150px' }"
            show-input
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>频率惩罚 (Frequency Penalty)</span>
            <a-tooltip content="减少重复内容的生成">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-slider
            v-model="config.frequencyPenalty"
            :min="-2"
            :max="2"
            :step="0.1"
            :style="{ width: '150px' }"
            show-input
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>存在惩罚 (Presence Penalty)</span>
            <a-tooltip content="鼓励谈论新话题">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-slider
            v-model="config.presencePenalty"
            :min="-2"
            :max="2"
            :step="0.1"
            :style="{ width: '150px' }"
            show-input
          />
        </div>
      </div>
    </div>

    <!-- 高级配置 -->
    <div class="config-section">
      <div class="section-title">
        <icon-code />
        高级配置
      </div>
      <div class="param-list">
        <div class="param-item">
          <div class="param-label">
            <span>停止序列</span>
            <a-tooltip content="遇到这些序列时停止生成">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-input
            v-model="config.stopSequences"
            placeholder="用逗号分隔多个停止序列"
            style="width: 200px"
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>种子值 (Seed)</span>
            <a-tooltip content="固定随机种子以获得确定性输出">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-input-number
            v-model="config.seed"
            :min="0"
            :max="999999"
            placeholder="留空为随机"
            style="width: 150px"
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>流式输出</span>
            <a-tooltip content="启用流式输出以实时显示生成内容">
              <icon-info-circle class="param-help" />
            </a-tooltip>
          </div>
          <a-switch v-model="config.stream" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModelParametersConfig {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string
  seed?: number
  stream: boolean
}

interface Props {
  modelValue: ModelParametersConfig
}

interface Emits {
  (e: 'update:modelValue', value: ModelParametersConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用计算属性实现双向绑定
const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped lang="scss">
.model-parameters-config {
  .config-section {
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 16px;
    }

    .param-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .param-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .param-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--color-text-2);

          .param-help {
            font-size: 12px;
            color: var(--color-text-3);
            cursor: help;
          }
        }
      }
    }
  }
}
</style>
