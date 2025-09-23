<template>
  <div class="resource-config">
    <div class="config-header">
      <h4>模型资源信息</h4>
      <div class="sub">与小程序展示资源保持一致，可动态配置并保存</div>
    </div>

    <!-- AI 头像介绍区域 -->
    <div class="form-section">
      <div class="section-title">AI头像介绍区域</div>

      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">头像图片URL</label>
          <a-input v-model="res.avatar.imageUrl" placeholder="https://.../serviceAi.png" />
        </div>

        <div class="form-item">
          <label class="form-label">头像圆形背景色</label>
          <a-input v-model="res.avatar.circleBgColor" placeholder="#fffbf6" />
        </div>

        <div class="form-item">
          <label class="form-label">标题文本</label>
          <a-input v-model="res.avatar.labelText" placeholder="AI导游" />
        </div>

        <div class="form-item">
          <label class="form-label">标题背景色</label>
          <a-input v-model="res.avatar.labelBgColor" placeholder="#e7ab24" />
        </div>
      </div>

      <div class="form-item full">
        <label class="form-label">介绍文本</label>
        <a-textarea v-model="res.avatar.introText" :auto-size="{ minRows: 2, maxRows: 4 }" />
      </div>
    </div>

    <!-- 消息头背景（children-day_title） -->
    <div class="form-section">
      <div class="section-title">消息文本头部背景（children-day_title）</div>

      <div class="form-grid">
        <div class="form-item full">
          <label class="form-label">背景图片URL</label>
          <a-input v-model="res.messageHeader.bgImageUrl" placeholder="https://...gif/png/jpg" />
        </div>

        <div class="form-item">
          <label class="form-label">高度</label>
          <a-input v-model="res.messageHeader.height" placeholder="90rpx 或 60px" />
        </div>

        <div class="form-item">
          <label class="form-label">圆角</label>
          <a-input v-model="res.messageHeader.borderRadius" placeholder="20rpx 20rpx 0 0" />
        </div>
      </div>

      <!-- 简单预览 -->
      <div class="preview">
        <div class="preview-header" :style="previewHeaderStyle">
          <span class="placeholder">消息头部预览</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AvatarConfig {
  imageUrl: string
  circleBgColor: string
  labelText: string
  labelBgColor: string
  introText: string
}

interface MessageHeaderConfig {
  bgImageUrl: string
  height: string
  borderRadius: string
}

interface ResourceConfig {
  avatar: AvatarConfig
  messageHeader: MessageHeaderConfig
}

interface Props {
  modelValue: ResourceConfig
}

interface Emits {
  (e: 'update:modelValue', value: ResourceConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const res = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const previewHeaderStyle = computed(() => ({
  backgroundImage: res.value.messageHeader.bgImageUrl ? `url(${res.value.messageHeader.bgImageUrl})` : 'none',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  height: res.value.messageHeader.height || '90rpx',
  borderRadius: res.value.messageHeader.borderRadius || '20rpx 20rpx 0 0',
}))
</script>

<style scoped lang="scss">
.resource-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  h4 { margin: 0; font-size: 16px; font-weight: 600; }
  .sub { font-size: 12px; color: var(--color-text-3); }
}

.form-section { 
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  padding: 12px;
}

.section-title { font-size: 13px; font-weight: 600; margin-bottom: 12px; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 12px;
}

.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-item.full { grid-column: 1 / -1; }
.form-label { font-size: 12px; color: var(--color-text-2); }

.preview {
  margin-top: 12px;
  border: 1px dashed var(--color-border-2);
  border-radius: 8px;
  overflow: hidden;
}
.preview-header {
  display: flex;
  align-items: center;
  padding-left: 12px;
}
.placeholder { font-size: 12px; color: var(--color-text-3); }
</style>

