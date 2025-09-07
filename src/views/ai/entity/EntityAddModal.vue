<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="600"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <div class="entity-modal-content">
      <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
        <a-form-item field="name" label="模型名称" required>
          <a-input
            v-model="form.name"
            placeholder="请输入模型显示名称"
            :max-length="128"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="description" label="模型描述">
          <a-textarea
            v-model="form.description"
            placeholder="请输入模型的详细描述、功能特点、使用建议等"
            :rows="4"
            :max-length="500"
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { addEntity, getEntity, updateEntity } from '@/apis/ai/entity'
import { useResetReactive } from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改模型信息' : '新增模型信息'))
const formRef = ref()

const [form, resetForm] = useResetReactive({
  name: '',
  description: '',
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '模型名称不能为空' }],
}

// 重置
const reset = () => {
  formRef.value?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate()
    if (valid) return false

    // 准备提交数据 - 后端会自动处理默认值和元数据创建
    const submitData = {
      name: form.name,
      description: form.description,
    }

    if (isUpdate.value) {
      // 修改时，获取原有数据并保留其他字段
      const { data: existingData } = await getEntity(dataId.value)
      const updateData = {
        ...existingData,
        name: form.name,
        description: form.description,
      }
      await updateEntity(updateData, dataId.value)
      Message.success('修改成功')
    } else {
      await addEntity(submitData)
      Message.success('新增成功')
    }

    emit('save-success')
    return true
  } catch (error) {
    Message.error('保存失败，请稍后重试')
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

  try {
    const { data } = await getEntity(id)

    // 只加载名称和描述字段
    form.name = data.name || ''
    form.description = data.description || ''

    visible.value = true
  } catch (error) {
    Message.error('加载数据失败，请稍后重试')
  }
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.entity-modal-content {
  padding: 8px 0;
}
</style>
