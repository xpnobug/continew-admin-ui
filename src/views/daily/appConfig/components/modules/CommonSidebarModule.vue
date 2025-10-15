<template>
  <a-space direction="vertical" fill :size="16">
    <a-card :bordered="true" size="small" title="常用设置项配置">
      <template #extra>
        <a-space>
          <a-button type="outline" size="mini" @click="resetToDefault">
            <icon-refresh /> 恢复默认
          </a-button>
          <a-button type="primary" size="mini" @click="addSettingItem">
            <icon-plus /> 新增设置项
          </a-button>
        </a-space>
      </template>

      <a-space direction="vertical" fill :size="16">
        <div v-for="(group, groupIndex) in model.groups" :key="groupIndex" class="settings-group">
          <div class="group-header">
            <span class="group-title">设置项分组 {{ groupIndex + 1 }}</span>
            <a-space>
              <a-button type="text" size="mini" @click="addItemToGroup(groupIndex)">
                <icon-plus /> 添加项
              </a-button>
              <a-button type="text" status="danger" size="mini" @click="deleteGroup(groupIndex)">
                <icon-delete /> 删除分组
              </a-button>
            </a-space>
          </div>

          <div class="items-container">
            <div v-for="(item, itemIndex) in group.items" :key="itemIndex" class="setting-item-card">
              <div class="item-header">
                <a-checkbox v-model="item.enabled">
                  <span class="item-title">{{ item.label || '未命名设置项' }}</span>
                </a-checkbox>
                <a-space>
                  <a-button type="text" size="mini" @click="editSettingItem(groupIndex, itemIndex)">
                    <icon-edit />
                  </a-button>
                  <a-button type="text" status="danger" size="mini" @click="deleteItem(groupIndex, itemIndex)">
                    <icon-delete />
                  </a-button>
                </a-space>
              </div>

              <div class="item-content">
                <a-row :gutter="12">
                  <a-col :span="4">
                    <div class="item-preview">
                      <img v-if="item.imageUrl" :src="item.imageUrl" class="item-icon" alt="icon" />
                      <icon-image v-else class="item-icon-placeholder" />
                      <span class="item-type-badge">{{ getTypeLabel(item.type) }}</span>
                    </div>
                  </a-col>
                  <a-col :span="20">
                    <a-descriptions :column="3" size="small" bordered>
                      <a-descriptions-item label="标识Key">{{ item.key }}</a-descriptions-item>
                      <a-descriptions-item label="显示文本">{{ item.label }}</a-descriptions-item>
                      <a-descriptions-item label="类型">{{ getTypeLabel(item.type) }}</a-descriptions-item>
                      <a-descriptions-item v-if="item.type === 'permission' || item.type === 'permission-switch'" label="权限类型">
                        {{ getPermissionLabel(item.permissionType) }}
                      </a-descriptions-item>
                      <a-descriptions-item v-if="item.type === 'picker' && item.pickerConfig" label="选项范围">
                        {{ item.pickerConfig.min }}-{{ item.pickerConfig.max }}{{ item.pickerConfig.unit }}
                      </a-descriptions-item>
                      <a-descriptions-item v-if="item.type === 'picker' && item.pickerConfig" label="默认值">
                        {{ item.pickerConfig.defaultValue }}{{ item.pickerConfig.unit }}
                      </a-descriptions-item>
                    </a-descriptions>
                  </a-col>
                </a-row>
              </div>
            </div>

            <a-empty v-if="!group.items || group.items.length === 0" description="暂无设置项" />
          </div>
        </div>

        <a-button type="dashed" long @click="addGroup">
          <icon-plus /> 添加新分组
        </a-button>
      </a-space>
    </a-card>

    <a-modal
      v-model:visible="editModalVisible"
      :title="isNewItem ? '新增设置项' : '编辑设置项'"
      width="800px"
      @ok="saveSettingItem"
      @cancel="cancelEdit"
    >
      <a-form :model="editingItem" layout="vertical" v-if="editingItem">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="标识Key" required>
              <a-input v-model="editingItem.key" placeholder="如: periodLength" :disabled="!isNewItem" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示文本" required>
              <a-input v-model="editingItem.label" placeholder="如: 经期天数" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设置项类型" required>
              <a-select v-model="editingItem.type" placeholder="选择类型" @change="onTypeChange">
                <a-option value="picker">选择器</a-option>
                <a-option value="switch">开关</a-option>
                <a-option value="click">点击跳转</a-option>
                <a-option value="permission">权限跳转</a-option>
                <a-option value="permission-switch">权限开关</a-option>
                <a-option value="value">纯展示值</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="图标地址">
              <a-input v-model="editingItem.imageUrl" readonly>
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectIcon">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <a-image v-if="editingItem.imageUrl" :src="editingItem.imageUrl" width="60" height="60" style="margin-top: 8px;" fit="contain" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row v-if="editingItem.type === 'permission' || editingItem.type === 'permission-switch'" :gutter="16">
          <a-col :span="12">
            <a-form-item label="权限类型" required>
              <a-select v-model="editingItem.permissionType" placeholder="选择权限类型">
                <a-option value="professional">专业版</a-option>
                <a-option value="vip">VIP会员</a-option>
                <a-option value="credits">积分</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-card v-if="editingItem.type === 'picker'" title="选择器配置" size="small" style="margin-top: 16px;">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="最小值" required>
                <a-input-number v-model="editingItem.pickerConfig.min" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最大值" required>
                <a-input-number v-model="editingItem.pickerConfig.max" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="单位">
                <a-input v-model="editingItem.pickerConfig.unit" placeholder="如: 天" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="默认值">
                <a-input-number v-model="editingItem.pickerConfig.defaultValue" :min="editingItem.pickerConfig.min" :max="editingItem.pickerConfig.max" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card v-if="editingItem.type === 'switch' || editingItem.type === 'permission-switch'" title="开关配置" size="small" style="margin-top: 16px;">
          <a-form-item label="默认开启">
            <a-switch v-model="editingItem.switchConfig.defaultValue" />
          </a-form-item>
        </a-card>

        <a-card v-if="editingItem.type === 'click' || editingItem.type === 'permission'" title="跳转配置" size="small" style="margin-top: 16px;">
          <a-form-item label="跳转路径">
            <a-input v-model="editingItem.clickConfig.navigateTo" placeholder="如: /otherPages/themes/index" />
          </a-form-item>
        </a-card>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="是否启用">
              <a-switch v-model="editingItem.enabled" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="editingItem.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <FileSelector
      v-model="fileSelectorVisible"
      title="选择图标"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onIconSelected"
      @cancel="fileSelectorVisible = false"
    />
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'commonSidebar',
  title: '常用设置',
  path: ['commonSidebar'],
  defaultValue: {
    groups: [
      {
        items: [
          {
            type: 'picker',
            key: 'periodLength',
            label: '经期天数',
            imageUrl: '/static/images/icon_period.png',
            enabled: true,
            sortOrder: 0,
            pickerConfig: {
              min: 1,
              max: 10,
              unit: '天',
              defaultValue: 5
            }
          },
          {
            type: 'picker',
            key: 'cycleLength',
            label: '周期天数',
            imageUrl: '/static/images/icon_cycle.png',
            enabled: true,
            sortOrder: 1,
            pickerConfig: {
              min: 20,
              max: 45,
              unit: '天',
              defaultValue: 28
            }
          },
          {
            type: 'switch',
            key: 'teenMode',
            label: '未成年模式',
            imageUrl: '/static/images/icon_adult.png',
            enabled: true,
            sortOrder: 2,
            switchConfig: {
              defaultValue: false
            }
          }
        ]
      },
      {
        items: [
          {
            type: 'click',
            key: 'theme',
            label: '主题装扮',
            imageUrl: '/static/images/icon_theme.png',
            enabled: true,
            sortOrder: 0,
            clickConfig: {
              navigateTo: '/otherPages/themes/index'
            }
          }
        ]
      },
      {
        items: [
          {
            type: 'click',
            key: 'addUser',
            label: '添加多人数据',
            imageUrl: '/static/images/icon_record.png',
            enabled: true,
            sortOrder: 0,
            clickConfig: {
              navigateTo: '/otherPages/periodSetting/index'
            }
          },
          {
            type: 'permission',
            key: 'shareData',
            label: '邀请好友共享数据',
            imageUrl: '/static/images/icon_invite.png',
            permissionType: 'professional',
            enabled: true,
            sortOrder: 1
          },
          {
            type: 'click',
            key: 'inviteCode',
            label: '输入好友邀请码',
            imageUrl: '/static/images/icon_invite_code.png',
            enabled: true,
            sortOrder: 2,
            clickConfig: {
              navigateTo: ''
            }
          }
        ]
      }
    ]
  },
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

