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
	    <a-input-search v-model="queryForm.itemName" placeholder="请输入导航项名称" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.itemKey" placeholder="请输入导航项唯一标识" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.pageUrl" placeholder="请输入页面路径" allow-clear @search="search" />
		<a-radio-group v-model="queryForm.isVisible" :options="common02_type" @change="search"/>
	    <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
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
import { type NavItemsResp, type NavItemsQuery, deleteNavItems, exportNavItems, listNavItems } from '@/apis/daily/navItems'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'NavItems' })

const { common_type,common02_type } = useDict('common_type','common02_type')

const queryForm = reactive<NavItemsQuery>({
  itemName: undefined,
  itemKey: undefined,
  pageUrl: undefined,
  isVisible: undefined,
  createUser: undefined,
  createTime: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listNavItems({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '导航项名称', dataIndex: 'itemName', slotName: 'itemName' },
  { title: '导航项唯一标识', dataIndex: 'itemKey', slotName: 'itemKey' },
  { title: '常态图标', dataIndex: 'iconNormal', slotName: 'iconNormal' },
  { title: '激活图标', dataIndex: 'iconActive', slotName: 'iconActive' },
  { title: '页面路径', dataIndex: 'pageUrl', slotName: 'pageUrl' },
  { title: '是否可见', dataIndex: 'isVisible', slotName: 'isVisible' },
  { title: '排序', dataIndex: 'sort', slotName: 'sort' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:navItems:get', 'daily:navItems:update', 'daily:navItems:delete'])
  }
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
    showModal: true
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
