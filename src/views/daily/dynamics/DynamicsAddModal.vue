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
import { getDynamics, addDynamics, updateDynamics } from '@/apis/daily/dynamics'
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
const title = computed(() => (isUpdate.value ? '修改动态' : '新增动态'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common02_type } = useDict('common02_type')

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '文字内容',
    field: 'content',
    type: 'input',
    span: 24,
  },
  {
    label: '位置信息',
    field: 'location',
    type: 'input',
    span: 24,
  },
  {
    label: '所属圈子ID',
    field: 'circleId',
    type: 'input',
    span: 24,
  },
  {
    label: '是否公开：0否，1是',
    field: 'isPublic',
    type: 'switch',
    span: 24,
    required: true,
    props: {
      options: common02_type,
    },
  },
  {
    label: '点赞数',
    field: 'likesCount',
    type: 'input',
    span: 24,
  },
  {
    label: '评论数',
    field: 'commentsCount',
    type: 'input',
    span: 24,
  },
  {
    label: '分享数',
    field: 'sharesCount',
    type: 'input',
    span: 24,
  },
  {
    label: '状态（1：启用；2：禁用）',
    field: 'status',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '0-纯文字, 1-图片, 2-视频, 3-音频',
    field: 'type',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '是否置顶：0否，1是',
    field: 'isTop',
    type: 'switch',
    span: 24,
    required: true,
    props: {
      options: common02_type,
    },
  },
  {
    label: '发布地点',
    field: 'province',
    type: 'input',
    span: 24,
  },
  {
    label: '浏览量',
    field: 'browse',
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
      await updateDynamics(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addDynamics(form)
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
  const { data } = await getDynamics(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
