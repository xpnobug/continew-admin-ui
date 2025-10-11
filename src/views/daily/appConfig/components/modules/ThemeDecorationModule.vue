<template>
  <a-space direction="vertical" fill :size="16">
    <!-- 主题配置 -->
    <a-card :bordered="true" size="small" title="主题配置">
      <template #extra>
        <a-button type="primary" size="mini" @click="addTheme">
          <icon-plus /> 新增主题
        </a-button>
      </template>

      <a-table :data="model.themes" :pagination="false" :bordered="{ cell: true }">
        <template #columns>
          <a-table-column title="主题ID" data-index="id" :width="120" />
          <a-table-column title="主题名称" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.name" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="访问类型" data-index="accessType" :width="110">
            <template #cell="{ record }">
              <a-select v-model="record.accessType" size="small" style="width: 100%">
                <a-option value="free">免费</a-option>
                <a-option value="paid">付费</a-option>
                <a-option value="vip">会员专享</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="解锁价格" data-index="unlockPrice" :width="110">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.unlockPrice"
                :min="0"
                :step="10"
                size="small"
                style="width: 100%"
                :disabled="record.accessType === 'free'"
              />
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sortOrder" :width="80">
            <template #cell="{ record }">
              <a-input-number v-model="record.sortOrder" :min="0" size="small" style="width: 100%" />
            </template>
          </a-table-column>
          <a-table-column title="默认主题" data-index="isDefault" :width="90">
            <template #cell="{ record }">
              <a-switch v-model="record.isDefault" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record, rowIndex }">
              <a-space>
                <a-button type="text" size="mini" @click="editTheme(record)">
                  <icon-edit /> 编辑
                </a-button>
                <a-popconfirm content="确定删除该主题吗?" @ok="deleteTheme(rowIndex)">
                  <a-button type="text" status="danger" size="mini">
                    <icon-delete /> 删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 头像配置 -->
    <a-card :bordered="true" size="small" title="头像配置">
      <template #extra>
        <a-button type="primary" size="mini" @click="addAvatar">
          <icon-plus /> 新增头像
        </a-button>
      </template>

      <a-table :data="model.avatars" :pagination="false" :bordered="{ cell: true }">
        <template #columns>
          <a-table-column title="头像ID" data-index="id" :width="140" />
          <a-table-column title="头像图片" data-index="avatarPath" :width="120">
            <template #cell="{ record }">
              <a-image :src="record.avatarPath" width="50" height="50" />
            </template>
          </a-table-column>
          <a-table-column title="头像路径" data-index="avatarPath" :width="300">
            <template #cell="{ record }">
              <a-input v-model="record.avatarPath" size="small" readonly>
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectAvatarImage(record)">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
            </template>
          </a-table-column>
          <a-table-column title="头像名称" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.name" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="访问类型" data-index="accessType" :width="110">
            <template #cell="{ record }">
              <a-select v-model="record.accessType" size="small" style="width: 100%">
                <a-option value="free">免费</a-option>
                <a-option value="paid">付费</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="解锁价格" data-index="unlockPrice" :width="110">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.unlockPrice"
                :min="0"
                :step="10"
                size="small"
                style="width: 100%"
                :disabled="record.accessType === 'free'"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ rowIndex }">
              <a-popconfirm content="确定删除该头像吗?" @ok="deleteAvatar(rowIndex)">
                <a-button type="text" status="danger" size="mini">
                  <icon-delete /> 删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 颜色配置 -->
    <a-card :bordered="true" size="small" title="颜色配置">
      <a-space direction="vertical" fill :size="12">
        <div v-for="(config, configIndex) in model.colorConfigs" :key="configIndex">
          <a-divider v-if="configIndex > 0" />
          <a-row :gutter="12">
            <a-col :span="4">
              <a-space align="center">
                <span class="lbl">配置类型</span>
                <a-input v-model="config.type" disabled size="small" />
              </a-space>
            </a-col>
            <a-col :span="4">
              <a-space align="center">
                <span class="lbl">配置标题</span>
                <a-input v-model="config.title" size="small" />
              </a-space>
            </a-col>
            <a-col :span="16">
              <a-space align="center">
                <span class="lbl">颜色选项</span>
                <a-button type="primary" size="mini" @click="addColorOption(configIndex)">
                  <icon-plus /> 新增颜色
                </a-button>
              </a-space>
            </a-col>
          </a-row>

          <!-- 颜色选项列表 -->
          <a-row :gutter="12" style="margin-top: 12px">
            <a-col :span="24">
              <a-space wrap>
                <div
                  v-for="(color, colorIndex) in config.colors"
                  :key="colorIndex"
                  class="color-option-item"
                >
                  <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
                  <a-input
                    v-model="color.label"
                    placeholder="颜色标签"
                    size="small"
                    style="width: 80px; margin: 0 4px;"
                  />
                  <a-input
                    v-model="color.value"
                    placeholder="颜色值"
                    size="small"
                    style="width: 140px; margin: 0 4px;"
                  >
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: color.value || '#ccc', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" :popup-visible="colorPickerVisible[`${configIndex}-${colorIndex}`]" @update:popup-visible="(v) => updateColorPickerVisible(`${configIndex}-${colorIndex}`, v)">
                        <template #content>
                          <ColorPicker theme="light" :color="color.value || '#FFFFFF'" :sucker-hide="true" @change-color="(c) => onPickColorOption(c, config, colorIndex)" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                  <a-button
                    type="text"
                    status="danger"
                    size="mini"
                    @click="deleteColorOption(configIndex, colorIndex)"
                  >
                    <icon-delete />
                  </a-button>
                </div>
              </a-space>
            </a-col>
          </a-row>
        </div>
      </a-space>
    </a-card>

    <!-- 主题编辑弹窗 -->
    <a-modal
      v-model:visible="themeModalVisible"
      title="编辑主题详情"
      width="900px"
      @ok="saveThemeEdit"
      @cancel="cancelThemeEdit"
    >
      <a-form :model="editingTheme" layout="vertical" v-if="editingTheme">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="主题ID" required>
              <a-input v-model="editingTheme.id" :disabled="!isNewTheme" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="主题名称" required>
              <a-input v-model="editingTheme.name" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="主题描述">
              <a-textarea v-model="editingTheme.description" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="首页背景图">
              <a-input v-model="editingTheme.homeBgImage" readonly>
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectThemeImage('homeBgImage')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="个人中心背景图">
              <a-input v-model="editingTheme.mineBgImage" readonly>
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectThemeImage('mineBgImage')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 颜色配置 -->
        <a-divider>颜色配置</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="经期颜色">
              <a-input v-model="editingTheme.colors.period">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.period, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.period">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.colors.period || '#FF8FAE'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'period')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="预测经期颜色">
              <a-input v-model="editingTheme.colors.predicted">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.predicted, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.predicted">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.colors.predicted || '#FCBED5'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'predicted')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="排卵期颜色">
              <a-input v-model="editingTheme.colors.ovulation">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.ovulation, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.ovulation">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.colors.ovulation || '#B09CFF'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'ovulation')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="排卵日颜色">
              <a-input v-model="editingTheme.colors.ovulationDay">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.ovulationDay, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.ovulationDay">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.colors.ovulationDay || '#FFC400'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'ovulationDay')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="选中日期颜色">
              <a-input v-model="editingTheme.colors.selected">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.selected, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.selected">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.colors.selected || '#FF8FAE'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'selected')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 背景色配置 -->
        <a-divider>背景色配置</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="日历背景色">
              <a-input v-model="editingTheme.calendarBg">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.calendarBg, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.calendarBg">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.calendarBg || '#fff'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'calendarBg')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="个人中心背景色">
              <a-input v-model="editingTheme.mineBgColor">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.mineBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.mineBgColor">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.mineBgColor || '#F5F5F5'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'mineBgColor')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="头部背景色">
              <a-input v-model="editingTheme.headerBgColor">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.headerBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.headerBgColor">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.headerBgColor || '#fff'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'headerBgColor')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="AI聊天背景色">
              <a-input v-model="editingTheme.aiChatBgColor">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.aiChatBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.aiChatBgColor">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.aiChatBgColor || '#ffecf3'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'aiChatBgColor')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="记录边框颜色">
              <a-input v-model="editingTheme.recordBorderColor">
                <template #prefix>
                  <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.recordBorderColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                </template>
                <template #suffix>
                  <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.recordBorderColor">
                    <template #content>
                      <ColorPicker theme="light" :color="editingTheme.recordBorderColor || '#fcbed5'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'recordBorderColor')" />
                    </template>
                    <a-button type="text" size="mini">取色</a-button>
                  </a-popover>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 文件选择器 -->
    <FileSelector
      v-model="fileSelectorVisible"
      :title="fileSelectorTitle"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onFileSelected"
      @cancel="fileSelectorVisible = false"
    />
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'themeDecoration',
  title: '主题装扮',
  path: ['themeDecoration'],
  defaultValue: {
    themes: [],
    avatars: [],
    colorConfigs: []
  },
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

