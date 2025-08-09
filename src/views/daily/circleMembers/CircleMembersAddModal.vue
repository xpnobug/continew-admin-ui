<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getCircleMembers, addCircleMembers, updateCircleMembers } from '@/apis/daily/circleMembers'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改圈子成员' : '新增圈子成员'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '圈子ID',
    field: 'circleId',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '角色：1创建者，2管理员，3普通成员',
    field: 'role',
    type: 'input',
    span: 24,
  },
  {
    label: '加入时间',
    field: 'joinedAt',
    type: 'date-picker',
    props: {
      showTime: true,
    },
    span: 24,
    required: true,
  },
  {
    label: '状态（1：启用；2：禁用）',
    field: 'status',
    type: 'radio-group',
    span: 24,
    required: true,
  },
  {
    label: '创建人',
    field: 'createUser',
    type: 'input',
    span: 24,
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateCircleMembers(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCircleMembers(form)
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
  const { data } = await getCircleMembers(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
