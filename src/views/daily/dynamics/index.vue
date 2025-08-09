<template>
  <div class="gi_table_page">
    <GiTable
        title="动态管理"
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
        <a-button v-permission="['daily:dynamics:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:dynamics:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #isPublic="{ record }">
        <GiCellTag :value="record.isPublic" :dict="common02_type" />
      </template>
      <template #isTop="{ record }">
        <GiCellTag :value="record.isTop" :dict="common02_type" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:dynamics:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:dynamics:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
              v-permission="['daily:dynamics:delete']"
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

    <DynamicsAddModal ref="DynamicsAddModalRef" @save-success="search" />
    <DynamicsDetailDrawer ref="DynamicsDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import DynamicsAddModal from './DynamicsAddModal.vue'
import DynamicsDetailDrawer from './DynamicsDetailDrawer.vue'
import { type DynamicsResp, type DynamicsQuery, deleteDynamics, exportDynamics, listDynamics } from '@/apis/daily/dynamics'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Dynamics' })

const { common02_type } = useDict('common02_type')

const queryForm = reactive<DynamicsQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listDynamics({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '用户ID', dataIndex: 'userId', slotName: 'userId' },
  { title: '文字内容', dataIndex: 'content', slotName: 'content' },
  { title: '位置信息', dataIndex: 'location', slotName: 'location' },
  { title: '所属圈子ID', dataIndex: 'circleId', slotName: 'circleId' },
  { title: '是否公开：0否，1是', dataIndex: 'isPublic', slotName: 'isPublic' },
  { title: '点赞数', dataIndex: 'likesCount', slotName: 'likesCount' },
  { title: '评论数', dataIndex: 'commentsCount', slotName: 'commentsCount' },
  { title: '分享数', dataIndex: 'sharesCount', slotName: 'sharesCount' },
  { title: '状态（1：启用；2：禁用）', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '0-纯文字, 1-图片, 2-视频, 3-音频', dataIndex: 'type', slotName: 'type' },
  { title: '是否置顶：0否，1是', dataIndex: 'isTop', slotName: 'isTop' },
  { title: '发布地点', dataIndex: 'province', slotName: 'province' },
  { title: '浏览量', dataIndex: 'browse', slotName: 'browse' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:dynamics:get', 'daily:dynamics:update', 'daily:dynamics:delete'])
  }
]

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: DynamicsResp) => {
  return handleDelete(() => deleteDynamics(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportDynamics(queryForm))
}

const DynamicsAddModalRef = ref<InstanceType<typeof DynamicsAddModal>>()
// 新增
const onAdd = () => {
  DynamicsAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: DynamicsResp) => {
  DynamicsAddModalRef.value?.onUpdate(record.id)
}

const DynamicsDetailDrawerRef = ref<InstanceType<typeof DynamicsDetailDrawer>>()
// 详情
const onDetail = (record: DynamicsResp) => {
  DynamicsDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
