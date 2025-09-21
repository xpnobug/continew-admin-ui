<template>
  <div class="keyword-manager">
    <!-- 头部操作栏 -->

    <!-- 关键词分类标签 -->
    <!--    <div class="category-tabs"> -->
    <!--      <a-radio-group v-model="selectedCategory" type="button" size="small"> -->
    <!--        <a-radio value="all">全部</a-radio> -->
    <!--        <a-radio value="scenic">景点推荐</a-radio> -->
    <!--        <a-radio value="food">美食特产</a-radio> -->
    <!--        <a-radio value="culture">历史文化</a-radio> -->
    <!--        <a-radio value="activity">体验活动</a-radio> -->
    <!--        <a-radio value="travel">出行指南</a-radio> -->
    <!--        <a-radio v-for="category in customCategories" :key="category.id" :value="category.id"> -->
    <!--          {{ category.name }} -->
    <!--        </a-radio> -->
    <!--      </a-radio-group> -->
    <!--    </div> -->

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
          <!--          <a-tab-pane key="system" title="系统关键词" /> -->
          <!--          <a-tab-pane key="custom" title="自定义关键词" /> -->
          <a-tab-pane key="hot" title="热门推荐" />
          <!--          <a-tab-pane key="seasonal" title="季节推荐" /> -->
          <a-tab-pane key="management" title="关键词库管理" />
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
                :class="{ selected: isKeywordSelected(keyword) }"
                :color="isKeywordSelected(keyword) ? 'red' : getKeywordColor(type)"
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
                :class="{ selected: isKeywordSelected(keyword.text) }"
                :color="isKeywordSelected(keyword.text) ? 'red' : categoryGroup.color"
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
              :class="{ selected: isKeywordSelected(keyword) }"
              :color="isKeywordSelected(keyword) ? 'red' : 'red'"
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

        <!-- 关键词库管理 -->
        <div v-if="activeContentTab === 'management'" class="keywords-management">
          <!-- 管理工具栏 -->
          <div class="management-toolbar">
            <div class="toolbar-section">
              <h3 class="section-title">
                <icon-tool class="title-icon" />
                关键词库管理
              </h3>
              <p class="section-description">管理系统关键词库和自定义分类，支持添加、删除关键词，导入导出配置</p>
            </div>
            <div class="toolbar-actions">
              <a-button @click="handleAddCategory">
                <template #icon>
                  <icon-tag />
                </template>
                新增分类
              </a-button>
              <a-button status="warning" @click="handleResetToDefault">
                <template #icon>
                  <icon-refresh />
                </template>
                重置默认
              </a-button>
            </div>
          </div>

          <!-- 分类管理子标签 -->
          <div class="sub-tabs-wrapper">
            <a-tabs v-model:active-key="activeManagementTab" size="small" class="management-tabs">
              <a-tab-pane key="system" title="系统分类管理" />
              <a-tab-pane key="custom" title="自定义分类管理" />
            </a-tabs>
          </div>

          <!-- 系统关键词管理 -->
          <div v-if="activeManagementTab === 'system'" class="system-keywords-management">
            <div v-for="(keywords, categoryId) in keywordConfig.systemKeywords" :key="categoryId" class="keyword-category">
              <div class="category-title">
                <icon-tag />
                {{ getTypeName(categoryId) }}
                <a-tag size="small" :color="getKeywordColor(categoryId)">{{ keywords.length }}</a-tag>
                <div class="category-actions">
                  <a-button
                    type="text"
                    size="small"
                    class="add-keyword-btn"
                    @click="handleAddSystemKeyword(categoryId)"
                  >
                    <template #icon>
                      <icon-plus />
                    </template>
                    添加关键词
                  </a-button>
                </div>
              </div>
              <div class="keyword-tags">
                <template v-if="keywords.length === 0">
                  <div class="empty-keywords">
                    <span class="empty-text">暂无关键词</span>
                    <a-button
                      size="mini"
                      type="primary"
                      @click="handleAddSystemKeyword(categoryId)"
                    >
                      添加第一个
                    </a-button>
                  </div>
                </template>
                <template v-else>
                  <a-tag
                    v-for="(keyword, index) in keywords"
                    :key="`${categoryId}-${index}`"
                    class="keyword-tag editable"
                    :class="{ selected: isKeywordSelected(keyword) }"
                    :color="isKeywordSelected(keyword) ? 'red' : getKeywordColor(categoryId)"
                    closable
                    @close="handleRemoveSystemKeyword(categoryId, index)"
                    @click="handleKeywordClick(keyword)"
                  >
                    {{ keyword }}
                    <template #icon>
                      <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword)" />
                    </template>
                  </a-tag>
                </template>
              </div>
            </div>
          </div>

          <!-- 自定义分类管理 -->
          <div v-if="activeManagementTab === 'custom'" class="custom-categories-management">
            <!-- 分类列表为空时的提示 -->
            <div v-if="customCategories.length === 0" class="empty-categories">
              <div class="empty-content">
                <icon-folder-add class="empty-icon" />
                <h4>暂无自定义分类</h4>
                <p>您还没有创建任何自定义分类，点击下方按钮开始创建吧</p>
                <a-button type="primary" @click="handleAddCategory">
                  <template #icon>
                    <icon-plus />
                  </template>
                  创建第一个分类
                </a-button>
              </div>
            </div>

            <!-- 自定义分类列表 -->
            <div v-else class="custom-categories-list">
              <div v-for="category in customCategories" :key="category.id" class="custom-category-item">
                <div class="category-title">
                  <span
                    class="category-color-dot"
                    :style="{ backgroundColor: getColorValue(category.color) }"
                  ></span>
                  <span class="category-name">{{ category.name }}</span>
                  <a-tag size="small" :color="category.color">{{ getCategoryKeywordCount(category.id) }}</a-tag>
                  <div class="category-actions">
                    <a-button
                      type="text"
                      size="small"
                      class="add-keyword-btn"
                      @click="handleAddCustomKeyword(category.id)"
                    >
                      <template #icon>
                        <icon-plus />
                      </template>
                      添加关键词
                    </a-button>
                    <a-button
                      type="text"
                      size="small"
                      @click="handleEditCategory(category)"
                    >
                      <template #icon>
                        <icon-edit />
                      </template>
                      编辑
                    </a-button>
                    <a-popconfirm
                      content="确定要删除这个分类吗？分类下的所有关键词也会被删除"
                      @ok="handleDeleteCategory(category.id)"
                    >
                      <a-button
                        type="text"
                        size="small"
                        status="danger"
                      >
                        <template #icon>
                          <icon-delete />
                        </template>
                        删除
                      </a-button>
                    </a-popconfirm>
                  </div>
                </div>
                <div class="keyword-tags">
                  <template v-if="getCategoryKeywords(category.id).length === 0">
                    <div class="empty-keywords">
                      <span class="empty-text">暂无关键词</span>
                      <a-button
                        size="mini"
                        type="primary"
                        @click="handleAddCustomKeyword(category.id)"
                      >
                        添加第一个
                      </a-button>
                    </div>
                  </template>
                  <template v-else>
                    <a-tag
                      v-for="(keyword, index) in getCategoryKeywords(category.id)"
                      :key="`${category.id}-${index}`"
                      class="keyword-tag editable"
                      :class="{ selected: isKeywordSelected(keyword.text) }"
                      :color="isKeywordSelected(keyword.text) ? 'red' : category.color"
                      closable
                      @close="handleRemoveCustomKeyword(getCategoryKeywords(category.id), index)"
                      @click="handleKeywordClick(keyword.text)"
                    >
                      {{ keyword.text }}
                      <template #icon>
                        <icon-copy class="copy-icon" @click.stop="handleCopyKeyword(keyword.text)" />
                      </template>
                    </a-tag>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加系统关键词模态框 -->
    <a-modal
      v-model:visible="addSystemKeywordVisible"
      title="添加系统关键词"
      @ok="handleAddSystemKeywordConfirm"
    >
      <div class="add-system-keyword-form">
        <div class="form-item">
          <label class="form-label">关键词内容 *</label>
          <a-input v-model="addSystemKeywordForm.text" placeholder="请输入关键词" />
        </div>
        <div class="form-item">
          <label class="form-label">分类：{{ getTypeName(addSystemKeywordForm.category) }}</label>
        </div>
      </div>
    </a-modal>

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

    <!-- 编辑分类模态框 -->
    <a-modal
      v-model:visible="editCategoryVisible"
      title="编辑自定义分类"
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
                :style="{ backgroundColor: getColorValue(editCategoryForm.color) }"
              ></span>
              <span class="tag-text">{{ editCategoryForm.name || '我的分类' }}</span>
              <span class="tag-count">{{ getCategoryKeywordCount(editCategoryForm.id) }}</span>
            </div>
            <div class="demo-description">
              {{ editCategoryForm.description || '这里显示分类描述信息...' }}
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
              v-model="editCategoryForm.name"
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
                :key="`edit-color-${index}`"
                class="color-item"
                :class="{ selected: editCategoryForm.color === colorOption.name }"
                :title="colorOption.label"
                @click="editCategoryForm.color = colorOption.name"
              >
                <div
                  class="color-circle"
                  :style="{ backgroundColor: colorOption.value }"
                >
                  <div v-if="editCategoryForm.color === colorOption.name" class="check-mark">
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
              v-model="editCategoryForm.description"
              placeholder="简单描述一下这个分类的用途..."
              :rows="3"
              :max-length="80"
              class="modern-textarea"
            />
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="action-section">
          <a-button size="large" @click="editCategoryVisible = false">
            取消
          </a-button>
          <a-button
            type="primary"
            size="large"
            :disabled="!editCategoryForm.name.trim()"
            @click="handleEditCategoryConfirm"
          >
            保存修改
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'

