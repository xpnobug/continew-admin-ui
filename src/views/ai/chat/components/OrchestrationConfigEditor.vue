<template>
  <div class="orchestration-config-editor">
    <div class="editor-header">
      <h4>模型编排配置</h4>
      <div class="header-actions">
        <a-button size="small" type="outline" @click="exportConfig">
          <template #icon><icon-download /></template>
          导出配置
        </a-button>
        <a-button size="small" type="primary" :loading="saving" @click="saveConfiguration">
          <template #icon><icon-save /></template>
          保存配置
        </a-button>
      </div>
    </div>

    <div class="config-content">
      <!-- 基本信息 -->
      <div class="config-section">
        <div class="section-title">基本信息</div>
        <div class="form-grid">
          <div class="form-item">
            <label class="form-label">编排名称</label>
            <a-input
              v-model="orchestrationConfig.name"
              placeholder="智能客服编排"
            />
          </div>
          <div class="form-item">
            <label class="form-label">版本号</label>
            <a-input
              v-model="orchestrationConfig.version"
              placeholder="1.0.0"
            />
          </div>
          <div class="form-item full-width">
            <label class="form-label">描述</label>
            <a-textarea
              v-model="orchestrationConfig.description"
              placeholder="描述编排的功能和用途"
              :rows="2"
            />
          </div>
        </div>
      </div>

      <!-- 处理阶段 -->
      <div class="config-section">
        <div class="section-title">
          处理阶段
          <a-button size="mini" type="text" @click="addStage">
            <template #icon><icon-plus /></template>
            添加阶段
          </a-button>
        </div>

        <div class="stages-list">
          <div
            v-for="(stage, index) in orchestrationConfig.pipeline.stages"
            :key="stage.id"
            class="stage-item"
          >
            <div class="stage-header">
              <div class="stage-info">
                <span class="stage-number">{{ index + 1 }}</span>
                <div class="stage-details">
                  <a-input
                    v-model="stage.name"
                    placeholder="阶段名称"
                    size="small"
                    style="width: 200px"
                  />
                  <a-select
                    v-model="stage.type"
                    placeholder="阶段类型"
                    size="small"
                    style="width: 150px"
                  >
                    <a-option value="classification">分类识别</a-option>
                    <a-option value="generation">内容生成</a-option>
                    <a-option value="analysis">分析处理</a-option>
                    <a-option value="validation">数据验证</a-option>
                    <a-option value="transformation">数据转换</a-option>
                  </a-select>
                </div>
              </div>
              <div class="stage-actions">
                <a-button size="small" type="text" :disabled="index === 0" @click="moveStageUp(index)">
                  <template #icon><icon-up /></template>
                </a-button>
                <a-button size="small" type="text" :disabled="index === orchestrationConfig.pipeline.stages.length - 1" @click="moveStageDown(index)">
                  <template #icon><icon-down /></template>
                </a-button>
                <a-button size="small" type="text" status="danger" @click="removeStage(index)">
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
            </div>

            <div class="stage-config">
              <!-- 模型配置 -->
              <div class="config-row">
                <label class="config-label">使用模型</label>
                <div class="model-selector">
                  <a-select
                    v-model="stage.model.metaId"
                    placeholder="选择模型"
                    style="width: 200px"
                  >
                    <a-option
                      v-for="model in availableModels"
                      :key="model.id"
                      :value="model.id"
                    >
                      {{ model.modelName }}
                    </a-option>
                  </a-select>
                </div>
              </div>

              <!-- 参数配置 -->
              <div class="config-row">
                <label class="config-label">参数配置</label>
                <div class="params-config">
                  <div class="param-item">
                    <span class="param-label">Temperature</span>
                    <a-input-number
                      v-model="stage.model.params.temperature"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      size="small"
                      style="width: 80px"
                    />
                  </div>
                  <div class="param-item">
                    <span class="param-label">Max Tokens</span>
                    <a-input-number
                      v-model="stage.model.params.maxTokens"
                      :min="1"
                      :max="8192"
                      size="small"
                      style="width: 100px"
                    />
                  </div>
                  <div class="param-item">
                    <span class="param-label">Stream</span>
                    <a-switch
                      v-model="stage.model.params.stream"
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <!-- 提示词配置 -->
              <div class="config-row">
                <label class="config-label">
                  提示词
                  <a-button size="mini" type="text" @click="addPrompt(stage)">
                    <template #icon><icon-plus /></template>
                    添加
                  </a-button>
                </label>
                <div class="prompts-config">
                  <div
                    v-for="(prompt, promptIndex) in stage.prompts"
                    :key="promptIndex"
                    class="prompt-item"
                  >
                    <a-select
                      v-model="prompt.role"
                      size="small"
                      style="width: 100px"
                    >
                      <a-option value="system">System</a-option>
                      <a-option value="user">User</a-option>
                      <a-option value="assistant">Assistant</a-option>
                    </a-select>
                    <a-input
                      v-model="prompt.variables"
                      placeholder="变量列表，用逗号分隔"
                      size="small"
                      style="flex: 1"
                    />
                    <a-button
                      size="small"
                      type="text"
                      status="danger"
                      @click="removePrompt(stage, promptIndex)"
                    >
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </div>
                </div>
              </div>

              <!-- 执行条件 -->
              <div class="config-row">
                <label class="config-label">执行条件</label>
                <div class="condition-config">
                  <a-select
                    v-model="stage.condition.type"
                    size="small"
                    style="width: 120px"
                  >
                    <a-option value="always">总是执行</a-option>
                    <a-option value="conditional">条件执行</a-option>
                  </a-select>
                  <a-input
                    v-if="stage.condition.type === 'conditional'"
                    v-model="stage.condition.expression"
                    placeholder="条件表达式，如：confidence > 0.8"
                    size="small"
                    style="flex: 1; margin-left: 8px"
                  />
                </div>
              </div>

              <!-- 下一阶段 -->
              <div class="config-row">
                <label class="config-label">下一阶段</label>
                <a-select
                  v-model="stage.nextStage"
                  placeholder="选择下一阶段"
                  size="small"
                  style="width: 200px"
                  allow-clear
                >
                  <a-option
                    v-for="nextStage in orchestrationConfig.pipeline.stages"
                    :key="nextStage.id"
                    :value="nextStage.id"
                    :disabled="nextStage.id === stage.id"
                  >
                    {{ nextStage.name || nextStage.id }}
                  </a-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回退配置 -->
      <div class="config-section">
        <div class="section-title">
          回退配置
          <a-switch
            v-model="orchestrationConfig.fallback.enabled"
            size="small"
          />
        </div>

        <div v-show="orchestrationConfig.fallback.enabled" class="fallback-config">
          <div class="form-item">
            <label class="form-label">回退模型</label>
            <a-select
              v-model="orchestrationConfig.fallback.model.metaId"
              placeholder="选择回退模型"
              style="width: 200px"
            >
              <a-option
                v-for="model in availableModels"
                :key="model.id"
                :value="model.id"
              >
                {{ model.modelName }}
              </a-option>
            </a-select>
          </div>
          <div class="form-item">
            <label class="form-label">回退提示</label>
            <a-input
              v-model="orchestrationConfig.fallback.prompt"
              placeholder="抱歉，我无法理解您的问题，请重新描述。"
            />
          </div>
        </div>
      </div>

      <!-- 监控配置 -->
      <div class="config-section">
        <div class="section-title">
          监控配置
          <a-switch
            v-model="orchestrationConfig.monitoring.enabled"
            size="small"
          />
        </div>

        <div v-show="orchestrationConfig.monitoring.enabled" class="monitoring-config">
          <div class="form-item">
            <label class="form-label">监控指标</label>
            <a-checkbox-group v-model="orchestrationConfig.monitoring.metrics">
              <a-checkbox value="latency">延迟</a-checkbox>
              <a-checkbox value="accuracy">准确率</a-checkbox>
              <a-checkbox value="cost">成本</a-checkbox>
              <a-checkbox value="errorRate">错误率</a-checkbox>
            </a-checkbox-group>
          </div>
          <div class="form-item">
            <label class="form-label">告警阈值</label>
            <div class="threshold-config">
              <div class="threshold-item">
                <span class="threshold-label">延迟 (ms)</span>
                <a-input-number
                  v-model="orchestrationConfig.monitoring.alertThreshold.latency"
                  :min="100"
                  :max="60000"
                  size="small"
                  style="width: 100px"
                />
              </div>
              <div class="threshold-item">
                <span class="threshold-label">准确率</span>
                <a-input-number
                  v-model="orchestrationConfig.monitoring.alertThreshold.accuracy"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  size="small"
                  style="width: 100px"
                />
              </div>
              <div class="threshold-item">
                <span class="threshold-label">错误率</span>
                <a-input-number
                  v-model="orchestrationConfig.monitoring.alertThreshold.errorRate"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  size="small"
                  style="width: 100px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import type { MetaResp } from '@/apis/ai/meta'

