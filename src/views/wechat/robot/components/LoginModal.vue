<template>
  <a-modal
    v-model:visible="modalVisible"
    :title="modalTitle"
    :mask-closable="false"
    :width="qrCodeData ? '400px' : '600px'"
    @cancel="handleCancel"
    @before-ok="handleOk"
  >
    <!-- 登录方式选择 -->
    <div v-if="!qrCodeData" class="login-type-section">
      <a-alert type="info" banner style="margin-bottom: 16px">
        推荐使用 <span style="color: var(--color-primary-6); font-weight: bold">iPad登录</span>,iPad登录不上的时候再尝试其他登录方式。
      </a-alert>

      <a-form :model="loginForm" layout="vertical">
        <a-form-item label="登录设备类型" field="deviceType">
          <a-radio-group v-model="loginForm.deviceType">
            <a-radio value="ipad">iPad</a-radio>
            <a-radio value="win">Windows微信</a-radio>
            <a-radio value="mac">Mac微信</a-radio>
            <a-radio value="car">车载微信</a-radio>
          </a-radio-group>
          <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-3)">
            扫码登录方式,选择要模拟的设备类型
          </div>
        </a-form-item>

        <a-form-item field="isPretender">
          <a-checkbox
            v-model="loginForm.isPretender"
            :disabled="isIpadType || !robot.wechatId"
          >
            伪装成 iPad 登录
          </a-checkbox>
          <div v-if="isIpadType" style="margin-top: 4px; font-size: 12px; color: var(--color-warning-6)">
            {{ loginForm.deviceType }}登录不支持伪装
          </div>
          <div v-else-if="!robot.wechatId" style="margin-top: 4px; font-size: 12px; color: var(--color-warning-6)">
            还未通过{{ loginForm.deviceType }}成功登录过,不支持伪装
          </div>
        </a-form-item>
      </a-form>

      <a-alert type="warning" banner style="margin-top: 16px">
        <template #icon><icon-info-circle /></template>
        <div>
          <p style="margin: 0; font-weight: bold">风控小提示:</p>
          <ul style="margin: 8px 0 0 20px; padding: 0">
            <li>首次登录协议,24小时内会强制掉线一次,这是正常现象,重新扫码登录即可</li>
            <li>首次登录协议,登录成功之后最好先挂机4小时</li>
            <li>高危操作(加好友、进群等)最好稳定三天后再进行操作</li>
          </ul>
        </div>
      </a-alert>
    </div>

    <!-- 二维码显示 -->
    <div v-else class="qrcode-section">
      <p class="qrcode-title">
        <icon-wechat style="margin-right: 8px; color: #07c160" />
        扫码登录微信
      </p>

      <div class="qrcode-container">
        <!-- 直接使用后端返回的字段名（首字母大写） -->
        <template v-if="qrCodeData.QrBase64">
          <img :src="qrCodeData.QrBase64" alt="登录二维码" class="qrcode-image" />
        </template>
        <template v-else-if="qrCodeData.QrUrl">
          <img :src="qrCodeData.QrUrl" alt="登录二维码" class="qrcode-image" />
        </template>
        <template v-else-if="qrCodeData.Uuid">
          <!-- 如果有uuid但没有图片，使用微信官方二维码服务 -->
          <img :src="`http://weixin.qq.com/x/${qrCodeData.Uuid}`" alt="登录二维码" class="qrcode-image" />
        </template>
        <template v-else>
          <a-spin :loading="checkingStatus" tip="正在获取二维码..." />
        </template>
      </div>

      <!-- 倒计时进度条和状态提示 -->
      <div class="status-section">
        <!-- 二维码有效期倒计时 -->
        <div v-if="qrCodeExpirePercent > 0" class="expire-progress">
          <div class="expire-info">
            <span class="expire-label">二维码有效期</span>
            <span class="expire-time">{{ qrCodeExpireTime }}秒</span>
          </div>
          <a-progress
            :percent="qrCodeExpirePercent"
            :stroke-color="expireProgressColor"
            :show-text="false"
            size="small"
          />
        </div>

        <!-- UUID信息（调试用） -->
        <div v-if="qrCodeData.Uuid" class="uuid-info">
          <a-typography-text type="secondary" :copyable="{ text: qrCodeData.Uuid }">
            UUID: {{ qrCodeData.Uuid.substring(0, 20) }}...
          </a-typography-text>
        </div>
      </div>

      <div class="qrcode-tips">
        <!-- 登录状态提示 -->
        <div v-if="loginStatus" class="status-info">
          <!-- 登录成功 -->
