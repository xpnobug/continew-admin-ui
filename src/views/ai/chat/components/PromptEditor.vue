<template>
  <div class="prompt-editor">
    <!-- 头部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <h3 class="panel-title">提示词编辑器</h3>
        <a-tag v-if="currentPrompt" color="blue" size="small">
          {{ currentPrompt.name }}
        </a-tag>
      </div>
      <div class="header-actions">
        <a-button size="small" @click="showPromptLibrary">
          <template #icon><icon-database /></template>
          提示词库
        </a-button>
        <a-dropdown @select="handleMenuSelect">
          <a-button size="small">
            <template #icon><icon-more /></template>
          </a-button>
          <template #content>
            <a-doption value="select">
              <template #icon><icon-search /></template>
              选择提示词
            </a-doption>
            <a-doption value="create">
              <template #icon><icon-plus /></template>
              新建提示词
            </a-doption>
            <a-doption value="import">
              <template #icon><icon-import /></template>
              导入提示词
            </a-doption>
            <a-doption value="export" :disabled="!currentPrompt">
              <template #icon><icon-export /></template>
              导出当前提示词
            </a-doption>
          </template>
        </a-dropdown>
        <a-button size="small" :loading="saving" @click="savePrompt">
          <template #icon><icon-save /></template>
          保存
        </a-button>
      </div>
    </div>

    <!-- 提示词内容编辑器 -->
    <div class="prompt-content">
      <div class="content-header">
        <span class="content-title">提示词内容</span>
        <div class="content-actions">
          <a-button size="mini" type="text" @click="insertVariable">
            <template #icon><icon-code /></template>
            插入变量
          </a-button>
          <a-button size="mini" type="text" @click="clearContent">
            <template #icon><icon-delete /></template>
            清空
          </a-button>
        </div>
      </div>

      <a-textarea
        v-model="promptForm.promptText"
        placeholder="在此输入你的提示词内容&#10;&#10;你可以使用变量，如：{user_input}、{context} 等"
        :rows="15"
        class="prompt-textarea"
        show-word-limit
        :max-length="10000"
      />

      <div class="content-stats">
        <span class="char-count">{{ promptForm.promptText?.length || 0 }} 字符</span>
        <span class="word-count">{{ getWordCount(promptForm.promptText || '') }} 词</span>
      </div>
    </div>

    <!-- 变量管理 -->
    <div v-if="variables.length > 0" class="variables-section">
      <div class="section-title">
        <icon-tag />
        检测到的变量
      </div>
      <div class="variables-list">
        <a-tag
          v-for="variable in variables"
          :key="variable"
          size="small"
          class="variable-tag"
          @click="insertVariableToText(variable)"
        >
          {{ variable }}
        </a-tag>
      </div>
    </div>

    <!-- 提示词模板 -->
    <div class="templates-section">
      <div class="section-title">
        <icon-file />
        快速模板
      </div>
      <div class="templates-list">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          @click="useTemplate(template)"
        >
          <div class="template-name">{{ template.name }}</div>
          <div class="template-desc">{{ template.description }}</div>
        </div>
      </div>
    </div>

    <!-- 提示词选择器 -->
    <PromptSelector
      v-model="showPromptSelector"
      :multiple="false"
      @select="onPromptSelect"
    />

    <!-- 提示词库管理弹窗 -->
    <PromptLibrary
      v-model:visible="showPromptLibraryModal"
      :current-prompt="currentPrompt"
      @select="onPromptLibrarySelect"
    />
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import PromptSelector from './PromptSelector.vue'
import PromptLibrary from './PromptLibrary.vue'
import { type PromptResourceResp, addPromptResource, getPromptResource, updatePromptResource } from '@/apis/ai/promptResource'

interface Props {
  modelValue?: PromptResourceResp | null
}

