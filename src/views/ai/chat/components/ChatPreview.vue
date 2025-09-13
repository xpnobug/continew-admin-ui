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
    <div ref="chatContainer" class="chat-container" @scroll="handleScroll">
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
      <!-- 聊天模式选择 -->
      <div class="chat-mode-selector">
        <a-switch
          v-model="enableStreamChat"
          size="small"
          :disabled="isLoading || isStreaming"
        >
          <template #checked-icon><icon-thunderbolt /></template>
          <template #unchecked-icon><icon-loading /></template>
        </a-switch>
        <span class="mode-label">
          {{ enableStreamChat ? '流式对话' : '普通对话' }}
        </span>
      </div>
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
          :disabled="(isLoading || isStreaming) || !configurationStatus.isValid"
          class="message-input"
          @keydown="handleKeyDown"
        />
        <div class="input-actions">
          <a-button
            v-if="isStreaming"
            size="small"
            status="danger"
            @click="cancelStream"
          >
            <template #icon><icon-stop /></template>
            停止
          </a-button>
          <a-button
            v-else
            size="small"
            :loading="isLoading"
            :disabled="isLoading || !configurationStatus.isValid"
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
        <span v-if="isStreaming" class="status-item streaming">
          <icon-loading class="spinning" />
          流式传输中...
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
import { onBeforeUnmount } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { PromptResourceResp } from '@/apis/ai/promptResource'
import type { MetaResp } from '@/apis/ai/meta'
import { type ChatMessage as APIChatMessage, type ChatRequest, type StreamChatResponse, createStreamChatController, sendChatMessage, sendStreamChatMessage } from '@/apis/ai/chat'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  streaming?: boolean
  completed?: boolean
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
const isStreaming = ref(false)
const lastResponseTime = ref<number | null>(null)
const chatContainer = ref<HTMLElement>()
const enableStreamChat = ref(true) // 启用流式聊天
const streamController = ref<ReturnType<typeof createStreamChatController> | null>(null)

// 打字机效果相关状态
const typewriterBuffer = ref('')
const typewriterTimer = ref<number | null>(null)
const typewriterSpeed = ref(50) // 打字速度，毫秒每字符

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

// 滚动相关状态和功能
const isUserScrolling = ref(false)
const scrollTimeout = ref<number | null>(null)

// 检查是否应该自动滚动
const shouldAutoScroll = () => {
  if (!chatContainer.value || isUserScrolling.value) {
    return false
  }

  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  const threshold = 100 // 距离底部100px内认为在底部
  return scrollHeight - scrollTop - clientHeight <= threshold
}

// 平滑滚动到底部
const scrollToBottom = (force = false) => {
  if (!chatContainer.value) return

  if (force || shouldAutoScroll()) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// 监听用户滚动
const handleScroll = () => {
  isUserScrolling.value = true

  if (scrollTimeout.value) {
    window.clearTimeout(scrollTimeout.value)
  }

  scrollTimeout.value = window.setTimeout(() => {
    isUserScrolling.value = false
  }, 1000) // 1秒后认为用户停止滚动
}

// 打字机效果函数
const stopTypewriter = () => {
  if (typewriterTimer.value) {
    window.clearInterval(typewriterTimer.value)
    typewriterTimer.value = null
  }
}

const addToTypewriterBuffer = (content: string) => {
  typewriterBuffer.value += content
}

const startTypewriter = (targetMessage: ChatMessage) => {
  if (typewriterTimer.value) {
    window.clearInterval(typewriterTimer.value)
  }

  typewriterTimer.value = window.setInterval(() => {
    if (typewriterBuffer.value.length > 0) {
      // 逐字符添加到消息内容中
      const char = typewriterBuffer.value.charAt(0)
      targetMessage.content += char
      typewriterBuffer.value = typewriterBuffer.value.slice(1)

      // 平滑滚动到底部
      nextTick(() => scrollToBottom())
    } else if (!isStreaming.value) {
      // 如果缓冲区为空且不再流式传输，停止打字机
      stopTypewriter()
    }
  }, typewriterSpeed.value)
}

// 构建聊天请求
const buildChatRequest = (userMessage: string): ChatRequest => {
  const chatHistory: APIChatMessage[] = []

  // 如果有提示词，添加系统消息
  if (props.currentPrompt?.promptText) {
    chatHistory.push({
      role: 'system',
      content: props.currentPrompt.promptText,
    })
  }

  // 添加历史消息（取最后10条对话）
  const recentMessages = messages.value
    .filter((msg) => !msg.streaming) // 过滤掉正在流式传输的消息
    .slice(-10)
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    } as APIChatMessage))

  chatHistory.push(...recentMessages)

  // 添加当前用户消息
  chatHistory.push({
    role: 'user',
    content: userMessage,
  })

  return {
    messages: chatHistory,
    modelId: props.currentModel!.id,
    promptId: props.currentPrompt?.id,
    config: {
      temperature: props.modelConfig?.temperature || 0.7,
      maxTokens: props.modelConfig?.maxTokens || 2000,
      topP: props.modelConfig?.topP || 1,
      frequencyPenalty: props.modelConfig?.frequencyPenalty || 0,
      presencePenalty: props.modelConfig?.presencePenalty || 0,
    },
  }
}