<!--          <div v-if="loginStatus.status === 1" class="status-success">-->
<!--            <icon-check-circle style="font-size: 24px" />-->
<!--            <p>登录成功！</p>-->
<!--            <p v-if="loginStatus.nickName" class="user-info">{{ loginStatus.nickName }}</p>-->
<!--          </div>-->

          <!-- 扫码后等待确认 -->
          <div v-if="loginStatus.status === 1 || loginStatus.status === 4 || loginStatus.headImgUrl" class="status-scanned">
            <a-avatar v-if="loginStatus.headImgUrl" :size="64" :image-url="loginStatus.headImgUrl" />
            <p style="margin-top: 12px">
              <icon-info-circle />
              已扫描，请在手机上确认登录
            </p>
            <p v-if="loginStatus.nickName" class="user-info">{{ loginStatus.nickName }}</p>
          </div>

          <!-- 二维码过期 -->
          <div v-else-if="loginStatus.status === 2 || qrCodeExpirePercent <= 0" class="status-expired">
            <icon-close-circle style="font-size: 24px; color: var(--color-danger-6)" />
            <p>二维码已过期</p>
            <a-button type="primary" size="small" @click="handleRefreshQrCode" style="margin-top: 8px">
              <template #icon><icon-refresh /></template>
              重新获取
            </a-button>
          </div>

          <!-- 等待扫码 -->
          <div v-else-if="loginStatus.status === 0" class="status-waiting">
            <icon-qrcode style="font-size: 24px; color: var(--color-text-3)" />
            <p>请使用微信扫描二维码</p>
            <p class="tips">打开微信 → 扫一扫</p>
          </div>
        </div>

        <!-- 2FA验证 -->
        <div v-if="need2FA" class="twofa-section">
          <a-alert type="info" style="margin-bottom: 12px">
            需要二次验证,请输入验证码
          </a-alert>
          <a-input
            v-model="twoFAForm.code"
            placeholder="请输入验证码"
            allow-clear
          />
          <a-button type="primary" style="margin-top: 12px; width: 100%" @click="handle2FA">
            提交验证
          </a-button>
        </div>
      </div>
    </div>

    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button v-if="!qrCodeData" type="primary" @click="handleStartLogin">
        获取二维码
      </a-button>
      <a-button v-else type="primary" @click="handleRefreshQrCode">
        刷新二维码
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import type { LoginCheckResp, QrCodeResp, RobotResp } from '@/apis/wechat'
import { checkLoginStatus, getQrCode, verify2FA } from '@/apis/wechat'

interface Props {
  visible: boolean
  robot: RobotResp
}

const props = defineProps<Props>()
const emit = defineEmits(['update:visible', 'success'])

const modalVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const modalTitle = computed(() => {
  return qrCodeData.value ? '扫码登录' : '选择登录方式'
})

const loginForm = reactive({
  deviceType: 'ipad' as 'ipad' | 'win' | 'mac' | 'car',
  isPretender: false,
})

// iPad类型不支持伪装
const isIpadType = computed(() => loginForm.deviceType === 'ipad')

const qrCodeData = ref<QrCodeResp | null>(null)
const loginStatus = ref<LoginCheckResp | null>(null)
const checkingStatus = ref(false)
const need2FA = ref(false)
const checkTimer = ref<NodeJS.Timeout | null>(null)
const qrCodeExpirePercent = ref(100) // 二维码过期百分比,默认100%
const qrCodeExpireTime = ref(240) // 剩余秒数
const qrCodeStartTime = ref(0) // 二维码开始时间戳
const qrCodeTotalTime = ref(240) // 二维码总时长(秒)
const isScanned = ref(false) // 是否已扫码
const countdownTimer = ref<NodeJS.Timeout | null>(null) // 倒计时定时器

const twoFAForm = reactive({
  code: '',
  ticket: '',
})

