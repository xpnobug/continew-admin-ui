<template>
  <a-modal
    v-model:visible="visible"
    title="提示词库"
    width="900px"
    :footer="false"
    unmount-on-close
  >
    <div class="prompt-library">
      <!-- 工具栏 -->
      <div class="library-toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索提示词..."
            style="width: 300px"
            @search="handleSearch"
          />
          <a-select
            v-model="filterStatus"
            placeholder="状态筛选"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-option :value="1">有效</a-option>
            <a-option :value="0">无效</a-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="refreshPromptsList">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button type="primary" @click="showCreateModal">
            <template #icon><icon-plus /></template>
            新建提示词
          </a-button>
        </div>
      </div>

      <!-- 提示词列表 -->
      <div class="library-content">
        <a-spin :loading="loading" style="width: 100%">
          <div v-if="prompts.length > 0" class="prompts-grid">
            <div
              v-for="prompt in prompts"
              :key="prompt.id"
              class="prompt-card"
              :class="{ active: currentPrompt?.id === prompt.id }"
              @click="handleSelect(prompt)"
            >
              <div class="card-header">
                <div class="prompt-name">{{ prompt.name }}</div>
                <div class="card-actions" @click.stop>
                  <a-dropdown @select="(value) => handleAction(value, prompt)">
                    <a-button size="small" type="text">
                      <template #icon><icon-more /></template>
                    </a-button>
                    <template #content>
                      <a-doption value="edit">
                        <template #icon><icon-edit /></template>
                        编辑
                      </a-doption>
                      <a-doption value="clone">
                        <template #icon><icon-copy /></template>
                        克隆
                      </a-doption>
                      <a-doption value="export">
                        <template #icon><icon-export /></template>
                        导出
                      </a-doption>
                      <a-doption value="delete" class="danger">
                        <template #icon><icon-delete /></template>
                        删除
                      </a-doption>
                    </template>
                  </a-dropdown>
                </div>
              </div>
              <div class="prompt-desc">{{ prompt.description || '暂无描述' }}</div>
              <div class="prompt-preview">{{ getPromptPreview(prompt.promptText) }}</div>
              <div class="card-footer">
                <a-tag :color="prompt.status === 1 ? 'green' : 'red'" size="small">
                  {{ prompt.status === 1 ? '有效' : '无效' }}
                </a-tag>
                <span class="update-time">{{ formatTime(prompt.updateTime) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <a-empty description="暂无提示词">
              <template #image>
                <icon-file style="font-size: 64px; color: var(--color-text-4)" />
              </template>
              <a-button type="primary" @click="showCreateModal">
                <template #icon><icon-plus /></template>
                创建第一个提示词
              </a-button>
            </a-empty>
          </div>
        </a-spin>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="library-pagination">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :show-total="true"
          :show-jumper="true"
          :show-page-size="true"
          show-size-changer
          @change="loadPrompts"
        />
      </div>
    </div>

    <!-- 新建/编辑提示词弹窗 -->
    <a-modal
      v-model:visible="showPromptInfoModal"
      :title="isEditing ? '编辑提示词' : '新建提示词'"
      width="600px"
      @ok="handleSavePrompt"
      @cancel="handleCancelPrompt"
    >
      <div class="prompt-info-form">
        <a-form ref="formRef" :model="promptForm" :rules="formRules" layout="vertical">
          <a-form-item label="名称" field="name">
            <a-input
              v-model="promptForm.name"
              placeholder="请输入提示词名称"
              :max-length="100"
              show-word-limit
            />
          </a-form-item>

          <a-form-item label="描述" field="description">
            <a-textarea
              v-model="promptForm.description"
              placeholder="请输入提示词描述"
              :rows="3"
              :max-length="500"
              show-word-limit
            />
          </a-form-item>

          <a-form-item label="提示词内容" field="promptText">
            <a-textarea
              v-model="promptForm.promptText"
              placeholder="请输入提示词内容"
              :rows="8"
              :max-length="10000"
              show-word-limit
            />
          </a-form-item>

          <a-form-item label="状态" field="status">
            <a-radio-group v-model="promptForm.status">
              <a-radio :value="1">有效</a-radio>
              <a-radio :value="0">无效</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { type PromptResourceResp, addPromptResource, deletePromptResource, getPromptResource, listPromptResource, updatePromptResource } from '@/apis/ai/promptResource'

interface Props {
  visible?: boolean
  currentPrompt?: PromptResourceResp | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select', prompt: PromptResourceResp): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  currentPrompt: null,
})

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const prompts = ref<PromptResourceResp[]>([])
const searchKeyword = ref('')
const filterStatus = ref<number | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 提示词信息编辑弹窗相关
const showPromptInfoModal = ref(false)
const isEditing = ref(false)
const editingPrompt = ref<PromptResourceResp | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const promptForm = reactive({
  name: '',
  description: '',
  promptText: '',
  status: 1,
  spaceId: 1,
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入提示词名称' },
    { minLength: 1, maxLength: 100, message: '名称长度应在1-100个字符之间' },
  ],
  promptText: [
    { required: true, message: '请输入提示词内容' },
    { minLength: 1, maxLength: 10000, message: '提示词内容长度应在1-10000个字符之间' },
  ],
}

// 控制弹窗显示
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 加载提示词列表
const loadPrompts = async () => {
  loading.value = true
  try {
    const params = {
      spaceId: 1, // 添加必需的 spaceId
      name: searchKeyword.value || undefined,
      status: filterStatus.value,
      current: currentPage.value,
      size: pageSize.value,
      sort: ['updateTime,desc'],
    }

    const { data } = await listPromptResource(params)
    prompts.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('Failed to load prompts:', error)
    Message.error('加载提示词列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadPrompts()
}

// 刷新列表
const refreshPromptsList = () => {
  loadPrompts()
}

// 重置表单
const resetForm = () => {
  promptForm.name = ''
  promptForm.description = ''
  promptForm.promptText = ''
  promptForm.status = 1
  promptForm.spaceId = 1
}

// 选择提示词
const handleSelect = (prompt: PromptResourceResp) => {
  emit('select', prompt)
  visible.value = false
}

// 显示创建提示词弹窗
const showCreateModal = () => {
  isEditing.value = false
  editingPrompt.value = null
  resetForm()
  showPromptInfoModal.value = true
  // 清除表单验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 显示编辑提示词弹窗
const showEditModal = async (prompt: PromptResourceResp) => {
  try {
    const { data } = await getPromptResource(prompt.id)
    isEditing.value = true
    editingPrompt.value = prompt

    promptForm.name = prompt.name
    promptForm.description = data.description || ''
    promptForm.promptText = data.promptText || ''
    promptForm.status = prompt.status
    promptForm.spaceId = prompt.spaceId

    showPromptInfoModal.value = true

    // 清除表单验证状态
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  } catch (error) {
    console.error('Failed to load prompt details:', error)
    Message.error('加载提示词详情失败')
  }
}

// 保存提示词
const handleSavePrompt = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    if (isEditing.value && editingPrompt.value) {
      // 编辑现有提示词
      await updatePromptResource({
        name: promptForm.name,
        description: promptForm.description,
        promptText: promptForm.promptText,
        status: promptForm.status,
        spaceId: promptForm.spaceId,
      }, editingPrompt.value.id)

      Message.success('提示词更新成功')

      // 如果编辑的是当前选中的提示词，触发选择事件
      if (props.currentPrompt?.id === editingPrompt.value.id) {
        const updatedPrompt = { ...editingPrompt.value, ...promptForm }
        emit('select', updatedPrompt)
      }
    } else {
      // 创建新提示词
      const { data } = await addPromptResource({
        name: promptForm.name,
        description: promptForm.description,
        promptText: promptForm.promptText,
        status: promptForm.status,
        spaceId: promptForm.spaceId,
      })

      Message.success('提示词创建成功')

      // 创建成功后选择新提示词
      const newPrompt = {
        id: data.id,
        name: promptForm.name,
        description: promptForm.description,
        promptText: promptForm.promptText,
        status: promptForm.status,
        spaceId: promptForm.spaceId,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        createUser: '',
        updateUser: '',
        createUserString: '',
        updateUserString: '',
        disabled: false,
      } as PromptResourceResp
      emit('select', newPrompt)
    }

    showPromptInfoModal.value = false
    loadPrompts()
  } catch (error) {
    // 如果是表单验证错误，不显示通用错误消息
    if (error && typeof error === 'object' && 'errorFields' in error) {
      // 表单验证失败，不关闭弹窗
      return
    }
    console.error('Failed to save prompt:', error)
    Message.error('保存失败')
  }
}

// 取消编辑
const handleCancelPrompt = () => {
  showPromptInfoModal.value = false
  resetForm()
}

// 克隆提示词
const clonePrompt = async (prompt: PromptResourceResp) => {
  try {
    const { data } = await getPromptResource(prompt.id)
    const clonedData = {
      name: `${prompt.name} (副本)`,
      description: data.description,
      promptText: data.promptText,
      spaceId: data.spaceId,
      status: 1,
    }

    await addPromptResource(clonedData)
    Message.success('提示词克隆成功')
    loadPrompts()
  } catch (error) {
    console.error('Failed to clone prompt:', error)
    Message.error('克隆失败')
  }
}

// 导出提示词
const exportPrompt = async (prompt: PromptResourceResp) => {
  try {
    const { data } = await getPromptResource(prompt.id)
    const exportData = {
      name: prompt.name,
      description: data.description || '',
      promptText: data.promptText || '',
      exportTime: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-${prompt.name}-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    Message.success('提示词已导出')
  } catch (error) {
    console.error('Failed to export prompt:', error)
    Message.error('导出失败')
  }
}

// 删除提示词
const deletePrompt = (prompt: PromptResourceResp) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除提示词"${prompt.name}"吗？删除后无法恢复。`,
    onOk: async () => {
      try {
        await deletePromptResource(prompt.id)
        Message.success('提示词删除成功')
        loadPrompts()
      } catch (error) {
        console.error('Failed to delete prompt:', error)
        Message.error('删除失败')
      }
    },
  })
}

// 处理操作
const handleAction = (action: string, prompt: PromptResourceResp) => {
  switch (action) {
    case 'edit':
      showEditModal(prompt)
      break
    case 'clone':
      clonePrompt(prompt)
      break
    case 'export':
      exportPrompt(prompt)
      break
    case 'delete':
      deletePrompt(prompt)
      break
  }
}

// 获取提示词预览文本
const getPromptPreview = (text?: string) => {
  if (!text) return '无内容'
  return text.length > 100 ? `${text.substring(0, 100)}...` : text
}

// 时间格式化
const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (newVisible) {
    loadPrompts()
  }
})

defineExpose({
  loadPrompts,
  refreshPromptsList,
})
</script>

<style scoped lang="scss">
.prompt-library {
  .library-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-2);

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .library-content {
    min-height: 400px;
    max-height: 500px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .prompts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .prompt-card {
    padding: 16px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--color-bg-2);
    height: 160px;
    display: flex;
    flex-direction: column;

    &:hover {
      border-color: var(--color-primary-light-3);
      background: var(--color-primary-light-1);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: var(--color-primary);
      background: var(--color-primary-light-1);
      box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .prompt-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 8px;
      }

      .card-actions {
        flex-shrink: 0;
      }
    }

    .prompt-desc {
      font-size: 13px;
      color: var(--color-text-3);
      line-height: 1.4;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .prompt-preview {
      font-size: 12px;
      color: var(--color-text-4);
      background: var(--color-fill-2);
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;

      .update-time {
        font-size: 11px;
        color: var(--color-text-4);
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    text-align: center;
  }

  .library-pagination {
    display: flex;
    justify-content: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
  }
}

.prompt-info-form {
  padding: 8px 0;
}
</style>
