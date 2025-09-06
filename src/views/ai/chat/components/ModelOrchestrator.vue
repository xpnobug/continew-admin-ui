<template>
  <div class="model-orchestrator">
    <!-- 头部工具栏 -->
    <div class="orchestrator-header">
      <div class="header-left">
        <h3 class="panel-title">模型编排配置</h3>
        <a-tag v-if="currentModel" color="green" size="small">
          {{ currentModel.modelName }}
        </a-tag>
        <!-- 自动保存状态指示器 -->
        <div v-if="saveStatusText" class="save-status" :class="saveStatus">
          <icon-loading v-if="saveStatus === 'saving'" class="save-icon spinning" />
          <icon-check-circle v-else-if="saveStatus === 'saved'" class="save-icon" />
          <icon-exclamation-circle v-else-if="saveStatus === 'error'" class="save-icon" />
          <icon-clock-circle v-else-if="saveStatus === 'pending'" class="save-icon" />
          <span class="save-text">{{ saveStatusText }}</span>
        </div>
      </div>
      <div class="header-actions">
        <a-dropdown @select="handleMenuSelect">
          <a-button size="small">
            <template #icon><icon-more /></template>
          </a-button>
          <template #content>
            <a-doption value="select">
              <template #icon><icon-search /></template>
              选择模型
            </a-doption>
            <a-doption value="create">
              <template #icon><icon-plus /></template>
              新建模型
            </a-doption>
            <a-doption value="edit" :disabled="!currentModel">
              <template #icon><icon-edit /></template>
              编辑当前模型
            </a-doption>
            <a-doption value="clone" :disabled="!currentModel">
              <template #icon><icon-copy /></template>
              克隆模型
            </a-doption>
            <a-doption value="delete" :disabled="!currentModel">
              <template #icon><icon-delete /></template>
              删除模型
            </a-doption>
          </template>
        </a-dropdown>
        <a-button size="small" @click="resetConfig">
          <template #icon><icon-refresh /></template>
          重置配置
        </a-button>
      </div>
    </div>

    <!-- 模型信息展示 -->
    <div v-if="currentModel" class="model-info-card">
      <div class="model-header">
        <div class="model-icon">
          <img v-if="currentModel.iconUrl" :src="currentModel.iconUrl" :alt="currentModel.modelName" />
          <icon-desktop v-else />
        </div>
        <div class="model-details">
          <div class="model-name">{{ currentModel.modelName }}</div>
          <div class="model-protocol">{{ currentModel.protocol?.toUpperCase() }}</div>
          <div class="model-capability">{{ currentModel.capability || '通用模型' }}</div>
        </div>
        <div class="model-status">
          <a-tag :color="currentModel.status === 1 ? 'green' : 'red'" size="small">
            {{ currentModel.status === 1 ? '可用' : '不可用' }}
          </a-tag>
        </div>
      </div>
      <div v-if="currentModel.description" class="model-description">
        {{ currentModel.description }}
      </div>
    </div>

    <!-- 配置选项卡 -->
    <div class="config-tabs">
      <!-- 选项卡导航固定 -->
      <div class="tabs-header">
        <a-tabs v-model:active-key="activeTab" type="rounded" size="small" :default-active-key="activeTab">
          <a-tab-pane key="capability" title="模型能力" />
          <a-tab-pane key="connection" title="连接配置" />
          <a-tab-pane key="parameters" title="参数配置" />
          <a-tab-pane key="context" title="上下文管理" />
          <a-tab-pane key="safety" title="安全与过滤" />
          <a-tab-pane key="orchestration" title="模型编排" />
        </a-tabs>
      </div>
      
      <!-- 选项卡内容可滚动 -->
      <div class="tabs-content">
        <div v-if="activeTab === 'capability'" class="tab-content-item">
          <ModelCapabilityEditor v-model="modelCapabilityConfig" />
        </div>
        
        <div v-if="activeTab === 'connection'" class="tab-content-item">
          <ModelConnectionConfig v-model="modelConnectionConfig" />
        </div>
        
        <div v-if="activeTab === 'parameters'" class="tab-content-item">
          <!-- 基础参数 -->
          <div class="config-section">
            <div class="section-title">
              <icon-settings />
              基础参数
            </div>
            <div class="param-list">
              <div class="param-item">
                <div class="param-label">
                  <span>温度 (Temperature)</span>
                  <a-tooltip content="控制输出的随机性，值越高输出越随机">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-slider
                    v-model="modelConfig.temperature"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    :style="{ width: '150px' }"
                    show-input
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>最大令牌数 (Max Tokens)</span>
                  <a-tooltip content="限制生成内容的最大长度">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-input-number
                    v-model="modelConfig.maxTokens"
                    :min="1"
                    :max="8192"
                    :step="100"
                    style="width: 150px"
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>Top P</span>
                  <a-tooltip content="核采样参数，控制候选词的概率质量">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-slider
                    v-model="modelConfig.topP"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :style="{ width: '150px' }"
                    show-input
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>频率惩罚 (Frequency Penalty)</span>
                  <a-tooltip content="减少重复内容的生成">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-slider
                    v-model="modelConfig.frequencyPenalty"
                    :min="-2"
                    :max="2"
                    :step="0.1"
                    :style="{ width: '150px' }"
                    show-input
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>存在惩罚 (Presence Penalty)</span>
                  <a-tooltip content="鼓励谈论新话题">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-slider
                    v-model="modelConfig.presencePenalty"
                    :min="-2"
                    :max="2"
                    :step="0.1"
                    :style="{ width: '150px' }"
                    show-input
                />
              </div>
            </div>
          </div>

          <!-- 高级配置 -->
          <div class="config-section">
            <div class="section-title">
              <icon-code />
              高级配置
            </div>
            <div class="param-list">
              <div class="param-item">
                <div class="param-label">
                  <span>停止序列</span>
                  <a-tooltip content="遇到这些序列时停止生成">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-input
                    v-model="modelConfig.stopSequences"
                    placeholder="用逗号分隔多个停止序列"
                    style="width: 200px"
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>种子值 (Seed)</span>
                  <a-tooltip content="固定随机种子以获得确定性输出">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-input-number
                    v-model="modelConfig.seed"
                    :min="0"
                    :max="999999"
                    placeholder="留空为随机"
                    style="width: 150px"
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>流式输出</span>
                  <a-tooltip content="启用流式输出以实时显示生成内容">
                    <icon-info-circle class="param-help" />
                  </a-tooltip>
                </div>
                <a-switch v-model="modelConfig.stream" />
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'context'" class="tab-content-item">
          <div class="config-section">
            <div class="section-title">
              <icon-file />
              上下文配置
            </div>
            <div class="param-list">
              <div class="param-item">
                <div class="param-label">
                  <span>上下文窗口大小</span>
                </div>
                <a-input-number
                    v-model="contextConfig.windowSize"
                    :min="1"
                    :max="50"
                    style="width: 150px"
                />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>保留系统消息</span>
                </div>
                <a-switch v-model="contextConfig.keepSystemMessage" />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>自动摘要</span>
                </div>
                <a-switch v-model="contextConfig.autoSummary" />
              </div>
            </div>
          </div>

          <!-- 系统消息设置 -->
          <div class="config-section">
            <div class="section-title">
              <icon-message />
              系统消息
            </div>
            <a-textarea
                v-model="contextConfig.systemMessage"
                placeholder="设置系统角色和行为指导..."
                :rows="4"
                show-word-limit
                :max-length="2000"
            />
          </div>
        </div>
        
        <div v-if="activeTab === 'safety'" class="tab-content-item">
          <div class="config-section">
            <div class="section-title">
              <icon-shield />
              内容安全
            </div>
            <div class="param-list">
              <div class="param-item">
                <div class="param-label">
                  <span>启用内容过滤</span>
                </div>
                <a-switch v-model="safetyConfig.enableContentFilter" />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>敏感内容检测</span>
                </div>
                <a-switch v-model="safetyConfig.sensitiveContentDetection" />
              </div>

              <div class="param-item">
                <div class="param-label">
                  <span>过滤等级</span>
                </div>
                <a-select
                    v-model="safetyConfig.filterLevel"
                    style="width: 150px"
                >
                  <a-option value="low">宽松</a-option>
                  <a-option value="medium">中等</a-option>
                  <a-option value="high">严格</a-option>
                </a-select>
              </div>
            </div>
          </div>

          <!-- 黑名单关键词 -->
          <div class="config-section">
            <div class="section-title">
              <icon-stop />
              黑名单关键词
            </div>
            <a-textarea
                v-model="safetyConfig.blacklistKeywords"
                placeholder="每行一个关键词..."
                :rows="3"
            />
          </div>
        </div>
        
        <div v-if="activeTab === 'orchestration'" class="tab-content-item">
          <OrchestrationConfigEditor
              :available-models="availableModels"
              @save="handleOrchestrationSave"
          />
        </div>
      </div>
    </div>

    <!-- 配置预设 -->
    <div class="presets-section">
      <div class="section-title">
        <icon-bookmark />
        配置预设
      </div>
      <div class="presets-list">
        <div
            v-for="preset in configPresets"
            :key="preset.id"
            class="preset-item"
            @click="applyPreset(preset)"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-desc">{{ preset.description }}</div>
        </div>
      </div>

      <div class="preset-actions">
        <a-button size="small" @click="saveAsPreset">
          <template #icon><icon-save /></template>
          保存为预设
        </a-button>
      </div>
    </div>

    <!-- 模型选择器弹窗 -->
    <a-modal
        v-model:visible="showModelSelector"
        title="选择模型"
        :width="800"
        :footer="false"
    >
      <div class="model-selector">
        <div class="model-grid">
          <div
              v-for="model in availableModels"
              :key="model.id"
              class="model-card" :class="[{ selected: currentModel?.id === model.id }]"
              @click="selectModel(model)"
          >
            <div class="card-header">
              <div class="model-icon">
                <img v-if="model.iconUrl" :src="model.iconUrl" :alt="model.modelName" />
                <icon-desktop v-else />
              </div>
              <div class="model-info">
                <div class="model-name">{{ model.modelName }}</div>
                <div class="model-protocol">{{ model.protocol }}</div>
              </div>
              <div class="model-status">
                <a-tag :color="model.status === 1 ? 'green' : 'red'" size="small">
                  {{ model.status === 1 ? '可用' : '不可用' }}
                </a-tag>
              </div>
            </div>
            <div class="model-description">
              {{ model.description || '暂无描述' }}
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 模型编辑器弹窗 -->
    <a-modal
        v-model:visible="showModelEditor"
        :title="isEditMode ? '编辑模型' : '新建模型'"
        :width="600"
        @ok="saveModel"
        @cancel="showModelEditor = false"
    >
      <div class="model-editor">
        <a-form :model="editingModel" layout="vertical">
          <a-form-item label="模型名称" required>
            <a-input v-model="editingModel.modelName" placeholder="请输入模型名称" />
          </a-form-item>

          <a-form-item label="协议类型" required>
            <a-select v-model="editingModel.protocol" placeholder="选择协议类型">
              <a-option value="openai">OpenAI</a-option>
              <a-option value="anthropic">Anthropic</a-option>
              <a-option value="huggingface">HuggingFace</a-option>
              <a-option value="custom">自定义</a-option>
            </a-select>
          </a-form-item>

          <a-form-item label="模型能力">
            <a-input v-model="editingModel.capability" placeholder="描述模型的主要能力" />
          </a-form-item>

          <a-form-item label="图标URL">
            <a-input v-model="editingModel.iconUrl" placeholder="模型图标的URL地址" />
          </a-form-item>

          <a-form-item label="状态">
            <a-select v-model="editingModel.status" placeholder="选择模型状态">
              <a-option :value="1">启用</a-option>
              <a-option :value="0">禁用</a-option>
            </a-select>
          </a-form-item>

          <a-form-item label="描述">
            <a-textarea
                v-model="editingModel.description"
                placeholder="详细描述模型的功能和特性"
                :rows="3"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 分组管理弹窗 -->
    <a-modal
        v-model:visible="showGroupManager"
        title="模型分组管理"
        :width="700"
        :footer="false"
    >
      <div class="group-manager">
        <div class="manager-header">
          <a-button type="primary" @click="showGroupEditor = true">
            <template #icon><icon-plus /></template>
            新建分组
          </a-button>
        </div>

        <div class="groups-list">
          <div
              v-for="group in modelGroups"
              :key="group.id"
              class="group-item"
          >
            <div class="group-header">
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-description">{{ group.description || '暂无描述' }}</div>
                <div class="group-stats">{{ group.models?.length || 0 }} 个模型</div>
              </div>
              <div class="group-actions">
                <a-button size="small" type="text" @click="editGroup(group)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button size="small" type="text" status="danger" @click="deleteGroup(group)">
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
            </div>
            <div v-if="group.models?.length" class="group-models">
              <div
                  v-for="model in group.models.slice(0, 3)"
                  :key="model.id"
                  class="model-tag"
              >
                {{ model.modelName }}
              </div>
              <span v-if="group.models.length > 3" class="more-models">
                +{{ group.models.length - 3 }} 个...
              </span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 分组编辑弹窗 -->
    <a-modal
        v-model:visible="showGroupEditor"
        :title="editingGroup.id ? '编辑分组' : '新建分组'"
        :width="500"
        @ok="saveGroup"
        @cancel="closeGroupEditor"
    >
      <div class="group-editor">
        <a-form :model="editingGroup" layout="vertical">
          <a-form-item label="分组名称" required>
            <a-input v-model="editingGroup.name" placeholder="请输入分组名称" />
          </a-form-item>

          <a-form-item label="分组描述">
            <a-textarea
                v-model="editingGroup.description"
                placeholder="描述这个分组的用途和特点"
                :rows="3"
            />
          </a-form-item>

          <a-form-item label="分组颜色">
            <div class="color-picker">
              <div
                  v-for="color in groupColors"
                  :key="color"
                  class="color-option"
                  :class="{ active: editingGroup.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="editingGroup.color = color"
              />
            </div>
          </a-form-item>

          <a-form-item label="排序权重">
            <a-input-number
                v-model="editingGroup.sort"
                :min="0"
                :max="999"
                placeholder="数字越小排序越靠前"
                style="width: 100%"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import ModelCapabilityEditor from './ModelCapabilityEditor.vue'