const localValue = ref<Record<string, any>>(deepClone(props.value || meta.defaultValue))
const syncingFromParent = ref(false)

watch(
  () => props.value,
  (v) => {
    syncingFromParent.value = true
    localValue.value = deepClone(v || meta.defaultValue)
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

const ensureStructure = () => {
  if (!model.value.groups || !Array.isArray(model.value.groups)) {
    model.value.groups = meta.defaultValue.groups
  }

  model.value.groups.forEach((group: any) => {
    if (!group.items || !Array.isArray(group.items)) {
      group.items = []
    }
  })
}

ensureStructure()

const editModalVisible = ref(false)
const editingItem = ref<any>(null)
const editingGroupIndex = ref(-1)
const editingItemIndex = ref(-1)
const isNewItem = ref(false)

const fileSelectorVisible = ref(false)

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'picker': '选择器',
    'switch': '开关',
    'click': '点击跳转',
    'permission': '权限跳转',
    'permission-switch': '权限开关',
    'value': '展示值'
  }
  return labels[type] || type
}

const getPermissionLabel = (permissionType: string) => {
  const labels: Record<string, string> = {
    'professional': '专业版',
    'vip': 'VIP会员',
    'credits': '积分'
  }
  return labels[permissionType] || permissionType
}

const addGroup = () => {
  if (!model.value.groups) {
    model.value.groups = []
  }
  model.value.groups.push({
    items: []
  })
}

