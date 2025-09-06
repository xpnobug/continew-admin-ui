<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 900 ? 900 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <div class="meta-modal-content">
      <a-tabs v-model:active-key="activeTab" type="line">
        <a-tab-pane key="basic" title="基础配置">
          <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="modelName" label="模型名称" required>
                  <a-input v-model="form.modelName" placeholder="请输入模型名称，如 GPT-4" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="protocol" label="模型协议" required>
                  <a-select v-model="form.protocol" placeholder="请选择模型协议">
                    <a-option value="openai">OpenAI</a-option>
                    <a-option value="anthropic">Anthropic</a-option>
                    <a-option value="google">Google</a-option>
                    <a-option value="huggingface">HuggingFace</a-option>
                    <a-option value="azure-openai">Azure OpenAI</a-option>
                    <a-option value="custom">自定义</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item field="capability" label="模型能力">
              <a-checkbox-group v-model="form.capability">
                <a-row :gutter="[16, 8]">
                  <a-col :span="6"><a-checkbox value="text-generation">文本生成</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="chat">对话聊天</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="code-generation">代码生成</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="text-embedding">文本嵌入</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="vision">图像理解</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="image-generation">图像生成</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="speech-to-text">语音识别</a-checkbox></a-col>
                  <a-col :span="6"><a-checkbox value="text-to-speech">语音合成</a-checkbox></a-col>
                </a-row>
              </a-checkbox-group>
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="status" label="模型状态" required>
                  <a-radio-group v-model="form.status">
                    <a-radio :value="1">启用</a-radio>
                    <a-radio :value="0">禁用</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="iconUrl" label="图标URL">
                  <a-input v-model="form.iconUrl" placeholder="请输入模型图标URL" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item field="description" label="模型描述">
              <a-textarea
                v-model="form.description"
                placeholder="请输入模型的详细描述信息"
                :rows="3"
                :max-length="500"
                show-word-limit
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="connection" title="连接配置">
          <div class="connection-config">
            <div class="config-header">
              <a-space>
                <a-button @click="loadConnectionTemplate">加载模板</a-button>
                <a-button @click="resetConnection">重置配置</a-button>
                <a-button @click="showJsonEditor = !showJsonEditor">
                  {{ showJsonEditor ? '可视化配置' : 'JSON编辑' }}
                </a-button>
              </a-space>
            </div>

            <!-- 可视化连接配置 -->
            <div v-if="!showJsonEditor" class="visual-connection">
              <a-form ref="connectionFormRef" :model="connectionConfig" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="api_key" label="API Key" required>
                      <a-input-password
                        v-model="connectionConfig.api_key"
                        placeholder="请输入API密钥"
                        autocomplete="off"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="base_url" label="Base URL" required>
                      <a-input
                        v-model="connectionConfig.base_url"
                        placeholder="请输入API基础URL"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item field="timeout" label="超时时间(秒)">
                      <a-input-number
                        v-model="connectionConfig.timeout"
                        :min="1"
                        :max="300"
                        placeholder="30"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="max_retries" label="最大重试次数">
                      <a-input-number
                        v-model="connectionConfig.max_retries"
                        :min="0"
                        :max="10"
                        placeholder="3"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="retry_delay" label="重试延迟(毫秒)">
                      <a-input-number
                        v-model="connectionConfig.retry_delay"
                        :min="100"
                        :max="5000"
                        placeholder="1000"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-form-item field="headers" label="自定义请求头">
                  <div class="custom-headers">
                    <div
                      v-for="(value, key) in connectionConfig.headers"
                      :key="key"
                      class="header-item"
                    >
                      <a-input
                        v-model="headerKey"
                        placeholder="Header名称"
                        style="width: 150px"
                        @blur="updateHeaderKey(key, $event.target.value)"
                      />
                      <a-input
                        v-model="connectionConfig.headers[key]"
                        placeholder="Header值"
                        style="flex: 1; margin: 0 8px"
                      />
                      <a-button
                        type="text"
                        status="danger"
                        @click="deleteHeader(key)"
                      >
                        <template #icon><icon-delete /></template>
                      </a-button>
                    </div>
                    <a-button type="dashed" long @click="addHeader">
                      <template #icon><icon-plus /></template>
                      添加请求头
                    </a-button>
                  </div>
                </a-form-item>

                <a-form-item field="proxy" label="代理配置">
                  <a-input
                    v-model="connectionConfig.proxy"
                    placeholder="代理地址，如: http://proxy.example.com:8080"
                  />
                </a-form-item>
              </a-form>
            </div>

            <!-- JSON编辑器 -->
            <div v-else class="json-editor">
              <div class="editor-header">
                <span class="editor-title">JSON连接配置</span>
                <a-tag v-if="connectionValidation.isValid" color="green">格式正确</a-tag>
                <a-tag v-else-if="connectionValidation.error" color="red">格式错误</a-tag>
              </div>
              <a-textarea
                v-model="jsonConnection"
                :rows="15"
                placeholder="JSON格式的连接配置"
                @input="validateJsonConnection"
              />
              <div v-if="connectionValidation.error" class="error-message">
                {{ connectionValidation.error }}
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addMeta, getMeta, updateMeta } from '@/apis/ai/meta'
import type { GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改模型元数据' : '新增模型元数据'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  modelName: '',
  protocol: '',
  iconUri: '',
  iconUrl: '',
  capability: [] as string[],
  connConfig: '',
  status: 1,
  description: '',
})