import ModelConnectionConfig from './ModelConnectionConfig.vue'
import OrchestrationConfigEditor from './OrchestrationConfigEditor.vue'
import { type MetaResp, addMeta, deleteMeta, listMeta, updateMeta } from '@/apis/ai/meta'
import { type EntityResp, listEntity, updateEntity, addEntity } from '@/apis/ai/entity'

interface Props {
  modelValue?: MetaResp | null
}

interface Emits {
  (e: 'update:modelValue', value: MetaResp | null): void
  (e: 'change', model: MetaResp | null): void
  (e: 'config-change', config: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 类型定义
interface ModelGroup {
  id: string
  name: string
  description?: string
  color: string
  sort: number
  models?: MetaResp[]
  createdAt: string
  updatedAt: string
}

// interface ApiConfig {
//   baseUrl: string
//   apiKey: string
//   modelName: string
//   apiVersion: string
//   timeout: number
//   headers: Array<{ key: string, value: string }>
//   groupId?: string
// }

// 响应式数据
const currentModel = ref<MetaResp | null>(props.modelValue)
const showModelSelector = ref(false)
const availableModels = ref<MetaResp[]>([])
const activeTab = ref('capability')
const showModelEditor = ref(false)
const editingModel = ref<Partial<MetaResp>>({})
const isEditMode = ref(false)

// 新的配置数据结构
const modelCapabilityConfig = ref({
  textGeneration: true,
  codeGeneration: false,
  imageGeneration: false,
  imageAnalysis: false,
  audioProcessing: false,
  videoProcessing: false,
  multimodal: false,
  functionCalling: false,
  streaming: true,
  contextWindow: 8000,
  maxTokens: 2048,
  supportedFormats: ['text'],
  languages: ['zh-CN', 'en-US'],
})

const modelConnectionConfig = ref({
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '${API_KEY}', // eslint-disable-line no-template-curly-in-string
  model: 'gpt-4o-mini',
  timeout: 30000,
  retryTimes: 3,
  rateLimit: {
    rpm: 3500,
    tpm: 200000,
  },
  headers: [],
  proxy: {
    enabled: false,
    host: '',
    port: 0,
    username: '',
    password: '',
  },
  ssl: {
    verify: true,
    certPath: '',
  },
})

// 分组管理（保留用于后续扩展）
const showGroupManager = ref(false)
const showGroupEditor = ref(false)
const modelGroups = ref<ModelGroup[]>([])
const currentGroupId = ref<string>('')
const editingGroup = ref<Partial<ModelGroup>>({})

// 分组颜色选项
const groupColors = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa541c',
  '#a0d911',
  '#2f54eb',
  '#fa8c16',
  '#d32029',
]

// 模型配置
const modelConfig = reactive({
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequences: '',
  seed: undefined as number | undefined,
  stream: true,
})

// 上下文配置
const contextConfig = reactive({
  windowSize: 10,
  keepSystemMessage: true,
  autoSummary: false,
  systemMessage: '你是一个有用的AI助手，请友好、准确地回答用户的问题。',
})

// 安全配置
const safetyConfig = reactive({
  enableContentFilter: true,
  sensitiveContentDetection: true,
  filterLevel: 'medium' as 'low' | 'medium' | 'high',
  blacklistKeywords: '',
})

// 配置预设
const configPresets = ref([
  {
    id: '1',
    name: '创意写作',
    description: '高温度，适合创意内容生成',
    config: {
      temperature: 1.2,
      maxTokens: 3000,
      topP: 0.95,
      frequencyPenalty: 0.5,
      presencePenalty: 0.6,
    },
  },
  {
    id: '2',
    name: '代码生成',
    description: '低温度，确保代码准确性',
    config: {
      temperature: 0.2,
      maxTokens: 2048,
      topP: 0.8,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
  {
    id: '3',
    name: '分析总结',
    description: '平衡配置，适合分析任务',
    config: {
      temperature: 0.5,
      maxTokens: 1500,
      topP: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    },
  },
])

// 防抖保存函数
let autoSaveTimer: NodeJS.Timeout | null = null
const currentEntityId = ref<string>('')

// 自动保存状态
const saveStatus = ref<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'idle':
      return ''
    case 'pending':
      return '待保存'
    case 'saving':
      return '保存中...'
    case 'saved':
      return '已保存'
    case 'error':
      return '保存失败'
    default:
      return ''
  }
})

