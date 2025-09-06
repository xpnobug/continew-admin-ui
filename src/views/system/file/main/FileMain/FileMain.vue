<template>
  <div class="file-main">
    <!-- 目录导航面包屑 -->
    <a-breadcrumb class="file-main__breadcrumb">
      <a-breadcrumb-item v-if="queryForm.parentPath" @click="handleBreadcrumbClick({ name: '根目录', path: '/' })">根目录</a-breadcrumb-item>
      <a-breadcrumb-item v-else>全部</a-breadcrumb-item>
      <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" @click="handleBreadcrumbClick(item)">
        {{ item.name || '根目录' }}
      </a-breadcrumb-item>
    </a-breadcrumb>

    <a-row justify="space-between" class="file-main__search">
      <!-- 左侧区域 -->
      <a-space wrap>
        <a-upload
          v-permission="['system:file:upload']"
          :show-file-list="false"
          :custom-request="handleUpload"
          :accept="uploadAccept"
        >
          <template #upload-button>
            <a-button type="primary" shape="round">
              <template #icon>
                <icon-upload />
              </template>
              <template #default>上传{{ isSelectMode && allowFileTypes.length ? getFileTypesText() : '' }}</template>
            </a-button>
          </template>
        </a-upload>

        <a-input-group>
          <a-input v-model="queryForm.originalName" :placeholder="queryForm.type && queryForm.type !== '0' ? '请输入名称' : '在当前目录下搜索名称'" allow-clear style="width: 200px" />
          <a-button type="primary" @click="search">
            <template #icon>
              <icon-search />
            </template>
            <template #default>查询</template>
          </a-button>
        </a-input-group>
      </a-space>

      <!-- 右侧区域 -->
      <a-space wrap>
        <template v-if="isSelectMode">
          <!-- 选择模式下的操作按钮 -->
          <a-button v-permission="['system:file:createDir']" :disabled="!queryForm.parentPath" @click="createDirModalVisible = !createDirModalVisible">
            <template #icon>
              <icon-folder />
            </template>
            <template #default>新建文件夹</template>
          </a-button>
          <span v-if="selectedFiles.length" class="selected-count">
            已选择 {{ selectedFiles.length }} 个{{ onlyFile ? '文件' : '项目' }}
          </span>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" :disabled="!selectedFiles.length" @click="handleConfirm">确定</a-button>
        </template>
        <template v-else>
          <!-- 管理模式下的操作按钮 -->
          <a-button
            v-if="isBatchMode" :disabled="!selectedFileIds.length" type="primary" status="danger"
            @click="handleMulDelete"
          >
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
          <a-button v-permission="['system:file:createDir']" type="primary" :disabled="!queryForm.parentPath" @click="createDirModalVisible = !createDirModalVisible">
            <template #icon>
              <icon-folder />
            </template>
            <template #default>新建文件夹</template>
          </a-button>
          <a-button v-permission="['system:file:delete']" type="primary" @click="isBatchMode = !isBatchMode">
            <template #icon>
              <icon-select-all />
            </template>
            <template #default>{{ isBatchMode ? '取消批量' : '批量操作' }}</template>
          </a-button>
        </template>
        <a-button-group>
          <a-tooltip content="视图">
            <a-button @click="toggleMode">
              <template #icon>
                <icon-list v-if="mode === 'grid'" />
                <icon-apps v-else />
              </template>
            </a-button>
          </a-tooltip>
        </a-button-group>
      </a-space>
    </a-row>

    <!-- 文件列表-宫格模式 -->
    <a-spin id="fileMain" class="file-main__list" :loading="loading">
      <FileGrid
        v-show="fileList.length && mode === 'grid'" :data="fileList" :is-batch-mode="isSelectMode || isBatchMode"
        :selected-file-ids="isSelectMode ? selectedFileIds : selectedFileIds" @click="handleClickFile" @select="handleSelectFile"
        @right-menu-click="isSelectMode ? undefined : handleRightMenuClick" @dblclick="handleDblclickFile"
      ></FileGrid>

      <!-- 文件列表-列表模式 -->
      <FileList
        v-show="fileList.length && mode === 'list'" :data="fileList" :is-batch-mode="isSelectMode || isBatchMode"
        :selected-file-ids="isSelectMode ? selectedFileIds : selectedFileIds" @click="handleClickFile" @select="handleSelectFile"
        @right-menu-click="isSelectMode ? undefined : handleRightMenuClick" @dblclick="handleDblclickFile"
      ></FileList>

      <a-empty v-if="!fileList.length" />
    </a-spin>
    <FilePreview ref="filePreviewRef" />
    <div class="pagination">
      <a-pagination v-bind="pagination" />
    </div>

    <!-- 弹出新建窗口 -->
    <a-modal v-model:visible="createDirModalVisible" title="新建文件夹" @ok="handleCreateDir" @cancel="handleCreateDirCancel">
      <a-input v-model="newDirName" placeholder="请输入文件夹名称" size="large" allow-clear />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal, type RequestOption } from '@arco-design/web-vue'
