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
      <template #user="{ record }">
        <div class="user-info">
          <a-avatar
            :src="record.user?.avatar"
            :size="32"
            class="user-avatar"
          >
            {{ record.user?.nickname?.charAt(0) }}
          </a-avatar>
          <div class="user-details">
            <div class="user-name">{{ record.user?.nickname || record.user?.username }}</div>
            <div class="user-dept">{{ record.user?.deptName }}</div>
          </div>
        </div>
      </template>
      <template #content="{ record }">
        <div class="comment-content">
          {{ record.content }}
          <div v-if="record.replyUser" class="reply-info">
            <icon-reply style="color: #165dff; margin-right: 4px;" />
            回复 @{{ record.replyUser.nickname || record.replyUser.username }}
          </div>
        </div>
      </template>
      <template #commentType="{ record }">
        <a-tag v-if="record.replyCommentId === 0" color="blue">主评论</a-tag>
        <a-tag v-else color="orange">回复评论</a-tag>
      </template>
      <template #img="{ record }">
        <a-image
          v-if="record.img"
          :src="record.img"
          :width="60"
          :height="60"
          fit="cover"
          show-loader
          :preview="{ src: record.img }"
          class="comment-image"
        />
        <span v-else class="text-gray">无图片</span>
      </template>
      <template #likesCount="{ record }">
        <a-statistic :value="record.likesCount || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-heart style="color: #f53f3f" />
          </template>
        </a-statistic>
      </template>
      <template #listCount="{ record }">
        <a-statistic :value="record.listCount || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-message style="color: #165dff" />
          </template>
        </a-statistic>
      </template>
      <template #status="{ record }">
        <a-tag :color="record.status === 1 ? 'green' : 'red'">
          {{ record.status === 1 ? '正常' : '禁用' }}
        </a-tag>
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
import { type CommentsQuery, type CommentsResp, deleteComments, exportComments, listComments } from '@/apis/daily/comments'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Comments' })

const queryForm = reactive<CommentsQuery>({
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listComments({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '评论用户',
    dataIndex: 'user',
    slotName: 'user',
    width: 180,
  },
  {
    title: '评论内容',
    dataIndex: 'content',
    slotName: 'content',
    width: 250,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '评论类型',
    dataIndex: 'replyCommentId',
    slotName: 'commentType',
    width: 120,
  },
  {
    title: '相关图片',
    dataIndex: 'img',
    slotName: 'img',
    width: 100,
  },
  {
    title: '互动数据',
    children: [
      { title: '点赞', dataIndex: 'likesCount', slotName: 'likesCount', width: 80 },
      { title: '回复', dataIndex: 'listCount', slotName: 'listCount', width: 80 },
    ],
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:comments:get', 'daily:comments:update', 'daily:comments:delete']),
  },
]

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: CommentsResp) => {
  return handleDelete(() => deleteComments(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
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

<style scoped lang="scss">
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-avatar {
    flex-shrink: 0;
  }

  .user-details {
    .user-name {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.2;
    }

    .user-dept {
      font-size: 11px;
      color: var(--color-text-3);
      line-height: 1.2;
    }
  }
}

.comment-content {
  .reply-info {
    display: flex;
    align-items: center;
    margin-top: 4px;
    font-size: 11px;
    color: var(--color-text-3);
    font-style: italic;
  }
}

.comment-image {
  border-radius: 4px;
}

.text-gray {
  color: var(--color-text-3);
  font-size: 12px;
}
</style>