// Props 和 Emits
const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// 关键词类型常量
const KEYWORD_TYPES = {
  SCENIC: 'scenic',
  FOOD: 'food',
  CULTURE: 'culture',
  ACTIVITY: 'activity',
  TRAVEL: 'travel',
}

// 工具函数
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

// const getCategoryDescription = (type: string) => {
//   const descriptions: Record<string, string> = {
//     [KEYWORD_TYPES.SCENIC]: '推荐景点、名胜古迹、自然风光等相关关键词',
//     [KEYWORD_TYPES.FOOD]: '特色美食、地方小吃、特产商品等相关关键词',
//     [KEYWORD_TYPES.CULTURE]: '历史文化、传统艺术、民俗风情等相关关键词',
//     [KEYWORD_TYPES.ACTIVITY]: '体验活动、娱乐项目、休闲运动等相关关键词',
//     [KEYWORD_TYPES.TRAVEL]: '交通出行、住宿指南、旅游攻略等相关关键词',
//   }
//   return descriptions[type] || '其他类型关键词'
// }

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

interface KeywordInfo {
  keyword: string
  type: string
  category: string
  relatedKeywords: string[]
}

// Props接口
interface Props {
  modelValue?: KeywordConfig
}

// Emits接口
interface Emits {
  (e: 'update:modelValue', value: KeywordConfig): void
}

