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
const { common02_type, common_type } = useDict('common02_type', 'common_type')

const [form, resetForm] = useResetReactive({
  userId: '',
  content: '',
  type: 0,
  location: '',
  province: '',
  circleId: '',
  isPublic: true,
  isTop: false,
  status: 1
})

const dynamicTypeOptions = [
  { label: '纯文字', value: 0 },
  { label: '图片', value: 1 },
  { label: '视频', value: 2 },
  { label: '音频', value: 3 }
]


const columns: ColumnItem[] = reactive([
  {
    label: '发布用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入发布用户ID'
    }
  },
  {
    label: '动态类型',
    field: 'type',
    type: 'radio-group',
    span: 24,
    required: true,
    props: {
      options: dynamicTypeOptions
    }
  },
  {
    label: '动态内容',
    field: 'content',
    type: 'textarea',
    span: 24,
    props: {
      placeholder: '请输入动态内容',
      rows: 4,
      maxLength: 500,
      showWordLimit: true
    }
  },
  {
    label: '所属圈子ID',
    field: 'circleId',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入圈子ID'
    }
  },
  {
    label: '发布状态',
    field: 'status',
    type: 'radio-group',
    span: 12,
    required: true,
    props: {
      options: common_type
    }
  },
  {
    label: '公开状态',
    field: 'isPublic',
    type: 'switch',
    span: 12,
    required: true,
    props: {
      options: common02_type
    }
  },
  {
    label: '置顶状态',
    field: 'isTop',
    type: 'switch',
    span: 12,
    required: true,
    props: {
      options: common02_type
    }
  },
  {
    label: '位置信息',
    field: 'location',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入详细位置信息'
    }
  },
  {
    label: '发布地点',
    field: 'province',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入发布省份/城市'
    }
  }
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
    // isPublic: formData.isPublic === '1',
    // isTop: formData.isTop === '1',
  }
}

// 数据转换：接口数据 -> 表单数据
const transformToFormData = (apiData: any) => {
  return {
    ...apiData,
    status: String(apiData.status),
    // isPublic: apiData.isPublic ? '1' : '0',
    // isTop: apiData.isTop ? '1' : '0',
  }
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false

    const apiData = transformToApiData(form)

    if (isUpdate.value) {
      await updateDynamics(apiData, dataId.value)
      Message.success('修改成功')
    } else {
      await addDynamics(apiData)
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
  const formData = transformToFormData(data)
  Object.assign(form, formData)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
