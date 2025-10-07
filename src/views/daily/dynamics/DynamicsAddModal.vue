<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <!-- 图片编辑 -->
      <template #imgs>
        <div v-if="form.type === 1" class="media-block">
          <a-space direction="vertical" fill :size="12">
            <a-space align="center">
              <a-button type="primary" size="small" @click="openFileSelector('imgs')">
                <template #icon><icon-folder /></template>选择图片
              </a-button>
              <a-button type="outline" size="small" @click="addImage()">
                <template #icon><icon-plus /></template>新增图片
              </a-button>
              <a-tag v-if="form.imgs?.length" size="small">共 {{ form.imgs.length }} 张</a-tag>
            </a-space>
            <div v-if="!form.imgs?.length" class="text-gray">暂无图片，点击“选择图片”或“新增图片”添加</div>
            <div v-for="(img, idx) in form.imgs" :key="idx" class="media-row">
              <div class="media-row__preview">
                <a-image v-if="img.url" :src="img.url" :width="64" :height="64" fit="cover" />
                <div v-else class="preview-empty">无预览</div>
              </div>
              <div class="media-row__fields">
                <a-input v-model="img.url" allow-clear placeholder="图片 URL" />
                <a-space>
                  <a-input-number v-model="img.width" hide-button placeholder="宽(px)" style="width: 120px" />
                  <a-input-number v-model="img.height" hide-button placeholder="高(px)" style="width: 120px" />
                </a-space>
              </div>
              <div class="media-row__ops">
                <a-button size="mini" @click="openFileSelector('imgRow', idx)">选择</a-button>
                <a-button status="danger" size="mini" @click="removeImage(idx)">删除</a-button>
              </div>
            </div>
          </a-space>
        </div>
      </template>

      <!-- 视频编辑 -->
      <template #video>
        <div v-if="form.type === 2" class="media-block">
          <a-space direction="vertical" fill :size="12">
            <div class="media-row">
              <div class="media-row__preview">
                <a-image
                  v-if="form.video?.coverUrl || form.video?.url"
                  :src="form.video?.coverUrl || form.video?.url"
                  :width="96"
                  :height="64"
                  fit="cover"
                />
                <div v-else class="preview-empty">无封面</div>
              </div>
              <div class="media-row__fields">
                <a-input v-model="form.video.url" allow-clear placeholder="视频 URL">
                  <template #append>
                    <a-button size="small" @click="openFileSelector('video')">
                      <template #icon><icon-folder /></template>
                      选择
                    </a-button>
                  </template>
                </a-input>
                <a-input v-model="form.video.coverUrl" allow-clear placeholder="封面 URL(可选)">
                  <template #append>
                    <a-button size="small" @click="openFileSelector('videoCover')">
                      <template #icon><icon-folder /></template>
                      选择
                    </a-button>
                  </template>
                </a-input>
                <a-space>
                  <a-input-number v-model="form.video.width" hide-button placeholder="宽(px)" style="width: 120px" />
                  <a-input-number v-model="form.video.height" hide-button placeholder="高(px)" style="width: 120px" />
                  <a-input-number v-model="form.video.duration" hide-button placeholder="时长(s)" style="width: 120px" />
                </a-space>
              </div>
            </div>
          </a-space>
        </div>
      </template>

      <!-- 音频编辑 -->
      <template #audio>
        <div v-if="form.type === 3" class="media-block">
          <a-space direction="vertical" fill :size="12">
            <div class="media-row">
              <div class="media-row__preview">
                <icon-sound style="color:#165dff" />
              </div>
              <div class="media-row__fields">
                <a-input v-model="form.audio.url" allow-clear placeholder="音频 URL">
                  <template #append>
                    <a-button size="small" @click="openFileSelector('audio')">
                      <template #icon><icon-folder /></template>
                      选择
                    </a-button>
                  </template>
                </a-input>
                <a-input-number v-model="form.audio.duration" hide-button placeholder="时长(s)" style="width: 160px" />
              </div>
            </div>
          </a-space>
        </div>
      </template>
    </GiForm>
    <!-- 文件选择器 -->
    <FileSelector
      v-model="fileSelectorVisible"
      :title="fileSelectorTitle"
      :only-file="true"
      :select-multiple="selectorMultiple"
      :allow-file-types="selectorAllowTypes"
      @select="handleFileSelect"
      @cancel="fileSelectorVisible = false"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addDynamics, getDynamics, updateDynamics } from '@/apis/daily/dynamics'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import type { FileItem } from '@/apis/system/file'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改动态' : '新增动态'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common02_type, common_type } = useDict('common02_type', 'common_type')

