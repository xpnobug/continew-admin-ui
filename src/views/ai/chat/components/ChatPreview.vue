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
          <h4>开始对话测试</h4>
          <p>选择模型和提示词，然后在下方输入消息开始测试</p>
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
          :disabled="isLoading"
          class="message-input"
          @keydown="handleKeyDown"
        />
        <div class="input-actions">
          <a-button size="small" :loading="isLoading" type="primary" @click="sendMessage">
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

// 获取模拟响应内容
const getSimulatedResponse = (_userMessage: string): string => {
  const responses = [
    '这是一个很好的问题。基于您提供的信息，我认为可以从以下几个角度来分析：\n\n1. 首先，我们需要了解问题的核心\n2. 然后考虑可能的解决方案\n3. 最后评估每种方案的优缺点\n\n您希望我详细展开某个方面吗？',
    '感谢您的提问。这个话题确实值得深入讨论。\n\n根据我的理解，主要有以下几点需要注意：\n\n• 考虑整体的上下文环境\n• 分析潜在的影响因素\n• 制定合适的应对策略\n\n如果您需要更具体的建议，请告诉我更多细节。',
    '您提出了一个很有意思的观点。让我来帮您分析一下：\n\n从技术角度来看，这种方法有其优势，比如效率高、成本低。但同时也存在一些挑战，需要谨慎考虑。\n\n您希望我重点分析哪个方面呢？',
    '理解您的需求。这种情况下，我建议采用分步骤的方法：\n\n第一步：明确目标和预期结果\n第二步：评估现有资源和限制\n第三步：制定详细的执行计划\n第四步：实施并监控进度\n\n您觉得这个框架如何？需要我详细解释某个步骤吗？',
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// 模拟AI响应 (实际项目中应该替换为真实的API调用)
const simulateAIResponse = async (_userMessage: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 创建响应消息
      const responseMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      }

      messages.value.push(responseMessage)

      // 模拟流式响应
      const fullResponse = getSimulatedResponse(_userMessage)
      let currentIndex = 0

      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          responseMessage.content += fullResponse[currentIndex]
          currentIndex++
          scrollToBottom()
        } else {
          responseMessage.streaming = false
          clearInterval(streamInterval)
          resolve(true)
        }
      }, 30)
    }, 1000)
  })
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

  if (!props.currentModel) {
    Message.warning('请先选择模型')
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

    // 模拟AI响应 - 实际项目中应该调用真实的AI API
    await simulateAIResponse(messageToSend)

    lastResponseTime.value = Date.now() - startTime
  } catch (error) {
    console.error('Failed to get AI response:', error)
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: '抱歉，生成回复时出现错误，请稍后再试。',
      timestamp: Date.now(),
    }
    messages.value.push(errorMessage)
    Message.error('获取AI回复失败')
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
