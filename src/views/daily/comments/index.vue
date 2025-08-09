<template>
  <div class="gi_table_page">
    <GiTable
      title="评论管理"
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
        <a-button v-permission="['daily:comments:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:comments:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:comments:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:comments:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:comments:delete']"
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

    <CommentsAddModal ref="CommentsAddModalRef" @save-success="search" />
    <CommentsDetailDrawer ref="CommentsDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import CommentsAddModal from './CommentsAddModal.vue'
import CommentsDetailDrawer from './CommentsDetailDrawer.vue'
import { type CommentsResp, type CommentsQuery, deleteComments, exportComments, listComments } from '@/apis/daily/comments'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Comments' })


const queryForm = reactive<CommentsQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listComments({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '评论用户ID', dataIndex: 'userId', slotName: 'userId' },
  { title: '动态ID', dataIndex: 'dynamicId', slotName: 'dynamicId' },
  { title: '评论内容', dataIndex: 'content', slotName: 'content' },
  { title: '点赞数', dataIndex: 'likesCount', slotName: 'likesCount' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '评论', dataIndex: 'comment', slotName: 'comment' },
  { title: '头像', dataIndex: 'img', slotName: 'img' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:comments:get', 'daily:comments:update', 'daily:comments:delete'])
  }
]

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: CommentsResp) => {
  return handleDelete(() => deleteComments(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportComments(queryForm))
}

const CommentsAddModalRef = ref<InstanceType<typeof CommentsAddModal>>()
// 新增
const onAdd = () => {
  CommentsAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CommentsResp) => {
  CommentsAddModalRef.value?.onUpdate(record.id)
}

const CommentsDetailDrawerRef = ref<InstanceType<typeof CommentsDetailDrawer>>()
// 详情
const onDetail = (record: CommentsResp) => {
  CommentsDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
