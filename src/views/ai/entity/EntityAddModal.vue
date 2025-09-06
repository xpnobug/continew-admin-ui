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
    <div class="entity-modal-content">
      <a-tabs v-model:active-key="activeTab" type="line">
        <a-tab-pane key="basic" title="基础配置">
          <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="metaId" label="模型元数据ID" required>
                  <a-input v-model="form.metaId" placeholder="请输入或选择模型元数据ID" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="name" label="模型名称" required>
                  <a-input v-model="form.name" placeholder="请输入模型显示名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="form.scenario === 99 ? 16 : 24">
                <a-form-item field="scenario" label="应用场景" required>
                  <a-select v-model="form.scenario" placeholder="请选择应用场景">
                    <a-option
                      v-for="option in scenarioOptions"
                      :key="option.value"
                      :value="option.value"
                      :label="option.label"
                    >
                      <div>
                        <div>{{ option.label }}</div>
                        <div class="option-desc">{{ option.desc }}</div>
                      </div>
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="form.scenario === 99" :span="8">
                <a-form-item field="customScenario" label="自定义场景" required>
                  <a-input v-model="customScenario" placeholder="输入场景名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="status" label="模型状态" required>
                  <a-radio-group v-model="form.status">
                    <a-radio :value="1">启用</a-radio>
                    <a-radio :value="0">禁用</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item field="description" label="模型描述">
              <a-textarea
                v-model="form.description"
                placeholder="请输入模型的详细描述、功能特点、使用建议等"
                :rows="4"
                :max-length="500"
                show-word-limit
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="params" title="参数配置">
          <div class="params-config">
            <div class="config-header">
              <a-space>
                <a-button @click="loadParamTemplate">加载预设</a-button>
                <a-button @click="resetParams">重置参数</a-button>
                <a-button @click="showJsonEditor = !showJsonEditor">
                  {{ showJsonEditor ? '可视化配置' : 'JSON编辑' }}
                </a-button>
              </a-space>
            </div>

            <!-- 可视化参数配置 -->
            <div v-if="!showJsonEditor" class="visual-params">
              <a-form ref="paramsFormRef" :model="form.params" layout="vertical">
                <!-- 通用参数配置 -->
                <a-collapse :default-active-key="['common']" accordion>
                  <a-collapse-item key="common" header="🎛️ 通用参数">
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item field="temperature" label="Temperature">
                          <a-slider
                            v-model="form.params.temperature"
                            :min="0"
                            :max="2"
                            :step="0.1"
                            show-input
                          />
                          <template #extra>控制输出的随机性，0为确定性，2为最随机</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="max_tokens" label="Max Tokens">
                          <a-input-number
                            v-model="form.params.max_tokens"
                            :min="1"
                            :max="100000"
                            placeholder="最大输出长度"
                          />
                          <template #extra>生成的最大token数量</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="top_p" label="Top P">
                          <a-slider
                            v-model="form.params.top_p"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            show-input
                          />
                          <template #extra>核采样，控制多样性</template>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item field="frequency_penalty" label="Frequency Penalty">
                          <a-slider
                            v-model="form.params.frequency_penalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            show-input
                          />
                          <template #extra>减少重复内容的惩罚</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="presence_penalty" label="Presence Penalty">
                          <a-slider
                            v-model="form.params.presence_penalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            show-input
                          />
                          <template #extra>鼓励谈论新话题的惩罚</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="stream" label="流式输出">
                          <a-switch v-model="form.params.stream" />
                          <template #extra>是否启用流式输出</template>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-form-item field="stop" label="停止序列">
                      <a-select
                        v-model="form.params.stop"
                        mode="tags"
                        placeholder="添加停止序列，如 \n, ###"
                        allow-create
                      />
                      <template #extra>遇到这些序列时停止生成</template>
                    </a-form-item>
                  </a-collapse-item>

                  <!-- 聊天专用参数 -->
                  <a-collapse-item v-if="[1, 2].includes(form.scenario)" key="chat" header="💬 对话参数">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item field="n" label="生成数量">
                          <a-input-number
                            v-model="form.params.n"
                            :min="1"
                            :max="10"
                            placeholder="生成回复的数量"
                          />
                          <template #extra>一次生成的回复数量</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item field="top_k" label="Top K">
                          <a-input-number
                            v-model="form.params.top_k"
                            :min="1"
                            :max="100"
                            placeholder="候选词数量"
                          />
                          <template #extra>考虑的高概率词汇数量</template>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-collapse-item>

                  <!-- 嵌入参数 -->
                  <a-collapse-item v-if="form.scenario === 3" key="embedding" header="🔢 嵌入参数">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item field="dimensions" label="向量维度">
                          <a-select v-model="form.params.dimensions" placeholder="选择向量维度">
                            <a-option :value="512">512</a-option>
                            <a-option :value="768">768</a-option>
                            <a-option :value="1024">1024</a-option>
                            <a-option :value="1536">1536</a-option>
                            <a-option :value="3072">3072</a-option>
                          </a-select>
                          <template #extra>输出向量的维度</template>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item field="encoding_format" label="编码格式">
                          <a-select v-model="form.params.encoding_format" placeholder="选择编码格式">
                            <a-option value="float">Float</a-option>
                            <a-option value="base64">Base64</a-option>
                          </a-select>
                          <template #extra>向量的编码格式</template>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-collapse-item>

                  <!-- 图像生成参数 -->
                  <a-collapse-item v-if="form.scenario === 4" key="image" header="🎨 图像生成">
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item field="size" label="图像尺寸">
                          <a-select v-model="form.params.size" placeholder="选择图像尺寸">
                            <a-option value="256x256">256x256</a-option>
                            <a-option value="512x512">512x512</a-option>
                            <a-option value="1024x1024">1024x1024</a-option>
                            <a-option value="1792x1024">1792x1024</a-option>
                            <a-option value="1024x1792">1024x1792</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="quality" label="图像质量">
                          <a-select v-model="form.params.quality" placeholder="选择图像质量">
                            <a-option value="standard">标准</a-option>
                            <a-option value="hd">高清</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="style" label="图像风格">
                          <a-select v-model="form.params.style" placeholder="选择图像风格">
                            <a-option value="vivid">生动</a-option>
                            <a-option value="natural">自然</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-collapse-item>

                  <!-- 语音参数 -->
                  <a-collapse-item v-if="[6, 7].includes(form.scenario)" key="speech" header="🔊 语音参数">
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item field="voice" label="语音">
                          <a-select v-model="form.params.voice" placeholder="选择语音">
                            <a-option value="alloy">Alloy</a-option>
                            <a-option value="echo">Echo</a-option>
                            <a-option value="fable">Fable</a-option>
                            <a-option value="onyx">Onyx</a-option>
                            <a-option value="nova">Nova</a-option>
                            <a-option value="shimmer">Shimmer</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="speed" label="语速">
                          <a-slider
                            v-model="form.params.speed"
                            :min="0.25"
                            :max="4"
                            :step="0.25"
                            show-input
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item field="response_format" label="输出格式">
                          <a-select v-model="form.params.response_format" placeholder="选择输出格式">
                            <a-option value="mp3">MP3</a-option>
                            <a-option value="opus">Opus</a-option>
                            <a-option value="aac">AAC</a-option>
                            <a-option value="flac">FLAC</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-collapse-item>

                  <!-- 自定义参数 -->
                  <a-collapse-item key="custom" header="⚙️ 自定义参数">
                    <div class="custom-params">
                      <div class="custom-param-list">
                        <div
                          v-for="(value, key) in form.params.custom_params"
                          :key="key"
                          class="custom-param-item"
                        >
                          <a-input
                            v-model="customParamKey"
                            placeholder="参数名"
                            style="width: 150px"
                            @blur="updateCustomParamKey(key, $event.target.value)"
                          />
                          <a-input
                            v-model="form.params.custom_params[key]"
                            placeholder="参数值"
                            style="flex: 1; margin: 0 8px"
                          />
                          <a-button
                            type="text"
                            status="danger"
                            @click="deleteCustomParam(key)"
                          >
                            <template #icon><icon-delete /></template>
                          </a-button>
                        </div>
                      </div>
                      <a-button type="dashed" long @click="addCustomParam">
                        <template #icon><icon-plus /></template>
                        添加自定义参数
                      </a-button>
                    </div>
                  </a-collapse-item>
                </a-collapse>
              </a-form>
            </div>

            <!-- JSON编辑器 -->
            <div v-else class="json-editor">
              <div class="editor-header">
                <span class="editor-title">JSON参数配置</span>
                <a-tag v-if="paramValidation.isValid" color="green">格式正确</a-tag>
                <a-tag v-else-if="paramValidation.error" color="red">格式错误</a-tag>
              </div>
              <a-textarea
                v-model="jsonParams"
                :rows="20"
                placeholder="JSON格式的参数配置"
                @input="validateJsonParams"
              />
              <div v-if="paramValidation.error" class="error-message">
                {{ paramValidation.error }}
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
import { addEntity, getEntity, updateEntity } from '@/apis/ai/entity'
import { useResetReactive } from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改模型信息' : '新增模型信息'))
const formRef = ref()
const advancedFormRef = ref()

