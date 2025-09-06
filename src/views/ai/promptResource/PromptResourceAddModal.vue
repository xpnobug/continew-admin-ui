<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 1000 ? 1000 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <div class="prompt-modal-content">
      <a-tabs v-model:active-key="activeTab" type="line">
        <a-tab-pane key="basic" title="基础信息">
          <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="spaceId" label="空间ID" required>
                  <a-input-number
                    v-model="form.spaceId"
                    placeholder="请输入空间ID"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="name" label="提示词名称" required>
                  <a-input v-model="form.name" placeholder="请输入提示词名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item field="status" label="状态" required>
              <a-radio-group v-model="form.status">
                <a-radio :value="1">有效</a-radio>
                <a-radio :value="0">无效</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item field="description" label="提示词描述">
              <a-textarea
                v-model="form.description"
                placeholder="请输入提示词的用途和功能描述"
                :rows="3"
                :max-length="255"
                show-word-limit
              />
            </a-form-item>

            <a-form-item field="promptText" label="提示词内容" required>
              <a-textarea
                v-model="form.promptText"
                placeholder="请输入提示词内容"
                :rows="8"
                show-word-limit
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addPromptResource, getPromptResource, updatePromptResource } from '@/apis/ai/promptResource'
import type { GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改提示词资源' : '新增提示词资源'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  spaceId: null as number | null,
  name: '',
  description: '',
  promptText: '',
  status: 1,
})

const activeTab = ref('basic')

// 表单验证规则
const rules = {
  spaceId: [{ required: true, message: '空间ID不能为空' }],
  name: [{ required: true, message: '提示词名称不能为空' }],
  promptText: [{ required: true, message: '提示词内容不能为空' }],
  status: [{ required: true, message: '状态不能为空' }],
}

// 重置
const reset = () => {
  formRef.value?.resetFields()
  resetForm()
  activeTab.value = 'basic'
}

// 保存
const save = async () => {
  try {
    // 验证基础表单
    const basicValid = await formRef.value?.validate()
    if (basicValid) return false

    // 准备提交数据
    const submitData = {
      spaceId: form.spaceId,
      name: form.name,
      description: form.description,
      promptText: form.promptText,
      status: form.status,
    }

    if (isUpdate.value) {
      await updatePromptResource(submitData, dataId.value)
      Message.success('修改成功')
    } else {
      await addPromptResource(submitData)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getPromptResource(id)

  // 基础字段赋值
  form.spaceId = data.spaceId
  form.name = data.name
  form.description = data.description
  form.promptText = data.promptText
  form.status = Number(data.status)

  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.prompt-modal-content {
  padding: 8px 0;

  :deep(.arco-form-item) {
    margin-bottom: 20px;
  }

  :deep(.arco-form-item-label) {
    font-weight: 500;
    color: var(--color-text-1);
  }

  :deep(.arco-textarea) {
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  :deep(.arco-input) {
    border-radius: 6px;
  }

  :deep(.arco-form-item-extra) {
    color: var(--color-text-3);
    font-size: 12px;
    margin-top: 4px;
  }

  // 为提示词内容字段添加特殊样式
  :deep(.arco-form-item:last-child .arco-textarea) {
    background: var(--color-fill-2);
    border: 1px solid var(--color-border-2);

    &:focus {
      background: var(--color-bg-2);
      border-color: var(--color-primary);
    }
  }
}
</style>
