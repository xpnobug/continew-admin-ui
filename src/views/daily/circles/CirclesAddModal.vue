<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 700 ? 700 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <template #avatar>
        <div class="file-selector-wrapper">
          <a-input
            v-model="form.avatar"
            placeholder="请选择头像图片"
            readonly
            class="file-input"
          >
            <template #suffix>
              <a-button type="text" size="small" @click="openAvatarSelector">
                <icon-folder />
                选择
              </a-button>
            </template>
          </a-input>
          <div v-if="form.avatar" class="file-preview">
            <img :src="form.avatar" alt="头像预览" />
          </div>
        </div>
      </template>
      <template #banner>
        <div class="file-selector-wrapper">
          <a-input
            v-model="form.banner"
            placeholder="请选择横幅图片"
            readonly
            class="file-input"
          >
            <template #suffix>
              <a-button type="text" size="small" @click="openBannerSelector">
                <icon-folder />
                选择
              </a-button>
            </template>
          </a-input>
          <div v-if="form.banner" class="file-preview banner">
            <img :src="form.banner" alt="横幅预览" />
          </div>
        </div>
      </template>
    </GiForm>

    <!-- 头像选择器 -->
    <FileSelector
      ref="avatarSelectorRef"
      v-model="avatarSelectorVisible"
      title="选择头像图片"
      :allow-file-types="['jpg', 'jpeg', 'png', 'gif', 'webp']"
      :only-file="true"
      :select-multiple="false"
      @select="onAvatarSelect"
      @cancel="avatarSelectorVisible = false"
    />

    <!-- 横幅选择器 -->
    <FileSelector
      ref="bannerSelectorRef"
      v-model="bannerSelectorVisible"
      title="选择横幅图片"
      :allow-file-types="['jpg', 'jpeg', 'png', 'gif', 'webp']"
      :only-file="true"
      :select-multiple="false"
      @select="onBannerSelect"
      @cancel="bannerSelectorVisible = false"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addCircles, getCircles, updateCircles } from '@/apis/daily/circles'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改圈子' : '新增圈子'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common_type } = useDict('common_type')

const [form, resetForm] = useResetReactive({
  name: '',
  description: '',
  avatar: '',
  banner: '',
  isHot: false, // 前端使用布尔，保存时转换为 0/1
  isNew: false,
  membersCount: 0,
  dynamicsCount: 0,
  status: 1,
})

// 文件选择器
const avatarSelectorRef = ref()
const bannerSelectorRef = ref()
const avatarSelectorVisible = ref(false)
const bannerSelectorVisible = ref(false)

// 打开头像选择器
const openAvatarSelector = () => {
  avatarSelectorVisible.value = true
}

// 打开横幅选择器
const openBannerSelector = () => {
  bannerSelectorVisible.value = true
}

// 处理头像选择
const onAvatarSelect = (fileInfo: FileItem | FileItem[]) => {
  if (Array.isArray(fileInfo)) {
    form.avatar = fileInfo[0]?.url || ''
  } else {
    form.avatar = fileInfo.url || ''
  }
  avatarSelectorVisible.value = false
}

// 处理横幅选择
const onBannerSelect = (fileInfo: FileItem | FileItem[]) => {
  if (Array.isArray(fileInfo)) {
    form.banner = fileInfo[0]?.url || ''
  } else {
    form.banner = fileInfo.url || ''
  }
  bannerSelectorVisible.value = false
}

const columns: ColumnItem[] = reactive([
  // 基本信息
  {
    label: '基本信息',
    field: 'basic-info',
    type: 'title',
    span: 24,
  },
  {
    label: '圈子名称',
    field: 'name',
    type: 'input',
    span: 12,
    required: true,
  },
  {
    label: '状态',
    field: 'status',
    type: 'radio-group',
    span: 12,
    required: true,
    props: {
      options: common_type,
    },
  },
  {
    label: '圈子描述',
    field: 'description',
    type: 'textarea',
    span: 24,
    props: {
      rows: 4,
      placeholder: '请输入圈子描述',
    },
  },

  // 媒体资源
  {
    label: '媒体资源',
    field: 'media-resources',
    type: 'title',
    span: 24,
  },
  {
    label: '圈子头像',
    field: 'avatar',
    type: 'slot',
    span: 12,
    slotName: 'avatar',
  },
  {
    label: '圈子横幅',
    field: 'banner',
    type: 'slot',
    span: 12,
    slotName: 'banner',
  },

  // 属性设置
  {
    label: '属性设置',
    field: 'properties',
    type: 'title',
    span: 24,
  },
  {
    label: '热门圈子',
    field: 'isHot',
    type: 'switch',
    span: 8,
    props: {
      checkedText: '是',
      uncheckedText: '否',
    },
  },
  {
    label: '新建圈子',
    field: 'isNew',
    type: 'switch',
    span: 8,
    props: {
      checkedText: '是',
      uncheckedText: '否',
    },
  },
  {
    label: '成员数量',
    field: 'membersCount',
    type: 'input-number',
    span: 6,
    props: {
      min: 0,
      placeholder: '0',
    },
  },
  {
    label: '动态数量',
    field: 'dynamicsCount',
    type: 'input-number',
    span: 6,
    props: {
      min: 0,
      placeholder: '0',
    },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    // 转换布尔 -> 数值
    const payload: any = {
      ...form,
      isHot: form.isHot ? 1 : 0,
      isNew: form.isNew ? 1 : 0,
    }
    if (isUpdate.value) {
      await updateCircles(payload, dataId.value)
      Message.success('修改成功')
    } else {
      await addCircles(payload)
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
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getCircles(id)
  Object.assign(form, {
    ...data,
    isHot: !!data.isHot,
    isNew: !!data.isNew,
  })
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
:deep(.arco-form) {
  .arco-form-item-label-col {
    .arco-form-item-label {
      font-weight: 500;
    }
  }

  // 标题样式
  .arco-form-item[data-field="basic-info"],
  .arco-form-item[data-field="media-resources"],
  .arco-form-item[data-field="properties"] {
    .arco-form-item-content {
      padding: 16px 0 8px;
      border-bottom: 1px solid var(--color-border-2);
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 40px;
        height: 2px;
        background: var(--color-primary);
      }
    }
  }
}

.file-selector-wrapper {
  .file-input {
    margin-bottom: 8px;
  }

  .file-preview {
    width: 80px;
    height: 80px;
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-fill-1);

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    &.banner {
      width: 120px;
      height: 60px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
