<template>
  <div class="resource-config">
    <div class="config-header">
      <h4>模型资源信息</h4>
      <div class="sub">与小程序展示资源保持一致，可动态配置并保存</div>
    </div>

    <!-- 表单区域：头像配置 -->
    <a-card class="form-section" :bordered="false">
      <template #title>AI头像介绍区域</template>
          <div class="form-grid">
            <div class="form-item">
              <label class="form-label">头像图片URL</label>
              <a-input v-model="res.avatar.imageUrl" placeholder="请选择头像图片" readonly>
                <template #suffix>
                  <a-button type="text" size="mini" @click="openAvatarSelector">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
            </div>

            <div class="form-item">
              <label class="form-label">头像圆形背景色</label>
              <a-input v-model="res.avatar.circleBgColor" placeholder="#fffbf6">
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="showAvatarCirclePicker">
                    <template #content>
                      <ColorPicker theme="light" :color="res.avatar.circleBgColor || '#ffffff'" :sucker-hide="true" @change-color="onPickAvatarCircle" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </div>

            <div class="form-item">
              <label class="form-label">标题文本</label>
              <a-input v-model="res.avatar.labelText" placeholder="AI导游" />
            </div>

            <div class="form-item">
              <label class="form-label">标题背景色</label>
              <a-input v-model="res.avatar.labelBgColor" placeholder="#e7ab24">
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="showAvatarLabelPicker">
                    <template #content>
                      <ColorPicker theme="light" :color="res.avatar.labelBgColor || '#e7ab24'" :sucker-hide="true" @change-color="onPickAvatarLabel" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </div>
          </div>

      <div class="form-item full">
        <label class="form-label">介绍文本</label>
        <a-textarea v-model="res.avatar.introText" :auto-size="{ minRows: 2, maxRows: 4 }" />
      </div>
    </a-card>

    <!-- 表单区域：消息头背景（children-day_title） -->
    <a-card class="form-section" :bordered="false">
      <template #title>消息文本头部背景（children-day_title）</template>
      <div class="form-grid">
        <div class="form-item full">
          <label class="form-label">背景图片URL</label>
          <a-input v-model="res.messageHeader.bgImageUrl" placeholder="请选择背景图片" readonly>
            <template #suffix>
              <a-button type="text" size="mini" @click="openHeaderBgSelector">
                <icon-folder /> 选择
              </a-button>
            </template>
          </a-input>
        </div>

        <div class="form-item">
          <label class="form-label">高度</label>
          <a-input v-model="res.messageHeader.height" placeholder="90rpx 或 60px" />
        </div>

        <div class="form-item">
          <label class="form-label">圆角</label>
          <a-input v-model="res.messageHeader.borderRadius" placeholder="20rpx 20rpx 0 0" />
        </div>

        <div class="form-item">
          <label class="form-label">背景色</label>
          <a-input v-model="res.messageHeader.bgColor" placeholder="#ffffff">
            <template #suffix>
              <a-popover trigger="click" position="bottom" v-model:popup-visible="showHeaderBgPicker">
                <template #content>
                  <ColorPicker theme="light" :color="res.messageHeader.bgColor || '#ffffff'" :sucker-hide="true" @change-color="onPickHeaderBg" />
                </template>
                <a-button type="text" size="mini">取色</a-button>
              </a-popover>
            </template>
          </a-input>
        </div>
      </div>
    </a-card>

    <!-- 文件选择器：头像图片 -->
    <FileSelector
      v-model="avatarSelectorVisible"
      title="选择头像图片"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onAvatarSelect"
      @cancel="avatarSelectorVisible = false"
    />

    <!-- 文件选择器：消息头背景图片 -->
    <FileSelector
      v-model="headerBgSelectorVisible"
      title="选择消息头背景图片"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onHeaderBgSelect"
      @cancel="headerBgSelectorVisible = false"
    />

    <!-- 实时预览：紧跟在消息头背景配置之后 -->
    <a-card class="preview-card" :bordered="false">
      <template #title>实时预览</template>
      <!-- 头像区域预览 -->
      <div class="avatar-preview">
        <div class="yuan">
          <div class="yuan-wrap" :style="{ backgroundColor: res.avatar.circleBgColor }">
            <img :src="res.avatar.imageUrl || defaultAvatarUrl" class="img" />
          </div>
          <span class="yuan-text" :style="{ background: res.avatar.labelBgColor }">{{ res.avatar.labelText || 'AI导游' }}</span>
        </div>
        <div class="intro">
          {{ res.avatar.introText || defaultIntroText }}
        </div>
      </div>

      <!-- 消息头部背景预览 -->
      <div class="header-preview" :style="previewHeaderStyle">
        <span class="placeholder">消息头部预览</span>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
interface AvatarConfig {
  imageUrl: string
  circleBgColor: string
  labelText: string
  labelBgColor: string
  introText: string
}

interface MessageHeaderConfig {
  bgImageUrl: string
  bgColor?: string
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

const defaultAvatarUrl = 'https://oss3.hnswlt.com/images/static/serviceAi.png'
const defaultIntroText = '您好！我是您的AI导游，专业为您推荐河南的精彩景点、特色美食和文化体验。'

// 文件选择器可见性
const avatarSelectorVisible = ref(false)
const headerBgSelectorVisible = ref(false)

const openAvatarSelector = () => {
  avatarSelectorVisible.value = true
}

const openHeaderBgSelector = () => {
  headerBgSelectorVisible.value = true
}

const onAvatarSelect = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    res.value.avatar.imageUrl = (file as any).url
  }
  avatarSelectorVisible.value = false
}

const onHeaderBgSelect = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    res.value.messageHeader.bgImageUrl = (file as any).url
  }
  headerBgSelectorVisible.value = false
}

// 颜色选择弹层
const showAvatarCirclePicker = ref(false)
const showAvatarLabelPicker = ref(false)
const showHeaderBgPicker = ref(false)

interface ColorObj { hex: string }
const onPickAvatarCircle = (c: ColorObj) => { if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) res.value.avatar.circleBgColor = c.hex }
const onPickAvatarLabel = (c: ColorObj) => { if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) res.value.avatar.labelBgColor = c.hex }
const onPickHeaderBg = (c: ColorObj) => { if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) res.value.messageHeader.bgColor = c.hex }
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

.form-section { padding: 8px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 12px; }
.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-item.full { grid-column: 1 / -1; }
.form-label { font-size: 12px; color: var(--color-text-2); }
.preview-card { margin-top: -8px; }
.avatar-preview { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.avatar-preview .yuan { width: 72px; height: 72px; position: relative; }
.avatar-preview .yuan-wrap { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.avatar-preview .img { width: 64px; height: 64px; object-fit: contain; }
.avatar-preview .yuan-text { position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%); color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 12px; white-space: nowrap; }
.avatar-preview .intro { font-size: 12px; color: var(--color-text-2); line-height: 1.6; }
.header-preview { height: 60px; border-radius: 8px; display: flex; align-items: center; padding-left: 8px; }
.placeholder { font-size: 12px; color: var(--color-text-3); }
</style>