import { api as viewerApi } from 'v-viewer'
import {
  openFileDetailModal,
  openFileRenameModal,
  previewFileAudioModal,
  previewFileVideoModal,
} from '../../components/index'
import FileGrid from './FileGrid.vue'
import useFileManage from './useFileManage'
import { useTable } from '@/hooks'
import { type FileItem, type FileQuery, createDir, deleteFile, listFile, uploadFile } from '@/apis/system/file'
import { ImageTypes, OfficeTypes } from '@/constant/file'
import 'viewerjs/dist/viewer.css'
import { downloadByUrl } from '@/utils/downloadFile'
import mittBus from '@/utils/mitt'
import type { ExcelConfig } from '@/components/FilePreview/type'

const props = withDefaults(defineProps<Props>(), {
  isSelectMode: false,
  selectMultiple: false,
  allowFileTypes: () => [],
  onlyFile: false,
  selectedType: '0',
})

const emit = defineEmits<Emits>()

const FilePreview = defineAsyncComponent(() => import('@/components/FilePreview/index.vue'))

const FileList = defineAsyncComponent(() => import('./FileList.vue'))

// Props for selector mode
interface Props {
  /** 是否为选择模式 */
  isSelectMode?: boolean
  /** 是否允许多选 */
  selectMultiple?: boolean
  /** 允许选择的文件类型 */
  allowFileTypes?: string[]
  /** 是否只允许选择文件 */
  onlyFile?: boolean
  /** 选中的文件类型 */
  selectedType?: string
}

interface Emits {
  (e: 'confirm', fileInfo: FileItem | FileItem[]): void
  (e: 'cancel'): void
}

const route = useRoute()
const { mode, selectedFileIds: manageModeSelectedFileIds, toggleMode, addSelectedFileItem } = useFileManage()

// 选择器模式下的选中文件
const selectedFiles = ref<FileItem[]>([])

// 判断文件是否可选择
const isSelectable = (item: FileItem) => {
  if (props.onlyFile && item.type === 0) return false
  if (props.allowFileTypes.length > 0 && item.type === 1) {
    return props.allowFileTypes.includes(item.extension)
  }
  return true
}

// 选择器模式 - 确认选择
const handleConfirm = () => {
  if (!selectedFiles.value.length) {
    Message.warning('请选择文件')
    return
  }

  // 检查文件类型限制
  if (props.allowFileTypes.length > 0) {
    const invalidFiles = selectedFiles.value.filter((file) =>
      file.type === 1 && !props.allowFileTypes.includes(file.extension),
    )
    if (invalidFiles.length > 0) {
      Message.warning(`不支持选择 ${invalidFiles.map((f) => f.extension).join(', ')} 类型的文件`)
      return
    }
  }

  // 检查是否只允许选择文件
  if (props.onlyFile) {
    const folders = selectedFiles.value.filter((file) => file.type === 0)
    if (folders.length > 0) {
      Message.warning('不能选择文件夹')
      return
    }
  }

  const result = props.selectMultiple ? selectedFiles.value : selectedFiles.value[0]
  emit('confirm', result)
}

// 在选择模式和管理模式之间切换选中的文件ID
const selectedFileIds = computed(() => {
  return props.isSelectMode ? selectedFiles.value.map((f) => f.id) : manageModeSelectedFileIds.value
})

// 上传文件的 accept 属性
const uploadAccept = computed(() => {
  if (props.isSelectMode && props.allowFileTypes.length > 0) {
    return props.allowFileTypes.map((type) => `.${type}`).join(',')
  }
  return undefined
})

// 获取文件类型文本
const getFileTypesText = () => {
  if (props.allowFileTypes.length > 3) {
    return `(${props.allowFileTypes.slice(0, 2).join(', ')}等)`
  }
  return `(${props.allowFileTypes.join(', ')})`
}