const [form, resetForm] = useResetReactive({
  metaId: '',
  name: '',
  description: '',
  defaultParams: '',
  scenario: null as number | null,
  status: 1,
  // 可视化参数配置
  params: {
    // 通用参数
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1.0,
    top_k: 50,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    stop: [],
    // 聊天专用参数
    n: 1,
    logit_bias: {},
    // 文本生成参数
    best_of: 1,
    echo: false,
    logprobs: null,
    // 嵌入参数
    dimensions: 1536,
    encoding_format: 'float',
    // 图像生成参数
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    // 语音参数
    voice: 'alloy',
    speed: 1.0,
    response_format: 'mp3',
    // 自定义参数
    custom_params: {},
  },
})

const activeTab = ref('basic')
const paramValidation = ref({ isValid: false, error: '' })
const customScenario = ref('')
const showJsonEditor = ref(false)
const paramsFormRef = ref()
const customParamKey = ref('')

// JSON参数同步
const jsonParams = computed({
  get: () => {
    // 从可视化参数生成JSON
    const params = { ...form.params }
    // 移除空值和默认值
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
      if (Array.isArray(params[key]) && params[key].length === 0) {
        delete params[key]
      }
      if (typeof params[key] === 'object' && Object.keys(params[key]).length === 0) {
        delete params[key]
      }
    })
    return JSON.stringify(params, null, 2)
  },
  set: (value) => {
    try {
      const parsed = JSON.parse(value)
      Object.assign(form.params, parsed)
      form.defaultParams = value
    } catch (error) {
      console.warn('Invalid JSON:', error)
    }
  },
})