// 响应式数据
const selectedCategory = ref('all')
const activeContentTab = ref('management')
const activeManagementTab = ref('system')
const searchQuery = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)

// 关键词选择状态
const selectedKeywords = ref<Set<string>>(new Set())

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

// 编辑分类
const editCategoryVisible = ref(false)
const editCategoryForm = reactive({
  id: '',
  name: '',
  color: 'blue',
  description: '',
})

// 添加系统关键词
const addSystemKeywordVisible = ref(false)
const addSystemKeywordForm = reactive({
  text: '',
  category: '',
})

// 配置数据的计算属性
const keywordConfig = computed({
  get: () => props.modelValue || {
    customKeywords: [],
    customCategories: [],
    enabledSystemCategories: ['scenic', 'food', 'culture', 'activity', 'travel'],
    systemKeywords: {
      scenic: ['龙门石窟', '少林寺', '白马寺', '清明上河园', '开封府', '云台山', '老君山', '嵩山'],
      food: ['胡辣汤', '烩面', '水席', '道口烧鸡', '开封灌汤包', '安阳血糕', '信阳毛尖'],
      culture: ['中原文化', '河洛文化', '黄河文明', '汉字文化', '武术文化', '佛教文化'],
      activity: ['登山', '徒步', '摄影', '赏花', '泡温泉', '漂流', '滑雪', '采摘'],
      travel: ['高铁', '飞机', '自驾', '包车', '公交', '地铁', '出租车', '共享单车'],
    },
    hotKeywords: ['龙门石窟', '少林寺', '清明上河园', '云台山'],
    hotKeywordsConfig: {
      autoGenerate: true,
      maxCount: 8,
      updateInterval: 'weekly',
    },
    seasonalKeywords: {
      spring: ['牡丹花', '樱花', '踏青'],
      summer: ['云台山', '漂流', '避暑'],
      autumn: ['老君山', '红叶', '登高'],
      winter: ['温泉', '雪景', '室内景点'],
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
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// 便捷访问属性
const customKeywords = computed({
  get: () => keywordConfig.value.customKeywords,
  set: (value) => {
    keywordConfig.value = { ...keywordConfig.value, customKeywords: value }
  },
})

const customCategories = computed({
  get: () => keywordConfig.value.customCategories,
  set: (value) => {
    keywordConfig.value = { ...keywordConfig.value, customCategories: value }
  },
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

  for (const [type, keywords] of Object.entries(keywordConfig.value.systemKeywords)) {
    stats[type] = {
      count: keywords.length,
      typeName: getTypeName(type),
    }
    totalCount += keywords.length
  }

  return {
    ...stats,
    totalCount: totalCount + customKeywords.value.length,
    typeCount: Object.keys(keywordConfig.value.systemKeywords).length,
  }
})

const filteredSystemKeywords = computed(() => {
  let filtered = { ...keywordConfig.value.systemKeywords }

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = { [selectedCategory.value]: keywordConfig.value.systemKeywords[selectedCategory.value] || [] }
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

// 热门推荐显示选中的关键词
const hotKeywords = computed({
  get: () => {
    // 只显示用户选中的关键词
    return Array.from(selectedKeywords.value)
  },
  set: (value) => {
    // 更新选中的关键词集合
    selectedKeywords.value = new Set(value)
    // 同时更新配置中的热门关键词
    keywordConfig.value = { ...keywordConfig.value, hotKeywords: value }
  },
})

const seasonalKeywords = computed(() => {
  const seasonalKeywordsByMonth = keywordConfig.value.seasonalKeywords || {}

  const month = selectedMonth.value
  let season = 'spring'
  if (month >= 6 && month <= 8) season = 'summer'
  else if (month >= 9 && month <= 11) season = 'autumn'
  else if (month === 12 || month <= 2) season = 'winter'

  return seasonalKeywordsByMonth[season] || []
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

// 其他工具方法

const getRandomKeywords = (type: string, count = 3) => {
  const typeKeywords = keywordConfig.value.systemKeywords[type] || []
  const shuffled = typeKeywords.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 获取分类下的关键词数量
const getCategoryKeywordCount = (categoryId: string) => {
  return customKeywords.value.filter((keyword) => keyword.category === categoryId).length
}

// 获取分类下的所有关键词
const getCategoryKeywords = (categoryId: string) => {
  return customKeywords.value.filter((keyword) => keyword.category === categoryId)
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
  for (const [type, keywords] of Object.entries(keywordConfig.value.systemKeywords)) {
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

// 更新热门推荐中的关键词
const updateHotKeywords = () => {
  const selectedArray = Array.from(selectedKeywords.value)
  // 更新配置中的热门关键词为选中的关键词
  keywordConfig.value = { ...keywordConfig.value, hotKeywords: selectedArray }
}

// 关键词选择状态切换
const toggleKeywordSelection = (keyword: string) => {
  if (selectedKeywords.value.has(keyword)) {
    selectedKeywords.value.delete(keyword)
  } else {
    selectedKeywords.value.add(keyword)
  }
  // 立即更新热门推荐中的关键词
  updateHotKeywords()
}

// 关键词是否选中
const isKeywordSelected = (keyword: string) => {
  return selectedKeywords.value.has(keyword)
}

const handleKeywordClick = (keyword: string) => {
  toggleKeywordSelection(keyword)
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

// 自定义分类管理方法
const handleEditCategory = (category: CustomCategory) => {
  editCategoryForm.id = category.id
  editCategoryForm.name = category.name
  editCategoryForm.color = category.color
  editCategoryForm.description = category.description || ''
  editCategoryVisible.value = true
}

const handleEditCategoryConfirm = () => {
  if (!editCategoryForm.name.trim()) {
    Message.error('请输入分类名称')
    return
  }

  // 检查名称是否与其他分类重复
  const exists = customCategories.value.some((cat) =>
    cat.id !== editCategoryForm.id && cat.name === editCategoryForm.name.trim(),
  )
  if (exists) {
    Message.error('分类名称已存在')
    return
  }

  // 更新分类
  const categoryIndex = customCategories.value.findIndex((cat) => cat.id === editCategoryForm.id)
  if (categoryIndex !== -1) {
    customCategories.value[categoryIndex] = {
      id: editCategoryForm.id,
      name: editCategoryForm.name.trim(),
      color: editCategoryForm.color,
      description: editCategoryForm.description.trim(),
    }
    Message.success('分类编辑成功')
    editCategoryVisible.value = false
  }
}

const handleDeleteCategory = (categoryId: string) => {
  // 删除分类
  const categoryIndex = customCategories.value.findIndex((cat) => cat.id === categoryId)
  if (categoryIndex !== -1) {
    customCategories.value.splice(categoryIndex, 1)
  }

  // 删除该分类下的所有关键词
  for (let i = customKeywords.value.length - 1; i >= 0; i--) {
    if (customKeywords.value[i].category === categoryId) {
      customKeywords.value.splice(i, 1)
    }
  }

  Message.success('分类删除成功')
}

const handleAddCustomKeyword = (categoryId: string) => {
  addKeywordForm.category = categoryId
  addKeywordForm.text = ''
  addKeywordForm.description = ''
  addKeywordVisible.value = true
}

// 系统关键词管理方法
const handleAddSystemKeyword = (categoryId: string) => {
  addSystemKeywordForm.category = categoryId
  addSystemKeywordForm.text = ''
  addSystemKeywordVisible.value = true
}

const handleAddSystemKeywordConfirm = () => {
  if (!addSystemKeywordForm.text.trim()) {
    Message.error('请输入关键词内容')
    return
  }

  const categoryId = addSystemKeywordForm.category
  const newKeyword = addSystemKeywordForm.text.trim()

  // 检查是否已存在
  if (keywordConfig.value.systemKeywords[categoryId]?.includes(newKeyword)) {
    Message.error('该关键词已存在')
    return
  }

  // 添加关键词到配置
  const updatedConfig = { ...keywordConfig.value }
  if (!updatedConfig.systemKeywords[categoryId]) {
    updatedConfig.systemKeywords[categoryId] = []
  }
  updatedConfig.systemKeywords[categoryId].push(newKeyword)

  keywordConfig.value = updatedConfig
  addSystemKeywordVisible.value = false
  Message.success('关键词添加成功')
}

const handleRemoveSystemKeyword = (categoryId: string, index: number) => {
  const updatedConfig = { ...keywordConfig.value }
  updatedConfig.systemKeywords[categoryId].splice(index, 1)
  keywordConfig.value = updatedConfig
  Message.success('关键词删除成功')
}

// 导入导出功能（暂时注释，如需要可以取消注释）
// const handleExportKeywords = () => {
//   const config = {
//     version: '1.0',
//     timestamp: new Date().toISOString(),
//     keywordConfig: keywordConfig.value,
//   }

//   const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = `keyword-config-${new Date().toISOString().slice(0, 10)}.json`
//   document.body.appendChild(a)
//   a.click()
//   document.body.removeChild(a)
//   URL.revokeObjectURL(url)

//   Message.success('配置导出成功')
// }

// const handleImportKeywords = () => {
//   const input = document.createElement('input')
//   input.type = 'file'
//   input.accept = '.json'

//   input.onchange = (event) => {
//     const file = (event.target as HTMLInputElement).files?.[0]
//     if (!file) return

//     const reader = new FileReader()
//     reader.onload = (e) => {
//       try {
//         const config = JSON.parse(e.target?.result as string)
//         if (config.keywordConfig) {
//           keywordConfig.value = config.keywordConfig
//           Message.success('配置导入成功')
//         } else {
//           Message.error('配置文件格式错误')
//         }
//       } catch (error) {
//         Message.error('配置文件解析失败')
//       }
//     }
//     reader.readAsText(file)
//   }

//   input.click()
// }

const handleResetToDefault = () => {
  const defaultConfig = {
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

  keywordConfig.value = defaultConfig
  Message.success('已重置为默认配置')
}

// 生成基于用户输入的回退关键词
const generateFallbackKeywords = (userInput = '') => {
  const keywords = []
  const input = userInput.toLowerCase()

  // 基于用户输入内容智能推荐关键词
  if (input.includes('景点') || input.includes('旅游') || input.includes('游玩') || input.includes('参观')) {
    keywords.push(...getRandomKeywords('scenic', 3))
  }

  if (input.includes('美食') || input.includes('吃') || input.includes('小吃') || input.includes('特产')) {
    keywords.push(...getRandomKeywords('food', 3))
  }

  if (input.includes('文化') || input.includes('历史') || input.includes('传统') || input.includes('民俗')) {
    keywords.push(...getRandomKeywords('culture', 3))
  }

  if (input.includes('活动') || input.includes('体验') || input.includes('娱乐')) {
    keywords.push(...getRandomKeywords('activity', 3))
  }

  if (input.includes('交通') || input.includes('路线') || input.includes('怎么去') || input.includes('住宿')) {
    keywords.push(...getRandomKeywords('travel', 3))
  }

  // 如果没有匹配到特定类别，提供综合推荐
  if (keywords.length === 0) {
    keywords.push(
      ...getRandomKeywords('scenic', 2),
      ...getRandomKeywords('food', 2),
      ...getRandomKeywords('culture', 1),
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
            position: relative;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &.selected {
              &::after {
                content: '推荐';
                position: absolute;
                right: 1px;
                background: rgb(var(--red-6));
                color: white;
                font-size: 8px;
                padding: 2px 3px;
                border-radius: 4px;
                line-height: 1;
                z-index: 10;
              }
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

// 关键词库管理样式
.keywords-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;

  .sub-tabs-wrapper {
    margin-bottom: 16px;

    .management-tabs {
      :deep(.arco-tabs-tab) {
        font-size: 13px;
        padding: 8px 16px;
      }
    }
  }

  .management-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    background: linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-fill-1) 100%);
    border-radius: 12px;
    border: 1px solid var(--color-border-2);

    .toolbar-section {
      flex: 1;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-1);

        .title-icon {
          color: rgb(var(--primary-6));
        }
      }

      .section-description {
        margin: 0;
        font-size: 13px;
        color: var(--color-text-3);
        line-height: 1.5;
      }
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
  }

  .system-keywords-management {
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

        .category-actions {
          margin-left: auto;

          .add-keyword-btn {
            color: rgb(var(--primary-6));
            border-color: transparent;

            &:hover {
              background: rgba(var(--primary-1), 0.8);
              border-color: rgba(var(--primary-6), 0.2);
            }
          }
        }
      }

      .keyword-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .empty-keywords {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--color-fill-1);
          border: 1px dashed var(--color-border-3);
          border-radius: 8px;
          width: 100%;

          .empty-text {
            color: var(--color-text-3);
            font-size: 13px;
          }
        }

        .keyword-tag {
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          &.editable {
            position: relative;

            .copy-icon {
              margin-left: 4px;
              cursor: pointer;
              opacity: 0.6;

              &:hover {
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }

  // 自定义分类管理样式
  .custom-categories-management {
    flex: 1;
    overflow-y: auto;

    .empty-categories {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;

      .empty-content {
        text-align: center;
        color: var(--color-text-3);

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: var(--color-text-4);
        }

        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-2);
        }

        p {
          margin: 0 0 20px 0;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }

    .custom-categories-list {
      .custom-category-item {
        margin-bottom: 20px;

        .category-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-1);

          .category-color-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .category-name {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-1);
          }

          .category-actions {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 8px;

            .add-keyword-btn {
              color: rgb(var(--primary-6));
              border-color: transparent;

              &:hover {
                background: rgba(var(--primary-1), 0.8);
                border-color: rgba(var(--primary-6), 0.2);
              }
            }
          }
        }

        .keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .empty-keywords {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: var(--color-fill-1);
            border: 1px dashed var(--color-border-3);
            border-radius: 8px;
            width: 100%;

            .empty-text {
              color: var(--color-text-3);
              font-size: 13px;
            }
          }

          .keyword-tag {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &.editable {
              position: relative;

              .copy-icon {
                margin-left: 4px;
                cursor: pointer;
                opacity: 0.6;

                &:hover {
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
  }
}

  .add-system-keyword-form {
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

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
