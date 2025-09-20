<template>
  <div class="capability-editor">
    <div class="editor-header">
      <h4>模型能力配置</h4>
    </div>

    <div class="capability-grid">
      <!-- 基础能力 -->
      <div class="capability-group">
        <div class="group-title">基础能力</div>
        <div class="capability-items">
          <div class="capability-item">
            <span class="label">文本生成</span>
            <a-switch v-model="capabilities.textGeneration" />
          </div>
          <div class="capability-item">
            <span class="label">代码生成</span>
            <a-switch v-model="capabilities.codeGeneration" />
          </div>
          <div class="capability-item">
            <span class="label">图像生成</span>
            <a-switch v-model="capabilities.imageGeneration" />
          </div>
          <div class="capability-item">
            <span class="label">图像分析</span>
            <a-switch v-model="capabilities.imageAnalysis" />
          </div>
          <div class="capability-item">
            <span class="label">音频处理</span>
            <a-switch v-model="capabilities.audioProcessing" />
          </div>
          <div class="capability-item">
            <span class="label">视频处理</span>
            <a-switch v-model="capabilities.videoProcessing" />
          </div>
        </div>
      </div>

      <!-- 高级能力 -->
      <div class="capability-group">
        <div class="group-title">高级能力</div>
        <div class="capability-items">
          <div class="capability-item">
            <span class="label">多模态</span>
            <a-switch v-model="capabilities.multimodal" />
          </div>
          <div class="capability-item">
            <span class="label">函数调用</span>
            <a-switch v-model="capabilities.functionCalling" />
          </div>
          <div class="capability-item">
            <span class="label">流式输出</span>
            <a-switch v-model="capabilities.streaming" />
          </div>
        </div>
      </div>

      <!-- 技术规格 -->
      <div class="capability-group full-width">
        <div class="group-title">技术规格</div>
        <div class="spec-items">
          <div class="spec-item">
            <label class="spec-label">上下文窗口大小</label>
            <a-input-number
              v-model="capabilities.contextWindow"
              :min="1000"
              :max="2000000"
              :step="1000"
              style="width: 150px"
            >
              <template #suffix>tokens</template>
            </a-input-number>
          </div>

          <div class="spec-item">
            <label class="spec-label">最大输出Token数</label>
            <a-input-number
              v-model="capabilities.maxTokens"
              :min="100"
              :max="10000"
              :step="100"
              style="width: 150px"
            >
              <template #suffix>tokens</template>
            </a-input-number>
          </div>
        </div>
      </div>

      <!-- 支持的格式 -->
      <div class="capability-group">
        <div class="group-title">支持的格式</div>
        <div class="format-selector">
          <a-checkbox-group v-model="capabilities.supportedFormats">
            <div class="format-grid">
              <a-checkbox value="text">文本</a-checkbox>
              <a-checkbox value="image">图像</a-checkbox>
              <a-checkbox value="audio">音频</a-checkbox>
              <a-checkbox value="video">视频</a-checkbox>
              <a-checkbox value="pdf">PDF</a-checkbox>
              <a-checkbox value="doc">Word文档</a-checkbox>
              <a-checkbox value="json">JSON</a-checkbox>
              <a-checkbox value="csv">CSV</a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>

      <!-- 支持的语言 -->
      <div class="capability-group">
        <div class="group-title">支持的语言</div>
        <div class="language-selector">
          <a-checkbox-group v-model="capabilities.languages">
            <div class="language-grid">
              <a-checkbox value="zh-CN">简体中文</a-checkbox>
              <a-checkbox value="en-US">英语</a-checkbox>
              <a-checkbox value="ja-JP">日语</a-checkbox>
              <a-checkbox value="ko-KR">韩语</a-checkbox>
              <a-checkbox value="fr-FR">法语</a-checkbox>
              <a-checkbox value="de-DE">德语</a-checkbox>
              <a-checkbox value="es-ES">西班牙语</a-checkbox>
              <a-checkbox value="ru-RU">俄语</a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自定义关键词接口
interface CustomKeyword {
  text: string
  category: string
  description?: string
}

// 自定义分类接口
interface CustomCategory {
  id: string
  name: string
  color: string
  description?: string
}

// 关键词配置接口
interface KeywordConfig {
  customKeywords: CustomKeyword[]
  customCategories: CustomCategory[]
  enabledSystemCategories: string[]
  // 系统关键词库（可自定义覆盖）
  systemKeywords: Record<string, string[]>
  // 热门关键词配置
  hotKeywords: string[]
  hotKeywordsConfig: {
    autoGenerate: boolean
    maxCount: number
    updateInterval: string // 'daily' | 'weekly' | 'monthly'
  }
  // 季节性关键词配置
  seasonalKeywords: Record<string, string[]>
  seasonalKeywordsConfig: {
    autoGenerate: boolean
    currentSeason?: string
    customSeasons: Record<string, {
      name: string
      months: number[]
      keywords: string[]
    }>
  }
}

interface ModelCapability {
  textGeneration: boolean
  codeGeneration: boolean
  imageGeneration: boolean
  imageAnalysis: boolean
  audioProcessing: boolean
  videoProcessing: boolean
  multimodal: boolean
  functionCalling: boolean
  streaming: boolean
  contextWindow: number
  maxTokens: number
  supportedFormats: string[]
  languages: string[]
  // 当前选择的提示词
  currentPrompt: any
  // 关键词配置
  keywordConfig?: KeywordConfig
}

interface Props {
  modelValue: ModelCapability
}

interface Emits {
  (e: 'update:modelValue', value: ModelCapability): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const capabilities = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 默认值
const defaultCapabilities: ModelCapability = {
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
  // 关键词配置默认值
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
}

// 初始化默认值
onMounted(() => {
  if (!props.modelValue) {
    emit('update:modelValue', defaultCapabilities)
  }
})
</script>

<style scoped lang="scss">
.capability-editor {
  padding: 16px 0;

  .editor-header {
    margin-bottom: 20px;
    flex-shrink: 0;

    h4 {
      margin: 0;
      color: var(--color-text-1);
      font-size: 16px;
      font-weight: 600;
    }
  }

  .capability-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;

    .capability-group {
      &.full-width {
        grid-column: 1 / -1;
      }

      .group-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border-2);
      }

      .capability-items {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .capability-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--color-fill-1);
          border-radius: 6px;

          .label {
            font-size: 13px;
            color: var(--color-text-2);
          }
        }
      }

      .spec-items {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .spec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .spec-label {
            font-size: 13px;
            color: var(--color-text-2);
          }
        }
      }

      .format-grid,
      .language-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;

        :deep(.arco-checkbox) {
          margin: 0;
        }
      }
    }
  }
}
</style>