// 应用场景选项
const scenarioOptions = ref([
  { label: '对话聊天', value: 1, key: 'chat', desc: '支持多轮对话的聊天机器人' },
  { label: '文本生成', value: 2, key: 'completion', desc: '单次文本补全和生成' },
  { label: '文本嵌入', value: 3, key: 'embedding', desc: '将文本转换为向量表示' },
  { label: '图像生成', value: 4, key: 'image-generation', desc: '根据文本描述生成图像' },
  { label: '图像理解', value: 5, key: 'vision', desc: '分析和理解图像内容' },
  { label: '语音识别', value: 6, key: 'speech-to-text', desc: '将语音转换为文本' },
  { label: '语音合成', value: 7, key: 'text-to-speech', desc: '将文本转换为语音' },
  { label: '代码生成', value: 8, key: 'code-generation', desc: '生成和补全代码' },
  { label: '翻译', value: 9, key: 'translation', desc: '多语言文本翻译' },
  { label: '摘要', value: 10, key: 'summarization', desc: '文本摘要和总结' },
  { label: '问答', value: 11, key: 'question-answering', desc: '基于知识的问答系统' },
  { label: '情感分析', value: 12, key: 'sentiment-analysis', desc: '分析文本情感倾向' },
  { label: '自定义', value: 99, key: 'custom', desc: '自定义应用场景' },
])

// 场景映射函数
const getScenarioKey = (value: number | string) => {
  const scenario = scenarioOptions.value.find((s) => s.value === value)
  return scenario?.key || 'chat'
}

// 参数模板
const paramTemplates = {
  chat: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  completion: {
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.9,
    stop: ['\n\n'],
  },
  embedding: {
    dimensions: 1536,
    encoding_format: 'float',
  },
}

// 表单验证规则
const rules = {
  metaId: [{ required: true, message: '模型元数据ID不能为空' }],
  name: [{ required: true, message: '模型名称不能为空' }],
  scenario: [{ required: true, message: '应用场景不能为空' }],
  status: [{ required: true, message: '模型状态不能为空' }],
  customScenario: [{ required: true, message: '自定义场景不能为空' }],
}

// 参数验证
const validateParamsOnInput = () => {
  const params = form.defaultParams
  if (!params.trim()) {
    paramValidation.value = { isValid: false, error: '' }
    return
  }

  try {
    const parsed = JSON.parse(params)
    paramValidation.value = { isValid: true, error: '' }

    // 检查常见参数的合理性
    if (parsed.temperature !== undefined && (parsed.temperature < 0 || parsed.temperature > 2)) {
      paramValidation.value = { isValid: false, error: 'temperature 应该在 0-2 之间' }
    }
    if (parsed.max_tokens !== undefined && (parsed.max_tokens < 1 || parsed.max_tokens > 100000)) {
      paramValidation.value = { isValid: false, error: 'max_tokens 应该在 1-100000 之间' }
    }
  } catch (error) {
    paramValidation.value = { isValid: false, error: 'JSON 格式错误' }
  }
}

