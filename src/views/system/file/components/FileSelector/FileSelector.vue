<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="dialogWidth"
    unmount-on-close
    :footer="false"
    class="file-selector-modal"
  >
    <div class="file-selector-container">
      <!-- 左侧边栏 -->
      <div v-if="showFileTypes" class="file-selector-aside">
        <a-card :bordered="false" :body-style="{ padding: 0 }">
          <a-menu :selected-keys="[selectedType]" @menu-item-click="handleTypeSelect">
            <a-sub-menu key="0">
              <template #icon>
                <icon-apps />
              </template>
              <template #title>文件类型</template>
              <a-menu-item v-for="item in fileTypeList" :key="item.value.toString()">
                <template #icon>
                  <GiSvgIcon :size="20" :name="item.icon" />
                </template>
                <span>{{ item.name }}</span>
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-card>
      </div>

      <!-- 主文件区域 -->
      <div class="file-selector-main">
        <FileMain
          :is-select-mode="true"
          :select-multiple="selectMultiple"
          :allow-file-types="allowFileTypes"
          :only-file="onlyFile"
          :selected-type="selectedType"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import FileMain from '../../main/FileMain/FileMain.vue'
import type { FileItem } from '@/apis/system/file'
import { FileTypeList } from '@/constant/file'

defineOptions({ name: 'FileSelector' })

const props = withDefaults(defineProps<Props>(), {
  title: '选择文件',
  dialogWidth: '70%',
  selectMultiple: false,
  allowFileTypes: () => [],
  onlyFile: true,
  modelValue: false,
  showFileTypes: true,
})

const emit = defineEmits<Emits>()

interface Props {
  /** 标题 */
  title?: string
  /** 对话框宽度 */
  dialogWidth?: string
  /** 是否允许多选 */
  selectMultiple?: boolean
  /** 允许选择的文件类型，例如 ['jpg', 'png'] 或 ['pdf', 'doc'] */
  allowFileTypes?: string[]
  /** 是否只允许选择文件（不允许选择文件夹） */
  onlyFile?: boolean
  /** 对话框显示状态 */
  modelValue?: boolean
  /** 是否显示左侧文件类型选择 */
  showFileTypes?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', fileInfo: FileItem | FileItem[]): void
  (e: 'cancel'): void
}

const route = useRoute()

// 对话框可见性，与外部v-model双向绑定
const visible = ref(props.modelValue)

// 文件类型列表
const fileTypeList = FileTypeList

// 当前选中的文件类型
const selectedType = ref(route.query.type?.toString() || '0')

// 监听visible变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听modelValue变化，同步到本地状态
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 处理文件类型选择
const handleTypeSelect = (key: string) => {
  selectedType.value = key
}

// 处理确认选择
const handleConfirm = (fileInfo: FileItem | FileItem[]) => {
  // 触发select事件，传递选中的文件信息
  emit('select', fileInfo)
  // 关闭对话框
  visible.value = false
}

// 处理取消选择
const handleCancel = () => {
  // 触发cancel事件
  emit('cancel')
  // 关闭对话框
  visible.value = false
}
</script>

<style scoped lang="scss">
.file-selector-modal {
  :deep(.arco-modal-body) {
    height: 70vh;
    padding: 0;
    overflow: hidden;
  }
}

.file-selector-container {
  display: flex;
  height: 100%;

  .file-selector-aside {
    width: 200px;
    height: 100%;
    border-right: 1px solid var(--color-border-2);
    overflow-y: auto;

    .arco-card {
      height: 100%;
      border: none;

      :deep(.arco-card-header) {
        border-bottom-style: dashed;
        padding-left: 16px;
        padding-right: 16px;
      }
    }
  }

  .file-selector-main {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
}
</style>