interface Props {
  availableModels?: MetaResp[]
}

interface Emits {
  (e: 'save', config: any): void
}

const _props = withDefaults(defineProps<Props>(), {
  availableModels: () => [],
})
const emit = defineEmits<Emits>()

// 编排配置数据结构
const orchestrationConfig = reactive({
  id: `orch_${Date.now()}`,
  name: '',
  description: '',
  version: '1.0.0',
  pipeline: {
    stages: [] as any[],
  },
  fallback: {
    enabled: false,
    model: {
      metaId: null,
      entityId: null,
    },
    prompt: '抱歉，我无法理解您的问题，请重新描述。',
  },
  monitoring: {
    enabled: false,
    metrics: ['latency', 'accuracy'] as string[],
    alertThreshold: {
      latency: 5000,
      accuracy: 0.85,
      errorRate: 0.05,
    },
  },
})

const saving = ref(false)

// 生成唯一ID
const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 添加阶段
const addStage = () => {
  const newStage = {
    id: generateId('stage'),
    name: '',
    type: 'generation',
    model: {
      metaId: null,
      entityId: null,
      params: {
        temperature: 0.7,
        maxTokens: 2048,
        stream: true,
      },
    },
    prompts: [],
    condition: {
      type: 'always',
      expression: '',
    },
    nextStage: null,
  }
  orchestrationConfig.pipeline.stages.push(newStage)
}