const localValue = ref<Record<string, any>>(deepClone(props.value || {}))
const syncingFromParent = ref(false)

watch(
  () => props.value,
  (v) => {
    syncingFromParent.value = true
    localValue.value = deepClone(v || {})
  },
  { deep: true }
)

watch(
  () => localValue.value,
  (v) => {
    if (syncingFromParent.value) {
      syncingFromParent.value = false
      return
    }
    props.apply(deepClone(v))
  },
  { deep: true }
)

const model = computed(() => localValue.value)

// 主题编辑
const themeModalVisible = ref(false)
const editingTheme = ref<any>(null)
const editingThemeIndex = ref(-1)
const isNewTheme = ref(false)

// 文件选择器
const fileSelectorVisible = ref(false)
const fileSelectorTitle = ref('选择文件')
const currentFileField = ref('')
const currentAvatarRecord = ref<any>(null)

// 颜色选择器状态
const colorPickerVisible = ref<Record<string, boolean>>({})
const themeColorPicker = ref({
  period: false,
  predicted: false,
  ovulation: false,
  ovulationDay: false,
  selected: false
})
const themeBgColorPicker = ref({
  calendarBg: false,
  mineBgColor: false,
  headerBgColor: false,
  aiChatBgColor: false,
  recordBorderColor: false
})

