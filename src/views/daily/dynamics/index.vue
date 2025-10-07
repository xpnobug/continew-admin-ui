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
      <template #media="{ record }">
        <div class="media-cell">
          <template v-if="record.type === 1 && record.imgs?.length">
            <a-image-preview-group infinite>
              <a-image
                v-for="img in record.imgs.slice(0, 3)"
                :key="img.id || img.url"
                :src="img.url"
                :width="40"
                :height="40"
                fit="cover"
                show-loader
              />
              <!-- 隐藏的图片用于预览 -->
              <a-image
                v-for="img in record.imgs.slice(3)"
                :key="'hidden-' + (img.id || img.url)"
                :src="img.url"
                :width="0"
                :height="0"
                style="display: none;"
              />
            </a-image-preview-group>
            <span v-if="record.imgs.length > 3" class="more">+{{ record.imgs.length - 3 }}</span>
          </template>
          <template v-else-if="record.type === 2 && record.video">
            <div class="video-preview" @click="onPreviewVideo(record.video)">
              <a-image
                :src="record.video.coverUrl || record.video.url"
                :width="60"
                :height="40"
                fit="cover"
                show-loader
                :preview="false"
              >
                <template #extra>
                  <icon-video-camera style="color: #fff" />
                </template>
              </a-image>
            </div>
          </template>
          <template v-else-if="record.type === 3 && record.audio">
            <a-tag color="orange" size="small">
              <template #icon><icon-sound /></template>
              音频
            </a-tag>
          </template>
          <template v-else>
            <span class="text-gray">无</span>
          </template>
        </div>
      </template>
      <template #auditStatus="{ record }">
        <a-tag :color="record.auditStatus === 1 ? 'green' : (record.auditStatus === 0 ? 'orange' : 'red')">
          {{ record.auditStatus === 1 ? '通过' : (record.auditStatus === 0 ? '待审核' : '不通过') }}
        </a-tag>
      </template>
      <template #toolbar-left>
        <a-space wrap>
          <a-select v-model="queryForm.auditStatus" allow-clear placeholder="审核状态" style="width: 120px" @change="search">
            <a-option :value="0">待审核</a-option>
            <a-option :value="1">通过</a-option>
            <a-option :value="2">不通过</a-option>
          </a-select>
          <a-select v-model="queryForm.type" allow-clear placeholder="类型" style="width: 120px" @change="search">
            <a-option :value="0">文字</a-option>
            <a-option :value="1">图片</a-option>
            <a-option :value="2">视频</a-option>
            <a-option :value="3">音频</a-option>
          </a-select>
          <a-select v-model="queryForm.isPublic" allow-clear placeholder="是否公开" style="width: 120px" @change="search">
            <a-option :value="1">公开</a-option>
            <a-option :value="0">私密</a-option>
          </a-select>
          <a-select v-model="queryForm.status" allow-clear placeholder="状态" style="width: 120px" @change="search">
            <a-option :value="1">启用</a-option>
            <a-option :value="2">禁用</a-option>
          </a-select>
          <a-input-number v-model="queryForm.userId" placeholder="用户ID" hide-button style="width: 140px" @change="search" />
          <a-input-number v-model="queryForm.circleId" placeholder="圈子ID" hide-button style="width: 140px" @change="search" />
          <DateRangePicker v-model="dateRange" @update:model-value="onDateChange" @change="search" />
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </a-space>
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
      <template #type="{ record }">
        <a-tag v-if="record.type === 0" color="blue">
          <template #icon><icon-edit /></template>
          纯文字
        </a-tag>
        <a-tag v-else-if="record.type === 1" color="green">
          <template #icon><icon-image /></template>
          图片
          <a-badge v-if="record.imgs?.length" :count="record.imgs.length" class="type-badge" />
        </a-tag>
        <a-tag v-else-if="record.type === 2" color="red">
          <template #icon><icon-video-camera /></template>
          视频
        </a-tag>
        <a-tag v-else-if="record.type === 3" color="orange">
          <template #icon><icon-sound /></template>
          音频
        </a-tag>
        <a-tag v-else color="gray">未知</a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="record.status === 1 ? 'green' : 'red'">
          {{ record.status === 1 ? '启用' : '禁用' }}
        </a-tag>
      </template>
      <template #isPublic="{ record }">
        <a-tag :color="record.isPublic ? 'blue' : 'orange'">
          <template #icon>
            <icon-eye v-if="record.isPublic" />
            <icon-eye-invisible v-else />
          </template>
          {{ record.isPublic ? '公开' : '私密' }}
        </a-tag>
      </template>
      <template #isTop="{ record }">
        <a-tag :color="record.isTop ? 'red' : 'gray'">
          <template #icon>
            <icon-to-top v-if="record.isTop" />
          </template>
          {{ record.isTop ? '已置顶' : '未置顶' }}
        </a-tag>
      </template>
      <template #likesCount="{ record }">
        <a-statistic :value="record.likesCount || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-heart style="color: #f53f3f" />
          </template>
        </a-statistic>
      </template>
      <template #commentsCount="{ record }">
        <a-statistic :value="record.commentsCount || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-message style="color: #165dff" />
          </template>
        </a-statistic>
      </template>
      <template #sharesCount="{ record }">
        <a-statistic :value="record.sharesCount || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-share-alt style="color: #00b42a" />
          </template>
        </a-statistic>
      </template>
      <template #browse="{ record }">
        <a-statistic :value="record.browse || 0" :value-style="{ fontSize: '14px' }">
          <template #suffix>
            <icon-eye style="color: #722ed1" />
          </template>
        </a-statistic>
      </template>
      <template #location="{ record }">
        <div v-if="record.location" class="location-info">
          <icon-location style="color: #165dff; margin-right: 4px;" />
          <span class="location-text">{{ getLocationName(record.location) }}</span>
        </div>
        <span v-else class="text-gray">未设置</span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:dynamics:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:dynamics:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['daily:dynamics:update']" title="通过" @click="onAudit(record, 1)" v-if="record.auditStatus !== 1">通过</a-link>
          <a-link v-permission="['daily:dynamics:update']" title="拒绝" @click="onAudit(record, 2)" v-if="record.auditStatus !== 2">拒绝</a-link>
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

    <!-- 视频预览模态框 -->
    <a-modal
      v-model:visible="videoPreviewVisible"
      title="视频预览"
      :footer="false"
      :width="800"
      unmount-on-close
    >
      <video
        v-if="currentVideo"
        :src="currentVideo.url"
        :poster="currentVideo.coverUrl"
        controls
        style="width: 100%; max-height: 500px;"
      >
        您的浏览器不支持 video 标签。
      </video>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import DynamicsAddModal from './DynamicsAddModal.vue'