// 计算进度条颜色
const expireProgressColor = computed(() => {
  if (qrCodeExpirePercent.value < 20)
    return 'rgb(var(--danger-6))'
  if (qrCodeExpirePercent.value < 50)
    return 'rgb(var(--warning-6))'
  return 'rgb(var(--success-6))'
})

// 开始登录
const handleStartLogin = async () => {
  try {
    const res = await getQrCode({
      robotId: props.robot.id,
      loginType: loginForm.deviceType,
      isPretender: loginForm.isPretender,
    })

    // 如果返回自动登录,直接成功
    if (res.data.autoLogin) {
      Message.success('自动登录成功!')
      emit('success')
      handleCancel()
      return
    }

    qrCodeData.value = res.data
    
    // 初始化倒计时
    qrCodeStartTime.value = Date.now()
    qrCodeTotalTime.value = 240 // iPad协议默认240秒
    qrCodeExpireTime.value = 240
    qrCodeExpirePercent.value = 100

    // 如果已经唤醒登录,设置状态为已扫描
    if (res.data.awkenLogin && res.data.Uuid) {
      loginStatus.value = { status: 2, uuid: res.data.Uuid }
    }

    // 启动倒计时（丝滑的每秒更新）
    startCountdown()
    
    // 启动登录状态检查（每3秒一次）
    startCheckLogin()
  }
  catch (error: any) {
    Message.error(error.message || '获取二维码失败')
  }
}

// 开始检查登录状态
const startCheckLogin = () => {
  if (!qrCodeData.value?.Uuid)
    return

  checkTimer.value = setInterval(async () => {
    try {
      checkingStatus.value = true
      const res = await checkLoginStatus({
        robotId: props.robot.id,
        uuid: qrCodeData.value!.Uuid,
      })

      loginStatus.value = res.data

      // 更新倒计时（用后端返回的expiredTime校准前端计时）
      if (res.data.expiredTime !== undefined) {
        // 后端返回的是剩余秒数，用于校准前端倒计时
        const backendRemaining = res.data.expiredTime
        const frontendRemaining = qrCodeExpireTime.value
        
        // 如果前后端时间差异超过5秒，使用后端时间校准
        if (Math.abs(backendRemaining - frontendRemaining) > 5) {
          const elapsed = qrCodeTotalTime.value - backendRemaining
          qrCodeStartTime.value = Date.now() - (elapsed * 1000)
        }
      }

      // 登录成功 (status=1)
      if (res.data.status === 1 && res.data.acctSectResp?.userName) {
        stopCheckLogin()
        stopCountdown() // 停止倒计时
        Message.success({
          content: `登录成功！欢迎 ${res.data.acctSectResp.nickName || res.data.nickName || ''}`,
          duration: 2000,
        })
        emit('success')
        setTimeout(() => {
          handleCancel()
        }, 1500)
        return
      }

      // 需要2FA验证 (status=3)
      if (res.data.status === 3 || res.data.need2FA) {
        stopCheckLogin()
        stopCountdown() // 停止倒计时
        need2FA.value = true
        twoFAForm.ticket = res.data.ticket || ''
        Message.info('需要进行二次验证，请输入验证码')
        return
      }

      // 二维码过期 (status=2)
      if (res.data.status === 2 || (res.data.expiredTime !== undefined && res.data.expiredTime < 10)) {
        stopCheckLogin()
        stopCountdown() // 停止倒计时
        qrCodeExpireTime.value = 0
        qrCodeExpirePercent.value = 0
        Message.warning('二维码已过期，请重新获取')
        return
      }
      
      // 扫码后等待用户确认 (status=4)
      if (res.data.status === 4 || res.data.headImgUrl) {
        // 第一次检测到已扫码时显示提示
        if (!isScanned.value && res.data.headImgUrl) {
          isScanned.value = true
          Message.info({
            content: `已扫码，请在手机上点击"登录"按钮`,
            duration: 3000,
          })
        }
        return
      }

      // 等待扫码中 (status=0)
      if (res.data.status === 0) {
        // 重置扫码状态
        isScanned.value = false
      }
    }
    catch (error: any) {
      console.error('检查登录状态失败:', error)
    }
    finally {
      checkingStatus.value = false
    }
  }, 3000) // 每3秒检查一次
}

