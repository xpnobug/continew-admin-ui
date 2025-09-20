<template>
  <div class="model-safety-config">
    <div class="config-section">
      <div class="section-title">
        <icon-shield />
        内容安全
      </div>
      <div class="param-list">
        <div class="param-item">
          <div class="param-label">
            <span>启用内容过滤</span>
          </div>
          <a-switch v-model="config.enableContentFilter" />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>敏感内容检测</span>
          </div>
          <a-switch v-model="config.sensitiveContentDetection" />
        </div>

        <div class="param-item">
          <div class="param-label">
            <span>过滤等级</span>
          </div>
          <a-select
            v-model="config.filterLevel"
            style="width: 150px"
          >
            <a-option value="low">宽松</a-option>
            <a-option value="medium">中等</a-option>
            <a-option value="high">严格</a-option>
          </a-select>
        </div>
      </div>
    </div>

    <!-- 黑名单关键词 -->
    <div class="config-section">
      <div class="section-title">
        <icon-stop />
        黑名单关键词
      </div>
      <a-textarea
        v-model="config.blacklistKeywords"
        placeholder="每行一个关键词..."
        :rows="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModelSafetyConfig {
  enableContentFilter: boolean
  sensitiveContentDetection: boolean
  filterLevel: 'low' | 'medium' | 'high'
  blacklistKeywords: string
}

interface Props {
  modelValue: ModelSafetyConfig
}

interface Emits {
  (e: 'update:modelValue', value: ModelSafetyConfig): void
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
.model-safety-config {
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