// 监听父组件传入的模型变化
watch(() => props.modelValue, (newModel) => {
  currentModel.value = newModel
  // 重置实体ID，因为切换了模型
  currentEntityId.value = ''
}, { immediate: true })

// 获取或创建模型实体
const getOrCreateEntity = async (): Promise<string> => {
  if (!currentModel.value) throw new Error('No current model')
  
  try {
    // 先尝试查询是否已存在该模型的实体
    const { data } = await listEntity({
      metaId: currentModel.value.id,
      current: 1,
      size: 1,
      sort: ['id,desc'],
    })
    
    if (data.list && data.list.length > 0) {
      return data.list[0].id
    }
    
    // 如果不存在，则创建新的实体
    const entityData = {
      metaId: currentModel.value.id,
      name: `${currentModel.value.modelName} - 默认配置`,
      description: '自动生成的模型配置',
      defaultParams: JSON.stringify({
        temperature: modelConfig.temperature,
        topP: modelConfig.topP,
        maxTokens: modelConfig.maxTokens,
        presencePenalty: modelConfig.presencePenalty,
        frequencyPenalty: modelConfig.frequencyPenalty,
        stream: modelConfig.stream,
        systemPrompt: contextConfig.systemMessage,
        stop: modelConfig.stopSequences ? modelConfig.stopSequences.split(',').map((s) => s.trim()).filter(Boolean) : [],
        seed: modelConfig.seed,
        contextConfig: {
          windowSize: contextConfig.windowSize,
          keepSystemMessage: contextConfig.keepSystemMessage,
          autoSummary: contextConfig.autoSummary,
        },
        safetyConfig: {
          enableContentFilter: safetyConfig.enableContentFilter,
          sensitiveContentDetection: safetyConfig.sensitiveContentDetection,
          filterLevel: safetyConfig.filterLevel,
          blacklistKeywords: safetyConfig.blacklistKeywords,
        },
      }),
      scenario: 1, // 默认场景
      status: 1, // 启用状态
    }
    
    const createResult = await addEntity(entityData)
    return createResult.data.id
  } catch (error) {
    console.error('Failed to get or create entity:', error)
    throw error
  }
}