interface Emits {
  (e: 'update:modelValue', value: PromptResourceResp | null): void
  (e: 'change', prompt: PromptResourceResp | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const currentPrompt = ref<PromptResourceResp | null>(props.modelValue)
const showPromptSelector = ref(false)
const showPromptLibraryModal = ref(false)
const saving = ref(false)

// 表单数据
const promptForm = reactive({
  name: '',
  description: '',
  promptText: '',
  spaceId: 1,
  status: 1,
})

// 变量检测
const variables = computed(() => {
  if (!promptForm.promptText) return []
  const matches = promptForm.promptText.match(/\{([^}]+)\}/g) || []
  return [...new Set(matches)]
})

// 模板数据
const templates = ref([
  {
    id: '1',
    name: '角色扮演',
    description: '为AI设定特定角色和背景',
    content: '你是一个专业的{role}，具有丰富的{field}经验。请根据用户的问题，以{role}的身份提供专业的建议和解答。\n\n用户问题：{user_input}',
  },
  {
    id: '2',
    name: '分析总结',
    description: '对内容进行分析和总结',
    content: '请对以下内容进行详细分析，并提供简洁明了的总结：\n\n{content}\n\n请从以下几个方面进行分析：\n1. 主要观点\n2. 关键信息\n3. 结论建议',
  },
  {
    id: '3',
    name: '创意写作',
    description: '创意内容生成模板',
    content: '请根据以下要求创作{type}：\n\n主题：{topic}\n风格：{style}\n长度：{length}\n目标受众：{audience}\n\n要求：\n- 内容原创且富有创意\n- 语言生动有趣\n- 符合主题要求',
  },
])

// 初始化表单数据
const initPromptForm = (prompt: PromptResourceResp) => {
  promptForm.name = prompt.name
  promptForm.description = prompt.description || ''
  promptForm.promptText = prompt.promptText || ''
  promptForm.spaceId = prompt.spaceId
  promptForm.status = prompt.status
}

// 重置表单数据
const resetPromptForm = () => {
  promptForm.name = ''
  promptForm.description = ''
  promptForm.promptText = ''
  promptForm.spaceId = 1
  promptForm.status = 1
}

// 监听父组件传入的提示词变化
watch(() => props.modelValue, (newPrompt) => {
  currentPrompt.value = newPrompt
  if (newPrompt) {
    initPromptForm(newPrompt)
  } else {
    resetPromptForm()
  }
}, { immediate: true })

// 获取字数统计
const getWordCount = (text: string) => {
  if (!text) return 0
  return text.replace(/\s+/g, '').length
}

// 打开提示词选择器
const openPromptSelector = () => {
  showPromptSelector.value = true
}

// 显示提示词库
const showPromptLibrary = () => {
  showPromptLibraryModal.value = true
}

// 创建新提示词
const createNewPrompt = () => {
  currentPrompt.value = null
  resetPromptForm()
  emit('update:modelValue', null)
  emit('change', null)
  Message.info('已切换到新提示词编辑模式')
}

// 导入提示词
const importPrompt = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.name && data.promptText) {
          promptForm.name = data.name
          promptForm.description = data.description || ''
          promptForm.promptText = data.promptText
          Message.success('提示词导入成功')
        } else {
          Message.error('文件格式不正确')
        }
      } catch (error) {
        console.error('Import failed:', error)
        Message.error('导入失败')
      }
    }
  }
  input.click()
}