// 移除阶段
const removeStage = (index: number) => {
  orchestrationConfig.pipeline.stages.splice(index, 1)
}

// 上移阶段
const moveStageUp = (index: number) => {
  if (index > 0) {
    const stages = orchestrationConfig.pipeline.stages
    ;[stages[index], stages[index - 1]] = [stages[index - 1], stages[index]]
  }
}

// 下移阶段
const moveStageDown = (index: number) => {
  const stages = orchestrationConfig.pipeline.stages
  if (index < stages.length - 1) {
    ;[stages[index], stages[index + 1]] = [stages[index + 1], stages[index]]
  }
}

// 添加提示词
const addPrompt = (stage: any) => {
  stage.prompts.push({
    id: generateId('prompt'),
    role: 'system',
    variables: '',
  })
}

// 移除提示词
const removePrompt = (stage: any, promptIndex: number) => {
  stage.prompts.splice(promptIndex, 1)
}

// 保存配置
const saveConfiguration = async () => {
  if (!orchestrationConfig.name) {
    Message.warning('请填写编排名称')
    return
  }

  if (orchestrationConfig.pipeline.stages.length === 0) {
    Message.warning('请至少添加一个处理阶段')
    return
  }

  // 验证阶段配置
  for (const stage of orchestrationConfig.pipeline.stages) {
    if (!stage.name) {
      Message.warning('请为所有阶段填写名称')
      return
    }
    if (!stage.model.metaId) {
      Message.warning(`阶段"${stage.name}"未选择模型`)
      return
    }
  }

  saving.value = true
  try {
    // 处理变量字符串转数组
    const processedConfig = JSON.parse(JSON.stringify(orchestrationConfig))
    processedConfig.pipeline.stages = processedConfig.pipeline.stages.map((stage: any) => ({
      ...stage,
      prompts: stage.prompts.map((prompt: any) => ({
        ...prompt,
        variables: prompt.variables ? prompt.variables.split(',').map((v: string) => v.trim()).filter(Boolean) : [],
      })),
    }))

    emit('save', {
      orchestration: processedConfig,
    })

    Message.success('编排配置保存成功')
  } catch (error) {
    console.error('Save config failed:', error)
    Message.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

// 导出配置
const exportConfig = () => {
  try {
    const configJson = JSON.stringify({ orchestration: orchestrationConfig }, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${orchestrationConfig.name || 'orchestration'}_config.json`
    a.click()
    URL.revokeObjectURL(url)
    Message.success('配置导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    Message.error('导出配置失败')
  }
}

// 初始化一个默认阶段
onMounted(() => {
  addStage()
})

defineExpose({
  orchestrationConfig,
  saveConfiguration,
})
</script>

<style scoped lang="scss">
.orchestration-config-editor {
  padding: 16px 0;

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-2);
    flex-shrink: 0;

    h4 {
      margin: 0;
      color: var(--color-text-1);
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .config-content {

    .config-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-border-3);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1);
        margin-bottom: 16px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;

        .form-item {
          &.full-width {
            grid-column: 1 / -1;
          }

          .form-label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-text-2);
            margin-bottom: 6px;
          }
        }
      }
    }
  }

  .stages-list {
    .stage-item {
      border: 1px solid var(--color-border-2);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background: var(--color-bg-2);

      .stage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .stage-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .stage-number {
            width: 24px;
            height: 24px;
            background: var(--color-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          .stage-details {
            display: flex;
            gap: 8px;
          }
        }

        .stage-actions {
          display: flex;
          gap: 4px;
        }
      }

      .stage-config {
        .config-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .config-label {
            width: 100px;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-text-2);
            padding-top: 6px;
            flex-shrink: 0;
          }

          .params-config {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;

            .param-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .param-label {
                font-size: 12px;
                color: var(--color-text-3);
                min-width: 80px;
              }
            }
          }

          .prompts-config {
            flex: 1;

            .prompt-item {
              display: flex;
              gap: 8px;
              align-items: center;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }

          .condition-config {
            display: flex;
            align-items: center;
            flex: 1;
          }
        }
      }
    }
  }

  .fallback-config,
  .monitoring-config {
    margin-top: 12px;
    padding: 16px;
    background: var(--color-fill-1);
    border-radius: 6px;

    .form-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .form-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-2);
        margin-bottom: 8px;
      }
    }

    .threshold-config {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      .threshold-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .threshold-label {
          font-size: 12px;
          color: var(--color-text-3);
          min-width: 80px;
        }
      }
    }
  }
}
</style>