const queryForm = reactive<FileQuery>({
  originalName: undefined,
  parentPath: (!props.isSelectMode && (!route.query.type || route.query.type?.toString() === '0')) || (props.isSelectMode && props.selectedType === '0') ? '/' : undefined,
  type: props.isSelectMode ? (props.selectedType !== '0' ? props.selectedType : undefined) : (route.query.type?.toString() && route.query.type?.toString() !== '0' ? route.query.type?.toString() : undefined),
  sort: ['type,asc', 'updateTime,desc'],
})

const paginationOption = reactive({
  defaultPageSize: 30,
  defaultSizeOptions: [30, 40, 50, 100, 120],
})
const isBatchMode = ref(false)

const {
  tableData: fileList,
  loading,
  pagination,
  search,
} = useTable((page) => listFile({ ...queryForm, ...page }), { immediate: false, paginationOption })
const filePreviewRef = ref()
// 点击文件
const handleClickFile = (item: FileItem) => {
  if (ImageTypes.includes(item.extension)) {
    if (item.url) {
      const imgList: string[] = fileList.value.filter((i) => ImageTypes.includes(i.extension)).map((a) => a.url || '')
      const index = imgList.findIndex((i) => i === item.url)
      if (imgList.length) {
        viewerApi({
          options: {
            initialViewIndex: index,
          },
          images: imgList,
        })
      }
    }
  }
  if (OfficeTypes.includes(item.extension)) {
    const excelConfig: ExcelConfig = {
      xls: item.extension === 'xls',
      minColLength: 0,
      minRowLength: 0,
      widthOffset: 10,
      heightOffset: 10,
      beforeTransformData: (workbookData) => {
        return workbookData
      },
      transformData: (workbookData) => {
        return workbookData
      },
    }
    filePreviewRef.value.onPreview({
      fileInfo: { data: item.url, fileName: item.originalName, fileType: item.extension },
      excelConfig,
    })
  }
  if (item.extension === 'mp4') {
    previewFileVideoModal(item)
  }
  if (item.extension === 'mp3') {
    previewFileAudioModal(item)
  }
}

// 双击文件
const handleDblclickFile = (item: FileItem) => {
  if (item.type === 0) {
    // 双击文件夹，进入文件夹
    queryForm.parentPath = `${item.parentPath === '/' ? '' : item.parentPath}/${item.name}`
    selectedFiles.value = [] // 清空选中状态
    search()
  } else if (props.isSelectMode && !props.selectMultiple && isSelectable(item)) {
    // 选择模式下，双击文件直接确认选择（单选模式）
    selectedFiles.value = [item]
    handleConfirm()
  }
}

// 下载文件
const onDownload = async (fileInfo: FileItem) => {
  const res = await downloadByUrl({
    url: fileInfo.url,
    target: '_self',
    fileName: fileInfo.originalName,
  })
  res ? Message.success('下载成功') : Message.error('下载失败')
  search()
}

// 右键菜单
const handleRightMenuClick = async (mode: string, fileInfo: FileItem) => {
  if (mode === 'delete') {
    Modal.warning({
      title: '提示',
      content: `是否确定删除${fileInfo.type === 0 ? '文件夹' : '文件'}「${fileInfo.originalName}」？`,
      hideCancel: false,
      okButtonProps: { status: 'danger' },
      onOk: async () => {
        await deleteFile([fileInfo.id])
        Message.success('删除成功')
        search()
        mittBus.emit('file-total-refresh')
      },
    })
  } else if (mode === 'rename') {
    openFileRenameModal(fileInfo, search)
  } else if (mode === 'detail') {
    openFileDetailModal(fileInfo)
  } else if (mode === 'download') {
    await onDownload(fileInfo)
  }
}

// 勾选文件
const handleSelectFile = (item: FileItem) => {
  if (props.isSelectMode) {
    // 选择器模式
    const isSelected = selectedFiles.value.some((f) => f.id === item.id)

    if (!props.selectMultiple) {
      selectedFiles.value = isSelected ? [] : [item]
    } else {
      if (isSelected) {
        const index = selectedFiles.value.findIndex((f) => f.id === item.id)
        if (index > -1) {
          selectedFiles.value.splice(index, 1)
        }
      } else {
        // 检查文件是否可选择
        if (isSelectable(item)) {
          selectedFiles.value.push(item)
        }
      }
    }
  } else {
    // 管理模式
    addSelectedFileItem(item)
  }
}

// 批量删除
const handleMulDelete = () => {
  Modal.warning({
    title: '提示',
    content: `是否确定删除所选的${selectedFileIds.value.length}个文件？`,
    hideCancel: false,
    onOk: async () => {
      await deleteFile(selectedFileIds.value)
      Message.success('删除成功')
      search()
      mittBus.emit('file-total-refresh')
      isBatchMode.value = false
    },
  })
}

