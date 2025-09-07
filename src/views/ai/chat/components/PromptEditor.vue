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
        <!--        <a-button size="small" :loading="saving" @click="savePrompt">
          <template #icon><icon-save /></template>
          保存
        </a-button> -->
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
import PromptLibrary from './PromptLibrary.vue'
import { type PromptResourceResp, getPromptResource, updatePromptResource } from '@/apis/ai/promptResource'

interface Props {
  modelValue?: PromptResourceResp | null
}

interface Emits {
  (e: 'update:modelValue', value: PromptResourceResp | null): void
  (e: 'change', prompt: PromptResourceResp | null): void
  (e: 'save-status-change', status: 'idle' | 'pending' | 'saving' | 'saved' | 'error', saveTime?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const currentPrompt = ref<PromptResourceResp | null>(props.modelValue)
const showPromptLibraryModal = ref(false)
const saving = ref(false)

// 自动保存相关
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)
const hasUnsavedChanges = ref(false)
const lastSaveTime = ref<string>('')

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

// 发送保存状态变化事件
const emitSaveStatus = (status: 'idle' | 'pending' | 'saving' | 'saved' | 'error', saveTime?: string) => {
  emit('save-status-change', status, saveTime)
}

// 自动保存函数
const autoSave = async () => {
  if (!currentPrompt.value?.id || !hasUnsavedChanges.value) {
    return
  }

  // 清除定时器
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = null
  }

  // 设置保存状态
  saving.value = true
  emitSaveStatus('saving')

  try {
    await updatePromptResource({
      name: currentPrompt.value.name,
      description: currentPrompt.value.description || promptForm.description,
      promptText: promptForm.promptText,
      spaceId: currentPrompt.value.spaceId,
      status: currentPrompt.value.status,
    }, currentPrompt.value.id)

    // 更新本地状态
    const updatedPrompt = {
      ...currentPrompt.value,
      promptText: promptForm.promptText,
      description: promptForm.description,
    }
    currentPrompt.value = updatedPrompt
    emit('update:modelValue', updatedPrompt)
    emit('change', updatedPrompt)

    // 保存成功
    hasUnsavedChanges.value = false
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    lastSaveTime.value = now
    emitSaveStatus('saved', now)

    // 2秒后切换到idle状态
    setTimeout(() => {
      emitSaveStatus('idle', now)
    }, 2000)
  } catch (error) {
    console.error('Auto save failed:', error)
    emitSaveStatus('error')

    // 3秒后切换到pending状态重试
    setTimeout(() => {
      if (hasUnsavedChanges.value) {
        emitSaveStatus('pending')
      }
    }, 3000)
  } finally {
    saving.value = false
  }
}

// 触发自动保存（防抖）
const triggerAutoSave = () => {
  if (!currentPrompt.value?.id) {
    return
  }

  hasUnsavedChanges.value = true
  emitSaveStatus('pending')

  // 清除之前的定时器
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }

  // 设置新的定时器，2秒后执行自动保存
  autoSaveTimer.value = setTimeout(() => {
    autoSave()
  }, 2000)
}

// 监听父组件传入的提示词变化
watch(() => props.modelValue, (newPrompt) => {
  currentPrompt.value = newPrompt
  if (newPrompt) {
    initPromptForm(newPrompt)
  } else {
    resetPromptForm()
  }
  // 重置自动保存状态
  hasUnsavedChanges.value = false
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = null
  }
  if (newPrompt) {
    emitSaveStatus('idle')
  }
}, { immediate: true })

// 监听提示词内容变化，触发自动保存
watch(() => promptForm.promptText, (newText, oldText) => {
  // 只有在用户编辑时才触发自动保存（避免初始化时触发）
  if (oldText !== undefined && newText !== oldText && currentPrompt.value?.id) {
    triggerAutoSave()
  }
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

// 获取字数统计
const getWordCount = (text: string) => {
  if (!text) return 0
  return text.replace(/\s+/g, '').length
}

// 显示提示词库
const showPromptLibrary = () => {
  showPromptLibraryModal.value = true
}

// 提示词库选择回调
const onPromptLibrarySelect = async (prompt: PromptResourceResp | null) => {
  if (!prompt) {
    // 创建新提示词
    currentPrompt.value = null
    resetPromptForm()
    emit('update:modelValue', null)
    emit('change', null)
    Message.info('已切换到新提示词编辑模式')
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

// 手动保存提示词
const savePrompt = async () => {
  if (!promptForm.promptText) {
    Message.warning('请填写提示词内容')
    return
  }

  if (!currentPrompt.value?.id) {
    Message.warning('请先从提示词库中选择或创建一个提示词')
    return
  }

  // 清除自动保存定时器
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = null
  }

  saving.value = true
  emitSaveStatus('saving')

  try {
    // 更新现有提示词的内容
    await updatePromptResource({
      name: currentPrompt.value.name,
      description: currentPrompt.value.description || promptForm.description,
      promptText: promptForm.promptText,
      spaceId: currentPrompt.value.spaceId,
      status: currentPrompt.value.status,
    }, currentPrompt.value.id)

    // 更新本地状态
    const updatedPrompt = {
      ...currentPrompt.value,
      promptText: promptForm.promptText,
      description: promptForm.description,
    }
    currentPrompt.value = updatedPrompt
    emit('update:modelValue', updatedPrompt)
    emit('change', updatedPrompt)

    // 保存成功
    hasUnsavedChanges.value = false
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    lastSaveTime.value = now
    emitSaveStatus('saved', now)
    Message.success('提示词内容已保存')

    // 2秒后切换到idle状态
    setTimeout(() => {
      emitSaveStatus('idle', now)
    }, 2000)
  } catch (error) {
    console.error('Failed to save prompt:', error)
    emitSaveStatus('error')
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
