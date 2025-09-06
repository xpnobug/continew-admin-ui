<template>
  <div class="ai-entity-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">模型信息管理</h1>
        <span class="entity-count">共 {{ pagination.total }} 个模型</span>
      </div>
      <div class="header-actions">
        <a-button v-permission="['ai:entity:export']" @click="onExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
        <a-button v-permission="['ai:entity:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增模型
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
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

        <a-select
          v-model="queryForm.scenario"
          placeholder="应用场景"
          allow-clear
          style="width: 150px"
          @change="search"
        >
          <a-option :value="1">对话聊天</a-option>
          <a-option :value="2">文本生成</a-option>
          <a-option :value="3">文本嵌入</a-option>
          <a-option :value="4">图像生成</a-option>
          <a-option :value="5">图像理解</a-option>
          <a-option :value="6">语音识别</a-option>
          <a-option :value="7">语音合成</a-option>
          <a-option :value="8">代码生成</a-option>
          <a-option :value="9">翻译</a-option>
          <a-option :value="10">摘要</a-option>
          <a-option :value="11">问答</a-option>
          <a-option :value="12">情感分析</a-option>
          <a-option :value="99">自定义</a-option>
        </a-select>

        <a-input-search
          v-model="queryForm.name"
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
        <div v-if="dataList.length > 0" class="entity-grid">
          <div
            v-for="entity in dataList"
            :key="entity.id"
            class="entity-card"
            @click="onDetail(entity)"
          >
            <div class="card-header">
              <div class="entity-icon">
                <icon-robot />
              </div>
              <div class="entity-info">
                <h3 class="entity-name">{{ entity.name }}</h3>
                <span class="entity-meta">ID: {{ entity.metaId }}</span>
              </div>
              <div class="entity-status">
                <a-tag :color="entity.status === 1 ? 'green' : 'red'">
                  {{ entity.status === 1 ? '启用' : '禁用' }}
                </a-tag>
              </div>
            </div>

            <div class="card-content">
              <p class="entity-description">
                {{ entity.description || '暂无描述' }}
              </p>
              <div class="entity-details">
                <div class="detail-item">
                  <span class="label">场景：</span>
                  <a-tag :color="getScenarioInfo(entity.scenario).color">
                    {{ getScenarioInfo(entity.scenario).label }}
                  </a-tag>
                </div>
                <div class="detail-item">
                  <span class="label">创建人：</span>
                  <span class="value">{{ entity.createUserString }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="create-time">
                {{ entity.createTime }}
              </div>
              <div class="card-actions" @click.stop>
                <a-button
                  v-permission="['ai:entity:update']"
                  type="text"
                  size="small"
                  @click="onUpdate(entity)"
                >
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button
                  v-permission="['ai:entity:delete']"
                  type="text"
                  size="small"
                  status="danger"
                  :disabled="entity.disabled"
                  @click="onDelete(entity)"
                >
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <a-empty description="暂无模型数据">
            <a-button v-permission="['ai:entity:create']" type="primary" @click="onAdd">
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

    <EntityAddModal ref="EntityAddModalRef" @save-success="search" />
    <EntityDetailDrawer ref="EntityDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import EntityAddModal from './EntityAddModal.vue'
import EntityDetailDrawer from './EntityDetailDrawer.vue'
import { type EntityQuery, type EntityResp, deleteEntity, exportEntity, listEntity } from '@/apis/ai/entity'
import { useDownload, useTable } from '@/hooks'
import PromptSelector from "@/views/ai/PromptSelector.vue";

defineOptions({ name: 'Entity' })

// 场景映射
const scenarioMap = {
  1: { label: '对话聊天', color: 'blue' },
  2: { label: '文本生成', color: 'green' },
  3: { label: '文本嵌入', color: 'purple' },
  4: { label: '图像生成', color: 'orange' },
  5: { label: '图像理解', color: 'cyan' },
  6: { label: '语音识别', color: 'red' },
  7: { label: '语音合成', color: 'pink' },
  8: { label: '代码生成', color: 'lime' },
  9: { label: '翻译', color: 'yellow' },
  10: { label: '摘要', color: 'magenta' },
  11: { label: '问答', color: 'geekblue' },
  12: { label: '情感分析', color: 'volcano' },
  99: { label: '自定义', color: 'gray' },
}

const getScenarioInfo = (scenario: number) => {
  return scenarioMap[scenario as keyof typeof scenarioMap] || { label: '未知', color: 'gray' }
}

const queryForm = reactive<EntityQuery>({
  metaId: undefined,
  name: undefined,
  scenario: undefined,
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
} = useTable((page) => listEntity({ ...queryForm, ...page }), { immediate: true })

// 重置
const reset = () => {
  queryForm.metaId = undefined
  queryForm.name = undefined
  queryForm.scenario = undefined
  queryForm.status = undefined
  queryForm.createUser = undefined
  queryForm.createTime = undefined
  search()
}

// 删除
const onDelete = (record: EntityResp) => {
  return handleDelete(() => deleteEntity(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportEntity(queryForm))
}

const EntityAddModalRef = ref<InstanceType<typeof EntityAddModal>>()
// 新增
const onAdd = () => {
  EntityAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: EntityResp) => {
  EntityAddModalRef.value?.onUpdate(record.id)
}

const EntityDetailDrawerRef = ref<InstanceType<typeof EntityDetailDrawer>>()
// 详情
const onDetail = (record: EntityResp) => {
  EntityDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
.ai-entity-page {
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

    .entity-count {
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
  .entity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .entity-card {
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

      .entity-icon {
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

      .entity-info {
        flex: 1;
        min-width: 0;

        .entity-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-meta {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }

      .entity-status {
        flex-shrink: 0;
      }
    }

    .card-content {
      margin-bottom: 16px;

      .entity-description {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: var(--color-text-2);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .entity-details {
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
  .ai-entity-page {
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

  .content-section .entity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
