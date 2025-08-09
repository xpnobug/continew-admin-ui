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
        <a-radio-group v-model="queryForm.status" :options="common_type" @change="search"/>
        <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人" allow-clear @search="search" />
        <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
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
      <template #isActivity="{ record }">
        <GiCellTag :value="record.isActivity" :dict="common02_type" />
      </template>
      <template #isWaterfall="{ record }">
        <GiCellTag :value="record.isWaterfall" :dict="common02_type" />
      </template>
      <template #isClassify="{ record }">
        <GiCellTag :value="record.isClassify" :dict="common02_type" />
      </template>
      <template #isNoteShop="{ record }">
        <GiCellTag :value="record.isNoteShop" :dict="common02_type" />
      </template>
      <template #isNoteVideo="{ record }">
        <GiCellTag :value="record.isNoteVideo" :dict="common02_type" />
      </template>
      <template #isCard="{ record }">
        <GiCellTag :value="record.isCard" :dict="common02_type" />
      </template>
      <template #isLive="{ record }">
        <GiCellTag :value="record.isLive" :dict="common02_type" />
      </template>
      <template #isMemo="{ record }">
        <GiCellTag :value="record.isMemo" :dict="common02_type" />
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
import { type AppConfigResp, type AppConfigQuery, deleteAppConfig, exportAppConfig, listAppConfig } from '@/apis/daily/appConfig'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'AppConfig' })

const { common_type,common02_type } = useDict('common_type','common02_type')

const queryForm = reactive<AppConfigQuery>({
  status: undefined,
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
} = useTable((page) => listAppConfig({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '应用名称', dataIndex: 'appName', slotName: 'appName' },
  { title: '应用宣传语', dataIndex: 'appSlogan', slotName: 'appSlogan' },
  { title: '应用公告', dataIndex: 'appNotice', slotName: 'appNotice' },
  { title: '应用描述', dataIndex: 'appDesc', slotName: 'appDesc' },
  { title: '版权类型', dataIndex: 'copyType', slotName: 'copyType' },
  { title: '版权图片', dataIndex: 'copyImg', slotName: 'copyImg' },
  { title: '版权文本', dataIndex: 'copyText', slotName: 'copyText' },
  { title: '版权网站', dataIndex: 'copyWebsite', slotName: 'copyWebsite' },
  { title: '版权链接', dataIndex: 'copyLink', slotName: 'copyLink' },
  { title: '上传类型', dataIndex: 'uploadType', slotName: 'uploadType' },
  { title: '是否开启活动功能', dataIndex: 'isActivity', slotName: 'isActivity' },
  { title: '是否开启瀑布流', dataIndex: 'isWaterfall', slotName: 'isWaterfall' },
  { title: '是否开启分类', dataIndex: 'isClassify', slotName: 'isClassify' },
  { title: '是否开启商城', dataIndex: 'isNoteShop', slotName: 'isNoteShop' },
  { title: '是否开启视频', dataIndex: 'isNoteVideo', slotName: 'isNoteVideo' },
  { title: '是否开启卡片', dataIndex: 'isCard', slotName: 'isCard' },
  { title: '是否开启直播', dataIndex: 'isLive', slotName: 'isLive' },
  { title: '是否开启备忘录模式', dataIndex: 'isMemo', slotName: 'isMemo' },
  { title: '状态（1：启用；2：禁用）', dataIndex: 'status', slotName: 'status' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:appConfig:get', 'daily:appConfig:update', 'daily:appConfig:delete'])
  }
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
    showModal: true
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

<style scoped lang="scss"></style>