const autoSaveConfig = async () => {
  if (!currentModel.value) return
  
  saveStatus.value = 'saving'
  
  try {
    // 1. 更新模型元数据 (capability 和 connConfig)
    const metaData = {
      ...currentModel.value,
      capability: JSON.stringify(modelCapabilityConfig.value),
      connConfig: JSON.stringify(modelConnectionConfig.value),
    }
    await updateMeta(metaData, currentModel.value.id)
    
    // 2. 获取或创建模型实体
    if (!currentEntityId.value) {
      currentEntityId.value = await getOrCreateEntity()
    }
    
    // 3. 更新模型实体的默认参数
    const entityData = {
      metaId: currentModel.value.id,
      name: `${currentModel.value.modelName} - 默认配置`,
      description: '自动生成的模型配置',
      defaultParams: JSON.stringify({
        temperature: modelConfig.temperature,
        topP: modelConfig.topP,
        maxTokens: modelConfig.maxTokens,
        presencePenalty: modelConfig.presencePenalty,
        frequencyPenalty: modelConfig.frequencyPenalty,
        stream: modelConfig.stream,
        systemPrompt: contextConfig.systemMessage,
        stop: modelConfig.stopSequences ? modelConfig.stopSequences.split(',').map((s) => s.trim()).filter(Boolean) : [],
        seed: modelConfig.seed,
        contextConfig: {
          windowSize: contextConfig.windowSize,
          keepSystemMessage: contextConfig.keepSystemMessage,
          autoSummary: contextConfig.autoSummary,
        },
        safetyConfig: {
          enableContentFilter: safetyConfig.enableContentFilter,
          sensitiveContentDetection: safetyConfig.sensitiveContentDetection,
          filterLevel: safetyConfig.filterLevel,
          blacklistKeywords: safetyConfig.blacklistKeywords,
        },
      }),
      scenario: 1,
      status: 1,
    }
    await updateEntity(entityData, currentEntityId.value)
    
    saveStatus.value = 'saved'
    
    // 2秒后隐藏"已保存"状态
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 2000)
    
  } catch (error) {
    console.error('Auto save failed:', error)
    saveStatus.value = 'error'
    
    // 3秒后隐藏错误状态
    setTimeout(() => {
      if (saveStatus.value === 'error') {
        saveStatus.value = 'idle'
      }
    }, 3000)
  }
}