const [form, resetForm] = useResetReactive({
  userId: '',
  content: '',
  type: 0,
  location: '',
  province: '',
  circleId: '',
  isPublic: true,
  isTop: false,
  status: 1,
  // 媒体
  imgs: [] as Array<{ url: string; width?: number; height?: number; type?: number }>,
  video: { url: '', coverUrl: '', width: undefined as number | undefined, height: undefined as number | undefined, duration: undefined as number | undefined, type: 2 as 2 },
  audio: { url: '', duration: undefined as number | undefined, type: 3 as 3 },
})

const dynamicTypeOptions = [
  { label: '纯文字', value: 0 },
  { label: '图片', value: 1 },
  { label: '视频', value: 2 },
  { label: '音频', value: 3 },
]

const columns: ColumnItem[] = reactive([
  {
    label: '发布用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入发布用户ID',
    },
  },
  {
    label: '动态类型',
    field: 'type',
    type: 'radio-group',
    span: 24,
    required: true,
    props: {
      options: dynamicTypeOptions,
    },
  },
  {
    label: '动态内容',
    field: 'content',
    type: 'textarea',
    span: 24,
    props: {
      placeholder: '请输入动态内容',
      rows: 4,
      maxLength: 500,
      showWordLimit: true,
    },
  },
  {
    label: '所属圈子ID',
    field: 'circleId',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入圈子ID',
    },
  },
  {
    label: '发布状态',
    field: 'status',
    type: 'radio-group',
    span: 12,
    required: true,
    props: {
      options: common_type,
    },
  },
  {
    label: '公开状态',
    field: 'isPublic',
    type: 'switch',
    span: 12,
    required: true,
    props: {
      options: common02_type,
    },
  },
  {
    label: '置顶状态',
    field: 'isTop',
    type: 'switch',
    span: 12,
    required: true,
    props: {
      options: common02_type,
    },
  },
  {
    label: '位置信息',
    field: 'location',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入详细位置信息',
    },
  },
  {
    label: '发布地点',
    field: 'province',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入发布省份/城市',
    },
  },
  {
    type: 'group-title',
    label: '媒体信息',
    field: 'group_media',
    span: 24,
    show: (f: any) => [1, 2, 3].includes(f.type),
    props: { type: 'info', showIcon: true },
  },
  {
    label: '图片集',
    field: 'imgs',
    // 使用自定义 slot 渲染
    span: 24,
    show: (f: any) => f.type === 1,
    formItemProps: { help: '可添加多张图片，支持填写尺寸' },
  },
  {
    label: '视频',
    field: 'video',
    span: 24,
    show: (f: any) => f.type === 2,
    formItemProps: { help: '填写视频URL、封面与尺寸/时长' },
  },
  {
    label: '音频',
    field: 'audio',
    span: 24,
    show: (f: any) => f.type === 3,
    formItemProps: { help: '填写音频URL与时长' },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 数据转换：表单数据 -> 接口数据
const transformToApiData = (formData: any) => {
  const payload: any = {
    userId: formData.userId,
    content: formData.content,
    type: formData.type,
    location: formData.location,
    province: formData.province,
    circleId: formData.circleId,
    isPublic: formData.isPublic,
    isTop: formData.isTop,
    status: Number(formData.status),
  }
  if (formData.type === 1) {
    payload.imgs = (formData.imgs || [])
      .filter((i: any) => i && i.url)
      .map((i: any) => ({ url: i.url, width: i.width, height: i.height, type: 1 }))
    payload.video = null
    payload.audio = null
  } else if (formData.type === 2) {
    payload.video = formData.video?.url
      ? { url: formData.video.url, coverUrl: formData.video.coverUrl, width: formData.video.width, height: formData.video.height, duration: formData.video.duration, type: 2 }
      : null
    payload.imgs = []
    payload.audio = null
  } else if (formData.type === 3) {
    payload.audio = formData.audio?.url
      ? { url: formData.audio.url, duration: formData.audio.duration, type: 3 }
      : null
    payload.imgs = []
    payload.video = null
  } else {
    payload.imgs = []
    payload.video = null
    payload.audio = null
  }
  return payload
}

// 数据转换：接口数据 -> 表单数据
const transformToFormData = (apiData: any) => {
  return {
    ...apiData,
    status: String(apiData.status),
    imgs: (apiData.imgs || []).map((i: any) => ({ url: i.url, width: i.width, height: i.height, type: 1 })),
    video: apiData.video ? { url: apiData.video.url, coverUrl: apiData.video.coverUrl, width: apiData.video.width, height: apiData.video.height, duration: apiData.video.duration, type: 2 } : { url: '', coverUrl: '', width: undefined, height: undefined, duration: undefined, type: 2 },
    audio: apiData.audio ? { url: apiData.audio.url, duration: apiData.audio.duration, type: 3 } : { url: '', duration: undefined, type: 3 },
  }
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false

    const apiData = transformToApiData(form)

    if (isUpdate.value) {
      await updateDynamics(apiData, dataId.value)
      Message.success('修改成功')
    } else {
      await addDynamics(apiData)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  // 默认清空媒体
  form.imgs = []
  form.video = { url: '', coverUrl: '', width: undefined, height: undefined, duration: undefined, type: 2 }
  form.audio = { url: '', duration: undefined, type: 3 }
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getDynamics(id)
  const formData = transformToFormData(data)
  Object.assign(form, formData)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })

// 图片编辑操作
const addImage = () => {
  form.imgs.push({ url: '', width: undefined, height: undefined, type: 1 })
}
const removeImage = (idx: number) => {
  form.imgs.splice(idx, 1)
}

// 文件选择器集成
const fileSelectorVisible = ref(false)
const selectorMultiple = ref(false)
const selectorAllowTypes = ref<string[]>([])
const fileSelectorTitle = ref('选择文件')
const currentImgRowIndex = ref<number | null>(null)
type SelectorTarget = 'imgs' | 'imgRow' | 'video' | 'videoCover' | 'audio'
const currentTarget = ref<SelectorTarget>('imgs')

const openFileSelector = (target: SelectorTarget, rowIndex?: number) => {
  currentTarget.value = target
  currentImgRowIndex.value = typeof rowIndex === 'number' ? rowIndex : null
  if (target === 'imgs' || target === 'imgRow' || target === 'videoCover') {
    selectorAllowTypes.value = ['jpg', 'jpeg', 'png', 'gif']
    fileSelectorTitle.value = target === 'videoCover' ? '选择视频封面' : '选择图片'
  }
  if (target === 'video') {
    selectorAllowTypes.value = ['mp4']
    fileSelectorTitle.value = '选择视频'
  }
  if (target === 'audio') {
    selectorAllowTypes.value = ['mp3']
    fileSelectorTitle.value = '选择音频'
  }
  selectorMultiple.value = target === 'imgs'
  fileSelectorVisible.value = true
}

const handleFileSelect = (fileInfo: FileItem | FileItem[]) => {
  if (Array.isArray(fileInfo)) {
    if (currentTarget.value === 'imgs') {
      const toAdd = fileInfo
        .filter((f) => f && f.url)
        .map((f) => ({ url: f.url, width: undefined as number | undefined, height: undefined as number | undefined, type: 1 as 1 }))
      form.imgs = [...form.imgs, ...toAdd]
      Message.success(`已选择 ${toAdd.length} 张图片`)
    }
  } else if (fileInfo && fileInfo.url) {
    if (currentTarget.value === 'imgRow') {
      if (currentImgRowIndex.value === null) return
      const idx = currentImgRowIndex.value
      form.imgs[idx] = { ...(form.imgs[idx] || { type: 1 }), url: fileInfo.url, type: 1 }
      Message.success('图片已选择')
    }
    if (currentTarget.value === 'video') {
      form.video.url = fileInfo.url
      Message.success('视频已选择')
    }
    if (currentTarget.value === 'videoCover') {
      form.video.coverUrl = fileInfo.url
      Message.success('封面已选择')
    }
    if (currentTarget.value === 'audio') {
      form.audio.url = fileInfo.url
      Message.success('音频已选择')
    }
  }
  fileSelectorVisible.value = false
}
</script>

<style scoped lang="scss">
.media-block {
  padding: 8px 0;
}
.media-row {
  display: grid;
  grid-template-columns: 80px 1fr 64px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border-2);
  &:last-child { border-bottom: none; }
}
.media-row__preview { display: flex; align-items: center; justify-content: center; }
.media-row__fields { display: grid; gap: 8px; }
.media-row__ops { display: flex; justify-content: flex-end; }
.preview-empty { color: var(--color-text-3); font-size: 12px; }
.text-gray { color: var(--color-text-3); }
</style>
