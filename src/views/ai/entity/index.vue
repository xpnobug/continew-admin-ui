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
            @click="navigateToChat(entity)"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="entity-avatar">
                <div class="entity-icon">
                  <icon-robot />
                </div>
              </div>
              <div class="entity-status-badge">
                <a-tooltip :content="entity.status === 1 ? '已启用' : '已禁用'">
                  <a-tag :color="entity.status === 1 ? 'green' : 'red'" size="small">
                    {{ entity.status === 1 ? '启用' : '禁用' }}
                  </a-tag>
                </a-tooltip>
              </div>
            </div>

            <!-- 卡片主体 -->
            <div class="card-body">
              <div class="entity-main-info">
                <h3 class="entity-name">{{ entity.name }}</h3>
                <p class="entity-description">
                  {{ entity.description || '暂无描述' }}
                </p>
              </div>

              <div class="entity-meta-info">
                <div class="meta-row">
                  <a-tag :color="getScenarioInfo(entity.scenario).color" size="small">
                    {{ getScenarioInfo(entity.scenario).label }}
                  </a-tag>
                </div>
                <div class="meta-row">
                  <span class="meta-label">应用</span>
                </div>
              </div>
            </div>

            <!-- 卡片底部 -->
            <div class="card-footer">
              <div class="footer-left">
                <div class="user-info">
                  <div class="user-avatar">
                    <icon-user />
                  </div>
                  <div class="user-details">
                    <span class="username">{{ entity.createUserString }}</span>
                    <span class="create-time">最近编辑 {{ entity.createTime?.slice(5, 16) || '' }}</span>
                  </div>
                </div>
              </div>
              <div class="footer-actions" @click.stop>
                <a-button
                  type="text"
                  size="mini"
                  @click="onDetail(entity)"
                >
                  <template #icon><icon-eye /></template>
                </a-button>
                <a-button
                  v-permission="['ai:entity:update']"
                  type="text"
                  size="mini"
                  @click="onUpdate(entity)"
                >
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-tooltip :content="entity.status === 1 ? '禁用模型' : '启用模型'">
                  <a-button
                    v-permission="['ai:entity:status']"
                    type="text"
                    size="mini"
                    :status="entity.status === 1 ? 'warning' : 'success'"
                    @click="onToggleStatus(entity)"
                  >
                    <template #icon>
                      <icon-poweroff v-if="entity.status === 1" />
                      <icon-play-circle v-else />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-button
                  v-permission="['ai:entity:delete']"
                  type="text"
                  size="mini"
                  status="danger"
                  :disabled="entity.disabled"
                  @click="onDelete(entity)"
                >
                  <template #icon><icon-delete /></template>
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
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import EntityAddModal from './EntityAddModal.vue'
import EntityDetailDrawer from './EntityDetailDrawer.vue'
import { type EntityQuery, type EntityResp, deleteEntity, exportEntity, listEntity, updateEntityStatus } from '@/apis/ai/entity'
import { getMeta } from '@/apis/ai/meta'
import { useDownload, useTable } from '@/hooks'

defineOptions({ name: 'Entity' })

const router = useRouter()

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

// 切换状态
const onToggleStatus = async (record: EntityResp) => {
  const newStatus = record.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'

  try {
    await updateEntityStatus(record.id, newStatus)
    record.status = newStatus
    Message.success(`${action}成功`)
  } catch (error) {
    console.error('更新状态失败:', error)
    Message.error(`${action}失败，请稍后重试`)
  }
}

// 跳转到 AI 对话工作台
const navigateToChat = async (entity: EntityResp) => {
  try {
    // 检查是否有关联的模型元数据
    console.log('entity', entity)
    if (entity) {
      // 已有关联的模型元数据，正常获取并跳转
      const metaResponse = await getMeta(entity.metaId)
      const modelMeta = metaResponse.data

      await router.push({
        path: '/ai/chat',
        query: {
          modelId: modelMeta.id,
          entityId: entity.id,
          modelName: modelMeta.modelName,
          entityName: entity.name,
        },
      })
    } else {
      // 新创建的模型，没有关联的元数据，传递实体信息到chat页面
      await router.push({
        path: '/ai/chat',
        query: {
          entityId: entity.id,
          entityName: entity.name,
          isNewModel: 'true', // 标识这是新创建的模型
        },
      })

      Message.info(`正在为新模型 "${entity.name}" 创建配置...`)
    }
  } catch (error) {
    console.error('跳转到AI对话工作台失败:', error)
    Message.error('跳转失败，请稍后重试')
  }
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
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .entity-card {
    background: var(--color-bg-1);
    border-radius: 12px;
    border: 1px solid var(--color-border-1);
    padding: 0;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: var(--color-primary-light-3);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-6px);

      .entity-avatar .entity-icon {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(22, 93, 255, 0.3);
      }
    }

    .card-header {
      position: relative;
      padding: 20px 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .entity-avatar {
        position: relative;

        .entity-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--color-primary-light-1) 0%, var(--color-primary-light-2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-6);
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      .entity-status-badge {
        position: absolute;
        top: 16px;
        right: 16px;

        :deep(.arco-tag) {
          border-radius: 50px;
          font-weight: 500;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
      }
    }

    .card-body {
      padding: 16px 20px;

      .entity-main-info {
        margin-bottom: 16px;

        .entity-name {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-1);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-description {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-3);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
        }
      }

      .entity-meta-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .meta-row {
          &:first-child {
            :deep(.arco-tag) {
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              border: none;
              background: var(--color-fill-2);
              color: var(--color-text-2);
            }
          }

          &:last-child {
            .meta-label {
              font-size: 12px;
              color: var(--color-text-4);
              background: var(--color-fill-1);
              padding: 4px 8px;
              border-radius: 12px;
              border: 1px solid var(--color-border-1);
            }
          }
        }
      }
    }

    .card-footer {
      padding: 0 20px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .footer-left {
        flex: 1;

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--color-primary-light-1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-primary-6);
            font-size: 12px;
          }

          .user-details {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .username {
              font-size: 12px;
              color: var(--color-text-2);
              font-weight: 500;
            }

            .create-time {
              font-size: 11px;
              color: var(--color-text-4);
            }
          }
        }
      }

      .footer-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
    }

    &:hover {
      .footer-actions {
        opacity: 1;
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

// 超大屏幕优化
@media (min-width: 1400px) {
  .content-section .entity-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }
}

// 平板横屏
@media (max-width: 1024px) {
  .content-section .entity-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

// 手机端
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
    gap: 16px;
  }

  .entity-card {
    .card-header {
      padding: 16px 16px 0;

      .entity-avatar .entity-icon {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }
    }

    .card-body {
      padding: 12px 16px;

      .entity-main-info .entity-name {
        font-size: 16px;
      }
    }

    .card-footer {
      padding: 0 16px 16px;

      .footer-actions {
        opacity: 1; // 手机端始终显示操作按钮
      }
    }
  }
}
</style>