// 真实AI响应（普通模式）
const getRealAIResponse = async (userMessage: string): Promise<number | undefined> => {
  const chatRequest = buildChatRequest(userMessage)

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

// 流式聊天处理
const handleStreamChat = async (userMessage: string) => {
  if (!props.currentModel?.id) {
    Message.error('未选择模型')
    return
  }

  isStreaming.value = true
  isThinking.value = false

  const startTime = Date.now()

  // 创建AI响应消息
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    streaming: true,
    completed: false,
  }

  messages.value.push(assistantMessage)
  await nextTick()
  scrollToBottom(true) // 强制滚动

  // 清空打字机缓冲区并启动打字机效果
  typewriterBuffer.value = ''
  startTypewriter(assistantMessage)

  try {
    // 准备聊天请求
    const chatRequest = buildChatRequest(userMessage)

    // 创建流式控制器
    streamController.value = createStreamChatController()

    // 发送流式聊天请求
    await sendStreamChatMessage(chatRequest, {
      // 处理每个流式响应块
      onMessage: (chunk: StreamChatResponse) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('📨 收到流式消息块:', chunk)
        }

        if (chunk.content) {
          // 将内容添加到打字机缓冲区，而不是直接添加到消息
          addToTypewriterBuffer(chunk.content)
        }
      },
      // 处理错误
      onError: (error: Error) => {
        console.error('❌ Stream chat error:', error)
        // 停止打字机效果
        stopTypewriter()
        // 将剩余缓冲区内容立即添加到消息
        if (typewriterBuffer.value) {
          assistantMessage.content += typewriterBuffer.value
          typewriterBuffer.value = ''
        }
        assistantMessage.streaming = false
        assistantMessage.completed = true
        assistantMessage.content += '\n\n[流式响应中断]'
        Message.error(`流式对话失败: ${error.message}`)
      },
      // 完成回调
      onComplete: () => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('✅ 流式聊天完成')
        }
        assistantMessage.streaming = false
        assistantMessage.completed = true
        lastResponseTime.value = Date.now() - startTime

        // 等待打字机完成显示所有内容
        const finishTypewriter = () => {
          if (typewriterBuffer.value.length > 0) {
            // 如果还有未显示的内容，稍后再检查
            window.setTimeout(finishTypewriter, 100)
          } else {
            // 所有内容已显示完毕，停止打字机
            stopTypewriter()
          }
        }
        finishTypewriter()
      },
      // 取消信号
      signal: streamController.value.signal,
    })
  } catch (error) {
    console.error('Failed to start stream chat:', error)
    // 停止打字机效果
    stopTypewriter()
    // 将剩余缓冲区内容立即添加到消息
    if (typewriterBuffer.value) {
      assistantMessage.content += typewriterBuffer.value
      typewriterBuffer.value = ''
    }
    assistantMessage.streaming = false
    assistantMessage.completed = true
    assistantMessage.content = '抱歉，流式对话启动失败。请检查网络连接或稍后重试。'
    Message.error('流式对话启动失败')
  } finally {
    isStreaming.value = false
    streamController.value = null
    await nextTick()
    scrollToBottom(true) // 完成时强制滚动
  }
}

// 取消流式聊天
const cancelStream = () => {
  if (streamController.value) {
    streamController.value.cancel()
    // 停止打字机效果
    stopTypewriter()
    // 将剩余缓冲区内容立即添加到当前正在流式传输的消息
    if (typewriterBuffer.value && messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.role === 'assistant' && lastMessage.streaming) {
        lastMessage.content += typewriterBuffer.value
        lastMessage.streaming = false
        lastMessage.completed = true
        typewriterBuffer.value = ''
      }
    }
    Message.info('已停止流式对话')
  }
}