// 停止检查登录状态
const stopCheckLogin = () => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
    checkTimer.value = null
  }
}

// 启动倒计时（每秒更新一次）
const startCountdown = () => {
  stopCountdown() // 先停止之前的倒计时
  
  countdownTimer.value = setInterval(() => {
    const elapsed = Math.floor((Date.now() - qrCodeStartTime.value) / 1000)
    const remaining = Math.max(0, qrCodeTotalTime.value - elapsed)
    
    qrCodeExpireTime.value = remaining
    qrCodeExpirePercent.value = Math.floor((remaining / qrCodeTotalTime.value) * 100)
    
    // 倒计时结束，自动判定为过期
    if (remaining <= 0) {
      stopCountdown()
      stopCheckLogin()
      Message.warning('二维码已过期，请重新获取')
    }
  }, 1000) // 每秒更新一次
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 刷新二维码
const handleRefreshQrCode = () => {
  stopCheckLogin()
  stopCountdown() // 停止倒计时
  qrCodeData.value = null
  loginStatus.value = null
  need2FA.value = false
  isScanned.value = false
  qrCodeExpirePercent.value = 100
  qrCodeExpireTime.value = 240
  handleStartLogin()
}

// 2FA验证
const handle2FA = async () => {
  if (!twoFAForm.code) {
    Message.warning('请输入验证码')
    return
  }

  try {
    const res = await verify2FA({
      robotId: props.robot.id,
      uuid: qrCodeData.value!.Uuid,
      data62: qrCodeData.value!.data62 || '',
      code: twoFAForm.code,
      ticket: twoFAForm.ticket,
    })

    if (res.status === 1) {
      Message.success('验证成功,登录完成!')
      emit('success')
      handleCancel()
    }
    else {
      Message.error(res.errMsg || '验证失败')
    }
  }
  catch (error: any) {
    Message.error(error.message || '验证失败')
  }
}

// 取消
const handleCancel = () => {
  stopCheckLogin()
  stopCountdown() // 停止倒计时
  qrCodeData.value = null
  loginStatus.value = null
  need2FA.value = false
  isScanned.value = false
  qrCodeExpirePercent.value = 100
  qrCodeExpireTime.value = 240
  loginForm.isPretender = false
  twoFAForm.code = ''
  twoFAForm.ticket = ''
  modalVisible.value = false
}

const handleOk = () => {
  return false // 阻止默认关闭行为
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCheckLogin()
  stopCountdown()
})
</script>

<style scoped lang="less">
.login-type-section {
  padding: 16px 0;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .qrcode-title {
    color: rgb(var(--success-6));
    font-weight: 400;
    font-size: 18px;
    text-align: center;
    margin: 0 0 16px 0;
  }

  .qrcode-container {
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    margin-bottom: 16px;
    background: var(--color-fill-1);

    .qrcode-image {
      max-width: 280px;
      max-height: 280px;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  }

  .status-section {
    width: 100%;
    margin-top: 12px;
  }

  .expire-progress {
    margin-bottom: 12px;

    .expire-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .expire-label {
        font-size: 12px;
        color: var(--color-text-3);
      }
      
      .expire-time {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-primary-6);
      }
    }
  }

  .uuid-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: var(--color-fill-2);
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
  }

  .qrcode-tips {
    width: 100%;

    .status-info {
      margin-top: 16px;
      padding: 16px;
      background: var(--color-fill-1);
      border-radius: 8px;
      text-align: center;

      .status-success,
      .status-scanned,
      .status-expired,
      .status-waiting {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        p {
          margin: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-info {
          font-size: 13px;
          color: var(--color-text-3);
        }

        .tips {
          font-size: 12px;
          color: var(--color-text-4);
        }
      }

      .status-success {
        color: var(--color-success-6);
        font-weight: 500;
      }

      .status-scanned {
        color: var(--color-info-6);
      }

      .status-expired {
        color: var(--color-danger-6);
      }

      .status-waiting {
        color: var(--color-text-3);
      }
    }

    .twofa-section {
      margin-top: 16px;
      padding: 16px;
      background: var(--color-fill-1);
      border-radius: 4px;
    }
  }
}
</style>
