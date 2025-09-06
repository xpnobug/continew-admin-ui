<template>
  <div class="gi_table_page">
    <GiTable
      title="导航项管理"
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
        <div class="search-form">
          <a-space wrap :size="[16, 8]">
            <div class="search-item">
              <a-input-search
                v-model="queryForm.itemName"
                placeholder="请输入导航项名称"
                class="search-input"
                allow-clear
                @search="search"
              />
            </div>
            <div class="search-item">
              <a-input-search
                v-model="queryForm.itemKey"
                placeholder="请输入唯一标识"
                class="search-input-small"
                allow-clear
                @search="search"
              />
            </div>
            <div class="search-item">
              <a-select
                v-model="queryForm.isVisible"
                placeholder="是否可见"
                class="search-select"
                allow-clear
                @change="search"
              >
                <a-option value="">全部</a-option>
                <a-option
                  v-for="item in common02_type"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-option>
              </a-select>
            </div>
            <div class="search-item">
              <a-button @click="reset">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </div>
          </a-space>
        </div>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['daily:navItems:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:navItems:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #itemInfo="{ record }">
        <div class="item-info">
          <div class="item-name">{{ record.itemName }}</div>
          <div class="item-key">{{ record.itemKey }}</div>
        </div>
      </template>
      <template #iconConfig="{ record }">
        <div class="icon-preview">
          <div v-if="record.iconNormal || record.iconActive" class="icon-group">
            <a-tooltip content="常态图标">
              <div class="icon-item">
                <img
                  v-if="record.iconNormal && isImageUrl(record.iconNormal)"
                  :src="record.iconNormal"
                  class="nav-icon"
                  alt="常态"
                />
                <span v-else-if="record.iconNormal" class="icon-text">常态</span>
                <span v-else class="icon-placeholder">-</span>
              </div>
            </a-tooltip>
            <a-tooltip content="激活图标">
              <div class="icon-item">
                <img
                  v-if="record.iconActive && isImageUrl(record.iconActive)"
                  :src="record.iconActive"
                  class="nav-icon"
                  alt="激活"
                />
                <span v-else-if="record.iconActive" class="icon-text">激活</span>
                <span v-else class="icon-placeholder">-</span>
              </div>
            </a-tooltip>
          </div>
          <span v-else class="no-icon">未配置</span>
        </div>
      </template>
      <template #badgeInfo="{ record }">
        <div class="badge-info">
          <div v-if="record.badgeType || record.badgeText" class="badge-content">
            <a-tag v-if="record.badgeType" size="small" color="blue">{{ record.badgeType }}</a-tag>
            <div v-if="record.badgeText" class="badge-text">{{ record.badgeText }}</div>
          </div>
          <span v-else class="no-badge">无徽章</span>
        </div>
      </template>
      <template #isVisible="{ record }">
        <GiCellTag :value="record.isVisible" :dict="common02_type" />
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="common_type" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:navItems:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:navItems:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:navItems:delete']"
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

    <NavItemsAddModal ref="NavItemsAddModalRef" @save-success="search" />
    <NavItemsDetailDrawer ref="NavItemsDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import NavItemsAddModal from './NavItemsAddModal.vue'
import NavItemsDetailDrawer from './NavItemsDetailDrawer.vue'
import { type NavItemsQuery, type NavItemsResp, deleteNavItems, exportNavItems, listNavItems } from '@/apis/daily/navItems'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'NavItems' })

const { common_type, common02_type } = useDict('common_type', 'common02_type')

// 判断是否为图片URL
const isImageUrl = (url: string) => {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']
  const lowerUrl = url.toLowerCase()
  return imageExtensions.some((ext) => lowerUrl.includes(ext)) || url.startsWith('http')
}

