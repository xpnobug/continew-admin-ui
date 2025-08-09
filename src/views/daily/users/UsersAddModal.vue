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
import { getUsers, addUsers, updateUsers } from '@/apis/daily/users'
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
const title = computed(() => (isUpdate.value ? '修改用户' : '新增用户'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common_type,gender_enum } = useDict('common_type','gender_enum')

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '昵称',
    field: 'nickname',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '头像URL',
    field: 'avatar',
    type: 'input',
    span: 24,
  },
  {
    label: '手机号',
    field: 'mobile',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '性别',
    field: 'gender',
    type: 'radio-group',
    span: 24,
    props: {
      options: gender_enum,
    },
  },
  {
    label: '生日',
    field: 'birthday',
    type: 'date-picker',
    span: 24,
  },
  {
    label: '城市',
    field: 'city',
    type: 'input',
    span: 24,
  },
  {
    label: '省份',
    field: 'province',
    type: 'input',
    span: 24,
  },
  {
    label: '个人简介',
    field: 'bio',
    type: 'textarea',
    props: {
      autoSize: true
    },
    span: 24,
  },
  {
    label: '隐私设置',
    field: 'privacySetting',
    type: 'input',
    span: 24,
  },
  {
    label: '状态',
    field: 'status',
    type: 'radio-group',
    span: 24,
    required: true,
    props: {
      options: common_type,
    },
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
      await updateUsers(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addUsers(form)
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
  const { data } = await getUsers(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