// 监听场景变化，自动更新参数模板
watch(() => form.scenario, (newScenario) => {
  if (newScenario) {
    const scenarioKey = getScenarioKey(newScenario)
    if (paramTemplates[scenarioKey as keyof typeof paramTemplates]) {
      // 自动加载对应场景的参数模板
      const template = paramTemplates[scenarioKey as keyof typeof paramTemplates]
      Object.assign(form.params, template)
    }
  }
})

// 自定义参数管理
const addCustomParam = () => {
  const key = `custom_param_${Date.now()}`
  form.params.custom_params[key] = ''
}

const deleteCustomParam = (key: string) => {
  delete form.params.custom_params[key]
}

const updateCustomParamKey = (oldKey: string, newKey: string) => {
  if (newKey && newKey !== oldKey) {
    const value = form.params.custom_params[oldKey]
    delete form.params.custom_params[oldKey]
    form.params.custom_params[newKey] = value
  }
}

// JSON参数验证
const validateJsonParams = () => {
  try {
    const parsed = JSON.parse(jsonParams.value)
    paramValidation.value = { isValid: true, error: '' }
    Object.assign(form.params, parsed)
  } catch (error) {
    paramValidation.value = { isValid: false, error: 'JSON格式错误' }
  }
}

// 加载参数模板
const loadParamTemplate = () => {
  if (form.scenario) {
    const scenarioKey = getScenarioKey(form.scenario)
    if (paramTemplates[scenarioKey as keyof typeof paramTemplates]) {
      form.defaultParams = JSON.stringify(paramTemplates[scenarioKey as keyof typeof paramTemplates], null, 2)
      validateParamsOnInput()
    }
  }
}

// 重置参数
const resetParams = () => {
  // 重置可视化参数到默认值
  Object.assign(form.params, {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1.0,
    top_k: 50,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    stop: [],
    n: 1,
    logit_bias: {},
    best_of: 1,
    echo: false,
    logprobs: null,
    dimensions: 1536,
    encoding_format: 'float',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    voice: 'alloy',
    speed: 1.0,
    response_format: 'mp3',
    custom_params: {},
  })

  form.defaultParams = ''
  paramValidation.value = { isValid: false, error: '' }
}

// 重置
const reset = () => {
  formRef.value?.resetFields()
  advancedFormRef.value?.resetFields()
  resetForm()
  activeTab.value = 'basic'
  paramValidation.value = { isValid: false, error: '' }
  customScenario.value = ''
}

// 保存
const save = async () => {
  try {
    // 验证基础表单
    const basicValid = await formRef.value?.validate()
    if (basicValid) return false

    // 准备提交数据
    const submitData = {
      metaId: form.metaId,
      name: form.name,
      description: form.description,
      scenario: form.scenario,
      status: form.status,
      defaultParams: JSON.stringify(form.params),
    }

    if (isUpdate.value) {
      await updateEntity(submitData, dataId.value)
      Message.success('修改成功')
    } else {
      await addEntity(submitData)
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
  const { data } = await getEntity(id)

  // 基础字段赋值
  form.metaId = data.metaId
  form.name = data.name
  form.description = data.description
  form.scenario = data.scenario
  form.status = Number(data.status)

  // 解析 JSON 参数
  if (data.defaultParams) {
    try {
      const params = JSON.parse(data.defaultParams)
      Object.assign(form.params, params)
      form.defaultParams = data.defaultParams
    } catch (error) {
      console.warn('Failed to parse defaultParams:', error)
      form.defaultParams = data.defaultParams
    }
  }

  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.entity-modal-content {
  padding: 8px 0;

  .option-desc {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }

  .params-config {
    .config-header {
      margin-bottom: 16px;
      padding: 12px;
      background: var(--color-fill-2);
      border-radius: 6px;
    }

    .param-editor {
      margin-bottom: 16px;

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .editor-title {
          font-weight: 500;
          color: var(--color-text-1);
        }
      }

      :deep(.arco-textarea) {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.5;
        background: var(--color-fill-1);
      }

      .error-message {
        margin-top: 8px;
        padding: 8px 12px;
        background: var(--color-danger-light-1);
        color: var(--color-danger);
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .param-suggestions {
      .suggestion-title {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-2);
      }

      .suggestion-items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .suggestion-tag {
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }

  :deep(.arco-tabs-content) {
    padding-top: 16px;
  }

  :deep(.arco-form-item-extra) {
    color: var(--color-text-3);
    font-size: 12px;
    margin-top: 4px;
  }

  :deep(.arco-textarea) {
    border-radius: 6px;
  }

  :deep(.arco-select-view-single) {
    border-radius: 6px;
  }

  :deep(.arco-input) {
    border-radius: 6px;
  }
}
</style>
