<template>
  <div class="gi_table_page">
    <GiTable
      title="圈子成员管理"
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
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['daily:circleMembers:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:circleMembers:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:circleMembers:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:circleMembers:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:circleMembers:delete']"
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

    <CircleMembersAddModal ref="CircleMembersAddModalRef" @save-success="search" />
    <CircleMembersDetailDrawer ref="CircleMembersDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import CircleMembersAddModal from './CircleMembersAddModal.vue'
import CircleMembersDetailDrawer from './CircleMembersDetailDrawer.vue'
import { type CircleMembersQuery, type CircleMembersResp, deleteCircleMembers, exportCircleMembers, listCircleMembers } from '@/apis/daily/circleMembers'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CircleMembers' })

const queryForm = reactive<CircleMembersQuery>({
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCircleMembers({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '角色：1创建者，2管理员，3普通成员', dataIndex: 'role', slotName: 'role' },
  { title: '加入时间', dataIndex: 'joinedAt', slotName: 'joinedAt' },
  { title: '状态（1：启用；2：禁用）', dataIndex: 'status', slotName: 'status' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:circleMembers:get', 'daily:circleMembers:update', 'daily:circleMembers:delete']),
  },
]

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: CircleMembersResp) => {
  return handleDelete(() => deleteCircleMembers(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCircleMembers(queryForm))
}

const CircleMembersAddModalRef = ref<InstanceType<typeof CircleMembersAddModal>>()
// 新增
const onAdd = () => {
  CircleMembersAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CircleMembersResp) => {
  CircleMembersAddModalRef.value?.onUpdate(record.id)
}

const CircleMembersDetailDrawerRef = ref<InstanceType<typeof CircleMembersDetailDrawer>>()
// 详情
const onDetail = (record: CircleMembersResp) => {
  CircleMembersDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
