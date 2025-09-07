<template>
  <div class="chat-preview">
    <!-- 头部工具栏 -->
    <div class="chat-header">
      <div class="header-left">
        <h3 class="panel-title">对话测试</h3>
        <a-tag v-if="currentModel" color="arcoblue" size="small">
          {{ currentModel.modelName }}
        </a-tag>
      </div>
      <div class="header-actions">
        <a-button size="small" :disabled="messages.length === 0" @click="clearChat">
          <template #icon><icon-delete /></template>
          清空对话
        </a-button>
        <a-button size="small" :disabled="messages.length === 0" @click="exportChat">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </div>
    </div>

    <!-- 对话区域 -->
    <div ref="chatContainer" class="chat-container">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">
          <icon-robot />
        </div>
        <div class="welcome-text">
          <h4>AI 对话测试</h4>
          <div v-if="configurationStatus.isValid" class="config-status success">
            <icon-check-circle />
            <p>配置完成，可以开始对话测试</p>
          </div>
          <div v-else class="config-status warning">
            <icon-exclamation-triangle />
            <div class="config-issues">
              <p>请完成以下配置：</p>
              <ul>
                <li v-for="issue in configurationStatus.issues" :key="issue">{{ issue }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="message-list">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item" :class="[message.role]"
        >
          <div class="message-avatar">
            <icon-user v-if="message.role === 'user'" />
            <icon-robot v-else />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">
                {{ message.role === 'user' ? '用户' : 'AI助手' }}
              </span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text">
              <div v-if="message.role === 'assistant' && message.streaming" class="streaming-text">
                {{ message.content }}
                <span class="cursor">|</span>
              </div>
              <div v-else class="static-text">
                <pre>{{ message.content }}</pre>
              </div>
            </div>
          </div>
          <div class="message-actions">
            <a-button type="text" size="mini" @click="copyMessage(message.content)">
              <template #icon><icon-copy /></template>
            </a-button>
            <a-button type="text" size="mini" @click="deleteMessage(index)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <!-- 正在思考指示器 -->
        <div v-if="isThinking" class="thinking-indicator">
          <div class="message-item assistant">
            <div class="message-avatar">
              <icon-robot />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">AI助手</span>
                <span class="message-time">正在思考...</span>
              </div>
              <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <!-- 快速操作 -->
      <div class="quick-actions">
        <a-button size="mini" type="text" @click="insertQuickText('请帮我分析')">
          分析
        </a-button>
        <a-button size="mini" type="text" @click="insertQuickText('请帮我总结')">
          总结
        </a-button>
        <a-button size="mini" type="text" @click="insertQuickText('请解释一下')">
          解释
        </a-button>
        <a-button size="mini" type="text" @click="insertQuickText('请给出建议')">
          建议
        </a-button>
      </div>

      <!-- 输入框 -->
      <div class="input-container">
        <a-textarea
          v-model="inputMessage"
          placeholder="输入你的消息... (Ctrl+Enter 发送)"
          :rows="3"
          :max-length="5000"
          show-word-limit
          :disabled="isLoading || !configurationStatus.isValid"
          class="message-input"
          @keydown="handleKeyDown"
        />
        <div class="input-actions">
          <a-button
            size="small"
            :loading="isLoading"
            :disabled="!configurationStatus.isValid"
            type="primary"
            @click="sendMessage"
          >
            <template #icon><icon-send /></template>
            发送
          </a-button>
        </div>
      </div>
    </div>

    <!-- 配置状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">
          <icon-user />
          消息: {{ messages.length }}
        </span>
        <span class="status-item">
          <icon-clock />
          上次响应: {{ lastResponseTime || '--' }}ms
        </span>
      </div>
      <div class="status-right">
        <span v-if="currentPrompt" class="status-item">
          <icon-tag />
          {{ currentPrompt.name }}
        </span>
        <span v-if="modelConfig" class="status-item">
          <icon-settings />
          T: {{ modelConfig.temperature }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import type { PromptResourceResp } from '@/apis/ai/promptResource'
import type { MetaResp } from '@/apis/ai/meta'
import { type ChatMessage as APIChatMessage, type ChatRequest, sendChatMessage } from '@/apis/ai/chat'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  streaming?: boolean
}

interface Props {
  currentModel?: MetaResp | null
  currentPrompt?: PromptResourceResp | null
  modelConfig?: any
  isLoading?: boolean
}

interface Emits {
  (e: 'send', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const isThinking = ref(false)
const lastResponseTime = ref<number | null>(null)
const chatContainer = ref<HTMLElement>()

// 配置状态检查
const configurationStatus = computed(() => {
  const issues = []

  if (!props.currentModel) {
    issues.push('未选择模型')
  }

  if (!props.modelConfig) {
    issues.push('未配置模型参数')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
})

// 辅助函数
// 清空对话
const clearChat = () => {
  messages.value = []
  lastResponseTime.value = null
  Message.success('对话已清空')
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 真实AI响应
const getRealAIResponse = async (userMessage: string): Promise<void> => {
  if (!props.currentModel?.id) {
    throw new Error('未选择模型')
  }

  // 准备聊天历史（最近10条消息）
  const chatHistory: APIChatMessage[] = []

  // 如果有提示词，添加系统消息
  if (props.currentPrompt?.promptText) {
    chatHistory.push({
      role: 'system',
      content: props.currentPrompt.promptText,
    })
  }

  // 添加历史消息（取最后10条对话）
  const recentMessages = messages.value.slice(-10).map((msg) => ({
    role: msg.role,
    content: msg.content,
  } as APIChatMessage))

  chatHistory.push(...recentMessages)

  // 添加当前用户消息
  chatHistory.push({
    role: 'user',
    content: userMessage,
  })

  // 准备请求数据
  const chatRequest: ChatRequest = {
    messages: chatHistory,
    modelId: props.currentModel.id,
    promptId: props.currentPrompt?.id,
    config: {
      temperature: props.modelConfig?.temperature || 0.7,
      maxTokens: props.modelConfig?.maxTokens || 2000,
      topP: props.modelConfig?.topP || 1,
      frequencyPenalty: props.modelConfig?.frequencyPenalty || 0,
      presencePenalty: props.modelConfig?.presencePenalty || 0,
    },
  }

  try {
    // 发送请求
    const response = await sendChatMessage(chatRequest)

    // 创建并添加AI响应消息
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.data.message.content,
      timestamp: Date.now(),
    }

    messages.value.push(assistantMessage)

    // 返回响应时间用于显示
    return response.data.responseTime
  } catch (error) {
    console.error('AI response error:', error)
    // 添加错误消息
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: '抱歉，在处理您的请求时遇到了问题。请检查模型配置或稍后再试。',
      timestamp: Date.now(),
    }
    messages.value.push(errorMessage)
    throw error
  }
}

// 监听模型或提示词变化，重置对话
watch([() => props.currentModel, () => props.currentPrompt], () => {
  if (messages.value.length > 0) {
    clearChat()
  }
})

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) {
    Message.warning('请输入消息内容')
    return
  }

  if (!configurationStatus.value.isValid) {
    Message.warning(`配置不完整: ${configurationStatus.value.issues.join(', ')}`)
    return
  }

  const userMessage: ChatMessage = {
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: Date.now(),
  }

  messages.value.push(userMessage)
  const messageToSend = inputMessage.value.trim()
  inputMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 开始生成响应
  isLoading.value = true
  isThinking.value = true

  try {
    const startTime = Date.now()

    // 使用真实AI API
    const responseTime = await getRealAIResponse(messageToSend)
    lastResponseTime.value = responseTime || (Date.now() - startTime)
  } catch (error) {
    console.error('Failed to get AI response:', error)

    // API错误已经在getRealAIResponse中添加了错误消息，这里只需要显示用户提示
    let errorMsg = 'AI回复失败'
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.message) {
      errorMsg = error.message
    }

    Message.error(errorMsg)
  } finally {
    isLoading.value = false
    isThinking.value = false
    await nextTick()
    scrollToBottom()
  }

  emit('send', messageToSend)
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
  }
}

