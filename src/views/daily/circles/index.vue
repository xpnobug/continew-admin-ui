<template>
  <div class="gi_table_page">
    <GiTable
      title="圈子管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <div class="search-container">
          <a-space wrap :size="16">
            <div class="search-group">
              <a-input-search
                v-model="queryForm.name"
                placeholder="请输入圈子名称"
                allow-clear
                style="width: 200px"
                size="small"
                @search="search"
              />
            </div>
            <div class="search-group">
              <span class="search-label">状态：</span>
              <a-select
                v-model="queryForm.status"
                placeholder="请选择状态"
                allow-clear
                style="width: 120px"
                size="small"
                @change="search"
              >
                <a-option :value="1">启用</a-option>
                <a-option :value="2">禁用</a-option>
              </a-select>
            </div>
            <div class="search-group">
              <span class="search-label">类型：</span>
              <a-select
                v-model="queryForm.type"
                placeholder="请选择类型"
                allow-clear
                style="width: 120px"
                size="small"
                @change="search"
              >
                <a-option value="hot">热门</a-option>
                <a-option value="new">新建</a-option>
              </a-select>
            </div>
            <a-button size="small" @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </a-space>
        </div>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['daily:circles:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:circles:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #circleInfo="{ record }">
        <div class="circle-info">
          <div class="circle-header">
            <div class="circle-avatar">
              <img v-if="record.avatar" :src="record.avatar" :alt="record.name" />
              <icon-user v-else />
            </div>
            <div class="circle-details">
              <div class="circle-name">{{ record.name }}</div>
              <div class="circle-desc">{{ record.description || '暂无描述' }}</div>
            </div>
          </div>
        </div>
      </template>
      <template #tags="{ record }">
        <div class="tags-container">
          <a-space direction="vertical" :size="4">
            <a-tag v-if="record.isHot === 1" color="red" size="small">
              <icon-fire /> 热门
            </a-tag>
            <a-tag v-if="record.isNew === 1" color="green" size="small">
              <icon-plus /> 新建
            </a-tag>
          </a-space>
        </div>
      </template>
      <template #statistics="{ record }">
        <div class="statistics-container">
          <div class="stat-item">
            <icon-user-group class="stat-icon" />
            <span class="stat-value">{{ record.membersCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <icon-message class="stat-icon" />
            <span class="stat-value">{{ record.dynamicsCount || 0 }}</span>
          </div>
        </div>
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="common_type" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:circles:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:circles:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:circles:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <CirclesAddModal ref="CirclesAddModalRef" @save-success="search" />
    <CirclesDetailDrawer ref="CirclesDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import CirclesAddModal from './CirclesAddModal.vue'
import CirclesDetailDrawer from './CirclesDetailDrawer.vue'
import { type CirclesQuery, type CirclesResp, deleteCircles, exportCircles, listCircles } from '@/apis/daily/circles'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Circles' })

const { common_type } = useDict('common_type')

const queryForm = reactive<CirclesQuery>({
  name: undefined,
  status: undefined,
  type: undefined,
  sort: ['id,desc'],
})

// 将“类型”筛选映射为 isHot/isNew
const buildQuery = (page: any) => {
  const map: any = { ...queryForm, ...page }
  if (map.type === 'hot') {
    map.isHot = 1
    map.isNew = undefined
  } else if (map.type === 'new') {
    map.isNew = 1
    map.isHot = undefined
  } else {
    map.isHot = map.isHot ?? undefined
    map.isNew = map.isNew ?? undefined
  }
  return map
}

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCircles(buildQuery(page)), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '圈子信息',
    dataIndex: 'circleInfo',
    slotName: 'circleInfo',
    width: 280,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    slotName: 'tags',
    width: 120,
    align: 'center',
  },
  {
    title: '统计数据',
    dataIndex: 'statistics',
    slotName: 'statistics',
    width: 150,
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:circles:get', 'daily:circles:update', 'daily:circles:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.name = undefined
  queryForm.status = undefined
  queryForm.type = undefined
  search()
}

// 删除
const onDelete = (record: CirclesResp) => {
  return handleDelete(() => deleteCircles(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCircles(queryForm))
}

const CirclesAddModalRef = ref<InstanceType<typeof CirclesAddModal>>()
// 新增
const onAdd = () => {
  CirclesAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CirclesResp) => {
  CirclesAddModalRef.value?.onUpdate(record.id)
}

const CirclesDetailDrawerRef = ref<InstanceType<typeof CirclesDetailDrawer>>()
// 详情
const onDetail = (record: CirclesResp) => {
  CirclesDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
.search-container {
  .search-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .search-label {
      font-size: 14px;
      color: var(--color-text-2);
      white-space: nowrap;
    }
  }
}

.circle-info {
  .circle-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .circle-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--color-fill-2);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .arco-icon {
        font-size: 18px;
        color: var(--color-text-3);
      }
    }

    .circle-details {
      flex: 1;
      min-width: 0;

      .circle-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-text-1);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .circle-desc {
        font-size: 12px;
        color: var(--color-text-3);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}

.tags-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.statistics-container {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    .stat-icon {
      font-size: 16px;
      color: var(--color-primary);
    }

    .stat-value {
      font-weight: 600;
      color: var(--color-text-1);
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .search-container {
    .search-group {
      flex-direction: column;
      align-items: flex-start;

      .search-label {
        font-size: 12px;
      }
    }
  }

  .circle-info {
    .circle-header {
      .circle-avatar {
        width: 32px;
        height: 32px;
      }

      .circle-details {
        .circle-name {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
