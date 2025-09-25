<template>
  <div class="model-orchestrator">
    <!-- 头部工具栏 -->
    <div class="orchestrator-header">
      <div class="header-left">
        <h3 class="panel-title">模型编排配置</h3>
        <a-tag v-if="currentModel" color="green" size="small">
          {{ currentModel.modelName }}
        </a-tag>
      </div>
    </div>

    <!-- 配置选项卡 -->
    <div class="config-tabs">
      <!-- 选项卡导航固定 -->
      <div class="tabs-header">
        <a-tabs v-model:active-key="activeTab" type="rounded" size="small" :default-active-key="activeTab">
          <a-tab-pane key="resource" title="模型资源信息" />
          <a-tab-pane key="capability" title="模型能力" />
          <a-tab-pane key="connection" title="连接配置" />
          <a-tab-pane key="parameters" title="参数配置" />
          <a-tab-pane key="context" title="上下文管理" />
          <a-tab-pane key="safety" title="安全与过滤" />
          <a-tab-pane key="keywords" title="关键词管理" />
          <a-tab-pane key="orchestration" title="模型编排" />
        </a-tabs>
      </div>

      <!-- 选项卡内容可滚动 -->
      <div class="tabs-content">
        <div v-if="activeTab === 'resource'" class="tab-content-item">
          <ModelResourceConfig v-model="modelResourceConfig" />
        </div>

        <div v-if="activeTab === 'capability'" class="tab-content-item">
          <ModelCapabilityEditor v-model="modelCapabilityConfig" />
        </div>

        <div v-if="activeTab === 'connection'" class="tab-content-item">
          <ModelConnectionConfig v-model="modelConnectionConfig" />
        </div>

        <div v-if="activeTab === 'parameters'" class="tab-content-item">
          <ModelParametersConfig v-model="modelConfig" />
        </div>

        <div v-if="activeTab === 'context'" class="tab-content-item">
          <ModelContextConfig v-model="contextConfig" />
        </div>

        <div v-if="activeTab === 'safety'" class="tab-content-item">
          <ModelSafetyConfig v-model="safetyConfig" />
        </div>

        <div v-if="activeTab === 'keywords'" class="tab-content-item">
          <KeywordManagerConfig
            ref="keywordManagerRef"
            v-model="modelCapabilityConfig.keywordConfig"
          />
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
    <!--    <div class="presets-section"> -->
    <!--      <div class="section-title"> -->
    <!--        <icon-bookmark /> -->
    <!--        配置预设 -->
    <!--      </div> -->
    <!--      <div class="presets-list"> -->
    <!--        <div -->
    <!--          v-for="preset in configPresets" -->
    <!--          :key="preset.id" -->
    <!--          class="preset-item" -->
    <!--          @click="applyPreset(preset)" -->
    <!--        > -->
    <!--          <div class="preset-name">{{ preset.name }}</div> -->
    <!--          <div class="preset-desc">{{ preset.description }}</div> -->
    <!--        </div> -->
    <!--      </div> -->
    <!--    </div> -->
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import ModelCapabilityEditor from './ModelCapabilityEditor.vue'
import ModelConnectionConfig from './ModelConnectionConfig.vue'
import OrchestrationConfigEditor from './OrchestrationConfigEditor.vue'
import ModelParametersConfig from './ModelParametersConfig.vue'
import ModelContextConfig from './ModelContextConfig.vue'
import ModelSafetyConfig from './ModelSafetyConfig.vue'
import KeywordManagerConfig from './KeywordManagerConfig.vue'
import ModelResourceConfig from './ModelResourceConfig.vue'
import { type MetaResp, getMeta, listMeta, updateMeta } from '@/apis/ai/meta'
import { listEntity } from '@/apis/ai/entity'

interface Props {
  modelValue?: MetaResp | null
}

