<template>
  <a-card class="robot-card" :hoverable="true">
    <template #cover>
      <div class="robot-header">
        <a-avatar :size="80" :image-url="robot.avatar || defaultAvatar" />
        <a-tag :color="statusColor" class="status-tag">{{ statusText }}</a-tag>
      </div>
    </template>

    <a-card-meta>
      <template #title>
        <div class="robot-title">
          <span v-if="robot.status === 'online'" class="nickname">{{ robot.nickname }}</span>
          <span v-else class="nickname-offline">未登录</span>
        </div>
      </template>

      <template #description>
        <div class="robot-info">
          <a-descriptions :column="1" size="small" :label-style="{ width: '90px', color: 'var(--color-text-3)' }">
            <a-descriptions-item label="机器人编码">
              <a-typography-text copyable>{{ robot.robotCode }}</a-typography-text>
            </a-descriptions-item>
            
            <a-descriptions-item v-if="robot.wechatId" label="微信ID">
              <a-typography-text copyable>{{ robot.wechatId }}</a-typography-text>
            </a-descriptions-item>
            
            <a-descriptions-item v-if="robot.alias" label="微信号">
              <a-typography-text copyable>{{ robot.alias }}</a-typography-text>
            </a-descriptions-item>
            
            <a-descriptions-item v-if="robot.bindMobile" label="绑定手机">
              {{ robot.bindMobile }}
            </a-descriptions-item>
            
            <a-descriptions-item label="Redis DB">
              <a-tag color="blue" size="small">DB{{ robot.redisDb }}</a-tag>
            </a-descriptions-item>
            
            <a-descriptions-item v-if="robot.lastLoginAt" label="最后登录">
              <a-tooltip :content="formatTime(robot.lastLoginAt * 1000)">
                <span>{{ formatRelativeTime(robot.lastLoginAt * 1000) }}</span>
              </a-tooltip>
            </a-descriptions-item>
            
            <a-descriptions-item label="创建时间">
              {{ formatTime(robot.createdAt * 1000) }}
            </a-descriptions-item>
            
            <a-descriptions-item v-if="robot.errorMessage" label="错误信息">
              <a-typography-text type="danger">{{ robot.errorMessage }}</a-typography-text>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </template>
    </a-card-meta>

    <template #actions>
      <div class="card-actions">
        <!-- 快捷功能 -->
        <a-space :size="4" wrap class="quick-actions">
          <a-tooltip content="联系人管理">
            <a-button type="text" size="small" @click="emit('open-contacts', robot)">
              <template #icon><icon-user /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="消息管理">
            <a-button type="text" size="small" @click="emit('open-messages', robot)">
              <template #icon><icon-message /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="群聊管理">
            <a-button type="text" size="small" @click="emit('open-chatrooms', robot)">
              <template #icon><icon-users /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="系统消息">
            <a-button type="text" size="small" @click="emit('open-system-messages', robot)">
              <template #icon><icon-notification /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="全局设置">
            <a-button type="text" size="small" @click="emit('open-settings', robot)">
              <template #icon><icon-settings /></template>
            </a-button>
          </a-tooltip>
        </a-space>

        <a-divider direction="vertical" />

        <!-- 管理操作 -->
        <a-space :size="4" wrap class="manage-actions">
          <!-- 登录/登出 -->
          <a-tooltip v-if="robot.status !== 'online'" content="扫码登录">
            <a-button
              v-permission="['wechat:robot:login']"
              type="text"
              size="small"
              @click="onLogin"
            >
              <template #icon><icon-qrcode /></template>
            </a-button>
          </a-tooltip>
          <a-popconfirm
            v-else
            content="确定要退出登录吗?"
            @ok="onLogout"
          >
            <a-tooltip content="退出登录">
              <a-button
                v-permission="['wechat:robot:logout']"
                type="text"
                size="small"
                status="danger"
              >
                <template #icon><icon-poweroff /></template>
              </a-button>
            </a-tooltip>
          </a-popconfirm>

          <!-- 更多操作 -->
          <a-dropdown>
            <a-button type="text" size="small">
              <template #icon><icon-more /></template>
            </a-button>
            <template #content>
              <a-doption @click="onRefresh">
                <template #icon><icon-refresh /></template>
                刷新状态
              </a-doption>
              <a-doption @click="onRestartClient">
                <template #icon><icon-desktop /></template>
                重启客户端
              </a-doption>
              <a-doption @click="onRestartServer">
                <template #icon><icon-cloud-server /></template>
                重启服务端
              </a-doption>
              <a-divider style="margin: 4px 0" />
              <a-doption status="danger" @click="confirmDelete">
                <template #icon><icon-delete /></template>
                删除机器人
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </template>
  </a-card>

  <!-- 登录弹窗 -->
  <LoginModal
    v-model:visible="loginModalVisible"
    :robot="robot"
    @success="handleLoginSuccess"
  />
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import LoginModal from './LoginModal.vue'
import type { RobotResp } from '@/apis/wechat'
import { deleteRobot, getRobot, logout, restartClient, restartServer } from '@/apis/wechat'

