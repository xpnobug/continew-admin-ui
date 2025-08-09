<template>
  <div class="gi_table_page">
    <GiTable
      title="用户管理"
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
	    <a-input-search v-model="queryForm.nickname" placeholder="请输入昵称" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.mobile" placeholder="请输入手机号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['daily:users:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['daily:users:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #gender="{ record }">
        <GiCellTag :value="record.gender" :dict="gender_enum" />
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="common_type" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['daily:users:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['daily:users:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['daily:users:delete']"
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

    <UsersAddModal ref="UsersAddModalRef" @save-success="search" />
    <UsersDetailDrawer ref="UsersDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import UsersAddModal from './UsersAddModal.vue'
import UsersDetailDrawer from './UsersDetailDrawer.vue'
import { type UsersResp, type UsersQuery, deleteUsers, exportUsers, listUsers } from '@/apis/daily/users'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Users' })

const { common_type,gender_enum } = useDict('common_type','gender_enum')

const queryForm = reactive<UsersQuery>({
  nickname: undefined,
  mobile: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listUsers({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '微信OpenID', dataIndex: 'openid', slotName: 'openid' },
  { title: '微信UnionID', dataIndex: 'unionid', slotName: 'unionid' },
  { title: '昵称', dataIndex: 'nickname', slotName: 'nickname' },
  { title: '头像URL', dataIndex: 'avatar', slotName: 'avatar' },
  { title: '手机号', dataIndex: 'mobile', slotName: 'mobile' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender' },
  { title: '生日', dataIndex: 'birthday', slotName: 'birthday' },
  { title: '城市', dataIndex: 'city', slotName: 'city' },
  { title: '省份', dataIndex: 'province', slotName: 'province' },
  { title: '个人简介', dataIndex: 'bio', slotName: 'bio' },
  { title: '隐私设置', dataIndex: 'privacySetting', slotName: 'privacySetting' },
  { title: '最后登录时间', dataIndex: 'lastLoginAt', slotName: 'lastLoginAt' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['daily:users:get', 'daily:users:update', 'daily:users:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.nickname = undefined
  queryForm.mobile = undefined
  search()
}

// 删除
const onDelete = (record: UsersResp) => {
  return handleDelete(() => deleteUsers(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportUsers(queryForm))
}

const UsersAddModalRef = ref<InstanceType<typeof UsersAddModal>>()
// 新增
const onAdd = () => {
  UsersAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: UsersResp) => {
  UsersAddModalRef.value?.onUpdate(record.id)
}

const UsersDetailDrawerRef = ref<InstanceType<typeof UsersDetailDrawer>>()
// 详情
const onDetail = (record: UsersResp) => {
  UsersDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
