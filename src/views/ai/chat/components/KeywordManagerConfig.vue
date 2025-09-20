<template>
  <div class="keyword-manager">
    <!-- 头部操作栏 -->
    <div class="manager-header">
      <div class="header-left">
        <a-button type="primary" @click="handleAddKeyword">
          <template #icon>
            <icon-plus />
          </template>
          添加关键词
        </a-button>
        <a-button @click="handleAddCategory">
          <template #icon>
            <icon-tag />
          </template>
          新增分类
        </a-button>
        <a-button @click="handleRefreshKeywords">
          <template #icon>
            <icon-refresh />
          </template>
          刷新推荐
        </a-button>
      </div>
      <!--      <div class="header-right"> -->
      <!--        <a-input-search -->
      <!--          v-model="searchQuery" -->
      <!--          placeholder="搜索关键词..." -->
      <!--          style="width: 200px;" -->
      <!--          @search="handleSearch" -->
      <!--        /> -->
      <!--      </div> -->
    </div>

    <!-- 关键词分类标签 -->
    <div class="category-tabs">
      <a-radio-group v-model="selectedCategory" type="button" size="small">
        <a-radio value="all">全部</a-radio>
        <a-radio value="scenic">景点推荐</a-radio>
        <a-radio value="food">美食特产</a-radio>
        <a-radio value="culture">历史文化</a-radio>
        <a-radio value="activity">体验活动</a-radio>
        <a-radio value="travel">出行指南</a-radio>
        <a-radio v-for="category in customCategories" :key="category.id" :value="category.id">
          {{ category.name }}
        </a-radio>
      </a-radio-group>
    </div>

    <!-- 关键词统计信息 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="总关键词数" :value="keywordStats.totalCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="分类数量" :value="keywordStats.typeCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="自定义关键词" :value="customKeywords.length" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="热门关键词" :value="hotKeywords.length" />
        </a-col>
      </a-row>
    </div>

    <!-- 关键词列表 -->
    <div class="keywords-content">
      <div class="content-tabs">
        <a-tabs v-model:active-key="activeContentTab" size="small">
          <a-tab-pane key="system" title="系统关键词" />
          <a-tab-pane key="custom" title="自定义关键词" />
          <a-tab-pane key="hot" title="热门推荐" />
          <a-tab-pane key="seasonal" title="季节推荐" />
        </a-tabs>
      </div>

      <div class="keywords-list">
        <!-- 系统关键词 -->
        <div v-if="activeContentTab === 'system'" class="system-keywords">
          <div v-for="(keywords, type) in filteredSystemKeywords" :key="type" class="keyword-category">
            <div class="category-title">
              <icon-tag />
              {{ getTypeName(type) }}
              <a-tag size="small">{{ keywords.length }}</a-tag>
            </div>
            <div class="keyword-tags">
              <a-tag
                v-for="keyword in keywords"
                :key="keyword"
                class="keyword-tag"
                :color="getKeywordColor(type)"
                @click="handleKeywordClick(keyword)"
              >
                {{ keyword }}
                <template #icon>
                  <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword)" />
                </template>
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 自定义关键词 -->
        <div v-if="activeContentTab === 'custom'" class="custom-keywords">
          <!-- 按分类显示自定义关键词 -->
          <div v-for="categoryGroup in groupedCustomKeywords" :key="categoryGroup.category" class="keyword-category">
            <div class="category-title">
              <icon-tag />
              {{ categoryGroup.categoryName }}
              <a-tag size="small" :color="categoryGroup.color">{{ categoryGroup.keywords.length }}</a-tag>
            </div>
            <div class="keyword-tags">
              <a-tag
                v-for="(keyword, index) in categoryGroup.keywords"
                :key="index"
                class="keyword-tag custom"
                :color="categoryGroup.color"
                closable
                @close="handleRemoveCustomKeyword(categoryGroup.keywords, index)"
                @click="handleKeywordClick(keyword.text)"
              >
                {{ keyword.text }}
                <template #icon>
                  <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword.text)" />
                </template>
              </a-tag>
            </div>
          </div>

          <!-- 添加关键词按钮 -->
          <div class="add-section">
            <a-tag class="add-keyword-tag" @click="handleAddKeyword">
              <icon-plus />
              添加关键词
            </a-tag>
          </div>
        </div>

        <!-- 热门推荐 -->
        <div v-if="activeContentTab === 'hot'" class="hot-keywords">
          <div class="keyword-tags">
            <a-tag
              v-for="keyword in hotKeywords"
              :key="keyword"
              class="keyword-tag hot"
              color="red"
              @click="handleKeywordClick(keyword)"
            >
              {{ keyword }}
              <template #icon>
                <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword)" />
              </template>
            </a-tag>
          </div>
        </div>

        <!-- 季节推荐 -->
        <div v-if="activeContentTab === 'seasonal'" class="seasonal-keywords">
          <div class="season-selector">
            <a-select v-model="selectedMonth" placeholder="选择月份" style="width: 120px;">
              <a-option v-for="month in 12" :key="month" :value="month">
                {{ month }}月
              </a-option>
            </a-select>
          </div>
          <div class="keyword-tags">
            <a-tag
              v-for="keyword in seasonalKeywords"
              :key="keyword"
              class="keyword-tag seasonal"
              color="blue"
              @click="handleKeywordClick(keyword)"
            >
              {{ keyword }}
              <template #icon>
                <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword)" />
              </template>
            </a-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加关键词模态框 -->
    <a-modal
      v-model:visible="addKeywordVisible"
      title="添加自定义关键词"
      @ok="handleAddKeywordConfirm"
    >
      <div class="add-keyword-form">
        <div class="form-item">
          <label class="form-label">关键词内容 *</label>
          <a-input v-model="addKeywordForm.text" placeholder="请输入关键词" />
        </div>
        <div class="form-item">
          <label class="form-label">分类</label>
          <a-select v-model="addKeywordForm.category" placeholder="选择分类">
            <a-optgroup label="系统分类">
              <a-option value="scenic">景点推荐</a-option>
              <a-option value="food">美食特产</a-option>
              <a-option value="culture">历史文化</a-option>
              <a-option value="activity">体验活动</a-option>
              <a-option value="travel">出行指南</a-option>
            </a-optgroup>
            <a-optgroup v-if="customCategories.length > 0" label="自定义分类">
              <a-option v-for="category in customCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-option>
            </a-optgroup>
          </a-select>
        </div>
        <div class="form-item">
          <label class="form-label">描述</label>
          <a-textarea v-model="addKeywordForm.description" placeholder="请输入关键词描述" />
        </div>
      </div>
    </a-modal>

    <!-- 添加分类模态框 -->
    <a-modal
      v-model:visible="addCategoryVisible"
      title="新增自定义分类"
      width="520px"
      :footer="false"
      class="add-category-modal-wrapper"
    >
      <div class="modern-category-form">
        <!-- 顶部预览区 -->
        <div class="preview-section">
          <div class="preview-title">实时预览</div>
          <div class="preview-demo">
            <div class="demo-tag">
              <span
                class="tag-dot"
                :style="{ backgroundColor: getColorValue(addCategoryForm.color) }"
              ></span>
              <span class="tag-text">{{ addCategoryForm.name || '我的分类' }}</span>
              <span class="tag-count">0</span>
            </div>
            <div class="demo-description">
              {{ addCategoryForm.description || '这里显示分类描述信息...' }}
            </div>
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <!-- 分类名称 -->
          <div class="input-group">
            <div class="input-label">
              <span class="label-text">分类名称</span>
              <span class="required-mark">*</span>
            </div>
            <a-input
              v-model="addCategoryForm.name"
              placeholder="为你的分类起个名字"
              size="large"
              :max-length="15"
              class="modern-input"
            />
          </div>

          <!-- 选择颜色 -->
          <div class="input-group">
            <div class="input-label">
              <span class="label-text">选择颜色</span>
            </div>
            <div class="color-grid">
              <div
                v-for="(colorOption, index) in colorOptions"
                :key="`color-${index}`"
                class="color-item"
                :class="{ selected: addCategoryForm.color === colorOption.name }"
                :title="colorOption.label"
                @click="addCategoryForm.color = colorOption.name"
              >
                <div
                  class="color-circle"
                  :style="{ backgroundColor: colorOption.value }"
                >
                  <div v-if="addCategoryForm.color === colorOption.name" class="check-mark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
                <span class="color-label">{{ colorOption.label }}</span>
              </div>
            </div>
          </div>

          <!-- 分类描述 -->
          <div class="input-group">
            <div class="input-label">
              <span class="label-text">分类描述</span>
              <span class="optional-mark">可选</span>
            </div>
            <a-textarea
              v-model="addCategoryForm.description"
              placeholder="简单描述一下这个分类的用途..."
              :rows="3"
              :max-length="80"
              class="modern-textarea"
            />
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="action-section">
          <a-button size="large" @click="addCategoryVisible = false">
            取消
          </a-button>
          <a-button
            type="primary"
            size="large"
            :disabled="!addCategoryForm.name.trim()"
            @click="handleAddCategoryConfirm"
          >
            创建分类
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'

