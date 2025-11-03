<template>
  <a-modal
    v-model:visible="visible"
    title="创建机器人"
    :mask-closable="false"
    width="600px"
    @cancel="onClose"
    @before-ok="handleSubmit"
  >
    <a-alert type="info" banner style="margin-bottom: 20px">
      <template #icon><icon-info-circle /></template>
      机器人创建后会自动分配Redis数据库,并初始化容器(如果启用Docker)
    </a-alert>

    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="机器人编码" field="robotCode" required>
        <a-input
          v-model="form.robotCode"
          placeholder="请输入机器人编码"
          allow-clear
        />
        <template #extra>
          <div style="font-size: 12px; color: var(--color-text-3); margin-top: 4px">
            机器人编码必须以字母开头,且只能包含字母、数字或下划线,长度5-64个字符
          </div>
        </template>
      </a-form-item>

      <a-form-item label="提示">
        <div class="create-tips">
          <p>1. 机器人创建后会自动分配唯一编码和Redis数据库</p>
          <p>2. 如果启用了Docker,会自动创建客户端和服务端容器</p>
          <p>3. 创建完成后请点击二维码图标进行登录</p>
          <p style="color: var(--color-danger-6)">
            4. 注意: 24小时内未登录的机器人可能会被回收
          </p>
        </div>
      </a-form-item>
    </a-form>

    <a-alert type="warning" banner style="margin-top: 16px">
      <template #icon><icon-exclamation-circle /></template>
      <div>
        <p style="margin: 0; font-weight: bold">使用提示:</p>
        <ul style="margin: 8px 0 0 20px; padding: 0">
          <li>首次登录协议,24小时内会强制掉线一次,这是正常现象</li>
          <li>登录成功后建议先挂机4小时</li>
          <li>高危操作(加好友、进群)建议稳定三天后再进行</li>
        </ul>
      </div>
    </a-alert>
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import { createRobot } from '@/apis/wechat'

const emit = defineEmits(['save-success'])

const visible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  robotCode: '',
})

const rules = {
  robotCode: [
    { required: true, message: '机器人编码不能为空' },
    { min: 5, message: '机器人编码至少输入5个字符' },
    { max: 64, message: '机器人编码不能超过64个字符' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]+$/,
      message: '机器人编码必须以字母开头,且只能是字母、数字或下划线',
    },
  ],
}

// 打开弹窗
const onOpen = () => {
  visible.value = true
}

// 关闭弹窗
const onClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    try {
      await createRobot({ robotCode: form.robotCode })
      Message.success('机器人创建成功!')
      emit('save-success')
      onClose()
      return true
    }
    catch (error: any) {
      Message.error(error.message || '创建失败')
      return false
    }
  }
  return false
}

defineExpose({
  onOpen,
})
</script>

<style scoped lang="less">
.create-tips {
  background: var(--color-fill-1);
  padding: 16px;
  border-radius: 4px;

  p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
