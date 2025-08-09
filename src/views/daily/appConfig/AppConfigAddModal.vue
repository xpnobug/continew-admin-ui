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
  {
    label: '应用名称',
    field: 'appName',
    type: 'input',
    span: 24,
  },
  {
    label: '应用宣传语',
    field: 'appSlogan',
    type: 'input',
    span: 24,
  },
  {
    label: '应用公告',
    field: 'appNotice',
    type: 'input',
    span: 24,
  },
  {
    label: '应用描述',
    field: 'appDesc',
    type: 'input',
    span: 24,
  },
  {
    label: '版权类型',
    field: 'copyType',
    type: 'input',
    span: 24,
  },
  {
    label: '版权图片',
    field: 'copyImg',
    type: 'input',
    span: 24,
  },
  {
    label: '版权文本',
    field: 'copyText',
    type: 'input',
    span: 24,
  },
  {
    label: '版权网站',
    field: 'copyWebsite',
    type: 'input',
    span: 24,
  },
  {
    label: '版权链接',
    field: 'copyLink',
    type: 'input',
    span: 24,
  },
  {
    label: '上传类型',
    field: 'uploadType',
    type: 'input',
    span: 24,
  },
  {
    label: '是否开启活动功能',
    field: 'isActivity',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启瀑布流',
    field: 'isWaterfall',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启分类',
    field: 'isClassify',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启商城',
    field: 'isNoteShop',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启视频',
    field: 'isNoteVideo',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启卡片',
    field: 'isCard',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启直播',
    field: 'isLive',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
  },
  {
    label: '是否开启备忘录模式',
    field: 'isMemo',
    type: 'switch',
    span: 24,
    props: {
      options: common02_type,
    },
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

<style scoped lang="scss"></style>
