<template>
  <div class="ai-meta-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">模型元数据管理</h1>
        <span class="meta-count">共 {{ pagination.total }} 个模型</span>
      </div>
      <div class="header-actions">
        <a-button v-permission="['ai:meta:export']" @click="onExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
        <a-button v-permission="['ai:meta:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增模型
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <a-select
          v-model="queryForm.protocol"
          placeholder="模型协议"
          allow-clear
          style="width: 150px"
          @change="search"
        >
          <a-option value="openai">OpenAI</a-option>
          <a-option value="anthropic">Anthropic</a-option>
          <a-option value="huggingface">HuggingFace</a-option>
        </a-select>

        <a-select
          v-model="queryForm.status"
          placeholder="模型状态"
          allow-clear
          style="width: 150px"
          @change="search"
        >
          <a-option value="1">启用</a-option>
          <a-option value="0">禁用</a-option>
        </a-select>

        <a-input-search
          v-model="queryForm.modelName"
          placeholder="搜索模型名称..."
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
        <div v-if="dataList.length > 0" class="meta-grid">
          <div
            v-for="meta in dataList"
            :key="meta.id"
            class="meta-card"
            @click="onDetail(meta)"
          >
            <div class="card-header">
              <div class="meta-icon">
                <img v-if="meta.iconUrl" :src="meta.iconUrl" :alt="meta.modelName" />
                <icon-desktop v-else />
              </div>
              <div class="meta-info">
                <h3 class="meta-name">{{ meta.modelName }}</h3>
                <span class="meta-protocol">{{ meta.protocol }}</span>
              </div>
              <div class="meta-status">
                <a-tag :color="meta.status === 1 ? 'green' : 'red'">
                  {{ meta.status === 1 ? '启用' : '禁用' }}
                </a-tag>
              </div>
            </div>

            <div class="card-content">
              <p class="meta-description">
                {{ meta.description || '暂无描述' }}
              </p>
              <div class="meta-details">
                <div class="detail-item">
                  <span class="label">能力：</span>
                  <span class="value">{{ meta.capability || '未设置' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">创建人：</span>
                  <span class="value">{{ meta.createUserString }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="create-time">
                {{ meta.createTime }}
              </div>
              <div class="card-actions" @click.stop>
                <a-button
                  v-permission="['ai:meta:update']"
                  type="text"
                  size="small"
                  @click="onUpdate(meta)"
                >
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button
                  v-permission="['ai:meta:delete']"
                  type="text"
                  size="small"
                  status="danger"
                  :disabled="meta.disabled"
                  @click="onDelete(meta)"
                >
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <a-empty description="暂无模型元数据">
            <a-button v-permission="['ai:meta:create']" type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              新增模型
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

    <MetaAddModal ref="MetaAddModalRef" @save-success="search" />
    <MetaDetailDrawer ref="MetaDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import MetaAddModal from './MetaAddModal.vue'
import MetaDetailDrawer from './MetaDetailDrawer.vue'
import { type MetaQuery, type MetaResp, deleteMeta, exportMeta, listMeta } from '@/apis/ai/meta'
import { useDownload, useTable } from '@/hooks'

defineOptions({ name: 'AIMeta' })

const queryForm = reactive<MetaQuery>({
  modelName: undefined,
  protocol: undefined,
  iconUri: undefined,
  status: undefined,
  description: undefined,
  createUser: undefined,
  createTime: undefined,
  iconUrl: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listMeta({ ...queryForm, ...page }), { immediate: true })

// 重置
const reset = () => {
  queryForm.modelName = undefined
  queryForm.protocol = undefined
  queryForm.iconUri = undefined
  queryForm.status = undefined
  queryForm.description = undefined
  queryForm.createUser = undefined
  queryForm.createTime = undefined
  queryForm.iconUrl = undefined
  search()
}

// 删除
const onDelete = (record: MetaResp) => {
  return handleDelete(() => deleteMeta(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportMeta(queryForm))
}

const MetaAddModalRef = ref<InstanceType<typeof MetaAddModal>>()
// 新增
const onAdd = () => {
  MetaAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: MetaResp) => {
  MetaAddModalRef.value?.onUpdate(record.id)
}

const MetaDetailDrawerRef = ref<InstanceType<typeof MetaDetailDrawer>>()
// 详情
const onDetail = (record: MetaResp) => {
  MetaDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
.ai-meta-page {
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

    .meta-count {
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
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .meta-card {
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

      .meta-icon {
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
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .meta-info {
        flex: 1;
        min-width: 0;

        .meta-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .meta-protocol {
          font-size: 12px;
          color: var(--color-text-3);
          text-transform: uppercase;
        }
      }

      .meta-status {
        flex-shrink: 0;
      }
    }

    .card-content {
      margin-bottom: 16px;

      .meta-description {
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

      .meta-details {
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
  .ai-meta-page {
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

  .content-section .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
