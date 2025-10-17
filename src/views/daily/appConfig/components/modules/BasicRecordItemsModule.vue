<template>
  <a-space direction="vertical" fill :size="16">
    <!-- 基础数据项配置 -->
    <a-card :bordered="true" size="small" title="基础数据项配置">
      <template #extra>
        <a-button type="outline" size="mini" @click="resetCategory('basicItems')">
          <icon-refresh /> 恢复默认
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data="model.basicItems || []"
        :pagination="false"
        :bordered="{ cell: true }"
        row-key="id"
      >
        <template #icon="{ record }">
          <a-image :src="record.icon" width="40" height="40" fit="contain" />
        </template>
        <template #enabled="{ record }">
          <a-switch v-model="record.enabled" />
        </template>
        <template #multiple="{ record }">
          <a-tag :color="record.multiple ? 'arcoblue' : 'gray'">
            {{ record.multiple ? '是' : '否' }}
          </a-tag>
        </template>
        <template #needTime="{ record }">
          <a-tag :color="record.needTime ? 'arcoblue' : 'gray'">
            {{ record.needTime ? '是' : '否' }}
          </a-tag>
        </template>
        <template #order="{ record }">
          <a-input-number v-model="record.order" :min="1" :max="99" style="width: 80px;" />
        </template>
        <template #action="{ record, rowIndex }">
          <a-button type="text" size="mini" @click="editItem('basicItems', rowIndex)">
            <icon-edit /> 编辑
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 备孕特有项配置 -->
    <a-card :bordered="true" size="small" title="备孕特有项配置">
      <template #extra>
        <a-button type="outline" size="mini" @click="resetCategory('pregnancyItems')">
          <icon-refresh /> 恢复默认
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data="model.pregnancyItems || []"
        :pagination="false"
        :bordered="{ cell: true }"
        row-key="id"
      >
        <template #icon="{ record }">
          <a-image :src="record.icon" width="40" height="40" fit="contain" />
        </template>
        <template #enabled="{ record }">
          <a-switch v-model="record.enabled" />
        </template>
        <template #multiple="{ record }">
          <a-tag :color="record.multiple ? 'arcoblue' : 'gray'">
            {{ record.multiple ? '是' : '否' }}
          </a-tag>
        </template>
        <template #needTime="{ record }">
          <a-tag :color="record.needTime ? 'arcoblue' : 'gray'">
            {{ record.needTime ? '是' : '否' }}
          </a-tag>
        </template>
        <template #order="{ record }">
          <a-input-number v-model="record.order" :min="1" :max="99" style="width: 80px;" />
        </template>
        <template #action="{ record, rowIndex }">
          <a-button type="text" size="mini" @click="editItem('pregnancyItems', rowIndex)">
            <icon-edit /> 编辑
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 经期特有项配置 -->
    <a-card :bordered="true" size="small" title="经期特有项配置">
      <template #extra>
        <a-button type="outline" size="mini" @click="resetCategory('periodItems')">
          <icon-refresh /> 恢复默认
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data="model.periodItems || []"
        :pagination="false"
        :bordered="{ cell: true }"
        row-key="id"
      >
        <template #icon="{ record }">
          <a-image :src="record.icon" width="40" height="40" fit="contain" />
        </template>
        <template #enabled="{ record }">
          <a-switch v-model="record.enabled" />
        </template>
        <template #multiple="{ record }">
          <a-tag :color="record.multiple ? 'arcoblue' : 'gray'">
            {{ record.multiple ? '是' : '否' }}
          </a-tag>
        </template>
        <template #needTime="{ record }">
          <a-tag :color="record.needTime ? 'arcoblue' : 'gray'">
            {{ record.needTime ? '是' : '否' }}
          </a-tag>
        </template>
        <template #order="{ record }">
          <a-input-number v-model="record.order" :min="1" :max="99" style="width: 80px;" />
        </template>
        <template #action="{ record, rowIndex }">
          <a-button type="text" size="mini" @click="editItem('periodItems', rowIndex)">
            <icon-edit /> 编辑
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- UI配置 -->
    <a-card :bordered="true" size="small" title="UI配置">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="未来日期提示图片URL">
              <a-input v-model="model.uiConfig.futureDataImage" placeholder="图片URL">
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectFutureImage">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <a-image
                v-if="model.uiConfig.futureDataImage"
                :src="model.uiConfig.futureDataImage"
                width="200"
                height="200"
                style="margin-top: 8px;"
                fit="contain"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="未来日期提示文本">
              <a-input v-model="model.uiConfig.futureDataText" placeholder="如: 未来日子以后再来记录吧" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 编辑模态框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑记录项"
      width="700px"
      @ok="saveEditItem"
      @cancel="cancelEdit"
    >
      <a-form :model="editingItem" layout="vertical" v-if="editingItem">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目标识" required>
              <a-input v-model="editingItem.id" placeholder="如: symptom" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示标签" required>
              <a-input v-model="editingItem.label" placeholder="如: 症状" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="图标URL" required>
          <a-input v-model="editingItem.icon" placeholder="图标地址" readonly>
            <template #suffix>
              <a-button type="text" size="mini" @click="selectItemIcon">
                <icon-folder /> 选择
              </a-button>
            </template>
          </a-input>
          <a-image
            v-if="editingItem.icon"
            :src="editingItem.icon"
            width="60"
            height="60"
            style="margin-top: 8px;"
            fit="contain"
          />
        </a-form-item>

        <a-form-item label="数据字段Key" required>
          <a-textarea
            v-model="editingItem.dataKey"
            placeholder="多个字段用逗号分隔，如: bodySymptom,headSymptom"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="是否启用">
              <a-switch v-model="editingItem.enabled" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="是否多选">
              <a-switch v-model="editingItem.multiple" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="需要记录时间">
              <a-switch v-model="editingItem.needTime" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序顺序">
              <a-input-number v-model="editingItem.order" :min="1" :max="99" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属分类">
              <a-input v-model="editingItem.category" disabled />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

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
  key: 'basicRecordItems',
  title: '基础数据项配置',
  path: ['basicRecordItems'],
  defaultValue: {
    basicItems: [
      {
        id: 'symptom',
        label: '症状',
        icon: 'https://qwe-oss.oss-cn-beijing.aliyuncs.com/daily/images/symptom.png',
        enabled: true,
        order: 1,
        dataKey: 'bodySymptom,headSymptom,skinCondition,waistAbdomen,chest,psychologicalSymptom,vaginalSymptom,gastrointestinal,otherSymptom',
        multiple: true,
        needTime: false,
        category: 'basic'
      },
      {
        id: 'dischargeType',
        label: '白带',
        icon: 'https://images.lvtu1120.cn/images/dischargeType.png',
        enabled: true,
        order: 2,
        dataKey: 'dischargeType',
        multiple: false,
        needTime: false,
        category: 'basic'
      },
      {
        id: 'temperature',
        label: '体温',
        icon: 'https://images.lvtu1120.cn/images/temperature.png',
        enabled: true,
        order: 3,
        dataKey: 'temperature',
        multiple: false,
        needTime: false,
        category: 'basic'
      },
      {
        id: 'weight',
        label: '体重',
        icon: 'https://images.lvtu1120.cn/images/weight.png',
        enabled: true,
        order: 4,
        dataKey: 'weight',
        multiple: false,
        needTime: false,
        category: 'basic'
      },
      {
        id: 'intimacy',
        label: '爱爱',
        icon: 'https://images.lvtu1120.cn/images/intimacy.png',
        enabled: true,
        order: 5,
        dataKey: 'intimacy',
        multiple: false,
        needTime: true,
        category: 'basic'
      },
      {
        id: 'mood',
        label: '心情',
        icon: 'https://images.lvtu1120.cn/images/mood.png',
        enabled: true,
        order: 6,
        dataKey: 'mood',
        multiple: true,
        needTime: false,
        category: 'basic'
      },
      {
        id: 'diary',
        label: '日记',
        icon: 'https://images.lvtu1120.cn/images/diary.png',
        enabled: true,
        order: 7,
        dataKey: 'diary',
        multiple: false,
        needTime: false,
        category: 'basic'
      }
    ],
    pregnancyItems: [
      {
        id: 'ovulationTests',
        label: '排卵试纸',
        icon: 'https://images.lvtu1120.cn/images/ovulationTests.png',
        enabled: true,
        order: 1,
        dataKey: 'ovulationTests',
        multiple: false,
        needTime: false,
        category: 'pregnancy'
      },
      {
        id: 'follicleSize',
        label: '卵泡监测',
        icon: 'https://images.lvtu1120.cn/images/follicleSize.png',
        enabled: true,
        order: 2,
        dataKey: 'follicleSize',
        multiple: false,
        needTime: false,
        category: 'pregnancy'
      },
      {
        id: 'nutritionType',
        label: '营养补充',
        icon: 'https://images.lvtu1120.cn/images/nutritionType.png',
        enabled: true,
        order: 3,
        dataKey: 'nutritionType',
        multiple: true,
        needTime: false,
        category: 'pregnancy'
      }
    ],
    periodItems: [
      {
        id: 'flowLevel',
        label: '经量',
        icon: 'https://images.lvtu1120.cn/images/flowLevel.png',
        enabled: true,
        order: 1,
        dataKey: 'flowLevel',
        multiple: false,
        needTime: false,
        category: 'period'
      },
      {
        id: 'periodColor',
        label: '颜色',
        icon: 'https://images.lvtu1120.cn/images/periodColor.png',
        enabled: true,
        order: 2,
        dataKey: 'periodColor',
        multiple: false,
        needTime: false,
        category: 'period'
      },
      {
        id: 'painLevel',
        label: '痛经',
        icon: 'https://images.lvtu1120.cn/images/painLevel.png',
        enabled: true,
        order: 3,
        dataKey: 'painLevel',
        multiple: false,
        needTime: false,
        category: 'period'
      }
    ],
    uiConfig: {
      futureDataImage: 'https://qwe-oss.oss-cn-beijing.aliyuncs.com/daily/images/empty_data1.png',
      futureDataText: '未来日子以后再来记录吧'
    }
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

// 确保数据结构完整
const ensureStructure = () => {
  if (!model.value.basicItems) {
    model.value.basicItems = meta.defaultValue.basicItems
  }
  if (!model.value.pregnancyItems) {
    model.value.pregnancyItems = meta.defaultValue.pregnancyItems
  }
  if (!model.value.periodItems) {
    model.value.periodItems = meta.defaultValue.periodItems
  }
  if (!model.value.uiConfig) {
    model.value.uiConfig = meta.defaultValue.uiConfig
  }
}

ensureStructure()

// 表格列定义
const columns = [
  {
    title: '项目标识',
    dataIndex: 'id',
    width: 120
  },
  {
    title: '显示标签',
    dataIndex: 'label',
    width: 100
  },
  {
    title: '图标',
    slotName: 'icon',
    width: 80
  },
  {
    title: '数据字段Key',
    dataIndex: 'dataKey',
    width: 250,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '是否启用',
    slotName: 'enabled',
    width: 100
  },
  {
    title: '是否多选',
    slotName: 'multiple',
    width: 100
  },
  {
    title: '需要时间',
    slotName: 'needTime',
    width: 100
  },
  {
    title: '排序',
    slotName: 'order',
    width: 100
  },
  {
    title: '操作',
    slotName: 'action',
    width: 80,
    fixed: 'right'
  }
]

const fileSelectorVisible = ref(false)
const fileSelectorTitle = ref('选择图片')
const fileSelectorTarget = ref<'futureImage' | 'itemIcon'>('futureImage')

// 编辑相关状态
const editModalVisible = ref(false)
const editingItem = ref<any>(null)
const editingCategory = ref<string>('')
const editingIndex = ref<number>(-1)

const resetCategory = (category: string) => {
  model.value[category] = deepClone((meta.defaultValue as any)[category])
  Message.success('已恢复默认配置')
}

// 编辑记录项
const editItem = (category: string, index: number) => {
  editingCategory.value = category
  editingIndex.value = index
  editingItem.value = deepClone(model.value[category][index])
  editModalVisible.value = true
}

// 保存编辑
const saveEditItem = () => {
  if (!editingItem.value.label || !editingItem.value.icon || !editingItem.value.dataKey) {
    Message.warning('请填写完整信息')
    return
  }

  model.value[editingCategory.value][editingIndex.value] = deepClone(editingItem.value)
  editModalVisible.value = false
  Message.success('保存成功')
}

// 取消编辑
const cancelEdit = () => {
  editModalVisible.value = false
  editingItem.value = null
  editingCategory.value = ''
  editingIndex.value = -1
}

const selectFutureImage = () => {
  fileSelectorTitle.value = '选择未来日期提示图片'
  fileSelectorTarget.value = 'futureImage'
  fileSelectorVisible.value = true
}

const selectItemIcon = () => {
  fileSelectorTitle.value = '选择记录项图标'
  fileSelectorTarget.value = 'itemIcon'
  fileSelectorVisible.value = true
}

const onFileSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    if (fileSelectorTarget.value === 'futureImage') {
      model.value.uiConfig.futureDataImage = (file as any).url
    } else if (fileSelectorTarget.value === 'itemIcon' && editingItem.value) {
      editingItem.value.icon = (file as any).url
    }
  }
  fileSelectorVisible.value = false
}
</script>

<style scoped>
/* 样式可根据需要添加 */
</style>