// 导出当前提示词
const exportCurrentPrompt = () => {
  if (!currentPrompt.value) return

  const data = {
    name: promptForm.name,
    description: promptForm.description,
    promptText: promptForm.promptText,
    exportTime: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-${promptForm.name}-${Date.now()}.json`
  a.click()

  URL.revokeObjectURL(url)
  Message.success('提示词已导出')
}

// 处理菜单选择
const handleMenuSelect = (value: string) => {
  switch (value) {
    case 'select':
      openPromptSelector()
      break
    case 'create':
      createNewPrompt()
      break
    case 'import':
      importPrompt()
      break
    case 'export':
      exportCurrentPrompt()
      break
  }
}

// 提示词选择回调
const onPromptSelect = async (prompts: PromptResourceResp[]) => {
  if (prompts.length === 0) return

  const selectedPrompt = prompts[0]
  try {
    const { data } = await getPromptResource(selectedPrompt.id)
    const fullPrompt = { ...selectedPrompt, ...data }
    currentPrompt.value = fullPrompt
    initPromptForm(fullPrompt)
    emit('update:modelValue', fullPrompt)
    emit('change', fullPrompt)
    Message.success('提示词加载成功')
  } catch (error) {
    console.error('Failed to load prompt:', error)
    Message.error('提示词加载失败')
  }
}

// 提示词库选择回调
const onPromptLibrarySelect = async (prompt: PromptResourceResp | null) => {
  if (!prompt) {
    // 创建新提示词
    createNewPrompt()
    return
  }

  try {
    const { data } = await getPromptResource(prompt.id)
    const fullPrompt = { ...prompt, ...data }
    currentPrompt.value = fullPrompt
    initPromptForm(fullPrompt)
    emit('update:modelValue', fullPrompt)
    emit('change', fullPrompt)
    Message.success('提示词加载成功')
  } catch (error) {
    console.error('Failed to load prompt:', error)
    Message.error('提示词加载失败')
  }
}

// 保存提示词
const savePrompt = async () => {
  if (!promptForm.name || !promptForm.promptText) {
    Message.warning('请填写提示词名称和内容')
    return
  }

  saving.value = true
  try {
    if (currentPrompt.value?.id) {
      // 更新现有提示词
      await updatePromptResource({
        name: promptForm.name,
        description: promptForm.description,
        promptText: promptForm.promptText,
        spaceId: promptForm.spaceId,
        status: promptForm.status,
      }, currentPrompt.value.id)
      Message.success('提示词更新成功')
    } else {
      // 创建新提示词
      const { data } = await addPromptResource({
        name: promptForm.name,
        description: promptForm.description,
        promptText: promptForm.promptText,
        spaceId: promptForm.spaceId,
        status: promptForm.status,
      })
      const newPrompt = { ...promptForm, id: data.id } as PromptResourceResp
      currentPrompt.value = newPrompt
      emit('update:modelValue', newPrompt)
      emit('change', newPrompt)
      Message.success('提示词创建成功')
    }
  } catch (error) {
    console.error('Failed to save prompt:', error)
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 插入变量
const insertVariable = () => {
  const textarea = document.querySelector('.prompt-textarea textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = `${promptForm.promptText.substring(0, start)}{variable}${promptForm.promptText.substring(end)}`
    promptForm.promptText = newText

    // 重新设置光标位置
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1, start + 9) // 选中 "variable"
    })
  }
}

// 插入指定变量到文本
const insertVariableToText = (variable: string) => {
  const textarea = document.querySelector('.prompt-textarea textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = promptForm.promptText.substring(0, start) + variable + promptForm.promptText.substring(end)
    promptForm.promptText = newText

    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    })
  }
}

// 清空内容
const clearContent = () => {
  promptForm.promptText = ''
}

// 使用模板
const useTemplate = (template: any) => {
  promptForm.promptText = template.content
  if (!promptForm.name) {
    promptForm.name = template.name
  }
  if (!promptForm.description) {
    promptForm.description = template.description
  }
}

defineExpose({
  currentPrompt,
  promptForm,
  savePrompt,
  resetPromptForm,
})
</script>

<style scoped lang="scss">
.prompt-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);

  .editor-header {
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

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .prompt-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    min-height: 0;

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .content-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
      }

      .content-actions {
        display: flex;
        gap: 4px;
      }
    }

    .prompt-textarea {
      flex: 1;
      :deep(.arco-textarea) {
        height: 100%;
        resize: none;
      }
      :deep(textarea) {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .content-stats {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .variables-section, .templates-section {
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
  }

  .variables-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .variable-tag {
      cursor: pointer;
      &:hover {
        background: var(--color-primary-light-1);
        border-color: var(--color-primary-light-3);
      }
    }
  }

  .templates-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .template-item {
      padding: 8px 12px;
      border: 1px solid var(--color-border-2);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--color-primary-light-3);
        background: var(--color-primary-light-1);
      }

      .template-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 2px;
      }

      .template-desc {
        font-size: 12px;
        color: var(--color-text-3);
        line-height: 1.4;
      }
    }
  }

}
</style>
