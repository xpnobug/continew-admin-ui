<template>
  <GiPageLayout>
    <div class="robot-list-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar-section">
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

        <!-- 统计信息 -->
        <div class="stats-section">
          <a-space :size="24">
            <a-statistic
              :value="onlineCount"
              :value-style="{ color: '#0fc6c2' }"
            >
              <template #title>
                <span style="color: var(--color-text-2)">在线</span>
              </template>
            </a-statistic>
            <a-statistic
              :value="offlineCount"
              :value-style="{ color: '#86909c' }"
            >
              <template #title>
                <span style="color: var(--color-text-2)">离线</span>
              </template>
            </a-statistic>
            <a-statistic
              :value="errorCount"
              :value-style="{ color: '#f53f3f' }"
            >
              <template #title>
                <span style="color: var(--color-text-2)">异常</span>
              </template>
            </a-statistic>
          </a-space>
        </div>
      </div>

      <!-- 机器人卡片列表 -->
      <a-spin :loading="loading" style="width: 100%; min-height: 400px">
        <div v-if="dataList && dataList.length > 0" class="robot-cards">
          <RobotCard
            v-for="robot in dataList"
            :key="robot.id"
            :robot="robot"
            @refresh="search"
            @open-contacts="handleOpenContacts"
            @open-messages="handleOpenMessages"
            @open-chatrooms="handleOpenChatrooms"
            @open-system-messages="handleOpenSystemMessages"
            @open-settings="handleOpenSettings"
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

    <!-- 联系人管理抽屉 -->
    <ContactDrawer ref="ContactDrawerRef" />

    <!-- 消息管理抽屉 -->
    <MessageDrawer ref="MessageDrawerRef" />

    <!-- 群聊管理抽屉 -->
    <ChatRoomDrawer ref="ChatRoomDrawerRef" />

    <!-- 系统消息抽屉 -->
    <SystemMessageDrawer ref="SystemMessageDrawerRef" />

    <!-- 全局设置抽屉 -->
    <SettingsDrawer ref="SettingsDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import { Message, Notification } from '@arco-design/web-vue'
import RobotCard from './components/RobotCard.vue'
import RobotAddModal from './components/RobotAddModal.vue'
import ContactDrawer from './components/ContactDrawer.vue'
import MessageDrawer from './components/MessageDrawer.vue'
import ChatRoomDrawer from './components/ChatRoomDrawer.vue'
import SystemMessageDrawer from './components/SystemMessageDrawer.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import { type RobotQuery, type RobotResp, listRobot } from '@/apis/wechat'
import { useTable } from '@/hooks'

defineOptions({ name: 'WechatRobot' })

const RobotAddModalRef = ref()
const ContactDrawerRef = ref()
const MessageDrawerRef = ref()
const ChatRoomDrawerRef = ref()
const SystemMessageDrawerRef = ref()
const SettingsDrawerRef = ref()

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

// 统计数据
const onlineCount = computed(() => dataList.value?.filter((r: RobotResp) => r.status === 'online').length || 0)
const offlineCount = computed(() => dataList.value?.filter((r: RobotResp) => r.status === 'offline').length || 0)
const errorCount = computed(() => dataList.value?.filter((r: RobotResp) => r.status === 'error').length || 0)

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

// 打开联系人管理
const handleOpenContacts = (robot: RobotResp) => {
  ContactDrawerRef.value.open(robot)
}

// 打开消息管理
const handleOpenMessages = (robot: RobotResp) => {
  MessageDrawerRef.value.open(robot)
}

// 打开群聊管理
const handleOpenChatrooms = (robot: RobotResp) => {
  ChatRoomDrawerRef.value.open(robot)
}

// 打开系统消息
const handleOpenSystemMessages = (robot: RobotResp) => {
  SystemMessageDrawerRef.value.open(robot)
}

// 打开全局设置
const handleOpenSettings = (robot: RobotResp) => {
  SettingsDrawerRef.value.open(robot)
}
</script>

<style scoped lang="less">
.robot-list-container {
  padding: 20px;
  min-height: calc(100vh - 140px);

  .toolbar-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--color-bg-2);
    border-radius: 8px;
    flex-wrap: wrap;
    gap: 16px;

    .stats-section {
      display: flex;
      gap: 24px;
    }
  }

  .robot-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 1920px) {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 1440px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 1280px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px 20px;
    background: var(--color-bg-2);
    border-radius: 8px;
  }
}
</style>
