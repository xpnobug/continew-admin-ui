<template>
  <GiPageLayout>
    <div class="robot-list-container">
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <a-space size="medium" wrap>
          <a-input-search
            v-model="queryForm.keyword"
            placeholder="搜索机器人(微信号/昵称/机器人编码)"
            allow-clear
            style="width: 350px"
            @search="handleSearch"
            @press-enter="handleSearch"
          />
          <a-radio-group
            v-model="queryForm.status"
            button-style="solid"
            type="button"
            @change="handleSearch"
          >
            <a-radio value="">全部</a-radio>
            <a-radio value="online">在线</a-radio>
            <a-radio value="offline">离线</a-radio>
            <a-radio value="error">错误</a-radio>
          </a-radio-group>
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <a-button v-permission="['wechat:robot:create']" type="primary" @click="onAdd">
            <template #icon><icon-plus /></template>
            创建机器人
          </a-button>
        </a-space>
      </div>

      <!-- 机器人卡片列表 -->
      <a-spin :loading="loading" style="width: 100%; min-height: 400px">
        <div v-if="dataList && dataList.length > 0" class="robot-cards">
          <RobotCard
            v-for="robot in dataList"
            :key="robot.id"
            :robot="robot"
            @refresh="search"
          />
        </div>
        <a-empty v-else description="暂无机器人" style="margin-top: 80px">
          <a-button v-permission="['wechat:robot:create']" type="primary" @click="onAdd">
            <template #icon><icon-plus /></template>
            立即创建
          </a-button>
        </a-empty>
      </a-spin>

      <!-- 分页 -->
      <div v-if="dataList && dataList.length > 0" class="pagination-section">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-total
          show-jumper
          show-page-size
          @change="search"
          @page-size-change="search"
        />
      </div>
    </div>

    <!-- 新建机器人弹窗 -->
    <RobotAddModal ref="RobotAddModalRef" @save-success="handleAddSuccess" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import { Message, Notification } from '@arco-design/web-vue'
import RobotCard from './components/RobotCard.vue'
import RobotAddModal from './components/RobotAddModal.vue'
import { type RobotQuery, listRobot } from '@/apis/wechat'
import { useTable } from '@/hooks'

defineOptions({ name: 'WechatRobot' })

const RobotAddModalRef = ref()

const queryForm = reactive<RobotQuery>({
  keyword: '',
  status: '',
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listRobot({ ...queryForm, ...page }), { immediate: true })

// 搜索(支持回车键)
const handleSearch = () => {
  pagination.current = 1
  search()
}

// 重置
const reset = () => {
  queryForm.keyword = ''
  queryForm.status = ''
  pagination.current = 1
  search()
}

// 新增
const onAdd = () => {
  RobotAddModalRef.value.onOpen()
}

// 新增成功
const handleAddSuccess = () => {
  Notification.success({
    title: '创建成功',
    content: '机器人创建成功,初始化需要一些时间,请耐心等待。创建完成后点击机器人卡片的二维码图标进行登录。如果24小时内未登录,机器人实例可能会被回收。',
    duration: 8000,
  })
  reset()
}
</script>

<style scoped lang="less">
.robot-list-container {
  padding: 20px;

  .filter-section {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--color-bg-2);
    border-radius: 4px;
  }

  .robot-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px;
    background: var(--color-bg-2);
    border-radius: 4px;
  }
}
</style>
