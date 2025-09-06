<template>
  <div class="ai-prompt-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">提示词资源管理</h1>
        <span class="prompt-count">共 {{ pagination.total }} 个提示词</span>
      </div>
      <div class="header-actions">
        <a-button v-permission="['ai:promptResource:export']" @click="onExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
        <a-button v-permission="['ai:promptResource:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增提示词
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <a-input
          v-model="queryForm.spaceId"
          placeholder="空间ID"
          allow-clear
          style="width: 150px"
          @change="search"
        />

        <a-select
          v-model="queryForm.status"
          placeholder="状态"
          allow-clear
          style="width: 150px"
          @change="search"
        >
          <a-option value="1">有效</a-option>
          <a-option value="0">无效</a-option>
        </a-select>

        <a-input-search
          v-model="queryForm.name"
          placeholder="搜索提示词名称..."
          style="width: 300px"
          allow-clear
          @search="search"
        />

        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <a-spin :loading="loading" style="width: 100%">
        <div v-if="dataList.length > 0" class="prompt-grid">
          <div
            v-for="prompt in dataList"
            :key="prompt.id"
            class="prompt-card"
            @click="onDetail(prompt)"
          >
            <div class="card-header">
              <div class="prompt-icon">
                <icon-message />
              </div>
              <div class="prompt-info">
                <h3 class="prompt-name">{{ prompt.name }}</h3>
                <span class="prompt-space">空间: {{ prompt.spaceId }}</span>
              </div>
              <div class="prompt-status">
                <a-tag :color="prompt.status === 1 ? 'green' : 'red'">
                  {{ prompt.status === 1 ? '有效' : '无效' }}
                </a-tag>
              </div>
            </div>

            <div class="card-content">
              <p class="prompt-description">
                {{ prompt.description || '暂无描述' }}
              </p>
              <div class="prompt-text">
                <div class="text-label">提示词内容：</div>
                <div class="text-content">
                  {{ prompt.promptText ? prompt.promptText.substring(0, 100) + (prompt.promptText.length > 100 ? '...' : '') : '暂无内容' }}
                </div>
              </div>
              <div class="prompt-details">
                <div class="detail-item">
                  <span class="label">创建人：</span>
                  <span class="value">{{ prompt.createUserString }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="create-time">
                {{ prompt.createTime }}
              </div>
              <div class="card-actions" @click.stop>
                <a-button
                  v-permission="['ai:promptResource:update']"
                  type="text"
                  size="small"
                  @click="onUpdate(prompt)"
                >
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button
                  v-permission="['ai:promptResource:delete']"
                  type="text"
                  size="small"
                  status="danger"
                  :disabled="prompt.disabled"
                  @click="onDelete(prompt)"
                >
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <a-empty description="暂无提示词资源">
            <a-button v-permission="['ai:promptResource:create']" type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              新增提示词
            </a-button>
          </a-empty>
        </div>
      </a-spin>

      <!-- 分页 -->
      <div v-if="dataList.length > 0" class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="true"
          :show-jumper="true"
          :show-page-size="true"
          @change="search"
          @page-size-change="search"
        />
      </div>
    </div>

    <PromptResourceAddModal ref="PromptResourceAddModalRef" @save-success="search" />
    <PromptResourceDetailDrawer ref="PromptResourceDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import PromptResourceAddModal from './PromptResourceAddModal.vue'
import PromptResourceDetailDrawer from './PromptResourceDetailDrawer.vue'
import { type PromptResourceQuery, type PromptResourceResp, deletePromptResource, exportPromptResource, listPromptResource } from '@/apis/ai/promptResource'
import { useDownload, useTable } from '@/hooks'

defineOptions({ name: 'PromptResource' })

const queryForm = reactive<PromptResourceQuery>({
  spaceId: undefined,
  name: undefined,
  description: undefined,
  status: undefined,
  createUser: undefined,
  createTime: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listPromptResource({ ...queryForm, ...page }), { immediate: true })

// 重置
const reset = () => {
  queryForm.spaceId = undefined
  queryForm.name = undefined
  queryForm.description = undefined
  queryForm.status = undefined
  queryForm.createUser = undefined
  queryForm.createTime = undefined
  search()
}

// 删除
const onDelete = (record: PromptResourceResp) => {
  return handleDelete(() => deletePromptResource(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportPromptResource(queryForm))
}

const PromptResourceAddModalRef = ref<InstanceType<typeof PromptResourceAddModal>>()
// 新增
const onAdd = () => {
  PromptResourceAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: PromptResourceResp) => {
  PromptResourceAddModalRef.value?.onUpdate(record.id)
}

const PromptResourceDetailDrawerRef = ref<InstanceType<typeof PromptResourceDetailDrawer>>()
// 详情
const onDetail = (record: PromptResourceResp) => {
  PromptResourceDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
.ai-prompt-page {
  padding: 24px;
  background: var(--color-fill-1);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    .prompt-count {
      font-size: 14px;
      color: var(--color-text-3);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filter-section {
  background: var(--color-bg-2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
}

.content-section {
  .prompt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .prompt-card {
    background: var(--color-bg-2);
    border-radius: 8px;
    border: 1px solid var(--color-border-2);
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--color-border-3);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;

      .prompt-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: var(--color-primary-light-1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
        font-size: 20px;
        flex-shrink: 0;
      }

      .prompt-info {
        flex: 1;
        min-width: 0;

        .prompt-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-1);
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
      margin-bottom: 16px;

      .prompt-description {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: var(--color-text-2);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .prompt-text {
        background: var(--color-fill-2);
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 12px;

        .text-label {
          font-size: 12px;
          color: var(--color-text-3);
          margin-bottom: 4px;
        }

        .text-content {
          font-size: 13px;
          color: var(--color-text-2);
          line-height: 1.4;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
      }

      .prompt-details {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .detail-item {
          display: flex;
          font-size: 12px;

          .label {
            color: var(--color-text-3);
            width: 50px;
            flex-shrink: 0;
          }

          .value {
            color: var(--color-text-2);
            flex: 1;
          }
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--color-border-1);

      .create-time {
        font-size: 12px;
        color: var(--color-text-3);
      }

      .card-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }
}

@media (max-width: 768px) {
  .ai-prompt-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-actions {
      align-self: stretch;
      justify-content: flex-end;
    }
  }

  .filter-section .filter-row {
    flex-direction: column;
    align-items: stretch;

    > * {
      width: 100% !important;
    }
  }

  .content-section .prompt-grid {
    grid-template-columns: 1fr;
  }
}
</style>
