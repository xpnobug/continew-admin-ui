<template>
  <div class="gi_table_page">
    <GiTable
      title="应用配置管理"
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
              <span class="search-label">状态：</span>
              <a-radio-group v-model="queryForm.status" :options="common_type" size="small" @change="search" />
            </div>
            <div class="search-group">
              <a-input-search
                v-model="queryForm.createUser"
                placeholder="请输入创建人"
                allow-clear
                style="width: 160px"
                size="small"
                @search="search"
              />
            </div>
            <div class="search-group">
              <a-input-search
                v-model="queryForm.createTime"
                placeholder="请输入创建时间"
                allow-clear
                style="width: 160px"
                size="small"
                @search="search"
              />
            </div>
            <a-button size="small" @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </a-space>
        </div>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['daily:appConfig:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:appConfig:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #features="{ record }">
        <div class="features-container">
          <a-space wrap :size="4">
            <a-tag v-if="record.isActivity === 1" color="blue" size="small">活动</a-tag>
            <a-tag v-if="record.isWaterfall === 1" color="green" size="small">瀑布流</a-tag>
            <a-tag v-if="record.isClassify === 1" color="purple" size="small">分类</a-tag>
            <a-tag v-if="record.isNoteShop === 1" color="orange" size="small">商城</a-tag>
            <a-tag v-if="record.isNoteVideo === 1" color="red" size="small">视频</a-tag>
            <a-tag v-if="record.isCard === 1" color="cyan" size="small">卡片</a-tag>
            <a-tag v-if="record.isLive === 1" color="magenta" size="small">直播</a-tag>
            <a-tag v-if="record.isMemo === 1" color="lime" size="small">备忘录</a-tag>
          </a-space>
        </div>
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="common_type" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:appConfig:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:appConfig:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:appConfig:delete']"
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

    <AppConfigAddModal ref="AppConfigAddModalRef" @save-success="search" />
    <AppConfigDetailDrawer ref="AppConfigDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import AppConfigAddModal from './AppConfigAddModal.vue'
import AppConfigDetailDrawer from './AppConfigDetailDrawer.vue'
import { type AppConfigQuery, type AppConfigResp, deleteAppConfig, exportAppConfig, listAppConfig } from '@/apis/daily/appConfig'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'AppConfig' })

const { common_type, common02_type } = useDict('common_type', 'common02_type')

const queryForm = reactive<AppConfigQuery>({
  status: undefined,
  createUser: undefined,
  createTime: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listAppConfig({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  {
    title: '应用名称',
    dataIndex: 'appName',
    slotName: 'appName',
    width: 140,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '应用宣传语',
    dataIndex: 'appSlogan',
    slotName: 'appSlogan',
    width: 160,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '功能开关',
    dataIndex: 'features',
    slotName: 'features',
    width: 200,
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
    show: has.hasPermOr(['daily:appConfig:get', 'daily:appConfig:update', 'daily:appConfig:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.status = undefined
  queryForm.createUser = undefined
  queryForm.createTime = undefined
  search()
}

// 删除
const onDelete = (record: AppConfigResp) => {
  return handleDelete(() => deleteAppConfig(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportAppConfig(queryForm))
}

const AppConfigAddModalRef = ref<InstanceType<typeof AppConfigAddModal>>()
// 新增
const onAdd = () => {
  AppConfigAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: AppConfigResp) => {
  AppConfigAddModalRef.value?.onUpdate(record.id)
}

const AppConfigDetailDrawerRef = ref<InstanceType<typeof AppConfigDetailDrawer>>()
// 详情
const onDetail = (record: AppConfigResp) => {
  AppConfigDetailDrawerRef.value?.onOpen(record.id)
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

.features-container {
  max-width: 180px;

  :deep(.arco-tag) {
    margin: 2px;
    font-size: 12px;
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
}
</style>