// 防抖的自动保存函数
const debouncedAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  // 设置待保存状态
  saveStatus.value = 'pending'
  
  autoSaveTimer = setTimeout(autoSaveConfig, 1000) // 1秒延迟保存
}

// 监听配置变化
watch([modelConfig, contextConfig, safetyConfig, modelCapabilityConfig, modelConnectionConfig], () => {
  // 发送配置变化事件
  emit('config-change', {
    model: modelConfig,
    context: contextConfig,
    safety: safetyConfig,
    capability: modelCapabilityConfig.value,
    connection: modelConnectionConfig.value,
  })
  
  // 自动保存配置
  debouncedAutoSave()
}, { deep: true })

// 本地存储键名
const STORAGE_KEYS = {
  MODEL_GROUPS: 'ai-model-groups',
  MODEL_ORCHESTRATION: 'ai-model-orchestration',
}

// 保存分组数据
const saveGroups = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.MODEL_GROUPS, JSON.stringify(modelGroups.value))
  } catch (error) {
    console.error('Failed to save groups:', error)
    Message.error('保存分组数据失败')
  }
}

// 关闭分组编辑器
const closeGroupEditor = () => {
  showGroupEditor.value = false
  editingGroup.value = {}
}

// 加载分组数据
const loadGroups = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MODEL_GROUPS)
    if (stored) {
      modelGroups.value = JSON.parse(stored)
    } else {
      // 初始化默认分组
      modelGroups.value = [
        {
          id: 'default',
          name: '默认分组',
          description: '系统默认分组',
          color: '#1890ff',
          sort: 0,
          models: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      saveGroups()
    }
  } catch (error) {
    console.error('Failed to load groups:', error)
    Message.error('加载分组数据失败')
  }
}