interface Emits {
  (e: 'update:modelValue', value: MetaResp | null): void
  (e: 'change', model: MetaResp | null): void
  (e: 'config-change', config: any): void
  (e: 'save-status-change', status: 'idle' | 'pending' | 'saving' | 'saved' | 'error', saveTime?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
const availableModels = ref<MetaResp[]>([])
const activeTab = ref('capability')

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
  // 当前选择的提示词
  currentPrompt: null,
  // 关键词配置
  keywordConfig: {
    customKeywords: [],
    customCategories: [],
    enabledSystemCategories: ['scenic', 'food', 'culture', 'activity', 'travel'],
    // 系统关键词库（河南旅游主题）
    systemKeywords: {
      scenic: [
        '龙门石窟',
        '少林寺',
        '白马寺',
        '清明上河园',
        '开封府',
        '云台山',
        '老君山',
        '嵩山',
        '白云山',
        '鸡公山',
        '尧山',
        '红旗渠',
        '殷墟',
        '函谷关',
        '太行大峡谷',
        '黄河小浪底',
        '焦作影视城',
        '洛阳牡丹园',
        '康百万庄园',
        '河南博物院',
        '嵩阳书院',
        '中岳庙',
      ],
      food: [
        '胡辣汤',
        '烩面',
        '水席',
        '道口烧鸡',
        '开封灌汤包',
        '安阳血糕',
        '信阳毛尖',
        '铁棍山药',
        '新郑大枣',
        '西峡香菇',
        '牛肉拉面',
        '焦作怀药',
        '洛阳燕菜',
        '周口逍遥胡辣汤',
        '驻马店芝麻糖',
        '商丘归德府汤包',
        '许昌烧饼',
      ],
      culture: [
        '中原文化',
        '河洛文化',
        '黄河文明',
        '汉字文化',
        '武术文化',
        '佛教文化',
        '道教文化',
        '诗词文化',
        '戏曲文化',
        '民俗文化',
        '古都文化',
        '姓氏文化',
        '易经文化',
        '医药文化',
        '书法文化',
        '陶瓷文化',
        '青铜文化',
        '石刻文化',
      ],
      activity: [
        '登山',
        '徒步',
        '摄影',
        '赏花',
        '泡温泉',
        '漂流',
        '滑雪',
        '采摘',
        '观鸟',
        '露营',
        '骑行',
        '垂钓',
        '品茶',
        '书法体验',
        '武术学习',
        '陶艺制作',
        '民俗体验',
        '古装体验',
      ],
      travel: [
        '高铁',
        '飞机',
        '自驾',
        '包车',
        '公交',
        '地铁',
        '出租车',
        '共享单车',
        '景区直通车',
        '旅游专线',
        '住宿推荐',
        '美食推荐',
        '购物指南',
        '交通路线',
        '最佳季节',
        '注意事项',
      ],
    },
    // 热门关键词
    hotKeywords: ['龙门石窟', '少林寺', '清明上河园', '云台山', '胡辣汤', '烩面', '道口烧鸡', '开封灌汤包'],
    hotKeywordsConfig: {
      autoGenerate: true,
      maxCount: 8,
      updateInterval: 'weekly',
    },
    // 季节性关键词
    seasonalKeywords: {
      spring: ['牡丹花', '樱花', '踏青', '温泉', '登山', '清明上河园'],
      summer: ['云台山', '漂流', '避暑', '青天河', '鸡公山', '南湾湖'],
      autumn: ['老君山', '红叶', '登高', '秋游', '嵩山', '太行大峡谷'],
      winter: ['温泉', '雪景', '室内景点', '博物院', '古建筑', '美食'],
    },
    seasonalKeywordsConfig: {
      autoGenerate: true,
      currentSeason: 'spring',
      customSeasons: {
        spring: { name: '春季', months: [3, 4, 5], keywords: ['牡丹花', '樱花', '踏青'] },
        summer: { name: '夏季', months: [6, 7, 8], keywords: ['漂流', '避暑', '清凉'] },
        autumn: { name: '秋季', months: [9, 10, 11], keywords: ['红叶', '登高', '秋游'] },
        winter: { name: '冬季', months: [12, 1, 2], keywords: ['温泉', '雪景', '室内'] },
      },
    },
  },
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

// 资源配置（用于小程序展示的UI资源）
const modelResourceConfig = ref({
  // AI头像介绍区域
  avatar: {
    imageUrl: 'https://oss3.hnswlt.com/images/static/serviceAi.png',
    circleBgColor: '#fffbf6',
    labelText: 'AI导游',
    labelBgColor: '#e7ab24',
    introText: '您好！我是您的AI导游，专业为您推荐河南的精彩景点、特色美食和文化体验。',
  },
  // 消息文本内容头部背景（children-day_title）
  messageHeader: {
    bgImageUrl: 'https://alist.reaicc.com/daily/68d264a8e4b0e7f39653d0e7.gif',
    bgColor: '#ffffff',
    height: '90rpx',
    borderRadius: '20rpx 20rpx 0 0',
  },
})
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

// 关键词管理器引用
const keywordManagerRef = ref()

// 防抖保存函数
let autoSaveTimer: NodeJS.Timeout | null = null
const currentEntityId = ref<string>('')

// 自动保存状态
const saveStatus = ref<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
const lastSaveTime = ref<string>('')

// 监听保存状态变化，传递给父组件
watch([saveStatus, lastSaveTime], ([newStatus, newSaveTime]) => {
  emit('save-status-change', newStatus, newSaveTime)
}, { immediate: true })

const autoSaveConfig = async () => {
  if (!currentModel.value) return

  saveStatus.value = 'saving'

  try {
    // 1. 更新模型元数据 (capability 和 connConfig)
    const metaData = {
      ...currentModel.value,
      capability: JSON.stringify({
        ...modelCapabilityConfig.value,
        resourceConfig: modelResourceConfig.value,
      }),
      connConfig: JSON.stringify(modelConnectionConfig.value),
    }
    await updateMeta(metaData, currentModel.value.id)

    // 2. 获取或创建模型实体
    // if (!currentEntityId.value) {
    //   currentEntityId.value = await getOrCreateEntity()
    // }
    //
    // // 3. 更新模型实体的默认参数
    // const entityData = {
    //   metaId: currentModel.value.id,
    //   name: `${currentModel.value.modelName}`,
    // }
    // await updateEntity(entityData, currentEntityId.value)

    saveStatus.value = 'saved'
    lastSaveTime.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    // 3秒后切换到"上次保存"状态
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 3000)
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
watch([modelConfig, contextConfig, safetyConfig, modelCapabilityConfig, modelConnectionConfig, modelResourceConfig], () => {
  // 发送配置变化事件
  emit('config-change', {
    model: modelConfig,
    context: contextConfig,
    safety: safetyConfig,
    capability: modelCapabilityConfig.value,
    connection: modelConnectionConfig.value,
    resources: modelResourceConfig.value,
  })

  // 自动保存配置
  debouncedAutoSave()
}, { deep: true })

// 加载可用模型列表
const loadModels = async () => {
  try {
    const { data } = await listMeta({
      modelName: undefined,
      protocol: undefined,
      iconUri: undefined,
      status: 1,
      description: undefined,
      createUser: undefined,
      createTime: undefined,
      iconUrl: undefined,
      page: 1,
      size: 100,
      sort: ['id,desc'],
    })
    availableModels.value = data.list || []
  } catch (error) {
    console.error('Failed to load models:', error)
    Message.error('加载模型列表失败')
  }
}

// 加载模型编排配置
const loadModelOrchestrationConfig = async (modelId: string) => {
  try {
    // 1. 加载模型元数据（capability 和 connConfig）
    const metaData = await getMeta(modelId)

    if (metaData.data.capability) {
      try {
        const capability = JSON.parse(metaData.data.capability)
        // 拆分资源配置与能力配置
        const { resourceConfig, ...restCapability } = capability || {}
        // 确保currentPrompt字段存在
        if (restCapability.currentPrompt === undefined) {
          restCapability.currentPrompt = null
        }
        // 确保keywordConfig字段存在
        if (!restCapability.keywordConfig) {
          restCapability.keywordConfig = {
            customKeywords: [],
            customCategories: [],
            enabledSystemCategories: ['scenic', 'food', 'culture', 'activity', 'travel'],
            systemKeywords: {
              scenic: [
                '龙门石窟',
                '少林寺',
                '白马寺',
                '清明上河园',
                '开封府',
                '云台山',
                '老君山',
                '嵩山',
                '白云山',
                '鸡公山',
                '尧山',
                '红旗渠',
                '殷墟',
                '函谷关',
                '太行大峡谷',
                '黄河小浪底',
                '焦作影视城',
                '洛阳牡丹园',
                '康百万庄园',
                '河南博物院',
                '嵩阳书院',
                '中岳庙',
              ],
              food: [
                '胡辣汤',
                '烩面',
                '水席',
                '道口烧鸡',
                '开封灌汤包',
                '安阳血糕',
                '信阳毛尖',
                '铁棍山药',
                '新郑大枣',
                '西峡香菇',
                '牛肉拉面',
                '焦作怀药',
                '洛阳燕菜',
                '周口逍遥胡辣汤',
                '驻马店芝麻糖',
                '商丘归德府汤包',
                '许昌烧饼',
              ],
              culture: [
                '中原文化',
                '河洛文化',
                '黄河文明',
                '汉字文化',
                '武术文化',
                '佛教文化',
                '道教文化',
                '诗词文化',
                '戏曲文化',
                '民俗文化',
                '古都文化',
                '姓氏文化',
                '易经文化',
                '医药文化',
                '书法文化',
                '陶瓷文化',
                '青铜文化',
                '石刻文化',
              ],
              activity: [
                '登山',
                '徒步',
                '摄影',
                '赏花',
                '泡温泉',
                '漂流',
                '滑雪',
                '采摘',
                '观鸟',
                '露营',
                '骑行',
                '垂钓',
                '品茶',
                '书法体验',
                '武术学习',
                '陶艺制作',
                '民俗体验',
                '古装体验',
              ],
              travel: [
                '高铁',
                '飞机',
                '自驾',
                '包车',
                '公交',
                '地铁',
                '出租车',
                '共享单车',
                '景区直通车',
                '旅游专线',
                '住宿推荐',
                '美食推荐',
                '购物指南',
                '交通路线',
                '最佳季节',
                '注意事项',
              ],
            },
            hotKeywords: ['龙门石窟', '少林寺', '清明上河园', '云台山', '胡辣汤', '烩面', '道口烧鸡', '开封灌汤包'],
            hotKeywordsConfig: {
              autoGenerate: true,
              maxCount: 8,
              updateInterval: 'weekly',
            },
            seasonalKeywords: {
              spring: ['牡丹花', '樱花', '踏青', '温泉', '登山', '清明上河园'],
              summer: ['云台山', '漂流', '避暑', '青天河', '鸡公山', '南湾湖'],
              autumn: ['老君山', '红叶', '登高', '秋游', '嵩山', '太行大峡谷'],
              winter: ['温泉', '雪景', '室内景点', '博物院', '古建筑', '美食'],
            },
            seasonalKeywordsConfig: {
              autoGenerate: true,
              currentSeason: 'spring',
              customSeasons: {
                spring: { name: '春季', months: [3, 4, 5], keywords: ['牡丹花', '樱花', '踏青'] },
                summer: { name: '夏季', months: [6, 7, 8], keywords: ['漂流', '避暑', '清凉'] },
                autumn: { name: '秋季', months: [9, 10, 11], keywords: ['红叶', '登高', '秋游'] },
                winter: { name: '冬季', months: [12, 1, 2], keywords: ['温泉', '雪景', '室内'] },
              },
            },
          }
        } else {
          // 为现有配置补充缺失的字段
          if (!restCapability.keywordConfig.systemKeywords) {
            restCapability.keywordConfig.systemKeywords = {
              scenic: ['龙门石窟', '少林寺', '白马寺', '清明上河园', '开封府', '云台山', '老君山', '嵩山'],
              food: ['胡辣汤', '烩面', '水席', '道口烧鸡', '开封灌汤包', '安阳血糕', '信阳毛尖'],
              culture: ['中原文化', '河洛文化', '黄河文明', '汉字文化', '武术文化', '佛教文化'],
              activity: ['登山', '徒步', '摄影', '赏花', '泡温泉', '漂流', '滑雪', '采摘'],
              travel: ['高铁', '飞机', '自驾', '包车', '公交', '地铁', '出租车', '共享单车'],
            }
          }
          if (!restCapability.keywordConfig.hotKeywordsConfig) {
            restCapability.keywordConfig.hotKeywordsConfig = {
              autoGenerate: true,
              maxCount: 8,
              updateInterval: 'weekly',
            }
          }
          if (!restCapability.keywordConfig.seasonalKeywordsConfig) {
            restCapability.keywordConfig.seasonalKeywordsConfig = {
              autoGenerate: true,
              currentSeason: 'spring',
              customSeasons: {
                spring: { name: '春季', months: [3, 4, 5], keywords: ['牡丹花', '樱花', '踏青'] },
                summer: { name: '夏季', months: [6, 7, 8], keywords: ['漂流', '避暑', '清凉'] },
                autumn: { name: '秋季', months: [9, 10, 11], keywords: ['红叶', '登高', '秋游'] },
                winter: { name: '冬季', months: [12, 1, 2], keywords: ['温泉', '雪景', '室内'] },
              },
            }
          }
        }
        // 应用能力配置
        Object.assign(modelCapabilityConfig.value, restCapability)
        // 应用资源配置
        if (resourceConfig) {
          Object.assign(modelResourceConfig.value, resourceConfig)
        }
      } catch (e) {
        console.warn('Failed to parse capability:', e)
      }
    }

    if (metaData.data.connConfig) {
      try {
        const connConfig = JSON.parse(metaData.data.connConfig)
        Object.assign(modelConnectionConfig.value, connConfig)
      } catch (e) {
        console.warn('Failed to parse connConfig:', e)
      }
    }

    // 2. 查找并加载模型实体配置（defaultParams）
    const { data: entityList } = await listEntity({
      metaId: modelId,
      name: undefined,
      scenario: undefined,
      status: undefined,
      createUser: undefined,
      createTime: undefined,
      page: 1,
      size: 1,
      sort: ['id,desc'],
    })

    if (entityList.list && entityList.list.length > 0) {
      const entity = entityList.list[0]
      currentEntityId.value = entity.id

      if (entity.defaultParams) {
        try {
          const params = JSON.parse(entity.defaultParams)

          // 恢复模型参数配置
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

          // 恢复上下文配置
          if (params.contextConfig) {
            Object.assign(contextConfig, {
              windowSize: params.contextConfig.windowSize || 10,
              keepSystemMessage: params.contextConfig.keepSystemMessage !== false,
              autoSummary: params.contextConfig.autoSummary || false,
            })
          }

          // 恢复安全配置
          if (params.safetyConfig) {
            Object.assign(safetyConfig, {
              enableContentFilter: params.safetyConfig.enableContentFilter !== false,
              sensitiveContentDetection: params.safetyConfig.sensitiveContentDetection !== false,
              filterLevel: params.safetyConfig.filterLevel || 'medium',
              blacklistKeywords: params.safetyConfig.blacklistKeywords || '',
            })
          }

          // 恢复系统消息
          if (params.systemPrompt) {
            contextConfig.systemMessage = params.systemPrompt
          }
        } catch (e) {
          console.warn('Failed to parse defaultParams:', e)
        }
      }
    }

    // 静默加载，不显示成功消息
  } catch (error) {
    console.error('加载模型编排配置失败:', error)
    // 加载失败时使用默认配置，不显示错误消息
  }
}

// 监听父组件传入的模型变化
watch(() => props.modelValue, async (newModel) => {
  currentModel.value = newModel || null
  // 重置实体ID，因为切换了模型
  currentEntityId.value = ''

  // 如果有新模型，加载其配置
  if (newModel?.id) {
    await loadModelOrchestrationConfig(newModel.id)
  }
}, { immediate: true })

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

// 处理编排配置保存
const handleOrchestrationSave = async (_orchestrationConfig: any) => {
  try {
    if (!currentModel.value) {
      Message.warning('请先选择一个模型')
      return
    }

    // 触发自动保存函数来保存所有配置到数据库
    await autoSaveConfig()

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
    resources: modelResourceConfig.value,
  }
}

onMounted(async () => {
  loadModels()
  // 如果有当前模型，加载其编排配置
  if (currentModel.value?.id) {
    await loadModelOrchestrationConfig(currentModel.value.id)
  }
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
})

// 获取关键词管理器的方法
const getKeywordManager = () => {
  return keywordManagerRef.value
}

defineExpose({
  currentModel,
  modelConfig,
  contextConfig,
  safetyConfig,
  modelCapabilityConfig,
  modelConnectionConfig,
  modelResourceConfig,
  keywordManagerRef,
  getFullConfig,
  resetConfig,
  handleOrchestrationSave,
  loadModelOrchestrationConfig,
  getKeywordManager,
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
        max-height: 100px;
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