const activeTab = ref('basic')
const connectionFormRef = ref()
const showJsonEditor = ref(false)
const connectionValidation = ref({ isValid: false, error: '' })
const headerKey = ref('')

// 连接配置对象
const [connectionConfig, resetConnectionConfig] = useResetReactive({
  api_key: '',
  base_url: '',
  timeout: 30,
  max_retries: 3,
  retry_delay: 1000,
  headers: {},
  proxy: '',
})

// JSON连接配置同步
const jsonConnection = computed({
  get: () => {
    const config = { ...connectionConfig }
    // 移除空值
    Object.keys(config).forEach((key) => {
      if (config[key] === '' || config[key] === null || config[key] === undefined) {
        delete config[key]
      }
      if (typeof config[key] === 'object' && Object.keys(config[key]).length === 0) {
        delete config[key]
      }
    })
    return JSON.stringify(config, null, 2)
  },
  set: (value) => {
    try {
      const parsed = JSON.parse(value)
      Object.assign(connectionConfig, parsed)
      form.connConfig = value
    } catch (error) {
      console.warn('Invalid JSON:', error)
    }
  },
})

// 连接配置模板
const connectionTemplates = {
  openai: {
    api_key: '',
    base_url: 'https://api.openai.com/v1',
    timeout: 30,
    max_retries: 3,
  },
  anthropic: {
    api_key: '',
    base_url: 'https://api.anthropic.com',
    timeout: 60,
    max_retries: 3,
  },
  google: {
    api_key: '',
    base_url: 'https://generativelanguage.googleapis.com/v1',
    timeout: 30,
    max_retries: 3,
  },
  huggingface: {
    api_key: '',
    base_url: 'https://api-inference.huggingface.co',
    timeout: 60,
    max_retries: 5,
  },
}

// 表单验证规则
const rules = {
  modelName: [{ required: true, message: '模型名称不能为空' }],
  protocol: [{ required: true, message: '模型协议不能为空' }],
  status: [{ required: true, message: '模型状态不能为空' }],
}

// 监听协议变化，自动加载连接模板
watch(() => form.protocol, (newProtocol) => {
  if (newProtocol && connectionTemplates[newProtocol as keyof typeof connectionTemplates]) {
    const template = connectionTemplates[newProtocol as keyof typeof connectionTemplates]
    Object.assign(connectionConfig, template)
  }
})