// 插入快速文本
const insertQuickText = (text: string) => {
  if (inputMessage.value && !inputMessage.value.endsWith(' ')) {
    inputMessage.value += ' '
  }
  inputMessage.value += text

  // 聚焦到输入框
  const textarea = document.querySelector('.message-input textarea') as HTMLTextAreaElement
  if (textarea) {
    textarea.focus()
    textarea.setSelectionRange(inputMessage.value.length, inputMessage.value.length)
  }
}

// 导出对话
const exportChat = () => {
  if (messages.value.length === 0) return

  const chatData = {
    model: props.currentModel?.modelName || 'Unknown',
    prompt: props.currentPrompt?.name || 'None',
    config: props.modelConfig || {},
    messages: messages.value,
    exportTime: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(chatData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `chat-export-${Date.now()}.json`
  a.click()

  URL.revokeObjectURL(url)
  Message.success('对话已导出')
}

// 复制消息
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    Message.success('已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy:', error)
    Message.error('复制失败')
  }
}

// 删除消息
const deleteMessage = (index: number) => {
  messages.value.splice(index, 1)
  Message.success('消息已删除')
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
}

defineExpose({
  messages,
  sendMessage,
  clearChat,
  exportChat,
})
</script>

<style scoped lang="scss">
.chat-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);

  .chat-header {
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

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 0;

    .welcome-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-3);

      .welcome-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .welcome-text {
        text-align: center;

        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: var(--color-text-2);
        }

        p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .config-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;

          &.success {
            background: var(--color-success-light-1);
            border: 1px solid var(--color-success-light-3);
            color: var(--color-success-dark-1);

            .arco-icon {
              color: var(--color-success);
            }
          }

          &.warning {
            background: var(--color-warning-light-1);
            border: 1px solid var(--color-warning-light-3);
            color: var(--color-warning-dark-1);

            .arco-icon {
              color: var(--color-warning);
              margin-top: 2px;
              align-self: flex-start;
            }
          }

          .config-issues {
            ul {
              margin: 4px 0 0 0;
              padding-left: 16px;

              li {
                margin: 2px 0;
              }
            }
          }
        }
      }
    }

    .message-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-item {
      display: flex;
      gap: 12px;

      &.user {
        flex-direction: row-reverse;

        .message-content {
          background: var(--color-primary-light-1);
          border: 1px solid var(--color-primary-light-3);
        }
      }

      &.assistant {
        .message-content {
          background: var(--color-bg-2);
          border: 1px solid var(--color-border-2);
        }
      }

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
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

        .arco-icon {
          font-size: 16px;
          color: var(--color-text-3);
        }
      }

      .message-content {
        flex: 1;
        padding: 12px 16px;
        border-radius: 12px;
        min-width: 0;

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .message-role {
            font-size: 12px;
            font-weight: 500;
            color: var(--color-text-2);
          }

          .message-time {
            font-size: 11px;
            color: var(--color-text-3);
          }
        }

        .message-text {
          .streaming-text {
            .cursor {
              animation: blink 1s infinite;
            }
          }

          .static-text {
            pre {
              margin: 0;
              font-family: inherit;
              white-space: pre-wrap;
              word-break: break-word;
              line-height: 1.5;
            }
          }
        }
      }

      .message-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .message-actions {
        opacity: 1;
      }
    }

    .thinking-indicator {
      .thinking-dots {
        display: flex;
        gap: 4px;
        align-items: center;

        span {
          width: 6px;
          height: 6px;
          background: var(--color-text-3);
          border-radius: 50%;
          animation: thinking 1.4s infinite;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }

  .chat-input-area {
    flex-shrink: 0;
    padding: 16px;
    border-top: 1px solid var(--color-border-2);

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;

      .message-input {
        flex: 1;

        :deep(.arco-textarea) {
          resize: none;
        }
      }

      .input-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: var(--color-fill-2);
    border-top: 1px solid var(--color-border-2);
    font-size: 12px;
    color: var(--color-text-3);
    flex-shrink: 0;

    .status-left, .status-right {
      display: flex;
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .arco-icon {
        font-size: 12px;
      }
    }
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes thinking {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
