<template>
  <a-modal
    v-model:visible="visible"
    title="选择提示词"
    :width="800"
    :footer="false"
    @close="onClose"
  >
    <div class="prompt-selector">
      <!-- 搜索和筛选 -->
      <div class="selector-header">
        <a-space>
          <a-input-search
            v-model="searchText"
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
          <a-button @click="resetFilter">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
      </div>

      <!-- 提示词列表 -->
      <div class="prompt-list">
        <a-spin :loading="loading">
          <div v-if="promptList.length > 0" class="prompt-grid">
            <div
              v-for="prompt in promptList"
              :key="prompt.id"
              class="prompt-card" :class="[{ selected: isSelected(prompt.id) }]"
              @click="toggleSelect(prompt)"
            >
              <div class="card-header">
                <div class="prompt-icon">
                  <icon-message />
                </div>
                <div class="prompt-info">
                  <div class="prompt-name">{{ prompt.name }}</div>
                  <div class="prompt-space">空间: {{ prompt.spaceId }}</div>
                </div>
                <div class="prompt-status">
                  <a-tag :color="prompt.status === 1 ? 'green' : 'red'" size="small">
                    {{ prompt.status === 1 ? '有效' : '无效' }}
                  </a-tag>
                </div>
              </div>

              <div class="card-content">
                <div class="prompt-description">
                  {{ prompt.description || '暂无描述' }}
                </div>
                <div class="prompt-text">
                  {{ prompt.promptText ? prompt.promptText.substring(0, 150) + (prompt.promptText.length > 150 ? '...' : '') : '暂无内容' }}
                </div>
              </div>

              <div class="card-footer">
                <div class="create-info">
                  <span class="create-user">{{ prompt.createUserString }}</span>
                  <span class="create-time">{{ formatTime(prompt.createTime) }}</span>
                </div>
                <div class="select-indicator">
                  <a-checkbox :model-value="isSelected(prompt.id)" />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <a-empty description="暂无提示词数据" />
          </div>
        </a-spin>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrapper">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :show-total="true"
          :show-jumper="true"
          :show-page-size="true"
          @change="handlePageChange"
          @page-size-change="handlePageChange"
        />
      </div>

      <!-- 底部操作 -->
      <div class="selector-footer">
        <div class="selected-info">
          已选择 <a-tag color="blue">{{ selectedPrompts.length }}</a-tag> 个提示词
        </div>
        <div class="footer-actions">
          <a-button @click="onClose">取消</a-button>
          <a-button type="primary" @click="onConfirm">
            确定选择 ({{ selectedPrompts.length }})
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { type PromptResourceResp, listPromptResource } from '@/apis/ai/promptResource'

interface Props {
  modelValue?: boolean
  selectedIds?: string[]
  multiple?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', prompts: PromptResourceResp[]): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectedIds: () => [],
  multiple: true,
})

const emit = defineEmits<Emits>()

// 弹窗状态
const visible = ref(props.modelValue)
const loading = ref(false)

// 搜索和筛选
const searchText = ref('')
const filterStatus = ref<number | undefined>(undefined)

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 数据
const promptList = ref<PromptResourceResp[]>([])
const selectedPrompts = ref<PromptResourceResp[]>([])

// 初始化已选择的提示词
const initSelectedPrompts = () => {
  selectedPrompts.value = promptList.value.filter((prompt) =>
    props.selectedIds.includes(prompt.id),
  )
}

// 加载提示词列表
const loadPrompts = async () => {
  loading.value = true
  try {
    const params = {
      name: searchText.value || undefined,
      status: filterStatus.value,
      current: currentPage.value,
      size: pageSize.value,
      sort: ['id,desc'],
    }

    const { data } = await listPromptResource(params)
    promptList.value = data.list || []
    total.value = data.total || 0

    // 重新初始化已选择的提示词
    if (props.selectedIds.length > 0) {
      initSelectedPrompts()
    }
  } catch (error) {
    console.error('Failed to load prompts:', error)
    Message.error('加载提示词列表失败')
  } finally {
    loading.value = false
  }
}

// 监听父组件的显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadPrompts()
    // 初始化已选择的提示词
    initSelectedPrompts()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 判断是否已选择
const isSelected = (id: string) => {
  return selectedPrompts.value.some((prompt) => prompt.id === id)
}

// 切换选择状态
const toggleSelect = (prompt: PromptResourceResp) => {
  const index = selectedPrompts.value.findIndex((p) => p.id === prompt.id)

  if (index > -1) {
    // 取消选择
    selectedPrompts.value.splice(index, 1)
  } else {
    // 选择
    if (props.multiple) {
      selectedPrompts.value.push(prompt)
    } else {
      selectedPrompts.value = [prompt]
    }
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadPrompts()
}

// 重置筛选
const resetFilter = () => {
  searchText.value = ''
  filterStatus.value = undefined
  currentPage.value = 1
  loadPrompts()
}

// 分页处理
const handlePageChange = () => {
  loadPrompts()
}

// 时间格式化
const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString()
}

// 关闭弹窗
const onClose = () => {
  visible.value = false
  emit('cancel')
}

// 确认选择
const onConfirm = () => {
  emit('select', selectedPrompts.value)
  onClose()
}

defineExpose({
  open: () => {
    visible.value = true
  },
})
</script>

<style scoped lang="scss">
.prompt-selector {
  .selector-header {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-2);
  }

  .prompt-list {
    min-height: 400px;
    max-height: 500px;
    overflow-y: auto;
    margin-bottom: 16px;

    .prompt-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 12px;
    }

    .prompt-card {
      border: 1px solid var(--color-border-2);
      border-radius: 6px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-bg-2);

      &:hover {
        border-color: var(--color-primary-light-3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light-1);
      }

      .card-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;

        .prompt-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--color-fill-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-3);
          flex-shrink: 0;
        }

        .prompt-info {
          flex: 1;
          min-width: 0;

          .prompt-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .prompt-space {
            font-size: 12px;
            color: var(--color-text-3);
          }
        }

        .prompt-status {
          flex-shrink: 0;
        }
      }

      .card-content {
        margin-bottom: 12px;

        .prompt-description {
          font-size: 12px;
          color: var(--color-text-2);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .prompt-text {
          font-size: 12px;
          color: var(--color-text-3);
          background: var(--color-fill-1);
          padding: 8px;
          border-radius: 4px;
          line-height: 1.4;
          max-height: 60px;
          overflow: hidden;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid var(--color-border-1);

        .create-info {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .create-user {
            font-size: 11px;
            color: var(--color-text-2);
          }

          .create-time {
            font-size: 11px;
            color: var(--color-text-3);
          }
        }

        .select-indicator {
          :deep(.arco-checkbox) {
            pointer-events: none;
          }
        }
      }
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .selector-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);

    .selected-info {
      font-size: 14px;
      color: var(--color-text-2);
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