const queryForm = reactive<NavItemsQuery>({
  itemName: undefined,
  itemKey: undefined,
  pageUrl: undefined,
  isVisible: undefined,
  createUser: undefined,
  createTime: undefined,
  sort: ['sort,asc', 'id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listNavItems({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '导航项信息',
    dataIndex: 'itemName',
    width: 220,
    slotName: 'itemInfo',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '唯一标识',
    dataIndex: 'itemKey',
    width: 140,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '页面路径',
    dataIndex: 'pageUrl',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '图标配置',
    dataIndex: 'iconConfig',
    width: 120,
    align: 'center',
    slotName: 'iconConfig',
  },
  {
    title: '徽章信息',
    dataIndex: 'badgeInfo',
    width: 100,
    align: 'center',
    slotName: 'badgeInfo',
  },
  {
    title: '可见性',
    dataIndex: 'isVisible',
    slotName: 'isVisible',
    width: 80,
    align: 'center',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 70,
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
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 180,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:navItems:get', 'daily:navItems:update', 'daily:navItems:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.itemName = undefined
  queryForm.itemKey = undefined
  queryForm.pageUrl = undefined
  queryForm.isVisible = undefined
  queryForm.createUser = undefined
  queryForm.createTime = undefined
  search()
}

// 删除
const onDelete = (record: NavItemsResp) => {
  return handleDelete(() => deleteNavItems(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportNavItems(queryForm))
}

const NavItemsAddModalRef = ref<InstanceType<typeof NavItemsAddModal>>()
// 新增
const onAdd = () => {
  NavItemsAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: NavItemsResp) => {
  NavItemsAddModalRef.value?.onUpdate(record.id)
}

const NavItemsDetailDrawerRef = ref<InstanceType<typeof NavItemsDetailDrawer>>()
// 详情
const onDetail = (record: NavItemsResp) => {
  NavItemsDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss">
// 搜索区域样式
.search-form {
  width: 100%;

  .search-item {
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 200px;

    @media (max-width: 768px) {
      width: 160px;
    }
  }

  .search-input-small {
    width: 160px;

    @media (max-width: 768px) {
      width: 140px;
    }
  }

  .search-select {
    width: 120px;

    @media (max-width: 768px) {
      width: 100px;
    }
  }
}

// 导航项信息展示
.item-info {
  .item-name {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 2px;
  }

  .item-key {
    font-size: 12px;
    color: var(--color-text-3);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}

// 图标预览样式
.icon-preview {
  .icon-group {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
    border-radius: 4px;
    border: 1px solid var(--color-border-2);
    background: var(--color-bg-1);
  }

  .icon-text {
    font-size: 10px;
    color: var(--color-text-3);
    padding: 2px 4px;
    background: var(--color-bg-2);
    border-radius: 2px;
  }

  .icon-placeholder {
    font-size: 12px;
    color: var(--color-text-4);
  }

  .no-icon {
    font-size: 12px;
    color: var(--color-text-4);
  }
}

// 徽章信息样式
.badge-info {
  .badge-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .badge-text {
    font-size: 12px;
    color: var(--color-text-2);
    max-width: 60px;
    text-align: center;
    word-break: break-all;
  }

  .no-badge {
    font-size: 12px;
    color: var(--color-text-4);
  }
}

// 响应式优化
@media (max-width: 1200px) {
  :deep(.arco-table-th),
  :deep(.arco-table-td) {
    padding: 8px 4px;
  }
}

@media (max-width: 768px) {
  .search-form {
    :deep(.arco-space-item) {
      flex: 1;
      min-width: 0;
    }
  }

  .icon-preview .icon-group {
    flex-direction: column;
    gap: 4px;
  }

  .badge-info .badge-content {
    gap: 2px;
  }
}

// 表格优化
:deep(.gi-table) {
  .arco-table-container {
    border-radius: 8px;
  }

  .arco-table-th {
    background: var(--color-bg-2);
    font-weight: 500;
  }

  .arco-table-tr:hover {
    .nav-icon {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }
}
</style>
