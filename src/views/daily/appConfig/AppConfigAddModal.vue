<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 800 ? 800 : '100%'"
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
import { addAppConfig, getAppConfig, updateAppConfig } from '@/apis/daily/appConfig'
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
const title = computed(() => (isUpdate.value ? '修改应用配置' : '新增应用配置'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { common_type, common02_type } = useDict('common_type', 'common02_type')

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  // 基本信息
  {
    label: '基本信息',
    field: 'basic-info',
    type: 'title',
    span: 24,
  },
  {
    label: '应用名称',
    field: 'appName',
    type: 'input',
    span: 12,
    required: true,
  },
  {
    label: '应用宣传语',
    field: 'appSlogan',
    type: 'input',
    span: 12,
  },
  {
    label: '应用公告',
    field: 'appNotice',
    type: 'textarea',
    span: 24,
    props: {
      rows: 3,
    },
  },
  {
    label: '应用描述',
    field: 'appDesc',
    type: 'textarea',
    span: 24,
    props: {
      rows: 3,
    },
  },
  {
    label: '上传类型',
    field: 'uploadType',
    type: 'input',
    span: 12,
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
  
  // 版权信息
  {
    label: '版权信息',
    field: 'copyright-info',
    type: 'title',
    span: 24,
  },
  {
    label: '版权类型',
    field: 'copyType',
    type: 'input',
    span: 12,
  },
  {
    label: '版权图片',
    field: 'copyImg',
    type: 'input',
    span: 12,
  },
  {
    label: '版权文本',
    field: 'copyText',
    type: 'input',
    span: 12,
  },
  {
    label: '版权网站',
    field: 'copyWebsite',
    type: 'input',
    span: 12,
  },
  {
    label: '版权链接',
    field: 'copyLink',
    type: 'input',
    span: 24,
  },
  
  // 功能开关
  {
    label: '功能开关',
    field: 'feature-switches',
    type: 'title',
    span: 24,
  },
  {
    label: '活动功能',
    field: 'isActivity',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '瀑布流',
    field: 'isWaterfall',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '分类功能',
    field: 'isClassify',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '商城功能',
    field: 'isNoteShop',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '视频功能',
    field: 'isNoteVideo',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '卡片功能',
    field: 'isCard',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '直播功能',
    field: 'isLive',
    type: 'switch',
    span: 8,
    props: {
      options: common02_type,
    },
  },
  {
    label: '备忘录模式',
    field: 'isMemo',
    type: 'switch',
    span: 8,
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
      await updateAppConfig(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addAppConfig(form)
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
  const { data } = await getAppConfig(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
:deep(.arco-form) {
  .arco-form-item-label-col {
    .arco-form-item-label {
      font-weight: 500;
    }
  }
  
  // 标题样式
  .arco-form-item[data-field="basic-info"],
  .arco-form-item[data-field="copyright-info"],
  .arco-form-item[data-field="feature-switches"] {
    .arco-form-item-content {
      padding: 16px 0 8px;
      border-bottom: 1px solid var(--color-border-2);
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }
}
</style>