// 处理分组变化（暂时保留用于后续扩展）
const _handleGroupChange = (groupId: string) => {
  currentGroupId.value = groupId
}

// 编辑分组
const editGroup = (group: ModelGroup) => {
  editingGroup.value = { ...group }
  showGroupEditor.value = true
}

// 删除分组
const deleteGroup = (group: ModelGroup) => {
  if (group.id === 'default') {
    Message.warning('默认分组不能删除')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分组"${group.name}"吗？删除后分组下的模型配置也会被清除。`,
    onOk: () => {
      const index = modelGroups.value.findIndex((g) => g.id === group.id)
      if (index > -1) {
        modelGroups.value.splice(index, 1)
        saveGroups()
        Message.success('分组删除成功')

        // 如果删除的是当前选中的分组，切换到默认分组
        if (currentGroupId.value === group.id) {
          currentGroupId.value = 'default'
          loadApiConfig()
        }
      }
    },
  })
}

// 保存分组
const saveGroup = () => {
  if (!editingGroup.value.name) {
    Message.warning('请输入分组名称')
    return
  }

  try {
    if (editingGroup.value.id) {
      // 编辑现有分组
      const index = modelGroups.value.findIndex((g) => g.id === editingGroup.value.id)
      if (index > -1) {
        modelGroups.value[index] = {
          ...modelGroups.value[index],
          ...editingGroup.value,
          updatedAt: new Date().toISOString(),
        } as ModelGroup
      }
    } else {
      // 新建分组
      const newGroup: ModelGroup = {
        id: `group_${Date.now()}`,
        name: editingGroup.value.name,
        description: editingGroup.value.description || '',
        color: editingGroup.value.color || '#1890ff',
        sort: editingGroup.value.sort || 999,
        models: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      modelGroups.value.push(newGroup)
    }

    saveGroups()
    closeGroupEditor()
    Message.success('分组保存成功')
  } catch (error) {
    console.error('Failed to save group:', error)
    Message.error('保存分组失败')
  }
}

// 加载可用模型列表
const loadModels = async () => {
  try {
    const { data } = await listMeta({
      status: 1,
      current: 1,
      size: 100,
      sort: ['id,desc'],
    })
    availableModels.value = data.list || []
  } catch (error) {
    console.error('Failed to load models:', error)
    Message.error('加载模型列表失败')
  }
}

// 打开模型选择器
const openModelSelector = async () => {
  await loadModels()
  showModelSelector.value = true
}

// 创建新模型
const createNewModel = () => {
  editingModel.value = {
    modelName: '',
    protocol: 'openai',
    iconUrl: '',
    status: 1,
    description: '',
    capability: '',
  }
  isEditMode.value = false
  showModelEditor.value = true
}

// 编辑当前模型
const editCurrentModel = () => {
  if (!currentModel.value) return
  editingModel.value = { ...currentModel.value }
  isEditMode.value = true
  showModelEditor.value = true
}

// 克隆当前模型
const cloneCurrentModel = () => {
  if (!currentModel.value) return
  editingModel.value = {
    ...currentModel.value,
    id: undefined,
    modelName: `${currentModel.value.modelName} (副本)`,
  }
  isEditMode.value = false
  showModelEditor.value = true
}

// 删除当前模型
const deleteCurrentModel = () => {
  if (!currentModel.value) return

  Modal.confirm({
    title: '删除模型',
    content: `确定要删除模型 "${currentModel.value.modelName}" 吗？`,
    onOk: async () => {
      try {
        await deleteMeta(currentModel.value!.id)
        currentModel.value = null
        emit('update:modelValue', null)
        emit('change', null)
        await loadModels()
        Message.success('模型删除成功')
      } catch (error) {
        console.error('Failed to delete model:', error)
        Message.error('模型删除失败')
      }
    },
  })
}

// 保存模型
const saveModel = async () => {
  if (!editingModel.value.modelName) {
    Message.warning('请填写模型名称')
    return
  }

  try {
    let savedModel: MetaResp
    if (isEditMode.value && editingModel.value.id) {
      // 更新现有模型
      await updateMeta(editingModel.value as MetaResp, editingModel.value.id)
      savedModel = editingModel.value as MetaResp
      Message.success('模型更新成功')
    } else {
      // 创建新模型
      const { data } = await addMeta(editingModel.value)
      savedModel = { ...editingModel.value, id: data.id } as MetaResp
      Message.success('模型创建成功')
    }

    currentModel.value = savedModel
    emit('update:modelValue', savedModel)
    emit('change', savedModel)
    showModelEditor.value = false
    await loadModels()
  } catch (error) {
    console.error('Failed to save model:', error)
    Message.error('模型保存失败')
  }
}

// 加载模型编排配置
const loadModelOrchestrationConfig = (modelId: number) => {
  try {
    const storageKey = `model-orchestration-${modelId}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const config = JSON.parse(stored)

      // 恢复模型能力配置
      if (config.modelMeta?.capability) {
        Object.assign(modelCapabilityConfig.value, config.modelMeta.capability)
      }

      // 恢复连接配置
      if (config.modelMeta?.connConfig) {
        Object.assign(modelConnectionConfig.value, config.modelMeta.connConfig)
      }

      // 恢复模型参数配置
      if (config.modelEntity?.defaultParams) {
        const params = config.modelEntity.defaultParams
        Object.assign(modelConfig, {
          temperature: params.temperature || 0.7,
          topP: params.topP || 0.9,
          maxTokens: params.maxTokens || 2048,
          presencePenalty: params.presencePenalty || 0,
          frequencyPenalty: params.frequencyPenalty || 0,
          stream: params.stream !== undefined ? params.stream : true,
          stopSequences: params.stop?.join(',') || '',
          seed: params.seed,
        })

        if (params.systemPrompt) {
          contextConfig.systemMessage = params.systemPrompt
        }
      }

      Message.success('已加载模型编排配置')
    }
  } catch (error) {
    console.error('加载模型编排配置失败:', error)
  }
}