interface ColorObj { hex: string }

// 更新颜色选择器显示状态
const updateColorPickerVisible = (key: string, visible: boolean) => {
  colorPickerVisible.value[key] = visible
}

// 颜色配置取色回调
const onPickColorOption = (c: ColorObj, config: any, optionIndex: number) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) {
    config.colors[optionIndex].value = c.hex
  }
}

// 主题颜色取色回调
const onPickThemeColor = (c: ColorObj, colorKey: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex) && editingTheme.value) {
    editingTheme.value.colors[colorKey] = c.hex
  }
}

// 主题背景色取色回调
const onPickThemeBgColor = (c: ColorObj, bgKey: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex) && editingTheme.value) {
    editingTheme.value[bgKey] = c.hex
  }
}

// 新增主题
const addTheme = () => {
  isNewTheme.value = true
  editingThemeIndex.value = -1
  editingTheme.value = {
    id: '',
    name: '',
    description: '',
    accessType: 'free',
    isDefault: false,
    unlockPrice: 0,
    sortOrder: model.value.themes.length,
    homeBgImage: '',
    mineBgImage: '',
    images: [],
    colors: {
      period: '#FF8FAE',
      predicted: '#FCBED5',
      ovulation: '#B09CFF',
      ovulationDay: '#FFC400',
      selected: '#FF8FAE'
    },
    tabbarBgColor: {
      home: '#fff',
      find: '#fff',
      aiChat: '#fff',
      mine: '#fff'
    },
    calendarBg: '#fff',
    recordBorderColor: '#fcbed5',
    mineBgColor: '#F5F5F5',
    headerBgColor: '#fff',
    aiChatBgColor: '#ffecf3',
    tabIcons: {
      home: { normal: '', active: '' },
      find: { normal: '', active: '' },
      aiChat: { normal: '', active: '' },
      mine: { normal: '', active: '' }
    }
  }
  themeModalVisible.value = true
}

// 编辑主题
const editTheme = (record: any) => {
  isNewTheme.value = false
  editingThemeIndex.value = model.value.themes.findIndex((t: any) => t.id === record.id)
  editingTheme.value = deepClone(record)
  themeModalVisible.value = true
}

// 保存主题编辑
const saveThemeEdit = () => {
  if (!editingTheme.value.id || !editingTheme.value.name) {
    Message.warning('请填写主题ID和名称')
    return
  }

  if (isNewTheme.value) {
    // 检查ID是否重复
    const exists = model.value.themes.some((t: any) => t.id === editingTheme.value.id)
    if (exists) {
      Message.warning('主题ID已存在')
      return
    }
    model.value.themes.push(deepClone(editingTheme.value))
  } else {
    model.value.themes[editingThemeIndex.value] = deepClone(editingTheme.value)
  }

  themeModalVisible.value = false
  Message.success('保存成功')
}

// 取消主题编辑
const cancelThemeEdit = () => {
  themeModalVisible.value = false
  editingTheme.value = null
}

// 删除主题
const deleteTheme = (index: number) => {
  model.value.themes.splice(index, 1)
  Message.success('删除成功')
}

// 新增头像
const addAvatar = () => {
  model.value.avatars.push({
    id: 'avatar-' + Date.now(),
    avatarPath: '',
    name: '',
    unlockPrice: 20,
    accessType: 'paid'
  })
}

// 删除头像
const deleteAvatar = (index: number) => {
  model.value.avatars.splice(index, 1)
  Message.success('删除成功')
}

// 选择头像图片
const selectAvatarImage = (record: any) => {
  currentAvatarRecord.value = record
  currentFileField.value = 'avatar'
  fileSelectorTitle.value = '选择头像图片'
  fileSelectorVisible.value = true
}

// 选择主题图片
const selectThemeImage = (field: string) => {
  currentFileField.value = field
  fileSelectorTitle.value = '选择主题图片'
  fileSelectorVisible.value = true
}

// 文件选择回调
const onFileSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    const url = (file as any).url

    if (currentFileField.value === 'avatar' && currentAvatarRecord.value) {
      currentAvatarRecord.value.avatarPath = url
    } else if (editingTheme.value && currentFileField.value) {
      editingTheme.value[currentFileField.value] = url
    }
  }
  fileSelectorVisible.value = false
}

// 新增颜色选项
const addColorOption = (configIndex: number) => {
  model.value.colorConfigs[configIndex].colors.push({
    value: '#FFFFFF',
    label: '新颜色'
  })
}

// 删除颜色选项
const deleteColorOption = (configIndex: number, colorIndex: number) => {
  model.value.colorConfigs[configIndex].colors.splice(colorIndex, 1)
}
</script>

<style scoped>
.lbl {
  color: var(--color-text-2);
  min-width: 80px;
  display: inline-block;
}

.color-option-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin: 4px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  margin-right: 8px;
}
</style>
