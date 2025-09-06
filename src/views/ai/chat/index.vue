<template>
  <div class="ai-chat-workspace">
    <!-- 工作区工具栏 -->
    <div class="workspace-toolbar">
      <div class="toolbar-left">
        <div class="workspace-title">
          <icon-robot />
          <span>AI 对话工作台</span>
        </div>
        <div class="workspace-status">
          <a-tag v-if="currentPrompt" color="blue" size="small">
            <template #icon><icon-message /></template>
            {{ currentPrompt.name }}
          </a-tag>
          <a-tag v-if="currentModel" color="green" size="small">
            <template #icon><icon-settings /></template>
            {{ currentModel.name }}
          </a-tag>
          <a-tag v-if="!validateWorkspace().isValid" color="orange" size="small">
            <template #icon><icon-exclamation /></template>
            配置不完整
          </a-tag>
        </div>
      </div>

      <div class="toolbar-right">
        <a-button-group size="small">
          <a-button @click="importWorkspace">
            <template #icon><icon-import /></template>
            导入配置
          </a-button>
          <a-button :disabled="!currentPrompt && !currentModel" @click="exportWorkspace">
            <template #icon><icon-export /></template>
            导出配置
          </a-button>
          <a-button @click="resetWorkspace">
            <template #icon><icon-refresh /></template>
            重置工作区
          </a-button>
        </a-button-group>
      </div>
    </div>

    <div class="workspace-content">
      <!-- 左侧提示词编辑面板 -->
      <div class="left-panel">
        <PromptEditor
          v-model="currentPrompt"
          @change="handlePromptChange"
        />
      </div>

      <!-- 中间模型配置编排面板 -->
      <div class="center-panel">
        <ModelOrchestrator
          v-model="currentModel"
          @change="handleModelChange"
          @config-change="handleConfigChange"
        />
      </div>

      <!-- 右侧对话预览测试面板 -->
      <div class="right-panel">
        <ChatPreview
          :current-model="currentModel"
          :current-prompt="currentPrompt"
          :model-config="modelConfig"
          :is-loading="workspaceState.isLoading"
          @send="handleMessageSend"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import PromptEditor from './components/PromptEditor.vue'
import ModelOrchestrator from './components/ModelOrchestrator.vue'
import ChatPreview from './components/ChatPreview.vue'
import type { PromptResourceResp } from '@/apis/ai/promptResource'
import type { MetaResp } from '@/apis/ai/meta'

defineOptions({ name: 'AIChatWorkspace' })

// 本地存储键名
const STORAGE_KEYS = {
  CURRENT_PROMPT: 'ai-chat-current-prompt',
  CURRENT_MODEL: 'ai-chat-current-model',
  MODEL_CONFIG: 'ai-chat-model-config',
  WORKSPACE_LAYOUT: 'ai-chat-workspace-layout',
}

// 响应式数据
const currentPrompt = ref<PromptResourceResp | null>(null)
const currentModel = ref<MetaResp | null>(null)
const modelConfig = ref<any>({
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
})

// 工作区状态
const workspaceState = reactive({
  leftPanelCollapsed: false,
  centerPanelCollapsed: false,
  activeTab: 'prompt', // prompt | model | preview
  isLoading: false,
})

// 从本地存储恢复状态
const restoreFromStorage = () => {
  try {
    // 恢复当前提示词
    const savedPrompt = localStorage.getItem(STORAGE_KEYS.CURRENT_PROMPT)
    if (savedPrompt) {
      currentPrompt.value = JSON.parse(savedPrompt)
    }

    // 恢复当前模型
    const savedModel = localStorage.getItem(STORAGE_KEYS.CURRENT_MODEL)
    if (savedModel) {
      currentModel.value = JSON.parse(savedModel)
    }

    // 恢复模型配置
    const savedConfig = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG)
    if (savedConfig) {
      Object.assign(modelConfig.value, JSON.parse(savedConfig))
    }

    // 恢复工作区布局
    const savedLayout = localStorage.getItem(STORAGE_KEYS.WORKSPACE_LAYOUT)
    if (savedLayout) {
      Object.assign(workspaceState, JSON.parse(savedLayout))
    }
  } catch (error) {
    console.warn('Failed to restore workspace state:', error)
  }
}

// 保存状态到本地存储
const saveToStorage = () => {
  try {
    if (currentPrompt.value) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROMPT, JSON.stringify(currentPrompt.value))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROMPT)
    }

    if (currentModel.value) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODEL, JSON.stringify(currentModel.value))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MODEL)
    }

    localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(modelConfig.value))
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_LAYOUT, JSON.stringify(workspaceState))
  } catch (error) {
    console.warn('Failed to save workspace state:', error)
  }
}

// 处理提示词变化
const handlePromptChange = (prompt: PromptResourceResp | null) => {
  currentPrompt.value = prompt
  saveToStorage()

  if (prompt) {
    Message.success(`已加载提示词: ${prompt.name}`)
  } else {
    Message.info('已清空当前提示词')
  }
}

