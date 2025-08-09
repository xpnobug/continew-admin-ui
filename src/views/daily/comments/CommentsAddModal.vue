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
import { addComments, getComments, updateComments } from '@/apis/daily/comments'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { common_type } = useDict('common_type')

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改评论' : '新增评论'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  userId: '',
  dynamicId: '',
  content: '',
  replyCommentId: 0,
  replyUserId: 0,
  img: '',
  status: 1,
})

const columns: ColumnItem[] = reactive([
  {
    label: '评论用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入评论用户ID',
    },
  },
  {
    label: '所属动态ID',
    field: 'dynamicId',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入动态ID',
    },
  },
  {
    label: '评论内容',
    field: 'content',
    type: 'textarea',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入评论内容',
      rows: 4,
      maxLength: 300,
      showWordLimit: true,
    },
  },
  {
    label: '回复评论ID',
    field: 'replyCommentId',
    type: 'input-number',
    span: 12,
    props: {
      placeholder: '回复评论ID（0为主评论）',
      min: 0,
    },
  },
  {
    label: '回复用户ID',
    field: 'replyUserId',
    type: 'input-number',
    span: 12,
    props: {
      placeholder: '回复用户ID（0为无回复）',
      min: 0,
    },
  },
  {
    label: '评论图片',
    field: 'img',
    type: 'input',
    span: 24,
    props: {
      placeholder: '请输入图片URL（可选）',
    },
  },
  {
    label: '状态',
    field: 'status',
    type: 'radio-group',
    span: 12,
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

// 数据转换：表单数据 -> 接口数据
const transformToApiData = (formData: any) => {
  return {
    ...formData,
    status: Number(formData.status),
    replyCommentId: Number(formData.replyCommentId) || 0,
    replyUserId: Number(formData.replyUserId) || 0,
  }
}

// 数据转换：接口数据 -> 表单数据
const transformToFormData = (apiData: any) => {
  return {
    ...apiData,
    status: String(apiData.status),
    replyCommentId: apiData.replyCommentId || 0,
    replyUserId: apiData.replyUserId || 0,
  }
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false

    const apiData = transformToApiData(form)

    if (isUpdate.value) {
      await updateComments(apiData, dataId.value)
      Message.success('修改成功')
    } else {
      await addComments(apiData)
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
  const { data } = await getComments(id)
  const formData = transformToFormData(data)
  Object.assign(form, formData)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
