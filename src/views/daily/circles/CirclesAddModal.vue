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
import { getCircles, addCircles, updateCircles } from '@/apis/daily/circles'
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
const title = computed(() => (isUpdate.value ? '修改圈子' : '新增圈子'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common_type } = useDict('common_type')

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '圈子名称',
    field: 'name',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '圈子描述',
    field: 'description',
    type: 'input',
    span: 24,
  },
  {
    label: '圈子头像',
    field: 'avatar',
    type: 'input',
    span: 24,
  },
  {
    label: '圈子横幅',
    field: 'banner',
    type: 'input',
    span: 24,
  },
  {
    label: '是否热门：0否，1是',
    field: 'isHot',
    type: 'radio-group',
    span: 24,
    props: {
      options: common_type,
    },
  },
  {
    label: '是否新建：0否，1是',
    field: 'isNew',
    type: 'radio-group',
    span: 24,
    props: {
      options: common_type,
    },
  },
  {
    label: '成员数量',
    field: 'membersCount',
    type: 'input',
    span: 24,
  },
  {
    label: '动态数量',
    field: 'dynamicsCount',
    type: 'input',
    span: 24,
  },
  {
    label: '状态（1：启用；2：禁用）',
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
      await updateCircles(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCircles(form)
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
  const { data } = await getCircles(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
