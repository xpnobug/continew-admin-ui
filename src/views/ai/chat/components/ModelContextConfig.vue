<template>
  <div class="model-context-config">
    <div class="config-section">
      <div class="section-title">
        <icon-file />
        上下文配置
      </div>
      <div class="param-list">
        <div class="param-item">
          <div class="param-label">
            <span>上下文窗口大小</span>
          </div>
          <a-input-number
            v-model="config.windowSize"
            :min="1"
            :max="50"
            style="width: 150px"
          />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>保留系统消息</span>
          </div>
          <a-switch v-model="config.keepSystemMessage" />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>自动摘要</span>
          </div>
          <a-switch v-model="config.autoSummary" />
        </div>
      </div>
    </div>

    <!-- 系统消息设置 -->
    <div class="config-section">
      <div class="section-title">
        <icon-message />
        系统消息
      </div>
      <a-textarea
        v-model="config.systemMessage"
        placeholder="设置系统角色和行为指导..."
        :rows="4"
        show-word-limit
        :max-length="2000"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModelContextConfig {
  windowSize: number
  keepSystemMessage: boolean
  autoSummary: boolean
  systemMessage: string
}

interface Props {
  modelValue: ModelContextConfig
}

interface Emits {
  (e: 'update:modelValue', value: ModelContextConfig): void
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
.model-context-config {
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