// 选择模型
const selectModel = (model: MetaResp) => {
  currentModel.value = model
  emit('update:modelValue', model)
  emit('change', model)
  showModelSelector.value = false

  // 加载模型的编排配置
  loadModelOrchestrationConfig(model.id)

  Message.success(`已选择模型: ${model.modelName}`)
}

// 处理菜单选择
const handleMenuSelect = (value: string) => {
  switch (value) {
    case 'select':
      openModelSelector()
      break
    case 'create':
      createNewModel()
      break
    case 'edit':
      editCurrentModel()
      break
    case 'clone':
      cloneCurrentModel()
      break
    case 'delete':
      deleteCurrentModel()
      break
  }
}

// 重置配置
const resetConfig = () => {
  Object.assign(modelConfig, {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: '',
    seed: undefined,
    stream: true,
  })

  Object.assign(contextConfig, {
    windowSize: 10,
    keepSystemMessage: true,
    autoSummary: false,
    systemMessage: '你是一个有用的AI助手，请友好、准确地回答用户的问题。',
  })

  Object.assign(safetyConfig, {
    enableContentFilter: true,
    sensitiveContentDetection: true,
    filterLevel: 'medium' as const,
    blacklistKeywords: '',
  })

  Message.success('配置已重置')
}

// 应用预设配置
const applyPreset = (preset: any) => {
  Object.assign(modelConfig, preset.config)
  Message.success(`已应用预设: ${preset.name}`)
}

// 保存为预设
const saveAsPreset = () => {
  // 这里可以实现保存自定义预设的逻辑
  Message.info('保存预设功能待实现')
}