// 普通聊天处理
const handleNormalChat = async (userMessage: string) => {
  isLoading.value = true
  isThinking.value = true

  try {
    const startTime = Date.now()
    const responseTime = await getRealAIResponse(userMessage)
    lastResponseTime.value = responseTime || (Date.now() - startTime)
  } catch (error: any) {
    console.error('Failed to get AI response:', error)

    let errorMsg = 'AI回复失败'
    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error?.message) {
      errorMsg = error.message
    }

    Message.error(errorMsg)
  } finally {
    isLoading.value = false
    isThinking.value = false
    await nextTick()
    scrollToBottom(true) // 完成时强制滚动
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

  // 强制滚动到底部
  await nextTick()
  scrollToBottom(true)

  // 根据模式选择聊天方式
  if (enableStreamChat.value) {
    await handleStreamChat(messageToSend)
  } else {
    await handleNormalChat(messageToSend)
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

// 组件卸载清理
onBeforeUnmount(() => {
  // 停止打字机效果，防止内存泄漏
  stopTypewriter()
  // 取消流式聊天
  if (streamController.value) {
    streamController.value.cancel()
  }
  // 清理滚动相关定时器
  if (scrollTimeout.value) {
    window.clearTimeout(scrollTimeout.value)
  }
})

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
  position: relative;
  background: var(--color-bg-1);
  display: flex;
  flex-direction: column;

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
    position: absolute;
    top: 61px; // 头部高度
    bottom: 200px; // 输入区域高度 (大约150px + 状态栏50px)
    left: 0;
    right: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;

    @media (max-width: 768px) {
      bottom: 180px; // 移动端输入区域稍小
    }

    @media (max-width: 480px) {
      bottom: 160px; // 小屏幕进一步压缩
    }

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--color-fill-2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-fill-4);
      border-radius: 3px;

      &:hover {
        background: var(--color-fill-3);
      }
    }

    .welcome-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 16px;
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
      padding: 16px 16px 20px 16px; // 只需要很小的底部间距
      min-height: calc(100% - 32px); // 减去内边距

      @media (max-width: 768px) {
        padding: 12px 12px 16px 12px;
        gap: 12px;
      }

      @media (max-width: 480px) {
        padding: 10px 10px 12px 10px;
        gap: 10px;
      }
    }

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
      animation: fadeInUp 0.3s ease-out;

      &.user {
        flex-direction: row-reverse;

        .message-content {
          background: var(--color-primary-light-1);
          border: 1px solid var(--color-primary-light-3);
          margin-left: 20%;

          @media (max-width: 768px) {
            margin-left: 10%;
          }
        }
      }

      &.assistant {
        .message-content {
          background: var(--color-bg-2);
          border: 1px solid var(--color-border-2);
          margin-right: 20%;

          @media (max-width: 768px) {
            margin-right: 10%;
          }
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
      animation: fadeInUp 0.3s ease-out;

      .thinking-dots {
        display: flex;
        gap: 4px;
        align-items: center;

        span {
          width: 8px;
          height: 8px;
          background: var(--color-primary-6);
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
    position: absolute;
    bottom: 50px; // 状态栏高度
    left: 0;
    right: 0;
    padding: 16px;
    border-top: 1px solid var(--color-border-2);
    background: var(--color-bg-1);
    z-index: 10;

    @media (max-width: 768px) {
      padding: 12px;
      bottom: 40px; // 移动端状态栏稍小
    }

    @media (max-width: 480px) {
      bottom: 30px; // 小屏幕进一步压缩
    }

    .chat-mode-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: var(--color-fill-1);
      border-radius: 6px;
      border: 1px solid var(--color-border-2);

      @media (max-width: 480px) {
        padding: 6px 10px;
      }

      .mode-label {
        font-size: 12px;
        color: var(--color-text-2);
        font-weight: 500;
      }
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      @media (max-width: 480px) {
        gap: 6px;
        margin-bottom: 10px;

        .arco-btn {
          font-size: 12px;
          padding: 2px 6px;
        }
      }
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;

      @media (max-width: 480px) {
        gap: 8px;
        flex-direction: column;
        align-items: stretch;
      }

      .message-input {
        flex: 1;

        :deep(.arco-textarea) {
          resize: none;
          min-height: 80px;

          @media (max-width: 480px) {
            min-height: 60px;
          }
        }
      }

      .input-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;

        @media (max-width: 480px) {
          flex-direction: row;
          justify-content: flex-end;
        }
      }
    }
  }

  .status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--color-fill-2);
    border-top: 1px solid var(--color-border-2);
    font-size: 12px;
    color: var(--color-text-3);
    z-index: 10;

    @media (max-width: 768px) {
      padding: 6px 12px;
      font-size: 11px;
      height: 40px;
    }

    @media (max-width: 480px) {
      height: 30px;
      padding: 4px 8px;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .status-left, .status-right {
      display: flex;
      gap: 16px;

      @media (max-width: 768px) {
        gap: 12px;
      }

      @media (max-width: 480px) {
        gap: 8px;
        flex-wrap: wrap;
      }
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;

      .arco-icon {
        font-size: 12px;
      }

      &.streaming {
        color: var(--color-primary-6);
        font-weight: 500;

        .spinning {
          animation: spin 1s linear infinite;
        }
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