import DynamicsDetailDrawer from './DynamicsDetailDrawer.vue'
import { type DynamicsQuery, type DynamicsResp, deleteDynamics, exportDynamics, listDynamicsAdmin, auditDynamics } from '@/apis/daily/dynamics'
import { useDownload, useTable } from '@/hooks'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
import dayjs from 'dayjs'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'

defineOptions({ name: 'Dynamics' })

const { common02_type: _common02_type, common_type: _common_type } = useDict('common02_type', 'common_type')

const queryForm = reactive<DynamicsQuery>({
  sort: ['id,desc'],
  auditStatus: undefined,
  type: undefined,
  isPublic: undefined,
  status: undefined,
  userId: undefined,
  circleId: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
})

const dateRange = ref<Date[] | undefined>(undefined)
const onDateChange = (val?: Date[]) => {
  if (!val || val.length < 2) {
    queryForm.createTimeStart = undefined
    queryForm.createTimeEnd = undefined
    return
  }
  queryForm.createTimeStart = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
  queryForm.createTimeEnd = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
}

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listDynamicsAdmin({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '发布用户',
    dataIndex: 'user',
    slotName: 'user',
    width: 150,
  },
  {
    title: '动态内容',
    dataIndex: 'content',
    slotName: 'content',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '媒体',
    dataIndex: 'media',
    slotName: 'media',
    width: 140,
  },
  {
    title: '动态类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100,
  },
  {
    title: '位置信息',
    dataIndex: 'location',
    slotName: 'location',
    width: 150,
  },
  {
    title: '公开状态',
    dataIndex: 'isPublic',
    slotName: 'isPublic',
    width: 100,
  },
  {
    title: '置顶状态',
    dataIndex: 'isTop',
    slotName: 'isTop',
    width: 100,
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    slotName: 'auditStatus',
    width: 100,
  },
  {
    title: '互动统计',
    children: [
      { title: '点赞', dataIndex: 'likesCount', slotName: 'likesCount', width: 80 },
      { title: '评论', dataIndex: 'commentsCount', slotName: 'commentsCount', width: 80 },
      { title: '分享', dataIndex: 'sharesCount', slotName: 'sharesCount', width: 80 },
      { title: '浏览', dataIndex: 'browse', slotName: 'browse', width: 80 },
    ],
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
  },
  // {
  //   title: '发布地点',
  //   dataIndex: 'province',
  //   slotName: 'province',
  //   width: 120
  // },
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
    show: has.hasPermOr(['daily:dynamics:get', 'daily:dynamics:update', 'daily:dynamics:delete']),
  },
]

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: DynamicsResp) => {
  return handleDelete(() => deleteDynamics(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
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

// 审核
const onAudit = async (record: DynamicsResp, status: number) => {
  try {
    await auditDynamics(record.id, status)
    Message.success(status === 1 ? '审核通过' : '已标记为不通过')
    search()
  } catch (err) {
    // 错误由拦截器统一提示
  }
}

// 解析位置信息
const getLocationName = (location: string) => {
  try {
    const locationData = JSON.parse(location)
    return locationData.name || locationData.address || '未知位置'
  } catch {
    return location
  }
}

// 视频预览
const videoPreviewVisible = ref(false)
const currentVideo = ref<{ url: string; coverUrl?: string } | null>(null)

const onPreviewVideo = (video: { url: string; coverUrl?: string }) => {
  currentVideo.value = video
  videoPreviewVisible.value = true
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

.location-info {
  display: flex;
  align-items: center;

  .location-text {
    font-size: 12px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.text-gray {
  color: var(--color-text-3);
  font-size: 12px;
}

.type-badge {
  margin-left: 4px;
  :deep(.arco-badge-number) {
    height: 16px;
    line-height: 16px;
    font-size: 10px;
    min-width: 16px;
  }
}

.media-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  .arco-image {
    border-radius: 4px;
    overflow: hidden;
  }
  .more {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.video-preview {
  cursor: pointer;
  position: relative;

  &:hover {
    opacity: 0.9;
  }
}
</style>