// 处理编排配置保存
const handleOrchestrationSave = async (orchestrationConfig: any) => {
  try {
    if (!currentModel.value) {
      Message.warning('请先选择一个模型')
      return
    }

    // 构建完整的模型编排配置
    const fullConfig = {
      modelMeta: {
        id: currentModel.value.id,
        modelName: currentModel.value.modelName,
        protocol: currentModel.value.protocol,
        capability: modelCapabilityConfig.value,
        connConfig: modelConnectionConfig.value,
      },
      modelEntity: {
        defaultParams: {
          temperature: modelConfig.temperature,
          topP: modelConfig.topP,
          maxTokens: modelConfig.maxTokens,
          presencePenalty: modelConfig.presencePenalty,
          frequencyPenalty: modelConfig.frequencyPenalty,
          stream: modelConfig.stream,
          systemPrompt: contextConfig.systemMessage,
          stop: modelConfig.stopSequences ? modelConfig.stopSequences.split(',').map((s) => s.trim()).filter(Boolean) : [],
          seed: modelConfig.seed,
        },
      },
      orchestration: orchestrationConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 保存到本地存储
    const storageKey = `model-orchestration-${currentModel.value.id}`
    localStorage.setItem(storageKey, JSON.stringify(fullConfig))

    // 这里可以添加后端API调用来保存配置
    // await saveModelOrchestration(fullConfig)

    Message.success('模型编排配置保存成功')
  } catch (error) {
    console.error('保存编排配置失败:', error)
    Message.error('保存编排配置失败')
  }
}

// 获取完整配置
const getFullConfig = () => {
  return {
    model: currentModel.value,
    parameters: modelConfig,
    context: contextConfig,
    safety: safetyConfig,
    capability: modelCapabilityConfig.value,
    connection: modelConnectionConfig.value,
  }
}

onMounted(() => {
  loadGroups()
  loadModels()
  // 如果有当前模型，加载其编排配置
  if (currentModel.value?.id) {
    loadModelOrchestrationConfig(currentModel.value.id)
  }
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
})

defineExpose({
  currentModel,
  modelConfig,
  contextConfig,
  safetyConfig,
  modelCapabilityConfig,
  modelConnectionConfig,
  getFullConfig,
  resetConfig,
  handleOrchestrationSave,
  loadModelOrchestrationConfig,
})
</script>

<style scoped lang="scss">
.model-orchestrator {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);

  .orchestrator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-2);
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .panel-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-1);
      }

      .save-status {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        transition: all 0.3s ease;

        .save-icon {
          font-size: 12px;
        }

        .save-text {
          font-weight: 500;
        }

        &.pending {
          color: var(--color-warning-6);
          background: var(--color-warning-light-1);
          border: 1px solid var(--color-warning-light-3);

          .save-icon {
            color: var(--color-warning-6);
          }
        }

        &.saving {
          color: var(--color-primary-6);
          background: var(--color-primary-light-1);
          border: 1px solid var(--color-primary-light-3);

          .save-icon {
            color: var(--color-primary-6);
          }
        }

        &.saved {
          color: var(--color-success-6);
          background: var(--color-success-light-1);
          border: 1px solid var(--color-success-light-3);

          .save-icon {
            color: var(--color-success-6);
          }
        }

        &.error {
          color: var(--color-danger-6);
          background: var(--color-danger-light-1);
          border: 1px solid var(--color-danger-light-3);

          .save-icon {
            color: var(--color-danger-6);
          }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .model-info-card {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-2);
    flex-shrink: 0;

    .model-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;

      .model-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: var(--color-primary-light-1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
        flex-shrink: 0;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .model-details {
        flex: 1;
        min-width: 0;

        .model-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-1);
          margin-bottom: 2px;
        }

        .model-protocol {
          font-size: 11px;
          color: var(--color-text-3);
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .model-capability {
          font-size: 12px;
          color: var(--color-text-2);
        }
      }

      .model-status {
        flex-shrink: 0;
      }
    }

    .model-description {
      font-size: 12px;
      color: var(--color-text-3);
      line-height: 1.4;
      margin-left: 44px;
    }
  }

  .config-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    min-height: 0;
    overflow: hidden;

    .tabs-header {
      flex-shrink: 0;
      margin-bottom: 16px;
      
      :deep(.arco-tabs) {
        margin-bottom: 0;
      }
      
      :deep(.arco-tabs-content) {
        display: none;
      }
    }

    .tabs-content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-right: 8px;

      .tab-content-item {
        height: auto;
        max-height: 500px;
      }
    }
  }

  .config-section {
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 16px;
    }

    .param-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .param-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .param-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--color-text-2);

          .param-help {
            font-size: 12px;
            color: var(--color-text-3);
            cursor: help;
          }
        }
      }
    }
  }

  .presets-section {
    flex-shrink: 0;
    padding: 16px;
    border-top: 1px solid var(--color-border-2);

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 12px;
    }

    .presets-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;

      .preset-item {
        padding: 8px 12px;
        border: 1px solid var(--color-border-2);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--color-primary-light-3);
          background: var(--color-primary-light-1);
        }

        .preset-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-1);
          margin-bottom: 2px;
        }

        .preset-desc {
          font-size: 12px;
          color: var(--color-text-3);
          line-height: 1.4;
        }
      }
    }

    .preset-actions {
      display: flex;
      justify-content: center;
    }
  }

  .model-selector {
    .model-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    }

    .model-card {
      border: 1px solid var(--color-border-2);
      border-radius: 6px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--color-primary-light-3);
        background: var(--color-primary-light-1);
      }

      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light-1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .model-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--color-fill-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .model-info {
          flex: 1;
          min-width: 0;

          .model-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 2px;
          }

          .model-protocol {
            font-size: 12px;
            color: var(--color-text-3);
            text-transform: uppercase;
          }
        }

        .model-status {
          flex-shrink: 0;
        }
      }

      .model-description {
        font-size: 12px;
        color: var(--color-text-3);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }

  // API配置和分组管理样式
  .api-config-form {
    .form-row {
      margin-bottom: 16px;

      .form-item {
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-2);
          margin-bottom: 6px;
        }
      }
    }

    .headers-config {
      .header-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-2);
    }
  }

  .group-selector {
    margin-bottom: 16px;
  }
}

// 分组管理弹窗样式
.group-manager {
  .manager-header {
    margin-bottom: 16px;
    text-align: right;
  }

  .groups-list {
    max-height: 400px;
    overflow-y: auto;

    .group-item {
      padding: 16px;
      border: 1px solid var(--color-border-2);
      border-radius: 8px;
      margin-bottom: 12px;
      background: var(--color-bg-2);

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .group-info {
          flex: 1;

          .group-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }

          .group-description {
            font-size: 12px;
            color: var(--color-text-3);
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .group-stats {
            font-size: 12px;
            color: var(--color-text-2);
          }
        }

        .group-actions {
          display: flex;
          gap: 4px;
        }
      }

      .group-models {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;

        .model-tag {
          padding: 2px 8px;
          background: var(--color-fill-2);
          border-radius: 12px;
          font-size: 11px;
          color: var(--color-text-2);
        }

        .more-models {
          font-size: 11px;
          color: var(--color-text-3);
        }
      }
    }
  }
}

// 分组编辑器样式
.group-editor {
  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .color-option {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
      }

      &.active {
        border-color: var(--color-text-1);
        transform: scale(1.2);
      }
    }
  }
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