// 连接配置管理
const addHeader = () => {
  const key = `header_${Date.now()}`
  connectionConfig.headers[key] = ''
}

const deleteHeader = (key: string) => {
  delete connectionConfig.headers[key]
}

const updateHeaderKey = (oldKey: string, newKey: string) => {
  if (newKey && newKey !== oldKey) {
    const value = connectionConfig.headers[oldKey]
    delete connectionConfig.headers[oldKey]
    connectionConfig.headers[newKey] = value
  }
}

// JSON连接配置验证
const validateJsonConnection = () => {
  try {
    const parsed = JSON.parse(jsonConnection.value)
    connectionValidation.value = { isValid: true, error: '' }
    Object.assign(connectionConfig, parsed)
  } catch (error) {
    connectionValidation.value = { isValid: false, error: 'JSON格式错误' }
  }
}

// 加载连接模板
const loadConnectionTemplate = () => {
  const protocol = form.protocol as keyof typeof connectionTemplates
  if (protocol && connectionTemplates[protocol]) {
    Object.assign(connectionConfig, connectionTemplates[protocol])
  }
}

// 重置连接配置
const resetConnection = () => {
  resetConnectionConfig()
  connectionValidation.value = { isValid: false, error: '' }
}

// 同步连接配置到表单
watch(() => connectionConfig, () => {
  try {
    form.connConfig = JSON.stringify(connectionConfig, null, 2)
  } catch (error) {
    console.warn('Failed to serialize connection config:', error)
  }
}, { deep: true })

// 重置
const reset = () => {
  formRef.value?.resetFields()
  connectionFormRef.value?.resetFields()
  resetForm()
  resetConnectionConfig()
  activeTab.value = 'basic'
  connectionValidation.value = { isValid: false, error: '' }
  headerKey.value = ''
}

// 保存
const save = async () => {
  try {
    // 验证基础表单
    const basicValid = await formRef.value?.validate()
    if (basicValid) return false

    // 验证连接配置表单
    const connectionValid = await connectionFormRef.value?.validate()
    if (connectionValid) return false

    // 准备提交数据
    const submitData = {
      modelName: form.modelName,
      protocol: form.protocol,
      iconUri: form.iconUri,
      iconUrl: form.iconUrl,
      status: form.status,
      description: form.description,
      capability: JSON.stringify(form.capability),
      connConfig: JSON.stringify(connectionConfig),
    }

    if (isUpdate.value) {
      await updateMeta(submitData, dataId.value)
      Message.success('修改成功')
    } else {
      await addMeta(submitData)
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
  const { data } = await getMeta(id)

  // 基础字段赋值
  form.modelName = data.modelName
  form.protocol = data.protocol
  form.iconUri = data.iconUri
  form.iconUrl = data.iconUrl
  form.status = Number(data.status)
  form.description = data.description

  // 解析 capability JSON
  if (data.capability) {
    try {
      form.capability = JSON.parse(data.capability)
    } catch (error) {
      console.warn('Failed to parse capability:', error)
      form.capability = []
    }
  }

  // 解析 connConfig JSON
  if (data.connConfig) {
    try {
      const config = JSON.parse(data.connConfig)
      Object.assign(connectionConfig, config)
      form.connConfig = data.connConfig
    } catch (error) {
      console.warn('Failed to parse connConfig:', error)
      form.connConfig = data.connConfig
    }
  }

  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.meta-modal-content {
  padding: 8px 0;

  :deep(.arco-form-item) {
    margin-bottom: 20px;
  }

  :deep(.arco-form-item-label) {
    font-weight: 500;
    color: var(--color-text-1);
  }

  :deep(.arco-textarea) {
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
  }

  :deep(.arco-select-view-single) {
    border-radius: 6px;
  }

  :deep(.arco-input) {
    border-radius: 6px;
  }

  :deep(.arco-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