interface Props {
  robot: RobotResp
}

const props = defineProps<Props>()
const emit = defineEmits([
  'refresh',
  'open-contacts',
  'open-messages',
  'open-chatrooms',
  'open-system-messages',
  'open-settings',
])

const loginModalVisible = ref(false)
const defaultAvatar = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'

// 状态显示
const statusColor = computed(() => {
  const colorMap = {
    online: 'green',
    offline: 'gray',
    error: 'red',
  }
  return colorMap[props.robot.status] || 'gray'
})

const statusText = computed(() => {
  const textMap = {
    online: '在线',
    offline: '离线',
    error: '错误',
  }
  return textMap[props.robot.status] || '未知'
})

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化相对时间
const formatRelativeTime = (timestamp: number) => {
  const now = dayjs()
  const target = dayjs(timestamp)
  const diff = now.diff(target, 'minute')

  if (diff < 1)
    return '刚刚'
  if (diff < 60)
    return `${diff}分钟前`
  if (diff < 1440)
    return `${Math.floor(diff / 60)}小时前`
  if (diff < 10080)
    return `${Math.floor(diff / 1440)}天前`

  return formatTime(timestamp)
}

// 刷新机器人信息
const onRefresh = async () => {
  try {
    await getRobot(props.robot.id)
    Message.success('刷新成功')
    emit('refresh')
  }
  catch (error: any) {
    Message.error(error.message || '刷新失败')
  }
}

// 登录
const onLogin = () => {
  loginModalVisible.value = true
}

// 登录成功
const handleLoginSuccess = () => {
  emit('refresh')
}

// 登出
const onLogout = async () => {
  try {
    await logout(props.robot.id)
    Message.success('退出登录成功')
    emit('refresh')
  }
  catch (error: any) {
    Message.error(error.message || '退出登录失败')
  }
}

// 重启客户端
const onRestartClient = async () => {
  try {
    await restartClient(props.robot.id)
    Message.success('客户端容器重启成功')
    emit('refresh')
  }
  catch (error: any) {
    Message.error(error.message || '重启失败')
  }
}

// 重启服务端
const onRestartServer = async () => {
  try {
    await restartServer(props.robot.id)
    Message.success('服务端容器重启成功')
    emit('refresh')
  }
  catch (error: any) {
    Message.error(error.message || '重启失败')
  }
}

// 确认删除
const confirmDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除机器人"${props.robot.nickname || props.robot.robotCode}"吗?删除后数据将无法恢复!`,
    okText: '删除',
    okButtonProps: {
      status: 'danger',
    },
    onOk: onDelete,
  })
}

// 删除
const onDelete = async () => {
  try {
    await deleteRobot(props.robot.id)
    Message.success('删除成功')
    emit('refresh')
  }
  catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}
</script>

<style scoped lang="less">
.robot-card {
  .robot-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    //background: linear-gradient(135deg, #a6ea66 0%, #a48abd 100%);
    position: relative;
    min-height: 120px;

    .status-tag {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .robot-title {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;

    .nickname {
      color: var(--color-text-1);
    }

    .nickname-offline {
      color: var(--color-text-3);
    }
  }

  .robot-info {
    padding: 8px 0;
    
    :deep(.arco-descriptions-item-label) {
      font-size: 12px;
      font-weight: 500;
    }
    
    :deep(.arco-descriptions-item-value) {
      font-size: 13px;
      color: var(--color-text-2);
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 4px 0;

    .quick-actions {
      flex: 1;
      justify-content: center;
    }

    .manage-actions {
      justify-content: center;
    }
  }
}
</style>
