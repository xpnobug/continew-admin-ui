<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 700 ? 700 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <div class="nav-items-form">
      <a-tabs default-active-key="basic" type="rounded">
        <a-tab-pane key="basic" title="基本信息">
          <GiForm ref="formRef" v-model="form" :columns="basicColumns" />
        </a-tab-pane>
        <a-tab-pane key="icon" title="图标配置">
          <div class="icon-config-section">
            <GiForm ref="iconFormRef" v-model="form" :columns="iconColumns" />
            <div class="icon-preview-section">
              <div class="preview-title">图标预览</div>
              <div class="icon-preview-group">
                <div class="preview-item">
                  <div class="preview-label">常态图标</div>
                  <div class="preview-box">
                    <img 
                      v-if="form.iconNormal && isImageUrl(form.iconNormal)" 
                      :src="form.iconNormal" 
                      class="preview-icon"
                      alt="常态图标"
                    />
                    <span v-else-if="form.iconNormal" class="preview-text">{{ form.iconNormal }}</span>
                    <span v-else class="preview-placeholder">暂无图标</span>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="preview-label">激活图标</div>
                  <div class="preview-box">
                    <img 
                      v-if="form.iconActive && isImageUrl(form.iconActive)" 
                      :src="form.iconActive" 
                      class="preview-icon"
                      alt="激活图标"
                    />
                    <span v-else-if="form.iconActive" class="preview-text">{{ form.iconActive }}</span>
                    <span v-else class="preview-placeholder">暂无图标</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="badge" title="徽章配置">
          <GiForm ref="badgeFormRef" v-model="form" :columns="badgeColumns" />
          <div v-if="form.badgeType || form.badgeText" class="badge-preview">
            <div class="preview-title">徽章预览</div>
            <a-tag v-if="form.badgeType" color="blue" size="large">
              {{ form.badgeText || form.badgeType }}
            </a-tag>
          </div>
        </a-tab-pane>
        <a-tab-pane key="permission" title="权限设置">
          <GiForm ref="permissionFormRef" v-model="form" :columns="permissionColumns" />
        </a-tab-pane>
        <a-tab-pane key="advanced" title="高级设置">
          <GiForm ref="advancedFormRef" v-model="form" :columns="advancedColumns" />
        </a-tab-pane>
      </a-tabs>
    </div>
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
const iconFormRef = ref<InstanceType<typeof GiForm>>()
const badgeFormRef = ref<InstanceType<typeof GiForm>>()
const permissionFormRef = ref<InstanceType<typeof GiForm>>()
const advancedFormRef = ref<InstanceType<typeof GiForm>>()
const { common_type, common02_type } = useDict('common_type', 'common02_type')

// 判断是否为图片URL
const isImageUrl = (url: string) => {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']
  const lowerUrl = url.toLowerCase()
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('http')
}

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

