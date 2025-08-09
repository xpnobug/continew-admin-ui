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
        <a-space wrap>
          <a-input-search
            v-model="queryForm.itemName"
            placeholder="请输入导航项名称"
            style="width: 200px"
            allow-clear
            @search="search"
          />
          <a-input-search
            v-model="queryForm.itemKey"
            placeholder="请输入唯一标识"
            style="width: 160px"
            allow-clear
            @search="search"
          />
          <a-select
            v-model="queryForm.isVisible"
            placeholder="是否可见"
            style="width: 120px"
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
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
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
    title: '导航项名称',
    dataIndex: 'itemName',
    width: 160,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '唯一标识',
    dataIndex: 'itemKey',
    width: 120,
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
    title: '是否可见',
    dataIndex: 'isVisible',
    slotName: 'isVisible',
    width: 100,
    align: 'center',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 80,
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

<style scoped lang="scss"></style>