// 关键词类型常量
const KEYWORD_TYPES = {
  SCENIC: 'scenic',
  FOOD: 'food',
  CULTURE: 'culture',
  ACTIVITY: 'activity',
  TRAVEL: 'travel',
}

// 河南地区专业关键词库
const HENAN_KEYWORDS: Record<string, string[]> = {
  [KEYWORD_TYPES.SCENIC]: [
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
  [KEYWORD_TYPES.FOOD]: [
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
  [KEYWORD_TYPES.CULTURE]: [
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
  [KEYWORD_TYPES.ACTIVITY]: [
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
  [KEYWORD_TYPES.TRAVEL]: [
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
}

interface CustomKeyword {
  text: string
  category: string
  description?: string
}

interface CustomCategory {
  id: string
  name: string
  color: string
  description?: string
}

interface KeywordInfo {
  keyword: string
  type: string
  category: string
  relatedKeywords: string[]
}

// 响应式数据
const selectedCategory = ref('all')
const activeContentTab = ref('system')
const searchQuery = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)

// 自定义关键词
const customKeywords = ref<CustomKeyword[]>([])

// 自定义分类
const customCategories = ref<CustomCategory[]>([])

// 添加关键词
const addKeywordVisible = ref(false)
const addKeywordForm = reactive({
  text: '',
  category: 'scenic',
  description: '',
})

// 添加分类
const addCategoryVisible = ref(false)
const addCategoryForm = reactive({
  name: '',
  color: 'blue',
  description: '',
})

// 可用颜色配置
const colorOptions = ref([
  { name: 'blue', value: '#165dff', label: '蓝色' },
  { name: 'green', value: '#00b42a', label: '绿色' },
  { name: 'orange', value: '#ff7d00', label: '橙色' },
  { name: 'red', value: '#f53f3f', label: '红色' },
  { name: 'purple', value: '#722ed1', label: '紫色' },
  { name: 'cyan', value: '#14c9c9', label: '青色' },
  { name: 'pink', value: '#f7ba1e', label: '粉色' },
  { name: 'lime', value: '#9fdb1d', label: '绿黄色' },
  { name: 'gold', value: '#faad14', label: '金色' },
  { name: 'magenta', value: '#f5319d', label: '洋红色' },
])

// 获取颜色值的函数
const getColorValue = (colorName: string) => {
  const colorOption = colorOptions.value.find((option) => option.name === colorName)
  return colorOption?.value || '#165dff'
}

// 计算属性
const keywordStats = computed(() => {
  let totalCount = 0
  const stats: Record<string, any> = {}

  for (const [type, keywords] of Object.entries(HENAN_KEYWORDS)) {
    stats[type] = {
      count: keywords.length,
      typeName: getTypeName(type),
    }
    totalCount += keywords.length
  }

  return {
    ...stats,
    totalCount: totalCount + customKeywords.value.length,
    typeCount: Object.keys(HENAN_KEYWORDS).length,
  }
})

const filteredSystemKeywords = computed(() => {
  let filtered = { ...HENAN_KEYWORDS }

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = { [selectedCategory.value]: HENAN_KEYWORDS[selectedCategory.value] || [] }
  }

  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const result: Record<string, string[]> = {}

    for (const [type, keywords] of Object.entries(filtered)) {
      const matchedKeywords = keywords.filter((keyword) =>
        keyword.toLowerCase().includes(query),
      )
      if (matchedKeywords.length > 0) {
        result[type] = matchedKeywords
      }
    }
    filtered = result
  }

  return filtered
})

const hotKeywords = computed(() => [
  // 必推景点
  '龙门石窟',
  '少林寺',
  '清明上河园',
  '云台山',
  // 特色美食
  '胡辣汤',
  '烩面',
  '道口烧鸡',
  '开封灌汤包',
  // 文化体验
  '中原文化',
  '武术文化',
  '古都文化',
  // 热门活动
  '登山',
  '赏花',
  '温泉',
  '摄影',
])

const seasonalKeywords = computed(() => {
  const seasonalKeywords: Record<string, string[]> = {
    // 春季 (3-5月)
    spring: ['牡丹花', '樱花', '踏青', '温泉', '登山', '清明上河园'],
    // 夏季 (6-8月)
    summer: ['云台山', '漂流', '避暑', '青天河', '鸡公山', '南湾湖'],
    // 秋季 (9-11月)
    autumn: ['老君山', '红叶', '登高', '秋游', '嵩山', '太行大峡谷'],
    // 冬季 (12-2月)
    winter: ['温泉', '雪景', '室内景点', '博物院', '古建筑', '美食'],
  }

  const month = selectedMonth.value
  let season = 'spring'
  if (month >= 6 && month <= 8) season = 'summer'
  else if (month >= 9 && month <= 11) season = 'autumn'
  else if (month === 12 || month <= 2) season = 'winter'

  return seasonalKeywords[season] || []
})

// 所有可用的分类选项（系统 + 自定义）
const allCategories = computed(() => {
  const systemCategories = [
    { value: 'scenic', label: '景点推荐' },
    { value: 'food', label: '美食特产' },
    { value: 'culture', label: '历史文化' },
    { value: 'activity', label: '体验活动' },
    { value: 'travel', label: '出行指南' },
  ]

  const customCategoryOptions = customCategories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  return [...systemCategories, ...customCategoryOptions]
})

// 按分类分组的自定义关键词
const groupedCustomKeywords = computed(() => {
  const groups: Record<string, any> = {}

  // 按分类分组
  customKeywords.value.forEach((keyword) => {
    if (!groups[keyword.category]) {
      groups[keyword.category] = []
    }
    groups[keyword.category].push(keyword)
  })

  // 转换为数组并添加分类信息
  return Object.entries(groups).map(([categoryId, keywords]) => {
    // 查找分类信息
    const customCategory = customCategories.value.find((cat) => cat.id === categoryId)
    let categoryName = '未分类'
    let color = 'gray'

    if (customCategory) {
      categoryName = customCategory.name
      color = customCategory.color
    } else {
      // 系统分类
      const systemCategoryNames: Record<string, string> = {
        scenic: '景点推荐',
        food: '美食特产',
        culture: '历史文化',
        activity: '体验活动',
        travel: '出行指南',
      }
      categoryName = systemCategoryNames[categoryId] || '未分类'
      color = getKeywordColor(categoryId)
    }

    return {
      category: categoryId,
      categoryName,
      color,
      keywords,
    }
  })
})

// 方法
const getTypeName = (type: string) => {
  const typeNames: Record<string, string> = {
    [KEYWORD_TYPES.SCENIC]: '景点推荐',
    [KEYWORD_TYPES.FOOD]: '美食特产',
    [KEYWORD_TYPES.CULTURE]: '历史文化',
    [KEYWORD_TYPES.ACTIVITY]: '体验活动',
    [KEYWORD_TYPES.TRAVEL]: '出行指南',
  }
  return typeNames[type] || '其他'
}

const getKeywordColor = (type: string) => {
  const colors: Record<string, string> = {
    [KEYWORD_TYPES.SCENIC]: 'blue',
    [KEYWORD_TYPES.FOOD]: 'orange',
    [KEYWORD_TYPES.CULTURE]: 'purple',
    [KEYWORD_TYPES.ACTIVITY]: 'green',
    [KEYWORD_TYPES.TRAVEL]: 'cyan',
  }
  return colors[type] || 'gray'
}

const getRandomKeywords = (type: string, count = 3) => {
  const typeKeywords = HENAN_KEYWORDS[type] || []
  const shuffled = typeKeywords.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const handleCopyKeyword = async (keyword: string) => {
  try {
    await navigator.clipboard.writeText(keyword)
    Message.success(`已复制关键词: ${keyword}`)
  } catch (error) {
    Message.error('复制失败')
  }
}

const getKeywordInfo = (keyword: string): KeywordInfo => {
  for (const [type, keywords] of Object.entries(HENAN_KEYWORDS)) {
    if (keywords.includes(keyword)) {
      return {
        keyword,
        type,
        category: getTypeName(type),
        relatedKeywords: getRandomKeywords(type, 3).filter((k) => k !== keyword),
      }
    }
  }

  return {
    keyword,
    type: 'unknown',
    category: '其他',
    relatedKeywords: [],
  }
}

const handleKeywordClick = (keyword: string) => {
  handleCopyKeyword(keyword)
}

const handleAddKeyword = () => {
  addKeywordVisible.value = true
}

const handleAddKeywordConfirm = () => {
  // 简单验证
  if (!addKeywordForm.text.trim()) {
    Message.error('请输入关键词内容')
    return
  }

  // 检查是否已存在
  const exists = customKeywords.value.some((keyword) => keyword.text === addKeywordForm.text.trim())
  if (exists) {
    Message.error('关键词已存在')
    return
  }

  // 添加关键词
  const newKeyword = {
    text: addKeywordForm.text.trim(),
    category: addKeywordForm.category,
    description: addKeywordForm.description.trim(),
  }

  customKeywords.value.push(newKeyword)

  // 重置表单
  addKeywordForm.text = ''
  addKeywordForm.category = 'scenic'
  addKeywordForm.description = ''
  addKeywordVisible.value = false

  Message.success('添加成功')
}

// 分类管理方法
const handleAddCategory = () => {
  addCategoryVisible.value = true
}

const handleAddCategoryConfirm = () => {
  // 简单验证
  if (!addCategoryForm.name.trim()) {
    Message.error('请输入分类名称')
    return
  }

  // 检查是否已存在
  const exists = customCategories.value.some((cat) => cat.name === addCategoryForm.name.trim())
  if (exists) {
    Message.error('分类名称已存在')
    return
  }

  // 添加分类
  const newCategory = {
    id: `custom_${Date.now()}`,
    name: addCategoryForm.name.trim(),
    color: addCategoryForm.color,
    description: addCategoryForm.description.trim(),
  }

  customCategories.value.push(newCategory)

  // 重置表单
  addCategoryForm.name = ''
  addCategoryForm.color = 'blue'
  addCategoryForm.description = ''
  addCategoryVisible.value = false

  Message.success('分类添加成功')
}

const handleRemoveCustomKeyword = (keywords: CustomKeyword[], index: number) => {
  // 找到要删除的关键词在全局列表中的索引
  const keywordToRemove = keywords[index]
  const globalIndex = customKeywords.value.findIndex((k) =>
    k.text === keywordToRemove.text && k.category === keywordToRemove.category,
  )

  if (globalIndex !== -1) {
    customKeywords.value.splice(globalIndex, 1)
    Message.success('删除成功')
  }
}

const handleRefreshKeywords = () => {
  // 刷新热门关键词和季节推荐
  selectedMonth.value = new Date().getMonth() + 1
  Message.success('关键词推荐已刷新')
}

// 生成基于用户输入的回退关键词
const generateFallbackKeywords = (userInput = '') => {
  const keywords = []
  const input = userInput.toLowerCase()

  // 基于用户输入内容智能推荐关键词
  if (input.includes('景点') || input.includes('旅游') || input.includes('游玩') || input.includes('参观')) {
    keywords.push(...getRandomKeywords(KEYWORD_TYPES.SCENIC, 3))
  }

  if (input.includes('美食') || input.includes('吃') || input.includes('小吃') || input.includes('特产')) {
    keywords.push(...getRandomKeywords(KEYWORD_TYPES.FOOD, 3))
  }

  if (input.includes('文化') || input.includes('历史') || input.includes('传统') || input.includes('民俗')) {
    keywords.push(...getRandomKeywords(KEYWORD_TYPES.CULTURE, 3))
  }

  if (input.includes('活动') || input.includes('体验') || input.includes('娱乐')) {
    keywords.push(...getRandomKeywords(KEYWORD_TYPES.ACTIVITY, 3))
  }

  if (input.includes('交通') || input.includes('路线') || input.includes('怎么去') || input.includes('住宿')) {
    keywords.push(...getRandomKeywords(KEYWORD_TYPES.TRAVEL, 3))
  }

  // 如果没有匹配到特定类别，提供综合推荐
  if (keywords.length === 0) {
    keywords.push(
      ...getRandomKeywords(KEYWORD_TYPES.SCENIC, 2),
      ...getRandomKeywords(KEYWORD_TYPES.FOOD, 2),
      ...getRandomKeywords(KEYWORD_TYPES.CULTURE, 1),
    )
  }

  // 去重并限制数量
  return [...new Set(keywords)].slice(0, 6)
}

// 暴露方法给父组件
defineExpose({
  generateFallbackKeywords,
  getRandomKeywords,
  getKeywordInfo,
  customKeywords,
  customCategories,
  hotKeywords,
  seasonalKeywords,
  allCategories,
})
</script>

<style scoped lang="scss">
.keyword-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-2);

    .header-left {
      display: flex;
      gap: 8px;
    }
  }

  .category-tabs {
    margin-bottom: 16px;
  }

  .stats-section {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--color-fill-1);
    border-radius: 6px;
  }

  .keywords-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .content-tabs {
      margin-bottom: 16px;
    }

    .keywords-list {
      flex: 1;
      overflow-y: auto;

      .keyword-category {
        margin-bottom: 20px;

        .category-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-1);
        }

        .keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .keyword-tag {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .copy-icon {
              margin-left: 4px;
              cursor: pointer;
              opacity: 0.6;

              &:hover {
                opacity: 1;
              }
            }

            &.custom {
              border: 1px dashed var(--color-border-3);
              background: var(--color-fill-2);
            }

            &.hot {
              animation: pulse 2s infinite;
            }
          }

          .add-keyword-tag {
            border: 1px dashed var(--color-border-3);
            background: var(--color-fill-1);
            cursor: pointer;

            &:hover {
              border-color: var(--color-primary);
              color: var(--color-primary);
            }
          }
        }
      }

      .custom-keywords,
      .hot-keywords,
      .seasonal-keywords {
        .keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .seasonal-keywords {
        .season-selector {
          margin-bottom: 12px;
        }
      }
    }
  }

  .add-keyword-form,
  .add-category-form {
    .form-item {
      margin-bottom: 16px;

      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 8px;
      }
    }
  }

}