// 基本信息表单配置
const basicColumns: ColumnItem[] = reactive([
  {
    label: '导航项名称',
    field: 'itemName',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入导航项名称，如：首页、我的',
      maxLength: 20,
      showWordLimit: true,
    },
  },
  {
    label: '唯一标识',
    field: 'itemKey',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入唯一标识，如：home、profile',
      maxLength: 50,
    },
  },
  {
    label: '页面路径',
    field: 'pageUrl',
    type: 'input',
    span: 24,
    required: true,
    props: {
      placeholder: '请输入页面路径，如：/pages/home/index',
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
      max: 999,
      placeholder: '数值越小排序越靠前',
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

// 图标配置表单
const iconColumns: ColumnItem[] = reactive([
  {
    label: '常态图标URL',
    field: 'iconNormal',
    type: 'input',
    span: 24,
    props: {
      placeholder: '请输入常态图标URL，支持网络地址或本地路径',
    },
  },
  {
    label: '激活图标URL',
    field: 'iconActive',
    type: 'input',
    span: 24,
    props: {
      placeholder: '请输入激活图标URL，支持网络地址或本地路径',
    },
  },
])

// 徽章配置表单
const badgeColumns: ColumnItem[] = reactive([
  {
    label: '徽章类型',
    field: 'badgeType',
    type: 'select',
    span: 12,
    props: {
      placeholder: '请选择徽章类型',
      options: [
        { label: '数字', value: 'number' },
        { label: '圆点', value: 'dot' },
        { label: '文本', value: 'text' },
        { label: 'NEW', value: 'new' },
        { label: 'HOT', value: 'hot' },
      ],
      allowClear: true,
    },
  },
  {
    label: '徽章文本',
    field: 'badgeText',
    type: 'input',
    span: 12,
    props: {
      placeholder: '徽章显示文本',
      maxLength: 10,
    },
  },
])

// 权限设置表单
const permissionColumns: ColumnItem[] = reactive([
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
  {
    label: '权限代码',
    field: 'permissionCode',
    type: 'input',
    span: 24,
    props: {
      placeholder: '访问权限代码，为空则无权限限制',
    },
  },
  {
    label: '用户角色',
    field: 'userRoles',
    type: 'input',
    span: 24,
    props: {
      placeholder: '允许访问的用户角色，多个角色用逗号分隔，如：admin,user',
    },
  },
])

// 高级设置表单
const advancedColumns: ColumnItem[] = reactive([
  {
    label: '自定义样式',
    field: 'customStyle',
    type: 'textarea',
    span: 24,
    props: {
      placeholder: '请输入自定义CSS样式，JSON格式',
      rows: 4,
      autoSize: { minRows: 4, maxRows: 8 },
    },
  },
])

// 重置
const reset = () => {
  // 重置所有表单验证
  formRef.value?.formRef?.resetFields()
  iconFormRef.value?.formRef?.resetFields()
  badgeFormRef.value?.formRef?.resetFields()
  permissionFormRef.value?.formRef?.resetFields()
  advancedFormRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    // 验证所有表单
    const formRefs = [
      formRef.value,
      iconFormRef.value,
      badgeFormRef.value,
      permissionFormRef.value,
      advancedFormRef.value
    ]
    
    const validationPromises = formRefs
      .filter(ref => ref?.formRef)
      .map(ref => ref!.formRef!.validate())
    
    const results = await Promise.all(validationPromises)
    const hasErrors = results.some(result => result !== undefined)
    
    if (hasErrors) {
      Message.warning('请检查表单信息是否填写正确')
      return false
    }
    
    // 数据预处理
    const submitData = { ...form }
    
    // 处理自定义样式
    if (submitData.customStyle) {
      try {
        // 验证是否为有效的JSON
        if (submitData.customStyle.trim().startsWith('{')) {
          JSON.parse(submitData.customStyle)
        }
      } catch {
        Message.warning('自定义样式格式不正确，请输入有效的JSON格式')
        return false
      }
    }
    
    if (isUpdate.value) {
      await updateNavItems(submitData, dataId.value)
      Message.success('修改成功')
    } else {
      await addNavItems(submitData)
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

<style scoped lang="scss">
.nav-items-form {
  // 标签页样式优化
  :deep(.arco-tabs) {
    .arco-tabs-nav {
      margin-bottom: 24px;
      
      .arco-tabs-tab {
        padding: 8px 16px;
        font-weight: 500;
        
        &.arco-tabs-tab-active {
          color: rgb(var(--primary-6));
        }
      }
    }
    
    .arco-tabs-content {
      padding-top: 0;
    }
  }

  // 图标配置区域
  .icon-config-section {
    .icon-preview-section {
      margin-top: 24px;
      padding: 16px;
      background: var(--color-bg-1);
      border: 1px solid var(--color-border-2);
      border-radius: 6px;
      
      .preview-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 12px;
      }
      
      .icon-preview-group {
        display: flex;
        gap: 24px;
        justify-content: center;
        
        @media (max-width: 768px) {
          flex-direction: column;
          gap: 16px;
        }
      }
      
      .preview-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        
        .preview-label {
          font-size: 12px;
          color: var(--color-text-3);
          font-weight: 500;
        }
        
        .preview-box {
          width: 80px;
          height: 80px;
          border: 2px dashed var(--color-border-3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-2);
          transition: all 0.3s ease;
          
          &:hover {
            border-color: var(--color-border-2);
            background: var(--color-bg-1);
          }
        }
        
        .preview-icon {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 4px;
        }
        
        .preview-text {
          font-size: 10px;
          color: var(--color-text-2);
          text-align: center;
          word-break: break-all;
          padding: 4px;
          max-width: 70px;
        }
        
        .preview-placeholder {
          font-size: 12px;
          color: var(--color-text-4);
        }
      }
    }
  }

  // 徽章预览
  .badge-preview {
    margin-top: 16px;
    padding: 16px;
    background: var(--color-bg-1);
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    text-align: center;
    
    .preview-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 12px;
    }
  }
}

// 模态框样式优化
:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid var(--color-border-2);
    padding: 16px 24px;
    
    .arco-modal-title {
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  .arco-modal-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .arco-modal-footer {
    border-top: 1px solid var(--color-border-2);
    padding: 12px 24px;
    
    .arco-btn {
      min-width: 80px;
    }
  }
}

// 表单样式优化
:deep(.gi-form) {
  .arco-form-item {
    margin-bottom: 20px;
    
    .arco-form-item-label {
      font-weight: 500;
      color: var(--color-text-1);
    }
    
    .arco-form-item-content {
      .arco-input,
      .arco-select,
      .arco-textarea,
      .arco-input-number {
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--color-border-2);
        }
        
        &:focus-within {
          border-color: rgb(var(--primary-6));
          box-shadow: 0 0 0 2px rgba(var(--primary-1));
        }
      }
      
      .arco-radio-group {
        .arco-radio {
          margin-right: 16px;
        }
      }
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  :deep(.arco-modal) {
    margin: 0;
    width: 100% !important;
    height: 100%;
    
    .arco-modal-container {
      height: 100%;
      
      .arco-modal-wrapper {
        height: 100%;
        
        .arco-modal {
          height: 100%;
          margin: 0;
          
          .arco-modal-body {
            max-height: calc(100vh - 120px);
          }
        }
      }
    }
  }
  
  .nav-items-form {
    :deep(.arco-tabs-nav) {
      .arco-tabs-tab {
        padding: 6px 12px;
        font-size: 14px;
      }
    }
  }
}
</style>
