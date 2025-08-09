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
import { addNavItems, getNavItems, updateNavItems } from '@/apis/daily/navItems'
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
const { common_type, common02_type } = useDict('common_type', 'common02_type')

const [form, resetForm] = useResetReactive({
  itemName: '',
  itemKey: '',
  iconNormal: '',
  iconActive: '',
  pageUrl: '',
  badgeType: '',
  badgeText: '',
  isVisible: '1',
  permissionCode: '',
  userRoles: '',
  customStyle: '',
  sort: 0,
  status: '1',
})

const columns: ColumnItem[] = reactive([
  {
    label: '导航项名称',
    field: 'itemName',
    type: 'input',
    span: 12,
    required: true,
    props: {
      placeholder: '请输入导航项名称',
    },
  },
  {
    label: '唯一标识',
    field: 'itemKey',
    type: 'input',
    span: 12,
    required: true,
    props: {
      placeholder: '请输入唯一标识',
    },
  },
  {
    label: '页面路径',
    field: 'pageUrl',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入页面路径，如：/home',
    },
  },
  {
    label: '常态图标',
    field: 'iconNormal',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入常态图标URL',
    },
  },
  {
    label: '激活图标',
    field: 'iconActive',
    type: 'input',
    span: 12,
    props: {
      placeholder: '请输入激活图标URL',
    },
  },
  {
    label: '徽章类型',
    field: 'badgeType',
    type: 'input',
    span: 12,
    props: {
      placeholder: '如：new、hot',
    },
  },
  {
    label: '徽章文本',
    field: 'badgeText',
    type: 'input',
    span: 12,
    props: {
      placeholder: '徽章显示文本',
    },
  },
  {
    label: '排序',
    field: 'sort',
    type: 'input-number',
    span: 12,
    required: true,
    props: {
      min: 0,
      placeholder: '数值越小排序越靠前',
    },
  },
  {
    label: '是否可见',
    field: 'isVisible',
    type: 'radio-group',
    span: 12,
    required: true,
    props: {
      options: common02_type,
    },
  },
  {
    label: '权限代码',
    field: 'permissionCode',
    type: 'input',
    span: 12,
    props: {
      placeholder: '访问权限代码',
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
  {
    label: '用户角色',
    field: 'userRoles',
    type: 'input',
    span: 24,
    props: {
      placeholder: '多个角色用逗号分隔',
    },
  },
  {
    label: '自定义样式',
    field: 'customStyle',
    type: 'textarea',
    span: 24,
    props: {
      placeholder: '请输入自定义CSS样式',
      rows: 3,
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
