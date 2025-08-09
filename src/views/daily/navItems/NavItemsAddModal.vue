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
import { getNavItems, addNavItems, updateNavItems } from '@/apis/daily/navItems'
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
const title = computed(() => (isUpdate.value ? '修改导航项' : '新增导航项'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common_type,common02_type } = useDict('common_type','common02_type')

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '导航项名称',
    field: 'itemName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '导航项唯一标识',
    field: 'itemKey',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '页面路径',
    field: 'pageUrl',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '是否可见',
    field: 'isVisible',
    type: 'radio-group',
    span: 24,
    required: true,
    props: {
      options: common02_type,
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
      await updateNavItems(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addNavItems(form)
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
  const { data } = await getNavItems(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
