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
	    <a-input-search v-model="queryForm.name" placeholder="请输入圈子名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
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
      <template #isHot="{ record }">
        <GiCellTag :value="record.isHot" :dict="common_type" />
      </template>
      <template #isNew="{ record }">
        <GiCellTag :value="record.isNew" :dict="common_type" />
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
import { type CirclesResp, type CirclesQuery, deleteCircles, exportCircles, listCircles } from '@/apis/daily/circles'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Circles' })

const { common_type } = useDict('common_type')

const queryForm = reactive<CirclesQuery>({
  name: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listCircles({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '圈子名称', dataIndex: 'name', slotName: 'name' },
  { title: '是否热门：0否，1是', dataIndex: 'isHot', slotName: 'isHot' },
  { title: '是否新建：0否，1是', dataIndex: 'isNew', slotName: 'isNew' },
  { title: '成员数量', dataIndex: 'membersCount', slotName: 'membersCount' },
  { title: '动态数量', dataIndex: 'dynamicsCount', slotName: 'dynamicsCount' },
  { title: '状态（1：启用；2：禁用）', dataIndex: 'status', slotName: 'status' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:circles:get', 'daily:circles:update', 'daily:circles:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.name = undefined
  search()
}

// 删除
const onDelete = (record: CirclesResp) => {
  return handleDelete(() => deleteCircles(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
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

<style scoped lang="scss"></style>