// 上传
const handleUpload = (options: RequestOption) => {
  const controller = new AbortController()
  ;(async function requestWrap() {
    const { onProgress, onError, onSuccess, fileItem, name = 'file' } = options
    onProgress(20)
    const formData = new FormData()
    formData.append('parentPath', queryForm.parentPath ?? '/')
    formData.append(name as string, fileItem.file as Blob)
    try {
      const res = await uploadFile(formData)
      Message.success('上传成功')
      onSuccess(res)
      await search()

      // 在选择模式下，自动选中刚上传的文件
      if (props.isSelectMode && res && res.data) {
        const uploadedFile = res.data as FileItem
        if (isSelectable(uploadedFile)) {
          if (!props.selectMultiple) {
            selectedFiles.value = [uploadedFile]
          } else {
            selectedFiles.value.push(uploadedFile)
          }
        }
      }
    } catch (error) {
      onError(error)
    } finally {
      mittBus.emit('file-total-refresh')
    }
  })()
  return {
    abort() {
      controller.abort()
    },
  }
}

// 监听选择器模式下的类型变化
watch(() => props.selectedType, (newType) => {
  if (!props.isSelectMode) return

  if (newType === '0' || !newType) {
    queryForm.type = undefined
    queryForm.parentPath = '/'
  } else {
    queryForm.type = newType
    queryForm.parentPath = undefined
  }
  search()
})

onBeforeRouteUpdate((to) => {
  if (props.isSelectMode) return // 选择器模式下不响应路由变化
  if (!to.query.type) return
  if (to.query.type === '0' || !to.query.type) {
    queryForm.type = undefined
    queryForm.parentPath = '/'
  } else {
    queryForm.type = to.query.type?.toString()
    queryForm.parentPath = undefined
  }

  search()
})

// 新建文件夹弹窗显示
const createDirModalVisible = ref<boolean>(false)
// 新文件名称
const newDirName = ref()
// 新建文件夹弹窗窗口取消事件
const handleCreateDirCancel = () => {
  newDirName.value = undefined
  createDirModalVisible.value = false
}

// 新建文件夹弹窗窗口确认事件
const handleCreateDir = async () => {
  const res = await createDir(queryForm.parentPath ?? '/', newDirName.value)
  newDirName.value = undefined
  createDirModalVisible.value = false
  await search()

  // 在选择模式下，如果允许选择文件夹，则自动选中刚创建的文件夹
  if (props.isSelectMode && !props.onlyFile && res && res.data) {
    const createdFolder = res.data as FileItem
    if (isSelectable(createdFolder)) {
      if (!props.selectMultiple) {
        selectedFiles.value = [createdFolder]
      } else {
        selectedFiles.value.push(createdFolder)
      }
    }
  }
}

// 解析路径生成面包屑列表
const breadcrumbList = computed(() => {
  const path = queryForm.parentPath || '/'
  const parts = path.split('/').filter((p) => p !== '') // 分割路径并过滤空字符串
  return parts.map((part, index) => {
    const fullPath = parts.slice(0, index + 1).join('/')
    return { name: part || '根目录', path: `/${fullPath}` }
  })
})

// 处理面包屑点击
const handleBreadcrumbClick = (item) => {
  queryForm.parentPath = item.path
  search()
}

// 选择器模式 - 取消选择
const handleCancel = () => {
  emit('cancel')
}

onMounted(() => {
  search()
})
</script>

<style scoped lang="scss">
.file-main {
  height: 100%;
  background: var(--color-bg-1);
  border-radius: $radius-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__search {
    margin: 16px $padding 0;
  }

  &__breadcrumb {
    padding: 8px 16px;
    background: var(--color-bg-2);
    border-radius: 4px;
    font-size: 14px;
    color: var(--color-text-2);
    border-bottom: 1px solid var(--color-border-3);

    :deep(.arco-breadcrumb-item) {
      cursor: pointer;
    }

    :deep(.arco-breadcrumb-item-link) {
      transition: color 0.2s;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  &__list {
    flex: 1;
    padding: 0 $padding $padding;
    box-sizing: border-box;
    // overflow: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .pagination {
    padding: 0 var(--padding) var(--padding);

    :deep(.arco-pagination) {
      justify-content: end;
    }
  }

  // 选择器模式样式
  .selected-count {
    font-size: 14px;
    color: var(--color-text-2);
  }
}
</style>