const deleteGroup = (groupIndex: number) => {
  model.value.groups.splice(groupIndex, 1)
  Message.success('删除成功')
}

const addItemToGroup = (groupIndex: number) => {
  editingGroupIndex.value = groupIndex
  editingItemIndex.value = -1
  isNewItem.value = true
  editingItem.value = {
    type: 'click',
    key: '',
    label: '',
    imageUrl: '',
    enabled: true,
    sortOrder: model.value.groups[groupIndex].items.length,
    pickerConfig: {
      min: 1,
      max: 10,
      unit: '天',
      defaultValue: 5
    },
    switchConfig: {
      defaultValue: false
    },
    clickConfig: {
      navigateTo: ''
    }
  }
  editModalVisible.value = true
}

const addSettingItem = () => {
  if (!model.value.groups || model.value.groups.length === 0) {
    addGroup()
  }
  addItemToGroup(0)
}

const editSettingItem = (groupIndex: number, itemIndex: number) => {
  editingGroupIndex.value = groupIndex
  editingItemIndex.value = itemIndex
  isNewItem.value = false
  editingItem.value = deepClone(model.value.groups[groupIndex].items[itemIndex])

  if (!editingItem.value.pickerConfig) {
    editingItem.value.pickerConfig = { min: 1, max: 10, unit: '天', defaultValue: 5 }
  }
  if (!editingItem.value.switchConfig) {
    editingItem.value.switchConfig = { defaultValue: false }
  }
  if (!editingItem.value.clickConfig) {
    editingItem.value.clickConfig = { navigateTo: '' }
  }

  editModalVisible.value = true
}

const deleteItem = (groupIndex: number, itemIndex: number) => {
  model.value.groups[groupIndex].items.splice(itemIndex, 1)
  Message.success('删除成功')
}

const onTypeChange = () => {
  if (editingItem.value.type !== 'picker') {
    delete editingItem.value.pickerConfig
  }
  if (editingItem.value.type !== 'switch' && editingItem.value.type !== 'permission-switch') {
    delete editingItem.value.switchConfig
  }
  if (editingItem.value.type !== 'click' && editingItem.value.type !== 'permission') {
    delete editingItem.value.clickConfig
  }
  if (editingItem.value.type !== 'permission' && editingItem.value.type !== 'permission-switch') {
    delete editingItem.value.permissionType
  }
}

const saveSettingItem = () => {
  if (!editingItem.value.key || !editingItem.value.label) {
    Message.warning('请填写标识Key和显示文本')
    return
  }

  if (isNewItem.value) {
    const exists = model.value.groups.some((group: any, gIndex: number) =>
      group.items.some((item: any, iIndex: number) =>
        item.key === editingItem.value.key && (gIndex !== editingGroupIndex.value || iIndex !== editingItemIndex.value)
      )
    )
    if (exists) {
      Message.warning('标识Key已存在')
      return
    }
  }

  const cleanedItem = { ...editingItem.value }
  if (cleanedItem.type !== 'picker') {
    delete cleanedItem.pickerConfig
  }
  if (cleanedItem.type !== 'switch' && cleanedItem.type !== 'permission-switch') {
    delete cleanedItem.switchConfig
  }
  if (cleanedItem.type !== 'click' && cleanedItem.type !== 'permission') {
    delete cleanedItem.clickConfig
  }
  if (cleanedItem.type !== 'permission' && cleanedItem.type !== 'permission-switch') {
    delete cleanedItem.permissionType
  }

  if (isNewItem.value) {
    model.value.groups[editingGroupIndex.value].items.push(cleanedItem)
  } else {
    model.value.groups[editingGroupIndex.value].items[editingItemIndex.value] = cleanedItem
  }

  editModalVisible.value = false
  Message.success('保存成功')
}

const cancelEdit = () => {
  editModalVisible.value = false
  editingItem.value = null
}

const selectIcon = () => {
  fileSelectorVisible.value = true
}

const onIconSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url && editingItem.value) {
    editingItem.value.imageUrl = (file as any).url
  }
  fileSelectorVisible.value = false
}

const resetToDefault = () => {
  localValue.value = deepClone(meta.defaultValue)
  Message.success('已恢复默认配置')
}
</script>

<style scoped>
.settings-group {
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  padding: 16px;
  background: var(--color-fill-1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-2);
}

.group-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-1);
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item-card {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 12px;
  transition: all 0.3s;
}

.setting-item-card:hover {
  border-color: rgb(var(--primary-6));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
}

.item-content {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-2);
}

.item-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.item-icon-placeholder {
  width: 48px;
  height: 48px;
  color: var(--color-text-4);
}

.item-type-badge {
  font-size: 12px;
  color: var(--color-text-3);
  padding: 2px 8px;
  background: var(--color-fill-2);
  border-radius: 2px;
}
</style>