// 新增分类弹窗现代化样式
:deep(.add-category-modal-wrapper) {
  .arco-modal-header {
    border-bottom: none;
    padding: 20px 24px 0;

    .arco-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }

  .arco-modal-body {
    padding: 0;
  }
}

.modern-category-form {
  padding: 20px 24px 0;

  .preview-section {
    background: linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-fill-1) 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    text-align: center;
    border: 1px solid var(--color-border-2);

    .preview-title {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-demo {
      .demo-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--color-bg-1);
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--color-border-1);
        transition: all 0.3s ease;
        margin-bottom: 12px;

        .tag-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tag-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-1);
        }

        .tag-count {
          background: var(--color-fill-2);
          color: var(--color-text-2);
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }
      }

      .demo-description {
        font-size: 13px;
        color: var(--color-text-3);
        font-style: italic;
        line-height: 1.4;
      }
    }
  }

  .form-section {
    margin-bottom: 24px;
  }

  .input-group {
    margin-bottom: 20px;

    .input-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .label-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1);
      }

      .required-mark {
        color: rgb(var(--danger-6));
        font-size: 14px;
      }

      .optional-mark {
        font-size: 12px;
        color: var(--color-text-4);
        font-weight: 400;
      }
    }
  }

  .modern-input {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--color-border-2);
    padding: 0 16px;
    font-size: 14px;
    transition: all 0.2s;
    background: var(--color-bg-1);
    color: var(--color-text-1);

    &:focus {
      border-color: rgb(var(--primary-6));
      box-shadow: 0 0 0 3px rgba(var(--primary-1), 0.3);
      outline: none;
    }

    &::placeholder {
      color: var(--color-text-4);
    }
  }

  .modern-textarea {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--color-border-2);
    padding: 12px 16px;
    font-size: 14px;
    transition: all 0.2s;
    resize: vertical;
    background: var(--color-bg-1);
    color: var(--color-text-1);

    &:focus {
      border-color: rgb(var(--primary-6));
      box-shadow: 0 0 0 3px rgba(var(--primary-1), 0.3);
      outline: none;
    }

    &::placeholder {
      color: var(--color-text-4);
    }
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    max-width: 320px;

    .color-item {
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;

      &:hover {
        transform: translateY(-2px);
      }

      .color-circle {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 3px solid transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin: 0 auto 6px;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .check-mark {
          opacity: 0;
          transition: opacity 0.2s;

          svg {
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          }
        }
      }

      .color-label {
        font-size: 11px;
        color: var(--color-text-3);
        font-weight: 500;
        display: block;
      }

      &.selected .color-circle {
        border-color: rgb(var(--primary-6));
        box-shadow: 0 0 0 2px rgba(var(--primary-1), 0.3), 0 4px 16px rgba(0, 0, 0, 0.15);

        .check-mark {
          opacity: 1;
        }
      }
    }
  }

  .action-section {
    padding: 20px 24px 24px;
    margin: 0 -24px;
    border-top: 1px solid var(--color-border-2);
    background: var(--color-bg-2);
    border-radius: 0 0 8px 8px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .arco-btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s;

      &:not(.arco-btn-primary) {
        border-color: var(--color-border-2);
        color: var(--color-text-2);
        background: var(--color-bg-1);

        &:hover {
          border-color: var(--color-border-3);
          background: var(--color-fill-1);
        }
      }

      &.arco-btn-primary {
        background: rgb(var(--primary-6));
        border-color: rgb(var(--primary-6));

        &:hover {
          background: rgb(var(--primary-5));
          border-color: rgb(var(--primary-5));
        }

        &:disabled {
          background: var(--color-fill-4);
          border-color: var(--color-fill-4);
          cursor: not-allowed;
        }
      }
    }
  }

}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(var(--red-6) / 40%);
  }
  70% {
    box-shadow: 0 0 0 6px rgb(var(--red-6) / 0%);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(var(--red-6) / 0%);
  }
}
</style>