// 处理模型变化
const handleModelChange = (model: MetaResp | null) => {
  currentModel.value = model
  saveToStorage()

  if (model) {
    Message.success(`已选择模型: ${model.name}`)
  } else {
    Message.info('已清空当前模型')
  }
}

// 处理配置变化
const handleConfigChange = (config: any) => {
  Object.assign(modelConfig.value, config)
  saveToStorage()
}

// 验证工作区状态
const validateWorkspace = () => {
  const issues = []

  if (!currentPrompt.value) {
    issues.push('请选择或创建一个提示词')
  }

  if (!currentModel.value) {
    issues.push('请选择一个AI模型')
  }

  if (currentPrompt.value?.promptText && currentPrompt.value.promptText.trim().length === 0) {
    issues.push('提示词内容不能为空')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// 处理消息发送
const handleMessageSend = (_message: string) => {
  const validation = validateWorkspace()

  if (!validation.isValid) {
    Message.warning(`工作区配置不完整：${validation.issues.join('，')}`)
    return
  }

  workspaceState.isLoading = true

  try {
    // 这里可以添加实际的API调用逻辑
    // 发送消息配置日志已记录

    // 模拟API调用
    setTimeout(() => {
      workspaceState.isLoading = false
      Message.success('消息发送成功')
    }, 1000)
  } catch (error) {
    workspaceState.isLoading = false
    console.error('Failed to send message:', error)
    Message.error('消息发送失败')
  }
}

// 重置工作区
const resetWorkspace = () => {
  currentPrompt.value = null
  currentModel.value = null
  modelConfig.value = {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }

  // 清除本地存储
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })

  Message.success('工作区已重置')
}

// 导出工作区配置
const exportWorkspace = () => {
  const workspaceData = {
    prompt: currentPrompt.value,
    model: currentModel.value,
    config: modelConfig.value,
    exportTime: new Date().toISOString(),
    version: '1.0',
  }

  const dataStr = JSON.stringify(workspaceData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `ai-workspace-${Date.now()}.json`
  a.click()

  URL.revokeObjectURL(url)
  Message.success('工作区配置已导出')
}

// 导入工作区配置
const importWorkspace = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.prompt) currentPrompt.value = data.prompt
        if (data.model) currentModel.value = data.model
        if (data.config) Object.assign(modelConfig.value, data.config)

        saveToStorage()
        Message.success('工作区配置导入成功')
      } catch (error) {
        console.error('Import failed:', error)
        Message.error('导入失败，文件格式不正确')
      }
    }
  }
  input.click()
}

// 组件挂载时恢复状态
onMounted(() => {
  restoreFromStorage()
})

// 页面卸载时保存状态
onBeforeUnmount(() => {
  saveToStorage()
})

// 导出工作区控制方法
defineExpose({
  resetWorkspace,
  exportWorkspace,
  importWorkspace,
  validateWorkspace,
  workspaceState,
})
</script>

<style scoped lang="scss">
.ai-chat-workspace {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-fill-1);

  .workspace-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .workspace-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-1);
      }

      .workspace-status {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .workspace-content {
    flex: 1;
    display: flex;
    min-height: 0;
    height: 0;

    .left-panel {
      width: 420px;
      border-right: 1px solid var(--color-border-2);
      flex-shrink: 0;
      height: 100%;
      overflow: hidden;
    }

    .center-panel {
      width: 460px;
      border-right: 1px solid var(--color-border-2);
      flex-shrink: 0;
      height: 100%;
      overflow: hidden;
    }

    .right-panel {
      flex: 1;
      min-width: 400px;
      height: 100%;
      overflow: hidden;
    }
  }
}

@media (max-width: 1400px) {
  .ai-chat-workspace {
    .workspace-content {
      .left-panel {
        width: 380px;
      }

      .center-panel {
        width: 420px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .ai-chat-workspace {
    .workspace-content {
      .left-panel {
        width: 340px;
      }

      .center-panel {
        width: 380px;
      }
    }
  }
}

// 超大屏幕优化
@media (min-width: 1800px) {
  .ai-chat-workspace {
    .workspace-content {
      .left-panel {
        width: 480px;
      }

      .center-panel {
        width: 520px;
      }
    }
  }
}

@media (max-width: 1000px) {
  .ai-chat-workspace {
    .workspace-content {
      .left-panel {
        width: 300px;
      }

      .center-panel {
        width: 340px;
      }

      .right-panel {
        min-width: 320px;
      }
    }
  }
}

@media (max-width: 768px) {
  .ai-chat-workspace {
    flex-direction: column;
    height: auto;
    min-height: 100vh;

    .workspace-content {
      flex-direction: column;

      .left-panel,
      .center-panel {
        width: 100%;
        height: 320px;
        border-right: none;
        border-bottom: 1px solid var(--color-border-2);
      }

      .right-panel {
        height: calc(100vh - 680px);
        min-height: 400px;
      }
    }
  }
}
</style>
